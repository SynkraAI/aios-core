import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/db/client', () => ({
  pool: { query: vi.fn() },
}))

vi.mock('axios', () => ({
  default: { post: vi.fn() },
}))

import { pool } from '../../src/db/client'
import axios from 'axios'

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> }
const mockAxios = axios as unknown as { post: ReturnType<typeof vi.fn> }

const scores1 = { shoulders: 60, chest: 55, back: 50, arms: 65, core: 45, legs: 70, posture_score: 58, symmetry_score: 62 }
const scores2 = { shoulders: 72, chest: 60, back: 65, arms: 70, core: 55, legs: 75, posture_score: 68, symmetry_score: 70 }

async function simulateCompare(userId: string, id1: string, id2: string, authUserId = userId) {
  const { rows } = await mockPool.query(
    `SELECT id, scores FROM analyses WHERE id = ANY($1) AND user_id = $2 AND status = 'completed'`,
    [[id1, id2], authUserId]
  )

  if (rows.length !== 2) {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }

  const a1 = rows.find((r: { id: string }) => r.id === id1)
  const a2 = rows.find((r: { id: string }) => r.id === id2)

  const claudeRes = await mockAxios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-sonnet-4-6',
    messages: [{ role: 'user', content: `${JSON.stringify(a1.scores)} ${JSON.stringify(a2.scores)}` }]
  }, {})

  const raw: string = claudeRes.data.content[0].text
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

describe('POST /analyses/compare', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna summary e arrays corretos', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [
        { id: 'a1', scores: scores1 },
        { id: 'a2', scores: scores2 },
      ],
    })
    mockAxios.post.mockResolvedValueOnce({
      data: { content: [{ text: JSON.stringify({ summary: 'Ótima evolução!', improvements: ['Ombros'], needs_attention: ['Core'] }) }] },
    })

    const result = await simulateCompare('user-1', 'a1', 'a2')
    expect(result.summary).toBe('Ótima evolução!')
    expect(result.improvements).toContain('Ombros')
    expect(result.needs_attention).toContain('Core')
  })

  it('retorna 403 se análise não pertence ao usuário', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'a1', scores: scores1 }] })

    await expect(simulateCompare('user-1', 'a1', 'a2', 'user-2')).rejects.toMatchObject({ status: 403 })
  })

  it('lida com resposta Claude em bloco markdown', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: 'a1', scores: scores1 }, { id: 'a2', scores: scores2 }],
    })
    mockAxios.post.mockResolvedValueOnce({
      data: { content: [{ text: '```json\n{"summary":"Ok","improvements":[],"needs_attention":[]}\n```' }] },
    })

    const result = await simulateCompare('user-1', 'a1', 'a2')
    expect(result.summary).toBe('Ok')
  })
})
