# Task: Form Design and Interaction

**Task ID:** form-design
**Version:** 1.0
**Purpose:** Design form interactions including field grouping, validation, progressive disclosure, error handling, and multi-step flows
**Agent:** @jenifer-tidwell
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Designs or redesigns form experiences by applying proven interaction patterns for data entry, validation, and submission. Covers field organization, input type selection, inline validation timing, progressive disclosure, error recovery, and multi-step wizard flows. Forms are the most common source of user frustration, so getting form patterns right has outsized impact on product usability.

```
INPUT (form purpose, field requirements, user context)
    |
[PHASE 1: FIELD ANALYSIS]
    -> Analyze required data, group fields, and select input types
    |
[PHASE 2: INTERACTION DESIGN]
    -> Design validation, disclosure, and error handling patterns
    |
[PHASE 3: FLOW AND LAYOUT]
    -> Structure multi-step flow, layout, and responsive behavior
    |
OUTPUT: Complete form design specification with field map, validation rules, and interaction specs
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| form_purpose | string | Yes | What the form collects and why (e.g., "user registration", "payment checkout") |
| field_requirements | object[] | Yes | List of data fields with name, type, validation rules, and required/optional status |
| user_context | string | Yes | Who fills this form, how often, and under what circumstances |
| completion_pressure | enum(low, medium, high) | No | How motivated users are to complete (tax form = high, newsletter = low) |
| existing_form | file | No | Current form design to evaluate and improve |

---

## Preconditions

- The data requirements are known (what fields are needed and which are required)
- The user context is understood (who, when, where, and how often they interact with this form)
- Backend validation rules exist or can be defined during this task
- The target platform is known (web, mobile, or both) for layout decisions

---

## Steps

### Phase 1: Field Analysis and Organization
1. Inventory all required fields and classify by data type: text, number, email, phone, date, selection (single/multi), file upload, rich text
2. Determine the optimal input type for each field:
   - Few options (2-5): radio buttons or segmented control
   - Many options (6-20): dropdown select
   - Massive options (20+): autocomplete search
   - Yes/no: toggle or checkbox
   - Dates: date picker (not free text)
   - Structured data: masked input with format hint
3. Group related fields into logical sections: personal information, address, payment, preferences
4. Order sections by mental model: what users expect to fill first (personal before payment, shipping before billing)
5. Within each section, order fields from easiest to hardest (name before complex address parsing)
6. Identify fields for progressive disclosure: fields that only appear based on earlier answers (conditional sections)
7. Mark optional fields clearly (use "optional" label rather than asterisk-for-required pattern)

### Phase 2: Validation and Error Handling
1. Define validation timing per field:
   - **On blur** (recommended): validate when user leaves the field; provides immediate feedback without interrupting typing
   - **On submit**: validate only on form submission; simpler but delays feedback
   - **Real-time** (use sparingly): validate character-by-character for password strength, username availability
2. Design inline validation feedback:
   - Success: subtle green check (do not celebrate every correct field)
   - Error: red border + error message below the field + icon
   - Warning: amber for advisory messages that do not block submission
3. Write error messages following the pattern: "What went wrong" + "How to fix it" (e.g., "Email format is invalid. Enter an email like name@example.com")
4. Design the error summary for submit-time errors: scroll to top, show summary with jump-links to each error field
5. Implement forgiving format patterns: accept multiple phone formats, auto-format as user types, trim whitespace
6. Design recovery for data loss: auto-save draft, warn on page leave, session timeout recovery
7. Handle server-side errors: connection failure, timeout, duplicate submission, permission errors

### Phase 3: Flow, Layout, and Responsiveness
1. Decide form structure:
   - **Single page**: best for short forms (under 8 fields) or high-motivation contexts
   - **Multi-step wizard**: best for long forms (8+ fields) or when sections are distinct
   - **Accordion sections**: best for moderate forms where context switching should be visible
2. For multi-step wizards, design:
   - Step indicator showing current position and total steps
   - Back/next navigation with data persistence between steps
   - Summary/review step before final submission
   - Allow non-linear navigation (jump to previous steps) where possible
3. Design the form layout:
   - Single column layout (proven to be fastest for completion)
   - Label placement: above field (fastest to scan) or left-aligned (saves vertical space for long forms)
   - Field width should match expected input length (zip code narrow, address wide)
   - Group related fields in rows when semantically connected (first name + last name, city + state + zip)
4. Design responsive form behavior:
   - Stack fields vertically on mobile, maintain single-column
   - Ensure touch targets are at least 44px
   - Use native mobile inputs where appropriate (numeric keyboard for phone, email keyboard for email)
5. Design the submission experience: loading state on submit button, success confirmation, clear next action
6. Create the complete form specification with annotated wireframe showing all fields, validations, and interactions

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| field-map | markdown table | All fields with type, input control, validation rules, and grouping |
| validation-spec | markdown | Validation timing, error message patterns, and recovery mechanisms |
| flow-diagram | markdown | Form structure (single/multi-step) with navigation and step descriptions |
| form-layout-spec | markdown | Layout decisions with responsive behavior and accessibility annotations |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Field completeness | blocking | Every required data field must have an assigned input type and validation rule |
| Error messages | blocking | Every validation rule must have a corresponding user-friendly error message |
| Validation timing | blocking | Validation timing (blur, submit, realtime) must be specified for each field |
| Progressive disclosure | warning | Conditional fields must have their trigger conditions documented |
| Responsive layout | warning | Mobile form behavior must be specified separately from desktop |
| Accessibility inputs | warning | Input types must support keyboard navigation and screen reader labeling |

---

## Handoff

- **On completion:** Hand to @brad-frost for form component implementation in the design system
- **On accessibility:** Hand to @stephanie-walter for form accessibility annotation and testing
- **On component specs:** Hand to @nathan-curtis for form component specification
- **On navigation (wizard flows):** Hand to @jenifer-tidwell (navigation-analysis) for flow integration
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design tokens** — Platform-agnostic key-value pairs encoding design decisions
- **Design system** — Tokens, components, patterns, guidelines, and tooling for UI consistency
- **Component API** — Props interface defining how a component is consumed

---

## Don't Do

- Do not skip reading the full task specification before executing
- Do not create from scratch when similar patterns exist in the design system
- Do not hardcode values that should be design tokens
- Do not skip validation steps defined in the task workflow

