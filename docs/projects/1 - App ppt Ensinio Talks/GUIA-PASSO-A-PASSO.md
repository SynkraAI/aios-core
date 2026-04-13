# 🎯 Guia Passo a Passo — App PPT Ensinio Talks

> **Este é o documento principal do projeto.** Siga-o do início ao fim e você terá o app pronto pra talk.

---

## 📋 Pré-requisitos

Antes de começar, confira:

- [ ] Roteiro finalizado em `~/Library/.../Mente do Fosc/+/Ensinio Talks - Fosc IA 2.md`
- [ ] Acesso ao Google AI Studio logado (https://aistudio.google.com)
- [ ] Node.js instalado (`node -v` retorna versão)
- [ ] Navegador com suporte a fullscreen (Chrome/Safari/Firefox)
- [ ] Projetor/TV de teste disponível (idealmente)

---

## 🗺️ Como Este Guia Funciona

O guia é dividido em **4 fases sequenciais**. Cada fase tem:

1. **Objetivo** — o que você vai conquistar
2. **Passos** — sequência exata de ações
3. **Bloco de Cópia** — prompt pronto com banner `========= COPIAR A PARTIR DAQUI =========`
4. **Checklist de Validação** — como saber se a fase deu certo

**⚠️ Regra de ouro:** não pule fases. Termine uma, valide, passe pra próxima. Contexto acumulado no AI Studio bagunça tudo se você tentar fazer várias coisas de uma vez.

---

# 🏗️ FASE 1 — Scaffold + Tokens (30 min)

## Objetivo
Gerar o esqueleto vazio do app com **sistema de design tokens centralizado**, navegação, componentes reutilizáveis e visual consistente. Zero conteúdo real — só infraestrutura.

## ⚠️ Por que tokens são críticos

**Sem tokens, o AI Studio vai inventar um design system diferente em cada slide.** Você termina com 8 atos visualmente desconexos, mesmo que cada um pareça bonito sozinho. Tokens forçam consistência: 1 cor amber, 1 escala de espaçamento, 1 família tipográfica, e ponto.

É exatamente o anti-padrão que o **Slide 3.5 da sua talk** condena (Fontes de Verdade). Bonito ter o app apresentando esse conceito enquanto ele PRÓPRIO o respeita.

## Passos

### Passo 1.1 — Abrir o AI Studio
Acesse https://aistudio.google.com, crie um **novo projeto** e escolha o modo **"Build"** (geração de web apps).

### Passo 1.2 — Colar o prompt da Fase 1
Copie o bloco abaixo inteiro (do banner ao banner) e cole no AI Studio.

> 📄 **Prompt também disponível em:** [`prompts/fase-1-scaffold.md`](./prompts/fase-1-scaffold.md)

```
════════════════════════════════════════════════════════════
          COPIAR A PARTIR DAQUI ⬇
════════════════════════════════════════════════════════════

Crie um web app de apresentação interativa ("slide deck web") em
React + Vite + TailwindCSS, sem backend, totalmente client-side.

REQUISITOS DE NAVEGAÇÃO:
- Setas ← → para navegar entre slides
- Tecla Esc abre menu lateral com índice de todos os slides
- Tecla F ativa fullscreen
- Tecla Home volta ao primeiro slide, End vai ao último
- Barra de progresso fina no topo mostrando posição atual
- URL hash sincroniza com slide atual (#slide-3-2) para voltar
  direto de qualquer lugar ao recarregar a página

REQUISITOS DE LAYOUT E VISUAL:
- Dark mode por padrão
- Paleta: background #0a0a0a, accent amber #f59e0b, texto branco
- Tipografia: Montserrat bold para títulos, Inter regular para corpo
- Cada "Ato" tem um slide-divisor grande (Ato 1, Ato 2...) com
  gradient amber sutil de fundo e número grande no centro
- Slides normais têm layout: título grande no topo, conteúdo
  central, área de mídia à direita ou abaixo
- Responsivo: funciona em notebook, projetor e TV

COMPONENTES REUTILIZÁVEIS (crie todos prontos pra usar na Fase 2):

1. <PromptBox code="..." language="..." />
   Bloco de código monospace com botão "Copiar" no canto. Highlight
   amber suave nos backticks.

2. <Carousel items={[{src, caption}]} />
   Slider horizontal de imagens com setas de navegação.

3. <VideoPlayer src="..." caption="..." />
   Player de vídeo embutido com controles nativos.

4. <ImageCard src="..." caption="..." align="left|center|right" />
   Imagem com legenda abaixo.

5. <DiagramPlaceholder number={X} title="..." />
   Caixa retangular grande com gradient amber, borda fina branca,
   mostrando "DIAGRAMA #X" em cima e o título no centro. Será
   substituída por imagem real na Fase 3.

6. <SpeechBubble>...</SpeechBubble>
   Bloco de citação estilo fala do palestrante: borda esquerda
   amber grossa, texto em itálico, ícone 💬 no início.

7. <ActDivider number={X} title="..." subtitle="..." />
   Slide de transição entre atos, ocupa tela inteira.

8. <HighlightBox color="amber|green|red">...</HighlightBox>
   Caixa destacada para avisos, dicas ou "aha moments".

9. <ComparisonTable rows={[...]} />
   Tabela comparativa de 2+ colunas com styling premium.

ESTRUTURA INICIAL (8 ATOS VAZIOS):

Crie a navegação com os 8 Atos abaixo. Cada Ato deve ter o
ActDivider + 1 slide placeholder vazio. NÃO preencha conteúdo real.

1. Ato 1 — Abertura & Hook
2. Ato 2 — Mão na Massa
3. Ato 3 — O que é Framework
4. Ato 4 — Hierarquia
5. Ato 5 — Processos
6. Ato 6 — Qualidade
7. Ato 7 — FORGE
8. Ato 8 — Encerramento

REGRAS IMPORTANTES:
- NÃO gere conteúdo real dos slides agora. Só o esqueleto funcional.
- Todos os componentes devem ser exportados de um arquivo components/
  para reuso posterior.
- Use TypeScript com interfaces tipadas nos props.
- O código deve passar em lint e typecheck sem warnings.
- Tudo client-side, zero dependência de API externa em runtime.

Quero poder navegar pelo app e ver os 8 Atos como placeholders
funcionais. Na próxima fase, eu preencherei o conteúdo de cada
Ato em prompts separados.

════════════════════════════════════════════════════════════
          FIM DO BLOCO DE CÓPIA ⬆
════════════════════════════════════════════════════════════
```

### Passo 1.3 — Validar o scaffold
Depois do AI Studio gerar, teste:

- [ ] Tecla `→` avança slide
- [ ] Tecla `←` volta slide
- [ ] Tecla `F` entra em fullscreen
- [ ] Tecla `Esc` abre menu lateral
- [ ] Consegue navegar pelos 8 Atos
- [ ] Cada Ato mostra o divider + slide placeholder
- [ ] Nenhum erro no console do browser
- [ ] Dark mode está ativo por padrão
- [ ] Cores batem (bg preto, accent amber)

### Passo 1.4 — Salvar checkpoint
Dentro do AI Studio, **nomeie o projeto** como `ensinio-talks-fosc` e salve. Se o AI Studio permitir exportar código nesse ponto, já faça um download .zip de backup.

✅ **Fase 1 concluída quando:** o app navega nos 8 Atos sem conteúdo, sem erros, com `design-tokens.ts` populado.

📝 [Checklist detalhada da Fase 1](./checklists/01-fase-1-scaffold.md)

---

# 🔍 FASE 1b — Auditoria de Tokens (5 min)

## Objetivo
Garantir que o scaffold da Fase 1 está 100% tokenizado antes de avançar pro conteúdo. Caçar e corrigir hardcodes que possam ter escapado.

## Por que esta sub-fase existe
Mesmo com instruções explícitas, IA generativa às vezes "escapa" e hardcoda valores em alguns componentes "porque é mais rápido". Se esses escapes passarem, na Fase 2 o AI Studio vai achar que é normal hardcodar — e vai reinventar cores e tamanhos em cada slide. **Esta fase mata isso na raiz.**

## Passos

### Passo 1b.1 — Rodar a auditoria
Abra [`prompts/fase-1b-audit-tokens.md`](./prompts/fase-1b-audit-tokens.md), copie o bloco entre os banners e cole no AI Studio (mesma sessão).

### Passo 1b.2 — Revisar o relatório
O AI Studio vai gerar um relatório em markdown com:
- Lista de violações encontradas (arquivo, linha, hardcode → token correto)
- Correções aplicadas
- Estatísticas

### Passo 1b.3 — Validar correções
Depois das correções:
- [ ] App continua funcionando visualmente igual
- [ ] Nenhum erro novo no console
- [ ] Navegação ainda funciona
- [ ] `design-tokens.ts` ainda é a única fonte de verdade

✅ **Fase 1b concluída quando:** zero violações de tokens no código + app intacto.

💡 Se a auditoria mostrar mais de 20 violações, é sinal de que o scaffold da Fase 1 ficou ruim. Avalie refazer a Fase 1 com instruções ainda mais rígidas antes de gastar tempo corrigindo escape por escape.

---

# 📝 FASE 2 — Conteúdo (1h, 8 prompts)

## Objetivo
Preencher o conteúdo de cada um dos 8 Atos, um por vez, sem deixar o AI Studio se perder no contexto.

## Estratégia
**Um prompt por Ato.** Nunca dois Atos no mesmo prompt. Depois de cada prompt:
1. Valide que o Ato preenchido funciona
2. Navegue pelo app pra garantir que nada quebrou
3. Se quebrou, reverte o último prompt e tenta de novo
4. Se deu certo, segue pro próximo

## Sequência Recomendada (NÃO siga a ordem 1→8)

A ordem abaixo começa pelo mais simples, passa pelos âncoras visuais, e termina nos mais longos. Isso diminui risco de contexto acumulado bagunçar os atos complexos.

1. **Ato 1** (Abertura) — simples, pega o ritmo
2. **Ato 5** (Processos) — tem o diagrama-âncora #9, valida o DiagramPlaceholder
3. **Ato 4** (Hierarquia) — tem Advisor Board, outro wow moment
4. **Ato 7** (FORGE) — o mais complexo, precisa atenção
5. **Ato 3** (Framework) — tem várias sub-seções
6. **Ato 2** (Mão na Massa) — tem demo prompt copiável
7. **Ato 6** (Qualidade) — tem tabela Claude vs Codex
8. **Ato 8** (Encerramento) — curto, fecha bem

## Passos para Cada Ato

### Passo 2.X — Abrir o prompt do ato
Para cada ato, abra o arquivo correspondente em [`prompts/`](./prompts/):

- [`fase-2-ato-1-abertura.md`](./prompts/fase-2-ato-1-abertura.md)
- [`fase-2-ato-2-mao-na-massa.md`](./prompts/fase-2-ato-2-mao-na-massa.md)
- [`fase-2-ato-3-framework.md`](./prompts/fase-2-ato-3-framework.md)
- [`fase-2-ato-4-hierarquia.md`](./prompts/fase-2-ato-4-hierarquia.md)
- [`fase-2-ato-5-processos.md`](./prompts/fase-2-ato-5-processos.md)
- [`fase-2-ato-6-qualidade.md`](./prompts/fase-2-ato-6-qualidade.md)
- [`fase-2-ato-7-forge.md`](./prompts/fase-2-ato-7-forge.md)
- [`fase-2-ato-8-encerramento.md`](./prompts/fase-2-ato-8-encerramento.md)

Cada arquivo tem o prompt com o banner de cópia + instruções.

### Passo 2.Y — Cole o conteúdo do roteiro
Dentro do prompt há um bloco marcado:

```
===== COLE AQUI O CONTEÚDO DO ATO X =====
[placeholder]
===== FIM DO CONTEÚDO =====
```

Abra o roteiro (`Ensinio Talks - Fosc IA 2.md`), localize a seção `## 🎬 ATO X — [nome]`, copie tudo até antes do próximo ATO e cole no placeholder.

### Passo 2.Z — Colar no AI Studio e validar
1. Copie o prompt completo (do banner ao banner)
2. Cole no AI Studio **na mesma sessão** da Fase 1
3. Aguarde geração
4. Navegue até o Ato preenchido e valide
5. Marque o checkbox correspondente

## 🚨 Se o AI Studio começar a resumir ou simplificar

Sinais de contexto saturado:
- Respostas mais curtas e genéricas
- Ignora instruções específicas
- Esquece componentes que já existem

**Solução:**
1. Copie todo o código gerado até agora (export ou copy)
2. Abra uma **nova sessão** no AI Studio
3. Cole o código atual com o prompt: *"Este é o estado atual do app. Continue a partir daqui."*
4. Continue de onde parou

📝 [Checklist detalhada da Fase 2](./checklists/02-fase-2-conteudo.md)

✅ **Fase 2 concluída quando:** os 8 Atos estão preenchidos e navegáveis sem erros.

---

# 🎨 FASE 3 — Diagramas (1-2h)

## Objetivo
Os 12 DiagramPlaceholders precisam virar imagens reais (ou ficar como placeholders estilizados, decisão sua).

## Opção A — Ficar com Placeholders (rápido, 0 min)
Os placeholders amber já funcionam visualmente. Se você quer ir pro palco em modo "MVP", pule pra Fase 4.

**Vantagens:** zero risco, visual consistente, já está pronto.
**Desvantagens:** menos impactante que uma arte real.

## Opção B — Gerar os 12 Diagramas (1-2h)

### Passo 3.1 — Escolher o gerador de imagem
Opções ranqueadas:
1. **Nano Banana** (melhor pra texto em imagens, recomendado pt-BR)
2. **Midjourney** (melhor estética, precisa ajustar texto)
3. **DALL-E 3** (bom balanceamento)
4. **AI Studio (Imagen)** (já está logado, mais prático)

### Passo 3.2 — Gerar na ordem de prioridade
A ordem está em [`diagramas/README.md`](./diagramas/README.md). Resumo:

1. **Diagrama #9** (Fluxo Ideia → Produto) ← **COMECE POR ESTE**
2. **Diagrama #8** (Advisor Board)
3. **Diagrama #6** (Pirâmide Squads/Agentes/Skills/Tools)
4. Diagramas #11 e #12 (FORGE: timeline + receita)
5. Diagramas #1-#5 (comparativos, batch)
6. Diagramas #7 e #10 (secundários)

### Passo 3.3 — Salvar as imagens
Todas as imagens geradas vão pra `imagens/` com naming convencionado:

```
imagens/
├── 01-executor-orquestrador.png
├── 02-vibe-coding-vs-sdd.png
├── 03-janela-contexto.png
├── 04-entp-vs-istj.png
├── 05-fonte-de-verdade.png
├── 06-piramide-hierarquia.png
├── 07-anatomia-mind.png
├── 08-advisor-board.png
├── 09-fluxo-ideia-produto.png        ⭐ o principal
├── 10-loop-ping-pong.png
├── 11-timeline-forge.png
└── 12-receita-forge-8-3-10.png
```

### Passo 3.4 — Plugar as imagens no app
Prompt pro AI Studio:

```
════════════════════════════════════════════════════════════
          COPIAR A PARTIR DAQUI ⬇
════════════════════════════════════════════════════════════

Substitua os componentes <DiagramPlaceholder number={X} /> pelos
<ImageCard src="/diagramas/XX-nome.png" /> correspondentes, usando
este mapeamento:

- number={1}  → /diagramas/01-executor-orquestrador.png
- number={2}  → /diagramas/02-vibe-coding-vs-sdd.png
- number={3}  → /diagramas/03-janela-contexto.png
- number={4}  → /diagramas/04-entp-vs-istj.png
- number={5}  → /diagramas/05-fonte-de-verdade.png
- number={6}  → /diagramas/06-piramide-hierarquia.png
- number={7}  → /diagramas/07-anatomia-mind.png
- number={8}  → /diagramas/08-advisor-board.png
- number={9}  → /diagramas/09-fluxo-ideia-produto.png
- number={10} → /diagramas/10-loop-ping-pong.png
- number={11} → /diagramas/11-timeline-forge.png
- number={12} → /diagramas/12-receita-forge-8-3-10.png

Coloque as imagens na pasta public/diagramas/ do projeto.
Mantenha as legendas atuais de cada slide.

════════════════════════════════════════════════════════════
          FIM DO BLOCO DE CÓPIA ⬆
════════════════════════════════════════════════════════════
```

📝 [Checklist detalhada da Fase 3](./checklists/03-fase-3-diagramas.md)

✅ **Fase 3 concluída quando:** as 12 imagens estão exibindo corretamente no app.

---

# 🚀 FASE 4 — Deploy & Teste (30 min)

## Objetivo
Exportar o código, rodar local, testar em projetor e ter um backup de segurança.

## Passos

### Passo 4.1 — Exportar do AI Studio
Download do código como .zip. Descompacte em:

```
~/CODE/Projects/ensinio-talks-fosc-app/
```

### Passo 4.2 — Rodar local com port-manager
**SEMPRE use o port-manager do AIOS.** Nunca rode `npm run dev` direto.

```bash
cd ~/CODE/Projects/ensinio-talks-fosc-app
npm install
eval $(node ~/aios-core/tools/port-manager.js auto ensinio-talks) && PORT=$PORT npm run dev
```

O terminal vai mostrar a porta alocada. Abra no browser.

### Passo 4.3 — Testar offline
Este é o teste crítico:

1. Build de produção: `npm run build`
2. Preview: `eval $(node ~/aios-core/tools/port-manager.js auto ensinio-talks) && PORT=$PORT npm run preview`
3. **Desligue o Wi-Fi**
4. Recarregue a página no browser
5. Navegue por todos os slides

Se alguma coisa quebrar offline, tem algum asset sendo buscado de CDN. Conserte antes de levar pro palco.

### Passo 4.4 — Teste no notebook final
Rode no **mesmo notebook que vai levar pro auditório**, com o **mesmo browser**, na **mesma resolução**. Se possível, plugue no projetor/TV real e veja como fica.

### Passo 4.5 — Gerar PDF backup
Fallback pra caso o app trave no palco:

1. Abra o app no Chrome
2. Cmd+P → "Salvar como PDF" → Paisagem → Margens mínimas
3. Salve em `~/CODE/Projects/ensinio-talks-fosc-app/backup-slides.pdf`
4. Imprima também em papel se quiser paranoia máxima

### Passo 4.6 — Ensaio final
- [ ] Rodar a talk inteira cronometrada 1x
- [ ] Identificar pontos onde tropeçou
- [ ] Marcar slides que precisam de mais tempo de fala
- [ ] Testar transições de teclado em velocidade real

📝 [Checklist detalhada da Fase 4](./checklists/04-fase-4-deploy.md)

✅ **Fase 4 concluída quando:** app roda offline no notebook final + PDF backup salvo + ensaio feito.

---

## 🛟 Quando Algo Der Errado

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| AI Studio "esquece" componentes | Contexto saturado | Nova sessão + código atual colado |
| Slide quebra o layout | Prompt confuso | Reverte último prompt, refaz mais específico |
| Imagem não carrega | Path errado | Confira `/public/diagramas/` e nome exato |
| Atalhos de teclado não funcionam | useEffect não está montado | Reinicia dev server |
| Cores diferentes no projetor | Gamma/profile do projetor | Aumenta contraste no build, ou desliga eco-mode do projetor |

---

## 🎯 Resumo Ultra-Rápido

```
1.  Scaffold + tokens       → prompts/fase-1-scaffold.md           (30 min)
1b. Auditoria de tokens     → prompts/fase-1b-audit-tokens.md      (5 min)  ⚠️ CRÍTICO
2.  Conteúdo por Ato (x8)   → prompts/fase-2-ato-*.md             (~1h)
3.  Diagramas (opcional)    → diagramas/README.md + Fase 3        (~1-2h)
4.  Export + teste + backup → Fase 4                               (~30 min)
                                                                   ═════════
                                                                   ~3h total
```

**A Fase 1b (Auditoria de Tokens) é o segredo pra manter consistência visual em todos os 8 atos.** Não pule.

---

💡 Dica final: Se no meio do caminho você quiser PARAR, pode. O app com scaffold + 3-4 Atos preenchidos + diagramas placeholder já é muito melhor do que slides do Google Slides comum. Cada fase adiciona valor incremental — não precisa de tudo pronto pra ficar bom.

**Próximo passo:** abrir [`prompts/fase-1-scaffold.md`](./prompts/fase-1-scaffold.md) e executar Fase 1.
