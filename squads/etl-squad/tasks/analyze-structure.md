# Task: Analyze Structure

Detect content hierarchy, generate TOC, and classify sections by content type.

```yaml
task:
  id: analyze-structure
  name: "Analyze Content Structure"
  executor: etl-chief
  elicit: false

  input:
    required:
      - markdown_path: "Path to converted .md file"
    optional:
      - min_heading_level: "Minimum heading level to analyze (default: 2)"

  execution:
    steps:
      - step: 1
        name: "Parse headings hierarchy"
        action: |
          Read the markdown file and extract all headings (# ## ### etc.).
          Build a tree structure:
          {
            "headings": [
              { "level": 1, "text": "Title", "line": 1, "children": [...] },
              { "level": 2, "text": "Chapter 1", "line": 5, "children": [...] }
            ]
          }

      - step: 2
        name: "Extract sections"
        action: |
          Split content by headings into discrete sections.
          For each section capture:
          - heading_text
          - heading_level
          - start_line / end_line
          - raw_content (text between this heading and next)

      - step: 3
        name: "Calculate section metrics"
        action: |
          For each section compute:
          - word_count: total words
          - percentage: word_count / total_document_words * 100
          - char_count: total characters
          - list_count: number of bullet/numbered lists
          - code_block_count: fenced code blocks
          - table_count: markdown tables
          - link_count: hyperlinks and references
          - keywords: top 10 most frequent non-stopword terms (>3 chars)

      - step: 4
        name: "Classify content types"
        action: |
          Assign one or more content_type labels to each section:

          | Type | Signals |
          |------|---------|
          | framework | Numbered steps, acronyms, "framework", "model", "method", structured lists |
          | narrative | Long paragraphs, personal pronouns (I, we), storytelling markers |
          | data | Tables, numbers, percentages, statistics, charts references |
          | definition | "is defined as", "means", glossary patterns, bold terms |
          | instruction | Imperative verbs, "do this", "never", "always", checklists |
          | opinion | "I believe", "in my experience", subjective language |
          | metadata | TOC, index, bibliography, appendix, acknowledgements |

          Each section gets primary_type (highest confidence) and secondary_types[].

      - step: 5
        name: "Generate TOC"
        action: |
          Build a clean Table of Contents:
          ```
          ## Table of Contents
          1. Chapter Title (3,200 words) [framework]
             1.1. Section A (1,100 words) [instruction]
             1.2. Section B (2,100 words) [narrative]
          2. Chapter Title (5,400 words) [definition]
          ...
          ```
          Include word count and primary content type for each entry.

      - step: 6
        name: "Return analysis"
        action: |
          Return structured analysis:
          {
            "source": "filename.md",
            "total_words": N,
            "total_sections": N,
            "toc": "markdown TOC string",
            "sections": [
              {
                "id": "section-1",
                "heading": "Chapter Title",
                "level": 2,
                "word_count": 3200,
                "percentage": 18.5,
                "keywords": ["offer", "value", "pricing"],
                "primary_type": "framework",
                "secondary_types": ["instruction"],
                "metrics": { "lists": 5, "tables": 2, "code_blocks": 0 }
              }
            ]
          }

  veto_conditions:
    - "File has no headings at all → VETO_NO_STRUCTURE: Content is flat text with no detectable hierarchy. Purpose-driven curation requires structured content."
    - "File has < 100 words → SKIP: Too short for meaningful structural analysis."

  output:
    format: "Structure analysis object (JSON)"
    used_by: ["wf-purpose-driven", "curate-by-purpose"]

  completion_criteria:
    - "All headings detected and hierarchically organized"
    - "Every section has word_count, keywords, and content_type"
    - "TOC generated with counts"
    - "No sections lost or duplicated"
```
