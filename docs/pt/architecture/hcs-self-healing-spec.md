<!-- Tradução: PT-BR | Original: /docs/en/architecture/hcs-self-healing-spec.md | Sincronização: 2026-01-26 -->

# Especificação de Auto-Recuperação do HCS

> 🌐 [EN](../../architecture/hcs-self-healing-spec.md) | **PT** | [ES](../../es/architecture/hcs-self-healing-spec.md)

---

**Versão:** 1.0
**Status:** Proposto
**Criado:** 2025-12-30
**Story:** Investigação HCS-1
**Autor:** @architect (Aria) via @dev (Dex)

---

## Índice

- [Resumo Executivo](#resumo-executivo)
- [Filosofia de Auto-Recuperação](#filosofia-de-auto-recuperação)
- [Definições de Níveis](#definições-de-níveis)
- [Regras de Segurança](#regras-de-segurança)
- [Estratégia de Backup](#estratégia-de-backup)
- [Procedimentos de Rollback](#procedimentos-de-rollback)
- [Diretrizes de Implementação](#diretrizes-de-implementação)

---

## Resumo Executivo

Este documento especifica as capacidades de auto-recuperação do Sistema de Verificação de Saúde do AIOS (HCS). A auto-recuperação permite que o sistema corrija automaticamente certos problemas enquanto mantém a segurança e o controle do usuário.

### Princípios Fundamentais

1. **Segurança em Primeiro Lugar:** Nunca modificar arquivos que possam causar perda de dados ou problemas de segurança
2. **Transparência:** Todas as ações são registradas e reversíveis
3. **Controle do Usuário:** Correções críticas requerem confirmação explícita
4. **Incremental:** Começar com correções seguras, escalar para o usuário em casos complexos

---

## Filosofia de Auto-Recuperação

### Padrões da Indústria Aplicados

| Sistema        | Abordagem de Auto-Recuperação                  | Lição para o HCS                                         |
| -------------- | ---------------------------------------------- | -------------------------------------------------------- |
| **Kubernetes** | Reiniciar containers em falha de liveness      | Recuperação automática para operações seguras conhecidas |
| **VS Code**    | Auto-atualizar extensões, bloquear maliciosas  | Atualizações silenciosas, bloqueios explícitos           |
| **Terraform**  | `apply` apenas após aprovação do `plan`        | Separar detecção de remediação                           |
| **npm/yarn**   | `--update-checksums` para corrigir integridade | Comandos de recuperação iniciados pelo usuário           |
| **Git**        | `reflog` para recuperação                      | Sempre preservar histórico/backups                       |

### Árvore de Decisão

```
Problema Detectado
     │
     ▼
┌─────────────────┐
│ A correção é    │
│ trivial e       │
│ reversível?     │
└────────┬────────┘
         │
    Sim  │  Não
    ▼    │  ▼
┌────────┴──────────┐
│                   │
▼                   ▼
Nível 1          ┌─────────────────┐
Auto-corrigir    │ A correção      │
silenciosamente  │ modifica dados/ │
                 │ código do       │
                 │ usuário?        │
                 └────────┬────────┘
                          │
                     Não  │   Sim
                     ▼    │   ▼
                 ┌────────┴──────────┐
                 │                   │
                 ▼                   ▼
              Nível 2            Nível 3
              Solicitar          Guia
              Usuário            Manual
```

---

## Definições de Níveis

### Nível 1: Auto-Correção Silenciosa

**Definição:** Operações seguras e reversíveis que não requerem confirmação do usuário.

**Características:**

- Zero risco de perda de dados
- Totalmente reversível
- Sem alterações em código/configuração do usuário
- Apenas arquivos de sistema/framework
- Backup sempre criado

**Ações:**

| Ação                   | Descrição                                                | Backup        |
| ---------------------- | -------------------------------------------------------- | ------------- |
| `recreate_config`      | Recriar `.aios/config.yaml` ausente a partir do template | Sim           |
| `clear_cache`          | Limpar arquivos de cache obsoletos em `.aios/cache/`     | Sim           |
| `create_dirs`          | Criar diretórios de framework ausentes                   | Não (aditivo) |
| `fix_permissions`      | Corrigir permissões de arquivos do framework             | Sim           |
| `regenerate_lockfile`  | Regenerar integridade do lockfile de pacotes             | Sim           |
| `restart_mcp`          | Reiniciar servidores MCP não responsivos                 | Não           |
| `reset_project_status` | Resetar arquivo de status do projeto corrompido          | Sim           |

**Exemplos de Problemas:**

```yaml
# Problemas de Nível 1 - auto-corrigir silenciosamente
- id: PC-001
  description: '.aios/config.yaml ausente'
  severity: CRITICAL
  tier: 1
  action: recreate_config
  message: 'Config recriado a partir do template'

- id: LE-005
  description: 'Servidor MCP não respondendo'
  severity: HIGH
  tier: 1
  action: restart_mcp
  message: 'Servidor MCP reiniciado'

- id: RH-008
  description: '.gitignore incompleto'
  severity: LOW
  tier: 1
  action: append_gitignore
  message: 'Entradas ausentes adicionadas ao .gitignore'
```

**Notificação ao Usuário:**

```
✅ 3 problemas auto-corrigidos:
   • Recriado .aios/config.yaml (backup: .aios/backups/config.yaml.1735564800)
   • Reiniciado servidor MCP context7
   • Adicionado .aios/cache/ ao .gitignore
```

---

### Nível 2: Auto-Correção com Confirmação

**Definição:** Operações de risco moderado que requerem confirmação do usuário antes da execução.

**Características:**

- Pode modificar arquivos adjacentes ao usuário (não código do usuário)
- Reversível com backup
- Pode afetar o fluxo de trabalho temporariamente
- Requer "sim" explícito do usuário

**Ações:**

| Ação                  | Descrição                               | Backup | Prompt do Usuário                   |
| --------------------- | --------------------------------------- | ------ | ----------------------------------- |
| `update_deps`         | Atualizar dependências desatualizadas   | Sim    | "Atualizar X pacotes?"              |
| `fix_symlinks`        | Reparar links simbólicos quebrados      | Sim    | "Corrigir N links quebrados?"       |
| `regenerate_files`    | Regenerar arquivos baseados em template | Sim    | "Regenerar a partir do template?"   |
| `fix_ide_config`      | Reparar configuração da IDE             | Sim    | "Reparar configurações do VS Code?" |
| `migrate_config`      | Migrar config para nova versão          | Sim    | "Migrar config v1→v2?"              |
| `create_missing_docs` | Criar arquivos de documentação ausentes | Não    | "Criar coding-standards.md?"        |

**Exemplos de Problemas:**

```yaml
# Problemas de Nível 2 - solicitar usuário
- id: PC-003
  description: 'coding-standards.md ausente'
  severity: MEDIUM
  tier: 2
  action: create_missing_docs
  prompt: 'Criar coding-standards.md a partir do template?'
  options:
    - 'yes' # Criar arquivo
    - 'no' # Pular
    - 'custom' # Deixar usuário especificar local

- id: RH-006
  description: '3 pacotes desatualizados (patches de segurança)'
  severity: MEDIUM
  tier: 2
  action: update_deps
  prompt: 'Atualizar 3 pacotes com patches de segurança?'
  details:
    - 'lodash: 4.17.20 → 4.17.21 (segurança)'
    - 'axios: 0.21.0 → 0.21.4 (segurança)'
    - 'yaml: 2.0.0 → 2.3.4 (segurança)'
```

**Interação com o Usuário:**

```
⚠️ Encontrados 2 problemas que requerem confirmação:

[1/2] coding-standards.md ausente
      Ação: Criar a partir do template
      Local: docs/framework/coding-standards.md

      Aplicar correção? [S]im / [N]ão / [P]ular todos: s

      ✅ Criado docs/framework/coding-standards.md

[2/2] 3 pacotes têm atualizações de segurança
      Ação: npm update lodash axios yaml
      Backup: package-lock.json.backup

      Aplicar correção? [S]im / [N]ão / [P]ular todos: s

      ✅ 3 pacotes atualizados
```

---

### Nível 3: Guia Manual

**Definição:** Problemas de alto risco ou complexos que não podem ser auto-corrigidos com segurança. Fornece orientação para resolução manual.

**Características:**

- Risco de perda ou corrupção de dados
- Envolve código/configuração do usuário
- Requer julgamento humano
- Operações sensíveis à segurança
- Mudanças que quebram compatibilidade

**Ações:**

| Ação            | Descrição                         | Orientação Fornecida   |
| --------------- | --------------------------------- | ---------------------- |
| `manual_guide`  | Fornecer instruções passo a passo | Comandos para executar |
| `external_link` | Link para documentação            | URL + contexto         |
| `suggest_agent` | Sugerir agente apropriado         | "@architect revisar"   |
| `escalate`      | Sinalizar para revisão humana     | Abrir issue no GitHub  |

**Exemplos de Problemas:**

```yaml
# Problemas de Nível 3 - apenas guia manual
- id: PC-002
  description: "Tarefa referencia agente inexistente 'legacy-dev'"
  severity: HIGH
  tier: 3
  guide:
    title: 'Corrigir Referência de Agente Inválida'
    steps:
      - 'Abrir .aios-core/development/tasks/deploy.md'
      - 'Encontrar linha: agent: legacy-dev'
      - 'Substituir por: agent: devops'
      - 'Verificar com: npx aios task validate deploy'
    suggested_agent: '@architect'

- id: RH-007
  description: 'Vulnerabilidade crítica em dependência de produção'
  severity: CRITICAL
  tier: 3
  guide:
    title: 'Vulnerabilidade de Segurança Crítica'
    details: 'CVE-2024-XXXXX em express@4.17.0'
    steps:
      - 'Revisar detalhes do CVE: https://nvd.nist.gov/vuln/detail/CVE-2024-XXXXX'
      - 'Verificar se a vulnerabilidade afeta seu uso'
      - 'Se afetado, executar: npm audit fix --force'
      - 'Testar aplicação completamente após atualização'
      - 'Considerar consultar @architect para mudanças que quebram compatibilidade'
    urgency: 'IMEDIATO'
    external_link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-XXXXX'

- id: DE-004
  description: 'Certificado SSL expira em 7 dias'
  severity: CRITICAL
  tier: 3
  guide:
    title: 'Aviso de Expiração de Certificado SSL'
    steps:
      - 'Contate seu provedor de SSL ou equipe de TI'
      - 'Renove o certificado antes da expiração'
      - 'Atualize o certificado no ambiente de implantação'
    suggested_agent: '@devops'
```

**Saída de Orientação ao Usuário:**

```
❌ Encontrados 2 problemas que requerem intervenção manual:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CRÍTICO] Aviso de Expiração de Certificado SSL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Seu certificado SSL expira em 7 dias.

Passos para resolver:
  1. Contate seu provedor de SSL ou equipe de TI
  2. Renove o certificado antes da expiração
  3. Atualize o certificado no ambiente de implantação

Sugerido: Ativar @devops para assistência
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ALTO] Corrigir Referência de Agente Inválida
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tarefa 'deploy' referencia agente inexistente 'legacy-dev'.

Passos para resolver:
  1. Abrir .aios-core/development/tasks/deploy.md
  2. Encontrar linha: agent: legacy-dev
  3. Substituir por: agent: devops
  4. Verificar com: npx aios task validate deploy

Sugerido: Ativar @architect para revisão
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Regras de Segurança

### Nunca Auto-Corrigir (Lista de Bloqueio)

Os seguintes tipos de arquivos/operações **NUNCA** são auto-corrigidos:

```yaml
neverAutoFix:
  files:
    - '**/*.{js,ts,jsx,tsx,py,go,rs}' # Código fonte
    - '**/*.{json,yaml,yml}' # Config do usuário (fora de .aios/)
    - '.env*' # Arquivos de ambiente
    - '**/secrets/**' # Segredos
    - '**/credentials*' # Credenciais
    - '.git/**' # Internos do Git
    - 'package.json' # Dependências do usuário
    - 'tsconfig.json' # Config do usuário
    - '.eslintrc*' # Regras de linting do usuário

  operations:
    - delete_user_files # Nunca deletar arquivos do usuário
    - modify_git_history # Nunca reescrever histórico do git
    - change_remote_urls # Nunca modificar remotes
    - push_to_remote # Nunca fazer push automático
    - modify_ci_secrets # Nunca tocar em segredos de CI
    - change_permissions_recursive # Nunca chmod -R

  conditions:
    - file_has_uncommitted_changes # Não tocar em arquivos modificados
    - file_size_exceeds_1mb # Arquivos grandes precisam de revisão
    - path_outside_project # Permanecer nos limites do projeto
```

### Seguro para Auto-Corrigir (Lista de Permissão)

Apenas estes padrões são candidatos para auto-correção:

```yaml
safeToAutoFix:
  paths:
    - '.aios/**' # Arquivos de workspace do AIOS
    - '.aios-core/**/*.yaml' # YAML do framework (cuidado)
    - '.claude/**' # Configuração do Claude
    - '.vscode/settings.json' # Apenas configurações da IDE
    - '.cursor/**' # Config da IDE Cursor
    - 'node_modules/.cache/**' # Arquivos de cache

  conditions:
    - file_is_regenerable # Pode ser recriado a partir do template
    - file_has_backup # Backup existe
    - action_is_reversible # Pode ser desfeito
    - user_initiated_check # Usuário executou health-check
```

### Validação Pré-Correção

Antes de qualquer correção ser aplicada:

```javascript
async function validateFix(check, action) {
  // 1. Verificar se ação está na lista de permissão
  if (!SAFE_ACTIONS.includes(action.type)) {
    return { allowed: false, reason: 'Ação não está na lista segura' };
  }

  // 2. Verificar se caminho do arquivo é seguro
  if (!isPathSafe(action.targetPath)) {
    return { allowed: false, reason: 'Caminho não está em zona segura' };
  }

  // 3. Verificar se arquivo não foi modificado
  if (await hasUncommittedChanges(action.targetPath)) {
    return { allowed: false, reason: 'Arquivo tem alterações não commitadas' };
  }

  // 4. Garantir que backup pode ser criado
  if (action.requiresBackup && !(await canCreateBackup(action.targetPath))) {
    return { allowed: false, reason: 'Não é possível criar backup' };
  }

  // 5. Verificar se ação é reversível
  if (!action.rollbackCommand) {
    return { allowed: false, reason: 'Nenhum procedimento de rollback definido' };
  }

  return { allowed: true };
}
```

---

## Estratégia de Backup

### Local do Backup

```
.aios/
├── backups/
│   ├── health-check-2025-12-30T10-30-00/
│   │   ├── manifest.json           # O que foi backed up
│   │   ├── config.yaml             # Arquivos backed up
│   │   ├── settings.json
│   │   └── package-lock.json
│   ├── health-check-2025-12-29T14-20-00/
│   │   └── ...
│   └── .retention                  # Política de retenção
```

### Manifesto de Backup

```json
{
  "id": "health-check-2025-12-30T10-30-00",
  "created": "2025-12-30T10:30:00.000Z",
  "checkId": "HC-20251230-103000",
  "issuesFixed": 3,
  "files": [
    {
      "original": ".aios/config.yaml",
      "backup": "config.yaml",
      "action": "recreate_config",
      "checksum": "sha256:abc123...",
      "size": 2048
    }
  ],
  "rollbackCommand": "npx aios health-check --rollback health-check-2025-12-30T10-30-00"
}
```

### Política de Retenção

```yaml
# .aios/backups/.retention
retention:
  maxBackups: 10 # Manter últimos 10 backups
  maxAge: 7 # dias
  minKeep: 3 # Sempre manter pelo menos 3
  autoCleanup: true # Limpar backups antigos automaticamente
```

### Backup Antes da Correção

```javascript
async function createBackup(action) {
  const backupId = `health-check-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const backupDir = path.join('.aios', 'backups', backupId);

  await fs.ensureDir(backupDir);

  const manifest = {
    id: backupId,
    created: new Date().toISOString(),
    files: [],
  };

  for (const file of action.filesToBackup) {
    const content = await fs.readFile(file);
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    const backupName = path.basename(file);

    await fs.writeFile(path.join(backupDir, backupName), content);

    manifest.files.push({
      original: file,
      backup: backupName,
      checksum: `sha256:${checksum}`,
      size: content.length,
    });
  }

  await fs.writeJson(path.join(backupDir, 'manifest.json'), manifest, { spaces: 2 });

  return { backupId, backupDir, manifest };
}
```

---

## Procedimentos de Rollback

### Rollback Automático

Se uma correção falhar durante a execução:

```javascript
async function applyFixWithRollback(check, action) {
  const backup = await createBackup(action);

  try {
    await action.execute();
    await verifyFix(check);

    return { success: true, backup: backup.backupId };
  } catch (error) {
    console.error(`Correção falhou: ${error.message}`);
    console.log(`Fazendo rollback do backup: ${backup.backupId}`);

    await rollback(backup);

    return { success: false, error: error.message, rolledBack: true };
  }
}
```

### Comando de Rollback Manual

```bash
# Rollback de backup específico
npx aios health-check --rollback health-check-2025-12-30T10-30-00

# Listar backups disponíveis
npx aios health-check --list-backups

# Rollback do último backup
npx aios health-check --rollback-last
```

### Processo de Rollback

```javascript
async function rollback(backupId) {
  const backupDir = path.join('.aios', 'backups', backupId);
  const manifest = await fs.readJson(path.join(backupDir, 'manifest.json'));

  console.log(`Fazendo rollback de ${manifest.files.length} arquivos...`);

  for (const file of manifest.files) {
    const backupPath = path.join(backupDir, file.backup);
    const content = await fs.readFile(backupPath);

    // Verificar checksum
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    if (`sha256:${checksum}` !== file.checksum) {
      throw new Error(`Backup corrompido: ${file.original}`);
    }

    await fs.writeFile(file.original, content);
    console.log(`  ✅ Restaurado: ${file.original}`);
  }

  console.log('Rollback completo.');
}
```

---

## Diretrizes de Implementação

### Estrutura do Motor de Auto-Recuperação

```
.aios-core/core/health-check/
├── healers/
│   ├── index.js              # Registro de healers
│   ├── tier1/
│   │   ├── recreate-config.js
│   │   ├── clear-cache.js
│   │   ├── restart-mcp.js
│   │   └── fix-permissions.js
│   ├── tier2/
│   │   ├── update-deps.js
│   │   ├── fix-ide-config.js
│   │   └── create-docs.js
│   └── tier3/
│       ├── manual-guide-generator.js
│       └── escalation-handler.js
├── backup/
│   ├── backup-manager.js
│   ├── retention-policy.js
│   └── rollback-handler.js
└── safety/
    ├── allowlist.js
    ├── blocklist.js
    └── validator.js
```

### Interface do Healer

```javascript
// Interface base do healer
class BaseHealer {
  constructor(options = {}) {
    this.tier = options.tier || 1;
    this.requiresBackup = options.requiresBackup || true;
    this.requiresConfirmation = options.requiresConfirmation || false;
  }

  // Sobrescrever na subclasse
  async canHeal(issue) {
    throw new Error('Não implementado');
  }

  // Sobrescrever na subclasse
  async heal(issue, context) {
    throw new Error('Não implementado');
  }

  // Sobrescrever na subclasse
  async verify(issue) {
    throw new Error('Não implementado');
  }

  // Rollback comum
  async rollback(backupId) {
    return await rollbackManager.rollback(backupId);
  }
}

// Exemplo de healer Nível 1
class RecreateConfigHealer extends BaseHealer {
  constructor() {
    super({ tier: 1, requiresBackup: true, requiresConfirmation: false });
  }

  async canHeal(issue) {
    return issue.id === 'PC-001' && !(await fs.pathExists('.aios/config.yaml'));
  }

  async heal(issue, context) {
    const template = await fs.readFile('.aios-core/templates/config-template.yaml');
    await fs.writeFile('.aios/config.yaml', template);
    return { success: true, message: 'Config recriado a partir do template' };
  }

  async verify(issue) {
    return await fs.pathExists('.aios/config.yaml');
  }
}
```

### Registrando Todas as Ações de Recuperação

```javascript
// .aios/logs/self-healing.log
const healingLog = {
  append: async (entry) => {
    const logPath = '.aios/logs/self-healing.log';
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };
    await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
  },
};

// Uso
await healingLog.append({
  action: 'recreate_config',
  tier: 1,
  issue: 'PC-001',
  backup: 'health-check-2025-12-30T10-30-00',
  result: 'success',
  duration: '45ms',
});
```

---

## Documentos Relacionados

- [ADR: Arquitetura do HCS](./adr/adr-hcs-health-check-system.md)
- [Modos de Execução do HCS](./hcs-execution-modes.md)
- [Especificações de Verificação do HCS](./hcs-check-specifications.md)

---

_Documento criado como parte da Investigação Story HCS-1_
