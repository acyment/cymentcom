# Generated by Django 4.2.11 on 2024-04-24 13:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cursos', '0006_factura_ciudad_factura_codigo_postal_factura_estado_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='factura',
            name='organizacion',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='factura',
            name='pais',
            field=models.CharField(max_length=40),
        ),
    ]