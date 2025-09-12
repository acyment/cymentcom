import datetime
import hashlib
import hmac
from decimal import Decimal
from unittest.mock import Mock
from unittest.mock import patch

import pytest
from djmoney.money import Money
from rest_framework import status
from rest_framework.test import APIClient

from cursos.models import Alumno
from cursos.models import Curso
from cursos.models import EstadoInscripcion
from cursos.models import Factura
from cursos.models import Inscripcion
from cursos.models import ProcesadorPago
from cursos.models import TipoCurso


def _build_factura_and_inscripcion():
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
        stripe_price_id="",
        url_logo="",
    )
    curso = Curso.objects.create(
        tipo=tipo,
        fecha=datetime.datetime.now(datetime.UTC).date(),
    )
    alumno = Alumno.objects.create(
        nombre="John",
        apellido="Doe",
        email="john@example.com",
        organizacion="",
        rol="",
    )
    factura = Factura.objects.create(
        monto=Money(Decimal("99.99"), "USD"),
        nombre="John Doe",
        pais="AR",
        email="john@example.com",
        curso=curso,
    )
    inscripcion = Inscripcion.objects.create(
        alumno=alumno,
        curso=curso,
        monto=Money(Decimal("99.99"), "USD"),
        procesador_pago=ProcesadorPago.MP,
        estado=EstadoInscripcion.PENDIENTE,
        factura=factura,
    )
    return factura, inscripcion


@pytest.mark.django_db
class TestMercadoPagoWebhook:
    def test_missing_signature_returns_400(self):
        client = APIClient()
        resp = client.post(
            "/api/payments/mercado-pago/webhook/",
            {"data": {"id": "payment_1"}},
            format="json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_signature_returns_403(self, monkeypatch):
        monkeypatch.setenv("MP_WEBHOOK_SECRET", "secret")
        client = APIClient()

        resp = client.post(
            "/api/payments/mercado-pago/webhook/",
            {"data": {"id": "payment_1"}},
            format="json",
            HTTP_X_SIGNATURE="ts=123,v1=wrong",
            HTTP_X_REQUEST_ID="req-1",
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_approved_marks_paid_and_sends_email(self, settings, monkeypatch):
        settings.WEBHOOKS_DOMAIN = "http://testserver/"
        monkeypatch.setenv("MP_WEBHOOK_SECRET", "secret")
        monkeypatch.setenv("MP_ACCESS_TOKEN", "test-token")

        factura, inscripcion = _build_factura_and_inscripcion()

        payment_id = "payment_123"
        x_request_id = "req-1"
        ts = "123"
        signed_template = f"id:{payment_id};request-id:{x_request_id};ts:{ts};"
        v1 = hmac.new(
            b"secret",
            signed_template.encode(),
            hashlib.sha256,
        ).hexdigest()
        header_sig = f"ts={ts},v1={v1}"

        client = APIClient()
        with (
            patch("cursos.api.views.mercadopago.SDK") as mock_sdk,
            patch("cursos.api.views.EmailSender.send_welcome_email") as mock_email,
        ):
            payment_api = Mock()
            payment_api.get.return_value = {
                "response": {"status": "approved", "external_reference": factura.id},
            }
            mock_sdk.return_value.payment.return_value = payment_api

            resp = client.post(
                "/api/payments/mercado-pago/webhook/",
                {"data": {"id": payment_id}},
                format="json",
                HTTP_X_SIGNATURE=header_sig,
                HTTP_X_REQUEST_ID=x_request_id,
            )

        assert resp.status_code == status.HTTP_200_OK
        factura.refresh_from_db()
        assert factura.pagada is True
        mock_email.assert_called_once_with(inscripcion.id)


@pytest.mark.django_db
class TestMercadoPagoWebhookNonApproved:
    def test_not_approved_returns_400_and_no_side_effect(self, settings, monkeypatch):
        settings.WEBHOOKS_DOMAIN = "http://testserver/"
        monkeypatch.setenv("MP_WEBHOOK_SECRET", "secret")
        monkeypatch.setenv("MP_ACCESS_TOKEN", "test-token")

        factura, inscripcion = _build_factura_and_inscripcion()
        assert factura.pagada is False

        payment_id = "payment_456"
        x_request_id = "req-2"
        ts = "123"
        signed_template = f"id:{payment_id};request-id:{x_request_id};ts:{ts};"
        v1 = hmac.new(b"secret", signed_template.encode(), hashlib.sha256).hexdigest()
        header_sig = f"ts={ts},v1={v1}"

        client = APIClient()
        with (
            patch("cursos.api.views.mercadopago.SDK") as mock_sdk,
            patch("cursos.api.views.EmailSender.send_welcome_email") as mock_email,
        ):
            payment_api = Mock()
            payment_api.get.return_value = {
                "response": {"status": "pending", "external_reference": factura.id},
            }
            mock_sdk.return_value.payment.return_value = payment_api

            resp = client.post(
                "/api/payments/mercado-pago/webhook/",
                {"data": {"id": payment_id}},
                format="json",
                HTTP_X_SIGNATURE=header_sig,
                HTTP_X_REQUEST_ID=x_request_id,
            )

        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        factura.refresh_from_db()
        assert factura.pagada is False
        mock_email.assert_not_called()

    def test_approved_but_factura_not_found_returns_404_and_no_email(
        self,
        settings,
        monkeypatch,
    ):
        settings.WEBHOOKS_DOMAIN = "http://testserver/"
        monkeypatch.setenv("MP_WEBHOOK_SECRET", "secret")
        monkeypatch.setenv("MP_ACCESS_TOKEN", "test-token")

        payment_id = "payment_789"
        x_request_id = "req-3"
        ts = "123"
        signed_template = f"id:{payment_id};request-id:{x_request_id};ts:{ts};"
        v1 = hmac.new(b"secret", signed_template.encode(), hashlib.sha256).hexdigest()
        header_sig = f"ts={ts},v1={v1}"

        client = APIClient()
        with (
            patch("cursos.api.views.mercadopago.SDK") as mock_sdk,
            patch("cursos.api.views.EmailSender.send_welcome_email") as mock_email,
        ):
            payment_api = Mock()
            payment_api.get.return_value = {
                "response": {"status": "approved", "external_reference": 999999},
            }
            mock_sdk.return_value.payment.return_value = payment_api

            resp = client.post(
                "/api/payments/mercado-pago/webhook/",
                {"data": {"id": payment_id}},
                format="json",
                HTTP_X_SIGNATURE=header_sig,
                HTTP_X_REQUEST_ID=x_request_id,
            )

        assert resp.status_code == status.HTTP_404_NOT_FOUND
        mock_email.assert_not_called()
