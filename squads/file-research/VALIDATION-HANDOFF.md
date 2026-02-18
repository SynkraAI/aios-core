# Validation Handoff - File Research Squad

**Date:** 2026-02-14
**Created by:** aios-master (Orion)
**Status:** ⚠️ Pending validation
**Validation sequence:** @architect → @squad-creator → @qa

---

## Context

Created a NEW squad called **file-research** based on the **tech-search** skill architecture.

**User Request:** "Create a squad like tech-search, but for finding diverse files on the internet (PDFs, EPUBs, etc.)"

**Approach:** Faithful copy of tech-search structure, adapted for file discovery instead of tech research.

---

## What Was Created

### Complete Squad Structure

```
squads/file-research/
├── config.yaml                           # Squad configuration
├── README.md                             # Main documentation
├── agents/
│   └── file-hunter.md                   # Main agent (6-phase pipeline)
├── tasks/
│   ├── search-files.md                  # Main task (6 phases detailed)
│   ├── validate-sources.md              # Link validation
│   └── extract-metadata.md              # Metadata extraction
├── workflows/
│   └── wf-file-research.yaml            # Complete YAML workflow
├── checklists/
│   └── file-quality-checklist.md        # QA checklist (45 items)
└── data/
    └── file-search-operators.md         # Search operators guide
```

### Key Adaptations from tech-search

| Aspect | tech-search | file-research |
|--------|-------------|---------------|
| **Focus** | Technical documentation | Files (PDFs, EPUBs, DOCs, etc.) |
| **Query decomposition** | Technical sub-queries | File-focused with operators |
| **Search strategy** | WebSearch + Exa | Apify (scraping) → Exa → WebSearch |
| **Deep read** | WebFetch full content | WebFetch metadata only |
| **Output** | Code examples, findings | Download links, file metadata |
| **Security** | No production code | No auto-download |

---

## Validation Tasks

### 1️⃣ @architect - Architecture Validation

**Focus:** System design, technical architecture, integrations

#### Tasks

