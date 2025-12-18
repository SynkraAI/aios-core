# MCP API Keys Management - Centralized Configuration Guide

**Created:** 2025-10-26
**Status:** Recommended Best Practice
**Related:** Story 3.26 - MCP Context Optimization

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Supported MCPs & Keys](#supported-mcps--keys)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### Problem
When using multiple MCP servers with 1MCP, each server may require API keys. Managing these keys across:
- Individual user environments
- Team sharing (with user-specific keys)
- Multiple projects
- Development vs production

...becomes complex and error-prone.

### Solution: Centralized .claude-env

**Single source of truth** for all MCP API keys:
- ✅ **User-specific:** Each developer has their own `~/.claude-env`
- ✅ **Template-driven:** `~/.claude-env.example` committed to repo
- ✅ **Automatic loading:** Startup scripts load env vars before 1MCP starts
- ✅ **Git-ignored:** Actual keys never committed
- ✅ **Cross-platform:** Works on Windows, macOS, Linux

---

## Architecture

### File Structure

```
~/.claude-env.example          # ✅ COMMITTED - Template with placeholders
~/.claude-env                  # ❌ IGNORED - Your actual API keys
scripts/start-1mcp-with-env.*  # ✅ COMMITTED - Startup scripts
```

### Flow

```
User runs startup script
  ↓
Script loads ~/.claude-env
  ↓
Environment variables set (EXA_API_KEY, GITHUB_TOKEN, etc.)
  ↓
1MCP server starts with inherited env vars
  ↓
Each MCP server reads its required env var
  ↓
All MCPs authenticated ✅
```

### Why This Works

**1MCP limitation:** Cannot configure env vars per MCP in `mcp.json`

**Our solution:** Set env vars globally BEFORE starting 1MCP, so all child processes (MCPs) inherit them.

---

## Setup Instructions

### Step 1: Copy Template

```bash
# Windows (PowerShell)
Copy-Item "$env:USERPROFILE\.claude-env.example" "$env:USERPROFILE\.claude-env"

# Linux/macOS
cp ~/.claude-env.example ~/.claude-env
```

### Step 2: Edit Your Keys

Open `~/.claude-env` in your editor and replace placeholders:

```bash
# Before (template)
EXA_API_KEY=your-exa-api-key-here

# After (your actual key)
EXA_API_KEY=your-actual-exa-api-key
```

**Important:** Only edit `~/.claude-env`, never commit it!

### Step 3: Use Startup Script

**Instead of:**
```bash
1mcp serve --port 3050
```

**Use:**
```bash
# Windows
scripts\start-1mcp-with-env.cmd

# Linux/macOS
./scripts/start-1mcp-with-env.sh
```

The script will:
1. Load your `.claude-env` automatically
2. Verify critical keys are configured
3. Start 1MCP with all env vars available

### Step 4: Verify

Once 1MCP starts, test an MCP that requires a key:

```bash
# From another terminal
curl "http://127.0.0.1:3050/mcp?preset=aios-research" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

If exa tools appear, the EXA_API_KEY is working! ✅

---

## Supported MCPs & Keys

### Core MCPs (Required for Basic Functionality)

| MCP | Env Var | How to Get | Free Tier |
|-----|---------|------------|-----------|
| **exa** | `EXA_API_KEY` | https://exa.ai/signup | ✅ 1000 searches/mo |
| **github** | `GITHUB_TOKEN` | GitHub Settings → Developer → PAT | ✅ Unlimited (public repos) |
| **context7** | `CONTEXT7_API_KEY` | https://context7.com/signup | ✅ 100 searches/day |

### Optional MCPs (Team/Enterprise Features)

| MCP | Env Var | How to Get | Free Tier |
|-----|---------|------------|-----------|
| **clickup** | `CLICKUP_API_KEY` | ClickUp → Settings → Apps → API | ✅ On all plans |
| **supabase** | `SUPABASE_ACCESS_TOKEN` | Supabase Dashboard → Settings → API | ✅ Free tier available |
| **google-workspace** | `GOOGLE_OAUTH_CLIENT_ID`<br>`GOOGLE_OAUTH_CLIENT_SECRET` | Google Cloud Console → APIs | ✅ Free quota |
| **n8n** | `N8N_API_URL`<br>`N8N_API_KEY` | n8n → Settings → API Keys | ✅ Self-hosted free |
| **portainer** | `PORTAINER_URL`<br>`PORTAINER_TOKEN` | Portainer → Account → API tokens | ✅ Community edition |

### Advanced MCPs (Paid Services)

| MCP | Env Var | How to Get | Notes |
|-----|---------|------------|-------|
| **21st-dev-magic** | `MAGIC_21ST_API_KEY` | https://21st.dev/api-keys | Paid - UI generation |
| **magic-patterns** | `MAGIC_PATTERNS_API_KEY` | https://magicpatterns.com/settings/api | Paid - Component gen |
| **figma** | `FIGMA_API_TOKEN` | Figma → Settings → Personal Access Tokens | Requires Figma account |
| **anthropic** | `ANTHROPIC_API_KEY` | https://console.anthropic.com/ | Paid - Claude API |
| **openai** | `OPENAI_API_KEY` | https://platform.openai.com/api-keys | Paid - GPT API |
| **perplexity** | `PERPLEXITY_API_KEY` | https://www.perplexity.ai/settings/api | Paid - Search API |

### Infrastructure (Optional)

| Service | Env Vars | Use Case |
|---------|----------|----------|
| **SSH** | `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PASSWORD` | Remote server access |
| **Miro** | `MIRO_ACCESS_TOKEN` | Collaborative whiteboarding |

---

## Security Best Practices

### 1. Never Commit .claude-env

**Always in `.gitignore`:**
```gitignore
# AIOS Environment (contains API keys)
.claude-env
**/. claude-env

# But commit the template
!.claude-env.example
```

### 2. Rotate Keys Regularly

- **GitHub PAT:** Expire after 90 days, regenerate
- **API Keys:** Rotate quarterly or after team member leaves
- **Document rotation** in team wiki/1Password

### 3. Use Minimal Permissions

**GitHub Token:** Only grant necessary scopes:
- ✅ `repo` (if you need private repos)
- ✅ `public_repo` (public repos only - recommended)
- ❌ Don't grant `admin:org` unless absolutely needed

**ClickUp API:** Create a dedicated "MCP Integration" user with read-only access if possible.

### 4. Team Key Management

**Option A: Individual Keys (Recommended)**
- Each developer uses their own API keys
- Better audit trail
- No shared credential risk

**Option B: Shared Team Keys (If Required)**
- Store in password manager (1Password, LastPass)
- Document who has access
- Rotate immediately when team member leaves

### 5. Production vs Development

**Different keys for different environments:**

```bash
# Development (~/.claude-env)
EXA_API_KEY=dev-key-with-low-limits
SUPABASE_ACCESS_TOKEN=dev-project-token

# Production (server environment variables)
EXA_API_KEY=prod-key-with-high-limits
SUPABASE_ACCESS_TOKEN=prod-project-token
```

**Never use production keys in local development!**

---

## Troubleshooting

### Issue 1: MCP Still Fails with "API Key Required"

**Symptoms:**
```
Error: EXA_API_KEY environment variable is required
```

**Diagnosis:**
```bash
# Check if env var is set
echo $EXA_API_KEY  # Linux/macOS
echo %EXA_API_KEY%  # Windows CMD
$env:EXA_API_KEY   # Windows PowerShell
```

**Solutions:**

1. **Verify you're using the startup script:**
   ```bash
   # ❌ Wrong - env vars not loaded
   1mcp serve --port 3050

   # ✅ Correct - script loads .claude-env
   ./scripts/start-1mcp-with-env.sh
   ```

2. **Check .claude-env syntax:**
   ```bash
   # ❌ Wrong - quotes break parsing
   EXA_API_KEY="your-key-here"

   # ✅ Correct - no quotes
   EXA_API_KEY=your-key-here
   ```

3. **Verify file location:**
   ```bash
   # Should be in home directory, not project directory
   ls -la ~/.claude-env
   ```

### Issue 2: Keys Work in Terminal but Not in 1MCP

**Cause:** 1MCP started as background service without inheriting env vars

**Solution:** Stop background service, use startup script:

```bash
# Linux/macOS - Stop systemd service
sudo systemctl stop 1mcp

# Start with script instead
./scripts/start-1mcp-with-env.sh

# Or update systemd service to load .claude-env
sudo nano /etc/systemd/system/1mcp.service
# Add: EnvironmentFile=/home/yourusername/.claude-env
```

### Issue 3: Some Keys Work, Others Don't

**Diagnosis:** Check which MCPs connected successfully:

```bash
# View 1MCP logs (if running in foreground)
# Look for:
#   ✅ "Successfully connected to github"
#   ❌ "Failed to connect to exa: API key required"
```

**Solution:** Ensure ALL required keys are in `.claude-env`, not just some.

### Issue 4: Startup Script Can't Find .claude-env

**Symptoms:**
```
ERROR: .claude-env file not found!
```

**Solution:**
```bash
# Verify file exists
ls -la ~/.claude-env

# If not, copy from template
cp ~/.claude-env.example ~/.claude-env

# Edit with your keys
nano ~/.claude-env  # or use your preferred editor
```

### Issue 5: Permission Denied on Startup Script (Linux/macOS)

**Symptoms:**
```
bash: ./scripts/start-1mcp-with-env.sh: Permission denied
```

**Solution:**
```bash
chmod +x scripts/start-1mcp-with-env.sh
```

---

## Integration with AIOS Installation

### For New Users

When installing AIOS-FullStack, include in setup:

```bash
# Step in installation script
echo "Setting up MCP environment..."

# Copy template
cp .claude-env.example ~/.claude-env

echo ""
echo "⚠️  IMPORTANT: Edit ~/.claude-env and add your API keys"
echo ""
echo "Required keys (free tier available):"
echo "  - EXA_API_KEY (https://exa.ai/signup)"
echo "  - GITHUB_TOKEN (GitHub Settings → Developer → PAT)"
echo ""
echo "Optional keys (see docs/architecture/mcp-api-keys-management.md):"
echo "  - CLICKUP_API_KEY, SUPABASE_ACCESS_TOKEN, etc."
echo ""

# Prompt user to edit
read -p "Press Enter when you've added your keys to continue..."
```

### For Existing Users

Migration guide in main docs:

1. Extract keys from `~/.claude.json` (if using direct MCPs)
2. Copy to `~/.claude-env`
3. Switch to 1MCP with startup script
4. Test each MCP

---

## Advanced: CI/CD Integration

### GitHub Actions

```yaml
name: Test AIOS with MCPs

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup environment
        run: |
          echo "EXA_API_KEY=${{ secrets.EXA_API_KEY }}" >> ~/.claude-env
          echo "GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}" >> ~/.claude-env

      - name: Start 1MCP
        run: |
          npm install -g @1mcp/agent
          ./scripts/start-1mcp-with-env.sh &
          sleep 10  # Wait for startup

      - name: Test MCPs
        run: |
          curl http://127.0.0.1:3050/health
          # Add more tests...
```

### Docker

```dockerfile
FROM node:18

# Install 1MCP
RUN npm install -g @1mcp/agent

# Copy startup script
COPY scripts/start-1mcp-with-env.sh /usr/local/bin/

# Set environment from build args or runtime
ENV EXA_API_KEY=${EXA_API_KEY}
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

# Start 1MCP
CMD ["start-1mcp-with-env.sh"]
```

---

## FAQ

### Q: Can I use different .claude-env per project?

**A:** Yes! Modify the startup script to check for `./.claude-env` (project-local) before falling back to `~/.claude-env` (global).

```bash
if [ -f "./.claude-env" ]; then
    source ./.claude-env
elif [ -f "$HOME/.claude-env" ]; then
    source "$HOME/.claude-env"
else
    echo "No .claude-env found!"
    exit 1
fi
```

### Q: Should I commit .claude-env.example?

**A:** **YES!** The example file helps new team members know:
- Which keys they need
- Where to get them
- Expected format

Just ensure actual keys (`your-key-here` placeholders) are never committed.

### Q: What if I don't need all MCPs?

**A:** You can leave keys as placeholders in `.claude-env`. The startup script will warn you, but 1MCP will start. Only MCPs with valid keys will be functional.

### Q: Can I use environment variables instead of .claude-env?

**A:** Yes! If you set env vars manually (e.g., in `.bashrc`), you don't need `.claude-env`. The startup script checks both:
1. Existing env vars (if already set)
2. `.claude-env` (if env vars not set)

---

## Summary

**Centralized API key management with `.claude-env`:**

✅ **Benefits:**
- Single source of truth per user
- Easy onboarding (copy template, fill keys)
- Git-safe (never commit actual keys)
- Cross-platform (Windows, macOS, Linux)
- Team-friendly (template in repo, keys per developer)

✅ **Best Practices:**
- Use startup scripts (loads .claude-env automatically)
- Rotate keys regularly
- Minimal permissions per key
- Different keys for dev/prod
- Document key sources in template

✅ **Files:**
- `~/.claude-env.example` - Template (COMMIT)
- `~/.claude-env` - Your keys (IGNORE)
- `scripts/start-1mcp-with-env.*` - Startup scripts (COMMIT)

---

**Related Documentation:**
- [MCP Optimization Guide](./mcp-optimization-1mcp.md)
- [AIOS Installation Guide](../../README.md)
- [Security Best Practices](../security/api-key-security.md)

**Version:** 1.0
**Last Updated:** 2025-10-26
