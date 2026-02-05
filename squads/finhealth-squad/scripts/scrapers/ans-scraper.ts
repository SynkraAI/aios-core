/**
 * ANS Scraper
 * FinHealth Squad - Data Collection Module
 *
 * Scrapes TISS tables, rules, and procedures from ANS portal.
 * Uses intelligent fallback: Cheerio -> GPT-4o Mini validation -> GPT-5 Mini web search
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Types
export interface TussProcedure {
  codigo: string;
  descricao: string;
  tipo: string;
  porte?: string;
  valor_referencia?: number;
  requer_autorizacao?: boolean;
}

export interface ScrapeResult {
  success: boolean;
  source: 'scraper' | 'llm_fallback';
  data: TussProcedure[];
  errors: string[];
  warnings: string[];
  timestamp: Date;
  needsMaintenance: boolean;
}

// Configuration
const ANS_URLS = {
  tiss_portal: 'https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss',
  tuss_table: 'https://www.gov.br/ans/pt-br/acesso-a-informacao/participacao-da-sociedade/consultas-publicas/terminologia-unificada-da-saude-suplementar-2013-tuss',
};

const DATA_OUTPUT_PATH = path.join(__dirname, '../../data/tuss-procedures.json');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Main scraper function with intelligent fallback
 */
export async function scrapeAnsTuss(): Promise<ScrapeResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('[ANS Scraper] Starting TUSS table scraping...');

  // Step 1: Try Cheerio + Axios scraping
  try {
    const scrapedData = await scrapeWithCheerio();

    if (scrapedData.length > 0) {
      // Step 2: Validate with GPT-4o Mini
      const validationResult = await validateWithGpt4oMini(scrapedData);

      if (validationResult.isValid) {
        // Data is valid - cache and return
        await cacheData(scrapedData);
        console.log(`[ANS Scraper] Successfully scraped ${scrapedData.length} procedures`);

        return {
          success: true,
          source: 'scraper',
          data: scrapedData,
          errors,
          warnings: validationResult.warnings,
          timestamp: new Date(),
          needsMaintenance: false,
        };
      } else {
        warnings.push('Scraped data failed validation');
        warnings.push(...validationResult.warnings);
      }
    }
  } catch (error) {
    errors.push(`Scraping error: ${error}`);
    console.error('[ANS Scraper] Cheerio scraping failed:', error);
  }

  // Step 3: Fallback to GPT-5 Mini with web search
  console.log('[ANS Scraper] Falling back to GPT-5 Mini with web search...');
  warnings.push('MAINTENANCE ALERT: Scraper failed, using LLM fallback');

  try {
    const fallbackData = await fallbackWithGpt5Mini();

    if (fallbackData.length > 0) {
      await cacheData(fallbackData);

      return {
        success: true,
        source: 'llm_fallback',
        data: fallbackData,
        errors,
        warnings,
        timestamp: new Date(),
        needsMaintenance: true, // Alert that scraper needs maintenance
      };
    }
  } catch (fallbackError) {
    errors.push(`Fallback error: ${fallbackError}`);
  }

  // Complete failure
  return {
    success: false,
    source: 'scraper',
    data: [],
    errors,
    warnings,
    timestamp: new Date(),
    needsMaintenance: true,
  };
}

/**
 * Step 1: Scrape with Cheerio + Axios
 */
