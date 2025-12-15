# Story 1.10 Enhancement: Agent Lightning Integration

**Story ID:** STORY-1.10-ENHANCEMENT
**Epic:** Epic-1 - Hybrid-Ops
**Wave:** Wave 2 (Optimization)
**Status:** 📋 Ready to Start
**Priority:** 🟡 Medium
**Owner:** Dev (Dex) + Architect (Aria)
**Created:** 2025-01-17
**Duration:** 3-4 weeks
**Investment:** $3,400-$5,100
**Story Points:** 34-51 SP
**Dependencies:** Story 1.13 (Integration Testing E2E), Story 6.1.12 (Fork/Join), Story 6.1.13 (Organizer-Worker) - RECOMMENDED

---

## 📖 Story

**As a** AIOS performance engineer,
**I want** to integrate Agent Lightning for RL-based optimization of agent execution,
**so that** we can continuously improve workflow performance through reinforcement learning and reduce execution costs by 15-25% over time.

---

## 📋 Objective

Integrate Microsoft Agent Lightning framework as an optional optimization layer for AIOS workflows. This enables trace collection, RL-based optimization, and continuous performance improvement through reinforcement learning. Integration is opt-in only to maintain backward compatibility and avoid infrastructure requirements for all users.

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
- **Primary Type:** Performance (RL optimization, continuous improvement)
- **Secondary Type(s):** Integration (external framework, infrastructure setup)
- **Complexity:** High (external dependencies, opt-in architecture, RL integration)

### Specialized Agent Assignment

**Primary Agents:**
- **@dev (Dex):** Agent Lightning integration, trace collection implementation
- **@architect (Aria):** Architecture design, opt-in pattern validation

**Supporting Agents:**
- **@qa (Quinn):** Integration testing, performance validation
- **@devops (Gage):** Infrastructure setup, deployment configuration

### Quality Gate Tasks

- [ ] **Pre-Commit (@dev):** After LightningStore client implementation
  - Client connects to LightningStore server
  - Trace collection works (basic traces)
  - Unit tests for client pass
  
- [ ] **Mid-Point Review (@architect + @qa):** After trace integration
  - Traces collected during workflow execution
  - Trace data quality validated
  - Integration tests pass
  
- [ ] **Pre-PR (@dev + @qa):** Before marking story complete
  - RL optimization integrated (Trainer)
  - Performance improvements validated (15-25% cost reduction)
  - Opt-in configuration works correctly
  - Documentation complete (setup guide, troubleshooting)

### CodeRabbit Focus Areas

**Primary Focus:**
- **Opt-in Architecture:** Agent Lightning must be optional
  - Workflows work without Agent Lightning (backward compatible)
  - Configuration clearly indicates opt-in nature
  - No breaking changes if LightningStore unavailable
  
- **Trace Collection:** Accurate and non-intrusive
  - Traces collected during execution (async, non-blocking)
  - Trace data quality high (no missing data, accurate timestamps)
  - Performance overhead minimal (<5% execution time)

**Secondary Focus:**
- **RL Optimization:** Effective performance improvement
  - Trainer integrates correctly with LightningStore
  - Optimization improves execution over time (15-25% cost reduction)
  - Fine-tuning and prompt tuning work correctly

---

## 🎯 Scope

### Core Deliverables

1. **LightningStore Client** (`.aios-core/integrations/agent-lightning/lightning-store-client.js`)
   - Connect to LightningStore server (external or in_memory)
   - Send traces to LightningStore
   - Query rollout status and results
   - Handle connection errors gracefully

2. **Trace Collector** (`.aios-core/integrations/agent-lightning/trace-collector.js`)
   - Collect traces during workflow execution
   - Format traces for LightningStore
   - Async, non-blocking trace collection
   - Sampling support (reduce overhead)

3. **LitAgent Runner Wrapper** (`.aios-core/integrations/agent-lightning/lit-agent-runner.js`)
   - Wrap agent execution with LitAgentRunner
   - Integrate with AgentOpsTracer
   - Handle rollout tasks from LightningStore
   - Support continuous execution mode

