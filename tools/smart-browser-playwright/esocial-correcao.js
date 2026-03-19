#!/usr/bin/env node

/**
 * eSocial — Correção Salarial Graça (via Stagehand AI)
 *
 * Usa linguagem natural pra cada passo. Se a AI não encontrar o elemento,
 * pausa e pede ajuda.
 *
 * Usage:
 *   node esocial-correcao.js              # Começa do primeiro pendente
 *   node esocial-correcao.js 2023-04      # Começa de Abril/2023
 *   node esocial-correcao.js 2024-01      # Começa de Janeiro/2024
 */

import { Stagehand } from '@browserbasehq/stagehand';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// ENV
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = resolve(__dirname, '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------
const CORRECTIONS = [
  // Mar-Abr/2023: SM=1302, 1.5x=1953
  { year: '2023', month: 'Mar', salary: '1953,00' },
  { year: '2023', month: 'Abr', salary: '1953,00' },
  // Mai-Dez/2023 + 13º: SM=1320, 1.5x=1980
  { year: '2023', month: 'Mai', salary: '1980,00' },
  { year: '2023', month: 'Jun', salary: '1980,00' },
  { year: '2023', month: 'Jul', salary: '1980,00' },
  { year: '2023', month: 'Ago', salary: '1980,00' },
  { year: '2023', month: 'Set', salary: '1980,00' },
  { year: '2023', month: 'Out', salary: '1980,00' },
  { year: '2023', month: 'Nov', salary: '1980,00' },
  { year: '2023', month: '13º salário', salary: '1980,00' },
  { year: '2023', month: 'Dez', salary: '1980,00' },
  // 2024: SM=1412, 1.5x=2118
  ...['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov'].map(m => ({ year: '2024', month: m, salary: '2118,00' })),
  { year: '2024', month: '13º salário', salary: '2118,00' },
  { year: '2024', month: 'Dez', salary: '2118,00' },
  // 2025: SM=1518, 1.5x=2277
  ...['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov'].map(m => ({ year: '2025', month: m, salary: '2277,00' })),
  { year: '2025', month: '13º salário', salary: '2277,00' },
  { year: '2025', month: 'Dez', salary: '2277,00' },
  // 2026: SM=1621, 1.5x=2431,50
  { year: '2026', month: 'Jan', salary: '2431,50' },
  { year: '2026', month: 'Fev', salary: '2431,50' },
  { year: '2026', month: 'Mar', salary: '2431,50' },
];

const MONTH_ORDER = { 'Jan': 1, 'Fev': 2, 'Mar': 3, 'Abr': 4, 'Mai': 5, 'Jun': 6, 'Jul': 7, 'Ago': 8, 'Set': 9, 'Out': 10, 'Nov': 11, 'Dez': 12, '13º salário': 13 };

const ESOCIAL_URL = 'https://www.esocial.gov.br/portal/FolhaPagamento/Listagem/ListarPagamentos';
const DOWNLOAD_DIR = join(process.env.HOME, 'Dropbox/Downloads/GUIAS');
const PROFILE_DIR = join(process.env.HOME, '.esocial-stagehand-profile');

// ---------------------------------------------------------------------------
// Readline
// ---------------------------------------------------------------------------
function createRL() {
  return createInterface({ input: process.stdin, output: process.stdout });
}
function ask(rl, question) {
  return new Promise((r) => rl.question(question, (a) => r(a.trim())));
}

// ---------------------------------------------------------------------------
// Smart step: try AI first, fallback to human
// ---------------------------------------------------------------------------
async function smartStep(stagehand, page, stepNum, description, aiAction, options = {}) {
  const { maxRetries = 2, waitAfter = 2000 } = options;
  console.log(`  STEP ${stepNum}: ${description}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await stagehand.act(aiAction);
      console.log(`    ✓ OK (AI, tentativa ${attempt})`);
      if (waitAfter > 0) await page.waitForTimeout(waitAfter);
      return true;
    } catch (err) {
      const msg = err.message.split('\n')[0].slice(0, 100);
      console.log(`    ⚠ Tentativa ${attempt}/${maxRetries} falhou: ${msg}`);
    }
  }

  // AI failed — ask human
  console.log(`    ❌ AI não conseguiu: ${description}`);
  console.log(`    → Faça manualmente no Chrome.`);
  const rl = createRL();
  await ask(rl, '    Pressione ENTER quando terminar este passo...');
  rl.close();
  return false;
}

// ---------------------------------------------------------------------------
// Process one month
// ---------------------------------------------------------------------------
async function processMonth(stagehand, page, correction, rl) {
  const { year, month, salary } = correction;
  const label = `${month}/${year}`;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  PROCESSANDO: ${label} → R$ ${salary}`);
  console.log(`${'═'.repeat(60)}\n`);

  // 1. Navigate to payroll page
  console.log('  STEP 1: Navegando para Folha de Pagamento...');
  await page.goto(ESOCIAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('    ✓ Página carregada');

  // 2. Select year
  await smartStep(stagehand, page, 2,
    `Selecionando ano ${year}`,
    `Click on the year tab or link that shows "${year}"`
  );

  // 3. Click month
  await smartStep(stagehand, page, 3,
    `Selecionando mês ${month}`,
    `Click on the month "${month}" in the payroll calendar or list`
  );

  // 4. Reopen payroll (ALWAYS try — AI decides if button exists)
  // Wait for page to fully load after clicking month
  await page.waitForTimeout(3000);

  await smartStep(stagehand, page, '4a',
    'Tentando reabrir folha',
    'Look for a button that says "Reabrir Folha" and click it. If instead you see "Encerrar Folha", that means the payroll is already open — do nothing.',
    { maxRetries: 1, waitAfter: 2000 }
  );

  // If reopen was clicked, confirm the popup
  await smartStep(stagehand, page, '4b',
    'Confirmando popup de reabertura (se apareceu)',
    'If there is a confirmation popup dialog asking "Deseja continuar?" or similar, click the "Confirmar" button. If there is no popup, do nothing.',
    { maxRetries: 1, waitAfter: 3000 }
  );

  // Wait for any overlay to close
  await page.waitForTimeout(2000);
  try {
    await page.evaluate(() => {
      document.querySelectorAll('.ui-widget-overlay').forEach(el => el.remove());
      document.querySelectorAll('.ui-dialog').forEach(el => { if (el.style.display !== 'none') el.style.display = 'none'; });
    });
  } catch { /* ok */ }

  // 5. Click worker name
  await smartStep(stagehand, page, 5,
    'Clicando no nome da trabalhadora',
    'Click on the link or text that says "MARIA DAS GRACAS DOS SANTOS CARVALHO"'
  );

  // 6. Change salary — wait for page to load after clicking worker
  await page.waitForTimeout(2000);

  await smartStep(stagehand, page, 6,
    `Alterando salário para R$ ${salary}`,
    `Find the input field that contains the salary value (it currently shows "1.500,00" or "1500,00" or similar). Click on it to select it, clear the current value completely, and type the new value "${salary}". Make sure the field now shows "${salary}".`,
    { maxRetries: 2, waitAfter: 2000 }
  );

  // Click elsewhere to trigger any onblur validation
  try {
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
  } catch { /* ok */ }

  // ─── PAUSE: verify ───
  console.log('\n  ⏸️  PAUSA — Verifique o valor na tela do Chrome.');
  const confirm = await ask(rl, '  Valor correto? (s/n/pular): ');
  if (confirm.toLowerCase() === 'n') {
    await ask(rl, '  Ajuste manualmente. ENTER quando pronto...');
  } else if (confirm.toLowerCase() === 'pular') {
    return 'skipped';
  }

  // 7. Save
  await smartStep(stagehand, page, 7,
    'Salvando remuneração',
    'Click the "Salvar Remuneração" button'
  );

  // 8. Confirm closure
  await smartStep(stagehand, page, 8,
    'Confirmando encerramento',
    'Click "Confirma" or "Confirmar" button in the popup to confirm the payroll closure',
    { waitAfter: 3000 }
  );

  // 9. Access "Edição da Guia"
  await smartStep(stagehand, page, 9,
    'Acessando Edição da Guia',
    'Click the link that says "acesse a página de Edição da Guia" or "Edição da Guia"',
    { waitAfter: 3000 }
  );

  // 10. Abater Pagamentos
  await smartStep(stagehand, page, 10,
    'Abater Pagamentos Anteriores',
    'Click the "Abater Pagamentos Anteriores" button',
    { waitAfter: 2000 }
  );

  // 11. Checkbox + confirm
  await smartStep(stagehand, page, 11,
    'Marcando checkbox da guia anterior',
    'Check the checkbox next to the payment guide entry in the table, then click "Confirmar"',
    { waitAfter: 2000 }
  );

  // 12. OK popup
  await smartStep(stagehand, page, 12,
    'Confirmando popup "Guia abatida com sucesso"',
    'Click the "OK" button in the success popup',
    { waitAfter: 1500 }
  );

  // 13. Emit DAE
  await smartStep(stagehand, page, 13,
    'Emitindo DAE',
    'Click the "Emitir DAE" button'
  );

  // 14. Confirm DAE popup
  await smartStep(stagehand, page, 14,
    'Confirmando emissão DAE (popup)',
    'Click "Emitir DAE" in the popup dialog',
    { waitAfter: 1500 }
  );

  // 15. Confirm
  await smartStep(stagehand, page, 15,
    'Confirmando',
    'Click "Confirmar" button in the popup',
    { waitAfter: 3000 }
  );

  // 16. Wait for download
  console.log('  STEP 16: Aguardando download da guia PDF...');
  await page.waitForTimeout(4000);
  const monthNum = MONTH_ORDER[month] || 0;
  const filename = `DAE_${year}-${String(monthNum).padStart(2, '0')}_${month.replace(/[º ]/g, '')}_correcao.pdf`;
  console.log(`    ℹ Salve a guia como: ${DOWNLOAD_DIR}/${filename}`);

  // 17. OK on success
  await smartStep(stagehand, page, 17,
    'Fechando popup "Guia gerada com sucesso"',
    'Click "OK" button in the success popup'
  );

  // 18. Voltar
  await smartStep(stagehand, page, 18,
    'Voltando ao menu',
    'Click the "Voltar" button or link to go back to the payroll list'
  );

  // 19. Download docs
  console.log('  STEP 19: Baixando Recibos e Relatório...');
  try {
    await stagehand.act('Click "Emitir Recibos" button');
    await page.waitForTimeout(3000);
  } catch { console.log('    ⚠ "Emitir Recibos" não encontrado'); }

  try {
    await stagehand.act('Click "Emitir Relatório Consolidado" button');
    await page.waitForTimeout(3000);
  } catch { console.log('    ⚠ "Emitir Relatório Consolidado" não encontrado'); }

  console.log(`\n  ✅ ${label} CONCLUÍDO!\n`);
  return 'done';
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  const startFrom = process.argv[2] || '2023-04';
  const [startYear, startMonthStr] = startFrom.split('-');
  const startMonthNum = parseInt(startMonthStr, 10);

  // Filter corrections
  const pending = CORRECTIONS.filter(c => {
    const y = parseInt(c.year);
    const sy = parseInt(startYear);
    if (y > sy) return true;
    if (y < sy) return false;
    return (MONTH_ORDER[c.month] || 0) >= startMonthNum;
  });

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   eSocial — Correção Salarial Graça (Stagehand AI)         ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Meses pendentes: ${String(pending.length).padEnd(42)}║`);
  console.log(`║  Início: ${startFrom.padEnd(51)}║`);
  console.log(`║  Modelo: openai/gpt-4o-mini (~$0.001/ação)${' '.repeat(19)}║`);
  console.log(`║  Custo estimado: ~$${(pending.length * 17 * 0.001).toFixed(2).padEnd(41)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Ensure dirs exist
  if (!existsSync(DOWNLOAD_DIR)) mkdirSync(DOWNLOAD_DIR, { recursive: true });
  if (!existsSync(PROFILE_DIR)) mkdirSync(PROFILE_DIR, { recursive: true });

  const rl = createRL();

  // Launch Stagehand with persistent Chrome profile
  console.log('🧠 Iniciando Stagehand com Chrome persistente...\n');

  const stagehand = new Stagehand({
    env: 'LOCAL',
    localBrowserLaunchOptions: {
      headless: false,
      userDataDir: PROFILE_DIR,
      acceptDownloads: true,
      viewport: { width: 1280, height: 800 },
    },
    apiKey: process.env.OPENAI_API_KEY,
    model: {
      modelName: 'openai/gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  const page = await stagehand.resolvePage();
  console.log('✅ Chrome aberto!\n');

  // Navigate to eSocial
  console.log('Navegando para eSocial...');
  await page.goto(ESOCIAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  📌 FAÇA O LOGIN MANUALMENTE NO CHROME:                     ║');
  console.log('║     1. Clique em "Entrar com gov.br"                        ║');
  console.log('║     2. CPF, senha, CAPTCHA                                  ║');
  console.log('║     3. Navegue até: Folha de Pagamento                      ║');
  console.log('║     4. Volte aqui e pressione ENTER                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  await ask(rl, 'Pressione ENTER quando estiver logado na Folha de Pagamento...');

  let completed = 0;
  let skipped = 0;
  let aiSuccesses = 0;
  let humanFallbacks = 0;

  for (const correction of pending) {
    const label = `${correction.month}/${correction.year}`;
    const proceed = await ask(rl, `\n▶ Próximo: ${label} (R$ ${correction.salary}). Continuar? (s/n/sair): `);

    if (['sair', 'q', 'exit'].includes(proceed.toLowerCase())) {
      console.log('\n⏹️  Interrompido pelo usuário.');
      break;
    }
    if (proceed.toLowerCase() === 'n') {
      console.log(`  ⏭️  Pulando ${label}`);
      skipped++;
      continue;
    }

    try {
      const result = await processMonth(stagehand, page, correction, rl);
      if (result === 'done') completed++;
      else if (result === 'skipped') skipped++;
    } catch (err) {
      console.error(`\n  ❌ ERRO em ${label}: ${err.message}`);
      console.error('  O Chrome continua aberto — corrija manualmente.');
      const retry = await ask(rl, '  Corrigiu? (s = próximo mês, n = parar): ');
      if (retry.toLowerCase() !== 's') break;
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  RESUMO`);
  console.log(`  ✅ Corrigidos: ${completed}`);
  console.log(`  ⏭️  Pulados: ${skipped}`);
  console.log(`${'═'.repeat(60)}\n`);

  const keepOpen = await ask(rl, 'Manter Chrome aberto? (s/n): ');
  if (keepOpen.toLowerCase() !== 's') {
    await stagehand.close();
  }

  rl.close();
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
