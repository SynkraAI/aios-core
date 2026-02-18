# Atomic Design Refactoring Execute

> Task ID: atomic-refactor-execute
> Agent: Brad Frost (Design System)
> Version: 2.0.0
>
> **ATUALIZADO Jan/2026:** Adicionados gates anti-over-engineering.

## ⛔ GATES OBRIGATÓRIOS (LER PRIMEIRO)

### GATE 0: Devo Atomizar?
```bash
wc -l {arquivo}
# Se <500 → NÃO atomize, apenas organize inline
```

### GATE 1: Antes de Cada Hook
```
PERGUNTA: Esse hook será usado em OUTRO componente?
SE NÃO → não crie o hook, mantenha useState inline
```

### GATE 2: Validação Final
```bash
find {pasta-criada} -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
# Se linhas_depois > linhas_antes → FALHA, simplificar
```

## Description

Executes Atomic Design refactoring on a single component, decomposing a monolithic template into types, hooks, atoms, molecules, organisms, and an orchestrating template.

**IMPORTANTE:** Apenas criar hooks que serão REUSADOS. useState específicos devem ficar inline.

## Prerequisites

- Target component identified (e.g., `CoursesTemplate.tsx`)
- Reference pattern exists (e.g., `app/components/ops/users/`)
- Shared components available in `app/components/shared/` (if needed)

## Workflow

### Interactive Elicitation

1. **Select Target Component**
   - Component file path
   - Confirm line count and complexity

2. **Review Current Structure**
   - List `useState` hooks (→ custom hooks)
   - List `render{X}()` functions (→ organisms)
   - Identify UI patterns (→ molecules)
   - Identify small UI elements (→ atoms)

3. **Confirm Output Structure**
   - Target folder path
   - File naming conventions
   - Dependencies on shared components

### Steps

1. **Analyze Component**
   - Read entire file
   - Extract all `useState` declarations
   - Extract all `render{X}()` functions
   - Identify JSX patterns repeated 2+ times
   - Validation: Analysis complete, patterns identified

2. **Create Folder Structure**
   ```
   {domain}/{component-name}/
   ├── types.ts
   ├── index.ts
   ├── {ComponentName}Template.tsx
   ├── hooks/
   │   └── index.ts
   ├── atoms/
   │   └── index.ts (if needed)
   ├── molecules/
   │   └── index.ts
   └── organisms/
       └── index.ts
   ```
   - Validation: Directory structure created

3. **Extract Types**
   - Create `types.ts` with all interfaces
   - Include prop types for all sub-components
   - Add type exports
   - Validation: TypeScript compiles

4. **Extract Hooks** ⚠️ GATE 1
   - **ANTES de criar cada hook:** Esse hook será usado em OUTRO componente?
   - Se NÃO → **NÃO CRIE**, mantenha useState inline com comentários
   - Group related `useState` into custom hooks **APENAS SE REUSÁVEIS**
   - Pattern: `use{Domain}{Feature}` (e.g., `useCoursesFilters`)
   - Each hook handles one concern
   - Export from `hooks/index.ts`
   - Validation: Hooks compile, no circular deps, **0 hooks órfãos**

5. **Extract Atoms** (if needed)
   - Small, stateless UI elements
   - Examples: Avatar, Badge, Icon wrapper
   - Only if not already in `shared/atoms/`
   - Validation: Atoms render correctly

6. **Extract Molecules**
   - Combinations of atoms/primitives
   - Examples: SearchInput, StatCard, AlertMessage
   - Check shared/ first before creating
   - Validation: Molecules render correctly

7. **Extract Organisms**
   - One organism per `render{X}()` function
   - Named `{X}View.tsx` or `{X}Section.tsx`
   - Receives props, renders molecules
   - Export from `organisms/index.ts`
   - Validation: Organisms render correctly

8. **Create Template Orchestrator**
   - Main component, ~100-200 lines max
   - Imports and uses all hooks
   - Renders organisms in layout
   - Handles top-level state coordination
   - Validation: Full component renders

9. **Update Imports**
   - Update any files importing the old component
   - Change from direct import to folder import
   - Validation: No broken imports

10. **Verify TypeScript**
    - Run `npx tsc --noEmit`
    - Fix any type errors
    - Validation: Zero TypeScript errors

11. **Update Documentation**
    - Mark component as done in ROADMAP.md
    - Update file count in status
    - Validation: Documentation updated

## Output

For a component like `CoursesTemplate.tsx` (1,987 lines):

```
app/components/creator/courses/
├── types.ts                    # ~80 lines
├── index.ts                    # ~5 lines
├── CoursesTemplate.tsx         # ~150 lines ✨
├── hooks/
│   ├── index.ts
│   ├── useCoursesData.ts       # ~60 lines
│   ├── useCoursesFilters.ts    # ~40 lines
│   ├── useNewCourseForm.ts     # ~80 lines
│   └── useCoursePipeline.ts    # ~50 lines
├── molecules/
│   ├── index.ts
│   ├── CourseCard.tsx          # ~80 lines
│   ├── PipelineStepBadge.tsx   # ~40 lines
│   └── CourseStatusBadge.tsx   # ~35 lines
└── organisms/
    ├── index.ts
    ├── CoursesHeader.tsx       # ~60 lines
    ├── CoursesListView.tsx     # ~120 lines
    ├── CourseDetailView.tsx    # ~150 lines
    ├── NewCourseView.tsx       # ~180 lines
    ├── BriefEditorView.tsx     # ~200 lines
    └── PipelineView.tsx        # ~140 lines
```

**Result**: 1,987 lines → 17 files, each <200 lines

## Success Criteria

