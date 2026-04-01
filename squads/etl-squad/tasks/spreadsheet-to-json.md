# spreadsheet-to-json

```yaml
task:
  name: spreadsheet-to-json
  description: "Normalize spreadsheet/CSV data to structured YAML with schema"
  squad: etl-squad
  phase: 2
  elicit: false

input:
  required:
    - source: ".xlsx, .xls, .csv, .tsv file path"
  optional:
    - sheet: "Sheet name or index (default: first)"
    - header_row: "Row number for headers (default: 1)"
    - skip_rows: "Rows to skip (e.g., totals)"

execution:
  steps:
    - agent: extractor
      method: "SheetJS (xlsx/xls), csv-parser (csv/tsv)"
      output: "Raw array of row objects"

    - agent: parser
      rules:
        - "Detect headers (first non-empty row by default)"
        - "Infer column types: string, number, date, boolean"
        - "Normalize dates to ISO 8601"
        - "Strip currency symbols from numbers"
        - "Remove empty rows and columns"
        - "Detect and flag total/subtotal rows"
        - "Handle merged cells (expand to fill)"
        - "Handle duplicate header names (append _2, _3)"

    - agent: enricher
      action: "Generate _meta block and schema definition"

    - agent: validator
      extra_checks:
        - "All rows have same column count"
        - "Types are consistent per column"
        - "No truncated data"

    - agent: loader
      naming: "spreadsheet-to-json_{slug}_{date}.yaml"
      format: "yaml (<100 records) or jsonl (>=100 records)"

output_format: yaml
fallback_format: jsonl

veto_conditions:
  - "File has 0 rows of data → FAIL"
  - "Cannot detect headers → WARN, use positional (col_1, col_2)"
  - ">10000 rows → auto-switch to jsonl format"

output_example: |
  # ETL Output: Base de Clientes Q4
  # Pipeline: spreadsheet-to-json
  # Extracted: 2025-03-05T14:30:00Z

  _meta:
    source_type: spreadsheet
    source_file: "./clientes-q4.xlsx"
    extracted_at: "2025-03-05T14:30:00Z"
    pipeline: spreadsheet-to-json
    job_id: etl_ss_5e6f
    quality_score: 0.95
    record_count: 45
    sheet: "Clientes"

  schema:
    columns:
      - name: nome
        type: string
        nullable: false
      - name: receita_mensal
        type: number
        format: currency_brl
        nullable: true
      - name: data_cadastro
        type: date
        format: "YYYY-MM-DD"
        nullable: false
      - name: ativo
        type: boolean
        nullable: false

  records:
    - nome: "Empresa Alpha"
      receita_mensal: 25000
      data_cadastro: "2024-03-15"
      ativo: true
    - nome: "Beta Corp"
      receita_mensal: null
      data_cadastro: "2024-07-01"
      ativo: false

completion_criteria:
  - "Schema with types for all columns"
  - "All records normalized"
  - "Dates in ISO 8601"
  - "Numbers without formatting artifacts"
```
