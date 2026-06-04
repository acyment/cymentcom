"""Domain services for the cursos app."""

from __future__ import annotations

import copy
import csv
from collections.abc import MutableMapping
from dataclasses import dataclass
from io import StringIO

from django.db import transaction

from .models import Alumno
from .models import EstadoInscripcion
from .models import Factura
from .models import Inscripcion
from .models import ProcesadorPago
from .models import TipoCurso

ContenidoType = list[MutableMapping[str, object]]


@dataclass(frozen=True)
class AltaBatchRevendedorResult:
    created_alumnos: int
    reused_alumnos: int


@transaction.atomic
def alta_batch_revendedor(
    curso,
    alumnos_text,
    monto,
    email_facturacion,
    pais_facturacion,
):
    factura = _create_batch_factura(curso, monto, email_facturacion, pais_facturacion)
    counts = {"created": 0, "reused": 0}
    for apellido, nombre, email in _parse_batch_alumnos(alumnos_text):
        alumno, created = _get_or_create_alumno(apellido, nombre, email)
        counts["created" if created else "reused"] += 1
        _create_batch_inscripcion(curso, alumno, monto, factura)
    return AltaBatchRevendedorResult(counts["created"], counts["reused"])


def _create_batch_factura(curso, monto, email_facturacion, pais_facturacion):
    return Factura.objects.create(
        monto=monto,
        nombre="Alta batch de revendedor",
        pais=pais_facturacion,
        curso=curso,
        email=email_facturacion,
    )


def _parse_batch_alumnos(alumnos_text):
    rows = csv.reader(StringIO(alumnos_text), delimiter="\t")
    return [_clean_alumno_row(row) for row in rows if _has_values(row)]


def _has_values(row):
    return any(value.strip() for value in row)


def _clean_alumno_row(row):
    if len(row) != 3:
        msg = "Cada fila debe tener apellido, nombre y email."
        raise ValueError(msg)
    return tuple(value.strip() for value in row)


def _get_or_create_alumno(apellido, nombre, email):
    alumno = Alumno.objects.filter(email__iexact=email).first()
    if alumno:
        return alumno, False
    return Alumno.objects.create(apellido=apellido, nombre=nombre, email=email), True


def _create_batch_inscripcion(curso, alumno, monto, factura):
    return Inscripcion.objects.create(
        alumno=alumno,
        curso=curso,
        monto=monto,
        procesador_pago=ProcesadorPago.TRANSFERENCIA,
        estado=EstadoInscripcion.ACEPTADO,
        factura=factura,
    )


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
