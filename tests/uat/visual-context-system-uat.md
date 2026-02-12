# User Acceptance Testing - Visual Context System

**Story:** CLI-DX-1 - Visual Context System
**Date:** 2026-02-12
**Tester:** _________

---

## Test Environment Setup

- [ ] Fresh terminal session started
- [ ] AIOS installed: `npx aios-core install`
- [ ] Terminal integration sourced: `source ~/.aios-core-terminal-integration.sh`
- [ ] Working in AIOS project: `cd ~/aios-core`

---

## 1. Terminal Integration

### 1.1 Tab Title Updates

- [ ] **Test:** Create new session
  - Run: `aios context set "Test Project" --emoji 🧪`
  - **Expected:** Terminal tab title shows `🧪 Test Project`
  - **Actual:** _________

- [ ] **Test:** Update context
  - Run: `aios context set "Test Project" --emoji 🚀 --progress 3/5`
  - **Expected:** Tab title shows `🚀 Test Project [3/5]`
  - **Actual:** _________

- [ ] **Test:** Clear context
  - Run: `aios context clear`
  - **Expected:** Tab title resets to default
  - **Actual:** _________

### 1.2 zsh Hooks

- [ ] **Test:** precmd hook (before each prompt)
  - Run any command: `ls`
  - **Expected:** Tab title updates automatically after command
  - **Actual:** _________

- [ ] **Test:** chpwd hook (on directory change)
  - Run: `cd /tmp && cd -`
  - **Expected:** Tab title updates on `cd`
  - **Actual:** _________

### 1.3 Prompt Integration (Optional)

- [ ] **Test:** PS1 custom prompt
  - Enable: Add `export PS1='$(aios_prompt)%F{blue}%~%f %# '` to `~/.zshrc`
  - Source: `source ~/.zshrc`
  - **Expected:** Prompt shows context inline
  - **Actual:** _________

---

## 2. CLI Commands

### 2.1 aios context auto

- [ ] **Test:** Auto-detection
  - Run: `aios context auto`
  - **Expected:** Detects project type, emoji, and context automatically
  - **Actual:** _________

### 2.2 aios context set

- [ ] **Test:** Manual set with all options
  - Run: `aios context set "My Project" --emoji ⚡ --phase development --progress 2/5`
  - **Expected:** Context updated with all fields
  - Verify: `aios context show`
  - **Actual:** _________

### 2.3 aios context show

- [ ] **Test:** Display current context
  - Run: `aios context show`
  - **Expected:** Shows formatted context with emoji, name, status, progress
  - **Actual:** _________

### 2.4 aios context clear

- [ ] **Test:** Clear with archive
  - Run: `aios context clear --archive`
  - **Expected:** Session cleared and archived to `.aios/sessions/history/`
  - **Actual:** _________

---

## 3. Agent Activation Integration

- [ ] **Test:** Activate dev agent
  - Run: `@dev` or activate via Claude Code
  - **Expected:** Tab emoji changes to 💻
  - Verify: `cat .aios/session.json | jq .metadata.activeAgent`
  - **Actual:** _________

- [ ] **Test:** Activate different agent types
  - Run: `@architect`
  - **Expected:** Tab emoji changes to 🏗️
  - Run: `@qa`
  - **Expected:** Tab emoji changes to 🧪
  - **Actual:** _________

---

## 4. Story Progress Tracking

- [ ] **Test:** Create test story
  - Create file: `docs/stories/test-story.md`
  - Content:
    ```markdown
    # Story TEST-UAT

    - [x] Task 1
    - [x] Task 2
    - [ ] Task 3
    - [ ] Task 4

    Story ID: TEST-UAT
    ```
  - Run story tracker (if available) or manually update
  - **Expected:** Progress shows 2/4 (50%)
  - **Actual:** _________

- [ ] **Test:** Update story progress
  - Mark Task 3 as complete: `- [x] Task 3`
  - Save file
  - **Expected:** Progress updates to 3/4 (75%)
  - **Actual:** _________

---

## 5. Permission Mode Integration

- [ ] **Test:** Cycle permission modes
  - Run: `aios mode explore`
  - **Expected:** Tab emoji changes to 🧭
  - Run: `aios mode ask`
  - **Expected:** Tab emoji changes to 🛡️
  - Run: `aios mode auto`
  - **Expected:** Tab emoji changes to ⚡
  - **Actual:** _________

---

## 6. Workflow Integration

- [ ] **Test:** Workflow execution (if available)
  - Run a test workflow
  - **Expected:** Progress updates through workflow steps
  - **Expected:** Emoji changes per phase
  - **Actual:** _________

