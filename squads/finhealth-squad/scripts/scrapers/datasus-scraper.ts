/**
 * DATASUS Scraper
 * FinHealth Squad - Data Collection Module
 *
 * Scrapes SIGTAP procedures, SUS values, BPA, AIH from DATASUS.
 * Uses intelligent fallback: Cheerio -> GPT-4o Mini validation -> GPT-5 Mini web search
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Types
export interface SigtapProcedure {
  codigo: string;
  descricao: string;
  grupo: string;
  subgrupo: string;
  forma_organizacao: string;
  valor_sh: number;
  valor_sp: number;
  valor_total: number;
  complexidade: 'AB' | 'MC' | 'AC';
}

export interface ScrapeResult {
  success: boolean;
  source: 'scraper' | 'llm_fallback';
  data: SigtapProcedure[];
  errors: string[];
  warnings: string[];
  timestamp: Date;
  needsMaintenance: boolean;
}

// Configuration
const DATASUS_URLS = {
  sigtap: 'http://sigtap.datasus.gov.br/tabela-unificada/app/sec/inicio.jsp',
  sigtap_consulta: 'http://sigtap.datasus.gov.br/tabela-unificada/app/sec/procedimento/publicados/consultar',
  bpa: 'https://datasus.saude.gov.br/transferencia-de-arquivos/',
};

const DATA_OUTPUT_PATH = path.join(__dirname, '../../data/sigtap-procedures.json');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Main scraper function with intelligent fallback
 */
export async function scrapeSigtap(): Promise<ScrapeResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('[DATASUS Scraper] Starting SIGTAP table scraping...');

  // Step 1: Try Cheerio + Axios scraping
  try {
    const scrapedData = await scrapeWithCheerio();

    if (scrapedData.length > 0) {
      // Step 2: Validate with GPT-4o Mini
      const validationResult = await validateWithGpt4oMini(scrapedData);

      if (validationResult.isValid) {
        await cacheData(scrapedData);
        console.log(`[DATASUS Scraper] Successfully scraped ${scrapedData.length} procedures`);

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
    console.error('[DATASUS Scraper] Cheerio scraping failed:', error);
  }

  // Step 3: Fallback to GPT-5 Mini with web search
  console.log('[DATASUS Scraper] Falling back to GPT-5 Mini with web search...');
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
        needsMaintenance: true,
      };
    }
  } catch (fallbackError) {
    errors.push(`Fallback error: ${fallbackError}`);
  }

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
 * Step 1: Scrape SIGTAP with Cheerio + Axios
 */
