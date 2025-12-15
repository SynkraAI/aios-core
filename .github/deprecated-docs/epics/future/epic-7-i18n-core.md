# Epic 7: Core i18n Infrastructure

**Epic ID:** Epic-7
**Parent:** Epic-Master-AIOS-2.0 (Wave 2)
**Status:** 🟡 Blocked (depends on Epic 6.1)
**Priority:** 🟡 Medium
**Owner:** Dev (Dex) + Architect (Aria)
**Created:** 2025-01-14
**Target Completion:** Q2 2026, Week 1-2
**Duration:** 2 weeks (1 sprint)
**Investment:** $15K

---

## 📋 Executive Summary

Build core internationalization (i18n) infrastructure to support PT-BR localization using industry-standard "Persona Layer" model. System prompts stay in English (best AI performance), UI/display layer translates to Portuguese (best UX). Expands addressable market to 200M+ Portuguese speakers with +76% adoption increase.

### 🎯 Objectives

1. **Create i18n folder structure** (`aios-core/i18n/`)
2. **Implement language detection** (env variable, system locale, explicit config)
3. **Build rendering engine** (display layer localization)
4. **Extract English strings** to `en-US.yaml` (baseline)
5. **Create PT-BR stub** (`pt-BR.yaml` for Epic 8)
6. **Update core-config.yaml** with i18n settings
7. **Zero breaking changes** (English remains default)

### 💰 ROI

- **Investment:** $15K (2 weeks)
- **Market Expansion:** +200M Portuguese speakers
- **Adoption Increase:** +76% (CSA Research)
- **Brazil Market:** 6th largest software market globally

---

## 🏗 Current State

### Localization Status
- ❌ **English-Only:** All UI, messages, errors in English
- ❌ **No i18n System:** No language detection or rendering
- ❌ **Hardcoded Strings:** Messages embedded in agent files, tasks, CLI

### Industry Standard (Persona Layer Model)
- ✅ Claude Code, Cursor, Windsurf, GitHub Copilot - **ALL** use this model
- ✅ System prompts EN, UI localized
- ✅ Research: Full translation = -11% to -15% code quality degradation

---

## 📦 Target State

### i18n Folder Structure

```
aios-core/i18n/
├── README.md              # i18n documentation
├── en-US.yaml             # English (default, baseline)
├── pt-BR.yaml             # Portuguese (Epic 8)
├── localization-engine.js # Language detection & rendering
└── types.d.ts             # TypeScript definitions
```

### Configuration

```yaml
# aios-core/core-config.yaml (NEW SECTION)
i18n:
  enabled: true
  defaultLocale: en-US
  supportedLocales:
    - en-US
    - pt-BR
  fallbackLocale: en-US
  autoDetect: true        # Auto-detect from env or system
```

---

## 📊 Stories Breakdown

### Story 7.1: i18n Folder Structure & Documentation
**Tasks:**
- Create `aios-core/i18n/` folder
- Create `README.md` explaining Persona Layer model
- Create `types.d.ts` for TypeScript support
- Update `package.json` dependencies (no external i18n libraries initially)

**Estimated Time:** 1 day

---

### Story 7.2: Language Detection Engine
**Objective:** Implement automatic language detection

**Detection Priority:**
1. Explicit config: `aios config set i18n.locale pt-BR`
2. Environment variable: `AIOS_LANG=pt-BR`
3. System locale: `process.env.LANG`
4. Fallback: `en-US`

**Implementation:**
```javascript
// aios-core/i18n/localization-engine.js
function detectLanguage() {
  const config = loadConfig();
  if (config.i18n.locale) return config.i18n.locale;
  if (process.env.AIOS_LANG) return process.env.AIOS_LANG;
  const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  if (systemLocale.startsWith('pt')) return 'pt-BR';
  return 'en-US';
}
```

**Estimated Time:** 2 days

---

### Story 7.3: Extract English Strings to en-US.yaml
**Objective:** Create baseline English locale file

**Categories to Extract:**
- Agent greetings (13 agents)
- Command descriptions (*help, *create, etc.)
- Error messages (file not found, invalid input, etc.)
- Success messages (task completed, file created, etc.)
- Interactive prompts (elicitation questions)
- CLI output (tables, lists, status)

**en-US.yaml Structure:**
```yaml
agents:
  dev:
    greeting_level_1: "Dev Agent ready"
    greeting_level_2: "Dex (Builder) ready. Let's build something great!"
    greeting_level_3: "Dex the Builder (♒ Aquarius) ready to innovate!"
  qa:
    greeting_level_1: "QA Agent ready"
    greeting_level_2: "Quinn (Guardian) ready to ensure quality!"
errors:
  file_not_found: "File not found: {path}"
  invalid_input: "Invalid input: {details}"
commands:
  help_description: "Show available commands"
  create_description: "Create new document or component"
```

**Estimated Time:** 3 days

---

### Story 7.4: Rendering Engine Implementation
**Objective:** Build display layer rendering with placeholder support

**Features:**
- String interpolation: `"File not found: {path}"` → `"File not found: /foo/bar"`
- Pluralization support (future): `"{count} files"` → "1 file" or "2 files"
- Fallback to English if translation missing

**Implementation:**
```javascript
function t(key, params = {}) {
  const locale = detectLanguage();
  const translations = loadTranslations(locale);
  let string = translations[key] || loadTranslations('en-US')[key] || key;

  // Interpolate placeholders
  Object.keys(params).forEach(param => {
    string = string.replace(`{${param}}`, params[param]);
  });

  return string;
}

// Usage:
console.log(t('errors.file_not_found', { path: '/foo/bar' }));
```

**Estimated Time:** 2 days

---

### Story 7.5: Integration & Testing
**Objective:** Integrate i18n system into AIOS core

**Updates Required:**
- `aios-core/scripts/agent-activator.js` - Use `t()` for agent greetings
- `aios-core/scripts/cli.js` - Use `t()` for CLI output
- Error handling modules - Use `t()` for error messages

**Testing:**
- Unit tests for language detection
- Unit tests for rendering engine (interpolation, fallback)
- Integration tests (activate agent in EN vs PT-BR)
- Locale switching without restart

**Estimated Time:** 2 days

---

## 📈 Success Metrics

### Completion Criteria
- ✅ i18n folder structure created
- ✅ Language detection working (env, system, config)
- ✅ Rendering engine supports interpolation and fallback
- ✅ English strings extracted to `en-US.yaml`
- ✅ PT-BR stub created (`pt-BR.yaml` empty, ready for Epic 8)
- ✅ Tests passing (unit + integration)

### Integration Requirements
- ✅ Agent greetings use `t()` function
- ✅ CLI output uses `t()` function
- ✅ Error messages use `t()` function
- ✅ Config command: `aios config set i18n.locale <locale>`

---

## ⚠️ Risks & Mitigation

### Risk 1: Performance degradation from i18n lookups
- **Probability:** LOW
- **Impact:** LOW
- **Mitigation:** Cache translations in memory, benchmark performance

### Risk 2: Missing English strings (hardcoded in code)
- **Probability:** MEDIUM
- **Impact:** MEDIUM
- **Mitigation:** Incremental extraction, grep for hardcoded strings

---

## 🔗 Related Resources

- [Decision #1: PT-BR Localization](../one-pagers/DECISION-1-PT-BR-LOCALIZATION.md)
- [Epic 8: PT-BR Display Layer](epic-8-ptbr-display.md) - Depends on this epic

---

**Last Updated:** 2025-01-14
**Owner:** Dev (Dex) + Architect (Aria)
**Status:** 🟡 Blocked (starts after Epic 6.1)
