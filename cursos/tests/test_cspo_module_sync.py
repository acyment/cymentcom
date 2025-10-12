import copy
import json
from pathlib import Path

import pytest

from cursos.models import TipoCurso
from cursos.services import sync_cspo_first_module
from cursos.tests.factories import TipoCursoFactory


def test_fixture_aligned_with_csm_first_module(settings):
    fixture_path = Path(settings.BASE_DIR) / "fixture_cursos.json"
    data = json.loads(fixture_path.read_text())

    def find(nombre_corto):
        for item in data:
            if item["fields"]["nombre_corto"] == nombre_corto:
                return item["fields"]
        message = f"TipoCurso {nombre_corto} no encontrado en fixture"
        raise AssertionError(message)

    csm_module = find("CSM")["contenido"][0]
    cspo_module = find("CSPO")["contenido"][0]

    assert csm_module == cspo_module


@pytest.mark.django_db
def test_sync_cspo_first_module_copies_first_entry_and_preserves_rest():
    csm_first_module = {
        "module_title": "Nuevo módulo",
        "summary": "Resumen inicial",
        "topics": [
            {
                "topic_title": "Tema A",
                "lessons": [
                    {"title": "Lección 1", "description": "Detalle 1"},
                    {"title": "Lección 2", "description": "Detalle 2"},
                ],
            },
        ],
    }
    csm_extra_module = {"module_title": "Extra CSM", "summary": "", "topics": []}

    TipoCursoFactory(
        nombre_corto="CSM",
        orden=1,
        contenido=[copy.deepcopy(csm_first_module), csm_extra_module],
    )

    original_first_cspo_module = {
        "module_title": "Antiguo módulo",
        "summary": "",
        "topics": [],
    }
    preserved_cspo_modules = [
        {"module_title": "Debe mantenerse", "summary": "", "topics": []},
        {"module_title": "Otra sección", "summary": "", "topics": []},
    ]

    TipoCursoFactory(
        nombre_corto="CSPO",
        orden=2,
        contenido=[original_first_cspo_module, *preserved_cspo_modules],
    )

    sync_cspo_first_module()

    csm = TipoCurso.objects.get(nombre_corto="CSM")
    cspo = TipoCurso.objects.get(nombre_corto="CSPO")

    assert csm.contenido == [csm_first_module, csm_extra_module]
    assert cspo.contenido[0] == csm_first_module
    assert cspo.contenido[1:] == preserved_cspo_modules
