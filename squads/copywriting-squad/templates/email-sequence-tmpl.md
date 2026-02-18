# Template: Email Sequence

```yaml
template_id: email-sequence-tmpl
template_name: "Sequencia de Email"
version: 1.0.0
output_format: markdown
use_with_clones:
  primary: "@andre-chaperon (SOS), @ben-settle (infotainment)"
  support: "@gary-bencivenga (subject lines), @dan-kennedy (estrategia)"
  audit: "@claude-hopkins"
```

## Quando Usar

- Soap Opera Sequence de venda
- Welcome sequence para novos leads
- Sequencia de carrinho abandonado
- Emails diarios/semanais ongoing
- Qualquer sequencia automatizada

---

## FORMATO BASE DE EMAIL

```
SUBJECT: [Subject line — max 50 caracteres ideal]
PREVIEW: [Preview text — complementa o subject, max 90 caracteres]

---

[Saudacao curta ou nenhuma]

[CORPO DO EMAIL]

[Linha de separacao ou espaco]

[CTA unico e claro]

[Assinatura]

P.S. — [Reforco ou urgencia]
```

---

## SEQUENCIA 1: SOAP OPERA SEQUENCE (Venda)

**Clone principal:** @andre-chaperon

### Email 1 — "O que esta acontecendo" (Day 0)
```
SUBJECT: [Curiosidade sobre a historia]
PREVIEW: [Teaser que gera antecipacao]

Ola [nome],

[Comecar no meio da historia — in medias res]
[Contexto minimo — ir direto ao drama]
[Apresentar o problema/conflito central]

[OPEN LOOP: "Amanha te conto o que aconteceu quando..."]

[CTA suave: ler proximo email]
```

### Email 2 — "Alta dramatica" (Day 1)
```
SUBJECT: [Continuacao da historia]
PREVIEW: [Referencia ao open loop anterior]

[Fechar open loop do email 1]
[Amplificar o drama/problema]
[Mostrar tentativas fracassadas]
[Momento mais baixo da historia]

[OPEN LOOP: "Foi entao que descobri algo que mudou tudo..."]
```

### Email 3 — "Momento de revelacao" (Day 2)
```
SUBJECT: [A descoberta]
PREVIEW: [Hint da solucao]

[Fechar open loop do email 2]
[A epifania / momento de virada]
[Descoberta da solucao]
[Primeiros resultados]

[BRIDGE para o produto: "E foi isso que me levou a criar..."]
[CTA: link para pagina de vendas]
```

### Email 4 — "Beneficios escondidos" (Day 3)
```
SUBJECT: [Beneficio inesperado]
PREVIEW: [Resultado surpreendente]

[Resultado secundario/inesperado da solucao]
[Depoimento de alguem que tambem conseguiu]
[Aprofundar a transformacao]

[CTA: link para pagina de vendas]
```

### Email 5 — "Urgencia + CTA final" (Day 4)
```
SUBJECT: [Urgencia real]
PREVIEW: [Deadline ou escassez]

[Resumo da jornada (emails 1-4)]
[Reforcar a transformacao possivel]
[Urgencia: preco sobe / vagas acabam / bonus expira]
[Garantia para eliminar medo]

[CTA FORTE: link + razao para clicar AGORA]

P.S. — [Reiterar deadline]
P.P.S. — [Reiterar garantia]
```

---

## SEQUENCIA 2: WELCOME SEQUENCE (Nurturing)

**Clone principal:** @andre-chaperon + @ben-settle

### Email 1 — Boas-Vindas (Imediato)
```
SUBJECT: Bem-vindo! Seu [lead magnet] esta aqui
PREVIEW: + o que esperar nos proximos dias

[Entregar lead magnet — link direto]
[Quem sou eu (2-3 frases MAX)]
[O que esperar: frequencia, tipo de conteudo]
[1 quick win para gerar resultado imediato]
```

### Email 2 — Historia de Origem (Day 1)
```
SUBJECT: [Por que faco o que faco]
PREVIEW: [Historia pessoal breve]

[Historia condensada — de onde vim, o que descobri]
[Conectar historia ao problema do lead]
[Valor: 1 insight pratico]
```

### Email 3 — Quick Win (Day 2)
```
SUBJECT: [Resultado rapido em X minutos]
PREVIEW: [Promessa de resultado imediato]

[Ensinar algo que gera resultado HOJE]
[Passo a passo curto e acionavel]
[Pedir feedback: "Me conta se funcionou"]
```

### Email 4 — Case Study (Day 4)
```
SUBJECT: [Como [nome] conseguiu [resultado]]
PREVIEW: [Resultado especifico com numero]

[Historia de um cliente/aluno]
[Antes → O que fez → Depois]
[Conectar ao metodo/produto]
[CTA suave: "Se quiser saber mais..."]
```

### Email 5 — Oferta (Day 7)
```
SUBJECT: [Convite especial para voce]
PREVIEW: [Oferta exclusiva para novos]

[Resumo do valor entregue nos emails anteriores]
[Apresentar oferta natural (nao agressiva)]
[Bonus exclusivo para quem veio da welcome sequence]
[CTA + garantia]
```

---

## SEQUENCIA 3: CARRINHO ABANDONADO

**Ferramenta:** Sugarman Triggers

### Email 1 — Lembrete (1h depois)
```
SUBJECT: Esqueceu algo?
PREVIEW: Seu [produto] esta esperando

[Tom amigavel, nao pressao]
[Lembrar o que estava comprando]
[Link direto para checkout]
[Oferecer ajuda: "Alguma duvida?"]
```

