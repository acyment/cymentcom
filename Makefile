.PHONY: help test test-backend test-frontend test-all install-deps build up down logs shell

# Default target
help:
	@echo "Available commands:"
	@echo "  test-backend      - Run Django backend tests"
	@echo "  test-frontend     - Run React frontend tests"
	@echo "  test-all          - Run all tests (backend + frontend)"
	@echo "  test-coverage     - Run tests with coverage report"
	@echo "  install-deps      - Install frontend dependencies"
	@echo "  build             - Build Docker containers"
	@echo "  up                - Start all services"
	@echo "  down              - Stop all services"
	@echo "  logs              - Show logs for all services"
	@echo "  shell             - Open Django shell"
	@echo "  lint              - Run linting for backend and frontend"
	@echo "  migrate           - Run Django migrations"

# Backend testing
test-backend:
	docker compose -f local.yml exec django pytest

test-backend-verbose:
	docker compose -f local.yml exec django pytest -v

test-backend-coverage:
	docker compose -f local.yml exec django pytest --cov=cyment_com --cov=cursos --cov-report=html

test-backend-specific:
	@echo "Usage: make test-backend-specific TEST=path/to/test.py"
	@if [ -z "$(TEST)" ]; then echo "Please specify TEST=path/to/test.py"; exit 1; fi
	docker compose -f local.yml exec django pytest $(TEST)

# Frontend testing
test-frontend:
	docker compose -f local.yml exec node pnpm test:run

test-frontend-watch:
	docker compose -f local.yml exec node pnpm test

test-frontend-coverage:
	docker compose -f local.yml exec node pnpm test:coverage

test-frontend-ui:
	docker compose -f local.yml exec node pnpm test:ui

# Combined testing
test-all: test-backend test-frontend

test-coverage: test-backend-coverage test-frontend-coverage

# Dependencies
install-deps:
	docker compose -f local.yml exec node pnpm install

# Docker operations
build:
	docker compose -f local.yml build

up:
	docker compose -f local.yml up -d

down:
	docker compose -f local.yml down

logs:
	docker compose -f local.yml logs -f

logs-django:
	docker compose -f local.yml logs -f django

logs-node:
	docker compose -f local.yml logs -f node

# Development tools
shell:
	docker compose -f local.yml exec django python manage.py shell

django-shell:
	docker compose -f local.yml exec django python manage.py shell

node-shell:
	docker compose -f local.yml exec node bash

# Database operations
migrate:
	docker compose -f local.yml exec django python manage.py migrate

makemigrations:
	docker compose -f local.yml exec django python manage.py makemigrations

# Linting and code quality
lint-backend:
	docker compose -f local.yml exec django ruff check .
	lint-backend-fix:
	docker compose -f local.yml exec django ruff check . --fix

lint-frontend:
	docker compose -f local.yml exec node pnpm lint

lint: lint-backend lint-frontend

# Type checking
type-check-backend:
	docker compose -f local.yml exec django mypy .

type-check-frontend:
	docker compose -f local.yml exec node pnpm type-check

type-check: type-check-backend type-check-frontend

# Quick development workflow
dev-setup: build up install-deps migrate
	@echo "Development environment ready!"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"

dev-test: test-all
	@echo "All tests completed!"

# Clean up
clean:
	docker compose -f local.yml down -v
	docker system prune -f
