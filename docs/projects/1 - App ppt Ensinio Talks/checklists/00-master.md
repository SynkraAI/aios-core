# ✅ Master Checklist — App PPT Ensinio Talks

Visão geral do progresso em todas as fases. Marque conforme for completando.

---

## 🏗️ Fase 1 — Scaffold + Tokens (30 min)

- [ ] Projeto criado no Google AI Studio com nome `ensinio-talks-fosc`
- [ ] Prompt da Fase 1 colado e executado
- [ ] **Arquivo `src/tokens/design-tokens.ts` criado e completo**
- [ ] **`tailwind.config.ts` consome tokens (não tem valor hardcodado)**
- [ ] Navegação por teclado funciona (← → Esc F Home End)
- [ ] 8 Atos criados como placeholders (dividers + slide vazio)
- [ ] Componentes reutilizáveis existem: PromptBox, Carousel, VideoPlayer, ImageCard, DiagramPlaceholder, SpeechBubble, ActDivider, HighlightBox, ComparisonTable
- [ ] Todos os componentes consomem tokens (zero magic values)
- [ ] Dark mode ativo por padrão
- [ ] Cores corretas (bg #0a0a0a, accent #f59e0b) — via tokens
- [ ] Tipografia Montserrat + Inter — via tokens
- [ ] Sem erros no console

🔗 [Checklist detalhada →](./01-fase-1-scaffold.md)

---

## 🔍 Fase 1b — Auditoria de Tokens (5 min) ⚠️ CRÍTICO

- [ ] Prompt de auditoria colado e executado
- [ ] Relatório de violações gerado pelo AI Studio
- [ ] Todas as violações encontradas foram corrigidas
- [ ] Nenhum hex hardcodado nos componentes (só em design-tokens.ts)
- [ ] Nenhum spacing/size em px arbitrário fora dos tokens
- [ ] App continua funcionando visualmente igual depois das correções
- [ ] (Opcional) Relatório salvo em `auditoria-tokens-inicial.md` como baseline

🔗 [Prompt da auditoria →](../prompts/fase-1b-audit-tokens.md)

---

## 📝 Fase 2 — Conteúdo (1h)

- [ ] Ato 1 — Abertura & Hook
- [ ] Ato 2 — Mão na Massa
- [ ] Ato 3 — O que é Framework
- [ ] Ato 4 — Hierarquia
- [ ] Ato 5 — Processos
- [ ] Ato 6 — Qualidade
- [ ] Ato 7 — FORGE
- [ ] Ato 8 — Encerramento

**Ordem recomendada:** 1 → 5 → 4 → 7 → 3 → 2 → 6 → 8

🔗 [Checklist detalhada →](./02-fase-2-conteudo.md)

---

## 🎨 Fase 3 — Diagramas (1-2h)

Decisão: [ ] Opção A (placeholders) | [ ] Opção B (imagens reais)

Se Opção B:

- [ ] #9 — Fluxo Ideia → Produto ⭐
- [ ] #8 — Advisor Board ⭐
- [ ] #6 — Pirâmide Hierarquia
- [ ] #11 — Timeline do Forge
- [ ] #12 — Receita do Forge 8+3+10
- [ ] #1 — Executor → Orquestrador
- [ ] #2 — Vibe Coding vs SDD
- [ ] #3 — Janela de Contexto
- [ ] #4 — ENTP × ISTJ
- [ ] #5 — Fonte de Verdade
- [ ] #7 — Anatomia de um MIND
- [ ] #10 — Loop do Ping-Pong
- [ ] Todas as imagens salvas em `imagens/`
- [ ] Prompt de substituição colado no AI Studio
- [ ] Imagens exibindo corretamente no app

🔗 [Checklist detalhada →](./03-fase-3-diagramas.md)

---

## 🚀 Fase 4 — Deploy & Teste (30 min)

- [ ] Código exportado do AI Studio
- [ ] Descompactado em `~/CODE/Projects/ensinio-talks-fosc-app/`
- [ ] `npm install` executado sem erros
- [ ] Dev server rodando com porta alocada via port-manager
- [ ] Build de produção passa (`npm run build`)
- [ ] App funciona offline (Wi-Fi desligado)
- [ ] Testado no notebook final
- [ ] Testado em projetor/TV
- [ ] PDF backup gerado
- [ ] Ensaio cronometrado feito 1x

🔗 [Checklist detalhada →](./04-fase-4-deploy.md)

---

## 🎯 Status Geral

```
Fase 1   [          ] 0%   Scaffold + Tokens
Fase 1b  [          ] 0%   Auditoria de Tokens ⚠️
Fase 2   [          ] 0%   Conteúdo (8 Atos)
Fase 3   [          ] 0%   Diagramas
Fase 4   [          ] 0%   Deploy & Teste
                            ═══
TOTAL    [          ] 0%
```

Atualize esta barra conforme for completando as fases.
