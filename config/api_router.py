from django.conf import settings
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from cyment_com.users.api.views import UserViewSet
from pagos.api.views import CreateMpPreferenceView
from pagos.api.views import CreateStripeCheckoutSessionView
from pagos.api.views import MPPaymentConfirmationView
from pagos.api.views import StripePaymentConfirmationView

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)

app_name = "api"
urlpatterns = router.urls

urlpatterns += [
    path(
        "create-mp-preference/",
        CreateMpPreferenceView.as_view(),
        name="create-mp-preference",
    ),
    path(
        "create-stripe-checkoutsession/",
        CreateStripeCheckoutSessionView.as_view(),
        name="create-stripe-checkoutsession",
    ),
    path(
        "mp-payment-confirmation/",
        MPPaymentConfirmationView.as_view(),
        name="mp-payment-confirmation",
    ),
    path(
        "stripe-payment-confirmation/",
        StripePaymentConfirmationView.as_view(),
        name="stripe-payment-confirmation",
    ),
]
