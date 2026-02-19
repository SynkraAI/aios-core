# EPIC-02-STORY-11 — Connections Page UI
**Story ID:** ZAP-011
**Epic:** EPIC-02 — WhatsApp Connection Management
**Sprint:** 1 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 5
**Status:** Ready for Review
**Assigned to:** @dev (Dex)
**Prepared by:** River (Scrum Master)
**Implementation Order:** Day 5 of EPIC-02 (last — all API endpoints must be complete)

---

## User Story

**As a** tenant,
**I want** a Connections page in the dashboard that lets me see all my WhatsApp connections, add new ones via QR scan, and delete them with a confirmation,
**so that** I can manage my WhatsApp sessions without needing API knowledge.

---

## Context & Background

The Connections page is the **first functional page a user lands on after login**. It must:
1. List all connections with color-coded status badges
2. Allow "Nova Conexão" — creates connection + opens QR modal
3. Show live-updating QR code that auto-closes when scan succeeds
4. Allow deletion with confirmation dialog

**Tech stack:**
- Next.js App Router (`apps/web/src/app/(dashboard)/connections/page.tsx`)
- TanStack Query for data fetching + auto-refresh
- Native `EventSource` API for SSE (no additional library needed)
- Shadcn UI components (Dialog, Badge, Button, Card)

**API endpoints consumed:**
- `GET /api/v1/connections` — list (ZAP-006)
- `POST /api/v1/connections` — create (ZAP-006)
- `GET /api/v1/connections/:id/qr` — SSE stream (ZAP-007)
- `GET /api/v1/connections/:id/status` — status polling (ZAP-008)
- `DELETE /api/v1/connections/:id` — delete (ZAP-009)

---

## Acceptance Criteria

### AC-011.1 — Lists connections with color-coded status badges
```
Page at /connections shows all tenant connections.
Each connection card displays:
  - Status badge: green=connected, yellow=connecting, gray=disconnected, red=banned
  - Phone number (if connected)
  - Display name (if connected)
  - Created date
```

### AC-011.2 — "Nova Conexão" creates connection and opens QR modal
```
1. User clicks "Nova Conexão" button
2. POST /api/v1/connections called → returns { id }
3. QR modal opens automatically
4. SSE stream starts on GET /api/v1/connections/{id}/qr
```

### AC-011.3 — QR modal displays QR image, auto-refreshes every 5s via SSE
```
QR modal shows:
  - <img src={`data:image/png;base64,${code}`} /> rendered from SSE event: qr
  - "Aguardando escaneamento..." loading text between refreshes
  - Timer or progress showing time remaining (optional, nice-to-have)
```

### AC-011.4 — QR modal closes automatically on `event: connected`
```
When SSE sends 'event: connected':
  - Modal closes
  - Connection list refreshes (TanStack Query invalidate)
  - Connection badge turns green
```

### AC-011.5 — Delete button shows confirmation dialog
```
1. User clicks "Excluir" (delete)
2. Confirmation dialog: "Tem certeza? Esta ação não pode ser desfeita."
3. On confirm: DELETE /api/v1/connections/:id
4. On success: connection removed from list
5. If 409 (active broadcasts): show error toast "Conexão possui disparos ativos"
```

### AC-011.6 — Connection list auto-refreshes every 5 seconds
```
While any connection has status 'connecting' or 'disconnected':
  - TanStack Query refetchInterval = 5000ms
When all connections are 'connected' or 'banned':
  - Refetch stops (no unnecessary polling)
```

### AC-011.7 — Connected connections show phone + display name
```
Connection card when status='connected':
  - Shows: "+55 11 99999-9999" (formatted from E.164)
  - Shows: "Marina Nutricionista" (from display_name)
```

### AC-011.8 — Empty state with CTA when no connections exist
```
When GET /api/v1/connections returns []:
  - Shows: "Nenhuma conexão ainda"
  - Shows: Description "Conecte seu WhatsApp para começar a disparar mensagens"
  - Shows: "Nova Conexão" button prominently
```

---

## Technical Notes

### File Structure

```
apps/web/src/
  app/(dashboard)/connections/
    page.tsx                          ← Main connections page
  components/connections/
    connection-list.tsx               ← List of ConnectionCard components
    connection-card.tsx               ← Individual connection with badge + actions
    qr-modal.tsx                      ← Dialog with QR image + SSE logic
    connections-empty-state.tsx       ← Empty state component
  hooks/
    use-qr-stream.ts                  ← EventSource SSE hook
```

### `use-qr-stream.ts` Hook

```typescript
// apps/web/src/hooks/use-qr-stream.ts
type QRStreamState = {
  qrCode: string | null
  status: 'idle' | 'loading' | 'connected' | 'timeout' | 'error'
}

export function useQRStream(connectionId: string | null, onConnected: () => void) {
  const [state, setState] = useState<QRStreamState>({ qrCode: null, status: 'idle' })

  useEffect(() => {
    if (!connectionId) return
    setState({ qrCode: null, status: 'loading' })

    const source = new EventSource(`/api/v1/connections/${connectionId}/qr`)

    source.addEventListener('qr', (e) => {
      const { code } = JSON.parse(e.data)
      setState({ qrCode: code, status: 'loading' })
    })

    source.addEventListener('connected', () => {
      setState(s => ({ ...s, status: 'connected' }))
      source.close()
      onConnected()
    })

    source.addEventListener('timeout', () => {
      setState(s => ({ ...s, status: 'timeout' }))
      source.close()
    })

    source.addEventListener('error', () => {
      setState(s => ({ ...s, status: 'error' }))
      source.close()
    })

    // CRITICAL: close on unmount to prevent memory leaks
    return () => source.close()
  }, [connectionId])

  return state
}
```

