import datetime
from datetime import timedelta
from urllib.parse import parse_qs
from urllib.parse import urlparse

import pytest
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from cursos.tests.factories import AlumnoFactory
from cursos.tests.factories import CursoFactory
from cursos.tests.factories import FacturaFactory
from cursos.tests.factories import TipoCursoFactory


@pytest.mark.django_db
class TestTipoCursoAPI:
    def test_list_tipos_de_curso_orders_by_orden(self):
        # Given tipos with different orden
        TipoCursoFactory(nombre_corto="B", orden=2)
        TipoCursoFactory(nombre_corto="A", orden=1)

        client = APIClient()
        resp = client.get("/api/tipos-de-curso/")

        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        # Serializer returns a list; verify ordering by 'orden'
        names = [item["nombre_corto"] for item in data]
        assert names == ["A", "B"]

    def test_list_tipos_de_curso_includes_json_contenido(self):
        temario = [
            {
                "module_title": "Módulo 1",
                "summary": "Resumen breve",
                "topics": [
                    {
                        "topic_title": "Tema principal",
                        "lessons": [
                            {"title": "Intro", "description": ""},
                            {"title": "Actividad", "description": ""},
                        ],
                    },
                ],
            },
        ]
        TipoCursoFactory(contenido=temario)

        client = APIClient()
        resp = client.get("/api/tipos-de-curso/")

        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()

        assert data[0]["contenido"] == temario
        assert "contenido_corto" not in data[0]


@pytest.mark.django_db
def test_tipo_curso_detail_returns_course_data(client):
    tipo = TipoCursoFactory(nombre_corto="CSM", orden=1)
    curso = CursoFactory(
        tipo=tipo,
        fecha=timezone.now().date() + timedelta(days=10),
    )

    response = client.get(f"/api/tipos-de-curso/{tipo.nombre_corto}/")

    assert response.status_code == status.HTTP_200_OK

    payload = response.json()
    assert payload["nombre_corto"] == "CSM"
    assert payload["upcoming_courses"][0]["id"] == curso.id


