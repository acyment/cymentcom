from django.db import migrations


def forwards(apps, schema_editor):
    TipoCurso = apps.get_model("cursos", "TipoCurso")
    from cursos.temario import parse_html_contenido

    for tipo in TipoCurso.objects.all():
        parsed = parse_html_contenido(tipo.contenido)
        tipo.contenido_json = parsed
        tipo.save(update_fields=["contenido_json"])


class Migration(migrations.Migration):
    dependencies = [
        ("cursos", "0021_tipocurso_contenido_json"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
        migrations.RemoveField(model_name="tipocurso", name="contenido"),
        migrations.RemoveField(model_name="tipocurso", name="contenido_corto"),
        migrations.RenameField(
            model_name="tipocurso",
            old_name="contenido_json",
            new_name="contenido",
        ),
    ]
