# 🎨 EcoFlow Design System - AI Studio Prompt

Use este prompt completo em **v0.dev**, **bolt.new**, **Lovable**, **Claude Artifacts** ou qualquer ferramenta de AI coding para criar aplicações usando o EcoFlow Design System.

---

## 📋 PROMPT COMPLETO (Copie e Cole)

```
Crie uma aplicação [DESCREVA SUA APP AQUI] usando o EcoFlow Design System.

# Design System Specifications

## Visual Identity
- **Style:** Corporate modern aesthetic, clean and professional
- **Target:** Project management dashboards and business applications
- **Aesthetic:** Minimalist, focused on clarity and usability

## Color Palette

### Primary Colors
- **Primary (Teal):** #00BFA5 - Main brand color, use for primary actions and highlights
- **Accent (Yellow):** #FFB800 - Use sparingly for important highlights and CTAs
- **White:** #FFFFFF - Clean backgrounds and cards

### Semantic Colors
- **Success:** #10B981 (Green) - Success states, positive indicators
- **Warning:** #F59E0B (Amber) - Warning states, attention needed
- **Error:** #EF4444 (Red) - Error states, destructive actions
- **Info:** #3B82F6 (Blue) - Informational states, neutral highlights

### Neutral Palette (Grays)
- 50: #F9FAFB (backgrounds)
- 100: #F3F4F6 (subtle backgrounds)
- 200: #E5E7EB (borders, dividers)
- 300: #D1D5DB (disabled states)
- 400: #9CA3AF (placeholder text)
- 500: #6B7280 (secondary text)
- 600: #4B5563 (body text)
- 700: #374151 (headings)
- 800: #1F2937 (primary text)
- 900: #111827 (dark text)

## Typography

### Font Family
- **Primary:** Inter (Google Fonts)
- **Fallback:** system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

### Font Sizes
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)
- 5xl: 3rem (48px)
- 6xl: 3.75rem (60px)

### Font Weights
- light: 300
- regular: 400
- medium: 500
- semibold: 600
- bold: 700
- extrabold: 800

### Typography Hierarchy
- **H1:** 2.25rem (36px), bold, #111827
- **H2:** 1.875rem (30px), bold, #1F2937
- **H3:** 1.5rem (24px), semibold, #374151
- **H4:** 1.25rem (20px), semibold, #4B5563
- **Body:** 1rem (16px), regular, #4B5563
- **Caption:** 0.875rem (14px), regular, #6B7280
- **Label:** 0.75rem (12px), medium, #6B7280

## Spacing System (4px base unit)

Use multiples of 4px for consistent spacing:
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 10: 2.5rem (40px)
- 12: 3rem (48px)
- 16: 4rem (64px)
- 20: 5rem (80px)
- 24: 6rem (96px)

## Shadows & Elevation

- **sm:** 0 1px 2px 0 rgba(0, 0, 0, 0.05) - Subtle depth
- **default:** 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
- **md:** 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) - Cards
- **lg:** 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) - Modals
- **xl:** 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) - Popovers

## Border Radius

- sm: 0.25rem (4px) - Small elements
- md: 0.375rem (6px) - Default for buttons, inputs
- lg: 0.5rem (8px) - Cards
- xl: 0.75rem (12px) - Large cards
- 2xl: 1rem (16px) - Modal corners
- full: 9999px - Pills, avatars, badges

## Component Patterns

### Buttons
- **Primary:** Teal background (#00BFA5), white text, md shadow on hover
- **Secondary:** Yellow background (#FFB800), dark text (#111827)
- **Outline:** Transparent background, teal border, teal text
- **Ghost:** Transparent background, no border, teal text
- **Danger:** Red background (#EF4444), white text

**Sizes:**
- sm: padding 0.5rem 0.75rem (8px 12px), text-sm
- md: padding 0.625rem 1rem (10px 16px), text-base
- lg: padding 0.75rem 1.5rem (12px 24px), text-lg

### Input Fields
- Border: 1px solid #D1D5DB
- Focus: border #00BFA5, ring 3px rgba(0, 191, 165, 0.1)
- Error: border #EF4444, text #991B1B
- Disabled: background #F3F4F6, text #9CA3AF
- Padding: 0.625rem 0.75rem (10px 12px)
- Border radius: md (6px)

### Cards
- Background: white
- Border: 1px solid #E5E7EB
- Border radius: lg (8px) or xl (12px)
- Shadow: sm or md
- Padding: 1rem (16px) to 1.5rem (24px)

### Navigation Sidebar
- Width: 280px (fixed)
- Background: white
- Border right: 1px solid #E5E7EB
- Active item: background #E0F7F4 (teal-50), text #007A58 (teal-900)
- Hover: background #F3F4F6 (neutral-100)

### Top Bar
- Height: auto (padding-based)
- Background: white
- Border bottom: 1px solid #E5E7EB
- Sticky positioning

### Badges
- **Primary:** background #B3EDE6, text #007A58
- **Success:** background #D1FAE5, text #065F46
- **Warning:** background #FEF3C7, text #92400E
- **Error:** background #FEE2E2, text #991B1B
- **Info:** background #DBEAFE, text #1E40AF
- Padding: 0.125rem 0.5rem (2px 8px)
- Border radius: full (pill shape)
- Font: xs, semibold

### Status Indicators
- Dot size: 8px
- **Online:** Green (#10B981)
- **Offline:** Gray (#9CA3AF)
- **Busy:** Red (#EF4444)
- **Away:** Yellow (#F59E0B)

### Progress Bars
- Height: 8px (default) or 6px (small)
- Background: #E5E7EB
- Fill: Linear gradient from #00BFA5 to #00B39A
- Border radius: full
- Smooth animation on value change

### Avatars
- Sizes: sm (32px), md (40px), lg (48px), xl (64px)
- Border radius: full
- Fallback: gradient from teal to yellow
- Text: white, bold, centered
- Border: 2px solid white (for avatar groups)

### Tables
- Header: background #F9FAFB, text uppercase, semibold, text-sm
- Border: 1px solid #E5E7EB (header 2px bottom)
- Row hover: background #F9FAFB
- Cell padding: 1rem (16px)
- Striped: alternate rows with #F9FAFB

### Modals
- Overlay: rgba(0, 0, 0, 0.5)
- Background: white
- Border radius: xl (12px)
- Shadow: xl
- Max width: sm (640px), md (768px), lg (1024px)
- Padding: 1.5rem (24px)

### Alerts
- Padding: 1rem (16px)
- Border radius: lg (8px)
- Border left: 4px solid (color based on variant)
- **Info:** background #DBEAFE, border #3B82F6
- **Success:** background #D1FAE5, border #10B981
- **Warning:** background #FEF3C7, border #F59E0B
- **Error:** background #FEE2E2, border #EF4444

## Layout Guidelines

### Container Widths
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px (main container)
- 2xl: 1536px

### Grid System
- Responsive columns: 1 (mobile), 2 (tablet), 3-4 (desktop)
- Gap: 1rem to 1.5rem (16px to 24px)

### Dashboard Layout Pattern
```
┌─────────┬─────────────────────────────────┐
│         │  TopBar (sticky)                 │
│ Sidebar ├─────────────────────────────────┤
│ (fixed) │  Content Area                    │
│         │  - Breadcrumb                    │
│         │  - Page Header                   │
│         │  - Stats Grid (4 columns)       │
│         │  - Main Content (Cards/Tables)  │
└─────────┴─────────────────────────────────┘
```

## Accessibility Requirements

- **WCAG 2.1 AA Compliance**
- Color contrast: minimum 4.5:1 for text
- Keyboard navigation: Tab, Enter, Escape, Arrow keys
- ARIA labels: proper roles, labels, descriptions
- Focus indicators: visible focus states (ring)
- Screen reader support: semantic HTML

## Implementation Notes

1. **Use Tailwind CSS** if possible for faster development
2. **Mobile-first** responsive design
3. **Smooth transitions:** 0.2s ease for hover effects
4. **Loading states:** Use skeleton screens or spinners
5. **Empty states:** Provide helpful messages and actions
6. **Error handling:** Clear error messages with recovery actions
7. **Form validation:** Real-time validation with clear feedback

## Example Component Structure

### Button Component
```tsx
<button className="btn-primary">
  Primary Button
