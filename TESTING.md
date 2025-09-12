# Testing Infrastructure - Cyment.com E-commerce Platform

## Overview

This document outlines the testing infrastructure for our Django + React e-commerce course platform. All tests run through Docker containers using `local.yml`.

## Quick Start

```bash
# Run all tests
make test-all

# Run backend tests only
make test-backend

# Run frontend tests only
make test-frontend

# Run tests with coverage
make test-coverage
```

## Backend Testing (Django + pytest)

### Test Structure

```
cursos/tests/
├── __init__.py
├── conftest.py          # Pytest fixtures
├── factories.py         # Factory Boy factories
├── test_models.py       # Model tests
├── test_views.py        # API endpoint tests
├── test_services.py     # Business logic tests
└── test_payments.py     # Payment integration tests
```

### Running Backend Tests

```bash
# All backend tests
docker compose -f local.yml exec django pytest

# Specific test file
docker compose -f local.yml exec django pytest cursos/tests/test_models.py

# Specific test method
docker compose -f local.yml exec django pytest cursos/tests/test_models.py::TestTipoCurso::test_str_representation

# With coverage
docker compose -f local.yml exec django pytest --cov=cursos --cov-report=html

# Verbose output
docker compose -f local.yml exec django pytest -v
```

### Backend Test Categories

#### 1. Model Tests (`test_models.py`)

- Data validation
- Model relationships
- String representations
- Custom model methods

#### 2. API Tests (`test_views.py`)

- Endpoint responses
- Authentication/authorization
- Request/response serialization
- Error handling

#### 3. Payment Tests (`test_payments.py`) - **CRITICAL**

- Stripe integration
- MercadoPago integration
- Webhook handling
- Payment state transitions

#### 4. Service Tests (`test_services.py`)

- Business logic
- Email notifications
- External API integrations

### Test Fixtures & Factories

We use Factory Boy for creating test data:

```python
# Create test data
from cursos.tests.factories import TipoCursoFactory, InscripcionFactory

tipo_curso = TipoCursoFactory(titulo="Python Course")
inscripcion = InscripcionFactory(curso__tipo_curso=tipo_curso)
```

Available factories:

- `TipoCursoFactory` - Course types
- `CursoFactory` - Course instances
- `InscripcionFactory` - Enrollments
- `FacturaFactory` - Invoices
- `UserFactory` - Users (from users app)

## Frontend Testing (React + Vitest)

### Test Structure

```
frontend/src/
├── tests/
│   ├── setup.js         # Test configuration
│   └── utils.jsx        # Test utilities
└── components/
    ├── Inscripcion.test.jsx
    ├── StepFacturacion.test.jsx
    └── ResultadoPago.test.jsx
```

### Running Frontend Tests

```bash
# All frontend tests
docker compose -f local.yml exec node pnpm test:run

# Watch mode (for development)
docker compose -f local.yml exec node pnpm test

# With coverage
docker compose -f local.yml exec node pnpm test:coverage

# UI mode (browser-based)
docker compose -f local.yml exec node pnpm test:ui
```

### Frontend Test Categories

#### 1. Component Tests

- Rendering behavior
- User interactions
- Props validation
- State changes

#### 2. Payment Flow Tests - **CRITICAL**

- Form validation
- Payment processor selection
- Country-based logic
- Error handling

#### 3. Integration Tests

- API communication
- End-to-end user flows
- State management

### Test Utilities

Use our custom utilities for consistent testing:

```javascript
import { renderWithProviders, mockPaymentFormData } from '@/tests/utils';

test('payment form submission', () => {
  const { user } = renderWithProviders(<PaymentForm />);
  // Test implementation
});
```

## Critical Test Coverage Priorities

### 🔴 **IMMEDIATE PRIORITY**

1. **Payment Processing**

   - Stripe checkout session creation
   - MercadoPago preference creation
   - Webhook signature validation
   - Payment state transitions

