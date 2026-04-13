export type Urgency = 'urgente' | 'atencao' | 'tranquilo' | 'avaliar' | 'concluidos';

export const URGENCY_CONFIG: Record<Urgency, { emoji: string; label: string; color: string }> = {
  urgente: { emoji: '🔴', label: 'Urgente', color: 'column-red' },
  atencao: { emoji: '🟡', label: 'Atenção', color: 'column-yellow' },
  tranquilo: { emoji: '🟢', label: 'Tranquilo', color: 'column-green' },
  avaliar: { emoji: '🗑️', label: 'Avaliar', color: 'column-trash' },
  concluidos: { emoji: '✅', label: 'Concluídos', color: 'column-done' },
};

export const URGENCY_ORDER: Urgency[] = ['urgente', 'atencao', 'tranquilo', 'avaliar', 'concluidos'];

export interface Checkbox {
  text: string;
  checked: boolean;
}

export interface Project {
  id: string;
  name: string;
  displayName: string;
  urgency: Urgency;
  status: string;
  path: string | null;
  lastCommit: string | null;
  branch: string | null;
  checkboxes: Checkbox[];
  analysis: string;
  delegation: string;
  completedAt?: string;
  delivery?: string;
  extraContent?: string;
}

export interface RadarData {
  frontmatter: {
    dataCriacao: string;
    ultimaAtualizacao: string;
    totalProjetos: number;
    totalConcluidos: number;
  };
  globalAnalysis: string;
  sections: Record<Urgency, Project[]>;
}
