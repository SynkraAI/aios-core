# Frontend Audit & Quality 2025

> Tech preset para projetos React/Next.js modernos com Tailwind CSS, shadcn/ui, Design Tokens (W3C), Performance, Acessibilidade e DX de classe mundial.

---

## Metadata

```yaml
preset:
  id: frontend-audit-2025
  name: 'Frontend Audit & Quality 2025'
  version: 1.0.0
  description: 'Preset abrangente para projetos React/Next.js com rigor profissional em Tailwind CSS (v3/v4), Design Tokens (W3C DTCG), shadcn/ui, Performance (Core Web Vitals), Acessibilidade (WCAG 2.2) e DX'
  technologies:
    - React 19+
    - Next.js 14+ (App Router)
    - TypeScript (strict mode)
    - Tailwind CSS v3/v4
    - shadcn/ui
    - Radix UI
    - Design Tokens (W3C DTCG)
    - OKLCH color space
    - Prettier + prettier-plugin-tailwindcss
    - ESLint
  suitable_for:
    - 'Aplicações web modernas (SaaS, dashboards)'
    - 'Design systems corporativos'
    - 'E-commerce de alta performance'
    - 'Progressive Web Apps (PWA)'
    - 'Produtos B2B/B2C com requisitos de acessibilidade'
  not_suitable_for:
    - 'Aplicações server-side only (sem UI)'
    - 'Suporte a browsers legados (IE11)'
    - 'Projetos sem requisitos de acessibilidade ou performance'
```

---

## PREMISSA FUNDAMENTAL

**Você JÁ TEM ACESSO AO CÓDIGO (repositório inteiro)**. Você NÃO deve pedir para o usuário colar arquivos/trechos. Faça a análise explorando o repo (estrutura, configs e implementação).

Se você realmente não conseguir acessar o repositório, diga isso explicitamente em 1 frase e pare, listando o que precisa ser habilitado. **Não invente nada.**

---

## REGRAS ANTI-ALUCINAÇÃO E EVIDÊNCIA (OBRIGATÓRIO)

### Princípios de Evidência

1. **Trabalhe SOMENTE com o que está no repositório**
   - Nunca invente arquivos, rotas, APIs, dependências ou versões
   - Toda afirmação deve apontar "onde está no código"

2. **Formato de Referência Obrigatório**
   ```
   Caminho: path/to/file.tsx
   Símbolo: ComponentName | functionName
   Localização: "perto do topo" | "na exportação" | "linha ~42"
   ```

3. **Quando há incerteza**
   - Apresente opções com evidências de cada
   - Explique a recomendação baseada no que foi encontrado
   - Documente conflitos (ex: v3 e v4 coexistindo)

4. **Ao sugerir criar algo novo**
   - Por que é necessário?
   - Como você verificou duplicação/ausência?
   - Qual o impacto e risco?

---

## Design Patterns

### Pattern 1: Composição com cn + cva (Class Variance Authority)

**Purpose:** Gerenciar variantes de componentes de forma type-safe e evitar conflitos de classes Tailwind

**Execution Score:** 9/10 | **Anti-Bug Score:** 9/10

```typescript
// utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// components/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base classes (sempre aplicadas)
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

**Bugs Eliminated:**

- [x] Conflitos de classes Tailwind (ex: `p-2 p-3` → último vence)
- [x] Inconsistência de variantes entre componentes
- [x] Falta de type-safety em props de estilo
- [x] Manutenção duplicada de classes base

**Why It Works:**

- `twMerge` resolve conflitos de classes automaticamente
- `cva` força type-safety nas variantes
- DRY - variantes reutilizáveis e escaláveis

---

### Pattern 2: Design Tokens em 3 Camadas (W3C DTCG)

**Purpose:** Hierarquia semântica de tokens para fácil manutenção e theming consistente

**Execution Score:** 10/10 | **Anti-Bug Score:** 10/10

```css
/* tokens/global.css (Layer 1: Primitives) */
@theme {
  /* Primitive colors - raw values */
  --color-blue-50: oklch(0.97 0.01 250);
  --color-blue-500: oklch(0.55 0.22 250);
  --color-blue-900: oklch(0.25 0.15 250);

  /* Primitive spacing */
  --spacing-1: 0.25rem;
  --spacing-4: 1rem;
}

