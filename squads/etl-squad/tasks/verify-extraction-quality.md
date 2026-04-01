# Task: Verify Extraction Quality

Post-extraction quality verification with source comparison and automated scoring.

```yaml
task:
  id: verify-extraction-quality
  name: "Verify Extraction Quality"
  executor: etl-chief
  elicit: false

  description: |
    Compares the extracted markdown output against the original source file
    to assess fidelity, completeness, and structural preservation.
    Produces a quality score (0-10) and detailed report.
    Triggers automatic re-extraction when score falls below threshold.

  input:
    required:
      - source_path: "Path to the original file"
      - output_path: "Path to the generated .md file"
      - classification: "File classification from classify-file task"
    optional:
      - threshold: "Minimum acceptable score (default: 7.0)"
      - max_retries: "Max re-extraction attempts (default: 2)"
      - report_path: "Where to save quality report (default: {output_dir}/.qa/)"

  execution:
    steps:
      - step: 1
        name: "Load Source & Output"
        action: |
          1. Read original source file using the appropriate parser:
             - Spreadsheet: polars/openpyxl to extract all data
             - Presentation: python-pptx to extract all slides + notes
             - Image: pytesseract raw output (pre-normalization)
             - Data files: parse JSON/YAML/XML structure
             - Text: raw text content
             - Delegated (PDF/video/audio): read source metadata + output
          2. Read generated markdown file (output)
          3. Parse frontmatter from output
          4. Validate both files are readable

      - step: 2
        name: "Fidelity Check"
        action: |
          Compare source content against extracted markdown:

          For text-based sources (text, data, documents):
          - Character-level: calculate Levenshtein similarity ratio
          - Token-level: compare word counts (source vs output)
          - Key phrases: extract top-20 key phrases from source, verify presence in output

          For structured sources (spreadsheets):
          - Row count match: source rows vs markdown table rows
          - Column headers preserved: all column names present
          - Cell values: sample 10% of cells, verify exact match
          - Sheet count: all sheets represented

          For presentations:
          - Slide count match: source slides vs ## headers
          - Title preservation: all slide titles present
          - Speaker notes: all notes captured as blockquotes
          - Content presence: text from each slide found in output

          For images (OCR):
          - OCR confidence score (from pytesseract)
          - Word-level verification: run OCR twice, compare outputs
          - Layout preservation: detect paragraphs/columns in source

          For delegated content (video/audio/PDF):
          - Metadata match: duration/pages from source vs frontmatter
          - Word count plausibility: reasonable for source type/size
          - Structural completeness: TOC depth vs source structure

      - step: 3
        name: "Completeness Check"
        action: |
          Assess what percentage of source content made it to output:

          1. Section coverage:
             - For books/documents: chapters/sections detected vs captured
             - For spreadsheets: sheets/columns present
             - For presentations: slides present
          2. Content volume:
             - Word count ratio: output_words / expected_words
             - Expected words estimated from source size and type
          3. Metadata completeness:
             - All required frontmatter fields populated
             - Optional fields populated where data exists in source
          4. Information loss detection:
             - Tables that were flattened or truncated
             - Images/charts mentioned but not described
             - Footnotes or annotations dropped
             - Headers/footers omitted

      - step: 4
        name: "Structure Preservation Check"
        action: |
          Verify structural integrity of the conversion:

          1. Heading hierarchy:
             - Source heading levels mapped correctly to markdown ##
             - No orphan subheadings (### without parent ##)
             - Heading text matches source titles
          2. Lists & enumerations:
             - Numbered lists preserved in order
             - Bullet points not merged into paragraphs
             - Nested lists maintain depth
          3. Tables:
             - Column alignment preserved
             - Header row present
             - No merged cells creating data loss
             - Separator row (|---|) present
          4. Special content:
             - Code blocks preserved with language hints
             - Blockquotes properly formatted
             - Links and references maintained
             - Mathematical formulas (if any) preserved

      - step: 5
        name: "Calculate Quality Score"
        action: |
          Score each dimension (0-10 scale) using weights from quality-scoring-matrix.yaml:

          | Dimension | Weight | Scoring Criteria |
          |-----------|--------|------------------|
          | Fidelity | 35% | How accurately content matches source |
          | Completeness | 30% | How much source content was captured |
          | Structure | 20% | How well formatting/hierarchy preserved |
          | Metadata | 10% | Frontmatter accuracy and completeness |
          | Readability | 5% | Output is clean, well-formatted markdown |

          Final score = weighted average (0-10)

          Score interpretation:
          - 9.0-10.0: Excellent — near-perfect extraction
          - 7.0-8.9: Good — minor losses acceptable
          - 5.0-6.9: Fair — noticeable gaps, may need manual review
          - 3.0-4.9: Poor — significant information loss
          - 0.0-2.9: Failed — extraction unusable

      - step: 6
        name: "Decision Gate"
        action: |
          Based on final score:

          score >= threshold (default 7.0):
            → PASS: Save quality report, add qa_score to frontmatter
            → Continue pipeline

          score >= 5.0 AND score < threshold:
            → CONDITIONAL: Auto re-extract with adjusted parameters
            → Retry logic:
              1. If retry_count < max_retries:
                 - Adjust extraction parameters (more aggressive parsing)
                 - Re-run conversion pipeline for this file
                 - Re-score the new output
              2. If retry_count >= max_retries:
                 - Mark as NEEDS_HUMAN_REVIEW
                 - Save both versions with quality reports
                 - Flag for human-review-extraction task

          score < 5.0:
            → FAIL: Mark for mandatory human review
            → Do NOT auto-retry (likely structural issue, not tuning)
            → Save quality report with detailed failure analysis
            → Queue for human-review-extraction

      - step: 7
        name: "Generate Quality Report"
        action: |
          Create report using extraction-quality-report-tmpl.md:
          - Source file info (path, type, size)
          - Score breakdown per dimension
          - Specific findings (what was lost/changed)
          - Comparison samples (source snippet vs output snippet)
          - Recommendation (PASS / RETRY / HUMAN_REVIEW)

          Save to: {output_dir}/.qa/{filename}-quality-report.md

      - step: 8
        name: "Update Frontmatter"
        action: |
          Add quality metadata to output .md frontmatter:
          ```yaml
          qa_score: 8.5
          qa_status: PASS  # PASS | CONDITIONAL | NEEDS_REVIEW | FAIL
          qa_date: "2026-03-07"
          qa_dimensions:
            fidelity: 9.0
            completeness: 8.0
            structure: 8.5
            metadata: 9.0
            readability: 8.0
          qa_report: ".qa/filename-quality-report.md"
          ```

  re_extraction_params:
    description: "Adjusted parameters for retry attempts"
    adjustments:
      spreadsheet:
        - "Increase row limit from 100 to 500"
        - "Include hidden sheets"
        - "Preserve cell formatting notes"
      presentation:
        - "Extract alt-text from images"
        - "Include slide transitions as notes"
        - "Capture grouped shapes text"
      image_ocr:
        - "Apply image preprocessing (contrast +50%, sharpen)"
        - "Try multiple OCR engines if available"
        - "Use --psm 6 (uniform block) instead of default"
      text:
        - "Preserve all whitespace-significant formatting"
        - "Detect and preserve ASCII art/diagrams"
      data:
        - "Expand nested objects to full depth"
        - "Preserve comments in YAML/JSON"

  veto_conditions:
    - "Source file no longer exists → WARN, score based on metadata only"
    - "Output file empty → FAIL immediately, no scoring needed"
    - "Source is encrypted → SKIP quality check (cannot compare)"
    - "Score 0.0 → flag as potential conversion bug, not just poor quality"

  output:
    format: |
      {
        "status": "PASS|CONDITIONAL|NEEDS_REVIEW|FAIL",
        "score": 8.5,
        "dimensions": {
          "fidelity": 9.0,
          "completeness": 8.0,
          "structure": 8.5,
          "metadata": 9.0,
          "readability": 8.0
        },
        "retry_count": 0,
        "report_path": ".qa/filename-quality-report.md",
        "findings": [
          "Table in sheet 'Dados' truncated from 150 to 50 rows",
          "2 images in source not described in output"
        ],
        "recommendation": "PASS"
      }

  completion_criteria:
    - "Source and output files successfully loaded and compared"
    - "All 5 quality dimensions scored"
    - "Quality report generated and saved"
    - "Frontmatter updated with qa_ fields"
    - "Decision gate executed (PASS/RETRY/HUMAN_REVIEW)"
```
