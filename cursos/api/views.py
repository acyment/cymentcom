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

env = environ.Env()
logger = logging.getLogger(__name__)

SUCCESSFUL_RESPONSE = 201
FIVE_MINUTES_IN_MS = 300000


class TipoCursoList(generics.ListAPIView):
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]
    queryset = TipoCurso.objects.all()
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

            monto = curso.costo_usd if pago_en_dolares else curso.costo_ars

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
        preference_data = {
            "items": [
                {
                    "title": "Certified ScrumMaster",
                    "quantity": 1,
                    "unit_price": 855.0,
                    "currency_id": "USD",  # or other currency according to your needs
                },
            ],
            "back_urls": {
                "success": f"{settings.WEBHOOKS_DOMAIN}/finished-payment",
                "pending": f"{settings.WEBHOOKS_DOMAIN}/finished-payment",
                "failure": f"{settings.WEBHOOKS_DOMAIN}/finished-payment",
            },
            "notification_url": f"{settings.WEBHOOKS_DOMAIN}/api/webhook-mp/",
        }
        sdk = mercadopago.SDK(env("MP_ACCESS_TOKEN"))
        preference_response = sdk.preference().create(preference_data)
        # Check if the preference was created successfully
        if preference_response["status"] == SUCCESSFUL_RESPONSE:
            preference_info = preference_response["response"]
            # Return the preference ID and the init_point (URL to make the payment)
            return Response(
                {
                    "message": "Preference created successfully.",
                    "preference_id": preference_info["id"],
                    "init_point": preference_info["init_point"],
                },
                status=201,
            )
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
            stripe.api_key = env("STRIPE_API_KEY")
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        # Provide the exact Price ID (for example, pr_1234) of the prod.
                        "price": env("CSM_PRICE_STRIPE_ID"),
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url=f"{settings.REDIRECT_DOMAIN}?status=approved",
                cancel_url=f"{settings.REDIRECT_DOMAIN}?status=canceled",
            )
        except Exception as e:  # noqa: BLE001
            # TODO: Manejar excepciones de Stripe https://docs.stripe.com/api/errors/handling
            print(f"Excepcion Stripe:{str(e)}")
            return str(e)

        return Response({"checkout_url": checkout_session.url})


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
            print("Excepcion Stripe:" + str(e))
            return str(e)

        return Response({"client_secret": payment_intent.client_secret})


class ProcessMPPayment(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, response_format=None):
        sdk = mercadopago.SDK(env("MP_ACCESS_TOKEN"))
        request_options = mercadopago.config.RequestOptions()
        request_options.custom_headers = {"x-idempotency-key": str(uuid.uuid4().int)}
        payment_data = {
            "transaction_amount": float(request.data["transaction_amount"]),
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
        return Response(payment)


class MPPaymentConfirmationView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, response_format=None):
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

        # Verificar el timestamp para evitar ataques de repetición
        current_ts = int(time.time() * 1000)
        received_ts = int(ts)
        # Asumiendo una tolerancia de 5 minutos (300 segundos)
        if abs(current_ts - received_ts) > FIVE_MINUTES_IN_MS:
            return HttpResponse("Timestamp validation failed", status=403)

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
        if event.type == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            id_factura = payment_intent["metadata"]["id_factura"]
            try:
                factura = Factura.objects.get(id=id_factura)
                factura.pagada = True
                factura.save()

            except ObjectDoesNotExist:
                mensaje_error = f"No se encontró la factura con ID: {id_factura}"
                logger.error(mensaje_error)
                return HttpResponse(mensaje_error, status=404)
        else:
            print(f"Unhandled event type {event.type}")  # noqa: T201

        return HttpResponse(status=200)
