# cyment_com/users/apps.py

import logging

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

# Get a logger specific to this app's configuration process
logger = logging.getLogger(__name__)


class UsersConfig(AppConfig):
    """
    App configuration for the 'users' app.
    """

    name = "cyment_com.users"
    verbose_name = _("Users")

    def ready(self):
        """
        Called once Django is ready.

        Primarily used for importing signals.

        Note: Logging handler configuration, including structlog formatters,
        should be defined declaratively in the settings.LOGGING dictionary,
        not applied dynamically here.
        """
        logger.info("Starting ready() method for %s...", self.name)

        # --- Signal Importing ---
        logger.debug("Attempting to import signals for %s.", self.name)
        try:
            # Import signals to ensure they are connected when the app is ready.
            # The noqa: F401 comment tells linters to ignore the unused import,
            # as the act of importing registers the signals.
            import cyment_com.users.signals  # noqa: F401

            logger.info(
                "Signal module 'cyment_com.users.signals' imported successfully.",
            )
        except ImportError:
            # Log a warning if the signals module cannot be found.
            # This might be expected if no signals are defined.
            logger.warning(
                "Could not import 'cyment_com.users.signals'. "
                "If signals are expected, check the module path.",
                exc_info=False,  # Generally traceback isn't needed for this warning
            )
        except Exception:
            # Catch any other unexpected errors during signal import/setup.
            logger.exception(
                "An unexpected error occurred during signal import/setup for %s.",
                self.name,
                # logger.exception automatically includes traceback
            )

        logger.info("Finished ready() method for %s.", self.name)


class CursosConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "cursos"


class PagosConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "pagos"
