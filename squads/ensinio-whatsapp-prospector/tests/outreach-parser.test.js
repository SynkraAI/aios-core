/**
 * Unit Tests: Outreach Parser
 *
 * Tests parsing of outreach-messages.md format.
 *
 * Story: REFACTOR-3 (Consolidate Outreach Parser and Cleanup Legacy Scripts)
 */

const { parseOutreachMarkdown, parseFirstProspect, validateParsedProspects } = require('../lib/outreach-parser');

describe('Outreach Parser', () => {
  describe('parseOutreachMarkdown', () => {
    it('should parse single prospect with all fields', () => {
      const markdown = `
### 1. Eduardo Silva (Score 10)
**Phone:** +5511999887766
**Approach:** client
**Message:**
Oi Eduardo! Vi seu trabalho no grupo e achei incrível.
Você já pensou em escalar isso?
**WhatsApp Link:** \`https://api.whatsapp.com/send?phone=...\`
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects).toHaveLength(1);
      expect(prospects[0]).toMatchObject({
        name: 'Eduardo Silva',
        score: 10,
        approach: 'client',
        phone: '+5511999887766',
        message: 'Oi Eduardo! Vi seu trabalho no grupo e achei incrível.\nVocê já pensou em escalar isso?',
        whatsappLink: 'https://api.whatsapp.com/send?phone=...',
      });
    });

    it('should parse multiple prospects', () => {
      const markdown = `
### 1. João (Score 9)
**Approach:** relationship
**Message:**
Mensagem 1
---

### 2. Maria (Score 7)
**Approach:** mentorship
**Message:**
Mensagem 2
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects).toHaveLength(2);
      expect(prospects[0].name).toBe('João');
      expect(prospects[1].name).toBe('Maria');
    });

    it('should parse prospect with multi-line message', () => {
      const markdown = `
### 1. Carlos (Score 8)
**Message:**
Linha 1
Linha 2
Linha 3
**WhatsApp Link:** \`...\`
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects[0].message).toBe('Linha 1\nLinha 2\nLinha 3');
    });

    it('should handle missing phone field', () => {
      const markdown = `
### 1. Ana (Score 6)
**Approach:** client
**Message:**
Mensagem sem telefone
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects[0].phone).toBe('');
      expect(prospects[0].name).toBe('Ana');
    });

    it('should handle missing approach field', () => {
      const markdown = `
### 1. Pedro (Score 5)
**Message:**
Mensagem sem approach
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects[0].approach).toBe('');
      expect(prospects[0].name).toBe('Pedro');
    });

    it('should handle missing WhatsApp link field', () => {
      const markdown = `
### 1. Luiz (Score 7)
**Message:**
Mensagem sem link
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects[0].whatsappLink).toBe('');
    });

    it('should parse prospect with special characters in name', () => {
      const markdown = `
### 1. José María Ñoño (Score 8)
**Message:**
Teste de acentos e caracteres especiais: çã é ñ
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects[0].name).toBe('José María Ñoño');
      expect(prospects[0].message).toContain('çã é ñ');
    });

    it('should parse prospect with emojis in message', () => {
      const markdown = `
### 1. Lucas (Score 9)
**Message:**
Oi Lucas! 🚀 Vamos escalar juntos? 💪
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects[0].message).toContain('🚀');
      expect(prospects[0].message).toContain('💪');
    });

    it('should handle message ending with --- instead of WhatsApp link', () => {
      const markdown = `
### 1. Roberto (Score 4)
**Message:**
Mensagem curta
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects[0].message).toBe('Mensagem curta');
    });

    it('should handle prospect with no message delimiter (end of file)', () => {
      const markdown = `
### 1. Fernanda (Score 6)
**Message:**
Última mensagem sem delimitador`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects[0].message).toBe('Última mensagem sem delimitador');
    });

    it('should skip prospects without valid header', () => {
      const markdown = `
### 1. João (Score 10)
**Message:**
Válido
---

### 2. Sem Score
**Message:**
Inválido (sem score no header)
---

### 3. Maria (Score 7)
**Message:**
Válido 2
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects).toHaveLength(2);
      expect(prospects[0].name).toBe('João');
      expect(prospects[1].name).toBe('Maria');
    });

    it('should skip prospects without message field', () => {
      const markdown = `
### 1. Pedro (Score 8)
**Approach:** client
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects).toHaveLength(0);
    });

    it('should handle empty markdown content', () => {
      const markdown = '';

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects).toHaveLength(0);
    });

    it('should throw error for invalid markdown content', () => {
      expect(() => parseOutreachMarkdown(null)).toThrow('Invalid markdown content');
      expect(() => parseOutreachMarkdown(123)).toThrow('Invalid markdown content');
    });

    it('should include rawSection in parsed prospect', () => {
      const markdown = `
### 1. Carlos (Score 9)
**Approach:** mentorship
**Message:**
Mensagem completa
---
`;

      const prospects = parseOutreachMarkdown(markdown);

      expect(prospects[0].rawSection).toContain('Carlos');
      expect(prospects[0].rawSection).toContain('Score 9');
      expect(prospects[0].rawSection).toContain('mentorship');
    });
  });

  describe('parseFirstProspect', () => {
    it('should return first prospect only', () => {
      const markdown = `
### 1. João (Score 10)
**Message:** Mensagem 1
---

### 2. Maria (Score 9)
**Message:** Mensagem 2
---
`;

      const prospect = parseFirstProspect(markdown);

      expect(prospect).not.toBeNull();
      expect(prospect.name).toBe('João');
    });

    it('should return null for empty markdown', () => {
      const prospect = parseFirstProspect('');

      expect(prospect).toBeNull();
    });
  });

  describe('validateParsedProspects', () => {
    it('should return valid for correct prospect array', () => {
      const prospects = [
        { name: 'João', score: 10, message: 'Mensagem válida com mais de 10 caracteres' },
        { name: 'Maria', score: 8, message: 'Outra mensagem válida e longa' },
      ];

      const result = validateParsedProspects(prospects);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing name', () => {
      const prospects = [
        { name: '', score: 10, message: 'Mensagem válida' },
      ];

      const result = validateParsedProspects(prospects);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prospect 0: missing or invalid name');
    });

    it('should detect invalid score (out of range)', () => {
      const prospects = [
        { name: 'João', score: 15, message: 'Mensagem válida' },
      ];

      const result = validateParsedProspects(prospects);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prospect 0: invalid score (must be 0-10)');
    });

    it('should detect missing or short message', () => {
      const prospects = [
        { name: 'João', score: 10, message: 'Curta' },
      ];

      const result = validateParsedProspects(prospects);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prospect 0: message too short or missing');
    });

    it('should detect multiple errors', () => {
      const prospects = [
        { name: '', score: 15, message: 'OK' },
      ];

      const result = validateParsedProspects(prospects);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should reject non-array input', () => {
      const result = validateParsedProspects('invalid');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prospects must be an array');
    });
  });
});
