# Generated by Django 5.0.12 on 2025-04-08 18:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cursos', '0004_factura_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='tipocurso',
            name='url_logo',
            field=models.URLField(blank=True),
        ),
    ]
