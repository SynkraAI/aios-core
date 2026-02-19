import { z } from 'zod'

// ============================================================
// Phone validation
// ============================================================

export const phoneE164 = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format (+5511999999999)')

export const phoneBrazil = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .pipe(z.string().min(10).max(13))

// ============================================================
// Connection schemas
// ============================================================

export const connectionSchema = z.object({
  id: z.string().uuid(),
  phone: z.string().nullable(),
  display_name: z.string().nullable(),
  status: z.enum(['connecting', 'connected', 'disconnected', 'banned']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// ============================================================
// Project schemas
// ============================================================

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(500).optional(),
  connectionId: z.string().uuid('ID de conexão inválido'),
})

export const projectPhaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  order: z.number().int(),
  capacity_per_group: z.number().int(),
})

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(['active', 'paused', 'archived']),
  created_at: z.string().datetime(),
})

// ============================================================
// Group schemas
// ============================================================

export const createGroupSchema = z.object({
  projectId: z.string().uuid(),
  phaseId: z.string().uuid(),
  waGroupId: z.string().min(1, 'JID do grupo é obrigatório'),
  name: z.string().min(1).max(200),
  capacity: z.number().int().min(1).max(1024).default(1024),
})

export const groupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  wa_group_id: z.string(),
  wa_invite_link: z.string().nullable(),
  participant_count: z.number().int(),
  capacity: z.number().int(),
  status: z.enum(['active', 'full', 'archived']),
})

// ============================================================
// Broadcast schemas
// ============================================================

export const broadcastMessageSchema = z.object({
  order: z.number().int().min(0),
  content_type: z.enum(['text', 'image', 'video', 'audio', 'document']),
  content: z.union([
    z.object({ text: z.string().min(1).max(4096) }),
    z.object({ url: z.string().url(), caption: z.string().optional(), filename: z.string().optional() }),
  ]),
})

export const createBroadcastSchema = z.object({
  projectId: z.string().uuid(),
  connectionId: z.string().uuid(),
  name: z.string().min(1).max(200),
  target_type: z.enum(['all_groups', 'specific_groups', 'phase']).default('all_groups'),
  target_ids: z.array(z.string().uuid()).default([]),
  messages: z.array(broadcastMessageSchema).min(1, 'Pelo menos 1 mensagem é necessária').max(10),
  scheduled_at: z.string().datetime().optional(),
})

// ============================================================
// Link schemas
// ============================================================

export const createLinkSchema = z.object({
  phaseId: z.string().uuid(),
  fallbackUrl: z.string().url().optional(),
})

export const linkSchema = z.object({
  id: z.string().uuid(),
  token: z.string(),
  short_url: z.string(),
  click_count: z.number().int(),
  active: z.boolean(),
  fallback_url: z.string().nullable(),
  created_at: z.string().datetime(),
})

// ============================================================
// Webhook schemas
// ============================================================

export const hotmartWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    buyer: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.object({
        local_phone: z.string(),
        phone: z.string(),
      }).optional(),
    }).optional(),
    product: z.object({
      id: z.number().optional(),
      name: z.string().optional(),
    }).optional(),
  }),
})

// Exported type helpers
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type CreateBroadcastInput = z.infer<typeof createBroadcastSchema>
export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type BroadcastMessage = z.infer<typeof broadcastMessageSchema>
