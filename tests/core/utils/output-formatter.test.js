/**
 * Unit tests for output-formatter
 *
 * Tests PersonalizedOutputFormatter class: persona loading, header/status/
 * output/metrics/signature building, verb conjugation, tone-based messages,
 * and graceful degradation.
 */

jest.mock('fs');
jest.mock('js-yaml');

const fs = require('fs');
const yaml = require('js-yaml');
const PersonalizedOutputFormatter = require('../../../.aios-core/core/utils/output-formatter');

describe('output-formatter', () => {
  const mockAgent = { id: 'dev', name: 'Dex' };
  const mockTask = { name: 'implement-feature' };
  const mockResults = {
    startTime: '2026-01-01T00:00:00Z',
    endTime: '2026-01-01T00:05:00Z',
    duration: '5m',
    tokens: { total: 15000 },
    success: true,
    output: 'Feature implemented successfully.',
    tests: { passed: 10, total: 12 },
    coverage: '85',
    linting: { status: '✅ Clean' },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    // Default: agent file not found -> neutral profile
    fs.existsSync.mockReturnValue(false);
  });

  afterEach(() => {
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe('constructor and persona loading', () => {
    test('uses neutral profile when agent file not found', () => {
      fs.existsSync.mockReturnValue(false);
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.personaProfile.archetype).toBe('Agent');
    });

    test('uses neutral profile when agent has no id', () => {
      const formatter = new PersonalizedOutputFormatter({}, mockTask, mockResults);
      expect(formatter.personaProfile.archetype).toBe('Agent');
    });

    test('uses neutral profile when agent is null', () => {
      const formatter = new PersonalizedOutputFormatter(null, mockTask, mockResults);
      expect(formatter.personaProfile.archetype).toBe('Agent');
    });

    test('loads persona from agent file YAML block', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('# Agent\n```yaml\npersona_profile:\n  archetype: Developer\n```');
      yaml.load.mockReturnValue({
        persona_profile: {
          archetype: 'Developer',
          communication: {
            tone: 'pragmatic',
            vocabulary: ['implementar', 'construir'],
          },
        },
      });
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.personaProfile.archetype).toBe('Developer');
    });

    test('uses neutral profile when no YAML block in file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('# Agent without yaml block');
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.personaProfile.archetype).toBe('Agent');
    });

    test('handles persona loading errors gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => { throw new Error('read error'); });
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.personaProfile.archetype).toBe('Agent');
    });

    test('caches vocabulary when available', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('```yaml\ntest\n```');
      yaml.load.mockReturnValue({
        persona_profile: {
          communication: { vocabulary: ['testar'] },
        },
      });
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.vocabularyCache.get('dev')).toEqual(['testar']);
    });
  });

  describe('buildFixedHeader', () => {
    test('includes agent name, task, and timing info', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const header = formatter.buildFixedHeader();
      expect(header).toContain('Dex');
      expect(header).toContain('implement-feature');
      expect(header).toContain('5m');
      expect(header).toContain('15,000');
    });

    test('uses defaults for missing data', () => {
      const formatter = new PersonalizedOutputFormatter({}, {}, {});
      const header = formatter.buildFixedHeader();
      expect(header).toContain('Agent');
      expect(header).toContain('task');
    });
  });

  describe('buildPersonalizedStatus', () => {
    test('shows success icon when success is true', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const status = formatter.buildPersonalizedStatus();
      expect(status).toContain('✅');
    });

    test('shows failure icon when success is false', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, { success: false });
      const status = formatter.buildPersonalizedStatus();
      expect(status).toContain('❌');
    });
  });

  describe('buildOutput', () => {
    test('includes output content from results', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.buildOutput()).toContain('Feature implemented successfully.');
    });

    test('uses content field as fallback', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, { content: 'alt content' });
      expect(formatter.buildOutput()).toContain('alt content');
    });

    test('uses default message when no output', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, {});
      expect(formatter.buildOutput()).toContain('Task completed successfully');
    });
  });

  describe('buildFixedMetrics', () => {
    test('includes test counts and coverage', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const metrics = formatter.buildFixedMetrics();
      expect(metrics).toContain('10/12');
      expect(metrics).toContain('85%');
      expect(metrics).toContain('Clean');
    });

    test('uses defaults when no metrics', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, {});
      const metrics = formatter.buildFixedMetrics();
      expect(metrics).toContain('0/0');
      expect(metrics).toContain('N/A');
    });
  });

  describe('buildSignature', () => {
    test('returns signature from persona profile', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.buildSignature()).toContain('Agent');
    });
  });

  describe('selectVerbFromVocabulary', () => {
    test('returns first verb from vocabulary', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.selectVerbFromVocabulary(['implementar', 'testar'])).toBe('implementar');
    });

    test('returns default when vocabulary is empty', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.selectVerbFromVocabulary([])).toBe('completar');
    });

    test('returns default when vocabulary is null', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter.selectVerbFromVocabulary(null)).toBe('completar');
    });
  });

  describe('generateSuccessMessage', () => {
    let formatter;
    beforeEach(() => {
      formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
    });

    test('pragmatic tone', () => {
      const msg = formatter.generateSuccessMessage('pragmatic', 'implementar');
      expect(msg).toContain('pronto');
      expect(msg).toContain('Implementado');
    });

    test('empathetic tone', () => {
      const msg = formatter.generateSuccessMessage('empathetic', 'completar');
      expect(msg).toContain('cuidado');
    });

    test('analytical tone', () => {
      const msg = formatter.generateSuccessMessage('analytical', 'validar');
      expect(msg).toContain('rigorosamente');
    });

    test('collaborative tone', () => {
      const msg = formatter.generateSuccessMessage('collaborative', 'alinhar');
      expect(msg).toContain('harmonizado');
    });

    test('neutral/default tone', () => {
      const msg = formatter.generateSuccessMessage('neutral', 'completar');
      expect(msg).toContain('successfully');
    });
  });

  describe('_getPastTense', () => {
    let formatter;
    beforeEach(() => {
      formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
    });

    test('converts -ar verbs', () => {
      expect(formatter._getPastTense('implementar')).toBe('implementado');
    });

    test('converts -er verbs', () => {
      expect(formatter._getPastTense('resolver')).toBe('resolvido');
    });

    test('converts -ir verbs', () => {
      expect(formatter._getPastTense('construir')).toBe('construido');
    });

    test('converts -or verbs', () => {
      expect(formatter._getPastTense('compor')).toBe('compido');
    });

    test('returns verb as-is for unknown ending', () => {
      expect(formatter._getPastTense('test')).toBe('test');
    });
  });

  describe('_capitalize', () => {
    test('capitalizes first letter', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      expect(formatter._capitalize('hello')).toBe('Hello');
    });
  });

  describe('format', () => {
    test('returns complete formatted markdown output', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const output = formatter.format();
      expect(output).toContain('Task Execution Report');
      expect(output).toContain('Status');
      expect(output).toContain('Output');
      expect(output).toContain('Metrics');
      expect(output).toContain('---');
    });
  });
});
