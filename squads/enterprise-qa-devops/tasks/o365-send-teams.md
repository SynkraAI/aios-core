# Task: Send Microsoft Teams Message

## Metadata
```yaml
id: o365-send-teams
name: Send Teams Message
agent: o365-agent
version: 1.0.0
```

## Description

Posts a message to a Microsoft Teams channel with optional mentions, cards, and formatting.

## Input Schema

```typescript
interface O365SendTeamsInput {
  team: string;              // Required*: Team name (or use channelId)
  channel: string;           // Required*: Channel name
  channelId?: string;        // Optional: Direct channel ID
  message: string;           // Required: Message content (markdown)
  mentions?: string[];       // Optional: Users/groups to mention
  card?: object;             // Optional: Adaptive card JSON
  subject?: string;          // Optional: Message subject/title
  importance?: 'normal' | 'high' | 'urgent'; // Optional: Importance
}
```

## Output Schema

```typescript
interface O365SendTeamsOutput {
  success: boolean;
  messageId: string;         // Posted message ID
  channelId: string;         // Channel where posted
  url: string;               // URL to message
  timestamp: string;         // Post timestamp
}
```

## Implementation

```javascript
async function sendTeamsMessage(input) {
  const { GraphClient } = require('../tools/graph-client');
  const client = new GraphClient();

  // Get channel ID
  let channelId = input.channelId;

  if (!channelId && input.team && input.channel) {
    // Find team
    const teams = await client.getJoinedTeams();
    const team = teams.value.find(t =>
      t.displayName.toLowerCase() === input.team.toLowerCase()
    );

    if (!team) {
      throw new Error(`Team "${input.team}" not found`);
    }

    // Find channel
    const channels = await client.getChannels(team.id);
    const channel = channels.value.find(c =>
      c.displayName.toLowerCase() === input.channel.toLowerCase()
    );

    if (!channel) {
      throw new Error(`Channel "${input.channel}" not found in team "${input.team}"`);
    }

    channelId = `${team.id}/channels/${channel.id}`;
  }

  // Build message body
  let body = {
    contentType: 'html',
    content: convertMarkdownToHtml(input.message)
  };

  // Handle mentions
  const mentions = [];
  if (input.mentions && input.mentions.length > 0) {
    for (let i = 0; i < input.mentions.length; i++) {
      const mention = input.mentions[i];
      const user = await client.getUserByEmail(mention);

      mentions.push({
        id: i,
        mentionText: user.displayName,
        mentioned: {
          user: {
            id: user.id,
            displayName: user.displayName,
            userIdentityType: 'aadUser'
          }
        }
      });

      // Add mention placeholder to body
      body.content = body.content.replace(
        new RegExp(`@${mention}`, 'gi'),
        `<at id="${i}">${user.displayName}</at>`
      );
    }
  }

  // Build message payload
  const messagePayload = {
    body,
    importance: input.importance || 'normal'
  };

  if (input.subject) {
    messagePayload.subject = input.subject;
  }

  if (mentions.length > 0) {
    messagePayload.mentions = mentions;
  }

  // Add adaptive card if provided
  if (input.card) {
    messagePayload.attachments = [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: input.card
    }];
  }

  // Send message
  const [teamId, , channelIdOnly] = channelId.split('/');
  const response = await client.postChannelMessage(teamId, channelIdOnly, messagePayload);

  return {
    success: true,
    messageId: response.id,
    channelId: channelIdOnly,
    url: response.webUrl,
    timestamp: response.createdDateTime
  };
}

function convertMarkdownToHtml(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n/g, '<br/>');

  return html;
}

module.exports = { sendTeamsMessage };
```

## Usage Examples

### Simple Message
```bash
@o365 *send-teams \
  --team "Engineering" \
  --channel "QA-Updates" \
  --message "Tests completed successfully."
```

### Formatted Message
```bash
@o365 *send-teams \
  --team "Engineering" \
  --channel "QA-Updates" \
  --message "$(cat <<'EOF'
## ✅ Sprint 15 Tests Complete

**Execution:** PROJ-EXEC-456
**Status:** All tests passed

| Metric | Value |
|--------|-------|
| Passed | 142 |
| Failed | 0 |
| Duration | 45m |

[View Report](https://confluence.company.com/pages/12345) | [View in Xray](https://jira.company.com/browse/PROJ-EXEC-456)
EOF
)"
```

