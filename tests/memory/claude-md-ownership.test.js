'use strict';

const fs = require('fs');
const path = require('path');

const CLAUDE_MD_PATH = path.join(__dirname, '..', '..', '.claude', 'CLAUDE.md');

describe('CLAUDE.md Essential Sections', () => {
  let content;

  beforeAll(() => {
    content = fs.readFileSync(CLAUDE_MD_PATH, 'utf8');
  });

  test('CLAUDE.md contains Constitution section', () => {
    expect(content).toContain('## Constitution');
  });

  test('CLAUDE.md contains Estrutura do Projeto section', () => {
    expect(content).toContain('## Estrutura do Projeto');
  });

  test('CLAUDE.md contains Agentes section', () => {
    expect(content).toContain('## Agentes');
  });

  test('CLAUDE.md contains Comandos Essenciais section', () => {
    expect(content).toContain('## Comandos Essenciais');
  });

  test('CLAUDE.md contains CLI First philosophy', () => {
    expect(content).toContain('CLI First');
  });

  test('CLAUDE.md references constitution articles', () => {
    const articleRows = content.match(/\|\s*(I|II|III|IV|V|VI|VII)\s*\|/g) || [];
    expect(articleRows.length).toBeGreaterThanOrEqual(6);
  });
});
