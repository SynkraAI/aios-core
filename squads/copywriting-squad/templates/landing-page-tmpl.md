# Template: Landing Page

```yaml
template_id: landing-page-tmpl
version: 1.0.0
tipo: output
clones_recomendados:
  texto: "@gary-halbert (storytelling) ou @john-carlton (direto)"
  video: "@jon-benson (VSL curta)"
  bullets: "@gary-bencivenga"
  emocao: "@clayton-makepeace"
```

---

## ESTRUTURA DA LANDING PAGE

### SECAO 1: ABOVE THE FOLD

**HEADLINE PRINCIPAL**
```
[Resultado especifico] em [tempo] sem [obstaculo/sacrificio]
```

**SUBHEADLINE**
```
[Expandir promessa com especificidade] — [prova ou credencial]
```

**VISUAL:** Imagem/video hero que demonstra resultado

**CTA #1 (acima da dobra)**
```
[Acao] → [Resultado] — [Urgencia se aplicavel]
Ex: "Quero Comecar Agora" | "Baixar Guia Gratis" | "Assistir Aula"
```

---

### SECAO 2: PROBLEMA/DOR

**ABERTURA EMPÁTICA**
```
Voce ja sentiu [dor especifica]?
[Agitar com linguagem sensorial - Makepeace style]
[Consequencias de nao resolver]
```

**3 DORES ESPECIFICAS (bullets)**
```
❌ [Dor 1 — situacao concreta]
❌ [Dor 2 — consequencia emocional]
❌ [Dor 3 — custo de nao agir]
```

---

### SECAO 3: MECANISMO/SOLUCAO

**TRANSICAO**
```
[E se existisse um jeito diferente de resolver isso?]
```

**MECANISMO UNICO (Todd Brown)**
```
[Por que solucoes anteriores falharam — mecanismo do problema]
[O que descobrimos — mecanismo da solucao]
[Nome do metodo/sistema]
```

**3-5 BULLETS DE BENEFICIO (Bencivenga)**
```
✅ [Beneficio 1 + especificidade + curiosidade]
✅ [Beneficio 2 + especificidade + curiosidade]
✅ [Beneficio 3 + especificidade + curiosidade]
```

---

### SECAO 4: PROVA

**TESTIMONIALS / SOCIAL PROOF**
```
"[Citacao do cliente com resultado especifico]" — [Nome, contexto]
"[Citacao do cliente com resultado especifico]" — [Nome, contexto]
"[Citacao do cliente com resultado especifico]" — [Nome, contexto]
```

**NUMEROS (Ogilvy — fatos, nao adjetivos)**
```
[Numero] pessoas ja [resultado]
[Numero]% de [metrica] em [tempo]
[Numero] anos de [credencial]
```

---

### SECAO 5: OFERTA

**O QUE VOCE RECEBE**
```
✅ [Componente 1] — Valor: R$[X]
✅ [Componente 2] — Valor: R$[Y]
✅ [Bonus 1] — Valor: R$[Z]
TOTAL: R$[soma]
HOJE: R$[preco real] ou GRATIS
```

**GARANTIA**
```
[Tipo de garantia — incondicional, de resultado, reversa]
[Tempo — 7, 30, 60, 90 dias]
[O que acontece se nao gostar]
```

---

### SECAO 6: CTA FINAL

**CTA #2 (principal)**
```
[Botao grande com acao clara]
[Subtexto que remove risco: "Sem compromisso" / "Cancele quando quiser"]
```

**URGENCIA (se aplicavel)**
```
[Razao real para agir agora — nao falsa escassez]
```

**PS.**
```
PS. [Resumir beneficio principal + CTA final — Halbert style]
```

---

## NOTAS DE USO

- **Trafego frio (Unaware):** Copy mais longa, mais educacao, mais storytelling
- **Trafego morno (Problem/Solution Aware):** Copy media, foco em mecanismo
- **Trafego quente (Product/Most Aware):** Copy curta, direto a oferta
- **Sempre testar headline** — maior impacto em conversao
- **CTA aparece minimo 2 vezes** (above fold + final)

