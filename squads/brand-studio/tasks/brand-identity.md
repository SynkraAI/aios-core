---
task: Visual Identity Direction
owner: paula-scher
phase: 6
elicit: false
atomic_layer: task
Entrada: |
  - brand_purpose: WHY Statement e Golden Circle (de Simon Sinek)
  - brand_name: Nome selecionado (de Alexandra Watkins)
  - consumer_insights: Consumer Insights Report (de Malcolm Gladwell)
Saida: |
  - visual_identity_brief: Direção criativa completa
  - brand_guidelines_structure: Estrutura de guidelines
---

# Visual Identity Direction — Paula Scher

Define a direção completa de identidade visual da marca.
Entrega Visual Identity Brief que guia qualquer designer a executar o sistema correto.

## Processo

### Fase 1: Visual Territory Mapping

Paula mapeia o território visual antes de criar qualquer coisa:

**Análise do Cenário Competitivo Visual:**
```
1. Quais são as convenções visuais da categoria?
   (O que todos os competidores fazem visualmente)

2. O que está saturado no território visual?
   (Quais cores/estilos/formas são clichê na categoria)

3. Qual território visual está VAZIO que a marca poderia ocupar?
   (Oportunidade de diferenciação visual)

4. Qual é o nível de sofisticação visual da audiência?
   (Influencia complexidade e linguagem visual)
```

**Derivando Visual do WHY:**
```
WHY da marca: "[statement]"
→ O que este WHY evoca visualmente?
→ Qual é a metáfora visual do propósito?
→ Que emoção visual deve provocar?
→ Qual é o vocabulário estético deste propósito?
```

### Fase 2: Direção de Logo

**Tipo de Logo:**
- [ ] **Wordmark**: Nome tipografado com personalidade (ex: Google, Visa, Coca-Cola)
- [ ] **Lettermark**: Iniciais com design distintivo (ex: IBM, HBO, NASA)
- [ ] **Symbol + Wordmark**: Ícone + texto (ex: Apple, Nike, Twitter)
- [ ] **Symbol independente**: Apenas ícone quando marca é madura (ex: Apple, Nike check)
- [ ] **Emblem**: Texto dentro de um shape (ex: Harley-Davidson, Starbucks)

**Conceito de Logo:**
```
O logo de [marca] deve evocar [SENSAÇÃO/CONCEITO],
não descrever [O QUE A EMPRESA FAZ].

Território de conceito: [3-5 direções conceituais para o logo]

Anti-território: [O que o logo definitivamente NÃO deve ser]

Referências de território visual (fora da categoria):
- [Referência 1 + por que inspira]
- [Referência 2 + por que inspira]

Testes obrigatórios para o logo final:
- [ ] Funciona em P&B? (antes de cor)
- [ ] Legível em 16px? (favicon)
- [ ] Impactante em 10 metros? (outdoor)
- [ ] Funciona invertido (branco sobre fundo escuro)?
```

### Fase 3: Sistema Tipográfico

**Critérios de Seleção:**
```
A tipografia é a voz visual da marca.
Antes de escolher fonte, responder:

1. A marca deve parecer [tradicional/moderno/disruptivo/acessível/premium]?
2. O uso primário é [editorial/digital/ambiental/packaging]?
3. Precisa de suporte multilingual?
4. Budget para licença tipográfica: [livre/pago/customizada]
```

**Estrutura Tipográfica:**
```yaml
typography_system:
  primary:
    name: "[Typeface Name]"
    classification: "[Serif | Sans-Serif | Slab | Display | Script]"
    personality: "[3 adjetivos que a fonte expressa]"
    use: "Headlines, hero text, brand expressions"
    weights: "[Bold, Regular — apenas o necessário]"
    why_this_font: "[Conexão com o WHY e personalidade da marca]"

  secondary:
    name: "[Typeface Name]"
    classification: "[classificação]"
    personality: "[como contrasta/complementa a primária]"
    use: "Body text, UI, long-form content"
    weights: "[Regular, Medium — legibilidade primeiro]"
    pairing_rationale: "[Por que funcionam juntas]"

  hierarchy:
    h1: "[Fonte primária, peso bold, 48-72px desktop]"
    h2: "[Fonte primária, peso regular, 32-48px]"
    h3: "[Pode ser secundária, peso medium, 24-32px]"
    body: "[Fonte secundária, regular, 16-18px, 1.6 line-height]"
    caption: "[Fonte secundária, regular, 12-14px]"
```

