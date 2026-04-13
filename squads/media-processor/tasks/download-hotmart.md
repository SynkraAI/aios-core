# Task: Download from Hotmart

**Version:** 1.0.0
**Status:** Active
**Owner:** @downloader (Downloader)
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

---

## Purpose

Download courses, modules, and lessons from Hotmart platform using the `hotmart-dl` CLI tool. Handles authentication, course metadata retrieval, selective downloading, and output verification. Supports both full course downloads and selective module/lesson downloads.

---

## Executor Type

**Agent:** @downloader (Downloader)
**Mode:** YOLO (deterministic download process)
**Estimated Duration:** 15-120 minutes (depends on course size)
**Complexity:** STANDARD (score: 10/20)

---

## Inputs

| Input | Type | Required | Source | Example |
|-------|------|----------|--------|---------|
| `course_url` | string | YES | Classification or user | "https://app.hotmart.com/workspace/courses/marketing-digital" |
| `course_subdomain` | string | YES* | Extracted from URL | "marketing-digital" |
| `quality` | string | NO | User preference | "best" (default), "720p", "480p" |
| `download_subtitles` | boolean | NO | User preference | true (default) |
| `download_materials` | boolean | NO | User preference | true (default) |
| `audio_only` | boolean | NO | User preference | false (default) |
| `module_filter` | number | NO | User selection | 3 (download only module 3) |
| `output_dir` | string | NO | Default or user | "<PROJECT_ROOT>/squads/media-processor/downloads/hotmart/" |
| `dry_run` | boolean | NO | Testing flag | false (default) |

*Either `course_url` or `course_subdomain` required (subdomain can be extracted from URL)

---

## Preconditions

- [ ] `hotmart-dl` CLI is installed at `<PROJECT_ROOT>/tools/hotmart-downloader/.venv/bin/hotmart-dl`
- [ ] Virtual environment is activated or path is absolute
- [ ] User is authenticated with Hotmart (credentials stored)
- [ ] Output directory is writable
- [ ] Sufficient disk space (check course size first)

---

## Steps

### Step 1: Validate Authentication

```bash
# Check if hotmart-dl can authenticate
cd <PROJECT_ROOT>/tools/hotmart-downloader
.venv/bin/hotmart-dl auth status
```

**Expected Output:**
```
Authentication: OK
User: user@example.com
Session expires: 2026-03-23
```

**Action:**
1. Run auth status command
2. Parse output for "Authentication: OK"
3. If NOT OK, prompt user to run: `.venv/bin/hotmart-dl auth login`
4. Wait for user confirmation before proceeding

**Validation:**
- [ ] Auth status returns "OK"
- [ ] Session is not expired

---

### Step 2: Extract Course Subdomain

If `course_subdomain` not provided, extract from `course_url`:

```bash
# Extract subdomain from URL
# Pattern: https://app.hotmart.com/workspace/courses/{subdomain}
```

**Action:**
1. Parse URL using regex: `hotmart\.com/workspace/courses/([^/]+)`
2. Extract capture group as `course_subdomain`
3. Validate subdomain is non-empty and alphanumeric

**Output:** `course_subdomain` variable

---

### Step 3: Get Course Metadata

```bash
cd <PROJECT_ROOT>/tools/hotmart-downloader
.venv/bin/hotmart-dl info -c "{course_subdomain}"
```

**Expected Output:**
```json
{
  "course_name": "Marketing Digital Completo",
  "total_modules": 8,
  "total_lessons": 64,
  "estimated_size_gb": 4.2,
  "has_subtitles": true,
  "has_materials": true
}
```

**Action:**
1. Run info command to retrieve course metadata
2. Parse JSON output
3. Display summary to user:
   - Course name
   - Total modules and lessons
   - Estimated download size
   - Available subtitles/materials
4. Ask for confirmation if size > 5GB

**Output:** Course metadata object

---

### Step 4: Construct Download Command

Build command with user preferences:

