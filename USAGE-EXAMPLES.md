# Copywriting/Marketing Tools - Usage Examples

Este guia fornece exemplos práticos de uso para todas as ferramentas descobertas na pesquisa.

---

## 🚀 Quick Start Examples

### 1. SEO Analysis with seo-analyzer

```bash
# Install
npm install -g seo-analyzer

# Analyze a URL
seo-analyzer https://competitor.com

# Analyze local HTML file
seo-analyzer ./landing-page.html

# Get JSON output
seo-analyzer https://competitor.com --output-json > seo-report.json
```

### 2. Readability Scoring with textstat (Python)

```python
import textstat

content = """
Your marketing copy goes here. This tool will analyze
the readability and provide scores based on multiple formulas.
"""

# Flesch Reading Ease (higher = easier to read)
flesch_score = textstat.flesch_reading_ease(content)
print(f"Flesch Reading Ease: {flesch_score}")

# Flesch-Kincaid Grade Level
grade_level = textstat.flesch_kincaid_grade(content)
print(f"Grade Level: {grade_level}")

# Gunning Fog Index
fog_index = textstat.gunning_fog(content)
print(f"Gunning Fog: {fog_index}")

# SMOG Index
smog = textstat.smog_index(content)
print(f"SMOG Index: {smog}")
```

### 3. Web Scraping with Cheerio (Node.js)

```javascript
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeCompetitor(url) {
  try {
    // Fetch the HTML
    const { data } = await axios.get(url);

    // Load HTML into Cheerio
    const $ = cheerio.load(data);

    // Extract data
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content');
    const h1 = $('h1').text();

    // Extract all pricing
    const prices = [];
    $('.price').each((i, elem) => {
      prices.push($(elem).text().trim());
    });

    return {
      title,
      metaDescription,
      h1,
      prices
    };
  } catch (error) {
    console.error('Scraping failed:', error);
  }
}

// Usage
scrapeCompetitor('https://competitor.com/pricing')
  .then(data => console.log(data));
```

---

## 🎯 Advanced Examples

### 4. Sentiment Analysis with Amazon Comprehend

```python
import boto3
import json

# Initialize client
comprehend = boto3.client('comprehend', region_name='us-east-1')

def analyze_sentiment(text):
    """Analyze sentiment of marketing copy"""
    response = comprehend.detect_sentiment(
        Text=text,
        LanguageCode='en'
    )
    return response

def analyze_entities(text):
    """Extract entities (brands, products, etc.)"""
    response = comprehend.detect_entities(
        Text=text,
        LanguageCode='en'
    )
    return response['Entities']

def analyze_key_phrases(text):
    """Extract key phrases for SEO"""
    response = comprehend.detect_key_phrases(
        Text=text,
        LanguageCode='en'
    )
    return response['KeyPhrases']

# Usage example
marketing_copy = """
Introducing our revolutionary new product!
Experience the best customer service in the industry.
Join thousands of satisfied customers today.
"""

sentiment = analyze_sentiment(marketing_copy)
print(f"Sentiment: {sentiment['Sentiment']}")
print(f"Confidence: {sentiment['SentimentScore']}")

entities = analyze_entities(marketing_copy)
for entity in entities:
    print(f"Entity: {entity['Text']} ({entity['Type']})")

key_phrases = analyze_key_phrases(marketing_copy)
for phrase in key_phrases:
    print(f"Key Phrase: {phrase['Text']} (score: {phrase['Score']})")
```

### 5. Industrial Web Scraping with Scrapy

```python
# Create a new Scrapy project
# scrapy startproject competitor_monitor

# spider: competitor_monitor/spiders/competitor_spider.py
import scrapy
from datetime import datetime

class CompetitorSpider(scrapy.Spider):
    name = 'competitor'
    allowed_domains = ['competitor.com']
    start_urls = [
        'https://competitor.com/blog',
        'https://competitor.com/products',
    ]

    def parse(self, response):
        # Extract blog posts
        for article in response.css('article.post'):
            yield {
                'title': article.css('h2.title::text').get(),
                'excerpt': article.css('p.excerpt::text').get(),
                'date': article.css('time::attr(datetime)').get(),
                'url': article.css('a::attr(href)').get(),
                'scraped_at': datetime.now().isoformat()
            }

        # Follow pagination
        next_page = response.css('a.next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)

# Run spider
# scrapy crawl competitor -o competitor_data.json
```

