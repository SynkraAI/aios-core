/**
 * Tests for Pipeline Collector
 * @see .aios-core/core/synapse/diagnostics/collectors/pipeline-collector.js
 */

'use strict';

jest.mock('../../../.aios-core/core/synapse/context/context-tracker', () => ({
  estimateContextPercent: jest.fn().mockReturnValue(90),
  calculateBracket: jest.fn().mockReturnValue('FRESH'),
  getActiveLayers: jest.fn().mockReturnValue({ layers: [0, 1, 2, 3, 4, 5, 6, 7] }),
}));

const { estimateContextPercent, calculateBracket, getActiveLayers } = require('../../../.aios-core/core/synapse/context/context-tracker');
const { collectPipelineSimulation } = require('../../../.aios-core/core/synapse/diagnostics/collectors/pipeline-collector');

describe('collectPipelineSimulation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    estimateContextPercent.mockReturnValue(90);
    calculateBracket.mockReturnValue('FRESH');
    getActiveLayers.mockReturnValue({ layers: [0, 1, 2, 3, 4, 5, 6, 7] });
  });

  it('should return bracket, contextPercent, and layers', () => {
    const result = collectPipelineSimulation(5, 'dev', {});
    expect(result).toHaveProperty('bracket');
    expect(result).toHaveProperty('contextPercent');
    expect(result).toHaveProperty('layers');
  });

  it('should pass promptCount to estimateContextPercent', () => {
    collectPipelineSimulation(10, null, {});
    expect(estimateContextPercent).toHaveBeenCalledWith(10);
  });

  it('should default promptCount to 0 when null', () => {
    collectPipelineSimulation(null, null, {});
    expect(estimateContextPercent).toHaveBeenCalledWith(0);
  });

  it('should return all 8 layers (L0-L7)', () => {
    const result = collectPipelineSimulation(5, null, {});
    expect(result.layers).toHaveLength(8);
  });

  it('should use LAYER_NAMES for layer labels', () => {
    const result = collectPipelineSimulation(5, null, {});
    expect(result.layers[0].layer).toBe('L0 Constitution');
    expect(result.layers[1].layer).toBe('L1 Global');
    expect(result.layers[7].layer).toBe('L7 Star-Command');
  });

  it('should mark active layers as ACTIVE', () => {
    const result = collectPipelineSimulation(5, null, {});
    expect(result.layers[0].expected).toContain('ACTIVE');
  });

  it('should mark inactive layers as SKIP', () => {
    getActiveLayers.mockReturnValue({ layers: [0, 1] });
    const result = collectPipelineSimulation(5, null, {});
    expect(result.layers[3].expected).toContain('SKIP');
    expect(result.layers[3].expected).toContain('FRESH');
  });

  it('should show agent info for L2 when activeAgentId has matching domain', () => {
    const manifest = {
      domains: { dev: { agentTrigger: 'dev' } },
    };
    const result = collectPipelineSimulation(5, 'dev', manifest);
    expect(result.layers[2].expected).toContain('agent: dev');
    expect(result.layers[2].status).toBe('PASS');
  });

  it('should WARN for L2 when activeAgentId has no matching domain', () => {
    const manifest = { domains: {} };
    const result = collectPipelineSimulation(5, 'unknown-agent', manifest);
    expect(result.layers[2].expected).toContain('no domain for unknown-agent');
    expect(result.layers[2].status).toBe('WARN');
  });

  it('should PASS for all layers by default', () => {
    const result = collectPipelineSimulation(5, null, {});
    for (const layer of result.layers) {
      expect(layer.status).toBe('PASS');
    }
  });

  it('should return correct bracket from calculateBracket', () => {
    calculateBracket.mockReturnValue('DEPLETED');
    const result = collectPipelineSimulation(50, null, {});
    expect(result.bracket).toBe('DEPLETED');
  });

  it('should return contextPercent from estimateContextPercent', () => {
    estimateContextPercent.mockReturnValue(42.5);
    const result = collectPipelineSimulation(5, null, {});
    expect(result.contextPercent).toBe(42.5);
  });

  it('should handle null manifest gracefully', () => {
    const result = collectPipelineSimulation(5, 'dev', null);
    expect(result.layers[2].status).toBe('WARN');
  });

  it('should handle null getActiveLayers return', () => {
    getActiveLayers.mockReturnValue(null);
    const result = collectPipelineSimulation(5, null, {});
    expect(result.layers).toHaveLength(8);
    // All should be SKIP since no active layers
    for (const layer of result.layers) {
      expect(layer.expected).toContain('SKIP');
    }
  });
});
