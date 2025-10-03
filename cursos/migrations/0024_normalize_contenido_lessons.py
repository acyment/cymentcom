from __future__ import annotations

from django.db import migrations

BULLET = "•"
TARGET_TIPO_CURSO_PK = 4
TARGET_TIPO_CURSO_CONTENT = [
    {
        "module_title": "Filosofía de la agilidad",
        "summary": "",
        "topics": [
            {
                "topic_title": "Complejidad, el por qué de la agilidad",
                "lessons": [
                    {"title": "Mapa de la complejidad", "description": ""},
                    {"title": "Complicado no es lo mismo que complejo", "description": ""},
                    {"title": "La niebla y el sol, otra analogía", "description": ""},
                    {"title": "Predictibilidad versus aprendizaje", "description": ""},
                    {"title": "Velocidad versus adaptabilidad", "description": ""},
                ],
            },
            {
                "topic_title": "La propuesta de la agilidad",
                "lessons": [
                    {"title": "Desarrollo orgánico versus mecánico", "description": ""},
                    {"title": "Corte orgánico", "description": ""},
                    {"title": "Velocidad de aprendizaje", "description": ""},
                    {"title": "Foco y flujo", "description": ""},
                    {"title": "Una mini-simulación", "description": ""},
                    {"title": "Dolores y causas del multitasking", "description": ""},
                    {"title": "Una nueva definición de éxito", "description": ""},
                    {"title": "Output y outcome", "description": ""},
                    {"title": "Éxito en términos de output", "description": ""},
                    {"title": "Éxito para escenarios complejos", "description": ""},
                ],
            },
        ],
    },
    {
        "module_title": "Scrum",
        "summary": "",
        "topics": [
            {
                "topic_title": "Scrum, output, outcome, foco y desarrollo orgánico",
                "lessons": [],
            },
            {
                "topic_title": "Roles",
                "lessons": [
                    {"title": "Taxonomía de Product Owners", "description": ""},
                    {"title": "El tapón", "description": ""},
                    {"title": "El Steve Jobs", "description": ""},
                    {"title": "El facilitador", "description": ""},
                    {"title": "De ScrumMasters y abejorros", "description": ""},
                    {"title": "Su lógica diaria", "description": ""},
                    {"title": "Antipatrones usuales", "description": ""},
                    {"title": "ScrumMaster versus Project Manager", "description": ""},
                    {"title": "Especialización versus diversificación en equipos", "description": ""},
                ],
            },
            {
                "topic_title": "Sprint",
                "lessons": [
                    {"title": "Pronóstico versus objetivo de Sprint", "description": ""},
                    {"title": "Dailies dolorosas", "description": ""},
                    {"title": "Ordenando el Refinamiento", "description": ""},
                    {"title": "Revisiones maduras", "description": ""},
                ],
            },
        ],
    },
    {
        "module_title": "ScrumMastering en acción (temas optativos)",
        "summary": "",
        "topics": [
            {
                "topic_title": "Teoría de facilitación",
                "lessons": [
                    {"title": "Conflicto y colaboración", "description": ""},
                ],
            },
            {
                "topic_title": "Retrospectivas más profundas",
                "lessons": [
                    {"title": "Esqueleto de una buena retrospectiva", "description": ""},
                ],
            },
            {
                "topic_title": "Cambio organizacional",
                "lessons": [
                    {"title": "Consejos estratégicos", "description": ""},
                    {"title": "Un proceso para el día a día", "description": ""},
                ],
            },
            {
                "topic_title": "Introducción al escalado",
                "lessons": [
                    {"title": "Eliminar dependencias versus administrarlas", "description": ""},
                    {"title": "La propuesta de LeSS", "description": ""},
                ],
            },
        ],
    },
]


def split_title(value: object) -> list[str]:
    if not value:
        return []
    parts = [segment.strip() for segment in str(value).split(BULLET)]
    return [segment for segment in parts if segment]


def normalise_lessons(topic_title: str, lessons: list[object]) -> list[dict[str, str]]:
    topic_key = (topic_title or "").strip().lower()
    serialised: list[dict[str, str]] = []
    for idx, lesson in enumerate(lessons):
        if isinstance(lesson, dict):
            title = (lesson.get("title") or "").strip()
            description = lesson.get("description") or ""
        else:
            title = str(lesson).strip()
            description = ""

        if not title:
            title = f"Lección {idx + 1}"

        if topic_key and len(lessons) > 1 and title.lower() == topic_key:
            continue

        serialised.append({"title": title, "description": description})

    if serialised:
        return serialised

    fallback = (topic_title or "").strip() or "Lección 1"
    return [{"title": fallback, "description": ""}]


def transform_module(raw_module: object) -> object:
    if not isinstance(raw_module, dict):
        return raw_module

    module = dict(raw_module)
    module.setdefault("summary", module.get("summary") or "")

    if "topics" in module:
        normalised_topics = []
        for position, raw_topic in enumerate(module.get("topics") or [], start=1):
            if not isinstance(raw_topic, dict):
                continue

            topic_title = (raw_topic.get("topic_title") or "").strip()
            lessons = normalise_lessons(topic_title, raw_topic.get("lessons") or [])
            normalised_topics.append(
                {
                    "topic_title": topic_title or f"Tema {position}",
                    "lessons": lessons,
                }
            )

        if normalised_topics:
            module["topics"] = normalised_topics
        else:
            fallback = module.get("module_title") or "Contenido"
            module["topics"] = [
                {
                    "topic_title": fallback,
                    "lessons": [{"title": fallback, "description": ""}],
                }
            ]
        module.pop("lessons", None)
        return module

    lessons = module.get("lessons") or []
    topics = []

    for raw_lesson in lessons:
        titles = split_title(raw_lesson.get("title") if isinstance(raw_lesson, dict) else raw_lesson)
        if not titles:
            continue

        topic_title = titles[0]
        lesson_titles = []
        if len(titles) > 1:
            lesson_titles.extend(titles[1:])

        serialised = normalise_lessons(
            topic_title,
            [{"title": title, "description": ""} for title in lesson_titles],
        )

        topics.append({"topic_title": topic_title, "lessons": serialised})

    if not topics:
        fallback = module.get("module_title") or "Contenido"
        topics = [
            {
                "topic_title": fallback,
                "lessons": [{"title": fallback, "description": ""}],
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
        transformed = [transform_module(module) for module in contenido]
        tipo.contenido = transformed
        tipo.save(update_fields=["contenido"])

    try:
        tipo = TipoCurso.objects.get(pk=TARGET_TIPO_CURSO_PK)
    except TipoCurso.DoesNotExist:
        return

    tipo.contenido = TARGET_TIPO_CURSO_CONTENT
    tipo.save(update_fields=["contenido"])


def backwards(apps, schema_editor):
    # Irreversible data migration
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("cursos", "0023_update_contenido_topics"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