### Status Badge Configuration

```typescript
// apps/web/src/components/connections/connection-card.tsx
const STATUS_BADGE: Record<string, { variant: string; label: string }> = {
  connecting:   { variant: 'yellow',  label: 'Conectando...' },
  connected:    { variant: 'green',   label: 'Conectado' },
  disconnected: { variant: 'gray',    label: 'Desconectado' },
  banned:       { variant: 'red',     label: 'Banido' },
}
```

### TanStack Query Auto-Refresh Pattern

```typescript
// Conditional refetch: only poll when connections need watching
const { data: connections } = useQuery({
  queryKey: ['connections'],
  queryFn: () => fetchConnections(),
  refetchInterval: (data) => {
    const needsPolling = data?.some(c =>
      c.status === 'connecting' || c.status === 'disconnected'
    )
    return needsPolling ? 5000 : false
  },
})
```

### API URL for Frontend

Use `process.env.NEXT_PUBLIC_API_URL` (default `http://localhost:3001`) as base URL for all API calls. This is set in `.env.example`.

### Nova Conexão Flow

```typescript
async function handleCreateConnection() {
  const res = await fetch(`${API_URL}/api/v1/connections`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const { data } = await res.json()
  setActiveConnectionId(data.id)  // opens QR modal
  queryClient.invalidateQueries({ queryKey: ['connections'] })
}
```

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-006 `POST /connections` + `GET /connections` | Hard | Day 2 |
| ZAP-007 `GET /connections/:id/qr` SSE | Hard | Day 3 |
| ZAP-008 `GET /connections/:id/status` | Hard | Day 3 |
| ZAP-009 `DELETE /connections/:id` | Hard | Day 4 |

---

## Definition of Done

- [x] Connections list with status badges renders correctly (AC-011.1)
- [x] "Nova Conexão" creates connection + opens QR modal (AC-011.2)
- [x] QR modal shows refreshing QR image from SSE (AC-011.3)
- [x] Modal closes automatically on `event: connected` (AC-011.4)
- [x] Delete shows confirmation; handles 409 with error banner (AC-011.5)
- [x] List auto-refreshes every 5s while connections are pending (AC-011.6)
- [x] Connected connections show phone + display name (AC-011.7)
- [x] Empty state with CTA shown when no connections (AC-011.8)
- [x] `source.close()` called on hook unmount (no memory leaks)
- [x] `npm run typecheck -w apps/web` → 0 errors
- [x] Story File List updated

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/app/dashboard/connections/page.tsx` | MODIFIED | Página completa — badges, QR modal auto-open, delete com 409, refetchInterval condicional |
| `apps/web/src/components/connections/qr-modal.tsx` | CREATED | Modal com SSE via useQRStream — estados: loading/connected/timeout |
| `apps/web/src/components/connections/connections-empty-state.tsx` | CREATED | Empty state com CTA |
| `apps/web/src/hooks/use-qr-stream.ts` | CREATED | EventSource hook — named events, close on unmount |

---

## Dev Agent Record

### Debug Log
- Página existia em `apps/web/src/app/dashboard/connections/page.tsx` (não em `(dashboard)/connections/`) — usada a rota real.
- Sem Shadcn UI instalado — modal implementado com Tailwind puro seguindo padrão existente.
- `apiConnections.delete()` lança `Error` com a mensagem da API. Detectado `active broadcasts` via message matching para mostrar erro específico.
- Refetch condicional: `query.state.data` pode ser undefined na primeira chamada — tratado com `?? []`.

### Completion Notes
- `useQRStream.ts` criado: EventSource com named events (`qr`, `connected`, `timeout`, `error`). `source.close()` no cleanup do useEffect.
- `QRModal.tsx` criado: exibe QR base64 como `<img src="data:image/png;base64,...">`, estados visuais para loading/connected/timeout.
- `ConnectionsEmptyState.tsx` criado com CTA "Nova Conexão".
- `page.tsx` reescrito: `onSuccess` do `createMutation` abre o modal com `result.data.id`. `refetchInterval` condicional (só faz polling quando há conexões pending). Delete com `window.confirm()` e banner de erro para 409.
- Decisão de design: connection cards e list mantidos inline na página (YAGNI — não criar abstrações desnecessárias para uma única página).

### Agent Model Used
claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-19 | River (SM) | Story created — @po validated (10/10), all API deps listed |
| 2026-02-19 | Dex (Dev) | Implementação completa — useQRStream, QRModal, EmptyState, page reescrita. Typecheck 0 erros. Status: Ready for Review |

---

*Source: docs/prd/epic-02-prd.md §9.6, §10 AC-011, §FR-CONN-UI*
*Arch ref: docs/architecture/epic-02-arch-validation.md §6.5*
*PO ref: docs/stories/epic-02/EPIC-02-PO-VALIDATION.md §ZAP-011*
