import { Queue } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from '../lib/config.js'

// ---- Redis connection for non-BullMQ uses (rate limiting, cache) ----
export const redisConnection = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
})

// ---- BullMQ connection config (plain object avoids bundled ioredis type conflict) ----
function parseRedisConfig(url: string) {
  try {
    const u = new URL(url)
    return {
      host: u.hostname || 'localhost',
      port: parseInt(u.port || '6379', 10),
      ...(u.password ? { password: decodeURIComponent(u.password) } : {}),
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    }
  } catch {
    return {
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    }
  }
}

const bullConnection = parseRedisConfig(config.redis.url)

const queueOptions = {
  connection: bullConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
}

// Queue definitions — names use colon notation (matches worker listeners)
export const messageQueue = new Queue('message-send', queueOptions)
export const broadcastQueue = new Queue('broadcast-proc', queueOptions)
export const sequenceQueue = new Queue('sequence-tick', queueOptions)
export const triggerQueue = new Queue('trigger-proc', queueOptions)
export const offerParserQueue = new Queue('offer-parser', queueOptions)

// AC-048.1 & AC-048.6: OfferReplicationQueue with per-job rate limiting
// Exponential backoff: 5min → 10min → 20min → 60min (4 attempts max)
export const offerReplicationQueue = new Queue('offer-replication', {
  connection: bullConnection,
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      type: 'exponential' as const,
      delay: 5 * 60 * 1000, // Start at 5 min
    },
    removeOnComplete: true,
    removeOnFail: false, // Keep failed jobs for inspection
  },
})

// Queue names for reference
export const QUEUE_NAMES = {
  MESSAGE_SEND: 'message-send',
  BROADCAST_PROC: 'broadcast-proc',
  SEQUENCE_TICK: 'sequence-tick',
  TRIGGER_PROC: 'trigger-proc',
  OFFER_PARSER: 'offer-parser',
  OFFER_REPLICATION: 'offer-replication',
} as const

// Anti-ban rate limits
export const WA_RATE_LIMITS = {
  minDelayMs: 2000,
  maxDelayMs: 8000,
  maxPerHour: 500,
  maxPerDay: 3000,
} as const

// Async humanized delay (anti-ban — must be awaited)
export async function humanizedDelay(
  minMs: number = WA_RATE_LIMITS.minDelayMs,
  maxMs: number = WA_RATE_LIMITS.maxDelayMs,
): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  await new Promise<void>((resolve) => setTimeout(resolve, delay))
}

// Job payload types
export interface MessageJobData {
  broadcastId: string
  groupId: string
  waGroupId: string       // WhatsApp JID needed by Evolution API
  tenantId: string
  connectionId: string    // WhatsApp connection UUID (for session lookup)
  content: {
    type: string
    text?: string
    url?: string
    caption?: string
    filename?: string
  }
  scheduledFor?: string   // ISO timestamp for delayed delivery tracking
}

export interface BroadcastJobData {
  broadcastId: string
  tenantId: string
}

export interface TriggerJobData {
  source: 'hotmart' | 'kiwify' | 'generic'
  event: string           // generic string — supports all event types
  tenantId: string
  email: string           // required for lead upsert
  phone?: string
  productId?: string
  purchaseId?: string
  payload: unknown        // raw source payload for future processing
}

// AC-041: OfferParserWorker job payload
// See @zap/types for OfferParserJob (includes media_url for AC-034.7: NOVIDADE)

// AC-048: OfferReplicationQueue job payload
// Triggered by offer-parser → schedules across multiple groups with rate limiting
// AC-034.7: Include product_image_url for image-based replication
export interface OfferReplicationJobData {
  offerId: string                    // Unique offer ID
  tenantId: string
  connectionId: string               // WhatsApp connection UUID
  parsedOffer: {
    productId: string
    marketplace: 'shopee' | 'mercadolivre' | 'amazon'
    price?: number
    originalUrl: string
    productImageUrl?: string         // AC-034.7: From captured_offers
  }
  targetGroups: Array<{
    groupId: string
    waGroupId: string                // WhatsApp JID
  }>
  affiliateLinks?: Record<string, string> // Built by LinkSubstitutionService
}
