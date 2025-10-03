import pytest


@pytest.mark.parametrize(
    ("html", "expected"),
    [
        (
            "<ul><li>Módulo 1<ul><li>Intro</li><li>Profundización</li></ul></li></ul>",
            [
                {
                    "module_title": "Módulo 1",
                    "summary": "",
                    "topics": [
                        {
                            "topic_title": "Intro",
                            "lessons": [
                                {"title": "Intro", "description": ""},
                            ],
                        },
                        {
                            "topic_title": "Profundización",
                            "lessons": [
                                {"title": "Profundización", "description": ""},
                            ],
                        },
                    ],
                },
            ],
        ),
        (
            (
                "<ul><li>Módulo A<ul><li>Lección 1<ul><li>Detalle opcional"
                "</li></ul></li></ul></li></ul>"
            ),
            [
                {
                    "module_title": "Módulo A",
                    "summary": "",
                    "topics": [
                        {
                            "topic_title": "Lección 1",
                            "lessons": [
                                {"title": "Lección 1", "description": ""},
                                {"title": "Detalle opcional", "description": ""},
                            ],
                        },
                    ],
                },
            ],
        ),
        (
            (
                "<ul><li>Módulo B<ul><li>Tema principal • Subtema 1 • Subtema 2"
                "</li></ul></li></ul>"
            ),
            [
                {
                    "module_title": "Módulo B",
                    "summary": "",
                    "topics": [
                        {
                            "topic_title": "Tema principal",
                            "lessons": [
                                {"title": "Tema principal", "description": ""},
                                {"title": "Subtema 1", "description": ""},
                                {"title": "Subtema 2", "description": ""},
                            ],
                        },
                    ],
                },
            ],
        ),
    ],
)
def test_parse_html_contenido_builds_module_tree(html, expected):
    from cursos.temario import parse_html_contenido

    assert parse_html_contenido(html) == expected


def test_parse_html_contenido_splits_bullet_list_into_lessons():
    from cursos.temario import parse_html_contenido

    legacy = [
        {
            "module_title": "Filosofía de la agilidad",
            "lessons": [
                {
                    "title": (
                        "La propuesta de la agilidad"
                        " • Desarrollo orgánico versus mecánico"
                        " • Corte orgánico"
                        " • Velocidad de aprendizaje"
                        " • Foco y flujo"
                    ),
                },
            ],
        },
    ]

    result = parse_html_contenido(legacy)

    assert result == [
        {
            "module_title": "Filosofía de la agilidad",
            "summary": "",
            "topics": [
                {
                    "topic_title": "La propuesta de la agilidad",
                    "lessons": [
                        {
                            "title": "Desarrollo orgánico versus mecánico",
                            "description": "",
                        },
                        {"title": "Corte orgánico", "description": ""},
                        {"title": "Velocidad de aprendizaje", "description": ""},
                        {"title": "Foco y flujo", "description": ""},
                    ],
                },
            ],
        },
    ]
