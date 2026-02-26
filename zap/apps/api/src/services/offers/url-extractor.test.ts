import { describe, it, expect, beforeEach } from 'vitest'
import { URLExtractor } from './url-extractor.js'

describe('URLExtractor', () => {
  let extractor: URLExtractor

  beforeEach(() => {
    extractor = new URLExtractor()
  })

  // AC-038.1: Shopee product ID extraction (100% accuracy)
  describe('AC-038.1: Shopee product ID extraction', () => {
    it('extracts ID from standard Shopee URL', () => {
      const result = extractor.extractShopee(
        'Shopee: iPhone 14 R$1.999 → R$1.299',
        'https://shopee.com.br/iphone-14-p-123456'
      )
      expect(result?.product_id).toBe('123456')
    })

    it('extracts ID from URL with query parameters', () => {
      const result = extractor.extractShopee(
        'Shopee iPhone R$1.999 → R$1.299',
        'https://shopee.com.br/p-123456?af_id=xyz'
      )
      expect(result?.product_id).toBe('123456')
    })

    it('extracts ID from URL with fragment identifier', () => {
      const result = extractor.extractShopee(
        'iPhone R$1.999 → R$1.299',
        'https://shopee.com.br/iphone-p-123456#reviews'
      )
      expect(result?.product_id).toBe('123456')
    })

    it('extracts ID from Shopee shortlink (shope.ee)', () => {
      const result = extractor.extractShopee(
        'Product R$100 → R$50',
        'https://shope.ee/p-123456'
      )
      expect(result?.product_id).toBe('123456')
    })

    it('returns null for URL without product ID pattern', () => {
      const result = extractor.extractShopee(
        'Product R$100 → R$50',
        'https://shopee.com.br/no-id-here'
      )
      expect(result).toBeNull()
    })
  })

  // AC-038.2: Price extraction with multiple formats
  describe('AC-038.2: Price extraction from message', () => {
    it('parses prices separated by → symbol', () => {
      const result = extractor.extractShopee(
        'Shopee iPhone R$1.999 → R$1.299',
        'https://shopee.com.br/p-123'
      )
      expect(result?.original_price).toBe(1999)
      expect(result?.discounted_price).toBe(1299)
    })

    it('parses prices separated by "por" keyword', () => {
      const result = extractor.extractShopee(
        'R$100 por R$50',
        'https://shopee.com.br/p-123'
      )
      expect(result?.original_price).toBe(100)
      expect(result?.discounted_price).toBe(50)
    })

    it('handles BR format with comma decimal: 2.000,00', () => {
      const result = extractor.extractShopee(
        'De R$2.000,00 por R$1.500,00',
        'https://shopee.com.br/p-123'
      )
      expect(result?.original_price).toBe(2000)
      expect(result?.discounted_price).toBe(1500)
    })

    it('parses whole numbers without separators', () => {
      const result = extractor.extractShopee(
        'R$999 → R$699',
        'https://shopee.com.br/p-123'
      )
      expect(result?.original_price).toBe(999)
      expect(result?.discounted_price).toBe(699)
    })

    it('handles mixed price formats', () => {
      const result = extractor.extractShopee(
        'R$1.999,99 → R$1.299',
        'https://shopee.com.br/p-123'
      )
      expect(result?.original_price).toBeCloseTo(1999.99, 1)
      expect(result?.discounted_price).toBe(1299)
    })

    it('returns null if no prices found', () => {
      const result = extractor.extractShopee(
        'Just a regular message without prices',
        'https://shopee.com.br/p-123'
      )
      expect(result).toBeNull()
    })
  })

  // AC-038.3: Discount percent calculation
  describe('AC-038.3: Discount percent calculation', () => {
    it('calculates 35% discount correctly', () => {
      const result = extractor.extractShopee(
        'Product R$1.999 → R$1.299',
        'https://shopee.com.br/p-123'
      )
      expect(result?.discount_percent).toBe(35)
    })

    it('calculates 50% discount correctly', () => {
      const result = extractor.extractShopee(
        'Product R$100 → R$50',
        'https://shopee.com.br/p-123'
      )
      expect(result?.discount_percent).toBe(50)
    })

    it('rejects discount >95% (data quality check)', () => {
      const result = extractor.extractShopee(
        'Product R$1.000 → R$10',
        'https://shopee.com.br/p-123'
      )
      // 99% discount - likely data error
      expect(result).toBeNull()
    })

    it('rejects negative discount (price increased)', () => {
      const result = extractor.extractShopee(
        'Product R$100 → R$200',
        'https://shopee.com.br/p-123'
      )
      expect(result).toBeNull()
    })

    it('rounds discount to nearest integer', () => {
      const result = extractor.extractShopee(
        'Product R$100 → R$67',
        'https://shopee.com.br/p-123'
      )
      // (100-67)/100 * 100 = 33%
      expect(result?.discount_percent).toBe(33)
    })
  })

  // AC-038.4: Title extraction
  describe('AC-038.4: Title extraction', () => {
    it('extracts title from "Shopee:" prefix pattern', () => {
      const result = extractor.extractShopee(
        'Shopee: iPhone 14 Pro Max R$1.999 → R$1.299',
        'https://shopee.com.br/p-123'
      )
      expect(result?.product_title).toBe('iPhone 14 Pro Max')
    })

    it('extracts title with specs in parentheses', () => {
      const result = extractor.extractShopee(
        'iPhone 14 (256GB, Gold) R$1.299 → R$999',
        'https://shopee.com.br/p-123'
      )
      expect(result?.product_title).toContain('iPhone 14')
    })

    it('uses fallback title when extraction fails', () => {
      const result = extractor.extractShopee(
        'R$100 → R$50',
        'https://shopee.com.br/p-123'
      )
      expect(result?.product_title).toBe('Shopee Product 123')
    })

    it('handles case-insensitive "Shopee" keyword', () => {
      const result = extractor.extractShopee(
        'SHOPEE: Produto Teste R$100 → R$50',
        'https://shopee.com.br/p-123'
      )
      expect(result?.product_title).toContain('Produto Teste')
    })
  })

  // AC-038.5: URL normalization
  describe('AC-038.5: URL normalization', () => {
    it('removes query parameters from URL', () => {
      const result = extractor.extractShopee(
        'Product R$100 → R$50',
        'https://shopee.com.br/iphone-p-123?af_id=xyz&utm_source=test'
      )
      expect(result?.normalized_url).toBe('https://shopee.com.br/iphone-p-123')
    })

    it('removes fragment identifier from URL', () => {
      const result = extractor.extractShopee(
        'Product R$100 → R$50',
        'https://shopee.com.br/iphone-p-123#reviews'
      )
      expect(result?.normalized_url).toBe('https://shopee.com.br/iphone-p-123')
    })

    it('removes both query and fragment', () => {
      const result = extractor.extractShopee(
        'Product R$100 → R$50',
        'https://shopee.com.br/iphone-p-123?af_id=xyz#section'
      )
      expect(result?.normalized_url).toBe('https://shopee.com.br/iphone-p-123')
    })

    it('preserves clean URL unchanged', () => {
      const url = 'https://shopee.com.br/iphone-p-123'
      const result = extractor.extractShopee('Product R$100 → R$50', url)
      expect(result?.normalized_url).toBe(url)
    })

    it('stores original URL untouched', () => {
      const originalUrl = 'https://shopee.com.br/iphone-p-123?af_id=xyz'
      const result = extractor.extractShopee('Product R$100 → R$50', originalUrl)
      expect(result?.original_url).toBe(originalUrl)
    })
  })

  // AC-038.6-7: Stubs for future phases
  describe('AC-038.6-7: Phase 3-4 stubs', () => {
    it('Mercado Livre extraction returns null (Phase 3)', () => {
      const result = extractor.extractMercadoLivre(
        'ML: Produto R$100 → R$50',
        'https://mercadolivre.com.br/MLB123456789'
      )
      expect(result).toBeNull()
    })

    it('Amazon extraction returns null (Phase 4)', () => {
      const result = extractor.extractAmazon(
        'Amazon: Livro R$50 → R$35',
        'https://amazon.com.br/dp/B0123456789'
      )
      expect(result).toBeNull()
    })
  })

  // Edge cases
  describe('Edge cases', () => {
    it('handles empty text gracefully', () => {
      const result = extractor.extractShopee('', 'https://shopee.com.br/p-123')
      expect(result).toBeNull()
    })

    it('handles empty URL gracefully', () => {
      const result = extractor.extractShopee('Product R$100 → R$50', '')
      expect(result).toBeNull()
    })

    it('handles missing original URL parameter', () => {
      const result = extractor.extractShopee('Product R$100 → R$50', null as any)
      expect(result).toBeNull()
    })

    it('handles special characters in product title', () => {
      const result = extractor.extractShopee(
        'Shopee: iPhone 14 Pro Max® (256GB™) R$100 → R$50',
        'https://shopee.com.br/p-123'
      )
      expect(result?.product_title).toContain('iPhone 14')
      expect(result?.discount_percent).toBe(50)
    })

    it('returns complete OfferData object with all fields', () => {
      const result = extractor.extractShopee(
        'Shopee: iPhone 14 R$1.999 → R$1.299',
        'https://shopee.com.br/iphone-p-123456?af=xyz'
      )

      expect(result).toBeDefined()
      expect(result?.marketplace).toBe('shopee')
      expect(result?.product_id).toBe('123456')
      expect(result?.product_title).toBe('iPhone 14')
      expect(result?.original_price).toBe(1999)
      expect(result?.discounted_price).toBe(1299)
      expect(result?.discount_percent).toBe(35)
      expect(result?.original_url).toBe('https://shopee.com.br/iphone-p-123456?af=xyz')
      expect(result?.normalized_url).toBe('https://shopee.com.br/iphone-p-123456')
    })
  })
})
