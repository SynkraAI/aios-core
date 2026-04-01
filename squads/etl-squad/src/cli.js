#!/usr/bin/env node

/**
 * ETL Squad — CLI Interface
 *
 * Usage:
 *   node squads/etl-squad/src/cli.js run --source "https://exemplo.com/artigo"
 *   node squads/etl-squad/src/cli.js run --source ./arquivo.pdf --pipeline pdf-to-knowledge
 *   node squads/etl-squad/src/cli.js batch --sources ./urls.txt --parallel 5
 *   node squads/etl-squad/src/cli.js classify "https://youtube.com/watch?v=xxx"
 */

import { readFileSync } from 'fs';
import { etl } from './index.js';

const args = process.argv.slice(2);
const command = args[0];

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2).replace(/-/g, '_');
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      parsed[key] = value;
    } else if (!parsed._positional) {
      parsed._positional = args[i];
    }
  }
  return parsed;
}

async function main() {
  if (!command || command === 'help' || command === '--help') {
    showHelp();
    return;
  }

  const opts = parseArgs(args.slice(1));

  switch (command) {
    case 'run': {
      const source = opts.source || opts._positional;
      if (!source) {
        console.error('Error: --source is required');
        process.exit(1);
      }
      const result = await etl.run({
        source,
        pipeline: opts.pipeline,
        options: {
          chunk_size: opts.chunk_size ? parseInt(opts.chunk_size) : undefined,
          chunk_overlap: opts.chunk_overlap ? parseInt(opts.chunk_overlap) : undefined,
          language: opts.language,
          output_format: opts.output || opts.output_format,
          destination: opts.destination,
        },
      });
      console.log('\n' + JSON.stringify(result, null, 2));
      process.exit(result.status === 'failed' ? 1 : 0);
      break;
    }

    case 'batch': {
      const sourcesFile = opts.sources || opts._positional;
      if (!sourcesFile) {
        console.error('Error: --sources is required (file with list of URLs/paths)');
        process.exit(1);
      }

      let sources;
      try {
        const content = readFileSync(sourcesFile, 'utf-8');
        if (sourcesFile.endsWith('.json')) {
          sources = JSON.parse(content);
        } else {
          sources = content.split('\n').map(l => l.trim()).filter(Boolean);
        }
      } catch (e) {
        console.error(`Error reading sources file: ${e.message}`);
        process.exit(1);
      }

      if (sources.length === 0) {
        console.error('Error: no sources found in file');
        process.exit(1);
      }

      const results = await etl.batch({
        sources,
        pipeline: opts.pipeline,
        options: {
          parallel: opts.parallel ? parseInt(opts.parallel) : undefined,
          chunk_size: opts.chunk_size ? parseInt(opts.chunk_size) : undefined,
          output_format: opts.output || opts.output_format,
        },
      });

      const success = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'fail').length;
      console.log(`\nBatch complete: ${success} success, ${failed} failed out of ${results.length}`);
      process.exit(failed === results.length ? 1 : 0);
      break;
    }

    case 'classify': {
      const source = opts.source || opts._positional;
      if (!source) {
        console.error('Error: provide a source to classify');
        process.exit(1);
      }
      const result = etl.classify(source, opts.pipeline);
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

function showHelp() {
  console.log(`
ETL Squad CLI — Extract, Transform, Load any source

Commands:
  run       Process a single source
  batch     Process multiple sources in parallel
  classify  Classify a source (show type and pipeline)
  help      Show this help

Run options:
  --source <url|path>       Source to process (required)
  --pipeline <name>         Force specific pipeline
  --output <format>         Output format: markdown|yaml|json|jsonl
  --destination <path>      Output directory
  --chunk-size <n>          Tokens per chunk (default: 500)
  --chunk-overlap <n>       Overlap tokens (default: 50)
  --language <code>         Force language (default: auto)

Batch options:
  --sources <file>          File with list of sources (required)
  --pipeline <name>         Force same pipeline for all
  --parallel <n>            Max parallel workers (default: 3, max: 10)
  --output <format>         Output format for all

Pipelines:
  url-to-markdown           URL → clean markdown
  youtube-to-brief          YouTube → structured brief
  pdf-to-knowledge          PDF → markdown + chunks
  spreadsheet-to-json       Excel/CSV → YAML with schema
  deck-to-text              PowerPoint → markdown per slide
  audio-to-transcript       Audio → timestamped transcript
  image-to-text             Image → OCR/description
  feed-to-items             RSS/Sitemap → item list
  repo-to-context           GitHub → context document
  batch-urls                Multiple → organized directory

Examples:
  node cli.js run --source "https://exemplo.com/artigo"
  node cli.js run --source ./doc.pdf --pipeline pdf-to-knowledge
  node cli.js batch --sources ./urls.txt --parallel 5
  node cli.js classify "https://youtube.com/watch?v=xxx"
`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
