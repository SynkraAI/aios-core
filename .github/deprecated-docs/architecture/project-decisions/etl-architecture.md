# ETL Expansion Pack - Technical Architecture

**Version:** 1.0
**Status:** Approved for Implementation
**Last Updated:** 2025-01-14

---

## Architecture Overview

ETL Toolkit is designed as a **universal AIOS expansion pack** providing data collection capabilities to all agents through 1MCP integration. The architecture prioritizes:

- **Token Efficiency:** +10K tokens per preset (vs +50K direct integration)
- **Composability:** Atomic collectors following AIOS atomic design principles
- **Scalability:** Handles 1 video to 50+ sources in parallel
- **Cost Transparency:** Per-operation cost tracking
- **Production Quality:** 85%+ test coverage, comprehensive error handling

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      AIOS Agents Layer                          │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐         │
│  │ @analyst│  │  @docs  │  │ @architect│  │  MMOS   │  ...   │
│  └────┬────┘  └────┬────┘  └─────┬─────┘  └────┬────┘         │
│       │            │              │             │               │
│       └────────────┴──────────────┴─────────────┘               │
│                         │                                        │
│              Declares preset: "aios-research"                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      1MCP Aggregator                            │
│                                                                 │
│  Presets:                                                       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ aios-dev:      github + browser + etl-toolkit (~45K)   │   │
│  │ aios-research: context7 + browser + etl-toolkit (~60K) │   │
│  │ aios-mmos:     context7 + etl-toolkit (~55K)           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  HTTP Endpoint: http://127.0.0.1:3050/mcp?preset=aios-dev     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ MCP Protocol (stdio)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              ETL Toolkit MCP Server (Node.js)                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │ MCP Protocol Implementation                           │    │
│  │ ├─ list_tools: Returns 4 tool definitions            │    │
│  │ └─ call_tool: Bridges to Python collectors           │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  Tools Registered:                                              │
│  ├─ transcribe_video      (AssemblyAI)                         │
│  ├─ collect_web_content   (BeautifulSoup + html2text)          │
│  ├─ sample_email_archive  (mailbox + query)                    │
│  └─ process_books         (PyPDF2 + chunking)                  │
│                                                                 │
│  callPythonETL(operation, params):                              │
│  ├─ spawn('python', ['lib/bridge.py', operation, JSON])        │
│  ├─ Capture stdout/stderr                                      │
│  ├─ Parse JSON response                                        │
│  └─ Handle errors & timeouts                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ JSON-RPC via spawn
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                Python Bridge (CLI Interface)                    │
│                                                                 │
│  bridge.py:                                                     │
│  ├─ Parse sys.argv (operation, params JSON)                    │
│  ├─ Route to appropriate collector                             │
│  ├─ Execute collection                                         │
│  ├─ Serialize result to JSON                                   │
│  └─ Print to stdout (captured by Node)                         │
│                                                                 │
│  Routing:                                                       │
│  ├─ transcribe_video      → VideoTranscriber                   │
│  ├─ collect_web_content   → WebCollector                       │
│  ├─ sample_email_archive  → EmailSampler                       │
│  └─ process_books         → BookProcessor                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Instantiate & call collect()
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Data Collectors (Python)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Abstract Base Class: DataCollector                       │ │
│  │ ├─ collect(source, **kwargs) → Dict                     │ │
│  │ ├─ validate(data) → bool                                │ │
│  │ └─ metadata_schema → Dict                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │ VideoTranscriber│  │  WebCollector   │                     │
│  ├─────────────────┤  ├─────────────────┤                     │
│  │ - AssemblyAI    │  │ - BeautifulSoup │                     │
│  │ - Cost calc     │  │ - html2text     │                     │
│  │ - Validation    │  │ - Rate limiting │                     │
│  └─────────────────┘  └─────────────────┘                     │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │  EmailSampler   │  │ BookProcessor   │                     │
│  ├─────────────────┤  ├─────────────────┤                     │
│  │ - .mbox parser  │  │ - PyPDF2        │                     │
│  │ - Query filter  │  │ - EPUB support  │                     │
│  │ - PII removal   │  │ - Chunking      │                     │
│  └─────────────────┘  └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Data Transformers (Python)                    │
│                                                                 │
│  ┌────────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Chunker        │  │ Markdown      │  │ Privacy Filter   │  │
│  │ - Token-based  │  │ Converter     │  │ - Remove PII     │  │
│  │ - Overlap      │  │ - html2text   │  │ - Email/phone    │  │
│  │ - Preserve ¶   │  │ - Clean       │  │ - Credit cards   │  │
│  └────────────────┘  └───────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                             │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  AssemblyAI      │  │  Web Targets     │                    │
│  │  - Transcription │  │  - Any URL       │                    │
│  │  - Speaker labels│  │  - robots.txt    │                    │
│  │  - Timestamps    │  │  - Rate limits   │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. MCP Server (Node.js)

