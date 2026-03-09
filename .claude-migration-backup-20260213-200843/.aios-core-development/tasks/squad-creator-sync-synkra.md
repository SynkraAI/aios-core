---
task: Sync Squad to Synkra
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
status: active
sprint: 8
story: SQS-5
version: 1.0.0
Entrada: |
  - squad_path: Caminho do squad para sincronizar (obrigatório)
  - visibility: public | private (default: private)
  - official: Flag para marcar como oficial (--official, apenas SynkraAI)
  - dry_run: Preview sem sincronizar (--dry-run)
Saida: |
  - sync_result: Resultado do sync (created | updated | skipped)
  - squad_url: URL do squad no marketplace (quando público)
  - squad_id: ID único do squad
  - checksum: Checksum do squad sincronizado
Checklist:
  - "[x] Validar squad localmente"
  - "[x] Obter token de autenticação"
  - "[x] Calcular checksum"
  - "[x] Enviar para Synkra API"
  - "[x] Exibir URL do marketplace"
---

# *sync-squad-synkra

Sincroniza um squad local para o Synkra API marketplace.

## Uso

```bash
@squad-creator

# Sync privado (apenas workspace)
*sync-squad-synkra ./squads/meu-squad

# Sync público (visível para todos)
*sync-squad-synkra ./squads/meu-squad --public

# Preview sem sincronizar
*sync-squad-synkra ./squads/meu-squad --dry-run

# Sync com verbosidade
*sync-squad-synkra ./squads/meu-squad --verbose
```

## Autenticação

Requer autenticação com Synkra API:

```bash
export SYNKRA_API_TOKEN="seu-token"
```

Ou configure em `.env`:

```env
SYNKRA_API_URL=https://api.synkra.dev/api
SYNKRA_API_TOKEN=seu-token
```

Para obter um token:
1. Acesse https://synkra.dev/settings/api-keys
2. Crie uma nova API key com permissões de sync
3. Configure a variável de ambiente

## Output Exemplo

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *sync-squad-synkra
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Squad: ./squads/meu-squad/

Step 1: Local Validation
  ✓ Found squad.yaml
  ✓ Name: meu-squad
  ✓ Version: 1.0.0
  ✓ Schema validation: PASSED

Step 2: Calculate Checksum
  ✓ Checksum: a1b2c3d4e5f6...

Step 3: Sync to Synkra API
  ✓ Visibility: private
  ✓ API URL: https://api.synkra.dev/api

Syncing to Synkra API...

✅ Squad synced successfully!

  Status:   created
  ID:       550e8400-e29b-41d4-a716-446655440000
  Checksum: a1b2c3d4e5f6...

Next steps:
  - View squad: *describe-squad meu-squad
  - Make public: *sync-squad-synkra ./squads/meu-squad --public
```

## Flags

| Flag | Descrição | Default |
|------|-----------|---------|
| `--public` | Torna o squad visível no marketplace público | false |
| `--private` | Mantém squad privado (apenas workspace) | true |
| `--dry-run` | Preview sem enviar para API | false |
| `--verbose` | Output detalhado | false |
| `--official` | Marca como squad oficial (apenas SynkraAI team) | false |
| `--force` | Ignora warnings e força sync | false |

## Workflow

```
┌──────────────────────────────────────────────────┐
│              *sync-squad-synkra                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  1. Parse Arguments                               │
│     ↓                                             │
│  2. Find squad.yaml                               │
│     ↓                                             │
│  3. Validate with squad-validator.js              │
│     ↓ (fail → abort)                              │
│  4. Calculate SHA-256 checksum                    │
│     ↓                                             │
│  5. Check SYNKRA_API_TOKEN                        │
│     ↓ (missing → abort)                           │
│  6. If --dry-run: show preview and exit           │
│     ↓                                             │
│  7. POST to /api/squads/sync                      │
│     ↓                                             │
│  8. Display result and marketplace URL            │
│                                                   │
└──────────────────────────────────────────────────┘
```

## API Integration

### Request

```javascript
POST ${SYNKRA_API_URL}/squads/sync
Authorization: Bearer ${SYNKRA_API_TOKEN}
Content-Type: application/json

