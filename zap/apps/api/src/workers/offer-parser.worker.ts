import { Worker } from 'bullmq'
import { logger } from '../lib/logger.js'
import { redisConnection } from '../queues/index.js'
import { MarketplaceDetector } from '../services/offers/marketplace-detector.js'
import { URLExtractor } from '../services/offers/url-extractor.js'
import { deduplicationService } from '../services/offers/deduplication.service.js'
import { supabaseAdmin } from '../db/client.js'
import { addDays } from 'date-fns'

interface OfferParserJobData {
  message_id: string
  text: string
  group_jid: string
  tenant_id: string
  timestamp: string | Date
}

/**
 * AC-041: OfferParserWorker processes messages from offer-parser queue
 * - Detects marketplace (AC-041.2)
 * - Extracts offer data (AC-041.3)
 * - Handles deduplication (AC-041.4)
 * - Persists to captured_offers (AC-041.5)
 * - Retry logic with exponential backoff (AC-041.6)
 */
export const offerParserWorker = new Worker(
  'offer-parser',
  async (job) => {
    const { message_id, text, group_jid, tenant_id, timestamp } = job.data as OfferParserJobData

    logger.info('Processing offer', {
      message_id,
      text: text.substring(0, 50),
      attempt: job.attemptsMade + 1
    })

    try {
      // AC-041.2: Detect marketplace
      const detector = new MarketplaceDetector()
      const { marketplace, confidence } = detector.detect(text)

      if (!marketplace || confidence < 0.7) {
        logger.debug('No valid marketplace detected', { message_id, confidence })
        return { status: 'skipped', reason: 'no_marketplace' }
      }

      // AC-041.3: Extract offer data
      const extractor = new URLExtractor()
      const extracted = extractor.extract(text, marketplace)

      if (!extracted) {
        logger.debug('Failed to extract offer data', { message_id, marketplace })
        return { status: 'skipped', reason: 'extraction_failed' }
      }

      // Generate dedup hash
      const hash = deduplicationService.generateHash(
        marketplace as 'shopee' | 'mercadolivre' | 'amazon',
        extracted.product_id!,
        new Date(timestamp)
      )

      // AC-041.4: Check for duplicate
      const isDuplicate = await deduplicationService.checkDuplicate(
        tenant_id,
        hash,
        new Date(timestamp)
      )

      // Find original if duplicate
      let duplicateOfOfferId: string | null = null
      if (isDuplicate) {
        const { data: original } = await supabaseAdmin
          .from('captured_offers')
          .select('id')
          .eq('tenant_id', tenant_id)
          .eq('dedup_hash', hash)
          .eq('is_duplicate', false)
          .gte('captured_at', new Date(new Date(timestamp).setUTCHours(0, 0, 0, 0)).toISOString())
          .lt('captured_at', new Date(new Date(timestamp).setUTCHours(23, 59, 59, 999)).toISOString())
          .limit(1)
          .single()

        if (original) {
          duplicateOfOfferId = original.id
        }
      }

      // AC-041.5: Insert to captured_offers
      const expiresAt = marketplace === 'amazon' ? addDays(new Date(timestamp), 90) : null

      const { data: offer, error: dbErr } = await supabaseAdmin
        .from('captured_offers')
        .insert({
          tenant_id,
          marketplace,
          product_id: extracted.product_id,
          product_title: extracted.product_title,
          product_image_url: extracted.product_image_url,
          original_price: extracted.original_price,
          discounted_price: extracted.discounted_price,
          discount_percent: extracted.discount_percent,
          original_url: extracted.original_url,
          original_affiliate_id: extracted.original_affiliate_id,
          source_group_jid: group_jid,
          captured_from_message_id: message_id,
          captured_at: new Date(timestamp),
          dedup_hash: hash,
          is_duplicate: isDuplicate,
          duplicate_of_offer_id: duplicateOfOfferId,
          status: 'new', // AC-041.5: Always 'new' on capture
          expires_at: expiresAt
        })
        .select()
        .single()

      if (dbErr) {
        logger.error('DB insert failed', { dbErr, message_id, marketplace })
        throw dbErr
      }

      if (isDuplicate) {
        logger.info('Duplicate offer captured', {
          offer_id: offer.id,
          marketplace,
          duplicate_of: duplicateOfOfferId
        })
      } else {
        logger.info('Offer captured', {
          offer_id: offer.id,
          marketplace,
          product_id: extracted.product_id
        })
      }

      return {
        status: isDuplicate ? 'skipped_duplicate' : 'captured',
        offer_id: offer.id,
        is_duplicate: isDuplicate
      }
    } catch (error) {
      // AC-041.6: Transient errors retry via BullMQ
      logger.error('Offer parsing failed', {
        error: error instanceof Error ? error.message : error,
        message_id,
        attempt: job.attemptsMade + 1
      })
      throw error // Let BullMQ handle retries
    }
  },
  {
    connection: redisConnection as any
    // AC-041.6: Retry configuration (3 attempts, exponential backoff) is configured in queue defaultJobOptions
  } as any
)

// AC-041.6: Handle failed jobs
offerParserWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Job ${job.id} failed after ${job.attemptsMade} attempts`, {
      error: err.message,
      queue: 'offer-parser'
    })
    // Failed jobs stay in queue for debugging (removeOnFail: false)
  }
})

// Log completed jobs
offerParserWorker.on('completed', (job) => {
  logger.debug(`Job ${job.id} completed`, {
    result: job.returnvalue,
    duration: job.finishedOn ? job.finishedOn - (job.processedOn || 0) : 0
  })
})

// AC-041.1: Worker starts on startup
export async function startOfferParserWorker() {
  try {
    await offerParserWorker.waitUntilReady()
    logger.info('OfferParserWorker started', { queue: 'offer-parser' })
  } catch (error) {
    logger.error('Failed to start OfferParserWorker', {
      error: error instanceof Error ? error.message : error
    })
    throw error
  }
}

export { offerParserWorker as worker }
