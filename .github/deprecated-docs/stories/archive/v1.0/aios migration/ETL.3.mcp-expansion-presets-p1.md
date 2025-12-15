# Story ETL.3: MCP Expansion + Presets (P1) - Complete Tool Registration

**Epic:** Epic ETL - ETL Expansion Pack
**Status:** Draft
**Priority:** P1 (High - Critical Integration)
**Estimated Effort:** 4 hours
**Sprint:** Week 2 (Q1 2026)
**Dependencies:** 🔴 HARD BLOCKER - Epic 6.2 Stories 6.2.1 + 6.2.2 MUST be complete

---

## Story

**As a** AIOS agent (any of the 13 agents),
**I want** to access all 4 ETL tools (transcribe_video, collect_web, sample_emails, process_books) via preset-filtered 1MCP endpoints,
**so that** I can collect data from any source type without adding 50K tokens to my context budget.

---

## Acceptance Criteria

1. **MCP Server Expansion** ⚠️ DEPENDS ON Epic 6.2.1
   - All 4 tools registered in mcp_server.js following documented pattern
   - Each tool has correct schema (parameters, descriptions)
   - Each tool correctly routes to Python collector via bridge
   - Error handling consistent across all tools
   - Server startup validates all 4 tools registered

2. **Preset Configuration** 🔴 DEPENDS ON Epic 6.2.2
   - `aios-dev` preset includes ETL (github, browser, etl-toolkit)
   - `aios-research` preset includes ETL (context7, browser, etl-toolkit)
   - `aios-mmos` preset includes ETL (context7, etl-toolkit)
   - Token budget validation: each preset ≤ documented limits
   - Preset switching works (ETL loads/unloads correctly)

3. **Tool Schemas Validated**
   - `transcribe_video` schema matches VideoTranscriber parameters
   - `collect_web` schema matches WebCollector parameters
   - `sample_emails` schema matches EmailSampler parameters
   - `process_books` schema matches BookProcessor parameters
   - All required parameters marked correctly
   - All optional parameters have defaults documented

