# Story ETL.5: Batch Processing + Smart Caching (P2) - Performance Optimization

**Epic:** Epic ETL - ETL Expansion Pack
**Status:** Draft
**Priority:** P2 (Optional - Performance Enhancement)
**Estimated Effort:** 7 hours
**Sprint:** Week 3 (Q1 2026)
**Dependencies:** Story ETL.4 (Tests + Docs + CI/CD) must be complete

---

## Story

**As a** MMOS workflow orchestrator processing 50+ sources,
**I want** batch processing and intelligent caching,
**so that** I can reduce API costs by 40-60% and process large datasets 5-10x faster without sacrificing data quality.

---

## Acceptance Criteria

1. **Batch Processing Implementation**
   - Batch processor handles 50+ sources in single operation
   - Parallel processing with configurable concurrency (default: 3)
   - Progress tracking (percentage complete, ETA)
   - Error handling (continue on error, report failures)
   - Results aggregation (successes, failures, costs)
   - Performance: 5-10x faster than sequential processing

2. **Smart Caching System**
   - Cache layer for AssemblyAI transcripts (most expensive)
   - Cache layer for web content (reduce network calls)
   - TTL-based expiration (default: 7 days)
   - Cache hit rate monitoring (target: 40-60%)
   - Cache invalidation support (manual + automatic)
   - Storage: File-based (no external dependencies)

3. **Cost Reduction Validation**
   - Cache hit rate ≥40% in realistic scenarios
   - Cost reduction ≥40% for typical workflows
   - Performance benchmarks documented
   - No quality degradation (cached = fresh)

4. **Monitoring & Observability**
   - Batch progress logging (JSON structured logs)
   - Cache hit/miss metrics
   - Cost tracking per batch
   - Performance metrics (latency, throughput)
   - Export metrics to JSON for analysis

5. **Configuration Options**
   - Batch size configurable (default: 10)
   - Concurrency configurable (default: 3)
   - Cache TTL configurable (default: 7 days)
   - Cache directory configurable
   - Enable/disable caching per tool

6. **Backward Compatibility**
   - Single-source operations still work (no breaking changes)
   - Batch operations are optional (opt-in)
   - Caching can be disabled globally (opt-out)
   - All existing tests still pass

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type**: Architecture (Performance optimization patterns)
**Secondary Type(s)**: API (Batch operations), Integration (Caching layer)
**Complexity**: High (concurrency, caching correctness)

### Specialized Agent Assignment
**Primary Agents**:
- @dev (Dex): Batch processor and caching implementation
- @architect (Aria): Performance optimization patterns review

**Supporting Agents**:
- @qa (Quinn): Performance benchmarking and validation
- @docs (Ajax): Performance optimization documentation

### Quality Gate Tasks
- [ ] Pre-Commit (@dev): All tests pass, no performance regressions
- [ ] Pre-PR (@architect): Caching correctness reviewed, concurrency safety verified
- [ ] Pre-Deployment (@qa): Performance benchmarks validated (5-10x improvement)

### CodeRabbit Focus Areas
**Primary Focus**:
- Concurrency safety (race conditions, deadlocks)
- Caching correctness (stale data, cache invalidation)
- Error handling (partial failures, retries)
- Performance (no N+1 queries, efficient aggregation)

**Secondary Focus**:
- Configuration validation (sane defaults, bounds checking)
- Monitoring completeness (all metrics captured)
- Backward compatibility (existing code unaffected)

---

## Tasks / Subtasks

### Task 1: Batch Processor Implementation (4h)
- [ ] Create `lib/batch_processor.js` (AC: 1)
  - [ ] Implement `processBatch(sources: Array, options: Object)` function
    - [ ] Input validation (array of sources, options schema)
    - [ ] Parallel processing with concurrency limit (p-limit library)
    - [ ] Progress tracking (event emitter for updates)
    - [ ] Error handling (continue on error, collect failures)
    - [ ] Results aggregation (successes, failures, total cost)
  - [ ] Configuration options
    - [ ] `batchSize`: Max items per batch (default: 10)
    - [ ] `concurrency`: Parallel operations (default: 3)
    - [ ] `continueOnError`: Keep going on failures (default: true)
    - [ ] `timeout`: Per-operation timeout (default: 60s)
