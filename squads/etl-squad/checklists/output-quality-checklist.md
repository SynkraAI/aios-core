# Output Quality Checklist

Quality validation for ETL Universal Converter outputs.

## Frontmatter Validation

- [ ] `title` is present and non-empty
- [ ] `source_type` is one of: video, audio, book, document, spreadsheet, presentation, image, data, text
- [ ] `source_format` matches original file extension
- [ ] `source_path` is a valid absolute path
- [ ] `date_processed` is a valid ISO date (YYYY-MM-DD)
- [ ] `word_count` is a positive integer

## Content Validation

- [ ] Content body is non-empty
- [ ] Encoding is UTF-8
- [ ] No raw HTML outside code blocks
- [ ] Headers are properly nested (no # to ### jumps)
- [ ] No null bytes or control characters
- [ ] Single `#` title at top of document

## Format-Specific Checks

### Spreadsheet
- [ ] Tables use proper markdown pipe syntax
- [ ] Column alignment consistent
- [ ] Row limit respected (max 100 full, 50 + summary if more)
- [ ] All Excel sheets represented as sections

### Presentation
- [ ] Each slide is a separate section
- [ ] Speaker notes included as blockquotes
- [ ] Image presence noted (even if not extractable)

### Image (OCR)
- [ ] OCR confidence recorded in frontmatter
- [ ] Confidence > 30% (below = should have been skipped)
- [ ] OCR artifacts cleaned

### Data Files (JSON/YAML/XML)
- [ ] Arrays rendered as tables
- [ ] Nested structures rendered as headers
- [ ] Original structure preserved semantically

### Text/Markdown
- [ ] Existing content not modified (for .md files)
- [ ] Frontmatter added or merged (not duplicated)
- [ ] Encoding converted to UTF-8

## Batch-Specific Checks

- [ ] All files accounted for (converted + skipped + failed = total)
- [ ] Skip reasons documented
- [ ] No partial/corrupt outputs saved
- [ ] Summary report accurate
