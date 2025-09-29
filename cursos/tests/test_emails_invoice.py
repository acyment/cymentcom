import pytest
from django.template.loader import render_to_string
from mjml import mjml2html

from cursos.tests.factories import AlumnoFactory
from cursos.tests.factories import FacturaFactory
from cursos.tests.factories import InscripcionFactory


@pytest.mark.django_db
def test_invoice_email_renders_participant_organization_without_braces():
    """Characterization: organization must render; no raw {{ }} survives."""
    factura = FacturaFactory()
    insc = InscripcionFactory(
        factura=factura,
        alumno=AlumnoFactory(
            nombre="Walter",
            apellido="Morales",
            organizacion="Acme Corp",
        ),
        curso=factura.curso,
    )

    context = {
        "factura": factura,
        "inscripciones": type(insc)
        .objects.filter(factura=factura)
        .select_related(
            "alumno",
        ),
        "nombre_pais": "Argentina",
    }

    mjml = render_to_string("emails/invoice.mjml", context)
    html = mjml2html(mjml)

    assert "Walter Morales (Acme Corp)" in html
    # Guardrail: no dangling template markers
    assert "{{" not in html
    assert "}}" not in html


@pytest.mark.django_db
def test_invoice_email_omits_parentheses_when_no_organization():
    """If organization is blank, no empty parentheses should render."""
    factura = FacturaFactory()
    insc = InscripcionFactory(
        factura=factura,
        alumno=AlumnoFactory(nombre="Ana", apellido="Pérez", organizacion=""),
        curso=factura.curso,
    )

    context = {
        "factura": factura,
        "inscripciones": type(insc)
        .objects.filter(factura=factura)
        .select_related(
            "alumno",
        ),
        "nombre_pais": "Argentina",
    }

    mjml = render_to_string("emails/invoice.mjml", context)
    html = mjml2html(mjml)

    assert "Ana Pérez ()" not in html
