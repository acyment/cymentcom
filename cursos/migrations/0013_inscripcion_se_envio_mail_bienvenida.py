# Generated by Django 5.0.12 on 2025-04-21 17:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cursos', '0012_alter_factura_tipo_identificacion_fiscal'),
    ]

    operations = [
        migrations.AddField(
            model_name='inscripcion',
            name='se_envio_mail_bienvenida',
            field=models.BooleanField(default=False),
        ),
    ]
