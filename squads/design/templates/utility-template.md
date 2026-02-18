# Template: Utility Class System Specification

**Template ID:** utility-template
**Version:** 1.0
**Output Format:** markdown
**Used By:** @ds-frontend

---

## Purpose

Produces a utility class system specification following Andy Bell's approach. Use this template to define single-purpose CSS utility classes organized by category, with naming conventions, responsive variants, and generation rules from design tokens.

---

## Template

# Utility Class System: {{system_name}}

**Version:** {{spec_version}}
**Author:** {{author}}
**Status:** {{spec_status}}
**Date:** {{spec_date}}

---

## 1. System Overview

{{system_overview}}

### Principles

- Each utility class does exactly one thing
- Utilities map directly to design tokens
- Utilities apply via class attribute, not custom CSS
- Utilities are generated, not handwritten

---

## 2. Spacing Utilities

| Class Name | Property | Value | Token |
|---|---|---|---|
| `.{{space_class_1}}` | {{space_prop_1}} | {{space_val_1}} | `{{space_token_1}}` |
| `.{{space_class_2}}` | {{space_prop_2}} | {{space_val_2}} | `{{space_token_2}}` |
| `.{{space_class_3}}` | {{space_prop_3}} | {{space_val_3}} | `{{space_token_3}}` |
| `.{{space_class_4}}` | {{space_prop_4}} | {{space_val_4}} | `{{space_token_4}}` |
| `.{{space_class_5}}` | {{space_prop_5}} | {{space_val_5}} | `{{space_token_5}}` |
| `.{{space_class_6}}` | {{space_prop_6}} | {{space_val_6}} | `{{space_token_6}}` |

---

## 3. Color Utilities

| Class Name | Property | Value | Token |
|---|---|---|---|
| `.{{color_class_1}}` | {{color_prop_1}} | {{color_val_1}} | `{{color_token_1}}` |
| `.{{color_class_2}}` | {{color_prop_2}} | {{color_val_2}} | `{{color_token_2}}` |
| `.{{color_class_3}}` | {{color_prop_3}} | {{color_val_3}} | `{{color_token_3}}` |
| `.{{color_class_4}}` | {{color_prop_4}} | {{color_val_4}} | `{{color_token_4}}` |
| `.{{color_class_5}}` | {{color_prop_5}} | {{color_val_5}} | `{{color_token_5}}` |
| `.{{color_class_6}}` | {{color_prop_6}} | {{color_val_6}} | `{{color_token_6}}` |

---

## 4. Typography Utilities

| Class Name | Property | Value | Token |
|---|---|---|---|
| `.{{type_class_1}}` | {{type_prop_1}} | {{type_val_1}} | `{{type_token_1}}` |
| `.{{type_class_2}}` | {{type_prop_2}} | {{type_val_2}} | `{{type_token_2}}` |
| `.{{type_class_3}}` | {{type_prop_3}} | {{type_val_3}} | `{{type_token_3}}` |
| `.{{type_class_4}}` | {{type_prop_4}} | {{type_val_4}} | `{{type_token_4}}` |
| `.{{type_class_5}}` | {{type_prop_5}} | {{type_val_5}} | `{{type_token_5}}` |

---

## 5. Layout Utilities

| Class Name | Property | Value | Token |
|---|---|---|---|
| `.{{layout_class_1}}` | {{layout_prop_1}} | {{layout_val_1}} | `{{layout_token_1}}` |
| `.{{layout_class_2}}` | {{layout_prop_2}} | {{layout_val_2}} | `{{layout_token_2}}` |
| `.{{layout_class_3}}` | {{layout_prop_3}} | {{layout_val_3}} | `{{layout_token_3}}` |
| `.{{layout_class_4}}` | {{layout_prop_4}} | {{layout_val_4}} | `{{layout_token_4}}` |

---

## 6. Responsive Variants

### Naming Convention

**Pattern:** `{{responsive_prefix}}:{{utility_name}}`

| Prefix | Breakpoint | Min-Width |
|---|---|---|
| `{{bp_prefix_1}}` | {{bp_name_1}} | {{bp_value_1}} |
| `{{bp_prefix_2}}` | {{bp_name_2}} | {{bp_value_2}} |
| `{{bp_prefix_3}}` | {{bp_name_3}} | {{bp_value_3}} |

### Example

```html
{{responsive_example_html}}
```

### Which Utilities Have Responsive Variants

| Category | Has Responsive Variants | Reason |
|---|---|---|
| Spacing | {{spacing_responsive}} | {{spacing_reason}} |
| Color | {{color_responsive}} | {{color_reason}} |
| Typography | {{type_responsive}} | {{type_reason}} |
| Layout | {{layout_responsive}} | {{layout_reason}} |

---

## 7. Naming Convention

### Pattern

`{{naming_pattern}}`

### Rules

| Rule | Description | Example |
|---|---|---|
| Property abbreviation | {{prop_abbrev_rule}} | {{prop_abbrev_example}} |
| Value representation | {{value_repr_rule}} | {{value_repr_example}} |
| Negative values | {{negative_rule}} | {{negative_example}} |
| Custom values | {{custom_rule}} | {{custom_example}} |

### Naming Examples

| What It Does | Class Name |
|---|---|
| {{naming_desc_1}} | `.{{naming_class_1}}` |
| {{naming_desc_2}} | `.{{naming_class_2}}` |
| {{naming_desc_3}} | `.{{naming_class_3}}` |
| {{naming_desc_4}} | `.{{naming_class_4}}` |

---

## 8. Generation Rules

### Source

Utilities are generated from: `{{token_source_file}}`

### Build Process

```
{{generation_pipeline}}
```

### Configuration

```{{config_language}}
{{generation_config}}
```

### Output Files

| File | Contains | Format |
|---|---|---|
| `{{output_file_1}}` | {{output_contents_1}} | {{output_format_1}} |
| `{{output_file_2}}` | {{output_contents_2}} | {{output_format_2}} |

---

## 9. Usage Guidelines

### Do

- {{do_1}}
- {{do_2}}
- {{do_3}}

### Don't

- {{dont_1}}
- {{dont_2}}
- {{dont_3}}

### Class Order Convention

When applying multiple utilities, follow this order:
1. Layout utilities
2. Spacing utilities
3. Typography utilities
4. Color utilities

---

*Generated by AIOS Design Squad — Utility Class System Template v1.0*
