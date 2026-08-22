from http import HTTPStatus

import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.messages.storage.fallback import FallbackStorage
from django.contrib.sessions.middleware import SessionMiddleware
from django.test import RequestFactory
from django.urls import reverse
from django_json_widget.widgets import JSONEditorWidget
from django_jsonform.widgets import JSONFormWidget
from djmoney.money import Money

from cursos.admin import CursoAdmin
from cursos.admin import FacturaAdminForm
from cursos.admin import InscripcionAdmin
from cursos.admin import TipoCursoAdmin
from cursos.models import Curso
from cursos.models import Inscripcion
from cursos.models import TipoCurso
from cursos.services import AltaBatchRevendedorResult
from cursos.tests.factories import ClienteFactory
from cursos.tests.factories import CursoFactory
from cursos.tests.factories import InscripcionFactory


@pytest.fixture
def admin_site():
    return AdminSite()


@pytest.fixture
def rf():
    return RequestFactory()


def add_messages_to_request(request):
    middleware = SessionMiddleware(lambda req: None)
    middleware.process_request(request)
    request.session.save()
    request._messages = FallbackStorage(request)  # noqa: SLF001


class FakeTask:
    def __init__(self):
        self.calls = []

    def delay(self, inscripcion_id):
        self.calls.append(inscripcion_id)


@pytest.mark.parametrize(
    ("query_params", "expected_widget"),
    [
        ({}, JSONFormWidget),
        ({"json_view": "raw"}, JSONEditorWidget),
    ],
)
def test_tipo_curso_admin_contenido_widget_toggles(
    query_params,
    expected_widget,
    rf,
    admin_site,
):
    request = rf.get("/admin/cursos/tipocurso/1/change/", data=query_params)
    admin = TipoCursoAdmin(TipoCurso, admin_site)
    form_class = admin.get_form(request)
    form = form_class()

    assert isinstance(form.fields["contenido"].widget, expected_widget)


def test_tipo_curso_admin_raw_widget_renders(rf, admin_site):
    request = rf.get("/admin/cursos/tipocurso/1/change/", data={"json_view": "raw"})
    admin = TipoCursoAdmin(TipoCurso, admin_site)
    form_class = admin.get_form(request)
    form = form_class()

    rendered = form.as_p()

    assert rendered


@pytest.mark.django_db
def test_curso_admin_changeform_runs_alta_batch_revendedor(
    rf,
    admin_site,
    monkeypatch,
):
    curso = CursoFactory()
    request = rf.post(
        f"/admin/cursos/curso/{curso.id}/change/",
        data={
            "_alta_batch_revendedor": "1",
            "batch_alumnos": "Burgos\tNatallie\tnb@insyspr.com",
            "batch_email_facturacion": "billing@example.com",
            "batch_pais_facturacion": "AR",
        },
    )
    add_messages_to_request(request)
    called = {}

    def fake_alta_batch_revendedor(**kwargs):
        called.update(kwargs)
        return AltaBatchRevendedorResult(created_alumnos=1, reused_alumnos=0)

    monkeypatch.setattr(
        "cursos.admin.alta_batch_revendedor",
        fake_alta_batch_revendedor,
    )

    admin = CursoAdmin(Curso, admin_site)
    response = admin.changeform_view(request, object_id=str(curso.id))

    assert response.status_code == HTTPStatus.FOUND
    assert called == {
        "curso": curso,
        "alumnos_text": "Burgos\tNatallie\tnb@insyspr.com",
        "monto": Money("850.00", "USD"),
        "email_facturacion": "billing@example.com",
        "pais_facturacion": "AR",
    }


@pytest.mark.django_db
def test_curso_admin_runs_alta_batch_when_batch_text_is_present_on_regular_save(
    rf,
    admin_site,
    monkeypatch,
):
    curso = CursoFactory()
    request = rf.post(
        f"/admin/cursos/curso/{curso.id}/change/",
        data={
            "_save": "Guardar",
            "batch_alumnos": "Burgos\tNatallie\tnb@insyspr.com",
            "batch_email_facturacion": "billing@example.com",
            "batch_pais_facturacion": "AR",
        },
    )
    add_messages_to_request(request)
    called = {}

    def fake_alta_batch_revendedor(**kwargs):
        called.update(kwargs)
        return AltaBatchRevendedorResult(created_alumnos=1, reused_alumnos=0)

    monkeypatch.setattr(
        "cursos.admin.alta_batch_revendedor",
        fake_alta_batch_revendedor,
    )

    admin = CursoAdmin(Curso, admin_site)
    response = admin.changeform_view(request, object_id=str(curso.id))

    assert response.status_code == HTTPStatus.FOUND
    assert called == {
        "curso": curso,
        "alumnos_text": "Burgos\tNatallie\tnb@insyspr.com",
        "monto": Money("850.00", "USD"),
        "email_facturacion": "billing@example.com",
        "pais_facturacion": "AR",
    }


