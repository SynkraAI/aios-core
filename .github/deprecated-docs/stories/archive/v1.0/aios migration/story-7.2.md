# Story 7.2: Language Detection Engine

**Story ID:** 7.2
**Epic:** Epic-7 - Core i18n Infrastructure
**Wave:** Wave 2 (Localization)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Dev (Dex)
**Created:** 2025-01-14
**Duration:** 2 days
**Investment:** $3,000

---

## 📋 Objective

Implement automatic language detection with 4-tier priority: explicit config, environment variable, system locale, fallback to en-US.

---

## 🎯 Scope

Create localization-engine.js with detectLanguage() function implementing 4-tier priority detection, update core-config.yaml with i18n section (enabled, defaultLocale, supportedLocales, fallbackLocale, autoDetect), and add CLI commands for locale configuration.

---

## 📊 Tasks Breakdown

**Day 1: Detection Logic (8 hours)** (8 hours)
Implement 4-tier language detection priority system
- Create aios-core/i18n/localization-engine.js
- Implement detectLanguage() function with 4-tier priority:
- 1. Explicit config: aios config set i18n.locale pt-BR (highest priority)
- 2. Environment variable: AIOS_LANG=pt-BR
- 3. System locale: process.env.LANG or Intl.DateTimeFormat().resolvedOptions().locale
- 4. Fallback: en-US (default)
- Add Portuguese detection: if systemLocale.startsWith('pt') return 'pt-BR'
- Add validation: only return supported locales (en-US, pt-BR)
- Cache detected locale in memory for performance
- Add debug logging for detection process

**Day 2: Configuration & CLI (8 hours)** (8 hours)
Update configuration and add CLI commands
- Update aios-core/core-config.yaml with i18n section:
- - enabled: true
- - defaultLocale: en-US
- - supportedLocales: [en-US, pt-BR]
- - fallbackLocale: en-US
- - autoDetect: true (auto-detect from env or system)
- Update aios-core/scripts/cli.js with locale commands:
- - aios config get i18n.locale (show current locale)
- - aios config set i18n.locale <locale> (set explicit locale)
- - aios config set i18n.autoDetect <true|false> (enable/disable auto-detection)
- Test all 4 detection tiers with unit tests
- Verify locale switching without restart

---

## ✅ Acceptance Criteria

### Must Have
- [ ] detectLanguage() function implemented with 4-tier priority
- [ ] core-config.yaml updated with complete i18n section
- [ ] CLI commands work: aios config get/set i18n.locale
- [ ] Portuguese system locale auto-detected (pt-BR)
- [ ] Validation ensures only supported locales returned
- [ ] Locale switching works without restart
- [ ] Default behavior: auto-detect enabled, fallback to en-US

### Should Have
- [ ] Detection process logged for debugging
- [ ] Performance: detection <10ms
- [ ] Cache invalidation on config change


### Nice to Have
- [ ] Interactive locale selector wizard
- [ ] Locale detection testing tool


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 7.1: i18n Folder Structure & Documentation

### Dependent Stories (This Blocks)
- **Story 7.3: Extract English Strings

---

## 📁 Files Modified

### New Files Created
- `aios-core/i18n/localization-engine.js`

### Files Modified
- `aios-core/core-config.yaml`
- `aios-core/scripts/cli.js`


### Files Referenced (No Changes)
- None


---

## 🎨 Deliverables

### Language Detection Engine
**Location:** `aios-core/i18n/localization-engine.js`

Complete language detection with 4-tier priority and caching.

### i18n Configuration
**Location:** `aios-core/core-config.yaml`

Complete i18n configuration section with defaults.

---

## 💰 Investment Breakdown

- Day 1 (Detection Logic): $1,500
- Day 2 (Config & CLI): $1,500
- Total: $3,000

---

## 🎯 Success Metrics

- **Detection Accuracy:** 100% correct for all 4 priority tiers
- **Performance:** Detection completes in <10ms
- **CLI Functionality:** All locale commands working

---

## ⚠️ Risks & Mitigation

### Risk 1: System locale detection unreliable across platforms
- **Likelihood:** Medium
- **Impact:** Low
- **Mitigation:** Fallback to en-US, explicit config always overrides, test on Windows/macOS/Linux

---

## 📝 Notes

Auto-detection default: true. Users in PT-BR regions automatically get Portuguese UI. Explicit config always takes precedence for user control.

---

## 🔗 Related Documents

- **Epic:** [Epic-7](../epics/epic-7.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
