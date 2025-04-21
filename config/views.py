# config/views.py
import structlog
from django.shortcuts import render

logger = structlog.get_logger(__name__)


def server_error_view(request):
    """
    Custom 500 handler.
    Templates: :template:`500.html`
    Context: None
    """
    logger.error("Rendering 500 page due to internal server error")
    return render(request, "500.html", status=500)
