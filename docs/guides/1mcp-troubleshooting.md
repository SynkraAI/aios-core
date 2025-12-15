# 1MCP Troubleshooting Guide

Complete troubleshooting reference for 1MCP in AIOS.

---

## Quick Diagnosis

Run these commands to identify the issue:

```bash
# 1. Check 1MCP server
curl http://127.0.0.1:3050/health

# 2. Check Claude Code config
cat ~/.claude.json | grep "mcpServers" -A 10

# 3. Check token budget
# In Claude Code: /context

# 4. Check MCP status
1mcp mcp list
```

---

## Common Issues

### 1. "Cannot connect to 1MCP server"

**Symptoms:**
- Claude Code shows "MCP connection failed"
- `/context` shows no tools or errors
- Tools don't load

**Diagnosis:**
```bash
curl http://127.0.0.1:3050/health
# Expected: {"status":"ok"}
# If fails: Server not running
```

**Solutions:**

#### A. Server Not Running
```bash
# Start server
1mcp serve --port 3050 --host 127.0.0.1

# Windows: Run in new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "1mcp serve --port 3050 --host 127.0.0.1"

# Linux/macOS: Run in screen
screen -dmS 1mcp 1mcp serve --port 3050 --host 127.0.0.1
```

#### B. Port Conflict
```bash
# Check if port 3050 occupied
# Windows:
netstat -ano | findstr :3050

# Linux/macOS:
lsof -i :3050

# If occupied, use different port:
1mcp serve --port 3051 --host 127.0.0.1

# Update ~/.claude.json:
{
  "mcpServers": {
    "1mcp-dev": {
      "url": "http://127.0.0.1:3051/mcp?preset=aios-dev"
    }
  }
}
```

#### C. Firewall Blocking
```bash
# Windows: Add firewall rule
netsh advfirewall firewall add rule name="1MCP" dir=in action=allow protocol=TCP localport=3050

# macOS: Check System Preferences → Security → Firewall
# Allow incoming connections to Node.js/1MCP

# Linux: UFW
sudo ufw allow 3050/tcp
```

#### D. Wrong Host Binding
```bash
# Ensure binding to localhost
1mcp serve --port 3050 --host 127.0.0.1

# NOT 0.0.0.0 (security risk)
```

---

### 2. "Token budget still high (>100K)"

**Symptoms:**
- `/context` shows > 100K tokens
- Claude Code slow or unresponsive
- "Context window exceeded" errors

**Diagnosis:**
```bash
# Check active preset
curl http://127.0.0.1:3050/mcp?preset=aios-dev | jq '.tools | length'
# Expected: 100-200 tools

# Check Claude Code config
cat ~/.claude.json
```

**Solutions:**

#### A. Direct MCPs Still Active
```json
// ❌ WRONG: Direct MCPs + 1MCP
{
  "mcpServers": {
    "context7": { ... },     // Remove this
    "github": { ... },       // Remove this
    "1mcp-dev": { ... }      // Keep this
  }
}

// ✅ CORRECT: Only 1MCP
{
  "mcpServers": {
    "1mcp-dev": {
      "type": "http",
      "url": "http://127.0.0.1:3050/mcp?preset=aios-dev"
    }
  }
}
```

Restart Claude Code after fixing.

#### B. Using aios-full Instead of aios-dev
```json
// Change from:
"url": "http://127.0.0.1:3050/mcp?preset=aios-full"

// To:
"url": "http://127.0.0.1:3050/mcp?preset=aios-dev"
```

Token budget: `aios-full` (60-80K) → `aios-dev` (25-40K)

#### C. Too Many Presets Active
```json
// ❌ WRONG: All presets active
{
  "mcpServers": {
    "1mcp-dev": { ... },
    "1mcp-research": { ... },
    "1mcp-docker": { ... },
    "1mcp-full": { ... }
  }
}

// ✅ CORRECT: One primary preset
{
  "mcpServers": {
    "1mcp-dev": { ... }
  }
}
```

Use only one preset at a time for lowest token budget.

---

### 3. "MCP tools not working"

**Symptoms:**
- Tools load but fail when executed
- "Tool execution error" messages
- Specific MCP (e.g., GitHub) not responding

**Diagnosis:**
```bash
# Check MCP status
1mcp mcp list

# Test MCP directly
npx -y @modelcontextprotocol/server-github
# Should start without errors
```

**Solutions:**

#### A. MCP Not Installed Properly
```bash
# Reinstall problematic MCP
1mcp mcp remove github
1mcp mcp add github -- npx -y @modelcontextprotocol/server-github

# Verify
1mcp mcp list
# Should show "enabled"
```

