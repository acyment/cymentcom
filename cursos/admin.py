from django.contrib import admin
from django.contrib import messages
from django.db import models
from django.utils.html import format_html
from django_json_widget.widgets import JSONEditorWidget
from django_jsonform.widgets import JSONFormWidget

from .emails import EmailSender
from .models import Alumno
from .models import Cliente
from .models import Curso
from .models import Factura
from .models import FAQCurso
from .models import Inscripcion
from .models import TipoCurso

COURSE_TEMARIO_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Esquema del Temario del Curso (Híbrido)",
    "description": (
        "Temario de 3 niveles donde la descripción de la lección es opcional."
    ),
    "type": "array",
    "items": {
        "type": "object",
        "title": "Módulo",
        "required": ["module_title", "summary", "topics"],
        "properties": {
            "module_title": {
                "type": "string",
                "title": "Título del Módulo",
            },
            "summary": {
                "type": "string",
                "title": "Resumen del Módulo",
                "widget": "textarea",
            },
            "topics": {
                "type": "array",
                "title": "Temas del Módulo",
                "items": {
                    "type": "object",
                    "title": "Tema",
                    "required": ["topic_title", "lessons"],
                    "properties": {
                        "topic_title": {
                            "type": "string",
                            "title": "Título del Tema",
                        },
                        "lessons": {
                            "type": "array",
                            "title": "Lecciones",
                            "items": {
                                "type": "object",
                                "title": "Lección",
                                "required": ["title"],
                                "properties": {
                                    "title": {
                                        "type": "string",
                                        "title": "Título de la Lección",
                                    },
                                    "description": {
                                        "type": "string",
                                        "title": "Descripción Detallada (Opcional)",
                                        "widget": "textarea",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
}


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


@admin.register(TipoCurso)
class TipoCursoAdmin(admin.ModelAdmin):
    list_display = (
        "nombre_corto",
        "nombre_completo",
        "orden",
    )
    search_fields = ("nombre_corto", "nombre_completo")
    formfield_overrides = {
        models.JSONField: {
            "widget": JSONFormWidget(schema=COURSE_TEMARIO_SCHEMA),
        },
    }
    change_form_template = "admin/cursos/tipocurso/change_form.html"

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        contenido_field = form.base_fields.get("contenido")
        if not contenido_field:
            return form

        if request.GET.get("json_view") == "raw":
            contenido_field.widget = JSONEditorWidget()
        else:
            contenido_field.widget = JSONFormWidget(schema=COURSE_TEMARIO_SCHEMA)

        return form

    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        extra_context = extra_context or {}
        is_raw_view = request.GET.get("json_view") == "raw"

        params = request.GET.copy()
        if is_raw_view:
            params.pop("json_view", None)
            toggle_label = "Volver al editor estructurado"
        else:
            params["json_view"] = "raw"
            toggle_label = "Editar JSON crudo"

        toggle_query = params.urlencode()
        toggle_url = request.path
        if toggle_query:
            toggle_url = f"{toggle_url}?{toggle_query}"

        extra_context.update(
            {
                "is_raw_json_view": is_raw_view,
                "json_toggle_url": toggle_url,
                "json_toggle_label": toggle_label,
            },
        )

        return super().changeform_view(
            request,
            object_id=object_id,
            form_url=form_url,
            extra_context=extra_context,
        )


admin.site.register(Alumno)
admin.site.register(Cliente)
admin.site.register(Curso)
admin.site.register(FAQCurso)
