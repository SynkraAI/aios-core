# Task: Download from Cademi

**Version:** 1.0.0
**Status:** Active
**Owner:** @downloader (Downloader)
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

---

## Purpose

Download courses, modules, and lessons from Cademi platform using the `cademi-dl` CLI tool. Handles authentication, course metadata retrieval, selective downloading, and dashboard integration via status JSON. Supports both full course downloads and selective module/lesson downloads.

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
| `course_url` | string | YES | Classification or user | "https://cademi.com.br/curso/marketing-digital" |
| `quality` | string | NO | User preference | "best" (default), "720p", "480p" |
| `batch_mode` | boolean | NO | User preference | false (default) |
| `select_all` | boolean | NO | Batch option | false (default) |
| `selection` | array | NO | User selection | [1, 3, 5] (module IDs) |
| `audio_only` | boolean | NO | User preference | false (default) |
| `output_dir` | string | NO | Default or user | "<PROJECT_ROOT>/squads/media-processor/downloads/cademi/" |
| `dry_run` | boolean | NO | Testing flag | false (default) |
| `enable_dashboard` | boolean | NO | Observability flag | true (default) |

---

## Preconditions

- [ ] `cademi-dl` CLI is installed at `<PROJECT_ROOT>/tools/cademi-downloader/.venv/bin/cademi-dl`
- [ ] Virtual environment is activated or path is absolute
- [ ] User is authenticated with Cademi (credentials stored)
- [ ] Output directory is writable
- [ ] Sufficient disk space (check course size first)
- [ ] (Optional) Transcription Dashboard running if `enable_dashboard` is true

---

## Steps

### Step 1: Validate Authentication

```bash
# Check if cademi-dl can authenticate
cd <PROJECT_ROOT>/tools/cademi-downloader
.venv/bin/cademi-dl auth status
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
3. If NOT OK, prompt user to run: `.venv/bin/cademi-dl auth login`
4. Wait for user confirmation before proceeding

**Validation:**
- [ ] Auth status returns "OK"
- [ ] Session is not expired

---

### Step 2: Get Course Metadata

```bash
cd <PROJECT_ROOT>/tools/cademi-downloader
.venv/bin/cademi-dl info -c "{course_url}"
```

**Expected Output:**
```json
{
  "course_id": "marketing-digital",
  "course_name": "Marketing Digital Completo",
  "total_modules": 10,
  "total_lessons": 85,
  "estimated_size_gb": 5.8,
  "modules": [
    {
      "id": 1,
      "name": "Introdução",
      "lessons": 8
    },
    {
      "id": 2,
      "name": "Fundamentos",
      "lessons": 12
    }
  ]
}
```

**Action:**
1. Run info command to retrieve course metadata
2. Parse JSON output
3. Display summary to user:
   - Course name and ID
   - Total modules and lessons
   - Estimated download size
   - Module breakdown (if selection needed)
4. Ask for confirmation if size > 5GB
5. If `selection` mode, present module list for user choice

**Output:** Course metadata object

---

### Step 3: Handle Selection Mode (if applicable)

If user wants selective download:

**Action:**
1. Display module list from metadata
2. Ask user to select modules (comma-separated IDs or "all")
3. Parse selection into array: `[1, 3, 5]`
4. Calculate subset size estimate
5. Confirm selection with user

**Example Interaction:**
```
Available modules:
1. Introdução (8 lessons, ~400 MB)
2. Fundamentos (12 lessons, ~600 MB)
3. SEO Avançado (10 lessons, ~500 MB)
...

Select modules (comma-separated IDs, or 'all'): 1,3,5
```

**Output:** `selection` array or `select_all` flag

---

### Step 4: Construct Download Command

Build command with user preferences:

```bash
cd <PROJECT_ROOT>/tools/cademi-downloader

# Base command
COMMAND=".venv/bin/cademi-dl download -c \"{course_url}\""

# Add quality flag
COMMAND+=" -q {quality}"

# Add selection flags
if {select_all}: COMMAND+=" --select-all"
if {selection}: COMMAND+=" --selection {selection_ids}"

# Add optional flags
if {audio_only}: COMMAND+=" --audio-only"
if {dry_run}: COMMAND+=" --dry-run"