**File:** `expansion-packs/etl/lib/mcp_server.js`

**Responsibilities:**
- Implement MCP 1.0 protocol
- Register 4 ETL tools
- Bridge to Python collectors
- Handle errors and timeouts

**Key Functions:**

```javascript
// Tool Registration
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'transcribe_video',
        description: 'Transcribe video/audio to text with timestamps',
        inputSchema: { /* ... */ },
      },
      // ... 3 more tools
    ],
  };
});

// Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await callPythonETL(name, args);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
});

// Python Bridge
async function callPythonETL(operation, params) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      'lib/bridge.py',
      operation,
      JSON.stringify(params)
    ]);

    let stdout = '';
    python.stdout.on('data', (data) => stdout += data);
    python.on('close', (code) => {
      if (code === 0) resolve(JSON.parse(stdout));
      else reject(new Error('Python ETL failed'));
    });
  });
}
```

**Technology Stack:**
- Node.js 18+
- `@modelcontextprotocol/sdk` (MCP protocol)
- `child_process.spawn` (Python bridge)

**Error Handling:**
- Timeout after 600s (video transcription)
- Capture stderr for debugging
- Return error via MCP protocol

---

### 2. Python Bridge

**File:** `expansion-packs/etl/lib/bridge.py`

**Responsibilities:**
- Parse CLI arguments (operation, params JSON)
- Route to appropriate collector
- Execute collection
- Serialize result to JSON stdout

**Implementation:**

```python
#!/usr/bin/env python3
import sys
import json
from collectors.video_transcriber import VideoTranscriber
from collectors.web_collector import WebCollector
from collectors.email_sampler import EmailSampler
from collectors.book_processor import BookProcessor

def main():
    operation = sys.argv[1]
    params = json.loads(sys.argv[2])

    try:
        if operation == 'transcribe_video':
            collector = VideoTranscriber()
            result = collector.collect(**params)
        elif operation == 'collect_web_content':
            collector = WebCollector()
            result = collector.collect(**params)
        elif operation == 'sample_email_archive':
            collector = EmailSampler()
            result = collector.collect(**params)
        elif operation == 'process_books':
            collector = BookProcessor()
            result = collector.collect(**params)
        else:
            raise ValueError(f"Unknown operation: {operation}")

        print(json.dumps(result))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Technology Stack:**
- Python 3.11+
- JSON serialization (stdlib)
- Error handling with exit codes

---

### 3. Data Collectors

**Abstract Base Class:**

```python
# lib/collectors/base.py
from abc import ABC, abstractmethod
from typing import Dict, Any