2. **Enrollment Flow**
   - Course enrollment creation
   - Invoice generation
   - Email notifications

### 🟠 **HIGH PRIORITY**

3. **Frontend Payment Flows**

   - Payment form validation
   - Country-based payment processor selection
   - Payment result handling

4. **Data Integrity**
   - Model relationships
   - Business rule validation
   - State consistency

### 🟡 **MEDIUM PRIORITY**

5. **User Experience**
   - Component rendering
   - Form interactions
   - Error messages

## Test Configuration

### Django Settings (`config/settings/test.py`)

- Optimized for fast test execution
- In-memory email backend
- Simplified password hashing
- Test database configuration

### Pytest Configuration (`pyproject.toml`)

```toml
[tool.pytest.ini_options]
minversion = "7.0"
addopts = "--ds=config.settings.test --reuse-db"
pythonpath = "cyment_com"
```

### Vitest Configuration (`vitest.config.js`)

- jsdom environment for DOM testing
- Global test utilities
- Module aliases
- Mock configurations

## Continuous Integration

### Running Tests in CI/CD

```bash
# Complete test suite
make test-all

# With coverage reports
make test-coverage

# Type checking
make type-check

# Linting
make lint
```

### Test Reports

- **Backend Coverage**: `htmlcov/index.html`
- **Frontend Coverage**: `coverage/index.html`
- **Test Results**: Console output with pytest-sugar formatting

## Best Practices

### 1. Test Naming

```python
# Backend
def test_payment_webhook_handles_stripe_success():
    """Test webhook correctly processes successful Stripe payment."""

# Frontend
test('payment form validates required fields', () => {
  // Test implementation
})
```

### 2. Test Organization

- Group related tests in classes (backend)
- Use descriptive test names
- Include docstrings for complex tests
- Keep tests focused and atomic

### 3. Mock External Services

```python
# Backend
@patch('stripe.checkout.Session.create')
def test_stripe_session_creation(mock_stripe):
    mock_stripe.return_value = Mock(id='cs_test_123')
    # Test implementation

# Frontend
vi.mock('axios', () => ({
  post: vi.fn(() => Promise.resolve({ data: {} }))
}))
```

### 4. Test Data Management

- Use factories for consistent test data
- Avoid hardcoded values
- Clean up after tests (automatic with pytest-django)

## Debugging Tests

### Backend Debugging

```bash
# Drop into debugger
docker compose -f local.yml exec django pytest --pdb

# Print statements
docker compose -f local.yml exec django pytest -s

# Verbose output
docker compose -f local.yml exec django pytest -vvv
```

### Frontend Debugging

```bash
# Browser-based debugging
docker compose -f local.yml exec node pnpm test:ui

# Console logs
docker compose -f local.yml exec node pnpm test -- --reporter=verbose
```

## Performance

### Backend Test Performance

- Uses `--reuse-db` flag to avoid recreating test database
- Fast password hashing for user creation
- In-memory email backend

### Frontend Test Performance

- Vitest's fast watch mode
- Selective test running
- Efficient mocking strategies

## Troubleshooting

### Common Issues

1. **"Docker daemon not running"**

   ```bash
   # Start Docker daemon
   # Then retry test commands
   ```

2. **"Module not found" errors**

   ```bash
   # Rebuild containers
   make build
   ```

3. **Database connection errors**

   ```bash
   # Ensure services are running
   make up
   ```

4. **Frontend dependency issues**
   ```bash
   # Reinstall dependencies
   make install-deps
   ```

### Getting Help

1. Check this documentation first
2. Review test output for specific error messages
3. Check Docker service status: `docker compose -f local.yml ps`
4. Review logs: `make logs`

## Next Steps

After setting up the infrastructure:

1. **Write characterization tests** for existing payment flows
2. **Add integration tests** for critical business paths
3. **Implement TDD workflow** for new features
4. **Gradually increase coverage** of existing code

For detailed TDD workflow, see `CLAUDE.md` - our development guide.
