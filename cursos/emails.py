import logging
from datetime import timedelta
from email.mime.image import MIMEImage
from pathlib import Path

import html2text
from celery import shared_task
from django.contrib.staticfiles import finders
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from mjml import mjml2html

# Define paths for both logos
LOGO_NEGRO_PATH = "images/logo_negro_180@2x.png"
LOGO_BLANCO_PATH = "images/logo_blanco_120@2x.png"  # Adjust if your path is different


class EmailSender:
    @staticmethod
    @shared_task
    def send_welcome_email(inscripcion):
        logger = logging.getLogger(__name__)

        logo_negro_cid = "logo_negro"  # Unique Content-ID for the black logo
        logo_blanco_cid = "logo_blanco"  # Unique Content-ID for the white logo

        fecha_fin = inscripcion.curso.fecha + timedelta(
            days=inscripcion.curso.cantidad_dias,
        )

        context = {
            "alumno": inscripcion.alumno,
            "curso": inscripcion.curso,
            "monto": inscripcion.monto,
            "procesador_pago": inscripcion.get_procesador_pago_display(),
            "fecha_fin": fecha_fin,
            "logo_negro_cid": logo_negro_cid,  # Pass the CIDs to the template
            "logo_blanco_cid": logo_blanco_cid,
        }

        # Render MJML template to HTML
        mjml_template = render_to_string("emails/welcome.mjml", context)
        html_message = mjml2html(
            mjml_template,
            disable_comments=False,
            fonts={
                "Rubik": "https://fonts.googleapis.com/css?family=Roboto?family=Rubik:300,400,500,700",
            },
        )

        # Create plain text version
        text_message = html2text.html2text(html_message)

        # Create email message
        subject = (
            f"Confirmación de inscripción - {inscripcion.curso.tipo.nombre_completo} "
            f"- {inscripcion.curso.fecha}"
        )
        from_email = None  # Will use DEFAULT_FROM_EMAIL
        recipient_list = [inscripcion.alumno.email]

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_message,
            from_email=from_email,
            to=recipient_list,
        )
        email.attach_alternative(html_message, "text/html")

        # Attach both logo images
        for logo_path, logo_cid in [
            (LOGO_NEGRO_PATH, logo_negro_cid),
            (LOGO_BLANCO_PATH, logo_blanco_cid),
        ]:
            try:
                image_path = finders.find(logo_path)
                if image_path:
                    with Path.open(image_path, "rb") as f:
                        logo_mime = MIMEImage(f.read())
                    logo_mime.add_header("Content-ID", f"<{logo_cid}>")
                    logo_mime.add_header(
                        "Content-Disposition",
                        "inline",
                        filename=Path.name(image_path),
                    )
                    email.attach(logo_mime)
                else:
                    logger.error(
                        "Warning: Logo image not found at static path %s",
                        logo_path,
                    )
            except FileNotFoundError:
                logger.exception(
                    "Error: Logo image file not found at resolved path %s",
                    image_path,
                )

        # Send the email
        email.send(fail_silently=False)
