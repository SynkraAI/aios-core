# Extraction Fidelity Checklist

Quality verification checklist for source-to-output comparison.
Used by `verify-extraction-quality` task.

## Fidelity (Source vs Output Match)

- [ ] Text content from source is present in output (character-level comparison)
- [ ] Key phrases (top-20) from source are found in output
- [ ] Numerical data values match source exactly (no rounding errors)
- [ ] Proper nouns and technical terms preserved without modification
- [ ] No hallucinated content (text in output not present in source)
- [ ] Quoted text preserved with attribution

## Completeness (Nothing Lost)

- [ ] All sections/chapters/sheets/slides from source represented in output
- [ ] Word count ratio is plausible for source type (output/expected > 0.8)
- [ ] All required frontmatter fields populated
- [ ] Optional frontmatter fields populated where data exists in source
- [ ] No tables truncated without explicit notice in output
- [ ] Charts/images mentioned or described (even if not embedded)
- [ ] Footnotes/endnotes captured if present in source
- [ ] Headers/footers captured if containing relevant content
- [ ] Appendices or annexes included

## Structure Preservation

- [ ] Heading hierarchy matches source document structure
- [ ] No orphan sub-headings (### without parent ##)
- [ ] Numbered lists preserved in correct order
- [ ] Bullet points not merged into paragraphs
- [ ] Nested lists maintain proper depth
- [ ] Tables have header row, separator, and data rows
- [ ] Table column count matches source
- [ ] No merged cell data loss in tables
- [ ] Code blocks preserved with language hints
- [ ] Blockquotes properly formatted
- [ ] Links and references maintained

## Format-Specific Checks

### Spreadsheets
- [ ] All sheet names present as section headers
- [ ] Column headers match source exactly
- [ ] Sample cell values verified (10% random sample)
- [ ] Row count matches or truncation explicitly noted
- [ ] Numeric precision preserved (decimal places)
- [ ] Date formats consistent

### Presentations
- [ ] Slide count matches source
- [ ] All slide titles present as headers
- [ ] Speaker notes captured as blockquotes
- [ ] Text from all shapes extracted
- [ ] Image presence noted (even if not embedded)
- [ ] Slide order preserved

### Images (OCR)
- [ ] OCR confidence score included in frontmatter
- [ ] Text orientation correctly detected
- [ ] Paragraph breaks preserved
- [ ] Multi-column layout properly linearized
- [ ] No duplicate text from overlapping OCR regions

### Data Files (JSON/YAML/XML)
- [ ] All top-level keys present
- [ ] Array data converted to tables where appropriate
- [ ] Nested objects expanded to proper depth
- [ ] Data types preserved (strings vs numbers vs booleans)
- [ ] Comments preserved where applicable (YAML)

### Delegated Content (PDF/Video/Audio)
- [ ] Page/duration count matches source metadata
- [ ] TOC structure matches source chapters
- [ ] No excessive blank sections from page breaks
- [ ] Metadata (author, date) extracted where available

## Metadata Accuracy

- [ ] title derived from source (not generic)
- [ ] source_type correct for this file
- [ ] source_format matches original extension
- [ ] source_path points to existing file
- [ ] date_processed is today's date
- [ ] word_count matches actual content word count
- [ ] language correctly detected
- [ ] tags are relevant to content (not generic)

## Output Quality

- [ ] No raw HTML tags outside code blocks
- [ ] No conversion artifacts (OCR garbage, parser errors)
- [ ] No null bytes or control characters
- [ ] UTF-8 encoding confirmed
- [ ] Content flows logically (sections in correct order)
- [ ] Single # title at document start