4. **Optimizer** (`.aios-core/integrations/agent-lightning/optimizer.js`)
   - Integrate with Trainer (VERL or APO algorithm)
   - Train on collected traces
   - Apply optimizations (prompt tuning, fine-tuning)
   - Monitor optimization results

5. **Configuration** (`.aios-core/core-config.yaml`)
   - Add `agentLightning` section (opt-in)
   - Configure LightningStore address
   - Enable/disable optimization
   - Set training intervals

6. **Workflow Execution Engine Integration**
   - Optional trace collection during execution
   - Integrate trace-collector with workflow-execution-engine
   - Support opt-in tracing (only if configured)

7. **Documentation**
   - `docs/framework/agent-lightning-setup-guide.md` (new)
   - Setup instructions (LightningStore server, client configuration)
   - Troubleshooting guide
   - Performance optimization guide

8. **Development Mode Support**
   - In-memory LightningStore for development
   - No external dependencies for development
   - Easy setup for testing

---

## 📊 Tasks Breakdown

### Phase 1: LightningStore Client (Week 1, Days 1-5)

**Day 1-2: Basic Client Implementation**
- [ ] **Task 1.1:** Create lightning-store-client.js
  - [ ] 1.1.1: Implement connection to LightningStore server
  - [ ] 1.1.2: Implement `enqueue_rollout()` method
  - [ ] 1.1.3: Implement `dequeue_rollout()` method
  - [ ] 1.1.4: Implement `add_span()` method
  - [ ] 1.1.5: Handle connection errors gracefully
  - [ ] 1.1.6: Unit tests for client

**Day 3: In-Memory Store Support**
- [ ] **Task 1.2:** Implement in-memory LightningStore for development
  - [ ] 1.2.1: Create InMemoryLightningStore class
  - [ ] 1.2.2: Implement all LightningStore methods (in-memory)
  - [ ] 1.2.3: Use for development/testing (no external server needed)
  - [ ] 1.2.4: Unit tests for in-memory store

**Day 4-5: Configuration Integration**
- [ ] **Task 1.3:** Add Agent Lightning configuration
  - [ ] 1.3.1: Add `agentLightning` section to core-config.yaml
  - [ ] 1.3.2: Support `enabled: false` (default, opt-in)
  - [ ] 1.3.3: Support `store.type: external` or `in_memory`
  - [ ] 1.3.4: Support `store.address` for external server
  - [ ] 1.3.5: Configuration validation

### Phase 2: Trace Collection (Week 2, Days 6-10)

**Day 6-7: Trace Collector Implementation**
- [ ] **Task 2.1:** Create trace-collector.js
  - [ ] 2.1.1: Collect traces during workflow execution
  - [ ] 2.1.2: Format traces for LightningStore (Span format)
  - [ ] 2.1.3: Async, non-blocking trace collection
  - [ ] 2.1.4: Sampling support (reduce overhead)
  - [ ] 2.1.5: Unit tests for trace collection

**Day 8: Workflow Execution Engine Integration**
- [ ] **Task 2.2:** Integrate trace collection with workflow-execution-engine
  - [ ] 2.2.1: Add optional trace collection to executeWithForkJoin()
  - [ ] 2.2.2: Collect traces for each task execution
  - [ ] 2.2.3: Collect traces for Fork/Join operations
  - [ ] 2.2.4: Only collect if Agent Lightning enabled (opt-in)
  - [ ] 2.2.5: Integration tests with trace collection

**Day 9-10: Trace Quality Validation**
- [ ] **Task 2.3:** Validate trace data quality
  - [ ] 2.3.1: Ensure all traces have required fields
  - [ ] 2.3.2: Validate timestamps are accurate
  - [ ] 2.3.3: Check for missing or corrupted traces
  - [ ] 2.3.4: Performance overhead measurement (<5% target)
  - [ ] 2.3.5: Integration tests for trace quality

