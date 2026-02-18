# Template: Accessibility Handoff

**Template ID:** a11y-handoff-template
**Version:** 1.0
**Output Format:** markdown
**Used By:** @ds-a11y

---

## Purpose

Produces a designer-to-developer accessibility handoff document following Stephanie Walter's approach. Use this template to provide developers with all the accessibility specifications they need to implement a component correctly, including HTML semantics, ARIA attributes, keyboard behavior, focus management, and test IDs.

---

## Template

# Accessibility Handoff: {{component_name}}

**Design File:** {{design_file_url}}
**Designer:** {{designer_name}}
**Developer:** {{developer_name}}
**Date:** {{handoff_date}}
**WCAG Target:** {{wcag_level}}

---

## 1. Component Overview

{{component_overview}}

### Expected Behavior Summary

{{behavior_summary}}

---

## 2. HTML Semantic Structure

### Recommended Markup

```html
{{recommended_html}}
```

### Semantic Decisions

| Element | Chosen Tag | Reason | Alternatives Considered |
|---|---|---|---|
| {{element_1}} | `<{{tag_1}}>` | {{reason_1}} | {{alts_1}} |
| {{element_2}} | `<{{tag_2}}>` | {{reason_2}} | {{alts_2}} |
| {{element_3}} | `<{{tag_3}}>` | {{reason_3}} | {{alts_3}} |
| {{element_4}} | `<{{tag_4}}>` | {{reason_4}} | {{alts_4}} |

### Important Notes

- {{semantic_note_1}}
- {{semantic_note_2}}

---

## 3. ARIA Attributes

### Required Attributes

| Element | Attribute | Value | Dynamic | Notes |
|---|---|---|---|---|
| {{aria_elem_1}} | `{{aria_attr_1}}` | `{{aria_val_1}}` | Yes / No | {{aria_note_1}} |
| {{aria_elem_2}} | `{{aria_attr_2}}` | `{{aria_val_2}}` | Yes / No | {{aria_note_2}} |
| {{aria_elem_3}} | `{{aria_attr_3}}` | `{{aria_val_3}}` | Yes / No | {{aria_note_3}} |
| {{aria_elem_4}} | `{{aria_attr_4}}` | `{{aria_val_4}}` | Yes / No | {{aria_note_4}} |
| {{aria_elem_5}} | `{{aria_attr_5}}` | `{{aria_val_5}}` | Yes / No | {{aria_note_5}} |

### State Management

| State | ARIA Attribute | Initial Value | Changes To | Trigger |
|---|---|---|---|---|
| {{state_1}} | `{{state_attr_1}}` | `{{state_init_1}}` | `{{state_change_1}}` | {{state_trigger_1}} |
| {{state_2}} | `{{state_attr_2}}` | `{{state_init_2}}` | `{{state_change_2}}` | {{state_trigger_2}} |
| {{state_3}} | `{{state_attr_3}}` | `{{state_init_3}}` | `{{state_change_3}}` | {{state_trigger_3}} |

---

## 4. Keyboard Interaction Specification

| Key | Action | Condition | Notes |
|---|---|---|---|
| Tab | {{tab_action}} | {{tab_condition}} | {{tab_notes}} |
| Shift + Tab | {{shift_tab_action}} | {{shift_tab_condition}} | {{shift_tab_notes}} |
| Enter | {{enter_action}} | {{enter_condition}} | {{enter_notes}} |
| Space | {{space_action}} | {{space_condition}} | {{space_notes}} |
| Escape | {{escape_action}} | {{escape_condition}} | {{escape_notes}} |
| Arrow Up | {{up_action}} | {{up_condition}} | {{up_notes}} |
| Arrow Down | {{down_action}} | {{down_condition}} | {{down_notes}} |
| Arrow Left | {{left_action}} | {{left_condition}} | {{left_notes}} |
| Arrow Right | {{right_action}} | {{right_condition}} | {{right_notes}} |
| Home | {{home_action}} | {{home_condition}} | {{home_notes}} |
| End | {{end_action}} | {{end_condition}} | {{end_notes}} |

### WAI-ARIA Pattern Reference

{{wai_aria_pattern_url}}

---

## 5. Focus Trap Rules

| Scenario | Trap Active | First Focusable | Last Focusable | Escape Mechanism |
|---|---|---|---|---|
| {{trap_scenario_1}} | Yes / No | {{trap_first_1}} | {{trap_last_1}} | {{trap_escape_1}} |
| {{trap_scenario_2}} | Yes / No | {{trap_first_2}} | {{trap_last_2}} | {{trap_escape_2}} |

### Focus Restoration

| Trigger | Return Focus To | Method |
|---|---|---|
| {{restore_trigger_1}} | {{restore_target_1}} | {{restore_method_1}} |
| {{restore_trigger_2}} | {{restore_target_2}} | {{restore_method_2}} |

---

## 6. Live Region Requirements

| Region | Purpose | `aria-live` | `aria-atomic` | `aria-relevant` | Content |
|---|---|---|---|---|---|
| {{live_1_name}} | {{live_1_purpose}} | {{live_1_value}} | {{live_1_atomic}} | {{live_1_relevant}} | {{live_1_content}} |
| {{live_2_name}} | {{live_2_purpose}} | {{live_2_value}} | {{live_2_atomic}} | {{live_2_relevant}} | {{live_2_content}} |

### Implementation Notes

- {{live_note_1}}
- {{live_note_2}}

---

## 7. Responsive Accessibility Changes

| Breakpoint | Accessibility Change | Reason |
|---|---|---|
| Mobile (< 640px) | {{mobile_a11y_change}} | {{mobile_a11y_reason}} |
| Tablet (640-1024px) | {{tablet_a11y_change}} | {{tablet_a11y_reason}} |
| Desktop (> 1024px) | {{desktop_a11y_change}} | {{desktop_a11y_reason}} |

### Touch Target Sizes

| Element | Minimum Size | Current Size | Status |
|---|---|---|---|
| {{touch_elem_1}} | 44x44px | {{touch_size_1}} | Pass / Fail |
| {{touch_elem_2}} | 44x44px | {{touch_size_2}} | Pass / Fail |

---

## 8. Automated Test IDs

| Element | Test ID | Purpose |
|---|---|---|
| {{test_elem_1}} | `data-testid="{{test_id_1}}"` | {{test_purpose_1}} |
| {{test_elem_2}} | `data-testid="{{test_id_2}}"` | {{test_purpose_2}} |
| {{test_elem_3}} | `data-testid="{{test_id_3}}"` | {{test_purpose_3}} |
| {{test_elem_4}} | `data-testid="{{test_id_4}}"` | {{test_purpose_4}} |

### Suggested Automated Tests

| Test | Tool | Assertion |
|---|---|---|
| {{auto_test_1}} | {{auto_tool_1}} | {{auto_assert_1}} |
| {{auto_test_2}} | {{auto_tool_2}} | {{auto_assert_2}} |
| {{auto_test_3}} | {{auto_tool_3}} | {{auto_assert_3}} |

---

## 9. Developer Checklist

- [ ] Semantic HTML matches specification
- [ ] All ARIA attributes implemented and tested
- [ ] Keyboard navigation works per specification
- [ ] Focus management implemented correctly
- [ ] Live regions announce content changes
- [ ] Test IDs added for automated testing
- [ ] Color contrast verified in all themes
- [ ] Responsive accessibility changes implemented
- [ ] Touch targets meet minimum size requirements
- [ ] Tested with screen reader (at least one)

---

*Generated by AIOS Design Squad — Accessibility Handoff Template v1.0*
