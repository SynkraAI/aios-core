/**
 * Unit Tests for PersonalizedOutputFormatter and OutputPatternValidator
 * 
 * Story: 6.1.6 - Output Formatter Implementation
 * Test Coverage: 50+ test cases
 * Target: ≥80% coverage
 */

const PersonalizedOutputFormatter = require('../../.aios-core/infrastructure/scripts/output-formatter');
const OutputPatternValidator = require('../../.aios-core/infrastructure/scripts/validate-output-pattern');
const fs = require('fs');
const path = require('path');

// Mock fs for agent file reading
jest.mock('fs');

describe('PersonalizedOutputFormatter', () => {
  let mockAgent;
  let mockTask;
  let mockResults;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAgent = {
      id: 'dev',
      name: 'Dex',
      title: 'Full Stack Developer',
    };

    mockTask = {
      name: 'develop-story',
    };

    mockResults = {
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:02:30Z',
      duration: '2.5s',
      tokens: { total: 1800 },
      success: true,
      output: 'Task completed successfully.',
      tests: { passed: 12, total: 12 },
      coverage: 87,
      linting: { status: '✅ Clean' },
    };

    // Mock agent file content
    const mockAgentContent = `# dev

\`\`\`yaml
agent:
  name: Dex
  id: dev
  title: Full Stack Developer

persona_profile:
  archetype: Builder
  zodiac: "♒ Aquarius"
  communication:
    tone: pragmatic
    emoji_frequency: medium
    vocabulary:
      - construir
      - implementar
      - refatorar
      - resolver
      - otimizar
    greeting_levels:
      minimal: "💻 dev Agent ready"
      named: "💻 Dex (Builder) ready. Let's build something great!"
    signature_closing: "— Dex, sempre construindo 🔨"
\`\`\`
`;

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(mockAgentContent);
  });

  describe('Core Formatting', () => {
    test('generates valid output for Builder agent', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const output = formatter.format();

      expect(output).toContain('## 📊 Task Execution Report');
      expect(output).toContain('**Agent:** Dex (Builder)');
      expect(output).toContain('**Task:** develop-story');
      expect(output).toContain('**Duration:** 2.5s');
      expect(output).toContain('**Tokens Used:** 1,800 total');
    });

    test('maintains fixed header structure', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const output = formatter.format();
      const lines = output.split('\n');

      // Check header structure
      expect(lines[0]).toBe('## 📊 Task Execution Report');
      expect(lines[1]).toBe('');
      expect(lines[2]).toContain('**Agent:**');
      expect(lines[3]).toContain('**Task:**');
      expect(lines[4]).toContain('**Started:**');
      expect(lines[5]).toContain('**Completed:**');
    });

    test('places Duration on line 7', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const header = formatter.buildFixedHeader();
      const lines = header.split('\n');

      // Duration should be on line 6 (0-indexed), which is the 7th line
      expect(lines[6]).toMatch(/^\*\*Duration:\*\*/);
    });

    test('places Tokens on line 8', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const header = formatter.buildFixedHeader();
      const lines = header.split('\n');

      // Tokens should be on line 7 (0-indexed), which is the 8th line
      expect(lines[7]).toMatch(/^\*\*Tokens Used:\*\*/);
    });

    test('places Metrics section last', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const output = formatter.format();
      const lines = output.split('\n');

      const metricsIndex = lines.findIndex(line => line === '### Metrics');
      const lastSectionIndex = lines.length - 1;
      
      // Metrics should be before signature (last line)
      expect(metricsIndex).toBeLessThan(lastSectionIndex);
      expect(lines[lastSectionIndex]).toContain('— Dex');
    });
  });

  describe('Personality Injection', () => {
    test('selects vocabulary from Builder archetype', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const verb = formatter.selectVerbFromVocabulary(['construir', 'implementar', 'refatorar']);

      expect(['construir', 'implementar', 'refatorar']).toContain(verb);
    });

    test('generates pragmatic tone status message', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const message = formatter.generateSuccessMessage('pragmatic', 'implementar');

      expect(message).toContain('Tá pronto!');
      expect(message.toLowerCase()).toContain('implementado');
    });

    test('generates empathetic tone status message', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const message = formatter.generateSuccessMessage('empathetic', 'criar');

      expect(message.toLowerCase()).toContain('criado');
      expect(message).toContain('cuidado');
    });

    test('generates analytical tone status message', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const message = formatter.generateSuccessMessage('analytical', 'validar');

      expect(message).toContain('validado');
      expect(message).toContain('rigorosamente');
    });

    test('generates collaborative tone status message', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const message = formatter.generateSuccessMessage('collaborative', 'harmonizar');

      expect(message).toContain('harmonizado');
      expect(message).toContain('alinhados');
    });

    test('injects signature closing correctly', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const signature = formatter.buildSignature();

      expect(signature).toBe('— Dex, sempre construindo 🔨');
    });

    test('loads persona_profile from agent file', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);

      expect(formatter.personaProfile).toBeDefined();
      expect(formatter.personaProfile.archetype).toBe('Builder');
      expect(formatter.personaProfile.communication.tone).toBe('pragmatic');
    });
  });

  describe('Error Handling', () => {
    test('graceful degradation if persona_profile missing', () => {
      fs.existsSync.mockReturnValue(false);
      
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);

      expect(formatter.personaProfile).toBeDefined();
      expect(formatter.personaProfile.archetype).toBe('Agent'); // Neutral fallback
    });

    test('graceful degradation if vocabulary missing', () => {
      const agentWithoutVocab = {
        id: 'test',
        name: 'Test',
      };

      const mockContent = `# test
\`\`\`yaml
agent:
  name: Test
persona_profile:
  communication:
    tone: neutral
\`\`\`
`;

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockContent);

      const formatter = new PersonalizedOutputFormatter(agentWithoutVocab, mockTask, mockResults);
      const verb = formatter.selectVerbFromVocabulary([]);

      expect(verb).toBe('completar'); // Default fallback
    });

    test('handles missing agent file gracefully', () => {
      fs.existsSync.mockReturnValue(false);

      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const output = formatter.format();

      expect(output).toContain('## 📊 Task Execution Report');
      expect(output).toContain('**Agent:** Dex (Agent)'); // Neutral fallback
    });

    test('handles malformed YAML gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid yaml content');

      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);

      expect(formatter.personaProfile).toBeDefined();
      expect(formatter.personaProfile.archetype).toBe('Agent'); // Neutral fallback
    });
  });

  describe('All 11 Agents', () => {
    const agents = [
      { id: 'dev', name: 'Dex', archetype: 'Builder', tone: 'pragmatic' },
      { id: 'qa', name: 'Quinn', archetype: 'Guardian', tone: 'analytical' },
      { id: 'po', name: 'Pax', archetype: 'Balancer', tone: 'collaborative' },
      { id: 'pm', name: 'Morgan', archetype: 'Visionary', tone: 'pragmatic' },
      { id: 'sm', name: 'River', archetype: 'Flow Master', tone: 'empathetic' },
      { id: 'architect', name: 'Aria', archetype: 'Architect', tone: 'analytical' },
      { id: 'analyst', name: 'Atlas', archetype: 'Explorer', tone: 'analytical' },
      { id: 'ux-design-expert', name: 'Uma', archetype: 'Empathizer', tone: 'empathetic' },
      { id: 'data-engineer', name: 'Dara', archetype: 'Engineer', tone: 'pragmatic' },
      { id: 'devops', name: 'Gage', archetype: 'Operator', tone: 'pragmatic' },
      { id: 'aios-master', name: 'Orion', archetype: 'Orchestrator', tone: 'collaborative' },
    ];

    agents.forEach(agent => {
      test(`generates valid output for ${agent.name} (${agent.archetype})`, () => {
        const mockContent = `# ${agent.id}
\`\`\`yaml
agent:
  name: ${agent.name}
  id: ${agent.id}
persona_profile:
  archetype: ${agent.archetype}
  communication:
    tone: ${agent.tone}
    vocabulary: [testar, validar]
    signature_closing: "— ${agent.name}"
\`\`\`
`;

        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockContent);

        const formatter = new PersonalizedOutputFormatter(
          { id: agent.id, name: agent.name },
          mockTask,
          mockResults,
        );
        const output = formatter.format();

        expect(output).toContain(`**Agent:** ${agent.name} (${agent.archetype})`);
        expect(output).toContain(`— ${agent.name}`);
      });
    });
  });

  describe('Performance', () => {
    test('formatter completes in reasonable time', () => {
      const start = process.hrtime.bigint();
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      formatter.format();
      const duration = Number(process.hrtime.bigint() - start) / 1000000;

      expect(duration).toBeLessThan(100); // Should be <100ms (2x target)
    });

    test('vocabulary lookup is cached', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      
      // First call
      const verb1 = formatter.selectVerbFromVocabulary(['construir', 'implementar']);
      
      // Second call should use cache (same result)
      const verb2 = formatter.selectVerbFromVocabulary(['construir', 'implementar']);

      expect(verb1).toBe(verb2);
    });
  });

  describe('Output Structure', () => {
    test('builds fixed header correctly', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const header = formatter.buildFixedHeader();

      expect(header).toContain('## 📊 Task Execution Report');
      expect(header).toContain('**Agent:**');
      expect(header).toContain('**Task:**');
      expect(header).toContain('**Duration:**');
      expect(header).toContain('**Tokens Used:**');
    });

    test('builds personalized status correctly', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const status = formatter.buildPersonalizedStatus();

      expect(status).toContain('### Status');
      expect(status).toContain('✅');
    });

    test('builds output section correctly', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const output = formatter.buildOutput();

      expect(output).toContain('### Output');
      expect(output).toContain('Task completed successfully.');
    });

    test('builds fixed metrics correctly', () => {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const metrics = formatter.buildFixedMetrics();

      expect(metrics).toContain('### Metrics');
      expect(metrics).toContain('Tests: 12/12');
      expect(metrics).toContain('Coverage: 87%');
      expect(metrics).toContain('Linting: ✅ Clean');
    });
  });
});