</button>

Styles:
- background: #00BFA5
- color: white
- padding: 0.625rem 1rem
- border-radius: 0.375rem
- font-weight: 600
- shadow on hover
- transition: all 0.2s
```

### Card Component
```tsx
<div className="card">
  <div className="card-header">
    <h3>Card Title</h3>
  </div>
  <div className="card-body">
    Content here
  </div>
</div>

Styles:
- background: white
- border: 1px solid #E5E7EB
- border-radius: 0.75rem
- shadow: small
- padding: 1.5rem
```

## Reference Images

I have 7 reference screenshots that inspired this design system:
- Dashboard layouts with teal + yellow color scheme
- Clean, corporate aesthetic
- Project management interfaces
- Modern card-based layouts
- Professional data tables

Please maintain this visual identity throughout the application.

# Application Requirements

[DESCRIBE YOUR SPECIFIC APPLICATION NEEDS HERE]

Examples:
- "Create a project management dashboard with..."
- "Build a task tracking application with..."
- "Design a team collaboration tool with..."

Please follow the EcoFlow Design System specifications exactly and create a production-ready, accessible, and visually consistent application.
```

---

## 🎯 Como Usar Este Prompt

### Para v0.dev (Vercel)
1. Acesse: https://v0.dev
2. Cole o prompt completo
3. Adicione detalhes específicos da sua aplicação
4. Clique em "Generate"

