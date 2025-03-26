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


class MPPaymentCallback(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        payment_status = request.query_params.get("status")
        preference_id = request.query_params.get("preference_id")

        if not all([payment_status, preference_id]):
            return self._build_error_response(
                "Missing required parameters", status.HTTP_400_BAD_REQUEST
            )
        try:
            factura = Factura.objects.get(id_pago=preference_id)
            if payment_status == "approved":
                factura.pago_realizado = True
                factura.save()
            return redirect(
                f"{settings.REDIRECT_DOMAIN}/payment-result", status=payment_status
            )
        except ObjectDoesNotExist:
            return self._build_error_response(
                "Factura no encontrada", status.HTTP_404_NOT_FOUND
            )
        except Exception as e:  # noqa: BLE001
            return self._build_error_response(
                f"Error al procesar el pago: {str(e)}",
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MPPaymentWebhookView(APIView):
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


class StripePaymentWebhookView(APIView):
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
