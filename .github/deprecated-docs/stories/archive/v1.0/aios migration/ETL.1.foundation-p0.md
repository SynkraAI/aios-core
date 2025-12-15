# Story ETL.1: Foundation (P0) - MCP Server + Python Bridge + Video Transcription

**Epic:** Epic ETL - ETL Expansion Pack
**Status:** Draft
**Priority:** P0 (Critical - Foundation)
**Estimated Effort:** 11 hours
**Sprint:** Week 2 (Q1 2026)
**Dependencies:** Epic 6.2 Stories 6.2.1 + 6.2.2 (for P0.4)

---

## Story

**As a** MMOS workflow orchestrator,
**I want** to transcribe video content via AssemblyAI through 1MCP,
**so that** I can process 60% of subject knowledge locked in video formats and achieve 95%+ mind mapping fidelity.

---

## Acceptance Criteria

1. **MCP Server Operational**
   - MCP server implements stdio transport correctly
   - Server registers `transcribe_video` tool successfully
   - Server handles tool calls and returns structured JSON responses
   - Error handling gracefully catches and reports failures

2. **Python Bridge Functional**
   - Node.js can spawn Python processes successfully
   - JSON serialization/deserialization works bidirectionally
   - Python bridge routes to correct collector (VideoTranscriber)
   - Timeout handling prevents hanging processes

3. **AssemblyAI Integration Working**
   - VideoTranscriber connects to AssemblyAI API successfully
   - Transcription accuracy ≥85% confidence
   - Speaker labels correctly identified (when enabled)
   - Timestamps aligned with video content

4. **1MCP Integration Proven** ⚠️ DEPENDS ON Epic 6.2.1
   - ETL registered in 1MCP following documented pattern
   - ETL callable via 1MCP HTTP endpoint
   - Preset filtering works (ETL only loads when preset includes it)
   - Token budget ≤10K for `aios-mmos` preset

5. **Cost Tracking Accurate**
   - Cost calculation accurate to ±5%
   - Duration tracking matches actual video length
   - API usage properly logged
   - Cost metrics returned in response

6. **Proof-of-Concept Complete**
   - End-to-end: Video URL → Transcript → Analysis works
   - MMOS can call ETL and receive transcript
   - Smoke tests pass (5/5)
   - Documentation updated with PoC example

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type**: Integration (MCP protocol + External API)
**Secondary Type(s)**: API (Python bridge), Deployment (1MCP registration)
**Complexity**: High (new expansion pack, multi-language integration)

### Specialized Agent Assignment
**Primary Agents**:
- @dev (Dex): Implementation and pre-commit review
- @architect (Aria): MCP protocol design validation

**Supporting Agents**:
- @devops (Gage): 1MCP registration and deployment
- @qa (Quinn): Smoke tests and integration validation

### Quality Gate Tasks
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Run before creating pull request
- [ ] Pre-Deployment (@devops): Validate 1MCP registration

### CodeRabbit Focus Areas
**Primary Focus**:
- MCP protocol compliance (stdio transport, tool registration)
- Error handling in Python bridge (process spawning, timeouts)
- API security (AssemblyAI key management, no hardcoded secrets)
- JSON schema validation (requests/responses)

**Secondary Focus**:
- Cost calculation accuracy (mathematical correctness)
- 1MCP preset configuration (follows Epic 6.2.2 documented structure)
- Documentation completeness (API usage examples)

---

## Tasks / Subtasks

### P0.1: MCP Server Skeleton (2h)
- [ ] Create `expansion-packs/etl/` directory structure (AC: 1)
- [ ] Initialize `package.json` with MCP SDK dependency (AC: 1)
- [ ] Implement `lib/mcp_server.js` with stdio transport (AC: 1)
  - [ ] Import MCP SDK (Server, StdioServerTransport)
  - [ ] Set up server with stdio transport
  - [ ] Register `transcribe_video` tool stub
  - [ ] Implement basic error handling
- [ ] Test: Server starts and responds to list_tools (AC: 1)