### 6. Advanced NLP with spaCy

```python
import spacy

# Load model
nlp = spacy.load("en_core_web_sm")

def analyze_content(text):
    """Comprehensive content analysis"""
    doc = nlp(text)

    # Extract entities
    entities = [(ent.text, ent.label_) for ent in doc.ents]

    # Extract keywords (nouns and proper nouns)
    keywords = [token.text for token in doc
                if token.pos_ in ['NOUN', 'PROPN']
                and not token.is_stop]

    # Analyze sentence structure
    sentences = [sent.text for sent in doc.sents]

    # Get part-of-speech tags
    pos_tags = [(token.text, token.pos_) for token in doc]

    return {
        'entities': entities,
        'keywords': keywords,
        'sentences': sentences,
        'pos_tags': pos_tags,
        'sentence_count': len(sentences),
        'word_count': len([t for t in doc if not t.is_punct])
    }

# Usage
competitor_content = """
Tesla announced their new Model Y today.
The electric vehicle features autopilot and costs $45,000.
Elon Musk said this is their most affordable SUV yet.
"""

analysis = analyze_content(competitor_content)
print("Entities found:", analysis['entities'])
print("Keywords:", set(analysis['keywords']))
```

### 7. Dynamic Scraping with Puppeteer

```javascript
const puppeteer = require('puppeteer');

async function scrapeCompetitorPricing() {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();

  // Navigate to page
  await page.goto('https://competitor.com/pricing', {
    waitUntil: 'networkidle2'
  });

  // Wait for JavaScript to render
  await page.waitForSelector('.pricing-table');

  // Extract data
  const pricingData = await page.evaluate(() => {
    const plans = [];
    document.querySelectorAll('.pricing-plan').forEach(plan => {
      plans.push({
        name: plan.querySelector('.plan-name')?.innerText,
        price: plan.querySelector('.plan-price')?.innerText,
        features: Array.from(plan.querySelectorAll('.feature'))
          .map(f => f.innerText)
      });
    });
    return plans;
  });

  // Take screenshot
  await page.screenshot({
    path: 'competitor-pricing.png',
    fullPage: true
  });

  await browser.close();

  return pricingData;
}

// Usage
scrapeCompetitorPricing()
  .then(data => console.log(JSON.stringify(data, null, 2)));
```

---

## 🤖 AIOS Integration Examples

### 8. Create AIOS Skill: SEO Analyzer

```javascript
// .aios/skills/seo-analyzer/index.js
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
  name: 'seo-analyzer',
  description: 'Analyze SEO of URLs or local files',

  async execute(args) {
    const target = args.url || args.file;

    if (!target) {
      throw new Error('Please provide --url or --file parameter');
    }

    try {
      const { stdout, stderr } = await execPromise(
        `seo-analyzer ${target}`
      );

      return {
        success: true,
        output: stdout,
        errors: stderr
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Usage in AIOS
// aios-core skill:run seo-analyzer --url https://example.com
```

### 9. Create AIOS Skill: Content Analyzer

```python
# .aios/skills/content-analyzer/analyzer.py
import spacy
import textstat
from textblob import TextBlob

class ContentAnalyzer:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def analyze(self, text):
        """Comprehensive content analysis"""
        doc = self.nlp(text)
        blob = TextBlob(text)

        return {
            'readability': {
                'flesch_score': textstat.flesch_reading_ease(text),
                'grade_level': textstat.flesch_kincaid_grade(text),
                'difficult_words': textstat.difficult_words(text)
            },
            'sentiment': {
                'polarity': blob.sentiment.polarity,
                'subjectivity': blob.sentiment.subjectivity
            },
            'entities': [(e.text, e.label_) for e in doc.ents],
            'keywords': list(set([
                token.text.lower() for token in doc
                if token.pos_ in ['NOUN', 'PROPN']
                and not token.is_stop
            ])),
            'statistics': {
                'word_count': len([t for t in doc if not t.is_punct]),
                'sentence_count': len(list(doc.sents)),
                'avg_sentence_length': len([t for t in doc]) / len(list(doc.sents))
            }
        }

# Usage
if __name__ == '__main__':
    import sys
    analyzer = ContentAnalyzer()

    with open(sys.argv[1], 'r') as f:
        content = f.read()

    result = analyzer.analyze(content)
    print(json.dumps(result, indent=2))
```

