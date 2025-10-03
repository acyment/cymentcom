import datetime
from decimal import Decimal
from unittest.mock import patch

import pytest
import stripe
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
        contenido=[],
        video="",
        foto="",
        foto_tint="",
        orden=1,
        costo_ars=Money(100000, "ARS"),
        costo_sin_descuento_ars=Money(120000, "ARS"),
        stripe_price_id="price_x",
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
        procesador_pago=ProcesadorPago.STRIPE,
        estado=EstadoInscripcion.PENDIENTE,
        factura=factura,
    )
    return factura, inscripcion


@pytest.mark.django_db
class TestStripeWebhook:
    def test_missing_signature_header_returns_400(self):
        client = APIClient()
        resp = client.post(
            "/api/payments/stripe/webhook/",
            b"{}",
            content_type="application/json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_signature_returns_400(self, monkeypatch):
        client = APIClient()
        monkeypatch.setenv("STRIPE_API_KEY", "sk_test_dummy")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_dummy")

        with patch("cursos.api.views.stripe.Webhook.construct_event") as mock_construct:
            mock_construct.side_effect = stripe.error.SignatureVerificationError(
                "bad",
                "hdr",
            )
            resp = client.post(
                "/api/payments/stripe/webhook/",
                b"{}",
                content_type="application/json",
                HTTP_STRIPE_SIGNATURE="t=1,v1=bad",
            )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_checkout_completed_marks_paid_and_sends_email(self, settings, monkeypatch):
        settings.REDIRECT_DOMAIN = "http://testserver"
        monkeypatch.setenv("STRIPE_API_KEY", "sk_test_dummy")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_dummy")

        factura, inscripcion = _build_factura_and_inscripcion()

        class _Event:
            def __init__(self, event_type, data):
                self.type = event_type
                self._data = data

            def __getitem__(self, key):
                if key == "data":
                    return self._data
                raise KeyError(key)

        event = _Event(
            "checkout.session.completed",
            {"object": {"client_reference_id": factura.id}},
        )

        client = APIClient()
        with (
            patch(
                "cursos.api.views.stripe.Webhook.construct_event",
                return_value=event,
            ),
            patch("cursos.api.views.EmailSender.send_welcome_email") as mock_email,
        ):
            resp = client.post(
                "/api/payments/stripe/webhook/",
                b"{}",
                content_type="application/json",
                HTTP_STRIPE_SIGNATURE="t=1,v1=ok",
            )

        assert resp.status_code == status.HTTP_200_OK
        factura.refresh_from_db()
        assert factura.pagada is True
        mock_email.assert_called_once_with(inscripcion.id)


@pytest.mark.django_db
class TestStripeWebhookNonApproved:
    def test_unhandled_event_type_returns_200_and_no_side_effect(
        self,
        settings,
        monkeypatch,
    ):
        settings.REDIRECT_DOMAIN = "http://testserver"
        monkeypatch.setenv("STRIPE_API_KEY", "sk_test_dummy")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_dummy")

        factura, inscripcion = _build_factura_and_inscripcion()
        assert factura.pagada is False

        class _Event:
            def __init__(self, event_type, data):
                self.type = event_type
                self._data = data

            def __getitem__(self, key):
                if key == "data":
                    return self._data
                raise KeyError(key)

        event = _Event("payment_intent.succeeded", {"object": {"id": "pi_123"}})

        client = APIClient()
        with (
            patch(
                "cursos.api.views.stripe.Webhook.construct_event",
                return_value=event,
            ),
            patch("cursos.api.views.EmailSender.send_welcome_email") as mock_email,
        ):
            resp = client.post(
                "/api/payments/stripe/webhook/",
                b"{}",
                content_type="application/json",
                HTTP_STRIPE_SIGNATURE="t=1,v1=ok",
            )

        assert resp.status_code == status.HTTP_200_OK
        factura.refresh_from_db()
        assert factura.pagada is False
        mock_email.assert_not_called()

    def test_checkout_completed_with_missing_factura_returns_404_and_no_email(
        self,
        monkeypatch,
    ):
        monkeypatch.setenv("STRIPE_API_KEY", "sk_test_dummy")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_dummy")

        class _Event:
            def __init__(self, event_type, data):
                self.type = event_type
                self._data = data

            def __getitem__(self, key):
                if key == "data":
                    return self._data
                raise KeyError(key)

        event = _Event(
            "checkout.session.completed",
            {"object": {"client_reference_id": 999999}},
        )

        client = APIClient()
        with (
            patch(
                "cursos.api.views.stripe.Webhook.construct_event",
                return_value=event,
            ),
            patch("cursos.api.views.EmailSender.send_welcome_email") as mock_email,
        ):
            resp = client.post(
                "/api/payments/stripe/webhook/",
                b"{}",
                content_type="application/json",
                HTTP_STRIPE_SIGNATURE="t=1,v1=ok",
            )

        assert resp.status_code == status.HTTP_404_NOT_FOUND
        mock_email.assert_not_called()
