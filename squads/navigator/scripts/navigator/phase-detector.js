#!/usr/bin/env node

/**
 * Phase Detector Script
 * Detects current project phase based on file system state
 *
 * Used by: nav-where-am-i, nav-auto-navigate, nav-update-roadmap
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');
const { resolveSquadPath } = require('../squad-paths');

/**
 * Detect current phase from file system
 * @param {string} projectRoot - Path to project root
 * @param {Object} pipelineMap - Optional pipeline map (loads from file if not provided)
 * @returns {Promise<Object>} Current phase with completion percentage
 */
async function detectPhase(projectRoot = process.cwd(), pipelineMap = null) {
  // Load pipeline map if not provided
  if (!pipelineMap) {
    const pipelineMapPath = resolveSquadPath('data', 'navigator-pipeline-map.yaml', projectRoot)
      || path.join(projectRoot, '.aios-core/development/data/navigator-pipeline-map.yaml');

    if (!fs.existsSync(pipelineMapPath)) {
      throw new Error(`Pipeline map not found: ${pipelineMapPath}`);
    }

    pipelineMap = yaml.load(fs.readFileSync(pipelineMapPath, 'utf8'));
  }

  // Check each phase in order
  let currentPhase = pipelineMap.phases[0]; // Default to first phase
  let completion = 0;

  for (const phase of pipelineMap.phases) {
    const status = checkPhaseOutputs(phase, projectRoot);

    if (status.complete) {
      // This phase is complete, move to next
      const nextPhaseId = phase.next_phase;
      if (nextPhaseId) {
        currentPhase = pipelineMap.phases.find(p => p.id === nextPhaseId);
        completion = 0; // Reset completion for next phase
      } else {
        // Last phase and complete
        currentPhase = phase;
        completion = 100;
        break;
      }
    } else if (status.partial) {
      // This phase is in progress
      currentPhase = phase;
      completion = status.percentage;
      break;
    } else {
      // This phase hasn't started
      currentPhase = phase;
      completion = 0;
      break;
    }
  }

  return {
    ...currentPhase,
    completion,
  };
}

/**
 * Check if phase outputs exist
 * @param {Object} phase - Phase object from pipeline map
 * @param {string} projectRoot - Project root path
 * @returns {Object} Status object with complete, partial, percentage
 */
function checkPhaseOutputs(phase, projectRoot) {
  const outputs = phase.outputs.map(outputPattern => {
    // Handle glob patterns
    const matches = glob.sync(outputPattern, {
      cwd: projectRoot,
      nodir: true,
    });

    return {
      pattern: outputPattern,
      exists: matches.length > 0,
      count: matches.length,
      files: matches,
    };
  });

  const existingOutputs = outputs.filter(o => o.exists);
  const allExist = existingOutputs.length === outputs.length;
  const someExist = existingOutputs.length > 0;
  const percentage = (existingOutputs.length / outputs.length) * 100;

  return {
    complete: allExist,
    partial: someExist && !allExist,
    percentage,
    outputs,
  };
}

/**
 * Calculate completion percentage for current phase
 * Handles special cases like story counting
 * @param {Object} phase - Phase object
 * @param {string} projectRoot - Project root
 * @returns {number} Completion percentage (0-100)
 */
function calculateCompletion(phase, projectRoot) {
  // Special case: story-based phases
  if (phase.outputs.some(o => o.includes('story-*.md'))) {
    return calculateStoryCompletion(projectRoot);
  }

  // Default: based on output files existence
  const status = checkPhaseOutputs(phase, projectRoot);
  return status.percentage;
}

/**
 * Calculate completion based on story status
 */
function calculateStoryCompletion(projectRoot) {
  const storyPattern = path.join(projectRoot, 'docs/stories/story-*.md');
  const storyFiles = glob.sync(storyPattern);

  if (storyFiles.length === 0) {
    return 0;
  }

  const completedStories = storyFiles.filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const frontMatter = parseFrontMatter(content);
      return frontMatter && frontMatter.status === 'completed';
    } catch (_error) {
      return false;
    }
  });

  return (completedStories.length / storyFiles.length) * 100;
}

/**
 * Parse front-matter YAML from markdown file
 */
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return null;
  }

  try {
    return yaml.load(match[1]);
  } catch (_error) {
    return null;
  }
}

/**
 * Get next phase from pipeline map
 */
function getNextPhase(currentPhase, pipelineMap) {
  if (!currentPhase.next_phase) {
    return null; // Last phase
  }

  return pipelineMap.phases.find(p => p.id === currentPhase.next_phase);
}

// CLI interface
if (require.main === module) {
  const projectRoot = process.argv[2] || process.cwd();

  detectPhase(projectRoot)
    .then(phase => {
      console.log(JSON.stringify({
        id: phase.id,
        name: phase.name,
        agent: phase.agent,
        command: phase.command,
        completion: Math.round(phase.completion),
        next_phase: phase.next_phase,
      }, null, 2));
    })
    .catch(error => {
      console.error('✗ Phase detection failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  detectPhase,
  checkPhaseOutputs,
  calculateCompletion,
  getNextPhase,
  parseFrontMatter,
};
