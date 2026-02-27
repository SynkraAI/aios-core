import { supabaseAdmin } from '../db/client.js'
import { logger } from '../lib/logger.js'

export interface EvolutionMessageEvent {
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id?: string
      participant?: string
    }
    message?: {
      conversation?: string
      extendedTextMessage?: {
        text: string
      }
      imageMessage?: {
        url: string
        caption?: string
      }
      videoMessage?: {
        url: string
        caption?: string
      }
      audioMessage?: {
        url: string
      }
      documentMessage?: {
        url: string
        fileName?: string
      }
      stickerMessage?: {
        url: string
      }
      webPreviewMessage?: {
        text?: string
        description?: string
        title?: string
        image?: {
          url?: string
        }
        jpegThumbnail?: string
        canonicalUrl?: string
      }
    }
    messageTimestamp?: number
  }
}

export type RoutingDecision = 'monitor' | 'broadcast' | 'skip'

/**
 * Route Evolution webhook messages based on whether the group is monitored.
 * - monitored group (tracked for competitor offers) → 'monitor'
 * - regular group (user's own groups) → 'broadcast'
 * - invalid/error → 'skip'
 *
 * AC-033.1, AC-033.2, AC-033.3, AC-033.4, AC-033.5
 */
export async function routeWebhookMessage(
  event: EvolutionMessageEvent,
  tenantId: string,
): Promise<RoutingDecision> {
  try {
    const remoteJid = event.data?.key?.remoteJid

    // AC-033.5: Validate group_jid format
    if (!remoteJid || typeof remoteJid !== 'string' || !remoteJid.endsWith('@g.us')) {
      logger.warn('Invalid group_jid format in webhook', { remoteJid, tenantId })
      return 'skip'
    }

    // AC-033.3: Check if group is monitored (fast query)
    const startTime = Date.now()

    const { data: monitored, error: dbError } = await supabaseAdmin
      .from('monitored_groups')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('group_jid', remoteJid)
      .eq('status', 'active')
      .single()

    const queryTime = Date.now() - startTime

    // AC-033.3: Log performance
    if (queryTime > 50) {
      logger.warn('Monitored group lookup slow', { queryTime, remoteJid, tenantId })
    }

    // AC-033.4: Group ownership is handled by RLS on monitored_groups table
    // Only groups for this tenant will be returned

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 = no rows, which is expected
      logger.error('Database error checking monitored group', { dbError, remoteJid, tenantId })
      return 'skip'
    }

    if (monitored) {
      logger.debug('Webhook routing: monitored group', { remoteJid, tenantId, queryTime })
      return 'monitor'
    }

    logger.debug('Webhook routing: broadcast group', { remoteJid, tenantId, queryTime })
    return 'broadcast'
  } catch (error) {
    logger.error('Webhook routing error', { error, tenantId })
    return 'skip'
  }
}

/**
 * Extract message text from Evolution webhook payload.
 */
export function extractMessageText(event: EvolutionMessageEvent): string | null {
  try {
    const message = event.data?.message
    return message?.conversation || message?.extendedTextMessage?.text || null
  } catch {
    return null
  }
}
