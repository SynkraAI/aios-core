#!/usr/bin/env node
/**
 * eSocial - Correção Salarial Graça
 * Semi-automático: executa cada mês e pausa para confirmação
 *
 * Usage: node tools/esocial-correcao-graca.js [startFrom]
 * Example: node tools/esocial-correcao-graca.js 2023-03
 */

const { chromium } = require('playwright');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// ============================================================
// BRAVE BROWSER CONFIG
// ============================================================
// Chrome será aberto via Playwright channel: 'chrome'

// ============================================================
// DATA: Meses que precisam de correção (a partir de jan/2023)
// ============================================================
const CORRECTIONS = [
  // 2023: Jan-Abr SM=1302, 1.5x=1953 | Mai-Dez SM=1320, 1.5x=1980
  { year: '2023', month: 'Jan', monthIndex: 0, salary: '1953,00' },
  { year: '2023', month: 'Fev', monthIndex: 1, salary: '1953,00' },
  { year: '2023', month: 'Mar', monthIndex: 2, salary: '1953,00' },
  { year: '2023', month: 'Abr', monthIndex: 3, salary: '1953,00' },
  { year: '2023', month: 'Mai', monthIndex: 4, salary: '1980,00' },
  { year: '2023', month: 'Jun', monthIndex: 5, salary: '1980,00' },
  { year: '2023', month: 'Jul', monthIndex: 6, salary: '1980,00' },
  { year: '2023', month: 'Ago', monthIndex: 7, salary: '1980,00' },
  { year: '2023', month: 'Set', monthIndex: 8, salary: '1980,00' },
  { year: '2023', month: 'Out', monthIndex: 9, salary: '1980,00' },
  { year: '2023', month: 'Nov', monthIndex: 10, salary: '1980,00' },
  { year: '2023', month: '13º salário', monthIndex: 11, salary: '1980,00' },
  { year: '2023', month: 'Dez', monthIndex: 12, salary: '1980,00' },

  // 2024: SM=1412, 1.5x=2118
  { year: '2024', month: 'Jan', monthIndex: 0, salary: '2118,00' },
  { year: '2024', month: 'Fev', monthIndex: 1, salary: '2118,00' },
  { year: '2024', month: 'Mar', monthIndex: 2, salary: '2118,00' },
  { year: '2024', month: 'Abr', monthIndex: 3, salary: '2118,00' },
  { year: '2024', month: 'Mai', monthIndex: 4, salary: '2118,00' },
  { year: '2024', month: 'Jun', monthIndex: 5, salary: '2118,00' },
  { year: '2024', month: 'Jul', monthIndex: 6, salary: '2118,00' },
  { year: '2024', month: 'Ago', monthIndex: 7, salary: '2118,00' },
  { year: '2024', month: 'Set', monthIndex: 8, salary: '2118,00' },
  { year: '2024', month: 'Out', monthIndex: 9, salary: '2118,00' },
  { year: '2024', month: 'Nov', monthIndex: 10, salary: '2118,00' },
  { year: '2024', month: '13º salário', monthIndex: 11, salary: '2118,00' },
  { year: '2024', month: 'Dez', monthIndex: 12, salary: '2118,00' },

  // 2025: SM=1518, 1.5x=2277
  { year: '2025', month: 'Jan', monthIndex: 0, salary: '2277,00' },
  { year: '2025', month: 'Fev', monthIndex: 1, salary: '2277,00' },
  { year: '2025', month: 'Mar', monthIndex: 2, salary: '2277,00' },
  { year: '2025', month: 'Abr', monthIndex: 3, salary: '2277,00' },
  { year: '2025', month: 'Mai', monthIndex: 4, salary: '2277,00' },
  { year: '2025', month: 'Jun', monthIndex: 5, salary: '2277,00' },
  { year: '2025', month: 'Jul', monthIndex: 6, salary: '2277,00' },
  { year: '2025', month: 'Ago', monthIndex: 7, salary: '2277,00' },
  { year: '2025', month: 'Set', monthIndex: 8, salary: '2277,00' },
  { year: '2025', month: 'Out', monthIndex: 9, salary: '2277,00' },
  { year: '2025', month: 'Nov', monthIndex: 10, salary: '2277,00' },
  { year: '2025', month: '13º salário', monthIndex: 11, salary: '2277,00' },
  { year: '2025', month: 'Dez', monthIndex: 12, salary: '2277,00' },

  // 2026: SM=1621, 1.5x=2431,50
  { year: '2026', month: 'Jan', monthIndex: 0, salary: '2431,50' },
  { year: '2026', month: 'Fev', monthIndex: 1, salary: '2431,50' },
  { year: '2026', month: 'Mar', monthIndex: 2, salary: '2431,50' },
];

