#!/usr/bin/env node
'use strict';

/**
 * Background Send Script — Envio via Evolution API com processamento no servidor
 *
 * Diferença do send-interactive.js:
 * - Este script PREPARA e ENVIA via API
 * - Evolution processa no servidor (não precisa terminal aberto)
 * - Pode fechar Mac depois de iniciar
 * - Monitora via dashboard: http://178.156.242.82:8080/manager/
 *
 * Workflow:
 * 1. Ler TSV
 * 2. Detectar grupos
 * 3. Perguntar grupo + modo
 * 4. Preparar lista de mensagens com delays
 * 5. Enviar via Evolution API (endpoint /message/sendText com delays)
 * 6. Retornar ID para monitoramento
 *
 * IMPORTANTE: Evolution API v2.3.7 tem bug no /sendList
 * Solução: Enviar via /sendText individual com delays configurados
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');
const http = require('http');

// Manual .env parsing
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

const { splitMessageIntoParts } = require('../lib/message-splitter');

// Delay modes
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

// Helper: readline question
function question(rl, query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Helper: random delay
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: HTTP request promisified
function httpRequest(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: json });
        } catch {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Read TSV
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

// Detect groups
function detectGroups(contacts) {
  const groups = [...new Set(contacts.map(c => c.grupo))].filter(g => g);
  return groups.sort();
}

// Filter contacts
function filterContacts(contacts, groupName, statusFilter = 'Não enviado') {
  return contacts.filter(c =>
    c.grupo === groupName &&
    (c.statusEnvio === statusFilter || c.statusEnvio === '')
  );
}

// Send single message via Evolution API
async function sendMessage(apiUrl, apiKey, instanceName, phone, text, delay = 1000) {
  const url = `${apiUrl}/message/sendText/${instanceName}`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey
    }
  };

  const body = {
    number: phone,
    text: text,
    delay: delay
  };

  const result = await httpRequest(url, options, body);

  if (result.statusCode !== 201 && result.statusCode !== 200) {
    throw new Error(`Evolution API error: ${result.statusCode} - ${JSON.stringify(result.body)}`);
  }

  return result.body;
}

// Send batch with delays (send all requests immediately, Evolution API processes with delays)
async function sendBatchBackground(apiUrl, apiKey, instanceName, contacts, delayMode) {
  const mode = DELAY_MODES[delayMode];
  console.log(`\n🚀 Enviando em background para Evolution API (Modo ${delayMode}: ${mode.name})`);
  console.log(`   Entre partes: ${mode.betweenParts.min / 1000}-${mode.betweenParts.max / 1000}s`);
  console.log(`   Entre mensagens: ${mode.betweenMessages.min / 1000}-${mode.betweenMessages.max / 1000}s\n`);

  const results = {
    total: contacts.length,
    sent: 0,
    failed: 0,
    errors: []
  };

  let cumulativeDelay = 0; // Track total delay for ETA calculation

  // Send all messages immediately (non-blocking)
  // Evolution API will queue and process them with delays
  const promises = [];

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    try {
      console.log(`[${i + 1}/${contacts.length}] 📤 Enviando para ${contact.nome} (${contact.telefone})...`);

      // Normalize phone
      let phone = contact.telefone.replace(/\D/g, '');
      if (!phone.startsWith('55')) phone = '55' + phone;

      // Split message into parts
      const parts = splitMessageIntoParts(contact.mensagem);

      // Send each part (Evolution API will process with delays)
      for (let j = 0; j < parts.length; j++) {
        const partDelay = randomDelay(mode.betweenParts.min, mode.betweenParts.max);
        cumulativeDelay += partDelay;

        // Send immediately (Evolution API queues it)
        const promise = sendMessage(apiUrl, apiKey, instanceName, phone, parts[j], partDelay)
          .then(() => {
            console.log(`   ✅ [${j + 1}/${parts.length}] Enfileirado: "${parts[j].substring(0, 40)}..."`);
          })
          .catch(error => {
            console.error(`   ❌ Erro parte ${j + 1}: ${error.message}`);
            results.errors.push({
              contact: contact.nome,
              phone: contact.telefone,
              part: j + 1,
              error: error.message
            });
          });

        promises.push(promise);
      }

      // Add delay between messages
      if (i < contacts.length - 1) {
        const msgDelay = randomDelay(mode.betweenMessages.min, mode.betweenMessages.max);
        cumulativeDelay += msgDelay;
      }

      results.sent++;

    } catch (error) {
      console.error(`   ❌ Erro ao enviar ${contact.nome}: ${error.message}`);
      results.failed++;
      results.errors.push({
        contact: contact.nome,
        phone: contact.telefone,
        error: error.message
      });
    }
  }

  // Wait for all requests to be sent (not processed)
  console.log(`\n⏳ Aguardando confirmação de todos os envios...`);
  await Promise.allSettled(promises);

  // Convert cumulative delay to human-readable time
  const totalMinutes = Math.ceil(cumulativeDelay / 60000);

  console.log(`\n✅ Todas mensagens enviadas para Evolution API!`);
  console.log(`   Total enfileirado: ${results.sent}`);
  console.log(`   Tempo estimado de processamento: ~${totalMinutes} minutos`);
  console.log(`\n💡 IMPORTANTE:`);
  console.log(`   - Evolution API está processando as mensagens com delays configurados`);
  console.log(`   - Você pode FECHAR este terminal agora`);
  console.log(`   - Monitore progresso no dashboard: ${apiUrl}/manager/`);

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
    console.log('║  Ensinio Prospector — Envio em Background                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Step 1: Read TSV
    const tsvPath = path.join(__dirname, '../data/outputs/mentoria-50k/outreach-sheets-final.tsv');
    const allContacts = readTSV(tsvPath);

    // Step 2: Detect groups
    const groups = detectGroups(allContacts);

    if (groups.length === 0) {
      console.log('❌ Nenhum grupo encontrado no TSV');
      process.exit(1);
    }

    console.log(`\n📊 Grupos disponíveis (${groups.length}):\n`);
    groups.forEach((group, index) => {
      const count = allContacts.filter(c => c.grupo === group && (c.statusEnvio === 'Não enviado' || c.statusEnvio === '')).length;
      console.log(`   ${index + 1}. ${group} (${count} contatos não enviados)`);
    });

    // Step 3: Ask group
    const groupChoice = await question(rl, '\n🎯 Qual grupo você quer enviar? (número): ');
    const groupIndex = parseInt(groupChoice) - 1;

    if (groupIndex < 0 || groupIndex >= groups.length) {
      console.log('❌ Opção inválida');
      process.exit(1);
    }

    const selectedGroup = groups[groupIndex];
    console.log(`\n✅ Grupo selecionado: ${selectedGroup}`);

    // Step 4: Filter
    const pendingContacts = filterContacts(allContacts, selectedGroup);

    if (pendingContacts.length === 0) {
      console.log(`\n✅ Todos contatos já foram enviados!`);
      process.exit(0);
    }

    console.log(`\n📋 Contatos a enviar: ${pendingContacts.length}`);

    // Step 5: Ask mode
    console.log('\n⏱️  Modos de espaçamento:\n');
    Object.entries(DELAY_MODES).forEach(([key, mode]) => {
      console.log(`   ${key}. ${mode.name} — ${mode.description}`);
      console.log(`      Entre partes: ${mode.betweenParts.min / 1000}-${mode.betweenParts.max / 1000}s | Entre mensagens: ${mode.betweenMessages.min / 1000}-${mode.betweenMessages.max / 1000}s`);
    });

    const modeChoice = await question(rl, '\n🎯 Qual modo? (1-4): ');
    const delayMode = parseInt(modeChoice);

    if (delayMode < 1 || delayMode > 4) {
      console.log('❌ Modo inválido');
      process.exit(1);
    }

    const selectedMode = DELAY_MODES[delayMode];
    console.log(`\n✅ Modo selecionado: ${selectedMode.name}`);

    // Step 6: Confirm
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log(`║  RESUMO DO ENVIO EM BACKGROUND                             ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Grupo: ${selectedGroup.padEnd(50)} ║`);
    console.log(`║  Contatos: ${String(pendingContacts.length).padEnd(47)} ║`);
    console.log(`║  Modo: ${selectedMode.name.padEnd(50)} ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const confirm = await question(rl, '🚀 Confirmar envio? (s/n): ');

    if (confirm.toLowerCase() !== 's') {
      console.log('❌ Envio cancelado');
      process.exit(0);
    }

    // Step 7: Send via Evolution API
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_SENDER;

    const results = await sendBatchBackground(apiUrl, apiKey, instanceName, pendingContacts, delayMode);

    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ENVIO INICIADO COM SUCESSO                                ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Total agendado: ${String(results.scheduled).padEnd(42)} ║`);
    console.log(`║  Falhas: ${String(results.failed).padEnd(49)} ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('✅ Você pode FECHAR este terminal agora!');
    console.log(`📊 Monitore no dashboard: ${apiUrl}/manager/\n`);

  } catch (error) {
    console.error(`\n❌ Erro: ${error.message}`);
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
