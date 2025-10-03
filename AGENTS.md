# Claude Code TDD Development Guide for Django + React E-commerce Site

## Repo-Specific Notes

- Docker Compose file: use `-f local.yml` for all commands.
- Service names: `django` (backend), `node` (frontend), `playwright` (E2E), `postgres`, `redis`, `celeryworker`, `celerybeat`.
- Frontend lives at the project root using Rspack (not a separate `frontend/` app).
- E2E tests run via a dedicated Playwright container; use Just recipes: `just e2e`, `just e2e-mobile`, `just e2e-ui`, `just e2e-report`.
- Node uses pnpm with a stable store at `/app/.pnpm-store` and a shared `node_modules` volume.

### Dependency Management

- **Backend (Django)**: Add or update Python packages by editing `config/settings/base.py` to include the app (for example, adding `"django_jsonform"` to `THIRD_PARTY_APPS`) and updating `requirements/base.txt`. After those changes, notify the maintainer so they can rebuild the Django container and recreate its volume; agents must not run `pip install` directly in containers.
- **Frontend (React/Node)**: Modify `package.json`/`pnpm-lock.yaml` to add dependencies, then let the maintainer rebuild the `node` container. Do not run package installs inside the running container yourself.

## Context: Legacy Code Without Tests

This codebase was originally developed without TDD. Our approach:

1. **Add tests before modifying existing code** (characterization tests)
2. **Use strict TDD for all new features**
3. **Gradually increase test coverage** as we touch code
4. **Never refactor without tests** protecting the behavior

## Core Philosophy: True Test-Driven Development

You MUST follow strict TDD discipline. This means:

