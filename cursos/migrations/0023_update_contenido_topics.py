from django.db import migrations

BULLET = "•"


def split_title(text):
    if not text:
        return []
    parts = [segment.strip() for segment in str(text).split(BULLET)]
    cleaned = [part for part in parts if part]
    if cleaned:
        return cleaned
    fallback = str(text).strip()
    return [fallback] if fallback else []


def transform_module(module):
    if not isinstance(module, dict):
        return module

    if "topics" in module:
        topics = module.get("topics") or []
        for topic in topics:
            lessons = topic.get("lessons") or []
            for lesson in lessons:
                if "description" not in lesson:
                    lesson["description"] = lesson.get("description", "") or ""
        module["topics"] = topics
        module.pop("lessons", None)
        return module

    lessons = module.get("lessons") or []
    topics = []

    for lesson in lessons:
        titles = split_title(lesson.get("title"))
        if not titles:
            continue
        topic_title = titles[0]
        topic_lessons = [
            {"title": title, "description": ""}
            for title in titles
        ]
        topics.append({
            "topic_title": topic_title,
            "lessons": topic_lessons,
        })

    if not topics:
        fallback_title = module.get("module_title") or "Contenido"
        topics = [
            {
                "topic_title": fallback_title,
                "lessons": [{"title": fallback_title, "description": ""}],
            }
        ]

    module["topics"] = topics
    module.pop("lessons", None)
    return module


def forwards(apps, schema_editor):
    TipoCurso = apps.get_model("cursos", "TipoCurso")
    for tipo in TipoCurso.objects.all():
        contenido = tipo.contenido or []
        if not isinstance(contenido, list):
            continue
        transformed = [transform_module(dict(module)) for module in contenido]
        tipo.contenido = transformed
        tipo.save(update_fields=["contenido"])


def backwards(apps, schema_editor):
    # Irreversible migration
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("cursos", "0022_convert_contenido_to_json"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