### 10. Competitor Monitoring Workflow

```javascript
// .aios/workflows/competitor-monitoring.js
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs').promises;

class CompetitorMonitor {
  constructor(competitors) {
    this.competitors = competitors;
  }

  async monitorAll() {
    const results = [];

    for (const competitor of this.competitors) {
      console.log(`Monitoring ${competitor.name}...`);

      const data = await this.scrapeCompetitor(competitor);
      results.push({
        name: competitor.name,
        url: competitor.url,
        timestamp: new Date().toISOString(),
        data
      });
    }

    // Save results
    await fs.writeFile(
      'competitor-data.json',
      JSON.stringify(results, null, 2)
    );

    // Check for changes
    const changes = await this.detectChanges(results);

    if (changes.length > 0) {
      console.log('Changes detected:', changes);
      // Send alert (email, Slack, etc.)
    }

    return results;
  }

  async scrapeCompetitor(competitor) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(competitor.url, { waitUntil: 'networkidle2' });

    const content = await page.content();
    const $ = cheerio.load(content);

    const data = {
      title: $('title').text(),
      meta_description: $('meta[name="description"]').attr('content'),
      headings: $('h1, h2, h3').map((i, el) => $(el).text()).get(),
      pricing: competitor.pricingSelector ?
        $(competitor.pricingSelector).text() : null
    };

    await browser.close();
    return data;
  }

  async detectChanges(currentData) {
    // Load previous data
    let previousData = [];
    try {
      const prev = await fs.readFile('competitor-data.json', 'utf8');
      previousData = JSON.parse(prev);
    } catch (error) {
      return []; // No previous data
    }

    const changes = [];

    currentData.forEach(current => {
      const previous = previousData.find(p => p.name === current.name);

      if (!previous) return;

      // Check for pricing changes
      if (current.data.pricing !== previous.data.pricing) {
        changes.push({
          competitor: current.name,
          type: 'pricing',
          old: previous.data.pricing,
          new: current.data.pricing
        });
      }

      // Check for title changes
      if (current.data.title !== previous.data.title) {
        changes.push({
          competitor: current.name,
          type: 'title',
          old: previous.data.title,
          new: current.data.title
        });
      }
    });

    return changes;
  }
}

// Configuration
const competitors = [
  {
    name: 'Competitor A',
    url: 'https://competitora.com',
    pricingSelector: '.pricing-value'
  },
  {
    name: 'Competitor B',
    url: 'https://competitorb.com',
    pricingSelector: '.price'
  }
];

// Run monitoring
const monitor = new CompetitorMonitor(competitors);
monitor.monitorAll()
  .then(results => console.log('Monitoring complete'))
  .catch(error => console.error('Error:', error));

// Schedule with cron: 0 9 * * * (daily at 9am)
```

---

## 📊 Integration with Cloud APIs

### 11. Google Cloud NLP Integration

