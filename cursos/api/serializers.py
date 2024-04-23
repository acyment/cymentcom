from datetime import datetime

import pytz
from django.conf import settings
from rest_framework import serializers

from cursos.models import Curso
from cursos.models import FAQCurso
from cursos.models import TipoCurso


class FAQCursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQCurso
        fields = ["pregunta", "respuesta"]


class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = [
            "fecha",
            "cantidad_dias",
            "hora_inicio",
            "hora_fin",
            "costo_usd",
            "costo_ars",
            "modalidad",
            "url_videoconferencia",
            "url_whiteboard",
        ]


class TipoCursoSerializer(serializers.ModelSerializer):
    faq_entries = FAQCursoSerializer(source="faqcurso_set", many=True)
    upcoming_courses = serializers.SerializerMethodField()

    class Meta:
        model = TipoCurso
        fields = [
            "nombre_corto",
            "nombre_completo",
            "resumen_una_linea",
            "resumen",
            "contenido",
            "contenido_corto",
            "video",
            "foto",
            "foto_tint",
            "faq_entries",
            "upcoming_courses",
        ]

    def get_upcoming_courses(self, obj):
        # Filter the courses that have a future date
        upcoming_courses = obj.curso_set.filter(
            fecha__gt=datetime.now(tz=pytz.timezone(settings.TIME_ZONE)),
        )
        # Serialize the filtered courses
        return CursoSerializer(upcoming_courses, many=True).data
