'use strict';

/**
 * Message Splitter — Divide mensagens em partes naturais (parágrafos curtos)
 * para parecer humano, não IA.
 *
 * Strategy:
 * 1. Split por dupla quebra de linha (\n\n) — parágrafos naturais
 * 2. Se parágrafo > 150 chars, split adicional por frases (. )
 * 3. Remover partes vazias
 * 4. Cada parte ideal: 30-150 caracteres
 */

const MIN_PART_LENGTH = 10; // Partes muito curtas são estranhas
const MAX_PART_LENGTH = 150; // Partes muito longas parecem IA

/**
 * Split message into natural parts (paragraphs/sentences).
 *
 * @param {string} message - Full message text
 * @returns {string[]} - Array of message parts
 */
function splitMessageIntoParts(message) {
  if (!message || typeof message !== 'string') {
    return [];
  }

  // Step 1: Split by double newline (paragraphs)
  let parts = message
    .split(/\n\n+/) // Um ou mais \n\n
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Step 2: Se algum parágrafo > MAX_PART_LENGTH, split por frases
  parts = parts.flatMap(part => {
    if (part.length <= MAX_PART_LENGTH) {
      return part;
    }

    // Split por ". " (fim de frase)
    const sentences = part
      .split(/\.\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => (s.endsWith('.') ? s : `${s}.`)); // Re-adicionar ponto se removido

    // Se última "frase" não termina com ponto, é porque era final do parágrafo
    if (sentences.length > 0 && !part.endsWith('.')) {
      sentences[sentences.length - 1] = sentences[sentences.length - 1].replace(/\.$/, '');
    }

    return sentences;
  });

  // Step 3: Filtrar partes muito curtas (< MIN_PART_LENGTH)
  parts = parts.filter(p => p.length >= MIN_PART_LENGTH);

  return parts;
}

/**
 * Send message with split (multiple parts with delays).
 *
 * @param {object} client - EvolutionClient instance
 * @param {string} phone - Recipient phone (E.164 without +)
 * @param {string} message - Full message text
 * @param {object} [opts] - Options
 * @param {boolean} [opts.enableSplit=true] - Enable/disable splitting
 * @param {number} [opts.minDelay=2000] - Min delay between parts (ms)
 * @param {number} [opts.maxDelay=4000] - Max delay between parts (ms)
 * @param {number} [opts.minTypingDelay=1000] - Min typing simulation (ms)
 * @param {number} [opts.maxTypingDelay=3000] - Max typing simulation (ms)
 * @returns {Promise<void>}
 */
async function sendWithSplit(client, phone, message, opts = {}) {
  const {
    enableSplit = true,
    minDelay = 2000,
    maxDelay = 4000,
    minTypingDelay = 1000,
    maxTypingDelay = 3000,
  } = opts;

  // Se split desativado, enviar como uma única mensagem
  if (!enableSplit) {
    const typingDelay = randomBetween(minTypingDelay, maxTypingDelay);
    return client.sendText(phone, message, { delay: typingDelay });
  }

  // Split message
  const parts = splitMessageIntoParts(message);

  if (parts.length === 0) {
    throw new Error('Message splitting resulted in zero parts');
  }

  // Enviar cada parte sequencialmente
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const typingDelay = randomBetween(minTypingDelay, maxTypingDelay);

    console.log(`   [${i + 1}/${parts.length}] Enviando parte (${part.length} chars)...`);

    await client.sendText(phone, part, { delay: typingDelay });

    // Delay entre partes (exceto após última)
    if (i < parts.length - 1) {
      const pauseDelay = randomBetween(minDelay, maxDelay);
      console.log(`   ⏳ Aguardando ${Math.round(pauseDelay / 1000)}s...`);
      await sleep(pauseDelay);
    }
  }
}

/**
 * Sleep for specified milliseconds.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random integer between min and max (inclusive).
 */
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  splitMessageIntoParts,
  sendWithSplit,
  sleep,
};
