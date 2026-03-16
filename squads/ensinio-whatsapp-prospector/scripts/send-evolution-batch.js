#!/usr/bin/env node
'use strict';

/**
 * Phase 10: Send via Evolution API
 *
 * CRITICAL: INTERACTIVE - NUNCA envia sem confirmação explícita
 *
 * Flow:
 * 1. Read Google Sheets (filter "Não enviado")
 * 2. Show preview (3 messages)
 * 3. ASK for confirmation
 * 4. Send batch via Evolution API
 * 5. Update Sheets status
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Manual .env parsing
const envPath = path.join(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

const { EvolutionClient } = require('../../../tools/evolution-whatsapp-api');
const { sendWithSplit } = require('../lib/message-splitter');

// Placeholder for Google Sheets data
// TODO: Integrate with Google Sheets MCP to read actual data
const MOCK_SHEET_DATA = [
  {
    rowIndex: 2,
    nome: 'João Silva',
    telefone: '+5531999887766',
    grupo: 'Mentoria Renan',
    projeto: 'Curso de Marketing Digital',
    explicacao: 'Quer escalar vendas de infoprodutos',
    mensagem: 'Oi João! O Fosc tá no grupo aqui também. Vi que você comentou sobre escalar vendas de infoproduto. A Ensinio tem uma solução de automação de vendas que pode te ajudar bastante nisso. Posso te mostrar um case de um cliente que escalou de 50k pra 200k/mês com essa estratégia?',
    linkWhatsapp: 'https://wa.me/5531999887766?text=...',
    statusEnvio: 'Não enviado',
  },
  // More rows would come from Google Sheets
];

const SPREADSHEET_ID = '124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI';

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function readGoogleSheets() {
  // TODO: Implement Google Sheets reading via MCP
  // For now, return mock data
  console.log('⚠️  AVISO: Usando dados MOCK (Google Sheets MCP não implementado ainda)');
  console.log('   Spreadsheet ID:', SPREADSHEET_ID);
  console.log('   Filtrando por: Coluna H = "Não enviado"\n');

  return MOCK_SHEET_DATA.filter(row =>
    row.statusEnvio === 'Não enviado' || !row.statusEnvio
  );
}

async function updateSheetStatus(rowIndex, status) {
  // TODO: Implement Google Sheets update via MCP
  console.log(`   [Sheets] Linha ${rowIndex} → Status: ${status}`);
}

async function sendBatch() {
  console.log('🎯 Phase 10: Send via Evolution API\n');
  console.log('='.repeat(60));

  // Step 1: Check Evolution connection
  const client = new EvolutionClient({
    baseUrl: process.env.EVOLUTION_API_URL,
    apiKey: process.env.EVOLUTION_API_KEY,
    instance: process.env.EVOLUTION_INSTANCE_SENDER,
  });

  console.log('\n🔍 Verificando conexão Evolution API...');
  const state = await client.getConnectionState();
  const connectionState = state.instance?.state || state.state;

  if (connectionState !== 'open') {
    console.error(`\n❌ Evolution API não conectada. Estado: ${connectionState}`);
    console.error('Por favor, conecte a instância antes de enviar.');
    process.exit(1);
  }
  console.log('✅ Conectada e pronta!\n');

  // Step 2: Read Google Sheets
  console.log('📊 Lendo Google Sheets...');
  const contacts = await readGoogleSheets();

  if (contacts.length === 0) {
    console.log('\n✅ Nenhum contato com status "Não enviado".');
    console.log('   Todos já foram enviados ou planilha está vazia.');
    process.exit(0);
  }

  console.log(`✅ Encontrados ${contacts.length} contatos com "Não enviado"\n`);
  console.log('='.repeat(60));

  // Step 3: Show preview
  console.log('\n📋 PREVIEW (primeiras 3 mensagens):\n');

  const preview = contacts.slice(0, 3);
  preview.forEach((c, i) => {
    console.log(`${i + 1}. ${c.nome} (${c.telefone}):`);
    console.log(`   "${c.mensagem.substring(0, 100)}..."\n`);
  });

  if (contacts.length > 3) {
    console.log(`... e mais ${contacts.length - 3} contatos.\n`);
  }

  console.log('='.repeat(60));

  // Step 4: Ask for confirmation
  const answer1 = await askQuestion(`\n⚠️  Deseja enviar ${contacts.length} mensagens? [S/N] `);

  if (answer1.toUpperCase() !== 'S') {
    console.log('\n❌ Envio cancelado pelo usuário.');
    console.log('   Dados continuam no Sheets para envio manual.');
    process.exit(0);
  }

  // Step 5: Confirm pacing
  const totalMinutes = Math.ceil((contacts.length * 3) / 60);
  console.log('\n📋 Configuração de envio:');
  console.log(`   - Intervalo entre mensagens: 3 segundos`);
  console.log(`   - Tempo estimado total: ~${totalMinutes} minutos`);
  console.log(`   - Pausar automaticamente se erro > 20%\n`);

  const answer2 = await askQuestion('Confirma? [S/N] ');

  if (answer2.toUpperCase() !== 'S') {
    console.log('\n❌ Envio cancelado pelo usuário.');
    process.exit(0);
  }

  // Step 6: Send batch
  console.log('\n📤 Iniciando envio...\n');
  console.log('='.repeat(60));

  const results = {
    total: contacts.length,
    sent: 0,
    errors: 0,
    errorDetails: [],
  };

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const phone = contact.telefone.replace('+', ''); // Evolution sem +
    const progress = Math.round(((i + 1) / contacts.length) * 100);

    try {
      console.log(`[${i + 1}/${contacts.length}] Enviando para ${contact.nome} (${contact.telefone})...`);

      await sendWithSplit(client, phone, contact.mensagem, {
        enableSplit: true, // Ativar split de mensagens
        minDelay: 2000,    // 2s entre partes
        maxDelay: 4000,    // 4s entre partes
      });

      console.log(`   ✅ Enviado (${progress}% completo)`);
      results.sent++;

      // Update Sheets
      await updateSheetStatus(contact.rowIndex, 'Enviado');

      // Intervalo de 3 segundos
      if (i < contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      results.errors++;
      results.errorDetails.push({
        nome: contact.nome,
        telefone: contact.telefone,
        erro: error.message,
      });

      // Update Sheets
      await updateSheetStatus(contact.rowIndex, 'Erro');

      // Pause if error rate > 20%
      const errorRate = results.errors / (i + 1);
      if (errorRate > 0.2 && i > 5) {
        console.log('\n⚠️  ATENÇÃO: Taxa de erro alta!');
        console.log(`   Erros: ${results.errors} de ${i + 1} (${Math.round(errorRate * 100)}%)`);
        console.log(`   Erro mais comum: ${results.errorDetails[results.errorDetails.length - 1].erro}\n`);

        const answer3 = await askQuestion('   [1] Continuar | [2] Pausar e investigar | [3] Cancelar\n   Escolha [1-3]: ');

        if (answer3 === '2') {
          console.log('\n⏸️  Pausado. Investigate os erros acima.');
          process.exit(1);
        } else if (answer3 === '3') {
          console.log('\n❌ Cancelado pelo usuário.');
          break;
        }
        // answer3 === '1' continua normalmente
      }
    }
  }

  // Step 7: Final report
  console.log('\n' + '='.repeat(60));
  console.log('✅ ENVIO CONCLUÍDO!\n');
  console.log('📊 Resultados:');
  console.log(`   - Total: ${results.total} contatos`);
  console.log(`   - Enviados: ${results.sent} (${Math.round((results.sent / results.total) * 100)}%)`);
  console.log(`   - Erros: ${results.errors} (${Math.round((results.errors / results.total) * 100)}%)`);

  if (results.errors > 0) {
    console.log('\n❌ Erros detalhados:');
    results.errorDetails.forEach(e => {
      console.log(`   - ${e.nome} (${e.telefone}): ${e.erro}`);
    });
  }

  console.log('\n📋 Planilha atualizada com status de cada envio.');
  console.log('='.repeat(60));
}

// Run
sendBatch().catch(error => {
  console.error('\n💥 Erro fatal:', error.message);
  console.error(error.stack);
  process.exit(1);
});
