/**
 * Unit tests for Template Engine
 * @module template-engine.test
 */

const TemplateEngine = require('../../../aios-core/utils/template-engine');

describe('TemplateEngine', () => {
  let templateEngine;

  beforeEach(() => {
    templateEngine = new TemplateEngine();
  });

  describe('Variable Substitution', () => {
    test('replaces simple variables', () => {
      const template = 'Hello {{NAME}}, welcome to {{PLACE}}!';
      const variables = { NAME: 'Alice', PLACE: 'Wonderland' };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('Hello Alice, welcome to Wonderland!');
    });

    test('handles missing variables gracefully', () => {
      const template = 'Hello {{NAME}}, your age is {{AGE}}';
      const variables = { NAME: 'Bob' };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('Hello Bob, your age is {{AGE}}');
    });

    test('escapes special characters in values', () => {
      const template = 'Command: {{COMMAND}}';
      const variables = { COMMAND: 'echo "Hello & Goodbye"' };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('Command: echo "Hello & Goodbye"');
    });

    test('handles empty string values', () => {
      const template = 'Status: {{STATUS}}';
      const variables = { STATUS: '' };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('Status: ');
    });
  });

  describe('Conditional Processing', () => {
    test('includes content when condition is true', () => {
      const template = '{{#IF_SECURITY}}Security enabled{{/IF_SECURITY}}';
      const variables = { IF_SECURITY: true };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('Security enabled');
    });

    test('excludes content when condition is false', () => {
      const template = '{{#IF_SECURITY}}Security enabled{{/IF_SECURITY}}';
      const variables = { IF_SECURITY: false };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('');
    });

    test('handles nested conditionals', () => {
      const template = `{{#IF_OUTER}}
Outer
{{#IF_INNER}}Inner{{/IF_INNER}}
End
{{/IF_OUTER}}`;
      const variables = { IF_OUTER: true, IF_INNER: true };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toContain('Outer');
      expect(result).toContain('Inner');
      expect(result).toContain('End');
    });

    test('handles conditional with missing variable', () => {
      const template = '{{#IF_MISSING}}Should not appear{{/IF_MISSING}}';
      const variables = {};
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('');
    });
  });

  describe('Loop Processing', () => {
    test('processes simple loops', () => {
      const template = '{{#EACH_ITEMS}}{{ITEM}}{{/EACH_ITEMS}}';
      const variables = { EACH_ITEMS: ['a', 'b', 'c'] };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('abc');
    });

    test('processes loops with objects', () => {
      const template = '{{#EACH_COMMANDS}}{{COMMAND_NAME}}: {{COMMAND_DESCRIPTION}}\n{{/EACH_COMMANDS}}';
      const variables = {
        EACH_COMMANDS: [
          { COMMAND_NAME: 'create', COMMAND_DESCRIPTION: 'Create new item' },
          { COMMAND_NAME: 'delete', COMMAND_DESCRIPTION: 'Delete item' }
        ]
      };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toContain('create: Create new item');
      expect(result).toContain('delete: Delete item');
    });

    test('handles empty arrays', () => {
      const template = 'Items: {{#EACH_ITEMS}}{{ITEM}}, {{/EACH_ITEMS}}Done';
      const variables = { EACH_ITEMS: [] };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('Items: Done');
    });

    test('provides loop metadata', () => {
      const template = '{{#EACH_ITEMS}}{{INDEX}}: {{ITEM}}{{#UNLESS_LAST}}, {{/UNLESS_LAST}}{{/EACH_ITEMS}}';
      const variables = { EACH_ITEMS: ['first', 'second', 'third'] };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('0: first, 1: second, 2: third');
    });

    test('handles nested loops', () => {
      const template = `{{#EACH_GROUPS}}
Group {{GROUP_NAME}}:
{{#EACH_MEMBERS}}  - {{MEMBER_NAME}}
{{/EACH_MEMBERS}}
{{/EACH_GROUPS}}`;
      
      const variables = {
        EACH_GROUPS: [
          {
            GROUP_NAME: 'A',
            EACH_MEMBERS: [
              { MEMBER_NAME: 'Alice' },
              { MEMBER_NAME: 'Adam' }
            ]
          },
          {
            GROUP_NAME: 'B',
            EACH_MEMBERS: [
              { MEMBER_NAME: 'Bob' }
            ]
          }
        ]
      };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toContain('Group A:');
      expect(result).toContain('  - Alice');
      expect(result).toContain('  - Adam');
      expect(result).toContain('Group B:');
      expect(result).toContain('  - Bob');
    });
  });

  describe('Special Features', () => {
    test('handles escaped braces', () => {
      const template = 'Literal \\{{VARIABLE}} not replaced';
      const variables = { VARIABLE: 'value' };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('Literal {{VARIABLE}} not replaced');
    });

    test('processes complex templates', () => {
      const template = `# {{TITLE}}

{{#IF_DESCRIPTION}}
Description: {{DESCRIPTION}}
{{/IF_DESCRIPTION}}

## Commands
{{#EACH_COMMANDS}}
- {{COMMAND_NAME}}{{#IF_COMMAND_DESC}}: {{COMMAND_DESC}}{{/IF_COMMAND_DESC}}
{{/EACH_COMMANDS}}

{{#IF_FOOTER}}
---
{{FOOTER}}
{{/IF_FOOTER}}`;

      const variables = {
        TITLE: 'My Agent',
        IF_DESCRIPTION: true,
        DESCRIPTION: 'A helpful agent',
        EACH_COMMANDS: [
          { COMMAND_NAME: 'help', IF_COMMAND_DESC: true, COMMAND_DESC: 'Show help' },
          { COMMAND_NAME: 'version', IF_COMMAND_DESC: false }
        ],
        IF_FOOTER: true,
        FOOTER: 'Created with AIOS'
      };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toContain('# My Agent');
      expect(result).toContain('Description: A helpful agent');
      expect(result).toContain('- help: Show help');
      expect(result).toContain('- version');
      expect(result).toContain('Created with AIOS');
    });

    test('preserves indentation in loops', () => {
      const template = `  items:
{{#EACH_ITEMS}}    - {{ITEM}}
{{/EACH_ITEMS}}`;
      
      const variables = {
        EACH_ITEMS: ['one', 'two', 'three']
      };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe(`  items:
    - one
    - two
    - three
`);
    });
  });

  describe('Error Handling', () => {
    test('handles malformed conditionals', () => {
      const template = '{{#IF_TEST}}Missing end tag';
      const variables = { IF_TEST: true };
      
      expect(() => {
        templateEngine.process(template, variables);
      }).not.toThrow();
    });

    test('handles null variables', () => {
      const template = 'Value: {{VALUE}}';
      const variables = { VALUE: null };
      
      const result = templateEngine.process(template, variables);
      
      expect(result).toBe('Value: ');
    });

    test('handles undefined variables object', () => {
      const template = 'Hello {{NAME}}';
      
      const result = templateEngine.process(template);
      
      expect(result).toBe('Hello {{NAME}}');
    });
  });
});