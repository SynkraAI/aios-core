#!/usr/bin/env node
'use strict';

/**
 * Fix missing pt-BR accents in outreach-messages-v2.md
 * Only fixes text inside **Message:** sections, leaves WhatsApp Links untouched.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'outputs', 'mentoria-50k', 'outreach-messages-v2.md');

// Word-boundary accent replacements (order matters for some)
const REPLACEMENTS = [
  // Verbs and common words - use word boundaries
  [/\bvoce\b/g, 'você'],
  [/\bvoces\b/g, 'vocês'],
  [/\btambem\b/g, 'também'],
  [/\bcondicao\b/g, 'condição'],
  [/\bcondicoes\b/g, 'condições'],
  [/\bnao\b/g, 'não'],
  [/\bAbraco\b/g, 'Abraço'],
  [/\babraco\b/g, 'abraço'],
  [/\bja\b/g, 'já'],
  [/\bate\b/g, 'até'],
  [/\balem\b/g, 'além'],
  [/\bintegracao\b/g, 'integração'],
  [/\bintegracoes\b/g, 'integrações'],
  [/\breclamacao\b/g, 'reclamação'],
  [/\boperacao\b/g, 'operação'],
  [/\bsolucao\b/g, 'solução'],
  [/\bsituacao\b/g, 'situação'],
  [/\bdiferenca\b/g, 'diferença'],
  [/\bpressao\b/g, 'pressão'],
  [/\bconteudo\b/g, 'conteúdo'],
  [/\bespecifico\b/g, 'específico'],
  [/\bespecifica\b/g, 'específica'],
  [/\bpratica\b/g, 'prática'],
  [/\brapido\b/g, 'rápido'],
  [/\brapida\b/g, 'rápida'],
  [/\bproprio\b/g, 'próprio'],
  [/\bpropria\b/g, 'própria'],
  [/\bproprios\b/g, 'próprios'],
  [/\bproprias\b/g, 'próprias'],
  [/\bcomecou\b/g, 'começou'],
  [/\bcomecaram\b/g, 'começaram'],
  [/\baudiencia\b/g, 'audiência'],
  [/\bso\b/g, 'só'],
  [/\bentao\b/g, 'então'],
  [/\bai\b/g, 'aí'],
  [/\bserao\b/g, 'serão'],
  [/\bnumero\b/g, 'número'],
  [/\bnumeros\b/g, 'números'],
  [/\bunico\b/g, 'único'],
  [/\bunica\b/g, 'única'],
  [/\bpossivel\b/g, 'possível'],
  [/\bnecessario\b/g, 'necessário'],
  [/\bdisponivel\b/g, 'disponível'],
  [/\bcodigo\b/g, 'código'],
  [/\bexperiencia\b/g, 'experiência'],
  [/\bfuncao\b/g, 'função'],
  [/\bacao\b/g, 'ação'],
  [/\botimo\b/g, 'ótimo'],
  [/\bcomissao\b/g, 'comissão'],
  [/\bindicacao\b/g, 'indicação'],
  [/\breuniao\b/g, 'reunião'],
  [/\breunioes\b/g, 'reuniões'],
  [/\brelacao\b/g, 'relação'],
  [/\bmigracao\b/g, 'migração'],
  [/\bautomacao\b/g, 'automação'],
  [/\bautomacoes\b/g, 'automações'],
  [/\bgestao\b/g, 'gestão'],
  [/\bcriacao\b/g, 'criação'],
  [/\bconversao\b/g, 'conversão'],
  [/\beducacao\b/g, 'educação'],
  [/\bnutricao\b/g, 'nutrição'],
  [/\binformacao\b/g, 'informação'],
  [/\bparceria\b/g, 'parceria'],  // already correct but just in case
  [/\bdiferenciada\b/g, 'diferenciada'],  // already correct
  [/\bgratuito\b/g, 'gratuito'],  // already correct
  [/\barea\b/g, 'área'],
  [/\bvarios\b/g, 'vários'],
  [/\bvarias\b/g, 'várias'],
  [/\bfacil\b/g, 'fácil'],
  [/\butil\b/g, 'útil'],
  [/\bmes\b/g, 'mês'],
  [/\bmeses\b/g, 'meses'],  // already correct
  [/\bsaude\b/g, 'saúde'],
  [/\bnegocio\b/g, 'negócio'],
  [/\bnegocios\b/g, 'negócios'],
  [/\bservico\b/g, 'serviço'],
  [/\bservicos\b/g, 'serviços'],
  [/\bperiodo\b/g, 'período'],
  [/\bhorario\b/g, 'horário'],
  [/\bcalculo\b/g, 'cálculo'],
  [/\bpagina\b/g, 'página'],
  [/\bpaginas\b/g, 'páginas'],
  [/\bduvida\b/g, 'dúvida'],
  [/\bduvidas\b/g, 'dúvidas'],
  [/\btecnico\b/g, 'técnico'],
  [/\btecnica\b/g, 'técnica'],
  [/\bfisico\b/g, 'físico'],
  [/\bjuridico\b/g, 'jurídico'],
  [/\bjuridica\b/g, 'jurídica'],
  [/\bmedico\b/g, 'médico'],
  [/\bmedica\b/g, 'médica'],
  [/\bpsicologa\b/g, 'psicóloga'],
  [/\bpsicologo\b/g, 'psicólogo'],
  [/\badvocacia\b/g, 'advocacia'],  // already correct
  [/\bplataforma\b/g, 'plataforma'],  // already correct
  [/\bne\b/g, 'né'],
  [/\bla\b(?!\s+a\b)/g, 'lá'],  // "la" as "there", not "la" before vowel
  [/\bca\b/g, 'cá'],
  [/\bpai\b/g, 'pai'],  // already correct
  [/\bpais\b/g, 'país'],
  [/\bfora\b/g, 'fora'],  // already correct
  [/\bvoce\b/gi, 'você'],

  // "e" as verb "é" - context-specific patterns
  [/\b([Ee]) brabo\b/g, '$1 brabo'],  // keep "é brabo" - need to handle é
  [/ e um dos/g, ' é um dos'],
  [/ e a /g, ' é a '],
  [/ e o /g, ' é o '],
  [/ e so /g, ' é só'],
  [/ e justamente/g, ' é justamente'],
  [/ e muito/g, ' é muito'],
  [/ e bem/g, ' é bem'],
  [/ e mais/g, ' é mais'],
  [/ e super/g, ' é super'],
  [/ e brabo/g, ' é brabo'],
  [/ e coisa/g, ' é coisa'],
  [/ e normal/g, ' é normal'],
  [/ e simples/g, ' é simples'],
  [/ e comum/g, ' é comum'],
  [/^Aqui e o/gm, 'Aqui é o'],
  [/que e um/g, 'que é um'],
  [/que e o/g, 'que é o'],
  [/que e a/g, 'que é a'],
  [/ ne\?/g, ' né?'],
  [/ ne /g, ' né '],

  // "ta" as "está"
  [/ ta no /g, ' tá no '],
  [/ ta na /g, ' tá na '],
  [/ ta tendo/g, ' tá tendo'],
  [/ ta montando/g, ' tá montando'],
  [/ ta faturando/g, ' tá faturando'],
  [/ ta comparando/g, ' tá comparando'],
  [/ ta tocando/g, ' tá tocando'],
  [/ ta estruturando/g, ' tá estruturando'],
  [/ ta rodando/g, ' tá rodando'],
  [/ ta construindo/g, ' tá construindo'],
  [/ ta fazendo/g, ' tá fazendo'],
  [/ ta vendendo/g, ' tá vendendo'],
  [/ ta com /g, ' tá com '],
  [/ ta nessa/g, ' tá nessa'],
  [/ ta nesse/g, ' tá nesse'],
  [/ ta funcionando/g, ' tá funcionando'],
  [/ ta digitalizando/g, ' tá digitalizando'],
  [/ ta trabalhando/g, ' tá trabalhando'],
  [/ ta comecan/g, ' tá começan'],
  [/ ta usando/g, ' tá usando'],
  [/ ta achando/g, ' tá achando'],
  [/ ta olhando/g, ' tá olhando'],
  [/ ta procurando/g, ' tá procurando'],
  [/ ta buscando/g, ' tá buscando'],
  [/ ta escalando/g, ' tá escalando'],
  [/ ta crescendo/g, ' tá crescendo'],
  [/ ta migrando/g, ' tá migrando'],
  [/ ta organiz/g, ' tá organiz'],
  [/ ta vivendo/g, ' tá vivendo'],
  [/ ta decidindo/g, ' tá decidindo'],
  [/ ta passando/g, ' tá passando'],
  [/ ta mandando/g, ' tá mandando'],
  [/ ta pensando/g, ' tá pensando'],
  [/ ta querendo/g, ' tá querendo'],
  [/ ta precisando/g, ' tá precisando'],
  [/ ta investindo/g, ' tá investindo'],
  [/ ta atendendo/g, ' tá atendendo'],
  [/ ta implem/g, ' tá implem'],
  [/ ta desenvolv/g, ' tá desenvolv'],
  [/ ta oferecendo/g, ' tá oferecendo'],
  [/ ta lidando/g, ' tá lidando'],
  [/ ta cobrando/g, ' tá cobrando'],
  [/ ta pagando/g, ' tá pagando'],
  [/ ta perdendo/g, ' tá perdendo'],
  [/ ta acompanhando/g, ' tá acompanhando'],
  [/ ta gerando/g, ' tá gerando'],
  [/ ta criando/g, ' tá criando'],
  [/ ta conectando/g, ' tá conectando'],

  // "pro" and "pra" are correct informally, keep as-is
  // "haha" stays as-is
];

function fixAccents(text) {
  let result = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function processFile() {
  const content = fs.readFileSync(FILE, 'utf8');
  const lines = content.split('\n');

  let inMessage = false;
  const inWhatsAppLink = false;
  let fixedCount = 0;
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section boundaries
    if (line.startsWith('**Message:**')) {
      inMessage = true;
      fixedLines.push(line);
      continue;
    }

    if (line.startsWith('**WhatsApp Link:**') || line === '---' || line.startsWith('**Approach:**') || line.startsWith('**Phone:**')) {
      if (inMessage) inMessage = false;
      fixedLines.push(line);
      continue;
    }

    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      inMessage = false;
      fixedLines.push(line);
      continue;
    }

    if (inMessage) {
      const fixed = fixAccents(line);
      if (fixed !== line) fixedCount++;
      fixedLines.push(fixed);
    } else {
      fixedLines.push(line);
    }
  }

  const output = fixedLines.join('\n');
  fs.writeFileSync(FILE, output, 'utf8');

  console.log(`Fixed ${fixedCount} lines with accent corrections`);
  console.log(`File saved: ${FILE}`);
}

processFile();
