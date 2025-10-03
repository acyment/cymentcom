from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("cursos", "0020_rename_costo_usd_sin_descuento_tipocurso_costo_sin_descuento_usd_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="tipocurso",
            name="contenido_json",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
