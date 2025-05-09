# Generated by Django 5.0.12 on 2025-04-22 23:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cursos', '0016_factura_fecha_confeccion'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('tipo_identificacion_fiscal', models.CharField(blank=True, max_length=10)),
                ('identificacion_fiscal', models.CharField(blank=True, max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('ciclo_de_pago', models.IntegerField(default=0)),
                ('notas', models.TextField(blank=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='factura',
            name='confeccionada',
        ),
        migrations.AddField(
            model_name='factura',
            name='cliente',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='cursos.cliente'),
        ),
    ]
