# File Quality Checklist

**ID:** file-quality-checklist
**Squad:** file-research
**Version:** 1.0.0
**Purpose:** Quality validation for file research outputs

## When to Use

- After completing file search pipeline
- Before sharing research catalog with others
- Quality assurance for file-hunter outputs
- Pre-publication validation

## Checklist Categories

### ✅ Search Execution

**Query Processing:**
- [ ] Original query clearly documented
- [ ] File types correctly detected
- [ ] Domain/focus correctly identified
- [ ] Temporal scope correctly inferred
- [ ] Clarification asked when needed (or skipped appropriately)

**Decomposition:**
- [ ] 5-7 sub-queries generated
- [ ] Sub-queries include file type operators (filetype:pdf, etc.)
- [ ] Sub-queries include site restrictions when relevant
- [ ] Sub-queries are orthogonal (no significant overlap)
- [ ] At least one "authoritative source" query included
- [ ] At least one "recent/updated" query included

**Parallel Search:**
- [ ] All workers dispatched successfully
- [ ] At least 80% workers succeeded
- [ ] Failed workers handled with fallback
- [ ] MCP tools used when available
- [ ] WebSearch fallback works correctly
- [ ] Max 2 waves executed

### ✅ Results Quality

**Files Found:**
- [ ] At least 5 files found (or explanation provided)
- [ ] At least 2 HIGH credibility sources
- [ ] File formats match user query
- [ ] Files are relevant to original query
- [ ] No duplicate files in catalog

**Metadata Completeness:**
- [ ] All files have URLs
- [ ] All files have titles
- [ ] File formats identified (PDF, EPUB, etc.)
- [ ] File sizes extracted (when available)
- [ ] Source domains identified
- [ ] Credibility ratings assigned

**Credibility Assessment:**
- [ ] HIGH credibility sources clearly identified
- [ ] MEDIUM credibility sources explained
- [ ] LOW credibility sources flagged with warnings
- [ ] Credibility criteria applied consistently
- [ ] Suspicious sources flagged or excluded

### ✅ Coverage & Completeness

**Coverage Metrics:**
- [ ] Coverage score >= 60% (acceptable minimum)
- [ ] Coverage score >= 80% (ideal target)
- [ ] All sub-queries executed
- [ ] Gaps identified and documented
- [ ] Wave 2 executed only when necessary

**Format Diversity:**
- [ ] Multiple file formats found (when query allows)
- [ ] Dominant format matches user intent
- [ ] Alternative formats offered when available

**Source Diversity:**
- [ ] Multiple source domains
- [ ] Mix of academic, technical, and general sources
- [ ] No over-reliance on single source

### ✅ Documentation Quality

**Output Files:**
- [ ] All 6 files created in output directory
- [ ] README.md includes TL;DR and quick links
- [ ] 00-query-original.md documents context
- [ ] 01-search-strategy.md lists sub-queries and operators
- [ ] 02-research-report.md includes complete findings
- [ ] 03-file-catalog.md organized and formatted
- [ ] 04-recommendations.md provides actionable next steps

**Catalog Organization:**
- [ ] Files organized by format
- [ ] Files organized by credibility
- [ ] Files organized by topic (when applicable)
- [ ] Metadata tables are complete
- [ ] Download links are prominent

**Markdown Quality:**
- [ ] Valid markdown syntax
- [ ] Tables formatted correctly
- [ ] Links work (no broken URLs)
- [ ] Code blocks use proper syntax highlighting
- [ ] Headers follow hierarchy (H1 > H2 > H3)

### ✅ Security & Safety

**URL Validation:**
- [ ] All URLs validated before inclusion
- [ ] No malicious domains included
- [ ] Suspicious sources flagged as LOW credibility
- [ ] Direct download links preferred over redirects

**Path Safety:**
- [ ] Output directory is in docs/file-research/
- [ ] No files written outside allowed paths
- [ ] Filenames sanitized (no special characters)
- [ ] No sensitive information in outputs

**Download Safety:**
- [ ] No automatic file downloads executed
- [ ] Users instructed to download manually
- [ ] File sizes shown (to prevent large downloads)
- [ ] Warnings included for untrusted sources

### ✅ User Experience

**Clarity:**
- [ ] Executive summary is clear and concise
- [ ] Best sources highlighted prominently
- [ ] Download instructions are easy to follow
- [ ] Credibility ratings explained

**Actionability:**
- [ ] Recommendations section includes next steps
- [ ] Best files to start with identified
- [ ] Alternative formats suggested when relevant
- [ ] Validation command provided (for link checking)

**Completeness:**
- [ ] User query fully addressed
- [ ] All requested file types covered
- [ ] Recent files included (when temporal=recent)
- [ ] Domain expertise reflected in sources

## Scoring System

### Overall Quality Score

**Calculation:**
```
Total points = (checked items / total items) * 100
```

**Ratings:**
- **90-100%** - Excellent (production ready)
- **80-89%** - Good (minor improvements needed)
- **70-79%** - Acceptable (needs revision)
- **<70%** - Poor (requires significant work)

### Critical Items (Must Pass)

These items MUST be checked for release:

- [ ] At least 5 files found (or valid explanation)
- [ ] At least 2 HIGH credibility sources
- [ ] All 6 output files created
- [ ] No security issues (malicious URLs, path traversal)
- [ ] Coverage score >= 60%

**If any critical item fails:** DO NOT publish research

## Validation Actions

### Pre-Publish Checklist

Before sharing research catalog:

1. **Run this checklist** - Verify all items
2. **Validate sources** - Run `*validate-sources {output_dir}`
3. **Manual review** - Spot-check top 3 sources
4. **User test** - Ask: "Can I easily find and download files?"

### Quality Improvements

If quality score < 90%:

1. **Identify gaps** - Which sections failed?
2. **Re-run search** - Execute wave 2 if coverage low
3. **Enhance metadata** - Run `*extract-metadata` on files
4. **Improve organization** - Restructure catalog for clarity
5. **Add warnings** - Flag any concerns clearly

### Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Coverage score low (<60%) | Run wave 2 with gap-filling queries |
| No HIGH credibility sources | Expand search to academic domains (arxiv, IEEE) |
| Broken links | Run `*validate-sources` and replace |
| Missing metadata | Run `*extract-metadata --deep` |
| Poor organization | Reorganize catalog by format and credibility |
| Unclear recommendations | Add specific next steps and best files list |

## Example Usage

```bash
# After completing file search
*search-files "React hooks PDF 2024"

# Review output with checklist
cd docs/file-research/2026-02-14-react-hooks/

# Check each category
# Mark items as you verify them

# Calculate quality score
# Total: 45 items
# Checked: 42 items
# Score: 93% (Excellent)

# Validate sources
*validate-sources docs/file-research/2026-02-14-react-hooks/

# If score < 90%, make improvements
# Then re-validate
```

## Checklist Completion

**Date:** _______________
**Reviewer:** _______________
**Research Directory:** _______________

**Quality Score:** _____% (_____/_____ items)

**Rating:** [ ] Excellent [ ] Good [ ] Acceptable [ ] Poor

**Critical Items Passed:** [ ] Yes [ ] No

**Ready for Publication:** [ ] Yes [ ] No

**Notes:**
```
[Space for reviewer notes]
```

**Signature:** _______________

---

**Version:** 1.0.0
**Created:** 2026-02-14
**Author:** aios-master
**Status:** ⚠️ Pending validation
