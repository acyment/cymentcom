# Generated by Django 5.0.12 on 2025-03-27 17:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cursos', '0003_remove_factura_id_pago'),
    ]

    operations = [
        migrations.AddField(
            model_name='factura',
            name='email',
            field=models.EmailField(default='info@company.com', max_length=254),
            preserve_default=False,
        ),
    ]
