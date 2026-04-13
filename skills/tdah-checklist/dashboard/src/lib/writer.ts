import { type RadarData, type Project, type Urgency, URGENCY_ORDER } from './types';

const SECTION_HEADERS: Record<Urgency, string> = {
  urgente: '# 🔴 Urgente',
  atencao: '# 🟡 Atenção',
  tranquilo: '# 🟢 Tranquilo',
  avaliar: '# 🗑️ Avaliar (rascunho/deletar?)',
  concluidos: '# ✅ Concluídos',
};

function buildFrontmatter(data: RadarData): string {
  const now = new Date().toISOString().slice(0, 19);
  const totalActive = URGENCY_ORDER
    .filter((u) => u !== 'concluidos')
    .reduce((sum, u) => sum + data.sections[u].length, 0);
  const totalDone = data.sections.concluidos.length;

  return [
    '---',
    'tags:',
    '  - Checklist',
    '  - TDAH',
    '  - radar',
    `data_criacao: ${data.frontmatter.dataCriacao}`,
    `última_atualização: ${now}`,
    `total_projetos: ${totalActive}`,
    `total_concluídos: ${totalDone}`,
    '---',
  ].join('\n');
}

function buildGlobalAnalysis(data: RadarData): string {
  return `# 🧠 Análise Global (IA)\n\n${data.globalAnalysis}`;
}

function buildIndex(data: RadarData): string {
  const lines: string[] = ['# Índice', ''];

  for (const urgency of URGENCY_ORDER) {
    const config = {
      urgente: '🔴 Urgente',
      atencao: '🟡 Atenção',
      tranquilo: '🟢 Tranquilo',
      avaliar: '🗑️ Avaliar (rascunho/deletar?)',
      concluidos: '✅ Concluídos',
    };
    lines.push(config[urgency]);
    for (const p of data.sections[urgency]) {
      lines.push(`- [[✅📍 Radar de projetos#${p.displayName}|${p.displayName}]]`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

function buildProject(project: Project): string {
  const lines: string[] = [`## ${project.displayName}`];

  if (project.urgency === 'concluidos') {
    if (project.completedAt) lines.push(`- **Concluído em:** ${project.completedAt}`);
    if (project.delivery) lines.push(`- **Entrega:** ${project.delivery}`);
    for (const cb of project.checkboxes) {
      lines.push(`- [${cb.checked ? 'x' : ' '}] ${cb.text}`);
    }
    return lines.join('\n');
  }

  const emoji = { urgente: '🔴', atencao: '🟡', tranquilo: '🟢', avaliar: '🗑️', concluidos: '✅' };
  lines.push(`- **Urgência:** ${emoji[project.urgency]}`);
  lines.push(`- **Status:** ${project.status}`);

  if (project.path) {
    lines.push(`- **Caminho:** \`${project.path}\``);
  } else {
    lines.push('- **Caminho:** —');
  }

  if (project.lastCommit) {
    lines.push(`- **Último commit:** \`${project.lastCommit}\``);
  }
  if (project.branch) {
    lines.push(`- **Branch:** \`${project.branch}\``);
  }

  for (const cb of project.checkboxes) {
    lines.push(`- [${cb.checked ? 'x' : ' '}] ${cb.text}`);
  }

  lines.push(`- **📋 Análise:** ${project.analysis || '—'}`);
  lines.push(`- **💡 Delegação:** ${project.delegation || '—'}`);

  return lines.join('\n');
}

function buildSection(urgency: Urgency, projects: Project[]): string {
  const header = SECTION_HEADERS[urgency];
  if (projects.length === 0) return header;

  const projectBlocks = projects.map(buildProject).join('\n\n');
  return `${header}\n\n${projectBlocks}`;
}

export function writeRadar(data: RadarData): string {
  const parts: string[] = [
    buildFrontmatter(data),
    '',
    buildGlobalAnalysis(data),
    '',
    '---',
    '',
    buildIndex(data),
    '',
    '---',
    '',
  ];

  for (let i = 0; i < URGENCY_ORDER.length; i++) {
    const urgency = URGENCY_ORDER[i];
    parts.push(buildSection(urgency, data.sections[urgency]));
    if (i < URGENCY_ORDER.length - 1) {
      parts.push('', '---', '');
    }
  }

  return parts.join('\n') + '\n';
}