```bash
cd <PROJECT_ROOT>/tools/hotmart-downloader

# Base command
COMMAND=".venv/bin/hotmart-dl download -c \"{course_subdomain}\""

# Add quality flag
COMMAND+=" -q {quality}"

# Add optional flags
if {download_subtitles}: COMMAND+=" --subtitles"
if {download_materials}: COMMAND+=" --materials"
if {audio_only}: COMMAND+=" --audio-only"
if {module_filter}: COMMAND+=" --module {module_filter}"
if {dry_run}: COMMAND+=" --dry-run"

# Add output directory (optional, uses default if not specified)
if {output_dir}: COMMAND+=" -o \"{output_dir}\""
```

**Action:**
1. Build command string with all flags
2. Log full command to `.aiox-core/logs/media-processor/download-hotmart.log`
3. Display command to user for review
4. Await confirmation if not in YOLO mode

**Output:** Complete CLI command string

---

### Step 5: Execute Download

```bash
cd <PROJECT_ROOT>/tools/hotmart-downloader
.venv/bin/hotmart-dl download -c "{course_subdomain}" -q {quality} --subtitles --materials
```

**Action:**
1. Execute download command
2. Monitor progress (hotmart-dl shows progress bars)
3. Log all output to `.aiox-core/logs/media-processor/download-hotmart.log`
4. Handle interruptions (Ctrl+C) gracefully:
   - Save partial download state
   - Offer resume option
5. Track downloaded files in real-time

**Expected Output Structure:**
```
downloads/
└── {CourseName}/
    ├── Module_01_IntroduÃ§Ã£o/
    │   ├── Lesson_01_Boas_Vindas.mp4
    │   ├── Lesson_01_Boas_Vindas.vtt
    │   └── Materials/
    │       └── Apostila_Modulo_1.pdf
    ├── Module_02_Fundamentos/
    │   ├── Lesson_01_Conceitos.mp4
    │   └── Lesson_01_Conceitos.vtt
    └── ...
```

**Progress Tracking:**
- Current module/lesson
- Download speed
- ETA
- Total progress percentage

---

### Step 6: Verify Download Integrity

```bash
# Check downloaded files
find "{output_dir}/{CourseName}" -type f -name "*.mp4" | wc -l
find "{output_dir}/{CourseName}" -type f -name "*.vtt" | wc -l
find "{output_dir}/{CourseName}" -type f -name "*.pdf" | wc -l
```

**Action:**
1. Count downloaded video files
2. Count downloaded subtitle files (if `--subtitles` used)
3. Count downloaded materials (if `--materials` used)
4. Compare counts with metadata from Step 3
5. Check for incomplete downloads (0-byte files)
6. Verify file integrity (optional: checksum validation)

**Validation Criteria:**
- [ ] Video count matches expected lessons (or module subset if filtered)
- [ ] Subtitle count matches video count (if subtitles requested)
- [ ] No 0-byte files
- [ ] Total size matches estimate (±15% tolerance)

**Output:** Verification report

---

### Step 7: Generate Download Report

Create comprehensive download report:

```markdown
# Hotmart Download Report

**Course:** {course_name}
**Subdomain:** {course_subdomain}
**Date:** {timestamp}
**Duration:** {download_duration_minutes} minutes

## Summary

- **Total Modules:** {total_modules}
- **Total Lessons:** {total_lessons}
- **Downloaded Videos:** {video_count}
- **Downloaded Subtitles:** {subtitle_count}
- **Downloaded Materials:** {materials_count}
- **Total Size:** {total_size_gb} GB

## Download Configuration

- **Quality:** {quality}
- **Subtitles:** {yes|no}
- **Materials:** {yes|no}
- **Audio Only:** {yes|no}
- **Module Filter:** {module_filter|all}

## Output Location

**Directory:** `{output_dir}/{CourseName}/`

## Verification

- [x] All videos downloaded
- [x] Subtitles present (if requested)
- [x] Materials present (if requested)
- [x] No corrupted files detected

## Next Steps

1. Review downloaded content
2. (Optional) Run `transcribe-media` task for transcription
3. (Optional) Run `sculpt-transcript` task for content extraction
```

**Action:**
1. Render report template with actual data
2. Save report to `{output_dir}/{CourseName}/DOWNLOAD-REPORT.md`
3. Display summary to user
4. Update `.synapse/metrics/media-processor-metrics.json` with download stats

**Output:** Download report (markdown)

---

### Step 8: Quality Gate Validation (QG-001)

Run QG-001 validation (see Validation section below):

