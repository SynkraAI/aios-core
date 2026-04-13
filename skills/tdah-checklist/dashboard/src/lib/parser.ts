import { type Project, type RadarData, type Urgency, type Checkbox } from './types';

const OBSIDIAN_PATH = '/Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc/+/✅📍 Radar de projetos.md';

const SECTION_MAP: Record<string, Urgency> = {
  '# 🔴 Urgente': 'urgente',
  '# 🟡 Atenção': 'atencao',
  '# 🟢 Tranquilo': 'tranquilo',
  '# 🗑️ Avaliar': 'avaliar',
  '# ✅ Concluídos': 'concluidos',
};

function parseFrontmatter(content: string): RadarData['frontmatter'] {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return { dataCriacao: '', ultimaAtualizacao: '', totalProjetos: 0, totalConcluidos: 0 };
  }
  const fm = match[1];
  const get = (key: string): string => {
    const m = fm.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };
  return {
    dataCriacao: get('data_criacao'),
    ultimaAtualizacao: get('última_atualização'),
    totalProjetos: parseInt(get('total_projetos')) || 0,
    totalConcluidos: parseInt(get('total_concluídos')) || 0,
  };
}

function parseGlobalAnalysis(content: string): string {
  const match = content.match(/# 🧠 Análise Global \(IA\)\n\n([\s\S]*?)(?=\n---\n)/);
  return match ? match[1].trim() : '';
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseProject(block: string, urgency: Urgency): Project {
  const lines = block.split('\n');
  const nameMatch = lines[0]?.match(/^## (.+)/);
  const displayName = nameMatch ? nameMatch[1].trim() : 'unknown';
  const id = slugify(displayName);

  const getField = (prefix: string): string | null => {
    const line = lines.find((l) => l.includes(`**${prefix}**`));
    if (!line) return null;
    const val = line.replace(new RegExp(`.*\\*\\*${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\s*`), '').trim();
    return val === '—' ? null : val;
  };

  const checkboxes: Checkbox[] = [];
  const extraLines: string[] = [];

  for (const line of lines.slice(1)) {
    const cbMatch = line.match(/^- \[([ x])\] (.+)/);
    if (cbMatch) {
      checkboxes.push({ checked: cbMatch[1] === 'x', text: cbMatch[2] });
    } else if (
      !line.startsWith('- **') &&
      line.trim() !== '' &&
      !line.startsWith('## ')
    ) {
      extraLines.push(line);
    }
  }

  return {
    id,
    name: id,
    displayName,
    urgency,
    status: getField('Status:') ?? '',
    path: getField('Caminho:')?.replace(/`/g, '') ?? null,
    lastCommit: getField('Último commit:')?.replace(/`/g, '') ?? null,
    branch: getField('Branch:')?.replace(/`/g, '') ?? null,
    checkboxes,
    analysis: getField('📋 Análise:') ?? '',
    delegation: getField('💡 Delegação:') ?? '—',
    completedAt: getField('Concluído em:') ?? undefined,
    delivery: getField('Entrega:') ?? undefined,
    extraContent: extraLines.length > 0 ? extraLines.join('\n') : undefined,
  };
}

function splitIntoSections(content: string): Record<Urgency, string> {
  const result: Record<string, string> = {};
  const sectionHeaders = Object.keys(SECTION_MAP);

  for (const header of sectionHeaders) {
    const urgency = SECTION_MAP[header];
    const startIdx = content.indexOf(header);
    if (startIdx === -1) {
      result[urgency] = '';
      continue;
    }

    const afterHeader = startIdx + header.length;
    let endIdx = content.length;

    for (const otherHeader of sectionHeaders) {
      if (otherHeader === header) continue;
      const otherIdx = content.indexOf(otherHeader, afterHeader);
      if (otherIdx !== -1 && otherIdx < endIdx) {
        endIdx = otherIdx;
      }
    }

    result[urgency] = content.slice(afterHeader, endIdx);
  }

  return result as Record<Urgency, string>;
}

function parseSection(sectionContent: string, urgency: Urgency): Project[] {
  const projects: Project[] = [];
  const blocks = sectionContent.split(/\n(?=## )/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed.startsWith('## ')) continue;
    projects.push(parseProject(trimmed, urgency));
  }

  return projects;
}

export function parseRadar(content: string): RadarData {
  const frontmatter = parseFrontmatter(content);
  const globalAnalysis = parseGlobalAnalysis(content);
  const sectionContents = splitIntoSections(content);

  const sections: Record<Urgency, Project[]> = {
    urgente: parseSection(sectionContents.urgente ?? '', 'urgente'),
    atencao: parseSection(sectionContents.atencao ?? '', 'atencao'),
    tranquilo: parseSection(sectionContents.tranquilo ?? '', 'tranquilo'),
    avaliar: parseSection(sectionContents.avaliar ?? '', 'avaliar'),
    concluidos: parseSection(sectionContents.concluidos ?? '', 'concluidos'),
  };

  return { frontmatter, globalAnalysis, sections };
}

export { OBSIDIAN_PATH };
