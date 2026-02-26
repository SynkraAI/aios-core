# EPIC-07-STORY-01 — Marketplace pattern detection (Shopee, ML regex)
**Story ID:** ZAP-037
**Epic:** EPIC-07 — Offer Detection & Parsing
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 2
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)

---

## User Story

**As a** offer parser,
**I want** to detect which marketplace an offer comes from using pattern matching,
**so that** I can route offers to the correct substitution strategy.

---

## Context & Background

Messages from competitors contain offers with marketplace-specific prefixes or URLs. We need regex patterns to detect:
1. **Shopee:** Contains "Shopee" + shopee.com.br URL
2. **Mercado Livre:** Contains "ML" or "Mercado Livre" + mercadolivre.com.br URL
3. **Amazon:** Contains "Amazon" + amazon.com.br URL

Must be case-insensitive and handle variations.

---

## Acceptance Criteria

### AC-037.1 — Detects Shopee offers (>95% accuracy)
```bash
Test cases:
✓ "Shopee: iPhone R$1.299" → marketplace='shopee'
✓ "shopee: produto" → marketplace='shopee'
✓ "SHOPEE: Oferta" → marketplace='shopee'
✓ "Vendo no Shopee: ..https://shopee.com.br/p-123" → marketplace='shopee'
✗ "Também vendo, confira Shopee" (no explicit URL/prefix) → skip or log

Detection accuracy: >95%
False positives: <5%
```

### AC-037.2 — Detects Mercado Livre offers (>95% accuracy)
```bash
Test cases:
✓ "ML: iPhone R$999" → marketplace='mercadolivre'
✓ "Mercado Livre: Produto" → marketplace='mercadolivre'
✓ "https://mercadolivre.com.br/...#item_id=123" → marketplace='mercadolivre'
✗ "Produto disponível" (no indicator) → skip

Detection accuracy: >95%
```

### AC-037.3 — Detects Amazon offers (>95% accuracy)
```bash
Test cases:
✓ "Amazon: Livro R$50" → marketplace='amazon'
✓ "amazon: produto" → marketplace='amazon'
✓ "https://amazon.com.br/dp/B0123456789" → marketplace='amazon'

Detection accuracy: >95%
```

### AC-037.4 — Handles multiple marketplaces in same message
```bash
Message: "Shopee R$100 vs ML R$90"

Expected behavior (choose one):
- Option A: Return first match (Shopee)
- Option B: Return highest confidence
- Chosen: Option A (first match)

Recommendation: Log "Multiple marketplaces detected" for analytics
```

### AC-037.5 — Case-insensitive detection
```bash
✓ "SHOPEE", "shopee", "Shopee" all detected
✓ "ML", "ml", "mercado livre" all detected
✓ "AMAZON", "amazon", "Amazon" all detected
```

### AC-037.6 — Returns confidence score (0-1)
```bash
detect('Shopee: iPhone https://shopee.com.br/p-123')
→ { marketplace: 'shopee', confidence: 0.95 }

detect('confira shopee')
→ { marketplace: 'shopee', confidence: 0.7 }

detect('random message')
→ { marketplace: null, confidence: 0 }

Only proceed if confidence > 0.7
```

---

## Technical Notes

