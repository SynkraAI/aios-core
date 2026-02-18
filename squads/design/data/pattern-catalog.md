# UI Pattern Catalog Index

**ID:** pattern-catalog
**Version:** 1.0
**Purpose:** Comprehensive catalog of common UI patterns organized by category with usage guidance and references
**Maintained By:** @jenifer-tidwell

---

## Category: Navigation

Patterns that help users move through content, understand where they are, and find what they need.

| Pattern | When to Use | When NOT to Use | Complexity |
|---------|-------------|-----------------|------------|
| **Global Navigation Bar** | Every application — persistent top or side navigation | Single-page micro-apps with no sections | Low |
| **Breadcrumbs** | Hierarchical content deeper than 2 levels | Flat or single-level navigation structures | Low |
| **Tabs** | 2-7 peer sections of content within a page | More than 7 items; use a different pattern | Low |
| **Sidebar Navigation** | Applications with 10+ sections or deep hierarchy | Simple apps with < 5 sections | Medium |
| **Wizard / Stepper** | Multi-step linear processes (checkout, onboarding) | Non-linear tasks where order does not matter | Medium |
| **Pagination** | Lists or tables with 20+ items on a page | Content that benefits from infinite scroll | Low |
| **Infinite Scroll** | Feed-style content (social, news, search results) | Finite datasets where users need to reach the footer | Medium |
| **Mega Menu** | Large sites with many categories and subcategories | Simple sites with < 10 navigation items | High |
| **Bottom Navigation** | Mobile apps with 3-5 top-level sections | Web applications or apps with 6+ sections | Low |
| **Command Palette** | Power users in productivity tools (Cmd+K) | Consumer-facing apps targeting non-technical users | High |

---

## Category: Input

Patterns that capture user data, preferences, and decisions.

| Pattern | When to Use | When NOT to Use | Complexity |
|---------|-------------|-----------------|------------|
| **Single-Line Input** | Short text: name, email, phone, search query | Multi-line content (use Textarea) | Low |
| **Textarea** | Multi-line text: comments, descriptions, messages | Short single-value inputs | Low |
| **Select / Dropdown** | Choose 1 from 5-15 predefined options | < 5 options (use radio) or > 15 (use autocomplete) | Low |
| **Autocomplete / Combobox** | Large option sets (cities, products, users) | Small predefined lists (< 10 items) | High |
| **Search Box** | Finding content across the application | Filtering a small, visible list (use filter) | Medium |
| **Filter Panel** | Narrowing a dataset by multiple criteria | Single-criterion selection | Medium |
| **Date Picker** | Selecting a single date or date range | Free-form date input where format varies | High |
| **File Upload** | Users need to attach documents, images, or files | Text-only input scenarios | Medium |
| **Toggle / Switch** | Binary on/off settings with immediate effect | Yes/No questions in forms (use checkbox) | Low |
| **Checkbox Group** | Multi-select from a small set (< 10 options) | Single selection (use radio) | Low |
| **Radio Group** | Single selection from 2-5 visible options | Large option sets (use select or autocomplete) | Low |
| **Slider** | Numeric range selection where precision is not critical | Exact numeric input (use number input) | Medium |
| **Inline Edit** | Quick edits without navigating to a form | Complex multi-field edits | Medium |

---

## Category: Display

Patterns that present content, data, and information to users.

| Pattern | When to Use | When NOT to Use | Complexity |
|---------|-------------|-----------------|------------|
| **Card** | Browsable collections of heterogeneous items | Dense data that needs column alignment (use table) | Low |
| **List** | Ordered or sequential items with consistent structure | Rich multi-attribute items (use cards or table) | Low |
| **Data Table** | Structured data with multiple attributes per row | Small datasets (< 5 rows) or non-tabular data | High |
| **Gallery / Grid** | Visual content: images, products, portfolios | Text-heavy content without visual elements | Medium |
| **Modal / Dialog** | Focused tasks requiring immediate attention or input | Information that the user needs to reference while working | Medium |
| **Drawer / Side Panel** | Supplementary content or detail without losing context | Primary content that should be in the main view | Medium |
| **Accordion** | Show/hide sections of content to reduce overwhelm | Content that users need to see simultaneously | Low |
| **Carousel / Slider** | Showcasing featured content when space is limited | Critical content that all users must see | Medium |
| **Timeline** | Chronological events or activity history | Non-sequential data | Medium |
| **Tree View** | Hierarchical data with parent-child relationships | Flat lists or shallow structures | High |
| **Detail Page** | Complete view of a single object with all attributes | Comparison views (use table or cards) | Medium |
| **Empty State** | Container has no content yet | Never skip this — always design the empty case | Low |

---

## Category: Feedback

Patterns that communicate system status, results, and responses to the user.

| Pattern | When to Use | When NOT to Use | Complexity |
|---------|-------------|-----------------|------------|
| **Toast / Snackbar** | Brief, non-critical confirmations (saved, copied) | Errors that require user action | Low |
| **Alert / Banner** | Important messages that persist until dismissed or resolved | Transient confirmations (use toast) | Low |
| **Inline Validation** | Real-time feedback on form field validity | Batch validation after form submission | Medium |
| **Progress Bar** | Determinate progress (file upload, multi-step process) | Indeterminate waits (use spinner) | Low |
| **Spinner / Loading** | Indeterminate wait times (< 10 seconds typical) | Long waits (use progress bar or skeleton) | Low |
| **Skeleton Screen** | Content is loading and layout is predictable | Error states or empty states | Medium |
| **Confirmation Dialog** | Destructive or irreversible actions (delete, publish) | Routine, easily undoable actions | Low |
| **Tooltip** | Additional context for an element on hover/focus | Essential information (always visible instead) | Low |
| **Notification Badge** | Indicating unread items or pending actions | Decorative purposes or non-actionable counts | Low |
| **Error Page** | Full-page errors (404, 500, offline) | Field-level or section-level errors | Low |
| **Success Page** | End of a significant flow (order complete, registration done) | Minor confirmations (use toast) | Low |
| **Help / Contextual Help** | Complex features that need explanation | Simple, self-evident UI elements | Medium |

---

## Pattern Selection Decision Tree

```
Is the user navigating between sections?
  YES --> Navigation patterns
  NO  --> Is the user providing input?
            YES --> Input patterns
            NO  --> Is the system showing content?
                      YES --> Display patterns
                      NO  --> Feedback patterns
```

---

## Pattern Combination Guidelines

| Scenario | Recommended Pattern Combination |
|----------|--------------------------------|
| Product listing page | Global Nav + Filter Panel + Card Grid + Pagination |
| Settings page | Sidebar Nav + Tabs + Toggle/Checkbox Groups + Toast |
| Checkout flow | Wizard/Stepper + Form Inputs + Inline Validation + Confirmation |
| Dashboard | Global Nav + Cards + Data Table + Charts + Skeleton Loading |
| Search experience | Search Box + Filter Panel + List/Cards + Pagination + Empty State |
| Content management | Sidebar Nav + Data Table + Modal (edit) + Toast + Confirmation |

---

## References

- Jenifer Tidwell, "Designing Interfaces" (3rd Edition)
- UI Patterns (ui-patterns.com)
- Material Design Pattern Library (material.io)
- Carbon Design System Patterns (carbondesignsystem.com)
- Atlassian Design System Patterns (atlassian.design)
