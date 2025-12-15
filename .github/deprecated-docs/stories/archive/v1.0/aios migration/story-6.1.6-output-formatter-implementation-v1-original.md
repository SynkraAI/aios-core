# Story 6.1.6: Output Formatter Implementation (Layer 2)

**Story ID:** STORY-6.1.6
**Epic:** Epic-6.1 - Agent Identity System
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Dev (Dex)
**Created:** 2025-01-14
**Duration:** 2 days
**Investment:** $200

---

## 📋 Objective

Implement Layer 2 of the 3-layer personalization system: Template Engine with personality injection and output structure validation.

---

## 📖 Story

**As a** framework maintainer,
**I want** a centralized output formatter that injects agent personality while maintaining fixed output structure,
**So that** task outputs are consistent yet personalized across all 11 agents, balancing familiarity with engagement.

**Business Value:** Solves the core paradox of "familiaridade + personalização" by enforcing sacred structure (Duration line 7, Tokens line 8, Metrics last) while allowing flexible tone/vocabulary in status messages.

---

## 🎯 Scope

Create output-formatter.js script that injects agent personality into standardized templates while maintaining fixed structure (familiaridade + personalização).

---

## 🤖 CodeRabbit Integration

**Story Type:** Architecture (Layer 2 Implementation)
**Primary Agents:** @dev (Dex), @architect (Aria)
**Secondary Reviewers:** @qa (Quinn)

**Quality Gates:**
- Pre-commit: ESLint validation, unit tests must pass
- PR Review: CodeRabbit + @architect review required
- Post-merge: Integration test with 1 task validated

**Focus Areas for CodeRabbit:**
1. **Code Quality:** Class structure, separation of concerns
2. **Performance:** <50ms benchmark for formatter execution
3. **Test Coverage:** ≥80% required (50+ test cases)
4. **Pattern Validation:** Ensure validator catches all structural violations
5. **Documentation:** JSDoc comments for all public methods

**Auto-Review Rules:**
- Flag any hardcoded agent names (should use persona_profile)
- Flag any direct file writes (formatter only returns strings)
- Flag missing error handling in async operations
- Flag performance regressions >50ms

---

## 📊 Tasks Breakdown

### Day 1: Core Formatter Implementation (8 hours)

**Task 1.1: Create OutputFormatter Class** (4 hours)
- Create `.aios-core/scripts/output-formatter.js`
- Implement `PersonalizedOutputFormatter` class
- Methods: `format()`, `buildFixedHeader()`, `buildPersonalizedStatus()`, `buildFixedMetrics()`
- Load agent persona_profile from agent files
- Select vocabulary words based on archetype
- Generate status messages matching agent tone

**Task 1.2: Create Pattern Validator** (4 hours)
- Create `.aios-core/scripts/validate-output-pattern.js`
- Validate required sections: Header, Status, Output, Metrics
- Validate fixed positions: Duration (line 7), Tokens (line 8)
- Validate Metrics section is always last
- Return validation errors with helpful messages

### Day 2: Templates & Testing (8 hours)

**Task 2.1: Create Output Template** (2 hours)
- Create `.aios-core/templates/task-execution-report.md`
- Define standardized structure with personality slots
- Document fixed positions vs flexible slots
- Add usage examples for all archetypes

**Task 2.2: Unit Tests** (4 hours)
- Test formatter generates valid output for all 11 agents
- Test vocabulary selection from persona_profile
- Test status message generation by tone (pragmatic/empathetic/analytical/collaborative)
- Test signature closing injection
- Test validator catches malformed outputs
- 50+ test cases

**Task 2.3: Integration Test** (2 hours)
- Integrate formatter with 1 task (proof of concept)
- Test with develop-story.md or create-story.md
- Verify output structure compliance
- Verify personality shows in status + signature
- Verify metrics section always last

---

## ✅ Acceptance Criteria

