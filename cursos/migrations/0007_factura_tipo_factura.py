# Generated by Django 5.0.12 on 2025-04-10 00:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cursos', '0006_remove_factura_ciudad_remove_factura_codigo_postal_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='factura',
            name='tipo_factura',
            field=models.CharField(blank=True, choices=[('A', 'Factura A'), ('B', 'Factura B')], max_length=1),
        ),
    ]