### P0.2: Python Bridge Implementation (3h)
- [ ] Create `lib/bridge.py` CLI interface (AC: 2)
  - [ ] Argument parsing (operation, params as JSON)
  - [ ] JSON input deserialization
  - [ ] Collector routing logic
  - [ ] JSON output serialization
  - [ ] Error handling and exit codes
- [ ] Create `lib/collectors/base_collector.py` abstract class (AC: 2)
- [ ] Initialize `requirements.txt` with Python dependencies (AC: 2)
- [ ] Test: bridge.py can be called from command line (AC: 2)

### P0.3: Node ↔ Python Integration (2h)
- [ ] Implement `callPythonETL()` function in mcp_server.js (AC: 2)
  - [ ] Process spawning with correct arguments
  - [ ] stdout/stderr stream handling
  - [ ] Timeout management (configurable)
  - [ ] JSON parsing of Python output
  - [ ] Error propagation to MCP client
- [ ] Create `.env.example` for API keys (AC: 5)
- [ ] Test: End-to-end Node → Python → Node (AC: 1, 2)

### P0.4: 1MCP Registration (1h) ⚠️ DEPENDS ON Epic 6.2.1
- [ ] Read Epic 6.2.1 documentation (docs/architecture/mcp-optimization-1mcp.md) (AC: 4)
- [ ] Register ETL in 1MCP following documented pattern (AC: 4)
  - [ ] Command: `1mcp mcp add etl-toolkit -- node expansion-packs/etl/lib/mcp_server.js`
- [ ] Update `aios-mmos` preset to include ETL (AC: 4)
  - [ ] Command: `1mcp preset update aios-mmos --add etl-toolkit`
- [ ] Verify ETL appears in 1MCP tools list (AC: 4)
- [ ] Test: Call ETL via 1MCP HTTP endpoint (AC: 4)

### P0.5: AssemblyAI Integration (2h)
- [ ] Create `lib/collectors/video_transcriber.py` (AC: 3)
  - [ ] Inherit from BaseCollector
  - [ ] Initialize AssemblyAI client with API key
  - [ ] Implement `collect()` method
  - [ ] Configure transcription (language, speaker labels)
  - [ ] Parse transcript response
  - [ ] Calculate cost ($0.67/hour formula)
  - [ ] Return structured output (transcript, confidence, speakers, timestamps, cost)
- [ ] Add `assemblyai==0.25.0` to requirements.txt (AC: 3)
- [ ] Test: Transcribe 1-minute test video (AC: 3, 5)

### P0.6: Smoke Tests (1h)
- [ ] Create `tests/smoke_tests.js` (AC: 6)
  - [ ] Test 1: MCP server starts successfully
  - [ ] Test 2: transcribe_video tool registered
  - [ ] Test 3: Python bridge responds to ping
  - [ ] Test 4: AssemblyAI transcribes test video
  - [ ] Test 5: Cost calculation within ±5%
- [ ] Run all smoke tests and verify 5/5 pass (AC: 6)
- [ ] Document PoC example in README.md (AC: 6)
- [ ] Verify MMOS can call ETL (manual test) (AC: 6)

---

## Dev Notes

### Epic Context
This is **Story 1 of 5** in the ETL Expansion Pack epic. This story establishes the foundation for all subsequent stories. The goal is to prove that:
1. MCP protocol works for ETL
2. Node.js ↔ Python bridge is viable
3. 1MCP integration pattern is correct
4. AssemblyAI delivers required accuracy

**Success = MMOS can transcribe 1 video end-to-end.**

### Architecture Overview
```
MMOS Agent → 1MCP (aios-mmos preset) → ETL MCP Server (Node.js)
                                            ↓
                                  Python Bridge (bridge.py)
                                            ↓
                                  VideoTranscriber (AssemblyAI)
                                            ↓
                                  Structured JSON Response
```

