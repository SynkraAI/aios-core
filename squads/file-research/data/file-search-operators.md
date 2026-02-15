# File Search Operators

**Squad:** file-research
**Version:** 1.0.0
**Purpose:** Specialized search operators for finding files on the internet

## Overview

This reference guide contains search operators optimized for discovering files across different formats, sources, and domains.

## Core Operators

### File Type Operators

**Syntax:** `filetype:{extension}`

**Common Extensions:**

| Format | Operator | Example |
|--------|----------|---------|
| PDF | `filetype:pdf` | `machine learning filetype:pdf` |
| EPUB | `filetype:epub` | `UX design book filetype:epub` |
| MOBI | `filetype:mobi` | `python guide filetype:mobi` |
| DOC/DOCX | `filetype:doc` or `filetype:docx` | `project template filetype:docx` |
| TXT | `filetype:txt` | `configuration example filetype:txt` |
| HTML | `filetype:html` | `documentation filetype:html` |

**Usage Tips:**
- Always use lowercase extensions
- Combine with other operators for precision
- Some search engines prefer `ext:` instead of `filetype:`

### Site Restriction Operators

**Syntax:** `site:{domain}`

**Academic Sources:**

| Domain | Type | Example |
|--------|------|---------|
| `site:arxiv.org` | Preprints | `attention mechanism site:arxiv.org filetype:pdf` |
| `site:scholar.google.com` | Papers | `deep learning site:scholar.google.com` |
| `site:ieee.org` | IEEE | `neural networks site:ieee.org filetype:pdf` |
| `site:acm.org` | ACM | `algorithms site:acm.org` |
| `site:springer.com` | Springer | `computer vision site:springer.com` |
| `site:jstor.org` | JSTOR | `history research site:jstor.org` |
| `site:researchgate.net` | Research Network | `quantum computing site:researchgate.net` |
| `site:academia.edu` | Academia | `sociology study site:academia.edu` |

**Technical Sources:**

| Domain | Type | Example |
|--------|------|---------|
| `site:github.com` | Code & Docs | `React hooks guide site:github.com filetype:md` |
| `site:dev.to` | Dev Community | `typescript tutorial site:dev.to` |
| `site:medium.com` | Tech Blogs | `API design site:medium.com` |
| `site:stackoverflow.com` | Q&A | `python async site:stackoverflow.com` |

**Ebook Sources:**

| Domain | Type | Example |
|--------|------|---------|
| `site:gutenberg.org` | Public Domain | `classic literature site:gutenberg.org filetype:epub` |
| `site:archive.org` | Internet Archive | `vintage computing site:archive.org filetype:pdf` |
| `site:standardebooks.org` | Standard Ebooks | `fiction site:standardebooks.org filetype:epub` |

**University Sources:**

| Pattern | Example |
|---------|---------|
| `site:.edu` | `machine learning site:.edu filetype:pdf` |
| `site:{university}.edu` | `neural networks site:stanford.edu filetype:pdf` |

**Government Sources:**

| Pattern | Example |
|---------|---------|
| `site:.gov` | `climate data site:.gov filetype:pdf` |

### Title Operators

**Syntax:** `intitle:{term}` or `allintitle:{terms}`

**Examples:**

| Operator | Query | Purpose |
|----------|-------|---------|
| `intitle:pdf` | `machine learning intitle:pdf` | Find pages with "pdf" in title |
| `intitle:"research paper"` | `AI intitle:"research paper" filetype:pdf` | Find research papers |
| `allintitle:free ebook` | `python allintitle:free ebook` | All terms in title |

### URL Operators

**Syntax:** `inurl:{term}` or `allinurl:{terms}`

**Examples:**

| Operator | Query | Purpose |
|----------|-------|---------|
| `inurl:pdf` | `react hooks inurl:pdf` | PDF in URL path |
| `inurl:download` | `ebook inurl:download filetype:epub` | Download pages |
| `inurl:docs` | `API reference inurl:docs` | Documentation |

### Exact Match Operators

**Syntax:** `"exact phrase"`

**Examples:**

| Query | Purpose |
|-------|---------|
| `"transformer architecture" filetype:pdf` | Exact phrase in PDF |
| `"beginner's guide" filetype:epub` | Exact title match |

### Exclusion Operators

