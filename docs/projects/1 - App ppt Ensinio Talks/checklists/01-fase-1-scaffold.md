# ✅ Checklist — Fase 1: Scaffold

> **Objetivo:** Gerar o esqueleto vazio do app com navegação e componentes reutilizáveis, sem conteúdo real.

**Tempo estimado:** 30 minutos
**Prompt:** [`../prompts/fase-1-scaffold.md`](../prompts/fase-1-scaffold.md)

---

## 📋 Preparação

- [x] Acessar https://aistudio.google.com
- [x] Criar novo projeto em modo "Build"
- [x] Nomear como `ensinio-talks-fosc`

---

## 🚀 Execução

- [x] Abrir o arquivo `prompts/fase-1-scaffold.md`
- [x] Copiar o bloco entre os banners (COPIAR A PARTIR DAQUI → FIM DO BLOCO)
- [x] Colar no AI Studio
- [x] Aguardar geração completa
- [ ] Revisar o código gerado (passar os olhos no que ele criou)

---

## ✔️ Validação — Navegação

Teste cada atalho abaixo. Marque conforme funcionar:

- [x] Seta `→` avança para o próximo slide
- [x] Seta `←` volta para o slide anterior
- [x] Tecla `F` entra em fullscreen
- [x] Tecla `F` (novamente) sai de fullscreen
- [x] Tecla `Esc` abre menu lateral com índice
- [ ] Tecla `Home` vai para o primeiro slide
- [ ] Tecla `End` vai para o último slide
- [x] URL muda quando navega (ex: `#slide-3-2`)
- [x] Recarregar página mantém o slide atual

---

## ✔️ Validação — Visual

- [x] Background é preto absoluto (`#0a0a0a`)
- [x] Accent é amber (`#f59e0b`) visível em detalhes
- [x] Títulos usam Montserrat (bold, pesado)
- [x] Corpo de texto usa Inter (regular)
- [x] Barra de progresso no topo mostra posição
- [ ] Responsivo: funciona em diferentes tamanhos de tela

---

## ✔️ Validação — Estrutura

- [x] 8 Atos visíveis no menu lateral (Esc)
- [x] Cada Ato tem ActDivider (slide de transição)
- [x] Cada Ato tem pelo menos 1 slide placeholder vazio
- [x] Nomes dos Atos estão corretos:
  - [x] Ato 1 — Abertura & Hook
  - [x] Ato 2 — Mão na Massa
  - [x] Ato 3 — O que é Framework
  - [x] Ato 4 — Hierarquia
  - [x] Ato 5 — Processos
  - [x] Ato 6 — Qualidade
  - [x] Ato 7 — FORGE
  - [x] Ato 8 — Encerramento

---

## ✔️ Validação — Componentes Reutilizáveis

Verifique que os componentes existem no código (pasta `components/` ou similar):

- [ ] `<PromptBox />` — bloco de código copiável
- [ ] `<Carousel />` — slider de imagens
- [ ] `<VideoPlayer />` — player de vídeo
- [ ] `<ImageCard />` — imagem com legenda
- [ ] `<DiagramPlaceholder />` — placeholder amber para diagramas
- [ ] `<SpeechBubble />` — bloco de citação do palestrante
- [ ] `<ActDivider />` — slide de transição entre atos
- [ ] `<HighlightBox />` — caixa destacada
- [ ] `<ComparisonTable />` — tabela comparativa

---

## ✔️ Validação — Qualidade de Código

- [ ] TypeScript sem erros (`npm run typecheck` ou similar)
- [ ] Nenhum erro no console do browser
- [ ] Nenhum warning crítico
- [ ] Componentes com interfaces tipadas nos props

---

## ✔️ Validação — Sistema de Tokens ⚠️ CRÍTICO

Esta seção é o coração da Fase 1. Sem tokens, a Fase 2 vira um Frankenstein.

### Arquivos de Tokens
- [ ] Arquivo `src/tokens/design-tokens.ts` existe
- [ ] Exporta: `colors`, `typography`, `spacing`, `radii`, `shadows`, `transitions`, `zIndex`, `breakpoints`
- [ ] Todos os objetos têm `as const` (são read-only)
- [ ] Tipos exportados (`type Colors = typeof colors`, etc.)
- [ ] `tailwind.config.ts` importa de `design-tokens.ts`
- [ ] `tailwind.config.ts` NÃO tem nenhum hex hardcodado em theme.extend

### Cores
- [ ] `colors.bg.primary === '#0a0a0a'`
- [ ] `colors.accent.primary === '#f59e0b'`
- [ ] `colors.text.primary === '#ffffff'`
- [ ] Cores semânticas presentes (success, warning, error)

### Tipografia
- [ ] `typography.fontFamily.heading` é Montserrat
- [ ] `typography.fontFamily.body` é Inter
- [ ] Escala completa de fontSize (xs até 9xl)

### Componentes Consomem Tokens
- [ ] Nenhum componente tem `bg-[#XXXXXX]` (hardcoded)
- [ ] Nenhum componente tem `style={{color: '#...'}}`
- [ ] Nenhum componente tem padding/margin em px arbitrário
- [ ] Sombras vêm de `shadows.*`, não inline

### Validação Manual Rápida
Faça um `Cmd+Shift+F` no projeto procurando por `#0a0a0a` e `#f59e0b`. **Devem aparecer APENAS em `design-tokens.ts`**. Se aparecerem em outros arquivos, é violação.

- [ ] Busca por `#0a0a0a` retorna apenas `design-tokens.ts`
- [ ] Busca por `#f59e0b` retorna apenas `design-tokens.ts`
- [ ] Busca por `style={{` retorna pouco/nenhum resultado

---

## 💾 Backup

- [ ] Salvar projeto no AI Studio
- [ ] (Opcional) Download .zip como backup inicial

---

## 🎯 Fase Concluída

- [ ] **TODOS os itens acima marcados**
- [ ] App navegável nos 8 Atos sem erros
- [ ] Pronto para avançar para Fase 2

Próximo passo: [Fase 2 — Conteúdo](./02-fase-2-conteudo.md)
