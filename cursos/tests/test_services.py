from decimal import Decimal

import pytest
from djmoney.money import Money

from cursos.models import Alumno
from cursos.models import EstadoInscripcion
from cursos.models import Factura
from cursos.models import Inscripcion
from cursos.models import ProcesadorPago
from cursos.services import alta_batch_revendedor
from cursos.tests.factories import AlumnoFactory
from cursos.tests.factories import CursoFactory


@pytest.mark.django_db
def test_alta_batch_revendedor_reuses_students_and_creates_shared_factura():
    curso = CursoFactory()
    existing_alumno = AlumnoFactory(
        apellido="Burgos",
        nombre="Natallie",
        email="nb@insyspr.com",
    )
    pasted_students = "\n".join(
        [
            "Burgos\tNatallie\tnb@insyspr.com",
            "Contreras Bautista\tCarlos antonio\tc.contreras@cringenieria.org",
            "Arcos Garza\tIrlanda Paola \tirlanda.arcos.19@gmail.com",
        ],
    )

    result = alta_batch_revendedor(
        curso=curso,
        alumnos_text=pasted_students,
        monto=Money(Decimal("850.00"), "USD"),
        email_facturacion="billing@example.com",
        pais_facturacion="AR",
    )

    assert result.created_alumnos == 2
    assert result.reused_alumnos == 1

    factura = Factura.objects.get()
    assert factura.curso == curso
    assert factura.monto == Money(Decimal("850.00"), "USD")
    assert factura.nombre == "Alta batch de revendedor"
    assert factura.email == "billing@example.com"
    assert factura.pais == "AR"

    assert Alumno.objects.count() == 3
    assert Inscripcion.objects.count() == 3

    existing_inscripcion = Inscripcion.objects.get(alumno=existing_alumno)
    assert existing_inscripcion.factura == factura
    assert existing_inscripcion.curso == curso
    assert existing_inscripcion.monto == Money(Decimal("850.00"), "USD")
    assert existing_inscripcion.estado == EstadoInscripcion.ACEPTADO
    assert existing_inscripcion.procesador_pago == ProcesadorPago.TRANSFERENCIA

    trimmed_alumno = Alumno.objects.get(email="irlanda.arcos.19@gmail.com")
    assert trimmed_alumno.apellido == "Arcos Garza"
    assert trimmed_alumno.nombre == "Irlanda Paola"
