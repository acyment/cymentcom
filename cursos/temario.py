"""Utilities for transforming legacy HTML temario into structured JSON."""

from __future__ import annotations

from html import unescape
from typing import TYPE_CHECKING
from xml.etree import ElementTree as ET

if TYPE_CHECKING:
    from collections.abc import Iterable

BULLET_SEPARATOR = "•"


def parse_html_contenido(value: object) -> list[dict[str, object]]:  # noqa: C901, PLR0911
    """Convert legacy HTML temario strings into the new JSON schema.

    If *value* is already a list (i.e., already migrated JSON data) the list is
    returned as-is. Empty or ``None`` inputs yield an empty list.
    """

    if isinstance(value, list):  # Already in the desired format
        return [_ensure_topics(dict(module)) for module in value]

    if value is None:
        return []

    if isinstance(value, dict):  # Defensive: legacy data should not be dicts
        return [value]

    if not isinstance(value, str):
        return []

    text = value.strip()
    if not text:
        return []

    unescaped = unescape(text)
    wrapped = f"<root>{unescaped}</root>"

    try:
        root = ET.fromstring(wrapped)  # noqa: S314
    except ET.ParseError:
        title = unescaped.strip()
        if not title:
            return []
        return [
            {
                "module_title": title,
                "summary": "",
                "topics": [
                    {
                        "topic_title": title,
                        "lessons": [{"title": title, "description": ""}],
                    },
                ],
            },
        ]

    modules: list[dict[str, object]] = []

    for ul in root.findall("./ul"):
        for li in ul.findall("./li"):
            module = _parse_module_li(li)
            if module:
                modules.append(module)

    return [_ensure_topics(module) for module in modules]


def _parse_module_li(li: ET.Element) -> dict[str, object] | None:
    module_title = _extract_heading(li)
    summary = ""
    topics: list[dict[str, object]] = []

    for child in li:
        tag = child.tag.lower()
        if tag == "ul":
            topics.extend(_parse_topics(child))
        elif tag in {"p", "div", "span", "em", "strong"}:
            text = _all_text(child)
            if text:
                summary = (summary + " " + text).strip() if summary else text

    if not module_title and summary:
        module_title, summary = summary, ""

    if not module_title and not topics:
        return None

    return {
        "module_title": module_title or "Contenido",
        "summary": summary,
        "topics": topics,
    }


def _parse_topics(ul: ET.Element) -> list[dict[str, object]]:  # noqa: C901
    topics: list[dict[str, object]] = []
    for index, li in enumerate(ul.findall("./li"), start=1):
        raw_title = _all_text_excluding_lists(li)
        split_titles = _split_title(raw_title)

        nested_titles: list[str] = []
        for child in li:
            if child.tag.lower() == "ul":
                nested_titles.extend(_gather_list_titles(child))

        topic_title = ""
        if split_titles:
            topic_title = split_titles[0]
        elif raw_title.strip():
            topic_title = raw_title.strip()
        elif nested_titles:
            topic_title = nested_titles[0]
        else:
            topic_title = f"Tema {index}"

        lesson_sources: list[str] = []
        if len(split_titles) > 1:
            lesson_sources.extend(split_titles[1:])
        if nested_titles:
            lesson_sources.extend(nested_titles)

        unique_sources: list[str] = []
        seen: set[str] = set()
        for candidate in lesson_sources:
            cleaned = candidate.strip()
            if not cleaned:
                continue
            key = cleaned.lower()
            if key in seen:
                continue
            seen.add(key)
            unique_sources.append(cleaned)

        lessons = _normalise_lessons(
            topic_title,
            [{"title": title, "description": ""} for title in unique_sources],
        )

        topics.append(
            {
                "topic_title": topic_title,
                "lessons": lessons,
            },
        )
    return topics


def _gather_list_titles(root: ET.Element) -> list[str]:
    titles: list[str] = []
    for li in root.findall("./li"):
        text = _all_text(li)
        if text:
            titles.extend(_split_title(text))
        for child in li:
            if child.tag.lower() == "ul":
                titles.extend(_gather_list_titles(child))
    return titles


