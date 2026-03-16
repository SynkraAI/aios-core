#!/usr/bin/env node
'use strict';

const { splitMessageIntoParts } = require('../lib/message-splitter');

// Mensagem real do Mentoria Renan (exemplo do TSV)
const testMessage = `Oi Eduardo! Tudo bem? Aqui é o Antonio, sou do time da Ensinio.

O Fosc, nosso sócio fundador, tá naquele grupo do Renan e viu que você tá mandando muito bem com o Amazon Code Pro. Mais de 40k/mês é coisa de quem sabe o que tá fazendo, parabéns!

Olha, a Ensinio tem uma solução de automação de vendas que pode te ajudar bastante nisso. Posso te mostrar um case de um cliente que escalou de 50k pra 200k/mês com essa estratégia?`;

console.log('🧪 Testando Message Splitter\n');
console.log('='.repeat(60));
console.log('\n📝 Mensagem Original:\n');
console.log(testMessage);
console.log('\n' + '='.repeat(60));

const parts = splitMessageIntoParts(testMessage);

console.log(`\n✂️  Dividido em ${parts.length} partes:\n`);

parts.forEach((part, i) => {
  console.log(`[${i + 1}/${parts.length}] (${part.length} chars):`);
  console.log(`"${part}"`);
  console.log('');
});

console.log('='.repeat(60));
console.log('\n✅ Resultado:');
console.log(`   - Total partes: ${parts.length}`);
console.log(`   - Comprimentos: ${parts.map(p => p.length).join(', ')} chars`);
console.log(`   - Parecer humano? ${parts.length >= 2 && parts.length <= 5 ? 'SIM ✅' : 'REVIEW ⚠️'}`);
console.log('');