### Must Have
- [ ] OutputFormatter class generates valid outputs for all 11 agents
- [ ] Validator detects all structural violations (section order, line positions)
- [ ] Template has clear documentation of fixed vs flexible slots
- [ ] Unit tests: 50+ test cases, all passing
- [ ] Integration test: 1 task uses formatter successfully
- [ ] Personality injection works (vocabulary, tone, signature)
- [ ] Fixed structure maintained (Duration line 7, Tokens line 8, Metrics last)

### Should Have
- [ ] Formatter is performant (<50ms per output generation)
- [ ] Error messages from validator are actionable
- [ ] Template includes examples for all 11 archetypes

### Nice to Have
- [ ] Formatter supports multiple output formats (Markdown, HTML, JSON)
- [ ] Validator can auto-fix minor formatting issues

---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 6.1.2:** Agent File Updates (agents need persona_profile section)

### Dependent Stories (This Blocks)
- **Story 6.1.7:** Core Tasks Migration (tasks will use formatter)

---

## 🛠️ Dev Notes

**Implementation Priority:**
1. Start with OutputFormatter class (core functionality)
2. Implement validator early (use for TDD)
3. Create template with clear examples
4. Write unit tests incrementally
5. Integration test last (proof of concept)

**Testing Standards:**
- **Unit Tests:** Jest framework, 50+ test cases minimum
  - Test all 11 agents (Builder, Guardian, Balancer, Visionary, Flow Master, Architect, Explorer, Empathizer, Engineer, Operator, Orchestrator)
  - Test vocabulary selection from archetype-vocabulary.yaml
  - Test tone-specific message generation (pragmatic, empathetic, analytical, collaborative)
  - Test signature closing injection
  - Test validator catches all structural violations

- **Integration Tests:** Real task execution
  - Use develop-story.md or create-story.md as test task
  - Verify output structure compliance
  - Verify personality injection works end-to-end
  - Verify metrics section always last

**Error Handling:**
- Graceful degradation if persona_profile missing (use neutral tone)
- Graceful degradation if vocabulary file missing (use default verbs)
- Clear error messages from validator (actionable feedback)
- Performance timeout: fail fast if >100ms (2x the 50ms target)

