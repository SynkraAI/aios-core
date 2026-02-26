# EPIC-04-STORY-25 — Analytics Modal UI
**Story ID:** ZAP-025
**Epic:** EPIC-04 — Dynamic Tracking Links
**Sprint:** 3 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 3
**Status:** Ready for Review
**Assigned to:** —
**Prepared by:** Morgan (Product Manager)
**Depends on:** ZAP-023 (Analytics endpoint), ZAP-024 (botão Analytics no LinkCard)

---

## User Story

**As a** tenant,
**I want** ver um modal com gráfico de clicks por dia e distribuição por grupo e device ao clicar em "Analytics" no meu link,
**so that** eu possa entender a performance da minha campanha rapidamente sem sair do dashboard.

---

## Context & Background

Esta story implementa o modal de analytics que é acionado pelo botão "Analytics" do `LinkCard` (ZAP-024). O endpoint já existe (ZAP-023). O foco aqui é a apresentação visual dos dados.

**Dados disponíveis no endpoint:**
- `total_clicks` — número total
- `clicks_by_day` — array de 30 dias com contagem diária
- `clicks_by_group` — distribuição por grupo
- `clicks_by_device` — mobile/desktop/tablet

**Gráfico:** Para MVP, usar uma biblioteca simples. Preferência: `recharts` (já amplamente usado em dashboards Next.js/React). Se não disponível no projeto, verificar se há alternativa.

---

## Acceptance Criteria

### AC-025.1 — Modal abre com dados ao clicar em "Analytics"
```
GIVEN usuário clica em "Analytics" no LinkCard
THEN modal abre com loading state
THEN GET /api/v1/analytics/links/:linkId é chamado
THEN dados são exibidos após carregamento
```

### AC-025.2 — Total de clicks exibido em destaque
```
GIVEN modal aberto
THEN exibe número total de clicks em destaque (ex: "142 clicks totais")
```

### AC-025.3 — Gráfico de clicks por dia (últimos 7 dias)
```
GIVEN modal com dados
THEN exibe gráfico de linha ou barra com clicks por dia
THEN período: últimos 7 dias (slice dos últimos 7 do array de 30 dias)
THEN eixo X: datas (ex: "14/02", "15/02", ...)
THEN eixo Y: número de clicks
THEN dias sem clicks aparecem como 0 (não omitidos)
```

### AC-025.4 — Lista de clicks por grupo
```
GIVEN modal com dados
THEN exibe lista: cada grupo com nome e contagem
THEN ordenado por count DESC (maior primeiro)
THEN se group_name = "Fallback": exibir como "Fallback (sem grupo)"
```

### AC-025.5 — Breakdown por device
```
GIVEN modal com dados
THEN exibe contagem por device_type:
  - 📱 Mobile: X clicks
  - 💻 Desktop: X clicks
  - 📟 Tablet: X clicks
(pode ser 3 cards de stat ou texto simples)
```

### AC-025.6 — Modal fecha corretamente
```
GIVEN modal aberto
WHEN clica no X ou fora do modal
THEN modal fecha
THEN lista de links não é alterada
```

### AC-025.7 — Estado vazio quando sem clicks
```
GIVEN link com 0 clicks
THEN modal exibe: "Nenhum click registrado ainda"
THEN não trava nem exibe NaN/undefined
```

### AC-025.8 — TypeScript: 0 erros em apps/web
```
WHEN running: npm run typecheck -w apps/web
THEN exit code 0
```

---

## Dev Notes

### Estrutura do componente

```typescript
// apps/web/src/components/links/AnalyticsModal.tsx
interface AnalyticsModalProps {
  linkId: string | null  // null = fechado
  linkName: string | null
  onClose: () => void
}

export function AnalyticsModal({ linkId, linkName, onClose }: AnalyticsModalProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!linkId) return
    setLoading(true)
    apiAnalytics.getLinkAnalytics(linkId)
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [linkId])

  if (!linkId) return null
  // render modal...
}
```

### API client para analytics

```typescript
// Adicionar em apps/web/src/lib/api.ts
export const apiAnalytics = {
  getLinkAnalytics: (linkId: string) =>
    api.get<{ data: LinkAnalytics }>(`/api/v1/analytics/links/${linkId}`),
}

interface LinkAnalytics {
  total_clicks: number
  clicks_by_day: { date: string; count: number }[]
  clicks_by_group: { group_id: string | null; group_name: string; count: number }[]
  clicks_by_device: { mobile: number; desktop: number; tablet: number }
}
```

### Gráfico — Recharts (se disponível)

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Usar últimos 7 dias:
const last7Days = data.clicks_by_day.slice(-7)

<ResponsiveContainer width="100%" height={180}>
  <LineChart data={last7Days}>
    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} /> {/* "02-14" */}
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="count" stroke="#8B5CF6" dot={false} />
  </LineChart>
</ResponsiveContainer>
```

### Alternativa sem biblioteca de gráficos

Se `recharts` não estiver disponível, usar representação simples:
- Tabela com data + count
- Barras CSS (div com width proporcional ao max count)
- **NÃO instalar nova dependência** sem confirmar com usuário

```typescript
// CSS bars fallback:
const maxCount = Math.max(...last7Days.map(d => d.count), 1)
last7Days.map(d => (
  <div key={d.date} className="flex items-center gap-2">
    <span className="text-xs w-12">{d.date.slice(5)}</span>
    <div
      className="h-4 bg-violet-500 rounded"
      style={{ width: `${(d.count / maxCount) * 100}%`, minWidth: d.count > 0 ? '4px' : '0' }}
    />
    <span className="text-xs">{d.count}</span>
  </div>
))
```

### Integração com ZAP-024 (LinksSection)

```typescript
// Em LinksSection.tsx, adicionar estado:
const [analyticsLinkId, setAnalyticsLinkId] = useState<string | null>(null)