def _normalise_lessons(
    topic_title: str,
    lessons: Iterable[object],
) -> list[dict[str, str]]:
    """Ensure lessons are dictionaries and drop duplicates of the topic title."""

    topic_key = (topic_title or "").strip().lower()
    serialised: list[dict[str, str]] = []

    if not isinstance(lessons, list):
        lessons = list(lessons)

    for idx, lesson in enumerate(lessons):
        if isinstance(lesson, dict):
            title = (lesson.get("title") or "").strip()
            description = lesson.get("description") or ""
        else:
            title = str(lesson).strip()
            description = ""

        if not title:
            title = f"Lección {idx + 1}"

        title_key = title.lower()
        if topic_key and title_key == topic_key and len(lessons) > 1:
            # Skip duplicated topic title when we have other lessons
            continue

        serialised.append(
            {
                "title": title,
                "description": description,
            },
        )

    if serialised:
        return serialised

    fallback = (topic_title or "").strip() or "Lección 1"
    return [{"title": fallback, "description": ""}]


def _all_text(node: ET.Element) -> str:
    parts: list[str] = []
    if node.text and node.text.strip():
        parts.append(node.text.strip())
    for child in node:
        child_text = _all_text(child)
        if child_text:
            parts.append(child_text)
        if child.tail and child.tail.strip():
            parts.append(child.tail.strip())
    return " ".join(parts).strip()


def _extract_heading(node: ET.Element) -> str:
    if node.text and node.text.strip():
        return node.text.strip()
    for child in node:
        if child.tag.lower() == "ul":
            continue
        text = _all_text(child)
        if text:
            return text
    return ""


def _all_text_excluding_lists(node: ET.Element) -> str:
    parts: list[str] = []
    if node.text and node.text.strip():
        parts.append(node.text.strip())
    for child in node:
        if child.tag.lower() == "ul":
            if child.tail and child.tail.strip():
                parts.append(child.tail.strip())
            continue
        text = _all_text(child)
        if text:
            parts.append(text)
        if child.tail and child.tail.strip():
            parts.append(child.tail.strip())
    return " ".join(parts).strip()


def _split_title(text: str) -> list[str]:
    if not text:
        return []
    parts = [segment.strip() for segment in str(text).split(BULLET_SEPARATOR)]
    cleaned = [segment for segment in parts if segment]
    if cleaned:
        return cleaned
    stripped = str(text).strip()
    return [stripped] if stripped else []


def _ensure_topics(module: dict[str, object]) -> dict[str, object]:
    if "topics" in module:
        raw_topics = module.get("topics") or []
        topics: list[dict[str, object]] = []
        for position, topic in enumerate(raw_topics, start=1):
            if not isinstance(topic, dict):
                continue

            topic_title = (topic.get("topic_title") or "").strip()
            normalised_lessons = _normalise_lessons(
                topic_title,
                topic.get("lessons") or [],
            )

            topics.append(
                {
                    "topic_title": topic_title or f"Tema {position}",
                    "lessons": normalised_lessons,
                },
            )

        if not topics:
            fallback = module.get("module_title") or "Contenido"
            topics = [
                {
                    "topic_title": fallback,
                    "lessons": [{"title": fallback, "description": ""}],
                },
            ]

        module.setdefault("summary", module.get("summary") or "")
        module["topics"] = topics
        module.pop("lessons", None)
        return module

    lessons = module.get("lessons") or []
    topics: list[dict[str, object]] = []
    for lesson in lessons:
        titles = _split_title(lesson.get("title"))
        if not titles:
            continue
        topic_title = titles[0]
        lesson_titles = titles[1:]
        normalised_lessons = _normalise_lessons(
            topic_title,
            [{"title": title, "description": ""} for title in lesson_titles],
        )
        topics.append(
            {
                "topic_title": topic_title,
                "lessons": normalised_lessons,
            },
        )

    if not topics:
        fallback = module.get("module_title") or "Contenido"
        topics = [
            {
                "topic_title": fallback,
                "lessons": [{"title": fallback, "description": ""}],
            },
        ]

    module.setdefault("summary", module.get("summary") or "")
    module["topics"] = topics
    module.pop("lessons", None)
    return module