---

## VALIDATION RULES

```yaml
validation_rules:
  min_sections: 6

  required_elements:
    - headline_above_fold
    - subheadline_above_fold
    - cta_above_fold
    - secao_problema_dor
    - secao_mecanismo_solucao
    - secao_prova_social
    - secao_oferta
    - cta_final
    - ps_opcional

  quality_checks:
    - name: headline_resultado_tempo_obstaculo
      rule: "Headline deve seguir formato: [resultado especifico] em [tempo] sem [obstaculo/sacrificio]"
      severity: CRITICAL

    - name: cta_above_fold_visivel
      rule: "CTA #1 acima da dobra (above the fold) visivel sem scroll"
      severity: CRITICAL

    - name: problema_3_dores_especificas
      rule: "Secao problema deve listar 3 dores especificas com emocao (nao apenas logica)"
      severity: HIGH

    - name: mecanismo_unico_diferenciado
      rule: "Mecanismo unico claramente diferenciado de solucoes anteriores (Todd Brown)"
      severity: HIGH

    - name: bullets_beneficio_3_5
      rule: "3-5 bullets de beneficio com especificidade e curiosidade (Bencivenga)"
      severity: HIGH

    - name: prova_social_minimo_3
      rule: "Minimo 3 provas sociais: depoimentos com nome/contexto + numeros (Ogilvy)"
      severity: HIGH

    - name: oferta_stack_valor_presente
      rule: "Oferta com stack de valor claro (componentes + valores + bonus + total)"
      severity: MEDIUM

    - name: garantia_tipo_definido
      rule: "Garantia definida com tipo (incondicional, resultado, reversa) e prazo"
      severity: MEDIUM

    - name: cta_minimo_2_vezes
      rule: "CTA aparece minimo 2 vezes (above fold + final)"
      severity: HIGH

    - name: copy_length_awareness_aligned
      rule: "Tamanho do copy alinhado com awareness level (cold=longa, warm=media, hot=curta)"
      severity: MEDIUM

    - name: urgencia_real_se_presente
      rule: "Se urgencia presente, deve ser REAL (nao falsa escassez)"
      severity: CRITICAL

  word_count:
    min: 500
    max: 5000
    ideal: "800-1500 (trafego quente), 1500-3000 (trafego morno), 3000-5000 (trafego frio)"

  veto_conditions:
    - condition: "Headline generica sem resultado especifico ou tempo definido"
      reason: "Headline e o elemento #1 de conversao — deve ser especifica e orientada a resultado"

    - condition: "Sem CTA acima da dobra (above the fold)"
      reason: "CTA above fold e obrigatorio — visitante deve ver acao sem scroll"

    - condition: "Menos de 2 CTAs no total (deve ter above fold + final)"
      reason: "Landing page precisa de multiplas oportunidades de conversao — minimo 2 CTAs"

    - condition: "Problema descrito apenas logicamente (sem emocao ou consequencias)"
      reason: "Dor emocional vende mais que logica — problema deve ter linguagem visceral"

    - condition: "Mecanismo unico ausente ou nao diferenciado de solucoes comuns"
      reason: "Sem mecanismo unico, oferta e commodity — diferenciacao e obrigatoria"

    - condition: "Nenhuma prova social presente"
      reason: "Prova social e essencial para credibilidade — depoimentos ou numeros obrigatorios"

    - condition: "Oferta sem stack de valor ou sem valores individuais"
      reason: "Stack de valor gera ancoragem — oferta sem stack nao maximiza conversao"

    - condition: "Copy longa (>3000 palavras) para trafego quente/most aware"
      reason: "Trafego quente nao precisa de copy longa — deve ser direto a oferta"

    - condition: "Copy curta (<1500 palavras) para trafego frio/unaware"
      reason: "Trafego frio precisa de educacao — copy muito curta nao converte"

    - condition: "Urgencia falsa ou fabricada presente"
      reason: "Urgencia falsa destroi confianca — apenas urgencia REAL ou nenhuma"
```

---

_Template Version: 1.0.0_
_Squad: copywriting-squad_
