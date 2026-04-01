# Quality Gate Checklist — ETL Squad

## Per-Output Validation (run by @validator)

### Frontmatter (20%)
- [ ] `source_type` present and valid
- [ ] `title` present (extracted or inferred)
- [ ] `extracted_at` present in ISO 8601
- [ ] `language` detected
- [ ] `word_count` calculated
- [ ] `pipeline` and `job_id` present

### Encoding (15%)
- [ ] UTF-8 valid throughout
- [ ] No BOM (Byte Order Mark)
- [ ] No U+FFFD replacement characters
- [ ] No null bytes
- [ ] No mojibake patterns

### Noise (20%)
- [ ] No HTML tags in body (except ETL_METADATA comment)
- [ ] No navigation/menu content
- [ ] No footer/sidebar content
- [ ] No ad content or cookie banners
- [ ] No "subscribe"/"share" boilerplate
- [ ] `noise_ratio` < 0.3

### Coherence (20%)
- [ ] Content reads as coherent text
- [ ] No garbled/truncated sections
- [ ] Paragraphs are complete (not cut mid-sentence)
- [ ] Tables have headers and consistent column count

### Length (10%)
- [ ] `word_count` >= `min_content_length` (100)
- [ ] Content not suspiciously short for source type
- [ ] Not accidentally concatenated (>100k words → investigate)

### Chunks (15%)
- [ ] Each chunk has id, text, token_count, position
- [ ] No empty chunks
- [ ] No overlapping positions
- [ ] Chunks respect section boundaries
- [ ] Chunk sizes within configured range

## Scoring

| Score | Verdict | Action |
|-------|---------|--------|
| >= 0.6 | PASS | Deliver to @loader |
| 0.4-0.59 | WARN | Deliver with issues[] flagged |
| < 0.4 | FAIL | Return to appropriate agent |
