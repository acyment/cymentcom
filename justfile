
## Just does not yet manage signals for subprocesses reliably, which can lead to unexpected behavior.
## Exercise caution before expanding its usage in production environments.
## For more information, see https://github.com/casey/just/issues/2473 .


# Default command to list all available commands.
default:
    @just --list

# build: Build python image.
build:
    @echo "Building python image..."
    @docker compose -f local.yml build

# up: Start up containers.
up:
    @echo "Starting up containers..."
    @docker compose -f local.yml up -d --remove-orphans

# down: Stop containers.
down:
    @echo "Stopping containers..."
    @docker compose -f local.yml down

# prune: Remove containers and their volumes.
prune *args:
    @echo "Killing containers and removing volumes..."
    @docker compose -f local.yml down -v {{args}}

# logs: View container logs
logs *args:
    @docker compose -f local.yml logs -f {{args}}

# manage: Executes `manage.py` command.
manage +args:
    @docker compose -f local.yml run --rm django python ./manage.py {{args}}

# e2e: Run all Playwright tests via Docker Compose
e2e:
    @docker compose -f local.yml run --rm playwright npm run e2e

# e2e-mobile: Run only the mobile Playwright project
e2e-mobile:
    @docker compose -f local.yml run --rm playwright npm run e2e:mobile

# e2e-ui: Open Playwright UI (exposes 9323)
e2e-ui:
    @docker compose -f local.yml run --rm -p 9323:9323 -e PWDEBUG=1 playwright npm run e2e:ui

# e2e-report: Serve the latest Playwright HTML report (exposes 9323)
e2e-report:
    @docker compose -f local.yml run --rm -p 9323:9323 playwright npm run e2e:report
