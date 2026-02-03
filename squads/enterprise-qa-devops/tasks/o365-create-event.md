# Task: Create Calendar Event

## Metadata
```yaml
id: o365-create-event
name: Create Calendar Event
agent: o365-agent
version: 1.0.0
```

## Description

Creates a calendar event in Microsoft 365 with optional Teams meeting link.

## Input Schema

```typescript
interface O365CreateEventInput {
  title: string;             // Required: Event title
  date: string;              // Required: Date (YYYY-MM-DD)
  time: string;              // Required: Time (HH:MM)
  duration?: number;         // Optional: Duration in minutes (default: 30)
  endTime?: string;          // Optional: End time (HH:MM) instead of duration
  attendees?: string[];      // Optional: Attendee emails
  location?: string;         // Optional: Location or room
  body?: string;             // Optional: Event description (HTML)
  isOnline?: boolean;        // Optional: Create Teams meeting (default: false)
  reminder?: number;         // Optional: Reminder minutes before
  recurrence?: {             // Optional: Recurrence pattern
    pattern: 'daily' | 'weekly' | 'monthly';
    interval?: number;
    daysOfWeek?: string[];
    endDate?: string;
    occurrences?: number;
  };
  showAs?: 'free' | 'tentative' | 'busy' | 'oof'; // Optional: Show as status
  categories?: string[];     // Optional: Categories/colors
}
```

## Output Schema

```typescript
interface O365CreateEventOutput {
  success: boolean;
  eventId: string;           // Created event ID
  title: string;             // Event title
  start: string;             // Start datetime
  end: string;               // End datetime
  webLink: string;           // Link to event
  teamsLink?: string;        // Teams meeting link if created
  attendees: string[];       // Invited attendees
}
```

## Implementation

```javascript
async function createCalendarEvent(input) {
  const { GraphClient } = require('../tools/graph-client');
  const client = new GraphClient();

  // Parse date and time
  const startDateTime = new Date(`${input.date}T${input.time}:00`);
  let endDateTime;

  if (input.endTime) {
    endDateTime = new Date(`${input.date}T${input.endTime}:00`);
  } else {
    endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + (input.duration || 30));
  }

  // Build event payload
  const event = {
    subject: input.title,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    showAs: input.showAs || 'busy'
  };

  // Add body/description
  if (input.body) {
    event.body = {
      contentType: 'HTML',
      content: input.body
    };
  }

  // Add location
  if (input.location) {
    event.location = {
      displayName: input.location
    };
  }

  // Add attendees
  if (input.attendees && input.attendees.length > 0) {
    event.attendees = input.attendees.map(email => ({
      emailAddress: { address: email },
      type: 'required'
    }));
  }

  // Create Teams meeting
  if (input.isOnline) {
    event.isOnlineMeeting = true;
    event.onlineMeetingProvider = 'teamsForBusiness';
  }

  // Add reminder
  if (input.reminder) {
    event.reminderMinutesBeforeStart = input.reminder;
  }

  // Add categories
  if (input.categories) {
    event.categories = input.categories;
  }

  // Add recurrence
  if (input.recurrence) {
    event.recurrence = buildRecurrence(input.recurrence, input.date);
  }

  // Create the event
  const response = await client.createEvent(event);

  return {
    success: true,
    eventId: response.id,
    title: response.subject,
    start: response.start.dateTime,
    end: response.end.dateTime,
    webLink: response.webLink,
    teamsLink: response.onlineMeeting?.joinUrl,
    attendees: input.attendees || []
  };
}

function buildRecurrence(recurrence, startDate) {
  const pattern = {
    type: recurrence.pattern,
    interval: recurrence.interval || 1
  };

  if (recurrence.pattern === 'weekly' && recurrence.daysOfWeek) {
    pattern.daysOfWeek = recurrence.daysOfWeek;
  }

  const range = {
    type: recurrence.endDate ? 'endDate' : (recurrence.occurrences ? 'numbered' : 'noEnd'),
    startDate: startDate
  };

  if (recurrence.endDate) {
    range.endDate = recurrence.endDate;
  }

  if (recurrence.occurrences) {
    range.numberOfOccurrences = recurrence.occurrences;
  }

  return { pattern, range };
}

module.exports = { createCalendarEvent };
```

## Usage Examples

### Simple Meeting
```bash
@o365 *create-event \
  --title "Team Standup" \
  --date "2026-02-05" \
  --time "09:00" \
  --duration 15
```

