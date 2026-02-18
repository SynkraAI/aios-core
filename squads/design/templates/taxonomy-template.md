# Template: Token Taxonomy Document

**Template ID:** taxonomy-template
**Version:** 1.0
**Output Format:** markdown
**Used By:** @ds-token

---

## Purpose

Produces a token taxonomy document that maps the entire token architecture from global through semantic to component tiers. Use this template to establish the naming conventions, category inventory, tier relationships, platform transformation rules, and governance model for the design token system.

---

## Template

# Token Taxonomy: {{system_name}}

**Version:** {{document_version}}
**Last Updated:** {{last_updated}}
**Owner:** {{taxonomy_owner}}

---

## 1. Tier Architecture

```
+--------------------------------------------------+
|  COMPONENT TOKENS (most specific)                |
|  button-background-hover, input-border-error     |
+--------------------------------------------------+
          |  references  |
+--------------------------------------------------+
|  SEMANTIC / ALIAS TOKENS                          |
|  color-action-primary, color-feedback-error      |
+--------------------------------------------------+
          |  references  |
+--------------------------------------------------+
|  GLOBAL TOKENS (most generic)                    |
|  color-blue-500, spacing-4, font-size-16         |
+--------------------------------------------------+
```

### Tier Rules

| Tier | Who Can Reference | Who Can Modify | Naming Pattern |
|---|---|---|---|
| Global | Semantic tokens only | {{global_modifier}} | `{{global_pattern}}` |
| Semantic | Component tokens, direct use | {{semantic_modifier}} | `{{semantic_pattern}}` |
| Component | Direct use only | {{component_modifier}} | `{{component_pattern}}` |

---

## 2. Category Inventory

| Category | Token Count | Tier Coverage | Example |
|---|---|---|---|
| Color | {{color_count}} | Global + Semantic + Component | `{{color_example}}` |
| Spacing | {{spacing_count}} | Global + Semantic | `{{spacing_example}}` |
| Typography | {{typography_count}} | Global + Semantic + Component | `{{typography_example}}` |
| Border | {{border_count}} | Global + Semantic | `{{border_example}}` |
| Shadow | {{shadow_count}} | Global + Semantic | `{{shadow_example}}` |
| Motion | {{motion_count}} | Global + Semantic | `{{motion_example}}` |
| Opacity | {{opacity_count}} | Global + Semantic | `{{opacity_example}}` |
| Z-Index | {{zindex_count}} | Semantic only | `{{zindex_example}}` |
| Breakpoint | {{breakpoint_count}} | Global only | `{{breakpoint_example}}` |

---

## 3. Naming Convention Rules

### Global Tokens

**Pattern:** `{{global_prefix}}-{category}-{scale/name}`

| Rule | Convention | Example |
|---|---|---|
| Color scale | Numeric 50-950 | `color-blue-500` |
| Spacing scale | Numeric | `spacing-4` |
| Font size | Numeric (px value) | `font-size-16` |
| Font weight | Descriptive | `font-weight-bold` |
| Border radius | Size keyword | `radius-medium` |

### Semantic Tokens

**Pattern:** `{{semantic_prefix}}-{intent}-{property}-{state}`

| Rule | Convention | Example |
|---|---|---|
| Action colors | intent + property | `color-action-background` |
| Feedback colors | feedback + severity | `color-feedback-error` |
| Surface colors | surface + hierarchy | `color-surface-primary` |
| Text colors | text + hierarchy | `color-text-secondary` |

### Component Tokens

**Pattern:** `{{component_prefix}}-{component}-{property}-{variant}-{state}`

| Rule | Convention | Example |
|---|---|---|
| Button tokens | component + property | `button-background-hover` |
| Input tokens | component + property | `input-border-focus` |
| Card tokens | component + property | `card-shadow-elevated` |

---

## 4. Relationship Map

| Semantic Token | References Global | Used By Components |
|---|---|---|
| `{{rel_semantic_1}}` | `{{rel_global_1}}` | {{rel_components_1}} |
| `{{rel_semantic_2}}` | `{{rel_global_2}}` | {{rel_components_2}} |
| `{{rel_semantic_3}}` | `{{rel_global_3}}` | {{rel_components_3}} |
| `{{rel_semantic_4}}` | `{{rel_global_4}}` | {{rel_components_4}} |

---

## 5. Platform Transformation Rules

| Platform | Format | Tool | Output File |
|---|---|---|---|
| Web (CSS) | Custom properties | {{web_tool}} | `{{web_output}}` |
| Web (SCSS) | SCSS variables | {{scss_tool}} | `{{scss_output}}` |
| Web (JS) | ES module | {{js_tool}} | `{{js_output}}` |
| iOS | Swift constants | {{ios_tool}} | `{{ios_output}}` |
| Android | XML resources | {{android_tool}} | `{{android_output}}` |
| Figma | Variables API | {{figma_tool}} | {{figma_output}} |

### Transformation Pipeline

```
Source (JSON/YAML)
    |
    v
Style Dictionary / Token Studio
    |
    +---> CSS Custom Properties
    +---> SCSS Variables
    +---> JS Module
    +---> iOS Swift
    +---> Android XML
    +---> Figma Variables
```

---

## 6. Governance

### Token Ownership

| Tier | Owner | Approval Required |
|---|---|---|
| Global | {{global_owner}} | {{global_approval}} |
| Semantic | {{semantic_owner}} | {{semantic_approval}} |
| Component | {{component_owner}} | {{component_approval}} |

### Change Process

1. {{change_step_1}}
2. {{change_step_2}}
3. {{change_step_3}}
4. {{change_step_4}}

### Deprecation Process

1. {{deprecation_step_1}}
2. {{deprecation_step_2}}
3. {{deprecation_step_3}}

---

## 7. Audit Schedule

| Audit Type | Frequency | Responsible | Artifact |
|---|---|---|---|
| Token usage audit | {{usage_frequency}} | {{usage_responsible}} | {{usage_artifact}} |
| Naming compliance | {{naming_frequency}} | {{naming_responsible}} | {{naming_artifact}} |
| Cross-platform parity | {{parity_frequency}} | {{parity_responsible}} | {{parity_artifact}} |

---

*Generated by AIOS Design Squad — Token Taxonomy Template v1.0*
