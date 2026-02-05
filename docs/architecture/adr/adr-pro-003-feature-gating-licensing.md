# ADR: Feature Gating & Licensing - Open Core Monetization

---

**ADR ID:** ADR-PRO-003
**Status:** Accepted
**Created:** 2026-02-05
**Author:** @architect (Aria)
**Story:** PRO-1 Investigation
**Deciders:** @architect (Aria), Stakeholder
**Related:** ADR-PRO-001 (Repository Strategy), ADR-PRO-002 (Configuration Hierarchy)

---

## Context

### Problem Statement

Com a separacao entre aios-core (open-source) e aios-pro (proprietary), definida nos ADRs anteriores, precisamos estabelecer:

1. **Feature Boundary**: Quais features sao core (free) e quais sao pro (paid)
2. **License Model**: Como validar que o usuario tem direito de usar features pro
3. **Feature Gating**: Como o runtime decide se uma feature esta disponivel
4. **Distribution Protection**: Como impedir acesso nao autorizado ao codigo pro

### Constraints

1. **Core DEVE funcionar 100% sem pro** - Nenhuma degradacao para usuarios open-source
2. **Pro DEVE ser protegido em duas camadas** - Install-gate (registry) + Runtime-gate (license)
3. **Developer experience** - License check nao pode degradar performance (<50ms)
4. **Offline capability** - Desenvolvedores devem poder trabalhar sem internet por periodos prolongados
5. **Graceful degradation** - Se licenca expira, degrada para Core sem perda de dados
6. **CLI First** - Toda gestao de licenca via CLI, nunca via UI obrigatoria

---

## Decision

### 1. Feature Boundary Matrix

| Feature | Core (Free) | Pro (Paid) |
|---------|------------|-----------|
| **Agents** | 12 base agents (dev, qa, architect, pm, po, sm, analyst, data-engineer, ux-design-expert, devops, aios-master, squad-creator) | Custom agent builder, agent marketplace |
| **Tasks** | All standard tasks, backlog management | Advanced orchestration, parallel execution |
| **Squads** | Squad Creator (basic) | Squad Creator (pro), premium squads (featured), community squads marketplace, marketplace squads |
| **CLI** | Full CLI functionality | Advanced analytics, session replay |
| **Config** | Project + Machine config (4-level hierarchy) | Multi-org config, config inheritance templates |
| **Memory** | Basic session memory | Persistent memory, cross-session context, memory analytics |
| **Metrics** | Basic stats | Dashboards, team analytics, cost tracking |
| **Integrations** | GitHub basic | ClickUp, Google Drive, GitLab, Bitbucket, Jira, Azure DevOps |
| **Support** | Community (GitHub Issues) | Priority support, SLA |

#### Boundary Principles

1. **Core is complete**: A developer using only Core has a fully functional AI orchestration system
2. **Pro is additive**: Pro adds capabilities, never removes Core functionality
3. **No feature crippling**: Core features are not artificially limited to push users to Pro
4. **Clear upgrade path**: When a user hits a Pro feature, the CLI suggests upgrade with context

#### Feature Registry

Each pro feature is registered with a unique feature ID:

