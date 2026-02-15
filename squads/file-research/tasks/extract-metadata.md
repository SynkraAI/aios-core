# Task: Extract Metadata

**ID:** extract-metadata
**Agent:** file-hunter
**Category:** Analysis
**Complexity:** Low
**Duration:** 5-10 minutes

## Description

Extract comprehensive metadata from a list of file URLs without downloading the files.

## When to Use

- User provides raw list of file URLs
- Need metadata before adding to catalog
- Enriching existing file lists
- Quality assessment of file sources

## Inputs

**Required:**
- `url_list` - List of file URLs (array or newline-separated string)

**Optional:**
- `--format {csv|json|markdown}` - Output format (default: markdown)
- `--deep` - Enable deep metadata extraction (slower, more details)

## Outputs

**File:** `metadata-report.{format}` in current directory

**Content:**
- File URL
- Title (from page or filename)
- File format (PDF, EPUB, etc.)
- File size (if available)
- Source domain and credibility
- Page title and description
- Author/publisher (if available)
- Publication date (if available)
- Additional metadata (depends on source)

## Workflow Steps

### Step 1: Parse URL List

**Actions:**
1. Accept URLs as array or newline-separated string
2. Clean URLs (trim whitespace, validate format)
3. Deduplicate URLs
4. Categorize by source domain

**Output:**
```json
{
  "total_urls": 15,
  "unique_urls": 12,
  "domains": {
    "arxiv.org": 5,
    "github.com": 3,
    "academia.edu": 2,
    "other": 2
  }
}
```

### Step 2: Extract Metadata (Standard Mode)

**Actions:**

For EACH URL:

1. **Fetch page headers (HEAD request):**
   ```javascript
   headers = HEAD_REQUEST(url)

   metadata.format = detect_format_from_headers(headers)
   metadata.size = headers['content-length'] || "Unknown"
   metadata.content_type = headers['content-type']
   metadata.last_modified = headers['last-modified'] || "Unknown"
   ```

2. **Fetch page content (if not direct file link):**
   ```javascript
   if (!is_direct_file_link(url)) {
     page = WebFetch(url, prompt="Extract: title, author, description, file size, download link")

     metadata.title = extract_title(page)
     metadata.author = extract_author(page)
     metadata.description = extract_description(page)
     metadata.download_link = extract_download_link(page)
   } else {
     metadata.title = filename_from_url(url)
     metadata.download_link = url
   }
   ```

3. **Determine file format:**
   ```javascript
   // Priority: content-type > file extension > page metadata
   if (content_type.includes('pdf')) {
     format = 'PDF'
   } else if (url.endsWith('.epub')) {
     format = 'EPUB'
   } else if (page.metadata.includes('format')) {
     format = extract_format_from_page(page)
   } else {
     format = 'Unknown'
   }
   ```

4. **Assess source credibility:**
   ```javascript
   credibility = assess_credibility(domain)

   // HIGH credibility domains
   high_credibility = ['arxiv.org', 'github.com', 'scholar.google.com',
                       'ieee.org', 'acm.org', 'springer.com']

   // MEDIUM credibility domains
   medium_credibility = ['academia.edu', 'researchgate.net', 'medium.com',
                         'dev.to', 'substack.com']

   // LOW credibility (default)
   if (domain in high_credibility) {
     credibility = 'HIGH'
   } else if (domain in medium_credibility) {
     credibility = 'MEDIUM'
   } else {
     credibility = 'LOW'
   }
   ```

**Output per URL:**
```json
{
  "url": "https://arxiv.org/pdf/2401.12345.pdf",
  "title": "Attention Is All You Need",
  "format": "PDF",
  "size": "2.3 MB",
  "source": "arxiv.org",
  "credibility": "HIGH",
  "author": "Vaswani et al.",
  "date": "2024-01-15",
  "description": "Transformer architecture paper...",
  "download_link": "https://arxiv.org/pdf/2401.12345.pdf",
  "metadata_quality": "COMPLETE"
}
```

### Step 3: Extract Metadata (Deep Mode - if --deep flag)

**Actions:**

Additional extraction for each URL:

1. **Academic metadata (for papers):**
   ```javascript
   if (domain in academic_domains) {
     metadata.citations = extract_citation_count(page)
     metadata.doi = extract_doi(page)
     metadata.abstract = extract_abstract(page)
     metadata.keywords = extract_keywords(page)
     metadata.conference = extract_venue(page)
   }
   ```

2. **Ebook metadata:**
   ```javascript
   if (format in ['EPUB', 'MOBI', 'AZW3']) {
     metadata.isbn = extract_isbn(page)
     metadata.publisher = extract_publisher(page)
     metadata.edition = extract_edition(page)
     metadata.language = extract_language(page)
   }
   ```

3. **GitHub/Code metadata:**
   ```javascript
   if (domain === 'github.com') {
     metadata.stars = extract_stars(page)
     metadata.language = extract_primary_language(page)
     metadata.license = extract_license(page)
     metadata.last_commit = extract_last_commit_date(page)
   }
   ```

**Output (deep mode adds extra fields):**
```json
{
  "url": "...",
  "title": "...",
  // ... standard fields ...
  "deep_metadata": {
    "citations": 1250,
    "doi": "10.1000/xyz123",
    "abstract": "This paper presents...",
    "keywords": ["transformer", "attention", "NLP"]
  }
}
```

