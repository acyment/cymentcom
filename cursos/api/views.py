# ruff: noqa
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.template import Context
import environ
import json
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
logger = logging.getLogger(__name__)

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
                return JsonResponse({"error": f"Curso{id_curso} not found"}, status=404)

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
                identificacion_fiscal=data.get("identificacionFiscal"),
                direccion=data.get("direccion"),
                telefono=data.get("telefono"),
                curso=curso,
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
            logger.exception("Error al crear inscripción")
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
        precio_curso = float(tipo_curso.costo_ars.amount)
        preference_data = {
            "items": [
                {
                    "title": descripcion_curso,
                    "quantity": 1,
                    "unit_price": precio_curso,
                    "currency_id": "ARS",  # or other currency according to your needs
                },
            ],
            "back_urls": {
                "success": f"{settings.REDIRECT_DOMAIN}/api/payments/mp-callback/?status=approved",
                "pending": f"{settings.REDIRECT_DOMAIN}/api/payments/mp-callback/?status=pending",
                "failure": f"{settings.REDIRECT_DOMAIN}/api/payments/mp-callback/?status=failed",
            },
            "notification_url": f"{settings.WEBHOOKS_DOMAIN}/api/webhook-mp/",
        }
        sdk = mercadopago.SDK(env("MP_ACCESS_TOKEN"))
        preference_response = sdk.preference().create(preference_data)
        # Check if the preference was created successfully
        if preference_response["status"] == SUCCESSFUL_RESPONSE:
            preference_info = preference_response["response"]
            factura.id_pago = preference_info["id"]
            factura.save()
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
        try:
            factura = Factura.objects.get(id=request.data.get("id_factura"))
            tipo_curso = factura.curso.tipo
            stripe_price_id = tipo_curso.stripe_price_id
            stripe.api_key = env("STRIPE_API_KEY")
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        "price": stripe_price_id,
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url=f"{settings.REDIRECT_DOMAIN}?status=approved",
                cancel_url=f"{settings.REDIRECT_DOMAIN}?status=canceled",
                allow_promotion_codes=True,
            )
            factura.id_pago = checkout_session.id
            factura.save()
            return redirect(checkout_session.url)
        except Exception as e:  # noqa: BLE001
            # TODO: Manejar excepciones de Stripe https://docs.stripe.com/api/errors/handling
            print(f"Excepcion Stripe:{str(e)}")
            return str(e)


class CreateStripePaymentIntent(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, response_format=None):
        product_id = request.data.get("product_id")
        amount = request.data.get("amount")

        if not product_id or not amount:
            error_message = "No se encontró 'product_id' o 'amount' en el request body."
            return Response(
                {"error": error_message}, status=status.HTTP_400_BAD_REQUEST
            )

        # Retrieve the product price based on the product_id
        try:
            product_price = 100
        except Exception as e:
            error_message = f"No se encontró un producto con ID {product_id}."
            return Response({"error": error_message}, status=status.HTTP_404_NOT_FOUND)

        # Calculate the total amount
        total_amount = product_price * amount

        try:
            stripe.api_key = env("STRIPE_API_KEY")
            payment_intent = stripe.PaymentIntent.create(
                amount=total_amount,
                currency="usd",
            )
        except Exception as e:  # noqa: BLE001
            # TODO: Manejar excepciones de Stripe https://docs.stripe.com/api/errors/handling
            print(f"Excepcion Stripe:{str(e)}")
            return str(e)

        return Response({"client_secret": payment_intent.client_secret})


class PriceDiscrepancyError(Exception):
    """Raised when the price in the request doesn't match the stored price."""

    def __init__(self, stored_price, requested_price):
        self.stored_price = stored_price
        self.requested_price = requested_price
        self.message = f"Discrepancia de precio detectada: el precio almacenado ({stored_price}) no coincide con el precio solicitado ({requested_price})"
        super().__init__(self.message)


