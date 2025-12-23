# Story SQS-5: SquadSyncService for Synkra API

<!-- Source: Epic SQS - Squad System Enhancement -->
<!-- Context: Synkra API integration for squad marketplace -->
<!-- Architecture: ADR-SQS-001 approved 2025-12-18 -->
<!-- Reference: Follow patterns from Epic 016, Story 016.2 (TaskSyncService) -->
<!-- Primary Project: synkra (C:\Users\AllFluence-User\Workspaces\SynkraAi\synkra) -->

## Status: Ready for Review

## Story

**As an** AIOS developer,
**I want** to sync my squads to the Synkra API,
**so that** I can share them in the marketplace and enable discovery by other users.

## Background

This story implements the backend service for squad synchronization with Synkra API, following the same patterns established by `taskSyncService.js` (Story 016.2, Epic 016).

### Distribution Model Context

```
┌────────────────────────────────────────────────────────┐
│                 SQUAD DISTRIBUTION                      │
├────────────────────────────────────────────────────────┤
│ 1. LOCAL (Privado)     ← SQS-4 (Done)                  │
│ 2. AIOS-SQUADS (Público) ← SQS-6                       │
│ 3. SYNKRA API (Marketplace) ← THIS STORY               │
└────────────────────────────────────────────────────────┘
```

### Cross-Project Execution

> **IMPORTANTE:** Esta story é executada em **2 projetos**:
>
> | Projeto | Path | Tasks |
> |---------|------|-------|
> | **synkra** | `C:\Users\AllFluence-User\Workspaces\SynkraAi\synkra` | Tasks 1-3, 5-6 (backend) |
> | **aios-core** | `C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core` | Task 4 (client task) |

### Reference Implementation

Esta story segue os padrões estabelecidos no **Epic 016** do projeto Synkra:

| Story | Status | Padrão Usado |
|-------|--------|--------------|
| 016.2 TaskSyncService | ✅ Done | Class structure, syncAll(), checksum, validation |
| 016.3 Schema Migration | ✅ Done | Migration format, workspaces FK |

**Arquivo de referência:** `synkra/api/src/services/taskSyncService.js` (1010 linhas)

## Acceptance Criteria

1. `squadSyncService.js` created following `taskSyncService.js` patterns
2. Database migration creates `synkra_squads` table with proper schema
3. REST API endpoint `POST /api/squads/sync` syncs squad to database
4. REST API endpoint `GET /api/squads` returns public squads list
5. REST API endpoint `GET /api/squads/:id` returns squad details
6. Sync validates squad against JSON Schema before persisting
7. Checksum calculation prevents unnecessary re-syncs
8. Private squads remain workspace-scoped (not public)
9. Official squads flagged with `is_official: true`
10. Task `*sync-squad-synkra` implemented in aios-core

## Tasks / Subtasks

### Task 1: Create SquadSyncService (AC: 1, 6, 7)

**Responsável:** @dev (Dex)
**Atomic Layer:** Service
**Project:** `synkra`
**Path:** `C:\Users\AllFluence-User\Workspaces\SynkraAi\synkra`

**Arquivo:** `api/src/services/squadSyncService.js`

```javascript
/**
 * ============================================================================
 * SquadSyncService - Story SQS-5 (Epic SQS)
 * ============================================================================
 * One-way sync service for squad definitions to Synkra API.
 * Based on taskSyncService.js patterns from Story 016.2.
 *
 * Features:
 *   - syncAll(options) - Sync all squads from directory
 *   - syncSquad(squadPath, workspaceId) - Sync single squad
 *   - validateSquad(squadData) - Validate against JSON Schema
 *   - getChecksum(filePath) - Calculate SHA-256 checksum
 *   - listPublicSquads(options) - List public squads
 *
 * Reference: api/src/services/taskSyncService.js
 * ============================================================================
 */

import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';
import pool from '../config/database.js';
import logger from '../utils/logger.js';

const EVENT_TYPES = {
  SYNC_STARTED: 'sync_started',
  SQUAD_SYNCED: 'squad_synced',
  SQUAD_CREATED: 'squad_created',
  SQUAD_UPDATED: 'squad_updated',
  SQUAD_SKIPPED: 'squad_skipped',
  SQUAD_FAILED: 'squad_failed',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed'
};

class SquadSyncService {
  constructor(db = pool, options = {}) {
    this.db = db;
    this.options = options;
  }

  // Sync all squads from a directory
  async syncAll(dirPath, workspaceId, options = {}) { }

  // Sync single squad
  async syncSquad(squadPath, workspaceId, options = {}) { }

  // Validate squad before sync
  validateSquad(squadData) { }

  // Calculate checksum for change detection
  async getChecksum(filePath) {
    const content = await readFile(filePath, 'utf8');
    return createHash('sha256').update(content).digest('hex');
  }

  // Watch directory for changes
  watchDirectory(dirPath, callback) { }

  // Get squad by ID
  async getSquad(squadId) { }

  // List public squads
  async listPublicSquads(options = {}) { }

  // Log sync event
  async logSyncEvent(event) { }
}

export const squadSyncService = new SquadSyncService();
export default squadSyncService;
```