@pytest.mark.django_db
def test_curso_admin_renders_alta_batch_submit_before_default_submit_buttons(
    admin_client,
):
    curso = CursoFactory()
    url = reverse("admin:cursos_curso_change", args=[curso.pk])

    response = admin_client.get(url)
    html = response.content.decode()

    assert html.index('name="_alta_batch_revendedor"') < html.index('name="_save"')


@pytest.mark.django_db
def test_welcome_admin_action_sets_prompted_cc_before_sending(
    rf,
    admin_site,
    monkeypatch,
):
    inscripcion = InscripcionFactory(cc_email="")
    request = rf.post(
        "/admin/cursos/inscripcion/",
        data={"apply": "1", "cc_email": "admin@example.com"},
    )
    add_messages_to_request(request)
    task = FakeTask()
    monkeypatch.setattr("cursos.admin.EmailSender.send_welcome_email", task)

    admin = InscripcionAdmin(Inscripcion, admin_site)
    admin.enviar_mail_bienvenida(
        request,
        Inscripcion.objects.filter(pk=inscripcion.pk),
    )

    inscripcion.refresh_from_db()
    assert inscripcion.cc_email == "admin@example.com"
    assert task.calls == [inscripcion.id]


@pytest.mark.django_db
def test_welcome_admin_action_uses_configured_cc_when_prompt_is_blank(
    settings,
    rf,
    admin_site,
    monkeypatch,
):
    settings.CURSOS_CONFIRMATION_CC_EMAIL = "default-admin@example.com"
    inscripcion = InscripcionFactory(cc_email="")
    request = rf.post(
        "/admin/cursos/inscripcion/",
        data={"apply": "1", "cc_email": ""},
    )
    add_messages_to_request(request)
    task = FakeTask()
    monkeypatch.setattr("cursos.admin.EmailSender.send_welcome_email", task)

    admin = InscripcionAdmin(Inscripcion, admin_site)
    admin.enviar_mail_bienvenida(
        request,
        Inscripcion.objects.filter(pk=inscripcion.pk),
    )

    inscripcion.refresh_from_db()
    assert inscripcion.cc_email == "default-admin@example.com"
    assert task.calls == [inscripcion.id]


@pytest.mark.django_db
def test_reseller_welcome_admin_action_sets_prompted_cc_before_sending(
    rf,
    admin_site,
    monkeypatch,
):
    inscripcion = InscripcionFactory(cc_email="")
    request = rf.post(
        "/admin/cursos/inscripcion/",
        data={"apply": "1", "cc_email": "reseller-admin@example.com"},
    )
    add_messages_to_request(request)
    task = FakeTask()
    monkeypatch.setattr("cursos.admin.EmailSender.send_reseller_welcome_email", task)

    admin = InscripcionAdmin(Inscripcion, admin_site)
    admin.enviar_mail_bienvenida_reseller(
        request,
        Inscripcion.objects.filter(pk=inscripcion.pk),
    )

    inscripcion.refresh_from_db()
    assert inscripcion.cc_email == "reseller-admin@example.com"
    assert task.calls == [inscripcion.id]


def factura_form_data(curso, **overrides):
    data = {
        "monto_0": "100.00",
        "monto_1": "USD",
        "nombre": "",
        "pais": "AR",
        "tipo_identificacion_fiscal": "",
        "identificacion_fiscal": "",
        "tipo_factura": "",
        "direccion": "",
        "curso": curso.pk,
        "email": "",
        "cc_emails": "",
    }
    data.update(overrides)
    return data


@pytest.mark.django_db
def test_factura_form_copies_blank_billing_data_from_cliente(curso):
    cliente = ClienteFactory(
        nombre="Acme SA",
        email="facturacion@acme.com",
        tipo_identificacion_fiscal="CUIT",
        identificacion_fiscal="30-12345678-9",
    )

    form = FacturaAdminForm(data=factura_form_data(curso, cliente=cliente.pk))

    assert form.is_valid(), form.errors
    factura = form.save()
    assert factura.nombre == "Acme SA"
    assert factura.email == "facturacion@acme.com"
    assert factura.tipo_identificacion_fiscal == "CUIT"
    assert factura.identificacion_fiscal == "30-12345678-9"


