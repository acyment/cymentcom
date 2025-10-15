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
def test_welcome_email_highlights_thursday_exception():
    """El cronograma incluye la sesión especial de jueves en ambos husos horarios."""
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
        "jueves_inicio_argentina": time(17, 0),
        "jueves_fin_argentina": time(20, 30),
        "jueves_inicio_mexico": time(14, 0),
        "jueves_fin_mexico": time(17, 30),
    }

    html = mjml2html(render_to_string("emails/welcome.mjml", context))
    collapsed = " ".join(html.split())

    assert "Todas las sesiones son en vivo" in collapsed
    assert "Jueves" in collapsed
    assert "Argentina (GMT-3): 17:00 a 20:30" in collapsed
    assert "México (GMT-6): 14:00 a 17:30" in collapsed


@pytest.mark.django_db
def test_welcome_email_mentions_thursday_recording(monkeypatch):
    """El mensaje aclara que el jueves se graba y se comparte la sesión."""
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

    assert ctx["jueves_inicio_argentina"].strftime("%H:%M") == "17:00"
    assert ctx["jueves_inicio_mexico"].strftime("%H:%M") == "14:00"
    assert "Sesión especial del jueves" in collapsed
    assert "se grabará y recibirás la reproducción" in collapsed
