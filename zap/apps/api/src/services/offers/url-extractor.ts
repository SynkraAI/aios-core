export interface OfferData {
  marketplace: 'shopee' | 'mercadolivre' | 'amazon'
  product_id: string
  product_title: string
  original_price: number
  discounted_price: number
  discount_percent: number
  original_url: string
  normalized_url: string
  product_image_url?: string
  original_affiliate_id?: string
}

/**
 * URLExtractor: Extracts and normalizes offer data from marketplace URLs and text
 * Phase 1: Shopee support
 * Phase 3-4: Mercado Livre and Amazon patterns stubbed for future implementation
 *
 * AC-038.1-5: Shopee product ID, price, discount, title, and URL normalization
 */
export class URLExtractor {
  /**
   * Extract Shopee offer data from text and URL
   * Returns partial OfferData or null if extraction fails
   *
   * AC-038.1: Extracts product_id from /p-{id}/ pattern (100% accuracy)
   * AC-038.2: Parses prices with multiple formats (R$1.999,99 / R$1999 / etc)
   * AC-038.3: Calculates discount percent, rejects >95% (likely errors)
   * AC-038.4: Extracts title before first price mention
   * AC-038.5: Normalizes URL by removing query parameters
   */
  extractShopee(text: string, url: string): Partial<OfferData> | null {
    if (!text || !url) return null

    // AC-038.1: Extract product ID from URL pattern /p-{digits}/
    const shopeeIdMatch = url.match(/p-(\d+)/)
    if (!shopeeIdMatch) return null

    const product_id = shopeeIdMatch[1]

    // AC-038.2: Extract prices from "R$X → R$Y" or "R$X por R$Y" pattern
    // Handles: R$1.999,99 / R$1999 / R$2.000,00 / etc
    const priceMatch = text.match(/R\$\s*([\d.,]+)\s*(?:→|por)\s*R\$\s*([\d.,]+)/i)
    if (!priceMatch) return null

    const original_price = this.parsePrice(priceMatch[1])
    const discounted_price = this.parsePrice(priceMatch[2])

    if (original_price <= 0 || discounted_price <= 0) return null

    // AC-038.3: Calculate discount percent and validate
    const discount_percent = Math.round(
      ((original_price - discounted_price) / original_price) * 100
    )

    // Reject invalid discounts (>95% likely data quality issue, <0 is logical error)
    if (discount_percent > 95 || discount_percent < 0) {
      return null
    }

    // AC-038.4: Extract title (heuristic: text after "Shopee:" and before "R$", or all text before first price)
    let titleMatch = text.match(/shopee:\s*(.+?)(?=R\$|$)/i)
    let product_title = titleMatch ? titleMatch[1].trim() : null

    // If no "Shopee:" prefix, try to extract text before first R$ mention
    if (!product_title) {
      const beforePriceMatch = text.match(/^([^R]+?)(?=R\$)/i)
      const titleBeforePrice = beforePriceMatch ? beforePriceMatch[1].trim() : ''
      product_title = titleBeforePrice || `Shopee Product ${product_id}`
    }

    // AC-038.5: Normalize URL by removing query parameters and fragments
    const normalized_url = url.split('?')[0].split('#')[0]

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

  /**
   * Parse price from various formats
   * Handles: "1.999,99" (BR decimal), "1999" (whole), "2,000.00" (US format), etc
   *
   * AC-038.2: Tolerance for ±5% unusual formatting
   */
  private parsePrice(priceStr: string): number {
    // Remove non-numeric characters except separators
    const cleaned = priceStr.replace(/[^\d.,]/g, '')

    if (!cleaned) return 0

    // Case 1: Both comma and dot present
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Rightmost separator is decimal, other is thousands
      const lastDot = cleaned.lastIndexOf('.')
      const lastComma = cleaned.lastIndexOf(',')

      if (lastDot > lastComma) {
        // Dot is decimal: "1,999.99" → remove commas, keep dot
        return parseFloat(cleaned.replace(/,/g, ''))
      } else {
        // Comma is decimal: "2.000,00" → remove dots, convert comma to dot
        return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
      }
    }

    // Case 2: Only comma present
    if (cleaned.includes(',')) {
      const parts = cleaned.split(',')
      // If exactly 2 digits after comma, likely decimal separator (BR format)
      if (parts[1]?.length === 2) {
        return parseFloat(parts[0].replace(/\./g, '') + '.' + parts[1])
      }
      // Otherwise remove as thousands separator
      return parseFloat(parts[0].replace(/,/g, ''))
    }

    // Case 3: Only dot present
    if (cleaned.includes('.')) {
      const parts = cleaned.split('.')
      // If exactly 2 digits after last dot, likely decimal
      if (parts[parts.length - 1]?.length === 2) {
        return parseFloat(cleaned)
      }
      // Otherwise remove as thousands separator
      return parseFloat(cleaned.replace(/\./g, ''))
    }

    // Case 4: No separators
    return parseFloat(cleaned)
  }

