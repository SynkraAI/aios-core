/**
 * Unit tests for gate-evaluator module
 *
 * Tests the GateEvaluator class that evaluates quality gates
 * between epics to prevent bad outputs from propagating.
 */

jest.mock('fs-extra');
jest.mock('js-yaml');

const fs = require('fs-extra');
const yaml = require('js-yaml');

const {
  GateEvaluator,
  GateVerdict,
  DEFAULT_GATE_CONFIG,
} = require('../../../.aios-core/core/orchestration/gate-evaluator');

describe('GateEvaluator', () => {
  let evaluator;

  beforeEach(() => {
    jest.resetAllMocks();
    evaluator = new GateEvaluator({ projectRoot: '/project' });
  });

  // ============================================================
  // Exports & Constants
  // ============================================================
  describe('exports', () => {
    test('exports GateVerdict enum', () => {
      expect(GateVerdict.APPROVED).toBe('approved');
      expect(GateVerdict.NEEDS_REVISION).toBe('needs_revision');
      expect(GateVerdict.BLOCKED).toBe('blocked');
    });

    test('exports DEFAULT_GATE_CONFIG', () => {
      expect(DEFAULT_GATE_CONFIG.epic3_to_epic4).toBeDefined();
      expect(DEFAULT_GATE_CONFIG.epic4_to_epic6).toBeDefined();
      expect(DEFAULT_GATE_CONFIG.epic3_to_epic4.checks).toContain('spec_exists');
      expect(DEFAULT_GATE_CONFIG.epic4_to_epic6.requireTests).toBe(true);
    });
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets defaults', () => {
      expect(evaluator.projectRoot).toBe('/project');
      expect(evaluator.strictMode).toBe(false);
      expect(evaluator.gateConfig).toBeNull();
      expect(evaluator.results).toEqual([]);
      expect(evaluator.logs).toEqual([]);
    });

    test('uses process.cwd when no projectRoot given', () => {
      const ev = new GateEvaluator();
      expect(ev.projectRoot).toBe(process.cwd());
    });

    test('accepts strictMode and custom gateConfig', () => {
      const custom = { myGate: { blocking: true } };
      const ev = new GateEvaluator({ strictMode: true, gateConfig: custom });
      expect(ev.strictMode).toBe(true);
      expect(ev.gateConfig).toBe(custom);
    });
  });

  // ============================================================
  // _loadConfig (private, tested through evaluate)
  // ============================================================
  describe('config loading', () => {
    test('uses custom gateConfig when provided', async () => {
      const custom = { epic3_to_epic4: { blocking: false, checks: [] } };
      const ev = new GateEvaluator({ projectRoot: '/p', gateConfig: custom });

      const result = await ev.evaluate(3, 4, {});
      expect(result.config).toEqual({ blocking: false, checks: [] });
    });

    test('loads config from core-config.yaml', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('yaml content');
      yaml.load.mockReturnValue({
        autoClaude: {
          orchestrator: {
            gates: {
              epic3_to_epic4: { blocking: true, checks: ['custom_check'], minScore: 4 },
            },
          },
        },
      });

      const result = await evaluator.evaluate(3, 4, {});
      // Should merge with defaults
      expect(result.config.checks).toContain('custom_check');
    });

    test('falls back to DEFAULT_GATE_CONFIG when no config file', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await evaluator.evaluate(3, 4, { specPath: '/spec.md', complexity: 'low' });
      expect(result.config).toEqual(DEFAULT_GATE_CONFIG.epic3_to_epic4);
    });

    test('falls back to defaults on config load error', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockRejectedValue(new Error('read error'));

      const result = await evaluator.evaluate(3, 4, { specPath: '/s' });
      // Should still work with defaults
      expect(result.verdict).toBeDefined();
    });
  });

  // ============================================================
  // _getGateKey
  // ============================================================
  describe('gate key generation', () => {
    test('generates correct gate key', () => {
      expect(evaluator._getGateKey(3, 4)).toBe('epic3_to_epic4');
      expect(evaluator._getGateKey(4, 6)).toBe('epic4_to_epic6');
    });
  });

  // ============================================================
  // evaluate - Epic 3 checks
  // ============================================================
  describe('evaluate - epic 3 checks', () => {
    beforeEach(() => {
      fs.pathExists.mockResolvedValue(false);
    });

    test('APPROVED when all checks pass', async () => {
      const epicResult = {
        specPath: '/specs/design.md',
        complexity: 'medium',
        requirements: ['R1', 'R2'],
        score: 4.0,
      };

      const result = await evaluator.evaluate(3, 4, epicResult);
      expect(result.verdict).toBe(GateVerdict.APPROVED);
      expect(result.gate).toBe('epic3_to_epic4');
      expect(result.fromEpic).toBe(3);
      expect(result.toEpic).toBe(4);
      expect(result.score).toBe(5); // all passed
      expect(result.issues).toHaveLength(0);
    });

    test('spec_exists passes with artifacts', async () => {
      const epicResult = {
        artifacts: [{ type: 'spec', path: '/spec.md' }],
        complexity: 'high',
        requirements: ['R1'],
        score: 4.0,
      };

      const result = await evaluator.evaluate(3, 4, epicResult);
      const specCheck = result.checks.find((c) => c.name === 'spec_exists');
      expect(specCheck.passed).toBe(true);
    });

    test('spec_exists fails when no spec', async () => {
      const epicResult = {
        complexity: 'low',
        requirements: ['R1'],
        score: 4.0,
      };

      const result = await evaluator.evaluate(3, 4, epicResult);
      const specCheck = result.checks.find((c) => c.name === 'spec_exists');
      expect(specCheck.passed).toBe(false);
      expect(specCheck.severity).toBe('critical');
    });

    test('complexity_assessed fails when missing', async () => {
      const epicResult = {
        specPath: '/s',
        requirements: ['R1'],
        score: 4.0,
      };

      const result = await evaluator.evaluate(3, 4, epicResult);
      const complexityCheck = result.checks.find((c) => c.name === 'complexity_assessed');
      expect(complexityCheck.passed).toBe(false);
    });

    test('requirements_defined fails when empty', async () => {
      const epicResult = {
        specPath: '/s',
        complexity: 'low',
        requirements: [],
        score: 4.0,
      };

      const result = await evaluator.evaluate(3, 4, epicResult);
      const reqCheck = result.checks.find((c) => c.name === 'requirements_defined');
      expect(reqCheck.passed).toBe(false);
    });

    test('minScore check added when epicResult has score', async () => {
      const epicResult = {
        specPath: '/s',
        complexity: 'low',
        requirements: ['R1'],
        score: 2.0,
      };

      const result = await evaluator.evaluate(3, 4, epicResult);
      const scoreCheck = result.checks.find((c) => c.name === 'min_score');
      expect(scoreCheck).toBeDefined();
      expect(scoreCheck.passed).toBe(false);
      expect(scoreCheck.message).toContain('2');
    });

    test('minScore check not added when epicResult has no score', async () => {
      const epicResult = {
        specPath: '/s',
        complexity: 'low',
        requirements: ['R1'],
      };

      const result = await evaluator.evaluate(3, 4, epicResult);
      const scoreCheck = result.checks.find((c) => c.name === 'min_score');
      expect(scoreCheck).toBeUndefined();
    });
  });

  // ============================================================
  // evaluate - Epic 4 checks
  // ============================================================
  describe('evaluate - epic 4 checks', () => {
    beforeEach(() => {
      fs.pathExists.mockResolvedValue(false);
    });

    test('APPROVED when all checks pass', async () => {
      const epicResult = {
        planPath: '/plan.md',
        implementationPath: '/src/index.js',
        errors: [],
        testResults: [{ name: 'test1', passed: true }],
        testsRun: 1,
      };

      const result = await evaluator.evaluate(4, 6, epicResult);
      expect(result.verdict).toBe(GateVerdict.APPROVED);
    });

    test('plan_complete passes with planComplete flag', async () => {
      const epicResult = {
        planComplete: true,
        codeChanges: ['/src/file.js'],
        errors: [],
        testResults: [{ name: 'test1', passed: true }],
        testsRun: 1,
      };

      const result = await evaluator.evaluate(4, 6, epicResult);
      const planCheck = result.checks.find((c) => c.name === 'plan_complete');
      expect(planCheck.passed).toBe(true);
    });

    test('implementation_exists passes with codeChanges', async () => {
      const epicResult = {
        planPath: '/plan.md',
        codeChanges: ['/src/a.js', '/src/b.js'],
        errors: [],
        testResults: [{ name: 'test1', passed: true }],
        testsRun: 1,
      };

      const result = await evaluator.evaluate(4, 6, epicResult);
      const implCheck = result.checks.find((c) => c.name === 'implementation_exists');
      expect(implCheck.passed).toBe(true);
    });

    test('no_critical_errors fails with critical errors', async () => {
      const epicResult = {
        planPath: '/p',
        implementationPath: '/src',
        errors: [{ severity: 'critical', message: 'Fatal crash' }],
        testResults: [{ name: 't', passed: true }],
        testsRun: 1,
      };

      const result = await evaluator.evaluate(4, 6, epicResult);
      const errorCheck = result.checks.find((c) => c.name === 'no_critical_errors');
      expect(errorCheck.passed).toBe(false);
      expect(errorCheck.severity).toBe('critical');
    });

    test('requireTests check added when testResults present', async () => {
      const epicResult = {
        planPath: '/p',
        implementationPath: '/src',
        errors: [],
        testResults: [{ name: 't', passed: true }],
        testsRun: 1,
      };

      const result = await evaluator.evaluate(4, 6, epicResult);
      const testCheck = result.checks.find((c) => c.name === 'require_tests');
      expect(testCheck).toBeDefined();
      expect(testCheck.passed).toBe(true);
    });

    test('requireTests skipped when testResults has skipped flag', async () => {
      const epicResult = {
        planPath: '/p',
        implementationPath: '/src',
        errors: [],
        testResults: { skipped: true },
      };

      const result = await evaluator.evaluate(4, 6, epicResult);
      const testCheck = result.checks.find((c) => c.name === 'require_tests');
      expect(testCheck).toBeUndefined();
    });

    test('requireTests fails when no tests run (array)', async () => {
      const epicResult = {
        planPath: '/p',
        implementationPath: '/src',
        errors: [],
        testResults: [],
        testsRun: 0,
      };

      const result = await evaluator.evaluate(4, 6, epicResult);
      const testCheck = result.checks.find((c) => c.name === 'require_tests');
      expect(testCheck).toBeDefined();
      expect(testCheck.passed).toBe(false);
    });
  });

  // ============================================================
  // evaluate - Epic 6 checks (QA)
  // ============================================================
  describe('evaluate - epic 6 checks', () => {
    beforeEach(() => {
      fs.pathExists.mockResolvedValue(false);
      // Use custom config for epic 6 gate
      evaluator.gateConfig = {
        epic6_to_epic7: {
          blocking: false,
          checks: ['qa_report_exists', 'verdict_generated', 'tests_pass'],
        },
      };
    });

    test('qa_report_exists passes with reportPath', async () => {
      const epicResult = {
        reportPath: '/report.md',
        verdict: 'approved',
        testResults: [{ name: 't1', passed: true }],
      };

      const result = await evaluator.evaluate(6, 7, epicResult);
      const qaCheck = result.checks.find((c) => c.name === 'qa_report_exists');
      expect(qaCheck.passed).toBe(true);
    });

    test('verdict_generated passes with verdict', async () => {
      const epicResult = {
        qaReport: 'Report content',
        verdict: 'needs_work',
        testResults: [{ name: 't', passed: true }],
      };

      const result = await evaluator.evaluate(6, 7, epicResult);
      const verdictCheck = result.checks.find((c) => c.name === 'verdict_generated');
      expect(verdictCheck.passed).toBe(true);
      expect(verdictCheck.message).toContain('needs_work');
    });

    test('tests_pass checks all tests pass', async () => {
      const epicResult = {
        reportPath: '/r',
        verdict: 'ok',
        testResults: [
          { name: 't1', passed: true },
          { name: 't2', passed: false },
        ],
      };

      const result = await evaluator.evaluate(6, 7, epicResult);
      const testsCheck = result.checks.find((c) => c.name === 'tests_pass');
      expect(testsCheck.passed).toBe(false);
      expect(testsCheck.message).toContain('failed');
    });

    test('tests_pass handles empty testResults', async () => {
      const epicResult = { reportPath: '/r', verdict: 'ok', testResults: [] };

      const result = await evaluator.evaluate(6, 7, epicResult);
      const testsCheck = result.checks.find((c) => c.name === 'tests_pass');
      expect(testsCheck.passed).toBe(false);
      expect(testsCheck.message).toContain('No test results');
    });
  });

  // ============================================================
  // evaluate - unknown checks and default checks
  // ============================================================
  describe('evaluate - unknown and default checks', () => {
    test('unknown check passes by default', async () => {
      evaluator.gateConfig = {
        epic3_to_epic4: { blocking: false, checks: ['future_check'] },
      };

      const result = await evaluator.evaluate(3, 4, {});
      const unknownCheck = result.checks.find((c) => c.name === 'future_check');
      expect(unknownCheck.passed).toBe(true);
      expect(unknownCheck.message).toContain('Unknown check');
    });

    test('uses default checks when gate has no config', async () => {
      fs.pathExists.mockResolvedValue(false);
      // Epic 3 default checks: spec_exists, complexity_assessed
      const ev = new GateEvaluator({ projectRoot: '/p' });

      const result = await ev.evaluate(3, 99, {});
      const checkNames = result.checks.map((c) => c.name);
      expect(checkNames).toContain('spec_exists');
      expect(checkNames).toContain('complexity_assessed');
    });

    test('epic with no default checks returns empty', async () => {
      evaluator.gateConfig = {};
      const result = await evaluator.evaluate(99, 100, {});
      expect(result.checks).toHaveLength(0);
      expect(result.verdict).toBe(GateVerdict.APPROVED);
    });
  });

  // ============================================================
  // evaluate - minTestCoverage
  // ============================================================
  describe('evaluate - minTestCoverage', () => {
    test('adds coverage check when configured and threshold > 0', async () => {
      evaluator.gateConfig = {
        epic4_to_epic6: {
          blocking: false,
          checks: [],
          minTestCoverage: 80,
        },
      };

      const result = await evaluator.evaluate(4, 6, { testCoverage: 90 });
      const covCheck = result.checks.find((c) => c.name === 'min_coverage');
      expect(covCheck.passed).toBe(true);
    });

    test('coverage check fails when below threshold', async () => {
      evaluator.gateConfig = {
        epic4_to_epic6: {
          blocking: false,
          checks: [],
          minTestCoverage: 80,
        },
      };

      const result = await evaluator.evaluate(4, 6, { testCoverage: 50 });
      const covCheck = result.checks.find((c) => c.name === 'min_coverage');
      expect(covCheck.passed).toBe(false);
    });

    test('coverage defaults to 0 when not in epicResult', async () => {
      evaluator.gateConfig = {
        epic4_to_epic6: {
          blocking: false,
          checks: [],
          minTestCoverage: 80,
        },
      };

      const result = await evaluator.evaluate(4, 6, {});
      const covCheck = result.checks.find((c) => c.name === 'min_coverage');
      expect(covCheck.passed).toBe(false);
    });

    test('skips coverage check when minTestCoverage is 0', async () => {
      evaluator.gateConfig = {
        epic4_to_epic6: {
          blocking: false,
          checks: [],
          minTestCoverage: 0,
        },
      };

      const result = await evaluator.evaluate(4, 6, {});
      const covCheck = result.checks.find((c) => c.name === 'min_coverage');
      expect(covCheck).toBeUndefined();
    });
  });

  // ============================================================
  // _determineVerdict
  // ============================================================
  describe('verdict determination', () => {
    test('strict mode: any issue = BLOCKED', async () => {
      const ev = new GateEvaluator({ projectRoot: '/p', strictMode: true });
      ev.gateConfig = {
        epic3_to_epic4: { blocking: false, checks: ['spec_exists'] },
      };

      const result = await ev.evaluate(3, 4, {}); // no spec → fail
      expect(result.verdict).toBe(GateVerdict.BLOCKED);
    });

    test('critical issue always blocks', async () => {
      evaluator.gateConfig = {
        epic3_to_epic4: { blocking: false, checks: ['spec_exists'] },
      };

      const result = await evaluator.evaluate(3, 4, {}); // spec_exists severity=critical
      expect(result.verdict).toBe(GateVerdict.BLOCKED);
    });

    test('high severity issues on blocking gate = BLOCKED', async () => {
      evaluator.gateConfig = {
        epic4_to_epic6: { blocking: true, checks: ['plan_complete'] },
      };

      const result = await evaluator.evaluate(4, 6, {}); // plan_complete severity=high
      expect(result.verdict).toBe(GateVerdict.BLOCKED);
    });

    test('high severity issues on non-blocking gate = NEEDS_REVISION', async () => {
      evaluator.gateConfig = {
        epic4_to_epic6: { blocking: false, checks: ['plan_complete'] },
      };

      const result = await evaluator.evaluate(4, 6, {}); // plan_complete severity=high
      expect(result.verdict).toBe(GateVerdict.NEEDS_REVISION);
    });

    test('allowMinorIssues approves low/medium issues', async () => {
      evaluator.gateConfig = {
        epic3_to_epic4: {
          blocking: false,
          allowMinorIssues: true,
          checks: ['complexity_assessed'],
        },
      };

      const result = await evaluator.evaluate(3, 4, {}); // complexity_assessed severity=medium
      expect(result.verdict).toBe(GateVerdict.APPROVED);
    });

    test('medium issues without allowMinorIssues = NEEDS_REVISION', async () => {
      evaluator.gateConfig = {
        epic3_to_epic4: {
          blocking: false,
          checks: ['complexity_assessed'],
        },
      };

      const result = await evaluator.evaluate(3, 4, {}); // medium severity
      expect(result.verdict).toBe(GateVerdict.NEEDS_REVISION);
    });

    test('evaluate catches errors and returns BLOCKED', async () => {
      evaluator.gateConfig = {
        epic3_to_epic4: { checks: 42 }, // non-iterable triggers TypeError in for-of
      };

      const result = await evaluator.evaluate(3, 4, {});
      expect(result.verdict).toBe(GateVerdict.BLOCKED);
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ check: 'gate_evaluation', severity: 'critical' }),
        ]),
      );
    });
  });

  // ============================================================
  // Score calculation
  // ============================================================
  describe('score calculation', () => {
    test('perfect score when all checks pass', async () => {
      evaluator.gateConfig = {
        epic3_to_epic4: { blocking: false, checks: ['spec_exists', 'complexity_assessed'] },
      };

      const result = await evaluator.evaluate(3, 4, {
        specPath: '/s',
        complexity: 'low',
      });
      expect(result.score).toBe(5);
    });

    test('partial score with some failures', async () => {
      evaluator.gateConfig = {
        epic3_to_epic4: { blocking: false, checks: ['spec_exists', 'complexity_assessed'] },
      };

      const result = await evaluator.evaluate(3, 4, {
        specPath: '/s',
        // no complexity → 1 of 2 pass
      });
      expect(result.score).toBe(2.5);
    });

    test('zero score when all fail', async () => {
      evaluator.gateConfig = {
        epic3_to_epic4: { blocking: false, checks: ['spec_exists', 'complexity_assessed'] },
      };

      const result = await evaluator.evaluate(3, 4, {});
      expect(result.score).toBe(0);
    });

    test('default score 5 when no checks', async () => {
      evaluator.gateConfig = {
        epic99_to_epic100: { blocking: false, checks: [] },
      };

      const result = await evaluator.evaluate(99, 100, {});
      expect(result.score).toBe(5);
    });
  });

  // ============================================================
  // shouldBlock / needsRevision helpers
  // ============================================================
  describe('verdict helpers', () => {
    test('shouldBlock returns true for BLOCKED', () => {
      expect(evaluator.shouldBlock(GateVerdict.BLOCKED)).toBe(true);
      expect(evaluator.shouldBlock(GateVerdict.APPROVED)).toBe(false);
      expect(evaluator.shouldBlock(GateVerdict.NEEDS_REVISION)).toBe(false);
    });

    test('needsRevision returns true for NEEDS_REVISION', () => {
      expect(evaluator.needsRevision(GateVerdict.NEEDS_REVISION)).toBe(true);
      expect(evaluator.needsRevision(GateVerdict.APPROVED)).toBe(false);
      expect(evaluator.needsRevision(GateVerdict.BLOCKED)).toBe(false);
    });
  });

  // ============================================================
  // Results storage (AC6)
  // ============================================================
  describe('results storage', () => {
    beforeEach(() => {
      evaluator.gateConfig = {
        epic3_to_epic4: { blocking: false, checks: [] },
        epic4_to_epic6: { blocking: false, checks: [] },
      };
    });

    test('getResults returns copy of results', async () => {
      await evaluator.evaluate(3, 4, {});
      const results = evaluator.getResults();
      expect(results).toHaveLength(1);
      // Verify it's a copy
      results.push({ fake: true });
      expect(evaluator.getResults()).toHaveLength(1);
    });

    test('getResult finds by gate key', async () => {
      await evaluator.evaluate(3, 4, {});
      await evaluator.evaluate(4, 6, {});

      expect(evaluator.getResult('epic3_to_epic4')).toBeDefined();
      expect(evaluator.getResult('epic4_to_epic6')).toBeDefined();
      expect(evaluator.getResult('nonexistent')).toBeNull();
    });

    test('getSummary calculates stats', async () => {
      evaluator.gateConfig = {
        epic3_to_epic4: { blocking: false, checks: [] },
        epic4_to_epic6: { blocking: false, checks: ['plan_complete'] },
      };

      await evaluator.evaluate(3, 4, {}); // APPROVED (no checks)
      await evaluator.evaluate(4, 6, {}); // NEEDS_REVISION (plan_complete high, non-blocking)

      const summary = evaluator.getSummary();
      expect(summary.total).toBe(2);
      expect(summary.approved).toBe(1);
      expect(summary.needsRevision).toBe(1);
      expect(summary.blocked).toBe(0);
      expect(summary.allPassed).toBe(false);
    });

    test('getSummary with all approved', async () => {
      await evaluator.evaluate(3, 4, {});

      const summary = evaluator.getSummary();
      expect(summary.allPassed).toBe(true);
      expect(summary.averageScore).toBe(5);
    });

    test('getSummary with empty results', () => {
      const summary = evaluator.getSummary();
      expect(summary.total).toBe(0);
      expect(summary.averageScore).toBe(0);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    test('resets results and logs', async () => {
      evaluator.gateConfig = { epic3_to_epic4: { checks: [] } };
      await evaluator.evaluate(3, 4, {});

      expect(evaluator.getResults()).toHaveLength(1);
      expect(evaluator.getLogs().length).toBeGreaterThan(0);

      evaluator.clear();

      expect(evaluator.getResults()).toHaveLength(0);
      expect(evaluator.getLogs()).toHaveLength(0);
    });
  });

  // ============================================================
  // Logging
  // ============================================================
  describe('logging', () => {
    test('logs evaluation steps', async () => {
      evaluator.gateConfig = { epic3_to_epic4: { checks: [] } };
      await evaluator.evaluate(3, 4, {});

      const logs = evaluator.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toHaveProperty('timestamp');
      expect(logs[0]).toHaveProperty('level');
      expect(logs[0]).toHaveProperty('message');
    });

    test('getLogs returns a copy', async () => {
      evaluator.gateConfig = { epic3_to_epic4: { checks: [] } };
      await evaluator.evaluate(3, 4, {});

      const logs = evaluator.getLogs();
      logs.push({ fake: true });
      expect(evaluator.getLogs()).not.toContainEqual({ fake: true });
    });
  });

  // ============================================================
  // Result structure
  // ============================================================
  describe('result structure', () => {
    test('result has all required fields', async () => {
      evaluator.gateConfig = { epic3_to_epic4: { checks: [] } };
      const result = await evaluator.evaluate(3, 4, {});

      expect(result).toHaveProperty('gate', 'epic3_to_epic4');
      expect(result).toHaveProperty('fromEpic', 3);
      expect(result).toHaveProperty('toEpic', 4);
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('verdict');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('config');
    });
  });
});