- [ ] Create batch tool wrappers (AC: 1)
  - [ ] `batch_transcribe_videos(video_urls: Array)`
  - [ ] `batch_collect_web(urls: Array)`
  - [ ] `batch_sample_emails(archives: Array)`
  - [ ] `batch_process_books(book_paths: Array)`
- [ ] Test batch processing (AC: 1)
  - [ ] Test 50+ sources (measure speedup)
  - [ ] Test error handling (some sources fail)
  - [ ] Test progress tracking (event callbacks)
  - [ ] Verify 5-10x speedup vs sequential

### Task 2: Smart Caching Implementation (3h)
- [ ] Create `lib/cache/cache_manager.js` (AC: 2)
  - [ ] Implement `CacheManager` class
    - [ ] `get(key: string): Promise<any | null>`
    - [ ] `set(key: string, value: any, ttl: number): Promise<void>`
    - [ ] `invalidate(key: string): Promise<void>`
    - [ ] `clear(): Promise<void>`
    - [ ] `getStats(): Object` (hits, misses, size)
  - [ ] File-based storage
    - [ ] Cache directory: `~/.aios/etl-cache/` (configurable)
    - [ ] File naming: `${tool}_${hash(input)}.json`
    - [ ] Metadata: `{data, timestamp, ttl}`
  - [ ] TTL-based expiration
    - [ ] Check timestamp on `get()`
    - [ ] Auto-delete expired entries
    - [ ] Background cleanup task (optional)
- [ ] Create cache key generators (AC: 2)
  - [ ] Video: `hash(url + language + speaker_labels)`
  - [ ] Web: `hash(url + timeout)`
  - [ ] Email: `hash(archive_path + query + max_samples)`
  - [ ] Book: `hash(book_path + chunk_size)`
- [ ] Integrate caching into collectors (AC: 2)
  - [ ] Wrap `VideoTranscriber.collect()` with cache
  - [ ] Wrap `WebCollector.collect()` with cache
  - [ ] Wrap `EmailSampler.collect()` with cache
  - [ ] Wrap `BookProcessor.collect()` with cache
- [ ] Test caching (AC: 2)
  - [ ] Test cache hit (same input = cached result)
  - [ ] Test cache miss (new input = fresh call)
  - [ ] Test TTL expiration (old entry ignored)
  - [ ] Test cache invalidation (manual clear)
  - [ ] Measure hit rate (target: ≥40%)

### Task 3: Cost Reduction Validation (1h)
- [ ] Create cost tracking tests (AC: 3)
  - [ ] Scenario 1: Process 100 videos (no cache)
    - [ ] Measure total cost
  - [ ] Scenario 2: Process 100 videos (50% duplicates)
    - [ ] First run: 100 fresh calls
    - [ ] Second run: 50 cache hits, 50 fresh calls
    - [ ] Measure cost reduction (expect ≥40%)
  - [ ] Scenario 3: MMOS workflow (realistic)
    - [ ] Subject with 20 videos, 30 articles
    - [ ] Multiple mind mapping iterations (re-run)
    - [ ] Measure cache hit rate (expect ≥40%)
    - [ ] Measure cost reduction (expect ≥40%)
- [ ] Validate quality (AC: 3)
  - [ ] Compare cached vs fresh results (should be identical)
  - [ ] Verify no data corruption
  - [ ] Verify metadata preserved
- [ ] Document cost savings (AC: 3)
  - [ ] Update ARCHITECTURE.md with caching strategy
  - [ ] Add cost reduction case study to docs/

### Task 4: Monitoring & Observability (1h)
- [ ] Create monitoring infrastructure (AC: 4)
  - [ ] JSON structured logging (`lib/logger.js`)
    - [ ] Log level: INFO, WARN, ERROR
    - [ ] Context: operation, timestamp, duration, cost
  - [ ] Metrics collection (`lib/metrics.js`)
    - [ ] Batch progress events (percentage, ETA)
    - [ ] Cache hit/miss counters
    - [ ] Cost accumulation per batch
    - [ ] Latency histograms (p50, p95, p99)
  - [ ] Metrics export (`lib/metrics_exporter.js`)
    - [ ] Export to JSON file
    - [ ] Export to stdout (for CLI monitoring)
- [ ] Integrate monitoring into collectors (AC: 4)
  - [ ] Log all API calls (tool, input, duration, cost)
  - [ ] Log cache hits/misses
  - [ ] Log batch progress
  - [ ] Emit metrics events
