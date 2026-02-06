# Testing Strategy Guide

Guide for implementing the "Quality Escape Hatch" philosophy: tests as safety net for temporary imperfection.

## Core Philosophy

**Tests permit temporary imperfection**

- Code quality is negotiable IF backed by comprehensive tests
- "Ugly" code WITH tests is acceptable
- "Ugly" code WITHOUT tests is rejected
- Tests are the safety net that enables pragmatic execution

## Testing Hierarchy

### 1. Unit Tests

**Purpose**: Validate individual components in isolation

**When to write**:
- Before or immediately after writing the component
- For all business logic
- For all data transformations
- For all utility functions

**Coverage targets**:
- Minimum 80% coverage for new code
- 100% coverage for critical paths
- All edge cases tested

**Example structure**:
```python
def test_component_happy_path():
    """Test the primary use case"""
    # Arrange
    input_data = create_test_data()

    # Act
    result = my_component(input_data)

    # Assert
    assert result.is_valid()
    assert result.output == expected_output

def test_component_edge_case_empty_input():
    """Test edge case: empty input"""
    result = my_component([])
    assert result.is_empty()

def test_component_error_invalid_input():
    """Test error handling: invalid input"""
    with pytest.raises(ValidationError):
        my_component(invalid_data)
```

### 2. Integration Tests

**Purpose**: Validate component interactions and workflows

**When to write**:
- After multiple components are implemented
- For cross-module interactions
- For data flow validations
- For configuration loading

**Coverage targets**:
- All major workflows tested end-to-end
- All integration points validated
- Configuration variations tested

**Example structure**:
```python
def test_workflow_user_registration():
    """Test complete user registration workflow"""
    # Setup
    config = load_test_config()
    system = SystemUnderTest(config)

    # Execute workflow
    user_data = create_test_user()
    result = system.register_user(user_data)

    # Validate workflow steps
    assert result.validation_passed
    assert result.user_created
    assert result.notification_sent

    # Validate integration
    assert database.user_exists(user_data.email)
    assert email_service.sent_welcome_email(user_data.email)
```

### 3. End-to-End Tests

**Purpose**: Validate complete system behavior from user perspective

**When to write**:
- After core use case is implemented
- For acceptance criteria validation
- For user story validation

**Coverage targets**:
- All user stories have E2E test
- All acceptance criteria validated
- Core use case thoroughly tested

**Example structure**:
```python
def test_e2e_complete_user_journey():
    """Test complete user journey from registration to usage"""
    # User registers
    user = register_new_user()

    # User logs in
    session = login_user(user.credentials)

    # User performs core action
    result = perform_core_action(session)

    # Validate complete journey
    assert result.success
    assert user_activity_logged()
    assert metrics_updated()
```

## Test-Driven Development (TDD) Pattern

### Standard TDD Cycle

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass test
3. **Refactor**: Improve code while keeping tests green

### Architect-First TDD Adaptation

1. **Architect**: Design and document first
2. **Red**: Write tests based on architecture
3. **Green**: Implement to pass tests (code can be "ugly")
4. **Refactor**: Improve code quality (optional, tests enable this)

**Key difference**: Architecture and documentation precede test writing.

## Quality Escape Hatch: When "Ugly" Code is Acceptable

### Conditions for Acceptance

"Ugly" code is acceptable when ALL of these are true:

1. ✅ **Comprehensive tests exist**
   - Unit tests cover all logic paths
   - Integration tests validate workflows
   - Tests actually run and pass

2. ✅ **Logging/observation points added**
   - Key decision points logged
   - Error context captured
   - Debugging hooks available

3. ✅ **Core use case works**
   - Primary workflow functional
   - Acceptance criteria met
   - User value delivered

4. ✅ **Technical debt documented**
   - TODO comments with context
   - Refactoring plan outlined
   - Known limitations documented

### Examples of Acceptable "Ugly" Code

```python
# ACCEPTABLE: Nested ifs, but fully tested
def process_data(data):
    """Process data through validation pipeline.

    TODO: Refactor nested ifs to strategy pattern
    See: docs/refactoring/data-processing.md
    """
    if data.type == "A":
        if data.valid:
            if data.priority == "high":
                return fast_process_a(data)
            else:
                return slow_process_a(data)
        else:
            raise ValidationError("Invalid A")
    elif data.type == "B":
        # Similar nesting...
        pass
    # ... comprehensive tests exist for all paths
```

```python
# ACCEPTABLE: Quick implementation, but tested
def calculate_metrics(records):
    """Calculate metrics from records.

    TODO: Optimize query - currently loads all to memory
    Performance: ~500ms for 10k records (acceptable for MVP)
    """
    # Load everything (inefficient but works)
    all_data = list(records)

    # Calculate (could be vectorized)
    result = sum(r.value for r in all_data) / len(all_data)

    logging.info(f"Calculated metric: {result} from {len(all_data)} records")
    return result
    # Unit tests verify correctness
    # Integration tests verify performance acceptable
```

### Examples of UNACCEPTABLE Code

```python
# REJECTED: No tests, no logging
def process_important_data(data):
    # Complex logic with no tests
    result = data.field1 + data.field2 * 3.14
    if result > threshold:  # hardcoded threshold
        return do_something(result)
    return None
```

