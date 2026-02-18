# AIOS Terminal Integration

**Story:** CLI-DX-1 Phase 2 - Terminal Integration
**Status:** ✅ Complete
**Version:** 1.0.0

Visual context system for multi-tab Claude Code + AIOS sessions. Updates terminal tab titles and shell prompts with project context automatically.

---

## Architecture

```
Terminal UI (Observability Layer)
  ├─ update-tab-title.sh  → ANSI OSC sequences (updates tab title)
  ├─ zsh-integration.sh   → Shell hooks (precmd/chpwd)
  └─ prompt-injector.sh   → PS1 customization (inline context)
       ↓ (reads via file)
Session State (Data Layer)
  └─ .aios/session.json   → Current session context
```

---

## Files

| File | Purpose | Invoked By |
|------|---------|------------|
| `update-tab-title.sh` | Updates terminal tab title via ANSI escape sequences | zsh hooks, manual |
| `zsh-integration.sh` | Integrates with zsh (precmd/chpwd hooks) | `~/.zshrc` |
| `prompt-injector.sh` | Provides `aios_prompt()` function for PS1 | Manual sourcing |
| `setup-terminal-integration.js` | Installer script | `npx aios-core install` |
| `test-terminal-integration.sh` | Integration tests | CI/manual |
| `README.md` | This file | Documentation |

---

## Installation

### Automatic (via AIOS installer)

```bash
npx aios-core install
# Terminal integration will be offered during setup
```

### Manual

```bash
# 1. Create symlink
ln -s ~/aios-core/.aios-core/infrastructure/scripts/terminal/zsh-integration.sh \
      ~/.aios-core-terminal-integration.sh

# 2. Add to ~/.zshrc
echo '[[ -f ~/.aios-core-terminal-integration.sh ]] && source ~/.aios-core-terminal-integration.sh' >> ~/.zshrc

# 3. Reload shell
source ~/.zshrc
```

---

## Usage

### Tab Title Updates (Automatic)

When `.aios/session.json` exists in your project, the terminal tab title updates automatically:

**Format:** `{emoji} {name} [{progress}] {status_emoji} · {phase}`

**Example:** `🏗️ aios-core [2/4] ⚡ · development`

### Prompt Injection (Optional)

Add project context to your shell prompt:

```bash
# Add to ~/.zshrc
source ~/.aios-core-terminal-integration.sh
source ~/aios-core/.aios-core/infrastructure/scripts/terminal/prompt-injector.sh

# Customize PS1
export PS1='$(aios_prompt)%~ %# '
```

**Example prompt:** `🚀 squad-creator ⚡ 3/8 ~/aios-core/squads/squad-creator $`

---

## Session Context Format

The system reads `.aios/session.json`:

```json
{
  "project": {
    "type": "framework",
    "name": "aios-core",
    "emoji": "🏗️"
  },
  "status": {
    "phase": "development",
    "progress": "2/4",
    "emoji": "⚡"
  }
}
```

See `.aios-core/core/session/` for full schema and state management.

---

## Performance

| Metric | Target | Achieved |
|--------|--------|----------|
| Tab title update | <20ms | ~4ms ✅ |
| Prompt overhead | <5ms | ~2ms ✅ |
| Zero overhead (non-AIOS) | 0ms | ✅ (fail-fast) |

---

## Testing

Run integration tests:

```bash
cd .aios-core/infrastructure/scripts/terminal
bash test-terminal-integration.sh
```

**Test coverage:** 10 tests
- ✅ Valid session.json handling
- ✅ Missing session.json (graceful degradation)
- ✅ Invalid JSON handling
- ✅ jq fallback mode (grep-based parsing)
- ✅ zsh integration loading
- ✅ Duplicate loading prevention
- ✅ Prompt injection (valid session)
- ✅ Prompt injection (empty return)
- ✅ Performance benchmarks
- ✅ Executable permissions

---

## Troubleshooting

### Tab title not updating

```bash
# Check if integration is loaded
echo $AIOS_TERMINAL_INTEGRATED  # Should output: 1

# Check if session.json exists
ls -la .aios/session.json

# Manually trigger update
bash ~/aios-core/.aios-core/infrastructure/scripts/terminal/update-tab-title.sh
```

### Integration not loading on new terminals

```bash
# Verify symlink exists
ls -la ~/.aios-core-terminal-integration.sh

# Verify .zshrc sources it
grep aios-core-terminal-integration ~/.zshrc

# Reload shell
source ~/.zshrc
```

### Works in one project but not another

The integration is **project-scoped** — it only activates when `.aios/session.json` exists in the current directory.

---

## Bash Support

Currently **zsh-only**. Bash support planned for future story (Phase 2.5).

**Bash users:** You can still use the scripts manually:

```bash
# Update tab title manually
bash ~/aios-core/.aios-core/infrastructure/scripts/terminal/update-tab-title.sh

# Or create bash hook (add to ~/.bashrc)
PROMPT_COMMAND='bash ~/aios-core/.aios-core/infrastructure/scripts/terminal/update-tab-title.sh 2>/dev/null'
```

---

## Security

- Scripts use **read-only** access to `.aios/session.json`
- ANSI escape sequences are **safe** (OSC 0 = set title only)
- No code execution from session data
- Fail-fast when file doesn't exist (zero overhead for non-AIOS projects)

---

## Contributing

When modifying scripts:

1. Maintain performance targets (<20ms tab update)
2. Ensure graceful degradation (no errors when `.aios/session.json` missing)
3. Update integration tests
4. Test in both zsh and bash
5. Verify jq fallback mode works

---

## Related Documentation

- **Story:** `docs/stories/epics/epic-cli-dx/story-cli-dx-1-visual-context.md`
- **Session State:** `.aios-core/core/session/state-manager.js`
- **Context Tracker:** `.aios-core/core/session/context-tracker.js`
- **Project Types:** `.aios-core/core/session/project-types.yaml`

---

**Last Updated:** 2026-02-12
**Phase:** 2 (Terminal Integration) ✅ Complete
**Next Phase:** 3 (AIOS CLI Commands)