- [ ] Test monitoring (AC: 4)
  - [ ] Run batch operation, verify logs generated
  - [ ] Export metrics, verify JSON structure
  - [ ] Verify all metrics present (hit rate, cost, latency)

### Task 5: Configuration & Backward Compatibility (30min)
- [ ] Create configuration schema (AC: 5)
  - [ ] `config/etl.config.yaml` (example)
    ```yaml
    batch:
      default_size: 10
      default_concurrency: 3
      timeout_ms: 60000
    cache:
      enabled: true
      ttl_days: 7
      directory: ~/.aios/etl-cache
      per_tool:
        transcribe_video: true   # Expensive, cache it
        collect_web_content: true # Network calls, cache it
        sample_email_archive: false # Fast, no need
        process_book: false        # Fast, no need
    ```
  - [ ] Load config in mcp_server.js
  - [ ] Validate config schema
- [ ] Ensure backward compatibility (AC: 6)
  - [ ] Single-source calls still work (no batch required)
  - [ ] Caching is transparent (works with/without)
  - [ ] All Story 1-4 tests still pass
  - [ ] No breaking changes to API

### Task 6: Performance Documentation (30min)
- [ ] Update ARCHITECTURE.md (AC: 3)
  - [ ] Add "Performance Optimization" section
  - [ ] Document batch processing strategy
  - [ ] Document caching strategy
  - [ ] Add performance benchmarks table
- [ ] Create PERFORMANCE.md (new doc)
  - [ ] Batch processing examples
  - [ ] Caching best practices
  - [ ] Cost optimization tips
  - [ ] Performance tuning guide
- [ ] Update README.md (AC: 4)
  - [ ] Add "Performance" section
  - [ ] Link to PERFORMANCE.md
  - [ ] Show cache hit rate example

---

## Dev Notes

### Epic Context
This is **Story 5 of 5** in the ETL Expansion Pack epic. This story is **OPTIONAL for v1.0** (P2 priority) but provides significant value for production usage at scale.

**Success = 40-60% cost reduction + 5-10x performance improvement for batch workloads.**

### P2 Priority Rationale
**Why P2 (Optional)?**
- v1.0 is functional without optimization (P0-P1 sufficient)
- Optimization provides high ROI but not blocking
- Can be delivered post-v1.0 if timeline slips

**When to Include:**
- If Week 3 has capacity (40h dev time available)
- If cost savings are critical for launch (MMOS use case)
- If benchmarks show 10x+ improvement potential

**When to Defer:**
- If Week 3 is tight (prioritize v1.0 release)
- If cost savings aren't urgent (<$100/month savings)
- If complexity risk is high (concurrency bugs)

### Batch Processing Strategy
**Concurrency Pattern:**
```javascript
const pLimit = require('p-limit');
const limit = pLimit(3);  // Max 3 parallel operations

const promises = sources.map(source =>
  limit(() => processSource(source))
);

const results = await Promise.allSettled(promises);
```

**Why 3 concurrent operations?**
- AssemblyAI API: Max 3 concurrent transcriptions (free tier)
- Network: 3 parallel requests reasonable for most connections
- CPU: Minimal impact (I/O bound operations)

### Caching Strategy
**What to Cache:**
- ✅ Video transcripts (expensive: $0.67/hour)
- ✅ Web content (network latency)
- ❌ Email samples (fast: <5s, query-dependent)
- ❌ Book processing (fast: <10s, rarely reused)

**Cache Key Design:**
```
transcribe_video:
  Key: sha256(url + language + speaker_labels)
  TTL: 7 days (transcripts rarely change)

collect_web_content:
  Key: sha256(url)
  TTL: 1 day (web content changes frequently)
```

**Cache Hit Rate Estimation:**
- MMOS workflow: 50-70% (same videos in iterations)
- Agent research: 20-40% (agents often revisit sources)
- **Realistic average: 40-60%**

### Cost Reduction Math
**Example MMOS Workflow:**
- Subject: 20 videos × 60 minutes each = 1,200 minutes
- Cost (no cache): 1,200 min × $0.67/60 = $13.40
- Iterations: 3 (refinement, testing, validation)
- Total (no cache): $13.40 × 3 = $40.20

