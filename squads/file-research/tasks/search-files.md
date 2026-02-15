# Task: Search Files

**ID:** search-files
**Agent:** file-hunter
**Category:** Research
**Complexity:** High
**Duration:** 10-30 minutes

## Description

Execute the complete 6-phase file research pipeline to discover, validate, and catalog files on the internet.

## When to Use

- User wants to find specific files (PDFs, EPUBs, DOCs, etc.)
- Research requires file discovery across multiple sources
- Need organized catalog of file sources with metadata

## Inputs

**Required:**
- `query` - User search query (what files to find)

**Optional:**
- `--filetype` - Specific file format (pdf, epub, doc, etc.)
- `--year` - Year constraint for recency (2024, 2025, etc.)
- `--domain` - Domain/topic focus (academic, technical, business, etc.)

## Outputs

**Directory:** `docs/file-research/{YYYY-MM-DD}-{slug}/`

**Files:**
1. `README.md` - Index with TL;DR and best sources
2. `00-query-original.md` - Original query and context
3. `01-search-strategy.md` - Sub-queries and operators
4. `02-research-report.md` - Complete findings
5. `03-file-catalog.md` - Organized file links with metadata
6. `04-recommendations.md` - Best sources and next steps

## Workflow Steps

### Phase 1: Auto-Clarify (MAIN MODEL - Inline)

**Objective:** Understand query intent and detect file types.

**Actions:**
1. Parse user query
2. Detect file types (PDF, EPUB, DOC, etc.)
3. Detect patterns (research, books, documentation)
4. Detect temporal scope (recent, historical)
5. Detect domain (technical, academic, business)

**Decision:**
- IF file type OR pattern detected → skip clarification
- ELSE → ask: "What file type are you looking for?"

**Output:**
```json
{
  "file_types": ["pdf", "epub"],
  "focus": "academic|books|documentation",
  "temporal": "recent|historical",
  "domain": ["technical", "scientific"],
  "skip_clarification": true|false
}
```

### Phase 2: Decompose (MAIN MODEL)

**Objective:** Generate 5-7 file-focused sub-queries with operators.

**Actions:**
1. Use extended thinking (ultrathink) for deep analysis
2. Ask: What specific files would best answer this?
3. Ask: What sources are most credible for this domain?
4. Generate sub-queries with:
   - File type operators (`filetype:pdf`, `filetype:epub`)
   - Site restrictions (`site:arxiv.org`, `site:github.com`)
   - Different aspects (overview, detailed, examples)
   - Authoritative sources
   - Recent/updated sources

**Example Sub-queries:**
```
Original: "machine learning research papers"

Sub-queries:
1. "machine learning survey paper filetype:pdf site:arxiv.org"
2. "deep learning research 2024 filetype:pdf"
3. "neural networks tutorial PDF recent"
4. "machine learning textbook PDF free"
5. "ML research papers site:paperswithcode.com"
6. "reinforcement learning papers arXiv 2024"
7. "machine learning cheat sheet PDF"
```

**Output:**
```json
{
  "main_topic": "machine learning research papers",
  "file_types": ["pdf"],
  "sub_queries": [
    "query1 filetype:pdf",
    "query2 site:arxiv.org",
    ...
  ],
  "search_strategy": "parallel"
}
```

### Phase 3: Parallel Search (HAIKU Workers via Task Tool)

**Objective:** Execute sub-queries in parallel using Haiku workers.

**Actions:**

1. **Pre-check MCP availability:**
   ```javascript
   // Try Apify
   try {
     apify_available = test_apify_connection()
   } catch {
     apify_available = false
   }

   // Try Exa
   try {
     exa_available = test_exa_connection()
   } catch {
     exa_available = false
   }
   ```

2. **Dispatch workers (max 5 in parallel):**
   - Create Task call for EACH sub-query
   - Use `general-purpose` agent with `model: haiku`
   - Dispatch ALL in SINGLE message

3. **Worker prompt template:**
   ```
   You are a file research worker. Find files for ONE specific query.

   QUERY: {sub_query}
   CONTEXT: {inferred_context_json}
   MCP AVAILABILITY: apify={true/false}, exa={true/false}

   INSTRUCTIONS:
   1. Search using best tool:
      - If apify available → use file scrapers
      - Else if exa available → use enhanced search
      - Else → use WebSearch

   2. Filter for actual FILE LINKS (not pages about files)

   3. Extract metadata for top 2-3 files:
      - File URL (direct download preferred)
      - File size (if available)
      - File format (PDF, EPUB, etc.)
      - Source credibility (HIGH/MEDIUM/LOW)
      - Page title and snippet

   4. Return ONLY JSON (no other text):
      {
        "sub_query": "...",
        "files": [
          {
            "url": "...",
            "title": "...",
            "format": "PDF|EPUB|...",
            "size": "... MB",
            "source": "arxiv.org|...",
            "credibility": "HIGH|MEDIUM|LOW",
            "snippet": "...",
            "tool_used": "Apify|Exa|WebSearch"
          }
        ],
        "metadata_notes": "..."
      }
   ```