/* tokens/semantic.css (Layer 2: Semantic) */
@theme {
  /* Semantic tokens - meaning-based */
  --color-text-primary: var(--color-blue-900);
  --color-text-secondary: var(--color-blue-500);
  --color-background-base: var(--color-blue-50);

  --spacing-input-padding: var(--spacing-4);
}

/* tokens/component.css (Layer 3: Component-specific) */
@theme {
  /* Component tokens - specific contexts */
  --button-primary-background-default: var(--color-blue-500);
  --button-primary-background-hover: var(--color-blue-900);
  --button-padding-x: var(--spacing-input-padding);
}
```

**Tailwind v4 Usage:**

```typescript
// components/button.tsx
<button className="bg-[var(--button-primary-background-default)] hover:bg-[var(--button-primary-background-hover)]">
  Click me
</button>
```

**Bugs Eliminated:**

- [x] Hardcoded values espalhados pelo código
- [x] Inconsistência de cores/spacing entre componentes
- [x] Dark mode frágil (valores duplicados)
- [x] Difícil manutenção de tema

**Why It Works:**

- Separação de responsabilidades clara
- Facilita theming e dark mode
- W3C DTCG compliant (exportável para Figma/iOS/Android)
- OKLCH garante contraste perceptual consistente

---

### Pattern 3: Server Components First (Next.js App Router)

**Purpose:** Maximizar performance com Server Components, minimizar JavaScript client-side

**Execution Score:** 9/10 | **Anti-Bug Score:** 8/10

```typescript
// ✅ GOOD: Server Component (default)
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData() // Server-side, sem waterfall

  return (
    <div>
      <h1>{data.title}</h1>
      <ClientChart data={data.metrics} /> {/* Client component quando necessário */}
    </div>
  )
}

// components/client-chart.tsx
'use client' // ONLY quando necessário (interatividade, hooks, etc)

export function ClientChart({ data }: Props) {
  const [selected, setSelected] = useState(null)

  return <Chart data={data} onClick={setSelected} />
}

// ❌ BAD: Client component desnecessário
'use client'

export default function DashboardPage() { // Deveria ser Server Component
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data').then(setData) // Client-side waterfall
  }, [])

  return <div>{data?.title}</div>
}
```

**Bugs Eliminated:**

- [x] Waterfalls de loading (suspense + server components = paralelo)
- [x] Bundle bloat client-side
- [x] Hydration mismatches
- [x] Duplicação de data fetching

**Why It Works:**

- Server Components = zero JavaScript no client
- Suspense boundaries = loading states automáticos
- Streaming HTML = FCP/LCP otimizado

---

## Project Structure

### Estrutura Recomendada (Next.js App Router + Tailwind v4)

```
/project-root
  /app                          # Next.js App Router
    /dashboard                  # Route groups
      /page.tsx                 # Server Component (default)
      /layout.tsx               # Shared layout
      /loading.tsx              # Suspense fallback
      /error.tsx                # Error boundary
    /api                        # API routes
  /components                   # Shared components
    /ui                         # shadcn/ui components (copy-paste ownership)
      /button.tsx               # Base UI primitives
      /dialog.tsx
    /dashboard                  # Feature-specific components
      /metrics-card.tsx
  /lib                          # Utilities
    /utils.ts                   # cn, formatters, etc
    /api.ts                     # API client
  /hooks                        # Custom hooks
  /styles                       # Global styles
    /globals.css                # Tailwind directives + @theme
    /tokens                     # Design tokens (v4)
      /primitives.css           # Layer 1
      /semantic.css             # Layer 2
      /components.css           # Layer 3
  /public                       # Static assets
  /tests                        # E2E, integration, unit
    /e2e                        # Playwright
    /unit                       # Vitest/Jest
  tailwind.config.ts            # Tailwind v3 (if not migrated to v4)
  postcss.config.js             # PostCSS (v4 needs separate package)
  components.json               # shadcn/ui config