```yaml
# pro/feature-registry.yaml
features:
  # Squads Module
  pro.squads.creator-pro:
    name: "Squad Creator Pro"
    module: squads
    description: "Advanced squad creation with templates and marketplace publishing"
  pro.squads.premium:
    name: "Premium Squads"
    module: squads
    description: "Pre-built squads for SaaS, e-commerce, and fintech"
  pro.squads.marketplace:
    name: "Squads Marketplace"
    module: squads
    description: "Browse and install community and premium squads"

  # Memory Module
  pro.memory.persistent:
    name: "Persistent Memory"
    module: memory
    description: "Cross-session persistent memory store"
  pro.memory.cross-session:
    name: "Cross-Session Context"
    module: memory
    description: "Share context between agent sessions"
  pro.memory.analytics:
    name: "Memory Analytics"
    module: memory
    description: "Memory usage analytics and optimization insights"

  # Metrics Module
  pro.metrics.dashboards:
    name: "Usage Dashboards"
    module: metrics
    description: "Real-time usage dashboards and reports"
  pro.metrics.team-analytics:
    name: "Team Analytics"
    module: metrics
    description: "Team-level analytics and productivity insights"
  pro.metrics.cost-tracking:
    name: "Cost Tracking"
    module: metrics
    description: "AI provider cost tracking and budget alerts"

  # Integrations Module
  pro.integrations.clickup:
    name: "ClickUp Integration"
    module: integrations
  pro.integrations.google-drive:
    name: "Google Drive Integration"
    module: integrations
  pro.integrations.gitlab:
    name: "GitLab Integration"
    module: integrations
  pro.integrations.bitbucket:
    name: "Bitbucket Integration"
    module: integrations
  pro.integrations.jira:
    name: "Jira Integration"
    module: integrations
  pro.integrations.azure-devops:
    name: "Azure DevOps Integration"
    module: integrations

  # Advanced Features
  pro.agents.custom-builder:
    name: "Custom Agent Builder"
    module: agents
    description: "Build and deploy custom agents with visual editor"
  pro.agents.marketplace:
    name: "Agent Marketplace"
    module: agents
    description: "Browse and install community agents"
  pro.cli.analytics:
    name: "CLI Analytics"
    module: cli
    description: "Advanced CLI usage analytics and reports"
  pro.cli.session-replay:
    name: "Session Replay"
    module: cli
    description: "Replay and audit agent sessions"
  pro.config.multi-org:
    name: "Multi-Org Config"
    module: config
    description: "Manage configuration across multiple organizations"
```

---

### 2. License Model: Hybrid (Online Activation + Offline Cache)

#### Activation Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. PURCHASE                                                │
│     User purchases Pro license at synkra.ai/pro             │
│     → Receives license key: PRO-XXXX-XXXX-XXXX-XXXX        │
│     → Receives npm registry token (for install access)      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  2. INSTALL (Install-Gate)                                  │
│     $ npm config set @aios:registry https://npm.synkra.ai   │
│     $ npm config set //npm.synkra.ai/:_authToken <token>    │
│     $ npm install @aios/pro                                 │
│     → Registry validates token before serving package       │
│     → Without valid token: 401 Unauthorized                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  3. ACTIVATE (Runtime-Gate)                                 │
│     $ aios pro activate --key PRO-XXXX-XXXX-XXXX-XXXX      │
│     → POST api.synkra.ai/v1/license/activate                │
│       Body: { key, machineId, aiosCoreVersion }             │
│     → Response: {                                           │
│         valid: true,                                        │
│         expiresAt: "2026-03-07T00:00:00Z",                  │
│         features: ["pro.squads.*", "pro.memory.*", ...],    │
│         seats: { used: 3, max: 10 },                        │
│         cacheValidDays: 30,                                 │
│         gracePeriodDays: 7                                  │
│       }                                                     │
│     → Saves to .aios/license.cache (encrypted)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  4. DAILY USE (Offline)                                     │
│     Developer uses aios normally                            │
│     → License check reads .aios/license.cache (<5ms)        │
│     → No internet required for 30 days                      │
│     → Background revalidation when online (non-blocking)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  5. CACHE EXPIRY (after 30 days offline)                    │
│     Cache expired, attempts online revalidation             │
│     → Online: renews cache for 30 more days                 │
│     → Offline: enters 7-day grace period                    │
│     → Grace expired: degrades to Core gracefully            │
│       - Pro features disabled                               │
│       - All data preserved (no data loss)                   │
│       - CLI shows: "Pro license expired. Renew at ..."      │
└─────────────────────────────────────────────────────────────┘
```

#### Dual-Gate Protection

| Gate | What it protects | How it works |
|------|-----------------|-------------|
| **Install-Gate** | Source code access | Private npm registry with token auth. Without token, `npm install @aios/pro` returns 401. Prevents casual downloading and reverse engineering. |
| **Runtime-Gate** | Feature execution | License cache validation at startup. Even if code is obtained, features require valid license to execute. |

**Why both gates?**

- Install-Gate alone: Someone with registry access could share the package tarball
- Runtime-Gate alone: Code is visible in `node_modules/`, enabling reverse engineering
- Both together: Source access requires purchase, execution requires valid license

#### License Cache File

```
.aios/license.cache (encrypted, gitignored)
```

The cache file is:
- **Encrypted** with a machine-specific key (derived from machineId + salt)
- **Gitignored** (never committed to repository)
- **Non-portable** (cannot be copied to another machine)
- **Tamper-resistant** (integrity check via HMAC)

#### CLI Commands

```bash
# Activate license (requires internet)
aios pro activate --key PRO-XXXX-XXXX-XXXX-XXXX

