/**
 * Semantic Merge Engine
 * Story 8.3 - Enhanced Implementation
 *
 * AI-powered semantic merge system for resolving conflicts between
 * parallel agent work. Analyzes code at semantic level (functions, imports,
 * classes) rather than line-by-line to enable intelligent merge resolution.
 *
 * Architecture:
 * 1. SemanticAnalyzer - Extracts semantic elements from code
 * 2. ConflictDetector - Detects conflicts using compatibility rules
 * 3. AutoMerger - Resolves simple conflicts deterministically
 * 4. AIResolver - Uses Claude for complex conflict resolution
 * 5. MergeOrchestrator - Coordinates the complete pipeline
 *
 * Based on Auto-Claude's merge system architecture.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ============================================================================
// TYPES & ENUMS
// ============================================================================

const ChangeType = {
  IMPORT_ADDED: 'import_added',
  IMPORT_REMOVED: 'import_removed',
  IMPORT_MODIFIED: 'import_modified',
  FUNCTION_ADDED: 'function_added',
  FUNCTION_REMOVED: 'function_removed',
  FUNCTION_MODIFIED: 'function_modified',
  CLASS_ADDED: 'class_added',
  CLASS_REMOVED: 'class_removed',
  CLASS_MODIFIED: 'class_modified',
  VARIABLE_ADDED: 'variable_added',
  VARIABLE_REMOVED: 'variable_removed',
  VARIABLE_MODIFIED: 'variable_modified',
  JSX_ADDED: 'jsx_added',
  JSX_MODIFIED: 'jsx_modified',
  COMMENT_ADDED: 'comment_added',
  COMMENT_MODIFIED: 'comment_modified',
  STYLE_ADDED: 'style_added',
  STYLE_MODIFIED: 'style_modified',
  CONFIG_MODIFIED: 'config_modified',
  UNKNOWN: 'unknown',
};

const MergeStrategy = {
  COMBINE: 'combine', // Both changes can coexist
  TAKE_NEWER: 'take_newer', // Take the more recent change
  TAKE_LARGER: 'take_larger', // Take the more comprehensive change
  AI_REQUIRED: 'ai_required', // Needs AI to resolve
  HUMAN_REQUIRED: 'human_required', // Too complex, needs human
};

const ConflictSeverity = {
  LOW: 'low', // Auto-mergeable
  MEDIUM: 'medium', // AI can likely resolve
  HIGH: 'high', // AI required with review
  CRITICAL: 'critical', // Human intervention required
};

const MergeDecision = {
  AUTO_MERGED: 'auto_merged',
  AI_MERGED: 'ai_merged',
  NEEDS_HUMAN_REVIEW: 'needs_human_review',
  FAILED: 'failed',
};

// ============================================================================
// SEMANTIC ANALYZER
// ============================================================================

class SemanticAnalyzer {
  constructor() {
    this.patterns = {
      // JavaScript/TypeScript patterns
      jsImport:
        /^(?:import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*)?)+\s+from\s+['"][^'"]+['"]|import\s+['"][^'"]+['"])/gm,
      jsFunction:
        /(?:(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|(\w+)\s*:\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/gm,
      jsClass: /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?/gm,
      jsVariable: /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/gm,

      // JSX patterns
      jsxComponent: /<(\w+)(?:\s[^>]*)?\/?>/gm,

      // Python patterns
      pyImport: /^(?:from\s+\S+\s+import\s+.+|import\s+.+)$/gm,
      pyFunction: /^(?:async\s+)?def\s+(\w+)\s*\(/gm,
      pyClass: /^class\s+(\w+)(?:\([^)]*\))?:/gm,

      // CSS patterns
      cssSelector: /^([.#]?\w[\w-]*(?:\s*[,>+~]\s*[.#]?\w[\w-]*)*)\s*\{/gm,
      cssProperty: /^\s*([\w-]+)\s*:/gm,
    };
  }

  /**
   * Analyze semantic differences between two versions of a file
   * @param {string} filePath - Path to file
   * @param {string} before - Content before changes
   * @param {string} after - Content after changes
   * @param {string} taskId - Task identifier
   * @returns {Object} FileAnalysis with semantic changes
   */
  analyzeDiff(filePath, before, after, taskId = null) {
    const ext = path.extname(filePath).toLowerCase();
    const language = this.detectLanguage(ext);

    const beforeElements = this.extractElements(before, language);
    const afterElements = this.extractElements(after, language);

    const changes = this.computeChanges(beforeElements, afterElements, language);

    return {
      filePath,
      taskId,
      language,
      changes,
      functionsModified: changes
        .filter((c) => c.changeType.includes('function'))
        .map((c) => c.target),
      functionsAdded: changes
        .filter((c) => c.changeType === ChangeType.FUNCTION_ADDED)
        .map((c) => c.target),
      importsAdded: changes
        .filter((c) => c.changeType === ChangeType.IMPORT_ADDED)
        .map((c) => c.target),
      totalLinesChanged: this.countChangedLines(before, after),
    };
  }

  /**
   * Detect programming language from file extension
   */
  detectLanguage(ext) {
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
      '.md': 'markdown',
      '.yaml': 'yaml',
      '.yml': 'yaml',
    };
    return languageMap[ext] || 'text';
  }

  /**
   * Extract semantic elements from code
   */
  extractElements(content, language) {
    const elements = {
      imports: [],
      functions: [],
      classes: [],
      variables: [],
      jsx: [],
      other: [],
    };

    if (!content) return elements;

    if (language === 'javascript' || language === 'typescript') {
      // Extract imports
      const importMatches = content.match(this.patterns.jsImport) || [];
      elements.imports = importMatches.map((m) => ({
        type: 'import',
        content: m.trim(),
        source: this.extractImportSource(m),
      }));

      // Extract functions
      let match;
      const funcRegex = new RegExp(this.patterns.jsFunction.source, 'gm');
      while ((match = funcRegex.exec(content)) !== null) {
        const name = match[1] || match[2] || match[3];
        if (name) {
          elements.functions.push({
            type: 'function',
            name,
            content: this.extractFunctionBody(content, match.index),
            location: this.getLocation(content, match.index),
          });
        }
      }

      // Extract classes
      const classRegex = new RegExp(this.patterns.jsClass.source, 'gm');
      while ((match = classRegex.exec(content)) !== null) {
        elements.classes.push({
          type: 'class',
          name: match[1],
          content: this.extractClassBody(content, match.index),
          location: this.getLocation(content, match.index),
        });
      }
    } else if (language === 'python') {
      // Extract Python imports
      const pyImportMatches = content.match(this.patterns.pyImport) || [];
      elements.imports = pyImportMatches.map((m) => ({
        type: 'import',
        content: m.trim(),
      }));

      // Extract Python functions
      let match;
      const pyFuncRegex = new RegExp(this.patterns.pyFunction.source, 'gm');
      while ((match = pyFuncRegex.exec(content)) !== null) {
        elements.functions.push({
          type: 'function',
          name: match[1],
          location: this.getLocation(content, match.index),
        });
      }

      // Extract Python classes
      const pyClassRegex = new RegExp(this.patterns.pyClass.source, 'gm');
      while ((match = pyClassRegex.exec(content)) !== null) {
        elements.classes.push({
          type: 'class',
          name: match[1],
          location: this.getLocation(content, match.index),
        });
      }
    }

    return elements;
  }

  /**
   * Compute semantic changes between two element sets
   */
  computeChanges(before, after, language) {
    const changes = [];

    // Compare imports
    const beforeImports = new Set(before.imports.map((i) => i.content));
    const afterImports = new Set(after.imports.map((i) => i.content));

    for (const imp of after.imports) {
      if (!beforeImports.has(imp.content)) {
        changes.push({
          changeType: ChangeType.IMPORT_ADDED,
          target: imp.content,
          location: 'imports',
        });
      }
    }

    for (const imp of before.imports) {
      if (!afterImports.has(imp.content)) {
        changes.push({
          changeType: ChangeType.IMPORT_REMOVED,
          target: imp.content,
          location: 'imports',
        });
      }
    }

    // Compare functions
    const beforeFuncs = new Map(before.functions.map((f) => [f.name, f]));
    const afterFuncs = new Map(after.functions.map((f) => [f.name, f]));

    for (const [name, func] of afterFuncs) {
      if (!beforeFuncs.has(name)) {
        changes.push({
          changeType: ChangeType.FUNCTION_ADDED,
          target: name,
          location: func.location,
        });
      } else if (beforeFuncs.get(name).content !== func.content) {
        changes.push({
          changeType: ChangeType.FUNCTION_MODIFIED,
          target: name,
          location: func.location,
        });
      }
    }

    for (const [name, func] of beforeFuncs) {
      if (!afterFuncs.has(name)) {
        changes.push({
          changeType: ChangeType.FUNCTION_REMOVED,
          target: name,
          location: func.location,
        });
      }
    }

    // Compare classes
    const beforeClasses = new Map(before.classes.map((c) => [c.name, c]));
    const afterClasses = new Map(after.classes.map((c) => [c.name, c]));

    for (const [name, cls] of afterClasses) {
      if (!beforeClasses.has(name)) {
        changes.push({
          changeType: ChangeType.CLASS_ADDED,
          target: name,
          location: cls.location,
        });
      } else if (beforeClasses.get(name).content !== cls.content) {
        changes.push({
          changeType: ChangeType.CLASS_MODIFIED,
          target: name,
          location: cls.location,
        });
      }
    }

    for (const [name] of beforeClasses) {
      if (!afterClasses.has(name)) {
        changes.push({
          changeType: ChangeType.CLASS_REMOVED,
          target: name,
          location: 'class',
        });
      }
    }

    return changes;
  }

  // Helper methods
  extractImportSource(importStr) {
    const match = importStr.match(/from\s+['"]([^'"]+)['"]/);
    return match ? match[1] : importStr;
  }

  extractFunctionBody(content, startIndex) {
    // Simplified extraction - gets first 500 chars
    return content.substring(startIndex, startIndex + 500);
  }

  extractClassBody(content, startIndex) {
    return content.substring(startIndex, startIndex + 1000);
  }

  getLocation(content, index) {
    const lines = content.substring(0, index).split('\n');
    return `line ${lines.length}`;
  }

  countChangedLines(before, after) {
    const beforeLines = (before || '').split('\n').length;
    const afterLines = (after || '').split('\n').length;
    return Math.abs(afterLines - beforeLines);
  }
}

