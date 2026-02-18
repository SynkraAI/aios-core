# Compose Molecule from Atoms

> Task ID: atlas-compose-molecule
> Agent: Atlas (Design System Builder)
> Version: 1.0.0

## Description

Build molecule component by composing existing atoms following Atomic Design methodology. Examples: FormField (Label + Input), Card (Heading + Text + Button), SearchBar (Input + Button).

## Prerequisites

- Setup completed
- Atom components exist (dependencies)
- Tokens loaded

## Workflow

### Steps

1. **Validate Atom Dependencies** - Check required atoms exist
2. **Generate Molecule Component** - Compose atoms with molecule logic
3. **Generate Molecule Styles** - Molecule-specific layout and spacing
4. **Generate Tests** - Test molecule composition and interactions
5. **Generate Stories** - Show molecule with different atom combinations
6. **Generate Documentation** - Document composed structure
7. **Update Index** - Export molecule
8. **Update State** - Track molecule built

## Output

- Molecule component (TypeScript)
- Molecule styles (CSS Modules)
- Tests (>80% coverage)
- Stories (optional)
- Documentation

## Success Criteria

- [ ] All atom dependencies imported correctly
- [ ] Molecule composes atoms (not reimplements)
- [ ] Molecule-specific logic isolated
- [ ] Tests cover atom interactions
- [ ] Accessible (WCAG AA)

## Example

```typescript
// FormField.tsx (molecule)
import { Label } from '../atoms/Label';
import { Input, InputProps } from '../atoms/Input';
import { HelperText } from '../atoms/HelperText';

export interface FormFieldProps extends InputProps {
  label: string;
  helperText?: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  error,
  ...inputProps
}) => {
  return (
    <div className={styles.formField}>
      <Label htmlFor={inputProps.id}>{label}</Label>
      <Input {...inputProps} error={!!error} />
      {error && <HelperText variant="error">{error}</HelperText>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </div>
  );
};
```

## Notes

- Molecules compose atoms, don't reimplement
- Molecule adds composition logic only
- Atoms remain independent and reusable
- Test atom interactions in molecule context

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design tokens** — Platform-agnostic key-value pairs encoding design decisions (colors, spacing, typography)
- **Pattern consolidation** — Merging similar UI patterns to reduce redundancy
- **Greenfield** — Starting from scratch; **Brownfield** — Integrating into existing codebase
- **State file (.state.yaml)** — Progress tracking file for audit/extraction state
- **Component API** — Props interface defining how a component is consumed

---

## Don't Do

- Do not skip the consolidation phase — extracting tokens from unconsolidated patterns produces duplicates
- Do not create tokens with descriptive names (blue-500) instead of semantic names (primary)
- Do not hardcode values in components when a token exists — always reference the token
- Do not modify .state.yaml manually — let the task update it programmatically
- Do not assume greenfield when the codebase has existing styles — check for brownfield indicators first

