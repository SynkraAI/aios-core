# AIOS Scripts

Utility scripts for the AIOS Core framework.

## Available Scripts

### **generate-ecosystem-index.js**

Generates a centralized markdown index of all minds and agents in the ecosystem.

**Usage:**
```bash
node scripts/generate-ecosystem-index.js [options]
```

**Options:**
- `--quiet` - Suppress output
- `--minds` - Generate only minds section
- `--agents` - Generate only agents section
- `--squads` - Generate only squads section

**Output:** `docs/ECOSYSTEM-INDEX.md`

**Performance:** < 5 seconds

**Features:**
- Scans 36 minds from `squads/mind-cloning/minds/INDEX.md`
- Scans core agents from `.aiox-core/development/agents/`
- Scans squad agents from `squads/*/agents/`
- Graceful degradation (always exits 0)
- Auto-triggered by PostToolUse hook when agent files are edited

---

*For more scripts, see individual script files in this directory.*
