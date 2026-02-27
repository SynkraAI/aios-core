import { supabaseAdmin } from '../../../db/client.js'
import { logger } from '../../../lib/logger.js'

/**
 * MarketplaceStrategy interface for link construction
 */
export interface MarketplaceStrategy {
  buildLink(productId: string, tenantId: string): Promise<string>
}

/**
 * ShopeeStrategy
 *
 * Constructs Shopee affiliate links using tenant's affiliate ID
 * retrieved from marketplace_credentials table (ZAP-043).
 *
 * Format: https://shopee.com.br/p-{productId}?af_id={affiliateId}
 */
export class ShopeeStrategy implements MarketplaceStrategy {
  private readonly baseUrl = 'https://shopee.com.br'

  /**
   * Build Shopee affiliate link
   *
   * @param productId - Shopee product ID (must be numeric string)
   * @param tenantId - Tenant ID to fetch affiliate ID from
   * @returns Constructed Shopee affiliate link
   * @throws Error if product ID invalid or Shopee not configured
   */
  async buildLink(productId: string, tenantId: string): Promise<string> {
    // Validate product ID (must be numeric)
    if (!productId || typeof productId !== 'string' || !/^\d+$/.test(productId)) {
      const error = `Invalid Shopee product ID: ${productId || 'empty'}`
      logger.error(error)
      throw new Error(error)
    }

    // Fetch affiliate ID from credentials (ZAP-043)
    const { data: creds, error: fetchError } = await supabaseAdmin
      .from('marketplace_credentials')
      .select('shopee_affiliate_id')
      .eq('tenant_id', tenantId)
      .single()

    if (fetchError || !creds?.shopee_affiliate_id) {
      const error = 'Shopee not configured'
      logger.error(`Failed to fetch Shopee credentials for tenant ${tenantId}: ${fetchError?.message || 'no affiliate_id'}`)
      throw new Error(error)
    }

    const affiliateId = creds.shopee_affiliate_id

    // Build link (idempotent: same inputs always produce same output)
    const link = `${this.baseUrl}/p-${productId}?af_id=${affiliateId}`

    logger.debug(`Built Shopee link for tenant ${tenantId}`, {
      productId,
      affiliateId,
      link,
    })

    return link
  }
}
