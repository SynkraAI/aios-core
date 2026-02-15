/**
 * Scraper Manager
 * FinHealth Squad
 *
 * Unified orchestrator that runs all data scrapers (ANS, CBHPM, DATASUS)
 * and aggregates results. Provides factory functions with default deps.
 */

import axios from 'axios';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { AnsScraper } from './ans-scraper';
import { CbhpmScraper } from './cbhpm-scraper';
import { DatasusScraper } from './datasus-scraper';
import { logger as structuredLogger } from '../logger';
import type {
  HttpClient,
  LlmClient,
  FileSystem,
  Logger,
  ScraperDeps,
  ScraperManagerConfig,
  ScraperManagerResult,
  ScrapeResult,
  TussProcedure,
  CbhpmData,
  SigtapProcedure,
} from './types';

// ============================================================================
// Default implementations
// ============================================================================

export function createDefaultHttpClient(): HttpClient {
  return {
    get: async (url, config) => {
      const response = await axios.get(url, config);
      return { data: response.data };
    },
  };
}

export function createDefaultLlmClient(model?: string): LlmClient {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return {
    chatCompletion: async (params) => {
      const response = await openai.chat.completions.create({
        model: params.model || model || 'gpt-4o-mini',
        messages: params.messages,
        response_format: params.responseFormat ? { type: params.responseFormat.type as 'json_object' } : undefined,
        temperature: params.temperature,
      });
      return { content: response.choices[0]?.message?.content || null };
    },
  };
}

export function createDefaultFileSystem(): FileSystem {
  return {
    readFile: async (filePath) => {
      return fs.readFileSync(filePath, 'utf-8');
    },
    writeFile: async (filePath, data) => {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, data, 'utf-8');
    },
    exists: async (filePath) => {
      return fs.existsSync(filePath);
    },
  };
}

export function createConsoleLogger(prefix: string): Logger {
  return {
    info: (msg) => structuredLogger.info(`[${prefix}] ${msg}`),
    warn: (msg) => structuredLogger.warn(`[${prefix}] ${msg}`),
    error: (msg) => structuredLogger.error(`[${prefix}] ${msg}`),
  };
}

// ============================================================================
// Scraper Manager
// ============================================================================

export class ScraperManager {
  private ansScraper: AnsScraper;
  private cbhpmScraper: CbhpmScraper;
  private datasusScraper: DatasusScraper;

  constructor(config: ScraperManagerConfig) {
    const deps: ScraperDeps = {
      httpClient: config.httpClient || createDefaultHttpClient(),
      llmClient: config.llmClient || createDefaultLlmClient(config.llmModel),
      fileSystem: config.fileSystem || createDefaultFileSystem(),
      logger: config.logger || createConsoleLogger('ScraperManager'),
    };

    const dataDir = config.dataDir;

    this.ansScraper = new AnsScraper(
      { outputPath: path.join(dataDir, 'tuss-procedures.json'), llmModel: config.llmModel },
      deps,
    );
    this.cbhpmScraper = new CbhpmScraper(
      { outputPath: path.join(dataDir, 'cbhpm-values.json'), llmModel: config.llmModel },
      deps,
    );
    this.datasusScraper = new DatasusScraper(
      { outputPath: path.join(dataDir, 'sigtap-procedures.json'), llmModel: config.llmModel },
      deps,
    );
  }

  /**
   * Run all scrapers. By default runs in parallel.
   */
  async scrapeAll(options?: { parallel?: boolean }): Promise<ScraperManagerResult> {
    const startTime = Date.now();
    const parallel = options?.parallel !== false;

    let ans: ScrapeResult<TussProcedure[]>;
    let cbhpm: ScrapeResult<CbhpmData>;
    let datasus: ScrapeResult<SigtapProcedure[]>;

    if (parallel) {
      [ans, cbhpm, datasus] = await Promise.all([
        this.ansScraper.scrape(),
        this.cbhpmScraper.scrape(),
        this.datasusScraper.scrape(),
      ]);
    } else {
      ans = await this.ansScraper.scrape();
      cbhpm = await this.cbhpmScraper.scrape();
      datasus = await this.datasusScraper.scrape();
    }

    const results = [ans, cbhpm, datasus];
    const maintenanceNeeded: string[] = [];

    if (ans.needsMaintenance) maintenanceNeeded.push('ans');
    if (cbhpm.needsMaintenance) maintenanceNeeded.push('cbhpm');
    if (datasus.needsMaintenance) maintenanceNeeded.push('datasus');

    return {
      ans,
      cbhpm,
      datasus,
      summary: {
        totalScrapers: 3,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        maintenanceNeeded,
        durationMs: Date.now() - startTime,
      },
    };
  }

  async scrapeAns(): Promise<ScrapeResult<TussProcedure[]>> {
    return this.ansScraper.scrape();
  }

  async scrapeCbhpm(): Promise<ScrapeResult<CbhpmData>> {
    return this.cbhpmScraper.scrape();
  }

  async scrapeDataasus(): Promise<ScrapeResult<SigtapProcedure[]>> {
    return this.datasusScraper.scrape();
  }

  /**
   * Extract the list of scrapers needing maintenance from results.
   */
  getMaintenanceStatus(results: ScraperManagerResult): string[] {
    return results.summary.maintenanceNeeded;
  }
}

/**
 * Factory function with sensible defaults.
 */
export function createScraperManager(config?: Partial<ScraperManagerConfig>): ScraperManager {
  return new ScraperManager({
    dataDir: config?.dataDir || path.join(process.cwd(), 'data'),
    httpClient: config?.httpClient,
    llmClient: config?.llmClient,
    fileSystem: config?.fileSystem,
    logger: config?.logger,
    llmModel: config?.llmModel,
  });
}