**With 50% Cache Hit:**
- Iteration 1: $13.40 (no cache)
- Iteration 2: $6.70 (50% cached)
- Iteration 3: $6.70 (50% cached)
- **Total (with cache): $26.80**
- **Savings: $13.40 (33% reduction)**

**With 60% Cache Hit (realistic):**
- **Savings: $16.08 (40% reduction)** ✅

### File Structure (10 files created)
```
expansion-packs/etl/
├── lib/
│   ├── batch_processor.js          # NEW - Batch operations
│   ├── cache/                      # NEW
│   │   ├── cache_manager.js        # Cache implementation
│   │   └── key_generators.js       # Cache key logic
│   ├── logger.js                   # NEW - Structured logging
│   ├── metrics.js                  # NEW - Metrics collection
│   └── metrics_exporter.js         # NEW - JSON export
├── config/
│   └── etl.config.yaml             # NEW - Configuration example
├── tests/
│   ├── test_batch_processor.js     # NEW
│   ├── test_cache_manager.js       # NEW
│   ├── test_cost_reduction.js      # NEW
│   └── test_monitoring.js          # NEW
└── docs/
    └── PERFORMANCE.md              # NEW - Performance guide
```

### Performance Benchmarks (Target)
| Operation | Sequential | Batch (3x) | Speedup |
|-----------|-----------|-----------|---------|
| 50 videos (1min each) | 500s | 170s | 2.9x |
| 100 web pages | 500s | 170s | 2.9x |
| 10 email archives | 100s | 35s | 2.9x |
| 50 books | 500s | 170s | 2.9x |

**With caching (50% hit rate):**
| Operation | First Run | Cached Run | Speedup |
|-----------|-----------|-----------|---------|
| 50 videos (50% cached) | 500s | 85s | 5.9x |
| 100 web pages (60% cached) | 500s | 68s | 7.4x |

### Testing Standards

**Test Framework**: Jest (batch_processor.js), pytest (integration)
**Mocking**: Mock API calls for cost calculation tests
**Fixtures**: Use small test files for performance tests

**Performance Test Execution**:
```bash
# Batch processing (mock API)
npm run test:performance:batch

# Caching (real API, requires key)
export ASSEMBLYAI_API_KEY=real_key
npm run test:performance:cache

# Cost reduction validation
npm run test:cost-reduction
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

**Expected Files (10 new):**
- expansion-packs/etl/lib/batch_processor.js
- expansion-packs/etl/lib/cache/cache_manager.js
- expansion-packs/etl/lib/cache/key_generators.js
- expansion-packs/etl/lib/logger.js
- expansion-packs/etl/lib/metrics.js
- expansion-packs/etl/lib/metrics_exporter.js
- expansion-packs/etl/config/etl.config.yaml
- expansion-packs/etl/tests/test_batch_processor.js
- expansion-packs/etl/tests/test_cache_manager.js
- expansion-packs/etl/tests/test_cost_reduction.js
- expansion-packs/etl/tests/test_monitoring.js
- expansion-packs/etl/docs/PERFORMANCE.md

---

## QA Results

_To be filled by QA agent after implementation_

**Acceptance Criteria Validation**:
- [ ] AC1: Batch Processing Implementation (50+ sources, 5-10x speedup)
- [ ] AC2: Smart Caching System (file-based, TTL, 40-60% hit rate)
- [ ] AC3: Cost Reduction Validation (≥40% reduction)
- [ ] AC4: Monitoring & Observability (JSON logs, metrics export)
- [ ] AC5: Configuration Options (all configurable)
- [ ] AC6: Backward Compatibility (no breaking changes)

**Performance Validation**:
- [ ] Batch Processing Speedup: ___x (target: 5-10x)
- [ ] Cache Hit Rate: ___%  (target: ≥40%)
- [ ] Cost Reduction: ___%  (target: ≥40%)

**Batch Performance (50 sources)**:
- [ ] Sequential: ___s
- [ ] Batch (3x concurrency): ___s
- [ ] Speedup: ___x

**Cache Performance**:
- [ ] First run (no cache): ___s, $___
- [ ] Second run (cached): ___s, $___
- [ ] Savings: ___%

---

**Story ETL.5 Version:** 0.1 (Draft)
**Last Updated:** 2025-01-14
**Previous Story:** ETL.4 (Tests + Docs + CI/CD)
**Next Milestone:** Epic ETL Complete → Release v1.0
