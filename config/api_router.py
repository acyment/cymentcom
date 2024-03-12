from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter
from django.urls import path

from cyment_com.users.api.views import UserViewSet
from cyment_com.pagos.api.views import CreateMpPreferenceView

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
]
