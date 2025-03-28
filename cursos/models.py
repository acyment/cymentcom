from datetime import time

from django.db import models
from djmoney.models.fields import MoneyField


class TipoCurso(models.Model):
    nombre_corto = models.CharField(max_length=10)
    nombre_completo = models.CharField(max_length=60)
    resumen_una_linea = models.CharField(max_length=60)
    resumen = models.CharField(max_length=200)
    contenido = models.TextField()
    contenido_corto = models.TextField()
    video = models.CharField(max_length=50)
    foto = models.CharField(max_length=50)
    foto_tint = models.CharField(max_length=50)
    orden = models.IntegerField(unique=True)
    costo_usd = MoneyField(
        max_digits=14,
        decimal_places=2,
        default_currency="USD",
        default=855,
    )
    costo_ars = MoneyField(max_digits=14, decimal_places=2, default_currency="ARS")
    costo_sin_descuento_ars = MoneyField(
        max_digits=14,
        decimal_places=2,
        default_currency="ARS",
    )
    stripe_price_id = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name_plural = "Tipos de curso"

    def __str__(self):
        return self.nombre_corto


class FAQCurso(models.Model):
    tipo_curso = models.ForeignKey(TipoCurso, on_delete=models.CASCADE)
    pregunta = models.CharField(max_length=200)
    respuesta = models.TextField()

    def __str__(self):
        return f"{self.pregunta}"


class CursoModalidad(models.TextChoices):
    VIRTUAL = "VIRTUAL", "Virtual"
    PRESENCIAL = "PRESENCIAL", "Presencial"


class Curso(models.Model):
    tipo = models.ForeignKey(TipoCurso, on_delete=models.CASCADE)
    fecha = models.DateField()
    cantidad_dias = models.IntegerField(default=5)
    hora_inicio = models.TimeField(default=time(10, 0))
    hora_fin = models.TimeField(default=time(13, 30))
    modalidad = models.CharField(
        max_length=10,
        choices=CursoModalidad.choices,
        default=CursoModalidad.VIRTUAL,
    )
    meeting_url = models.URLField(blank=True)
    meeting_id = models.CharField(max_length=100, blank=True)
    meeting_password = models.CharField(max_length=100, blank=True)
    whiteboard_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.tipo} - {self.fecha}"

    def save(self, *args, **kwargs):
        if self.meeting_url is None:
            self.meeting_url = ""
        if self.whiteboard_url is None:
            self.whiteboard_url = ""

        # Call the "real" save() method
        super().save(*args, **kwargs)


class Alumno(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField()
    organizacion = models.CharField(max_length=100, blank=True)
    rol = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

    def save(self, *args, **kwargs):
        if self.organizacion is None:
            self.organizacion = ""
        if self.rol is None:
            self.rol = ""

        # Call the "real" save() method
        super().save(*args, **kwargs)


class ProcesadorPago(models.TextChoices):
    MP = "MP", "MercadoPago"
    STRIPE = "STRIPE", "Stripe"


class EstadoInscripcion(models.TextChoices):
    RESERVA = "RESERVA", "Reserva"
    PENDIENTE = "PENDIENTE", "Pendiente"
    RECHAZADO = "RECHAZADO", "Rechazado"
    ACEPTADO = "ACEPTADO", "Aceptado"


class Factura(models.Model):
    monto = MoneyField(max_digits=14, decimal_places=2, default_currency="USD")
    nombre = models.CharField(max_length=100)
    organizacion = models.CharField(max_length=100, blank=True)
    pais = models.CharField(max_length=40)
    identificacion_fiscal = models.CharField(max_length=100, blank=True)
    direccion = models.CharField(max_length=200, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=100, blank=True)
    codigo_postal = models.CharField(max_length=15, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    confeccionada = models.BooleanField(default=False)
    pagada = models.BooleanField(default=False)
    email = models.EmailField()

    def __str__(self):
        return f"{self.nombre} - {self.curso}"

    def save(self, *args, **kwargs):
        if self.identificacion_fiscal is None:
            self.identificacion_fiscal = ""
        if self.organizacion is None:
            self.organizacion = ""
        if self.direccion is None:
            self.direccion = ""
        if self.ciudad is None:
            self.ciudad = ""
        if self.estado is None:
            self.estado = ""
        if self.codigo_postal is None:
            self.codigo_postal = ""
        if self.telefono is None:
            self.telefono = ""

        # Call the "real" save() method
        super().save(*args, **kwargs)


class Inscripcion(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    monto = MoneyField(max_digits=14, decimal_places=2, default_currency="USD")
    procesador_pago = models.CharField(max_length=6, choices=ProcesadorPago.choices)
    estado = models.CharField(max_length=9, choices=EstadoInscripcion.choices)
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name_plural = "Inscripciones"

    def __str__(self):
        return f"{self.alumno} - {self.curso}"