class DataCollector(ABC):
    """Base class for all ETL collectors."""

    @abstractmethod
    def collect(self, source: str, **kwargs) -> Dict[str, Any]:
        """
        Collect raw data from source.

        Returns:
            {
                'content': str | List[str],
                'metadata': Dict,
                'cost_usd': float,
                'duration_seconds': float (optional)
            }
        """
        pass

    @abstractmethod
    def validate(self, data: Dict) -> bool:
        """Validate collected data quality."""
        pass

    @property
    @abstractmethod
    def metadata_schema(self) -> Dict:
        """Return metadata schema for this collector."""
        pass
```

#### 3.1 VideoTranscriber

**File:** `lib/collectors/video_transcriber.py`

**Implementation:**

```python
import os
import assemblyai as aai
from .base import DataCollector

class VideoTranscriber(DataCollector):
    def __init__(self):
        api_key = os.getenv('ASSEMBLYAI_API_KEY')
        if not api_key:
            raise ValueError("ASSEMBLYAI_API_KEY not set")
        aai.settings.api_key = api_key

    def collect(self, source_url: str, language: str = 'en',
                speaker_labels: bool = True) -> Dict:
        # Upload & transcribe
        transcriber = aai.Transcriber()
        config = aai.TranscriptionConfig(
            language_code=language,
            speaker_labels=speaker_labels
        )
        transcript = transcriber.transcribe(source_url, config=config)

        # Calculate cost
        duration_hours = transcript.audio_duration / 3600
        cost_usd = duration_hours * 0.67

        return {
            'transcript': transcript.text,
            'confidence': transcript.confidence,
            'speakers': [
                {'speaker': s.speaker, 'text': s.text}
                for s in transcript.utterances
            ] if speaker_labels else [],
            'timestamps': [
                {'start': w.start, 'end': w.end, 'text': w.text}
                for w in transcript.words
            ],
            'duration_seconds': transcript.audio_duration,
            'cost_usd': round(cost_usd, 4),
            'metadata': {
                'language': language,
                'audio_duration': transcript.audio_duration,
                'word_count': len(transcript.words)
            }
        }

    def validate(self, data: Dict) -> bool:
        return data.get('confidence', 0) > 0.85

    @property
    def metadata_schema(self) -> Dict:
        return {
            'language': 'string',
            'audio_duration': 'float',
            'word_count': 'int'
        }
```

**Dependencies:**
- `assemblyai` (Python SDK)
- Environment variable: `ASSEMBLYAI_API_KEY`

**Cost Model:**
- $0.67 per hour of audio
- Calculated automatically
- Returned in result metadata

**Quality Validation:**
- Confidence score >85% required
- Warns if below threshold

---

#### 3.2 WebCollector

**File:** `lib/collectors/web_collector.py`

**Implementation:**

```python
import requests
from bs4 import BeautifulSoup
import html2text
from urllib.robotparser import RobotFileParser
from .base import DataCollector

class WebCollector(DataCollector):
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'AIOS-ETL/1.0 (https://github.com/aios)'
        })
        self.html_converter = html2text.HTML2Text()
        self.html_converter.ignore_links = False

    def collect(self, url: str, max_depth: int = 1,
                selector: str = None) -> Dict:
        # Check robots.txt
        if not self._can_fetch(url):
            raise PermissionError(f"robots.txt disallows: {url}")

        # Fetch HTML
        response = self.session.get(url, timeout=10)
        response.raise_for_status()

        # Parse with BeautifulSoup
        soup = BeautifulSoup(response.content, 'lxml')

        # Extract content (with selector if provided)
        if selector:
            content_elem = soup.select_one(selector)
            if not content_elem:
                raise ValueError(f"Selector not found: {selector}")
            html_content = str(content_elem)
        else:
            html_content = str(soup)

        # Convert to markdown
        markdown = self.html_converter.handle(html_content)

        # Extract links
        links = [a['href'] for a in soup.find_all('a', href=True)]

        return {
            'content': markdown,
            'metadata': {
                'url': url,
                'title': soup.title.string if soup.title else None,
                'links_found': len(links),
                'content_length': len(markdown),
                'tokens_estimated': len(markdown.split())
            },
            'links': links[:50],  # Top 50 links
            'cost_usd': 0.0  # Free scraping
        }

    def validate(self, data: Dict) -> bool:
        content_length = data.get('metadata', {}).get('content_length', 0)
        return content_length > 100  # Minimum 100 chars

    def _can_fetch(self, url: str) -> bool:
        """Check robots.txt compliance."""
        parser = RobotFileParser()
        parser.set_url(url.split('/')[0:3].join('/') + '/robots.txt')
        try:
            parser.read()
            return parser.can_fetch('AIOS-ETL', url)
        except:
            return True  # Allow if robots.txt inaccessible

    @property
    def metadata_schema(self) -> Dict:
        return {
            'url': 'string',
            'title': 'string',
            'links_found': 'int',
            'content_length': 'int',
            'tokens_estimated': 'int'
        }
