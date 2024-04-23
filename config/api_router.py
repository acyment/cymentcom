from django.conf import settings
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from cursos.api.views import CreateMpPreferenceView
from cursos.api.views import CreateStripeCheckoutSessionView
from cursos.api.views import CreateStripePaymentIntent
from cursos.api.views import InscribirParticipanteEnCurso
from cursos.api.views import MPPaymentConfirmationView
from cursos.api.views import ProcessMPPayment
from cursos.api.views import StripePaymentConfirmationView
from cursos.api.views import TipoCursoList
from cyment_com.users.api.views import UserViewSet

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
    path(
        "create-stripe-payment-intent/",
        CreateStripePaymentIntent.as_view(),
        name="create-stripe-payment-intent",
    ),
    path(
        "process-mp-payment/",
        ProcessMPPayment.as_view(),
        name="process-mp-payment",
    ),
    path(
        "cursos/<int:curso_id>/inscripciones/",
        InscribirParticipanteEnCurso.as_view(),
        name="inscribir_participante",
    ),
    path(
        "tipos-de-curso/",
        TipoCursoList.as_view(),
        name="tipo_curso_list",
    ),
]
