# Generated by Django 5.0.12 on 2025-03-25 18:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cursos', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tipocurso',
            name='stripe_price_id',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