- [x] 1.1 Criar classe `SquadSyncService` seguindo padrões de taskSyncService.js
- [x] 1.2 Implementar `syncAll()` para sync em batch (50 files per batch)
- [x] 1.3 Implementar `syncSquad()` para sync individual
- [x] 1.4 Implementar `validateSquad()` com JSON Schema (reuse squad-schema.json)
- [x] 1.5 Implementar `getChecksum()` SHA-256 para detecção de mudanças
- [x] 1.6 Implementar `watchDirectory()` com fs.watch e debounce 500ms
- [x] 1.7 Implementar `logSyncEvent()` para synkra_sync_events
- [x] 1.8 Usar ES modules (import/export) como taskSyncService.js

### Task 2: Database Migration (AC: 2)

**Responsável:** @dev (Dex)
**Atomic Layer:** Database
**Project:** `synkra`
**Path:** `C:\Users\AllFluence-User\Workspaces\SynkraAi\synkra`

**Arquivo:** `supabase/migrations/YYYYMMDD_create_synkra_squads.sql`

> **Nota:** A tabela `workspaces` já existe (migration 20251130000001_rename_teams_to_workspaces.sql)

```sql
-- ============================================================================
-- Story SQS-5: Create synkra_squads table
-- ============================================================================
-- Purpose: Store synchronized squad definitions for marketplace
--
-- Reference: Story 016.2 (TaskSyncService) for patterns
-- ADR Reference: ADR-SQS-001
-- ============================================================================

BEGIN;

-- ============================================================================
-- CREATE SYNKRA_SQUADS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS synkra_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  version VARCHAR(20) NOT NULL,
  description TEXT,
  author VARCHAR(200),
  license VARCHAR(50) DEFAULT 'MIT',
  slash_prefix VARCHAR(50),
  min_aios_version VARCHAR(20),

  -- JSONB fields for complex data
  components JSONB DEFAULT '{}',
  config JSONB DEFAULT '{}',
  dependencies JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Sync metadata
  source_path TEXT,
  checksum VARCHAR(64),
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(20) DEFAULT 'synced',

  -- Visibility
  is_public BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,

  -- Multi-tenant
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_synkra_squads_workspace
  ON synkra_squads(workspace_id);

CREATE INDEX IF NOT EXISTS idx_synkra_squads_public
  ON synkra_squads(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_synkra_squads_official
  ON synkra_squads(is_official) WHERE is_official = true;

CREATE INDEX IF NOT EXISTS idx_synkra_squads_name
  ON synkra_squads(name);

CREATE INDEX IF NOT EXISTS idx_synkra_squads_checksum
  ON synkra_squads(checksum);

CREATE INDEX IF NOT EXISTS idx_synkra_squads_tags
  ON synkra_squads USING GIN(tags);

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE TRIGGER update_synkra_squads_updated_at
  BEFORE UPDATE ON synkra_squads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE synkra_squads ENABLE ROW LEVEL SECURITY;

-- Public squads are readable by everyone
CREATE POLICY synkra_squads_public_read ON synkra_squads
  FOR SELECT USING (is_public = true);

-- Workspace members can read their squads
CREATE POLICY synkra_squads_workspace_read ON synkra_squads
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

-- Only workspace members can insert/update their squads
CREATE POLICY synkra_squads_workspace_write ON synkra_squads
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

COMMIT;
```

- [x] 2.1 Criar arquivo de migration com timestamp
- [x] 2.2 Definir schema completo com todos os campos
- [x] 2.3 Criar indexes para queries comuns
- [x] 2.4 Adicionar trigger para `updated_at`
- [x] 2.5 Configurar RLS policies para multi-tenant
- [ ] 2.6 Testar migration com `supabase db push`