describe('OutputPatternValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new OutputPatternValidator();
  });

  describe('Structure Validation', () => {
    test('detects missing Header section', () => {
      const invalidOutput = `### Status
✅ Task completed

### Output
Content here

### Metrics
- Tests: 0/0
`;

      const result = validator.validate(invalidOutput);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'missing_section' && e.section === 'Header')).toBe(true);
    });

    test('detects missing Status section', () => {
      const invalidOutput = `## 📊 Task Execution Report
**Agent:** Dex (Builder)
**Task:** test
**Duration:** 2s
**Tokens Used:** 1000 total

### Output
Content

### Metrics
- Tests: 0/0
`;

      const result = validator.validate(invalidOutput);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'missing_section' && e.section === 'Status')).toBe(true);
    });

    test('detects missing Metrics section', () => {
      const invalidOutput = `## 📊 Task Execution Report
**Agent:** Dex (Builder)
**Task:** test
**Duration:** 2s
**Tokens Used:** 1000 total

### Status
✅ Done

### Output
Content
`;

      const result = validator.validate(invalidOutput);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'missing_section' && e.section === 'Metrics')).toBe(true);
    });

    test('detects wrong Duration line position', () => {
      const invalidOutput = `## 📊 Task Execution Report
**Agent:** Dex (Builder)
**Task:** test
**Started:** 2025-01-15T10:00:00Z
**Completed:** 2025-01-15T10:02:00Z
**Tokens Used:** 1000 total
**Extra Field:** something
**Duration:** 2s

---

### Status
✅ Done

### Output
Content

### Metrics
- Tests: 0/0
`;

      const result = validator.validate(invalidOutput);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'wrong_position' && e.field === 'Duration')).toBe(true);
    });

    test('detects wrong Tokens line position', () => {
      const invalidOutput = `## 📊 Task Execution Report
**Agent:** Dex (Builder)
**Task:** test
**Started:** 2025-01-15T10:00:00Z
**Completed:** 2025-01-15T10:02:00Z
**Duration:** 2s
**Tokens Used:** 1000 total
**Extra Line:** something

---

### Status
✅ Done

### Output
Content

### Metrics
- Tests: 0/0
`;

      const result = validator.validate(invalidOutput);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'wrong_position' && e.field === 'Tokens')).toBe(true);
    });

    test('detects Metrics not last', () => {
      const invalidOutput = `## 📊 Task Execution Report
**Agent:** Dex (Builder)
**Task:** test
**Duration:** 2s
**Tokens Used:** 1000 total

---

### Status
✅ Done

### Metrics
- Tests: 0/0

### Output
Content after metrics
`;

      const result = validator.validate(invalidOutput);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'wrong_order')).toBe(true);
    });
  });

  describe('Validation Accuracy', () => {
    test('passes valid output', () => {
      const validOutput = `## 📊 Task Execution Report

**Agent:** Dex (Builder)
**Task:** develop-story
**Started:** 2025-01-15T10:00:00Z
**Completed:** 2025-01-15T10:02:30Z
**Duration:** 2.5s
**Tokens Used:** 1,800 total

---

### Status
✅ Tá pronto! Implementado com sucesso.

### Output
Task completed successfully.

### Metrics
- Tests: 12/12
- Coverage: 87%
- Linting: ✅ Clean

---
— Dex, sempre construindo 🔨
`;

      const result = validator.validate(validOutput);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('provides actionable error messages', () => {
      const invalidOutput = `## 📊 Task Execution Report
**Agent:** Dex
**Task:** test
**Duration:** 2s
**Tokens Used:** 1000 total

### Status
✅ Done
`;

      const result = validator.validate(invalidOutput);
      const formatted = validator.formatErrors(result);

      expect(formatted).toContain('❌ Validation Error');
      expect(formatted).toContain('Missing required section');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty output', () => {
      const result = validator.validate('');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('handles malformed sections', () => {
      const invalidOutput = `## 📊 Task Execution Report
**Agent:** Dex
**Duration:** 2s
**Tokens Used:** 1000

### Statu
✅ Done

### Outpu
Content

### Metric
- Tests: 0/0
`;

      const result = validator.validate(invalidOutput);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'missing_section')).toBe(true);
    });

    test('handles missing required fields', () => {
      const invalidOutput = `## 📊 Task Execution Report
**Agent:** Dex
**Task:** test
**Started:** 2025-01-15T10:00:00Z
**Completed:** 2025-01-15T10:02:00Z

---

### Status
✅ Done

### Output
Content

### Metrics
- Tests: 0/0
`;

      const result = validator.validate(invalidOutput);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'missing_field' || e.type === 'wrong_position')).toBe(true);
    });
  });
});

