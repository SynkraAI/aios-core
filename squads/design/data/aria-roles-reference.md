# ARIA Roles Quick Reference

Practical reference for ARIA roles, states, and properties. Use semantic HTML first; reach for ARIA only when native elements cannot express the required semantics.

---

## Decision Tree: ARIA vs Semantic HTML

1. **Does a native HTML element exist?** (e.g., `<button>`, `<nav>`, `<dialog>`) -> Use it. Stop.
2. **Can you extend a native element with minimal ARIA?** -> Add the required role and states.
3. **Must you build a fully custom widget?** -> Apply the role, implement all required states, manage keyboard interaction manually.

**First Rule of ARIA:** If a native HTML element has the semantics you need, do not add ARIA.

---

## Landmark Roles

| Role | HTML Equivalent | Purpose | Key Notes |
|---|---|---|---|
| `banner` | `<header>` (top-level) | Site-wide header | One per page |
| `navigation` | `<nav>` | Navigation links | Use `aria-label` to distinguish multiple navs |
| `main` | `<main>` | Primary content | One per page; skip-link target |
| `complementary` | `<aside>` | Supporting content | Must be meaningful on its own |
| `contentinfo` | `<footer>` (top-level) | Site-wide footer | One per page |
| `search` | `<search>` | Search facility | Use `aria-label` if multiple exist |
| `form` | `<form>` (named) | Form region | Only maps when `<form>` has `aria-label`/`aria-labelledby` |
| `region` | `<section>` (named) | Generic landmark | Must have accessible name; use only when no other landmark fits |

---

## Widget Roles

Each custom widget requires manual keyboard behavior. Use native HTML elements whenever possible.

| Role | HTML Equivalent | Required States/Props | Keyboard | Common Mistakes |
|---|---|---|---|---|
| `button` | `<button>` | `aria-pressed` (toggle), `aria-expanded` (menu) | Enter, Space | `<div onclick>` without role, tabindex, key handler |
| `checkbox` | `<input checkbox>` | `aria-checked` (true/false/mixed) | Space toggles | Missing `aria-checked`; visual-only checkmark |
| `dialog` | `<dialog>` | `aria-label` or `aria-labelledby`, `aria-modal` | Escape closes; trap focus | Not trapping focus; not returning focus to trigger |
| `tablist`/`tab`/`tabpanel` | None | `aria-selected`, `aria-controls`, `aria-labelledby` | Arrow L/R between tabs; Tab into panel | Each tab as a tab stop (only active tab should be) |
| `menu`/`menuitem` | None | `aria-expanded` (trigger), `aria-checked` (checkbox/radio items) | Arrow Up/Down, Enter, Escape | Using `menu` for navigation (use `nav`) or selects (use `listbox`) |
| `listbox`/`option` | `<select>`/`<option>` | `aria-selected`, `aria-multiselectable`, `aria-activedescendant` | Arrow Up/Down, Home/End, type-ahead | Missing type-ahead; not announcing multi-select count |
| `slider` | `<input range>` | `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` | Arrow keys, Home/End | Not updating `aria-valuenow`; missing `aria-valuetext` |
| `grid`/`row`/`gridcell` | `<table>` | `aria-colcount`, `aria-rowcount` (if virtualized) | Arrow keys (2D), Enter, Ctrl+Home/End | Using `grid` for CSS layout; missing 2D navigation |
| `tree`/`treeitem` | None | `aria-expanded`, `aria-selected` | Arrow Up/Down, Right (expand), Left (collapse) | Not managing `aria-expanded`; not hiding collapsed children |
| `combobox` | None | `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete` | Arrow Down opens, Up/Down navigates, Enter selects, Escape closes | Not announcing available option count |

---

## Live Regions

| Attribute | Values | Use Case |
|---|---|---|
| `aria-live` | `polite`, `assertive`, `off` | `polite` for non-urgent; `assertive` for errors/alerts |
| `aria-atomic` | `true`, `false` | `true` announces entire region; `false` only changed content |
| `aria-relevant` | `additions`, `removals`, `text`, `all` | Default: `additions text` |
| `role="status"` | (implicit polite) | Status messages, form summaries |
| `role="alert"` | (implicit assertive) | Errors, urgent notifications |

**Key rule:** The live region container must exist in the DOM before content is injected.

---

## ARIA Anti-Patterns

**1. Redundant ARIA** — `<button role="button">` or `<nav role="navigation">`. Native elements already carry these roles.

**2. ARIA without keyboard** — `<div role="button" onclick="...">` without `tabindex="0"` and key handler. Every ARIA role requires corresponding keyboard support.

**3. Hidden but focusable** — `<button aria-hidden="true">` hides from screen readers but remains keyboard-focusable. Use `hidden` attribute or `display:none` to hide from everyone.

**4. Placeholder as label** — `<input placeholder="Email">` without a `<label>`. Placeholders disappear on input and are not reliably announced as labels.

**5. Generic labels** — `aria-label="button"` or `aria-label="click here"`. Labels must describe the action: `aria-label="Close dialog"`, `aria-label="Read more about pricing"`.

**6. Overriding native semantics** — `<h2 role="button">` destroys heading semantics. Wrap in a button instead: `<h2><button>...</button></h2>`.

**7. aria-hidden on focusable ancestors** — Setting `aria-hidden="true"` on a container that has focusable children creates invisible tab stops.

---

## Quick Reference Rules

1. **No ARIA is better than bad ARIA.** Incorrect ARIA actively misleads assistive technology.
2. **Every interactive ARIA role needs keyboard support.** If you add a role, you own the keyboard behavior.
3. **All ARIA states must sync with visual state.** Checked checkbox must have `aria-checked="true"`.
4. **Visible labels beat `aria-label`.** Use `aria-label` only when a visible label is impossible.
5. **Test with a screen reader.** Automated tools catch 30-40% of issues. Manual testing with NVDA, VoiceOver, or JAWS is essential.