```

### Structure Rationale

- **`/app`:** Next.js App Router - Server Components by default, file-based routing
- **`/components/ui`:** shadcn/ui ownership - você controla o código, não é dependency
- **`/styles/tokens`:** Design tokens em camadas para Tailwind v4
- **`/tests/e2e`:** Playwright para visual regression e E2E
- **`/lib`:** Utilities compartilhadas (cn, API client, formatters)

---

## Tech Stack

| Category              | Technology                       | Version   | Purpose                                      |
| --------------------- | -------------------------------- | --------- | -------------------------------------------- |
| Framework             | Next.js                          | ^14.0.0   | React framework com App Router e RSC         |
| UI Library            | React                            | ^19.0.0   | Component library                            |
| Language              | TypeScript                       | ^5.0.0    | Type safety (strict mode)                    |
| Styling               | Tailwind CSS                     | ^4.0.0    | Utility-first CSS (v4 CSS-first config)      |
| UI Components         | shadcn/ui + Radix UI             | latest    | Accessible primitives (copy-paste ownership) |
| State Management      | Zustand                          | ^5.0.0    | Minimal global state                         |
| Data Fetching         | SWR / TanStack Query             | latest    | Real-time, cache, revalidation               |
| Forms                 | React Hook Form                  | ^7.0.0    | Performant forms                             |
| Validation            | Zod                              | ^3.0.0    | Schema validation                            |
| Testing (Unit)        | Vitest                           | latest    | Fast unit tests                              |
| Testing (E2E)         | Playwright                       | latest    | E2E + visual regression                      |
| Linting               | ESLint                           | ^9.0.0    | Code quality                                 |
| Formatting            | Prettier + tailwind plugin       | latest    | Code formatting + class ordering             |
| Pre-commit            | Husky + lint-staged              | latest    | Quality gates                                |
| CI/CD                 | GitHub Actions                   | -         | Automated testing + deployment               |
| Documentation         | Storybook (optional)             | ^8.0.0    | Component documentation                      |
| Visual Regression     | Chromatic / Lost Pixel (optional)| latest    | Visual testing                               |

### Required Dependencies

```bash
# Core dependencies
npm install next@latest react@latest react-dom@latest
npm install typescript @types/node @types/react @types/react-dom
npm install tailwindcss@next postcss autoprefixer # v4
npm install class-variance-authority clsx tailwind-merge
npm install zustand swr
npm install react-hook-form zod @hookform/resolvers
npm install @radix-ui/react-* # shadcn/ui dependencies

