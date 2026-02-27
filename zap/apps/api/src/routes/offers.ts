import { Hono } from 'hono'
import { supabaseAdmin } from '../db/client.js'
import { logger } from '../lib/logger.js'
import { offerReplicationQueue } from '../queues/index.js'
import type { OfferReplicationJobData } from '../queues/index.js'
import { LinkSubstitutionService } from '../services/offers/link-substitution.service.js'

export const offersRouter = new Hono()

/**
 * AC-042.1-5: Get paginated, filtered list of captured offers
 *
 * Query params:
 * - marketplace: Filter by marketplace (shopee, mercadolivre, amazon)
 * - dateFrom: Filter from date (YYYY-MM-DD)
 * - dateTo: Filter to date (YYYY-MM-DD)
 * - showDuplicates: Include duplicates (true/false, default true)
 * - search: Search by product_title (ILIKE)
 * - page: Page number (default 1)
 */
offersRouter.get('/captured-offers', async (c) => {
  try {
    // Get tenant from auth context
    // TODO: Get from actual auth middleware
    const tenantId = c.req.header('x-tenant-id') || 'default'

    const marketplace = c.req.query('marketplace')
    const dateFrom = c.req.query('dateFrom')
    const dateTo = c.req.query('dateTo')
    const showDuplicates = c.req.query('showDuplicates') === 'true' || true
    const search = c.req.query('search')
    const page = parseInt(c.req.query('page') || '1')
    const limit = 20

    let query = supabaseAdmin
      .from('captured_offers')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)

    // AC-042.2: Filter by marketplace
    if (marketplace && marketplace !== 'null' && marketplace !== '') {
      query = query.eq('marketplace', marketplace)
    }

    // AC-042.3: Filter by date range
    if (dateFrom && dateFrom !== 'null' && dateFrom !== '') {
      const startDate = new Date(dateFrom)
      query = query.gte('captured_at', startDate.toISOString())
    }

    if (dateTo && dateTo !== 'null' && dateTo !== '') {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      query = query.lte('captured_at', endDate.toISOString())
    }

    // AC-042.4: Filter by duplicate status
    if (!showDuplicates) {
      query = query.eq('is_duplicate', false)
    }

    // AC-042.5: Search by product title
    if (search && search !== 'null' && search !== '') {
      query = query.ilike('product_title', `%${search}%`)
    }

    // Execute query with sorting and pagination
    // AC-042.1: Newest first
    const { data, count, error } = await query
      .order('captured_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      logger.error('Failed to fetch captured offers', { error, tenantId })
      return c.json(
        { error: `Failed to fetch offers: ${error.message}` },
        500
      )
    }

    logger.info('Fetched captured offers', {
      tenantId,
      count: data?.length,
      total: count,
      page,
    })

    return c.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    })
  } catch (error) {
    logger.error('Error in captured-offers endpoint', {
      error: error instanceof Error ? error.message : error,
    })
    return c.json(
      { error: 'Internal server error' },
      500
    )
  }
})

/**
 * AC-042.6: Get single offer detail by ID
 */
