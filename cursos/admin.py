from django.contrib import admin
from django.contrib import messages

# Removed: from django.utils.safestring import mark_safe
# Added:
from django.utils.html import format_html

from .emails import EmailSender
from .models import Alumno
from .models import Cliente
from .models import Curso
from .models import Factura
from .models import FAQCurso
from .models import Inscripcion
from .models import TipoCurso


class EmailActionMixin:
    def email_action(self, request, queryset, config):
        """
        Performs an email sending action on a queryset.

        Args:
            request: The HttpRequest object.
            queryset: The queryset to process.
            config (dict): A dictionary containing action parameters:
                'field' (str): Boolean field indicating if email was sent.
                'task' (callable): Celery task/function to send the email.
                'warning_msg' (str): Template for already sent emails.
                'success_msg' (str): Template for successfully queued emails.
        """
        field = config["field"]
        task = config["task"]
        warning_msg = config["warning_msg"]
        success_msg = config["success_msg"]

        for obj in queryset:
            if getattr(obj, field):
                messages.warning(request, warning_msg % obj)
            else:
                task.delay(obj.id)
                messages.success(request, success_msg % obj)


@admin.register(Inscripcion)
class InscripcionAdmin(EmailActionMixin, admin.ModelAdmin):
    list_display = ("alumno", "curso", "estado", "se_envio_mail_bienvenida")
    actions = ["enviar_mail_bienvenida"]

    @admin.action(
        description="Enviar mail de bienvenida",
    )
    def enviar_mail_bienvenida(self, request, queryset):
        email_config = {
            "field": "se_envio_mail_bienvenida",
            "task": EmailSender.send_welcome_email,
            "warning_msg": "Ya se había enviado el mail de bienvenida a %s",
            "success_msg": "Enviando mail de bienvenida a %s...",
        }
        self.email_action(request, queryset, email_config)


@admin.register(Factura)
class FacturaAdmin(EmailActionMixin, admin.ModelAdmin):
    list_display = (
        "nombre",
        "curso",
        "archivo_pdf_link",
        "se_envio_mail_facturacion",
        "pagada",
    )
    # No readonly_fields needed now
    actions = ["enviar_mail_facturacion"]

    @admin.action(
        description="Enviar mail de facturación",
    )
    def enviar_mail_facturacion(self, request, queryset):
        email_config = {
            "field": "se_envio_mail_facturacion",
            "task": EmailSender.send_invoice_email,
            "warning_msg": "Ya se había enviado el mail de facturación a %s",
            "success_msg": "Enviando mail de facturación a %s...",
        }
        self.email_action(request, queryset, email_config)

    @admin.display(
        description="PDF",
    )
    def archivo_pdf_link(self, obj):
        if obj.archivo_pdf:
            # Use format_html instead of mark_safe
            # The first argument is the format string (HTML structure)
            # Subsequent arguments are values to insert into placeholders {}
            # format_html automatically escapes the arguments (obj.archivo_pdf.url)
            return format_html(
                '<a href="{}" target="_blank">Descargar PDF</a>',
                obj.archivo_pdf.url,
            )
        return "Sin archivo"

    # Ensure allow_tags is not needed (it's deprecated, format_html handles it)


admin.site.register(Alumno)
admin.site.register(Cliente)
admin.site.register(Curso)
admin.site.register(TipoCurso)
admin.site.register(FAQCurso)
