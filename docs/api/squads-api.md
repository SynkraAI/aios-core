# Squads API Reference

> 🌐 **EN** | [PT](../pt/api/squads-api.md) | [ES](../es/api/squads-api.md)

REST API for syncing squads to Synkra and discovering marketplace squads.

## Overview

The Squads API enables:

- **Sync**: Push local squads to Synkra cloud
- **Marketplace**: Discover and browse public squads
- **Management**: Update visibility, delete squads

**Base URL**: `https://api.synkra.ai`

## Authentication

All authenticated endpoints require either:

### API Key (Recommended for CLI)

```bash
Authorization: Bearer sk_your_api_key
```

### JWT Token (Web applications)

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Get your API key from: https://synkra.ai/settings/api-keys

## Endpoints

### Sync Squad

Push a squad definition to Synkra.

```
POST /api/squads/sync
```

**Authentication**: Required

**Request Body**:

| Field                   | Type    | Required | Description                            |
| ----------------------- | ------- | -------- | -------------------------------------- |
| `squadData`             | object  | Yes      | Squad manifest data                    |
| `squadData.name`        | string  | Yes      | Squad name                             |
| `squadData.version`     | string  | Yes      | Semantic version                       |
| `squadData.description` | string  | No       | Squad description                      |
| `squadData.author`      | string  | No       | Author name                            |
| `squadData.components`  | object  | No       | Squad components                       |
| `isPublic`              | boolean | No       | Make publicly visible (default: false) |
| `isOfficial`            | boolean | No       | Mark as official (admin only)          |

**Example Request**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "squadData": {
      "name": "my-squad",
      "version": "1.0.0",
      "description": "My awesome squad",
      "aios": {
        "minVersion": "2.1.0",
        "type": "squad"
      },
      "components": {
        "agents": ["greeter-agent"],
        "tasks": ["greet-user"]
      }
    },
    "isPublic": true
  }'
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "squad_id": "my-squad",
    "action": "created",
    "version": "1.0.0",
    "is_public": true
  },
  "duration_ms": 45
}
```

**Error Response** (400):

```json
{
  "success": false,
  "error": "Validation failed: name is required"
}
```

---

### Batch Sync

Sync multiple squads in one request.

```
POST /api/squads/sync/batch
```

**Authentication**: Required

**Request Body**:

| Field      | Type    | Required | Description                             |
| ---------- | ------- | -------- | --------------------------------------- |
| `squads`   | array   | Yes      | Array of squad data objects             |
| `isPublic` | boolean | No       | Make all squads public (default: false) |

**Example Request**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync/batch \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "squads": [
      {
        "name": "squad-one",
        "version": "1.0.0",
        "description": "First squad"
      },
      {
        "name": "squad-two",
        "version": "2.0.0",
        "description": "Second squad"
      }
    ],
    "isPublic": false
  }'
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "total": 2,
    "created": 2,
    "updated": 0,
    "skipped": 0,
    "failed": 0,
    "errors": [],
    "duration_ms": 120
  }
}
```

**Partial Failure Response** (200):

```json
{
  "success": false,
  "data": {
    "total": 2,
    "created": 1,
    "updated": 0,
    "skipped": 0,
    "failed": 1,
    "errors": [
      {
        "index": 1,
        "squad_name": "squad-two",
        "error": "Validation failed: version is required"
      }
    ],
    "duration_ms": 85
  }
}
```

---

### List Public Squads (Marketplace)

Browse available squads in the marketplace.

```
GET /api/squads
```

**Authentication**: Optional

**Query Parameters**:

| Parameter  | Type    | Default | Description                 |
| ---------- | ------- | ------- | --------------------------- |
| `page`     | number  | 1       | Page number                 |
| `limit`    | number  | 20      | Items per page (max: 100)   |
| `tags`     | string  | -       | Comma-separated tag filter  |
| `author`   | string  | -       | Filter by author            |
| `search`   | string  | -       | Search in name/description  |
| `official` | boolean | -       | Filter official squads only |

**Example Request**:

