#!/usr/bin/env node

/**
 * Squad Paths - Dynamic path resolution for Navigator squad
 *
 * Resolves resource paths with squad-local-first strategy:
 *   1. squads/navigator/{type}/{file}     (squad installed)
 *   2. .aios-core/development/{type}/{file} (legacy fallback)
 *
 * Usage:
 *   const { resolveSquadPath, resolveSquadDir } = require('./squad-paths');
 *   const pipelinePath = resolveSquadPath('data', 'navigator-pipeline-map.yaml');
 *   const scriptsDir = resolveSquadDir('scripts/navigator');
 */

const fs = require('fs');
const path = require('path');

/**
 * Find the squad root directory by walking up from this file
 * @returns {string} Absolute path to squad root (e.g. /project/squads/navigator)
 */
function getSquadRoot() {
  // This file lives at squads/navigator/scripts/squad-paths.js
  return path.resolve(__dirname, '..');
}

/**
 * Find the project root (where .aios-core/ or .git/ lives)
 * @returns {string} Absolute path to project root
 */
function getProjectRoot() {
  // Squad root is squads/navigator/, project root is two levels up
  return path.resolve(getSquadRoot(), '..', '..');
}

/**
 * Resolve a resource path with squad-local-first fallback
 * @param {string} resourceType - Type directory (e.g. 'data', 'templates', 'scripts/navigator')
 * @param {string} fileName - File name to resolve
 * @param {string} [projectRoot] - Override project root (for testing)
 * @returns {string|null} Resolved absolute path, or null if not found
 */
function resolveSquadPath(resourceType, fileName, projectRoot = null) {
  const root = projectRoot || getProjectRoot();
  const squadRoot = projectRoot
    ? path.join(root, 'squads', 'navigator')
    : getSquadRoot();

  // 1. Squad-local path first
  const squadPath = path.join(squadRoot, resourceType, fileName);
  if (fs.existsSync(squadPath)) {
    return squadPath;
  }

  // 2. Legacy .aios-core/development/ fallback
  const legacyPath = path.join(root, '.aios-core', 'development', resourceType, fileName);
  if (fs.existsSync(legacyPath)) {
    return legacyPath;
  }

  return null;
}

/**
 * Resolve a directory path with squad-local-first fallback
 * @param {string} dirPath - Directory path relative to squad/development root
 * @param {string} [projectRoot] - Override project root (for testing)
 * @returns {string|null} Resolved absolute path, or null if not found
 */
function resolveSquadDir(dirPath, projectRoot = null) {
  const root = projectRoot || getProjectRoot();
  const squadRoot = projectRoot
    ? path.join(root, 'squads', 'navigator')
    : getSquadRoot();

  // 1. Squad-local first
  const squadDir = path.join(squadRoot, dirPath);
  if (fs.existsSync(squadDir)) {
    return squadDir;
  }

  // 2. Legacy fallback
  const legacyDir = path.join(root, '.aios-core', 'development', dirPath);
  if (fs.existsSync(legacyDir)) {
    return legacyDir;
  }

  return null;
}

module.exports = {
  resolveSquadPath,
  resolveSquadDir,
  getSquadRoot,
  getProjectRoot,
};
