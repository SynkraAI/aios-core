# Design System Artifact Scan Task

> Task ID: ds-scan-artifact
> Agent: design-system
> Version: 1.0.0
> Extends: generic-scan.md

## Description

Analyzes HTML/React artifacts to extract design patterns, components,
colors, typography, and other design system elements. Generates comprehensive
reports with auto-incrementing artifact IDs.

## Specific Workflow

### 1. Initialize Scan

```bash
# Set agent parameters
AGENT_NAME="design-system"
SCAN_TYPE="artifact-analysis"

# Load core library
source squads/super-agentes/scan-system/lib/scan-core.sh

# Validate environment
validate_scan_environment "$AGENT_NAME"
```

### 2. Get Target

Interactive prompt or parameter:
- File path: `path/to/artifact.html`
- URL: `https://example.com/artifact`
- Direct paste: User provides HTML content

### 3. Get Artifact Name

```bash
# Prompt for descriptive name
echo "Enter a descriptive name for this artifact (e.g., 'dashboard', 'pricing-table'):"
read ARTIFACT_NAME
# Sanitize name (remove spaces, special chars)
ARTIFACT_NAME=$(echo "$ARTIFACT_NAME" | tr ' ' '-' | tr -cd '[:alnum:]-')
```

### 4. Get Next ID and Create Metadata

```bash
ARTIFACT_ID=$(get_next_artifact_id "$AGENT_NAME")
echo "📋 Assigned Artifact ID: $ARTIFACT_ID"

METADATA_FILE=$(create_metadata "$AGENT_NAME" "$ARTIFACT_ID" "$SCAN_TYPE" "$ARTIFACT_NAME")
echo "📄 Created metadata: $METADATA_FILE"
```

### 5. Analyze Artifact

Extract design elements from HTML/React content.

### 6. Generate Report

Create comprehensive analysis report with extracted data.

### 7. Update Metadata with Results

Update metadata file with analysis metrics and extracted data.

### 8. Update Registry and Commit

Update scan registry and optionally commit to git.

### 9. Display Summary

Show completion message with artifact details and next steps.

## Success Criteria

- [ ] Artifact analyzed and data extracted
- [ ] Report generated with all sections
- [ ] Metadata includes all metrics
- [ ] Registry updated correctly
- [ ] Git commit created (if enabled)

## Example Usage

```bash
# From Design System agent
*scan path/to/dashboard.html

# Or with URL
*scan https://example.com/artifact.html

# Or paste content directly
*scan
# [Agent prompts for content]
```
