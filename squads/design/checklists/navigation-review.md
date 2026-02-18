# Checklist: Navigation Review

**ID:** navigation-review
**Version:** 1.0
**Purpose:** Reviews navigation quality covering wayfinding, breadcrumbs, active states, deep linking, mobile navigation, and search findability
**Agent:** @jenifer-tidwell
**Quality Gate:** WARNING

---

## Prerequisites

- [ ] Information architecture (sitemap or page hierarchy) is documented
- [ ] Navigation structure has been designed and implemented
- [ ] At least three levels of depth exist to test deep navigation
- [ ] Mobile viewport testing environment is available

---

## Section 1: Wayfinding

- [ ] User can determine their current location within the application at any time
- [ ] Navigation hierarchy is visible and understandable (max 3 levels deep in primary nav)
- [ ] Page titles or headings reinforce the current location
- [ ] Consistent landmark navigation is present on all pages (header, main, footer)
- [ ] Users can reach any top-level section within 2 clicks from any page
- [ ] Navigation labels are clear, descriptive, and use familiar terminology
- [ ] Information scent is strong — link labels predict the destination content

## Section 2: Breadcrumbs

- [ ] Breadcrumbs are present on all pages deeper than the second level
- [ ] Breadcrumb trail accurately reflects the page hierarchy
- [ ] Each breadcrumb segment is a clickable link (except the current page)
- [ ] Current page in the breadcrumb is not a link but is visually identified
- [ ] Breadcrumb uses proper semantic markup (nav with aria-label="Breadcrumb", ol/li)
- [ ] Breadcrumb does not wrap awkwardly or overflow on smaller screens
- [ ] Breadcrumb separator is decorative and hidden from screen readers (aria-hidden)

## Section 3: Active State

- [ ] Currently active navigation item is visually highlighted
- [ ] Active state is distinguishable from hover and focus states
- [ ] Active state uses more than just color to indicate selection (underline, bold, icon)
- [ ] Active state is visible in all navigation levels (primary, secondary, tertiary)
- [ ] Active state persists on page reload and direct URL access
- [ ] Active state is announced to screen readers (aria-current="page")
- [ ] Sub-navigation active state reflects the current subsection accurately

## Section 4: Deep Linking

- [ ] Every meaningful state or view has a unique, shareable URL
- [ ] URLs are human-readable and reflect the content hierarchy
- [ ] Bookmarking a deep page and returning loads the correct content
- [ ] Query parameters and hash fragments are preserved across navigation
- [ ] Browser back button navigates through the user's actual history
- [ ] Browser forward button works correctly after going back
- [ ] Opening a deep link in a new tab loads the page in the correct state

## Section 5: Mobile Navigation

- [ ] Primary navigation is accessible via a hamburger menu or bottom nav bar
- [ ] Menu toggle button has an accessible label ("Open menu" / "Close menu")
- [ ] Navigation menu is full-height or appropriately sized for touch
- [ ] Submenu items are reachable without precision tapping
- [ ] Navigation can be dismissed by tapping outside or pressing Escape
- [ ] Focus is trapped within the navigation overlay when open
- [ ] Navigation does not interfere with page scrolling when closed
- [ ] Bottom navigation (if used) highlights the active section

## Section 6: Search Findability

- [ ] Search is accessible from every page in the application
- [ ] Search input is visually prominent or easily discoverable (magnifying glass icon)
- [ ] Search results are relevant and ranked by usefulness
- [ ] Search supports partial and fuzzy matching
- [ ] Search results link directly to the relevant content
- [ ] No-results state provides helpful suggestions or alternatives
- [ ] Recent or popular searches are offered as suggestions

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Wayfinding | 7 | _ | PENDING |
| Breadcrumbs | 7 | _ | PENDING |
| Active State | 7 | _ | PENDING |
| Deep Linking | 7 | _ | PENDING |
| Mobile Navigation | 8 | _ | PENDING |
| Search Findability | 7 | _ | PENDING |

**Minimum passing score:** 80%
**Blocking items:** Wayfinding and Mobile Navigation items are mandatory pass