const DOWNLOAD_DIR = '/Users/luizfosc/Dropbox/Downloads/GUIAS';
const ESOCIAL_URL = 'https://www.esocial.gov.br/portal/FolhaPagamento/Listagem/ListarPagamentos';
const WORKER_NAME = 'MARIA DAS GRACAS DOS SANTOS CARVALHO';

// Month labels as they appear on the eSocial page
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', '13º salário', 'Dez'];

// ============================================================
// HELPERS
// ============================================================

function createRL() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function waitForLoadingToFinish(page) {
  // Sites do governo nunca param de fazer requests — usar domcontentloaded + sleep
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
  } catch {
    // ok, continue
  }
  await page.waitForTimeout(2000);
}

async function safeClick(page, selector, description) {
  console.log(`  → Clicando: ${description}...`);
  const el = await page.waitForSelector(selector, { timeout: 15000 });
  await el.click();
  await waitForLoadingToFinish(page);
}

async function waitForPopupAndClick(page, buttonText, description) {
  console.log(`  → Aguardando popup: ${description}...`);
  await page.waitForTimeout(1500);
  const btn = await page.waitForSelector(
    `button:has-text("${buttonText}"), input[value="${buttonText}"], a:has-text("${buttonText}")`,
    { timeout: 15000 }
  );
  await btn.click();
  await waitForLoadingToFinish(page);
}

// ============================================================
// MAIN WORKFLOW
// ============================================================

async function tryStep(page, rl, stepNum, description, action) {
  console.log(`STEP ${stepNum}: ${description}...`);
  try {
    await action();
    console.log(`  ✓ ${description} OK`);
    return true;
  } catch (err) {
    console.log(`  ⚠️ Falhou: ${err.message.split('\n')[0]}`);
    console.log(`  → Faça manualmente: ${description}`);
    await ask(rl, '  Pressione ENTER quando terminar este passo...');
    return false;
  }
}