offersRouter.get('/captured-offers/:id', async (c) => {
  try {
    const tenantId = c.req.header('x-tenant-id') || 'default'
    const offerId = c.req.param('id')

    const { data, error } = await supabaseAdmin
      .from('captured_offers')
      .select('*')
      .eq('id', offerId)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      logger.warn('Offer not found', { offerId, tenantId })
      return c.json({ error: 'Offer not found' }, 404)
    }

    return c.json({ data })
  } catch (error) {
    logger.error('Error fetching offer detail', {
      error: error instanceof Error ? error.message : error,
    })
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * AC-042.7: Get counter statistics
 *
 * Returns:
 * - totalCapturedToday: Count of offers captured today
 * - totalNew: Count of offers with status 'new'
 * - byMarketplace: Count by marketplace
 */
offersRouter.get('/captured-offers-stats', async (c) => {
  try {
    const tenantId = c.req.header('x-tenant-id') || 'default'

    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Count offers captured today
    const { count: todayCount } = await supabaseAdmin
      .from('captured_offers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('captured_at', today.toISOString())

    // Count new offers
    const { count: newCount } = await supabaseAdmin
      .from('captured_offers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'new')

    // Count by marketplace (get all, then group in memory)
    const { data: allOffers } = await supabaseAdmin
      .from('captured_offers')
      .select('marketplace')
      .eq('tenant_id', tenantId)

    const byMarketplace: Record<string, number> = {}
    allOffers?.forEach((offer) => {
      byMarketplace[offer.marketplace] =
        (byMarketplace[offer.marketplace] || 0) + 1
    })

    logger.info('Fetched offer stats', {
      tenantId,
      todayCount,
      newCount,
      byMarketplace,
    })

    return c.json({
      data: {
        totalCapturedToday: todayCount || 0,
        totalNew: newCount || 0,
        byMarketplace,
      },
    })
  } catch (error) {
    logger.error('Error fetching offer stats', {
      error: error instanceof Error ? error.message : error,
    })
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * AC-049: Trigger offer replication to user's groups
 *
 * POST /offers/:id/replicate
 * - Fetches captured offer by ID
 * - Fetches user's active dispatch groups
 * - Builds affiliate links using LinkSubstitutionService
 * - Enqueues job to OfferReplicationQueue
 *
 * Request body:
 * - connectionId: WhatsApp connection to use for sending
 * - targetGroupIds?: Array of specific group IDs (optional, if empty uses all groups)
 */
offersRouter.post('/captured-offers/:id/replicate', async (c) => {
  try {
    const tenantId = c.req.header('x-tenant-id') || 'default'
    const offerId = c.req.param('id')

    const body = await c.req.json().catch(() => ({}))
    const { connectionId, targetGroupIds } = body as {
      connectionId?: string
      targetGroupIds?: string[]
    }

    // AC-049.1: Validate request
    if (!connectionId) {
      return c.json({ error: 'connectionId is required' }, 400)
    }

    // AC-049.2: Fetch captured offer
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('captured_offers')
      .select('*')
      .eq('id', offerId)
      .eq('tenant_id', tenantId)
      .single()

    if (offerError || !offer) {
      logger.warn('Captured offer not found', { offerId, tenantId })
      return c.json({ error: 'Offer not found' }, 404)
    }

    // AC-049.2: Fetch target groups
    let groupsQuery = supabaseAdmin
      .from('groups')
      .select('id, wa_group_id, name')
      .eq('tenant_id', tenantId)
      .eq('connection_id', connectionId)
      .eq('status', 'active')

    // Filter by specific group IDs if provided
    if (targetGroupIds && targetGroupIds.length > 0) {
      groupsQuery = groupsQuery.in('id', targetGroupIds)
    }

    const { data: groups, error: groupsError } = await groupsQuery

    if (groupsError) {
      logger.error('Failed to fetch groups', { groupsError, tenantId, connectionId })
      return c.json({ error: 'Failed to fetch groups' }, 500)
    }

    if (!groups || groups.length === 0) {
      return c.json(
        { error: 'No active groups found for this connection' },
        400
      )
    }

    logger.info('Fetched groups for replication', {
      offerId,
      groupCount: groups.length,
    })

    // AC-049.3: Build affiliate links using LinkSubstitutionService
    const linkService = new LinkSubstitutionService()
    let affiliateLinks: Record<string, string> = {}

    try {
      affiliateLinks = await linkService.buildAllAffiliateLinks(
        offer.product_id,
        [offer.marketplace],
        tenantId
      )
      logger.debug('Built affiliate links', { offerId, marketplace: offer.marketplace })
    } catch (linkError) {
      logger.warn('Failed to build affiliate links, will use original URL', {
        error: linkError instanceof Error ? linkError.message : 'Unknown error',
        offerId,
      })
      // Continue with original URL if link building fails
      affiliateLinks[offer.marketplace] = offer.original_url
    }

    // AC-049.4: Prepare job data
    const targetGroupsForJob = groups.map((g) => ({
      groupId: g.id,
      waGroupId: g.wa_group_id,
    }))

    const jobData: OfferReplicationJobData = {
      offerId,
      tenantId,
      connectionId,
      parsedOffer: {
        marketplace: offer.marketplace,
        productId: offer.product_id,
        price: offer.discounted_price || offer.original_price,
        originalUrl: offer.original_url,
      },
      targetGroups: targetGroupsForJob,
      affiliateLinks,
    }

    // AC-049.5: Enqueue to OfferReplicationQueue
    try {
      await offerReplicationQueue.add('replicate-offer', jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      })

      logger.info('Offer replication job enqueued', {
        offerId,
        groupCount: groups.length,
        marketplace: offer.marketplace,
      })

      return c.json(
        {
          success: true,
          message: `Offer queued for replication to ${groups.length} group(s)`,
          data: {
            offerId,
            groupCount: groups.length,
            marketplace: offer.marketplace,
          },
        },
        202
      )
    } catch (queueError) {
      logger.error('Failed to enqueue replication job', {
        queueError: queueError instanceof Error ? queueError.message : 'Unknown error',
        offerId,
      })
      return c.json({ error: 'Failed to queue replication job' }, 500)
    }
  } catch (error) {
    logger.error('Error in offer replication endpoint', {
      error: error instanceof Error ? error.message : error,
    })
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default offersRouter