```python
from google.cloud import language_v1

def analyze_with_google_nlp(text):
    """Analyze text using Google Cloud Natural Language API"""
    client = language_v1.LanguageServiceClient()

    document = language_v1.Document(
        content=text,
        type_=language_v1.Document.Type.PLAIN_TEXT
    )

    # Sentiment analysis
    sentiment = client.analyze_sentiment(
        request={'document': document}
    ).document_sentiment

    # Entity analysis
    entities_response = client.analyze_entities(
        request={'document': document}
    )

    # Syntax analysis
    syntax_response = client.analyze_syntax(
        request={'document': document}
    )

    return {
        'sentiment': {
            'score': sentiment.score,
            'magnitude': sentiment.magnitude
        },
        'entities': [
            {
                'name': entity.name,
                'type': language_v1.Entity.Type(entity.type_).name,
                'salience': entity.salience
            }
            for entity in entities_response.entities
        ],
        'tokens': [
            {
                'text': token.text.content,
                'pos': language_v1.PartOfSpeech.Tag(token.part_of_speech.tag).name
            }
            for token in syntax_response.tokens[:10]  # First 10 tokens
        ]
    }

# Usage
content = "Our amazing product delivers exceptional value to customers."
result = analyze_with_google_nlp(content)
print(result)
```

### 12. Browserless API Usage

```javascript
const axios = require('axios');

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;
const BROWSERLESS_URL = `https://chrome.browserless.io?token=${BROWSERLESS_TOKEN}`;

async function scrapeWithBrowserless(url) {
  const response = await axios.post(BROWSERLESS_URL + '/content', {
    url: url,
    waitFor: 2000,  // Wait 2 seconds for JS to load
  });

  return response.data;
}

async function screenshotWithBrowserless(url) {
  const response = await axios.post(
    BROWSERLESS_URL + '/screenshot',
    {
      url: url,
      options: {
        fullPage: true,
        type: 'png'
      }
    },
    {
      responseType: 'arraybuffer'
    }
  );

  return response.data;
}

// Usage
scrapeWithBrowserless('https://competitor.com')
  .then(html => console.log('HTML length:', html.length));

screenshotWithBrowserless('https://competitor.com/pricing')
  .then(buffer => fs.writeFileSync('screenshot.png', buffer));
```

---

## 🔧 Utility Scripts

### 13. Keyword Extraction Pipeline

```javascript
const keyword_extractor = require('keyword-extractor');
const compromise = require('compromise');

function extractKeywords(text, options = {}) {
  // Method 1: keyword-extractor
  const simpleKeywords = keyword_extractor.extract(text, {
    language: 'english',
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  });

  // Method 2: compromise NLP
  const doc = compromise(text);
  const nlpKeywords = [
    ...doc.nouns().out('array'),
    ...doc.topics().out('array')
  ];

  // Combine and deduplicate
  const allKeywords = [...new Set([...simpleKeywords, ...nlpKeywords])];

  return {
    simple: simpleKeywords,
    nlp: nlpKeywords,
    combined: allKeywords,
    count: allKeywords.length
  };
}

// Usage
const content = `
Discover the best marketing automation tools for 2026.
Our platform helps businesses grow with AI-powered analytics.
`;

const keywords = extractKeywords(content);
console.log('Keywords:', keywords.combined);
```

### 14. Readability Checker CLI Wrapper

```bash
#!/bin/bash
# readability-check.sh - Wrapper for readability-checker CLI

if [ -z "$1" ]; then
    echo "Usage: ./readability-check.sh <file.txt>"
    exit 1
fi

echo "Analyzing readability of: $1"
echo "================================"

# Run readability-checker
readability-checker "$1"

# Also run textstat for comparison
echo ""
echo "Additional Analysis (Python textstat):"
python3 << EOF
import textstat

with open('$1', 'r') as f:
    text = f.read()

print(f"Flesch Reading Ease: {textstat.flesch_reading_ease(text)}")
print(f"Flesch-Kincaid Grade: {textstat.flesch_kincaid_grade(text)}")
print(f"SMOG Index: {textstat.smog_index(text)}")
print(f"Automated Readability Index: {textstat.automated_readability_index(text)}")
print(f"Difficult Words: {textstat.difficult_words(text)}")
EOF
```

---

## 📈 Monitoring & Alerts

### 15. Change Detection System

```python
import json
import hashlib
from datetime import datetime
from pathlib import Path