# Dev dependencies
npm install -D eslint eslint-config-next
npm install -D prettier prettier-plugin-tailwindcss
npm install -D husky lint-staged
npm install -D @playwright/test
npm install -D vitest @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom
```

### shadcn/ui Setup

```bash
npx shadcn@latest init
npx shadcn@latest add button dialog input # etc
```

---

## Coding Standards

### Naming Conventions

| Element              | Convention              | Example                       |
| -------------------- | ----------------------- | ----------------------------- |
| Files                | kebab-case              | `metrics-card.tsx`            |
| Components           | PascalCase              | `MetricsCard`                 |
| Hooks                | camelCase with `use`    | `useMetrics`                  |
| Functions            | camelCase               | `calculateTotal`              |
| Constants            | SCREAMING_SNAKE_CASE    | `MAX_RETRIES`                 |
| Types/Interfaces     | PascalCase              | `MetricsCardProps`            |
| CSS Variables (v4)   | kebab-case with prefix  | `--color-text-primary`        |
| Tailwind arbitrary   | kebab-case              | `[var(--my-custom-value)]`    |

### Critical Rules (Anti-Alucinação + Qualidade)

1. **NUNCA invente arquivos/rotas/APIs**
   - Sempre referencie código existente com caminho + símbolo + localização
   - Se não existe, diga "não encontrado no repo, seria necessário criar X em Y"

2. **Tailwind v3 vs v4 - Detecte antes de modificar**
   - v3: `tailwind.config.ts` + `@tailwind base/components/utilities`
   - v4: CSS-first config com `@import "tailwindcss"` e `@theme { ... }`
   - Renomes críticos v4: `outline-none` → `outline-hidden`, ajustes de ring, etc
   - **NÃO assuma** v4 se config JS existir

3. **Design Tokens - 3 camadas obrigatórias**
   - Layer 1 (Primitives): valores raw (blue/500, spacing/4)
   - Layer 2 (Semantic): significado (text-primary, spacing-input)
   - Layer 3 (Component): contexto (button-primary-bg-default)
   - **NÃO hardcode** cores/spacing fora do sistema de tokens

4. **shadcn/ui - Ownership total**
   - Componentes copiados para `/components/ui`
   - Você controla o código, não é dependency
   - Manutenção manual de updates
   - Sempre use `forwardRef` + `data-state` + composição Radix

5. **Acessibilidade - Não negociável**
   - `focus-visible` em todos interativos (NUNCA `outline-none` sem substituição)
   - `sr-only` em botões com ícone
   - Labels e aria quando necessário
   - Teclado navigation em dialogs/menus

6. **Performance - Core Web Vitals**
   - Server Components first (App Router)
   - Dynamic imports para non-critical
   - Next Image com sizes apropriados
   - Suspense boundaries para loading states

7. **Classes Tailwind - Organização**
   - Usar `cn()` com `twMerge` para evitar conflitos
   - prettier-plugin-tailwindcss para ordenação automática
   - `cva` para variantes type-safe
   - **NÃO** overuse de arbitrary values `[...]` - criar tokens semânticos

8. **@apply - Usar com moderação**
   - Apenas quando há padrão reutilizável (3+ ocorrências)
   - Apenas em componentes do Design System
   - **NÃO** usar apenas para "limpar código"

### Code Examples

#### GOOD Example - Componente com Evidência

```typescript
// ✅ GOOD: Button component following all rules
// components/ui/button.tsx

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// cva para variantes type-safe
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// forwardRef para composição
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))} // cn resolve conflitos
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

**Por que está GOOD:**
- ✅ `cva` para variantes type-safe
- ✅ `cn` para resolver conflitos de classes
- ✅ `forwardRef` para composição
- ✅ `focus-visible:outline-hidden` + ring (acessibilidade)
- ✅ `disabled:pointer-events-none disabled:opacity-50` (UX)
- ✅ Semantic tokens (`bg-primary`, não `bg-blue-500`)

---

#### BAD Example - Anti-patterns

```typescript
// ❌ BAD: Múltiplos anti-patterns
// components/bad-button.tsx

import React from 'react'

// ❌ 1. Sem cva (variantes inline frágeis)
// ❌ 2. Sem forwardRef (não compõe)
// ❌ 3. Hardcoded colors (não usa tokens)
// ❌ 4. outline-none sem substituição (a11y quebrada)
// ❌ 5. Conflitos de classes (p-2 p-4)
export function BadButton({ variant, children, ...props }) { // ❌ 6. Sem tipos
  const isPrimary = variant === 'primary'

  return (
    <button
      className={`
        p-2 px-4 p-4 // ❌ Conflito: p-2 e p-4
        rounded
        outline-none // ❌ A11y quebrada
        ${isPrimary ? 'bg-blue-500' : 'bg-gray-500'} // ❌ Hardcoded, sem tokens
        ${isPrimary ? 'text-white' : 'text-black'}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Por que está BAD:**