```

**Dependencies:**
- `requests` (HTTP client)
- `beautifulsoup4` + `lxml` (HTML parsing)
- `html2text` (Markdown conversion)

**Features:**
- robots.txt compliance
- CSS selector support
- Rate limiting (via session)
- Link extraction

---

#### 3.3 EmailSampler

**File:** `lib/collectors/email_sampler.py`

**Implementation:**

```python
import mailbox
import re
from typing import List, Dict
from .base import DataCollector
from transformers.privacy_filter import PrivacyFilter

class EmailSampler(DataCollector):
    def __init__(self):
        self.privacy_filter = PrivacyFilter()

    def collect(self, archive_path: str, query: str,
                max_samples: int = 100) -> Dict:
        # Open .mbox file
        mbox = mailbox.mbox(archive_path)

        # Sample emails matching query
        sampled = []
        query_lower = query.lower()

        for msg in mbox:
            # Simple keyword search
            subject = msg.get('Subject', '').lower()
            body = self._get_body(msg).lower()

            if query_lower in subject or query_lower in body:
                email_data = {
                    'sender': msg.get('From', ''),
                    'date': msg.get('Date', ''),
                    'subject': msg.get('Subject', ''),
                    'body_preview': self._get_body(msg)[:500]
                }

                # Apply privacy filter
                email_data = self.privacy_filter.filter(email_data)
                sampled.append(email_data)

                if len(sampled) >= max_samples:
                    break

        return {
            'emails': sampled,
            'sample_metadata': {
                'total_emails': len(mbox),
                'sampled_count': len(sampled),
                'query': query,
                'archive_path': archive_path
            },
            'cost_usd': 0.0
        }

    def _get_body(self, msg) -> str:
        """Extract email body."""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == 'text/plain':
                    return part.get_payload(decode=True).decode('utf-8', errors='ignore')
        else:
            return msg.get_payload(decode=True).decode('utf-8', errors='ignore')
        return ''

    def validate(self, data: Dict) -> bool:
        sampled = data.get('emails', [])
        return len(sampled) >= 10  # Minimum 10 samples

    @property
    def metadata_schema(self) -> Dict:
        return {
            'total_emails': 'int',
            'sampled_count': 'int',
            'query': 'string',
            'archive_path': 'string'
        }
```

**Dependencies:**
- `mailbox` (stdlib - .mbox parsing)
- `PrivacyFilter` (custom PII removal)

**Features:**
- Query-based sampling
- PII removal (emails, phones, SSN)
- Metadata preservation
- Body preview (500 chars)

---

#### 3.4 BookProcessor

**File:** `lib/collectors/book_processor.py`

**Implementation:**

```python
import PyPDF2
from ebooklib import epub
from transformers.chunker import chunk_by_tokens
from .base import DataCollector

