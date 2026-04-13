# Project Context Sync Solution

**Data:** 2026-02-13
**Status:** ✅ Implementado e testado

---

## 🎯 Problema Original

**Terminal (tab title):**
```
🔧 aios-core: Baixar vídeos YouTube → Implementar playlist → Nova tarefa [0/151] 🧪
```

**Dashboard (StatusBar):**
- ❌ NÃO mostrava contexto do projeto
- Só exibia: Connection, Rate Limit, Claude Status, Active Agent

**Causa:** Dashboard não tinha componente para exibir projeto/contexto, e `status.json` não continha esses dados.

---

## ✅ Solução Implementada

### 1. **Script de Sincronização**

**Arquivo:** `.aiox-core/infrastructure/scripts/sync-project-to-dashboard.js`

**Função:**
- Lê dados de `.aiox/session.json` (fonte de verdade do terminal)
- Atualiza `.aiox/dashboard/status.json` com:
  - `project.name`, `project.emoji`, `project.type`
  - `status.progress`, `status.emoji`, `status.phase`
  - `context.epic`, `context.story`, `context.task`
- Preserva outros campos do `status.json`

**Uso:**
```bash
node .aiox-core/infrastructure/scripts/sync-project-to-dashboard.js
```

**Output:**
```
✅ Dashboard status.json synced with session.json
📊 Project: 🔧 aios-core
📈 Progress: [0/151] 🧪
📍 Context: Baixar vídeos YouTube → Implementar playlist → Nova tarefa
```

---

### 2. **Componente ProjectContext**

**Arquivo:** `apps/dashboard/src/components/layout/StatusBar.tsx`

**Adicionado:** Novo componente `ProjectContext` que:
- Lê `status.project` e `status.status` da API
- Renderiza: `🔧 aios-core [0/151] 🧪`
- Design consistente com outros badges (fundo azul translúcido)

**Código:**
```typescript
function ProjectContext({ status }: ProjectContextProps) {
  if (!status?.project?.name) return null;

  const { project, status: statusInfo } = status;
  const parts: string[] = [];

  if (project.emoji) parts.push(project.emoji);
  parts.push(project.name);
  if (statusInfo?.progress) parts.push(`[${statusInfo.progress}]`);
  if (statusInfo?.emoji) parts.push(statusInfo.emoji);

  return (
    <div className="..." style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
      <span style={{ color: 'rgb(59, 130, 246)' }}>
        {parts.join(' ')}
      </span>
    </div>
  );
}
```

**Posicionamento:** Entre Connection Status e Rate Limit (lado esquerdo da StatusBar)

---

### 3. **Tipos TypeScript Atualizados**

**Arquivo:** `apps/dashboard/src/types/index.ts`

**Adicionados campos:**
```typescript
export interface AiosStatus {
  // ...campos existentes
  project: {
    name: string;
    path?: string;
    emoji?: string;     // ✨ NOVO
    type?: string;      // ✨ NOVO
  } | null;
  status?: {            // ✨ NOVO
    progress?: string;
    emoji?: string;
    phase?: string;
  };
  context?: {           // ✨ NOVO
    epic?: string;
    story?: string;
    task?: string;
  };
}
```

---

## 📊 Arquitetura

```
┌─────────────────────────────────────────────┐
│  .aiox/session.json (Terminal)              │
│  • project: { name, emoji, type }           │
│  • status: { progress, emoji, phase }       │
│  • context: { epic, story, task }           │
└────────────────┬────────────────────────────┘
                 │
                 │ sync-project-to-dashboard.js
                 ▼
┌─────────────────────────────────────────────┐
│  .aiox/dashboard/status.json (Dashboard)    │
│  • project: { name, emoji, type }           │
│  • status: { progress, emoji, phase }       │
│  • context: { epic, story, task }           │
│  • stories, rateLimit, activeAgent...       │
└────────────────┬────────────────────────────┘
                 │
                 │ GET /api/status
                 ▼
┌─────────────────────────────────────────────┐
│  Dashboard UI                               │
│  • ProjectContext component                 │
│  • Shows: 🔧 aios-core [0/151] 🧪           │
└─────────────────────────────────────────────┘
```

---

## 🚀 Como Usar

### Primeira Sincronização

```bash
# Execute o script de sync
node .aiox-core/infrastructure/scripts/sync-project-to-dashboard.js

# Inicie o dashboard
cd apps/dashboard
npm run dev
```

### Quando Atualizar

Execute o script sempre que:
- Mudar o nome/emoji do projeto
- Atualizar o progresso (ex: 5/151)
- Mudar o contexto (epic/story/task)

### Automação (Opcional)

Adicione ao seu workflow:
```bash
# Pre-start hook do dashboard
"scripts": {
  "dev": "node ../../.aiox-core/infrastructure/scripts/sync-project-to-dashboard.js && next dev"
}
```

---

## 📋 Resultado Final

**Dashboard StatusBar agora mostra:**

```
┌──────────────────────────────────────────────────────────────┐
│ 🟢 Connected | 🔧 aios-core [0/151] 🧪 | Rate: 50/1000 ... │
└──────────────────────────────────────────────────────────────┘
```

**Consistente com Terminal:**
```
🔧 aios-core: Baixar vídeos YouTube → Implementar playlist → Nova tarefa [0/151] 🧪
```

---

## ✅ Vantagens desta Solução

1. **Simples** - Apenas 3 arquivos modificados
2. **Não-destrutiva** - Não quebra nada existente
3. **Flexível** - Script pode ser executado manualmente ou automatizado
4. **Separação mantida** - `session.json` e `status.json` continuam separados
5. **TypeScript seguro** - Tipos atualizados, sem `any`

---

## 📝 Arquivos Modificados

| Arquivo | Mudança | Linhas |
|---------|---------|--------|
| `sync-project-to-dashboard.js` | ✨ Novo script | 85 |
| `StatusBar.tsx` | + ProjectContext component | +25 |
| `types/index.ts` | + project/status/context fields | +12 |

**Total:** 122 linhas adicionadas

---

## 🔄 Manutenção

**Quando usar:**
- Sync manual sempre que dados mudam
- Ou automatize no `npm run dev` do dashboard

**Fallback:**
- Se `status.json` não tiver dados, ProjectContext não renderiza (graceful)
- Dashboard continua funcionando normalmente

---

*Solução implementada por Orion (aios-master) - 2026-02-13*
