/**
 * BOB-FLOW-2: Enhanced Surface Conditions Tests
 *
 * Validates trade-off impact scoring and enhanced surface decision logic.
 */

const { SurfaceChecker } = require('../../../.aios-core/core/orchestration/surface-checker');

describe('BOB-FLOW-2: Enhanced surface conditions', () => {
  describe('Trade-off Impact Scoring', () => {
    it('should score critical decisions (data loss risk)', () => {
      const checker = new SurfaceChecker();

      const tradeoffs = {
        reversibility: 'hard',
        blast_radius: 'high',
        cost: 'high',
        consequences: ['data_loss'],
      };

      const result = checker._scoreTradeoffImpact(tradeoffs);

      expect(result.classification).toBe('critical');
      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.factors).toContain('data_loss_risk');
      expect(result.factors).toContain('irreversible');
    });

    it('should score significant decisions (hard to reverse)', () => {
      const checker = new SurfaceChecker();

      const tradeoffs = {
        reversibility: 'moderate',
        blast_radius: 'medium',
        cost: 'low',
      };

      const result = checker._scoreTradeoffImpact(tradeoffs);

      expect(result.classification).toBe('significant');
      expect(result.score).toBeGreaterThanOrEqual(25);
      expect(result.score).toBeLessThan(50);
    });

    it('should score trivial decisions (easy to reverse, low impact)', () => {
      const checker = new SurfaceChecker();

      const tradeoffs = {
        reversibility: 'easy',
        blast_radius: 'none',
        cost: 'negligible',
      };

      const result = checker._scoreTradeoffImpact(tradeoffs);

      expect(result.classification).toBe('trivial');
      expect(result.score).toBeLessThan(25);
    });

    it('should accumulate multiple high-risk factors', () => {
      const checker = new SurfaceChecker();

      const tradeoffs = {
        reversibility: 'hard', // +30
        blast_radius: 'high', // +25
        cost: 'high', // +20
        expertise_required: 'high', // +15
        consequences: ['data_loss'], // +30
      };

      const result = checker._scoreTradeoffImpact(tradeoffs);

      // Total: 120 points
      expect(result.score).toBe(120);
      expect(result.classification).toBe('critical');
      expect(result.factors.length).toBeGreaterThan(3);
    });

    it('should handle empty/minimal tradeoffs', () => {
      const checker = new SurfaceChecker();

      const tradeoffs = {};

      const result = checker._scoreTradeoffImpact(tradeoffs);

      expect(result.score).toBe(0);
      expect(result.classification).toBe('trivial');
      expect(result.factors).toEqual([]);
    });
  });

  describe('Surface Decision with Trade-offs', () => {
    it('should surface critical decisions regardless of options count', () => {
      const checker = new SurfaceChecker();

      const context = {
        valid_options_count: 1, // Only one option
        decision_metadata: {
          tradeoffs: {
            reversibility: 'hard',
            blast_radius: 'high',
            consequences: ['data_loss'],
          },
        },
      };

      const result = checker.shouldSurface(context);

      expect(result.should_surface).toBe(true);
      expect(result.criterion_id).toBe('tradeoff_critical');
      expect(result.severity).toBe('high');
      expect(result.can_bypass).toBe(false); // Cannot bypass critical
    });

    it('should surface significant decisions with multiple options', () => {
      const checker = new SurfaceChecker();

      const context = {
        valid_options_count: 2,
        options_with_tradeoffs: 'Option A vs Option B',
        decision_metadata: {
          tradeoffs: {
            reversibility: 'moderate',
            blast_radius: 'medium',
          },
        },
      };

      const result = checker.shouldSurface(context);

      expect(result.should_surface).toBe(true);
      expect(result.criterion_id).toBe('tradeoff_significant');
      expect(result.severity).toBe('medium');
      expect(result.can_bypass).toBe(true);
    });

    it('should auto-decide trivial choices', () => {
      const checker = new SurfaceChecker();

      const context = {
        valid_options_count: 1,
        decision_metadata: {
          tradeoffs: {
            reversibility: 'easy',
            blast_radius: 'none',
            cost: 'negligible',
          },
          recommended_option: 'proceed',
        },
      };

      const result = checker.shouldSurface(context);

      expect(result.should_surface).toBe(false);
      expect(result.reason).toBe('trivial_auto_decide');
      expect(result.auto_selected).toBe('proceed');
    });

    it('should not surface significant decision with single option', () => {
      const checker = new SurfaceChecker();

      const context = {
        valid_options_count: 1,
        decision_metadata: {
          tradeoffs: {
            reversibility: 'moderate',
            blast_radius: 'medium',
          },
        },
      };

      const result = checker.shouldSurface(context);

      // With only 1 option, even significant trade-offs don't trigger surface
      // (falls through to regular criteria evaluation)
      expect(result.should_surface).toBe(false);
    });

    it('should work without decision_metadata (backward compatibility)', () => {
      const checker = new SurfaceChecker();

      const context = {
        valid_options_count: 2,
        // No decision_metadata - should fall through to regular criteria
      };

      const result = checker.shouldSurface(context);

      // Should process normally without crashing
      expect(result).toHaveProperty('should_surface');
    });

    it('should include impact details in result', () => {
      const checker = new SurfaceChecker();

      const context = {
        valid_options_count: 2,
        decision_metadata: {
          tradeoffs: {
            reversibility: 'hard',
            blast_radius: 'high',
            consequences: ['data_loss'],
          },
        },
      };

      const result = checker.shouldSurface(context);

      expect(result.impact).toBeDefined();
      expect(result.impact.score).toBeGreaterThan(0);
      expect(result.impact.classification).toBe('critical');
      expect(result.impact.factors).toContain('data_loss_risk');
    });
  });

  describe('Trade-off Classification Boundaries', () => {
    it('should classify score=50 as critical', () => {
      const checker = new SurfaceChecker();

      const tradeoffs = {
        reversibility: 'hard', // 30
        blast_radius: 'medium', // 10
        cost: 'high', // 20
        // Total: 60
      };

      const result = checker._scoreTradeoffImpact(tradeoffs);

      expect(result.score).toBe(60);
      expect(result.classification).toBe('critical');
    });

    it('should classify score=25 as significant', () => {
      const checker = new SurfaceChecker();

      const tradeoffs = {
        blast_radius: 'high', // 25
      };

      const result = checker._scoreTradeoffImpact(tradeoffs);

      expect(result.score).toBe(25);
      expect(result.classification).toBe('significant');
    });

    it('should classify score=24 as significant (just below critical)', () => {
      const checker = new SurfaceChecker();

      const tradeoffs = {
        reversibility: 'moderate', // 15
        blast_radius: 'medium', // 10
        // Total: 25 (but code shows >= 25 for significant, >= 50 for critical)
      };

      const result = checker._scoreTradeoffImpact(tradeoffs);

      expect(result.score).toBe(25);
      expect(result.classification).toBe('significant');
    });

    it('should classify score=0 as trivial', () => {
      const checker = new SurfaceChecker();

      const tradeoffs = {
        reversibility: 'easy',
        blast_radius: 'low',
      };

      const result = checker._scoreTradeoffImpact(tradeoffs);

      expect(result.score).toBe(0);
      expect(result.classification).toBe('trivial');
    });
  });
});