**Syntax:** `-term` or `-site:{domain}`

**Examples:**

| Query | Purpose |
|-------|---------|
| `python tutorial -site:youtube.com filetype:pdf` | Exclude YouTube |
| `machine learning -beginner filetype:pdf` | Exclude beginner content |
| `ebook -buy -purchase filetype:epub` | Exclude commercial pages |

### Wildcard Operators

**Syntax:** `*` (matches any word)

**Examples:**

| Query | Purpose |
|-------|---------|
| `"introduction to *" filetype:pdf` | Introduction to anything |
| `"* programming guide" filetype:pdf` | Any language guide |

## Advanced Combinations

### Academic Papers

```
"{topic}" site:arxiv.org filetype:pdf
"{topic}" (site:ieee.org OR site:acm.org) filetype:pdf
"{topic}" intitle:"research paper" site:.edu filetype:pdf
```

**Example:**
```
"attention mechanism" site:arxiv.org filetype:pdf
"deep learning" (site:ieee.org OR site:acm.org) filetype:pdf
"neural networks" intitle:"survey" site:.edu filetype:pdf
```

### Recent Papers

```
"{topic}" filetype:pdf 2024
"{topic}" filetype:pdf after:2024-01-01
"{topic}" site:arxiv.org filetype:pdf 2024..2025
```

**Example:**
```
"transformer models" filetype:pdf 2024
"reinforcement learning" filetype:pdf after:2024-01-01
```

### Free Ebooks

```
"{topic}" filetype:epub free -buy -purchase
"{topic}" site:gutenberg.org OR site:archive.org filetype:epub
"{topic}" inurl:free inurl:download filetype:epub
```

**Example:**
```
"Python programming" filetype:epub free -buy -purchase
"classic fiction" site:gutenberg.org OR site:archive.org filetype:epub
```

### Technical Documentation

```
"{library}" documentation filetype:pdf site:github.com
"{framework}" guide filetype:pdf -tutorial
"{API}" reference site:.io filetype:pdf
```

**Example:**
```
"React" documentation filetype:pdf site:github.com
"Django" guide filetype:pdf -tutorial
"Stripe API" reference site:stripe.com filetype:pdf
```

### Books & Guides

```
"{topic}" "beginner's guide" OR "complete guide" filetype:pdf
"{topic}" handbook OR manual filetype:pdf site:.edu
"{topic}" textbook filetype:pdf -buy
```

**Example:**
```
"JavaScript" "beginner's guide" OR "complete guide" filetype:pdf
"Data Science" handbook OR manual filetype:pdf site:.edu
"Linear Algebra" textbook filetype:pdf -buy
```

### Cheat Sheets

```
"{topic}" cheat sheet filetype:pdf
"{topic}" quick reference filetype:pdf
"{topic}" commands filetype:pdf
```

**Example:**
```
"Git" cheat sheet filetype:pdf
"SQL" quick reference filetype:pdf
"Linux" commands filetype:pdf
```

## Domain-Specific Patterns

### Computer Science

```
# Algorithms
"algorithm analysis" site:cs.*.edu filetype:pdf
"data structures" intitle:"lecture notes" filetype:pdf

# AI/ML
"machine learning" site:arxiv.org filetype:pdf 2024
"deep learning" (site:papers.nips.cc OR site:arxiv.org) filetype:pdf

# Systems
"operating systems" intitle:"tutorial" OR intitle:"guide" filetype:pdf
"distributed systems" site:.edu filetype:pdf
```

### Science & Engineering

```
# Physics
"quantum mechanics" site:arxiv.org filetype:pdf
"thermodynamics" site:.edu filetype:pdf

# Biology
"molecular biology" site:pubmed.gov OR site:.edu filetype:pdf
"genetics" intitle:"research" filetype:pdf

# Engineering
"mechanical engineering" handbook filetype:pdf
"electrical circuits" tutorial filetype:pdf
```

### Business & Finance

```
# Business
"business strategy" filetype:pdf -buy
"marketing plan" template filetype:pdf OR filetype:docx
"financial modeling" guide filetype:pdf site:.edu

# Finance
"investment analysis" filetype:pdf site:.edu
"financial statements" tutorial filetype:pdf
```

### Design & Creative

