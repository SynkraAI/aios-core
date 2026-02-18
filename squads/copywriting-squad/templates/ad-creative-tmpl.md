# Template: Ad Creative (Hook + Body + CTA)

```yaml
template_id: ad-creative-tmpl
version: 1.0.0
tipo: output
clones_recomendados:
  hooks_diretos: "@john-carlton"
  hooks_narrativos: "@gary-halbert"
  video_ads: "@jon-benson"
  emocao: "@clayton-makepeace"
  bullets: "@gary-bencivenga"
```

---

## FORMATO A: TEXTO (Facebook/Instagram Feed)

### Variante 1 — DIRETO (Carlton)
```
🔥 [HOOK: Resultado + Tempo + Sem Obstaculo]

[1 frase agitando dor]
[1 frase com mecanismo unico]
[1 frase com prova/numero]

👉 [CTA claro com link]

[Urgencia se aplicavel]
```

### Variante 2 — NARRATIVO (Halbert)
```
[HOOK: Inicio de historia — "Preciso te contar..."]

[2-3 frases de contexto pessoal]
[Momento de virada/descoberta]
[Resultado alcancado com especificidade]

Quer saber como? 👇
[CTA com link]
```

### Variante 3 — BULLETS (Bencivenga)
```
[HOOK: Promessa principal]

Dentro voce vai descobrir:

✅ [Bullet curiosidade 1]
✅ [Bullet beneficio especifico 2]
✅ [Bullet contrarian 3]
✅ [Bullet prova 4]

[CTA direto]
```

---

## FORMATO B: VIDEO AD SCRIPT (15-30s)

### Script Curto — HOOK RAPIDO
```
[0-3s] HOOK: "[Frase que para o scroll — controversa/curiosa/chocante]"
[3-10s] PROBLEMA: "Se voce [dor especifica], voce nao esta sozinho..."
[10-20s] SOLUCAO: "Descobri que [mecanismo unico] resolve isso em [tempo]"
[20-25s] PROVA: "[Numero/resultado/testimonial rapido]"
[25-30s] CTA: "Clica no link pra [acao] — [urgencia]"
```

### Script Medio — STORY AD (30-60s)
```
[0-5s] HOOK: "[Inicio de historia — emocao imediata]"
[5-15s] CONTEXTO: "[Situacao antes — dor vivida]"
[15-30s] VIRADA: "[Descoberta/mudanca — mecanismo]"
[30-45s] RESULTADO: "[Depois — especifico, mensuravel]"
[45-55s] PONTE: "[Como voce pode ter o mesmo]"
[55-60s] CTA: "[Acao clara + urgencia]"
```

### Script UGC — TESTIMONIAL
```
[0-3s] HOOK: "[Isso mudou minha vida / Preciso falar sobre isso]"
[3-15s] ANTES: "[Como era antes — sofrimento real]"
[15-30s] DURANTE: "[O que fez — processo simples]"
[30-40s] DEPOIS: "[Resultado especifico — numero/transformacao]"
[40-45s] CTA: "[Testa voce tambem — link na bio]"
```

---

## FORMATO C: GOOGLE SEARCH ADS

### Headline (max 30 caracteres cada)
```
H1: [Beneficio principal]
H2: [Diferencial/mecanismo]
H3: [Prova ou urgencia]
```

### Descricao (max 90 caracteres cada)
```
D1: [Expandir beneficio + CTA]
D2: [Prova + garantia]
```

### Exemplo:
```
H1: Perca 10kg em 90 Dias
H2: Metodo Sem Dieta Restritiva
H3: 5.000+ Alunos Satisfeitos
D1: Programa completo com acompanhamento. Comece gratis hoje.
D2: Garantia de 60 dias. Resultado ou seu dinheiro de volta.
```

---

## FORMATO D: CARROSSEL (Instagram/LinkedIn)

### Estrutura de Slides
```
Slide 1: [HOOK — parar scroll] (texto grande, fundo contrastante)
Slide 2: [PROBLEMA] (agitar dor)
Slide 3: [ERRO COMUM] (por que nao funciona)
Slide 4: [MECANISMO] (o que funciona)
Slide 5: [BENEFICIO 1] (com especificidade)
Slide 6: [BENEFICIO 2] (com prova)
Slide 7: [BENEFICIO 3] (com resultado)
Slide 8: [CTA] (o que fazer agora)
```

---

## REGRAS DE COMPLIANCE

| Plataforma | Regras Criticas |
|------------|-----------------|
| Facebook/IG | Nao usar "voce" em claims de resultado. Sem promessas de renda. Cuidado com saude. |
| Google | H: max 30 chars. D: max 90 chars. Sem superlativos sem prova. |
| YouTube | Hook em 5s. Nao comecar com pergunta direta. CTA verbal + visual. |
| LinkedIn | Tom mais profissional. Evitar hiperbole. B2B focus. |

---

## VALIDATION RULES

```yaml
validation_rules:
  min_sections: 3

  required_elements:
    - hook
    - body_copy
    - cta
    - platform_specs
    - visual_direction

  quality_checks:
    - name: Hook Impact
      rule: "First line must stop scroll (contrarian, curious, or shocking statement)"
      severity: CRITICAL

    - name: Platform Compliance
      rule: "Must comply with platform-specific character limits and content policies"
      severity: CRITICAL

    - name: CTA Clarity
      rule: "CTA must be specific, actionable, and include urgency when applicable"
      severity: HIGH

    - name: Visual Direction
      rule: "Must include clear visual/creative direction for designer or video editor"
      severity: HIGH

    - name: Proof Element
      rule: "Must include at least one proof element (number, testimonial, or result)"
      severity: MEDIUM

    - name: Scanability
      rule: "Text must be formatted for quick scanning (bullets, short paragraphs, emojis)"
      severity: MEDIUM

  word_count:
    text_ad:
      min: 40
      max: 150
    video_script_short:
      min: 50
      max: 120
    video_script_medium:
      min: 120
      max: 200
    google_search:
      headline_max: 30
      description_max: 90

  veto_conditions:
    - "Hook is generic or fails to create curiosity"
    - "CTA is missing or vague"
    - "Violates platform compliance rules"
    - "No proof element or specificity"
    - "Character limits exceeded for platform"
```

---

_Template Version: 1.0.0_
_Squad: copywriting-squad_
