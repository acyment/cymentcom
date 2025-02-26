from django.conf import settings


def allauth_settings(request):
    """Expose settings in templates."""
    return {
        "ACCOUNT_ALLOW_REGISTRATION": settings.ACCOUNT_ALLOW_REGISTRATION,
    }