class BookProcessor(DataCollector):
    def collect(self, file_path: str, chunk_size: int = 1000) -> Dict:
        # Detect format
        if file_path.endswith('.pdf'):
            text, metadata = self._process_pdf(file_path)
        elif file_path.endswith('.epub'):
            text, metadata = self._process_epub(file_path)
        else:
            raise ValueError(f"Unsupported format: {file_path}")

        # Chunk by tokens
        chunks = chunk_by_tokens(text, chunk_size=chunk_size, overlap=100)

        return {
            'chunks': chunks,
            'metadata': {
                **metadata,
                'chunk_count': len(chunks),
                'chunk_size': chunk_size,
                'total_tokens': sum(len(c.split()) for c in chunks)
            },
            'cost_usd': 0.0
        }

    def _process_pdf(self, file_path: str) -> tuple:
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ''
            for page in reader.pages:
                text += page.extract_text()

            metadata = {
                'format': 'pdf',
                'title': reader.metadata.get('/Title', 'Unknown'),
                'author': reader.metadata.get('/Author', 'Unknown'),
                'pages': len(reader.pages)
            }
        return text, metadata

    def _process_epub(self, file_path: str) -> tuple:
        book = epub.read_epub(file_path)
        text = ''
        for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
            text += item.get_content().decode('utf-8')

        metadata = {
            'format': 'epub',
            'title': book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else 'Unknown',
            'author': book.get_metadata('DC', 'creator')[0][0] if book.get_metadata('DC', 'creator') else 'Unknown'
        }
        return text, metadata

    def validate(self, data: Dict) -> bool:
        chunks = data.get('chunks', [])
        return len(chunks) > 0  # At least 1 chunk

    @property
    def metadata_schema(self) -> Dict:
        return {
            'format': 'string',
            'title': 'string',
            'author': 'string',
            'pages': 'int',
            'chunk_count': 'int',
            'total_tokens': 'int'
        }
```

**Dependencies:**
- `PyPDF2` (PDF parsing)
- `ebooklib` (EPUB parsing)
- `chunker` (token-based chunking)

**Features:**
- Multi-format support (PDF, EPUB)
- Metadata extraction
- Token-based chunking
- Overlap between chunks

---

### 4. Data Transformers

#### 4.1 Chunker

**File:** `lib/transformers/chunker.py`

```python
import tiktoken

def chunk_by_tokens(text: str, chunk_size: int = 1000,
                   overlap: int = 100) -> List[str]:
    """
    Chunk text by token count using tiktoken.

    Args:
        text: Input text
        chunk_size: Target tokens per chunk
        overlap: Overlap tokens between chunks

    Returns:
        List of text chunks
    """
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    chunks = []

    start = 0
    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
        start = end - overlap

    return chunks
```

#### 4.2 Privacy Filter

**File:** `lib/transformers/privacy_filter.py`

```python
import re

class PrivacyFilter:
    """Remove PII from text."""

    def filter(self, data: Dict) -> Dict:
        """Apply all privacy filters to data."""
        filtered = {}
        for key, value in data.items():
            if isinstance(value, str):
                filtered[key] = self._filter_text(value)
            else:
                filtered[key] = value
        return filtered

    def _filter_text(self, text: str) -> str:
        """Apply regex filters to text."""
        # Remove emails
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)
        # Remove phone numbers
        text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
        # Remove SSN
        text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]', text)
        # Remove credit cards
        text = re.sub(r'\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b', '[CARD]', text)
        return text