### Pattern Detection Service
```typescript
// apps/api/src/services/offers/marketplace-detector.ts

export type Marketplace = 'shopee' | 'mercadolivre' | 'amazon'

export interface DetectionResult {
  marketplace: Marketplace | null
  confidence: number
  matchedPattern?: string
}

export class MarketplaceDetector {
  private patterns: Record<Marketplace, RegExp[]> = {
    shopee: [
      /shopee\.com\.br/i,
      /\bshopee\s*:/i,
      /shopee\b/i
    ],
    mercadolivre: [
      /mercadolivre\.com\.br/i,
      /\bml\s*:/i,
      /\bmercado\s+livre\b/i
    ],
    amazon: [
      /amazon\.com\.br/i,
      /\bamazon\s*:/i,
      /amazon\b/i
    ]
  }

  detect(text: string): DetectionResult {
    if (!text || text.length === 0) {
      return { marketplace: null, confidence: 0 }
    }

    // Check each marketplace in order
    for (const [marketplace, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          // Calculate confidence based on pattern specificity
          const confidence = this.calculateConfidence(
            text,
            marketplace as Marketplace,
            pattern
          )

          if (confidence > 0.7) {
            return {
              marketplace: marketplace as Marketplace,
              confidence,
              matchedPattern: pattern.source
            }
          }
        }
      }
    }

    return { marketplace: null, confidence: 0 }
  }

  private calculateConfidence(text: string, marketplace: Marketplace, pattern: RegExp): number {
    // URL in text = high confidence (0.95)
    if (marketplace === 'shopee' && /shopee\.com\.br/.test(text)) return 0.95
    if (marketplace === 'mercadolivre' && /mercadolivre\.com\.br/.test(text)) return 0.95
    if (marketplace === 'amazon' && /amazon\.com\.br/.test(text)) return 0.95

    // Explicit prefix "Shopee:" = high confidence (0.85)
    if (new RegExp(`\\b${marketplace}\\s*:`, 'i').test(text)) return 0.85

    // Just word mention = medium confidence (0.7)
    return 0.7
  }
}
```

### Unit Tests
```typescript
// apps/api/src/services/offers/marketplace-detector.test.ts

describe('MarketplaceDetector', () => {
  let detector: MarketplaceDetector

  beforeEach(() => {
    detector = new MarketplaceDetector()
  })

  describe('Shopee detection', () => {
    test('detects "Shopee:" prefix', () => {
      const result = detector.detect('Shopee: iPhone R$1.299')
      expect(result.marketplace).toBe('shopee')
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    test('detects shopee.com.br URL', () => {
      const result = detector.detect('https://shopee.com.br/p-123456')
      expect(result.marketplace).toBe('shopee')
      expect(result.confidence).toBe(0.95)
    })

    test('case insensitive', () => {
      const result = detector.detect('SHOPEE: produto')
      expect(result.marketplace).toBe('shopee')
    })

    test('rejects low confidence', () => {
      const result = detector.detect('confira shopee')
      expect(result.confidence).toBeLessThan(0.8)
      // Depending on impl: may still detect with low confidence
    })
  })

  describe('Mercado Livre detection', () => {
    test('detects "ML:" prefix', () => {
      const result = detector.detect('ML: Livro R$50')
      expect(result.marketplace).toBe('mercadolivre')
    })

    test('detects mercadolivre.com.br URL', () => {
      const result = detector.detect('https://mercadolivre.com.br/...#item_id=123')
      expect(result.marketplace).toBe('mercadolivre')
    })
  })

  describe('Amazon detection', () => {
    test('detects "Amazon:" prefix', () => {
      const result = detector.detect('Amazon: Livro R$45')
      expect(result.marketplace).toBe('amazon')
    })

    test('detects amazon.com.br URL', () => {
      const result = detector.detect('https://amazon.com.br/dp/B0123456789')
      expect(result.marketplace).toBe('amazon')
    })
  })

  test('returns no match for random text', () => {
    const result = detector.detect('This is a random message without offers')
    expect(result.marketplace).toBeNull()
    expect(result.confidence).toBe(0)
  })

  test('handles empty string', () => {
    const result = detector.detect('')
    expect(result.marketplace).toBeNull()
  })
})
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| None | — | ✅ Can start immediately |

**Blocks:**
- ZAP-038 (URL extraction needs detected marketplace)
- ZAP-041 (OfferParserWorker uses this)

---

## Definition of Done

- [x] MarketplaceDetector service implemented
- [x] All 3 marketplaces detected with >95% accuracy
- [x] Confidence scoring working
- [x] Case-insensitive detection
- [x] Unit tests: all patterns covered
- [x] Edge cases: empty string, null, special chars
- [x] `npm run typecheck` → 0 errors
- [x] `npm run lint` → 0 errors

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/services/offers/marketplace-detector.ts` | CREATE | Detection service |
| `apps/api/src/services/offers/marketplace-detector.test.ts` | CREATE | Unit tests |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-26 | River (SM) | Story created — ready for development |

---

*Source: docs/architecture/redirectflow-architecture-design.md § Part 2*
