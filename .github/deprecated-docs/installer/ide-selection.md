# IDE Selection & Configuration

**Story 1.4:** IDE Selection
**Status:** ✅ Implemented
**Last Updated:** 2025-01-21

## Overview

The AIOS installer supports automatic configuration for 6 popular AI-enhanced IDEs. During installation, you can select one or more IDEs, and the installer will generate appropriate configuration files to integrate AIOS agents and workflows.

## Supported IDEs

### 1. Cursor
- **Config File:** `.cursorrules`
- **Format:** Plain text
- **Description:** AI-first code editor with built-in AI assistant
- **Website:** https://cursor.sh

### 2. Windsurf
- **Config File:** `.windsurfrules`
- **Format:** Plain text
- **Description:** AI-powered development environment
- **Website:** https://codeium.com/windsurf

### 3. Trae
- **Config File:** `.trae/config.json`
- **Format:** JSON
- **Description:** Modern AI code editor
- **Requires Directory:** Yes

### 4. Zed
- **Config File:** `.zed/settings.json`
- **Format:** JSON
- **Description:** High-performance multiplayer code editor
- **Website:** https://zed.dev
- **Requires Directory:** Yes

### 5. Antigravity
- **Config File:** `.antigravity.yaml`
- **Format:** YAML
- **Description:** Next-gen AI development tool

### 6. Continue.dev
- **Config File:** `.continue/config.json`
- **Format:** JSON
- **Description:** Open-source autopilot for software development
- **Website:** https://continue.dev
- **Requires Directory:** Yes

## Installation Process

### Step 1: IDE Selection Prompt

During wizard installation, you'll see:

```
? Select IDE(s) for AIOS configuration:
  (Use spacebar to select, enter to confirm)

  ◯ Cursor - AI-first code editor with built-in AI assistant
  ◯ Windsurf - AI-powered development environment
  ◯ Trae - Modern AI code editor
  ◯ Zed - High-performance multiplayer code editor
  ◯ Antigravity - Next-gen AI development tool
  ◯ Continue.dev - Open-source autopilot for software development
```

**Controls:**
- `Space` - Toggle selection
- `↑/↓` - Navigate
- `Enter` - Confirm selection
- `Ctrl+C` - Cancel

**Validation:**
- At least one IDE must be selected
- Multiple selections allowed
- All 6 can be selected simultaneously

### Step 2: Config Generation

After selection, the installer:

1. **Creates directories** (if needed for Trae, Zed, Continue.dev)
2. **Loads templates** from `templates/ide/`
3. **Renders templates** with your project variables:
   - `{{projectName}}` - Your project name
   - `{{projectType}}` - `greenfield` or `brownfield`
   - `{{timestamp}}` - ISO timestamp of generation
   - `{{aiosVersion}}` - AIOS framework version
4. **Validates config** (JSON/YAML syntax check)
5. **Writes files** to project root

### Step 3: Existing File Handling

If a config file already exists, you'll be prompted:

```
? File .cursorrules already exists. What would you like to do?
  > Create backup and overwrite
    Overwrite
    Skip
```

**Options:**
- **Create backup and overwrite** (Recommended) - Creates `.cursorrules.backup.TIMESTAMP`
- **Overwrite** - Replaces existing file
- **Skip** - Keeps existing file, doesn't generate new one

### Step 4: Success Summary

After completion:

```
✅ Created 3 IDE configuration(s):
  - .cursorrules
  - .windsurfrules
  - .trae/config.json

📋 Next Steps:
  1. Open your project in your selected IDE(s)
  2. The IDE should automatically recognize AIOS configuration
  3. Try activating an agent with @agent-name
  4. Use * commands to interact with agents
```

## Configuration Content

All generated configs include:

### 1. Project Context
- Project name and type
- AIOS framework version
- Generation timestamp

### 2. Agent System
- List of available agents (@dev, @qa, @sm, @po, @pm, @architect, @analyst)
- Agent activation syntax (`@agent-name`)
- Command prefix (`*help`, `*draft`, `*validate`, etc.)

### 3. Directory Structure
- `.aios-core/` framework core
- `docs/stories/` user stories
- `docs/architecture/` architecture docs
- `src/` source code
- `tests/` test files

### 4. Development Workflow
- Story-driven development principles
- Template compliance requirements
- Quality gates (CodeRabbit integration)
- Checkbox tracking for progress

### 5. Code Standards
- Clean code principles
- Error handling guidelines
- Test coverage requirements (80%)
- Documentation standards (JSDoc)

### 6. Useful Commands
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run build` - Build project

## Example Configs

### Cursor (.cursorrules)

```
# AIOS Framework Rules for Cursor

## Project Context
This is an AIOS-managed project.
- Project Type: greenfield
- Project Name: my-aios-project
- Framework: AIOS v2.1

## Agent Commands
Agent commands use * prefix:
- *help - Show available agent commands
- *draft - Create new user story
...
```

### Trae (.trae/config.json)

```json
{
  "projectName": "my-aios-project",
  "framework": "AIOS v2.1",
  "projectType": "greenfield",
  "aiAssistant": {
    "enabled": true,
    "agentSystem": {
      "enabled": true,
      "agents": [
        { "id": "dev", "name": "Dex", "role": "Full Stack Developer" },
        ...
      ]
    }
  }
}
```

### Antigravity (.antigravity.yaml)

```yaml
project:
  name: my-aios-project
  type: greenfield
  framework: AIOS v2.1

ai_assistant:
  enabled: true
  agent_system:
    enabled: true
    agents:
      - id: dev
        name: Dex
        role: Full Stack Developer