### Phase 3: LitAgent Runner Integration (Week 3, Days 11-13)

**Day 11-12: LitAgent Runner Wrapper**
- [ ] **Task 3.1:** Create lit-agent-runner.js wrapper
  - [ ] 3.1.1: Wrap agent execution with LitAgentRunner
  - [ ] 3.1.2: Integrate with AgentOpsTracer
  - [ ] 3.1.3: Handle rollout tasks from LightningStore
  - [ ] 3.1.4: Support continuous execution mode
  - [ ] 3.1.5: Unit tests for runner wrapper

**Day 13: Runner Integration Testing**
- [ ] **Task 3.2:** Integration testing
  - [ ] 3.2.1: Test runner with workflow execution
  - [ ] 3.2.2: Test rollout task handling
  - [ ] 3.2.3: Test continuous execution mode
  - [ ] 3.2.4: End-to-end integration test

### Phase 4: RL Optimization (Week 4, Days 14-17)

**Day 14-15: Optimizer Implementation**
- [ ] **Task 4.1:** Create optimizer.js
  - [ ] 4.1.1: Integrate with Trainer (VERL or APO algorithm)
  - [ ] 4.1.2: Train on collected traces
  - [ ] 4.1.3: Apply optimizations (prompt tuning)
  - [ ] 4.1.4: Monitor optimization results
  - [ ] 4.1.5: Unit tests for optimizer

**Day 16: Optimization Integration**
- [ ] **Task 4.2:** Integrate optimization with workflow execution
  - [ ] 4.2.1: Apply optimized prompts during execution
  - [ ] 4.2.2: Measure performance improvements
  - [ ] 4.2.3: Validate 15-25% cost reduction target
  - [ ] 4.2.4: Integration tests for optimization

**Day 17: Performance Validation**
- [ ] **Task 4.3:** Performance validation
  - [ ] 4.3.1: Execute workflows with optimization enabled
  - [ ] 4.3.2: Compare performance vs baseline (Story 1.13)
  - [ ] 4.3.3: Validate cost reduction (15-25% target)
  - [ ] 4.3.4: Document performance improvements

### Phase 5: Documentation and Setup Guide (Week 4, Days 18-20)

**Day 18-19: Setup Documentation**
- [ ] **Task 5.1:** Create setup guide
  - [ ] 5.1.1: Create `docs/framework/agent-lightning-setup-guide.md`
  - [ ] 5.1.2: LightningStore server setup instructions
  - [ ] 5.1.3: Client configuration guide
  - [ ] 5.1.4: Development mode setup (in-memory)
  - [ ] 5.1.5: Troubleshooting guide

**Day 20: Final Documentation**
- [ ] **Task 5.2:** Final documentation
  - [ ] 5.2.1: Update `docs/framework/source-tree.md`
  - [ ] 5.2.2: Update `docs/framework/coding-standards.md`
  - [ ] 5.2.3: Create performance optimization guide
  - [ ] 5.2.4: Review all documentation

---

## ✅ Acceptance Criteria

- [ ] **AC1:** Agent Lightning is opt-in only (default: disabled)
- [ ] **AC2:** Workflows work without Agent Lightning (100% backward compatible)
- [ ] **AC3:** Trace collection works (async, non-blocking, <5% overhead)
- [ ] **AC4:** LightningStore client connects correctly (external or in_memory)
- [ ] **AC5:** RL optimization integrated (Trainer with VERL or APO)
- [ ] **AC6:** Performance improvements validated (15-25% cost reduction)
- [ ] **AC7:** Development mode works (in-memory store, no external dependencies)
- [ ] **AC8:** Configuration clearly indicates opt-in nature
- [ ] **AC9:** Setup documentation complete (server setup, client config, troubleshooting)
- [ ] **AC10:** All integration tests pass

---

## 📝 Dev Notes

### Architecture Reference

**Source:** `.ai/aios-architect-asyncthink-impact-analysis.md` (Architect Analysis)

