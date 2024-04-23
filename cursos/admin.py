from django.contrib import admin

from .models import Alumno
from .models import Curso
from .models import Factura
from .models import FAQCurso
from .models import Inscripcion
from .models import TipoCurso


@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)
    fieldsets = (
        (
            None,
            {"fields": ("id", "tipo", "fecha", "costo_usd", "costo_ars", "modalidad")},
        ),
    )


admin.site.register(Alumno)
admin.site.register(Inscripcion)
admin.site.register(Factura)
admin.site.register(TipoCurso)
admin.site.register(FAQCurso)