# Add output directory (optional, uses default if not specified)
if {output_dir}: COMMAND+=" -o \"{output_dir}\""
```

**Action:**
1. Build command string with all flags
2. Log full command to `.aiox-core/logs/media-processor/download-cademi.log`
3. Display command to user for review
4. Await confirmation if not in YOLO mode

**Output:** Complete CLI command string

---

### Step 5: Initialize Dashboard Status (if enabled)

If `enable_dashboard` is true:

```bash
# Create initial status file
cat > <PROJECT_ROOT>/tools/cademi-downloader/cademi-download-status.json <<EOF
{
  "course_id": "{course_id}",
  "course_name": "{course_name}",
  "status": "downloading",
  "progress": {
    "total_lessons": {total_lessons},
    "downloaded": 0,
    "failed": 0,
    "current_module": null,
    "current_lesson": null
  },
  "started_at": "{timestamp}",
  "estimated_completion": null,
  "download_speed_mbps": 0,
  "eta_minutes": null
}
EOF
```

**Action:**
1. Create `cademi-download-status.json` in tool directory
2. Initialize with course metadata
3. Set status to "downloading"
4. Dashboard polls this file for real-time updates

**Output:** `cademi-download-status.json` file

---

### Step 6: Execute Download

```bash
cd <PROJECT_ROOT>/tools/cademi-downloader
.venv/bin/cademi-dl download -c "{course_url}" -q {quality} --select-all
```

**Action:**
1. Execute download command
2. Monitor progress (cademi-dl shows progress bars)
3. Log all output to `.aiox-core/logs/media-processor/download-cademi.log`
4. Update `cademi-download-status.json` in real-time (if dashboard enabled):
   - Current module/lesson
   - Download speed
   - ETA
   - Progress percentage
5. Handle interruptions (Ctrl+C) gracefully:
   - Save partial download state
   - Update status to "paused"
   - Offer resume option
6. Track downloaded files in real-time

**Expected Output Structure:**
```
downloads/
└── {CourseName}/
    ├── Module_01_Introducao/
    │   ├── Lesson_01_Boas_Vindas.mp4
    │   ├── Lesson_02_Objetivos.mp4
    │   └── ...
    ├── Module_02_Fundamentos/
    │   ├── Lesson_01_Conceitos.mp4
    │   └── ...
    └── ...
```

**Progress Tracking:**
- Current module/lesson
- Download speed (Mbps)
- ETA (minutes)
- Total progress percentage
- Dashboard integration (real-time status updates)

---

### Step 7: Finalize Dashboard Status (if enabled)

```bash
# Update final status
cat > <PROJECT_ROOT>/tools/cademi-downloader/cademi-download-status.json <<EOF
{
  "course_id": "{course_id}",
  "course_name": "{course_name}",
  "status": "completed",
  "progress": {
    "total_lessons": {total_lessons},
    "downloaded": {downloaded_count},
    "failed": {failed_count},
    "current_module": null,
    "current_lesson": null
  },
  "started_at": "{start_timestamp}",
  "completed_at": "{end_timestamp}",
  "duration_minutes": {duration},
  "download_speed_mbps": {average_speed},
  "total_size_gb": {total_size}
}
EOF
```

**Action:**
1. Update status to "completed" (or "failed" if errors)
2. Set final counts and statistics
3. Calculate average download speed
4. Dashboard shows completion notification

---

### Step 8: Verify Download Integrity

```bash
# Check downloaded files
find "{output_dir}/{CourseName}" -type f -name "*.mp4" | wc -l
find "{output_dir}/{CourseName}" -type f -name "*.m4a" | wc -l
```

**Action:**
1. Count downloaded video files
2. Count downloaded audio files (if `--audio-only` used)
3. Compare counts with metadata from Step 2
4. Check for incomplete downloads (0-byte files)
5. Verify file integrity (optional: ffprobe check)

**Validation Criteria:**
- [ ] Video/audio count matches expected lessons (or selection subset)
- [ ] No 0-byte files
- [ ] Total size matches estimate (±15% tolerance)
- [ ] All modules/lessons from selection are present

**Output:** Verification report

---

### Step 9: Generate Download Report

Create comprehensive download report:

```markdown
# Cademi Download Report

**Course:** {course_name}
**Course ID:** {course_id}
**Date:** {timestamp}
**Duration:** {download_duration_minutes} minutes

## Summary

- **Total Modules:** {total_modules}
- **Total Lessons:** {total_lessons}
- **Downloaded Videos:** {video_count}
- **Downloaded Audio:** {audio_count}
- **Total Size:** {total_size_gb} GB

## Download Configuration

- **Quality:** {quality}
- **Selection Mode:** {all|selective}
- **Selected Modules:** {selection|all}
- **Audio Only:** {yes|no}

## Output Location

