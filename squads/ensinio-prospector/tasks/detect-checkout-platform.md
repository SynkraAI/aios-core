# Task: Detect Checkout Platform

## Task Anatomy
- **task_name:** detect-checkout-platform
- **status:** active
- **responsible_executor:** instagram-researcher (Scout)
- **execution_type:** Agent
- **input:**
  - checkout_url from lead data
  - platform-signatures.yaml reference file
- **output:**
  - Platform detection result (JSON)
  - Confidence level
  - Checkout page text

## Action Items

### Step 1: Validate Input
1. Check if checkout_url is provided
2. If no checkout_url → skip detection, return null
3. Validate URL format (must be valid HTTP/HTTPS)

### Step 2: Load Platform Signatures
Load platform signatures from `data/platform-signatures.yaml`:
- URL patterns (domain-based detection)
- HTML markers (code signatures)
- Meta tags (platform identification)

### Step 3: Fetch Checkout Page
1. Use WebFetch tool to retrieve checkout page
2. Handle redirects (follow up to 3 redirects)
3. Extract:
   - Final URL (after redirects)
   - HTML content
   - Meta tags
   - Visible text content

### Step 4: Domain-Based Detection
1. Extract domain from checkout_url
2. Check against url_patterns in platform-signatures.yaml
3. If match found → set confidence = "high"

Examples:
- `pay.hotmart.com` → Hotmart
- `pay.kiwify.com.br` → Kiwify
- `checkout.eduzz.com` → Eduzz
- `pagar.me` → Pagar.me
- `pay.perfectpay.com.br` → PerfectPay

### Step 5: HTML Marker Detection (if no domain match)
1. Search HTML content for platform-specific markers
2. Check against html_markers in platform-signatures.yaml
3. If match found → set confidence = "medium"

Examples:
- `data-hotmart` → Hotmart
- `kiwify-checkout` → Kiwify
- `eduzz-pay` → Eduzz

### Step 6: Meta Tag Detection (confirmation)
1. Parse HTML meta tags
2. Check for platform identifiers in:
   - `<meta name="generator">`
   - `<meta property="og:site_name">`
   - Custom platform meta tags
3. If matches domain/HTML detection → boost confidence

### Step 7: Extract Checkout Details
From visible page text, extract:
- Product/course name
- Price (if visible)
- Creator/seller name
- Payment options mentioned

### Step 8: Determine Final Result
Confidence levels:
- **high:** Domain match + meta tag confirmation
- **medium:** Domain match OR HTML marker match
- **low:** Partial indicators (text mentions, but no code match)
- **unknown:** No matches found

### Step 9: Return Detection Result
Generate platform detection object with confidence level.

## Acceptance Criteria
- Checkout URL fetched successfully
- Domain checked against known patterns
- HTML analyzed for platform markers
- Meta tags parsed
- Confidence level assigned
- Checkout text extracted
- Platform name identified (or "unknown")

## Veto Conditions
- **WARNING:** checkout_url returns 404/500 (return confidence = "unknown")
- **WARNING:** Page requires authentication (return confidence = "unknown")
- **WARNING:** Page is JavaScript-heavy (limited HTML detection)

## Output Example
```json
{
  "platform_name": "Hotmart",
  "confidence": "high",
  "detection_method": "domain_match",
  "final_url": "https://pay.hotmart.com/X1Y2Z3?off=abc123",
  "checkout_text": "Curso Completo de Marketing Digital - R$ 497,00 - 12x sem juros",
  "product_name": "Curso Completo de Marketing Digital",
  "price": "497.00",
  "seller": "Maria Silva"
}
```

## Reference: Platform Signatures
The task references `data/platform-signatures.yaml` which contains:

```yaml
platforms:
  hotmart:
    url_patterns:
      - "pay.hotmart.com"
      - "hotmart.com/checkout"
    html_markers:
      - "data-hotmart"
      - "hotmart-checkout"
    meta_tags:
      - name: "generator"
        value: "Hotmart"

  kiwify:
    url_patterns:
      - "pay.kiwify.com.br"
      - "kiwify.app"
    html_markers:
      - "kiwify-checkout"
      - "data-kiwify"

  eduzz:
    url_patterns:
      - "checkout.eduzz.com"
      - "pay.eduzz.com"
    html_markers:
      - "eduzz-pay"

  # ... other platforms
```

## Error Handling
- **URL unreachable:** Return platform_name = "unknown", confidence = "unknown"
- **Page requires authentication:** Return platform_name = "unknown", confidence = "low"
- **WebFetch timeout:** Retry once, then return "unknown"
- **Invalid HTML:** Continue with domain-only detection
- **No platform signatures file:** HALT and request file creation

## Completion Criteria
Checkout platform detected with confidence level, checkout details extracted, ready for analysis
