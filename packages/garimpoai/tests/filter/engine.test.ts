import { FilterEngine } from '../../src/filter/engine';
import { initializeDb, getDb, closeDb } from '../../src/database/connection';
import { licitacoes } from '../../src/database/schema';
import { GarimpoAIConfig } from '../../src/types/config';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Create a temporary directory for test DB
let testDir: string;
let config: GarimpoAIConfig;

function makeConfig(dataDir: string): GarimpoAIConfig {
  return {
    pncp: { ufs: [], modalidades: [6, 8], keywords: ['software', 'tecnologia'] },
    alertas: {
      telegram: { enabled: false, botToken: '', chatId: '' },
      email: { enabled: false, smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', from: '', to: '' },
    },
    ia: { provider: 'anthropic', apiKey: '', autoAnalyze: false, maxPerDay: 50, chatModel: '', analysisModel: '' },
    scheduler: { intervalMinutes: 30 },
    dataDir,
  };
}

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'garimpoai-test-'));
  config = makeConfig(testDir);
  initializeDb(testDir);

  // Insert test data
  const db = getDb(testDir);
  const records = [
    {
      numeroControlePNCP: 'TEST-001',
      objetoCompra: 'Contratação de software de gestão financeira para a prefeitura',
      valorTotalEstimado: 150000,
      modalidadeId: 6,
      modalidadeNome: 'Pregão - Eletrônico',
      anoCompra: 2026,
      sequencialCompra: 1,
      orgaoCnpj: '00000000000001',
      ufSigla: 'SP',
      municipioNome: 'Campinas',
      orgaoRazaoSocial: 'Prefeitura de Campinas',
      dataPublicacaoPncp: '2026-02-07',
      dataAberturaProposta: '2026-02-20',
    },
    {
      numeroControlePNCP: 'TEST-002',
      objetoCompra: 'Aquisição de mobiliário para escritório administrativo',
      valorTotalEstimado: 45000,
      modalidadeId: 8,
      modalidadeNome: 'Dispensa',
      anoCompra: 2026,
      sequencialCompra: 2,
      orgaoCnpj: '00000000000002',
      ufSigla: 'RJ',
      municipioNome: 'Rio de Janeiro',
      orgaoRazaoSocial: 'Prefeitura do Rio',
      dataPublicacaoPncp: '2026-02-06',
      dataAberturaProposta: '2026-02-15',
    },
    {
      numeroControlePNCP: 'TEST-003',
      objetoCompra: 'Serviço de tecnologia da informação e comunicação para sistema integrado',
      valorTotalEstimado: 300000,
      modalidadeId: 6,
      modalidadeNome: 'Pregão - Eletrônico',
      anoCompra: 2026,
      sequencialCompra: 3,
      orgaoCnpj: '00000000000003',
      ufSigla: 'MG',
      municipioNome: 'Belo Horizonte',
      orgaoRazaoSocial: 'Governo de MG',
      dataPublicacaoPncp: '2026-02-05',
      dataAberturaProposta: '2026-02-25',
    },
  ];

  for (const record of records) {
    db.insert(licitacoes).values(record).run();
  }
});

afterEach(() => {
  closeDb();
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe('FilterEngine', () => {
  describe('searchFullText', () => {
    it('should find results by keyword', () => {
      const engine = new FilterEngine(config);
      const results = engine.searchFullText(['software']);

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].objetoCompra).toContain('software');
    });

    it('should find results with OR keywords', () => {
      const engine = new FilterEngine(config);
      const results = engine.searchFullText(['software', 'mobiliário']);

      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty for non-matching keywords', () => {
      const engine = new FilterEngine(config);
      const results = engine.searchFullText(['astronave']);

      expect(results).toHaveLength(0);
    });
  });

  describe('search', () => {
    it('should filter by UF', () => {
      const engine = new FilterEngine(config);
      const results = engine.search({ uf: ['SP'] });

      expect(results).toHaveLength(1);
      expect(results[0].ufSigla).toBe('SP');
    });

    it('should filter by modalidade', () => {
      const engine = new FilterEngine(config);
      const results = engine.search({ modalidade: [8] });

      expect(results).toHaveLength(1);
      expect(results[0].modalidadeNome).toBe('Dispensa');
    });

    it('should filter by value range', () => {
      const engine = new FilterEngine(config);
      const results = engine.search({ valorMin: 100000, valorMax: 200000 });

      expect(results).toHaveLength(1);
      expect(results[0].valorTotalEstimado).toBe(150000);
    });

    it('should combine keyword + UF filters', () => {
      const engine = new FilterEngine(config);
      const results = engine.search({ keywords: ['software'], uf: ['SP'] });

      expect(results).toHaveLength(1);
      expect(results[0].ufSigla).toBe('SP');
    });

    it('should respect limit', () => {
      const engine = new FilterEngine(config);
      const results = engine.search({ limit: 1 });

      expect(results).toHaveLength(1);
    });

    it('should return all when no filters', () => {
      const engine = new FilterEngine(config);
      const results = engine.search({});

      expect(results).toHaveLength(3);
    });
  });

  describe('autoFilter', () => {
    it('should mark matching records', async () => {
      const engine = new FilterEngine(config);
      const matched = await engine.autoFilter();

      // 'software' and 'tecnologia' should match records TEST-001 and TEST-003
      expect(matched).toBeGreaterThanOrEqual(2);
    });

    it('should return 0 when no keywords configured', async () => {
      const noKeywordConfig = makeConfig(testDir);
      noKeywordConfig.pncp.keywords = [];
      const engine = new FilterEngine(noKeywordConfig);

      const matched = await engine.autoFilter();
      expect(matched).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct totals', () => {
      const engine = new FilterEngine(config);
      const stats = engine.getStats();

      expect(stats.total).toBe(3);
      expect(stats.matched).toBe(0); // Not yet filtered
      expect(stats.analisados).toBe(0);
    });

    it('should return UF breakdown', () => {
      const engine = new FilterEngine(config);
      const stats = engine.getStats();

      expect(stats.porUf).toHaveProperty('SP');
      expect(stats.porUf).toHaveProperty('RJ');
      expect(stats.porUf).toHaveProperty('MG');
    });

    it('should return modalidade breakdown', () => {
      const engine = new FilterEngine(config);
      const stats = engine.getStats();

      expect(stats.porModalidade).toHaveProperty('Pregão - Eletrônico');
      expect(stats.porModalidade).toHaveProperty('Dispensa');
      expect(stats.porModalidade['Pregão - Eletrônico']).toBe(2);
      expect(stats.porModalidade['Dispensa']).toBe(1);
    });
  });
});
