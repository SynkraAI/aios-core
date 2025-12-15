# 1MCP Quick Start - 5 Minutes to 85% Token Reduction

Get 1MCP running in 5 minutes and reduce Claude Code token usage from 280K to 40K.

---

## Prerequisites

- ✓ Node.js 18+ installed
- ✓ Claude Code installed
- ✓ 5 minutes

---

## Step 1: Install (30 seconds)

```bash
npm install -g @1mcp/agent
1mcp --version  # Verify
```

---

## Step 2: Add MCPs (1 minute)

```bash
1mcp mcp add context7 -- npx -y @upstash/context7-mcp
1mcp mcp add github -- npx -y @modelcontextprotocol/server-github
1mcp mcp add browser -- npx -y @modelcontextprotocol/server-puppeteer
```

---

## Step 3: Create Presets (30 seconds)

```bash
1mcp preset create aios-dev --filter "github,browser"
1mcp preset create aios-research --filter "context7,browser"
1mcp preset create aios-full --filter "context7,github,browser"
```

---

## Step 4: Start Server (10 seconds)

**Windows:**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "1mcp serve --port 3050 --host 127.0.0.1"
```

**Linux/macOS:**
```bash
screen -dmS 1mcp 1mcp serve --port 3050 --host 127.0.0.1
```

---

## Step 5: Configure Claude Code (1 minute)

Edit `~/.claude.json`:

```json
{
  "mcpServers": {
    "1mcp-dev": {
      "type": "http",
      "url": "http://127.0.0.1:3050/mcp?preset=aios-dev"
    }
  }
}
```

**⚠️ Remove old MCPs:**
Delete any existing `"context7"`, `"github"`, `"docker"` entries.

---

## Step 6: Restart Claude Code (30 seconds)

1. Close Claude Code completely
2. Reopen Claude Code
3. Run `/context`

**Expected Result:**
```
Context: ~35K tokens ✅
(Was 280K before)
```

---

## ✅ Success!

You now have:
- **85% token reduction** (280K → 40K)
- **Faster Claude Code** (less data to process)
- **More context space** for your code

---

## What's Next?

### Use It
Just work normally in Claude Code. 1MCP is transparent.

### Monitor It
```bash
# Check token budget
/context

# Check server health
curl http://127.0.0.1:3050/health
```

### Customize It
See `docs/guides/1mcp-implementation.md` for:
- Additional presets
- Agent-specific configurations
- Advanced troubleshooting

---

## Quick Troubleshooting

**Server not responding?**
```bash
curl http://127.0.0.1:3050/health
# If fails, restart: 1mcp serve --port 3050 --host 127.0.0.1
```

**Token budget still high?**
```bash
# Check ~/.claude.json has ONLY 1MCP servers
# Remove direct MCP connections
```

**Tools not working?**
```bash
1mcp mcp list  # All should be "enabled"
```

---

## Need Help?

- Full docs: `docs/guides/1mcp-implementation.md`
- Troubleshooting: `docs/guides/1mcp-troubleshooting.md`
- Issues: GitHub `@synkra/aios-core/issues`

---

**Ready to code with 85% less token overhead!** 🚀
