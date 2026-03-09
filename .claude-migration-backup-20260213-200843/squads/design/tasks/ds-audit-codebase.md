# Audit Codebase for UI Pattern Redundancy

> Task ID: brad-audit-codebase
> Agent: Brad (Design System Architect)
> Version: 1.0.0

## Description

Scan codebase to detect UI pattern redundancies (buttons, colors, spacing, typography, forms) and quantify technical debt with hard metrics. Brad's specialty: showing you the horror show you've created.

## Prerequisites

- Codebase with UI code (React, Vue, HTML, or vanilla CSS)
- Bash shell access
- grep, find, awk utilities available

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to gather scan parameters.

1. **Gather Scan Parameters**
   - Ask for scan path (e.g., ./src, ./app, ./components)
   - Detect frameworks automatically or ask for confirmation
   - Confirm output directory (default: outputs/design-system/{project}/audit/)

2. **Validate Scan Path**
   - Check path exists and is readable
   - Count total files to scan
   - Estimate scan time (100k LOC ~2 min)

3. **Confirm and Execute**
   - Show scan plan summary
   - Ask for confirmation before starting
   - Begin pattern detection

### Steps

1. **Validate Environment**
   - Check scan path exists
   - Verify read permissions
   - Create output directory structure
   - Validation: Path exists and is readable

2. **Detect Frameworks**
   - Count React/JSX files (*.jsx, *.tsx)
   - Count Vue files (*.vue)
   - Count HTML files (*.html)
   - Count CSS files (*.css, *.scss, *.sass)
   - Validation: At least 1 UI file type found

3. **Scan Button Patterns**
   - Detect button elements (<button, <Button, className="btn")
   - Count total button instances across all files
   - Extract unique button class names and patterns
   - Calculate redundancy factor (instances / unique patterns)
   - Validation: Patterns detected or zero if none exist

4. **Scan Color Usage**
   - Extract hex colors (#RGB, #RRGGBB)
   - Extract rgb/rgba colors
   - Count unique color values
   - Count total color usage instances
   - Identify top 10 most-used colors
   - Calculate redundancy factor
   - Validation: Color list generated

5. **Scan Spacing Patterns**
   - Extract padding values (padding: Npx)
   - Extract margin values (margin: Npx)
   - Count unique spacing values
   - Identify most common patterns
   - Validation: Spacing inventory complete

6. **Scan Typography**
   - Extract font-family declarations
   - Extract font-size values
   - Extract font-weight values
   - Count unique typography patterns
   - Validation: Typography catalog created

7. **Scan Form Patterns**
   - Count input elements
   - Extract unique input class patterns
   - Count form elements
   - Extract unique form patterns
   - Validation: Form patterns documented

8. **Generate Inventory Report**
   - Create pattern-inventory.json with all metrics
   - Include scan metadata (timestamp, path, file counts)
   - Calculate redundancy factors for each pattern type
   - Validation: Valid JSON output generated

9. **Create State File**
   - Generate .state.yaml for Atlas handoff
   - Record all pattern counts and metrics
   - Log agent history
   - Set phase to "audit_complete"
   - Validation: State file created and valid YAML

## Output

- **pattern-inventory.json**: Structured data with all pattern counts, redundancy factors, and usage statistics
- **.state.yaml**: Brad's state file for handoff to Atlas or next command
- **Console summary**: Key metrics displayed for immediate review

### Output Format

```json
{
  "scan_metadata": {
    "timestamp": "2025-10-27T12:00:00Z",
    "scan_path": "./src",
    "total_files": 487,
    "frameworks_detected": {
      "react": true,
      "vue": false,
      "html": false
    }
  },
  "patterns": {
    "buttons": {
      "unique_patterns": 47,
      "total_instances": 327,
      "redundancy_factor": 6.96
    },
    "colors": {
      "unique_hex": 82,
      "unique_rgb": 7,
      "total_unique": 89,
      "total_instances": 1247,
      "redundancy_factor": 14.01
    },
    "spacing": {
      "unique_padding": 19,
      "unique_margin": 15
    },
    "typography": {
      "unique_font_families": 4,
      "unique_font_sizes": 15,
      "unique_font_weights": 6
    },
    "forms": {
      "input_instances": 189,
      "unique_input_patterns": 23,
      "form_instances": 45,
      "unique_form_patterns": 12
    }
  }
}
```

## Success Criteria

- [ ] Scan completes in <2 minutes for 100k LOC
- [ ] All pattern types detected (buttons, colors, spacing, typography, forms)
- [ ] Redundancy factors calculated for measurable patterns
- [ ] Valid JSON output generated with complete data
- [ ] State file created for next command (consolidate/tokenize)
- [ ] No scan errors or missing permissions

## Error Handling

- **Scan path does not exist**: Exit with clear error message, suggest valid paths
- **No UI files found**: Warn user, check if path is correct or files exist
- **Permission denied**: Explain which directory needs read access
- **Partial scan failure**: Log which files failed, continue with remaining files, report incomplete data

## Security Considerations

- Read-only access to codebase (no writes during scan)
- No code execution during pattern detection
- Validate file paths to prevent directory traversal
- Handle malformed files gracefully (invalid CSS/JSX)
- Skip binary files and large non-text files

## Examples

### Example 1: React Codebase Scan

```bash
*audit ./src
```

Output:
```
🔍 Brad: Scanning ./src for UI chaos...

📊 Files found:
  - React/JSX: 234
  - CSS/SCSS: 89
  - TOTAL: 323

🔍 Scanning BUTTONS...
📊 BUTTONS:
  - Total instances: 327
  - Unique patterns: 47
  - Redundancy factor: 7.0x

🎨 Scanning COLORS...
📊 COLORS:
  - Unique hex values: 82
  - Total usage instances: 1247
  - Redundancy factor: 15.2x

✅ Inventory saved: outputs/design-system/my-app/audit/pattern-inventory.json
✅ State saved: outputs/design-system/my-app/.state.yaml
```

### Example 2: Vue Codebase Scan

```bash
*audit ./components
```

Output shows Vue-specific patterns (v-btn, el-button, etc.)

## Notes

- Redundancy factor >3x indicates significant technical debt
- Colors >50 unique values = major consolidation opportunity
- Buttons >20 variations = serious pattern explosion
- Run this audit periodically to prevent pattern regression
- Brad recommends: If redundancy factors are high, run *consolidate next
- For cost analysis of this waste, run *calculate-roi after audit