- ❌ Sem `cva` - variantes frágeis e sem type-safety
- ❌ Sem `forwardRef` - não compõe com Radix/outros
- ❌ `outline-none` sem substituição - foco invisível (WCAG fail)
- ❌ Hardcoded `bg-blue-500` - deveria ser token semântico
- ❌ Conflitos de classes (`p-2 p-4`) - deveria usar `cn`
- ❌ Sem tipos TypeScript - prop errors em runtime

---

## Testing Strategy

### Test Pyramid

```
         /\
        /E2E\           10% - Playwright (user journeys críticos)
       /------\
      /Integration\     20% - Vitest (componentes + hooks + API)
     /------------\
    /  Unit Tests  \    70% - Vitest (utils, helpers, pure functions)
   /----------------\
```

### What to Test

#### Always Test (Critical)

- [x] **Utils e helpers** - Pure functions (cn, formatters, validators)
- [x] **Business logic** - Cálculos, transformações, regras de negócio
- [x] **Hooks** - Custom hooks com lógica complexa
- [x] **API integration** - Mocked API calls, error handling
- [x] **Accessibility** - Focus trap, keyboard navigation, aria
- [x] **User journeys críticos** - Login, checkout, onboarding (E2E)

#### Consider Testing

- [x] **Componentes complexos** - Formulários, data tables, wizards
- [x] **State management** - Zustand stores com lógica
- [x] **Responsive behavior** - Breakpoints críticos
- [x] **Dark mode** - Token switching

#### Never Test (Waste of Time)

- [ ] **Shadcn/ui primitives** - Já testados upstream (Button, Dialog, etc)
- [ ] **Tailwind classes** - Confiança no framework
- [ ] **Type definitions** - TypeScript já valida
- [ ] **Simple presentational components** - Apenas rendering (use Storybook)

### Test File Template

```typescript
// button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should have focus-visible styles', async () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')

    await userEvent.tab() // Simula tab para foco
    expect(button).toHaveFocus()
    // Visual regression test would verify ring appearance
  })
})
```

---

## Accessibility (WCAG 2.2)

### Focus Management

```typescript
// ✅ GOOD: Focus-visible com ring
<button className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring">
  Submit
</button>

// ❌ BAD: outline-none sem substituição
<button className="outline-none">
  Submit
</button>
```

### Screen Reader Support

```typescript
// ✅ GOOD: Icon button com sr-only label
<button className="h-10 w-10">
  <span className="sr-only">Close dialog</span>
  <X className="h-4 w-4" />
</button>

// ❌ BAD: Icon button sem label
<button className="h-10 w-10">
  <X className="h-4 w-4" />
</button>
```

### ARIA quando necessário

```typescript
// ✅ GOOD: Dialog com aria
<div role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm action</h2>
  <p id="dialog-desc">Are you sure?</p>
</div>
```

### Keyboard Navigation

```typescript
// ✅ GOOD: Menu com keyboard support (via Radix)
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

<DropdownMenu.Root>
  <DropdownMenu.Trigger>Menu</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={() => console.log('Item 1')}>
      Item 1
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

---

## Performance Guidelines

### Do's

- [x] **Server Components first** - Minimize `'use client'`
- [x] **Dynamic imports** - Code splitting para non-critical
- [x] **Next Image** - Sempre com `width`, `height`, `sizes`
- [x] **Suspense boundaries** - Loading states automáticos
- [x] **Memoization** - Apenas quando profiling mostrar necessidade
- [x] **CSS optimization** - Purge unused classes (Tailwind faz automaticamente)
- [x] **Font optimization** - `next/font` para local fonts

### Don'ts

- [ ] **`'use client'` desnecessário** - Não force client-side sem razão
- [ ] **useEffect para data fetching** - Use SWR/TanStack Query
- [ ] **Inline functions em props** - Causa re-renders (use useCallback apenas se necessário)
- [ ] **Massive dependencies** - Evite bibliotecas pesadas (moment.js → date-fns)
- [ ] **CSS-in-JS runtime** - Evite styled-components (prefira Tailwind)

---

## Error Handling

### Error Boundary Pattern (Next.js App Router)

```typescript
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Try again
      </button>
    </div>
  )
}
```

### API Error Handling

```typescript
// lib/api.ts
export async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}
```

---

## Auditoria Checklist (Para Projetos Existentes)

### 1. Descoberta Automática

```bash
# Identificar stack
cat package.json | grep -E "(next|react|tailwind)"