# Check license status
aios pro status
# Output:
#   License: Active
#   Key: PRO-XXXX-****-****-XXXX
#   Features: squads, memory, metrics, integrations
#   Seats: 3/10 used
#   Cache: Valid until 2026-03-07 (22 days remaining)
#   Next validation: Background (when online)

# Deactivate license (frees a seat)
aios pro deactivate

# Force revalidation
aios pro validate

# Show available pro features
aios pro features
```

#### Graceful Degradation

When license is invalid or expired:

```
$ aios pro status
  License: Expired (grace period ended 2026-03-14)
  Features: Disabled (Core mode)
  Action: Run 'aios pro activate --key <KEY>' to reactivate

$ aios squad create --template saas
  ⚠ Squad Creator Pro requires an active AIOS Pro license.
  Your data and configurations are preserved.
  Reactivate: aios pro activate --key <KEY>
  Purchase: https://synkra.ai/pro
```

**Rules for degradation:**
1. NEVER delete user data when license expires
2. NEVER block Core features when Pro degrades
3. ALWAYS show clear, actionable message with reactivation instructions
4. ALWAYS preserve pro configuration files (they just won't be loaded)

---

### 3. Feature Gating Architecture

#### Runtime Check Pattern

```javascript
// pro/license/feature-gate.js

const { readLicenseCache, isExpired, isInGracePeriod } = require('./license-cache');
const { validateOnline } = require('./license-api');

class FeatureGate {
  constructor() {
    this._cache = null;
    this._features = new Set();
  }

  /**
   * Check if a pro feature is available.
   * @param {string} featureId - e.g., "pro.squads.premium"
   * @returns {boolean}
   */
  isAvailable(featureId) {
    if (!this._cache) this._loadCache();
    return this._features.has(featureId) || this._matchWildcard(featureId);
  }

  /**
   * Gate a function - throws if feature not available.
   * @param {string} featureId
   * @param {string} friendlyName - for error message
   */
  require(featureId, friendlyName) {
    if (!this.isAvailable(featureId)) {
      const msg = [
        `${friendlyName} requires an active AIOS Pro license.`,
        `Feature: ${featureId}`,
        `Activate: aios pro activate --key <KEY>`,
        `Purchase: https://synkra.ai/pro`,
      ].join('\n');
      throw new ProFeatureError(msg, featureId);
    }
  }

  _loadCache() {
    const cache = readLicenseCache();
    if (cache && !isExpired(cache)) {
      this._cache = cache;
      this._features = new Set(cache.features || []);
    } else if (cache && isInGracePeriod(cache)) {
      this._cache = cache;
      this._features = new Set(cache.features || []);
      // Log warning about grace period
      console.warn('[AIOS Pro] License cache expired. Grace period active.');
    } else {
      this._cache = null;
      this._features = new Set();
    }
  }

  _matchWildcard(featureId) {
    // Support "pro.squads.*" matching "pro.squads.premium"
    for (const f of this._features) {
      if (f.endsWith('.*')) {
        const prefix = f.slice(0, -1); // "pro.squads."
        if (featureId.startsWith(prefix)) return true;
      }
    }
    return false;
  }
}

// Singleton
const featureGate = new FeatureGate();
module.exports = { featureGate, FeatureGate };
```

#### Usage in Pro Modules

```javascript
// pro/squads/squad-creator-pro.js
const { featureGate } = require('../license/feature-gate');

async function createProSquad(options) {
  featureGate.require('pro.squads.creator-pro', 'Squad Creator Pro');

  // Pro-only logic here...
}
```

#### Usage in Core (Conditional Loading)

```javascript
// bin/utils/pro-detector.js (from ADR-PRO-001)
const { isProAvailable, loadProModule } = require('./pro-detector');