### Key Technical Decisions (from Roundtable)
- **Language Split**: Node.js for MCP protocol (SDK availability), Python for collectors (library ecosystem)
- **Transport**: stdio (required by MCP SDK)
- **Bridge Pattern**: CLI-based JSON I/O (simple, debuggable)
- **API Choice**: AssemblyAI (95% accuracy, $0.67/h, 1.5x realtime)

### Integration Points
- **1MCP Registration**: Follow Epic 6.2.1 documentation EXACTLY
- **Preset Configuration**: Follow Epic 6.2.2 preset structure
- **MMOS Workflows**: ETL will be called from MMOS pipeline (story 2-3)

### Dependencies ⚠️
**CRITICAL:** P0.4 (1MCP Registration) CANNOT start until Epic 6.2 Stories 6.2.1 + 6.2.2 complete.

**Workaround for Early Start:**
- Use `.claude/CLAUDE.md` section "## 🚀 1MCP - MCP Context Optimization" temporarily
- Refactor to official docs when Epic 6.2.1 completes

### File Structure (15 files created)
```
expansion-packs/etl/
├── package.json
├── requirements.txt
├── .env.example
├── .gitignore
├── lib/
│   ├── mcp_server.js          # MCP protocol implementation
│   ├── bridge.py               # Python CLI bridge
│   └── collectors/
│       ├── base_collector.py   # Abstract collector class
│       └── video_transcriber.py # AssemblyAI integration
└── tests/
    └── smoke_tests.js          # 5 smoke tests
```

### Environment Variables Required
```bash
# .env file (DO NOT COMMIT)
ASSEMBLYAI_API_KEY=your_key_here  # Get from https://www.assemblyai.com/
ETL_TIMEOUT_MS=120000              # 2 minutes default
ETL_DEBUG=false                    # Enable verbose logging
```

### Testing Standards

**Test Framework**: Jest (Node.js), pytest (Python - Story 4)
**Test Location**: `expansion-packs/etl/tests/`
**Coverage Target**: Story 1 smoke tests only (5 tests), 85%+ coverage in Story 4

**Smoke Test Requirements (P0.6)**:
- Must run without external dependencies except AssemblyAI
- Use 30-second test video (public URL)
- Cost calculation test: verify ≤$0.01 (30s × $0.67/3600s)
- All tests must pass before story completion

**Test Execution**:
```bash
cd expansion-packs/etl
npm install
npm test  # Runs smoke_tests.js
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

**Expected Files (15):**
- expansion-packs/etl/package.json
- expansion-packs/etl/requirements.txt
- expansion-packs/etl/.env.example
- expansion-packs/etl/.gitignore
- expansion-packs/etl/README.md (updated)
- expansion-packs/etl/lib/mcp_server.js
- expansion-packs/etl/lib/bridge.py
- expansion-packs/etl/lib/collectors/__init__.py
- expansion-packs/etl/lib/collectors/base_collector.py
- expansion-packs/etl/lib/collectors/video_transcriber.py
- expansion-packs/etl/tests/smoke_tests.js
- expansion-packs/etl/tests/__init__.py
- expansion-packs/etl/tests/fixtures/test-video-url.txt
- expansion-packs/etl/docs/POC-EXAMPLE.md
- expansion-packs/etl/.python-version (optional)

---

## QA Results

_To be filled by QA agent after implementation_

**Acceptance Criteria Validation**:
- [ ] AC1: MCP Server Operational
- [ ] AC2: Python Bridge Functional
- [ ] AC3: AssemblyAI Integration Working
- [ ] AC4: 1MCP Integration Proven
- [ ] AC5: Cost Tracking Accurate
- [ ] AC6: Proof-of-Concept Complete

**Smoke Test Results**:
- [ ] Test 1/5: MCP server starts
- [ ] Test 2/5: transcribe_video tool registered
- [ ] Test 3/5: Python bridge responds
- [ ] Test 4/5: AssemblyAI transcribes test video
- [ ] Test 5/5: Cost calculation accurate

---

**Story ETL.1 Version:** 0.1 (Draft)
**Last Updated:** 2025-01-14
**Next Story:** ETL.2 (Remaining Collectors)
