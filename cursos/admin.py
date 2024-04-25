from django.contrib import admin

from .models import Alumno
from .models import Curso
from .models import Factura
from .models import FAQCurso
from .models import Inscripcion
from .models import TipoCurso

admin.site.register(Alumno)
admin.site.register(Curso)
admin.site.register(Inscripcion)
admin.site.register(Factura)
admin.site.register(TipoCurso)
admin.site.register(FAQCurso)
