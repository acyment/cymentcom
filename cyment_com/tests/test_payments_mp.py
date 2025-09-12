import datetime
from unittest.mock import Mock
from unittest.mock import patch

import pytest
from djmoney.money import Money
from rest_framework import status
from rest_framework.test import APIClient

from cursos.models import Curso
from cursos.models import Factura
from cursos.models import TipoCurso


@pytest.mark.django_db
class TestMercadoPagoPreference:
    def _make_factura(self):
        tipo = TipoCurso.objects.create(
            nombre_corto="PY",
            nombre_completo="Python",
            resumen_una_linea="r",
            resumen="r",
            contenido="c",
            contenido_corto="cc",
            video="",
            foto="",
            foto_tint="",
            orden=1,
            costo_ars=Money(100000, "ARS"),
            costo_sin_descuento_ars=Money(120000, "ARS"),
            url_logo="",
        )
        curso = Curso.objects.create(
            tipo=tipo,
            fecha=datetime.datetime.now(datetime.UTC).date(),
        )
        return Factura.objects.create(
            monto=Money(855, "USD"),
            nombre="John Doe",
            pais="AR",
            email="john@example.com",
            curso=curso,
            tipo_identificacion_fiscal="CUIT",
            identificacion_fiscal="20-12345678-9",
        )

    @patch("cursos.api.views.mercadopago.SDK")
    def test_success_redirects_and_sends_expected_payload(
        self,
        mock_sdk,
        settings,
        monkeypatch,
    ):
        settings.REDIRECT_DOMAIN = "http://testserver/"
        settings.WEBHOOKS_DOMAIN = "http://testserver/"
        monkeypatch.setenv("MP_ACCESS_TOKEN", "test_token")

        pref_api = Mock()
        pref_api.create.return_value = {
            "status": 201,
            "response": {"init_point": "https://mp/init"},
        }
        mock_sdk.return_value.preference.return_value = pref_api

        client = APIClient()
        factura = self._make_factura()

        resp = client.post(
            "/api/create-mp-preference/",
            {"id_factura": factura.id},
            format="json",
        )

        assert resp.status_code in (
            status.HTTP_301_MOVED_PERMANENTLY,
            status.HTTP_302_FOUND,
        )
        assert resp.url == "https://mp/init"

        assert pref_api.create.called
        (payload,), _ = pref_api.create.call_args

        expected_unit_price = float(factura.curso.tipo.costo_ars.amount) * 1.21
        assert payload["items"] == [
            {
                "title": factura.curso.tipo.nombre_completo,
                "quantity": 1,
                "unit_price": expected_unit_price,
                "currency_id": "ARS",
                "id": factura.curso.tipo.id,
                "picture_url": factura.curso.tipo.url_logo,
                "category_id": "learnings",
            },
        ]

        assert payload["back_urls"]["success"].endswith(
            "api/payments/mp-callback/?status=approved",
        )
        assert payload["back_urls"]["pending"].endswith(
            "api/payments/mp-callback/?status=pending",
        )
        assert payload["back_urls"]["failure"].endswith(
            "api/payments/mp-callback/?status=failed",
        )
        assert payload["notification_url"].endswith(
            "api/payments/mercado-pago/webhook/",
        )

        assert payload["payer"]["name"] == "John"
        assert payload["payer"]["surname"] == "Doe"
        assert payload["payer"]["email"] == factura.email
        assert payload["external_reference"] == str(factura.id)
        assert payload["auto_return"] == "approved"

    @patch("cursos.api.views.mercadopago.SDK")
    def test_failure_returns_400_with_message(self, mock_sdk, settings, monkeypatch):
        settings.REDIRECT_DOMAIN = "http://testserver/"
        settings.WEBHOOKS_DOMAIN = "http://testserver/"
        monkeypatch.setenv("MP_ACCESS_TOKEN", "test_token")

        pref_api = Mock()
        pref_api.create.return_value = {
            "status": 400,
            "response": {"error": "bad request"},
        }
        mock_sdk.return_value.preference.return_value = pref_api

        client = APIClient()
        factura = self._make_factura()

        resp = client.post(
            "/api/create-mp-preference/",
            {"id_factura": factura.id},
            format="json",
        )

        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        body = resp.json()
        assert body["message"] == "Failed to create preference."
        assert "error" in body

    def test_missing_id_factura_currently_errors(self, settings):
        settings.REDIRECT_DOMAIN = "http://testserver/"
        settings.WEBHOOKS_DOMAIN = "http://testserver/"
        client = APIClient()

        # Current behavior: view directly queries Factura without guarding None
        # and DRF propagates the DoesNotExist exception during request handling.
        from cursos.models import Factura as FacturaModel

        with pytest.raises(FacturaModel.DoesNotExist):
            client.post("/api/create-mp-preference/", {}, format="json")
