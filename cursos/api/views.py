# ruff: noqa
from abc import ABC, abstractmethod
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.template import Context
import environ
import json
import structlog
import logging
from django.conf import settings
from django.http import HttpResponse
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import redirect
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import generics
from ..models import Inscripcion, Alumno, Curso, Factura, EstadoInscripcion, TipoCurso
from .serializers import TipoCursoSerializer
from django.shortcuts import redirect
from urllib.parse import urlencode, quote
from nameparser import HumanName
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# ruff: noqa
import hashlib
import hmac
import time
import uuid
import environ
import mercadopago
import stripe
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import logging
from cursos.emails import EmailSender

env = environ.Env()
# Get the logger (it's automatically configured by the settings)
logger = structlog.get_logger(__name__)  # Using __name__ is standard practice

SUCCESSFUL_RESPONSE = 201
FIVE_MINUTES_IN_SECONDS = 300


class TipoCursoList(generics.ListAPIView):
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]
    queryset = TipoCurso.objects.order_by("orden")
    serializer_class = TipoCursoSerializer


class InscribirParticipanteEnCurso(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, curso_id):
        try:
            try:
                curso = Curso.objects.get(id=curso_id)
            except ObjectDoesNotExist:
                return JsonResponse({"error": f"Curso{curso_id} not found"}, status=404)

            data = json.loads(request.body)
            procesador_pago = data.get("procesador_pago")
            if procesador_pago == "MP":
                pago_en_dolares = False
            elif procesador_pago == "STRIPE":
                pago_en_dolares = True
            else:
                return JsonResponse(
                    {"error": "Invalid procesado_pago value"}, status=400
                )

            nombre = data.get("nombre")
            apellido = data.get("apellido")
            email = data.get("email")
            organizacion = data.get("organizacion")
            rol = data.get("rol")

            alumno = Alumno.objects.create(
                nombre=nombre,
                apellido=apellido,
                email=email,
                organizacion=organizacion,
                rol=rol,
            )

            monto = curso.tipo.costo_usd if pago_en_dolares else curso.tipo.costo_ars

            factura = Factura.objects.create(
                monto=monto,
                nombre=data.get("nombreCompleto"),
                pais=data.get("pais"),
                tipo_identificacion_fiscal=data.get("tipoIdentificacionFiscal"),
                identificacion_fiscal=data.get("identificacionFiscal"),
                tipo_factura=data.get("tipoFactura"),
                direccion=data.get("direccion"),
                curso=curso,
                email=data.get("emailFacturacion"),
            )

            Inscripcion.objects.create(
                alumno=alumno,
                curso=curso,
                monto=monto,
                procesador_pago=procesador_pago,
                estado=EstadoInscripcion.PENDIENTE,
                factura=factura,
            )

            return JsonResponse({"id_factura": factura.id}, status=201)
        except Exception as e:
            logger.exception("Error al crear inscripción", exc_info=e)
            return JsonResponse({"error": "Error al crear inscripción"}, status=500)


class CreateMpPreferenceView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, response_format=None):
        factura = Factura.objects.get(id=request.data.get("id_factura"))
        tipo_curso = factura.curso.tipo
        descripcion_curso = tipo_curso.nombre_completo
        precio_curso = float(tipo_curso.costo_ars.amount) * 1.21  # 21% IVA
        id = tipo_curso.id
        nombre_completo = HumanName(factura.nombre)
        nombre = nombre_completo.first
        apellido = nombre_completo.last

        preference_data = {
            "items": [
                {
                    "title": descripcion_curso,
                    "quantity": 1,
                    "unit_price": precio_curso,
                    "currency_id": "ARS",
                    "id": id,
                    "picture_url": tipo_curso.url_logo,
                    "category_id": "learnings",
                },
            ],
            "back_urls": {
                "success": f"{settings.REDIRECT_DOMAIN}api/payments/mp-callback/?status=approved",
                "pending": f"{settings.REDIRECT_DOMAIN}api/payments/mp-callback/?status=pending",
                "failure": f"{settings.REDIRECT_DOMAIN}api/payments/mp-callback/?status=failed",
            },
            "payer": {
                "name": nombre,
                "surname": apellido,
                "email": factura.email,
                "identification": {
                    "type": factura.tipo_identificacion_fiscal,
                    "number": factura.identificacion_fiscal,
                },
            },
            "notification_url": f"{settings.WEBHOOKS_DOMAIN}api/payments/mercado-pago/webhook/",
            "auto_return": "approved",
            "external_reference": str(factura.id),
            "statement_descriptor": descripcion_curso,
        }
        log = logger.bind(
            preference_data=preference_data,
            tipo_curso=tipo_curso,
            request=request.data,
        )
        log.info("payment_preference_created")
        sdk = mercadopago.SDK(env("MP_ACCESS_TOKEN"))
        preference_response = sdk.preference().create(preference_data)
        # Check if the preference was created successfully
        if preference_response["status"] == SUCCESSFUL_RESPONSE:
            preference_info = preference_response["response"]

            # Return the preference ID and the init_point (URL to make the payment)
            return redirect(preference_info["init_point"])
        # Return an error response
        return Response(
            {
                "message": "Failed to create preference.",
                "error": preference_response.get("response", "Unknown error"),
            },
            status=400,
        )


