# Squad Checklist — ETL Squad

## Structure
- [ ] config.yaml valid and complete
- [ ] README.md with usage examples
- [ ] All 6 agents in agents/
- [ ] All 16 tasks in tasks/ (10 pipelines + 6 commands)
- [ ] 3 workflows in workflows/ (etl-pipeline, batch-processing, compile)
- [ ] 3 templates in templates/
- [ ] 2 checklists in checklists/
- [ ] 3 data files in data/

## Agents
- [ ] etl-chief: routing table covers all source types
- [ ] extractor: fallback chains for all methods
- [ ] parser: noise removal rules comprehensive
- [ ] enricher: frontmatter spec matches output-format-spec.md
- [ ] validator: scoring formula covers all dimensions
- [ ] loader: naming conventions documented

## Pipelines (Phase 1)
- [ ] url-to-markdown: web → clean markdown
- [ ] youtube-to-brief: video → structured brief
- [ ] pdf-to-knowledge: PDF → markdown + chunks

## Pipelines (Phase 2)
- [ ] spreadsheet-to-json: tabular → YAML with schema
- [ ] deck-to-text: presentation → markdown per slide
- [ ] audio-to-transcript: audio → timestamped transcript
- [ ] image-to-text: image → OCR or description

## Pipelines (Phase 3)
- [ ] feed-to-items: RSS/sitemap → item list
- [ ] repo-to-context: GitHub → context document
- [ ] batch-urls: multiple sources → organized directory

## Quality
- [ ] All agents have 3 smoke tests
- [ ] All agents have veto conditions
- [ ] All agents have output examples
- [ ] All tasks have completion criteria
- [ ] output-format-spec.md is the single source of truth for formats
- [ ] source-type-registry.yaml covers all 20+ source types

## Commands (v1.1)
- [ ] workspace-preflight: validates workspace essentials
- [ ] workspace-context: loads routing policy
- [ ] validate-contracts: cross-references registry/tasks/agents
- [ ] enrich: standalone enrichment of raw text
- [ ] compile: multi-source merge with TOC
- [ ] extract-keyframes: video keyframe extraction

## Integration
- [ ] Compatible with existing AIOX tech-research ETL layer
- [ ] CLI interface documented
- [ ] Squad API interface documented
- [ ] Cache mechanism specified