### Step 4: Generate Report

**Actions:**

Create report in requested format:

**Markdown (default):**
```markdown
# Metadata Extraction Report

**Date:** {YYYY-MM-DD HH:MM}
**URLs Processed:** {total_urls}
**Successful:** {success_count}
**Failed:** {fail_count}

## Summary

### By Format
- PDF: {count}
- EPUB: {count}
- Other: {count}

### By Credibility
- HIGH: {count}
- MEDIUM: {count}
- LOW: {count}

## Extracted Metadata

### HIGH Credibility Sources ({count})

| Title | Format | Size | Source | Author | Date | Link |
|-------|--------|------|--------|--------|------|------|
| Paper X | PDF | 2.3 MB | arxiv.org | Smith et al. | 2024-01 | [Download](url) |

### MEDIUM Credibility Sources ({count})

| Title | Format | Size | Source | Link |
|-------|--------|------|--------|------|
| ... | ... | ... | ... | ... |

### LOW Credibility Sources ({count})

| Title | Format | Size | Source | Link |
|-------|--------|------|--------|------|
| ... | ... | ... | ... | ... |

## Failed Extractions ({count})

| URL | Error | Recommendation |
|-----|-------|----------------|
| ... | 404 Not Found | Remove from list |
```

**JSON:**
```json
{
  "report": {
    "date": "2026-02-14T12:00:00Z",
    "urls_processed": 12,
    "successful": 10,
    "failed": 2
  },
  "summary": {
    "by_format": {
      "PDF": 7,
      "EPUB": 3
    },
    "by_credibility": {
      "HIGH": 6,
      "MEDIUM": 3,
      "LOW": 1
    }
  },
  "metadata": [
    {
      "url": "...",
      "title": "...",
      ...
    }
  ],
  "failed": [
    {
      "url": "...",
      "error": "404 Not Found"
    }
  ]
}
```

**CSV:**
```csv
URL,Title,Format,Size,Source,Credibility,Author,Date,Download Link
https://...,Paper X,PDF,2.3 MB,arxiv.org,HIGH,Smith et al.,2024-01,https://...
```

## Error Handling

### URL Not Accessible
```
Log:
"Failed to access: {url}"
"Error: {error_message}"
"Adding to failed list"
```

### Partial Metadata
```
Log:
"Partial metadata extracted for: {url}"
"Missing fields: {fields}"
"Metadata quality: PARTIAL"
```

### Format Detection Failed
```
Fallback:
format = "Unknown"
warning = "Could not determine file format"
```

### Rate Limiting
```
If rate limited:
- Add delay between requests (1s)
- Batch process in groups of 10
- Log progress: "Processed {N}/{total}"
```

## Validation Checklist

- [ ] All URLs parsed and validated
- [ ] Metadata extracted for each URL
- [ ] File format determined
- [ ] File size extracted (when available)
- [ ] Source credibility assessed
- [ ] Report generated in requested format
- [ ] Failed extractions logged with errors
- [ ] Summary statistics calculated

## Example Execution

```bash
# User provides URL list
*extract-metadata "
https://arxiv.org/pdf/2401.12345.pdf
https://github.com/user/repo/docs/guide.pdf
https://example.com/ebook.epub
"

# Parse URLs
Found 3 URLs

# Extract metadata
✅ URL 1: Complete metadata (arxiv.org)
✅ URL 2: Complete metadata (github.com)
✅ URL 3: Partial metadata (example.com)

# Generate report
Format: Markdown
Saved to: metadata-report.md

# Summary
3 URLs processed
3 successful
0 failed

Formats: PDF (2), EPUB (1)
Credibility: HIGH (2), MEDIUM (1)

✅ Metadata extraction complete!
```

## Usage Examples

### Basic Extraction
```bash
*extract-metadata "url1\nurl2\nurl3"
```

### JSON Output
```bash
*extract-metadata "url1\nurl2" --format json
```

### Deep Metadata
```bash
*extract-metadata "url1\nurl2" --deep
```

### From File
```bash
# User provides file path instead
*extract-metadata urls.txt
```

## Credibility Assessment Rules

### HIGH Credibility Domains
- `arxiv.org` - Academic preprints
- `ieee.org` - IEEE publications
- `acm.org` - ACM publications
- `springer.com` - Springer journals
- `github.com` - Open source repositories
- `scholar.google.com` - Google Scholar
- University domains (`.edu`)
- Government domains (`.gov`)

### MEDIUM Credibility Domains
- `academia.edu` - Academia platform
- `researchgate.net` - Research network
- `medium.com` - Blogging platform
- `dev.to` - Developer community
- `substack.com` - Newsletter platform
- Company blogs (`.com/blog`)

### LOW Credibility (Default)
- Unknown domains
- File sharing sites
- Anonymous sources
- Suspicious domains

## Dependencies

**Tasks:** None

**Tools:**
- WebFetch (for page content)
- WebSearch (for missing metadata)

## Version

**v1.0.0** - Initial implementation (2026-02-14)

---

**Created by:** aios-master
**Status:** ⚠️ Pending validation
