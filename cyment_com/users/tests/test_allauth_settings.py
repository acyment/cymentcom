from django.conf import settings


def test_account_login_methods_is_email_only():
    assert {"email"} == settings.ACCOUNT_LOGIN_METHODS


def test_account_signup_fields_only_require_email_and_password():
    assert settings.ACCOUNT_SIGNUP_FIELDS == ["email*", "password1*", "password2*"]


def test_csrf_trusted_origins_include_local_frontend():
    assert "http://localhost:3000" in settings.CSRF_TRUSTED_ORIGINS
    assert "http://127.0.0.1:3000" in settings.CSRF_TRUSTED_ORIGINS
