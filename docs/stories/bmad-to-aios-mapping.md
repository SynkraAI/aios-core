# BMad to AIOS Mapping Document

## Overview
This document provides a comprehensive mapping of all "bmad" references that need to be updated to "aios" for complete rebranding.

## Mapping Categories

### 1. Agent Names
- `bmad-orchestrator` → `aios-orchestrator`
- `bmad-master` → `aios-master`
- `BMad Orchestrator` → `AIOS Orchestrator`
- `BMad Master` → `AIOS Master`

### 2. Directory Names
- `.aios-core/` → `.aios-core/` (hidden installation directory)
- `aios-core/` → `aios-core/` (main directory - COMPLETED)

### 3. Package/Module Names
- `aios-fullstack` → `aios-fullstack` (COMPLETED)
- `bmad` (npm package) → `aios`

### 4. CLI Commands/Files
- `bmad.js` → `aios.js` (in tools/installer/bin/)
- `bmad-npx-wrapper.js` → `aios-npx-wrapper.js`
- `bmad` command → `aios` command

### 5. Configuration Files
- References to "bmad" in YAML configs
- IDE configuration references

### 6. Knowledge Base References
- `bmad-kb.md` → `aios-kb.md`
- "BMad knowledge base" → "AIOS knowledge base"

### 7. Team/Author References
- "BMad Team" → "AIOS Team"
- "Brian (BMad) Madison" → Keep as is (personal name)

### 8. Expansion Pack Names
- `bmad-infrastructure-devops` → `aios-infrastructure-devops`
- `bmad-2d-unity-game-dev` → `aios-2d-unity-game-dev`
- `bmad-2d-phaser-game-dev` → `aios-2d-phaser-game-dev`

### 9. Documentation/Comments
- "BMad Method" → "AIOS Method" or "AIOS-FULLSTACK"
- "AIOS-Method" → "AIOS-FULLSTACK"
- "BMad framework" → "AIOS framework"

### 10. Web Builder References
- "AIOS-Method framework" in web-builder.js
- Template references in web agent instructions

## Files Requiring Updates (Priority Order)

### High Priority (Core Functionality)
1. `tools/installer/bin/bmad.js` - Rename file and update internal references
2. `tools/bmad-npx-wrapper.js` - Rename and update
3. `tools/installer/lib/installer.js` - Update .aios-core references
4. `aios-core/agents/bmad-orchestrator.md` - Rename and update content
5. `aios-core/agents/bmad-master.md` - Rename and update content

### Medium Priority (Configuration/Data)
6. `tools/installer/config/install.config.yaml`
7. `aios-core/data/bmad-kb.md` - Rename file
8. Various YAML configuration files

### Low Priority (Expansion Packs)
9. All expansion pack directories and configs
10. Build artifacts in dist/

## Implementation Notes

1. **Backward Compatibility**: 
   - Keep `bmad` as an alias in package.json bin section
   - Create deprecation wrapper for old commands

2. **Git Operations**:
   - Use `git mv` for file renames to preserve history
   - Update file contents after renaming

3. **Testing**:
   - Run validation after each major change
   - Test backward compatibility wrappers

4. **Order of Operations**:
   - Start with core files that affect functionality
   - Move to configuration and data files
   - End with expansion packs and documentation

## Excluded Items
- Personal name references (e.g., "Brian (BMad) Madison")
- Historical commit messages
- Third-party documentation that references BMad

## Next Steps
This mapping should be used to create Story 1.2 for completing the full "bmad" to "aios" transition.