import re
from http import HTTPStatus

import pytest
from django.test import Client

VIEWPORT_PATTERN = re.compile(
    r'<meta\s+name=["\']viewport["\']\s+content=["\']width=device-width,\s*initial-scale=1[^"\']*["\']\s*/?>',
    re.IGNORECASE,
)
DESCRIPTION_PATTERN = re.compile(
    r'<meta\s+name=["\']description["\']\s+content=["\']'
    r"Alan Cyment — Diseño organizacional para equipos de producto\. "
    r"Consultoría, investigación y formación\."
    r'["\']\s*/?>',
    re.IGNORECASE,
)


@pytest.mark.django_db
@pytest.mark.parametrize("path", ["/", "/about/"])
def test_pages_include_single_meta_viewport(path):
    client = Client()
    resp = client.get(path)
    assert resp.status_code == HTTPStatus.OK
    html = resp.content.decode("utf-8")

    # Must include exactly one viewport meta tag
    matches = VIEWPORT_PATTERN.findall(html)
    assert len(matches) == 1, (
        f"Expected one viewport meta tag in {path}, found {len(matches)}"
    )


@pytest.mark.django_db
@pytest.mark.parametrize("path", ["/", "/about/"])
def test_pages_include_updated_meta_description(path):
    client = Client()
    resp = client.get(path)
    assert resp.status_code == HTTPStatus.OK
    html = resp.content.decode("utf-8")

    matches = DESCRIPTION_PATTERN.findall(html)
    assert len(matches) == 1, (
        f"Expected one updated description meta tag in {path}, found {len(matches)}"
    )
