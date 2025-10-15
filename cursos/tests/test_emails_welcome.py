from datetime import date
from datetime import time
from datetime import timedelta

import pytest
from django.template.loader import render_to_string
from mjml import mjml2html

from cursos.emails import EmailSender
from cursos.tests.factories import CursoFactory
from cursos.tests.factories import InscripcionFactory


@pytest.mark.django_db
def test_welcome_email_renders_both_timezones():
    """El mail de bienvenida debe mostrar horarios para Argentina y México."""
    curso = CursoFactory(
        fecha=date(2025, 10, 27),
        cantidad_dias=5,
        hora_inicio=time(10, 0),
        hora_fin=time(13, 30),
    )
    inscripcion = InscripcionFactory(curso=curso)
    fecha_fin = curso.fecha + timedelta(days=curso.cantidad_dias - 1)

    context = {
        "alumno": inscripcion.alumno,
        "curso": curso,
        "monto": inscripcion.monto,
        "procesador_pago": inscripcion.get_procesador_pago_display(),
        "fecha_fin": fecha_fin,
        "hora_inicio_argentina": curso.hora_inicio,
        "hora_fin_argentina": curso.hora_fin,
        "hora_inicio_mexico": time(7, 0),
        "hora_fin_mexico": time(10, 30),
    }

    html = mjml2html(render_to_string("emails/welcome.mjml", context))
    collapsed = " ".join(html.split())

    assert "Argentina (GMT-3): 10:00 a 13:30" in collapsed
    assert "México (GMT-6): 07:00 a 10:30" in collapsed


@pytest.mark.django_db
def test_send_welcome_email_computes_mexico_schedule(monkeypatch):
    """La tarea debe calcular los horarios mexicanos restando tres horas."""
    curso = CursoFactory(
        fecha=date(2025, 10, 27),
        hora_inicio=time(9, 0),
        hora_fin=time(12, 30),
    )
    inscripcion = InscripcionFactory(curso=curso)

    captured = {}

    def fake_send(template_name, context, subject, recipient_list, **kwargs):
        captured["context"] = context

    monkeypatch.setattr(EmailSender, "_send_email", staticmethod(fake_send))

    EmailSender.send_welcome_email(inscripcion.id)

    ctx = captured["context"]
    assert ctx["hora_inicio_argentina"] == curso.hora_inicio
    assert ctx["hora_fin_argentina"] == curso.hora_fin
    assert ctx["hora_inicio_mexico"].strftime("%H:%M") == "06:00"
    assert ctx["hora_fin_mexico"].strftime("%H:%M") == "09:30"


@pytest.mark.django_db
def test_welcome_email_uses_standard_schedule():
    """El cronograma vuelve al formato simple sin excepciones de jueves."""
    curso = CursoFactory(
        fecha=date(2025, 10, 27),
        cantidad_dias=5,
        hora_inicio=time(10, 0),
        hora_fin=time(13, 30),
    )
    inscripcion = InscripcionFactory(curso=curso)
    fecha_fin = curso.fecha + timedelta(days=curso.cantidad_dias - 1)

    context = {
        "alumno": inscripcion.alumno,
        "curso": curso,
        "monto": inscripcion.monto,
        "procesador_pago": inscripcion.get_procesador_pago_display(),
        "fecha_fin": fecha_fin,
        "hora_inicio_argentina": curso.hora_inicio,
        "hora_fin_argentina": curso.hora_fin,
        "hora_inicio_mexico": time(7, 0),
        "hora_fin_mexico": time(10, 30),
    }

    html = mjml2html(render_to_string("emails/welcome.mjml", context))
    collapsed = " ".join(html.split())

    assert "Argentina (GMT-3): 10:00 a 13:30" in collapsed
    assert "México (GMT-6): 07:00 a 10:30" in collapsed
    assert "Argentina (GMT-3): 17:00 a 20:30" not in collapsed
    assert "México (GMT-6): 14:00 a 17:30" not in collapsed
    assert "Jueves (sesión especial)" not in collapsed
    assert "Sesión especial del jueves" not in collapsed