**Performance Optimization:**
- Cache vocabulary lookups (don't reload YAML every time)
- Pre-compile template structure
- Minimize string concatenation (use template literals)
- Benchmark every method (target <10ms per method)

**Dependencies:**
- YAML parser for archetype-vocabulary.yaml
- Markdown parser for agent files (extract persona_profile)
- Jest for testing
- No new external dependencies if possible

**Code Style:**
- Follow existing AIOS-FULLSTACK patterns
- Use ES6 classes
- JSDoc comments for all public methods
- Descriptive variable names (no abbreviations)
- Clear separation of concerns (formatting vs validation)

**Migration Path for Story 6.1.7:**
- Formatter must be backward compatible
- Tasks can gradually adopt formatter
- Provide migration guide for task authors
- Include before/after examples

---

## 📁 Files Modified

### New Files Created
- `.aios-core/scripts/output-formatter.js` (PersonalizedOutputFormatter class)
- `.aios-core/scripts/validate-output-pattern.js` (Pattern validator)
- `.aios-core/templates/task-execution-report.md` (Standard output template)
- `tests/unit/output-formatter.test.js` (Unit tests)
- `tests/integration/formatter-integration.test.js` (Integration test)

### Files Modified
- None (no changes to existing files yet)

### Files Referenced
- `.aios-core/agents/*.md` (read persona_profile sections)
- `.aios-core/data/archetype-vocabulary.yaml` (vocabulary lookup)

---

## 🎨 Deliverables

### 1. Output Formatter Script
**Location:** `.aios-core/scripts/output-formatter.js`

**Key Functions:**
```javascript
class PersonalizedOutputFormatter {
  constructor(agent, task, results);
  format(); // Generate complete output
  buildFixedHeader(); // Standard header (always same format)
  buildPersonalizedStatus(); // Agent-specific status message
  buildFixedMetrics(); // Standard metrics (always last)
  selectVerbFromVocabulary(vocabulary); // Choose appropriate verb
  generateSuccessMessage(tone, verb); // Tone-specific message
}
```

### 2. Pattern Validator
**Location:** `.aios-core/scripts/validate-output-pattern.js`

**Validation Rules:**
- Header section exists and follows format
- Duration appears on line 7
- Tokens appears on line 8
- Status section before Output section
- Metrics section is last
- All required fields present

### 3. Output Template
**Location:** `.aios-core/templates/task-execution-report.md`

**Structure:**
```markdown
## 📊 Task Execution Report

**Agent:** {agent.name} ({archetype})
**Task:** {task.name}
**Started:** {timestamp.start}
**Completed:** {timestamp.end}
**Duration:** {duration}                    ← LINE 7 (fixed)
**Tokens Used:** {tokens.total} total       ← LINE 8 (fixed)

---

### Status
{status_icon} {PERSONALIZED_MESSAGE}        ← PERSONALITY SLOT

### Output
{task_specific_content}

### Metrics                                  ← ALWAYS LAST (fixed)
- Tests: {tests.passed}/{tests.total}
- Coverage: {coverage}%
- Linting: {lint.status}

---
{signature_closing}                         ← PERSONALITY SLOT
```

---

## 💰 Investment Breakdown

- Day 1 (Formatter + Validator): 8 hours @ $12.50/hr = $100
- Day 2 (Template + Tests): 8 hours @ $12.50/hr = $100
- **Total:** 16 hours = $200

---

## 🎯 Success Metrics

- **Code Coverage:** ≥80% for formatter module
- **Performance:** <50ms per output generation
- **Validation Accuracy:** 100% detection of structural violations
- **Agent Coverage:** Works with all 11 agents without errors

---

## 🧪 Testing

### Test Framework
- **Unit Tests:** Jest
- **Integration Tests:** Jest + real task execution
- **Performance Tests:** Custom benchmark harness

### Test Coverage Requirements
- **Overall Coverage:** ≥80%
- **Critical Paths:** 100% (formatting, validation, personality injection)
- **Edge Cases:** All error paths tested

### Unit Test Suite (50+ cases)

**OutputFormatter Tests (25 cases):**
```javascript
describe('PersonalizedOutputFormatter', () => {
  // Core formatting
  test('generates valid output for all 11 agents');
  test('maintains fixed header structure');
  test('places Duration on line 7');
  test('places Tokens on line 8');
  test('places Metrics section last');

  // Personality injection
  test('selects vocabulary from archetype (Builder)');
  test('selects vocabulary from archetype (Guardian)');
  // ... (11 archetype tests)

  test('generates pragmatic tone status (Builder)');
  test('generates empathetic tone status (Empathizer)');
  test('generates analytical tone status (Guardian)');
  test('generates collaborative tone status (Balancer)');

  test('injects signature closing correctly');

  // Error handling
  test('graceful degradation if persona_profile missing');
  test('graceful degradation if vocabulary missing');
  test('fails fast if performance >100ms');
});
```

**Validator Tests (25 cases):**
```javascript
describe('OutputPatternValidator', () => {
  // Structure validation
  test('detects missing Header section');
  test('detects missing Status section');
  test('detects missing Metrics section');
  test('detects wrong Duration line position');
  test('detects wrong Tokens line position');
  test('detects Metrics not last');

  // Validation accuracy
  test('passes valid output (all 11 agents)');
  test('provides actionable error messages');

  // Edge cases
  test('handles empty output');
  test('handles malformed sections');
  test('handles missing required fields');
});
```

### Integration Test Suite (1 task)

**Test Scenario:**
```javascript
describe('Formatter Integration', () => {
  test('develop-story task uses formatter successfully', async () => {
    // 1. Load dev agent (Dex - Builder)
    // 2. Execute develop-story task
    // 3. Capture formatted output
    // 4. Validate structure compliance
    // 5. Verify personality injection (vocabulary, tone, signature)
    // 6. Verify metrics section last
    // 7. Verify performance <50ms
  });
});
```

### Performance Benchmarks

**Targets:**
- OutputFormatter.format(): <50ms total
  - buildFixedHeader(): <10ms
  - buildPersonalizedStatus(): <20ms
  - buildFixedMetrics(): <10ms
  - Vocabulary lookup: <5ms (cached)

**Test Cases:**
```javascript
describe('Performance', () => {
  test('formatter completes in <50ms (P95)');
  test('vocabulary lookup cached correctly');
  test('template compilation is one-time cost');
});
```

### Test Execution

**Local Development:**
```bash
npm test -- tests/unit/output-formatter.test.js
npm test -- tests/integration/formatter-integration.test.js
npm run test:coverage
```

**CI/CD Pipeline:**
- Pre-commit: All unit tests must pass
- PR: All tests + coverage check ≥80%
- Post-merge: Integration tests + performance benchmarks

---

## ⚠️ Risks & Mitigation

### Risk 1: Personality injection breaks output structure
- **Likelihood:** Medium
- **Impact:** High (loses familiaridade benefit)
- **Mitigation:** Validator enforces fixed positions, unit tests catch regressions

### Risk 2: Performance overhead from formatter
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Benchmark during development, optimize if >50ms, cache vocabulary lookups

### Risk 3: Vocabulary not matching agent archetype
- **Likelihood:** Medium
- **Impact:** Low (personality feels off)
- **Mitigation:** Reference archetype-vocabulary.yaml, validate verb selection in tests

---

## 📝 Notes

**Implementation Philosophy:**
> "Structure is sacred. Tone is flexible."
>
> - Fixed: Section order, metric positions, formatting
> - Flexible: Status messages, vocabulary, emoji selection

**Reference Documents:**
- `docs/standards/AGENT-PERSONALIZATION-STANDARD-V1.md` - Complete implementation guide
- `docs/decisions/DECISION-2-AGENT-PERSONALIZATION-IMPLEMENTATION.md` - Design rationale

---

## 🔗 Related Documents

- **Epic:** [Epic 6.1 - Agent Identity System](../epics/epic-6.1-agent-identity-system.md)
- **Standard:** [Agent Personalization Standard V1.0](../../standards/AGENT-PERSONALIZATION-STANDARD-V1.md)
- **Decision:** [DECISION-2 - Agent Personalization Implementation](../../decisions/DECISION-2-AGENT-PERSONALIZATION-IMPLEMENTATION.md)

---

## 📋 Example Output

### Example: Dex (Builder, Pragmatic Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Dex (Builder)
**Task:** develop-story
**Started:** 2025-01-14T10:30:00Z
**Completed:** 2025-01-14T10:32:23Z
**Duration:** 2.3s
**Tokens Used:** 1,801 total

---

### Status
✅ Tá pronto! Implementei com sucesso 3 componentes.

### Output
Created components:
- UserProfile.tsx
- UserAvatar.tsx
- UserSettings.tsx

All tests passing, coverage 87%.

### Metrics
- Tests: 12/12
- Coverage: 87%
- Linting: ✅ Clean

---
— Dex, sempre construindo 🔨
```

### Example: Quinn (Guardian, Analytical Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Quinn (Guardian)
**Task:** qa-gate
**Started:** 2025-01-14T11:00:00Z
**Completed:** 2025-01-14T11:05:47Z
**Duration:** 5.8s
**Tokens Used:** 2,345 total

---

### Status
✅ Validado rigorosamente. 47 edge cases testados, 0 falhas.

### Output
Validation complete:
- Unit tests: 47/47 ✅
- Integration tests: 12/12 ✅
- Edge cases: 15/15 ✅
- Security: No vulnerabilities

### Metrics
- Tests: 74/74
- Coverage: 94%
- Linting: ✅ Clean

---
— Quinn, guardião da qualidade 🛡️
```

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-15 | 1.1 | Added missing sections: Story, CodeRabbit Integration, Dev Notes, Testing, Change Log | Pax (po) |
| 2025-01-14 | 1.0 | Initial story creation | Pax (po) |

---

**Last Updated:** 2025-01-15
**Previous Story:** [Story 6.1.2 - Agent File Updates](story-6.1.2.md)
**Next Story:** [Story 6.1.7 - Core Tasks Migration](story-6.1.7-core-tasks-migration.md)
**Next Review:** After completion
