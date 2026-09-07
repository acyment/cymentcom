from django.conf import settings


def allauth_settings(request):
    """Expose settings in templates."""
    return {
        "ACCOUNT_ALLOW_REGISTRATION": settings.ACCOUNT_ALLOW_REGISTRATION,
    }


def posthog_settings(request):
    """Expose PostHog settings in templates."""
    return {
        "POSTHOG_API_KEY": settings.POSTHOG_API_KEY,
        "POSTHOG_HOST": settings.POSTHOG_HOST,
    }