// Passar para LinkCard:
<LinkCard
  ...
  onAnalytics={(id) => setAnalyticsLinkId(id)}
/>

// Adicionar modal ao final do JSX:
<AnalyticsModal
  linkId={analyticsLinkId}
  linkName={links.find(l => l.id === analyticsLinkId)?.name ?? null}
  onClose={() => setAnalyticsLinkId(null)}
/>
```

---

## Tasks / Subtasks

### Task 1: API client para analytics
- [x] 1.1 Adicionar `apiAnalytics` em `apps/web/src/lib/api.ts`
- [x] 1.2 Definir tipo `LinkAnalytics`

### Task 2: Componente AnalyticsModal
- [x] 2.1 Criar `apps/web/src/components/links/AnalyticsModal.tsx`
- [x] 2.2 Fetch ao abrir (useEffect com linkId dependency)
- [x] 2.3 Loading state enquanto carrega
- [x] 2.4 Exibir total_clicks em destaque
- [x] 2.5 Gráfico/barras de clicks_by_day (últimos 7 dias)
- [x] 2.6 Lista de clicks_by_group (ordenada por count DESC)
- [x] 2.7 Device breakdown (mobile/desktop/tablet)
- [x] 2.8 Estado vazio se total_clicks = 0

### Task 3: Integrar com LinksSection (ZAP-024)
- [x] 3.1 Adicionar estado `analyticsLink` em `page.tsx` (state lift — mais limpo que em LinksSection)
- [x] 3.2 Passar `onAnalytics(id, name)` para `LinkCard` via `LinksSection`
- [x] 3.3 Renderizar `<AnalyticsModal>` em `page.tsx`

### Task 4: Quality checks
- [x] 4.1 `npm run typecheck -w apps/web` → 0 erros
- [ ] 4.2 Teste manual: clicar Analytics → modal abre com dados
- [ ] 4.3 Teste: link sem clicks → estado vazio sem NaN
- [ ] 4.4 Teste: fechar modal → lista intacta

---

## Definition of Done

- [x] AC-025.1: Modal abre e busca dados ao clicar Analytics
- [x] AC-025.2: Total de clicks em destaque
- [x] AC-025.3: Gráfico/barras de clicks por dia (últimos 7 dias)
- [x] AC-025.4: Lista por grupo ordenada por count DESC
- [x] AC-025.5: Breakdown mobile/desktop/tablet
- [x] AC-025.6: Modal fecha sem alterar lista
- [x] AC-025.7: Estado vazio para link sem clicks
- [x] AC-025.8: TypeScript 0 erros

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/lib/api.ts` | MODIFY | `LinkAnalytics` interface + `getLinkAnalytics` com generic |
| `apps/web/src/components/links/AnalyticsModal.tsx` | CREATE | Modal completo: recharts LineChart, device cards, group list, empty state |
| `apps/web/src/components/links/LinkCard.tsx` | MODIFY | `onAnalytics(id, name)` passa nome junto |
| `apps/web/src/components/links/LinksSection.tsx` | MODIFY | `onAnalytics(id, name)` forwarded |
| `apps/web/src/app/dashboard/projects/[id]/page.tsx` | MODIFY | `analyticsLink` state + `<AnalyticsModal>` renderizado |

---

## Dev Agent Record

### Debug Log

- `apiAnalytics.getLinkAnalytics` já existia em `api.ts` mas sem generic — atualizado para `api.get<{ data: LinkAnalytics }>(...)` e `LinkAnalytics` interface adicionada
- Story diz integrar `AnalyticsModal` em `LinksSection`, mas estado foi mantido em `page.tsx` (já preparado no ZAP-024) — evita prop drilling e mantém `LinksSection` sem estado de modal
- `onAnalytics` expandido de `(id)` para `(id, name)` em `LinkCard` e `LinksSection` para passar o `linkName` ao modal sem fazer lookup adicional
- `recharts` disponível `^2.12.0` — usado `LineChart` com `ResponsiveContainer` ✅

### Completion Notes

- `api.ts`: `LinkAnalytics` interface exportada + `getLinkAnalytics` com generic ✅
- `AnalyticsModal.tsx`: `useEffect` fetch ao abrir, loading spinner, `total_clicks` em destaque, `LineChart` recharts últimos 7 dias, device cards (📱💻📟), group list ordenada DESC, empty state ("Nenhum click registrado") ✅
- `LinkCard.tsx`/`LinksSection.tsx`: assinatura `onAnalytics(id, name)` atualizada ✅
- `page.tsx`: `analyticsLink` state + `<AnalyticsModal>` integrado, substituindo placeholder ZAP-024 ✅
- TypeScript: 0 erros ✅

### Agent Model Used

claude-sonnet-4-6

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-20 | Morgan (PM) | Story criada — Analytics Modal UI EPIC-04 |
| 2026-02-20 | Pax (PO) | Validada — GO (9/10). MEDIUM: @dev verificar recharts em package.json — usar fallback CSS se ausente, não instalar nova dep. Status: Ready |
| 2026-02-20 | Dex (Dev) | Implementado — AnalyticsModal com recharts LineChart, device cards, group list, empty state. State lift em page.tsx. TypeScript 0 erros. Status: Ready for Review |

---

*Source: docs/prd/epic-04-prd.md §10 ZAP-025*
*FR: FR-ANALYTICS-01 a FR-ANALYTICS-04*
