# Phase 1: Minimum Automated Testing Strategy - Implementation Plan

## IMPORTANT: Docker Compose Architecture

This project runs entirely in Docker containers. All commands must be executed inside the appropriate containers.

### Docker Setup Overview:

- **Django container**: Python/Django backend, pytest for testing
- **Node container**: Frontend build tools (Rspack), Jest for testing
- **Postgres container**: Database
- **Redis container**: Cache and Celery broker
- All containers share volumes for code synchronization

### Key Docker Commands:

```bash
# Start all services
docker compose -f local.yml up

# Run commands in containers
docker compose -f local.yml run --rm django <command>
docker compose -f local.yml run --rm node <command>

# Shell access
docker compose -f local.yml run --rm django bash
docker compose -f local.yml run --rm node bash
```

## 1. Frontend Testing Setup (Jest + React Testing Library)

### Step 1.1: Update Node container for testing

- Modify `compose/local/node/Dockerfile` to include test dependencies
- Update package.json with test dependencies and scripts
- Ensure tests can run inside the node container

### Step 1.2: Install Jest and dependencies (in container)

```bash
# Run inside node container
docker compose -f local.yml run --rm node pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
docker compose -f local.yml run --rm node pnpm add -D @swc/jest jest-environment-jsdom
docker compose -f local.yml run --rm node pnpm add -D @types/jest
```

### Step 1.3: Configure Jest for Docker environment

- Create `jest.config.js` with Rspack-compatible settings
- Create `jest.setup.js` for global test configuration
- Add test scripts to package.json
- Ensure paths work within container context

### Step 1.4: Set up test utilities

- Create test helpers for rendering with providers (Router, etc.)
- Mock setup for API calls
- Test data factories

## 2. Backend Testing Enhancement

### Step 2.1: Add missing test dependencies (in Django container)

```bash
# Run inside django container
docker compose -f local.yml run --rm django pip install pytest-mock responses freezegun
# Or add to requirements/local.txt and rebuild
```

### Step 2.2: Create test structure for cursos app

```
cursos/tests/
├── __init__.py
├── factories.py
├── test_models.py
├── test_views.py
├── test_services.py
├── test_webhooks.py
└── test_integration.py
```

## 3. Critical Path Tests Implementation

### Frontend Priority Tests:

1. **Enrollment Wizard Flow** (`frontend/src/components/Inscripcion.jsx`):

   - Test multi-step navigation
   - Form validation
   - Data persistence between steps
   - API submission

2. **Payment Result Handling** (`frontend/src/components/ResultadoPago.jsx`):

   - Success/failure states
   - Retry mechanisms
   - Email confirmation display

3. **Course Listing** (`frontend/src/components/Cursos.jsx`):
   - Filtering functionality
   - Loading states
   - Error handling

### Backend Priority Tests:

1. **Course Enrollment** (`cursos/models.py`):

   - Test `Inscripcion` creation
   - Participant validation
   - Invoice generation

2. **Payment Webhooks**:

   - MercadoPago webhook handler
   - Stripe webhook handler
   - Payment status updates
   - Email notifications

3. **AFIP Integration**:
   - Invoice generation
   - Tax calculations
   - Error handling

## 4. Test Execution Strategy

### Local Development (Docker):

```bash
# Frontend tests (run in node container)
docker compose -f local.yml run --rm node pnpm test
docker compose -f local.yml run --rm node pnpm test:watch
docker compose -f local.yml run --rm node pnpm test:coverage

# Backend tests (run in django container)
docker compose -f local.yml run --rm django pytest
docker compose -f local.yml run --rm django pytest --cov=cursos
docker compose -f local.yml run --rm django pytest -m "not integration"

# Or create aliases for convenience:
alias dtest-frontend='docker compose -f local.yml run --rm node pnpm test'
alias dtest-backend='docker compose -f local.yml run --rm django pytest'
```

### Pre-commit Hooks:

- Run affected tests
- Lint checks
- Coverage thresholds

## 5. CI/CD Pipeline (GitHub Actions)

### `.github/workflows/test.yml`:

