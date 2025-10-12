from __future__ import annotations

import copy

from django.db import migrations


def copy_first_module(apps, schema_editor):
    TipoCurso = apps.get_model("cursos", "TipoCurso")

    try:
        csm = TipoCurso.objects.get(nombre_corto="CSM")
        cspo = TipoCurso.objects.get(nombre_corto="CSPO")
    except TipoCurso.DoesNotExist:
        return

    csm_contenido = copy.deepcopy(csm.contenido or [])
    if not csm_contenido:
        return

    cspo_contenido = copy.deepcopy(cspo.contenido or [])
    first_module = csm_contenido[0]

    if cspo_contenido:
        cspo_contenido[0] = first_module
    else:
        cspo_contenido = [first_module]

    TipoCurso.objects.filter(pk=cspo.pk).update(contenido=cspo_contenido)


class Migration(migrations.Migration):

    dependencies = [
        ("cursos", "0024_normalize_contenido_lessons"),
    ]

    operations = [
        migrations.RunPython(copy_first_module, migrations.RunPython.noop),
    ]