```bash
# List all public squads
curl https://api.synkra.ai/api/squads

# Search with filters
curl "https://api.synkra.ai/api/squads?tags=devops,automation&search=deploy&official=true&limit=10"
```

**Success Response** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "squad_id": "devops-squad",
      "name": "devops-squad",
      "version": "2.1.0",
      "description": "DevOps automation squad",
      "author": "SynkraAI",
      "tags": ["devops", "automation", "ci-cd"],
      "is_public": true,
      "is_official": true,
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### List My Squads

List squads owned by your workspace.

```
GET /api/squads/mine
```

**Authentication**: Required

**Query Parameters**:

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | 1       | Page number    |
| `limit`   | number | 20      | Items per page |

**Example Request**:

```bash
curl https://api.synkra.ai/api/squads/mine \
  -H "Authorization: Bearer sk_your_api_key"
```

**Success Response** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "squad_id": "my-private-squad",
      "name": "my-private-squad",
      "version": "1.0.0",
      "description": "My internal squad",
      "is_public": false,
      "is_official": false,
      "sync_status": "synced",
      "last_synced_at": "2025-12-20T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

### Get Squad Details

Get detailed information about a specific squad.

```
GET /api/squads/:id
```

**Authentication**: Optional (required for private squads)

**Path Parameters**:

| Parameter | Type   | Description            |
| --------- | ------ | ---------------------- |
| `id`      | string | Squad UUID or squad_id |

**Example Request**:

```bash
# By squad_id
curl https://api.synkra.ai/api/squads/devops-squad

# By UUID
curl https://api.synkra.ai/api/squads/550e8400-e29b-41d4-a716-446655440000
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "squad_id": "devops-squad",
    "name": "devops-squad",
    "version": "2.1.0",
    "description": "DevOps automation squad for CI/CD pipelines",
    "author": "SynkraAI",
    "license": "MIT",
    "slash_prefix": "devops",
    "tags": ["devops", "automation", "ci-cd"],
    "is_public": true,
    "is_official": true,
    "manifest": {
      "name": "devops-squad",
      "version": "2.1.0",
      "aios": {
        "minVersion": "2.1.0",
        "type": "squad"
      },
      "components": {
        "agents": ["deploy-agent", "monitor-agent"],
        "tasks": ["deploy-app", "check-health"]
      }
    },
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-15T14:30:00Z"
  }
}
```

**Error Response** (404):

```json
{
  "success": false,
  "error": "Squad not found"
}
```

---

### Update Squad

Update squad visibility settings.

```
PATCH /api/squads/:id
```

**Authentication**: Required (owner only)

**Path Parameters**:

| Parameter | Type   | Description            |
| --------- | ------ | ---------------------- |
| `id`      | string | Squad UUID or squad_id |

**Request Body**:

| Field      | Type    | Description           |
| ---------- | ------- | --------------------- |
| `isPublic` | boolean | Set public visibility |

**Example Request**:

```bash
curl -X PATCH https://api.synkra.ai/api/squads/my-squad \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"isPublic": true}'
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "squad_id": "my-squad",
    "name": "my-squad",
    "is_public": true,
    "updated_at": "2025-12-26T10:00:00Z"
  }
}
```

---

### Delete Squad

Remove a squad from Synkra.

```
DELETE /api/squads/:id
```

**Authentication**: Required (owner only)

**Path Parameters**:

| Parameter | Type   | Description            |
| --------- | ------ | ---------------------- |
| `id`      | string | Squad UUID or squad_id |

**Example Request**:

```bash
curl -X DELETE https://api.synkra.ai/api/squads/my-old-squad \
  -H "Authorization: Bearer sk_your_api_key"
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Squad deleted successfully"
}
```

---

### Validate Squad

Validate squad data without persisting.

```
POST /api/squads/validate
```

**Authentication**: Optional

**Request Body**:

| Field       | Type   | Required | Description                |
| ----------- | ------ | -------- | -------------------------- |
| `squadData` | object | Yes      | Squad manifest to validate |

**Example Request**:

```bash
curl -X POST https://api.synkra.ai/api/squads/validate \
  -H "Content-Type: application/json" \
  -d '{
    "squadData": {
      "name": "test-squad",
      "version": "1.0.0"
    }
  }'
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": ["Missing recommended field: description", "Missing aios.minVersion field"]
  }
}
```

**Validation Failure Response** (200):

```json
{
  "success": false,
  "data": {
    "valid": false,
    "errors": ["name is required", "version must be valid semver"],
    "warnings": []
  }
}
```

---

## Error Codes

| HTTP Code | Meaning                                |
| --------- | -------------------------------------- |
| 200       | Success                                |
| 400       | Bad Request - Invalid input            |
| 401       | Unauthorized - Missing or invalid auth |
| 403       | Forbidden - Insufficient permissions   |
| 404       | Not Found - Squad doesn't exist        |
| 500       | Internal Server Error                  |

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

## Rate Limits

| Plan       | Requests/min | Requests/day |
| ---------- | ------------ | ------------ |
| Free       | 60           | 1,000        |
| Pro        | 300          | 10,000       |
| Enterprise | Unlimited    | Unlimited    |

Rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703577600
```

---

## CLI Integration

The `*sync-squad-synkra` command uses this API:

```bash
# Sync single squad
@squad-creator
*sync-squad-synkra ./squads/my-squad --public

# Batch sync all squads
*sync-squad-synkra ./squads/* --public
```

Configure API key:

```bash
export SYNKRA_API_TOKEN="sk_your_api_key"
```

---

## Postman Collection

Import this collection into Postman or Insomnia:

```json
{
  "info": {
    "name": "Synkra Squads API",
    "description": "REST API for Synkra Squad Marketplace",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api.synkra.ai"
    },
    {
      "key": "apiKey",
      "value": "sk_your_api_key"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{apiKey}}"
      }
    ]
  },
  "item": [
    {
      "name": "Sync",
      "item": [
        {
          "name": "Sync Squad",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/squads/sync",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"squadData\": {\n    \"name\": \"my-squad\",\n    \"version\": \"1.0.0\",\n    \"description\": \"My squad\",\n    \"aios\": {\n      \"minVersion\": \"2.1.0\",\n      \"type\": \"squad\"\n    }\n  },\n  \"isPublic\": false\n}"
            }
          }
        },
        {
          "name": "Batch Sync",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/squads/sync/batch",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"squads\": [\n    {\"name\": \"squad-1\", \"version\": \"1.0.0\"},\n    {\"name\": \"squad-2\", \"version\": \"1.0.0\"}\n  ],\n  \"isPublic\": false\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Marketplace",
      "item": [
        {
          "name": "List Public Squads",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/squads?page=1&limit=20",
              "query": [
                { "key": "page", "value": "1" },
                { "key": "limit", "value": "20" },
                { "key": "tags", "value": "devops", "disabled": true },
                { "key": "search", "value": "", "disabled": true },
                { "key": "official", "value": "true", "disabled": true }
              ]
            }
          }
        },
        {
          "name": "Get Squad Details",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/squads/devops-squad"
          }
        }
      ]
    },
    {
      "name": "Management",
      "item": [
        {
          "name": "List My Squads",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/squads/mine"
          }
        },
        {
          "name": "Update Squad Visibility",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/api/squads/my-squad",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"isPublic\": true\n}"
            }
          }
        },
        {
          "name": "Delete Squad",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/squads/my-squad"
          }
        }
      ]
    },
    {
      "name": "Validation",
      "item": [
        {
          "name": "Validate Squad",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/squads/validate",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"squadData\": {\n    \"name\": \"test-squad\",\n    \"version\": \"1.0.0\"\n  }\n}"
            }
          }
        }
      ]
    }
  ]
}
```

Save the JSON above as `synkra-squads-api.postman_collection.json` and import into Postman.

---

## Related Resources

- [Squad Development Guide](../guides/squads-guide.md)
- [Contributing Squads](../guides/contributing-squads.md)
- [@squad-creator Agent](../../.aios-core/development/agents/squad-creator.md)

---

**Version:** 1.0.0 | **Updated:** 2025-12-26 | **Story:** SQS-8