### Para bolt.new (StackBlitz)
1. Acesse: https://bolt.new
2. Cole o prompt completo
3. Bolt vai criar todo o projeto com arquivos
4. Você pode editar e fazer deploy direto

### Para Lovable.dev
1. Acesse: https://lovable.dev
2. Cole o prompt no chat
3. Lovable cria e hospeda automaticamente
4. Você pode iterar com modificações

### Para Claude (Artifacts)
1. Use Claude.ai
2. Cole o prompt
3. Peça para criar "como artifact"
4. Claude gera HTML/React standalone

### Para ChatGPT (Code Interpreter)
1. Use ChatGPT Plus
2. Cole o prompt
3. Peça código específico
4. GPT gera arquivos para download

---

## 📝 Template de Pedido Específico

Use este template após colar o prompt base:

```
Usando o EcoFlow Design System acima, crie:

**Tipo de Aplicação:** [Dashboard / CRUD / Landing Page / etc]

**Funcionalidades Principais:**
1. [Funcionalidade 1]
2. [Funcionalidade 2]
3. [Funcionalidade 3]

**Páginas Necessárias:**
- [ ] Home/Dashboard
- [ ] Lista de [items]
- [ ] Detalhes de [item]
- [ ] Formulário de criação
- [ ] Página de configurações
- [ ] Login/Autenticação

**Stack Técnica Preferida:**
- Frontend: [React / Vue / Svelte / HTML+CSS]
- Styling: [Tailwind / CSS Modules / Styled Components]
- Backend: [Supabase / Firebase / Node.js / etc]

**Requisitos Especiais:**
- [Requisito específico 1]
- [Requisito específico 2]

Por favor, gere o código completo seguindo exatamente as especificações do EcoFlow Design System.
```

---

## 💡 Exemplos de Prompts Específicos

### Exemplo 1: Dashboard de Projetos
```
Usando o EcoFlow Design System, crie um dashboard de gerenciamento de projetos com:

- Sidebar com navegação (Dashboard, Projects, Tasks, Team, Analytics)
- TopBar com busca e notificações
- Cards de estatísticas (projetos ativos, tarefas completadas, membros)
- Tabela de projetos recentes com status, progresso, e team members
- Modal para criar novo projeto
- Página de detalhes do projeto com timeline e atividades

Stack: React + Tailwind CSS + TypeScript
```

