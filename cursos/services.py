"""Domain services for the cursos app."""

from __future__ import annotations

import copy
from collections.abc import MutableMapping

from django.db import transaction

from .models import TipoCurso

ContenidoType = list[MutableMapping[str, object]]


@transaction.atomic
def sync_cspo_first_module() -> None:
    """Replace CSPO's first módulo with the first módulo from CSM.

    Keeps all remaining módulos intact and exits silently if either curso
    is missing or lacks contenido.
    """

    try:
        csm = TipoCurso.objects.get(nombre_corto="CSM")
        cspo = TipoCurso.objects.get(nombre_corto="CSPO")
    except TipoCurso.DoesNotExist:
        return

    csm_contenido: ContenidoType = copy.deepcopy(csm.contenido or [])
    if not csm_contenido:
        return

    cspo_contenido: ContenidoType = copy.deepcopy(cspo.contenido or [])
    first_module = csm_contenido[0]

    if cspo_contenido:
        cspo_contenido[0] = first_module
    else:
        cspo_contenido = [first_module]

    TipoCurso.objects.filter(pk=cspo.pk).update(contenido=cspo_contenido)