#### B. Missing Environment Variables
```bash
# GitHub requires token
export GITHUB_TOKEN="ghp_your_token_here"

# Context7 might need API key
export CONTEXT7_API_KEY="your_key"

# Restart 1MCP server
pkill -f "1mcp serve"
1mcp serve --port 3050 --host 127.0.0.1
```

#### C. NPM Package Issues
```bash
# Clear npx cache
rm -rf ~/.npm/_npx

# Reinstall package manually
npm install -g @modelcontextprotocol/server-github

# Add to 1MCP
1mcp mcp add github -- npx -y @modelcontextprotocol/server-github
```

---

### 4. "1MCP server crashes or restarts"

**Symptoms:**
- Server stops responding randomly
- Need to restart 1MCP frequently
- Intermittent tool failures

**Diagnosis:**
```bash
# Check server logs
# Windows: See PowerShell window
# Linux/macOS: screen -r 1mcp

# Look for error patterns:
# - Out of memory
# - Unhandled exceptions
# - Port conflicts
```

**Solutions:**

#### A. Increase Memory Limit
```bash
# Node.js default: 512MB
# Increase to 4GB:
NODE_OPTIONS="--max-old-space-size=4096" 1mcp serve --port 3050 --host 127.0.0.1
```

#### B. Use Process Manager (Production)
```bash
# Install PM2
npm install -g pm2

# Start 1MCP with PM2
pm2 start 1mcp -- serve --port 3050 --host 127.0.0.1
pm2 save
pm2 startup  # Auto-restart on reboot

# Monitor
pm2 status
pm2 logs 1mcp
```

#### C. Windows Service (Production)
```powershell
# See docs/architecture/mcp-optimization-1mcp.md for full setup

# Quick version:
# 1. Install NSSM (Non-Sucking Service Manager)
# 2. Create service:
nssm install 1MCP "C:\Program Files\nodejs\node.exe" "C:\Users\<user>\AppData\Roaming\npm\node_modules\@1mcp\agent\dist\cli.js serve --port 3050 --host 127.0.0.1"

# 3. Start service
nssm start 1MCP
```

---

### 5. "Preset not found"

**Symptoms:**
- "Preset 'aios-dev' not found" error
- 404 error when accessing preset URL

**Diagnosis:**
```bash
# List available presets
1mcp preset list

# Check config file
cat ~/.1mcp/config.json | jq '.presets'
```

**Solutions:**

#### A. Preset Not Created
```bash
# Create missing preset
1mcp preset create aios-dev --filter "github,browser"

# Verify
1mcp preset list
```

#### B. Config File Corrupted
```bash
# Backup current config
cp ~/.1mcp/config.json ~/.1mcp/config.json.backup

# Recreate config
1mcp mcp add github -- npx -y @modelcontextprotocol/server-github
1mcp mcp add browser -- npx -y @modelcontextprotocol/server-puppeteer
1mcp preset create aios-dev --filter "github,browser"
```

#### C. Typo in Preset Name
```json
// Check ~/.claude.json for typos
// ❌ Wrong:
"url": "http://127.0.0.1:3050/mcp?preset=aios_dev"

// ✅ Correct:
"url": "http://127.0.0.1:3050/mcp?preset=aios-dev"
```

---

### 6. "Slow tool response times"

**Symptoms:**
- Tools take >10s to execute
- Claude Code feels sluggish
- Timeout errors

**Diagnosis:**
```bash
# Test response time
time curl http://127.0.0.1:3050/mcp?preset=aios-dev > /dev/null

# Expected: <2s
# If >5s: Problem
```

**Solutions:**

#### A. Too Many MCPs in Preset
```bash
# Check preset filter
1mcp preset list

# If aios-full has too many:
# Create focused preset
1mcp preset create aios-quick --filter "github"

# Use in Claude Code
```

#### B. MCP Package Issues
```bash
# Update all MCPs
1mcp mcp remove github
1mcp mcp remove browser
1mcp mcp remove context7

# Reinstall latest versions
1mcp mcp add github -- npx -y @modelcontextprotocol/server-github
1mcp mcp add browser -- npx -y @modelcontextprotocol/server-puppeteer
1mcp mcp add context7 -- npx -y @upstash/context7-mcp
```

#### C. Network Latency
```bash
# Test localhost latency
ping 127.0.0.1
# Should be <1ms

# If high:
# - Check firewall rules
# - Check antivirus software
# - Restart network services
```

---

## Advanced Diagnostics

### Check 1MCP Internals

```bash
# 1. Config file location
ls ~/.1mcp/config.json

# 2. View full config
cat ~/.1mcp/config.json | jq '.'

# 3. Test each MCP individually
1mcp mcp test github
1mcp mcp test browser
1mcp mcp test context7
```

### Debug Mode

