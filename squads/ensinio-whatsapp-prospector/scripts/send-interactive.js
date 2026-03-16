#!/usr/bin/env node
'use strict';

/**
 * Interactive Send Script — Envio de mensagens com escolha de grupo + modo de espaçamento
 *
 * Workflow:
 * 1. Ler TSV (ou Google Sheets)
 * 2. Detectar grupos únicos (Coluna D)
 * 3. Perguntar: "Qual grupo enviar?" (opções numeradas)
 * 4. Perguntar: "Qual modo de espaçamento?" (1-4)
 * 5. Filtrar contatos: grupo selecionado + status "Não enviado"
 * 6. Confirmar: "X contatos, continuar?"
 * 7. Enviar com delays configurados
 * 8. Atualizar progresso em tempo real
 *
 * Modes:
 * 1. NATURAL: 2-4s entre partes, 5-10s entre mensagens (padrão)
 * 2. RÁPIDO: 1-2s entre partes, 3-5s entre mensagens
 * 3. CONSERVADOR: 3-6s entre partes, 10-20s entre mensagens
 * 4. SUPER CONSERVADOR: 5-8s entre partes, 30-60s entre mensagens
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Manual .env parsing (no dotenv dependency)
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const { EvolutionClient } = require('../../../tools/evolution-whatsapp-api');
const { sendWithSplit } = require('../lib/message-splitter');

// Delay modes configuration
const DELAY_MODES = {
  1: {
    name: 'NATURAL',
    description: 'Conversação normal (recomendado)',
    betweenParts: { min: 2000, max: 4000 },
    betweenMessages: { min: 5000, max: 10000 }
  },
  2: {
    name: 'RÁPIDO',
    description: 'Quando tem muita gente pra enviar',
    betweenParts: { min: 1000, max: 2000 },
    betweenMessages: { min: 3000, max: 5000 }
  },
  3: {
    name: 'CONSERVADOR',
    description: 'Evitar spam, parecer mais humano',
    betweenParts: { min: 3000, max: 6000 },
    betweenMessages: { min: 10000, max: 20000 }
  },
  4: {
    name: 'SUPER CONSERVADOR',
    description: 'Anti-ban (1 msg por minuto)',
    betweenParts: { min: 5000, max: 8000 },
    betweenMessages: { min: 30000, max: 60000 }
  }
};

// Helper: readline question promisified
function question(rl, query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Helper: sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: random delay
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Step 1: Read TSV
function readTSV(filePath) {
  console.log(`\n📂 Lendo TSV: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`TSV não encontrado: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length < 2) {
    throw new Error('TSV vazio ou inválido');
  }

  const header = lines[0].split('\t');
  const rows = lines.slice(1).map(line => {
    const values = line.split('\t');
    return {
      nome: values[0]?.trim() || '',
      telefone: values[1]?.trim() || '',
      grupo: values[2]?.trim() || '',
      projeto: values[3]?.trim() || '',
      explicacao: values[4]?.trim() || '',
      mensagem: values[5]?.trim() || '',
      linkWhatsapp: values[6]?.trim() || '',
      statusEnvio: values[7]?.trim() || 'Não enviado',
      linkGhl: values[8]?.trim() || '',
      ghlContactId: values[9]?.trim() || ''
    };
  });

  const validRows = rows.filter(r => r.nome && r.telefone && r.mensagem);
  console.log(`   ✅ ${validRows.length} contatos válidos encontrados`);

  return validRows;
}

// Step 2: Detect unique groups
function detectGroups(contacts) {
  const groups = [...new Set(contacts.map(c => c.grupo))].filter(g => g);
  return groups.sort();
}

// Step 3: Filter by group and status
function filterContacts(contacts, groupName, statusFilter = 'Não enviado') {
  return contacts.filter(c =>
    c.grupo === groupName &&
    (c.statusEnvio === statusFilter || c.statusEnvio === '')
  );
}

// Step 4: Send with delays
async function sendBatch(client, contacts, delayMode) {
  const mode = DELAY_MODES[delayMode];
  console.log(`\n🚀 Iniciando envio (Modo ${delayMode}: ${mode.name})`);
  console.log(`   Entre partes: ${mode.betweenParts.min / 1000}-${mode.betweenParts.max / 1000}s`);
  console.log(`   Entre mensagens: ${mode.betweenMessages.min / 1000}-${mode.betweenMessages.max / 1000}s\n`);

  const results = {
    total: contacts.length,
    sent: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const progress = Math.round(((i + 1) / contacts.length) * 100);

    try {
      console.log(`\n[${i + 1}/${contacts.length}] 📤 Enviando para ${contact.nome} (${contact.telefone})...`);

      // Normalize phone (remove non-digits, ensure +55)
      let phone = contact.telefone.replace(/\D/g, '');
      if (!phone.startsWith('55')) {
        phone = '55' + phone;
      }
      if (!phone.startsWith('+')) {
        phone = '+' + phone;
      }

      // Send with split
      await sendWithSplit(client, phone, contact.mensagem, {
        enableSplit: true,
        minDelay: mode.betweenParts.min,
        maxDelay: mode.betweenParts.max,
        betweenMessages: mode.betweenMessages
      });

      console.log(`   ✅ Enviado com sucesso (${progress}% completo)`);
      results.sent++;

      // Delay between different contacts (except last)
      if (i < contacts.length - 1) {
        const delay = randomDelay(mode.betweenMessages.min, mode.betweenMessages.max);
        console.log(`   ⏱️  Aguardando ${(delay / 1000).toFixed(1)}s até próxima mensagem...`);
        await sleep(delay);
      }

    } catch (error) {
      console.error(`   ❌ Erro ao enviar para ${contact.nome}: ${error.message}`);
      results.failed++;
      results.errors.push({
        contact: contact.nome,
        phone: contact.telefone,
        error: error.message
      });

      // Continue mesmo com erro (não bloqueia o batch)
    }
  }

  return results;
}

// Main
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Ensinio WhatsApp Prospector — Envio Interativo           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Step 1: Read TSV
    const tsvPath = path.join(__dirname, '../data/outputs/mentoria-50k/outreach-sheets-final.tsv');
    const allContacts = readTSV(tsvPath);

    // Step 2: Detect groups
    const groups = detectGroups(allContacts);

    if (groups.length === 0) {
      console.log('❌ Nenhum grupo encontrado no TSV (coluna 3 vazia?)');
      process.exit(1);
    }

    console.log(`\n📊 Grupos disponíveis (${groups.length}):\n`);
    groups.forEach((group, index) => {
      const count = allContacts.filter(c => c.grupo === group && (c.statusEnvio === 'Não enviado' || c.statusEnvio === '')).length;
      console.log(`   ${index + 1}. ${group} (${count} contatos não enviados)`);
    });

    // Step 3: Ask which group
    const groupChoice = await question(rl, '\n🎯 Qual grupo você quer enviar? (número): ');
    const groupIndex = parseInt(groupChoice) - 1;

    if (groupIndex < 0 || groupIndex >= groups.length) {
      console.log('❌ Opção inválida');
      process.exit(1);
    }

    const selectedGroup = groups[groupIndex];
    console.log(`\n✅ Grupo selecionado: ${selectedGroup}`);

    // Step 4: Filter contacts
    const pendingContacts = filterContacts(allContacts, selectedGroup, 'Não enviado');

    if (pendingContacts.length === 0) {
      console.log(`\n✅ Todos contatos deste grupo já foram enviados! 🎉`);
      process.exit(0);
    }

    console.log(`\n📋 Contatos a enviar: ${pendingContacts.length}`);

    // Step 5: Ask delay mode
    console.log('\n⏱️  Modos de espaçamento:\n');
    Object.entries(DELAY_MODES).forEach(([key, mode]) => {
      console.log(`   ${key}. ${mode.name} — ${mode.description}`);
      console.log(`      Entre partes: ${mode.betweenParts.min / 1000}-${mode.betweenParts.max / 1000}s | Entre mensagens: ${mode.betweenMessages.min / 1000}-${mode.betweenMessages.max / 1000}s`);
    });

    const modeChoice = await question(rl, '\n🎯 Qual modo você quer usar? (1-4): ');
    const delayMode = parseInt(modeChoice);

    if (delayMode < 1 || delayMode > 4) {
      console.log('❌ Modo inválido');
      process.exit(1);
    }

    const selectedMode = DELAY_MODES[delayMode];
    console.log(`\n✅ Modo selecionado: ${selectedMode.name}`);

    // Step 6: Confirm
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log(`║  RESUMO DO ENVIO                                           ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Grupo: ${selectedGroup.padEnd(50)} ║`);
    console.log(`║  Contatos: ${String(pendingContacts.length).padEnd(47)} ║`);
    console.log(`║  Modo: ${selectedMode.name.padEnd(50)} ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const confirm = await question(rl, '🚀 Confirmar envio? (s/n): ');

    if (confirm.toLowerCase() !== 's') {
      console.log('❌ Envio cancelado pelo usuário');
      process.exit(0);
    }

    // Step 7: Connect to Evolution API
    console.log('\n🔌 Conectando à Evolution API...');
    const client = new EvolutionClient({
      baseUrl: process.env.EVOLUTION_API_URL,
      apiKey: process.env.EVOLUTION_API_KEY,
      instanceName: process.env.EVOLUTION_INSTANCE_SENDER
    });

    const state = await client.getConnectionState();
    const connectionState = state.instance?.state || state.state;

    if (connectionState !== 'open') {
      console.log(`❌ Evolution API não está conectada. Estado: ${connectionState}`);
      console.log('Por favor, conecte a instância antes de enviar mensagens.');
      process.exit(1);
    }

    console.log('✅ Evolution API conectada!\n');

    // Step 8: Send batch
    const results = await sendBatch(client, pendingContacts, delayMode);

    // Step 9: Summary
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  RESUMO DO ENVIO                                           ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Total: ${String(results.total).padEnd(50)} ║`);
    console.log(`║  Enviados: ${String(results.sent).padEnd(47)} ║`);
    console.log(`║  Falhas: ${String(results.failed).padEnd(49)} ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (results.errors.length > 0) {
      console.log('❌ Erros encontrados:');
      results.errors.forEach(err => {
        console.log(`   - ${err.contact} (${err.phone}): ${err.error}`);
      });
    }

    console.log('\n✅ Envio concluído!');
    console.log('\n💡 Próximo passo: Atualizar status no Google Sheets (Coluna H = "✅ Enviado")');

  } catch (error) {
    console.error(`\n❌ Erro fatal: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run
if (require.main === module) {
  main();
}

module.exports = { main };
