import re
from http import HTTPStatus

import pytest
from django.test import Client

VIEWPORT_PATTERN = re.compile(
    r'<meta\s+name=["\']viewport["\']\s+content=["\']width=device-width,\s*initial-scale=1[^"\']*["\']\s*/?>',
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
    assert (
        len(matches) == 1
    ), f"Expected one viewport meta tag in {path}, found {len(matches)}"