class ChangeDetector:
    def __init__(self, storage_path='./monitoring-data'):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)

    def compute_hash(self, data):
        """Compute hash of data for change detection"""
        return hashlib.sha256(
            json.dumps(data, sort_keys=True).encode()
        ).hexdigest()

    def store_snapshot(self, competitor_name, data):
        """Store snapshot of competitor data"""
        snapshot = {
            'timestamp': datetime.now().isoformat(),
            'hash': self.compute_hash(data),
            'data': data
        }

        file_path = self.storage_path / f"{competitor_name}.json"

        # Load previous snapshots
        if file_path.exists():
            with open(file_path, 'r') as f:
                snapshots = json.load(f)
        else:
            snapshots = []

        snapshots.append(snapshot)

        # Keep only last 30 snapshots
        snapshots = snapshots[-30:]

        with open(file_path, 'w') as f:
            json.dump(snapshots, f, indent=2)

    def detect_changes(self, competitor_name, current_data):
        """Detect changes from previous snapshot"""
        file_path = self.storage_path / f"{competitor_name}.json"

        if not file_path.exists():
            return None  # No previous data

        with open(file_path, 'r') as f:
            snapshots = json.load(f)

        if not snapshots:
            return None

        previous = snapshots[-1]
        current_hash = self.compute_hash(current_data)

        if current_hash != previous['hash']:
            return {
                'changed': True,
                'previous_timestamp': previous['timestamp'],
                'current_timestamp': datetime.now().isoformat(),
                'previous_data': previous['data'],
                'current_data': current_data
            }

        return {'changed': False}

# Usage
detector = ChangeDetector()

# Monitor competitor
competitor_data = {
    'pricing': '$99/month',
    'features': ['Feature A', 'Feature B'],
    'headline': 'Best Marketing Tool 2026'
}

changes = detector.detect_changes('competitor-a', competitor_data)

if changes and changes['changed']:
    print("ALERT: Changes detected!")
    print(f"Previous: {changes['previous_data']}")
    print(f"Current: {changes['current_data']}")

    # Send alert via email, Slack, etc.
else:
    print("No changes detected")

# Store current snapshot
detector.store_snapshot('competitor-a', competitor_data)
```

---

## 🎨 Content Generation Examples

### 16. Using CoppieGPT Frameworks

```javascript
// copywriting-frameworks.js
// Based on CoppieGPT's 232 frameworks

const frameworks = {
  AIDA: {
    name: 'Attention, Interest, Desire, Action',
    template: `
    [Attention] ${attention}
    [Interest] ${interest}
    [Desire] ${desire}
    [Action] ${action}
    `,
    example: {
      attention: '🚀 Stop wasting time on manual marketing',
      interest: 'Our AI-powered platform automates 80% of your marketing tasks',
      desire: 'Join 10,000+ marketers saving 20 hours per week',
      action: 'Start your free trial today →'
    }
  },

  PAS: {
    name: 'Problem, Agitate, Solution',
    template: `
    [Problem] ${problem}
    [Agitate] ${agitate}
    [Solution] ${solution}
    `,
    example: {
      problem: 'Struggling to monitor your competitors?',
      agitate: 'Missing critical pricing changes and losing customers to competition',
      solution: 'Our automated monitoring alerts you instantly to any competitor changes'
    }
  },

  FAB: {
    name: 'Features, Advantages, Benefits',
    template: `
    [Feature] ${feature}
    [Advantage] ${advantage}
    [Benefit] ${benefit}
    `,
    example: {
      feature: 'AI-powered sentiment analysis',
      advantage: 'Analyze 10,000 reviews in seconds',
      benefit: 'Make data-driven decisions that increase customer satisfaction by 40%'
    }
  }
};

function applyFramework(framework, data) {
  let output = frameworks[framework].template;

  Object.keys(data).forEach(key => {
    output = output.replace(`\${${key}}`, data[key]);
  });

  return output.trim();
}

// Usage
const aida = applyFramework('AIDA', frameworks.AIDA.example);
console.log(aida);
```

---

## 💾 Data Storage & Reporting

### 17. SQLite Database for Competitor Data

```python
import sqlite3
import json
from datetime import datetime

