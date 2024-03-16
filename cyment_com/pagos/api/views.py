from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect
import mercadopago
import stripe
import hashlib
import hmac
from django.http import HttpResponse
import time
import environ

env = environ.Env()


YOUR_DOMAIN = env("LOCAL_HOST_TUNNEL")


class CreateMpPreferenceView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        preference_data = {
            "items": [
                {
                    "title": "Certified ScrumMaster",
                    "quantity": 1,
                    "unit_price": 855.0,
                    "currency_id": "USD",  # or other currency according to your needs
                }
            ],
            "back_urls": {
                "success": YOUR_DOMAIN + "/finished-payment",
                "pending": YOUR_DOMAIN + "/finished-payment",
                "failure": YOUR_DOMAIN + "/finished-payment",
            },
            "notification_url": YOUR_DOMAIN + "/api/webhook-mp/",
            # Additional settings can be added here (e.g., payment methods, external references)
        }
        sdk = mercadopago.SDK(env("MP_ACCESS_TOKEN"))
        preference_response = sdk.preference().create(preference_data)
        # Check if the preference was created successfully
        if preference_response["status"] == 201:
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
        else:
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

    def post(self, request, format=None):
        try:
            stripe.api_key = env("STRIPE_API_KEY")
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                        "price": "price_1NBdhjAXZPf5d77ewsFM3qQ5",
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url=YOUR_DOMAIN + "?status=approved",
                cancel_url=YOUR_DOMAIN + "?status=canceled",
            )
        except Exception as e:
            return str(e)

        return redirect(checkout_session.url, code=303)


class MPPaymentConfirmationView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        # La clave secreta de Mercado Pago
        mpWebhookSecret = env("MP_WEBHOOK_SECRET")

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
        signedTemplate = (
            "id:"
            + request.data["data"]["id"]
            + ";request-id:"
            + request.headers.get("x-request-id")
            + ";ts:"
            + ts
            + ";"
        )

        # Calcular la contraclave
        cyphedSignature = hmac.new(
            mpWebhookSecret.encode(), signedTemplate.encode(), hashlib.sha256
        ).hexdigest()

        # Comparar la clave generada con la clave extraída del header
        if cyphedSignature != v1:
            return HttpResponse("Invalid signature", status=403)

        # Verificar el timestamp para evitar ataques de repetición
        current_ts = int(time.time() * 1000)
        received_ts = int(ts)
        # Asumiendo una tolerancia de 5 minutos (300 segundos)
        if abs(current_ts - received_ts) > 300000:
            return HttpResponse("Timestamp validation failed", status=403)
        print("MP!: ", cyphedSignature, v1, current_ts, received_ts)

        return HttpResponse("Notificación recibida y validada", status=200)


class StripePaymentConfirmationView(APIView):
    # Disable authentication
    authentication_classes = []
    # Disable permission checks
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        payload = request.body
        sig_header = request.headers["stripe-signature"]
        event = None

        try:
            stripe.api_key = env("STRIPE_API_KEY")
            stripeWebhookSecret = env("STRIPE_WEBHOOK_SECRET")
            event = stripe.Webhook.construct_event(
                payload, sig_header, stripeWebhookSecret
            )
        except ValueError as e:
            # Invalid payload
            print("Error parsing payload: {}".format(str(e)))
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            print("Error verifying webhook signature: {}".format(str(e)))
            return HttpResponse(status=400)

        # Handle the event
        if event.type == "payment_intent.succeeded":
            # payment_intent = event.data.object  # contains a stripe.PaymentIntent
            print("PaymentIntent was successful!")
            # Then define and call a method to handle the successful payment intent.
            # handle_payment_intent_succeeded(payment_intent)
        # ... handle other event types
        else:
            print("Unhandled event type {}".format(event.type))

        return HttpResponse(status=200)