```
# Design
"UX design" principles filetype:pdf
"typography" guide filetype:pdf site:.edu
"color theory" handbook filetype:pdf

# Photography
"photography" tutorial filetype:pdf
"Photoshop" guide filetype:pdf site:adobe.com
```

## Search Engine Specific Operators

### Google

- `filetype:` - File type filter
- `site:` - Site restriction
- `intitle:` / `allintitle:` - Title search
- `inurl:` / `allinurl:` - URL search
- `-` - Exclusion
- `"exact match"` - Phrase search
- `OR` - Boolean OR (must be uppercase)
- `*` - Wildcard
- `..` - Number range (e.g., `2020..2024`)
- `after:` / `before:` - Date filters

### Bing

- `filetype:` - File type filter
- `site:` - Site restriction
- `intitle:` - Title search
- `inurl:` - URL search
- `-` - Exclusion
- `"exact match"` - Phrase search
- `OR` - Boolean OR
- `contains:` - File contains term

### DuckDuckGo

- `filetype:` - File type filter
- `site:` - Site restriction
- `intitle:` - Title search
- `-` - Exclusion
- `"exact match"` - Phrase search

## MCP-Specific Strategies

### Exa MCP

**Optimized for semantic search:**

```
# Use natural language
"Find recent research papers on transformer architectures"

# Specify file types
"Deep learning PDFs from arxiv in 2024"

# Domain-specific
"React hooks tutorials from GitHub with code examples"
```

### Apify MCP

**Use specialized actors:**

- `google-search-scraper` - For file discovery via Google
- `pdf-scraper` - For extracting PDF metadata
- `arxiv-scraper` - For academic papers

## Best Practices

### Query Construction

1. **Start broad, then narrow:**
   ```
   "machine learning"                          # Too broad
   "machine learning" filetype:pdf             # Better
   "machine learning" filetype:pdf site:arxiv.org 2024  # Best
   ```

2. **Combine multiple operators:**
   ```
   "{topic}" filetype:pdf (site:A OR site:B OR site:C)
   ```

3. **Use exclusions to filter noise:**
   ```
   "python tutorial" filetype:pdf -buy -course -$
   ```

### Quality Signals

Include these terms for higher quality:

- `intitle:"research"` - Academic papers
- `intitle:"survey"` - Comprehensive overviews
- `intitle:"guide"` OR `intitle:"handbook"` - Detailed guides
- `site:.edu` - Educational institutions
- `2024` OR `2025` - Recent content

### Avoiding Low Quality

Exclude these terms:

- `-buy` - Remove commercial pages
- `-course` - Remove course promotions
- `-signup` - Remove signup walls
- `-advertisement` - Remove ads

## Operator Cheat Sheet

**Quick Reference:**

```
# Core operators
filetype:pdf               # PDF files
site:domain.com            # Specific site
intitle:"term"             # Term in title
inurl:term                 # Term in URL
"exact phrase"             # Exact match
-exclude                   # Exclude term
term1 OR term2             # Boolean OR
*                          # Wildcard
2020..2024                 # Year range

# Combinations
filetype:pdf site:arxiv.org "machine learning" 2024
"Python" (filetype:pdf OR filetype:epub) site:.edu -buy
intitle:"guide" filetype:pdf site:github.com
```

## Testing Operators

**Before using in production queries:**

1. **Test individually:**
   ```
   filetype:pdf               # Test file type
   site:arxiv.org             # Test site
   "machine learning"         # Test phrase
   ```

2. **Combine incrementally:**
   ```
   filetype:pdf "machine learning"
   filetype:pdf "machine learning" site:arxiv.org
   filetype:pdf "machine learning" site:arxiv.org 2024
   ```

3. **Verify results match intent**

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `filetype:PDF` (uppercase) | Use lowercase: `filetype:pdf` |
| `site: arxiv.org` (space) | Remove space: `site:arxiv.org` |
| `or` (lowercase) | Use uppercase: `OR` |
| `file type:pdf` (space) | Remove space: `filetype:pdf` |
| Forgetting quotes | Use `"exact phrase"` for multi-word terms |

## Version History

- **v1.0.0** (2026-02-14) - Initial release

---

**Created by:** aios-master
**Status:** ⚠️ Pending validation
**Last Updated:** 2026-02-14
