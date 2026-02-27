import { config } from '../../lib/config.js'
import { logger } from '../../lib/logger.js'
import { SessionBannedError } from '../../lib/errors.js'
import { redisConnection as redis } from '../../queues/index.js'

interface EvolutionInstance {
  instanceName: string
  connectionStatus: 'open' | 'close' | 'connecting'
  ownerJid?: string
  profileName?: string
  qrcode?: string
}

interface CreateGroupConfig {
  name: string
  participants: string[]   // E.164 phone numbers
  pictureUrl?: string
}

interface WAGroup {
  id: string
  name: string
  participants: string[]
  inviteLink?: string
}

export class SessionManager {
  private baseUrl = config.evolution.baseUrl
  private apiKey = config.evolution.apiKey

  private headers() {
    return {
      'Content-Type': 'application/json',
      apikey: this.apiKey,
    }
  }

  private instanceName(tenantId: string, connectionId: string): string {
    return `zap_${tenantId}_${connectionId}`
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const res = await fetch(url, {
      ...options,
      headers: { ...this.headers(), ...options.headers },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Evolution API error [${res.status}]: ${body}`)
    }

    return res.json() as Promise<T>
  }

  // ----- Instance Lifecycle -----

  async createInstance(tenantId: string, connectionId: string): Promise<{ instanceName: string }> {
    const instanceName = this.instanceName(tenantId, connectionId)
    await this.fetch('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        webhook: {
          enabled: true,
          url: config.evolution.webhookUrl,
          byEvents: false,
          base64: false,
          events: ['CONNECTION_UPDATE', 'CONTACTS_UPSERT'],
        },
      }),
    })
    logger.info('Evolution instance created', { tenantId, connectionId, instanceName })
    return { instanceName }
  }

  async getStatus(tenantId: string, connectionId: string): Promise<EvolutionInstance> {
    const instanceName = this.instanceName(tenantId, connectionId)
    const result = await this.fetch<EvolutionInstance[]>(
      `/instance/fetchInstances?instanceName=${instanceName}`,
    )
    logger.debug('Evolution fetchInstances raw', { result })
    return result[0]
  }

  async getQRCode(tenantId: string, connectionId: string): Promise<string | null> {
    const instanceName = this.instanceName(tenantId, connectionId)
    const result = await this.fetch<{ base64?: string }>(
      `/instance/connect/${instanceName}`,
    )
    return result.base64 ?? null
  }

  async disconnect(tenantId: string, connectionId: string): Promise<void> {
    const instanceName = this.instanceName(tenantId, connectionId)
    await this.fetch(`/instance/logout/${instanceName}`, { method: 'DELETE' })
  }

  async deleteInstance(tenantId: string, connectionId: string): Promise<void> {
    const instanceName = this.instanceName(tenantId, connectionId)
    await this.fetch(`/instance/delete/${instanceName}`, { method: 'DELETE' })
  }

  // ----- Session Health -----

  async assertHealthy(tenantId: string, connectionId: string): Promise<void> {
    const instance = await this.getStatus(tenantId, connectionId)
    if (instance.connectionStatus === 'close') {
      const bannedKey = `session_banned:${tenantId}:${connectionId}`
      const wasBanned = await redis.get(bannedKey)
      if (wasBanned) throw new SessionBannedError(this.instanceName(tenantId, connectionId))
    }
  }

  // ----- Group Operations -----

  async createGroup(tenantId: string, connectionId: string, groupConfig: CreateGroupConfig): Promise<WAGroup> {
    const instanceName = this.instanceName(tenantId, connectionId)
    const result = await this.fetch<WAGroup>(`/group/create/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        subject: groupConfig.name,
        participants: groupConfig.participants,
      }),
    })

    logger.info('WhatsApp group created', { tenantId, connectionId, groupId: result.id })
    return result
  }

  async getGroupInviteLink(tenantId: string, connectionId: string, groupId: string): Promise<string> {
    const instanceName = this.instanceName(tenantId, connectionId)
    const result = await this.fetch<{ inviteUrl: string }>(
      `/group/inviteCode/${instanceName}?groupJid=${groupId}`,
    )
    return result.inviteUrl
  }

  async getGroups(tenantId: string, connectionId: string): Promise<WAGroup[]> {
    const instanceName = this.instanceName(tenantId, connectionId)
    return this.fetch<WAGroup[]>(`/group/fetchAllGroups/${instanceName}?getParticipants=true`)
  }

  async removeParticipants(tenantId: string, connectionId: string, groupId: string, phones: string[]): Promise<void> {
    const instanceName = this.instanceName(tenantId, connectionId)
    await this.fetch(`/group/updateParticipant/${instanceName}`, {
      method: 'PUT',
      body: JSON.stringify({
        groupJid: groupId,
        action: 'remove',
        participants: phones,
      }),
    })
  }

  // ----- Messaging -----

  async sendTextToGroup(tenantId: string, connectionId: string, groupId: string, text: string): Promise<void> {
    const instanceName = this.instanceName(tenantId, connectionId)
    await this.fetch(`/message/sendText/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        number: groupId,
        text,
      }),
    })
  }

  async sendTextToPhone(tenantId: string, connectionId: string, phone: string, text: string): Promise<void> {
    const instanceName = this.instanceName(tenantId, connectionId)
    await this.fetch(`/message/sendText/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        number: phone,
        text,
      }),
    })
  }

  /**
   * AC-034.7 NOVIDADE: Send image with caption to group
   * Supports offer replication with product images
   *
   * @param tenantId - Tenant ID
   * @param connectionId - Connection ID (WhatsApp session)
   * @param groupId - Group JID (WhatsApp group identifier)
   * @param imageUrl - URL of the image to send (must be publicly accessible)
   * @param caption - Optional caption/text to include with image
   */
  async sendImageToGroup(
    tenantId: string,
    connectionId: string,
    groupId: string,
    imageUrl: string,
    caption?: string
  ): Promise<void> {
    const instanceName = this.instanceName(tenantId, connectionId)

    try {
      await this.fetch(`/message/sendMedia/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({
          number: groupId,
          mediaType: 'image',
          media: imageUrl,
          caption: caption || '',
        }),
      })

      logger.info('Image sent to group', {
        tenantId,
        connectionId,
        groupId,
        imageUrl: imageUrl.substring(0, 50) + '...',
        hasCaption: !!caption,
      })
    } catch (error) {
      logger.error('Failed to send image to group', {
        tenantId,
        connectionId,
        groupId,
        imageUrl,
        error: error instanceof Error ? error.message : 'Unknown',
      })
      throw error
    }
  }

  /**
   * AC-034.7 NOVIDADE: Send document/file to group
   * Supports offer replication with additional media types
   *
   * @param tenantId - Tenant ID
   * @param connectionId - Connection ID
   * @param groupId - Group JID
   * @param fileUrl - URL of the file to send
   * @param mediaType - Type of media (document, video, audio, etc.)
   * @param caption - Optional caption
   */
  async sendMediaToGroup(
    tenantId: string,
    connectionId: string,
    groupId: string,
    fileUrl: string,
    mediaType: 'image' | 'video' | 'document' | 'audio',
    caption?: string
  ): Promise<void> {
    const instanceName = this.instanceName(tenantId, connectionId)

    try {
      await this.fetch(`/message/sendMedia/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({
          number: groupId,
          mediaType,
          media: fileUrl,
          caption: caption || '',
        }),
      })

      logger.info('Media sent to group', {
        tenantId,
        connectionId,
        groupId,
        mediaType,
        fileUrl: fileUrl.substring(0, 50) + '...',
      })
    } catch (error) {
      logger.error('Failed to send media to group', {
        tenantId,
        connectionId,
        groupId,
        mediaType,
        fileUrl,
        error: error instanceof Error ? error.message : 'Unknown',
      })
      throw error
    }
  }
}

// Singleton
export const sessionManager = new SessionManager()