class CompetitorDatabase:
    def __init__(self, db_path='competitors.db'):
        self.conn = sqlite3.connect(db_path)
        self.create_tables()

    def create_tables(self):
        cursor = self.conn.cursor()

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS competitors (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE,
            url TEXT,
            created_at TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS snapshots (
            id INTEGER PRIMARY KEY,
            competitor_id INTEGER,
            timestamp TEXT,
            pricing TEXT,
            features TEXT,
            content_hash TEXT,
            raw_data TEXT,
            FOREIGN KEY (competitor_id) REFERENCES competitors (id)
        )
        ''')

        self.conn.commit()

    def add_competitor(self, name, url):
        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT OR IGNORE INTO competitors (name, url, created_at) VALUES (?, ?, ?)',
            (name, url, datetime.now().isoformat())
        )
        self.conn.commit()
        return cursor.lastrowid

    def add_snapshot(self, competitor_name, data):
        cursor = self.conn.cursor()

        # Get competitor ID
        cursor.execute('SELECT id FROM competitors WHERE name = ?', (competitor_name,))
        result = cursor.fetchone()

        if not result:
            return None

        competitor_id = result[0]

        # Insert snapshot
        cursor.execute('''
        INSERT INTO snapshots (competitor_id, timestamp, pricing, features, raw_data)
        VALUES (?, ?, ?, ?, ?)
        ''', (
            competitor_id,
            datetime.now().isoformat(),
            data.get('pricing'),
            json.dumps(data.get('features', [])),
            json.dumps(data)
        ))

        self.conn.commit()
        return cursor.lastrowid

    def get_competitor_history(self, competitor_name, limit=30):
        cursor = self.conn.cursor()

        cursor.execute('''
        SELECT s.timestamp, s.pricing, s.features, s.raw_data
        FROM snapshots s
        JOIN competitors c ON s.competitor_id = c.id
        WHERE c.name = ?
        ORDER BY s.timestamp DESC
        LIMIT ?
        ''', (competitor_name, limit))

        return cursor.fetchall()

# Usage
db = CompetitorDatabase()

# Add competitors
db.add_competitor('Competitor A', 'https://competitora.com')
db.add_competitor('Competitor B', 'https://competitorb.com')

# Add snapshot
db.add_snapshot('Competitor A', {
    'pricing': '$99/month',
    'features': ['AI Analytics', 'Automation', '24/7 Support'],
    'headline': 'Best Marketing Tool'
})

# Get history
history = db.get_competitor_history('Competitor A')
for record in history:
    print(f"Timestamp: {record[0]}, Pricing: {record[1]}")
```

---

## 📧 Alert System

### 18. Email Alerts for Changes

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_alert_email(subject, body, to_email):
    """Send email alert for competitor changes"""
    from_email = 'alerts@yourcompany.com'
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    password = 'your-app-password'  # Use environment variable!

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(from_email, password)
        server.send_message(msg)
        server.quit()

        print(f"Alert sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

# Usage
alert_html = f"""
<h2>🚨 Competitor Change Detected</h2>
<p><strong>Competitor:</strong> Competitor A</p>
<p><strong>Change Type:</strong> Pricing Update</p>
<p><strong>Previous:</strong> $99/month</p>
<p><strong>Current:</strong> $79/month</p>
<p><strong>Timestamp:</strong> 2026-02-13 10:30:00</p>

<a href="https://dashboard.yourcompany.com/competitors">View Dashboard</a>
"""

send_alert_email(
    '🚨 Competitor A changed pricing',
    alert_html,
    'marketing@yourcompany.com'
)
```

---

**Mais exemplos e casos de uso estão disponíveis na documentação completa de cada ferramenta.**

Para implementação em produção, consulte:
- `/Users/luizfosc/aios-core/COPYWRITING-MARKETING-TOOLS-REPORT.md` - Relatório completo
- `/Users/luizfosc/aios-core/copywriting-marketing-tools-research-report.json` - Dados estruturados
- `/Users/luizfosc/aios-core/QUICK-START-INSTALLATION.sh` - Script de instalação
