# repo-to-context

```yaml
task:
  name: repo-to-context
  description: "Extract GitHub repo structure, README, and relevant code into context doc"
  squad: etl-squad
  phase: 3
  elicit: false

input:
  required:
    - source: "GitHub repo URL (github.com/owner/repo)"
  optional:
    - include_code: true
    - include_issues: false
    - max_files: 20
    - file_filter: "*.md,*.ts,*.js,*.py"

execution:
  steps:
    - agent: extractor
      method: "GitHub API v3 (repos, trees, blobs)"
      fallback: "Raw fetch of file URLs"
      extract:
        - "README.md content"
        - "File tree (recursive)"
        - "package.json / pyproject.toml (dependency info)"
        - "Top N relevant source files (by filter)"
        - "Open issues (if include_issues=true)"

    - agent: parser
      rules:
        - "README → preserved as-is"
        - "File tree → indented text representation"
        - "Code files → fenced blocks with language tag"
        - "Issues → numbered list with title + labels"
        - "Limit code to first 200 lines per file"

    - agent: enricher
      action: "Frontmatter with repo metadata (stars, language, license, last_commit)"

    - agent: validator
    - agent: loader
      naming: "repo-to-context_{slug}_{date}.md"

output_format: markdown

veto_conditions:
  - "Repo is private and no auth configured → FAIL"
  - "Repo has 0 files → FAIL"
  - "Repo >10000 files → WARN, apply strict file_filter"

output_example: |
  ---
  source_type: github
  source_url: "https://github.com/owner/project"
  title: "project — Short description from repo"
  language: TypeScript
  stars: 1200
  license: MIT
  last_commit: "2025-03-01"
  extracted_at: "2025-03-05T14:30:00Z"
  pipeline: repo-to-context
  job_id: etl_gh_7o8p
  ---

  # project

  > **Sumario:** TypeScript project for... 1.2k stars, MIT license.

  ## README

  Original README content here...

  ## File Structure

  ```
  src/
    index.ts
    utils/
      helpers.ts
    components/
      main.tsx
  package.json
  tsconfig.json
  ```

  ## Key Files

  ### src/index.ts

  ```typescript
  import { App } from './components/main'
  // ... (first 200 lines)
  ```

  ## Dependencies

  - react: ^18.2.0
  - typescript: ^5.3.0
  - vite: ^5.0.0

completion_criteria:
  - "README preserved"
  - "File tree generated"
  - "Key code files included with language tags"
  - "Repo metadata in frontmatter"
```