{
  "squadData": {
    "name": "meu-squad",
    "version": "1.0.0",
    "description": "...",
    "author": "...",
    "license": "MIT",
    "components": {...},
    "tags": [...]
  },
  "isPublic": false,
  "isOfficial": false
}
```

### Response (Success)

```json
{
  "success": true,
  "data": {
    "action": "created",
    "squad_id": "meu-squad",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "version": "1.0.0"
  },
  "duration_ms": 150
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Validation failed: Missing required field: version"
}
```

## Implementation Guide

### For Agent Execution

```javascript
// 1. Parse squad path from arguments
const squadPath = args[0] || '.';
const flags = parseFlags(args);

// 2. Find and read squad.yaml
const squadYamlPath = path.join(squadPath, 'squad.yaml');
if (!fs.existsSync(squadYamlPath)) {
  error(`squad.yaml not found in ${squadPath}`);
  return;
}

// 3. Validate with squad-validator.js
const { validateSquad } = await import('.aios-core/development/scripts/squad/squad-validator.js');
const validation = await validateSquad(squadYamlPath);

if (!validation.valid) {
  error(`Validation failed: ${validation.errors.join(', ')}`);
  return;
}

if (validation.warnings.length > 0 && !flags.force) {
  warn(`Warnings: ${validation.warnings.join(', ')}`);
  // Consider prompting user to continue
}

// 4. Read and parse squad data
const squadContent = fs.readFileSync(squadYamlPath, 'utf8');
const squadData = parseYaml(squadContent);

// 5. Calculate checksum
const checksum = crypto.createHash('sha256')
  .update(squadContent)
  .digest('hex');

// 6. Check authentication
const apiToken = process.env.SYNKRA_API_TOKEN;
const apiUrl = process.env.SYNKRA_API_URL || 'https://api.synkra.dev/api';

if (!apiToken) {
  error('SYNKRA_API_TOKEN not set. See task docs for authentication.');
  return;
}

// 7. Dry run check
if (flags.dryRun) {
  output(`
DRY RUN - Would sync:
  Squad: ${squadData.name}
  Version: ${squadData.version}
  Checksum: ${checksum}
  Visibility: ${flags.public ? 'public' : 'private'}
  `);
  return;
}

// 8. Call Synkra API
const response = await fetch(`${apiUrl}/squads/sync`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    squadData: {
      ...squadData,
      checksum,
      raw_content: squadContent
    },
    isPublic: flags.public,
    isOfficial: flags.official
  })
});

const result = await response.json();

// 9. Display result
if (result.success) {
  output(`
✅ Squad synced successfully!

  Status:   ${result.data.action}
  ID:       ${result.data.id}
  Squad ID: ${result.data.squad_id}
  `);

  if (flags.public) {
    output(`  URL: https://synkra.dev/squads/${result.data.squad_id}`);
  }
} else {
  error(`Sync failed: ${result.error}`);
}
```

## Error Handling

| Error | Causa | Solução |
|-------|-------|---------|
| `squad.yaml not found` | Caminho inválido | Verifique o path do squad |
| `Validation failed` | Squad não passa na validação | Execute `*validate-squad` primeiro |
| `SYNKRA_API_TOKEN not set` | Token não configurado | Configure a variável de ambiente |
| `401 Unauthorized` | Token inválido ou expirado | Gere novo token em synkra.dev |
| `403 Forbidden` | Sem permissão para operação | Verifique permissões da API key |
| `Squad not found or not owned` | Tentando atualizar squad de outro workspace | Verifique ownership |

## Related Tasks

- `*create-squad` - Criar novo squad local
- `*validate-squad` - Validar squad antes de sync
- `*describe-squad` - Ver detalhes do squad
- `*list-squads` - Listar squads disponíveis

## Related Story

- **SQS-5:** SquadSyncService for Synkra API (Sprint 8)

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-12-23 | Full implementation (Story SQS-5) |
| 0.1.0 | 2025-12-18 | Initial placeholder |
