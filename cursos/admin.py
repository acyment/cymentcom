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


class EmailActionMixin:
    def email_action(self, request, queryset, field, task, warning_msg, success_msg):
        for obj in queryset:
            if getattr(obj, field):
                messages.warning(request, warning_msg % obj)
            else:
                task.delay(obj.id)
                messages.success(request, success_msg % obj)

class InscripcionAdmin(EmailActionMixin, admin.ModelAdmin):
    list_display = ('alumno', 'curso', 'estado', 'se_envio_mail_bienvenida')
    actions = ['enviar_mail_bienvenida']

    def enviar_mail_bienvenida(self, request, queryset):
        self.email_action(
            request, queryset,
            field='se_envio_mail_bienvenida',
            task=EmailSender.send_welcome_email,
            warning_msg="Ya se había enviado el mail de bienvenida a %s",
            success_msg="Enviando mail de bienvenida a %s..."
        )
    
    enviar_mail_bienvenida.short_description = "Enviar mail de bienvenida"

class FacturaAdmin(EmailActionMixin, admin.ModelAdmin):
    list_display = ('nombre', 'curso', 'archivo_pdf_link', 'confeccionada', 'pagada')
    readonly_fields = ('archivo_pdf_preview',)
    actions = ['enviar_mail_facturacion']
    
    def enviar_mail_facturacion(self, request, queryset):
        self.email_action(
            request, queryset,
            field='se_envio_mail_facturacion',
            task=EmailSender.send_invoice_email,
            warning_msg="Ya se había enviado el mail de facturación a %s",
            success_msg="Enviando mail de facturación a %s..."
        )
    
    enviar_mail_facturacion.short_description = "Enviar mail de facturación"
    
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
