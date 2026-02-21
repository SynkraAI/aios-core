/**
 * Tests for Session Collector
 * @see .aios-core/core/synapse/diagnostics/collectors/session-collector.js
 */

'use strict';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

const fs = require('fs');
const { collectSessionStatus } = require('../../../.aios-core/core/synapse/diagnostics/collectors/session-collector');

describe('collectSessionStatus', () => {
  const ROOT = '/test/project';

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false);
  });

  it('should return fields array and raw object', () => {
    const result = collectSessionStatus(ROOT);
    expect(result).toHaveProperty('fields');
    expect(result).toHaveProperty('raw');
    expect(Array.isArray(result.fields)).toBe(true);
  });

  it('should have 5 field checks', () => {
    const result = collectSessionStatus(ROOT);
    expect(result.fields).toHaveLength(5);
  });

  it('should check active_agent.id', () => {
    const result = collectSessionStatus(ROOT);
    const field = result.fields.find(f => f.field === 'active_agent.id');
    expect(field).toBeDefined();
    expect(field.status).toBe('WARN');
    expect(field.actual).toBe('(none)');
  });

  it('should check activation_quality', () => {
    const result = collectSessionStatus(ROOT);
    const field = result.fields.find(f => f.field === 'activation_quality');
    expect(field).toBeDefined();
    expect(field.status).toBe('WARN');
  });

  it('should check prompt_count', () => {
    const result = collectSessionStatus(ROOT);
    const field = result.fields.find(f => f.field === 'prompt_count');
    expect(field).toBeDefined();
    expect(field.status).toBe('INFO');
  });

  it('should check bracket', () => {
    const result = collectSessionStatus(ROOT);
    const field = result.fields.find(f => f.field === 'bracket');
    expect(field).toBeDefined();
    expect(field.status).toBe('INFO');
  });

  it('should check _active-agent.json existence', () => {
    const result = collectSessionStatus(ROOT);
    const field = result.fields.find(f => f.field === '_active-agent.json');
    expect(field).toBeDefined();
    expect(field.status).toBe('WARN');
    expect(field.actual).toBe('missing');
  });

  it('should load session by sessionId when provided', () => {
    fs.existsSync.mockImplementation((p) => p.includes('test-session'));
    fs.readFileSync.mockReturnValue(JSON.stringify({
      active_agent: { id: 'dev', activation_quality: 'full' },
      prompt_count: 5,
      context: { last_bracket: 'FRESH' },
    }));

    const result = collectSessionStatus(ROOT, 'test-session');
    const agentField = result.fields.find(f => f.field === 'active_agent.id');
    expect(agentField.actual).toBe('dev');
    expect(agentField.status).toBe('PASS');
  });

  it('should read bridge data from _active-agent.json', () => {
    fs.existsSync.mockImplementation((p) => p.includes('_active-agent.json'));
    fs.readFileSync.mockReturnValue(JSON.stringify({
      id: 'qa',
      activation_quality: 'partial',
    }));

    const result = collectSessionStatus(ROOT);
    const agentField = result.fields.find(f => f.field === 'active_agent.id');
    expect(agentField.actual).toBe('qa');
    expect(agentField.status).toBe('PASS');
  });

  it('should PASS activation_quality when present', () => {
    fs.existsSync.mockImplementation((p) => p.includes('_active-agent.json'));
    fs.readFileSync.mockReturnValue(JSON.stringify({
      id: 'dev',
      activation_quality: 'full',
    }));

    const result = collectSessionStatus(ROOT);
    const field = result.fields.find(f => f.field === 'activation_quality');
    expect(field.status).toBe('PASS');
    expect(field.actual).toBe('full');
  });

  it('should PASS _active-agent.json when bridge file exists', () => {
    fs.existsSync.mockImplementation((p) => p.includes('_active-agent.json'));
    fs.readFileSync.mockReturnValue(JSON.stringify({ id: 'dev' }));

    const result = collectSessionStatus(ROOT);
    const field = result.fields.find(f => f.field === '_active-agent.json');
    expect(field.status).toBe('PASS');
    expect(field.actual).toBe('exists');
  });

  it('should include raw session and bridgeData', () => {
    const result = collectSessionStatus(ROOT);
    expect(result.raw).toHaveProperty('session');
    expect(result.raw).toHaveProperty('bridgeData');
  });

  it('should handle malformed JSON gracefully', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('not json');

    const result = collectSessionStatus(ROOT);
    expect(result.fields).toHaveLength(5);
  });
});