```python
# REJECTED: Tests exist but don't actually validate behavior
def calculate_revenue(orders):
    # Complex calculation
    total = sum(o.amount for o in orders)
    return total * 1.1  # Why 1.1? No comment, no doc

def test_calculate_revenue():
    # Useless test - doesn't validate logic
    result = calculate_revenue([])
    assert result >= 0  # Always passes, validates nothing
```

## Logging Strategy for Test Support

### Strategic Logging Points

1. **Entry/Exit of major functions**
   ```python
   logging.info(f"Starting process_workflow with {len(items)} items")
   result = process_workflow(items)
   logging.info(f"Completed process_workflow: {result.summary()}")
   ```

2. **Decision points**
   ```python
   if should_use_fast_path(data):
       logging.debug("Using fast path: criteria met")
       return fast_path(data)
   else:
       logging.debug(f"Using slow path: {data.reason}")
       return slow_path(data)
   ```

3. **Error conditions**
   ```python
   try:
       result = risky_operation()
   except ValidationError as e:
       logging.error(f"Validation failed: {e}", extra={
           "input": data,
           "context": current_context
       })
       raise
   ```

4. **Performance monitoring**
   ```python
   import time
   start = time.time()
   result = expensive_operation()
   duration = time.time() - start
   logging.info(f"Operation completed in {duration:.2f}s")
   if duration > THRESHOLD:
       logging.warning(f"Operation slow: {duration:.2f}s > {THRESHOLD}s")
   ```

## Test Organization

### Directory Structure

```
project/
├── src/
│   └── module/
│       ├── __init__.py
│       └── component.py
├── tests/
│   ├── unit/
│   │   └── test_component.py
│   ├── integration/
│   │   └── test_module_integration.py
│   └── e2e/
│       └── test_user_workflows.py
└── conftest.py  # Shared fixtures
```

### Naming Conventions

- Test files: `test_*.py`
- Test functions: `test_[component]_[scenario]`
- Test classes: `Test[Component]`

**Examples**:
- `test_parser_valid_input()`
- `test_parser_empty_input()`
- `test_parser_invalid_format_raises_error()`

## Test Fixtures and Helpers

### Configuration for Tests

```python
# conftest.py
import pytest

@pytest.fixture
def test_config():
    """Load test configuration"""
    return {
        "database": "sqlite:///:memory:",
        "log_level": "DEBUG",
        "timeout": 1.0
    }

@pytest.fixture
def sample_data():
    """Create sample test data"""
    return [
        {"id": 1, "value": 100},
        {"id": 2, "value": 200},
    ]
```

### Mock External Dependencies

```python
from unittest.mock import Mock, patch

def test_with_external_api():
    """Test component that calls external API"""
    with patch('module.external_api') as mock_api:
        mock_api.fetch_data.return_value = {"status": "ok"}

        result = my_component.process()

        assert result.success
        mock_api.fetch_data.assert_called_once()
```

## Running Tests

### Local Development

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_component.py

# Run specific test
pytest tests/unit/test_component.py::test_parser_valid_input

# Run with verbose output
pytest -v

# Run with logging output
pytest -s --log-cli-level=DEBUG
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: pip install -r requirements-test.txt
      - name: Run tests
        run: pytest --cov=src --cov-fail-under=80
```

## Coverage Targets

### Minimum Coverage Requirements

- **New code**: 80% minimum
- **Critical paths**: 100% required
- **Existing code**: No decrease allowed

### Measuring Coverage

```bash
# Generate coverage report
pytest --cov=src --cov-report=html

# View in browser
open htmlcov/index.html

# Check specific module
pytest --cov=src.module --cov-report=term-missing
```

### Exceptions to Coverage

Acceptable to exclude from coverage:
- Logging statements
- Debug code
- Type checking code (`if TYPE_CHECKING:`)
- Abstract base class definitions
- Explicit `# pragma: no cover` with justification

## Test Quality Checklist

- [ ] Tests are independent (can run in any order)
- [ ] Tests are repeatable (same result every time)
- [ ] Tests are fast (< 1s for unit tests)
- [ ] Tests have clear names describing what they test
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] Edge cases are tested
- [ ] Error conditions are tested
- [ ] Tests don't depend on external state
- [ ] Mocks are used for external dependencies
- [ ] Test data is clearly defined

## Refactoring with Test Safety Net

**Process**:

1. Ensure comprehensive tests exist
2. Run tests → all green
3. Refactor code incrementally
4. Run tests after each change
5. If tests fail → fix or revert
6. Continue refactoring
7. Final test run → all green
8. Commit

**Rules**:
- NEVER refactor without tests
- NEVER change tests and code simultaneously
- ALWAYS keep tests passing
- COMMIT frequently with passing tests

---

## Summary

**Quality Escape Hatch in Practice**:

1. **Before coding**: Define test plan
2. **While coding**: Write tests (can be concurrent or after)
3. **Code quality**: Can be "ugly" IF tests comprehensive
4. **Validation**: Tests + logs + manual inspection
5. **Refactoring**: Optional, enabled by tests
6. **Deployment**: Core case working + tests passing

**Remember**: Tests are your license to write imperfect code. Without tests, perfection is required.
