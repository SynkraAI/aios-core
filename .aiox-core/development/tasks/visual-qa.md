# Task: Visual Quality Assurance for HTML Artifacts

**Type:** Quality Gate
**Responsibility:** Validate visual quality of generated HTML artifacts
**Duration:** 5-10 minutes per artifact

---

## Purpose

Capture visual representations of HTML artifacts (courses, prototypes, landing pages) at multiple device sizes and inspect for visual defects before delivery. Ensures no layout breaks, text overflow, or rendering issues slip through.

---

## Inputs

- `artifact_path` (required) — Path to HTML file or course directory
- `--viewports` (optional) — Viewport sizes: `1920x1080,768x1024,375x812` (default)
- `--output` (optional) — Directory to save screenshots (default: `/tmp/visual-qa/`)

---

## Execution

### Step 1: Capture Screenshots

**Option A: Using Playwright (Recommended)**

```bash
node scripts/visual-qa/screenshot.js outputs/courses/meu-curso/index.html --output ./qa-screenshots/
```

**Option B: Manual Browser Inspection (Fallback)**

Open the HTML file in a browser and manually capture screenshots at:
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x812

Use browser dev tools (F12) → Device Emulation to change viewports.

### Step 2: Inspect Screenshots

For each screenshot, check:

- [ ] **Text Rendering**
  - No text overflow or clipping
  - All text legible (sufficient contrast)
  - No missing/fallback fonts

- [ ] **Layout Integrity**
  - No elements overlapping unexpectedly
  - Scrollbar only appears when needed
  - Proper margins and padding maintained

- [ ] **Visual Completeness**
  - All images loaded (no broken image icons)
  - All decorative elements visible
  - Icons/SVGs rendering correctly

- [ ] **Responsiveness**
  - Layout adapts properly at each viewport
  - No content cut off at screen edges
  - Touch targets appropriately sized on mobile

- [ ] **Consistency**
  - Spacing consistent across sections
  - Alignment matches design intent
  - Colors render as expected

### Step 3: Categorize Issues

**Critical Issues (FAIL):**
- Text completely unreadable
- Core content hidden/cut off
- Major layout breakdown
- Missing navigation/buttons

**Minor Issues (WARN):**
- Single pixel misalignment
- Non-critical decorative element slightly off
- Cosmetic spacing inconsistency
- Fallback font renders acceptably

**No Issues (PASS):**
- All elements correctly positioned
- All content visible and readable
- Layout responsive at all viewports

### Step 4: Report & Action

**If FAIL:**
1. Document the specific issue (with viewport)
2. Identify the cause (CSS, HTML structure, etc.)
3. Fix in source code
4. Re-capture screenshots
5. Re-inspect until PASS

**If WARN:**
1. Document cosmetic issues
2. Decide: fix now or accept as known limitation
3. If fixed: re-capture and re-inspect
4. If accepted: document in validation report

**If PASS:**
1. Save screenshots to `outputs/{artifact}/qa-screenshots/`
2. Generate validation report: `outputs/{artifact}/validation-report.md`
3. Mark artifact as QA approved

---

## Output Report

Create `outputs/{artifact}/qa-report.md`:

```markdown
# Visual QA Report: {artifact-name}

**Date:** 2026-02-05
**Inspector:** {agent-name}
**Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL

## Screenshots Captured

- 1920x1080 (Desktop) - outputs/qa-screenshots/{artifact}_1920x1080.png
- 768x1024 (Tablet) - outputs/qa-screenshots/{artifact}_768x1024.png
- 375x812 (Mobile) - outputs/qa-screenshots/{artifact}_375x812.png

## Issues Found

### Critical
- [List any critical issues that blocked approval]

### Minor
- [List cosmetic or non-blocking issues]

## Recommendations

- [If FAIL: specific actions needed before resubmission]
- [If WARN: actions recommended but not blocking]
- [If PASS: ready for human review]

## Inspector Notes

[Any additional observations or context]

---

**Approved by:** [Inspector]
**Date:** [Date]
```

---

## Success Criteria

- ✅ Screenshots captured at all required viewports
- ✅ Visual defects identified and categorized
- ✅ Report clearly documents status (PASS/WARN/FAIL)
- ✅ If FAIL, specific remediation steps provided
- ✅ If issues fixed, re-inspection confirms resolution

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Text overflow on mobile | Fixed width containers | Use max-width + responsive units |
| Images not loading | Relative path issues | Use absolute paths or check domain |
| Layout breaks at edges | Missing viewport meta tag | Add `<meta name="viewport" content="width=device-width">` |
| Font falls back to serif | Custom font not loaded | Check font-family order, web font CDN |
| Button unclickable on mobile | Too small touch target | Increase to min 44x44px |
| Spacing too tight | Insufficient padding | Use `padding`, `margin`, or `gap` properties |

---

## Tools

### Playwright Screenshot (Automated)
```bash
npm install playwright
node scripts/visual-qa/screenshot.js <path> --output <dir>
```

### Browser DevTools (Manual)
- Chrome/Edge: F12 → Device Emulation (Ctrl+Shift+M)
- Firefox: Ctrl+Shift+M
- Safari: Develop → Enter Responsive Design Mode

### Image Comparison (Optional)
- ImageMagick: `compare ref.png new.png diff.png`
- Pixelmatch (npm): Compare pixel-by-pixel

---

## Error Handling

### File Not Found
```
Error: HTML file not found at outputs/courses/meu-curso/index.html

Check:
1. Path is absolute or relative from project root
2. File extension is .html (not .md)
3. File has been generated (run generate step first)
```

### Screenshot Capture Failed
```
Error: Playwright browser error

Check:
1. Playwright is installed: npm install playwright
2. No other processes using the port
3. System has sufficient disk space for /tmp/
4. Try running with --output ./screenshots/ for a different location
```

---

## Workflow Integration

### For Courses (CreatorOS)

Add as final step in `generate-course` workflow:

```markdown
## Step 5: Visual QA (New)

Execute visual QA on the generated course:

\`\`\`bash
node scripts/visual-qa/screenshot.js outputs/courses/{slug}/index.html
\`\`\`

If FAIL: Fix issues and re-run QA until PASS.
If WARN: Review and document.
If PASS: Course is production-ready for human review.
```

### For Prototypes

Run QA immediately after HTML generation to catch layout issues early.

### For Landing Pages

Run QA before submitting to copywriter for final review.

---

**Status:** ✅ Ready

