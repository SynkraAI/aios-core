# Task: Update Confluence Page

## Metadata
```yaml
id: confluence-update-page
name: Update Confluence Page
agent: confluence-agent
version: 1.0.0
```

## Description

Updates an existing Confluence page's content, title, or metadata.

## Input Schema

```typescript
interface ConfluenceUpdatePageInput {
  id?: string;               // Optional: Page ID
  space?: string;            // Optional: Space key (if finding by title)
  title?: string;            // Optional: Current page title (for lookup)
  newTitle?: string;         // Optional: New page title
  content?: string;          // Optional: Replace entire content (HTML)
  appendContent?: string;    // Optional: Append to existing content
  prependContent?: string;   // Optional: Prepend to existing content
  appendSection?: string;    // Optional: Section to append after
  labels?: {                 // Optional: Label modifications
    add?: string[];
    remove?: string[];
  };
  message?: string;          // Optional: Version comment
}
```

## Output Schema

```typescript
interface ConfluenceUpdatePageOutput {
  success: boolean;
  pageId: string;
  title: string;
  url: string;
  version: number;           // New version number
  previousVersion: number;   // Previous version number
}
```

## Implementation

```javascript
async function updateConfluencePage(input) {
  const { ConfluenceClient } = require('../tools/confluence-client');
  const client = new ConfluenceClient();

  // Get current page
  let page;
  if (input.id) {
    page = await client.getContentById(input.id, ['body.storage', 'version']);
  } else if (input.space && input.title) {
    page = await client.findPage(input.space, input.title);
    page = await client.getContentById(page.id, ['body.storage', 'version']);
  } else {
    throw new Error('Either id or (space + title) required');
  }

  const previousVersion = page.version.number;

  // Build new content
  let newContent = page.body.storage.value;

  if (input.content) {
    // Replace entire content
    newContent = input.content;
  } else if (input.appendContent) {
    // Append to end
    newContent += input.appendContent;
  } else if (input.prependContent) {
    // Prepend to beginning
    newContent = input.prependContent + newContent;
  } else if (input.appendSection) {
    // Find section and append after it
    const sectionRegex = new RegExp(`(<h\\d[^>]*>${input.appendSection}</h\\d>)`, 'i');
    const match = newContent.match(sectionRegex);
    if (match) {
      const insertPos = match.index + match[0].length;
      newContent = newContent.slice(0, insertPos) + input.appendContent + newContent.slice(insertPos);
    } else {
      // Section not found, append to end
      newContent += `<h2>${input.appendSection}</h2>` + input.appendContent;
    }
  }

  // Build update payload
  const updatePayload = {
    type: 'page',
    title: input.newTitle || page.title,
    body: {
      storage: {
        value: newContent,
        representation: 'storage'
      }
    },
    version: {
      number: previousVersion + 1,
      message: input.message || 'Updated by AIOS'
    }
  };

  // Update the page
  const response = await client.updateContent(page.id, updatePayload);

  // Handle labels
  if (input.labels) {
    if (input.labels.add) {
      await client.addLabels(page.id, input.labels.add);
    }
    if (input.labels.remove) {
      await client.removeLabels(page.id, input.labels.remove);
    }
  }

  return {
    success: true,
    pageId: response.id,
    title: response.title,
    url: `${process.env.ATLASSIAN_DOMAIN}/wiki${response._links.webui}`,
    version: response.version.number,
    previousVersion
  };
}

module.exports = { updateConfluencePage };
```

## Usage Examples

### Update by ID
```bash
@confluence *update-page \
  --id 12345678 \
  --content "<h1>Updated Content</h1><p>New information here.</p>"
```

### Update by Title
```bash
@confluence *update-page \
  --space QA \
  --title "Sprint 15 Test Report" \
  --content "$(cat updated-report.html)" \
  --message "Updated with final test results"
```

### Append Content
```bash
@confluence *update-page \
  --id 12345678 \
  --appendContent "<h2>Run #456</h2><p>All tests passed at 14:30 UTC</p>" \
  --message "Added test run results"
```

### Append to Section
```bash
@confluence *update-page \
  --space QA \
  --title "Test Report" \
  --appendSection "Latest Results" \
  --appendContent "<p><strong>$(date)</strong>: 47 tests passed</p>"
```

### Update Labels
```bash
@confluence *update-page \
  --id 12345678 \
  --labels '{"add": ["reviewed", "approved"], "remove": ["draft"]}'
```

### Rename Page
```bash
@confluence *update-page \
  --id 12345678 \
  --newTitle "Sprint 15 Test Report - Final"
```

## Integration Patterns

### CI/CD Append Results
```yaml
# GitHub Actions
- name: Update Test Report
  run: |
    @confluence *update-page \
      --space QA \
      --title "Nightly Test Reports" \
      --appendSection "Results" \
      --appendContent "$(cat <<EOF
<h3>Build #${{ github.run_number }} - $(date)</h3>
<p>Status: ${{ job.status }}</p>
<ul>
  <li>Passed: ${{ steps.tests.outputs.passed }}</li>
  <li>Failed: ${{ steps.tests.outputs.failed }}</li>
</ul>
EOF
)" \
      --message "CI Build #${{ github.run_number }}"
```

### Daily Status Update
```bash
# Update daily status page
@confluence *update-page \
  --space TEAM \
  --title "Daily Status" \
  --content "$(cat <<EOF
<h1>Daily Status - $(date +%Y-%m-%d)</h1>
<ac:structured-macro ac:name="status">
  <ac:parameter ac:name="title">ON TRACK</ac:parameter>
  <ac:parameter ac:name="colour">Green</ac:parameter>
</ac:structured-macro>

<h2>Completed Today</h2>
<ul>
  <li>Test execution for Sprint 15</li>
  <li>Bug triage meeting</li>
</ul>

<h2>Blockers</h2>
<p>None</p>
EOF
)"
```

## Version History

Confluence maintains version history automatically:
- Each update creates a new version
- Version comments are stored with updates
- Previous versions can be viewed/restored in UI
- Use `--message` for meaningful version comments

## Output Example

```json
{
  "success": true,
  "pageId": "12345678",
  "title": "Sprint 15 Test Report",
  "url": "https://company.atlassian.net/wiki/spaces/QA/pages/12345678",
  "version": 5,
  "previousVersion": 4
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid content | Validate HTML |
| 401 | Authentication failed | Check API token |
| 404 | Page not found | Verify ID or title |
| 409 | Version conflict | Refresh and retry |

## Related Tasks

- `confluence-create-page` - Create new pages
- `confluence-get-page` - Get page content first
- `confluence-attach` - Add attachments