@pytest.mark.django_db
def test_factura_form_keeps_explicit_values_over_cliente(curso):
    cliente = ClienteFactory(nombre="Acme SA", email="facturacion@acme.com")

    form = FacturaAdminForm(
        data=factura_form_data(
            curso,
            cliente=cliente.pk,
            nombre="Acme SA - Sucursal Norte",
            email="norte@acme.com",
        ),
    )

    assert form.is_valid(), form.errors
    factura = form.save()
    assert factura.nombre == "Acme SA - Sucursal Norte"
    assert factura.email == "norte@acme.com"


@pytest.mark.django_db
def test_factura_form_still_requires_billing_data_without_cliente(curso):
    form = FacturaAdminForm(data=factura_form_data(curso))

    assert not form.is_valid()
    assert "nombre" in form.errors
    assert "email" in form.errors


@pytest.mark.django_db
def test_factura_form_accepts_manual_billing_data_without_cliente(curso):
    form = FacturaAdminForm(
        data=factura_form_data(curso, nombre="Ana Pérez", email="ana@example.com"),
    )

    assert form.is_valid(), form.errors
    factura = form.save()
    assert factura.cliente is None
    assert factura.email == "ana@example.com"


@pytest.mark.django_db
def test_factura_form_copies_pais_and_direccion_from_cliente_when_blank(curso):
    cliente = ClienteFactory(pais="AR", direccion="Av. Siempre Viva 742")

    form = FacturaAdminForm(
        data=factura_form_data(curso, cliente=cliente.pk, pais="", direccion=""),
    )

    assert form.is_valid(), form.errors
    factura = form.save()
    assert factura.pais == "AR"
    assert factura.direccion == "Av. Siempre Viva 742"


@pytest.mark.django_db
def test_factura_form_still_requires_pais_without_cliente(curso):
    form = FacturaAdminForm(
        data=factura_form_data(
            curso,
            nombre="Ana Pérez",
            email="ana@example.com",
            pais="",
        ),
    )

    assert not form.is_valid()
    assert "pais" in form.errors


@pytest.mark.django_db
def test_factura_form_copies_cc_emails_from_cliente_when_blank(curso):
    cliente = ClienteFactory(cc_emails="ap@acme.com, boss@acme.com")

    form = FacturaAdminForm(
        data=factura_form_data(curso, cliente=cliente.pk, cc_emails=""),
    )

    assert form.is_valid(), form.errors
    factura = form.save()
    assert factura.cc_emails == "ap@acme.com, boss@acme.com"


@pytest.mark.django_db
def test_cliente_billing_data_view_returns_cliente_fields(admin_client):
    cliente = ClienteFactory(
        nombre="Acme SA",
        email="facturacion@acme.com",
        tipo_identificacion_fiscal="CUIT",
        identificacion_fiscal="30-12345678-9",
        pais="AR",
        direccion="Av. Siempre Viva 742",
        cc_emails="ap@acme.com, boss@acme.com",
    )

    url = reverse("admin:cursos_factura_cliente_billing_data", args=[cliente.pk])
    response = admin_client.get(url)

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {
        "nombre": "Acme SA",
        "email": "facturacion@acme.com",
        "tipo_identificacion_fiscal": "CUIT",
        "identificacion_fiscal": "30-12345678-9",
        "pais": "AR",
        "direccion": "Av. Siempre Viva 742",
        "cc_emails": "ap@acme.com, boss@acme.com",
    }


@pytest.mark.django_db
def test_cliente_billing_data_view_404s_for_unknown_cliente(admin_client):
    url = reverse("admin:cursos_factura_cliente_billing_data", args=[999999])

    response = admin_client.get(url)

    assert response.status_code == HTTPStatus.NOT_FOUND


@pytest.mark.django_db
def test_cliente_billing_data_view_requires_staff_login(client):
    cliente = ClienteFactory()
    url = reverse("admin:cursos_factura_cliente_billing_data", args=[cliente.pk])

    response = client.get(url)

    assert response.status_code == HTTPStatus.FOUND
    assert response.url.startswith(reverse("admin:login"))


@pytest.mark.django_db
def test_factura_add_page_cliente_select_exposes_billing_data_url_template(
    admin_client,
):
    url_template = reverse("admin:cursos_factura_cliente_billing_data", args=[0])
    add_url = reverse("admin:cursos_factura_add")

    response = admin_client.get(add_url)
    html = response.content.decode()

    assert f'data-billing-url-template="{url_template}"' in html