```

---

## 1MCP Integration

### Preset Configuration

```yaml
# ~/.1mcp/config.json
{
  "mcps": {
    "etl-toolkit": {
      "command": "node",
      "args": ["expansion-packs/etl/lib/mcp_server.js"],
      "enabled": true
    },
    "github": { /* ... */ },
    "browser": { /* ... */ },
    "context7": { /* ... */ }
  },
  "presets": {
    "aios-dev": {
      "filter": ["github", "browser", "etl-toolkit"],
      "description": "Development preset (+10K for ETL)"
    },
    "aios-research": {
      "filter": ["context7", "browser", "etl-toolkit"],
      "description": "Research preset (+10K for ETL)"
    },
    "aios-mmos": {
      "filter": ["context7", "etl-toolkit"],
      "description": "MMOS preset (no browser, +10K for ETL)"
    }
  },
  "server": {
    "port": 3050,
    "host": "127.0.0.1"
  }
}
```

### Token Budget Analysis

```
PRESET: aios-dev
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GitHub MCP:        ~18,000 tokens
Browser MCP:       ~17,000 tokens
ETL Toolkit:       ~10,000 tokens
─────────────────────────────────────────
TOTAL:             ~45,000 tokens
vs Direct ETL:     ~85,000 tokens (❌)
SAVINGS:           47% reduction ✅

PRESET: aios-research
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Context7 MCP:      ~32,000 tokens
Browser MCP:       ~17,000 tokens
ETL Toolkit:       ~10,000 tokens
─────────────────────────────────────────
TOTAL:             ~59,000 tokens
vs Direct ETL:     ~99,000 tokens (❌)
SAVINGS:           40% reduction ✅

PRESET: aios-mmos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Context7 MCP:      ~45,000 tokens
ETL Toolkit:       ~10,000 tokens
─────────────────────────────────────────
TOTAL:             ~55,000 tokens
PERFECT FIT:       MMOS-optimized ✅
```

---

## Data Flow Examples

### Example 1: Video Transcription (MMOS)

```
1. User Request:
   MMOS: "Transcribe interview at https://youtube.com/watch?v=abc123"

2. Claude Code (with aios-mmos preset):
   - Loads preset → context7 + etl-toolkit
   - Calls tool: etl:transcribe_video

3. 1MCP Aggregator:
   - Filters to aios-mmos tools
   - Routes to etl-toolkit MCP server

4. ETL MCP Server (Node.js):
   - Receives: {"name": "transcribe_video", "arguments": {"source_url": "..."}}
   - Calls: callPythonETL('transcribe_video', {source_url})

5. Python Bridge:
   - Parses: python lib/bridge.py transcribe_video '{"source_url": "..."}'
   - Routes to VideoTranscriber

6. VideoTranscriber:
   - Calls AssemblyAI API
   - Waits for transcription (1.5x real-time)
   - Calculates cost
   - Returns JSON

7. Response Flow:
   VideoTranscriber → bridge.py → mcp_server.js → 1MCP → Claude Code → User

8. Result:
   {
     "transcript": "In this interview...",
     "confidence": 0.94,
     "duration_seconds": 3600,
     "cost_usd": 0.67,
     "speakers": [{"speaker": "A", "text": "..."}, ...],
     "metadata": {...}
   }
```

### Example 2: Web Scraping (@analyst)

```
1. Agent Activation:
   @analyst with preset: aios-research

2. User Request:
   "Analyze competitor pricing at https://competitor.com/pricing"

3. Tool Call:
   etl:collect_web_content({
     url: "https://competitor.com/pricing",
     selector: ".pricing-table"
   })

4. Data Flow:
   @analyst → 1MCP (aios-research) → ETL MCP → Python Bridge → WebCollector

5. WebCollector:
   - Checks robots.txt ✅
   - Fetches HTML
   - Extracts .pricing-table
   - Converts to markdown
   - Returns instantly (no external API)

6. Result:
   {
     "content": "# Pricing\n\n## Basic: $10/mo\n...",
     "metadata": {
       "links_found": 23,
       "tokens_estimated": 450
     },
     "cost_usd": 0
   }

7. @analyst:
   - Analyzes markdown content
   - Generates competitor analysis report