**Pipeline Architecture:**
- [ ] Review 6-phase pipeline design (Auto-Clarify → Decompose → Parallel Search → Evaluate → Synthesize → Document)
- [ ] Validate worker parallelization strategy (max 5 Haiku workers)
- [ ] Verify max 2 waves design (vs tech-search's 2 waves)
- [ ] Assess coverage evaluation logic (stopping rules)

**MCP Integration:**
- [ ] Validate tool hierarchy: Apify → Exa → WebSearch
- [ ] Review MCP availability detection (pre-check)
- [ ] Verify fallback mechanisms
- [ ] Check Docker MCP usage patterns (via docker-gateway)

**Worker Design:**
- [ ] Validate Haiku worker prompt template
- [ ] Review parallel dispatch strategy (single message, max 5)
- [ ] Verify worker result aggregation logic
- [ ] Assess failure handling (fallback to main context)

**Data Flow:**
- [ ] Trace data flow from query → output
- [ ] Validate JSON schemas for worker responses
- [ ] Review aggregation and deduplication logic
- [ ] Check metadata extraction pipeline

**Security Architecture:**
- [ ] Validate path restrictions (docs/file-research/ only)
- [ ] Review URL validation logic
- [ ] Verify no auto-download mechanisms
- [ ] Check credibility assessment rules

**Output:**
- [ ] Architecture validation report
- [ ] Recommendations for improvements
- [ ] Identified risks or anti-patterns
- [ ] Approval or rejection with reasons

**Deliverable:** `squads/file-research/validation-reports/architect-report.md`

---

### 2️⃣ @squad-creator - Squad Standards Validation

**Focus:** AIOS squad conformity, templates, standards compliance

#### Tasks

**Squad Structure:**
- [ ] Validate folder structure vs AIOS squad standards
- [ ] Verify all required files present
- [ ] Check file naming conventions (kebab-case)
- [ ] Validate config.yaml structure and required fields

**Agent Definition (file-hunter.md):**
- [ ] Verify agent YAML structure
- [ ] Check activation-instructions completeness
- [ ] Validate persona profile
- [ ] Review commands list (help, guide, exit, etc.)
- [ ] Verify dependencies correctly mapped
- [ ] Check autoClaude metadata

**Tasks Validation:**
- [ ] Validate task structure (ID, description, inputs, outputs)
- [ ] Check workflow steps are clear and actionable
- [ ] Verify error handling sections
- [ ] Review validation checklists per task
- [ ] Ensure tasks are self-contained and executable

**Workflow YAML:**
- [ ] Validate YAML syntax (parse test)
- [ ] Check workflow structure vs template
- [ ] Verify phases match agent implementation
- [ ] Review inputs/outputs definitions
- [ ] Validate conditional loops logic
- [ ] Check veto conditions

**Documentation:**
- [ ] README completeness (Quick Start, Architecture, Examples)
- [ ] Task documentation clarity
- [ ] Checklist usability
- [ ] Data file usefulness (search operators guide)

**Dependencies:**
- [ ] Verify dependency resolution paths
- [ ] Check for circular dependencies
- [ ] Validate MCP server references
- [ ] Review tool requirements

**Metadata:**
- [ ] Version numbers consistent (1.0.0)
- [ ] Created dates accurate (2026-02-14)
- [ ] Author attribution (aios-master)
- [ ] Status flags correct (pending_validation)

**Output:**
- [ ] Squad conformity report
- [ ] List of violations (if any)
- [ ] Recommendations for standardization
- [ ] Approval or rejection with reasons

**Deliverable:** `squads/file-research/validation-reports/squad-creator-report.md`

---

### 3️⃣ @qa - Quality Assurance Validation

**Focus:** Functionality, security, usability, quality gates

#### Tasks

**Functional Testing:**
- [ ] Execute file-quality-checklist.md (all 45 items)
- [ ] Validate workflow YAML can be parsed
- [ ] Test agent activation instructions (dry-run)
- [ ] Verify all commands are documented
- [ ] Check examples are runnable

**Security Testing:**
- [ ] Validate veto conditions (VETO_NO_RESULTS, VETO_DOWNLOAD_REQUEST, etc.)
- [ ] Test path restriction enforcement (docs/file-research/ only)
- [ ] Verify no auto-download code paths
- [ ] Check URL validation logic
- [ ] Review credibility assessment for security implications

**Quality Gates:**
- [ ] Minimum coverage thresholds defined (60% acceptable, 80% ideal)
- [ ] Minimum file count (5 files or explanation)
- [ ] Minimum HIGH credibility sources (2+)
- [ ] Stopping rules enforced (max 2 waves)
- [ ] Worker failure thresholds defined

**Edge Cases:**
- [ ] No results found (VETO_NO_RESULTS)
- [ ] All workers fail
- [ ] MCP unavailable (fallback works?)
- [ ] Malicious URLs detected
- [ ] Rate limiting encountered
- [ ] Partial metadata extraction

**Usability:**
- [ ] README is clear for new users
- [ ] Quick Start section works
- [ ] Commands are intuitive (*search-files, *validate-sources)
- [ ] Error messages are helpful
- [ ] Output structure is organized

**Documentation Quality:**
- [ ] No broken internal links
- [ ] Markdown syntax valid
- [ ] Tables formatted correctly
- [ ] Code blocks have proper syntax highlighting
- [ ] Examples are realistic and useful

**Compliance:**
- [ ] Follows AIOS Constitution (CLI First, Agent Authority, etc.)
- [ ] Uses correct tool hierarchy (native tools > MCP)
- [ ] No forbidden actions (auto-download, path traversal)
- [ ] Security-first approach evident

**Output:**
- [ ] QA test report
- [ ] List of bugs/issues found
- [ ] Security vulnerabilities (if any)
- [ ] Usability improvements
- [ ] Approval or rejection with reasons

**Deliverable:** `squads/file-research/validation-reports/qa-report.md`

---

## Validation Workflow

### Sequence

```
@architect validates architecture
    ↓
    ✅ Approved
    ↓
@squad-creator validates standards
    ↓
    ✅ Approved
    ↓
@qa validates quality & security
    ↓
    ✅ Approved
    ↓
SQUAD APPROVED FOR PRODUCTION
```

### If Rejected

Any validator can reject with recommendations:

1. **Document issues** in validation report
2. **Assign back to @aios-master** for fixes
3. **Re-validate** after fixes applied
4. **Continue sequence** once approved

---

## Success Criteria

### Architecture (@architect)

- ✅ Pipeline design is sound
- ✅ MCP integration follows best practices
- ✅ Worker parallelization is safe
- ✅ Security architecture is robust
- ✅ No anti-patterns detected

### Standards (@squad-creator)

- ✅ Follows AIOS squad structure
- ✅ Agent definition is complete
- ✅ Tasks are executable
- ✅ Workflow YAML is valid
- ✅ Documentation is complete

### Quality (@qa)

- ✅ All quality gates pass
- ✅ No security vulnerabilities
- ✅ Usability is good
- ✅ Edge cases handled
- ✅ Compliant with Constitution

---

## Additional Context

### Design Decisions

**Why 6 phases?**
- Copied from tech-search proven architecture
- Each phase has distinct responsibility
- Allows for parallel workers in Phase 3

**Why max 2 waves?**
- Balance between coverage and cost
- Tech-search uses 2 waves successfully
- Prevents infinite loops

**Why Apify first in tool hierarchy?**
- Apify has specialized file scrapers
- Better for file discovery than general search
- Fallback to Exa/WebSearch ensures robustness

**Why no auto-download?**
- Security risk (malware, large files)
- User should review before downloading
- Provides links only, user controls download

**Why Haiku workers?**
- Cost-efficient for parallel search
- Simple search+extract tasks
- Main model for synthesis (complex reasoning)

### Known Limitations

**Intentional:**
- No file content parsing (only metadata)
- No file conversion (out of scope)
- No auto-download (security)
- Max 2 waves (cost control)

**Technical:**
- Depends on MCP availability (has fallbacks)
- Credibility assessment is heuristic (domain-based)
- Metadata extraction depends on source quality

### Future Enhancements (Post-Validation)

- Integration with file storage services (Dropbox, Google Drive)
- Advanced credibility scoring (ML-based)
- File content preview (safe sandbox)
- Batch file validation
- Citation extraction for academic papers

---

## Validation Reports Location

All validation reports should be saved to:

```
squads/file-research/validation-reports/
├── architect-report.md
├── squad-creator-report.md
└── qa-report.md
```

**Report Template:**

```markdown
# {Agent} Validation Report - File Research Squad

**Validator:** @{agent-name}
**Date:** {YYYY-MM-DD}
**Status:** ✅ Approved | ⚠️ Approved with Recommendations | ❌ Rejected

## Summary

[Brief overview of validation results]

## Detailed Findings

### ✅ Passed

[List of passed items]

### ⚠️ Warnings

[List of warnings/recommendations]

### ❌ Critical Issues

[List of blocking issues]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Approval Decision

**Decision:** [APPROVED | APPROVED_WITH_RECOMMENDATIONS | REJECTED]

**Reason:** [Brief reason]

**Next Steps:** [What should happen next]

---

**Signature:** @{agent-name}
**Timestamp:** {YYYY-MM-DD HH:MM}
```

---

## Questions for Validators

### @architect

1. Is the 6-phase pipeline design appropriate for file research?
2. Are there any security risks in the worker architecture?
3. Should we add rate limiting protection?
4. Is the MCP fallback strategy robust enough?

### @squad-creator

1. Does this conform to AIOS squad standards?
2. Are there any missing required files?
3. Should we add more tasks (e.g., batch-search)?
4. Is the documentation complete for users?

### @qa

1. Are all quality gates sufficient?
2. Are there security vulnerabilities we missed?
3. Is the checklist comprehensive enough?
4. What edge cases should we add tests for?

---

## Contact

**Created by:** @aios-master (Orion)
**Date:** 2026-02-14
**Status:** Ready for validation

**Start validation with:** `@architect`

---

**Ready to begin validation sequence.**
