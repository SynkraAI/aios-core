'use strict';

const fs = require('fs');
const path = require('path');

const CASES = [
  ['.aiox-core/cli/commands/sdc/index.js', 'createSdcCommand'],
  ['.aiox-core/cli/commands/wave/index.js', 'createWaveCommand'],
  ['.aiox-core/core/permissions/path-guard.js', 'isWriteAllowed'],
  ['.aiox-core/core/permissions/path-guard.js', 'getDenyList'],
  ['.aiox-core/core/synapse/engine.js', 'resolvePipelineTimeoutMs'],
  ['.aiox-core/core/orchestration/terminal-spawner.js', 'validateArgs'],
  ['.aiox-core/core/sdc/dispatch-adapter.js', 'createDispatchAdapter'],
  ['.aiox-core/core/sdc/index.js', 'initFullSdc'],
  ['.aiox-core/core/sdc/index.js', 'verifyAndMaybeMark'],
  ['.aiox-core/core/sdc/phase-verify.js', 'verifyPhase'],
  ['.aiox-core/core/sdc/progress.js', 'saveJson'],
  ['.aiox-core/core/sdc/wave-run.js', 'refreshStoryStatuses'],
  ['.aiox-core/core/sdc/wave-run.js', 'nextOpenBatch'],
  ['.aiox-core/core/sdc/wave-run.js', 'advanceWave'],
  ['.aiox-core/core/sdc/wave-run.js', 'runWaveBatch'],
  ['.aiox-core/core/sdc/story-meta.js', 'extractQaVerdict'],
  ['.aiox-core/core/sdc/story-meta.js', 'extractQaEvidence'],
  ['.aiox-core/core/sdc/story-meta.js', 'resolveQaEvidence'],
  ['.aiox-core/core/sdc/progress.js', 'markPhase'],
  ['.aiox-core/core/permissions/dispatch-governance.js', 'validateBudgetCeiling'],
  ['.aiox-core/core/permissions/dispatch-governance.js', 'scanAutomatedIntent'],
  ['.aiox-core/core/permissions/dispatch-governance.js', 'validateStoryBinding'],
  ['.aiox-core/core/permissions/dispatch-governance.js', 'assertDispatchGovernance'],
  ['.aiox-core/infrastructure/scripts/pre-dispatch-guard.js', 'loadContext'],
  ['.aiox-core/infrastructure/scripts/pre-dispatch-guard.js', 'run'],
  ['.aiox-core/infrastructure/scripts/pre-dispatch-guard.js', 'main'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'parseArgs'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'resolveSibling'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'indexCoreTree'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'comparePair'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'classifyThreeWay'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'classifyByWave'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'scanTreeDenylist'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'formatReport'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'buildResult'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'main'],
  ['.aiox-core/infrastructure/scripts/framework-3way-diff.js', 'isOssWins'],
];

const SYMBOL_CASES = [
  [
    '.aiox-core/core/permissions/dispatch-governance.js',
    'class DispatchGovernanceError',
    '@class',
  ],
  [
    '.aiox-core/core/permissions/dispatch-governance.js',
    'const IMPLEMENTATION_TASK_PATTERN',
    '@type',
  ],
  [
    '.aiox-core/core/permissions/dispatch-governance.js',
    'const INTENT_PATTERNS',
    '@type',
  ],
  [
    '.aiox-core/infrastructure/scripts/framework-3way-diff.js',
    'const OSS_WINS_PREFIXES',
    '@type',
  ],
  [
    '.aiox-core/infrastructure/scripts/framework-3way-diff.js',
    'const WAVE_PREFIXES',
    '@type',
  ],
];

describe('Core Super Update public API contracts', () => {
  test.each(CASES)('%s documents exported function %s with JSDoc', (file, name) => {
    const source = fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8');
    const declaration = source.indexOf(`function ${name}(`);
    expect(declaration).toBeGreaterThan(0);
    const prefix = source.slice(Math.max(0, declaration - 1200), declaration);
    const start = prefix.lastIndexOf('/**');
    const end = prefix.lastIndexOf('*/');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const jsdoc = prefix.slice(start, end + 2);
    expect(jsdoc).toMatch(/@returns?/);
  });

  test.each(SYMBOL_CASES)(
    '%s documents exported symbol %s with JSDoc',
    (file, declarationText, requiredTag) => {
      const source = fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8');
      const declaration = source.indexOf(declarationText);
      expect(declaration).toBeGreaterThan(0);
      const prefix = source.slice(Math.max(0, declaration - 800), declaration);
      const start = prefix.lastIndexOf('/**');
      const end = prefix.lastIndexOf('*/');
      expect(start).toBeGreaterThan(-1);
      expect(end).toBeGreaterThan(start);
      expect(prefix.slice(start, end + 2)).toContain(requiredTag);
    },
  );
});
