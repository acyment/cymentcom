from django.core.mail import send_mail
from django.template.loader import render_to_string
from mjml import mjml2html
from celery import shared_task
import html2text
from .models import Inscripcion


class EmailSender:
    @staticmethod
    @shared_task
    def send_welcome_email(inscripcion_id):
        try:
            inscripcion = Inscripcion.objects.get(pk=inscripcion_id)
        except Inscripcion.DoesNotExist:
            return

        context = {
            'alumno': inscripcion.alumno,
            'curso': inscripcion.curso,
            'monto': inscripcion.monto,
            'procesador_pago': inscripcion.get_procesador_pago_display(),
        }

        # Render MJML template to HTML
        mjml_template = render_to_string('mails/welcome.mjml', context)
        html_message = mjml2html(
            mjml_template,
            disable_comments=True,
            fonts={
                "Open Sans": "https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700",
            }
        )

        # Create plain text version
        text_message = html2text.html2text(html_message)

        send_mail(
            subject=f"Confirmación de inscripción - {inscripcion.curso.tipo.nombre_completo}",
            message=text_message,
            from_email=None,  # Will use DEFAULT_FROM_EMAIL
            recipient_list=[inscripcion.alumno.email],
            html_message=html_message,
            fail_silently=False,
        )
