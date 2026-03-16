#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Manual .env parsing (no dotenv dependency)
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

async function checkConnection() {
  try {
    const client = new EvolutionClient({
      baseUrl: process.env.EVOLUTION_API_URL,
      apiKey: process.env.EVOLUTION_API_KEY,
      instance: process.env.EVOLUTION_INSTANCE_SENDER,
    });

    console.log('🔍 Verificando conexão Evolution API...\n');

    const state = await client.getConnectionState();

    console.log('Resultado:');
    console.log(JSON.stringify(state, null, 2));

    const connectionState = state.instance?.state || state.state;

    if (connectionState === 'open') {
      console.log('\n✅ Evolution API conectada e pronta para envio!');
      process.exit(0);
    } else {
      console.log(`\n❌ Evolution API não está conectada. Estado: ${connectionState}`);
      console.log('Por favor, conecte a instância antes de enviar mensagens.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar conexão:', error.message);
    process.exit(1);
  }
}

checkConnection();
