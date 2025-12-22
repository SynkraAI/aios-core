/**
 * File Hasher Utility
 * Cross-platform file hashing with line ending normalization
 *
 * @module src/installer/file-hasher
 * @story 6.18 - Dynamic Manifest & Brownfield Upgrade System
 */

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

/**
 * List of file extensions that should be treated as binary (not normalized)
 */
const BINARY_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.svg',
  '.pdf', '.zip', '.tar', '.gz', '.7z',
  '.woff', '.woff2', '.ttf', '.eot',
  '.mp3', '.mp4', '.wav', '.avi',
  '.exe', '.dll', '.so', '.dylib',
];

/**
 * Check if a file should be treated as binary based on extension
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if file is binary
 */
function isBinaryFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.includes(ext);
}

/**
 * Normalize line endings from CRLF to LF for consistent cross-platform hashing
 * @param {string} content - File content as string
 * @returns {string} - Normalized content with LF line endings
 */
function normalizeLineEndings(content) {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Remove UTF-8 BOM if present
 * @param {string} content - File content
 * @returns {string} - Content without BOM
 */
function removeBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    return content.slice(1);
  }
  return content;
}

/**
 * Compute SHA256 hash of a file with cross-platform normalization
 * Text files have line endings normalized for consistent hashes across OS
 * Binary files are hashed as-is
 *
 * @param {string} filePath - Absolute path to the file
 * @returns {string} - SHA256 hash as hex string
 * @throws {Error} - If file cannot be read
 */
function hashFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    throw new Error(`Cannot hash directory: ${filePath}`);
  }

  let content;

  if (isBinaryFile(filePath)) {
    // Binary files: hash raw bytes
    content = fs.readFileSync(filePath);
  } else {
    // Text files: normalize line endings and remove BOM
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const withoutBOM = removeBOM(rawContent);
    const normalized = normalizeLineEndings(withoutBOM);
    content = Buffer.from(normalized, 'utf8');
  }

  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Compute SHA256 hash of a string (for manifest integrity)
 * @param {string} content - String content to hash
 * @returns {string} - SHA256 hash as hex string
 */
function hashString(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Compare two hashes for equality
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {boolean} - True if hashes match
 */
function hashesMatch(hash1, hash2) {
  if (!hash1 || !hash2) return false;
  return hash1.toLowerCase() === hash2.toLowerCase();
}

/**
 * Get file metadata including hash
 * @param {string} filePath - Absolute path to the file
 * @param {string} basePath - Base path for relative path calculation
 * @returns {Object} - File metadata object
 */
function getFileMetadata(filePath, basePath) {
  const stats = fs.statSync(filePath);
  const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');

  return {
    path: relativePath,
    hash: `sha256:${hashFile(filePath)}`,
    size: stats.size,
    isBinary: isBinaryFile(filePath),
  };
}

module.exports = {
  hashFile,
  hashString,
  hashesMatch,
  getFileMetadata,
  isBinaryFile,
  normalizeLineEndings,
  removeBOM,
  BINARY_EXTENSIONS,
};