**Directory:** `{output_dir}/{CourseName}/`

## Performance

- **Average Speed:** {average_speed_mbps} Mbps
- **Total Duration:** {duration_minutes} minutes
- **Failed Downloads:** {failed_count}

## Verification

- [x] All videos downloaded
- [x] No corrupted files detected
- [x] Dashboard status updated

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

### Step 10: Quality Gate Validation (QG-001)

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
- **Files:** Video (.mp4) or Audio (.m4a)

### Secondary Outputs

1. **Download Report:** `{output_dir}/{CourseName}/DOWNLOAD-REPORT.md`
2. **Download Log:** `.aiox-core/logs/media-processor/download-cademi.log`
3. **Dashboard Status:** `tools/cademi-downloader/cademi-download-status.json`
4. **Metrics Update:** `.synapse/metrics/media-processor-metrics.json`

```json
{
  "downloads": {
    "cademi": {
      "total_courses": 3,
      "total_lessons": 150,
      "total_size_gb": 12.5,
      "last_download": "2026-02-23T15:45:00Z"
    }
  }
}
```

---

## Validation

### QG-001: Download Completeness

**Criteria:**
- [ ] All expected videos/audio downloaded (count matches metadata or selection)
- [ ] No 0-byte or corrupted files
- [ ] Total size within ±15% of estimate
- [ ] Dashboard status shows "completed"

**Method:** Automated file count and size verification

**Threshold:** 100% completeness for requested content

**Severity:** CRITICAL (blocks transcription workflow if incomplete)

---

### QG-002: File Integrity

**Criteria:**
- [ ] All video files are playable (basic validation: ffprobe check)
- [ ] All audio files are valid (ffprobe check)
- [ ] No truncated or corrupted files

**Method:** Automated integrity checks using ffprobe

**Threshold:** >= 98% of files pass integrity check

**Severity:** HIGH

---

### QG-003: Dashboard Integration

**Criteria:**
- [ ] `cademi-download-status.json` exists
- [ ] Status is "completed" (or "failed" with error details)
- [ ] Progress counts are accurate
- [ ] Timestamps are present

**Method:** JSON schema validation

**Threshold:** 100% schema conformance

**Severity:** MEDIUM (dashboard observability only)

---

## Quality Threshold

**Minimum Acceptable:**
- Download completeness: 100%
- File integrity: >= 95%
- Dashboard integration: >= 90%

**Target:**
- Download completeness: 100%
- File integrity: 100%
- Dashboard integration: 100%
- Average download speed: >= 5 Mbps

---

## Error Handling

### Common Errors

| Error Code | Cause | Recovery |
|------------|-------|----------|
| `AUTH_FAILED` | Session expired or invalid credentials | Re-authenticate with `cademi-dl auth login` |
| `COURSE_NOT_FOUND` | Invalid course URL | Verify URL with user |
| `NETWORK_ERROR` | Connection timeout or interruption | Resume download (cademi-dl supports resume) |
| `DISK_FULL` | Insufficient disk space | Free space or change output directory |
| `RATE_LIMIT` | Too many requests to Cademi API | Wait 60 seconds, retry |
| `DOWNLOAD_INCOMPLETE` | Partial download due to error | Resume from last successful lesson |
| `SELECTION_ERROR` | Invalid module IDs in selection | Re-prompt for valid selection |

### Recovery Strategies

1. **Authentication Failure:**
   ```bash
   .venv/bin/cademi-dl auth login
   # User enters credentials
   # Retry download
   ```

2. **Network Interruption:**
   ```bash
   # cademi-dl automatically resumes from last lesson
   # Re-run same download command
   ```

3. **Selection Error:**
   ```bash
   # Display module list again
   # Ask user to re-select valid module IDs
   ```

4. **Dashboard Write Error:**
   ```bash
   # Log warning, continue download without dashboard
   # Fallback to local metrics only
   ```

---

## Integration

### Feeds To

- **transcribe-media** — Downloaded videos ready for transcription
- **Transcription Dashboard** — Real-time download progress via `cademi-download-status.json`
- **organize-content** — Downloaded content ready for organization

### Depends On

- **classify-request** — Receives `course_url` and parameters from classification

### Observability

**Metrics Tracked:**
- Total courses downloaded
- Total lessons downloaded
- Total size downloaded (GB)
- Average download speed (Mbps)
- Success rate (% complete downloads)
- Most downloaded courses

**Dashboard Integration:**
- Real-time progress in Transcription Dashboard (polls `cademi-download-status.json`)
- Download history in `.synapse/metrics/media-processor-metrics.json`

