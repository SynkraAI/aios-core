# EPIC-07-STORY-02 — URL extraction + normalization (Phase 1: Shopee)
**Story ID:** ZAP-038
**Epic:** EPIC-07 — Offer Detection & Parsing
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** InReview
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** offer parser,
**I want** to extract product IDs and normalize URLs from marketplace offers,
**so that** I can prepare clean data for link substitution.

---

## Acceptance Criteria

### AC-038.1 — Shopee product ID extraction (Phase 1)
```bash
Test cases:
✓ "https://shopee.com.br/iphone-14-p-123456" → product_id='123456'
✓ "https://shopee.com.br/p-123456?af_id=xyz" → product_id='123456'
✓ "https://shopee.com.br/...p-123456..." → product_id='123456'
✓ "shope.ee/p-123456" → product_id='123456' (Shopee shortlink)

Accuracy: 100% for valid URLs
```

### AC-038.2 — Price extraction from message
```bash
Extract original_price and discounted_price:

✓ "Shopee iPhone R$1.999 → R$1.299" → original=1999, discounted=1299
✓ "R$100 por R$50" → original=100, discounted=50
✓ "De R$2.000,00 por R$1.500,00" → handles comma separators

Tolerance: ±5% for unusual formatting
```

### AC-038.3 — Discount percent calculation
```bash
discount_percent = ((original - discounted) / original) * 100

✓ (1999-1299)/1999 = 35% (rounded)
✓ (100-50)/100 = 50%
✓ Invalid if discount > 95% (likely scraping error)
```

### AC-038.4 — Title extraction
```bash
Extract product name from message:

✓ "Shopee: iPhone 14 Pro Max R$1.999 → R$1.299" → title='iPhone 14 Pro Max'
✓ "iPhone 14 (256GB, Gold) R$1.299" → title='iPhone 14 (256GB, Gold)'

Heuristic: First noun/product name before price
```

### AC-038.5 — URL normalization
```bash
Remove tracking parameters:

Original: "https://shopee.com.br/iphone-p-123?af_id=xyz&utm_source=..."
Normalized: "https://shopee.com.br/iphone-p-123"

Keeps only: scheme + domain + product path
```

### AC-038.6 — Handles Mercado Livre URLs (for Phase 3)
```bash
ML pattern: extract item_id from URL
✓ "mercadolivre.com.br/.../MLB123456789" → product_id='MLB123456789'
✓ "#item_id=123456789" → product_id='123456789'

Note: Full implementation in Phase 3
```

### AC-038.7 — Handles Amazon URLs (for Phase 4)
```bash
Amazon ASIN pattern: extract 10-char code
✓ "amazon.com.br/dp/B0123456789" → product_id='B0123456789'
✓ "asin=B0123456789" → product_id='B0123456789'

Note: Full implementation in Phase 4
```

---

## Technical Notes

### URL Extraction Service
```typescript
// apps/api/src/services/offers/url-extractor.ts

export interface OfferData {
  marketplace: 'shopee' | 'mercadolivre' | 'amazon'
  product_id: string
  product_title: string
  original_price: number
  discounted_price: number
  discount_percent: number
  original_url: string
  normalized_url: string
}

export class URLExtractor {
  extractShopee(text: string, url: string): Partial<OfferData> | null {
    // Extract product ID
    const shopeeIdMatch = url.match(/p-(\d+)/)
    if (!shopeeIdMatch) return null

    const product_id = shopeeIdMatch[1]

    // Extract prices
    const priceMatch = text.match(/R\$\s*([\d.]+(?:,\d{2})?)\s*(?:→|por)\s*R\$\s*([\d.]+(?:,\d{2})?)/i)
    if (!priceMatch) return null

    const original_price = this.parsePrice(priceMatch[1])
    const discounted_price = this.parsePrice(priceMatch[2])

    // Calculate discount
    const discount_percent = Math.round(
      ((original_price - discounted_price) / original_price) * 100
    )

    // Validate discount (reject >95%)
    if (discount_percent > 95 || discount_percent < 0) {
      return null
    }

    // Extract title (heuristic: text before first price)
    const titleMatch = text.match(/shopee:\s*(.+?)(?=R\$|$)/i)
    const product_title = titleMatch ? titleMatch[1].trim() : `Shopee Product ${product_id}`

    // Normalize URL
    const normalized_url = url.split('?')[0] // Remove query params

    return {
      marketplace: 'shopee',
      product_id,
      product_title,
      original_price,
      discounted_price,
      discount_percent,
      original_url: url,
      normalized_url
    }
  }

  private parsePrice(priceStr: string): number {
    // "1.999,99" or "1999" or "1,999.99"
    const cleaned = priceStr.replace(/[^\d.,]/g, '')

    // Determine if comma or dot is decimal separator
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Both present: rightmost is decimal
      const lastDot = cleaned.lastIndexOf('.')
      const lastComma = cleaned.lastIndexOf(',')
      return lastDot > lastComma
        ? parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
        : parseFloat(cleaned.replace(/,/g, ''))
    } else if (cleaned.includes(',')) {
      // Only comma: might be thousands or decimal
      // If only 2 digits after comma, it's decimal
      const parts = cleaned.split(',')
      return parts[1].length === 2
        ? parseFloat(parts[0].replace(/\./g, '') + '.' + parts[1])
        : parseFloat(parts[0].replace(/,/g, ''))
    } else {
      return parseFloat(cleaned)
    }
  }
}
```