- Parallel jobs for frontend/backend
- PostgreSQL service for Django tests
- Coverage reports to PR comments
- Block merge on test failures

## 6. Coverage Goals

### Initial Targets:

- Frontend: 40% coverage (focus on critical paths)
- Backend: 60% coverage (cursos app)
- Integration tests: 5 critical user journeys

### Critical Paths to Cover:

1. User browses courses → selects course → completes enrollment → receives confirmation
2. Payment webhook received → order updated → email sent
3. Admin creates course → students enroll → invoices generated

## 7. Implementation Order

1. **Week 1**: Frontend test infrastructure + first component tests
2. **Week 2**: Backend cursos app tests + webhook tests
3. **Week 3**: Integration tests + CI/CD setup
4. **Week 4**: Coverage improvement + documentation

This plan focuses on getting a solid testing foundation with emphasis on the most critical business paths that could cause revenue loss or user frustration if broken.

---

# Phase 2: Mobile Version Implementation

## 1. Mobile Analysis & Strategy

### Step 1.1: Audit Current Responsive Implementation

- Review existing CSS/SCSS for media queries
- Identify components that need mobile optimization
- Check current viewport meta tags
- Test current site on various mobile devices

### Step 1.2: Define Mobile Breakpoints

```scss
$mobile-small: 320px;
$mobile: 375px;
$tablet: 768px;
$desktop: 1024px;
$desktop-large: 1440px;
```

## 2. Mobile Navigation Implementation

### Step 2.1: Hamburger Menu

- Replace desktop navigation with mobile-friendly hamburger menu
- Implement slide-out navigation drawer
- Add overlay backdrop
- Ensure accessibility (ARIA labels, keyboard navigation)

### Step 2.2: Bottom Tab Navigation (Optional)

- Quick access to key sections: Courses, My Enrollments, Profile
- Sticky positioning
- Active state indicators

## 3. Mobile-Optimized Components

### Step 3.1: Course Cards

- Stack vertically on mobile
- Larger touch targets (min 44px)
- Simplified information hierarchy
- Swipe gestures for course carousel

### Step 3.2: Enrollment Wizard

- Single column layout
- Larger input fields and buttons
- Step indicator optimization
- Auto-scroll to active step

### Step 3.3: Payment Forms

- Native input types (tel, email, number)
- Auto-formatting for credit cards
- Touch-friendly date pickers
- Clear error messages

### Step 3.4: Tables to Cards

- Convert data tables to card-based layouts
- Prioritize key information
- Expandable sections for details

## 4. Performance Optimizations

### Step 4.1: Image Optimization

- Responsive images with srcset
- Lazy loading implementation
- WebP format support
- Proper aspect ratios to prevent layout shift

### Step 4.2: Bundle Optimization

- Code splitting by route
- Dynamic imports for heavy components
- Reduced polyfills for modern mobile browsers

### Step 4.3: Progressive Enhancement

- Core functionality works without JavaScript
- Enhanced features for capable devices
- Offline support for critical pages

## 5. Mobile Testing Strategy

### Step 5.1: Device Testing

- Physical devices: iPhone (Safari), Android (Chrome)
- BrowserStack for broader coverage
- Responsive design mode testing

### Step 5.2: Performance Testing

- Lighthouse mobile audits
- Core Web Vitals monitoring
- Network throttling tests

### Step 5.3: Usability Testing

- Touch target size validation
- Gesture functionality
- Form completion on mobile keyboards

## 6. Implementation Priority

### High Priority:

1. Mobile navigation menu
2. Enrollment wizard mobile optimization
3. Course browsing experience
4. Payment flow optimization

### Medium Priority:

1. Dashboard mobile view
2. Email templates responsive design
3. Admin interface mobile support

### Low Priority:

1. Advanced filtering options
2. Detailed analytics views
3. Bulk operations

## 7. Success Metrics

- Mobile conversion rate improvement
- Reduced bounce rate on mobile
- Faster Time to Interactive (TTI)
- Higher Lighthouse scores (target: 90+)
- Positive user feedback on mobile experience

This mobile implementation plan ensures a seamless experience across all devices while maintaining performance and usability standards.
