#!/usr/bin/env node

/**
 * Auto-reindex script for docs/projects/ACTIVE.md
 *
 * Renumbers the `#` column in both Active Projects and Backlog tables
 * to maintain sequential numbering (1, 2, 3... and B1, B2, B3...)
 *
 * Usage: node scripts/reindex-projects.js
 *        npm run projects:reindex
 */

const fs = require('fs');
const path = require('path');

const ACTIVE_MD_PATH = path.join(__dirname, '../docs/projects/ACTIVE.md');

/**
 * Renumbers the `#` column in a markdown table
 * @param {string} content - Full markdown content
 * @param {string} sectionMarker - Marker to identify table start (e.g., "## Backlog")
 * @param {string} prefix - Prefix for numbering ('' for 1,2,3... or 'B' for B1,B2,B3...)
 * @returns {string} Updated content
 */
function reindexTable(content, sectionMarker, prefix = '') {
  const lines = content.split('\n');
  const tableStartPattern = /^\|\s*#\s*\|/; // Line with "| # |"
  let inTargetSection = !sectionMarker; // If no marker, start immediately
  let counter = 1;
  let foundTable = false;

  const result = lines.map(line => {
    // Track section
    if (sectionMarker && line.startsWith(sectionMarker)) {
      inTargetSection = true;
      return line;
    }

    // Detect next section (stops processing)
    if (inTargetSection && line.startsWith('##') && !line.startsWith(sectionMarker)) {
      inTargetSection = false;
      return line;
    }

    // Skip header row and separator row
    if (tableStartPattern.test(line)) {
      foundTable = true;
      return line;
    }
    if (foundTable && /^\|---/.test(line)) {
      return line;
    }

    // Reindex data rows
    if (inTargetSection && foundTable && line.startsWith('|')) {
      // Replace first column (number)
      const number = prefix ? `${prefix}${counter}` : `${counter}`;
      const updated = line.replace(/^\|\s*\S+\s*\|/, `| ${number} |`);
      counter++;
      return updated;
    }

    return line;
  });

  return result.join('\n');
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('📋 Reindexing ACTIVE.md...\n');

    // Read file
    if (!fs.existsSync(ACTIVE_MD_PATH)) {
      throw new Error(`File not found: ${ACTIVE_MD_PATH}`);
    }

    let content = fs.readFileSync(ACTIVE_MD_PATH, 'utf-8');
    const originalContent = content;

    // Reindex Active Projects (no section marker, starts from top)
    content = reindexTable(content, null, '');

    // Reindex Backlog (section marker: "## Backlog")
    content = reindexTable(content, '## Backlog', 'B');

    // Write back only if changed
    if (content !== originalContent) {
      fs.writeFileSync(ACTIVE_MD_PATH, content, 'utf-8');
      console.log('✅ Successfully reindexed ACTIVE.md');
      console.log('   - Active Projects: renumbered 1, 2, 3...');
      console.log('   - Backlog: renumbered B1, B2, B3...\n');
    } else {
      console.log('ℹ️  No changes needed — numbering is already correct\n');
    }
  } catch (error) {
    console.error('❌ Error reindexing ACTIVE.md:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

main();
