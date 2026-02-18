# Template: Sales Letter

```yaml
template_id: sales-letter-tmpl
template_name: "Sales Letter Completa"
version: 1.0.0
output_format: markdown
use_with_clones:
  primary: "@gary-halbert (narrativa), @clayton-makepeace (emocional)"
  support: "@gary-bencivenga (bullets), @eugene-schwartz (headline)"
  audit: "@claude-hopkins"
```

## Quando Usar

- Sales page longa para produto/servico
- Carta de vendas para lancamento
- Pagina de checkout com copy persuasivo
- Qualquer peca que precisa vender com texto longo

---

## ESTRUTURA DA SALES LETTER

### 1. PRE-HEADLINE (opcional)
```
[Segmento especifico do publico]
Para [avatar] que quer [resultado desejado]...
```

### 2. HEADLINE PRINCIPAL
```
[Headline baseada no awareness level do publico]

Regras:
- Unaware → headline longa, story-driven
- Problem Aware → headline sobre a dor
- Solution Aware → headline sobre o mecanismo
- Product Aware → headline sobre a oferta
- Most Aware → headline direta com preco/desconto
```

### 3. SUBHEADLINE
```
[Expande a headline com beneficio secundario ou prova]
```

### 4. LEAD (ABERTURA)
```
[Primeiros 300-500 palavras — CRITICO para manter o leitor]

Formatos de lead:
- Story Lead: Historia pessoal de identificacao (Halbert)
- Problem Lead: Amplificacao da dor (Makepeace)
- Secret Lead: Revelacao de algo desconhecido (Schwartz)
- Promise Lead: Promessa audaciosa com prova (Carlton)
```

### 5. PROBLEMA AMPLIFICADO
```
[Descrever a dor com detalhes emocionais e sensoriais]

- Consequencias de NAO resolver
- Como isso afeta a vida diaria
- Por que solucoes anteriores falharam
- O custo de continuar do mesmo jeito

[Usar linguagem visceral — Makepeace]
```

### 6. TRANSICAO (BRIDGE)
```
[Momento de virada — do problema para a solucao]

"Ate que descobri..." / "Foi quando percebi..." / "Tudo mudou quando..."
```

### 7. MECANISMO UNICO
```
[Por que ESTA solucao funciona — Todd Brown]

- Mecanismo do problema (por que estava preso)
- Mecanismo da solucao (por que ISSO funciona diferente)
- Nome proprietario do metodo/sistema
```

### 8. BULLETS DE BENEFICIO
```
[15-25 bullets usando formatos de Bencivenga]

Formatos:
- "Como [fazer X] sem [sacrificio Y]..."
- "O segredo de [grupo] para [resultado]..."
- "Por que [crenca popular] esta te sabotando..."
- "A coisa #1 que [experts] fazem diferente..."
- "[Numero] maneira comprovada de [resultado]..."
```

### 9. PROVA SOCIAL
```
[Depoimentos, cases, numeros, credenciais]

- Depoimentos com nome, foto, resultado especifico
- Antes/depois com dados
- Logos/marcas que usam
- Credenciais do autor
- Numeros de resultados (alunos, clientes, receita)
```

### 10. APRESENTACAO DA OFERTA
```
## Apresentando: [Nome do Produto/Programa]

[Descricao clara do que e e o que inclui]

### O que voce recebe:

✅ [Item 1] — Valor: R$[X]
   [Descricao breve do beneficio]

✅ [Item 2] — Valor: R$[X]
   [Descricao breve do beneficio]

✅ [Item 3] — Valor: R$[X]
   [Descricao breve do beneficio]

[Bonus 1]: [Nome] — Valor: R$[X]
[Bonus 2]: [Nome] — Valor: R$[X]

**Valor Total:** R$[soma]
**Seu Investimento Hoje:** R$[preco real]
```

### 11. GARANTIA
```
[Garantia que elimina risco — Hormozi]

Formatos:
- Incondicional: "30 dias ou dinheiro de volta, sem perguntas"
- Condicional: "Se nao [resultado] em [tempo], devolvemos 100%"
- Reversa: "Se nao funcionar, EU pago R$[X] pelo seu tempo"
```

### 12. URGENCIA/ESCASSEZ
```
[Razao REAL para agir agora]

- Vagas limitadas (com numero real)
- Bonus expira em [data]
- Preco sobe em [data]
- Turma fecha em [data]

[NUNCA usar urgencia falsa — publico detecta]
```