class CreateStripeCheckoutSessionView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, response_format=None):
        log = logger
        factura_id = request.data.get("id_factura")
        if not factura_id:
            log.warning("missing_factura_id")
            return Response(
                {"error": "Missing 'id_factura' in request data."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            try:
                factura = Factura.objects.get(id=factura_id)
                log = logger.bind(
                    curso_id=factura.curso_id, tipo_curso_id=factura.curso.tipo_id
                )
                log.info("factura_found")
            except Factura.DoesNotExist:
                log.warning("factura_not_found")
                return Response(
                    {"error": f"Invoice with ID {factura_id} not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            tipo_curso = factura.curso.tipo
            stripe_price_id = tipo_curso.stripe_price_id

            if not stripe_price_id:
                log.error("missing_stripe_price_id", tipo_curso_id=tipo_curso.id)
                return Response(
                    {
                        "error": "Configuration error: Stripe Price ID not set for this course type."
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,  # Or 400 if client could influence this
                )

            log = logger.bind(
                stripe_price_id=stripe_price_id, customer_email=factura.email
            )
            log.info("attempting_stripe_checkout_creation")

            stripe.api_key = env("STRIPE_API_KEY")
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        "price": stripe_price_id,
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url=f"{settings.REDIRECT_DOMAIN}/api/payments/stripe-callback/?status=approved&id_factura={factura.id}",
                cancel_url=f"{settings.REDIRECT_DOMAIN}/api/payments/stripe-callback/?status=failed",
                allow_promotion_codes=True,
                client_reference_id=factura.id,
                customer_email=factura.email,
            )

            log.info(
                "stripe_checkout_session_created_successfully",
                checkout_session_id=checkout_session.id,
                checkout_url=checkout_session.url,  # Don't log sensitive parts if any
            )

            return redirect(checkout_session.url)
        except stripe.error.CardError as e:
            # Since it's a decline, Stripe Checkout handles this, but if API call failed:
            log.warning("stripe_card_error", error_message=str(e), stripe_code=e.code)
            return Response(
                {"error": e.user_message or "Card error"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except stripe.error.RateLimitError as e:
            log.warning("stripe_rate_limit_error", error_message=str(e))
            # Potentially retry or queue? For now, return 503
            return Response(
                {"error": "Stripe service busy. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except stripe.error.InvalidRequestError as e:
            # Bad request parameters
            log.warning(
                "stripe_invalid_request_error",
                error_message=str(e),
                stripe_param=e.param,
            )
            return Response(
                {"error": "Invalid request to Stripe."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except stripe.error.AuthenticationError as e:
            # Authentication with Stripe's API failed (check API key)
            log.error("stripe_authentication_error", error_message=str(e))
            return Response(
                {"error": "Stripe authentication error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except stripe.error.APIConnectionError as e:
            # Network communication with Stripe failed
            log.error("stripe_api_connection_error", error_message=str(e))
            return Response(
                {"error": "Could not connect to Stripe. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except stripe.error.StripeError as e:
            # Generic Stripe error
            log.exception(
                "stripe_generic_error", error_message=str(e)
            )  # Use exception for traceback
            return Response(
                {"error": "An error occurred during Stripe processing."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # --- General Exception Handling ---
        except Exception as e:
            # Log the exception with traceback and context
            log.exception(
                "unexpected_error_creating_checkout_session"
            )  # No need to add str(e) here
            # Return a generic error response to the client
            return Response(
                {
                    "error": "An unexpected error occurred while processing your payment request."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BasePaymentCallback(APIView, ABC):
    authentication_classes = []
    permission_classes = [AllowAny]

    @abstractmethod
    def get_external_reference(self, request):
        """Get the invoice ID from the request parameters"""
        pass

    def _build_error_response(
        self, log, message, status_code, error_code=None, **kwargs
    ):
        """Builds and logs a JSON error response."""
        payload = {"error": message}
        if error_code:
            payload["code"] = error_code
        # Log the error with context before returning
        log.error(
            "payment_callback_error",
            error_message=message,
            status_code=status_code,
            error_payload=payload,
            **kwargs,
        )
        return JsonResponse(payload, status=status_code)

    def get(self, request, format=None):
        raw_query_string = request.META.get("QUERY_STRING", "")
        payment_provider = (
            self.__class__.__name__
        )  # e.g., "MPPaymentCallback", "StripePaymentCallback"
        log = logger.bind(
            callback_type=payment_provider,
            http_method=request.method,
            http_path=request.path,
            raw_query_string=raw_query_string,
            remote_addr=request.META.get("REMOTE_ADDR"),
        )
        log.info("payment_callback_received")

        # --- Parameter Extraction ---
        payment_status = request.query_params.get("status")  # Common, but might vary
        external_reference = None

        try:
            id_factura = self.get_external_reference(request)
            log = log.bind(id_factura=id_factura)  # Add to context early if available
            log.debug(
                "extracted_parameters",
                payment_status=payment_status,
                id_factura=id_factura,
            )
        except Exception as e:
            # Catch errors during external reference extraction
            return self._build_error_response(
                log,
                f"Error extracting external reference (id_factura): {str(e)}",
                status.HTTP_400_BAD_REQUEST,
                error_code="PARAM_EXTRACTION_FAILED",
                exc_info=True,  # Add stack trace to log
            )

            # --- Basic Validation ---
        if not payment_status:
            return self._build_error_response(
                log,
                "Missing required parameter: 'status'",
                status.HTTP_400_BAD_REQUEST,
                error_code="MISSING_STATUS",
            )
        if not id_factura:
            return self._build_error_response(
                log,
                "Missing required parameter: id_factura could not be determined.",
                status.HTTP_400_BAD_REQUEST,
                error_code="MISSING_REFERENCE",
            )

        log = log.bind(
            payment_status=payment_status
        )  # Add status now we know it exists
        log.info("processing_payment_callback")
        try:
            try:
                log.debug("fetching_factura", factura_external_ref=id_factura)
                factura = Factura.objects.get(id=id_factura)
                log = log.bind(factura_id=factura.id)
                log.info("factura_found")
            except Factura.DoesNotExist:
                return self._build_error_response(
                    log,
                    f"Factura not found for reference: {id_factura}",
                    status.HTTP_404_NOT_FOUND,  # 404 is often more appropriate for 'not found'
                    error_code="FACTURA_NOT_FOUND",
                )
            except ValueError:  # Handle case where external_reference isn't a valid ID format (e.g., not an int)
                return self._build_error_response(
                    log,
                    f"Invalid format for external reference: {id_factura}",
                    status.HTTP_400_BAD_REQUEST,
                    error_code="INVALID_REFERENCE_FORMAT",
                )
            # --- Fetch Inscripcion ---
            log.debug("fetching_inscripcion", factura_id=factura.id)
            try:
                inscripcion = Inscripcion.objects.get(factura=factura)
                log = log.bind(
                    inscripcion_id=inscripcion.id,
                    curso_id=inscripcion.curso.id,
                    alumno_id=inscripcion.alumno.id,
                )
                log.info("inscripcion_found")
            except Inscripcion.DoesNotExist:
                # This might indicate an data integrity issue (Factura exists but no Inscripcion)
                # Consider if 404 or 500 is more appropriate. 500 suggests an unexpected server state.
                return self._build_error_response(
                    log,
                    f"Inscripcion not found for Factura ID: {factura.id}",
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    error_code="INSCRIPCION_NOT_FOUND",
                    detail="Associated Inscripcion missing for existing Factura.",
                )

            log.debug("preparing_redirect_data")
            params = {
                "status": payment_status,
                "nombre_curso": inscripcion.curso.tipo.nombre_completo,
                "fecha_curso": inscripcion.curso.fecha,
                "nombre_participante": inscripcion.alumno.nombre,
                "apellido_participante": inscripcion.alumno.apellido,
                "email_facturacion": factura.email,
                "email_participante": inscripcion.alumno.email,
                "monto": inscripcion.monto,
            }
            try:
                query_string = urlencode(
                    params, quote_via=quote
                )  # For compatibility when unencoding on the frontend
                redirect_url = (
                    f"{settings.REDIRECT_DOMAIN}/payment-result?{query_string}"
                )
            except Exception as e:
                # Catch potential errors during URL building (e.g., missing settings)
                return self._build_error_response(
                    log,
                    f"Error building redirect URL: {str(e)}",
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    error_code="REDIRECT_BUILD_FAILED",
                    exc_info=True,
                )

            log.info(
                "payment_processed_successfully_redirecting", redirect_url=redirect_url
            )
            return redirect(redirect_url)

            # --- Catch-all for Unexpected Errors ---
        except Exception as e:  # noqa: BLE001 - Keep broad catch here but log details
            # Log the exception with stack trace for debugging
            log.exception("unhandled_error_processing_callback")
            return self._build_error_response(
                log,  # Pass the log instance to ensure context is included
                f"An unexpected error occurred: {str(e)}",
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                error_code="UNEXPECTED_ERROR",
            )


class MPPaymentCallback(BasePaymentCallback):
    def get_external_reference(self, request):
        return request.query_params.get("external_reference")


class StripePaymentCallback(BasePaymentCallback):
    def get_external_reference(self, request):
        return request.query_params.get("id_factura")


class MPPaymentWebhookView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    @method_decorator(csrf_exempt)
    def post(self, request, response_format=None):
        log = logger.bind(request=request)
        log.info("MP_payment_webhook_received")

        # TODO: extraer a clase propia la validación del webhook de MP
        # La clave secreta de Mercado Pago
        mp_webhook_secret = env("MP_WEBHOOK_SECRET")

        # Extraer el header 'x-signature'
        x_signature = request.headers.get("x-signature")
        if not x_signature:
            return HttpResponse("x-signature header missing", status=400)

        # Dividir el contenido del header 'x-signature' para extraer 'ts' y 'v1'
        signature_parts = {
            part.split("=")[0]: part.split("=")[1] for part in x_signature.split(",")
        }
        ts = signature_parts.get("ts")
        v1 = signature_parts.get("v1")

        if not ts or not v1:
            return HttpResponse("Invalid x-signature format", status=400)

        # Construir el string final basado en el template
        signed_template = (
            "id:"
            + request.data["data"]["id"]
            + ";request-id:"
            + request.headers.get("x-request-id")
            + ";ts:"
            + ts
            + ";"
        )

        # Calcular la contraclave
        cyphed_signature = hmac.new(
            mp_webhook_secret.encode(),
            signed_template.encode(),
            hashlib.sha256,
        ).hexdigest()

        # Comparar la clave generada con la clave extraída del header
        if cyphed_signature != v1:
            return HttpResponse("Invalid signature", status=403)

        # TODO: Revisar con Mercado Pago sus timestamps (en las pruebas llegan con fechas rarísimas)
        # Verificar el timestamp para evitar ataques de repetición
        current_ts = int(time.time())
        received_ts = int(ts)
        # Asumiendo una tolerancia de 5 minutos (300 segundos)
        # if abs(current_ts - received_ts) > FIVE_MINUTES_IN_SECONDS:
        #  return HttpResponse("Timestamp validation failed", status=403)

        try:
            sdk = mercadopago.SDK(env("MP_ACCESS_TOKEN"))
            pago = sdk.payment().get(request.data["data"]["id"])

            log = logger.bind(pago=pago)
            log.info("payment_found")

            if pago["response"]["status"] != "approved":
                logger.warning("payment_not_approved")
                return HttpResponse("Payment not approved", status=400)

            factura = Factura.objects.get(id=pago["response"]["external_reference"])
            factura.pagada = True
            factura.save()

            inscripcion = Inscripcion.objects.get(factura=factura)
            EmailSender.send_welcome_email(inscripcion.id)

        except ObjectDoesNotExist:
            mensaje_error = (
                f"No se encontró la factura con ID: {request.data['data']['id']}"
            )
            logger.error(mensaje_error)
            return HttpResponse(mensaje_error, status=404)
        return HttpResponse("Notificación recibida y validada", status=200)


class StripePaymentWebhookView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, response_format=None):
        payload = request.body
        sig_header = request.headers.get("stripe-signature")
        # Check if header exists
        if not sig_header:
            print("Error: Missing Stripe-Signature header.")
            return HttpResponse(status=400)

        event = None

        try:
            stripe.api_key = env("STRIPE_API_KEY")
            stripe_webhook_secret = env("STRIPE_WEBHOOK_SECRET")
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                stripe_webhook_secret,
            )
        except ValueError:
            # Invalid payload
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            # Invalid signature
            return HttpResponse(status=400)

        # Handle the event
        if event.type == "checkout.session.completed":
            id_factura = event["data"]["object"]["client_reference_id"]
            try:
                factura = Factura.objects.get(id=id_factura)
                factura.pagada = True
                factura.save()

                inscripcion = Inscripcion.objects.get(factura=factura)
                EmailSender.send_welcome_email(inscripcion.id)
            except ObjectDoesNotExist:
                mensaje_error = f"No se encontró la factura con ID: {id_factura}"
                logger.error(mensaje_error)
                return HttpResponse(mensaje_error, status=404)
        else:
            print(f"Unhandled event type {event.type}")  # noqa: T201

        # TODO: Manejar el evento checkout.session.expired
        return HttpResponse(status=200)