---

## 7. Performance

### 7.1 Response Time

- [ ] **Test:** CLI command responsiveness
  - Run: `time aios context show`
  - **Expected:** Completes in <100ms
  - **Actual:** _________ms

### 7.2 Tab Title Latency

- [ ] **Test:** Tab title update speed
  - Run: `aios context set "Quick Test" --emoji 🚀`
  - Observe terminal tab
  - **Expected:** Updates within 100ms (feels instant)
  - **Actual:** _________

### 7.3 Zero Overhead

- [ ] **Test:** Non-AIOS project
  - Run: `cd /tmp && mkdir test-project && cd test-project`
  - Run: `aios context show`
  - **Expected:** Graceful fail or "No AIOS project detected"
  - **Expected:** No errors in terminal
  - **Actual:** _________

---

## 8. Multi-Tab Workflow

- [ ] **Test:** Open 3+ terminal tabs with different contexts
  - Tab 1: `aios context set "Project A" --emoji ⚡`
  - Tab 2: `aios context set "Project B" --emoji 🔬`
  - Tab 3: `aios context set "Project C" --emoji 🏗️`
  - **Expected:** Each tab shows distinct emoji and name
  - **Expected:** Context switching <2 seconds
  - **Actual:** _________

---

## 9. Terminal Compatibility

### 9.1 iTerm2

- [ ] **Test:** Tab title updates work
- [ ] **Test:** Emoji display correctly
- [ ] **Test:** No ANSI escape code artifacts
- **Actual:** _________

### 9.2 Terminal.app

- [ ] **Test:** Tab title updates work
- [ ] **Test:** Emoji display correctly
- [ ] **Test:** No ANSI escape code artifacts
- **Actual:** _________

### 9.3 Alacritty (if available)

- [ ] **Test:** Tab title updates work
- [ ] **Test:** Emoji display correctly
- **Actual:** _________

---

## 10. Error Handling

- [ ] **Test:** Invalid emoji
  - Run: `aios context set "Test" --emoji "invalid"`
  - **Expected:** Graceful error or fallback to default
  - **Actual:** _________

- [ ] **Test:** Invalid progress format
  - Run: `aios context set "Test" --progress "abc"`
  - **Expected:** Error message explaining format
  - **Actual:** _________

- [ ] **Test:** Corrupted session.json
  - Manually corrupt: `echo "invalid json" > .aios/session.json`
  - Run: `aios context show`
  - **Expected:** Graceful recovery or clear error
  - **Actual:** _________

---

## 11. Documentation

- [ ] **Test:** Quick Reference Card exists
  - Check: `cat .aios/visual-context-system.md`
  - **Expected:** Complete reference card with examples
  - **Actual:** _________

- [ ] **Test:** Help text available
  - Run: `aios context --help`
  - **Expected:** Clear usage instructions
  - **Actual:** _________

---

## 12. Edge Cases

- [ ] **Test:** Very long project name (>60 chars)
  - Run: `aios context set "ThisIsAVeryLongProjectNameThatExceedsSixtyCharactersToTestTruncation"`
  - **Expected:** Name truncated gracefully in tab title
  - **Actual:** _________

- [ ] **Test:** Unicode emoji edge cases
  - Run: `aios context set "Test" --emoji 👨‍👩‍👧‍👦`
  - **Expected:** Complex emoji handled correctly
  - **Actual:** _________

- [ ] **Test:** Rapid context updates
  - Run: `for i in {1..10}; do aios context set "Test $i"; done`
  - **Expected:** All updates processed without errors
  - **Actual:** _________

---

## Final Acceptance

### Overall Experience

- [ ] Context switching between tabs is <2 seconds
- [ ] Visual identification is instant and accurate
- [ ] No errors or warnings during normal usage
- [ ] Performance feels snappy (<100ms for all operations)
- [ ] Terminal integration is non-intrusive
- [ ] Emoji rendering works correctly
- [ ] Documentation is clear and complete

### Pass Criteria

**PASS** if:
- All core functionality tests pass (sections 1-6)
- Performance targets met (section 7)
- No critical bugs in error handling (section 10)
- Works on at least 2 terminal emulators (section 9)

**FAIL** if:
- Core functionality broken (tab title, CLI commands, agent activation)
- Performance >500ms for any operation
- Errors/crashes during normal usage
- Incompatible with primary terminal emulator

---

## Sign-Off

**Tester:** ___________________ **Date:** ___________

**Result:** [ ] PASS [ ] FAIL [ ] CONDITIONAL PASS

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Blockers:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Recommendations:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
