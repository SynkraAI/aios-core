# Story ETL.2: Remaining Collectors (P1) - Web, Email, Books

**Epic:** Epic ETL - ETL Expansion Pack
**Status:** Draft
**Priority:** P1 (High)
**Estimated Effort:** 6 hours
**Sprint:** Week 2 (Q1 2026)
**Dependencies:** Story ETL.1 (Foundation must be complete)

---

## Story

**As an** AIOS agent (@analyst, @docs, @architect),
**I want** to collect data from web pages, email archives, and books/PDFs,
**so that** I can access 100% of data sources (web research, historical decisions, expert knowledge) for comprehensive analysis and context building.

---

## Acceptance Criteria

1. **WebCollector Implementation**
   - Fetches web page content via HTTP/HTTPS
   - Converts HTML to clean markdown using html2text
   - Removes scripts, styles, navigation (content only)
   - Handles common edge cases (404, timeouts, redirects)
   - Returns structured output (markdown, metadata, url, timestamp)

2. **EmailSampler Implementation**
   - Supports mailbox/mbox format parsing
   - Implements smart query sampling (keyword-driven)
   - Extracts email metadata (from, to, subject, date)
   - Context-aware sampling (thread detection)
   - Returns sample set with relevance scores

3. **BookProcessor Implementation**
   - Supports PDF and EPUB formats
   - Extracts text with PyPDF2/ebooklib
   - Implements token-based chunking (8K tokens per chunk)
   - Preserves chapter/section structure
   - Returns chunks with metadata (page numbers, chapter titles)

4. **Data Transformers**
   - Markdown cleaning (remove excessive whitespace)
   - Token counting (tiktoken for accurate estimates)
   - Quality validation (minimum content length, encoding check)
   - Metadata enrichment (source type, collection timestamp)

5. **Unit Tests Coverage**
   - 85%+ code coverage for all 3 collectors
   - Edge case testing (malformed HTML, corrupted PDFs, empty emails)
   - Performance benchmarks (10 pages, 100 emails, 300-page book)
   - Mock external dependencies (network calls)

6. **Quality Validation Functions**
   - Content length validation (minimum thresholds)
   - Encoding validation (UTF-8 compliance)
   - Metadata completeness check
   - Output schema validation

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type**: API (Data collection services)
**Secondary Type(s)**: Integration (External libraries), Architecture (Collector pattern)
**Complexity**: Medium (standard library usage, well-defined patterns)

### Specialized Agent Assignment
**Primary Agents**:
- @dev (Dex): Implementation and pre-commit review
- @qa (Quinn): Unit test coverage validation

**Supporting Agents**:
- @architect (Aria): Collector pattern consistency review
- @docs (Ajax): API documentation for collectors

### Quality Gate Tasks
- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Run before creating pull request

### CodeRabbit Focus Areas
**Primary Focus**:
- Error handling (network failures, file I/O errors, parsing exceptions)
- Input validation (URL schemes, file paths, email formats)
- Resource cleanup (file handles, network connections)
- Performance (streaming for large files, memory efficiency)

**Secondary Focus**:
- Test coverage (85%+ requirement)
- Documentation completeness (docstrings, type hints)
- Code consistency (follows BaseCollector pattern)

---

## Tasks / Subtasks

### Task 1: WebCollector Implementation (2h)
- [ ] Create `lib/collectors/web_collector.py` (AC: 1)
  - [ ] Inherit from BaseCollector
  - [ ] Implement `collect(url: str, timeout: int = 30)` method
  - [ ] HTTP request with user-agent header
  - [ ] BeautifulSoup HTML parsing
  - [ ] html2text markdown conversion
  - [ ] Remove scripts/styles (`<script>`, `<style>`, `<nav>`, `<footer>`)
  - [ ] Extract metadata (title, description, og:tags)
  - [ ] Error handling (404, timeout, SSL, encoding)
- [ ] Add `beautifulsoup4`, `html2text`, `requests` to requirements.txt (AC: 1)
- [ ] Test: Collect 5 test URLs (Wikipedia, documentation, blog) (AC: 1, 5)