### Task 3: REST API Endpoints (AC: 3, 4, 5, 8, 9)

**Responsável:** @dev (Dex)
**Atomic Layer:** API
**Project:** `synkra`
**Path:** `C:\Users\AllFluence-User\Workspaces\SynkraAi\synkra`

**Arquivo:** `api/src/routes/squads.js`

```javascript
/**
 * Squad API Routes - Story SQS-5
 *
 * Endpoints:
 *   POST /api/squads/sync     - Sync squad from local project
 *   POST /api/squads/sync/:id - Sync specific squad
 *   GET  /api/squads          - List public squads
 *   GET  /api/squads/:id      - Get squad details
 *   DELETE /api/squads/:id    - Remove squad (owner only)
 *   GET  /api/squads/status   - Sync status
 */

import express from 'express';
import { squadSyncService } from '../services/squadSyncService.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /api/squads/sync - Sync squad from request body
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const { squadData, workspaceId } = req.body;
    const result = await squadSyncService.syncSquad(squadData, workspaceId);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Squad sync failed', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/squads - List public squads
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, tags, author, search } = req.query;
    const squads = await squadSyncService.listPublicSquads({
      page: parseInt(page),
      limit: parseInt(limit),
      tags: tags?.split(','),
      author,
      search
    });
    res.json({ success: true, data: squads });
  } catch (error) {
    logger.error('Failed to list squads', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/squads/:id - Get squad details
router.get('/:id', async (req, res) => {
  try {
    const squad = await squadSyncService.getSquad(req.params.id);
    if (!squad) {
      return res.status(404).json({ success: false, error: 'Squad not found' });
    }
    res.json({ success: true, data: squad });
  } catch (error) {
    logger.error('Failed to get squad', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/squads/:id - Remove squad (owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await squadSyncService.deleteSquad(req.params.id, req.user.workspaceId);
    res.json({ success: true, message: 'Squad deleted' });
  } catch (error) {
    logger.error('Failed to delete squad', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
```

**Arquivo para modificar:** `api/src/app.js`

```javascript
// Add to imports
import squadsRouter from './routes/squads.js';

// Add to routes
app.use('/api/squads', squadsRouter);
```

- [x] 3.1 Criar `api/src/routes/squads.js`
- [x] 3.2 Implementar `POST /api/squads/sync`
- [x] 3.3 Implementar `GET /api/squads` com filtros e paginação
- [x] 3.4 Implementar `GET /api/squads/:id`
- [x] 3.5 Implementar `DELETE /api/squads/:id`
- [x] 3.6 Registrar router em `app.js`
- [ ] 3.7 Documentar API (OpenAPI/Swagger opcional)

### Task 4: Implement *sync-squad-synkra Task (AC: 10)

**Responsável:** @dev (Dex)
**Atomic Layer:** Task
**Project:** `aios-core`
**Path:** `C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core`

**Arquivo:** `.aios-core/development/tasks/squad-creator-sync-synkra.md`

> **Note:** Placeholder file exists from SQS-4, needs full implementation.

```markdown
---
task: Sync Squad to Synkra
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - squad_path: Caminho do squad para sincronizar (obrigatório)
  - visibility: public | private (default: private)
  - official: Flag para marcar como oficial (--official, apenas SynkraAI)
Saida: |
  - sync_result: Resultado do sync (created | updated | skipped)
  - squad_url: URL do squad no marketplace
  - checksum: Checksum do squad sincronizado
Checklist:
  - "[ ] Validar squad localmente"
  - "[ ] Obter token de autenticação"
  - "[ ] Calcular checksum"
  - "[ ] Enviar para Synkra API"
  - "[ ] Exibir URL do marketplace"
---

# *sync-squad-synkra

Sincroniza um squad local para o Synkra API marketplace.

## Uso

@squad-creator

# Sync privado (apenas workspace)
*sync-squad-synkra ./squads/meu-squad

# Sync público (visível para todos)
*sync-squad-synkra ./squads/meu-squad --public

# Preview sem sincronizar
*sync-squad-synkra ./squads/meu-squad --dry-run

## Autenticação

Requer autenticação com Synkra API:

export SYNKRA_API_TOKEN="seu-token"

Ou configure em .env:

SYNKRA_API_URL=https://api.synkra.dev
SYNKRA_API_TOKEN=seu-token

## Output Exemplo

Syncing squad: ./squads/meu-squad/

Validation: PASSED
Checksum: a1b2c3d4e5f6...
Visibility: private

Syncing to Synkra API...

Squad synced successfully!
  Status: created
  ID: 550e8400-e29b-41d4-a716-446655440000
  URL: https://synkra.dev/squads/meu-squad

Next steps:
  - View in marketplace: https://synkra.dev/squads/meu-squad
  - Make public: *sync-squad-synkra ./squads/meu-squad --public
```