**Action:**
1. Execute all QG-001 checks
2. Generate validation report
3. If FAIL, log issues and notify user
4. If PASS, mark task as complete

---

## Outputs

### Primary Output

**Downloaded Course Files:**
- **Location:** `{output_dir}/{CourseName}/`
- **Structure:** Module/Lesson hierarchy
- **Files:** Video (.mp4), Subtitles (.vtt), Materials (.pdf, .zip, etc.)

### Secondary Outputs

1. **Download Report:** `{output_dir}/{CourseName}/DOWNLOAD-REPORT.md`
2. **Download Log:** `.aiox-core/logs/media-processor/download-hotmart.log`
3. **Metrics Update:** `.synapse/metrics/media-processor-metrics.json`

```json
{
  "downloads": {
    "hotmart": {
      "total_courses": 5,
      "total_lessons": 320,
      "total_size_gb": 24.8,
      "last_download": "2026-02-23T14:30:00Z"
    }
  }
}
```

---

## Validation

### QG-001: Download Completeness

**Criteria:**
- [ ] All expected videos downloaded (count matches metadata)
- [ ] Subtitles downloaded for all videos (if `--subtitles` flag used)
- [ ] Materials downloaded (if `--materials` flag used)
- [ ] No 0-byte or corrupted files
- [ ] Total size within ±15% of estimate

**Method:** Automated file count and size verification

**Threshold:** 100% completeness for requested content

**Severity:** CRITICAL (blocks transcription workflow if incomplete)

---

### QG-002: File Integrity

**Criteria:**
- [ ] All video files are playable (basic validation: ffprobe check)
- [ ] All subtitle files are valid VTT format
- [ ] All material files are accessible (PDFs open, ZIPs extract)

**Method:** Automated integrity checks using ffprobe and file type detection

**Threshold:** >= 98% of files pass integrity check

**Severity:** HIGH

---

### QG-003: Output Structure

**Criteria:**
- [ ] Output follows expected hierarchy: Course/Module/Lesson
- [ ] File names are sanitized (no special characters that break workflows)
- [ ] Directory structure is consistent

**Method:** Directory structure validation

**Threshold:** 100% structure conformance

**Severity:** MEDIUM

---

## Quality Threshold

**Minimum Acceptable:**
- Download completeness: 100%
- File integrity: >= 95%
- Structure conformance: 100%

**Target:**
- Download completeness: 100%
- File integrity: 100%
- Structure conformance: 100%
- Average download speed: >= 5 Mbps

---

## Error Handling

### Common Errors

| Error Code | Cause | Recovery |
|------------|-------|----------|
| `AUTH_FAILED` | Session expired or invalid credentials | Re-authenticate with `hotmart-dl auth login` |
| `COURSE_NOT_FOUND` | Invalid course subdomain | Verify URL/subdomain with user |
| `NETWORK_ERROR` | Connection timeout or interruption | Resume download (hotmart-dl supports resume) |
| `DISK_FULL` | Insufficient disk space | Free space or change output directory |
| `RATE_LIMIT` | Too many requests to Hotmart API | Wait 60 seconds, retry |
| `DOWNLOAD_INCOMPLETE` | Partial download due to error | Resume from last successful lesson |

### Recovery Strategies

1. **Authentication Failure:**
   ```bash
   .venv/bin/hotmart-dl auth login
   # User enters credentials
   # Retry download
   ```

2. **Network Interruption:**
   ```bash
   # hotmart-dl automatically resumes from last lesson
   # Re-run same download command
   ```

3. **Disk Space:**
   ```bash
   # Check available space
   df -h {output_dir}
   # Offer to compress/archive older downloads
   # Retry with free space
   ```

4. **Rate Limit:**
   ```bash
   # Wait 60 seconds
   sleep 60
   # Retry download
   ```

---

## Integration

### Feeds To

- **transcribe-media** — Downloaded videos ready for transcription
- **sculpt-transcript** — Downloaded subtitles ready for sculpting (if subtitles available)
- **organize-content** — Downloaded materials ready for organization

### Depends On

- **classify-request** — Receives `course_subdomain` and parameters from classification

### Observability

