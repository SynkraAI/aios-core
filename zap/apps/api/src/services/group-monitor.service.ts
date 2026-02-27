import { supabaseAdmin } from '../db/client.js'
import { redisConnection as redis } from '../queues/index.js'
import { offerParserQueue } from '../queues/index.js'
import { logger } from '../lib/logger.js'
import type { EvolutionMessageEvent } from '../middleware/webhook-router.js'
import type { OfferParserJob } from '@zap/types'

/**
 * GroupMonitorService processes messages from monitored groups (competitor groups).
 *
 * Responsibilities:
 * - Extract message text and metadata (AC-034.1, AC-034.5)
 * - Filter out non-text messages (AC-034.6)
 * - Validate group is active (AC-034.2)
 * - Deduplicate messages (AC-034.4)
 * - Enqueue messages to OfferParserQueue
 * - Update group message counters
 *
 * Performance target: <100ms capture → queue (AC-034.3)
 */
export class GroupMonitorService {
  /**
   * Process incoming message from a monitored group.
   *
   * @param event Evolution webhook message event
   * @param tenantId Tenant ID (owner of monitored_groups config)
   */
  async processMessage(event: EvolutionMessageEvent, tenantId: string): Promise<void> {
    const startTime = Date.now()

    try {
      const groupJid = event.data?.key?.remoteJid

      if (!groupJid || typeof groupJid !== 'string') {
        logger.warn('Invalid groupJid in processMessage', { groupJid, tenantId })
        return
      }

      logger.debug('GroupMonitorService: processing message', { groupJid, tenantId })

      // Extract message metadata
      const messageId = event.data?.key?.id
      const senderJid = event.data?.key?.participant
      const messageData = event.data?.message
      const timestamp = event.data?.messageTimestamp

      // AC-034.6: Filter out non-text messages
      const text = this.extractMessageText(messageData)
      if (!text) {
        logger.debug('Non-text message, skipping', {
          groupJid,
          messageType: this.getMessageType(messageData),
        })
        return
      }

      // Skip own messages
      if (event.data?.key?.fromMe) {
        logger.debug('Skipping own message', { messageId, groupJid })
        return
      }

      // AC-034.4: Check for duplicate messages (before database check for efficiency)
      if (messageId) {
        const cacheKey = `captured:${messageId}`
        const cached = await redis.get(cacheKey)

        if (cached) {
          logger.debug('Duplicate message skipped', { messageId, groupJid })
          return
        }

        // Mark as captured (expire in 1 minute)
        await redis.setex(cacheKey, 60, '1')
      }

      // AC-034.2: Check group is active
      const { data: group, error: groupError } = await supabaseAdmin
        .from('monitored_groups')
        .select('id, status')
        .eq('group_jid', groupJid)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single()

      if (groupError || !group) {
        logger.debug('Group not found or not active', {
          groupJid,
          tenantId,
          error: groupError?.code,
        })
        return
      }

      // AC-034.5, AC-034.7: Prepare job payload with all required fields
      // Extract image URL if present (from imageMessage or webPreviewMessage)
      let imageUrl: string | undefined
      if (messageData) {
        if ('imageMessage' in messageData && typeof messageData.imageMessage === 'object') {
          const image = messageData.imageMessage as Record<string, unknown>
          if ('url' in image && typeof image.url === 'string') {
            imageUrl = image.url
          }
        } else if ('webPreviewMessage' in messageData && typeof messageData.webPreviewMessage === 'object') {
          const preview = messageData.webPreviewMessage as Record<string, unknown>
          if ('image' in preview && typeof preview.image === 'object') {
            const imgObj = preview.image as Record<string, unknown>
            if ('url' in imgObj && typeof imgObj.url === 'string') {
              imageUrl = imgObj.url
            }
          }
        }
      }

      const job: OfferParserJob = {
        message_id: messageId || `msg-${Date.now()}`,
        group_jid: groupJid,
        sender_jid: senderJid || 'unknown',
        text,
        timestamp: new Date(timestamp ? timestamp * 1000 : Date.now()).toISOString(),
        tenant_id: tenantId,
        media_url: imageUrl, // AC-034.7: NOVIDADE - include image from message or preview
      }

      // Enqueue to OfferParserQueue with retry logic
      try {
        await offerParserQueue.add('parse-offer', job, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        })

        logger.info('Message captured and enqueued', {
          messageId,
          groupJid,
          tenantId,
          captureTimeMs: Date.now() - startTime,
        })
      } catch (queueError) {
        logger.error('Failed to enqueue message to OfferParserQueue', {
          queueError,
          messageId,
          groupJid,
        })
        throw queueError
      }

      // Update group stats via RPC (atomic)
      const { error: updateError } = await supabaseAdmin.rpc('increment_message_count', {
        p_group_jid: groupJid,
        p_tenant_id: tenantId,
      })

      if (updateError) {
        logger.warn('Failed to update monitored group stats', {
          updateError,
          groupJid,
          tenantId,
        })
        // Don't fail processing if stats update fails
      }
    } catch (error) {
      logger.error('GroupMonitorService.processMessage failed', {
        error,
        tenantId,
        captureTimeMs: Date.now() - startTime,
      })
      throw error
    }
  }

  /**
   * Extract text from Evolution message payload.
   * AC-034.5: Handle various message formats
   * AC-034.7: Support images with captions and link previews
   */
  private extractMessageText(
    messageData: Record<string, unknown> | undefined,
  ): string | null {
    if (!messageData || typeof messageData !== 'object') {
      return null
    }

    // AC-034.6: Support different text formats
    if ('conversation' in messageData && typeof messageData.conversation === 'string') {
      return messageData.conversation
    }

    if ('extendedTextMessage' in messageData && typeof messageData.extendedTextMessage === 'object') {
      const extended = messageData.extendedTextMessage as Record<string, unknown>
      if ('text' in extended && typeof extended.text === 'string') {
        return extended.text
      }
    }

    // AC-034.7: Support image with caption
    if ('imageMessage' in messageData && typeof messageData.imageMessage === 'object') {
      const image = messageData.imageMessage as Record<string, unknown>
      if ('caption' in image && typeof image.caption === 'string') {
        return image.caption
      }
    }

    // AC-034.7: NOVIDADE - Support link preview (when link is shared without image)
    if ('webPreviewMessage' in messageData && typeof messageData.webPreviewMessage === 'object') {
      const preview = messageData.webPreviewMessage as Record<string, unknown>
      // Combine text + title + description from preview
      const parts: string[] = []
      if ('text' in preview && typeof preview.text === 'string') parts.push(preview.text)
      if ('title' in preview && typeof preview.title === 'string') parts.push(preview.title)
      if ('description' in preview && typeof preview.description === 'string') parts.push(preview.description)
      if ('canonicalUrl' in preview && typeof preview.canonicalUrl === 'string') parts.push(preview.canonicalUrl)
      if (parts.length > 0) return parts.join('\n')
    }

    return null
  }

  /**
   * Determine message type for logging.
   * AC-034.7: Include link preview type
   */
  private getMessageType(
    messageData: Record<string, unknown> | undefined,
  ): string {
    if (!messageData || typeof messageData !== 'object') {
      return 'unknown'
    }

    if ('imageMessage' in messageData) return 'image'
    if ('videoMessage' in messageData) return 'video'
    if ('audioMessage' in messageData) return 'audio'
    if ('documentMessage' in messageData) return 'document'
    if ('stickerMessage' in messageData) return 'sticker'
    if ('webPreviewMessage' in messageData) return 'link_preview' // NOVIDADE
    if ('conversation' in messageData || 'extendedTextMessage' in messageData) return 'text'

    return 'other'
  }
}

// Export singleton instance
export const groupMonitorService = new GroupMonitorService()