@pytest.mark.django_db
class TestInscribirParticipanteEnCurso:
    def _payload(self, procesador="STRIPE"):
        return {
            "procesador_pago": procesador,
            "nombre": "Ana",
            "apellido": "Perez",
            "email": "ana@example.com",
            "organizacion": "Acme",
            "rol": "Dev",
            "nombreCompleto": "Ana Perez",
            "pais": "AR",
            "tipoIdentificacionFiscal": "",
            "identificacionFiscal": "",
            "tipoFactura": "",
            "direccion": "",
            "emailFacturacion": "billing@example.com",
        }

    def test_invalid_curso_returns_404(self):
        client = APIClient()
        resp = client.post(
            "/api/cursos/9999/inscripciones/",
            self._payload(),
            format="json",
        )
        assert resp.status_code == status.HTTP_404_NOT_FOUND
        assert resp.json()["error"] == "Curso9999 not found"

    def test_invalid_procesador_returns_400(self):
        curso = CursoFactory()
        client = APIClient()
        resp = client.post(
            f"/api/cursos/{curso.id}/inscripciones/",
            self._payload(procesador="FOO"),
            format="json",
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        # Characterize exact message from current implementation
        assert resp.json()["error"] == "Invalid procesado_pago value"

    def test_creates_entities_and_returns_factura_id_stripe(self):
        curso = CursoFactory()
        client = APIClient()
        resp = client.post(
            f"/api/cursos/{curso.id}/inscripciones/",
            self._payload(procesador="STRIPE"),
            format="json",
        )
        assert resp.status_code == status.HTTP_201_CREATED
        body = resp.json()
        assert "id_factura" in body
        assert isinstance(body["id_factura"], int)

    def test_creates_entities_and_returns_factura_id_mp(self):
        curso = CursoFactory()
        client = APIClient()
        resp = client.post(
            f"/api/cursos/{curso.id}/inscripciones/",
            self._payload(procesador="MP"),
            format="json",
        )
        assert resp.status_code == status.HTTP_201_CREATED
        body = resp.json()
        assert "id_factura" in body
        assert isinstance(body["id_factura"], int)


@pytest.mark.django_db
class TestPaymentCallbacks:
    def _make_graph(self):
        tipo = TipoCursoFactory(nombre_completo="Curso X")
        curso = CursoFactory(tipo=tipo, fecha=datetime.date(2025, 1, 1))
        alumno = AlumnoFactory(nombre="Ana", apellido="Perez", email="ana@example.com")
        factura = FacturaFactory(curso=curso, email="billing@example.com")
        # Link via Inscripcion
        from cursos.models import EstadoInscripcion
        from cursos.models import Inscripcion
        from cursos.models import ProcesadorPago

        Inscripcion.objects.create(
            alumno=alumno,
            curso=curso,
            monto=factura.monto,
            procesador_pago=ProcesadorPago.STRIPE,
            estado=EstadoInscripcion.PENDIENTE,
            factura=factura,
        )
        return factura, alumno, curso, tipo

    def _parse_redirect(self, resp):
        assert resp.status_code in (301, 302)
        url = resp.url
        parsed = urlparse(url)
        return parsed, {k: v[0] for k, v in parse_qs(parsed.query).items()}

    def test_mp_callback_redirects_with_params(self, settings):
        settings.REDIRECT_DOMAIN = "http://testserver"
        factura, alumno, curso, tipo = self._make_graph()
        client = APIClient()
        resp = client.get(
            "/api/payments/mp-callback/",
            {"status": "approved", "external_reference": str(factura.id)},
        )
        parsed, qs = self._parse_redirect(resp)
        assert parsed.path == "/payment-result"
        assert qs["status"] == "approved"
        assert qs["nombre_curso"] == tipo.nombre_completo
        assert qs["fecha_curso"] == str(curso.fecha)
        assert qs["nombre_participante"] == alumno.nombre
        assert qs["apellido_participante"] == alumno.apellido
        assert qs["email_facturacion"] == factura.email
        assert qs["email_participante"] == alumno.email
        assert "monto" in qs  # representation of Money encoded

    def test_stripe_callback_redirects_with_params(self, settings):
        settings.REDIRECT_DOMAIN = "http://testserver"
        factura, alumno, curso, tipo = self._make_graph()
        client = APIClient()
        resp = client.get(
            "/api/payments/stripe-callback/",
            {"status": "approved", "id_factura": str(factura.id)},
        )
        parsed, qs = self._parse_redirect(resp)
        assert parsed.path == "/payment-result"
        assert qs["status"] == "approved"

    def test_mp_callback_redirects_with_params_trailing_slash_domain(
        self,
        settings,
    ):
        settings.REDIRECT_DOMAIN = "http://testserver/"  # trailing slash
        factura, alumno, curso, tipo = self._make_graph()
        client = APIClient()
        resp = client.get(
            "/api/payments/mp-callback/",
            {"status": "approved", "external_reference": str(factura.id)},
        )
        parsed, qs = self._parse_redirect(resp)
        # Must not contain double slash in path
        assert parsed.path == "/payment-result"

    def test_stripe_callback_redirects_with_params_trailing_slash_domain(
        self,
        settings,
    ):
        settings.REDIRECT_DOMAIN = "http://testserver/"  # trailing slash
        factura, alumno, curso, tipo = self._make_graph()
        client = APIClient()
        resp = client.get(
            "/api/payments/stripe-callback/",
            {"status": "approved", "id_factura": str(factura.id)},
        )
        parsed, qs = self._parse_redirect(resp)
        # Must not contain double slash in path
        assert parsed.path == "/payment-result"

    def test_missing_status_returns_400(self):
        client = APIClient()
        resp = client.get("/api/payments/stripe-callback/", {"id_factura": "1"})
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        body = resp.json()
        assert "Missing required parameter" in body.get("error", "")