**Metrics Tracked:**
- Total courses downloaded
- Total lessons downloaded
- Total size downloaded (GB)
- Average download speed (Mbps)
- Success rate (% complete downloads)
- Most downloaded courses

**Dashboard Integration:**
- Download history in `.synapse/metrics/media-processor-metrics.json`
- Real-time progress in Transcription Dashboard (if integrated)

---

## Flags Reference

### hotmart-dl CLI Flags

| Flag | Description | Example |
|------|-------------|---------|
| `-c, --course` | Course subdomain (required) | `-c "marketing-digital"` |
| `-q, --quality` | Video quality (best, 1080p, 720p, 480p) | `-q best` |
| `--subtitles` | Download subtitles (VTT format) | `--subtitles` |
| `--materials` | Download course materials (PDFs, etc.) | `--materials` |
| `--audio-only` | Download audio only (no video) | `--audio-only` |
| `--module N` | Download only module N | `--module 3` |
| `-o, --output` | Output directory | `-o /path/to/output` |
| `--dry-run` | Simulate download (no actual download) | `--dry-run` |
| `--resume` | Resume interrupted download | `--resume` |
| `--overwrite` | Overwrite existing files | `--overwrite` |

---

## Examples

### Example 1: Full Course Download

**Input:**
```json
{
  "course_subdomain": "marketing-digital",
  "quality": "best",
  "download_subtitles": true,
  "download_materials": true
}
```

**Command:**
```bash
cd <PROJECT_ROOT>/tools/hotmart-downloader
.venv/bin/hotmart-dl download -c "marketing-digital" -q best --subtitles --materials
```

**Output:**
```
downloads/Marketing_Digital_Completo/
├── Module_01_Introducao/
│   ├── Lesson_01_Boas_Vindas.mp4
│   ├── Lesson_01_Boas_Vindas.vtt
│   └── Materials/Apostila.pdf
├── Module_02_Fundamentos/
│   └── ...
└── DOWNLOAD-REPORT.md
```

---

### Example 2: Audio-Only Download (Single Module)

**Input:**
```json
{
  "course_subdomain": "podcast-course",
  "quality": "best",
  "audio_only": true,
  "module_filter": 2
}
```

**Command:**
```bash
cd <PROJECT_ROOT>/tools/hotmart-downloader
.venv/bin/hotmart-dl download -c "podcast-course" -q best --audio-only --module 2
```

**Output:**
```
downloads/Podcast_Course/
└── Module_02_Edicao/
    ├── Lesson_01_Intro.m4a
    ├── Lesson_02_Ferramentas.m4a
    └── DOWNLOAD-REPORT.md
```

---

### Example 3: Dry Run (Testing)

**Input:**
```json
{
  "course_subdomain": "test-course",
  "dry_run": true
}
```

**Command:**
```bash
cd <PROJECT_ROOT>/tools/hotmart-downloader
.venv/bin/hotmart-dl download -c "test-course" --dry-run
```

**Output:**
```
[DRY RUN] Would download:
- Module 1: Lesson 1, Lesson 2, Lesson 3
- Module 2: Lesson 4, Lesson 5
Total: 5 lessons, ~800 MB
```

---

## Notes

- **Authentication:** Credentials are stored securely by `hotmart-dl` (not in AIOS config)
- **Resume Support:** Interrupted downloads can be resumed by re-running the same command
- **Rate Limiting:** Hotmart may throttle excessive downloads; respect 60s cooldown if rate-limited
- **File Naming:** hotmart-dl sanitizes file names automatically (removes special chars)
- **Subtitles:** VTT format is compatible with most video players and transcription tools
- **Materials:** Downloaded materials (PDFs, ZIPs) are stored in `Materials/` subdirectory per lesson

---

## References

- **hotmart-dl Documentation:** `<PROJECT_ROOT>/tools/hotmart-downloader/README.md`
- **Authentication Guide:** `<PROJECT_ROOT>/tools/hotmart-downloader/docs/auth.md`
- **Troubleshooting:** `<PROJECT_ROOT>/tools/hotmart-downloader/docs/troubleshooting.md`

---

**Task Classification:** STANDARD
**Estimated Tokens:** ~5000 (download) + ~1000 (validation) + ~500 (reporting)
**Success Rate:** 92% (based on network reliability and course availability)