### Fase 4: Paleta de Cores

**Metodologia de Seleção:**
```
Cores não são preferência estética — são estratégia.

1. Qual emoção primária a marca deve provocar?
   [energy | trust | warmth | prestige | growth | clarity | power]

2. Qual é a cor dominante dos competidores?
   (Para diferenciar OU para alinhar com expectativas da categoria)

3. Há restrições de cor? (elemento de marca existente, cores de competidores a evitar)

4. O uso primário é [digital | print | embalagem | ambiental]?
   (Influencia saturação e espaço de cor)
```

**Estrutura da Paleta:**
```yaml
color_palette:
  primary:
    color_1:
      name: "[nome evocativo]"
      hex: "#XXXXXX"
      rgb: "R, G, B"
      pantone: "XXX C"
      cmyk: "C M Y K"
      psychology: "[O que esta cor comunica]"
      use: "Cor de assinatura — logo, CTA, elemento primário"

  secondary:
    color_2:
      [mesma estrutura]
    color_3:
      [mesma estrutura]

  neutrals:
    light: "[hex] — backgrounds, espaço em branco"
    dark: "[hex] — texto primário"
    mid: "[hex] — texto secundário, bordas"

  accent:
    name: "[nome]"
    hex: "[hex]"
    use: "CTAs, highlights, momentos de atenção"

  usage_rules:
    do: ["[regra de uso positivo]", "[regra]"]
    dont: ["[regra de uso negativo]", "[regra]"]
```

### Fase 5: Linguagem Visual

```yaml
visual_language:
  photography:
    style: "[tipo de fotografia — lifestyle, produto, editorial, etc.]"
    composition: "[regras de enquadramento e composição]"
    color_treatment: "[tratamento de cor — natural, desaturado, high contrast]"
    subjects: "[o que deve aparecer nas fotos]"
    avoid: "[o que nunca deve aparecer]"

  illustration:
    use: [true | false]
    style: "[se sim: flat, hand-drawn, technical, abstract]"
    purpose: "[quando usar ilustração vs. fotografia]"

  iconography:
    system: "[unified icon set — style, weight, corner radius]"
    stroke_weight: "[thin | medium | bold]"
    style: "[outline | filled | duotone]"

  patterns_textures:
    use: [true | false]
    description: "[se sim: como e onde usar]"

  layout_grid:
    columns: "[8 ou 12 colunas — desktop]"
    gutter: "[espaçamento]"
    margin: "[espaçamento externo]"
    spacing_unit: "[base unit — ex: 8px]"

  white_space:
    philosophy: "[generoso | moderado | denso]"
    rationale: "[por que este nível serve à personalidade da marca]"
```

## Deliverable: Visual Identity Brief

```markdown
# Visual Identity Brief: [Nome da Marca]
**Visual Identity Director:** Paula Scher
**Data:** [data]

## Direção Criativa
[3-4 parágrafos descrevendo o território visual,
o que a identidade deve comunicar sem palavras,
e o espaço único que a marca vai ocupar visualmente]

## Logo
**Tipo:** [tipo]
**Conceito:** [o grande conceito, não a descrição]
**Território:** [3 direções conceituais]
**Anti-território:** [o que nunca]
**Referências de território (fora da categoria):**
- [referência + por que]

**Checklist para o designer:**
- [ ] Funciona P&B antes de cor
- [ ] Legível em 16px
- [ ] Impactante em grande escala
- [ ] Funciona invertido

## Tipografia
[Sistema tipográfico completo conforme Fase 3]

## Paleta de Cores
[Paleta completa conforme Fase 4]

## Linguagem Visual
[Sistema visual conforme Fase 5]

## Primeiras Aplicações
1. [Application mais importante — ex: cartão de visita]
2. [Digital — perfil Instagram / site home]
3. [Se aplicável — embalagem / ambiente]

## O que NÃO fazer (Anti-brief)
[Lista explícita do que este brief proíbe —
tão importante quanto o que permite]
```
