from unittest.mock import Mock

import pytest
from rest_framework.test import APIClient

from cursos.tests.factories import AlumnoFactory
from cursos.tests.factories import CursoFactory
from cursos.tests.factories import FacturaFactory
from cursos.tests.factories import InscripcionFactory
from cursos.tests.factories import TipoCursoFactory


@pytest.fixture
def api_client():
    """API client for testing REST endpoints."""
    return APIClient()


@pytest.fixture
def authenticated_api_client(user):
    """API client with authenticated user."""
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def tipo_curso():
    """Create a TipoCurso instance."""
    return TipoCursoFactory()


@pytest.fixture
def curso(tipo_curso):
    """Create a Curso instance."""
    return CursoFactory(tipo=tipo_curso)


@pytest.fixture
def inscripcion(curso):
    """Create an Inscripcion instance."""
    return InscripcionFactory(curso=curso, alumno=AlumnoFactory())


@pytest.fixture
def factura(curso):
    """Create a Factura instance."""
    return FacturaFactory(curso=curso)


@pytest.fixture
def mock_stripe_session():
    """Mock Stripe checkout session."""
    return Mock(
        id="cs_test_123",
        url="https://checkout.stripe.com/pay/cs_test_123",
        payment_status="unpaid",
        payment_intent="pi_test_123",
    )


@pytest.fixture
def mock_mp_preference():
    """Mock MercadoPago preference."""
    return Mock(
        id="123456789",
        init_point="https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789",
        sandbox_init_point="https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789",
    )


@pytest.fixture
def stripe_webhook_payload():
    """Sample Stripe webhook payload."""
    return {
        "id": "evt_test_123",
        "object": "event",
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": "pi_test_123",
                "object": "payment_intent",
                "status": "succeeded",
                "amount": 9999,
                "currency": "usd",
                "metadata": {
                    "external_reference": "test-ref-123",
                },
            },
        },
    }


@pytest.fixture
def mp_webhook_payload():
    """Sample MercadoPago webhook payload."""
    return {
        "id": 123456789,
        "live_mode": False,
        "type": "payment",
        "date_created": "2024-01-01T10:00:00.000Z",
        "application_id": 123456789,
        "user_id": 123456789,
        "version": 1,
        "api_version": "v1",
        "action": "payment.created",
        "data": {
            "id": "payment_id_123",
        },
    }