### Task 2: EmailSampler Implementation (2h)
- [ ] Create `lib/collectors/email_sampler.py` (AC: 2)
  - [ ] Inherit from BaseCollector
  - [ ] Implement `collect(archive_path: str, query: str, max_samples: int = 100)` method
  - [ ] mailbox parsing (support .mbox format)
  - [ ] Keyword search implementation (subject + body)
  - [ ] Thread detection logic (In-Reply-To, References headers)
  - [ ] Relevance scoring (keyword density, thread position)
  - [ ] Metadata extraction (from, to, cc, subject, date)
  - [ ] Sample selection (top N by relevance)
- [ ] Add `email` (stdlib) dependencies docs (AC: 2)
- [ ] Test: Sample 100 emails from 10K+ archive (AC: 2, 5)

### Task 3: BookProcessor Implementation (2h)
- [ ] Create `lib/collectors/book_processor.py` (AC: 3)
  - [ ] Inherit from BaseCollector
  - [ ] Implement `collect(book_path: str, chunk_size: int = 8000)` method
  - [ ] PDF parsing with PyPDF2
  - [ ] EPUB parsing with ebooklib
  - [ ] Text extraction and cleaning
  - [ ] Token-based chunking with tiktoken
  - [ ] Chapter/section boundary detection
  - [ ] Metadata preservation (page numbers, chapter titles, TOC)
  - [ ] Overlap handling (100-token overlap between chunks)
- [ ] Add `PyPDF2`, `ebooklib`, `tiktoken` to requirements.txt (AC: 3)
- [ ] Test: Process 300-page PDF and 20-chapter EPUB (AC: 3, 5)

### Task 4: Data Transformers (30min)
- [ ] Create `lib/transformers/` directory (AC: 4)
- [ ] Create `lib/transformers/markdown_cleaner.py` (AC: 4)
  - [ ] Remove excessive whitespace (>2 newlines)
  - [ ] Normalize heading levels
  - [ ] Clean code blocks formatting
- [ ] Create `lib/transformers/token_counter.py` (AC: 4)
  - [ ] tiktoken integration (cl100k_base encoding)
  - [ ] Accurate token counting function
- [ ] Create `lib/transformers/quality_validator.py` (AC: 6)
  - [ ] Content length validation (min 100 chars)
  - [ ] UTF-8 encoding validation
  - [ ] Metadata completeness check
  - [ ] Output schema validation

### Task 5: Unit Tests (1.5h)
- [ ] Create `tests/test_web_collector.py` (AC: 5)
  - [ ] Test successful collection (mock requests)
  - [ ] Test 404 handling
  - [ ] Test timeout handling
  - [ ] Test malformed HTML
  - [ ] Test encoding issues (UTF-8, ISO-8859-1)
- [ ] Create `tests/test_email_sampler.py` (AC: 5)
  - [ ] Test mailbox parsing
  - [ ] Test keyword search
  - [ ] Test thread detection
  - [ ] Test empty archive handling
  - [ ] Test relevance scoring
- [ ] Create `tests/test_book_processor.py` (AC: 5)
  - [ ] Test PDF processing
  - [ ] Test EPUB processing
  - [ ] Test chunking logic
  - [ ] Test corrupted file handling
  - [ ] Test token counting accuracy
- [ ] Run coverage report: `pytest --cov=lib/collectors --cov-report=html` (AC: 5)
- [ ] Verify 85%+ coverage (AC: 5)

---

## Dev Notes

### Epic Context
This is **Story 2 of 5** in the ETL Expansion Pack epic. This story completes the data collection layer by adding 3 more collectors to the VideoTranscriber from Story 1.

**Success = All 4 data source types (video, web, email, books) can be collected.**

### Architecture Pattern
All collectors follow the **BaseCollector** abstract class pattern established in Story ETL.1:

```python
class BaseCollector(ABC):
    @abstractmethod
    def collect(self, *args, **kwargs) -> Dict:
        """
        Collect data from source.
        Returns: {
            'content': str | List[str],
            'metadata': Dict,
            'quality_score': float,
            'cost_usd': float (if applicable)
        }
        """
        pass
```

### Technology Choices (from Roundtable)
**Web Scraping:**
- **BeautifulSoup4** (95% HTML coverage, 3M+ downloads/month)
- **html2text** (clean markdown conversion, 500K+ downloads/month)
- **requests** (industry standard, robust)

**Email Processing:**
- **mailbox** (stdlib, no external dependency)
- **Smart Sampling** (80% value with 10% processing time)

**Book Processing:**
- **PyPDF2** (PDF support, 1M+ downloads/month)
- **ebooklib** (EPUB support, 100K+ downloads/month)
- **tiktoken** (OpenAI tokenizer, accurate for GPT-4)