```

## Customization

### Modifying Templates

Templates are located in `templates/ide/`:

- `cursor.rules` - Cursor template
- `windsurf.rules` - Windsurf template
- `trae-config.json` - Trae template
- `zed-settings.json` - Zed template
- `antigravity.yaml` - Antigravity template
- `continue-config.json` - Continue.dev template

**Template Variables:**
- `{{projectName}}` - Replaced with project name
- `{{projectType}}` - Replaced with `greenfield` or `brownfield`
- `{{timestamp}}` - Replaced with ISO timestamp
- `{{aiosVersion}}` - Replaced with AIOS version

To customize:
1. Edit template files in `templates/ide/`
2. Use `{{variableName}}` for dynamic content
3. Ensure valid format (JSON/YAML syntax for structured configs)
4. Test with `npm test`

### Adding New IDEs

To add support for a new IDE:

1. **Add to `src/config/ide-configs.js`:**
   ```javascript
   newIDE: {
     name: 'New IDE',
     description: 'Description for selection prompt',
     configFile: '.newide/config.json',
     template: 'templates/ide/newide-config.json',
     requiresDirectory: true,
     format: 'json'
   }
   ```

2. **Create template file:**
   ```
   templates/ide/newide-config.json
   ```

3. **Add tests:**
   ```javascript
   // In tests/unit/config/ide-configs.test.js
   expect(IDE_CONFIGS.newIDE).toBeDefined();
   ```

4. **Update documentation** (this file)

## Troubleshooting

### Config Not Recognized by IDE

**Problem:** IDE doesn't recognize AIOS configuration after installation.

**Solutions:**
1. **Restart IDE** - Most IDEs need restart to load new configs
2. **Check file location** - Config must be in project root
3. **Verify format** - JSON/YAML syntax errors prevent loading
4. **Check IDE version** - Ensure IDE supports custom configs
5. **Manual validation:**
   ```bash
   # For JSON configs
   cat .trae/config.json | jq .

   # For YAML configs
   cat .antigravity.yaml | yaml-lint
   ```

### File Permission Errors

**Problem:** `EACCES: permission denied` when writing config files.

**Solutions:**
1. **Check directory permissions:**
   ```bash
   ls -la .
   ```
2. **Fix permissions:**
   ```bash
   chmod u+w .
   ```
3. **Run installer with appropriate user** (avoid sudo unless necessary)

### Template Rendering Errors

**Problem:** Config file contains `{{variableName}}` instead of actual values.

**Solutions:**
1. **Check wizard state** - Ensure `projectName` and `projectType` are set
2. **Verify template syntax** - Variables must use `{{variableName}}` format
3. **Re-run installer:**
   ```bash
   npx aios-installer
   ```

### Backup Files Accumulate

**Problem:** Multiple `.backup.TIMESTAMP` files created.

**Solutions:**
1. **Clean old backups:**
   ```bash
   find . -name "*.backup.*" -type f -mtime +30 -delete
   ```
2. **Choose "Skip" option** during reinstall to avoid new backups

### Wrong IDE Selected

**Problem:** Generated config for wrong IDE.

**Solutions:**
1. **Delete incorrect config:**
   ```bash
   rm .cursorrules  # Or other config file
   ```
2. **Re-run installer** and select correct IDE
3. **Or manually** copy/rename from another IDE's backup

## API Reference

### For Developers

**IDE Config Generation:**

```javascript
const { generateIDEConfigs } = require('./src/wizard/ide-config-generator');

const result = await generateIDEConfigs(
  ['cursor', 'windsurf'], // Selected IDE keys
  {
    projectName: 'my-project',
    projectType: 'greenfield'
  },
  {
    projectRoot: '/path/to/project' // Optional, defaults to cwd
  }
);

console.log(result.success); // true
console.log(result.files);   // ['.cursorrules', '.windsurfrules']
```

**IDE Metadata:**

```javascript
const { getIDEConfig, getIDEKeys } = require('./src/config/ide-configs');

// Get all IDE keys
const allIDEs = getIDEKeys(); // ['cursor', 'windsurf', ...]

// Get specific IDE config
const cursorConfig = getIDEConfig('cursor');
console.log(cursorConfig.name);        // 'Cursor'
console.log(cursorConfig.configFile);  // '.cursorrules'
console.log(cursorConfig.format);      // 'text'
```

## Testing

### Unit Tests

```bash
# Run all IDE-related tests
npm test -- tests/unit/wizard/ide-selector.test.js
npm test -- tests/unit/wizard/ide-config-generator.test.js
npm test -- tests/unit/config/ide-configs.test.js
```

### Integration Tests

```bash
# Run wizard flow integration test
npm test -- tests/integration/wizard-ide-flow.test.js
```

### Manual Testing

1. **Run installer:**
   ```bash
   npx aios-installer
   ```

2. **Select IDE** during wizard

3. **Verify config file:**
   ```bash
   cat .cursorrules  # Or other config file
   ```

4. **Open in IDE** and verify recognition

5. **Test agent activation:**
   - Type `@dev` in IDE chat
   - Try `*help` command

## Related Documentation

- [Story 1.4: IDE Selection](../../docs/stories/v2.1/sprint-1/story-1.4-ide-selection.md)
- [Story 1.2: Interactive Wizard](../../docs/stories/v2.1/sprint-1/story-1.2-interactive-wizard-foundation.md)
- [Story 1.3: Project Type Detection](../../docs/stories/v2.1/sprint-1/story-1.3-project-type-detection.md)
- [AIOS Framework Master](../standards/AIOS-FRAMEWORK-MASTER.md)

---

**Generated:** 2025-01-21
**Story:** 1.4
**Author:** Dex (@dev)