### Email 2 — Objecao (24h depois)
```
SUBJECT: [Responder principal objecao]
PREVIEW: [Garantia ou prova]

[Antecipar por que nao comprou]
[Responder objecao #1 com prova]
[Reiterar garantia]
[Link para checkout]

[TRIGGER 13: consistencia / TRIGGER 27: reciprocidade]
```

### Email 3 — Escassez (48h depois)
```
SUBJECT: [Urgencia real]
PREVIEW: [O que vai perder]

[Escassez real: preco, vagas, bonus]
[Quick recap do valor]
[Depoimento rapido]
[Link + deadline]

[TRIGGER 20: exclusividade / TRIGGER 31: urgencia]
```

### Email 4 — Ultima Chance (72h depois)
```
SUBJECT: Ultima chance (sem brincadeira)
PREVIEW: Depois disso, [consequencia]

[Tom honesto: "Sei que pode nao ser o momento"]
[Mas se for: ultimo lembrete]
[Bonus surpresa de ultima hora (opcional)]
[Link final]
```

---

## TEMPLATE: EMAIL DIARIO (Ben Settle Style)

```
SUBJECT: [Provocativo, curto, curioso — max 40 chars]
PREVIEW: [Complemento que gera clique]

[Historia ou observacao do dia — 150-300 palavras]
[Conectar a historia ao produto/servico — 2-3 frases]
[CTA natural no final — 1 link]

[Assinatura]

P.S. — [Bonus, urgencia, ou piada]
```

---

## CHECKLIST PRE-ENTREGA

- [ ] Cada email tem subject line + preview text
- [ ] Open loops conectam emails sequenciais
- [ ] CTA claro e unico por email
- [ ] Progressao logica (cada email prepara o proximo)
- [ ] Tom consistente em toda a sequencia
- [ ] Nao vende nos primeiros 2 emails (exceto carrinho)
- [ ] Emails formatados para leitura mobile (paragrafos curtos)
- [ ] P.S. em emails de venda

---

## VALIDATION RULES

```yaml
validation_rules:
  min_sections: 5

  required_elements:
    - subject_line_todos_emails
    - preview_text_todos_emails
    - open_loops_conectando_emails
    - cta_unico_por_email
    - progressao_logica_sequencia
    - ps_emails_venda

  quality_checks:
    - name: subject_preview_presentes
      rule: "Cada email deve ter SUBJECT + PREVIEW TEXT definidos"
      severity: CRITICAL

    - name: subject_line_max_50_chars
      rule: "Subject lines devem ter idealmente max 50 caracteres (mobile)"
      severity: HIGH

    - name: preview_text_max_90_chars
      rule: "Preview text deve complementar subject e ter max 90 caracteres"
      severity: HIGH

    - name: open_loops_conectam_sequencia
      rule: "Open loops devem conectar emails sequenciais (fechar loop anterior + abrir novo)"
      severity: CRITICAL

    - name: cta_unico_claro
      rule: "Cada email deve ter 1 CTA unico e claro (nao multiplos links competindo)"
      severity: HIGH

    - name: progressao_logica
      rule: "Sequencia deve ter progressao logica clara (cada email prepara o proximo)"
      severity: HIGH

    - name: nao_vende_primeiros_2
      rule: "Primeiros 2 emails nao devem vender (exceto carrinho abandonado) — nurturing primeiro"
      severity: MEDIUM

    - name: tom_consistente
      rule: "Tom de voz consistente em toda a sequencia (nao mudar persona)"
      severity: MEDIUM

    - name: formatacao_mobile
      rule: "Emails formatados para leitura mobile (paragrafos curtos, max 3-4 linhas)"
      severity: MEDIUM

    - name: ps_emails_venda
      rule: "Emails de venda (email 3+ em SOS, email 5 em Welcome) devem ter P.S. estrategico"
      severity: MEDIUM

    - name: sequencia_minimo_3_emails
      rule: "Sequencia deve ter minimo 3 emails (ideal 5 para SOS, 5 para Welcome)"
      severity: HIGH

  word_count:
    min: 1500
    max: 4000
    ideal: "300-600 palavras por email (total 1500-3000 para sequencia de 5 emails)"

  veto_conditions:
    - condition: "Qualquer email sem SUBJECT line ou PREVIEW text"
      reason: "Subject + Preview sao essenciais para open rate — email sem eles e invalido"

    - condition: "Open loops ausentes ou nao conectam emails sequenciais"
      reason: "Open loops sao o motor de engajamento em sequencias — obrigatorios em SOS"

    - condition: "Multiplos CTAs diferentes no mesmo email"
      reason: "Multiplos CTAs dividem atencao e reduzem conversao — 1 CTA unico por email"

    - condition: "Email 1 ou 2 vendendo diretamente (exceto carrinho abandonado)"
      reason: "Vender cedo quebra confianca — nurturing nos primeiros 2 emails e obrigatorio"

    - condition: "Sequencia com menos de 3 emails"
      reason: "Sequencia muito curta nao constroi relacionamento — minimo 3 emails necessario"

    - condition: "Tom de voz inconsistente entre emails da mesma sequencia"
      reason: "Tom inconsistente confunde leitor e quebra confianca — manter voz uniforme"

    - condition: "Paragrafos longos (>5 linhas) sem espaco em branco"
      reason: "Paragrafos longos matam leitura em mobile — formatacao mobile e obrigatoria"

    - condition: "Subject lines genericos sem curiosidade ou especificidade"
      reason: "Subject generico = baixo open rate — deve gerar curiosidade ou urgencia"
```

---

_Template Version: 1.0.0_
_Squad: copywriting-squad_
