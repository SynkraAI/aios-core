import { PncpClient } from '../../src/collector/pncp-client';
import pncpFixture from '../fixtures/pncp-response.json';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('PncpClient', () => {
  let client: PncpClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PncpClient({ baseUrl: 'https://pncp.gov.br/api/consulta' });
  });

  describe('formatDate', () => {
    it('should format date as yyyyMMdd', () => {
      const date = new Date(2026, 1, 7); // Feb 7, 2026
      expect(PncpClient.formatDate(date)).toBe('20260207');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      expect(PncpClient.formatDate(date)).toBe('20260105');
    });
  });

  describe('getContratacoesByPublicacao', () => {
    it('should fetch and return paginated data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => pncpFixture,
      });

      const result = await client.getContratacoesByPublicacao({
        dataInicial: '20260201',
        dataFinal: '20260207',
        codigoModalidadeContratacao: 6,
        pagina: 1,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].objetoCompra).toContain('software');
      expect(result.empty).toBe(false);
      expect(result.paginasRestantes).toBe(0);
    });

    it('should include correct query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => pncpFixture,
      });

      await client.getContratacoesByPublicacao({
        dataInicial: '20260201',
        dataFinal: '20260207',
        codigoModalidadeContratacao: 6,
        uf: 'SP',
        pagina: 1,
        tamanhoPagina: 50,
      });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('dataInicial=20260201');
      expect(calledUrl).toContain('dataFinal=20260207');
      expect(calledUrl).toContain('codigoModalidadeContratacao=6');
      expect(calledUrl).toContain('uf=SP');
      expect(calledUrl).toContain('tamanhoPagina=50');
    });
  });

  describe('retry logic', () => {
    it('should retry on server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Server Error' })
        .mockResolvedValueOnce({ ok: true, json: async () => pncpFixture });

      const client = new PncpClient({ maxRetries: 3 });
      const result = await client.getContratacoesByPublicacao({
        dataInicial: '20260201',
        dataFinal: '20260207',
        codigoModalidadeContratacao: 6,
        pagina: 1,
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toHaveLength(2);
    }, 15000);

    it('should not retry on 4xx client errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      const client = new PncpClient({ maxRetries: 3 });

      await expect(
        client.getContratacoesByPublicacao({
          dataInicial: '20260201',
          dataFinal: '20260207',
          codigoModalidadeContratacao: 6,
          pagina: 1,
        })
      ).rejects.toThrow('PNCP API error 400');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 429 rate limit', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 429, text: async () => 'Rate Limited' })
        .mockResolvedValueOnce({ ok: true, json: async () => pncpFixture });

      const client = new PncpClient({ maxRetries: 3 });
      const result = await client.getContratacoesByPublicacao({
        dataInicial: '20260201',
        dataFinal: '20260207',
        codigoModalidadeContratacao: 6,
        pagina: 1,
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toHaveLength(2);
    }, 15000);
  });

  describe('getAllContratacoes', () => {
    it('should yield pages until no more remain', async () => {
      // First page with more remaining
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...pncpFixture, paginasRestantes: 1 }),
      });
      // Second (last) page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...pncpFixture, paginasRestantes: 0 }),
      });

      const pages: unknown[][] = [];
      for await (const page of client.getAllContratacoes(6, '20260201', '20260207')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should stop on empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], empty: true, paginasRestantes: 0, totalRegistros: 0 }),
      });

      const pages: unknown[][] = [];
      for await (const page of client.getAllContratacoes(6, '20260201', '20260207')) {
        pages.push(page);
      }

      expect(pages).toHaveLength(0);
    });
  });
});