```

---

## Performance Characteristics

### Latency

| Operation | Typical Latency | P95 Latency |
|-----------|----------------|-------------|
| Web scraping | 2-5s | 10s |
| Email sampling (100 emails) | 5-8s | 15s |
| Book processing (200 pages) | 10-20s | 30s |
| Video transcription (1 hour) | 90 minutes | 2 hours |

**Note:** Video transcription is 1.5x real-time (AssemblyAI SLA)

### Throughput

| Collector | Sequential | Batch (50 sources) |
|-----------|------------|-------------------|
| Web | 12/min | 600/min |
| Email | 10/min | N/A (file-based) |
| Books | 3/min | N/A (file-based) |
| Video | 0.67/hour | 50/hour (parallel) |

**Note:** Batch processing (P2) enables parallelization

### Cost

| Operation | Cost | Billing Unit |
|-----------|------|--------------|
| Video transcription | $0.67/hour | AssemblyAI |
| Web scraping | $0 | Free |
| Email sampling | $0 | Local processing |
| Book processing | $0 | Local processing |

**Total monthly cost (typical MMOS usage):**
- 10 hours video: $6.70/month
- Unlimited web/email/books: $0

---

## Security & Privacy

### API Key Management

```bash
# .env file (NEVER commit)
ASSEMBLYAI_API_KEY=your-key-here

# Load in Python
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv('ASSEMBLYAI_API_KEY')
```

### PII Removal

All email sampling automatically applies privacy filters:
- Email addresses → `[EMAIL]`
- Phone numbers → `[PHONE]`
- SSN → `[SSN]`
- Credit cards → `[CARD]`

### Rate Limiting

- Web scraping: 60 requests/minute
- AssemblyAI: 10 concurrent transcriptions (plan limit)
- robots.txt compliance enforced

---

## Testing Strategy

### Unit Tests (85%+ coverage target)

```python
tests/unit/
├── test_video_transcriber.py    # Mock AssemblyAI
├── test_web_collector.py         # Mock requests
├── test_email_sampler.py         # Use test .mbox file
├── test_book_processor.py        # Use sample PDFs
├── test_chunker.py               # Test chunking logic
├── test_privacy_filter.py        # Test PII removal
└── test_markdown_converter.py   # Test HTML→MD
```

### Integration Tests

```python
tests/integration/
├── test_mcp_server.py            # Test MCP protocol
├── test_1mcp_integration.py      # Test preset loading
└── test_python_bridge.py         # Test Node↔Python
```

### E2E Tests

```python
tests/e2e/
└── test_agent_workflows.py
    ├── test_analyst_web_scraping()
    ├── test_docs_video_transcription()
    └── test_mmos_full_pipeline()
```

---

## Monitoring & Observability

### Cost Tracking

Every operation returns:
```json
{
  "result": {...},
  "cost_usd": 0.67,
  "duration_seconds": 3600
}
```

### Performance Metrics

P2 feature (Week 3):
- Prometheus-compatible metrics
- Per-tool success rates
- Average duration
- Token usage per preset

---

## Deployment Architecture

### Development

```bash
# Local development
cd expansion-packs/etl
npm install
pip install -r requirements.txt

# Register in 1MCP
1mcp mcp add etl-toolkit -- node $(pwd)/lib/mcp_server.js

# Start 1MCP server
1mcp serve --port 3050
```

### Production

```bash
# PM2 deployment (Linux/macOS)
pm2 start 1mcp --name "1mcp-server" -- serve --port 3050

# Windows Service (future)
# See: docs/deployment/windows-service.md
```

---

## Future Enhancements (v2.0)

### Additional Collectors
- Twitter/X API integration
- LinkedIn scraping
- Podcast RSS feeds
- GitHub repository analysis

### Advanced Features
- Real-time streaming transcription
- Multi-language support (50+ languages)
- Speaker diarization improvements
- Sentiment analysis integration

### Performance
- Redis caching backend
- Distributed processing
- GPU acceleration for local transcription

---

**Version:** 1.0
**Status:** ✅ Approved for Implementation
**Last Review:** 2025-01-14 (Roundtable Session 3)
**Next Review:** Post-v1.0 release
