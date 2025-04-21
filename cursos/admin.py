from django.contrib import admin
from django.contrib import messages
from django.utils.safestring import mark_safe

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

class FacturaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'curso', 'archivo_pdf_link', 'confeccionada', 'pagada')
    readonly_fields = ('archivo_pdf_preview',)
    
    def archivo_pdf_link(self, obj):
        if obj.archivo_pdf:
            return mark_safe(f'<a href="{obj.archivo_pdf.url}" target="_blank">Descargar PDF</a>')
        return "Sin archivo"
    archivo_pdf_link.short_description = "PDF"
    
    def archivo_pdf_preview(self, obj):
        if obj.archivo_pdf:
            return mark_safe(f'''
                <iframe src="{obj.archivo_pdf.url}" 
                        style="width: 100%; height: 600px;" 
                        frameborder="0"></iframe>
                <a href="{obj.archivo_pdf.url}" 
                   download 
                   class="button">
                   Descargar PDF
                </a>
            ''')
        return "No hay PDF adjunto"
    archivo_pdf_preview.short_description = "Vista previa"

admin.site.register(Alumno)
admin.site.register(Curso)
admin.site.register(Inscripcion, InscripcionAdmin)
admin.site.register(Factura, FacturaAdmin)
admin.site.register(TipoCurso)
admin.site.register(FAQCurso)
