from django.contrib import admin
from django.contrib import messages

from .models import Alumno
from .models import Curso
from .models import Factura
from .models import FAQCurso
from .models import Inscripcion
from .models import TipoCurso
from .emails import EmailSender

class InscripcionAdmin(admin.ModelAdmin):
    list_display = ('alumno', 'curso', 'estado', 'se_envio_mail_bienvenida')
    actions = ['enviar_mail_bienvenida']

    def enviar_mail_bienvenida(self, request, queryset):
        for inscripcion in queryset:
            if inscripcion.se_envio_mail_bienvenida:
                messages.warning(request, f"Ya se había enviado el mail de bienvenida a {inscripcion}")
            else:
                EmailSender.send_welcome_email.delay(inscripcion.id)
                messages.success(request, f"Enviando mail de bienvenida a {inscripcion}...")
    
    enviar_mail_bienvenida.short_description = "Enviar mail de bienvenida"

admin.site.register(Alumno)
admin.site.register(Curso)
admin.site.register(Inscripcion, InscripcionAdmin)
admin.site.register(Factura)
admin.site.register(TipoCurso)
admin.site.register(FAQCurso)
