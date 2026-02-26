# EPIC-07-STORY-06 — Dashboard: View captured offers (with filters)
**Story ID:** ZAP-042
**Epic:** EPIC-07 — Offer Detection & Parsing
**Sprint:** 2 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** @dev (Dex) + @ux-design-expert (Uma)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** tenant,
**I want** a dashboard where I can browse all captured offers, filtered by marketplace and date,
**so that** I can see what offers the system is capturing from competitors.

---

## Acceptance Criteria

### AC-042.1 — List view shows all captured offers
```
Table with columns:
- Product Name (title)
- Marketplace (badge: Shopee/ML/Amazon)
- Price (original → discounted, with discount %)
- Source Group
- Captured Date
- Status (New / Pending Substitution / Ready / Sent / Expired)
- Duplicate? (badge or indicator)

Default sorting: Newest first
Pagination: 20 per page
```

### AC-042.2 — Filter by marketplace
```bash
Dropdown: All / Shopee / Mercado Livre / Amazon

Selecting a marketplace:
- Table filters to show only that marketplace
- Counts update (e.g., "12 Shopee offers")
```

### AC-042.3 — Filter by date range
```bash
Date picker: From / To

Examples:
- Today
- Last 7 days
- Last 30 days
- Custom range

Refetch on date change
```

### AC-042.4 — Filter by duplicate status
```bash
Checkbox: "Show duplicates"
- Checked (default): Shows all offers (including duplicates)
- Unchecked: Only shows original offers (is_duplicate=false)
```

### AC-042.5 — Search by product name
```bash
Text input: "Search offers"

Filters: WHERE product_title ILIKE '%search%'

Real-time search as user types
```

### AC-042.6 — Click offer row to see details
```bash
Modal with full details:
- Product image (if available)
- Full title
- Original price
- Discounted price
- Discount percentage
- Original URL
- Original affiliate ID
- Source group
- Captured timestamp
- Status
- Dedup hash
- If duplicate: "This is a duplicate of [link to original]"
```

### AC-042.7 — Real-time counter updates
```bash
Show total counts:
- Total offers captured today
- Total new (not yet substituted)
- By marketplace breakdown

Polling every 5 seconds or Supabase realtime
```

### AC-042.8 — Empty state message
```bash
If no offers yet:
- "No captured offers yet"
- "Offers will appear here as competitors post in monitored groups"
```

---

## Technical Notes

### Component Structure
```
CapturedOffersPage
├─ Header
│  ├─ Total counts
│  └─ Refresh button
├─ Filters
│  ├─ MarketplaceFilter (dropdown)
│  ├─ DateRangeFilter (date pickers)
│  ├─ DuplicateToggle (checkbox)
│  └─ SearchInput (text)
└─ OffersTable
   ├─ OfferRow (repeated)
   │  └─ Click to expand → OfferDetailModal
   └─ Pagination
```

### Zustand Store
```typescript
// apps/web/src/stores/captured-offers.ts

interface CapturedOffer {
  id: string
  marketplace: 'shopee' | 'mercadolivre' | 'amazon'
  product_title: string
  original_price: number
  discounted_price: number
  discount_percent: number
  original_url: string
  source_group_jid: string
  captured_at: string
  is_duplicate: boolean
  duplicate_of_offer_id?: string
  status: string
}

interface Filters {
  marketplace?: string
  dateFrom?: Date
  dateTo?: Date
  showDuplicates: boolean
  search: string
  page: number
}

interface CapturedOffersStore {
  offers: CapturedOffer[]
  filters: Filters
  loading: boolean
  total: number
  counts: { by_marketplace: Record<string, number>; today: number }

  setFilters: (partial: Partial<Filters>) => void
  fetchOffers: () => Promise<void>
  subscribeToUpdates: () => void
}

export const useCapturedOffersStore = create<CapturedOffersStore>((set) => ({
  // Implementation...
}))
```

### API Endpoint
```typescript
// apps/api/src/routes/offers.ts

app.get('/captured-offers', async (c) => {
  const { tenantId } = c.get('auth')

  const marketplace = c.req.query('marketplace')
  const dateFrom = c.req.query('dateFrom')
  const dateTo = c.req.query('dateTo')
  const showDuplicates = c.req.query('showDuplicates') === 'true'
  const search = c.req.query('search')
  const page = parseInt(c.req.query('page') || '1')
  const limit = 20

  let query = supabase
    .from('captured_offers')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)

  if (marketplace) query = query.eq('marketplace', marketplace)
  if (dateFrom) query = query.gte('captured_at', new Date(dateFrom).toISOString())
  if (dateTo) {
    const endOfDay = new Date(dateTo)
    endOfDay.setHours(23, 59, 59, 999)
    query = query.lte('captured_at', endOfDay.toISOString())
  }
  if (!showDuplicates) query = query.eq('is_duplicate', false)
  if (search) query = query.ilike('product_title', `%${search}%`)

  const { data, count } = await query
    .order('captured_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  return c.json({ data, pagination: { page, limit, total: count } })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-041 (offers captured to DB) | Hard | Must work first |
| Next.js | Runtime | ✅ Existing |
| Zustand | Runtime | ✅ Existing |

---

## Definition of Done

- [x] List view with all columns
- [x] Marketplace filter working
- [x] Date range filter working
- [x] Duplicate toggle working
- [x] Search working (product title)
- [x] Detail modal shows full offer info
- [x] Real-time counter updates
- [x] Empty state message
- [x] Pagination working
- [x] Responsive design
- [x] No console errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/stores/captured-offers.ts` | CREATE | Zustand store |
| `apps/web/src/app/(dashboard)/captured-offers/page.tsx` | CREATE | Main page |
| `apps/web/src/components/tables/CapturedOffersTable.tsx` | CREATE | Table |
| `apps/web/src/components/modals/OfferDetailModal.tsx` | CREATE | Detail modal |
| `apps/api/src/routes/offers.ts` | CREATE | API endpoints |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for development |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 1*
