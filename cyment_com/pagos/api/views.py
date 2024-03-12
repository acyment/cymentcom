from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
import mercadopago

sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)


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
            "payer": {"email": "test_user_123456@testuser.com"},
            # Additional settings can be added here (e.g., payment methods, external references)
        }
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
