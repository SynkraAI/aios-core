# STORY: Cross-Platform Support

**ID:** STORY-1.10  
**Épico:** [EPIC-S1](../../../epics/epic-s1-installer-foundation.md)  
**Sprint:** 1 | **Points:** 8 | **Priority:** 🔴 Critical  
**Created:** 2025-01-19

---

## 📊 User Story

**Como** desenvolvedor,  
**Quero** que installer funcione em Windows, macOS e Linux,  
**Para** usar AIOS independente do meu OS

---

## ✅ Acceptance Criteria

- [ ] Funciona em Windows 10/11
- [ ] Funciona em macOS (Intel + Apple Silicon)
- [ ] Funciona em Linux (Ubuntu, Debian, Fedora)
- [ ] Path handling correto por OS (path.join(), não string concat)
- [ ] Shell commands adaptados por OS
- [ ] Line endings corretos (CRLF vs. LF)

---

## 🔧 Implementation

```javascript
const os = require('os');
const path = require('path');

function getShellCommand() {
  return os.platform() === 'win32' ? 'cmd.exe' : '/bin/bash';
}

function normalizePath(...segments) {
  return path.join(...segments); // Auto-handles OS differences
}

function getLineEnding() {
  return os.platform() === 'win32' ? '\r\n' : '\n';
}
```

---

## 📋 Tasks (8 pts = ~3 dias)

- [ ] 1.10.1: Test on Windows 10 (3h)
- [ ] 1.10.2: Test on Windows 11 (3h)
- [ ] 1.10.3: Test on macOS Intel (3h)
- [ ] 1.10.4: Test on macOS Apple Silicon (3h)
- [ ] 1.10.5: Test on Ubuntu 22.04 (3h)
- [ ] 1.10.6: Test on Debian (2h)
- [ ] 1.10.7: Test on Fedora (2h)
- [ ] 1.10.8: Fix OS-specific issues (8h)
- [ ] 1.10.9: Document OS requirements (2h)

**Total:** 29h (parallelizable across team)

---

## 🔗 Dependencies

- **Depende:** All installer stories
- **Critical for:** v2.1 release

---

**Criado por:** River 🌊

