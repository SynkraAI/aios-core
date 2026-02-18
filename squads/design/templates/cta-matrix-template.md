# Template: CTA Matrix

**Template ID:** cta-matrix-template
**Version:** 1.0
**Output Format:** markdown
**Used By:** @ds-analyst

---

## Purpose

Produces a CTA (Call to Action) matrix following Sophia Prater's OOUX methodology. Use this template to map all actions available on each system object, categorized by CRUD operations and custom actions, with priority levels, context rules, and permission requirements.

---

## Template

# CTA Matrix: {{system_name}}

**Version:** {{matrix_version}}
**Date:** {{matrix_date}}
**Author:** {{author}}
**Status:** {{matrix_status}}

---

## 1. Objects Covered

| # | Object Name | Total CTAs |
|---|---|---|
| 1 | {{object_1}} | {{object_1_cta_count}} |
| 2 | {{object_2}} | {{object_2_cta_count}} |
| 3 | {{object_3}} | {{object_3_cta_count}} |
| 4 | {{object_4}} | {{object_4_cta_count}} |
| 5 | {{object_5}} | {{object_5_cta_count}} |

---

## 2. CTA Matrix

### Legend

- **Priority:** P = Primary, S = Secondary, T = Tertiary
- **Permissions:** Roles or conditions required to see/use the CTA

### {{object_1}}

| Action Type | CTA Label | Priority | Context | Permissions | Confirmation Required |
|---|---|---|---|---|---|
| Create | {{o1_create_label}} | {{o1_create_priority}} | {{o1_create_context}} | {{o1_create_perm}} | Yes / No |
| Read | {{o1_read_label}} | {{o1_read_priority}} | {{o1_read_context}} | {{o1_read_perm}} | No |
| Update | {{o1_update_label}} | {{o1_update_priority}} | {{o1_update_context}} | {{o1_update_perm}} | Yes / No |
| Delete | {{o1_delete_label}} | {{o1_delete_priority}} | {{o1_delete_context}} | {{o1_delete_perm}} | Yes |
| Custom | {{o1_custom_label}} | {{o1_custom_priority}} | {{o1_custom_context}} | {{o1_custom_perm}} | Yes / No |

### {{object_2}}

| Action Type | CTA Label | Priority | Context | Permissions | Confirmation Required |
|---|---|---|---|---|---|
| Create | {{o2_create_label}} | {{o2_create_priority}} | {{o2_create_context}} | {{o2_create_perm}} | Yes / No |
| Read | {{o2_read_label}} | {{o2_read_priority}} | {{o2_read_context}} | {{o2_read_perm}} | No |
| Update | {{o2_update_label}} | {{o2_update_priority}} | {{o2_update_context}} | {{o2_update_perm}} | Yes / No |
| Delete | {{o2_delete_label}} | {{o2_delete_priority}} | {{o2_delete_context}} | {{o2_delete_perm}} | Yes |
| Custom | {{o2_custom_label}} | {{o2_custom_priority}} | {{o2_custom_context}} | {{o2_custom_perm}} | Yes / No |

### {{object_3}}

| Action Type | CTA Label | Priority | Context | Permissions | Confirmation Required |
|---|---|---|---|---|---|
| Create | {{o3_create_label}} | {{o3_create_priority}} | {{o3_create_context}} | {{o3_create_perm}} | Yes / No |
| Read | {{o3_read_label}} | {{o3_read_priority}} | {{o3_read_context}} | {{o3_read_perm}} | No |
| Update | {{o3_update_label}} | {{o3_update_priority}} | {{o3_update_context}} | {{o3_update_perm}} | Yes / No |
| Delete | {{o3_delete_label}} | {{o3_delete_priority}} | {{o3_delete_context}} | {{o3_delete_perm}} | Yes |
| Custom | {{o3_custom_label}} | {{o3_custom_priority}} | {{o3_custom_context}} | {{o3_custom_perm}} | Yes / No |

### {{object_4}}

| Action Type | CTA Label | Priority | Context | Permissions | Confirmation Required |
|---|---|---|---|---|---|
| Create | {{o4_create_label}} | {{o4_create_priority}} | {{o4_create_context}} | {{o4_create_perm}} | Yes / No |
| Read | {{o4_read_label}} | {{o4_read_priority}} | {{o4_read_context}} | {{o4_read_perm}} | No |
| Update | {{o4_update_label}} | {{o4_update_priority}} | {{o4_update_context}} | {{o4_update_perm}} | Yes / No |
| Delete | {{o4_delete_label}} | {{o4_delete_priority}} | {{o4_delete_context}} | {{o4_delete_perm}} | Yes |
| Custom | {{o4_custom_label}} | {{o4_custom_priority}} | {{o4_custom_context}} | {{o4_custom_perm}} | Yes / No |

### {{object_5}}

| Action Type | CTA Label | Priority | Context | Permissions | Confirmation Required |
|---|---|---|---|---|---|
| Create | {{o5_create_label}} | {{o5_create_priority}} | {{o5_create_context}} | {{o5_create_perm}} | Yes / No |
| Read | {{o5_read_label}} | {{o5_read_priority}} | {{o5_read_context}} | {{o5_read_perm}} | No |
| Update | {{o5_update_label}} | {{o5_update_priority}} | {{o5_update_context}} | {{o5_update_perm}} | Yes / No |
| Delete | {{o5_delete_label}} | {{o5_delete_priority}} | {{o5_delete_context}} | {{o5_delete_perm}} | Yes |
| Custom | {{o5_custom_label}} | {{o5_custom_priority}} | {{o5_custom_context}} | {{o5_custom_perm}} | Yes / No |

---

## 3. CTA Priority Summary

| Priority | Total Count | Percentage |
|---|---|---|
| Primary | {{primary_count}} | {{primary_pct}}% |
| Secondary | {{secondary_count}} | {{secondary_pct}}% |
| Tertiary | {{tertiary_count}} | {{tertiary_pct}}% |

---

## 4. Permission Matrix

| Role | Create | Read | Update | Delete | Custom Actions |
|---|---|---|---|---|---|
| {{role_1}} | {{r1_create}} | {{r1_read}} | {{r1_update}} | {{r1_delete}} | {{r1_custom}} |
| {{role_2}} | {{r2_create}} | {{r2_read}} | {{r2_update}} | {{r2_delete}} | {{r2_custom}} |
| {{role_3}} | {{r3_create}} | {{r3_read}} | {{r3_update}} | {{r3_delete}} | {{r3_custom}} |

---

## 5. Contextual Rules

### Global Rules

- {{global_rule_1}}
- {{global_rule_2}}

### Conditional Visibility

| CTA | Visible When | Hidden When |
|---|---|---|
| {{cond_cta_1}} | {{visible_when_1}} | {{hidden_when_1}} |
| {{cond_cta_2}} | {{visible_when_2}} | {{hidden_when_2}} |
| {{cond_cta_3}} | {{visible_when_3}} | {{hidden_when_3}} |

---

## 6. Notes and Open Questions

- {{note_1}}
- {{note_2}}
- {{open_question_1}}

---

*Generated by AIOS Design Squad — CTA Matrix Template v1.0*
