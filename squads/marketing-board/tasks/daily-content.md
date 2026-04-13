# Task: Daily Content — OPES Marketing Arm

**Task ID**: daily-content
**Agent**: @marketing-ideation → @marketing-cmo → @marketing-production → @marketing-designer → @marketing-distribution → @auto-publish
**Version**: 3.0.0

---

## Purpose

Gerar E PUBLICAR conteúdo diário para Instagram + LinkedIn do José. Pipeline end-to-end: ideação → produção → distribuição → publicação automática via API.

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tema` | string | No | Tema específico (se não fornecido, segue calendário semanal) |
| `angulo` | string | No | Ângulo preferido (confessional/tutorial/provocação) |
| `contexto` | string | No | Algo que aconteceu hoje que pode virar conteúdo |
| `auto` | boolean | No | Se true, pula escolha de ângulo e auto-seleciona |

---

## Workflow

### Step 1: Carregar Contexto

```
1. Ler data/content-map.yaml (mapa de conteúdo)
2. Ler data/platform-specs.yaml (specs das plataformas)
3. Verificar dia da semana → tema do calendário
4. Verificar queue → próxima ideia programada
```

### Step 2: Ideação (@marketing-ideation)

```
1. Consultar Content Map para tema do dia
2. Gerar Big Idea + 3 ângulos
3. Se `auto: true` → selecionar ângulo mais forte
4. Se `auto: false` → apresentar 3 ângulos para José escolher
```

**Output:** Big Idea + ângulo selecionado + prova disponível

### Step 2.5: QA Gate — CMO Validation (@marketing-cmo) ⛔

```
GATE OBRIGATÓRIO — Nenhum conteúdo avança sem passar.

1. @cmo recebe Big Idea + ângulo selecionado
2. Aplica 3 filtros:
   a. SVA: "Para quem ESPECIFICAMENTE é isso?"
      → Se vago → DEVOLVER para @ideation com direção
   b. Purple Cow: "Alguém compartilharia sem ser pedido?"
      → Se score < 4/5 → DEVOLVER com motivo
   c. Permission: "Constrói confiança ou interrompe?"
      → Se interrompe → VETAR
3. Resultado:
   ✅ APROVADO → Avança para Produção com nota do CMO
   🔄 REESCREVER → Volta para @ideation (máx 2 loops)
   ❌ VETADO → Para. Registra motivo. Puxa próxima da queue.
```

**Output:** Big Idea aprovada + nota CMO + Purple Cow score

> ⚠️ Se a ideia for vetada 2x seguidas, @cmo deve fornecer
> direção explícita para @ideation antes do terceiro loop.

### Step 3: Produção (@marketing-production)

```
1. Receber Big Idea + ângulo
2. Escrever post na voz do José
3. Executar checklist de qualidade:
   - Hook ≤10 palavras
   - Começa com cena real
   - Zero blacklist LLM
   - Prova real incluída
   - Conexão nexialista
   - Voz autêntica José
4. Se falhar em qualquer item → reescrever
```

**Output:** Post completo validado

### Step 3.5: Direção Visual (@marketing-designer)

```
1. Receber Big Idea + post completo + ângulo
2. Executar Decision Tree → definir formato visual:
   - Sequência (passo-a-passo, lista)? → CARROSSEL (5-10 slides)
   - Contraste forte (antes/depois)? → IMAGEM ÚNICA (split)
   - Confessional/pessoal? → TEXTO PURO
   - Dúvida? → TEXTO PURO (seguro > medíocre)
3. Se CARROSSEL:
   a. Distribuir conteúdo por slide (1 ideia por slide)
   b. Escrever texto de cada slide (max 15 palavras)
   c. Gerar prompt Gemini para background
4. Se IMAGEM ÚNICA:
   a. Definir composição (split, centered, overlay)
   b. Gerar prompt Gemini seguindo brand guide
5. Se TEXTO PURO:
   a. Registrar decisão + motivo