4. **Aggregate results:**
   - Collect all worker responses
   - Parse JSON from each Task result
   - Deduplicate files by URL
   - Build unified catalog with tool attribution

5. **Handle failures:**
   - Log warnings for failed workers
   - Execute failed queries directly in main context
   - Require at least 1 successful result to proceed

**Output:**
```json
{
  "files_found": [
    {
      "url": "...",
      "title": "...",
      "format": "PDF",
      "size": "5.2 MB",
      "source": "arxiv.org",
      "credibility": "HIGH",
      "snippet": "...",
      "tool_used": "Exa"
    }
  ],
  "tools_used": {
    "apify": 2,
    "exa": 3,
    "websearch": 0
  },
  "worker_stats": {
    "dispatched": 5,
    "succeeded": 5,
    "failed": 0
  }
}
```

### Phase 4: Evaluate Coverage (HAIKU via Task Tool)

**Objective:** Decide if research is complete or needs another wave.

**Actions:**

Wrap in `Task(model: "haiku")`:

1. **Calculate metrics:**
   ```javascript
   coverage_score = (files_found / expected_files) * 100

   source_quality = {
     high: count(credibility === "HIGH"),
     medium: count(credibility === "MEDIUM"),
     low: count(credibility === "LOW")
   }

   format_diversity = unique(file_formats).length
   ```

2. **Apply stopping rules:**

   **HARD STOPS (always stop):**
   - `wave >= 2` → "Max iterations reached"
   - `coverage_score >= 80 AND high_credibility >= 5` → "Sufficient coverage"

   **SOFT STOP:**
   - `coverage_score >= 60 AND wave >= 1` → "Acceptable coverage"

   **MUST CONTINUE:**
   - `coverage_score < 50 AND wave == 1` → "Insufficient first wave"

3. **If CONTINUE:**
   - Identify gaps (missing file types, low-quality sources)
   - Generate 2-3 targeted gap-filling queries
   - Return to Phase 3 with new queries

4. **If STOP:**
   - Document final coverage score
   - List remaining gaps
   - Proceed to Phase 5

**Output:**
```json
{
  "decision": "CONTINUE|STOP",
  "coverage_score": 75,
  "stop_reason": "Acceptable coverage with 8 high-credibility sources",
  "gaps": [
    "Missing EPUB format sources",
    "Limited recent 2024 papers"
  ],
  "next_queries": [] // empty if STOP
}
```

### Phase 5: Synthesize (MAIN MODEL)

**Objective:** Consolidate findings into organized catalog.

**Actions:**

1. **Review all files found**

2. **Organize by multiple dimensions:**
   - File format (PDF, EPUB, DOC, etc.)
   - Domain/topic
   - Source credibility (HIGH → MEDIUM → LOW)
   - Recency (newest first if temporal=recent)

3. **Rank sources:**
   - PRIMARY: HIGH credibility + direct download link
   - SECONDARY: MEDIUM credibility + accessible
   - TERTIARY: LOW credibility (with warnings)

4. **Generate sections:**
   - **Executive Summary:** Total files, best sources, formats found
   - **Catalog by Format:** Tables organized by file type
   - **Catalog by Topic:** Grouped by sub-topic
   - **Source Credibility Notes:** Explanation of ratings
   - **Download Instructions:** How to access each source type
   - **Recommendations:** Best files to start with

5. **Include metadata tables:**
   ```markdown
   | Title | Format | Size | Source | Credibility | Link |
   |-------|--------|------|--------|-------------|------|
   | Paper X | PDF | 2.3 MB | arxiv.org | HIGH | [Download](url) |
   ```

**Output:** Complete synthesized catalog content (markdown)

### Phase 6: Document (MAIN MODEL)

**Objective:** Save all research to `docs/file-research/`

**Actions:**

1. **Create output directory:**
   ```
   docs/file-research/{YYYY-MM-DD}-{slug}/
   ```

   Where `slug` = sanitized version of main topic (lowercase, hyphens)

