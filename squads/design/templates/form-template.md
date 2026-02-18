# Template: Form Design Specification

**Template ID:** form-template
**Version:** 1.0
**Output Format:** markdown
**Used By:** @ds-analyst

---

## Purpose

Produces a form design specification following Jenifer Tidwell's patterns for UI design. Use this template when designing forms of any complexity, documenting field inventory, grouping, progressive disclosure, validation rules, error handling patterns, success feedback, and multi-step flows.

---

## Template

# Form Specification: {{form_name}}

**Purpose:** {{form_purpose}}
**Version:** {{form_version}}
**Owner:** {{form_owner}}
**Status:** {{form_status}}

---

## 1. Form Purpose

{{form_purpose_description}}

### User Goal

{{user_goal}}

### Success Criteria

- {{success_criterion_1}}
- {{success_criterion_2}}
- {{success_criterion_3}}

### Completion Rate Target

{{completion_rate_target}}

---

## 2. Field Inventory

| # | Label | Field Type | Validation Rules | Help Text | Required | Default |
|---|---|---|---|---|---|---|
| 1 | {{field_label_1}} | {{field_type_1}} | {{field_validation_1}} | {{field_help_1}} | Yes / No | {{field_default_1}} |
| 2 | {{field_label_2}} | {{field_type_2}} | {{field_validation_2}} | {{field_help_2}} | Yes / No | {{field_default_2}} |
| 3 | {{field_label_3}} | {{field_type_3}} | {{field_validation_3}} | {{field_help_3}} | Yes / No | {{field_default_3}} |
| 4 | {{field_label_4}} | {{field_type_4}} | {{field_validation_4}} | {{field_help_4}} | Yes / No | {{field_default_4}} |
| 5 | {{field_label_5}} | {{field_type_5}} | {{field_validation_5}} | {{field_help_5}} | Yes / No | {{field_default_5}} |
| 6 | {{field_label_6}} | {{field_type_6}} | {{field_validation_6}} | {{field_help_6}} | Yes / No | {{field_default_6}} |
| 7 | {{field_label_7}} | {{field_type_7}} | {{field_validation_7}} | {{field_help_7}} | Yes / No | {{field_default_7}} |
| 8 | {{field_label_8}} | {{field_type_8}} | {{field_validation_8}} | {{field_help_8}} | Yes / No | {{field_default_8}} |

### Field Type Legend

| Type | HTML Element | Input Type |
|---|---|---|
| Text | `<input>` | `text` |
| Email | `<input>` | `email` |
| Password | `<input>` | `password` |
| Number | `<input>` | `number` |
| Phone | `<input>` | `tel` |
| Date | `<input>` | `date` |
| Select | `<select>` | — |
| Textarea | `<textarea>` | — |
| Checkbox | `<input>` | `checkbox` |
| Radio | `<input>` | `radio` |
| File | `<input>` | `file` |

---

## 3. Grouping and Sections

| Section | Label | Fields Included | Collapsible |
|---|---|---|---|
| {{section_1}} | {{section_label_1}} | {{section_fields_1}} | Yes / No |
| {{section_2}} | {{section_label_2}} | {{section_fields_2}} | Yes / No |
| {{section_3}} | {{section_label_3}} | {{section_fields_3}} | Yes / No |

### Section Order Rationale

{{section_order_rationale}}

---

## 4. Progressive Disclosure Rules

| Trigger Field | Trigger Value | Fields Revealed | Animation |
|---|---|---|---|
| {{trigger_field_1}} | {{trigger_value_1}} | {{revealed_fields_1}} | {{animation_1}} |
| {{trigger_field_2}} | {{trigger_value_2}} | {{revealed_fields_2}} | {{animation_2}} |
| {{trigger_field_3}} | {{trigger_value_3}} | {{revealed_fields_3}} | {{animation_3}} |

### Disclosure Notes

- {{disclosure_note_1}}
- {{disclosure_note_2}}

---

## 5. Error Handling Patterns

### Validation Timing

| Strategy | When Applied | Fields |
|---|---|---|
| Inline (on blur) | {{inline_when}} | {{inline_fields}} |
| On submit | {{submit_when}} | {{submit_fields}} |
| Real-time (on input) | {{realtime_when}} | {{realtime_fields}} |

### Error Messages

| Field | Condition | Error Message | Suggestion |
|---|---|---|---|
| {{err_field_1}} | {{err_condition_1}} | "{{err_message_1}}" | "{{err_suggestion_1}}" |
| {{err_field_2}} | {{err_condition_2}} | "{{err_message_2}}" | "{{err_suggestion_2}}" |
| {{err_field_3}} | {{err_condition_3}} | "{{err_message_3}}" | "{{err_suggestion_3}}" |
| {{err_field_4}} | {{err_condition_4}} | "{{err_message_4}}" | "{{err_suggestion_4}}" |

### Error Summary

- **Position:** {{error_summary_position}}
- **Behavior:** {{error_summary_behavior}}
- **Focus management:** {{error_focus_management}}

---

## 6. Success Feedback

| Type | Message | Duration | Next Action |
|---|---|---|---|
| Inline | "{{success_inline}}" | {{inline_duration}} | {{inline_next}} |
| Toast / Banner | "{{success_toast}}" | {{toast_duration}} | {{toast_next}} |
| Page redirect | — | — | {{redirect_url}} |

### Confirmation Pattern

{{confirmation_pattern}}

---

## 7. Multi-Step Flow (if applicable)

### Step Overview

| Step | Title | Fields | Can Skip | Can Return |
|---|---|---|---|---|
| 1 | {{step_1_title}} | {{step_1_fields}} | No | — |
| 2 | {{step_2_title}} | {{step_2_fields}} | Yes / No | Yes |
| 3 | {{step_3_title}} | {{step_3_fields}} | Yes / No | Yes |
| 4 | {{step_4_title}} | {{step_4_fields}} | Yes / No | Yes |

### Progress Indicator

- **Type:** {{progress_type}}
- **Shows step labels:** {{progress_labels}}
- **Clickable steps:** {{progress_clickable}}

### Data Persistence

- **Save draft:** {{save_draft}}
- **Auto-save interval:** {{auto_save_interval}}
- **Resume capability:** {{resume_capability}}

---

## 8. Accessibility Notes

- **Form `aria-label`:** `{{form_aria_label}}`
- **Required field indicator:** {{required_indicator}}
- **Error announcement method:** {{error_announcement}}
- **Fieldset/Legend usage:** {{fieldset_usage}}
- **Autocomplete attributes:** {{autocomplete_usage}}

---

## 9. Responsive Behavior

| Breakpoint | Layout Changes |
|---|---|
| Mobile (< 640px) | {{mobile_layout}} |
| Tablet (640-1024px) | {{tablet_layout}} |
| Desktop (> 1024px) | {{desktop_layout}} |

---

*Generated by AIOS Design Squad — Form Design Specification Template v1.0*
