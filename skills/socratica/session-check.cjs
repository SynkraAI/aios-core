#!/usr/bin/env node

/**
 * Socrática Session Check — SessionStart hook
 * =============================================
 * Checks if a pending-reflection.json flag exists.
 * If yes → outputs instruction for Claude to run /socratica.
 * Runs in SessionStart, timeout 3s, fail-silent.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const FLAG_PATH = path.join(PROJECT_ROOT, 'skills', 'socratica', 'pending-reflection.json');

try {
  if (!fs.existsSync(FLAG_PATH)) {
    // No pending reflection — silent exit
    process.exit(0);
  }

  const flag = JSON.parse(fs.readFileSync(FLAG_PATH, 'utf8'));
  const age = Date.now() - new Date(flag.created).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24h

  // Expire old flags
  if (age > maxAge) {
    fs.unlinkSync(FLAG_PATH);
    process.exit(0);
  }

  // Output instruction for Claude
  console.log(`[SOCRATICA] Reflexão pendente da sessão anterior (${flag.date}).`);
  console.log(`Motivo: ${flag.reason} (${flag.signal_count} sinais de fricção detectados).`);
  console.log('AÇÃO REQUERIDA: Execute /socratica antes de iniciar trabalho novo.');
  console.log('Isso garante que erros da sessão anterior virem regras preventivas.');

} catch (err) {
  // Fail-silent — never block session start
  process.exit(0);
}
