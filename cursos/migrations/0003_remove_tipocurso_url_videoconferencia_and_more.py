# Generated by Django 4.2.11 on 2024-04-22 18:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cursos', '0002_alter_tipocurso_options_faqcurso_tipo_curso_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tipocurso',
            name='url_videoconferencia',
        ),
        migrations.RemoveField(
            model_name='tipocurso',
            name='url_whiteboard',
        ),
        migrations.AddField(
            model_name='curso',
            name='url_videoconferencia',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='curso',
            name='url_whiteboard',
            field=models.URLField(blank=True),
        ),
    ]
