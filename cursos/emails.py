from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


class EmailSender:
    @staticmethod
    def send_welcome_email(inscripciones):
        from_email = "alan@cyment.com"
        text_content = "Probando texto solo"
        for inscripcion in inscripciones:
            html_body = render_to_string(
                "emails/welcome_email.html",
                {"inscripcion": inscripcion},
            )

            subject = (
                f"Bienvenida al {inscripcion.curso.tipo.nombre_completo} "
                + inscripcion.curso.fecha.strftime("%B %Y")
            )
            recipient_list = [
                inscripcion.alumno.email,
            ]

            email = EmailMultiAlternatives(
                subject,
                text_content,
                from_email,
                recipient_list,
            )
            email.attach_alternative(html_body, "text/html")

            email.send()
