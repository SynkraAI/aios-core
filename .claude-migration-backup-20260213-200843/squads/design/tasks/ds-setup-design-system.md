# Setup Design System Structure

> Task ID: atlas-setup-design-system
> Agent: Atlas (Design System Builder)
> Version: 1.0.0

## Description

Initialize design system structure for greenfield or brownfield projects. Loads tokens from Brad's .state.yaml or prompts for manual setup. Creates directory structure, validates tokens, prepares for component generation.

## Prerequisites

- Node.js and npm installed (for React/TypeScript components)
- Either: Brad's .state.yaml with tokens OR manual token files
- Project has package.json (or Atlas will create one)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure setup.

1. **Detect Starting Point**
   - Check for Brad's .state.yaml (brownfield from audit)
   - If not found, ask for greenfield setup
   - Confirm which approach to use

2. **Load or Create Tokens**
   - Brownfield: Load tokens from Brad's state
   - Greenfield: Ask for tokens.yaml location or create template
   - Validate token schema

3. **Configure Project Structure**
   - Ask for component output directory (default: src/design-system)
   - CSS approach (CSS Modules, styled-components, Tailwind)
   - Test framework (Jest default)
   - Storybook (yes/no)

### Steps

1. **Detect Brad's State**
   - Search for .state.yaml in outputs/design-system/
   - If found, validate tokenization phase completed
   - If not found, prepare greenfield setup
   - Validation: Starting point identified

2. **Load Token Data**
   - Brownfield: Read token locations from .state.yaml
   - Greenfield: Prompt for tokens.yaml location
   - Parse and validate token schema
   - Check for required token categories (color, spacing, typography)
   - Validation: Tokens loaded and valid

3. **Create Directory Structure**
   - Create design-system/ root directory
   - Create subdirectories: atoms/, molecules/, organisms/, templates/
   - Create tokens/ directory for token files
   - Create docs/ for pattern library documentation
   - Create __tests__/ for test files
   - Validation: Directory structure created

4. **Copy Token Files**
   - Copy tokens.yaml to design-system/tokens/
   - Copy token exports (JSON, CSS, Tailwind, SCSS)
   - Generate index files for easy imports
   - Validation: Tokens accessible in project

5. **Initialize Package Dependencies**
   - Check for React and TypeScript in package.json
   - Add missing dependencies (if needed)
   - Add testing library dependencies
   - Add Storybook dependencies (if requested)
   - Validation: All dependencies installed

6. **Create Configuration Files**
   - Generate tsconfig.json for design system (if needed)
   - Create jest.config.js for tests
   - Create .storybook/ config (if Storybook enabled)
   - Create design-system.config.yaml for Atlas settings
   - Validation: Configuration files valid

7. **Generate Token Index**
   - Create tokens/index.ts for centralized token imports
   - Export all token categories
   - Add TypeScript types for tokens
   - Validation: Tokens importable from components

8. **Create Base Styles**
   - Generate global.css with token CSS variables
   - Create reset/normalize styles
   - Add base typography styles using tokens
   - Validation: Base styles use tokens

9. **Initialize State Tracking**
   - Create or update .state.yaml for Atlas
   - Record setup configuration
   - Set phase to "setup_complete"
   - Validation: State file created

10. **Generate Setup Report**
    - Create setup-summary.md
    - List all created files and directories
    - Document next steps (build components)
    - Validation: Setup documented

## Output

- **design-system/** directory structure
- **tokens/** with all token files and index
- **docs/** for documentation
- **global.css** with base styles
- **setup-summary.md** with configuration details
- **.state.yaml** updated with Atlas setup data

### Output Format

```yaml
# .state.yaml Atlas setup section
atlas_setup:
  completed_at: "2025-10-27T15:00:00Z"
  starting_point: "brownfield"  # or "greenfield"

  configuration:
    component_directory: "src/design-system"
    css_approach: "css_modules"
    test_framework: "jest"
    storybook_enabled: true

  tokens_loaded:
    source: "Brad tokenization"
    categories:
      - color (12 tokens)
      - spacing (7 tokens)
      - typography (10 tokens)
      - radius (4 tokens)
      - shadow (3 tokens)
    total_tokens: 36
    validation: "passed"

  directory_structure:
    - design-system/atoms/
    - design-system/molecules/
    - design-system/organisms/
    - design-system/templates/
    - design-system/tokens/
    - design-system/docs/
    - design-system/__tests__/

  dependencies_added:
    - "@testing-library/react"
    - "@testing-library/jest-dom"
    - "@storybook/react"

  phase: "setup_complete"
  ready_for: "component_building"
```

## Success Criteria

- [ ] Directory structure follows Atomic Design principles
- [ ] Tokens loaded and validated successfully
- [ ] All token exports accessible (JSON, CSS, etc)
- [ ] Package dependencies installed
- [ ] Configuration files valid and working
- [ ] Base styles generated using tokens
- [ ] State tracking initialized
- [ ] Setup documented clearly

## Error Handling

- **No tokens found**: Offer to create token template or prompt for manual input
- **Invalid token schema**: Report specific errors, suggest fixes
- **Missing dependencies**: Auto-install with npm or prompt user
- **Directory exists**: Ask to overwrite or use different location
- **Invalid project structure**: Warn user, continue with compatible setup

## Security Considerations

- Validate token file paths (no directory traversal)
- Sanitize directory names
- Don't execute code during setup
- Validate package.json before modifying

## Examples

### Example 1: Brownfield Setup (From Brad)

```bash
*setup
```

Output:
```
🏗️ Atlas: Setting up design system structure...

✓ Detected Brad's state: outputs/design-system/my-app/.state.yaml
✓ Loading tokens from Brad's tokenization...
  - 12 color tokens
  - 7 spacing tokens
  - 10 typography tokens
  - Total: 36 tokens validated

📁 Creating directory structure...
  ✓ src/design-system/
  ✓ src/design-system/atoms/
  ✓ src/design-system/molecules/
  ✓ src/design-system/organisms/
  ✓ src/design-system/tokens/

📦 Installing dependencies...
  ✓ @testing-library/react
  ✓ @testing-library/jest-dom
  ✓ @storybook/react (optional)

⚙️ Generating configuration...
  ✓ tokens/index.ts (centralized exports)
  ✓ global.css (base styles)
  ✓ jest.config.js
  ✓ .storybook/main.js

✅ Setup complete!

Next steps:
  1. Build components: *build button
  2. Generate docs: *document
  3. See component list: *help

Atlas says: "Foundation is solid. Ready to build."
```

### Example 2: Greenfield Setup

```bash
*setup
```

Output:
```
🏗️ Atlas: No Brad state found. Starting greenfield setup...

? Token source:
  1. I have tokens.yaml
  2. Create token template
  3. Manual input

User selects 1

? Path to tokens.yaml: ./tokens/tokens.yaml

✓ Tokens loaded and validated (24 tokens)

? Component directory: src/design-system
? CSS approach: CSS Modules
? Enable Storybook? Yes

[...setup continues...]
```

## Notes

- Brownfield setup is faster (tokens from Brad)
- Greenfield requires manual token creation or import
- Atomic Design structure (atoms → molecules → organisms → templates)
- All styling must use tokens (enforced in component generation)
- Storybook is optional but recommended for component showcase
- Atlas automatically creates TypeScript types for tokens
- Base styles include CSS reset and token variables
- Setup can be re-run safely (asks before overwriting)
- Next step after setup: *build {pattern} to generate components