### 13. CTA (CALL TO ACTION)
```
[Botao/link claro e unico]

>> [TEXTO DO BOTAO] <<

[Reforcar garantia logo abaixo do CTA]
```

### 14. P.S. (MINIMO 2)
```
P.S. — [Reforcar beneficio principal ou urgencia]

P.P.S. — [Mencionar garantia ou bonus que expira]
```

---

## CHECKLIST PRE-ENTREGA

- [ ] Headline corresponde ao awareness level do publico
- [ ] Lead mantem leitura nos primeiros 300 palavras
- [ ] Problema amplificado com emocao (nao so logica)
- [ ] Mecanismo unico claramente diferenciado
- [ ] 15+ bullets de beneficio
- [ ] Minimo 3 provas sociais
- [ ] Oferta com stack de valor claro
- [ ] Garantia que elimina risco
- [ ] Urgencia real (nao fabricada)
- [ ] CTA claro e unico
- [ ] 2+ P.S. estrategicos
- [ ] Audit Hopkins executado

---

## VALIDATION RULES

```yaml
validation_rules:
  min_sections: 14

  required_elements:
    - headline_principal
    - subheadline
    - lead_abertura
    - problema_amplificado
    - mecanismo_unico
    - bullets_beneficio
    - prova_social
    - apresentacao_oferta
    - garantia
    - urgencia_escassez
    - cta
    - ps_minimo_2

  quality_checks:
    - name: headline_awareness_match
      rule: "Headline deve corresponder ao awareness level do publico-alvo"
      severity: CRITICAL

    - name: lead_engagement
      rule: "Lead (primeiros 300-500 palavras) deve manter leitura sem perda de ritmo"
      severity: CRITICAL

    - name: bullets_count
      rule: "Minimo 15 bullets de beneficio usando formatos de Bencivenga"
      severity: HIGH

    - name: prova_social_quantity
      rule: "Minimo 3 provas sociais (depoimentos, cases, numeros, credenciais)"
      severity: HIGH

    - name: problema_emocional
      rule: "Problema amplificado com linguagem visceral/sensorial (nao apenas logica)"
      severity: HIGH

    - name: mecanismo_diferenciacao
      rule: "Mecanismo unico claramente diferenciado de solucoes anteriores"
      severity: MEDIUM

    - name: stack_valor_claro
      rule: "Oferta com stack de valor detalhado (componentes + valores individuais)"
      severity: MEDIUM

    - name: garantia_elimina_risco
      rule: "Garantia elimina risco percebido (incondicional, condicional ou reversa)"
      severity: MEDIUM

    - name: urgencia_real
      rule: "Urgencia/escassez deve ser REAL e justificada (nao fabricada)"
      severity: CRITICAL

    - name: cta_unico_claro
      rule: "CTA claro, unico e visivel (nao multiplos CTAs competindo)"
      severity: HIGH

    - name: ps_estrategico
      rule: "Minimo 2 P.S. estrategicos (reforcar beneficio + urgencia/garantia)"
      severity: MEDIUM

  word_count:
    min: 2000
    max: 8000
    ideal: "3000-5000 para trafego morno; 5000-8000 para trafego frio (unaware)"

  veto_conditions:
    - condition: "Headline generica sem especificidade ou beneficio claro"
      reason: "Headline e o elemento #1 de conversao — deve ser especifica e orientada a resultado"

    - condition: "Menos de 10 bullets de beneficio"
      reason: "Bullets sao o motor de vendas — 15+ e o minimo para persuasao"

    - condition: "Nenhuma prova social presente"
      reason: "Prova social e obrigatoria para credibilidade — depoimentos, cases ou numeros"

    - condition: "Urgencia fabricada ou falsa (ex: contador fake, vagas ilimitadas)"
      reason: "Urgencia falsa destroi confianca e credibilidade — apenas urgencia REAL"

    - condition: "Sem garantia definida"
      reason: "Garantia e essencial para eliminar risco percebido — obrigatoria em sales letters"

    - condition: "Multiplos CTAs diferentes competindo por atencao"
      reason: "CTA deve ser unico e repetido — multiplos CTAs dividem atencao e reduzem conversao"

    - condition: "Mecanismo unico nao claramente diferenciado de solucoes comuns"
      reason: "Sem mecanismo unico, oferta e commodity — diferenciacao e obrigatoria"
```

---

_Template Version: 1.0.0_
_Squad: copywriting-squad_
