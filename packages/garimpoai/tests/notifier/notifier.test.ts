import { formatTelegramMessage, formatTelegramBatch, formatEmailHtml } from '../../src/notifier/templates';
import { FilterResult } from '../../src/filter/engine';

const mockResult: FilterResult = {
  id: 1,
  numeroControlePNCP: 'TEST-NOTIF-001',
  objetoCompra: 'Contratação de software de gestão financeira para a prefeitura',
  valorTotalEstimado: 150000,
  modalidadeNome: 'Pregão - Eletrônico',
  ufSigla: 'SP',
  municipioNome: 'Campinas',
  orgaoRazaoSocial: 'Prefeitura de Campinas',
  dataAberturaProposta: '2026-02-20',
  dataPublicacaoPncp: '2026-02-07',
  matchScore: 1,
  analisado: false,
};

describe('Templates', () => {
  describe('formatTelegramMessage', () => {
    it('should format a single licitacao', () => {
      const msg = formatTelegramMessage(mockResult);

      expect(msg).toContain('Nova Licitacao Encontrada');
      expect(msg).toContain('software');
      expect(msg).toContain('Campinas');
      expect(msg).toContain('TEST-NOTIF-001');
    });

    it('should handle missing values', () => {
      const incomplete: FilterResult = {
        ...mockResult,
        valorTotalEstimado: null,
        municipioNome: null,
        orgaoRazaoSocial: null,
      };

      const msg = formatTelegramMessage(incomplete);
      expect(msg).toContain('Nao informado');
      expect(msg).toContain('N/A');
    });
  });

  describe('formatTelegramBatch', () => {
    it('should format multiple licitacoes', () => {
      const items = [mockResult, { ...mockResult, numeroControlePNCP: 'TEST-002' }];
      const msg = formatTelegramBatch(items, 'Software em SP');

      expect(msg).toContain('Software em SP');
      expect(msg).toContain('2 nova');
    });

    it('should truncate after 10 items', () => {
      const items = Array.from({ length: 15 }, (_, i) => ({
        ...mockResult,
        numeroControlePNCP: `TEST-${i}`,
      }));

      const msg = formatTelegramBatch(items, 'Teste');
      expect(msg).toContain('mais 5 resultado');
    });
  });

  describe('formatEmailHtml', () => {
    it('should generate valid HTML table', () => {
      const html = formatEmailHtml([mockResult], 'Software');

      expect(html).toContain('<table');
      expect(html).toContain('Objeto');
      expect(html).toContain('Orgao');
      expect(html).toContain('GarimpoAI');
      expect(html).toContain('software');
    });
  });
});