### Meeting with Attendees and Teams Link
```bash
@o365 *create-event \
  --title "Sprint 15 Review" \
  --date "2026-02-10" \
  --time "14:00" \
  --duration 90 \
  --attendees '["dev@company.com", "qa@company.com", "pm@company.com"]' \
  --isOnline \
  --body "<h2>Agenda</h2><ol><li>Demo completed stories</li><li>Review test results</li><li>Retrospective</li></ol>"
```

### Recurring Meeting
```bash
@o365 *create-event \
  --title "Weekly QA Sync" \
  --date "2026-02-05" \
  --time "10:00" \
  --duration 30 \
  --attendees '["qa-team@company.com"]' \
  --isOnline \
  --recurrence '{
    "pattern": "weekly",
    "interval": 1,
    "daysOfWeek": ["wednesday"],
    "occurrences": 12
  }'
```

### Full Configuration
```bash
@o365 *create-event \
  --title "Release 1.2.0 Go/No-Go Meeting" \
  --date "2026-02-14" \
  --time "15:00" \
  --duration 60 \
  --attendees '["qa@company.com", "dev@company.com", "devops@company.com", "pm@company.com"]' \
  --location "Conference Room A" \
  --isOnline \
  --reminder 15 \
  --showAs "busy" \
  --categories '["Release", "Important"]' \
  --body "$(cat <<'EOF'
<h1>Release 1.2.0 Go/No-Go Decision</h1>

<h2>Pre-requisites</h2>
<ul>
  <li>All tests passing</li>
  <li>Security scan complete</li>
  <li>Stakeholder sign-off obtained</li>
</ul>

<h2>Agenda</h2>
<ol>
  <li>Review test results (QA)</li>
  <li>Review deployment checklist (DevOps)</li>
  <li>Go/No-Go decision</li>
</ol>

<h2>Links</h2>
<ul>
  <li><a href="https://confluence.company.com/release-1.2.0">Release Notes</a></li>
  <li><a href="https://jira.company.com/browse/PROJ-100">Test Plan</a></li>
</ul>
EOF
)"
```

## Common Meeting Types

### Sprint Ceremonies
```bash
# Sprint Planning
@o365 *create-event \
  --title "Sprint 16 Planning" \
  --date "2026-02-17" \
  --time "09:00" \
  --duration 120 \
  --attendees '["team@company.com"]' \
  --isOnline \
  --body "<p>Sprint 16 planning session. Please review backlog before meeting.</p>"

# Sprint Review
@o365 *create-event \
  --title "Sprint 15 Review" \
  --date "2026-02-14" \
  --time "14:00" \
  --duration 60 \
  --attendees '["team@company.com", "stakeholders@company.com"]' \
  --isOnline

# Retrospective
@o365 *create-event \
  --title "Sprint 15 Retrospective" \
  --date "2026-02-14" \
  --time "15:30" \
  --duration 60 \
  --attendees '["team@company.com"]' \
  --isOnline
```

### Test Sessions
```bash
# Bug Triage
@o365 *create-event \
  --title "Bug Triage - Sprint 15" \
  --date "2026-02-06" \
  --time "11:00" \
  --duration 30 \
  --recurrence '{"pattern": "daily", "occurrences": 5}' \
  --attendees '["qa@company.com", "dev-lead@company.com"]' \
  --isOnline

# Test Review
@o365 *create-event \
  --title "Test Strategy Review" \
  --date "2026-02-07" \
  --time "14:00" \
  --duration 60 \
  --attendees '["qa-team@company.com"]' \
  --isOnline
```

## Output Example

```json
{
  "success": true,
  "eventId": "AAMkAGI2...",
  "title": "Sprint 15 Review",
  "start": "2026-02-10T14:00:00.0000000",
  "end": "2026-02-10T15:30:00.0000000",
  "webLink": "https://outlook.office365.com/calendar/item/...",
  "teamsLink": "https://teams.microsoft.com/l/meetup-join/...",
  "attendees": ["dev@company.com", "qa@company.com", "pm@company.com"]
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 401 | Unauthorized | Check MS365 credentials |
| 403 | Forbidden | Check calendar permissions |
| 400 | Bad request | Validate date/time format |
| CONFLICT | Time slot conflict | Check calendar availability |

## Related Tasks

- `o365-send-email` - Send meeting summary
- `o365-send-teams` - Announce meeting
- `jira-create-issue` - Create action items from meeting
