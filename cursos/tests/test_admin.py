import pytest
from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory
from django_json_widget.widgets import JSONEditorWidget
from django_jsonform.widgets import JSONFormWidget

from cursos.admin import TipoCursoAdmin
from cursos.models import TipoCurso


@pytest.fixture
def admin_site():
    return AdminSite()


@pytest.fixture
def rf():
    return RequestFactory()


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
