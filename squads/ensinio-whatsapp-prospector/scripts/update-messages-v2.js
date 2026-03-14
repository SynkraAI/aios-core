#!/usr/bin/env node
'use strict';

/**
 * Update Google Sheets with v2 outreach messages.
 * ONLY updates columns G (Mensagem) and H (Link) for rows NOT marked "Enviado".
 *
 * Usage:
 *   node squads/ensinio-whatsapp-prospector/scripts/update-messages-v2.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'outputs', 'mentoria-50k');
const PHONE_BOOK_PATH = path.join(__dirname, '..', 'data', 'phone-books', 'mentoria-50k.json');
const SPREADSHEET_ID = '124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI';
const DRY_RUN = process.argv.includes('--dry-run');

// --- Parse v2 outreach messages ---

function parseV2Messages() {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'outreach-messages-v2.md'), 'utf8');
  const sections = raw.split(/^### \d+\./m).slice(1);
  const messages = [];

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const headerMatch = lines[0].match(/^\s*(.+?)\s*\(Score\s*(\d+)\)/);
    if (!headerMatch) continue;

    const name = headerMatch[1].trim();
    const score = parseInt(headerMatch[2], 10);

    // Extract phone
    const phoneLine = lines.find(l => l.includes('**Phone:**'));
    const phone = phoneLine ? phoneLine.replace(/.*\*\*Phone:\*\*\s*/, '').trim() : '';

    // Extract message
    const messageStart = lines.findIndex(l => l.startsWith('**Message:**'));
    if (messageStart === -1) continue;
    let messageEnd = lines.findIndex((l, i) =>
      i > messageStart && (l.startsWith('**WhatsApp Link:**') || l === '---'),
    );
    if (messageEnd === -1) messageEnd = lines.length;
    const message = lines.slice(messageStart + 1, messageEnd).join('\n').trim();

    messages.push({ name, score, phone, message });
  }

  return messages;
}

// --- Normalize name for matching ---

function normalize(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Manual overrides for name mismatches between sheet and v2
const NAME_OVERRIDES = {
  'daiane': 'ferris',    // Sheet has "Daiane", v2 has "Ferris" (Daiane Ferris)
};

function namesMatch(sheetName, v2Name) {
  const s = normalize(sheetName);
  const v = normalize(v2Name);
  if (s === v) return true;
  if (s.includes(v) || v.includes(s)) return true;
  // First name match
  const sFirst = s.split(/\s+/)[0];
  const vFirst = v.split(/\s+/)[0];
  if (sFirst.length > 2 && sFirst === vFirst) return true;
  // Manual overrides
  if (NAME_OVERRIDES[s] === v || NAME_OVERRIDES[v] === s) return true;
  return false;
}

// --- Build WhatsApp link ---

function buildWhatsAppLink(phone, message) {
  if (!phone || phone === 'NEEDS_RESOLUTION' || phone === 'VERIFICAR') return '';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

// --- Main ---

async function main() {
  console.log('\n=== Update Messages v2 in Google Sheets ===\n');

  // Step 1: Parse v2 messages
  console.log('1. Parseando outreach-messages-v2.md...');
  const v2Messages = parseV2Messages();
  console.log(`   ${v2Messages.length} mensagens v2 parseadas`);

  // Step 2: Read current sheet state
  console.log('\n2. Lendo estado atual da planilha...');
  const { createSheetsClient } = require('../../../tools/google-sheets-writer');
  const sheets = await createSheetsClient();

  const namesResult = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A1:A80',
  });
  const sheetNames = (namesResult.data.values || []).flat();

  const statusResult = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'I1:I80',
  });
  const statuses = (statusResult.data.values || []).flat();

  console.log(`   ${sheetNames.length - 1} linhas na planilha`);
  const sentCount = statuses.filter(s => s === 'Enviado').length;
  console.log(`   ${sentCount} ja enviadas (serao PULADAS)`);

  // Step 3: Match and prepare updates
  console.log('\n3. Mapeando mensagens v2 para linhas da planilha...');
  const updates = [];
  const skipped = [];
  const notFound = [];

  // Load phone book for fallback phone resolution
  const phoneBook = JSON.parse(fs.readFileSync(PHONE_BOOK_PATH, 'utf8'));

  for (let row = 1; row < sheetNames.length; row++) {
    const sheetName = sheetNames[row];
    const status = statuses[row] || '';

    if (status === 'Enviado') {
      skipped.push({ row: row + 1, name: sheetName, reason: 'ja enviado' });
      continue;
    }

    // Find matching v2 message
    const match = v2Messages.find(m => namesMatch(sheetName, m.name));

    if (!match) {
      notFound.push({ row: row + 1, name: sheetName });
      continue;
    }

    // Resolve phone: prefer phone-book, then v2, then sheet
    let phone = match.phone;
    if (!phone || phone === 'NEEDS_RESOLUTION') {
      // Try phone-book
      for (const [cn, cd] of Object.entries(phoneBook.contacts)) {
        if (namesMatch(cn, sheetName) || namesMatch(cn, match.name)) {
          phone = cd.phone;
          break;
        }
      }
    }

    const waLink = buildWhatsAppLink(phone, match.message);

    updates.push({
      row: row + 1, // 1-indexed for Sheets
      name: sheetName,
      v2Name: match.name,
      score: match.score,
      message: match.message,
      waLink,
      phone,
    });
  }

  console.log(`   ${updates.length} mensagens para atualizar`);
  console.log(`   ${skipped.length} puladas (ja enviadas)`);
  if (notFound.length > 0) {
    console.log(`   ${notFound.length} nao encontradas no v2:`);
    for (const nf of notFound) {
      console.log(`     Linha ${nf.row}: "${nf.name}"`);
    }
  }

  // Step 4: Preview
  console.log('\n4. Preview das atualizacoes:');
  for (const u of updates.slice(0, 5)) {
    const msgPreview = u.message.substring(0, 60).replace(/\n/g, ' ') + '...';
    console.log(`   Linha ${u.row}: ${u.name} (Score ${u.score}) -> "${msgPreview}"`);
  }
  if (updates.length > 5) {
    console.log(`   ... e ${updates.length - 5} mais`);
  }

  if (DRY_RUN) {
    console.log('\n*** DRY RUN — nada foi escrito ***');
    console.log('Rode sem --dry-run para atualizar a planilha.\n');
    return;
  }

  // Step 5: Write updates in batches
  console.log('\n5. Escrevendo no Google Sheets...');

  const batchData = updates.map(u => ({
    range: `G${u.row}:H${u.row}`,
    values: [[u.message, u.waLink]],
  }));

  // Use batchUpdate for efficiency
  const batchResult = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: batchData,
    },
  });

  console.log(`   ${batchResult.data.totalUpdatedCells} celulas atualizadas`);
  console.log(`   ${batchResult.data.totalUpdatedRows} linhas atualizadas`);

  // Step 6: Summary
  console.log('\n=== Resultado ===');
  console.log(`  Atualizadas: ${updates.length} mensagens`);
  console.log(`  Puladas: ${skipped.length} (ja enviadas)`);
  console.log(`  Nao encontradas: ${notFound.length}`);
  console.log(`  Planilha: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
  console.log('\n  As 6 mensagens ja enviadas NAO foram alteradas.');
  console.log('  Colunas atualizadas: G (Mensagem) e H (Link WhatsApp)\n');
}

main().catch(err => {
  console.error(`\nFatal: ${err.message}`);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
