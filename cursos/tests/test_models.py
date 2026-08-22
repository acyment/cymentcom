import pytest
from django.core.exceptions import ValidationError

from cursos.models import EstadoInscripcion
from cursos.tests.factories import ClienteFactory
from cursos.tests.factories import CursoFactory
from cursos.tests.factories import FacturaFactory
from cursos.tests.factories import InscripcionFactory
from cursos.tests.factories import TipoCursoFactory


@pytest.mark.django_db
class TestCliente:
    def test_cc_email_list_splits_and_strips_comma_separated_emails(self):
        cliente = ClienteFactory(cc_emails=" a@x.com,  b@x.com ,c@x.com")
        assert cliente.cc_email_list() == ["a@x.com", "b@x.com", "c@x.com"]

    def test_cc_email_list_empty_when_blank(self):
        cliente = ClienteFactory(cc_emails="")
        assert cliente.cc_email_list() == []

    def test_clean_rejects_invalid_email_in_cc_emails(self):
        cliente = ClienteFactory.build(cc_emails="not-an-email")
        with pytest.raises(ValidationError):
            cliente.full_clean()


@pytest.mark.django_db
class TestTipoCurso:
    def test_str_representation_uses_nombre_corto(self):
        tipo = TipoCursoFactory(nombre_corto="AvanzadoPy")
        assert str(tipo) == "AvanzadoPy"

    def test_costo_usd_defaults_present(self):
        tipo = TipoCursoFactory()
        assert tipo.costo_usd.currency.code == "USD"
        assert tipo.costo_usd.amount > 0

    def test_costo_ars_defaults_present(self):
        tipo = TipoCursoFactory()
        assert tipo.costo_ars.currency.code == "ARS"
        assert tipo.costo_ars.amount > 0

    def test_factory_respects_char_field_max_lengths(self):
        """Faker no debe desbordar los CharField cortos (flakiness histórica)."""
        tipo = TipoCursoFactory()
        max_length = 60
        assert len(tipo.nombre_completo) <= max_length
        assert len(tipo.resumen_una_linea) <= max_length

    def test_factory_assigns_unique_orden(self):
        """orden es unique: la factory no puede repetirlo entre instancias."""
        tipos = [TipoCursoFactory() for _ in range(3)]
        ordenes = [tipo.orden for tipo in tipos]
        assert len(set(ordenes)) == len(ordenes)

    def test_factory_orden_does_not_clash_with_explicit_values(self):
        """Los tests que fijan orden a mano usan valores bajos (1, 2...)."""
        explicito = TipoCursoFactory(orden=1)
        automatico = TipoCursoFactory()
        assert explicito.orden != automatico.orden


@pytest.mark.django_db
class TestCurso:
    def test_str_representation(self):
        curso = CursoFactory()
        expected = f"{curso.tipo} - {curso.fecha}"
        assert str(curso) == expected


@pytest.mark.django_db
class TestInscripcion:
    def test_str_representation_includes_alumno_and_curso(self):
        inscripcion = InscripcionFactory()
        expected = f"{inscripcion.alumno} - {inscripcion.curso}"
        assert str(inscripcion) == expected

    def test_default_estado_pendiente(self):
        inscripcion = InscripcionFactory()
        assert inscripcion.estado == EstadoInscripcion.PENDIENTE


@pytest.mark.django_db
class TestFactura:
    def test_str_representation(self):
        factura = FacturaFactory()
        expected = f"{factura.nombre} - {factura.curso}"
        assert str(factura) == expected

    def test_pagada_defaults_false(self):
        factura = FacturaFactory()
        assert factura.pagada is False

    def test_cc_email_list_splits_and_strips_comma_separated_emails(self):
        factura = FacturaFactory.build(cc_emails=" a@x.com,  b@x.com ,c@x.com")
        assert factura.cc_email_list() == ["a@x.com", "b@x.com", "c@x.com"]

    def test_cc_email_list_empty_when_blank(self):
        factura = FacturaFactory.build(cc_emails="")
        assert factura.cc_email_list() == []

    def test_clean_rejects_invalid_email_in_cc_emails(self):
        factura = FacturaFactory()
        factura.cc_emails = "not-an-email"
        with pytest.raises(ValidationError):
            factura.full_clean()
