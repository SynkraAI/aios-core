# Template: Responsive Strategy Specification

**Template ID:** responsive-template
**Version:** 1.0
**Output Format:** markdown
**Used By:** @ds-frontend

---

## Purpose

Produces a responsive strategy specification following Andy Bell's intrinsic design approach. Use this template to document the responsive behavior of a design system or product, covering breakpoints, fluid typography, container queries, intrinsic sizing, component-level responsive behavior, and testing viewports.

---

## Template

# Responsive Strategy: {{system_name}}

**Version:** {{spec_version}}
**Author:** {{author}}
**Status:** {{spec_status}}
**Date:** {{spec_date}}

---

## 1. Philosophy

{{responsive_philosophy}}

### Priorities

1. **Content-first:** {{content_first_desc}}
2. **Intrinsic over prescriptive:** {{intrinsic_desc}}
3. **Progressive enhancement:** {{progressive_desc}}

---

## 2. Breakpoint System

### Global Breakpoints (if used)

| Name | Min-Width | Purpose | Usage Notes |
|---|---|---|---|
| {{bp_name_1}} | {{bp_value_1}} | {{bp_purpose_1}} | {{bp_notes_1}} |
| {{bp_name_2}} | {{bp_value_2}} | {{bp_purpose_2}} | {{bp_notes_2}} |
| {{bp_name_3}} | {{bp_value_3}} | {{bp_purpose_3}} | {{bp_notes_3}} |
| {{bp_name_4}} | {{bp_value_4}} | {{bp_purpose_4}} | {{bp_notes_4}} |

### Breakpoint Usage Rules

- {{bp_rule_1}}
- {{bp_rule_2}}
- {{bp_rule_3}}

### Prefer Instead

| Instead Of | Use |
|---|---|
| Fixed breakpoint media query | {{prefer_1}} |
| Device-specific targeting | {{prefer_2}} |
| Pixel-based breakpoints | {{prefer_3}} |

---

## 3. Fluid Type Scale

### Scale Definition

| Step | Min Size | Max Size | Clamp Expression | Usage |
|---|---|---|---|---|
| {{step_1}} | {{min_1}} | {{max_1}} | `clamp({{clamp_1}})` | {{usage_1}} |
| {{step_2}} | {{min_2}} | {{max_2}} | `clamp({{clamp_2}})` | {{usage_2}} |
| {{step_3}} | {{min_3}} | {{max_3}} | `clamp({{clamp_3}})` | {{usage_3}} |
| {{step_4}} | {{min_4}} | {{max_4}} | `clamp({{clamp_4}})` | {{usage_4}} |
| {{step_5}} | {{min_5}} | {{max_5}} | `clamp({{clamp_5}})` | {{usage_5}} |

### Type Scale CSS

```css
{{type_scale_css}}
```

### Configuration

- **Min viewport:** {{min_viewport}}
- **Max viewport:** {{max_viewport}}
- **Scale ratio:** {{scale_ratio}}
- **Base size:** {{base_size}}

---

## 4. Container Queries Map

| Container | Name | Component(s) | Query Type |
|---|---|---|---|
| {{container_1}} | `{{container_name_1}}` | {{container_components_1}} | Size / Inline-size |
| {{container_2}} | `{{container_name_2}}` | {{container_components_2}} | Size / Inline-size |
| {{container_3}} | `{{container_name_3}}` | {{container_components_3}} | Size / Inline-size |

### Container Query Examples

```css
{{container_query_css}}
```

### Fallback for Browsers Without Container Query Support

```css
{{container_fallback_css}}
```

---

## 5. Intrinsic Sizing Rules

| Technique | Property | Implementation | Purpose |
|---|---|---|---|
| Min-max widths | `min()` / `max()` | {{minmax_impl}} | {{minmax_purpose}} |
| Clamp | `clamp()` | {{clamp_impl}} | {{clamp_purpose}} |
| Flex grow/shrink | `flex` | {{flex_impl}} | {{flex_purpose}} |
| Grid auto-fit | `auto-fit` / `auto-fill` | {{grid_impl}} | {{grid_purpose}} |
| Aspect ratio | `aspect-ratio` | {{aspect_impl}} | {{aspect_purpose}} |

### Sizing Tokens

| Token | Value | Usage |
|---|---|---|
| `{{size_token_1}}` | {{size_value_1}} | {{size_usage_1}} |
| `{{size_token_2}}` | {{size_value_2}} | {{size_usage_2}} |
| `{{size_token_3}}` | {{size_value_3}} | {{size_usage_3}} |

---

## 6. Component Responsive Behavior Matrix

| Component | Narrow (< 640px) | Medium (640-1024px) | Wide (> 1024px) | Method |
|---|---|---|---|---|
| {{comp_1}} | {{comp_1_narrow}} | {{comp_1_medium}} | {{comp_1_wide}} | {{comp_1_method}} |
| {{comp_2}} | {{comp_2_narrow}} | {{comp_2_medium}} | {{comp_2_wide}} | {{comp_2_method}} |
| {{comp_3}} | {{comp_3_narrow}} | {{comp_3_medium}} | {{comp_3_wide}} | {{comp_3_method}} |
| {{comp_4}} | {{comp_4_narrow}} | {{comp_4_medium}} | {{comp_4_wide}} | {{comp_4_method}} |
| {{comp_5}} | {{comp_5_narrow}} | {{comp_5_medium}} | {{comp_5_wide}} | {{comp_5_method}} |

---

## 7. Testing Viewports

| Device Class | Width | Height | DPR | Priority |
|---|---|---|---|---|
| Small phone | {{small_width}} | {{small_height}} | {{small_dpr}} | Critical |
| Standard phone | {{std_width}} | {{std_height}} | {{std_dpr}} | Critical |
| Large phone | {{large_width}} | {{large_height}} | {{large_dpr}} | High |
| Small tablet | {{sm_tab_width}} | {{sm_tab_height}} | {{sm_tab_dpr}} | High |
| Large tablet | {{lg_tab_width}} | {{lg_tab_height}} | {{lg_tab_dpr}} | High |
| Small desktop | {{sm_desk_width}} | {{sm_desk_height}} | {{sm_desk_dpr}} | Critical |
| Large desktop | {{lg_desk_width}} | {{lg_desk_height}} | {{lg_desk_dpr}} | Medium |
| Ultra-wide | {{ultra_width}} | {{ultra_height}} | {{ultra_dpr}} | Low |

### Testing Checklist

- [ ] No horizontal scrollbar at any viewport
- [ ] Content remains readable at all sizes
- [ ] Touch targets meet 44x44px minimum on touch devices
- [ ] Images scale without distortion
- [ ] Navigation is accessible at all breakpoints
- [ ] Forms are usable on mobile
- [ ] Modals/dialogs fit within viewport

---

*Generated by AIOS Design Squad — Responsive Strategy Template v1.0*