**Key Architectural Decisions:**
1. **Opt-in Only:** Agent Lightning must be optional (not required)
2. **Backward Compatibility:** Workflows work without Agent Lightning
3. **Development Mode:** In-memory store for development (no external dependencies)
4. **Performance Overhead:** Trace collection must be <5% execution time

### Implementation Details

**Configuration Format:**
```yaml
agentLightning:  # Optional - opt-in only
  enabled: false  # Default: false
  store:
    type: external  # or in_memory (for development)
    address: http://localhost:4747
  optimization:
    enabled: false  # Default: false
    algorithm: VERL  # or APO
    training_interval: weekly  # or daily, monthly
```

**Integration with Workflow Execution Engine:**
```javascript
class WorkflowExecutionEngine {
  constructor(options = {}) {
    this.useAgentLightning = options.useAgentLightning || false;
    if (this.useAgentLightning) {
      this.lightningClient = new LightningStoreClient(options.lightningConfig);
      this.traceCollector = new TraceCollector(this.lightningClient);
    }
  }
  
  async executeWithForkJoin(workflow) {
    if (this.useAgentLightning) {
      // Collect traces during execution
      return await this.traceCollector.collect(() => {
        return this._executeBranches(workflow.branches);
      });
    } else {
      // Normal execution without tracing
      return await this._executeBranches(workflow.branches);
    }
  }
}
```

### Dependencies

**Required:**
- Story 1.13 (Integration Testing E2E) - Provides performance baseline
- Story 6.1.12 (Fork/Join) - RECOMMENDED (enables parallel trace collection)
- Story 6.1.13 (Organizer-Worker) - RECOMMENDED (enables multi-agent optimization)

**External Dependencies:**
- Agent Lightning SDK (npm package or Python package)
- LightningStore Server (external or in_memory for development)
- Python 3.9+ (if using Python version of LightningStore)

### Testing Standards

**Test File Location:** `tests/integration/agent-lightning.test.js`

**Test Coverage Requirements:**
- Unit tests: 80%+ coverage for all Agent Lightning modules
- Integration tests: Trace collection, optimization, end-to-end
- Performance tests: Overhead measurement, optimization validation

**Testing Frameworks:**
- Jest for unit tests
- Custom integration test framework for Agent Lightning
- Performance benchmarking framework

---

## 📊 Performance Targets

**Baseline:** Workflow execution without Agent Lightning (from Story 1.13)

**Targets:**
- **Trace Collection Overhead:** <5% execution time
- **Cost Reduction:** 15-25% over time (with RL optimization)
- **Latency Reduction:** 10-15% (with optimized prompts)

**Measurement:**
- Execute workflows with/without Agent Lightning
- Compare execution time and cost
- Document performance improvements over time

---

## ⚠️ Restrictions and Considerations

### Opt-in Architecture
- **CRITICAL:** Agent Lightning must be opt-in only
- Default configuration: `enabled: false`
- Workflows must work without Agent Lightning
- No breaking changes if LightningStore unavailable

### Infrastructure Requirements
- External LightningStore server required for production
- In-memory store available for development
- Python 3.9+ required if using Python version
- Node.js 18+ required for client

### Documentation Requirements
- Complete setup guide (server setup, client config)
- Troubleshooting guide (common issues, solutions)
- Performance optimization guide
- Development mode guide (in-memory setup)

---

## 🔄 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-17 | 1.0 | Story created based on Architect analysis | Pax (PO) |

---

## 📎 Related Documents

- `.ai/aios-architect-asyncthink-impact-analysis.md` - Architect analysis and recommendations
- `.ai/aios-asyncthink-strategic-deep-analysis.md` - PO strategic analysis
- `docs/framework/source-tree.md` - Framework structure (needs update)
- Microsoft Agent Lightning Documentation - External reference

---

**Status:** 📋 Ready to Start  
**Next Action:** Wait for Story 1.13 completion, then assign to Dev (Dex) and Architect (Aria)