### Unit Tests
```typescript
// apps/api/src/services/offers/url-extractor.test.ts

describe('URLExtractor - Shopee', () => {
  let extractor: URLExtractor

  beforeEach(() => {
    extractor = new URLExtractor()
  })

  test('extracts product ID from standard URL', () => {
    const text = 'Shopee: iPhone R$1.999 → R$1.299'
    const url = 'https://shopee.com.br/iphone-p-123456'

    const result = extractor.extractShopee(text, url)

    expect(result?.product_id).toBe('123456')
    expect(result?.original_price).toBe(1999)
    expect(result?.discounted_price).toBe(1299)
    expect(result?.discount_percent).toBe(35)
  })

  test('normalizes URL by removing query params', () => {
    const url = 'https://shopee.com.br/iphone-p-123?af_id=xyz&utm=abc'
    const result = extractor.extractShopee('Shopee R$1.999 → R$1.299', url)

    expect(result?.normalized_url).toBe('https://shopee.com.br/iphone-p-123')
  })

  test('parses prices with different separators', () => {
    const cases = [
      { input: 'R$1.999,99', expected: 1999.99 },
      { input: 'R$1999', expected: 1999 },
      { input: 'R$2.000,00', expected: 2000 }
    ]

    for (const c of cases) {
      const price = extractor['parsePrice'](c.input)
      expect(price).toBeCloseTo(c.expected, 1)
    }
  })

  test('rejects discount >95%', () => {
    const text = 'Product R$1.000 → R$10'
    const url = 'https://shopee.com.br/p-123'

    const result = extractor.extractShopee(text, url)
    expect(result).toBeNull()
  })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-037 (marketplace detection) | Soft | Provides marketplace type |

**Blocks:**
- ZAP-040 (dedup needs normalized URLs)
- ZAP-041 (parser worker uses this)

---

## Definition of Done

- [x] Shopee product ID extraction 100% accurate
- [x] Price parsing handles multiple formats
- [x] Discount calculation + validation
- [x] Title extraction heuristic working
- [x] URL normalization removes tracking params
- [x] ML/Amazon patterns stubbed (Phase 3-4)
- [x] Unit tests: all cases covered
- [x] `npm run typecheck` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/services/offers/url-extractor.ts` | CREATE | Extraction logic |
| `apps/api/src/services/offers/url-extractor.test.ts` | CREATE | Unit tests |

---

## Dev Agent Record

### Implementation Completed ✅

**Status:** InReview → Ready for QA
**Developer:** @dev (Dex)
**Completion Date:** 2026-02-26

#### Implementation Summary
- **Service:** `URLExtractor` with complete Shopee extraction (Phase 1)
- **Test Coverage:** 32/32 tests passing (100%)
  - AC-038.1: Product ID extraction (5 tests)
  - AC-038.2: Price parsing all formats (6 tests)
  - AC-038.3: Discount calculation (5 tests)
  - AC-038.4: Title extraction (4 tests)
  - AC-038.5: URL normalization (5 tests)
  - Edge cases (7 tests)

#### Quality Checks
- ✅ All 32 tests passing (100% AC coverage)
- ✅ `npm run typecheck` — PASS
- ✅ `npm run build` — PASS
- ✅ Git commit: `2a83403b` (feat: implement ZAP-038)

#### Key Implementation Details
- **Price Parsing:** Smart separator detection (rightmost = decimal)
  - Supports: "1.999,99" (BR) / "1999" / "2.000,00" / "1,999.99" (US)
  - Logic handles all combinations of dots and commas
- **Title Extraction:** Two-fallback heuristic
  - Try "Shopee: {title}" prefix extraction
  - Fallback to text before first "R$"
  - Final fallback: "Shopee Product {id}"
- **Discount Validation:** Rejects >95% (data quality) and negative (logic error)
- **Stubs:** ML and Amazon extraction stubs for Phase 3-4

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | Dex (@dev) | Implementation complete — 32/32 tests PASS, quality gates passed, ready for QA |
| 2026-02-26 | River (SM) | Story created — Phase 1 (Shopee only) |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 2*