// ============================================================================
// CONFLICT DETECTOR
// ============================================================================

class ConflictDetector {
  constructor() {
    this.rules = this.buildCompatibilityRules();
  }

  /**
   * Build compatibility rules for different change type combinations
   */
  buildCompatibilityRules() {
    return new Map([
      // Compatible combinations (can auto-merge)
      [
        `${ChangeType.IMPORT_ADDED}:${ChangeType.IMPORT_ADDED}`,
        {
          compatible: true,
          strategy: MergeStrategy.COMBINE,
          reason: 'Different imports can coexist',
        },
      ],
      [
        `${ChangeType.FUNCTION_ADDED}:${ChangeType.FUNCTION_ADDED}`,
        {
          compatible: true,
          strategy: MergeStrategy.COMBINE,
          reason: 'Different functions can coexist',
        },
      ],
      [
        `${ChangeType.FUNCTION_ADDED}:${ChangeType.IMPORT_ADDED}`,
        {
          compatible: true,
          strategy: MergeStrategy.COMBINE,
          reason: 'Function and import additions are independent',
        },
      ],
      [
        `${ChangeType.CLASS_ADDED}:${ChangeType.FUNCTION_ADDED}`,
        {
          compatible: true,
          strategy: MergeStrategy.COMBINE,
          reason: 'Class and function additions are independent',
        },
      ],

      // Incompatible combinations (need resolution)
      [
        `${ChangeType.FUNCTION_MODIFIED}:${ChangeType.FUNCTION_MODIFIED}`,
        {
          compatible: false,
          strategy: MergeStrategy.AI_REQUIRED,
          severity: ConflictSeverity.MEDIUM,
          reason: 'Same function modified by multiple tasks',
        },
      ],
      [
        `${ChangeType.CLASS_MODIFIED}:${ChangeType.CLASS_MODIFIED}`,
        {
          compatible: false,
          strategy: MergeStrategy.AI_REQUIRED,
          severity: ConflictSeverity.HIGH,
          reason: 'Same class modified by multiple tasks',
        },
      ],
      [
        `${ChangeType.FUNCTION_REMOVED}:${ChangeType.FUNCTION_MODIFIED}`,
        {
          compatible: false,
          strategy: MergeStrategy.HUMAN_REQUIRED,
          severity: ConflictSeverity.CRITICAL,
          reason: 'Function removed by one task, modified by another',
        },
      ],
      [
        `${ChangeType.IMPORT_REMOVED}:${ChangeType.IMPORT_MODIFIED}`,
        {
          compatible: false,
          strategy: MergeStrategy.AI_REQUIRED,
          severity: ConflictSeverity.MEDIUM,
          reason: 'Import removed by one task, modified by another',
        },
      ],
    ]);
  }

