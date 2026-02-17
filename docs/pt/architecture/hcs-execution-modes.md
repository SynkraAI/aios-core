<!-- Tradução: PT-BR | Original: /docs/en/architecture/hcs-execution-modes.md | Sincronização: 2026-01-26 -->

# Especificação de Modos de Execução do HCS

> 🌐 [EN](../../architecture/hcs-execution-modes.md) | **PT** | [ES](../../es/architecture/hcs-execution-modes.md)

---

**Versão:** 1.0
**Status:** Proposto
**Criado:** 2025-12-30
**Story:** Investigação HCS-1
**Autor:** @architect (Aria) via @dev (Dex)

---

## Índice

- [Resumo Executivo](#resumo-executivo)
- [Descobertas da Pesquisa](#descobertas-da-pesquisa)
- [Matriz de Comparação de Modos de Execução](#matriz-de-comparação-de-modos-de-execução)
- [Configuração Recomendada](#configuração-recomendada)
- [Especificações dos Modos](#especificações-dos-modos)
- [Diretrizes de Implementação](#diretrizes-de-implementação)

---

## Resumo Executivo

Este documento define os modos de execução para o Sistema de Verificação de Saúde do AIOS (HCS), baseado em pesquisa de melhores práticas da indústria do Kubernetes, VS Code, Terraform, npm/yarn e padrões CLI "doctor" (Flutter, Homebrew, WP-CLI).

### Principais Recomendações

1. **Modo Primário:** Manual sob demanda (comando `*health-check`)
2. **Modo Secundário:** Integração CI agendada (trigger pós-merge)
3. **Modo Opcional:** Verificações em background na IDE (para usuários avançados)
4. **NÃO Recomendado:** Hooks de pré-commit (muito lento, cria atrito)

---

## Descobertas da Pesquisa

### Padrões da Indústria Analisados

| Sistema                     | Padrão de Health Check                        | Gatilho                  | Insight Principal                                      |
| --------------------------- | --------------------------------------------- | ------------------------ | ------------------------------------------------------ |
| **Kubernetes**              | Probes de Liveness/Readiness/Startup          | Periódico (configurável) | Diferenciar entre "vivo" e "pronto para servir"        |
| **VS Code**                 | Bisect de extensão, integridade de instalação | Sob demanda + background | Isolamento previne falhas em cascata                   |
| **Terraform**               | Detecção de drift com `terraform plan`        | Manual + CI agendado     | Detectar vs. remediar são etapas separadas             |
| **npm/yarn**                | Integridade de lockfile, `npm audit`          | Na instalação + manual   | Hashes criptográficos previnem adulteração             |
| **Flutter/Homebrew doctor** | Comando CLI `doctor`                          | Sob demanda              | Saída categorizada (✅ ⚠️ ❌) com correções acionáveis |

### Lições Principais Aprendidas

1. **Padrão de Probes do Kubernetes:**
   - Liveness: "Está vivo?" → Reiniciar se morto
   - Readiness: "Pode servir tráfego?" → Remover do load balancer se não estiver pronto
   - Startup: "Terminou de iniciar?" → Desabilitar outras probes até estar pronto
   - **Aplicável ao HCS:** Usar diferentes categorias de verificação com níveis de severidade apropriados

2. **Padrão de Extensões do VS Code:**
   - Extensões rodam em processo isolado → falha não trava o VS Code
   - Verificações de integridade em background detectam instalações corrompidas
   - Extensões maliciosas são auto-removidas via lista de bloqueio
   - **Aplicável ao HCS:** Auto-recuperação não deve arriscar estabilidade do sistema

3. **Padrão de Drift do Terraform:**
   - `terraform plan` detecta drift sem modificar
   - Remediação é uma etapa separada com `terraform apply`
   - Plans agendados no CI fornecem monitoramento contínuo
   - **Aplicável ao HCS:** Detecção e remediação devem ser etapas separadas e controláveis

4. **Padrão de Integridade do npm/yarn:**
   - Hashes criptográficos no lockfile verificam integridade de pacotes
   - `npm audit` roda separadamente da instalação
   - `--update-checksums` permite recuperação controlada
   - **Aplicável ao HCS:** Backups antes de qualquer modificação de auto-recuperação

5. **Padrão CLI Doctor (Flutter, Homebrew, WP-CLI):**
   - Execução sob demanda, não bloqueando fluxos de trabalho
   - Saída categorizada: sucesso, aviso, erro
   - Sugestões acionáveis com comandos para copiar e colar
   - Extensível via verificações customizadas (WP-CLI `doctor.yml`)
   - **Aplicável ao HCS:** Modelo de execução primário

---

## Matriz de Comparação de Modos de Execução

| Modo                         | Gatilho            | Duração | Impacto UX                     | Caso de Uso             | Recomendação                 |
| ---------------------------- | ------------------ | ------- | ------------------------------ | ----------------------- | ---------------------------- |
| **Manual** (`*health-check`) | Comando do usuário | 10-60s  | Nenhum (iniciado pelo usuário) | Diagnóstico sob demanda | ✅ **Primário**              |
| **Hook pré-commit**          | `git commit`       | 10-30s  | Alto atrito                    | Capturar problemas cedo | ❌ Não recomendado           |
| **Hook pós-commit**          | Após commit        | 10-60s  | Atrito médio                   | Validação local         | ⚠️ Opcional                  |
| **CI Agendado**              | Cron/workflow      | 60-300s | Nenhum                         | Monitoramento contínuo  | ✅ **Secundário**            |
| **Trigger pós-merge**        | Merge de PR        | 60-120s | Nenhum                         | Validação pós-mudança   | ✅ **Terciário**             |
| **Background na IDE**        | Save/intervalo     | 5-15s   | Indicadores sutis              | Feedback em tempo real  | ⚠️ Apenas usuários avançados |
| **Na instalação/bootstrap**  | `npx aios install` | 60-120s | Esperado                       | Validação de setup      | ✅ **Obrigatório**           |

### Avaliação Detalhada

#### ✅ Manual (`*health-check`) - PRIMÁRIO

**Prós:**

- Controlado pelo usuário, sem atrito no fluxo de trabalho
- Capacidade diagnóstica completa
- Suporta todos os modos (rápido, completo, específico por domínio)
- Segue padrão doctor do Flutter/Homebrew

**Contras:**

- Pode ser esquecido
- Reativo ao invés de proativo

**Veredito:** Modo de execução primário. Sempre disponível via comando `*health-check`.

#### ❌ Hook Pré-commit - NÃO RECOMENDADO

**Prós:**

- Captura problemas antes do commit
- Feedback imediato

**Contras:**

- Atraso de 10-30s em cada commit é inaceitável
- Desenvolvedores vão contornar com `--no-verify`
- Cria atrito em desenvolvimento de ritmo acelerado
- Lição do Kubernetes: Não misturar "liveness" com "readiness"

**Veredito:** Não implementar. Pré-commit deve ser reservado para verificações rápidas (<5s).

#### ⚠️ Hook Pós-commit - OPCIONAL

**Prós:**

- Não bloqueante (roda após commit)
- Loop de feedback local

**Contras:**

- Ainda adiciona atraso ao fluxo de trabalho
- Resultados podem ser ignorados
- Sem capacidade de prevenir commits ruins

**Veredito:** Opcional para usuários avançados. Não habilitado por padrão.

#### ✅ CI Agendado - SECUNDÁRIO

**Prós:**

- Monitoramento contínuo sem atrito para o desenvolvedor
- Padrão Terraform: "terraform plan" em agenda
- Captura drift ao longo do tempo
- Dados de tendência histórica

**Contras:**

- Feedback atrasado
- Requer infraestrutura de CI

**Veredito:** Modo secundário recomendado. Execução diária agendada no CI.

**Exemplo de workflow GitHub Actions:**

```yaml
name: Health Check (Agendado)
on:
  schedule:
    - cron: '0 6 * * *' # Diariamente às 6 AM
  workflow_dispatch: # Trigger manual

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx aios health-check --mode=full --report
      - uses: actions/upload-artifact@v4
        with:
          name: health-report
          path: .aios/reports/health-check-*.md
```

#### ✅ Trigger Pós-merge - TERCIÁRIO

**Prós:**

- Timing inteligente: após as mudanças serem incorporadas
- Não bloqueante para o autor do PR
- Valida saúde da integração

**Contras:**

- Feedback atrasado
- Pode perder problemas durante o desenvolvimento

**Veredito:** Recomendado para branch principal. Dispara após merge de PR.

#### ⚠️ Background na IDE - APENAS USUÁRIOS AVANÇADOS

**Prós:**

- Feedback em tempo real
- Melhor UX possível enquanto trabalha

**Contras:**

- Complexo de implementar
- Pode impactar performance da IDE
- Lição do VS Code: Isolamento de extensão é crucial

**Veredito:** Opcional para usuários avançados. Requer implementação cuidadosa para evitar problemas de performance.

#### ✅ Na Instalação/Bootstrap - OBRIGATÓRIO

**Prós:**

- Valida que o ambiente está corretamente configurado
- Experiência de primeira execução
- Captura dependências faltantes imediatamente

**Contras:**

- Apenas uma vez

**Veredito:** Obrigatório. Parte do `npx aios install` e `*bootstrap-setup`.

---

## Configuração Recomendada

### Configuração Padrão

```yaml
# .aios-core/core-config.yaml
healthCheck:
  enabled: true

  modes:
    # Primário: Manual sob demanda
    manual:
      enabled: true
      command: '*health-check'
      defaultMode: 'quick' # quick | full | domain
      autoFix: true # Habilitar auto-recuperação por padrão

    # Secundário: CI Agendado
    scheduled:
      enabled: true
      frequency: 'daily' # daily | weekly | on-push
      ciProvider: 'github-actions' # github-actions | gitlab-ci | none
      mode: 'full'
      reportArtifact: true

    # Terciário: Pós-merge
    postMerge:
      enabled: true
      branches: ['main', 'develop']
      mode: 'quick'

    # Opcional: Background na IDE
    ideBackground:
      enabled: false # Apenas opt-in
      interval: 300 # segundos (5 minutos)
      mode: 'quick'

    # Opcional: Pós-commit
    postCommit:
      enabled: false # Apenas opt-in
      mode: 'quick'

    # Obrigatório: Na instalação
    onInstall:
      enabled: true
      mode: 'full'
      failOnCritical: true

  performance:
    quickModeTimeout: 10 # segundos
    fullModeTimeout: 60 # segundos
    parallelChecks: true
    cacheResults: true
    cacheTTL: 300 # segundos
```

### Configuração de Modo

| Configuração                | Modo Rápido      | Modo Completo         | Modo por Domínio            |
| --------------------------- | ---------------- | --------------------- | --------------------------- |
| **Verificações executadas** | Apenas críticas  | Todas as verificações | Domínio específico          |
| **Duração alvo**            | <10 segundos     | <60 segundos          | <30 segundos                |
| **Auto-recuperação**        | Apenas Nível 1   | Todos os níveis       | Específico do domínio       |
| **Detalhe do relatório**    | Resumo           | Relatório completo    | Relatório do domínio        |
| **Caso de uso**             | Validação rápida | Diagnóstico profundo  | Troubleshooting direcionado |

---

## Especificações dos Modos

### 1. Modo Manual (`*health-check`)

```bash
# Verificação rápida (padrão)
*health-check

# Verificação completa abrangente
*health-check --mode=full

# Verificação específica por domínio
*health-check --domain=repository

# Desabilitar auto-recuperação
*health-check --no-fix

# Gerar apenas relatório
*health-check --report-only
```

**Parâmetros:**

| Parâmetro            | Valores                                | Padrão | Descrição                  |
| -------------------- | -------------------------------------- | ------ | -------------------------- |
| `--mode`             | quick, full, domain                    | quick  | Abrangência da verificação |
| `--domain`           | project, local, repo, deploy, services | all    | Filtro de domínio          |
| `--fix` / `--no-fix` | boolean                                | true   | Habilitar auto-recuperação |
| `--report`           | boolean                                | true   | Gerar relatório markdown   |
| `--json`             | boolean                                | false  | Saída JSON para automação  |
| `--verbose`          | boolean                                | false  | Mostrar saída detalhada    |

### 2. Modo CI Agendado

**Integração com GitHub Actions:**

```yaml
# .github/workflows/health-check.yml
name: AIOS Health Check

on:
  schedule:
    - cron: '0 6 * * *' # 6 AM UTC diariamente
  workflow_dispatch:
    inputs:
      mode:
        description: 'Modo de verificação'
        required: false
        default: 'full'
        type: choice
        options:
          - quick
          - full

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Executar Health Check
        run: |
          npx aios health-check \
            --mode=${{ inputs.mode || 'full' }} \
            --report \
            --json

      - name: Upload Relatório
        uses: actions/upload-artifact@v4
        with:
          name: health-check-report-${{ github.run_id }}
          path: .aios/reports/

      - name: Postar no Slack (em caso de falha)
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "⚠️ AIOS Health Check Falhou",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "Health check detectou problemas. <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|Ver Relatório>"
                  }
                }
              ]
            }
```

### 3. Trigger Pós-Merge

```yaml
# Adicionar ao workflow CI existente
on:
  push:
    branches: [main, develop]

jobs:
  post-merge-health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx aios health-check --mode=quick
```

### 4. Modo Background na IDE (Opcional)

**Integração com VS Code (futuro):**

```json
// .vscode/settings.json
{
  "aios.healthCheck.enabled": true,
  "aios.healthCheck.interval": 300,
  "aios.healthCheck.mode": "quick",
  "aios.healthCheck.showNotifications": true
}
```

**Indicador na Barra de Status:**

- 🟢 Saudável (score > 80)
- 🟡 Degradado (score 50-80)
- 🔴 Não saudável (score < 50)

---

## Diretrizes de Implementação

### Ordem de Prioridade

1. **Fase 1 (HCS-2):** Modo manual + Modo na instalação
2. **Fase 2 (HCS-3):** Integração CI agendada
3. **Fase 3 (Futuro):** Modo background na IDE, hooks pós-commit

### Metas de Performance

| Modo     | Duração Alvo | Duração Máxima |
| -------- | ------------ | -------------- |
| Rápido   | 5 segundos   | 10 segundos    |
| Completo | 30 segundos  | 60 segundos    |
| Domínio  | 10 segundos  | 30 segundos    |

### Estratégia de Cache

Baseado no padrão Terraform:

```javascript
// Cachear verificações custosas
const checkCache = new Map();
const CACHE_TTL = 300000; // 5 minutos

async function runCheck(check) {
  const cacheKey = `${check.id}-${check.inputs.hash}`;
  const cached = checkCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const result = await check.execute();
  checkCache.set(cacheKey, { result, timestamp: Date.now() });
  return result;
}
```

### Execução Paralela

Baseado no padrão Kubernetes (executar verificações independentes concorrentemente):

```javascript
// Agrupar verificações por dependência
const checkGroups = [
  ['project', 'local'], // Independentes, rodar em paralelo
  ['repository', 'services'], // Independentes, rodar em paralelo
  ['deploy'], // Pode depender de outras
];

async function runAllChecks() {
  const results = {};

  for (const group of checkGroups) {
    const groupResults = await Promise.all(group.map((domain) => runDomainChecks(domain)));
    Object.assign(results, ...groupResults);
  }

  return results;
}
```

---

## Documentos Relacionados

- [ADR: Arquitetura do HCS](./adr/adr-hcs-health-check-system.md)
- [Especificação de Auto-Recuperação do HCS](./hcs-self-healing-spec.md)
- [Especificações de Verificação do HCS](./hcs-check-specifications.md)

---

## Fontes da Pesquisa

- [Kubernetes Health Probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)
- [Terraform Drift Detection](https://developer.hashicorp.com/terraform/tutorials/state/resource-drift)
- [npm Lockfile Integrity](https://medium.com/node-js-cybersecurity/lockfile-poisoning-and-how-hashes-verify-integrity-in-node-js-lockfiles)
- [VS Code Extension Health](https://code.visualstudio.com/blogs/2021/02/16/extension-bisect)
- [Flutter Doctor Pattern](https://quickcoder.org/flutter-doctor/)
- [WP-CLI Doctor Command](https://github.com/wp-cli/doctor-command)

---

_Documento criado como parte da Investigação Story HCS-1_
