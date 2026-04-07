# 🎨 Design System — Viral Squad

## Configuração

O squad aceita qualquer design system. Defina os tokens abaixo ou importe de um DS existente.

### Como usar

**Opção 1: DS customizado** — edite os tokens abaixo diretamente.

**Opção 2: DS existente** — referencie no `squad.yaml`:

```yaml
design_system:
  source: "path/to/your-ds/tokens.ts"  # ou tokens.json
```

Se nenhum DS for configurado, os tokens padrão abaixo serão usados.

---

## Tokens Padrão (editáveis)

### Color Palette

```yaml
colors:
  background: "#000000"    # Cor dominante (~70% da tela)
  foreground: "#FFFFFF"    # Texto principal (~22% da tela)
  primary: "#C9B298"       # Cor de destaque (MAX 8% da tela)
  muted: "#A8A8A8"         # Textos secundários
```

### Accent Rule

**Regra:** A cor `primary` (accent) NUNCA deve exceder **8% da área visível da tela**.

Accent em excesso perde impacto — é como grifar uma página inteira: se tudo é destaque, nada é destaque.

**Use accent para:**
- CTAs principais
- Key highlights e números importantes
- Accent borders e separadores

**Nunca para:**
- Backgrounds grandes
- Body text
- Decoração excessiva

### Typography

```yaml
typography:
  ui: "Inter"               # Títulos e UI elements
  ui_weight: 600             # SemiBold
  body: "Source Serif 4"     # Corpo de texto
  body_weight: 400           # Regular
  sizes:                     # Mobile 1080x1920
    hero: "72-96px"
    title: "48-64px"
    body: "32-40px"
    caption: "24-28px"
```

### Icons

```yaml
icons:
  style: "Flaticon Regular Rounded"  # ou qualquer icon set
  color: "foreground"                 # Herda do token
  accent_color: "primary"             # Para ícones de destaque
  size: "48-64px"
```

### Layout Grid

```yaml
layout:
  format: "1080x1920"        # Instagram Reels/Stories
  safe_zones:
    top: "0-200px"            # Evitar (UI do Instagram)
    content: "200-1720px"     # Área segura
    bottom: "1720-1920px"     # Evitar (UI do Instagram)
  margins: "40px"
  base_unit: "8px"            # Espaçamento múltiplo de 8
```

---

## Para Agentes Visuais

Todos os agentes das divisões `viral-design` e `remotion-experts` DEVEM:

1. **Importar tokens** — nunca hardcodar valores de cor, fonte ou espaçamento
2. **Respeitar a accent rule** — validar que a cor de destaque não excede 8%
3. **Usar o grid** — respeitar safe zones e base unit
4. **Validar mobile** — todo output deve funcionar em 1080x1920

### Checklist Rápido

```
DS Compliance: PASS/FAIL
Token Import: YES/NO
Hardcoded Values: 0
Accent Usage: X.XX% (< 8%)
Safe Zones: Respected
```

---

## Migração de DS Existente

Se você já tem um design system (ex: Tailwind config, Figma tokens, Style Dictionary):

1. Extraia os tokens (cores, fonts, spacing)
2. Substitua os valores acima
3. Atualize o `squad.yaml` com o path do source
4. Os agentes automaticamente usarão os novos tokens

Ferramentas úteis: `/design-system-extractor` (skill AIOS)
