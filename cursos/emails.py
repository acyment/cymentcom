from django.core.mail import send_mail
from django.template.loader import render_to_string
from mjml import mjml2html


class EmailSender:
    @staticmethod
    def send_welcome_email(inscripcion):
        pass
