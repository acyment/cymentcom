from django.http import HttpResponseRedirect
from django.views.generic import TemplateView

from cursos.models import TipoCurso

# The SPA shell, same template the root catch-all route serves.
_spa_shell = TemplateView.as_view(template_name="pages/home.html")

# Single-segment paths the client-side router owns. A course would have to be
# named after one of these to collide, but the failure mode (a vanity URL
# shadowing checkout) is bad enough to be worth the guard.
RESERVED_SEGMENTS = frozenset({"checkout", "cursos", "about", "users", "api"})


def course_shortcut(request, short_name):
    """Vanity URL for a course: ``/csm`` redirects to ``/cursos/CSM``.

    Lookup is case-insensitive and the redirect uses the canonical casing
    stored on the course, so ``/csm``, ``/CSM`` and ``/Csm`` all land on the
    same canonical URL. Any query string is carried over so campaign
    parameters survive the redirect.

    Anything that is not a course short name renders the SPA shell rather than
    404ing, because this pattern sits in front of the catch-all and would
    otherwise swallow client-side routes.
    """
    if short_name.lower() in RESERVED_SEGMENTS:
        return _spa_shell(request)

    tipo = TipoCurso.objects.filter(nombre_corto__iexact=short_name).first()
    if tipo is None:
        return _spa_shell(request)

    target = f"/cursos/{tipo.nombre_corto}"
    if request.META.get("QUERY_STRING"):
        target = f"{target}?{request.META['QUERY_STRING']}"
    return HttpResponseRedirect(target)
