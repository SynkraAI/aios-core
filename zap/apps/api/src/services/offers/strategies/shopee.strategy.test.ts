import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ShopeeStrategy } from './shopee.strategy.js'
import { supabaseAdmin } from '../../../db/client.js'

vi.mock('../../../db/client.js', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}))

vi.mock('../../../lib/logger.js', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('ShopeeStrategy', () => {
  let strategy: ShopeeStrategy
  const tenantId = 'tenant-123'
  const affiliateId = 'user_123'
  const productId = '123456'

  beforeEach(() => {
    strategy = new ShopeeStrategy()
    vi.clearAllMocks()
  })

  describe('AC-044.1: Link construction works', () => {
    it('builds valid Shopee link with correct format', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: affiliateId },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink(productId, tenantId)

      expect(link).toBe(`https://shopee.com.br/p-${productId}?af_id=${affiliateId}`)
    })

    it('constructs link with numeric product ID', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: affiliateId },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const testProductId = '999999'
      const link = await strategy.buildLink(testProductId, tenantId)

      expect(link).toContain(`p-${testProductId}`)
    })
  })

  describe('AC-044.2: Retrieves credential from marketplace_credentials table', () => {
    it('fetches shopee_affiliate_id from database', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: affiliateId },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await strategy.buildLink(productId, tenantId)

      expect(supabaseAdmin.from).toHaveBeenCalledWith('marketplace_credentials')
      expect(mockSelect).toHaveBeenCalledWith('shopee_affiliate_id')
    })

    it('filters by correct tenant_id', async () => {
      const mockEq = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { shopee_affiliate_id: affiliateId },
          error: null,
        }),
      })

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await strategy.buildLink(productId, tenantId)

      expect(mockEq).toHaveBeenCalledWith('tenant_id', tenantId)
    })
  })

  describe('AC-044.3: Handles missing credentials gracefully', () => {
    it('throws error if Shopee not configured (no credentials)', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await expect(strategy.buildLink(productId, tenantId)).rejects.toThrow(
        'Shopee not configured'
      )
    })

    it('throws error if database fetch fails', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await expect(strategy.buildLink(productId, tenantId)).rejects.toThrow(
        'Shopee not configured'
      )
    })

    it('throws error if affiliate_id is empty string', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: '' },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await expect(strategy.buildLink(productId, tenantId)).rejects.toThrow(
        'Shopee not configured'
      )
    })

    it('throws error if affiliate_id is null', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: null },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      await expect(strategy.buildLink(productId, tenantId)).rejects.toThrow(
        'Shopee not configured'
      )
    })
  })

  describe('AC-044.4: Validates product ID format', () => {
    it('accepts valid numeric product ID', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: affiliateId },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const validIds = ['1', '12345', '999999999']

      for (const validId of validIds) {
        await expect(strategy.buildLink(validId, tenantId)).resolves.not.toThrow()
      }
    })

    it('rejects invalid product ID (alphabetic)', async () => {
      await expect(strategy.buildLink('ABC', tenantId)).rejects.toThrow(
        'Invalid Shopee product ID: ABC'
      )
    })

    it('rejects invalid product ID (alphanumeric)', async () => {
      await expect(strategy.buildLink('P123', tenantId)).rejects.toThrow(
        'Invalid Shopee product ID: P123'
      )
    })

    it('rejects empty product ID', async () => {
      await expect(strategy.buildLink('', tenantId)).rejects.toThrow(
        'Invalid Shopee product ID: empty'
      )
    })

    it('rejects null-like product ID', async () => {
      await expect(strategy.buildLink(null as any, tenantId)).rejects.toThrow()
    })

    it('rejects special characters in product ID', async () => {
      await expect(strategy.buildLink('123#456', tenantId)).rejects.toThrow(
        'Invalid Shopee product ID: 123#456'
      )
    })

    it('rejects product ID with spaces', async () => {
      await expect(strategy.buildLink('123 456', tenantId)).rejects.toThrow(
        'Invalid Shopee product ID: 123 456'
      )
    })
  })

  describe('AC-044.5: Link construction is idempotent', () => {
    it('produces identical output for same inputs', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: affiliateId },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link1 = await strategy.buildLink(productId, tenantId)
      const link2 = await strategy.buildLink(productId, tenantId)

      expect(link1).toBe(link2)
      expect(link1).toBe(`https://shopee.com.br/p-${productId}?af_id=${affiliateId}`)
    })

    it('always produces same URL format regardless of order', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: affiliateId },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const productIds = ['111111', '222222']
      const links: Record<string, string> = {}

      for (const pId of productIds) {
        links[pId] = await strategy.buildLink(pId, tenantId)
      }

      // Call again in reverse order
      const reverseLinks: Record<string, string> = {}
      for (const pId of productIds.reverse()) {
        reverseLinks[pId] = await strategy.buildLink(pId, tenantId)
      }

      expect(links['111111']).toBe(reverseLinks['111111'])
      expect(links['222222']).toBe(reverseLinks['222222'])
    })
  })

  describe('Edge cases', () => {
    it('handles very long product ID (valid)', async () => {
      const longProductId = '9'.repeat(20)

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: affiliateId },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink(longProductId, tenantId)
      expect(link).toContain(`p-${longProductId}`)
    })

    it('handles affiliate ID with special characters', async () => {
      const specialAffiliateId = 'user_123-abc_def'

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { shopee_affiliate_id: specialAffiliateId },
            error: null,
          }),
        }),
      })

      ;(supabaseAdmin.from as any).mockReturnValue({
        select: mockSelect,
      })

      const link = await strategy.buildLink(productId, tenantId)
      expect(link).toContain(`af_id=${specialAffiliateId}`)
    })
  })
})