2. **Write files:**

   **README.md:**
   ```markdown
   # {Main Topic} - File Research

   **Date:** {YYYY-MM-DD}
   **Files Found:** {total_count}
   **Best Source:** {top_source}

   ## TL;DR
   {Executive summary}

   ## Quick Links
   - [Complete Catalog](03-file-catalog.md)
   - [Recommendations](04-recommendations.md)

   ## Files by Format
   - PDF: {count} files
   - EPUB: {count} files
   ...
   ```

   **00-query-original.md:**
   ```markdown
   # Original Query

   **User Query:** "{original_query}"

   ## Inferred Context
   - File Types: {file_types}
   - Focus: {focus}
   - Temporal: {temporal}
   - Domain: {domain}
   ```

   **01-search-strategy.md:**
   ```markdown
   # Search Strategy

   ## Sub-Queries Generated
   1. query1 filetype:pdf
   2. query2 site:arxiv.org
   ...

   ## Search Operators Used
   - filetype: {count} times
   - site: {count} times
   ...
   ```

   **02-research-report.md:**
   ```markdown
   # Research Report

   ## Search Summary
   - Waves executed: {wave_count}
   - Workers dispatched: {worker_count}
   - Tools used: {tools_used}

   ## Coverage Analysis
   - Coverage score: {score}/100
   - Files found: {count}
   - High credibility: {count}
   ...

   ## Detailed Findings
   {Complete findings from all workers}
   ```

   **03-file-catalog.md:**
   ```markdown
   # File Catalog

   ## Files by Format

   ### PDF Files ({count})
   | Title | Size | Source | Credibility | Link |
   ...

   ### EPUB Files ({count})
   ...

   ## Files by Topic
   {Organized by sub-topic}
   ```

   **04-recommendations.md:**
   ```markdown
   # Recommendations

   ## Best Files to Start With
   1. {file1} - {reason}
   2. {file2} - {reason}
   ...

   ## Download Instructions
   {How to access each source type}

   ## Next Steps
   {Suggested actions}
   ```

3. **Validate output:**
   - All files created successfully
   - No security issues (sanitized filenames, validated URLs)
   - All markdown is valid
   - Links are accessible

**Output:** Success message with path to research directory

## Error Handling

### No Results Found
```
STOP + Report:
"No files found matching your criteria. Try:
1. Broader search terms
2. Different file formats
3. Removing year constraints"
```

### Failed Workers
```
Log warning:
"Worker {N} failed for query: {query}"
"Executing query directly in main context..."
```

### MCP Unavailable
```
Fallback to WebSearch automatically
Log: "MCP {name} unavailable, using WebSearch fallback"
```

### Suspicious Sources
```
Flag as LOW credibility
Add warning:
"⚠️ This source may be suspicious. Verify before downloading."
```

## Validation Checklist

- [ ] At least 5 files found (or explain why fewer)
- [ ] At least 2 HIGH credibility sources
- [ ] File metadata extracted (format, size, source)
- [ ] All URLs validated
- [ ] Output directory created in docs/file-research/
- [ ] All 5 output files generated
- [ ] Markdown syntax is valid
- [ ] No security issues (sanitized paths, validated URLs)
- [ ] Credibility ratings are honest
- [ ] Download links are direct when possible

## Example Execution

```bash
# User command
*search-files "React hooks best practices PDF 2024"

# Phase 1: Auto-Clarify
Detected: file_types=[pdf], temporal=recent, domain=[technical]

# Phase 2: Decompose
Generated 6 sub-queries with filetype:pdf operators

# Phase 3: Parallel Search
Dispatched 6 Haiku workers
Tools: Exa (4), WebSearch (2)
Files found: 12

# Phase 4: Evaluate Coverage
Coverage: 80%, HIGH credibility: 7
Decision: STOP (sufficient coverage)

# Phase 5: Synthesize
Organized 12 PDFs by topic and credibility

# Phase 6: Document
Saved to: docs/file-research/2026-02-14-react-hooks-best-practices/

✅ Research complete!
```

## Dependencies

**Tasks:** None (self-contained)

**Tools:**
- WebSearch (required)
- WebFetch (required)
- Task tool (required for Haiku workers)
- Apify MCP (optional, preferred)
- Exa MCP (optional, fallback)

**Data:**
- file-search-operators.md (for reference)

## Version

**v1.0.0** - Initial implementation (2026-02-14)

---

**Created by:** aios-master
**Status:** ⚠️ Pending validation