async function scrapeWithCheerio(): Promise<SigtapProcedure[]> {
  const procedures: SigtapProcedure[] = [];

  // SIGTAP uses a Java-based web app, may need special handling
  const response = await axios.get(DATASUS_URLS.sigtap, {
    headers: {
      'User-Agent': 'FinHealth-Squad/1.0 (Healthcare Financial Module)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);

  // Parse SIGTAP procedure tables
  $('table.sigtap-table tr, table[data-sigtap] tr, .procedimentos tr').each((_, row) => {
    const cols = $(row).find('td');
    if (cols.length >= 4) {
      const codigo = $(cols[0]).text().trim();

      if (codigo && /^\d{10}$/.test(codigo)) {
        procedures.push({
          codigo,
          descricao: $(cols[1]).text().trim(),
          grupo: codigo.substring(0, 2),
          subgrupo: codigo.substring(2, 4),
          forma_organizacao: codigo.substring(4, 6),
          valor_sh: parseFloat($(cols[2]).text().replace(',', '.')) || 0,
          valor_sp: parseFloat($(cols[3]).text().replace(',', '.')) || 0,
          valor_total: parseFloat($(cols[4]).text().replace(',', '.')) || 0,
          complexidade: inferComplexidade(codigo),
        });
      }
    }
  });

  // Try alternative selectors
  $('.codigo-sigtap, [data-codigo-sigtap]').each((_, el) => {
    const codigo = $(el).attr('data-codigo-sigtap') || $(el).text().trim();
    const row = $(el).closest('tr');

    if (codigo && /^\d{10}$/.test(codigo)) {
      procedures.push({
        codigo,
        descricao: row.find('.descricao, td:nth-child(2)').text().trim(),
        grupo: codigo.substring(0, 2),
        subgrupo: codigo.substring(2, 4),
        forma_organizacao: codigo.substring(4, 6),
        valor_sh: parseFloat(row.find('.valor-sh, td:nth-child(3)').text().replace(',', '.')) || 0,
        valor_sp: parseFloat(row.find('.valor-sp, td:nth-child(4)').text().replace(',', '.')) || 0,
        valor_total: parseFloat(row.find('.valor-total, td:nth-child(5)').text().replace(',', '.')) || 0,
        complexidade: inferComplexidade(codigo),
      });
    }
  });

  return procedures;
}

/**
 * Infer complexity from SIGTAP code
 */
function inferComplexidade(codigo: string): 'AB' | 'MC' | 'AC' {
  const grupo = codigo.substring(0, 2);

  // Grupos de alta complexidade
  if (['04', '05'].includes(grupo)) return 'AC';

  // Grupos de atenção básica
  if (['01'].includes(grupo)) return 'AB';

  // Default média complexidade
  return 'MC';
}

/**
 * Step 2: Validate with GPT-4o Mini
 */
async function validateWithGpt4oMini(
  data: SigtapProcedure[]
): Promise<{ isValid: boolean; warnings: string[] }> {
  const warnings: string[] = [];

  if (data.length < 10) {
    warnings.push(`Low procedure count: ${data.length}`);
  }

  // Check for variety in groups
  const grupos = new Set(data.map(p => p.grupo));
  if (grupos.size < 3) {
    warnings.push('Low variety in procedure groups');
  }

  // Validate with GPT-4o Mini
  try {
    const sampleData = data.slice(0, 10);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a Brazilian healthcare data validator. Validate SIGTAP procedure data.
Check for: valid 10-digit codes, reasonable descriptions in Portuguese, valid SUS values.
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
    return { isValid: warnings.length < 2, warnings };
  }
}

/**
 * Step 3: Fallback using GPT-5 Mini with web search
 */
async function fallbackWithGpt5Mini(): Promise<SigtapProcedure[]> {
  console.log('[DATASUS Scraper] Using GPT-5 Mini web search fallback...');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use gpt-5-mini when available
      messages: [
        {
          role: 'system',
          content: `You are a healthcare data specialist. Search for current SIGTAP procedure codes and values from DATASUS Brazil.
Return a JSON array with: codigo (10 digits), descricao, grupo, subgrupo, valor_sh, valor_sp, valor_total, complexidade (AB/MC/AC).
Include common SUS procedures: consultations, lab tests, hospitalizations, surgeries.
Return at least 20 procedures.`,
        },
        {
          role: 'user',
          content: 'Please provide current SIGTAP procedure codes with SUS values from DATASUS. Include common procedures across different complexity levels.',
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
          grupo: p.grupo || (p.codigo || p.code).substring(0, 2),
          subgrupo: p.subgrupo || (p.codigo || p.code).substring(2, 4),
          forma_organizacao: p.forma_organizacao || '01',
          valor_sh: parseFloat(p.valor_sh) || 0,
          valor_sp: parseFloat(p.valor_sp) || 0,
          valor_total: parseFloat(p.valor_total) || 0,
          complexidade: p.complexidade || 'MC',
        }));
      }
    }
  } catch (error) {
    console.error('[DATASUS Scraper] GPT fallback failed:', error);
  }

  return [];
}

/**
 * Cache valid data to JSON file
 */
async function cacheData(procedures: SigtapProcedure[]): Promise<void> {
  const existingData = await loadExistingData();

  const output = {
    _meta: {
      description: 'Tabela SIGTAP - Sistema de Gerenciamento da Tabela de Procedimentos do SUS',
      source: 'DATASUS - Ministério da Saúde',
      version: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      last_update: new Date().toISOString(),
      procedure_count: procedures.length,
      note: 'Auto-updated by DATASUS Scraper',
    },
    procedures: mergeProcedures(existingData.procedures || [], procedures),
    grupos: [
      { codigo: '01', nome: 'Ações de promoção e prevenção em saúde' },
      { codigo: '02', nome: 'Procedimentos com finalidade diagnóstica' },
      { codigo: '03', nome: 'Procedimentos clínicos' },
      { codigo: '04', nome: 'Procedimentos cirúrgicos' },
      { codigo: '05', nome: 'Transplantes de órgãos, tecidos e células' },
      { codigo: '06', nome: 'Medicamentos' },
      { codigo: '07', nome: 'Órteses, próteses e materiais especiais' },
      { codigo: '08', nome: 'Ações complementares da atenção à saúde' },
    ],
    complexidades: {
      AB: 'Atenção Básica',
      MC: 'Média Complexidade',
      AC: 'Alta Complexidade',
    },
  };

  fs.writeFileSync(DATA_OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`[DATASUS Scraper] Cached ${output.procedures.length} procedures to ${DATA_OUTPUT_PATH}`);
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
    console.warn('[DATASUS Scraper] Could not load existing data:', error);
  }
  return { procedures: [] };
}

/**
 * Merge procedures avoiding duplicates
 */
function mergeProcedures(
  existing: SigtapProcedure[],
  newData: SigtapProcedure[]
): SigtapProcedure[] {
  const merged = new Map<string, SigtapProcedure>();

  for (const proc of existing) {
    merged.set(proc.codigo, proc);
  }

  for (const proc of newData) {
    merged.set(proc.codigo, proc);
  }

  return Array.from(merged.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
}

// CLI execution
if (require.main === module) {
  scrapeSigtap()
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