# Detectar Tailwind version
cat tailwind.config.* # v3: JS config
grep "@import \"tailwindcss\"" styles/*.css # v4: CSS-first

# Verificar shadcn/ui
cat components.json
ls components/ui/
```

### 2. Auditoria por Categoria

#### A) Tailwind CSS

- [ ] Versão detectada (v3 vs v4)
- [ ] Conflitos de classes (`p-2 p-3` → usar `cn`)
- [ ] Overuse de arbitrary values (`[...]`)
- [ ] Classes ordenadas (prettier-plugin-tailwindcss instalado?)
- [ ] `@apply` usado com moderação

#### B) Design Tokens

- [ ] Sistema de tokens existe? (CSS vars, theme files, tokens.json)
- [ ] Hierarquia em 3 camadas (Primitives → Semantic → Component)
- [ ] Dark mode suportado via tokens semânticos
- [ ] Contrastes validados (mínimo 3:1 em estados)

#### C) shadcn/ui + Radix

- [ ] Componentes em `/components/ui`
- [ ] `forwardRef` usado consistentemente
- [ ] `data-state` presente (Radix)
- [ ] Integração com tema (CSS vars)

#### D) Acessibilidade

- [ ] `focus-visible` em todos interativos
- [ ] `sr-only` em botões com ícone
- [ ] Labels e aria quando necessário
- [ ] Keyboard navigation em dialogs/menus

#### E) Performance

- [ ] Server Components usados quando possível
- [ ] `'use client'` apenas quando necessário
- [ ] Dynamic imports para non-critical
- [ ] Next Image com `sizes`

#### F) Tooling

- [ ] Prettier + prettier-plugin-tailwindcss instalado
- [ ] ESLint configurado
- [ ] Husky + lint-staged (pre-commit hooks)
- [ ] CI/CD com testes

---

## Integration with AIOS

### Recommended Workflow

1. **Planning Phase:**
   - Use `@architect *create-doc architecture` com este preset
   - Especificar Tailwind version (v3 ou v4)
   - Definir design tokens (3 camadas)

2. **Development Phase:**
   - Use `@dev` seguindo os patterns deste preset
   - Sempre referenciar código existente (anti-alucinação)
   - Validar acessibilidade em cada componente

3. **QA Phase:**
   - Use `@qa *review-story` com checklist deste preset
   - Executar audits de performance (Core Web Vitals)
   - Validar WCAG 2.2 compliance

4. **Auditoria de Projeto Existente:**
   - Executar discovery automática
   - Aplicar auditoria checklist (seção acima)
   - Gerar relatório de recomendações priorizadas

### Related AIOS Templates

- `front-end-architecture-tmpl.yaml` - Use para arquitetura frontend
- `prd-tmpl.yaml` - Use para PRD com requisitos de acessibilidade/performance
- `story-tmpl.yaml` - Use para stories com acceptance criteria de qualidade

### Comandos Úteis

```bash
# Criar PRD com este preset
@pm *create-doc prd --preset frontend-audit-2025

# Criar arquitetura frontend com este preset
@architect *create-doc front-end-architecture --preset frontend-audit-2025

# Auditar projeto existente
@architect *analyze-project-structure --preset frontend-audit-2025
```

---

## Changelog

| Date       | Version | Changes                                              |
| ---------- | ------- | ---------------------------------------------------- |
| 2026-02-13 | 1.0.0   | Initial version - Frontend Audit & Quality 2025      |

---

_AIOS Tech Preset - Created with Synkra AIOS Framework_
_CLI First | Observability Second | UI Third_