- [x] 4.1 Implementar task completa (substituir placeholder)
- [x] 4.2 Criar Synkra API client helper
- [x] 4.3 Implementar autenticação via SYNKRA_API_TOKEN
- [x] 4.4 Validar squad antes de sync (usar squad-validator.js)
- [x] 4.5 Suportar flags: `--public`, `--private`, `--dry-run`
- [x] 4.6 Exibir URL do squad no marketplace após sync

### Task 5: Unit Tests

**Responsável:** @qa (Quinn)
**Atomic Layer:** Test
**Project:** `synkra`
**Path:** `C:\Users\AllFluence-User\Workspaces\SynkraAi\synkra`

**Arquivo:** `api/__tests__/services/squadSyncService.test.js`

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SquadSyncService } from '../../src/services/squadSyncService.js';

describe('SquadSyncService', () => {
  describe('syncSquad', () => {
    it('should sync valid squad to database');
    it('should calculate and store checksum');
    it('should skip unchanged squads');
    it('should reject invalid squads');
  });

  describe('validateSquad', () => {
    it('should validate required fields');
    it('should reject invalid squad_id format');
    it('should accept valid squad data');
  });

  describe('listPublicSquads', () => {
    it('should return only public squads');
    it('should support pagination');
    it('should support filtering by tags');
  });

  describe('getChecksum', () => {
    it('should return SHA-256 hash');
    it('should detect file changes');
  });
});
```

- [x] 5.1 Test: syncSquad() persiste dados corretamente
- [x] 5.2 Test: syncAll() processa múltiplos squads
- [x] 5.3 Test: validateSquad() rejeita squads inválidos
- [x] 5.4 Test: getChecksum() detecta mudanças
- [x] 5.5 Test: API endpoints retornam dados corretos
- [x] 5.6 Test: Private squads não aparecem em listagem pública
- [ ] 5.7 Coverage >= 80%

### Task 6: Integration Tests

**Responsável:** @qa (Quinn)
**Atomic Layer:** Integration Test
**Project:** Both (synkra + aios-core)

**Arquivo synkra:** `api/__tests__/integration/squads.test.js`

- [x] 6.1 Test: Fluxo completo create → sync → list
- [x] 6.2 Test: Sync com workspace autenticado
- [x] 6.3 Test: Re-sync detecta mudanças via checksum
- [ ] 6.4 Test: *sync-squad-synkra funciona end-to-end (aios-core)

## Dev Notes

### Pattern Reference (Story 016.2)

O `taskSyncService.js` implementa:

```javascript
// Key patterns to follow:
class TaskSyncService {
  // Batch processing with Promise.allSettled
  async syncAll(dirPath, options = {}) {
    const files = await this.getTaskFiles(dirPath);
    const batches = this.chunkArray(files, BATCH_SIZE);
    // ...
  }

  // Checksum for change detection
  async getChecksum(filePath) {
    const content = await readFile(filePath, 'utf8');
    return createHash('sha256').update(content).digest('hex');
  }