// In core CLI command handler:
async function handleSquadCreate(args) {
  if (args.template && isProAvailable()) {
    const proSquads = loadProModule('squads/squad-creator-pro');
    if (proSquads) {
      return proSquads.createProSquad(args);
      // FeatureGate inside will validate license
    }
  }

  // Fallback to core squad creator
  return createBasicSquad(args);
}
```

#### Integration with Config Hierarchy (ADR-PRO-002)

Pro features are gated at two levels:

1. **Config level**: Pro config (`pro/pro-config.yaml`) only loaded when `isProAvailable()` returns true
2. **Feature level**: Individual features within pro require `featureGate.isAvailable()` to pass

This means a Pro user could have the submodule but only a subset of features licensed (e.g., squads only, without metrics).

---

### 4. Pricing Model

**Decision: Deferred.**

The pricing model (per-user, per-org, per-feature) is a business decision that does not affect the architecture. The feature gating system supports all models:

- **Per-user**: License tied to `machineId`, seats tracked server-side
- **Per-org**: Single license key for organization, unlimited seats
- **Per-feature**: `features` array in license response controls which modules are active

The architecture is pricing-model-agnostic by design.

---

## Implementation

### Phase 1: License Infrastructure

```
pro/
  license/
    feature-gate.js       # FeatureGate class (singleton)
    license-cache.js       # Read/write encrypted cache file
    license-api.js         # Online validation API client
    license-crypto.js      # Machine ID, encryption, HMAC
    index.js               # Public API exports
  feature-registry.yaml    # Feature ID registry
```

### Phase 2: Install-Gate (npm Registry)

**Option A: GitHub Packages (Recommended for initial launch)**
```bash
# .npmrc in user's machine
@aios:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**Option B: Private npm Registry (Synkra-hosted, for scale)**
```bash
# .npmrc
@aios:registry=https://npm.synkra.ai
//npm.synkra.ai/:_authToken=${AIOS_NPM_TOKEN}
```

**Recommended:** Start with GitHub Packages (zero infra cost), migrate to custom registry when user base grows.

### Phase 3: CLI Commands

Add to `bin/aios.js`:
```javascript
// New subcommand: aios pro
program
  .command('pro')
  .description('AIOS Pro license management')
  .command('activate')
  .option('--key <license-key>', 'License key')
  .action(handleProActivate);

program
  .command('pro status')
  .action(handleProStatus);

program
  .command('pro deactivate')
  .action(handleProDeactivate);

program
  .command('pro features')
  .action(handleProFeatures);
```

### Phase 4: Core Integration Points

Update core CLI to detect and offer pro features:

```javascript
// Core integration points (in aios-core, not pro):
// 1. Squad creation: offer pro templates if available
// 2. Config show: include pro config level
// 3. Doctor: check pro license status if installed
// 4. Info: show pro version and features if installed
```

---

## Consequences

### Positive

- **Clear boundary**: Developers know exactly what is free and what requires Pro
- **Dual protection**: Install-gate + Runtime-gate prevents unauthorized access
- **Offline-friendly**: 30 days + 7 grace days without internet
- **Graceful degradation**: Core always works, Pro features degrade without data loss
- **Pricing-agnostic**: Architecture supports any future pricing model
- **Feature granularity**: Individual features can be enabled/disabled per license

### Negative

- **API infrastructure**: Requires license validation API (even if minimal)
- **Encryption complexity**: Machine-specific cache encryption adds code complexity
- **Dual registry**: Users need to configure npm registry for `@aios` scope
- **Maintenance burden**: Feature registry must be kept in sync with actual features

### Mitigations

| Risk | Mitigation |
|------|------------|
| API downtime | Offline cache + grace period ensures 37 days without API |
| Registry setup friction | `aios pro setup` command automates .npmrc configuration |
| Feature registry drift | CI validation step checks registry vs actual exports |
| Encryption issues | Fallback to license reactivation if cache corrupted |

---

## Dependencies

- **Depends on:** ADR-PRO-001 (submodule structure for pro/), ADR-PRO-002 (config hierarchy for pro-config.yaml)
- **Blocks:** PRO-6 (License Key & Feature Gating System implementation)
- **Requires:** @devops (Gage) for GitHub Packages setup, @dev (Dex) for implementation

---

## Review Status

- [x] @architect (Aria) - Author and architecture review
- [x] Stakeholder - Feature boundary approved, hybrid license approved
- [ ] @devops (Gage) - Registry setup and CI/CD review
- [ ] @dev (Dex) - Implementation feasibility review

---

**Decision Date:** 2026-02-05
**Next Steps:** PRO-6 (License Key & Feature Gating System) by @dev + @devops