### Exemplo 2: CRUD de Tarefas
```
Usando o EcoFlow Design System, crie uma aplicação de gerenciamento de tarefas com:

- Lista de tarefas com filtros (todas, ativas, concluídas)
- Cards de tarefas com título, descrição, prioridade (badge), e data
- Formulário de criação/edição com validação
- Status indicators (pendente, em progresso, concluído)
- Drag and drop para reordenar (opcional)
- Responsivo para mobile

Stack: React + Tailwind CSS
```

### Exemplo 3: Portal do Cliente
```
Usando o EcoFlow Design System, crie um portal self-service para clientes com:

- Dashboard com resumo da conta
- Lista de tickets de suporte com status
- Base de conhecimento com busca
- Página de perfil do usuário
- Sistema de notificações
- Chat de suporte (UI apenas)

Stack: Next.js + Tailwind CSS + TypeScript
```

---

## 🎨 Recursos Visuais para Anexar

Se a ferramenta permitir anexar imagens, inclua:

1. **Screenshot da demo page** (`demo-page.html`)
   ```bash
   # Tire um screenshot da página demo aberta
   ```

2. **Paleta de cores visual**
   - Crie cards mostrando as cores do sistema

3. **Screenshots dos 7 designs originais**
   - Localizados em: `/Users/luizfosc/Dropbox/[[CODE]]/Systemas pra Criar/++DESIGNS/Design Amarelo e verde`

---

## ⚡ Atalhos e Variações

### Para pedidos rápidos:
```
"Crie [tipo de página] usando EcoFlow Design System (teal #00BFA5 + yellow #FFB800, Inter font, corporate modern style)"
```

### Para iterar sobre resultado:
```
"Ajuste usando as cores exatas do EcoFlow: primary #00BFA5, accent #FFB800, seguindo o spacing de 4px base"
```

### Para componentes específicos:
```
"Crie um [componente] seguindo o EcoFlow Design System conforme especificado acima"
```

---

## 🔍 Checklist de Validação

Após receber o código da IA, verifique:

- [ ] Cores corretas (teal #00BFA5, yellow #FFB800)
- [ ] Font Inter aplicada
- [ ] Spacing consistente (múltiplos de 4px)
- [ ] Shadows e border radius corretos
- [ ] Badges com cores semânticas
- [ ] Buttons com variantes corretas
- [ ] Cards com estilo EcoFlow
- [ ] Responsividade implementada
- [ ] Estados hover/focus funcionando
- [ ] Acessibilidade (ARIA, keyboard nav)

---

## 📞 Suporte

Se a IA não seguir o design system perfeitamente:

1. **Seja específico:** "Use exatamente #00BFA5 para o primary color"
2. **Cite o prompt:** "Conforme especificado no EcoFlow Design System..."
3. **Mostre exemplo:** "Como no demo-page.html"
4. **Itere:** Peça ajustes pontuais
5. **Use o HTML demo:** Como referência visual

---

## 🎁 Bônus: Tailwind Config

Se usar Tailwind, peça para adicionar esta config:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E0F7F4',
          100: '#B3EDE6',
          200: '#80E2D7',
          300: '#4DD7C8',
          400: '#26CFBD',
          500: '#00BFA5', // Main
          600: '#00B39A',
          700: '#00A58D',
          800: '#009780',
          900: '#007A58',
        },
        accent: {
          50: '#FFF9E6',
          100: '#FFEFBF',
          200: '#FFE594',
          300: '#FFDB69',
          400: '#FFD249',
          500: '#FFB800', // Main
          600: '#F5A900',
          700: '#EB9600',
          800: '#E08200',
          900: '#D15900',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

---

🎉 **Com este prompt, qualquer AI Studio vai criar sua aplicação perfeitamente alinhada com o EcoFlow Design System!**