4. **Integration Testing**
   - All 4 tools callable via 1MCP HTTP endpoint
   - Tools work correctly when called through presets
   - Tools return proper error messages for invalid inputs
   - Token budget measured for each preset (actual vs expected)
   - No tool interference (calling one doesn't affect others)

5. **Documentation Updated**
   - Tool usage examples added to README.md
   - Preset selection guide referenced (Epic 6.2.2)
   - Parameter documentation for all 4 tools
   - Common error codes documented

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type**: Integration (1MCP protocol, preset system)
**Secondary Type(s)**: API (Tool registration), Deployment (1MCP configuration)
**Complexity**: Medium-High (depends on Epic 6.2 documentation accuracy)

### Specialized Agent Assignment
**Primary Agents**:
- @dev (Dex): MCP server expansion implementation
- @devops (Gage): 1MCP preset configuration and deployment

**Supporting Agents**:
- @architect (Aria): Tool schema design review
- @qa (Quinn): Integration testing validation

### Quality Gate Tasks
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Validate 1MCP integration before PR
- [ ] Pre-Deployment (@devops): Verify preset configurations in production

### CodeRabbit Focus Areas
**Primary Focus**:
- MCP tool schema compliance (matches MCP SDK specification)
- Preset configuration structure (follows Epic 6.2.2 documented format)
- Error handling (consistent error messages, proper error codes)
- Token budget validation (actual measurements match expectations)

**Secondary Focus**:
- Documentation completeness (all parameters documented)
- Integration test coverage (all 4 tools + all 3 presets)
- Backward compatibility (Story ETL.1 still works)

---

## Tasks / Subtasks

### Task 1: Expand MCP Server (2h) ⚠️ REQUIRES Epic 6.2.1
- [ ] Read Epic 6.2.1 documentation (docs/architecture/mcp-optimization-1mcp.md)
- [ ] Update `lib/mcp_server.js` to register 3 additional tools (AC: 1)
  - [ ] Register `collect_web_content` tool
    - [ ] Schema: url (required), timeout (optional, default 30)
    - [ ] Route to: bridge.py → web_collector → collect()
  - [ ] Register `sample_email_archive` tool
    - [ ] Schema: archive_path (required), query (required), max_samples (optional, default 100)
    - [ ] Route to: bridge.py → email_sampler → collect()
  - [ ] Register `process_book` tool
    - [ ] Schema: book_path (required), chunk_size (optional, default 8000)
    - [ ] Route to: bridge.py → book_processor → collect()
- [ ] Implement tool routing in bridge.py (AC: 1)
  - [ ] Add 'collect_web' operation handler
  - [ ] Add 'sample_emails' operation handler
  - [ ] Add 'process_books' operation handler
- [ ] Test: All 4 tools registered (use `list_tools` command) (AC: 1)

### Task 2: Create/Update Presets (1h) 🔴 REQUIRES Epic 6.2.2
- [ ] Read Epic 6.2.2 documentation (docs/architecture/mcp-preset-guide.md)
- [ ] Update preset: `aios-dev` (AC: 2)
  - [ ] Current: github, browser
  - [ ] Add: etl-toolkit
  - [ ] Command: `1mcp preset update aios-dev --add etl-toolkit`
- [ ] Update preset: `aios-research` (AC: 2)
  - [ ] Current: context7, browser
  - [ ] Add: etl-toolkit
  - [ ] Command: `1mcp preset update aios-research --add etl-toolkit`
- [ ] Update preset: `aios-mmos` (AC: 2)
  - [ ] Current: context7
  - [ ] Add: etl-toolkit
  - [ ] Command: `1mcp preset update aios-mmos --add etl-toolkit`
- [ ] Verify preset configurations saved (AC: 2)

### Task 3: Tool Schema Validation (30min)
- [ ] Create `tests/tool_schema_validation.js` (AC: 3)
  - [ ] Test: transcribe_video schema complete
  - [ ] Test: collect_web_content schema complete
  - [ ] Test: sample_email_archive schema complete
  - [ ] Test: process_book schema complete
  - [ ] Test: Required parameters enforce correctly
  - [ ] Test: Optional parameters have defaults
- [ ] Run validation tests (AC: 3)
- [ ] Document schema in `docs/API.md` (AC: 5)

### Task 4: Integration Testing (1.5h)
- [ ] Create `tests/integration_tests.js` (AC: 4)
  - [ ] Test Suite 1: Direct MCP Calls
    - [ ] Call transcribe_video directly
    - [ ] Call collect_web_content directly
    - [ ] Call sample_email_archive directly
    - [ ] Call process_book directly
  - [ ] Test Suite 2: 1MCP Preset Calls
    - [ ] Call ETL via aios-dev preset
    - [ ] Call ETL via aios-research preset
    - [ ] Call ETL via aios-mmos preset
    - [ ] Verify tool not available in presets without ETL
  - [ ] Test Suite 3: Error Handling
    - [ ] Invalid URL for collect_web_content
    - [ ] Missing file for process_book
    - [ ] Invalid query for sample_email_archive
  - [ ] Test Suite 4: Token Budget Measurement
    - [ ] Measure tokens for aios-dev preset (expect ~45K)
    - [ ] Measure tokens for aios-research preset (expect ~60K)
    - [ ] Measure tokens for aios-mmos preset (expect ~55K)
- [ ] Run all integration tests and verify pass (AC: 4)

---

## Dev Notes

### Epic Context
This is **Story 3 of 5** in the ETL Expansion Pack epic. This story is **CRITICAL** as it completes the MCP integration and makes ETL accessible to all AIOS agents.

**Success = All 13 AIOS agents can use all 4 ETL tools via their preferred presets.**

### Critical Dependencies 🔴
This story **CANNOT START** until Epic 6.2 Stories 6.2.1 + 6.2.2 are complete.

**Why:**
- **Epic 6.2.1**: Documents 1MCP registration pattern (how to add MCPs)
- **Epic 6.2.2**: Documents preset structure (how to configure presets)

**Risk Mitigation:**
- If Epic 6.2 delays, this story BLOCKS
- Timeline assumes Epic 6.2 completes Week 1 (per Option C)

### Tool Registration Pattern (from Epic 6.2.1)
```javascript
// Expected pattern from Epic 6.2.1 documentation
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "collect_web_content",
      description: "Collect and convert web page to markdown",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to collect" },
          timeout: { type: "number", description: "Timeout in seconds", default: 30 }
        },
        required: ["url"]
      }
    },
    // ... 3 more tools
  ]
}));
```

### Preset Structure (from Epic 6.2.2)
```yaml
# Expected structure from Epic 6.2.2 documentation
aios-dev:
  mcps:
    - github
    - browser
    - etl-toolkit  # ADD THIS
  token_budget: ~45K
  use_cases:
    - Story implementation
    - PRs
    - Code reviews
```

### Token Budget Analysis
**Before ETL (current state):**
- aios-dev: ~35K tokens
- aios-research: ~50K tokens
- aios-mmos: ~45K tokens

**After ETL (this story):**
- aios-dev: ~45K tokens (+10K)
- aios-research: ~60K tokens (+10K)
- aios-mmos: ~55K tokens (+10K)

**Validation:** Use `/context` command in Claude Code to measure actual tokens.

### Integration Testing Strategy
**Direct MCP Calls:**
- Use MCP SDK client to call tools directly
- Validates MCP protocol implementation

**1MCP Preset Calls:**
- Use 1MCP HTTP endpoint with preset parameter
- Validates preset filtering works correctly

**Token Measurement:**
- Before: `/context` without ETL preset
- After: `/context` with ETL preset
- Delta should be ~10K ± 2K

### File Structure (4 files created/updated)
```
expansion-packs/etl/
├── lib/
│   ├── mcp_server.js           # UPDATED - Add 3 tools
│   └── bridge.py               # UPDATED - Add 3 operation handlers
├── tests/
│   ├── tool_schema_validation.js  # NEW
│   └── integration_tests.js       # NEW
└── docs/
    └── API.md                  # NEW - Tool documentation
```

### 1MCP Commands Reference
```bash
# List all MCPs
1mcp mcp list

# Check current presets
1mcp preset list

# Update preset (add ETL)
1mcp preset update aios-dev --add etl-toolkit
1mcp preset update aios-research --add etl-toolkit
1mcp preset update aios-mmos --add etl-toolkit

# Verify preset configuration
1mcp preset show aios-dev

# Test ETL via 1MCP
curl http://127.0.0.1:3050/mcp?preset=aios-dev \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/call", "params": {"name": "collect_web_content", "arguments": {"url": "https://example.com"}}}'
```

### Testing Standards

**Test Framework**: Jest (integration_tests.js), Mocha (schema validation)
**Test Location**: `expansion-packs/etl/tests/`
**Integration Test Requirements**:
- All 4 tools must be callable
- All 3 presets must filter correctly
- Token budget must be within ±2K of expected

**Test Execution**:
```bash
cd expansion-packs/etl

# Schema validation
npm run test:schema

# Integration tests (requires 1MCP running)
1mcp serve --port 3050 &  # Start 1MCP
npm run test:integration

# Token budget validation (manual)
# 1. Start Claude Code
# 2. Run `/context` command
# 3. Verify token count matches expectations
```

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-14 | 0.1 | Story draft created from Epic ETL | Sarah (@po) |

---

## Dev Agent Record

### Agent Model Used
_To be filled by dev agent during implementation_

### Debug Log References
_To be filled by dev agent during implementation_

### Completion Notes
_To be filled by dev agent during implementation_

### File List
_To be filled by dev agent during implementation_

**Expected Files (4 new/updated):**
- expansion-packs/etl/lib/mcp_server.js (UPDATED)
- expansion-packs/etl/lib/bridge.py (UPDATED)
- expansion-packs/etl/tests/tool_schema_validation.js (NEW)
- expansion-packs/etl/tests/integration_tests.js (NEW)
- expansion-packs/etl/docs/API.md (NEW)

**Preset Files (managed by 1MCP, not in repo):**
- ~/.1mcp/presets/aios-dev.yaml (UPDATED)
- ~/.1mcp/presets/aios-research.yaml (UPDATED)
- ~/.1mcp/presets/aios-mmos.yaml (UPDATED)

---

## QA Results

_To be filled by QA agent after implementation_

**Acceptance Criteria Validation**:
- [ ] AC1: MCP Server Expansion (4 tools registered)
- [ ] AC2: Preset Configuration (3 presets updated)
- [ ] AC3: Tool Schemas Validated (all parameters correct)
- [ ] AC4: Integration Testing (all tests pass)
- [ ] AC5: Documentation Updated (API.md complete)

**Integration Test Results**:
- [ ] Direct MCP Calls: ___/4 tools working
- [ ] Preset Calls: ___/3 presets working
- [ ] Error Handling: ___/3 scenarios handled
- [ ] Token Budget: ___/3 presets within limits

**Token Budget Measurements**:
- [ ] aios-dev: ___K tokens (target: ~45K)
- [ ] aios-research: ___K tokens (target: ~60K)
- [ ] aios-mmos: ___K tokens (target: ~55K)

---

**Story ETL.3 Version:** 0.1 (Draft)
**Last Updated:** 2025-01-14
**Previous Story:** ETL.2 (Remaining Collectors)
**Next Story:** ETL.4 (Tests + Docs + CI/CD)
**CRITICAL BLOCKER:** Epic 6.2 Stories 6.2.1 + 6.2.2 must complete first