6. Gerar Visual Brief (IG + LinkedIn) seguindo brand-guide.yaml
7. Verificar: Brand guide respeitada? Legível em mobile? WCAG AA?
```

**Output:** Visual Brief completo (formato + specs + prompts por plataforma)

> ⚠️ Regra cardinal: Remarkable ou sem imagem. Visual medíocre é pior que texto puro.

### Step 4: Distribuição (@marketing-distribution)

```
1. Receber post validado + Visual Brief de @designer
2. Adaptar texto para Instagram (≤2200 chars, casual, 10-15 hashtags)
3. Adaptar texto para LinkedIn (≤3000 chars, profissional, 3-5 hashtags)
4. Incorporar Visual Brief nas versões finais
5. Verificar que são DIFERENTES (não copy-paste)
6. Incluir CTA adequado em cada
```

**Output:** 2 versões prontas para postar

### Step 5: Salvar Output

```
1. Formatar output usando template daily-content-output.md
2. Salvar em outputs/hubs/marketing/YYYY-MM-DD.md
```

### Step 5.5: Geração de Imagem (@marketing-designer + Nano Banana Pro)

```
1. Se formato = CARROSSEL ou IMAGEM ÚNICA:
   a. Extrair prompt Gemini do Visual Brief
   b. Gerar imagem via Nano Banana Pro (gemini-3-pro-image-preview)
   c. Salvar em outputs/hubs/marketing/YYYY-MM-DD-cover.png
2. Se formato = TEXTO PURO:
   a. Pular geração de imagem
```

**Output:** Imagem gerada localmente (se aplicável)

> ⚠️ Nano Banana Pro = gemini-3-pro-image-preview (aspect ratio 9:16 para IG, 16:9 para LI)

### Step 6: Publicação Automática (publish.py)

```
AUTOMÁTICO — Sem intervenção manual.

1. Executar: python3 scripts/publish.py [YYYY-MM-DD]
2. O script:
   a. Posta no LinkedIn via /v2/ugcPosts (texto)
   b. Upload da imagem para hosting temporário
   c. Posta no Instagram via Content Publishing API (imagem + caption)
   d. Envia confirmação via WhatsApp (UazAPI)
3. Registra no output do dia:
   - LinkedIn share ID
   - Instagram media ID
   - Horários de publicação

APIs utilizadas:
  - Meta Graph API (instagram_content_publish) — token expira ~60 dias
  - LinkedIn /v2/ugcPosts (w_member_social) — token expira ~60 dias
  - UazAPI (WhatsApp) — notificação de confirmação

Credenciais: ~/.config/aios/credentials.yaml
Script: .aiox-core/expansion-packs/marketing-opes/scripts/publish.py
```

**Output:** Posts publicados + IDs registrados em `outputs/hubs/marketing/YYYY-MM-DD.md`

### Step 7: QA Gate — Pós-Publicação ⛔

```
GATE OBRIGATÓRIO — Fecha o loop de dados.

Após publicação automática:

1. Verificar se posts estão visíveis:
   - IG: https://instagram.com/josecarlosamorim.ai
   - LI: https://linkedin.com/in/josecarlosamorim
2. Registrar no output do dia:
   - [x] IG postado — ID: ___
   - [x] LinkedIn postado — ID: ___
3. Se ERRO em alguma plataforma → registrar e tentar novamente
4. Se José quiser alterar → registrar alteração para @metrics

Fonte de dados: retorno da API (automático) + input manual (se alteração).
```

**Output:** Status de publicação confirmado em `outputs/hubs/marketing/YYYY-MM-DD.md`

> ⚠️ Sem este registro, @metrics opera cego.
> O relatório semanal EXIGE esses dados para calcular os 3 KPIs.

---

## Output

| Output | Path | Description |
|--------|------|-------------|
| Daily Content | `outputs/hubs/marketing/YYYY-MM-DD.md` | Post do dia (IG + LinkedIn) |

---

## Elicitation

```yaml
elicit: conditional
points:
  - step: 2
    condition: "auto != true"
    question: "Qual ângulo você prefere?"
    type: choice
    options:
      - "1. [Ângulo Confessional]"
      - "2. [Ângulo Tutorial]"
      - "3. [Ângulo Provocação]"
  - step: 1
    condition: "contexto provided"
    question: null
    note: "Se José forneceu contexto do dia, priorizar sobre queue"