@pytest.mark.django_db
def test_welcome_email_recoding_section_returns_to_no_recordings(monkeypatch):
    """La sección de FAQ vuelve a indicar que no se realizan grabaciones."""
    curso = CursoFactory(
        fecha=date(2025, 10, 27),
        hora_inicio=time(10, 0),
        hora_fin=time(13, 30),
    )
    inscripcion = InscripcionFactory(curso=curso)

    captured = {}

    def fake_send(template_name, context, subject, recipient_list, **kwargs):
        captured["context"] = context
        captured["html"] = mjml2html(render_to_string(template_name, context))

    monkeypatch.setattr(EmailSender, "_send_email", staticmethod(fake_send))

    EmailSender.send_welcome_email(inscripcion.id)

    ctx = captured["context"]
    collapsed = " ".join(captured["html"].split())

    assert "No, las sesiones no serán grabadas." in collapsed
    assert "se grabará y recibirás la reproducción" not in collapsed
    assert "jueves_inicio_argentina" not in ctx


@pytest.mark.django_db
def test_reseller_template_removes_payment_section():
    """La variante reseller ajusta el saludo y elimina la sección de pago."""
    curso = CursoFactory(
        fecha=date(2025, 10, 27),
        cantidad_dias=5,
        hora_inicio=time(10, 0),
        hora_fin=time(13, 30),
    )
    inscripcion = InscripcionFactory(curso=curso)
    fecha_fin = curso.fecha + timedelta(days=curso.cantidad_dias - 1)

    context = {
        "alumno": inscripcion.alumno,
        "curso": curso,
        "monto": inscripcion.monto,
        "procesador_pago": inscripcion.get_procesador_pago_display(),
        "fecha_fin": fecha_fin,
        "hora_inicio_argentina": time(10, 0),
        "hora_fin_argentina": time(13, 30),
        "hora_inicio_mexico": time(7, 0),
        "hora_fin_mexico": time(10, 30),
    }

    html = mjml2html(render_to_string("emails/welcome_reseller.mjml", context))
    collapsed = " ".join(html.split())

    assert (
        "Ya falta muy poco para el comienzo del curso. Aquí va información importante"
        in collapsed
    )
    assert "Información de pago y facturación" not in collapsed
    assert "Se envió otro mensaje a la dirección correspondiente" not in collapsed
    assert "Argentina (GMT-3): 10:00 a 13:30" in collapsed
    assert "México (GMT-6): 07:00 a 10:30" in collapsed
    assert "Jueves (sesión especial)" not in collapsed


@pytest.mark.django_db
def test_send_reseller_welcome_email_uses_reseller_template(monkeypatch):
    """El envío para resellers usa el nuevo template y mantiene el horario base."""
    curso = CursoFactory(
        fecha=date(2025, 10, 27),
        hora_inicio=time(10, 0),
        hora_fin=time(13, 30),
    )
    inscripcion = InscripcionFactory(curso=curso)

    captured = {}

    def fake_send(template_name, context, subject, recipient_list, **kwargs):
        captured["template"] = template_name
        captured["subject"] = subject
        captured["context"] = context

    monkeypatch.setattr(EmailSender, "_send_email", staticmethod(fake_send))

    EmailSender.send_reseller_welcome_email(inscripcion.id)

    assert captured["template"] == "emails/welcome_reseller.mjml"
    assert captured["subject"].startswith("Datos de conexión - ")
    assert captured["context"]["hora_inicio_argentina"].strftime("%H:%M") == "10:00"
    assert captured["context"]["hora_inicio_mexico"].strftime("%H:%M") == "07:00"
    assert "jueves_inicio_argentina" not in captured["context"]


@pytest.mark.django_db
def test_send_welcome_email_includes_cc_when_present(monkeypatch):
    """La copia en CC se agrega cuando la inscripción lo define."""
    curso = CursoFactory()
    inscripcion = InscripcionFactory(curso=curso, cc_email="cc@example.com")

    captured = {}

    def fake_send(
        template_name,
        context,
        subject,
        recipient_list,
        cc_list=None,
        **kwargs,
    ):
        captured["cc"] = cc_list

    monkeypatch.setattr(EmailSender, "_send_email", staticmethod(fake_send))

    EmailSender.send_welcome_email(inscripcion.id)

    assert captured["cc"] == ["cc@example.com"]


@pytest.mark.django_db
def test_send_reseller_welcome_email_includes_cc_when_present(monkeypatch):
    curso = CursoFactory()
    inscripcion = InscripcionFactory(curso=curso, cc_email="reseller-cc@example.com")

    captured = {}

    def fake_send(
        template_name,
        context,
        subject,
        recipient_list,
        cc_list=None,
        **kwargs,
    ):
        captured["cc"] = cc_list

    monkeypatch.setattr(EmailSender, "_send_email", staticmethod(fake_send))

    EmailSender.send_reseller_welcome_email(inscripcion.id)

    assert captured["cc"] == ["reseller-cc@example.com"]
