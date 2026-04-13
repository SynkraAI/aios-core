# 🔍 Prompt — Fase 1b: Auditoria de Tokens

> **Ordem de execução:** Logo após a Fase 1 (scaffold), antes de começar a Fase 2
> **Tempo esperado:** ~5 min
> **Criticidade:** 🔴 ALTA — se pular, vai pagar caro na Fase 2

---

## ❓ Por que esta fase existe

O scaffold da Fase 1 pede pro AI Studio criar o sistema de tokens. Mas IA generativa tem uma mania chata: mesmo que você peça tokens, ela **escapa** em alguns lugares, hardcodando cores direto nos componentes "porque é mais rápido".

Se esses escapes passarem, na Fase 2 o AI Studio vai achar que é normal hardcodar — e vai reinventar cores, tamanhos e espaçamentos em cada slide. No fim, você tem 8 atos com 8 estilos diferentes. É o anti-padrão que a sua própria talk condena.

**Esta fase caça e mata esses escapes antes que vire bola de neve.**

---

## 🎯 Objetivo

Garantir que **100% dos valores de design** no código venham de `src/tokens/design-tokens.ts`. Nenhum hex, nenhum `px` arbitrário, nenhuma cor inline.

---

## ▶️ Instruções de Uso

1. Certifique-se de que a Fase 1 (scaffold) já foi executada
2. Copie o bloco abaixo
3. Cole no AI Studio **na mesma sessão da Fase 1**
4. Revise o relatório que o AI Studio gerar
5. Se houver violações, deixe ele corrigir antes de avançar

---

```
════════════════════════════════════════════════════════════
          COPIAR A PARTIR DAQUI ⬇
════════════════════════════════════════════════════════════

AUDITORIA DE TOKENIZAÇÃO — FASE 1b

Faça uma auditoria completa do código que você acabou de gerar na
Fase 1, procurando por violações do sistema de design tokens.
Depois de auditar, CORRIJA todas as violações encontradas.

CHECKLIST DE AUDITORIA:

1. COLORS — valores de cor hardcodados
   Procure por padrões como:
   - className="bg-[#XXXXXX]" ou bg-[rgb(...)]
   - style={{ color: '#XXXXXX' }}
   - backgroundColor: 'rgba(...)'
   - borderColor hardcodado
   - qualquer hex (#XXX ou #XXXXXX) que não esteja em design-tokens.ts

2. SPACING — valores de espaçamento hardcodados
   Procure por:
   - className com valores tipo p-[24px], m-[12px], gap-[8px]
   - style={{ padding: '1rem' }} ou margin direto
   - qualquer valor em px, rem ou em fora dos tokens

3. TYPOGRAPHY — tamanhos de texto hardcodados
   Procure por:
   - className="text-[18px]" ou text-[1.25rem]
   - style={{ fontSize: '...' }}
   - font-family hardcodada em componente

4. SHADOWS — sombras inline
   Procure por:
   - className="shadow-[0 4px 6px ...]"
   - style={{ boxShadow: '...' }}
   - qualquer sombra que não consuma shadows.* do tokens

5. RADII — border-radius hardcodados
   Procure por:
   - className="rounded-[8px]"
   - style={{ borderRadius: '...' }}

6. TRANSITIONS — durações e easings hardcodados
   Procure por:
   - className="transition-[300ms]" ou duration-[...]
   - style={{ transition: 'all 0.3s' }}

7. Z-INDEX — valores soltos
   Procure por z-[999], zIndex: 9999, etc. Devem vir de zIndex.*

RELATÓRIO ESPERADO

Gere um relatório em markdown com este formato:

## Auditoria de Tokens — Resultado

### ✅ Conforme
- [lista dos arquivos que estão 100% tokenizados]

### ❌ Violações Encontradas

| Arquivo | Linha | Violação | Token que deveria ser usado |
|---------|-------|----------|----------------------------|
| src/components/X.tsx | 42 | bg-[#0a0a0a] hardcodado | colors.bg.primary (bg-bg-primary) |
| ... | ... | ... | ... |

### 🔧 Correções Aplicadas
- [lista das correções que você fez]

### 📊 Estatísticas
- Total de arquivos auditados: X
- Arquivos conformes: X
- Arquivos com violações corrigidas: X
- Novos tokens adicionados ao design-tokens.ts: X

DEPOIS DO RELATÓRIO: aplique TODAS as correções no código. Se
precisar adicionar um token novo (ex: uma cor que esqueceu),
adicione em design-tokens.ts primeiro, depois use nos componentes.

════════════════════════════════════════════════════════════
          FIM DO BLOCO DE CÓPIA ⬆
════════════════════════════════════════════════════════════
```

---

## ✅ Validação

Depois da auditoria rodar, confira:

- [ ] Relatório gerado com tabela de violações
- [ ] Todas as violações marcadas como corrigidas
- [ ] `design-tokens.ts` ainda é o único lugar com valores raw
- [ ] App continua funcionando igual (visualmente)
- [ ] Navegação não quebrou
- [ ] Nenhum erro no console

---

## 🚨 Se o relatório mostrar MUITAS violações

Se o AI Studio gerou o scaffold com muitos hardcodes mesmo depois das instruções explícitas, é sinal de que o prompt da Fase 1 não foi respeitado direito. Opções:

1. **Deixar o AI Studio corrigir tudo nesta auditoria** (mais rápido)
2. **Refazer o scaffold do zero** com instruções ainda mais rígidas (mais seguro, mas perde o tempo investido)

Recomendação: deixe corrigir aqui. Só refaça do zero se houver mais de 20 violações ou se a estrutura do `design-tokens.ts` ficou muito ruim.

---

## 🎯 Fase Concluída

- [ ] Auditoria rodada
- [ ] Violações corrigidas
- [ ] Design tokens são a única fonte de verdade
- [ ] App visualmente intacto

**Próximo passo:** [Fase 2 — Ato 1: Abertura](./fase-2-ato-1-abertura.md)

💡 Dica: guarde o relatório da auditoria (copie e cole num arquivo aqui no projeto em `auditoria-tokens-inicial.md`) — é uma baseline pra se futuramente você quiser rodar a mesma auditoria de novo e comparar.