```

---

## Exemplo de Uso

### Modo Automático (sem interação)
```
/daily-content auto=true
```
→ Gera conteúdo do dia automaticamente, sem perguntas.

### Modo Interativo
```
/daily-content
```
→ Apresenta 3 ângulos, José escolhe, gera conteúdo.

### Com Contexto do Dia
```
/daily-content contexto="Hoje meu advisory board de IA me disse que estou sendo coadjuvante na minha própria história"
```
→ Usa o contexto como matéria-prima da ideação.

---

## Success Criteria

- [ ] CMO aprovou Big Idea antes da produção (Gate 2.5)
- [ ] Purple Cow score ≥ 4/5
- [ ] Post do dia gerado para Instagram E LinkedIn
- [ ] Posts são DIFERENTES entre plataformas
- [ ] Voz autêntica do José (passa no checklist)
- [ ] Zero expressões da blacklist LLM
- [ ] Dentro dos limites de caracteres
- [ ] Visual Brief gerado por @designer (ou "texto puro" justificado)
- [ ] Visual coerente com Big Idea e brand guide
- [ ] CTA adequado em cada plataforma
- [ ] Salvo em outputs/hubs/marketing/
- [ ] Imagem gerada via Nano Banana Pro (ou texto puro justificado)
- [ ] Publicado no LinkedIn via API (share ID registrado)
- [ ] Publicado no Instagram via API (media ID registrado)
- [ ] Confirmação enviada via WhatsApp
- [ ] Status de publicação confirmado (Gate 7)

---

## Infraestrutura de Publicação

| Plataforma | API | Endpoint | Token Expira |
|------------|-----|----------|--------------|
| LinkedIn | /v2/ugcPosts | api.linkedin.com | ~60 dias (renovar manual) |
| Instagram | Content Publishing | graph.facebook.com/v21.0 | Page token = permanente |
| WhatsApp | UazAPI | jcarlosamorimppt.uazapi.com | N/A |
| Imagens | Nano Banana Pro | generativelanguage.googleapis.com | API key (permanente) |
| Hosting | catbox.moe | catbox.moe/user/api.php | N/A (free, no auth) |

**Script:** `.aiox-core/expansion-packs/marketing-opes/scripts/publish.py`
**Credenciais:** `~/.config/aios/credentials.yaml`

---

*Task v3.0.0 — OPES Marketing Arm Daily Pipeline (End-to-End)*
*Ideação → CMO → Produção → Designer → Distribuição → Publicação Automática*

---

## Veto Conditions

| ID | Condição | Ação |
|----|----------|------|
| VC-daily-01 | Conteúdo avançou para Produção sem passar pelo Gate 2.5 do CMO | HALT — Retornar ao Step 2.5; nenhum post vai à produção sem aprovação explícita do CMO |
| VC-daily-02 | Big Idea foi vetada pelo CMO 2 vezes e uma terceira tentativa começa sem direção explícita fornecida | HALT — CMO deve entregar briefing direcional antes de qualquer novo loop |
| VC-daily-03 | Purple Cow score abaixo de 4/5 no momento da aprovação do CMO | HALT — Devolver para @ideation com feedback específico do que está faltando |
| VC-daily-04 | Publicação automática disparada sem Step 7 (QA Gate pós-publicação) registrado no output do dia | HALT — Registrar status de publicação antes de encerrar o pipeline; @metrics opera cego sem esse dado |
| VC-daily-05 | Versões de Instagram e LinkedIn são idênticas (copy-paste entre plataformas) | HALT — Retornar ao Step 4 (@distribution) para diferenciação obrigatória de tom, formato e hashtags |