```bash
# Start 1MCP with debug logging
DEBUG=* 1mcp serve --port 3050 --host 127.0.0.1

# Watch logs in real-time
tail -f ~/.1mcp/logs/server.log  # If logs enabled
```

### Network Diagnostics

```bash
# 1. Test endpoint accessibility
curl -v http://127.0.0.1:3050/health

# 2. Test preset loading
curl -v http://127.0.0.1:3050/mcp?preset=aios-dev

# 3. Check response headers
curl -I http://127.0.0.1:3050/mcp?preset=aios-dev
```

---

## Performance Optimization

### Reduce Token Budget Further

```bash
# 1. Create minimal preset (GitHub only)
1mcp preset create aios-minimal --filter "github"

# Token budget: ~15K (vs 40K for aios-dev)

# 2. Use in ~/.claude.json
{
  "mcpServers": {
    "1mcp-minimal": {
      "url": "http://127.0.0.1:3050/mcp?preset=aios-minimal"
    }
  }
}
```

### Disable Unused Tools

```bash
# Example: Disable Context7 if not doing research
1mcp mcp disable context7

# Re-enable when needed
1mcp mcp enable context7
```

### Cache Optimization

```bash
# Clear npx cache periodically
rm -rf ~/.npm/_npx

# Reinstall MCPs fresh
1mcp mcp list | grep enabled | while read mcp; do
  1mcp mcp remove $mcp
  1mcp mcp add $mcp -- npx -y @modelcontextprotocol/server-$mcp
done
```

---

## Rollback Procedures

### Rollback to Direct MCPs

If 1MCP isn't working, revert to direct MCPs:

```bash
# 1. Stop 1MCP server
pkill -f "1mcp serve"

# 2. Restore backup config
cp ~/.claude.json.backup-pre-1mcp ~/.claude.json

# 3. Restart Claude Code
```

### Rollback to Previous Preset

```bash
# 1. Backup current config
cp ~/.1mcp/config.json ~/.1mcp/config.json.backup

# 2. Restore old config
cp ~/.1mcp/config.json.backup-<date> ~/.1mcp/config.json

# 3. Restart 1MCP server
pkill -f "1mcp serve"
1mcp serve --port 3050 --host 127.0.0.1
```

---

## Getting Help

### Self-Service

1. **Check logs:**
   - Windows: PowerShell window running 1MCP
   - Linux/macOS: `screen -r 1mcp`

2. **Run diagnostics:**
   ```bash
   curl http://127.0.0.1:3050/health
   1mcp mcp list
   1mcp preset list
   ```

3. **Search docs:**
   - `docs/guides/1mcp-implementation.md`
   - `docs/architecture/mcp-optimization-1mcp.md`

### Community Support

- **GitHub Issues:** `@synkra/aios-core/issues`
  - Tag: `mcp`, `1mcp`, `troubleshooting`

- **Slack:** `#aios-support`
  - Ask: "@pedro @mitchell @andrej @guillermo"

### Escalation

If issue persists after troubleshooting:

1. **Collect diagnostics:**
   ```bash
   curl http://127.0.0.1:3050/health > 1mcp-diagnostics.txt
   1mcp mcp list >> 1mcp-diagnostics.txt
   1mcp preset list >> 1mcp-diagnostics.txt
   cat ~/.claude.json >> 1mcp-diagnostics.txt
   ```

2. **Create GitHub issue:**
   - Title: "[1MCP] Brief description"
   - Attach: `1mcp-diagnostics.txt`
   - Include: OS, Node version, 1MCP version

3. **Tag experts:**
   - Systems: @pedro-valerio
   - Infrastructure: @mitchell-hashimoto
   - Performance: @andrej-karpathy
   - DX: @guillermo-rauch

---

## FAQ

**Q: Why is token budget still 280K after installing 1MCP?**
A: Check `~/.claude.json` - you likely still have direct MCP connections. Remove them and keep only 1MCP entries.

**Q: Can I use multiple presets simultaneously?**
A: Yes, but it increases token budget. Best practice: Use one primary preset, switch as needed.

**Q: How do I update 1MCP?**
A: `npm update -g @1mcp/agent` then restart server.

**Q: Does 1MCP work with all MCPs?**
A: Works with any MCP that follows the protocol. Test with `1mcp mcp test <name>`.

**Q: Can I create custom presets?**
A: Yes! `1mcp preset create my-preset --filter "mcp1,mcp2,mcp3"`

**Q: What if I need Docker tools sometimes?**
A: Enable on-demand: `1mcp mcp enable docker`, use `aios-docker` preset, disable after.

**Q: Is 1MCP production-ready?**
A: Yes, validated by AIOS roundtable. Use PM2 or Windows Service for production deployments.

---

**Still stuck? Post in #aios-support or create GitHub issue.** 🔧
