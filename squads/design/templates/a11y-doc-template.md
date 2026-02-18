# Template: Accessibility Documentation

**Template ID:** a11y-doc-template
**Version:** 1.0
**Output Format:** markdown
**Used By:** @ds-a11y

---

## Purpose

Produces comprehensive accessibility documentation for a component. Use this template to document WCAG criteria, keyboard interactions, screen reader behavior, focus management, color requirements, motion policies, and testing procedures, following Stephanie Walter's approach to accessibility documentation.

---

## Template

# Accessibility Documentation: {{component_name}}

**WCAG Target Level:** {{wcag_level}}
**Last Audited:** {{audit_date}}
**Auditor:** {{auditor_name}}
**Status:** {{a11y_status}}

---

## 1. WCAG Criteria Applicable

| WCAG Criterion | Level | Description | Status |
|---|---|---|---|
| {{criterion_1_id}} | {{criterion_1_level}} | {{criterion_1_desc}} | Pass / Fail / N/A |
| {{criterion_2_id}} | {{criterion_2_level}} | {{criterion_2_desc}} | Pass / Fail / N/A |
| {{criterion_3_id}} | {{criterion_3_level}} | {{criterion_3_desc}} | Pass / Fail / N/A |
| {{criterion_4_id}} | {{criterion_4_level}} | {{criterion_4_desc}} | Pass / Fail / N/A |
| {{criterion_5_id}} | {{criterion_5_level}} | {{criterion_5_desc}} | Pass / Fail / N/A |
| {{criterion_6_id}} | {{criterion_6_level}} | {{criterion_6_desc}} | Pass / Fail / N/A |

---

## 2. Keyboard Interactions

| Key | Action | Context | Notes |
|---|---|---|---|
| Tab | {{tab_action}} | {{tab_context}} | {{tab_notes}} |
| Shift + Tab | {{shift_tab_action}} | {{shift_tab_context}} | {{shift_tab_notes}} |
| Enter | {{enter_action}} | {{enter_context}} | {{enter_notes}} |
| Space | {{space_action}} | {{space_context}} | {{space_notes}} |
| Escape | {{escape_action}} | {{escape_context}} | {{escape_notes}} |
| Arrow Keys | {{arrow_action}} | {{arrow_context}} | {{arrow_notes}} |
| Home / End | {{home_end_action}} | {{home_end_context}} | {{home_end_notes}} |

### Keyboard Pattern Reference

{{keyboard_pattern_name}} — {{keyboard_pattern_url}}

---

## 3. Screen Reader Announcements

| Trigger | Announcement | ARIA Mechanism | Tested With |
|---|---|---|---|
| {{sr_trigger_1}} | "{{sr_text_1}}" | {{sr_mechanism_1}} | {{sr_tested_1}} |
| {{sr_trigger_2}} | "{{sr_text_2}}" | {{sr_mechanism_2}} | {{sr_tested_2}} |
| {{sr_trigger_3}} | "{{sr_text_3}}" | {{sr_mechanism_3}} | {{sr_tested_3}} |
| {{sr_trigger_4}} | "{{sr_text_4}}" | {{sr_mechanism_4}} | {{sr_tested_4}} |

### Live Region Configuration

| Region | `aria-live` | `aria-atomic` | Content Updates |
|---|---|---|---|
| {{region_1}} | {{live_1}} | {{atomic_1}} | {{updates_1}} |

---

## 4. Focus Management Rules

| Scenario | Focus Target | Method | Restore To |
|---|---|---|---|
| Component opens | {{open_focus}} | {{open_method}} | — |
| Component closes | {{close_focus}} | {{close_method}} | {{close_restore}} |
| Error occurs | {{error_focus}} | {{error_method}} | — |
| Content updates | {{update_focus}} | {{update_method}} | — |

### Focus Trap

- **Required:** {{focus_trap_required}}
- **Implementation:** {{focus_trap_method}}
- **Escape mechanism:** {{focus_trap_escape}}

### Focus Indicator

- **Style:** {{focus_style}}
- **Contrast ratio:** {{focus_contrast}}
- **Visible in all themes:** {{focus_themes}}

---

## 5. Color and Contrast Requirements

| Element | Foreground | Background | Required Ratio | Actual Ratio | Status |
|---|---|---|---|---|---|
| {{color_element_1}} | {{fg_1}} | {{bg_1}} | {{required_1}} | {{actual_1}} | Pass / Fail |
| {{color_element_2}} | {{fg_2}} | {{bg_2}} | {{required_2}} | {{actual_2}} | Pass / Fail |
| {{color_element_3}} | {{fg_3}} | {{bg_3}} | {{required_3}} | {{actual_3}} | Pass / Fail |

### Non-Color Indicators

| State | Color Indicator | Non-Color Indicator |
|---|---|---|
| {{state_1}} | {{color_ind_1}} | {{non_color_ind_1}} |
| {{state_2}} | {{color_ind_2}} | {{non_color_ind_2}} |

---

## 6. Motion and Animation Policy

| Animation | Duration | Purpose | Reduced Motion Behavior |
|---|---|---|---|
| {{anim_1}} | {{duration_1}} | {{purpose_1}} | {{reduced_1}} |
| {{anim_2}} | {{duration_2}} | {{purpose_2}} | {{reduced_2}} |

### `prefers-reduced-motion` Implementation

```css
{{reduced_motion_css}}
```

---

## 7. Testing Procedures

### Automated Tests

| Tool | Test | Expected Result |
|---|---|---|
| {{auto_tool_1}} | {{auto_test_1}} | {{auto_result_1}} |
| {{auto_tool_2}} | {{auto_test_2}} | {{auto_result_2}} |

### Manual Tests

| # | Test Description | Steps | Expected | Result |
|---|---|---|---|---|
| 1 | {{manual_test_1}} | {{manual_steps_1}} | {{manual_expected_1}} | Pass / Fail |
| 2 | {{manual_test_2}} | {{manual_steps_2}} | {{manual_expected_2}} | Pass / Fail |
| 3 | {{manual_test_3}} | {{manual_steps_3}} | {{manual_expected_3}} | Pass / Fail |

### Screen Reader Test Matrix

| Screen Reader | Browser | OS | Result |
|---|---|---|---|
| VoiceOver | Safari | macOS | Pass / Fail |
| NVDA | Firefox | Windows | Pass / Fail |
| JAWS | Chrome | Windows | Pass / Fail |
| TalkBack | Chrome | Android | Pass / Fail |

---

## 8. Known Issues

| Issue | Severity | Workaround | Fix Planned |
|---|---|---|---|
| {{issue_1}} | {{severity_1}} | {{workaround_1}} | {{fix_date_1}} |

---

*Generated by AIOS Design Squad — Accessibility Documentation Template v1.0*
