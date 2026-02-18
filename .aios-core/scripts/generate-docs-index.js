#!/usr/bin/env node
/**
 * Documentation Index Generator
 * Generates docs/index.md with all documentation files organized by folder
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../../docs');
const OUTPUT_FILE = path.join(DOCS_DIR, 'index.md');

// Folders to exclude from indexing
const EXCLUDE_FOLDERS = ['.git', 'node_modules'];
// Files to exclude
const EXCLUDE_FILES = ['index.md'];

/**
 * Extract title from markdown file
 * Looks for first # heading, falls back to filename
 */
function extractTitle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    // Fallback to filename without extension
    return path.basename(filePath, '.md')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return path.basename(filePath, '.md');
  }
}

/**
 * Extract description from markdown file
 * Gets first paragraph after title
 */
function extractDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Remove title
    let withoutTitle = content.replace(/^#\s+.+$/m, '').trim();
    // Get first paragraph (up to double newline or 200 chars)
    const paragraphMatch = withoutTitle.match(/^([^\n]+(?:\n[^\n]+)*?)(?:\n\n|$)/);
    if (paragraphMatch) {
      let desc = paragraphMatch[1].trim();
      // Remove markdown formatting
      desc = desc.replace(/\*\*(.+?)\*\*/g, '$1'); // bold
      desc = desc.replace(/\*(.+?)\*/g, '$1'); // italic
      desc = desc.replace(/`(.+?)`/g, '$1'); // code
      desc = desc.replace(/\[(.+?)\]\(.+?\)/g, '$1'); // links
      // Truncate if too long
      if (desc.length > 200) {
        desc = desc.substring(0, 197) + '...';
      }
      return desc || 'Documentation file.';
    }
    return 'Documentation file.';
  } catch (error) {
    return 'Documentation file.';
  }
}

/**
 * Scan directory for markdown files recursively
 */
function scanDirectory(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (item.isDirectory()) {
      if (!EXCLUDE_FOLDERS.includes(item.name)) {
        files.push(...scanDirectory(fullPath, baseDir));
      }
    } else if (item.isFile() && item.name.endsWith('.md')) {
      if (!EXCLUDE_FILES.includes(item.name)) {
        files.push(relativePath);
      }
    }
  }

  return files;
}

/**
 * Organize files by folder structure
 */
function organizeByFolders(files) {
  const organized = {
    root: [],
    folders: {}
  };

  for (const file of files) {
    const dir = path.dirname(file);
    if (dir === '.') {
      organized.root.push(file);
    } else {
      const topFolder = dir.split(path.sep)[0];
      if (!organized.folders[topFolder]) {
        organized.folders[topFolder] = [];
      }
      organized.folders[topFolder].push(file);
    }
  }

  return organized;
}

/**
 * Generate index.md content
 */
function generateIndex() {
  console.log('📚 Scanning documentation files...');

  const allFiles = scanDirectory(DOCS_DIR);
  console.log(`Found ${allFiles.length} markdown files`);

  const organized = organizeByFolders(allFiles);

  let indexContent = '# Documentation Index\n\n';
  indexContent += 'Comprehensive index of all AIOS documentation.\n\n';
  indexContent += `**Last Updated:** ${new Date().toISOString().split('T')[0]}\n\n`;
  indexContent += '---\n\n';

  // Root documents
  if (organized.root.length > 0) {
    indexContent += '## Root Documents\n\n';
    indexContent += 'Core documentation files in the root directory:\n\n';

    for (const file of organized.root.sort()) {
      const fullPath = path.join(DOCS_DIR, file);
      const title = extractTitle(fullPath);
      const description = extractDescription(fullPath);
      indexContent += `### [${title}](./${file})\n\n${description}\n\n`;
    }
  }

  // Folders
  const folderNames = Object.keys(organized.folders).sort();

  for (const folder of folderNames) {
    const files = organized.folders[folder].sort();

    indexContent += `## ${folder.charAt(0).toUpperCase() + folder.slice(1)}\n\n`;
    indexContent += `Documents in the \`${folder}/\` directory:\n\n`;

    for (const file of files) {
      const fullPath = path.join(DOCS_DIR, file);
      const title = extractTitle(fullPath);
      const description = extractDescription(fullPath);
      const relativePath = './' + file.replace(/\\/g, '/');
      indexContent += `### [${title}](${relativePath})\n\n${description}\n\n`;
    }
  }

  return indexContent;
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🚀 AIOS Documentation Index Generator\n');

    const indexContent = generateIndex();

    fs.writeFileSync(OUTPUT_FILE, indexContent, 'utf-8');

    console.log(`\n✅ Index generated successfully!`);
    console.log(`📄 Output: ${OUTPUT_FILE}`);
    console.log(`📊 Size: ${(indexContent.length / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Error generating index:', error);
    process.exit(1);
  }
}

main();
