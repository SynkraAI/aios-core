# Task: Validate Sources

**ID:** validate-sources
**Agent:** file-hunter
**Category:** Validation
**Complexity:** Low
**Duration:** 5-10 minutes

## Description

Validate file links from an existing research report for accessibility, credibility, and metadata accuracy.

## When to Use

- After completing file research, before downloading
- User reports broken links in catalog
- Need to refresh/update old research reports
- Quality assurance step before sharing catalog

## Inputs

**Required:**
- `report_path` - Path to research report directory or catalog file

**Optional:**
- `--strict` - Enable strict validation (fail on any broken link)
- `--update` - Update catalog with new validation results

## Outputs

**File:** `{report_path}/validation-report.md`

**Content:**
- Link accessibility status (✅ accessible, ❌ broken, ⚠️ slow)
- Updated credibility ratings
- Updated metadata (size, format changes)
- Broken link report with alternatives

## Workflow Steps

### Step 1: Load Catalog

**Actions:**
1. Read catalog file (`03-file-catalog.md`)
2. Extract all file URLs
3. Parse existing metadata

**Output:**
```json
{
  "total_links": 25,
  "links": [
    {
      "url": "...",
      "title": "...",
      "format": "PDF",
      "credibility": "HIGH"
    }
  ]
}
```

### Step 2: Validate Each Link

**Actions:**

For EACH link:

1. **Check accessibility:**
   ```javascript
   try {
     response = HEAD_REQUEST(url, timeout=5s)
     if (response.status == 200) {
       status = "✅ Accessible"
     } else if (response.status >= 400) {
       status = "❌ Broken"
     } else {
       status = "⚠️ Redirect"
     }
   } catch (timeout) {
     status = "⚠️ Slow (>5s)"
   } catch (error) {
     status = "❌ Error: " + error
   }
   ```

2. **Extract metadata from headers:**
   ```javascript
   if (accessible) {
     content_type = response.headers['content-type']
     content_length = response.headers['content-length']

     // Verify format matches
     if (content_type.includes('pdf') && format !== 'PDF') {
       warning = "Format mismatch: expected PDF, got " + content_type
     }
   }
   ```

3. **Re-evaluate credibility:**
   ```javascript
   // Downgrade if link is broken
   if (status.includes("❌")) {
     new_credibility = "LOW"
     reason = "Broken link"
   }

   // Flag slow sources
   if (status.includes("Slow")) {
     warning = "Source is slow to respond"
   }
   ```

**Output per link:**
```json
{
  "url": "...",
  "status": "✅ Accessible",
  "original_credibility": "HIGH",
  "new_credibility": "HIGH",
  "metadata_changes": {
    "size": "2.3 MB → 2.5 MB",
    "format": "PDF (verified)"
  },
  "warnings": []
}
```

### Step 3: Find Alternatives for Broken Links

**Actions:**

For EACH broken link:

1. **Extract keywords from title**
2. **Search for alternatives:**
   ```
   WebSearch("{title} {format} alternative site:{original_domain}")
   ```

3. **Suggest replacements:**
   - Same source (different URL)
   - Mirror sites
   - Archive.org snapshots

**Output:**
```json
{
  "broken_url": "...",
  "alternatives": [
    {
      "url": "...",
      "source": "archive.org",
      "credibility": "MEDIUM",
      "note": "Archived version from 2024-01-15"
    }
  ]
}
```

### Step 4: Generate Validation Report

**Actions:**

Create `validation-report.md`:

```markdown
# Validation Report

**Date:** {YYYY-MM-DD HH:MM}
**Original Report:** {report_path}
**Links Validated:** {total_links}

## Summary

- ✅ Accessible: {count} ({percentage}%)
- ❌ Broken: {count} ({percentage}%)
- ⚠️ Warnings: {count} ({percentage}%)

## Link Status

### ✅ Accessible Links ({count})

| Title | URL | Status | Metadata Changes |
|-------|-----|--------|------------------|
| ... | ... | ✅ 200 OK | Size: 2.3 MB → 2.5 MB |

### ❌ Broken Links ({count})

| Title | Original URL | Status | Alternatives |
|-------|-------------|--------|--------------|
| ... | ... | ❌ 404 Not Found | [Alt 1](url), [Alt 2](url) |

### ⚠️ Warnings ({count})

| Title | URL | Warning | Recommendation |
|-------|-----|---------|----------------|
| ... | ... | Slow response (8s) | Consider alternative source |

## Credibility Changes

| URL | Original | New | Reason |
|-----|----------|-----|--------|
| ... | HIGH | LOW | Broken link |

## Recommendations

1. Replace broken links with alternatives
2. Update catalog with new metadata
3. Consider removing LOW credibility sources
```

### Step 5: Update Catalog (if --update flag)

**Actions:**

1. **Backup original catalog:**
   ```bash
   cp 03-file-catalog.md 03-file-catalog.md.backup
   ```

2. **Update catalog entries:**
   - Replace broken URLs with alternatives
   - Update metadata (size, format)
   - Update credibility ratings
   - Add validation timestamp

3. **Add validation notice to README:**
   ```markdown
   **Last Validated:** {YYYY-MM-DD}
   **Validation Status:** {X/Y links accessible}
   ```

**Output:** Updated catalog with validation metadata

## Error Handling

### Network Errors
```
Log warning:
"Network error validating {url}: {error}"
"Marking as ⚠️ Network issue - retry recommended"
```

### Rate Limiting
```
If rate limited:
- Add delay between requests (1s)
- Batch validate in groups of 10
- Log: "Rate limited, using conservative validation"
```

### No Alternatives Found
```
Report:
"❌ No alternatives found for: {title}"
"Recommendation: Manual search required"
```

## Validation Checklist

- [ ] All links in catalog validated
- [ ] Accessibility status determined for each
- [ ] Metadata verified (format, size)
- [ ] Credibility re-evaluated
- [ ] Alternatives found for broken links
- [ ] Validation report generated
- [ ] Catalog updated (if --update)
- [ ] Backup created before updates

## Example Execution

```bash
# User command
*validate-sources docs/file-research/2026-02-14-react-hooks/

# Load catalog
Found 12 links in 03-file-catalog.md

# Validate links
✅ Accessible: 10/12 (83%)
❌ Broken: 2/12 (17%)

# Find alternatives
Found 2 alternatives for broken link 1
Found 1 alternative for broken link 2

# Generate report
Saved to: validation-report.md

# Summary
10 links working
2 links broken (alternatives provided)
0 warnings

✅ Validation complete!
```

## Usage Examples

### Basic Validation
```bash
*validate-sources docs/file-research/2026-02-14-react-hooks/
```

### Strict Mode (fail on broken links)
```bash
*validate-sources docs/file-research/2026-02-14-react-hooks/ --strict
```

### Validate and Update
```bash
*validate-sources docs/file-research/2026-02-14-react-hooks/ --update
```

## Dependencies

**Tasks:** None

**Tools:**
- WebFetch (for link checking)
- WebSearch (for finding alternatives)

## Version

**v1.0.0** - Initial implementation (2026-02-14)

---

**Created by:** aios-master
**Status:** ⚠️ Pending validation