  /**
   * Detect conflicts between multiple task analyses
   * @param {Object} taskAnalyses - Map of taskId -> FileAnalysis
   * @returns {Array} List of conflict regions
   */
  detectConflicts(taskAnalyses) {
    const conflicts = [];
    const taskIds = Object.keys(taskAnalyses);

    if (taskIds.length < 2) {
      return conflicts;
    }

    // Compare each pair of tasks
    for (let i = 0; i < taskIds.length; i++) {
      for (let j = i + 1; j < taskIds.length; j++) {
        const taskA = taskIds[i];
        const taskB = taskIds[j];
        const analysisA = taskAnalyses[taskA];
        const analysisB = taskAnalyses[taskB];

        // Find overlapping changes
        const taskConflicts = this.findOverlappingChanges(
          taskA,
          analysisA.changes,
          taskB,
          analysisB.changes,
          analysisA.filePath
        );

        conflicts.push(...taskConflicts);
      }
    }

    return conflicts;
  }

  /**
   * Find overlapping changes between two tasks
   */
  findOverlappingChanges(taskA, changesA, taskB, changesB, filePath) {
    const conflicts = [];

    for (const changeA of changesA) {
      for (const changeB of changesB) {
        // Check if changes affect the same target
        if (changeA.target === changeB.target || changeA.location === changeB.location) {
          const ruleKey = `${changeA.changeType}:${changeB.changeType}`;
          const reverseKey = `${changeB.changeType}:${changeA.changeType}`;

          const rule = this.rules.get(ruleKey) || this.rules.get(reverseKey);

          if (rule && !rule.compatible) {
            conflicts.push({
              filePath,
              location: changeA.location || changeB.location,
              tasksInvolved: [taskA, taskB],
              changeTypes: [changeA.changeType, changeB.changeType],
              targets: [changeA.target, changeB.target],
              severity: rule.severity || ConflictSeverity.MEDIUM,
              mergeStrategy: rule.strategy,
              reason: rule.reason,
              canAutoMerge: rule.strategy === MergeStrategy.COMBINE,
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Get compatibility information for two change types
   */
  getCompatibility(changeTypeA, changeTypeB) {
    const key = `${changeTypeA}:${changeTypeB}`;
    const reverseKey = `${changeTypeB}:${changeTypeA}`;
    return (
      this.rules.get(key) ||
      this.rules.get(reverseKey) || {
        compatible: false,
        strategy: MergeStrategy.AI_REQUIRED,
        severity: ConflictSeverity.MEDIUM,
        reason: 'Unknown change type combination',
      }
    );
  }
}

// ============================================================================
// AUTO MERGER
// ============================================================================

class AutoMerger {
  /**
   * Attempt to automatically merge changes without AI
   * @param {Object} conflict - Conflict region
   * @param {string} baseContent - Original file content
   * @param {Object} taskContents - Map of taskId -> modified content
   * @returns {Object} MergeResult
   */
  tryAutoMerge(conflict, baseContent, taskContents) {
    const { mergeStrategy, changeTypes, targets } = conflict;

    // Only handle COMBINE strategy automatically
    if (mergeStrategy !== MergeStrategy.COMBINE) {
      return {
        success: false,
        reason: 'Strategy requires AI resolution',
      };
    }

    // Handle import combinations
    if (changeTypes.every((ct) => ct.includes('import_added'))) {
      return this.combineImports(baseContent, taskContents);
    }

    // Handle function additions
    if (changeTypes.every((ct) => ct === ChangeType.FUNCTION_ADDED)) {
      return this.combineFunctions(baseContent, taskContents, targets);
    }

    return {
      success: false,
      reason: 'No auto-merge strategy available for this change combination',
    };
  }

  /**
   * Combine import statements from multiple tasks
   */
  combineImports(baseContent, taskContents) {
    const allImports = new Set();
    const importRegex = /^(?:import\s+.+|from\s+.+import\s+.+)$/gm;

    // Collect all imports from all versions
    for (const content of Object.values(taskContents)) {
      const matches = content.match(importRegex) || [];
      matches.forEach((imp) => allImports.add(imp.trim()));
    }

    // Sort imports
    const sortedImports = Array.from(allImports).sort();

    // Replace imports in base content
    let result = baseContent.replace(importRegex, '');

    // Find first non-empty, non-comment line to insert imports
    const lines = result.split('\n');
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].trim() &&
        !lines[i].trim().startsWith('//') &&
        !lines[i].trim().startsWith('#')
      ) {
        insertIndex = i;
        break;
      }
    }

    lines.splice(insertIndex, 0, ...sortedImports, '');

    return {
      success: true,
      mergedContent: lines.join('\n'),
      decision: MergeDecision.AUTO_MERGED,
      explanation: `Combined ${allImports.size} imports from ${Object.keys(taskContents).length} tasks`,
    };
  }

  /**
   * Combine function additions from multiple tasks
   */
  combineFunctions(baseContent, taskContents, functionNames) {
    // This is a simplified version - real implementation would parse AST
    let mergedContent = baseContent;

    for (const [taskId, content] of Object.entries(taskContents)) {
      for (const funcName of functionNames) {
        // Check if function exists in this task's content but not in merged
        const funcRegex = new RegExp(
          `(?:export\\s+)?(?:async\\s+)?function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`,
          'g'
        );

        const match = content.match(funcRegex);
        if (match && !mergedContent.includes(`function ${funcName}`)) {
          // Append function to merged content
          mergedContent += '\n\n' + match[0];
        }
      }
    }

    return {
      success: true,
      mergedContent,
      decision: MergeDecision.AUTO_MERGED,
      explanation: `Combined ${functionNames.length} function additions`,
    };
  }
}

// ============================================================================
// AI RESOLVER
// ============================================================================

class AIResolver {
  constructor(config = {}) {
    this.maxContextTokens = config.maxContextTokens || 4000;
    this.confidenceThreshold = config.confidenceThreshold || 0.7;
    this.callCount = 0;
    this.totalTokens = 0;
  }

  /**
   * Resolve a conflict using AI (Claude CLI)
   * @param {Object} conflict - Conflict region
   * @param {string} baseContent - Original content
   * @param {Object} taskSnapshots - Task changes and intents
   * @returns {Promise<Object>} MergeResult
   */
  async resolveConflict(conflict, baseContent, taskSnapshots) {
    const context = this.buildContext(conflict, baseContent, taskSnapshots);

    // Check token limit
    const estimatedTokens = Math.ceil(context.length / 4);
    if (estimatedTokens > this.maxContextTokens) {
      return {
        decision: MergeDecision.NEEDS_HUMAN_REVIEW,
        reason: `Context too large (${estimatedTokens} tokens)`,
        conflict,
      };
    }

    const prompt = this.buildMergePrompt(conflict, context);

    try {
      const response = await this.callClaude(prompt);
      this.callCount++;
      this.totalTokens += estimatedTokens;

      const mergedCode = this.extractCodeBlock(response);

      if (mergedCode) {
        return {
          decision: MergeDecision.AI_MERGED,
          mergedContent: mergedCode,
          explanation: `AI resolved conflict at ${conflict.location}`,
          confidence: this.assessConfidence(response),
          aiCallsMade: 1,
          tokensUsed: estimatedTokens,
        };
      } else {
        return {
          decision: MergeDecision.NEEDS_HUMAN_REVIEW,
          reason: 'Could not parse AI response',
          rawResponse: response,
          conflict,
        };
      }
    } catch (error) {
      return {
        decision: MergeDecision.FAILED,
        error: error.message,
        conflict,
      };
    }
  }

  /**
   * Build context for AI resolution
   */
  buildContext(conflict, baseContent, taskSnapshots) {
    let context = `## Conflict Location\n`;
    context += `File: ${conflict.filePath}\n`;
    context += `Location: ${conflict.location}\n`;
    context += `Severity: ${conflict.severity}\n\n`;

    context += `## Original Code (baseline)\n\`\`\`\n${baseContent}\n\`\`\`\n\n`;

    context += `## Task Changes\n`;
    for (const [taskId, snapshot] of Object.entries(taskSnapshots)) {
      if (conflict.tasksInvolved.includes(taskId)) {
        context += `### ${taskId}\n`;
        context += `Intent: ${snapshot.intent || 'Not specified'}\n`;
        context += `Changes: ${snapshot.changes?.map((c) => c.changeType).join(', ')}\n`;
        context += `\`\`\`\n${snapshot.content || ''}\n\`\`\`\n\n`;
      }
    }

    return context;
  }

  /**
   * Build the merge prompt for Claude
   */
  buildMergePrompt(conflict, context) {
    return `You are a code merge specialist. Your task is to merge conflicting changes from multiple development tasks into a single coherent result.

${context}

## Instructions
1. Analyze the intent of each task's changes
2. Preserve the functionality from ALL tasks where possible
3. Resolve any syntactic conflicts
4. Ensure the merged code is valid and follows best practices
5. If changes are incompatible, prioritize based on the apparent importance

## Output
Provide ONLY the merged code in a code block. No explanations outside the code block.

\`\`\`
// Your merged code here
\`\`\``;
  }

  /**
   * Call Claude CLI for merge resolution
   */
  async callClaude(prompt) {
    return new Promise((resolve, reject) => {
      try {
        // Use Claude CLI in print mode
        const result = execSync(
          `claude --print --dangerously-skip-permissions -p "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
          {
            encoding: 'utf8',
            maxBuffer: 10 * 1024 * 1024,
            timeout: 120000,
          }
        );
        resolve(result);
      } catch (error) {
        reject(new Error(`Claude CLI error: ${error.message}`));
      }
    });
  }

  /**
   * Extract code block from AI response
   */
  extractCodeBlock(response) {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);
    return match ? match[1].trim() : null;
  }

  /**
   * Assess confidence in AI resolution
   */
  assessConfidence(response) {
    // Simple heuristic based on response characteristics
    const hasCodeBlock = /```[\s\S]*```/.test(response);
    const hasExplanation = response.length > 500;
    const noErrorIndicators = !/(error|failed|cannot|unable)/i.test(response);

    let confidence = 0.5;
    if (hasCodeBlock) confidence += 0.3;
    if (noErrorIndicators) confidence += 0.15;
    if (hasExplanation) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      callsMade: this.callCount,
      estimatedTokensUsed: this.totalTokens,
    };
  }
}

// ============================================================================
// SEMANTIC MERGE ENGINE (ORCHESTRATOR)
// ============================================================================

class SemanticMergeEngine extends EventEmitter {
  constructor(config = {}) {
    super();

    this.rootPath = config.rootPath || process.cwd();
    this.enableAI = config.enableAI !== false;
    this.dryRun = config.dryRun || false;
    this.confidenceThreshold = config.confidenceThreshold || 0.7;

    // Initialize components
    this.analyzer = new SemanticAnalyzer();
    this.detector = new ConflictDetector();
    this.autoMerger = new AutoMerger();
    this.aiResolver = new AIResolver({
      maxContextTokens: config.maxContextTokens || 4000,
      confidenceThreshold: this.confidenceThreshold,
    });

    // Storage
    this.storageDir = config.storageDir || path.join(this.rootPath, '.aios', 'merge');
  }

  /**
   * Merge changes from multiple task worktrees
   * @param {Array} taskRequests - Array of { taskId, worktreePath, branch }
   * @param {string} targetBranch - Branch to merge into
   * @returns {Promise<Object>} MergeReport
   */
  async merge(taskRequests, targetBranch = 'main') {
    const report = {
      startedAt: new Date().toISOString(),
      tasks: taskRequests.map((t) => t.taskId),
      targetBranch,
      filesAnalyzed: 0,
      conflictsDetected: 0,
      autoMerged: 0,
      aiMerged: 0,
      needsHumanReview: 0,
      failed: 0,
      results: [],
      errors: [],
    };

    this.emit('merge_started', { tasks: report.tasks, targetBranch });

    try {
      // Step 1: Get baseline (target branch content)
      const baseline = await this.getBaseline(targetBranch);

      // Step 2: Get changes from each task
      const taskSnapshots = {};
      for (const request of taskRequests) {
        taskSnapshots[request.taskId] = await this.getTaskSnapshot(request);
      }

      // Step 3: Find modified files across all tasks
      const modifiedFiles = this.findModifiedFiles(taskSnapshots);
      report.filesAnalyzed = modifiedFiles.size;

      // Step 4: Process each file
      for (const filePath of modifiedFiles) {
        const fileResult = await this.mergeFile(filePath, baseline[filePath] || '', taskSnapshots);

        report.results.push(fileResult);

        switch (fileResult.decision) {
          case MergeDecision.AUTO_MERGED:
            report.autoMerged++;
            break;
          case MergeDecision.AI_MERGED:
            report.aiMerged++;
            break;
          case MergeDecision.NEEDS_HUMAN_REVIEW:
            report.needsHumanReview++;
            break;
          case MergeDecision.FAILED:
            report.failed++;
            break;
        }
      }

      // Step 5: Apply merged changes (if not dry run)
      if (!this.dryRun) {
        await this.applyMergedChanges(report.results);
      }

      report.completedAt = new Date().toISOString();
      report.status =
        report.failed === 0 && report.needsHumanReview === 0
          ? 'success'
          : report.needsHumanReview > 0
            ? 'needs_review'
            : 'partial';

      this.emit('merge_completed', report);

      // Save report
      await this.saveReport(report);

      return report;
    } catch (error) {
      report.errors.push(error.message);
      report.status = 'error';
      report.completedAt = new Date().toISOString();

      this.emit('merge_error', { error: error.message });

      return report;
    }
  }

  /**
   * Merge a single file from multiple tasks
   */
  async mergeFile(filePath, baseContent, taskSnapshots) {
    this.emit('file_processing', { filePath });

    // Step 1: Analyze changes from each task
    const taskAnalyses = {};
    const taskContents = {};

    for (const [taskId, snapshot] of Object.entries(taskSnapshots)) {
      const taskContent = snapshot.files?.[filePath];
      if (taskContent !== undefined) {
        taskAnalyses[taskId] = this.analyzer.analyzeDiff(
          filePath,
          baseContent,
          taskContent,
          taskId
        );
        taskContents[taskId] = taskContent;
      }
    }

    // If only one task modified the file, no conflict
    if (Object.keys(taskAnalyses).length <= 1) {
      const [taskId, content] = Object.entries(taskContents)[0] || [null, baseContent];
      return {
        filePath,
        decision: MergeDecision.AUTO_MERGED,
        mergedContent: content,
        explanation: taskId ? `Single task ${taskId} modified file` : 'No changes',
      };
    }

    // Step 2: Detect conflicts
    const conflicts = this.detector.detectConflicts(taskAnalyses);

    if (conflicts.length === 0) {
      // No conflicts - combine all changes
      const combined = this.combineNonConflictingChanges(baseContent, taskContents, taskAnalyses);
      return {
        filePath,
        decision: MergeDecision.AUTO_MERGED,
        mergedContent: combined,
        explanation: 'No conflicts detected, changes combined',
      };
    }

    // Step 3: Try auto-merge for each conflict
    const results = [];
    for (const conflict of conflicts) {
      const autoResult = this.autoMerger.tryAutoMerge(conflict, baseContent, taskContents);

      if (autoResult.success) {
        results.push({
          conflict,
          result: autoResult,
          decision: MergeDecision.AUTO_MERGED,
        });
      } else if (this.enableAI && conflict.mergeStrategy === MergeStrategy.AI_REQUIRED) {
        // Step 4: Use AI for complex conflicts
        const aiResult = await this.aiResolver.resolveConflict(
          conflict,
          baseContent,
          taskSnapshots
        );
        results.push({
          conflict,
          result: aiResult,
          decision: aiResult.decision,
        });
      } else {
        results.push({
          conflict,
          result: { reason: 'No auto-merge strategy and AI disabled' },
          decision: MergeDecision.NEEDS_HUMAN_REVIEW,
        });
      }
    }

    // Determine overall file decision
    const decisions = results.map((r) => r.decision);
    let finalDecision;
    let finalContent = baseContent;

    if (decisions.every((d) => d === MergeDecision.AUTO_MERGED || d === MergeDecision.AI_MERGED)) {
      finalDecision = decisions.includes(MergeDecision.AI_MERGED)
        ? MergeDecision.AI_MERGED
        : MergeDecision.AUTO_MERGED;

      // Apply all successful merges
      for (const r of results) {
        if (r.result.mergedContent) {
          finalContent = r.result.mergedContent;
        }
      }
    } else if (decisions.includes(MergeDecision.FAILED)) {
      finalDecision = MergeDecision.FAILED;
    } else {
      finalDecision = MergeDecision.NEEDS_HUMAN_REVIEW;
    }

    return {
      filePath,
      decision: finalDecision,
      mergedContent: finalContent,
      conflicts: results,
      explanation: `${results.length} conflicts processed`,
    };
  }

  /**
   * Combine non-conflicting changes from multiple tasks
   */
  combineNonConflictingChanges(baseContent, taskContents, taskAnalyses) {
    // Simple strategy: use the most changed version
    let maxChanges = 0;
    let bestContent = baseContent;

    for (const [taskId, analysis] of Object.entries(taskAnalyses)) {
      if (analysis.changes.length > maxChanges) {
        maxChanges = analysis.changes.length;
        bestContent = taskContents[taskId];
      }
    }

    return bestContent;
  }

  /**
   * Get baseline content from target branch
   */
  async getBaseline(branch) {
    const files = {};

    try {
      // Get list of files
      const fileList = execSync(`git ls-tree -r --name-only ${branch}`, {
        cwd: this.rootPath,
        encoding: 'utf8',
      })
        .trim()
        .split('\n');

      for (const filePath of fileList) {
        if (this.shouldProcessFile(filePath)) {
          try {
            const content = execSync(`git show ${branch}:${filePath}`, {
              cwd: this.rootPath,
              encoding: 'utf8',
            });
            files[filePath] = content;
          } catch {
            // File might not exist in this branch
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not get baseline from ${branch}: ${error.message}`);
    }

    return files;
  }

  /**
   * Get snapshot of task changes
   */
  async getTaskSnapshot(request) {
    const { taskId, worktreePath, branch, intent } = request;
    const snapshot = {
      taskId,
      intent,
      files: {},
      changes: [],
    };

    const workDir = worktreePath || this.rootPath;

    try {
      // Get modified files in this task
      const diffOutput = execSync(`git diff --name-only ${branch || 'main'}...HEAD`, {
        cwd: workDir,
        encoding: 'utf8',
      }).trim();

      const modifiedFiles = diffOutput ? diffOutput.split('\n') : [];

      for (const filePath of modifiedFiles) {
        if (this.shouldProcessFile(filePath)) {
          try {
            const fullPath = path.join(workDir, filePath);
            if (fs.existsSync(fullPath)) {
              snapshot.files[filePath] = fs.readFileSync(fullPath, 'utf8');
            }
          } catch {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not get snapshot for ${taskId}: ${error.message}`);
    }

    return snapshot;
  }

  /**
   * Find all files modified across tasks
   */
  findModifiedFiles(taskSnapshots) {
    const files = new Set();

    for (const snapshot of Object.values(taskSnapshots)) {
      for (const filePath of Object.keys(snapshot.files || {})) {
        files.add(filePath);
      }
    }

    return files;
  }

  /**
   * Check if file should be processed
   */
  shouldProcessFile(filePath) {
    const skipPatterns = [
      /node_modules/,
      /\.git/,
      /package-lock\.json/,
      /yarn\.lock/,
      /\.log$/,
      /\.min\./,
      /dist\//,
      /build\//,
    ];

    return !skipPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Apply merged changes to files
   */
  async applyMergedChanges(results) {
    for (const result of results) {
      if (
        result.mergedContent &&
        (result.decision === MergeDecision.AUTO_MERGED ||
          result.decision === MergeDecision.AI_MERGED)
      ) {
        const fullPath = path.join(this.rootPath, result.filePath);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, result.mergedContent, 'utf8');
        this.emit('file_merged', { filePath: result.filePath, decision: result.decision });
      }
    }
  }

  /**
   * Save merge report
   */
  async saveReport(report) {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }

    const reportPath = path.join(
      this.storageDir,
      `merge-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Also save latest
    const latestPath = path.join(this.storageDir, 'merge-report-latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
  }

  /**
   * Get AI resolver statistics
   */
  getAIStats() {
    return this.aiResolver.getStats();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = SemanticMergeEngine;
module.exports.SemanticMergeEngine = SemanticMergeEngine;
module.exports.SemanticAnalyzer = SemanticAnalyzer;
module.exports.ConflictDetector = ConflictDetector;
module.exports.AutoMerger = AutoMerger;
module.exports.AIResolver = AIResolver;

// Enums
module.exports.ChangeType = ChangeType;
module.exports.MergeStrategy = MergeStrategy;
module.exports.ConflictSeverity = ConflictSeverity;
module.exports.MergeDecision = MergeDecision;