### Integration Points
- **Story ETL.1**: Uses BaseCollector pattern and bridge.py
- **Story ETL.3**: These collectors will be exposed via MCP tools
- **Story ETL.4**: Unit tests here become part of full test suite

### Data Flow Example (WebCollector)
```
URL → HTTP Request → HTML → BeautifulSoup → Clean Content
                                                    ↓
                                          html2text (Markdown)
                                                    ↓
                                          Markdown Cleaner
                                                    ↓
                                          Quality Validator
                                                    ↓
                                    Structured JSON Response
```

### File Structure (10 files created)
```
expansion-packs/etl/
├── lib/
│   ├── collectors/
│   │   ├── web_collector.py        # NEW
│   │   ├── email_sampler.py        # NEW
│   │   └── book_processor.py       # NEW
│   └── transformers/               # NEW
│       ├── __init__.py
│       ├── markdown_cleaner.py
│       ├── token_counter.py
│       └── quality_validator.py
└── tests/
    ├── test_web_collector.py       # NEW
    ├── test_email_sampler.py       # NEW
    └── test_book_processor.py      # NEW
```

### Environment Variables
```bash
# .env additions (optional)
ETL_WEB_TIMEOUT=30          # Default 30 seconds
ETL_EMAIL_MAX_SAMPLES=100   # Default 100 emails
ETL_BOOK_CHUNK_SIZE=8000    # Default 8K tokens
```

### Testing Standards

**Test Framework**: pytest with pytest-cov
**Test Location**: `expansion-packs/etl/tests/`
**Coverage Target**: 85%+ for all collectors

**Mock Strategy**:
- **WebCollector**: Mock `requests.get()` with test HTML
- **EmailSampler**: Use test .mbox file (included in fixtures)
- **BookProcessor**: Use test PDF/EPUB files (included in fixtures)

**Performance Benchmarks**:
- WebCollector: <3 seconds per page (10 pages = <30s)
- EmailSampler: <5 seconds for 10K archive (100 samples)
- BookProcessor: <10 seconds for 300-page PDF

**Test Execution**:
```bash
cd expansion-packs/etl
pip install -r requirements.txt
pytest tests/ --cov=lib/collectors --cov-report=html
open htmlcov/index.html  # View coverage report
```

### Code Quality Standards
- **Type Hints**: All functions must have type hints
- **Docstrings**: Google-style docstrings for all public methods
- **Error Messages**: Descriptive errors with context
- **Logging**: Use `logging` module (not `print`)

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

**Expected Files (10):**
- expansion-packs/etl/lib/collectors/web_collector.py
- expansion-packs/etl/lib/collectors/email_sampler.py
- expansion-packs/etl/lib/collectors/book_processor.py
- expansion-packs/etl/lib/transformers/__init__.py
- expansion-packs/etl/lib/transformers/markdown_cleaner.py
- expansion-packs/etl/lib/transformers/token_counter.py
- expansion-packs/etl/lib/transformers/quality_validator.py
- expansion-packs/etl/tests/test_web_collector.py
- expansion-packs/etl/tests/test_email_sampler.py
- expansion-packs/etl/tests/test_book_processor.py

**Test Fixtures**:
- expansion-packs/etl/tests/fixtures/test-page.html
- expansion-packs/etl/tests/fixtures/test-archive.mbox
- expansion-packs/etl/tests/fixtures/test-book.pdf
- expansion-packs/etl/tests/fixtures/test-book.epub

---

## QA Results

_To be filled by QA agent after implementation_

**Acceptance Criteria Validation**:
- [ ] AC1: WebCollector Implementation
- [ ] AC2: EmailSampler Implementation
- [ ] AC3: BookProcessor Implementation
- [ ] AC4: Data Transformers
- [ ] AC5: Unit Tests Coverage (85%+)
- [ ] AC6: Quality Validation Functions

**Coverage Report**:
- [ ] WebCollector: ___% coverage
- [ ] EmailSampler: ___% coverage
- [ ] BookProcessor: ___% coverage
- [ ] Transformers: ___% coverage
- [ ] **Overall: ___% coverage (target: 85%+)**

---

**Story ETL.2 Version:** 0.1 (Draft)
**Last Updated:** 2025-01-14
**Previous Story:** ETL.1 (Foundation)
**Next Story:** ETL.3 (MCP Expansion + Presets)