### With Mentions
```bash
@o365 *send-teams \
  --team "Engineering" \
  --channel "QA-Updates" \
  --message "Tests failed! @qa-lead please review. @dev-team fix needed." \
  --mentions '["qa-lead@company.com", "dev-team@company.com"]' \
  --importance "high"
```

### With Adaptive Card
```bash
@o365 *send-teams \
  --team "Engineering" \
  --channel "Releases" \
  --subject "Release 1.2.0 Ready" \
  --card '{
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.4",
    "body": [
      {
        "type": "TextBlock",
        "size": "Large",
        "weight": "Bolder",
        "text": "🚀 Release 1.2.0 Ready for Deployment"
      },
      {
        "type": "FactSet",
        "facts": [
          {"title": "Version", "value": "1.2.0"},
          {"title": "Tests", "value": "142 passed, 0 failed"},
          {"title": "Coverage", "value": "88%"}
        ]
      }
    ],
    "actions": [
      {
        "type": "Action.OpenUrl",
        "title": "View Release Notes",
        "url": "https://confluence.company.com/release-1.2.0"
      },
      {
        "type": "Action.OpenUrl",
        "title": "Deploy",
        "url": "https://ci.company.com/deploy/1.2.0"
      }
    ]
  }'
```

## Adaptive Card Templates

### Test Results Card
```json
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "Container",
      "style": "${status == 'passed' ? 'good' : 'attention'}",
      "items": [
        {
          "type": "TextBlock",
          "size": "Large",
          "weight": "Bolder",
          "text": "${status == 'passed' ? '✅' : '❌'} Test Results: ${execution_key}"
        }
      ]
    },
    {
      "type": "FactSet",
      "facts": [
        {"title": "Passed", "value": "${passed}"},
        {"title": "Failed", "value": "${failed}"},
        {"title": "Skipped", "value": "${skipped}"},
        {"title": "Duration", "value": "${duration}"}
      ]
    },
    {
      "type": "TextBlock",
      "text": "Build: #${build_number}",
      "isSubtle": true
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "View Execution",
      "url": "${execution_url}"
    },
    {
      "type": "Action.OpenUrl",
      "title": "View Report",
      "url": "${report_url}"
    }
  ]
}
```

### Alert Card
```json
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "Container",
      "style": "attention",
      "items": [
        {
          "type": "TextBlock",
          "size": "Large",
          "weight": "Bolder",
          "text": "⚠️ ${alert_title}",
          "color": "Attention"
        }
      ]
    },
    {
      "type": "TextBlock",
      "text": "${alert_message}",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        {"title": "Severity", "value": "${severity}"},
        {"title": "Time", "value": "${timestamp}"},
        {"title": "Source", "value": "${source}"}
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "Investigate",
      "url": "${link}"
    }
  ]
}
```

## Notification Types

### Predefined Notifications
```bash
# Test completion
@o365 *notify-team \
  --channel "QA-Updates" \
  --type "test-complete" \
  --data '{"passed": 142, "failed": 3, "link": "..."}'

# Release
@o365 *notify-team \
  --channel "Releases" \
  --type "release" \
  --data '{"version": "1.2.0", "environment": "production"}'

# Alert
@o365 *notify-team \
  --channel "Alerts" \
  --type "alert" \
  --urgency "high" \
  --message "CI Pipeline Failed"
```

## Output Example

```json
{
  "success": true,
  "messageId": "1612345678901",
  "channelId": "19:abc123@thread.tacv2",
  "url": "https://teams.microsoft.com/l/message/...",
  "timestamp": "2026-02-04T10:30:00.000Z"
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 401 | Unauthorized | Check MS365 credentials |
| 403 | Forbidden | Check channel permissions |
| 404 | Team/channel not found | Verify names |
| 429 | Rate limited | Implement backoff |

## Related Tasks

- `o365-send-email` - Send email instead
- `o365-create-event` - Schedule meeting
- `xray-coverage-report` - Get data for notification
