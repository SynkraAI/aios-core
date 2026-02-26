// Core domain types shared between frontend and backend

// ---- Tenant / Workspace ----
export interface Tenant {
  id: string
  slug: string
  name: string
  planId: string
  createdAt: string
}

export interface TenantUser {
  id: string
  tenantId: string
  userId: string
  role: 'admin' | 'operator' | 'viewer'
  email: string
  name: string | null
}

// ---- WhatsApp Connection ----
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'banned'

export interface WhatsAppConnection {
  id: string
  tenantId: string
  phone: string
  displayName: string
  evolutionInstanceId: string
  status: ConnectionStatus
  lastSeenAt: string | null
  createdAt: string
}

// ---- Monitored Groups (for competitor monitoring) ----
export type MonitoredGroupStatus = 'active' | 'paused' | 'deleted'

export interface MonitoredGroup {
  id: string
  tenant_id: string
  connection_id: string
  group_name: string
  group_jid: string
  status: MonitoredGroupStatus
  monitored_since: string
  last_message_at: string | null
  message_count: number
  created_at: string
  updated_at: string
}

// ---- Project & Phases ----
export interface Project {
  id: string
  tenantId: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'archived'
  connectionId: string
  createdAt: string
}

export interface ProjectPhase {
  id: string
  projectId: string
  name: string
  order: number
  capacityPerGroup: number
}

// ---- Groups ----
export type GroupStatus = 'active' | 'full' | 'archived'

export interface Group {
  id: string
  tenantId: string
  projectId: string
  phaseId: string
  waGroupId: string
  waInviteLink: string
  name: string
  capacity: number
  participantCount: number
  status: GroupStatus
  createdAt: string
}

export interface GroupParticipant {
  id: string
  groupId: string
  leadId: string
  phone: string
  joinedAt: string
  removedAt: string | null
}

// ---- Leads ----
export interface Lead {
  id: string
  tenantId: string
  phone: string
  name: string | null
  email: string | null
  score: number
  tags: string[]
  sourceLinkId: string | null
  firstSeenAt: string
  lastActiveAt: string
}

export type LeadEventType =
  | 'link_click'
  | 'group_join'
  | 'group_leave'
  | 'purchase'
  | 'refund'
  | 'message_sent'
  | 'sequence_step'

export interface LeadEvent {
  id: string
  tenantId: string
  leadId: string
  type: LeadEventType
  scoreDelta: number
  metadata: Record<string, unknown>
  createdAt: string
}

// ---- Dynamic Links ----
export interface DynamicLink {
  id: string
  tenantId: string
  projectId: string
  phaseId: string
  token: string
  shortUrl: string
  clickCount: number
  active: boolean
  fallbackUrl: string | null
  createdAt: string
}

// ---- Broadcasts ----
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'document'

export interface Broadcast {
  id: string
  tenantId: string
  projectId: string
  connectionId: string
  name: string
  status: BroadcastStatus
  targetType: 'all_groups' | 'specific_groups' | 'phase'
  targetIds: string[]
  totalCount: number
  sentCount: number
  failedCount: number
  scheduledAt: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export interface BroadcastMessage {
  id: string
  broadcastId: string
  order: number
  contentType: ContentType
  content: TextContent | MediaContent
}

export interface TextContent {
  type: 'text'
  text: string
  mentionAll?: boolean
}

export interface MediaContent {
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  caption?: string
  filename?: string
}

// ---- Webhooks ----
export type WebhookSource = 'hotmart' | 'kiwify' | 'generic'

export interface WebhookEvent {
  id: string
  tenantId: string
  source: WebhookSource
  payload: Record<string, unknown>
  signatureValid: boolean
  processed: boolean
  actionsTaken: Record<string, unknown>[]
  receivedAt: string
  processedAt: string | null
}

// ---- API Responses ----
export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export interface ApiError {
  error: string
  code: string
  details?: Record<string, unknown>
}

// ---- Real-time Events ----
export type RealtimeEvent =
  | { type: 'connection:status'; connectionId: string; status: ConnectionStatus }
  | { type: 'broadcast:progress'; broadcastId: string; sent: number; total: number; failed: number }
  | { type: 'group:participant_count'; groupId: string; count: number }
  | { type: 'purchase:received'; projectId: string; leadPhone: string }
  | { type: 'group:created'; phaseId: string; group: Group }