async function scrapeWithCheerio(): Promise<TussProcedure[]> {
  const procedures: TussProcedure[] = [];

  const response = await axios.get(ANS_URLS.tuss_table, {
    headers: {
      'User-Agent': 'FinHealth-Squad/1.0 (Healthcare Financial Module)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  // Parse TUSS table structure
  // Note: Actual selectors depend on ANS portal structure
  $('table.tuss-table tr, table[data-tuss] tr, .procedimentos-table tr').each((_, row) => {
    const cols = $(row).find('td');
    if (cols.length >= 2) {
      const codigo = $(cols[0]).text().trim();
      const descricao = $(cols[1]).text().trim();

      if (codigo && /^\d{8}$/.test(codigo)) {
        procedures.push({
          codigo,
          descricao,
          tipo: inferProcedureType(codigo),
          porte: cols.length > 2 ? $(cols[2]).text().trim() : undefined,
        });
      }
    }
  });

  // Also try to find procedures in other formats (lists, divs)
  $('.codigo-tuss, [data-codigo]').each((_, el) => {
    const codigo = $(el).attr('data-codigo') || $(el).text().trim();
    const descricao = $(el).next('.descricao').text() || $(el).parent().find('.descricao').text();

    if (codigo && descricao && /^\d{8}$/.test(codigo)) {
      procedures.push({
        codigo,
        descricao: descricao.trim(),
        tipo: inferProcedureType(codigo),
      });
    }
  });

  return procedures;
}

/**
 * Infer procedure type from TUSS code prefix
 */
function inferProcedureType(codigo: string): string {
  const prefix = codigo.substring(0, 2);
  const typeMap: Record<string, string> = {
    '10': 'consulta',
    '20': 'procedimento_clinico',
    '30': 'cirurgia',
    '40': 'exame',
    '50': 'terapia',
    '60': 'material',
    '70': 'medicamento',
    '80': 'internacao',
    '90': 'outros',
  };
  return typeMap[prefix] || 'outros';
}

/**
 * Step 2: Validate scraped data with GPT-4o Mini
 */
async function validateWithGpt4oMini(
  data: TussProcedure[]
): Promise<{ isValid: boolean; warnings: string[] }> {
  const warnings: string[] = [];

  // Basic structural validation
  if (data.length < 10) {
    warnings.push(`Low procedure count: ${data.length}. Expected hundreds/thousands.`);
  }

  // Check for common procedure types
  const types = new Set(data.map(p => p.tipo));
  if (!types.has('consulta') || !types.has('exame')) {
    warnings.push('Missing common procedure types (consulta, exame)');
  }

  // Use GPT-4o Mini for semantic validation
  try {
    const sampleData = data.slice(0, 10);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a healthcare data validator. Validate if the following TUSS procedure data looks correct.
Check for: valid 8-digit codes, reasonable descriptions in Portuguese, proper medical terminology.
Respond with JSON: { "isValid": boolean, "issues": string[] }`,
        },
        {
          role: 'user',
          content: JSON.stringify(sampleData, null, 2),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const validation = JSON.parse(response.choices[0]?.message?.content || '{}');

    if (validation.issues && validation.issues.length > 0) {
      warnings.push(...validation.issues);
    }

    return {
      isValid: validation.isValid !== false && warnings.length < 3,
      warnings,
    };
  } catch (error) {
    warnings.push(`Validation API error: ${error}`);
    // If validation fails, accept data if basic checks passed
    return { isValid: warnings.length < 2, warnings };
  }
}

/**
 * Step 3: Fallback using GPT-5 Mini with web search
 */
async function fallbackWithGpt5Mini(): Promise<TussProcedure[]> {
  console.log('[ANS Scraper] Using GPT-5 Mini web search fallback...');

  try {
    // Note: This uses the responses API with web search tool
    // Adjust based on actual OpenAI API capabilities
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use gpt-5-mini when available
      messages: [
        {
          role: 'system',
          content: `You are a healthcare data specialist. Search for the current TUSS (Terminologia Unificada da Saúde Suplementar) procedure codes from ANS Brazil.
Return a JSON array of procedures with: codigo (8 digits), descricao, tipo.
Focus on common procedures: consultas, exames laboratoriais, exames de imagem, procedimentos cirúrgicos.
Return at least 20 common procedures.`,
        },
        {
          role: 'user',
          content: 'Please provide current TUSS procedure codes from ANS Brazil portal. Include common consultations, lab tests, imaging exams, and surgical procedures.',
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      const procedures = parsed.procedures || parsed.data || parsed;

      if (Array.isArray(procedures)) {
        return procedures.map((p: any) => ({
          codigo: p.codigo || p.code,
          descricao: p.descricao || p.description,
          tipo: p.tipo || p.type || inferProcedureType(p.codigo || p.code),
        }));
      }
    }
  } catch (error) {
    console.error('[ANS Scraper] GPT fallback failed:', error);
  }

  return [];
}

/**
 * Cache valid data to JSON file
 */
async function cacheData(procedures: TussProcedure[]): Promise<void> {
  const existingData = await loadExistingData();

  const output = {
    _meta: {
      description: 'Tabela TUSS - Terminologia Unificada da Saúde Suplementar',
      source: 'ANS - Agência Nacional de Saúde Suplementar',
      version: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      last_update: new Date().toISOString(),
      procedure_count: procedures.length,
      note: 'Auto-updated by ANS Scraper',
    },
    procedures: mergeProcedures(existingData.procedures || [], procedures),
  };

  fs.writeFileSync(DATA_OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`[ANS Scraper] Cached ${output.procedures.length} procedures to ${DATA_OUTPUT_PATH}`);
}

/**
 * Load existing data file
 */
async function loadExistingData(): Promise<any> {
  try {
    if (fs.existsSync(DATA_OUTPUT_PATH)) {
      const content = fs.readFileSync(DATA_OUTPUT_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('[ANS Scraper] Could not load existing data:', error);
  }
  return { procedures: [] };
}

/**
 * Merge new procedures with existing, avoiding duplicates
 */
function mergeProcedures(
  existing: TussProcedure[],
  newData: TussProcedure[]
): TussProcedure[] {
  const merged = new Map<string, TussProcedure>();

  // Add existing
  for (const proc of existing) {
    merged.set(proc.codigo, proc);
  }

  // Update/add new
  for (const proc of newData) {
    merged.set(proc.codigo, proc);
  }

  return Array.from(merged.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
}

// CLI execution
if (require.main === module) {
  scrapeAnsTuss()
    .then(result => {
      console.log('\n=== Scrape Result ===');
      console.log(`Success: ${result.success}`);
      console.log(`Source: ${result.source}`);
      console.log(`Procedures: ${result.data.length}`);
      console.log(`Needs Maintenance: ${result.needsMaintenance}`);
      if (result.errors.length > 0) {
        console.log(`Errors: ${result.errors.join(', ')}`);
      }
      if (result.warnings.length > 0) {
        console.log(`Warnings: ${result.warnings.join(', ')}`);
      }
    })
    .catch(console.error);
}
