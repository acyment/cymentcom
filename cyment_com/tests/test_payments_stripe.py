import datetime
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from djmoney.money import Money
from rest_framework import status
from rest_framework.test import APIClient

from cursos.models import Curso
from cursos.models import Factura
from cursos.models import TipoCurso


@pytest.mark.django_db
class TestStripeCheckout:
    def _make_factura(self, *, stripe_price_id: str = "price_123") -> Factura:
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
            costo_ars=Money(100_000, "ARS"),
            costo_sin_descuento_ars=Money(120_000, "ARS"),
            stripe_price_id=stripe_price_id or "",
        )
        curso = Curso.objects.create(
            tipo=tipo,
            fecha=datetime.datetime.now(datetime.UTC).date(),
        )
        return Factura.objects.create(
            monto=Money(Decimal("99.99"), "USD"),
            nombre="John Doe",
            pais="AR",
            email="john@example.com",
            curso=curso,
        )

    def test_missing_id_factura_returns_400(self, settings):
        settings.REDIRECT_DOMAIN = "http://testserver"
        client = APIClient()

        resp = client.post("/api/create-stripe-checkoutsession/", {}, format="json")

        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert resp.data["error"] == "Missing 'id_factura' in request data."

    def test_factura_not_found_returns_404(self, settings):
        settings.REDIRECT_DOMAIN = "http://testserver"
        client = APIClient()

        resp = client.post(
            "/api/create-stripe-checkoutsession/",
            {"id_factura": 999999},
            format="json",
        )

        assert resp.status_code == status.HTTP_404_NOT_FOUND
        assert "Invoice with ID 999999 not found." in resp.data["error"]

    def test_missing_stripe_price_id_returns_500(self, settings):
        settings.REDIRECT_DOMAIN = "http://testserver"
        client = APIClient()
        factura = self._make_factura(stripe_price_id="")

        resp = client.post(
            "/api/create-stripe-checkoutsession/",
            {"id_factura": factura.id},
            format="json",
        )

        assert resp.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert (
            resp.data["error"]
            == "Configuration error: Stripe Price ID not set for this course type."
        )

    @patch("cursos.api.views.stripe.checkout.Session.create")
    def test_success_redirects_and_calls_stripe(
        self,
        mock_create,
        settings,
        monkeypatch,
    ):
        settings.REDIRECT_DOMAIN = "http://testserver"
        monkeypatch.setenv("STRIPE_API_KEY", "sk_test_dummy")
        client = APIClient()
        factura = self._make_factura(stripe_price_id="price_abc")

        mock_create.return_value = SimpleNamespace(
            id="cs_test_123",
            url="https://checkout.stripe.com/pay/cs_test_123",
        )

        resp = client.post(
            "/api/create-stripe-checkoutsession/",
            {"id_factura": factura.id},
            format="json",
        )

        assert resp.status_code in (
            status.HTTP_301_MOVED_PERMANENTLY,
            status.HTTP_302_FOUND,
        )
        assert resp.url == "https://checkout.stripe.com/pay/cs_test_123"

        assert mock_create.called
        _, kwargs = mock_create.call_args
        assert kwargs["mode"] == "payment"
        assert kwargs["allow_promotion_codes"] is True
        assert kwargs["customer_email"] == factura.email
        assert kwargs["client_reference_id"] == factura.id
        assert kwargs["line_items"] == [{"price": "price_abc", "quantity": 1}]
        assert (
            f"/api/payments/stripe-callback/?status=approved&id_factura={factura.id}"
            in kwargs["success_url"]
        )
        assert "/api/payments/stripe-callback/?status=failed" in kwargs["cancel_url"]


def _make_factura_for_errors(*, stripe_price_id: str = "price_err") -> Factura:
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
        stripe_price_id=stripe_price_id or "",
        url_logo="",
    )
    curso = Curso.objects.create(
        tipo=tipo,
        fecha=datetime.datetime.now(datetime.UTC).date(),
    )
    return Factura.objects.create(
        monto=Money(Decimal("99.99"), "USD"),
        nombre="John Doe",
        pais="AR",
        email="john@example.com",
        curso=curso,
    )