---

## Flags Reference

### cademi-dl CLI Flags

| Flag | Description | Example |
|------|-------------|---------|
| `-c, --course` | Course URL (required) | `-c "https://cademi.com.br/curso/marketing"` |
| `-q, --quality` | Video quality (best, 720p, 480p) | `-q best` |
| `--all` | Download all lessons (batch mode) | `--all` |
| `--select-all` | Auto-select all modules/lessons | `--select-all` |
| `--selection` | Select specific module IDs | `--selection 1,3,5` |
| `--audio-only` | Download audio only (no video) | `--audio-only` |
| `-o, --output` | Output directory | `-o /path/to/output` |
| `--dry-run` | Simulate download (no actual download) | `--dry-run` |
| `--resume` | Resume interrupted download | `--resume` |
| `--overwrite` | Overwrite existing files | `--overwrite` |

---

## Examples

### Example 1: Full Course Download with Dashboard

**Input:**
```json
{
  "course_url": "https://cademi.com.br/curso/marketing-digital",
  "quality": "best",
  "select_all": true,
  "enable_dashboard": true
}
```

**Command:**
```bash
cd <PROJECT_ROOT>/tools/cademi-downloader
.venv/bin/cademi-dl download -c "https://cademi.com.br/curso/marketing-digital" -q best --select-all
```

**Dashboard Status (during download):**
```json
{
  "course_id": "marketing-digital",
  "course_name": "Marketing Digital Completo",
  "status": "downloading",
  "progress": {
    "total_lessons": 85,
    "downloaded": 42,
    "failed": 0,
    "current_module": "Module_03_SEO",
    "current_lesson": "Lesson_05_Link_Building.mp4"
  },
  "download_speed_mbps": 8.5,
  "eta_minutes": 25
}
```

---

### Example 2: Selective Download (Audio Only)

**Input:**
```json
{
  "course_url": "https://cademi.com.br/curso/podcast-course",
  "quality": "best",
  "audio_only": true,
  "selection": [1, 3, 5]
}
```

**Command:**
```bash
cd <PROJECT_ROOT>/tools/cademi-downloader
.venv/bin/cademi-dl download -c "https://cademi.com.br/curso/podcast-course" -q best --audio-only --selection 1,3,5
```

**Output:**
```
downloads/Podcast_Course/
├── Module_01_Introducao/
│   ├── Lesson_01.m4a
│   └── Lesson_02.m4a
├── Module_03_Edicao/
│   └── Lesson_01.m4a
├── Module_05_Distribuicao/
│   └── Lesson_01.m4a
└── DOWNLOAD-REPORT.md
```

---

### Example 3: Dry Run (Testing)

**Input:**
```json
{
  "course_url": "https://cademi.com.br/curso/test-course",
  "dry_run": true
}
```

**Command:**
```bash
cd <PROJECT_ROOT>/tools/cademi-downloader
.venv/bin/cademi-dl download -c "https://cademi.com.br/curso/test-course" --dry-run
```

**Output:**
```
[DRY RUN] Would download:
- Module 1: 8 lessons, ~400 MB
- Module 2: 12 lessons, ~600 MB
- Module 3: 10 lessons, ~500 MB
Total: 30 lessons, ~1.5 GB
```

---

## Notes

- **Authentication:** Credentials are stored securely by `cademi-dl` (not in AIOS config)
- **Resume Support:** Interrupted downloads can be resumed by re-running the same command
- **Dashboard Integration:** Dashboard polls `cademi-download-status.json` every 2 seconds for real-time updates
- **Selection Mode:** Useful for downloading specific modules instead of entire course
- **Rate Limiting:** Cademi may throttle excessive downloads; respect 60s cooldown if rate-limited
- **File Naming:** cademi-dl sanitizes file names automatically (removes special chars)

---

## References

- **cademi-dl Documentation:** `<PROJECT_ROOT>/tools/cademi-downloader/README.md`
- **Dashboard Integration:** `<PROJECT_ROOT>/tools/transcription-dashboard/README.md`
- **Authentication Guide:** `<PROJECT_ROOT>/tools/cademi-downloader/docs/auth.md`
- **Troubleshooting:** `<PROJECT_ROOT>/tools/cademi-downloader/docs/troubleshooting.md`

---

**Task Classification:** STANDARD
**Estimated Tokens:** ~5000 (download) + ~1000 (validation) + ~500 (reporting) + ~300 (dashboard)
**Success Rate:** 90% (based on network reliability and course availability)
