# Task: Create Confluence Page

## Metadata
```yaml
id: confluence-create-page
name: Create Confluence Page
agent: confluence-agent
version: 1.0.0
```

## Description

Creates a new page in Confluence with specified content and metadata.

## Input Schema

```typescript
interface ConfluenceCreatePageInput {
  space: string;             // Required: Space key
  title: string;             // Required: Page title
  content?: string;          // Optional: HTML content
  body?: string;             // Optional: Plain text/markdown body
  parent?: string;           // Optional: Parent page title or ID
  labels?: string[];         // Optional: Labels to add
  status?: 'current' | 'draft'; // Optional: Page status
  ancestors?: string[];      // Optional: Ancestor page IDs
}
```

## Output Schema

```typescript
interface ConfluenceCreatePageOutput {
  success: boolean;
  pageId: string;            // Created page ID
  title: string;             // Page title
  url: string;               // URL to the page
  version: number;           // Current version
  spaceKey: string;          // Space key
}
```

## Implementation

```javascript
async function createConfluencePage(input) {
  const { ConfluenceClient } = require('../tools/confluence-client');
  const client = new ConfluenceClient();

  // Build page content
  let bodyContent = '';

  if (input.content) {
    // HTML content provided
    bodyContent = input.content;
  } else if (input.body) {
    // Convert markdown or plain text to storage format
    bodyContent = `<p>${input.body.replace(/\n/g, '</p><p>')}</p>`;
  }

  // Build page payload
  const pagePayload = {
    type: 'page',
    title: input.title,
    space: { key: input.space },
    status: input.status || 'current',
    body: {
      storage: {
        value: bodyContent,
        representation: 'storage'
      }
    }
  };

  // Add ancestors (parent pages)
  if (input.parent) {
    const parentPage = await client.findPage(input.space, input.parent);
    pagePayload.ancestors = [{ id: parentPage.id }];
  } else if (input.ancestors) {
    pagePayload.ancestors = input.ancestors.map(id => ({ id }));
  }

  // Create the page
  const response = await client.createContent(pagePayload);

  // Add labels if provided
  if (input.labels && input.labels.length > 0) {
    await client.addLabels(response.id, input.labels);
  }

  return {
    success: true,
    pageId: response.id,
    title: response.title,
    url: `${process.env.ATLASSIAN_DOMAIN}/wiki${response._links.webui}`,
    version: response.version.number,
    spaceKey: input.space
  };
}

module.exports = { createConfluencePage };
```

## Usage Examples

### Basic Page
```bash
@confluence *create-page \
  --space QA \
  --title "Sprint 15 Test Report"
```

### Page with Content
```bash
@confluence *create-page \
  --space QA \
  --title "Sprint 15 Test Report" \
  --content "<h1>Summary</h1><p>All tests passed.</p><h2>Details</h2><p>47 tests executed.</p>"
```

### Page with Parent
```bash
@confluence *create-page \
  --space QA \
  --title "Sprint 15 Test Report - 2026-02-04" \
  --parent "Test Reports" \
  --labels "sprint-15,test-report,automated" \
  --content "$(cat report.html)"
```

### Full Page Creation
```bash
@confluence *create-page \
  --space QA \
  --title "Release 1.2.0 Documentation" \
  --parent "Releases" \
  --labels "release,v1.2.0,documentation" \
  --content "$(cat <<'EOF'
<h1>Release 1.2.0</h1>

<ac:structured-macro ac:name="toc"/>

<h2>Overview</h2>
<p>This release includes authentication improvements and bug fixes.</p>

<h2>Features</h2>
<ul>
  <li>Password strength meter</li>
  <li>OAuth 2.0 support</li>
  <li>Remember me functionality</li>
</ul>

<h2>Test Results</h2>
<ac:structured-macro ac:name="status">
  <ac:parameter ac:name="title">PASSED</ac:parameter>
  <ac:parameter ac:name="colour">Green</ac:parameter>
</ac:structured-macro>
<p>All 142 tests passed successfully.</p>

<h2>Links</h2>
<ul>
  <li><a href="https://jira.company.com/browse/PROJ-100">Test Plan</a></li>
  <li><a href="https://jira.company.com/browse/PROJ-EXEC-456">Test Execution</a></li>
</ul>
EOF
)"
```

## Confluence Storage Format

### Common Macros

```html
<!-- Table of Contents -->
<ac:structured-macro ac:name="toc"/>

<!-- Status Badge -->
<ac:structured-macro ac:name="status">
  <ac:parameter ac:name="title">PASSED</ac:parameter>
  <ac:parameter ac:name="colour">Green</ac:parameter>
</ac:structured-macro>

<!-- Info Panel -->
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p>Important information here.</p>
  </ac:rich-text-body>
</ac:structured-macro>

<!-- Warning Panel -->
<ac:structured-macro ac:name="warning">
  <ac:rich-text-body>
    <p>Warning message here.</p>
  </ac:rich-text-body>
</ac:structured-macro>

<!-- Code Block -->
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">javascript</ac:parameter>
  <ac:plain-text-body><![CDATA[
function hello() {
  console.log('Hello World');
}
  ]]></ac:plain-text-body>
</ac:structured-macro>

<!-- Jira Issue Link -->
<ac:structured-macro ac:name="jira">
  <ac:parameter ac:name="key">PROJ-123</ac:parameter>
</ac:structured-macro>
```

### Tables

```html
<table>
  <thead>
    <tr>
      <th>Test</th>
      <th>Result</th>
      <th>Duration</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Login Test</td>
      <td>PASSED</td>
      <td>1.2s</td>
    </tr>
  </tbody>
</table>
```

## Output Example

```json
{
  "success": true,
  "pageId": "12345678",
  "title": "Sprint 15 Test Report",
  "url": "https://company.atlassian.net/wiki/spaces/QA/pages/12345678",
  "version": 1,
  "spaceKey": "QA"
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 400 | Invalid content/HTML | Validate HTML syntax |
| 401 | Authentication failed | Check API token |
| 404 | Space not found | Verify space key |
| 409 | Page already exists | Use update or different title |

## Related Tasks

- `confluence-update-page` - Update existing pages
- `confluence-from-template` - Create from template
- `confluence-attach` - Add attachments