@pytest.mark.django_db
class TestStripeCheckoutErrors:
    def _fake_stripe(self, create_side_effect):
        class _BaseStripeError(Exception):
            def __init__(self, message="err", **kwargs):
                super().__init__(message)
                for k, v in kwargs.items():
                    setattr(self, k, v)

        class _CardError(_BaseStripeError):
            def __init__(
                self,
                message="err",
                code="card_declined",
                user_message=None,
                **kwargs,
            ):
                super().__init__(message, **kwargs)
                self.code = code
                self.user_message = user_message

        class _RateLimitError(_BaseStripeError):
            pass

        class _InvalidRequestError(_BaseStripeError):
            pass

        class _AuthenticationError(_BaseStripeError):
            pass

        class _APIConnectionError(_BaseStripeError):
            pass

        class _StripeError(_BaseStripeError):
            pass

        fake_error_ns = SimpleNamespace(
            CardError=_CardError,
            RateLimitError=_RateLimitError,
            InvalidRequestError=_InvalidRequestError,
            AuthenticationError=_AuthenticationError,
            APIConnectionError=_APIConnectionError,
            StripeError=_StripeError,
        )
        fake_session = SimpleNamespace(create=create_side_effect)
        fake_checkout = SimpleNamespace(Session=fake_session)
        fake_stripe = SimpleNamespace(
            error=fake_error_ns,
            checkout=fake_checkout,
            api_key=None,
        )
        return fake_stripe, fake_error_ns

    def _post(self, factura_id, settings):
        settings.REDIRECT_DOMAIN = "http://testserver"
        client = APIClient()
        return client.post(
            "/api/create-stripe-checkoutsession/",
            {"id_factura": factura_id},
            format="json",
        )

    def test_rate_limit_returns_503(self, settings):
        factura = _make_factura_for_errors()

        def _raise(*args, **kwargs):
            raise fake_error.RateLimitError

        fake_stripe, fake_error = self._fake_stripe(_raise)
        with patch("cursos.api.views.stripe", fake_stripe):
            resp = self._post(factura.id, settings)

        assert resp.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert resp.data["error"] == "Stripe service busy. Please try again later."

    def test_invalid_request_returns_400(self, settings):
        factura = _make_factura_for_errors()

        def _raise(*args, **kwargs):
            raise fake_error.InvalidRequestError(param="price")

        fake_stripe, fake_error = self._fake_stripe(_raise)
        with patch("cursos.api.views.stripe", fake_stripe):
            resp = self._post(factura.id, settings)

        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert resp.data["error"] == "Invalid request to Stripe."

    def test_authentication_error_returns_500(self, settings):
        factura = _make_factura_for_errors()

        def _raise(*args, **kwargs):
            raise fake_error.AuthenticationError

        fake_stripe, fake_error = self._fake_stripe(_raise)
        with patch("cursos.api.views.stripe", fake_stripe):
            resp = self._post(factura.id, settings)

        assert resp.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert resp.data["error"] == "Stripe authentication error."

    def test_api_connection_error_returns_503(self, settings):
        factura = _make_factura_for_errors()

        def _raise(*args, **kwargs):
            raise fake_error.APIConnectionError

        fake_stripe, fake_error = self._fake_stripe(_raise)
        with patch("cursos.api.views.stripe", fake_stripe):
            resp = self._post(factura.id, settings)

        assert resp.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert (
            resp.data["error"] == "Could not connect to Stripe. Please try again later."
        )

    def test_generic_stripe_error_returns_500(self, settings):
        factura = _make_factura_for_errors()

        def _raise(*args, **kwargs):
            raise fake_error.StripeError

        fake_stripe, fake_error = self._fake_stripe(_raise)
        with patch("cursos.api.views.stripe", fake_stripe):
            resp = self._post(factura.id, settings)

        assert resp.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert resp.data["error"] == "An error occurred during Stripe processing."

    def test_card_error_returns_400_with_user_message(self, settings):
        factura = _make_factura_for_errors()

        def _raise(*args, **kwargs):
            raise fake_error.CardError(user_message="Card was declined")

        fake_stripe, fake_error = self._fake_stripe(_raise)
        with patch("cursos.api.views.stripe", fake_stripe):
            resp = self._post(factura.id, settings)

        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert resp.data["error"] == "Card was declined"
