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
        fields = "__all__"


class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["hora_fin"] = format(instance.hora_fin, "%H:%M")
        representation["hora_inicio"] = format(instance.hora_inicio, "%H:%M")
        return representation


class TipoCursoSerializer(serializers.ModelSerializer):
    faq_entries = FAQCursoSerializer(source="faqcurso_set", many=True)
    upcoming_courses = serializers.SerializerMethodField()

    class Meta:
        model = TipoCurso
        fields = "__all__"

    def get_upcoming_courses(self, obj):
        # Filter the courses that have a future date
        upcoming_courses = obj.curso_set.filter(
            fecha__gt=datetime.now(tz=pytz.timezone(settings.TIME_ZONE)),
        ).order_by("tipo__orden")
        # Serialize the filtered courses
        return CursoSerializer(upcoming_courses, many=True).data
