import { Analyzer } from '../../src/analyzer/analyzer';
import { estimateCost } from '../../src/analyzer/prompts';
import { recordUsage, getTodayUsage, isLimitReached } from '../../src/analyzer/cost-tracker';
import { initializeDb, getDb, closeDb } from '../../src/database/connection';
import { licitacoes } from '../../src/database/schema';
import { GarimpoAIConfig } from '../../src/types/config';
import analysisFixture from '../fixtures/analysis-response.json';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysisFixture),
            },
          ],
          usage: {
            input_tokens: 1200,
            output_tokens: 800,
          },
        }),
      },
    })),
  };
});

let testDir: string;
let config: GarimpoAIConfig;

function makeConfig(dataDir: string): GarimpoAIConfig {
  return {
    pncp: { ufs: [], modalidades: [6], keywords: ['software'] },
    alertas: {
      telegram: { enabled: false, botToken: '', chatId: '' },
      email: { enabled: false, smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', from: '', to: '' },
    },
    ia: {
      provider: 'anthropic',
      apiKey: 'test-key',
      autoAnalyze: true,
      maxPerDay: 50,
      chatModel: 'claude-haiku-4-5-20251001',
      analysisModel: 'claude-sonnet-4-5-20250929',
    },
    scheduler: { intervalMinutes: 30 },
    dataDir,
  };
}

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'garimpoai-test-'));
  config = makeConfig(testDir);
  initializeDb(testDir);

  // Insert a test licitacao
  const db = getDb(testDir);
  db.insert(licitacoes)
    .values({
      numeroControlePNCP: 'TEST-ANALYZE-001',
      objetoCompra: 'Software de gestão financeira',
      valorTotalEstimado: 150000,
      modalidadeId: 6,
      modalidadeNome: 'Pregão - Eletrônico',
      anoCompra: 2026,
      sequencialCompra: 1,
      orgaoCnpj: '00000000000001',
      ufSigla: 'SP',
      orgaoRazaoSocial: 'Prefeitura de Campinas',
      dataPublicacaoPncp: '2026-02-07',
    })
    .run();
});

afterEach(() => {
  closeDb();
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe('Analyzer', () => {
  it('should analyze a licitacao and return structured result', async () => {
    const analyzer = new Analyzer(config);
    const result = await analyzer.analyze('TEST-ANALYZE-001');

    expect(result.cached).toBe(false);
    expect(result.analise.resumo).toBeDefined();
    expect(result.analise.dificuldade).toBe('medio');
    expect(result.analise.documentosNecessarios).toHaveLength(3);
    expect(result.tokensUsados).toBe(2000);
    expect(result.custoEstimado).toBeGreaterThan(0);
  });

  it('should return cached result on second call', async () => {
    const analyzer = new Analyzer(config);

    // First call — real analysis
    await analyzer.analyze('TEST-ANALYZE-001');

    // Second call — should be cached
    const result = await analyzer.analyze('TEST-ANALYZE-001');
    expect(result.cached).toBe(true);
  });

  it('should throw on non-existent licitacao', async () => {
    const analyzer = new Analyzer(config);

    await expect(analyzer.analyze('NONEXISTENT')).rejects.toThrow('nao encontrada');
  });

  it('should mark licitacao as analyzed in DB', async () => {
    const analyzer = new Analyzer(config);
    await analyzer.analyze('TEST-ANALYZE-001');

    const db = getDb(testDir);
    const row = db
      .select({ analisado: licitacoes.analisado })
      .from(licitacoes)
      .where(require('drizzle-orm').eq(licitacoes.numeroControlePNCP, 'TEST-ANALYZE-001'))
      .get();

    expect(row?.analisado).toBe(true);
  });

  it('should format for tool output correctly', () => {
    const formatted = Analyzer.formatForTool({
      analise: analysisFixture as any,
      cached: false,
      tokensUsados: 2000,
      custoEstimado: 0.0156,
    });

    const parsed = JSON.parse(formatted);
    expect(parsed.resumo).toBeDefined();
    expect(parsed._meta.cached).toBe(false);
    expect(parsed._meta.tokensUsados).toBe(2000);
  });
});

describe('estimateCost', () => {
  it('should calculate cost for Haiku', () => {
    const cost = estimateCost('claude-haiku-4-5-20251001', 1000, 500);
    // (1000 * 0.80 + 500 * 4.00) / 1M = 0.0028
    expect(cost).toBeCloseTo(0.0028, 4);
  });

  it('should calculate cost for Sonnet', () => {
    const cost = estimateCost('claude-sonnet-4-5-20250929', 1000, 500);
    // (1000 * 3.00 + 500 * 15.00) / 1M = 0.0105
    expect(cost).toBeCloseTo(0.0105, 4);
  });
});

describe('cost-tracker', () => {
  it('should record and retrieve usage', () => {
    recordUsage(testDir, 'analysis', 'test-model', 1000, 500, 0.01);
    recordUsage(testDir, 'chat', 'test-model', 200, 100, 0.002);

    const usage = getTodayUsage(testDir);
    expect(usage.totalAnalises).toBe(1);
    expect(usage.totalChats).toBe(1);
    expect(usage.tokensInput).toBe(1200);
    expect(usage.tokensOutput).toBe(600);
  });

  it('should detect limit reached', () => {
    expect(isLimitReached(testDir, 2)).toBe(false);

    recordUsage(testDir, 'analysis', 'test-model', 100, 50, 0.001);
    recordUsage(testDir, 'analysis', 'test-model', 100, 50, 0.001);

    expect(isLimitReached(testDir, 2)).toBe(true);
  });
});