  // Event logging to synkra_sync_events
  async logSyncEvent(event) {
    await this.db.query(`INSERT INTO synkra_sync_events ...`);
  }
}
```

### API Authentication

```javascript
// Synkra API uses JWT tokens
const response = await fetch(`${SYNKRA_API_URL}/api/squads/sync`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SYNKRA_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(squadData)
});
```

### Visibility Rules

| Visibility | Who Can See | Who Can Sync |
|------------|-------------|--------------|
| Private | Workspace members only | Owner only |
| Public | Everyone | Owner only |
| Official | Everyone (featured) | SynkraAI team |

### Existing Infrastructure (synkra)

| Component | Path | Status |
|-----------|------|--------|
| Database pool | `api/src/config/database.js` | ✅ Exists |
| Logger | `api/src/utils/logger.js` | ✅ Exists |
| Auth middleware | `api/src/middleware/auth.js` | ✅ Exists |
| Sync events table | `synkra_sync_events` | ✅ Exists (016.3) |
| Workspaces table | `workspaces` | ✅ Exists (013.1) |

## Dependencies

- **Upstream:** SQS-4 (Squad Creator Agent) - ✅ DONE
- **Downstream:** SQS-6 (Download & Publish needs API)
- **External:**
  - Synkra API infrastructure (Railway deployment)
  - Supabase database

## Risk Assessment

### Implementation Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Pattern deviation from taskSyncService | Low | Medium | Code review against 016.2 |
| Authentication issues | Low | High | Reuse existing auth middleware |
| Database migration conflicts | Low | Medium | Test migration in staging first |
| Cross-project coordination | Medium | Low | Clear task assignment per project |

### Rollback Plan

- Service is new, no existing functionality affected
- Database migration has down script
- API endpoints can be disabled via feature flag

## Effort Estimate

| Task | Estimate | Project |
|------|----------|---------|
| Task 1: SquadSyncService | 4h | synkra |
| Task 2: Database Migration | 1h | synkra |
| Task 3: REST API Endpoints | 3h | synkra |
| Task 4: *sync-squad-synkra | 2h | aios-core |
| Task 5: Unit Tests | 2h | synkra |
| Task 6: Integration Tests | 2h | both |
| **Total** | **14h** | |

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-23 | 1.0 | Story created from Epic SQS | @po (Pax) |
| 2025-12-23 | 1.1 | Added cross-project execution, Epic 016 reference, corrected paths | @po (Pax) |
| 2025-12-23 | 2.0 | Full implementation: SquadSyncService, API routes, migration, tests | @dev (Dex) |

## Dev Agent Record

### Agent Model Used
- **Model:** claude-opus-4-5-20251101
- **Agent:** @dev (Dex)
- **Mode:** yolo (autonomous)

### Implementation Notes
- Created SquadSyncService following taskSyncService.js patterns (1010 lines reference)
- Used ES modules (import/export) throughout
- Added SHA-256 checksum for change detection
- Batch processing with Promise.allSettled (50 files per batch)
- Full RLS policies for multi-tenant support
- Added `optionalAuth` middleware for public endpoint support

### Remaining Items
- [ ] 2.6 Run migration with `supabase db push`
- [ ] 3.7 OpenAPI/Swagger documentation (optional)
- [ ] 5.7 Verify test coverage >= 80%
- [ ] 6.4 End-to-end test for *sync-squad-synkra

### Debug Log References
None - Clean implementation

---

**Story Points:** 8
**Sprint:** 8
**Priority:** High
**Epic:** [SQS - Squad System Enhancement](../../../epics/current/epic-sqs-squad-system.md)
**Reference:** [Epic 016 - Story 016.2](C:\Users\AllFluence-User\Workspaces\SynkraAi\synkra\docs\stories\active\epic-016\sprint-2\016.2.task-sync-service.md)

---

## File List

Files created/modified in this story:

### Project: synkra (`C:\Users\AllFluence-User\Workspaces\SynkraAi\synkra`)

| File | Action | Task | Status |
|------|--------|------|--------|
| `api/src/services/squadSyncService.js` | CREATE | Task 1 | ✅ Done |
| `supabase/migrations/20251223000001_create_synkra_squads.sql` | CREATE | Task 2 | ✅ Done |
| `supabase/migrations/rollback_20251223000001_create_synkra_squads.sql` | CREATE | Task 2 | ✅ Done |
| `api/src/routes/squads.js` | CREATE | Task 3 | ✅ Done |
| `api/src/app.js` | MODIFY | Task 3 | ✅ Done |
| `api/src/middleware/auth.js` | MODIFY | Task 3 | ✅ Done (added optionalAuth) |
| `api/__tests__/services/squadSyncService.test.js` | CREATE | Task 5 | ✅ Done |
| `api/__tests__/integration/squads.test.js` | CREATE | Task 6 | ✅ Done |

### Project: aios-core (`C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core`)

| File | Action | Task | Status |
|------|--------|------|--------|
| `.aios-core/development/tasks/squad-creator-sync-synkra.md` | MODIFY | Task 4 | ✅ Done |

**Total: 9 files (6 created, 3 modified)**
