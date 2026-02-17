/**
 * @fileoverview Parser for .env files
 * @module merger/parsers/env-parser
 */

/**
 * Parsed variable from .env file
 * @typedef {Object} ParsedVariable
 * @property {string} value - Variable value
 * @property {number} line - Line number (0-indexed)
 * @property {string|null} comment - Associated comment (line above)
 * @property {string} rawLine - Original line as written
 */

/**
 * Structure item in the parsed result
 * @typedef {Object} StructureItem
 * @property {'comment'|'blank'|'variable'} type - Type of line
 * @property {string} content - Original line content
 * @property {number} line - Line number (0-indexed)
 * @property {string} [key] - Variable key (only for type='variable')
 */

/**
 * Result of parsing an .env file
 * @typedef {Object} ParsedEnvFile
 * @property {Map<string, ParsedVariable>} variables - Map of variable name to parsed info
 * @property {StructureItem[]} structure - Ordered structure of the file
 * @property {string[]} rawLines - Original lines
 * @property {string[]} comments - All comment lines
 */

/**
 * Parse an .env file content
 * @param {string} content - Content of the .env file
 * @returns {ParsedEnvFile} Parsed result
 */
function parseEnvFile(content) {
  // Handle empty content
  if (!content || content.trim() === '') {
    return {
      variables: new Map(),
      structure: [],
      rawLines: [],
      comments: [],
    };
  }

  const lines = content.split('\n');
  const result = {
    variables: new Map(),
    structure: [],
    rawLines: lines,
    comments: [],
  };

  let currentComment = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (trimmed === '') {
      result.structure.push({
        type: 'blank',
        content: '',
        line: i,
      });
      currentComment = null;
      continue;
    }

    // Comment line
    if (trimmed.startsWith('#')) {
      result.structure.push({
        type: 'comment',
        content: line,
        line: i,
      });
      result.comments.push(trimmed);
      currentComment = trimmed;
      continue;
    }

    // Variable line - handle KEY=VALUE format
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex > 0) {
      const key = trimmed.substring(0, equalsIndex).trim();
      const value = trimmed.substring(equalsIndex + 1);

      // Only add valid variable names (alphanumeric + underscore, starting with letter/underscore)
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
        result.variables.set(key, {
          value: value,
          line: i,
          comment: currentComment,
          rawLine: line,
        });

        result.structure.push({
          type: 'variable',
          content: line,
          line: i,
          key: key,
        });
      } else {
        // Invalid key, treat as comment/text
        result.structure.push({
          type: 'comment',
          content: line,
          line: i,
        });
      }

      currentComment = null;
    } else {
      // Line without '=' - treat as comment
      result.structure.push({
        type: 'comment',
        content: line,
        line: i,
      });
      currentComment = null;
    }
  }

  return result;
}

/**
 * Check if a string is a valid .env variable name
 * @param {string} name - Variable name to check
 * @returns {boolean} True if valid
 */
function isValidEnvVarName(name) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Reconstruct .env content from parsed structure
 * @param {ParsedEnvFile} parsed - Parsed env file
 * @returns {string} Reconstructed content
 */
function reconstructEnvFile(parsed) {
  return parsed.rawLines.join('\n');
}

module.exports = {
  parseEnvFile,
  isValidEnvVarName,
  reconstructEnvFile,
};