class MPPaymentCallback(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        payment_status = request.query_params.get('status')
        preference_id = request.query_params.get('preference_id')

        if not all([ payment_status, preference_id]):
            return self._build_error_response(
                "Missing required parameters",
                status.HTTP_400_BAD_REQUEST
            )
        try:
            factura = Factura.objects.get(id_pago=preference_id)
            if payment_status == "approved":
                factura.pago_realizado = True
                factura.save()
            return redirect(f"{settings.REDIRECT_DOMAIN}/payment-result",status=payment_status)
        except ObjectDoesNotExist:
            return self._build_error_response(
                "Factura no encontrada",
                status.HTTP_404_NOT_FOUND
            )
        except Exception as e:  # noqa: BLE001
            return self._build_error_response(
                f"Error al procesar el pago: {str(e)}",
                status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ProcessMPPayment(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, response_format=None):
        try:
            factura = Factura.objects.get(id=request.data.get("id_factura"))

            precio_ars_original = factura.curso.tipo.costo_ars.amount
            precio_ars_request = float(request.data["transaction_amount"])

            # Validate prices match (with small tolerance for floating point precision)
            if abs(float(precio_ars_original) - precio_ars_request) > 0.01:
                raise PriceDiscrepancyError(precio_ars_original, precio_ars_request)

            sdk = mercadopago.SDK(env("MP_ACCESS_TOKEN"))
            request_options = mercadopago.config.RequestOptions()
            request_options.custom_headers = {
                "x-idempotency-key": str(uuid.uuid4().int)
            }
            payment_data = {
                "transaction_amount": precio_ars_request,
                "token": request.data["token"],
                "installments": int(request.data["installments"]),
                "payment_method_id": request.data["payment_method_id"],
                "issuer_id": request.data["issuer_id"],
                "payer": {
                    "email": request.data["payer"]["email"],
                    "identification": {
                        "type": request.data["payer"]["identification"]["type"],
                        "number": request.data["payer"]["identification"]["number"],
                    },
                },
                "three_d_secure_mode": "optional",
            }
            payment_response = sdk.payment().create(payment_data, request_options)
            payment = payment_response["response"]
            factura.id_pago = payment["id"]
            factura.save()
        except Exception as e:  # noqa: BLE001
            # TODO: Manejar excepciones de MercadoPago
            print(f"Excepcion Mercado Pago:{str(e)}")
            return Response(
                {
                    "error": "Ha ocurrido un error al procesar el pago. Por favor, intente nuevamente más tarde o contacte a soporte."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(payment)


class MPPaymentConfirmationView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, response_format=None):
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
            factura = Factura.objects.get(id_pago=request.data["data"]["id"])
            factura.pagada = True
            factura.save()

            inscripciones = Inscripcion.objects.filter(factura=factura)
            EmailSender.send_welcome_email(inscripciones)
        except ObjectDoesNotExist:
            mensaje_error = (
                f"No se encontró la factura con ID: {request.data['data']['id']}"
            )
            logger.error(mensaje_error)
            return HttpResponse(mensaje_error, status=404)
        return HttpResponse("Notificación recibida y validada", status=200)


class StripePaymentConfirmationView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, response_format=None):
        payload = request.body
        sig_header = request.headers["stripe-signature"]
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
            id_checkout_session = event["data"]["object"]["id"]
            try:
                factura = Factura.objects.get(id_pago=id_checkout_session)
                factura.pagada = True
                factura.save()

                inscripciones = Inscripcion.objects.filter(factura=factura)
                EmailSender.send_welcome_email(inscripciones)
            except ObjectDoesNotExist:
                mensaje_error = f"No se encontró la factura con ID: {id_factura}"
                logger.error(mensaje_error)
                return HttpResponse(mensaje_error, status=404)
        else:
            print(f"Unhandled event type {event.type}")  # noqa: T201

        # TODO: Manejar el evento checkout.session.expired
        return HttpResponse(status=200)