async function processMonth(page, correction, rl) {
  const { year, month, monthIndex, salary } = correction;
  const label = `${month}/${year}`;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  PROCESSANDO: ${label} → Novo salário: R$ ${salary}`);
  console.log(`${'═'.repeat(60)}\n`);

  // STEP 1: Navigate to payroll page
  await tryStep(page, rl, 1, 'Navegando para Folha de Pagamento', async () => {
    await page.goto(ESOCIAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForLoadingToFinish(page);
  });

  // STEP 2: Select year
  await tryStep(page, rl, 2, `Selecionando ano ${year}`, async () => {
    const yearTab = await page.waitForSelector(`text="${year}"`, { timeout: 10000 });
    await yearTab.click();
    await waitForLoadingToFinish(page);
  });

  // STEP 3: Click month
  await tryStep(page, rl, 3, `Selecionando mês ${month}`, async () => {
    const monthLink = await page.waitForSelector(
      `a:has-text("${month}"), button:has-text("${month}"), [role="tab"]:has-text("${month}")`,
      { timeout: 10000 }
    );
    await monthLink.click();
    await waitForLoadingToFinish(page);
  });

  // STEP 4: Reopen payroll (only if needed)
  await tryStep(page, rl, 4, 'Reabrindo folha (se necessário)', async () => {
    // Check if "Encerrar Folha" button exists — means it's already open
    const alreadyOpen = await page.$('button:has-text("Encerrar Folha"), input[value="Encerrar Folha"], a:has-text("Encerrar Folha")');
    if (alreadyOpen) {
      console.log('  ℹ Folha já está aberta — pulando reabertura');
      return;
    }

    const reopenBtn = await page.waitForSelector(
      'button:has-text("Reabrir Folha"), input[value="Reabrir Folha"], a:has-text("Reabrir Folha")',
      { timeout: 5000 }
    );
    await reopenBtn.click();
    await page.waitForTimeout(1500);
    // Confirm popup "Deseja continuar?"
    await waitForPopupAndClick(page, 'Confirmar', 'Confirmação de reabertura');
    // Wait for overlay to close
    try {
      await page.waitForSelector('.ui-widget-overlay', { state: 'hidden', timeout: 10000 });
    } catch {
      await page.evaluate(() => {
        document.querySelectorAll('.ui-widget-overlay').forEach(el => el.remove());
        document.querySelectorAll('.ui-dialog').forEach(el => el.style.display = 'none');
      });
    }
    await page.waitForTimeout(2000);
  });

  // STEP 5: Click on worker name
  await tryStep(page, rl, 5, 'Clicando no nome da trabalhadora', async () => {
    const workerLink = await page.waitForSelector(
      `a:has-text("${WORKER_NAME}")`, { timeout: 10000 }
    );
    await workerLink.click();
    await waitForLoadingToFinish(page);
  });

  // STEP 6: Change salary
  await tryStep(page, rl, 6, `Alterando salário para R$ ${salary}`, async () => {
    let salaryInput;
    const selectors = [
      'input[value="1.500,00"]', 'input[value="1500,00"]',
      'tr:has-text("Salário") input[type="text"]',
      'td:has-text("Salário") ~ td input',
    ];
    for (const sel of selectors) {
      try {
        salaryInput = await page.waitForSelector(sel, { timeout: 2000 });
        if (salaryInput) break;
      } catch { /* next */ }
    }
    if (!salaryInput) throw new Error('Campo de salário não encontrado');
    await salaryInput.click({ clickCount: 3 });
    await page.waitForTimeout(300);
    await salaryInput.fill('');
    await salaryInput.type(salary, { delay: 50 });
    await page.click('body', { position: { x: 10, y: 10 } });
    await waitForLoadingToFinish(page);
  });

  // ──── PAUSE: verify ────
  console.log('\n  ⏸️  PAUSA — Verifique o valor na tela.');
  const confirm1 = await ask(rl, '  Tudo certo? (s/n/pular): ');
  if (confirm1.toLowerCase() === 'n') {
    await ask(rl, '  Ajuste manualmente. ENTER quando pronto...');
  } else if (confirm1.toLowerCase() === 'pular') {
    return 'skipped';
  }

  // STEP 7: Save
  await tryStep(page, rl, 7, 'Salvando remuneração', async () => {
    await safeClick(page,
      'button:has-text("Salvar Remuneração"), input[value="Salvar Remuneração"], a:has-text("Salvar")',
      'Salvar Remuneração');
  });

  // STEP 8: Confirm closure
  await tryStep(page, rl, 8, 'Confirmando encerramento', async () => {
    await waitForPopupAndClick(page, 'Confirma', 'Encerramento');
  });

  // STEP 9: Click "Edição da Guia" link
  await tryStep(page, rl, 9, 'Acessando Edição da Guia', async () => {
    const editLink = await page.waitForSelector(
      'a:has-text("Edição da Guia"), a:has-text("acesse a página de Edição da Guia")',
      { timeout: 10000 });
    await editLink.click();
    await waitForLoadingToFinish(page);
  });

  // STEP 10: Abater Pagamentos
  await tryStep(page, rl, 10, 'Clicando Abater Pagamentos Anteriores', async () => {
    await safeClick(page,
      'button:has-text("Abater Pagamentos Anteriores"), input[value="Abater Pagamentos Anteriores"]',
      'Abater Pagamentos Anteriores');
  });

  // STEP 11: Check checkbox + confirm
  await tryStep(page, rl, 11, 'Marcando guia anterior + confirmar', async () => {
    await page.waitForTimeout(2000);
    const checkbox = await page.waitForSelector('input[type="checkbox"]', { timeout: 10000 });
    if (!(await checkbox.isChecked())) await checkbox.check();
    await waitForPopupAndClick(page, 'Confirmar', 'Confirmar abatimento');
  });

  // STEP 12: OK popup
  await tryStep(page, rl, 12, 'Confirmando popup de sucesso', async () => {
    await waitForPopupAndClick(page, 'OK', 'Guia abatida com sucesso');
  });

  // STEP 13: Emit DAE
  await tryStep(page, rl, 13, 'Emitindo DAE', async () => {
    await safeClick(page,
      'button:has-text("Emitir DAE"), input[value="Emitir DAE"]',
      'Emitir DAE');
  });

  // STEP 14: Confirm DAE popup
  await tryStep(page, rl, 14, 'Confirmando emissão DAE (popup)', async () => {
    await waitForPopupAndClick(page, 'Emitir DAE', 'Emitir DAE popup');
  });

  // STEP 15: Confirm
  await tryStep(page, rl, 15, 'Confirmando', async () => {
    await waitForPopupAndClick(page, 'Confirmar', 'Confirmar emissão');
  });

  // STEP 16: Download
  console.log('STEP 16: Aguardando download da guia...');
  await page.waitForTimeout(3000);

  // Try to detect and rename the downloaded file
  const downloadName = `DAE_${year}-${String(monthIndex + 1).padStart(2, '0')}_${month.replace(/[º ]/g, '')}_correcao.pdf`;
  const downloadPath = path.join(DOWNLOAD_DIR, downloadName);
  console.log(`  ℹ Salve a guia como: ${downloadPath}`);

  // STEP 17: Click OK on success
  console.log('STEP 17: Fechando popup de sucesso...');
  await waitForPopupAndClick(page, 'OK', 'Guia gerada com sucesso');

  // STEP 18: Click Voltar
  console.log('STEP 18: Voltando ao menu principal...');
  await safeClick(page,
    'button:has-text("Voltar"), input[value="Voltar"], a:has-text("Voltar")',
    'Voltar'
  );
  await waitForLoadingToFinish(page);

  // STEP 19: Download Recibo and Relatório Consolidado
  console.log('STEP 19: Baixando Recibos e Relatório Consolidado...');
  try {
    const reciboBtn = await page.waitForSelector(
      'button:has-text("Emitir Recibos"), a:has-text("Emitir Recibos")',
      { timeout: 5000 }
    );
    await reciboBtn.click();
    await page.waitForTimeout(3000);
  } catch {
    console.log('  ⚠️ Botão "Emitir Recibos" não encontrado');
  }

  try {
    const relatorioBtn = await page.waitForSelector(
      'button:has-text("Emitir Relatório Consolidado"), a:has-text("Emitir Relatório Consolidado")',
      { timeout: 5000 }
    );
    await relatorioBtn.click();
    await page.waitForTimeout(3000);
  } catch {
    console.log('  ⚠️ Botão "Emitir Relatório Consolidado" não encontrado');
  }

  console.log(`\n  ✅ ${label} CONCLUÍDO!\n`);
  return 'done';
}

// ============================================================
// ENTRY POINT
// ============================================================

async function main() {
  const startFrom = process.argv[2] || '2023-03'; // Default: March 2023
  const [startYear, startMonthStr] = startFrom.split('-');
  const startMonthIdx = parseInt(startMonthStr, 10) - 1;

  // Filter corrections starting from the specified month
  const monthMap = { 'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5, 'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, '13º salário': 12, 'Dez': 11 };
  const pending = CORRECTIONS.filter(c => {
    if (parseInt(c.year) > parseInt(startYear)) return true;
    if (parseInt(c.year) < parseInt(startYear)) return false;
    const mIdx = monthMap[c.month] ?? c.monthIndex;
    return mIdx >= startMonthIdx;
  });

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   eSocial — Correção Salarial Graça (Semi-Automático)   ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Meses para corrigir: ${pending.length.toString().padEnd(35)}║`);
  console.log(`║  Início: ${startFrom.padEnd(48)}║`);
  console.log(`║  Download: ${DOWNLOAD_DIR.substring(0,46).padEnd(46)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Ensure download directory exists
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  const rl = createRL();

  // STEP 0: Launch Chrome via Playwright
  console.log('Abrindo Chrome... (vai precisar logar no gov.br uma vez)\n');

  const profileDir = path.join(process.env.HOME, '.esocial-chrome-profile');

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    channel: 'chrome',
    acceptDownloads: true,
    viewport: null,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  console.log('✅ Chrome aberto!\n');

  const page = context.pages()[0] || await context.newPage();

  // Remove webdriver flag to avoid CAPTCHA detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  // Navigate to eSocial login
  console.log('Navegando para eSocial...');
  await page.goto(ESOCIAL_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  📌 FAÇA O LOGIN MANUALMENTE NO CHROME:                 ║');
  console.log('║     1. Clique em "Entrar com gov.br"                    ║');
  console.log('║     2. Coloque CPF, senha e resolva o CAPTCHA           ║');
  console.log('║     3. Navegue até: Folha de Pagamento                  ║');
  console.log('║     4. Volte aqui e pressione ENTER                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  await ask(rl, 'Pressione ENTER quando estiver logado na Folha de Pagamento...');

  let completed = 0;
  let skipped = 0;

  for (const correction of pending) {
    const label = `${correction.month}/${correction.year}`;
    const proceed = await ask(rl, `\n▶ Próximo: ${label} (R$ ${correction.salary}). Continuar? (s/n/sair): `);

    if (proceed.toLowerCase() === 'sair' || proceed.toLowerCase() === 'q') {
      console.log('\n⏹️  Interrompido pelo usuário.');
      break;
    }

    if (proceed.toLowerCase() === 'n') {
      console.log(`  ⏭️  Pulando ${label}`);
      skipped++;
      continue;
    }

    try {
      const result = await processMonth(page, correction, rl);
      if (result === 'done') completed++;
      else if (result === 'skipped') skipped++;
    } catch (err) {
      console.error(`\n  ❌ ERRO em ${label}: ${err.message}`);
      console.error('  O navegador continua aberto para correção manual.');
      const retry = await ask(rl, '  Corrigiu manualmente? (s = continuar, n = parar): ');
      if (retry.toLowerCase() !== 's') break;
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  RESUMO: ${completed} corrigidos, ${skipped} pulados`);
  console.log(`${'═'.repeat(60)}\n`);

  const keepOpen = await ask(rl, 'Manter navegador aberto? (s/n): ');
  if (keepOpen.toLowerCase() !== 's') {
    await context.close();
  }

  rl.close();
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