  /**
   * Generic extract method that routes to marketplace-specific extractors
   * AC-041.3: Used by OfferParserWorker to extract offer data from text
   */
  extract(text: string, marketplace: 'shopee' | 'mercadolivre' | 'amazon'): Partial<OfferData> | null {
    if (marketplace === 'shopee') {
      return this.extractShopeeFromText(text)
    }

    if (marketplace === 'mercadolivre') {
      // Basic Mercado Livre extraction (Phase 3)
      const idMatch = text.match(/\b(\d{10,})\b/i)
      const productId = idMatch ? idMatch[1] : `ml-${Date.now()}`

      const priceMatch = text.match(/R\$\s*([\d.,]+)/i)
      if (!priceMatch) return null

      const price = this.parsePrice(priceMatch[1])
      if (price <= 0) return null

      const titleMatch = text.match(/mercado\s*livre:\s*(.+?)(?=R\$|$)/i)
      const product_title = titleMatch ? titleMatch[1].trim() : `Mercado Livre Product ${productId}`

      return {
        marketplace: 'mercadolivre',
        product_id: productId,
        product_title,
        original_price: price,
        discounted_price: price,
        discount_percent: 0,
        original_url: `https://www.mercadolivre.com.br/`,
        normalized_url: `https://www.mercadolivre.com.br/`
      }
    }

    if (marketplace === 'amazon') {
      // Basic Amazon extraction (Phase 4)
      const asinMatch = text.match(/\bB[0-9A-Z]{9}\b/i)
      const productId = asinMatch ? asinMatch[1] : `amazon-${Date.now()}`

      const priceMatch = text.match(/\$\s*([\d.,]+)/i)
      if (!priceMatch) return null

      const price = this.parsePrice(priceMatch[1])
      if (price <= 0) return null

      const titleMatch = text.match(/amazon:\s*(.+?)(?=\$|$)/i)
      const product_title = titleMatch ? titleMatch[1].trim() : `Amazon Product ${productId}`

      return {
        marketplace: 'amazon',
        product_id: productId,
        product_title,
        original_price: price,
        discounted_price: price,
        discount_percent: 0,
        original_url: `https://www.amazon.com/`,
        normalized_url: `https://www.amazon.com/`
      }
    }

    return null
  }

  /**
   * Extract Shopee offer from text with flexible price parsing
   * Handles both "R$100 → R$80" and single price "R$100" formats
   */
  private extractShopeeFromText(text: string): Partial<OfferData> | null {
    if (!text) return null

    // Extract product ID from common patterns
    const idMatch = text.match(/product[_-]?(\d+)|p[_-](\d+)|\b(\d{8,})\b/i)
    const productId = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3]) : `shopee-${Date.now()}`

    // Try to extract two prices (original → discounted)
    let priceMatch = text.match(/R\$\s*([\d.,]+)\s*(?:→|por)\s*R\$\s*([\d.,]+)/i)

    if (priceMatch) {
      // Two prices found
      const original_price = this.parsePrice(priceMatch[1])
      const discounted_price = this.parsePrice(priceMatch[2])

      if (original_price <= 0 || discounted_price <= 0) return null

      const discount_percent = Math.round(
        ((original_price - discounted_price) / original_price) * 100
      )

      if (discount_percent > 95 || discount_percent < 0) return null

      const titleMatch = text.match(/shopee:\s*(.+?)(?=R\$|$)/i)
      const product_title = titleMatch ? titleMatch[1].trim() : `Shopee Product ${productId}`

      return {
        marketplace: 'shopee',
        product_id: productId,
        product_title,
        original_price,
        discounted_price,
        discount_percent,
        original_url: `https://shopee.com.br/search?keyword=${encodeURIComponent(product_title)}`,
        normalized_url: `https://shopee.com.br/search?keyword=${encodeURIComponent(product_title)}`
      }
    }

    // Try single price
    priceMatch = text.match(/R\$\s*([\d.,]+)/i)
    if (priceMatch) {
      const price = this.parsePrice(priceMatch[1])
      if (price <= 0) return null

      const titleMatch = text.match(/shopee:\s*(.+?)(?=R\$|$)/i)
      const product_title = titleMatch ? titleMatch[1].trim() : `Shopee Product ${productId}`

      return {
        marketplace: 'shopee',
        product_id: productId,
        product_title,
        original_price: price,
        discounted_price: price,
        discount_percent: 0,
        original_url: `https://shopee.com.br/search?keyword=${encodeURIComponent(product_title)}`,
        normalized_url: `https://shopee.com.br/search?keyword=${encodeURIComponent(product_title)}`
      }
    }

    return null
  }

  /**
   * Stub for Mercado Livre extraction (Phase 3)
   * AC-038.6: ML patterns documented but not implemented
   */
  extractMercadoLivre(text: string, url: string): Partial<OfferData> | null {
    // Phase 3 implementation
    return null
  }

  /**
   * Stub for Amazon extraction (Phase 4)
   * AC-038.7: Amazon ASIN patterns documented but not implemented
   */
  extractAmazon(text: string, url: string): Partial<OfferData> | null {
    // Phase 4 implementation
    return null
  }
}

// Singleton instance
export const urlExtractor = new URLExtractor()
