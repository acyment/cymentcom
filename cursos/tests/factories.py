import datetime
from decimal import Decimal

from djmoney.money import Money
from factory import Faker
from factory import LazyAttribute
from factory import Sequence
from factory import SubFactory
from factory.django import DjangoModelFactory

from cursos.models import Alumno
from cursos.models import Cliente
from cursos.models import Curso
from cursos.models import EstadoInscripcion
from cursos.models import Factura
from cursos.models import Inscripcion
from cursos.models import ProcesadorPago
from cursos.models import TipoCurso


class TipoCursoFactory(DjangoModelFactory):
    nombre_corto = Faker("lexify", text="??????")
    # `text` respeta max_nb_chars; `sentence` no, y desbordaba el max_length=60.
    nombre_completo = Faker("text", max_nb_chars=60)
    resumen_una_linea = Faker("text", max_nb_chars=60)
    resumen = Faker("text", max_nb_chars=100)
    contenido = LazyAttribute(
        lambda _: [
            {
                "module_title": "Módulo 1",
                "summary": "Resumen breve",
                "topics": [
                    {
                        "topic_title": "Tema Introductorio",
                        "lessons": [
                            {"title": "Introducción", "description": ""},
                            {"title": "Dinámica", "description": ""},
                        ],
                    },
                ],
            },
        ],
    )
    video = ""
    foto = ""
    foto_tint = ""
    # orden es unique: se numera solo para poder crear varios tipos en un test.
    # Arranca en 100 para no chocar con los tests que fijan orden a mano (1, 2...).
    orden = Sequence(lambda n: n + 100)
    url_logo = ""
    costo_usd = LazyAttribute(lambda _: Money(Decimal("99.99"), "USD"))
    costo_sin_descuento_usd = LazyAttribute(lambda _: Money(Decimal("120.00"), "USD"))
    costo_ars = LazyAttribute(lambda _: Money(Decimal("85000.00"), "ARS"))
    costo_sin_descuento_ars = LazyAttribute(
        lambda _: Money(Decimal("100000.00"), "ARS"),
    )
    stripe_price_id = "price_123"

    class Meta:
        model = TipoCurso


class CursoFactory(DjangoModelFactory):
    tipo = SubFactory(TipoCursoFactory)
    fecha = LazyAttribute(lambda _: datetime.datetime.now(datetime.UTC).date())

    class Meta:
        model = Curso


class AlumnoFactory(DjangoModelFactory):
    nombre = Faker("first_name")
    apellido = Faker("last_name")
    email = Faker("email")
    organizacion = ""
    rol = ""

    class Meta:
        model = Alumno


class ClienteFactory(DjangoModelFactory):
    nombre = Faker("company")
    tipo_identificacion_fiscal = "CUIT"
    identificacion_fiscal = Faker("numerify", text="30-########-#")
    email = Faker("email")
    ciclo_de_pago = 0
    notas = ""

    class Meta:
        model = Cliente


class FacturaFactory(DjangoModelFactory):
    curso = SubFactory(CursoFactory)
    monto = LazyAttribute(lambda obj: Money(obj.curso.tipo.costo_usd.amount, "USD"))
    nombre = Faker("name")
    pais = "AR"
    email = Faker("email")

    class Meta:
        model = Factura


class InscripcionFactory(DjangoModelFactory):
    alumno = SubFactory(AlumnoFactory)
    curso = SubFactory(CursoFactory)
    monto = LazyAttribute(lambda obj: Money(obj.curso.tipo.costo_usd.amount, "USD"))
    procesador_pago = ProcesadorPago.STRIPE
    estado = EstadoInscripcion.PENDIENTE
    factura = None
    cc_email = ""

    class Meta:
        model = Inscripcion
