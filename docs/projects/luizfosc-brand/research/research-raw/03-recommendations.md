# Recomendações — AI Brand Identity Stack

---

## Cenário: Creator/Marca Pessoal (seu caso)

Você já tem a marca. Precisa de identidade visual consistente para Instagram e YouTube. Recomendo um stack em 3 camadas:

---

### Camada 1 — Fundação (Brand Kit)

**Opção A: Looka ($65 one-time)**
- Gera logo + paleta + tipografia + social media kit + guidelines
- Bom se precisa criar/refinar o brand kit do zero
- One-time payment, sem assinatura

**Opção B: Brandmark ($65 brand package)**
- Melhor qualidade de design (A-)
- Sistema de cores mais inteligente
- Melhor se qualidade > custo

**Opção C: Já tem brand kit definido? → Pula direto pra Camada 2**

---

### Camada 2 — Produção Diária (Templates + Conteúdo)

**Canva Pro ($13/mês) — OBRIGATÓRIO**
- Magic Studio para gerar posts, stories, thumbnails diários
- Brand Kit integrado (aplica suas cores/fontes em tudo)
- 250K+ templates como ponto de partida
- É o "centro nervoso" da produção visual

**+ Recraft v3 (pay-per-credit) — Para assets vetoriais**
- Quando precisar de ícones, logos variantes, assets SVG
- Único AI que gera vetores nativos

**+ Ideogram v3 (pay-per-credit) — Para imagens com texto**
- Thumbnails YouTube com texto legível
- Posts com quotes/frases sobrepostas
- Best-in-class em renderizar texto dentro de imagem

---

### Camada 3 — Automação (Scale)

**n8n (self-hosted, grátis) — Quando volume crescer**
- Pipeline: brief → AI gera → brand overlay → multi-formato → publica
- Custo: < $5 por asset completo
- Resultado: 5-10x mais conteúdo, mesma equipe

---

## Matriz de Decisão Rápida

| Pergunta | Se SIM → | Se NÃO → |
|----------|----------|----------|
| Já tem logo e brand kit? | Pula Camada 1 | Começa por Looka/Brandmark |
| Produz conteúdo diariamente? | Canva Pro é essencial | Free tier pode bastar |
| Precisa de thumbnails com texto? | Adiciona Ideogram | Canva resolve |
| Precisa de ícones/vetores custom? | Adiciona Recraft | Canva resolve |
| Volume > 20 posts/semana? | Monta pipeline n8n | Manual ainda funciona |
| Equipe > 1 pessoa? | Considera Frontify | Canva Brand Kit basta |
| Faz muito vídeo? | Adiciona VEED | Canva + editor de vídeo |

---

## O Que NÃO Fazer

1. **Não assine tudo de uma vez.** Comece com Canva Pro + Brand Kit do Looka. Adicione ferramentas conforme a dor aparecer.
2. **Não use Figma AI para social media.** Figma é para product design/UI, não para marketing visual.
3. **Não ignore consistência.** O Brand Kit do Canva é gratuito no Pro — configure logo, cores e fontes ANTES de criar qualquer post.
4. **Não gere logos com Midjourney/DALL-E.** Eles fazem raster, não vetor. Logo precisa ser SVG. Use Looka, Brandmark ou Recraft.
5. **Não monte pipeline de automação antes de ter o processo manual funcionando.** Automatizar caos produz caos em escala.

---

## Stack Mínimo Recomendado (Custo Mensal)

| Ferramenta | Custo | Para quê |
|------------|-------|----------|
| Canva Pro | $13/mês | Templates + Brand Kit + produção diária |
| Looka (one-time) | $65 | Brand kit fundacional |
| **Total inicial** | **~$13/mês + $65** | **Cobre 90% das necessidades** |

### Upgrades conforme crescer

| Ferramenta | Custo | Quando adicionar |
|------------|-------|-----------------|
| Ideogram v3 | Pay-per-use | Quando thumbnails precisarem de texto AI |
| Recraft v3 | Pay-per-use | Quando precisar de vetores custom |
| VEED | Freemium | Quando vídeo virar prioridade |
| n8n | Grátis (self-hosted) | Quando volume > 20 posts/semana |

---

## Próximos Passos

1. **Definir:** Sua marca já tem brand kit (cores hex, fontes, logo SVG)?
   - Se não → Começar por Looka ou Brandmark
   - Se sim → Pular para passo 2

2. **Configurar Canva Pro** com Brand Kit completo (logo, cores, fontes)

3. **Criar templates base** para cada formato:
   - Instagram post (1080x1080)
   - Instagram story (1080x1920)
   - Instagram carrossel (1080x1080 x slides)
   - YouTube thumbnail (1280x720)
   - YouTube banner (2560x1440)

4. **Testar Ideogram/Recraft** para assets específicos que Canva não resolve

5. **Quando volume crescer:** montar pipeline n8n para automação

---

> **Implementação:** Para executar qualquer um desses passos, use `@pm` para priorizar ou `@dev` para implementar pipelines de automação.
