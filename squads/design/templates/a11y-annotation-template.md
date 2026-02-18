# Template: Accessibility Annotation

**Template ID:** a11y-annotation-template
**Version:** 1.0
**Output Format:** markdown
**Used By:** @ds-a11y

---

## Purpose

Produces accessibility annotations for design mockups, following Stephanie Walter's approach. Use this template to overlay accessibility information on visual designs before handoff to development, documenting heading structure, tab order, ARIA landmarks, alt text, form labels, error messages, and focus indicators.

---

## Template

# Accessibility Annotations: {{screen_name}}

**Design File:** {{design_file_url}}
**Annotator:** {{annotator_name}}
**Date:** {{annotation_date}}
**Status:** {{annotation_status}}

---

## 1. Screen / Component Overview

| Field | Value |
|---|---|
| Screen Name | {{screen_name}} |
| Page Type | {{page_type}} |
| Primary Purpose | {{primary_purpose}} |
| User Flow | {{user_flow}} |
| WCAG Target | {{wcag_level}} |

---

## 2. Heading Structure (H1-H6 Hierarchy)

```
H1: {{h1_text}}
  H2: {{h2_1_text}}
    H3: {{h3_1_text}}
    H3: {{h3_2_text}}
  H2: {{h2_2_text}}
    H3: {{h3_3_text}}
      H4: {{h4_1_text}}
    H3: {{h3_4_text}}
  H2: {{h2_3_text}}
```

### Heading Notes

- {{heading_note_1}}
- {{heading_note_2}}
- {{heading_note_3}}

---

## 3. Tab Order

Sequential focus order through interactive elements on the page.

| # | Element | Type | Visible Label | Notes |
|---|---|---|---|---|
| 1 | {{tab_element_1}} | {{tab_type_1}} | {{tab_label_1}} | {{tab_notes_1}} |
| 2 | {{tab_element_2}} | {{tab_type_2}} | {{tab_label_2}} | {{tab_notes_2}} |
| 3 | {{tab_element_3}} | {{tab_type_3}} | {{tab_label_3}} | {{tab_notes_3}} |
| 4 | {{tab_element_4}} | {{tab_type_4}} | {{tab_label_4}} | {{tab_notes_4}} |
| 5 | {{tab_element_5}} | {{tab_type_5}} | {{tab_label_5}} | {{tab_notes_5}} |
| 6 | {{tab_element_6}} | {{tab_type_6}} | {{tab_label_6}} | {{tab_notes_6}} |
| 7 | {{tab_element_7}} | {{tab_type_7}} | {{tab_label_7}} | {{tab_notes_7}} |
| 8 | {{tab_element_8}} | {{tab_type_8}} | {{tab_label_8}} | {{tab_notes_8}} |

### Tab Order Notes

- {{tab_order_note_1}}
- {{tab_order_note_2}}

---

## 4. ARIA Landmarks

| Landmark | Role | Label | Contains |
|---|---|---|---|
| {{landmark_1_area}} | `{{landmark_1_role}}` | `{{landmark_1_label}}` | {{landmark_1_contains}} |
| {{landmark_2_area}} | `{{landmark_2_role}}` | `{{landmark_2_label}}` | {{landmark_2_contains}} |
| {{landmark_3_area}} | `{{landmark_3_role}}` | `{{landmark_3_label}}` | {{landmark_3_contains}} |
| {{landmark_4_area}} | `{{landmark_4_role}}` | `{{landmark_4_label}}` | {{landmark_4_contains}} |
| {{landmark_5_area}} | `{{landmark_5_role}}` | `{{landmark_5_label}}` | {{landmark_5_contains}} |

---

## 5. Alt Text for Images

| Image Location | Image Description | Alt Text | Decorative |
|---|---|---|---|
| {{img_location_1}} | {{img_desc_1}} | `{{img_alt_1}}` | Yes / No |
| {{img_location_2}} | {{img_desc_2}} | `{{img_alt_2}}` | Yes / No |
| {{img_location_3}} | {{img_desc_3}} | `{{img_alt_3}}` | Yes / No |

### Alt Text Guidelines Applied

- {{alt_guideline_1}}
- {{alt_guideline_2}}

---

## 6. Form Labels

| Form Field | Visible Label | `aria-label` / `aria-labelledby` | Help Text | Required |
|---|---|---|---|---|
| {{field_1}} | {{label_1}} | {{aria_label_1}} | {{help_1}} | Yes / No |
| {{field_2}} | {{label_2}} | {{aria_label_2}} | {{help_2}} | Yes / No |
| {{field_3}} | {{label_3}} | {{aria_label_3}} | {{help_3}} | Yes / No |
| {{field_4}} | {{label_4}} | {{aria_label_4}} | {{help_4}} | Yes / No |

### Label Association Method

{{label_method}}

---

## 7. Error Message Locations

| Field / Area | Error Condition | Error Message | Location | Association Method |
|---|---|---|---|---|
| {{error_field_1}} | {{error_cond_1}} | "{{error_msg_1}}" | {{error_loc_1}} | `aria-describedby` / `aria-errormessage` |
| {{error_field_2}} | {{error_cond_2}} | "{{error_msg_2}}" | {{error_loc_2}} | `aria-describedby` / `aria-errormessage` |
| {{error_field_3}} | {{error_cond_3}} | "{{error_msg_3}}" | {{error_loc_3}} | `aria-describedby` / `aria-errormessage` |

### Error Summary

- **Location:** {{error_summary_location}}
- **Auto-focus on submit:** {{error_auto_focus}}
- **Live region:** {{error_live_region}}

---

## 8. Focus Indicators

| Element | Default Focus Style | Custom Focus Style | Contrast Ratio |
|---|---|---|---|
| {{focus_elem_1}} | {{default_focus_1}} | {{custom_focus_1}} | {{focus_ratio_1}} |
| {{focus_elem_2}} | {{default_focus_2}} | {{custom_focus_2}} | {{focus_ratio_2}} |
| {{focus_elem_3}} | {{default_focus_3}} | {{custom_focus_3}} | {{focus_ratio_3}} |

### Focus Style Notes

- {{focus_note_1}}
- {{focus_note_2}}

---

## 9. Additional Annotations

### Skip Links

- {{skip_link_1}}
- {{skip_link_2}}

### Language Attributes

- **Page language:** `{{page_lang}}`
- **Sections in different language:** {{lang_sections}}

### Live Regions

| Region | Purpose | `aria-live` Value |
|---|---|---|
| {{live_region_1}} | {{live_purpose_1}} | {{live_value_1}} |

---

*Generated by AIOS Design Squad — Accessibility Annotation Template v1.0*