### ⛔ GATE 2 (Obrigatório)
- [ ] **Linhas totais ≤ original** (se aumentou → simplificar)
- [ ] **≤7 arquivos criados** (se mais → consolidar)
- [ ] **0 hooks órfãos** (se tem → mover inline)

### Demais Critérios
- [ ] useState reusáveis extraídos para hooks (específicos ficam inline)
- [ ] All `render{X}()` extracted to organisms
- [ ] Repeated UI patterns extracted to molecules
- [ ] Template orchestrator <200 lines
- [ ] Each file <200 lines
- [ ] `npx tsc --noEmit` passes
- [ ] Component renders correctly in browser
- [ ] ROADMAP.md updated

## Error Handling

- **Circular dependency**: Restructure imports, use type-only imports
- **Missing shared component**: Add to SHARED_REQUESTS.md, wait for Agent 3
- **Type errors**: Fix before proceeding, don't leave broken code
- **Component breaks UI**: Revert and analyze, don't commit broken code

## Reference Pattern

Always refer to `app/components/ops/users/` as the canonical example:

```
ops/users/
├── types.ts              # Types, configs, constants
├── index.ts              # Barrel export
├── OpsUsersTemplate.tsx  # Orchestrator (~195 lines)
├── hooks/
│   ├── index.ts
│   ├── useUsersData.ts
│   ├── useLinkMindDialog.ts
│   ├── useCreateUserDialog.ts
│   └── useRoleDialog.ts
├── molecules/
│   ├── index.ts
│   ├── SearchInput.tsx
│   ├── StatCard.tsx
│   ├── AlertMessage.tsx
│   ├── RoleBadge.tsx
│   └── AreasTags.tsx
└── organisms/
    ├── index.ts
    ├── UsersPageHeader.tsx
    ├── UsersStatsGrid.tsx
    ├── UsersTable.tsx
    ├── UserTableRow.tsx
    ├── LinkMindDialog.tsx
    ├── CreateUserDialog.tsx
    ├── RoleDialog.tsx
    └── PendingInvitesSection.tsx
```

## Extraction Rules

### useState → Custom Hook

```typescript
// BEFORE (in template)
const [search, setSearch] = useState('');
const [filters, setFilters] = useState<Filters>({});
const filteredData = useMemo(() => ..., [data, search, filters]);

// AFTER (in hooks/useFilters.ts)
export function useFilters(data: Item[]) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({});

  const filteredData = useMemo(() => ..., [data, search, filters]);

  return { search, setSearch, filters, setFilters, filteredData };
}
```

### render{X}() → Organism

```typescript
// BEFORE (in template)
const renderHeader = () => (
  <div className="flex justify-between">
    <h1>Title</h1>
    <Button onClick={onCreate}>New</Button>
  </div>
);

// AFTER (in organisms/Header.tsx)
interface HeaderProps {
  title: string;
  onCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onCreate }) => (
  <div className="flex justify-between">
    <h1>{title}</h1>
    <Button onClick={onCreate}>New</Button>
  </div>
);
```

### Repeated JSX → Molecule

```typescript
// BEFORE (repeated 3+ times in template)
<div className="flex items-center gap-2 rounded-lg border p-4">
  <Icon name={icon} />
  <span>{label}</span>
  <span className="text-muted-foreground">{value}</span>
</div>

// AFTER (in molecules/StatCard.tsx)
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-lg border p-4">
    <Icon name={icon} />
    <span>{label}</span>
    <span className="text-muted-foreground">{value}</span>
  </div>
);
```

## Examples

### Example 1: Refactor Single Component

```bash
/atomic-refactor-execute app/components/creator/templates/CoursesTemplate.tsx
```

Output:
```
🔍 Uma: Analyzing CoursesTemplate.tsx...

📊 Analysis Results:
  Total lines: 1,987
  useState hooks: 14 (→ 4 custom hooks)
  render functions: 8 (→ 8 organisms)
  UI patterns: 3 (→ 3 molecules)

📁 Creating structure: app/components/creator/courses/

✓ Created types.ts (82 lines)
✓ Created hooks/useCoursesData.ts (64 lines)
✓ Created hooks/useCoursesFilters.ts (38 lines)
✓ Created hooks/useNewCourseForm.ts (76 lines)
✓ Created hooks/useCoursePipeline.ts (52 lines)
✓ Created molecules/CourseCard.tsx (78 lines)
✓ Created molecules/PipelineStepBadge.tsx (42 lines)
✓ Created molecules/CourseStatusBadge.tsx (36 lines)
✓ Created organisms/CoursesHeader.tsx (58 lines)
✓ Created organisms/CoursesListView.tsx (118 lines)
✓ Created organisms/CourseDetailView.tsx (146 lines)
✓ Created organisms/NewCourseView.tsx (178 lines)
✓ Created organisms/BriefEditorView.tsx (196 lines)
✓ Created organisms/PipelineView.tsx (138 lines)
✓ Created CoursesTemplate.tsx (148 lines)
✓ Created index.ts (5 lines)

🧪 TypeScript check...
  ✓ npx tsc --noEmit: 0 errors

📝 Updated docs/refactoring/COMPONENT_REFACTORING_ROADMAP.md

📊 Summary:
  Before: 1 file, 1,987 lines
  After: 17 files, max 196 lines each
  Reduction: 90% in main file

✅ Refactoring complete!

Uma says: "Clean architecture is not optional."
```

## Notes

- Always read the full component before starting
- Check shared/ for existing molecules before creating new ones
- Keep orchestrator focused on composition, not business logic
- Each file should have a single responsibility
- Commit after each successful component refactoring
- Test in browser before marking as done
