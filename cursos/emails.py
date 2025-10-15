import mimetypes
from datetime import datetime
from datetime import time
from datetime import timedelta
from email.mime.image import MIMEImage
from pathlib import Path

import html2text
import structlog
from celery import shared_task
from django.contrib.staticfiles import finders
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from mjml import mjml2html

from .models import Factura

# Importa tus modelos necesarios
from .models import Inscripcion
from .utils.get_country_name import get_country_name

# Logger a nivel de módulo usando structlog
logger = structlog.get_logger(__name__)


class EmailSender:
    # Constantes a nivel de clase
    LOGO_NEGRO_PATH = "images/logo_negro_180@2x.png"
    LOGO_BLANCO_PATH = "images/logo_blanco_120@2x.png"
    LOGO_NEGRO_CID = "logo_negro"
    LOGO_BLANCO_CID = "logo_blanco"
    DEFAULT_FROM_EMAIL = None  # Usará settings.DEFAULT_FROM_EMAIL

    @staticmethod
    def _attach_logos(email):
        """Adjunta los logos estándar al objeto email."""
        log = logger.bind(method="_attach_logos")
        for logo_path, logo_cid in [
            (EmailSender.LOGO_NEGRO_PATH, EmailSender.LOGO_NEGRO_CID),
            (EmailSender.LOGO_BLANCO_PATH, EmailSender.LOGO_BLANCO_CID),
        ]:
            try:
                image_path_str = finders.find(logo_path)
                if image_path_str:
                    image_path = Path(image_path_str)
                    with image_path.open("rb") as f:
                        logo_mime = MIMEImage(f.read())
                    logo_mime.add_header("Content-ID", f"<{logo_cid}>")
                    logo_mime.add_header(
                        "Content-Disposition",
                        "inline",
                        filename=image_path.name,
                    )
                    email.attach(logo_mime)
                else:
                    log.error("logo_not_found", path=logo_path)
            except FileNotFoundError:
                log.exception("logo_file_not_found", path=image_path_str)
            except Exception:
                log.exception("logo_attach_error", path=logo_path)

    @staticmethod
    def _send_email(  # noqa: PLR0913
        template_name,
        context,
        subject,
        recipient_list,
        attachment_path=None,
        attachment_filename=None,
        attachment_mimetype=None,
    ):
        """
        Método base para renderizar, preparar y enviar un email con MJML.
        """
        log = logger.bind(
            template=template_name,
            subject=subject,
            recipients=recipient_list,
        )

        context["logo_negro_cid"] = EmailSender.LOGO_NEGRO_CID
        context["logo_blanco_cid"] = EmailSender.LOGO_BLANCO_CID

        try:
            # 1. Renderizar MJML a HTML
            mjml_template = render_to_string(template_name, context)
            html_message = mjml2html(
                mjml_template,
                disable_comments=False,
                fonts={
                    "Rubik": "https://fonts.googleapis.com/css?family=Roboto?family=Rubik:300,400,500,700",
                },
            )

            # 2. Crear versión Texto Plano
            text_message = html2text.html2text(html_message)

            # 3. Crear objeto Email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_message,
                from_email=EmailSender.DEFAULT_FROM_EMAIL,
                to=recipient_list,
            )
            email.attach_alternative(html_message, "text/html")

            # 4. Adjuntar Logos
            EmailSender._attach_logos(email)

            # 5. Adjuntar archivo principal (si existe)
            if attachment_path and attachment_filename:
                try:
                    attachment_path_obj = Path(attachment_path)
                    with attachment_path_obj.open("rb") as f:
                        content = f.read()

                    if not attachment_mimetype:
                        mime_type, _ = mimetypes.guess_type(attachment_path)
                        attachment_mimetype = mime_type or "application/octet-stream"

                    email.attach(attachment_filename, content, attachment_mimetype)
                    log.info(
                        "file_attached",
                        filename=attachment_filename,
                        mimetype=attachment_mimetype,
                    )
                except FileNotFoundError:
                    log.exception(
                        "attachment_not_found",
                        path=attachment_path,
                        filename=attachment_filename,
                    )
                except Exception:
                    log.exception(
                        "attachment_error",
                        filename=attachment_filename,
                        path=attachment_path,
                    )

            # 6. Enviar Email
            email.send(fail_silently=False)
            log.info("email_sent_successfully")

        except Exception:
            log.exception("email_send_failed")
            raise

    # --- Métodos Públicos (Tareas Celery) ---

    @staticmethod
    @shared_task
    def send_welcome_email(inscripcion_id):
        """
        Envía el email de bienvenida para una inscripción específica.
        """
        log = logger.bind(task="send_welcome_email", inscripcion_id=inscripcion_id)
        try:
            inscripcion = Inscripcion.objects.select_related(
                "alumno",
                "curso",
                "curso__tipo",
            ).get(id=inscripcion_id)
        except Inscripcion.DoesNotExist:
            log.warning("inscripcion_not_found")
            return

        fecha_fin = inscripcion.curso.fecha + timedelta(
            days=inscripcion.curso.cantidad_dias - 1,
        )

        curso = inscripcion.curso
        argentina_start = curso.hora_inicio
        argentina_end = curso.hora_fin
        delta = timedelta(hours=3)
        mexico_start = (datetime.combine(curso.fecha, argentina_start) - delta).time()
        mexico_end = (datetime.combine(curso.fecha, argentina_end) - delta).time()

        jueves_inicio_argentina = time(17, 0)
        jueves_fin_argentina = time(20, 30)
        jueves_inicio_mexico = (
            datetime.combine(curso.fecha, jueves_inicio_argentina) - delta
        ).time()
        jueves_fin_mexico = (
            datetime.combine(curso.fecha, jueves_fin_argentina) - delta
        ).time()

        context = {
            "alumno": inscripcion.alumno,
            "curso": curso,
            "monto": inscripcion.monto,
            "procesador_pago": inscripcion.get_procesador_pago_display(),
            "fecha_fin": fecha_fin,
            "hora_inicio_argentina": argentina_start,
            "hora_fin_argentina": argentina_end,
            "hora_inicio_mexico": mexico_start,
            "hora_fin_mexico": mexico_end,
            "jueves_inicio_argentina": jueves_inicio_argentina,
            "jueves_fin_argentina": jueves_fin_argentina,
            "jueves_inicio_mexico": jueves_inicio_mexico,
            "jueves_fin_mexico": jueves_fin_mexico,
        }

        subject = (
            f"Confirmación de inscripción - {inscripcion.curso.tipo.nombre_completo} "
            f"- {inscripcion.curso.fecha.strftime('%d/%m/%Y')}"
        )
        recipient_list = [inscripcion.alumno.email]
        log = log.bind(subject=subject, recipients=recipient_list)

        try:
            EmailSender._send_email(
                template_name="emails/welcome.mjml",
                context=context,
                subject=subject,
                recipient_list=recipient_list,
            )
            inscripcion.se_envio_mail_bienvenida = True
            inscripcion.save(update_fields=["se_envio_mail_bienvenida"])
            log.info("welcome_email_sent_and_status_updated")

        # Captura genérica justificada en tareas Celery
        # para loguear antes del reintento/fallo.
        except Exception:
            log.exception("task_failed_exception_in_send_email")

    @staticmethod
    @shared_task
    def send_invoice_email(factura_id):
        """
        Envía el email con la factura adjunta.
        """
        log = logger.bind(task="send_invoice_email", factura_id=factura_id)
        try:
            factura = Factura.objects.select_related("curso", "curso__tipo").get(
                id=factura_id,
            )
            inscripciones = Inscripcion.objects.filter(factura=factura).select_related(
                "alumno",
            )
        except Factura.DoesNotExist:
            log.warning("factura_not_found")
            return

        attachment_path = None
        attachment_filename = None
        attachment_mimetype = "application/pdf"

        if factura.archivo_pdf and factura.archivo_pdf.name:
            try:
                attachment_path = factura.archivo_pdf.path
                attachment_filename = Path(factura.archivo_pdf.name).name
                # Línea de log acortada
                log.info(
                    "invoice_pdf_details_prepared",
                    path=attachment_path,
                    filename=attachment_filename,
                )
            except FileNotFoundError:
                log.exception(
                    "invoice_pdf_file_not_found",
                    expected_path=getattr(factura.archivo_pdf, "path", "N/A"),
                )
                attachment_path = None
                attachment_filename = None
            except ValueError:
                # Línea de log acortada con comentario
                log.exception("invoice_pdf_value_error")  # e.g., Name but no file
                attachment_path = None
                attachment_filename = None

        context = {
            "factura": factura,
            "inscripciones": inscripciones,
            "nombre_pais": get_country_name(factura.pais),
        }

        subject = (
            f"Factura por Servicios Educativos - {factura.curso.tipo.nombre_corto}"
            f" - {factura.curso.fecha.strftime('%d/%m/%Y')}"
        )
        recipient_list = [factura.email]
        log = log.bind(subject=subject, recipients=recipient_list)

        try:
            EmailSender._send_email(
                template_name="emails/invoice.mjml",
                context=context,
                subject=subject,
                recipient_list=recipient_list,
                attachment_path=attachment_path if attachment_filename else None,
                attachment_filename=attachment_filename,
                attachment_mimetype=attachment_mimetype,
            )
            factura.se_envio_mail_facturacion = True
            factura.save(update_fields=["se_envio_mail_facturacion"])
            log.info("invoice_email_sent_and_status_updated")

        # Captura genérica justificada en tareas Celery (BLE001)
        except Exception:
            log.exception("task_failed_exception_in_send_email")
