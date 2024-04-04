from django.db import models
from djmoney.models.fields import MoneyField


class CursoTipo(models.TextChoices):
    CSM = "CSM", "CSM"
    CSPO = "CSPO", "CSPO"
    LeSS = "LeSS", "LeSS"


class CursoModalidad(models.TextChoices):
    VIRTUAL = "VIRTUAL", "Virtual"
    PRESENCIAL = "PRESENCIAL", "Presencial"


class Cursos(models.Model):
    tipo = models.CharField(max_length=5, choices=CursoTipo.choices)
    fecha = models.DateField()
    costo = MoneyField(max_digits=14, decimal_places=2, default_currency="USD")
    costo_ars = MoneyField(max_digits=14, decimal_places=2, default_currency="ARS")
    modalidad = models.CharField(max_length=10, choices=CursoModalidad.choices)

    def __str__(self):
        return self.name


class Alumnos(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.name


class Procesador(models.TextChoices):
    MP = "MP", "MercadoPago"
    STRIPE = "STRIPE", "Stripe"


class Estado(models.TextChoices):
    RESERVA = "RESERVA", "Reserva"
    PENDIENTE = "PENDIENTE", "Pendiente"
    RECHAZADO = "RECHAZADO", "Rechazado"
    ACEPTADO = "ACEPTADO", "Aceptado"


class Inscripciones(models.Model):
    alumno = models.ForeignKey(Alumnos, on_delete=models.CASCADE)
    curso = models.ForeignKey(Cursos, on_delete=models.CASCADE)
    monto = MoneyField(max_digits=14, decimal_places=2, default_currency="USD")
    procesador = models.CharField(max_length=6, choices=Procesador.choices)
    estado = models.CharField(max_length=9, choices=Estado.choices)

    def __str__(self):
        return self.name