1. **Never write NEW production code without a failing test first**
2. **Write characterization tests before modifying EXISTING code**
3. **Write the minimum code to make the test pass**
4. **Refactor only when tests are green**
5. **YAGNI (You Aren't Gonna Need It) - Build only what's needed NOW**

## Working with Legacy Code

### Before Modifying Existing Code

1. **Write characterization tests** that document current behavior
2. **Run tests** to ensure they pass with current implementation
3. **Then proceed** with modifications using TDD

Example approach:

````
"I need to modify the checkout process. First, I'll write tests to characterize the current behavior:

```python
# tests/test_checkout.py
def test_existing_checkout_calculates_total():
    """Characterization test: documents current checkout behavior"""
    cart = ShoppingCart()
    cart.add_item(product_id=1, quantity=2, price=10.00)

    # This documents what the code currently does
    assert cart.calculate_total() == 20.00
````

This test captures the current behavior before we make changes.
Should I proceed with this characterization test?"

````

## Technology Stack & Setup

⚠️ **IMPORTANT: This entire project runs using Docker Compose**

All commands must be executed through Docker containers. Use `docker compose -f local.yml exec <service>` for all operations in development.

### Backend: Django
- **Django 4.x** with Django REST Framework
- **PostgreSQL** for database
- **pytest-django** for testing
- **factory_boy** for test data
- **coverage.py** for coverage reports

### Frontend: React
- **React 18.x** with TypeScript
- **Rspack** for dev/build tooling (project root)
- **React Testing Library** for component tests
- **MSW** for API mocking
- **Vitest** for test runner

### E-commerce Specific
- **Stripe** for payments (use test mode)
- **Celery** for async tasks (email, order processing)
- **Redis** for caching and sessions

### Docker Services
All services run in containers. Common service names (this repo):
- `django` - Django backend
- `node` - React frontend (Rspack dev server)
- `postgres` - PostgreSQL database
- `redis` - Redis cache
- `celeryworker`/`celerybeat` - Celery worker/scheduler

## YAGNI Principle - Minimalist Design

### Core Rules
- **No premature abstractions**: Don't create base classes or generic solutions for single use cases
- **No future-proofing**: Solve today's problem, not tomorrow's imagined problem
- **No "just in case" code**: Every line must serve a current, tested requirement
- **Defer architectural decisions**: Use the simplest solution that could possibly work

### YAGNI in Practice

❌ **Over-engineered:**
```python
# Django: Creating abstract base classes for one model
class AbstractTimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class AbstractSoftDeleteModel(AbstractTimestampedModel):
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        abstract = True

class Product(AbstractSoftDeleteModel):
    # Only model using this...
    name = models.CharField(max_length=255)
````

✅ **YAGNI-compliant:**

```python
# Django: Simple, direct solution
class Product(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### When to Abstract

Only create abstractions when:

1. You have **3+ concrete implementations** already duplicated
2. Tests are becoming hard to write due to coupling
3. The abstraction is driven by a **current** requirement, not speculation

### Polymorphism Over Conditionals

❌ **Bad - Conditional Logic:**

```python
# Django view
def calculate_discount(request, order):
    user_type = request.user.profile.user_type
    if user_type == 'premium':
        return order.total * 0.2
    elif user_type == 'member':
        return order.total * 0.1
    elif user_type == 'guest':
        return 0
    return 0
```

✅ **Good - Strategy Pattern:**

```python
# Django: Polymorphic approach
class DiscountStrategy(ABC):
    @abstractmethod
    def calculate(self, order_total: Decimal) -> Decimal:
        pass

class PremiumDiscount(DiscountStrategy):
    def calculate(self, order_total: Decimal) -> Decimal:
        return order_total * Decimal('0.2')

class MemberDiscount(DiscountStrategy):
    def calculate(self, order_total: Decimal) -> Decimal:
        return order_total * Decimal('0.1')

DISCOUNT_STRATEGIES = {
    'premium': PremiumDiscount(),
    'member': MemberDiscount(),
    'guest': None,
}

def calculate_discount(user_type: str, order_total: Decimal) -> Decimal:
    strategy = DISCOUNT_STRATEGIES.get(user_type)
    return strategy.calculate(order_total) if strategy else Decimal('0')
```

## TDD Cycle - MANDATORY for Every Feature

### 🔴 RED Phase

1. **PROPOSE TEST FIRST**: Present the test(s) to the user for review
   - Show the complete test code
   - Explain what behavior is being tested
   - Wait for user confirmation: "These tests look good" or similar
2. **Only after user approval**: Write the test file
3. Run the test suite to confirm it fails
4. The test should fail for the right reason (not import errors)

### 🟢 GREEN Phase

1. Write the MINIMUM production code to make the test pass
2. Do NOT add extra functionality
3. Do NOT optimize or clean up yet
4. **Apply YAGNI**: Resist adding "nice to have" features
5. Run all tests to confirm they pass

### 🔵 REFACTOR Phase

1. **PROPOSE REFACTORING FIRST**: If refactoring opportunities exist:
   - List potential refactorings
   - Show before/after code snippets
   - Explain the benefits
   - Wait for user confirmation
2. **Only after user approval**: Perform approved refactorings
3. Only refactor when ALL tests are green
4. Extract methods when they exceed 10 lines
5. Run tests after each refactoring step

## Development Rules

### User Confirmation Protocol

**ALWAYS get user approval before:**

1. **Writing any test** - Show proposed test code and explain what it tests
2. **Performing refactorings** - List opportunities and show before/after code
3. **Never proceed without explicit confirmation**

### Small Steps Protocol

- Each TDD cycle should take 2-10 minutes maximum
- **Commit after each working feature** (every 1-3 green cycles)
- **I will remind you if we haven't committed in ~30 minutes**

### Version Control Discipline

- **Commit frequency**: After every working feature
- **Commit message format**: `verb + what + why (if not obvious)`
- **I will alert you** when it's been too long since a commit

## Code Organization Standards

### Django Backend Structure

```
backend/
├── apps/                    # Django apps
│   ├── products/
│   │   ├── models.py       # Keep models simple
│   │   ├── views.py        # Or use viewsets.py for DRF
│   │   ├── serializers.py  # DRF serializers
│   │   ├── services.py     # Business logic here!
│   │   ├── urls.py
│   │   ├── tests/
│   │   │   ├── test_models.py
│   │   │   ├── test_views.py
│   │   │   ├── test_services.py
│   │   │   └── factories.py
│   │   └── migrations/
│   ├── cart/
│   │   ├── models.py
│   │   ├── services.py     # CartService, checkout logic
│   │   └── tests/
│   ├── orders/
│   │   ├── models.py
│   │   ├── services.py     # OrderService, payment processing
│   │   └── tests/
│   └── users/
│       ├── models.py
│       ├── authentication.py
│       └── tests/
├── core/                    # Project-wide utilities
│   ├── middleware/
│   ├── permissions.py
│   └── exceptions.py
├── config/                  # Django settings
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── test.py
│   │   └── production.py
│   └── urls.py
└── requirements/
    ├── base.txt
    ├── development.txt
    └── production.txt
```

### React Frontend Structure

Note: This repository hosts the frontend at the project root using Rspack.
Conventional feature-oriented structure still applies inside `src/`, but
paths may differ from an isolated `frontend/` workspace.

### Code Quality Standards

#### Method/Function Length

- **Hard limit: 10 lines per method/function**
- Extract helper functions aggressively
- Each function should have ONE clear responsibility

#### Django Specific

- **Skinny models, fat services**: Business logic in service layer
- **One viewset/view per resource**
- **Explicit is better than implicit**: No magic
- **Use Django's built-in features**: Don't reinvent

#### React Specific

- **Maximum 5 props per component**
- **One component per file**
- **Hooks for logic, components for presentation**

### Visual Design Constraints

- **Brand accent color**: use only `#7854fa` for accents, highlights, buttons, link/hover states, and interactive focus rings (besides black/white and neutral grays). Soft gradients are allowed as long as `#7854fa` remains the sole hue blended with neutrals (white/black/gray) and no additional colors.
- **Avoid additional hues**: do not introduce green/teal/orange variants in new UI. When touching existing UI, prefer migrating greenish elements (e.g., loaders, chips) to `#7854fa`.
- **Contrast**: ensure minimum 4.5:1 for text on backgrounds when applying `#7854fa` (use darker text on light backgrounds or white text on solid `#7854fa`).

## Testing Patterns

### Django Backend Testing

#### Model Tests

```python
# apps/products/tests/test_models.py
import pytest
from decimal import Decimal
from apps.products.tests.factories import ProductFactory

@pytest.mark.django_db
class TestProduct:
    """Test Product model behavior"""

    def test_product_str_representation(self):
        """Test string representation of product"""
        product = ProductFactory(name="Coffee Mug")
        assert str(product) == "Coffee Mug"

    def test_product_calculates_discount_price(self):
        """Test discount calculation"""
        product = ProductFactory(
            price=Decimal("100.00"),
            discount_percentage=20
        )
        assert product.get_discount_price() == Decimal("80.00")
```

#### Service Tests

```python
# apps/cart/tests/test_services.py
@pytest.mark.django_db
class TestCartService:
    """Test cart business logic"""

    def test_add_item_to_cart(self):
        """Test adding items to cart"""
        # Given
        user = UserFactory()
        product = ProductFactory(price=Decimal("10.00"))
        service = CartService(user)

        # When
        service.add_item(product, quantity=2)

        # Then
        cart = service.get_cart()
        assert cart.items.count() == 1
        assert cart.get_total() == Decimal("20.00")
```

#### API Tests

```python
# apps/products/tests/test_views.py
@pytest.mark.django_db
class TestProductAPI:
    """Test product API endpoints"""

    def test_list_products(self, api_client):
        """Test product listing endpoint"""
        # Given
        ProductFactory.create_batch(3)

        # When
        response = api_client.get('/api/products/')

        # Then
        assert response.status_code == 200
        assert len(response.json()['results']) == 3
```

### React Frontend Testing

#### Component Tests

```typescript
// features/products/components/ProductCard/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Coffee Mug',
    price: 15.99,
    image: '/mug.jpg',
  };

  it('displays product information', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Coffee Mug')).toBeInTheDocument();
    expect(screen.getByText('$15.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when add button clicked', () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    fireEvent.click(screen.getByText('Add to Cart'));
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
```

#### Hook Tests

```typescript
// features/cart/hooks/useCart.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';

describe('useCart', () => {
  it('adds items to cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({ id: 1, price: 10 }, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(20);
  });
});
```

### E-commerce Specific Testing

#### Payment Integration Tests

```python
# apps/orders/tests/test_payment.py
@pytest.mark.django_db
class TestPaymentService:
    """Test payment processing"""

    @patch('stripe.PaymentIntent.create')
    def test_process_payment(self, mock_stripe):
        """Test Stripe payment processing"""
        # Given
        mock_stripe.return_value = Mock(
            id='pi_test123',
            status='succeeded'
        )
        order = OrderFactory(total=Decimal('99.99'))
        service = PaymentService()

        # When
        result = service.process_payment(order)

        # Then
        assert result.success is True
        assert result.transaction_id == 'pi_test123'
```

#### Checkout Flow Tests

```typescript
// features/checkout/CheckoutFlow.test.tsx
describe('CheckoutFlow', () => {
  it('completes full checkout process', async () => {
    const { user } = renderWithProviders(<CheckoutFlow />);

    // Step 1: Shipping
    await user.type(screen.getByLabelText('Address'), '123 Main St');
    await user.click(screen.getByText('Continue to Payment'));

    // Step 2: Payment
    await user.type(screen.getByLabelText('Card Number'), '4242424242424242');
    await user.click(screen.getByText('Place Order'));

    // Step 3: Confirmation
    await waitFor(() => {
      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
    });
  });
});
```

## TDD Workflow Example

### Step 1: Propose Test to User

````
"I'll create a test for adding a product review feature.
Here's the proposed backend test:

```python
# apps/products/tests/test_services.py
@pytest.mark.django_db
def test_add_product_review():
    """Test adding a review to a product"""
    # Given
    user = UserFactory()
    product = ProductFactory()

    # When
    review = ReviewService.add_review(
        product=product,
        user=user,
        rating=5,
        comment="Great product!"
    )

    # Then
    assert review.rating == 5
    assert review.comment == "Great product!"
    assert product.reviews.count() == 1
````

And the frontend test:

```typescript
// features/products/components/ReviewForm/ReviewForm.test.tsx
it('submits review form', async () => {
  const onSubmit = vi.fn();
  const { user } = render(<ReviewForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Rating'), '5');
  await user.type(screen.getByLabelText('Comment'), 'Great!');
  await user.click(screen.getByText('Submit Review'));

  expect(onSubmit).toHaveBeenCalledWith({
    rating: 5,
    comment: 'Great!',
  });
});
```

These tests verify the review functionality works end-to-end.
Should I proceed with these tests?"

```

**USER**: "Yes, looks good"

### Step 2: Implement Minimal Code
Write just enough code to make tests pass

### Step 3: Propose Refactoring
```

"I see some refactoring opportunities:

1. **Extract validation logic** - Move review validation to separate method
2. **Add caching** - Cache product reviews for performance
3. **Improve error handling** - Add specific exception types

Which refactorings would you like me to apply?"

````

## Integration Testing

### Django + React Integration (Playwright)
```python
# integration_tests/test_checkout.py
@pytest.mark.integration
class TestCheckoutIntegration:
    """Test full checkout flow with real API calls"""

    def test_complete_checkout_flow(self, live_server, page):
        """Test checkout from cart to order confirmation (Playwright)"""
        # Create test data
        user = UserFactory(email="test@example.com")
        ProductFactory(name="Test Product", price=50)

        # Navigate to site
        page.goto(f"{live_server.url}/products")

        # Add to cart
        page.get_by_text("Add to Cart").click()

        # Go to checkout
        page.get_by_text("Checkout").click()

        # Complete checkout...
        # Assertions...
````

## Commands to Run Frequently

⚠️ **ALL COMMANDS MUST USE DOCKER COMPOSE WITH COMPOSE FILE**

### Django Backend (via Docker)

```bash
# Run all tests
docker compose -f local.yml exec django pytest

# Run specific test file
docker compose -f local.yml exec django pytest apps/products/tests/test_models.py

# Run with coverage
docker compose -f local.yml exec django pytest --cov=apps --cov-report=html

# Run only marked tests
docker compose -f local.yml exec django pytest -m "not integration"

# Check code style
docker compose -f local.yml exec django flake8
docker compose -f local.yml exec django black . --check

# Database migrations
docker compose -f local.yml exec django python manage.py makemigrations
docker compose -f local.yml exec django python manage.py migrate

# Django shell
docker compose -f local.yml exec django python manage.py shell

# Run management commands
docker compose -f local.yml exec django python manage.py <command>
```

### React Frontend (via Docker)

```bash
# Run unit tests (Vitest)
docker compose -f local.yml exec node npm test

# Run tests in watch mode
docker compose -f local.yml exec node npm test -- --watch

# Run with coverage
docker compose -f local.yml exec node npm test -- --coverage

# Lint / Type check / Build
docker compose -f local.yml exec node npm run lint
docker compose -f local.yml exec node npm run type-check
docker compose -f local.yml exec node npm run build

# E2E (Playwright) via dedicated service
docker compose -f local.yml run --rm playwright npm run e2e
```

### Full Stack

```bash
# Start all services (Django, React, Redis, Celery)
docker compose -f local.yml up

# Start in background
docker compose -f local.yml up -d

# View logs
docker compose -f local.yml logs -f django
docker compose -f local.yml logs -f node

# Stop all services
docker compose -f local.yml down

# Rebuild containers
docker compose -f local.yml build

# Run both backend and frontend tests
docker compose -f local.yml exec django pytest && docker compose -f local.yml exec node npm test

# Commit your work (I'll remind you if forgotten)
git add .
git commit -m "Add product review feature with tests"
```

### Database Operations

```bash
# Access PostgreSQL directly
docker compose -f local.yml exec db psql -U postgres

# Create database backup
docker compose -f local.yml exec db pg_dump -U postgres > backup.sql

# Restore database
docker compose -f local.yml exec db psql -U postgres < backup.sql
```

## Checklist for Every Feature

- [ ] **Proposed test to user and got approval**
- [ ] Started with a failing test (both backend and frontend if applicable)
- [ ] Test fails for the right reason
- [ ] Wrote minimum code to pass
- [ ] All tests pass
- [ ] **Proposed refactorings (if any) and got approval**
- [ ] Applied only approved refactorings
- [ ] No Python/TypeScript errors
- [ ] No linting errors
- [ ] Methods are ≤10 lines
- [ ] Components have ≤5 props
- [ ] Django services handle business logic (not views)
- [ ] API responses follow consistent format
- [ ] Frontend properly handles loading/error states
- [ ] **Committed to git** (if feature complete)

⚠️ **Commit Reminder**: If it's been >30 minutes since last commit, I'll remind you!

## Anti-Patterns to Avoid

### General

❌ Writing multiple tests before implementation
❌ Adding features "while you're there"
❌ Skipping the refactor phase
❌ Tests that test implementation details
❌ Creating abstractions "for the future"

### Django Specific

❌ Business logic in models or views (use services)
❌ Fat models
❌ Using signals for core business logic
❌ Raw SQL when ORM would work
❌ Not using Django's built-in features
❌ Circular imports between apps

### React Specific

❌ Components with more than 5 props
❌ useEffect with missing dependencies
❌ Storing derived state
❌ Not handling loading/error states
❌ Direct DOM manipulation
❌ Inline styles when CSS modules available

### E-commerce Specific

❌ Storing prices as floats (use Decimal)
❌ Not handling race conditions in inventory
❌ Synchronous payment processing
❌ Not logging payment events
❌ Missing idempotency in critical operations

## Working with Legacy Code Guidelines

### When Modifying Existing Code

1. **Write characterization tests first**
2. **Refactor only under test coverage**
3. **Use the Strangler Fig pattern** for large refactors
4. **Add integration tests** for critical paths

### Gradual Improvement Strategy

- **Boy Scout Rule**: Leave code better than you found it
- **Add tests for bugs**: Every bug fix needs a test
- **Test critical paths first**: Focus on checkout, payments
- **Document assumptions**: Note unclear behavior in tests

## Remember

**The goal is not to write code fast, but to write code that works correctly and is maintainable.** Each small, verified step builds confidence in the codebase. Trust the process - the accumulated small steps lead to robust, well-designed applications.

**YAGNI is your default**: Every line of code is a liability. The best code is no code. The second best is simple, direct code that solves exactly the current problem.

**User collaboration is mandatory**: ALWAYS propose tests before writing them. ALWAYS propose refactorings before performing them. The user is your partner in the TDD process.

**Legacy code is an opportunity**: Each test you add makes the system more maintainable. Focus on high-value areas first (checkout, payments, user authentication).
