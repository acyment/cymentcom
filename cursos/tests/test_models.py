import pytest

from cursos.models import EstadoInscripcion
from cursos.tests.factories import CursoFactory
from cursos.tests.factories import FacturaFactory
from cursos.tests.factories import InscripcionFactory
from cursos.tests.factories import TipoCursoFactory


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
