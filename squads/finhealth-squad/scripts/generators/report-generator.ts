/**
 * Report Generator
 * FinHealth Squad - Cashflow & Supervisor Modules
 *
 * Generates financial reports and consolidated squad reports.
 */

export interface ReportPeriod {
  tipo: 'diario' | 'semanal' | 'mensal' | 'trimestral';
  inicio: Date;
  fim: Date;
}

export interface ReportData {
  receitas: RevenueItem[];
  despesas: ExpenseItem[];
  faturamento: BillingItem[];
  recebimentos: PaymentItem[];
}

export interface RevenueItem {
  data: Date;
  fonte: string;
  valor: number;
  categoria?: string;
}

export interface ExpenseItem {
  data: Date;
  fornecedor: string;
  valor: number;
  categoria: string;
}

export interface BillingItem {
  data: Date;
  tipo: string;
  quantidade: number;
  valor: number;
}

export interface PaymentItem {
  data: Date;
  operadora: string;
  valor: number;
  glosa: number;
}

export interface FinancialReport {
  titulo: string;
  periodo: string;
  dataGeracao: Date;
  metricasChave: KeyMetrics;
  secoes: ReportSection[];
  graficos?: ChartData[];
}

export interface KeyMetrics {
  receitaBruta: number;
  receitaLiquida: number;
  despesasTotais: number;
  resultadoOperacional: number;
  margemOperacional: number;
  faturamentoEmitido: number;
  taxaGlosa: number;
  diasMedioRecebimento: number;
  inadimplencia: number;
}

export interface ReportSection {
  titulo: string;
  conteudo: string;
  tabelas?: TableData[];
  metricas?: Record<string, number | string>;
}

export interface TableData {
  titulo: string;
  colunas: string[];
  linhas: (string | number)[][];
}

export interface ChartData {
  tipo: 'linha' | 'barra' | 'pizza';
  titulo: string;
  dados: any;
}

/**
 * Generate a complete financial report
 */
export async function generateFinancialReport(
  periodo: ReportPeriod,
  dados: ReportData,
  options?: {
    comparativo?: boolean;
    nivel?: 'executivo' | 'gerencial' | 'operacional';
  }
): Promise<FinancialReport> {
  const nivel = options?.nivel || 'gerencial';

  // Calculate key metrics
  const metricasChave = calculateKeyMetrics(dados);

  // Build sections based on level
  const secoes = buildReportSections(dados, nivel);

  // Generate charts if not executive level
  const graficos = nivel !== 'executivo' ? generateCharts(dados) : undefined;

  return {
    titulo: `Relatório Financeiro - ${formatPeriodo(periodo)}`,
    periodo: formatPeriodo(periodo),
    dataGeracao: new Date(),
    metricasChave,
    secoes,
    graficos,
  };
}

/**
 * Calculate key financial metrics
 */
function calculateKeyMetrics(dados: ReportData): KeyMetrics {
  const receitaBruta = dados.receitas.reduce((sum, r) => sum + r.valor, 0);
  const despesasTotais = dados.despesas.reduce((sum, d) => sum + d.valor, 0);
  const faturamentoEmitido = dados.faturamento.reduce((sum, f) => sum + f.valor, 0);
  const recebimentoTotal = dados.recebimentos.reduce((sum, p) => sum + p.valor, 0);
  const glosaTotal = dados.recebimentos.reduce((sum, p) => sum + p.glosa, 0);

  const receitaLiquida = receitaBruta - despesasTotais * 0.1; // Simplified
  const resultadoOperacional = receitaBruta - despesasTotais;
  const margemOperacional = receitaBruta > 0 ? (resultadoOperacional / receitaBruta) * 100 : 0;
  const taxaGlosa =
    recebimentoTotal + glosaTotal > 0
      ? (glosaTotal / (recebimentoTotal + glosaTotal)) * 100
      : 0;

  return {
    receitaBruta,
    receitaLiquida,
    despesasTotais,
    resultadoOperacional,
    margemOperacional,
    faturamentoEmitido,
    taxaGlosa,
    diasMedioRecebimento: 35, // TODO: Calculate from actual data
    inadimplencia: 5.2, // TODO: Calculate from actual data
  };
}

/**
 * Build report sections based on detail level
 */
function buildReportSections(
  dados: ReportData,
  nivel: 'executivo' | 'gerencial' | 'operacional'
): ReportSection[] {
  const secoes: ReportSection[] = [];

  // Executive summary (all levels)
  secoes.push({
    titulo: 'Sumário Executivo',
    conteudo: generateExecutiveSummary(dados),
  });

  if (nivel === 'executivo') {
    return secoes;
  }

  // Revenue section
  secoes.push({
    titulo: 'Receitas',
    conteudo: 'Análise detalhada das receitas do período.',
    tabelas: [generateRevenueTable(dados.receitas)],
  });

  // Expense section
  secoes.push({
    titulo: 'Despesas',
    conteudo: 'Análise detalhada das despesas do período.',
    tabelas: [generateExpenseTable(dados.despesas)],
  });

  if (nivel === 'operacional') {
    // Add detailed operational data
    secoes.push({
      titulo: 'Detalhamento Operacional',
      conteudo: 'Dados granulares para análise operacional.',
      // ... detailed tables
    });
  }

  return secoes;
}

/**
 * Generate executive summary text
 */
function generateExecutiveSummary(dados: ReportData): string {
  const metrics = calculateKeyMetrics(dados);

  return `
O período apresentou receita bruta de R$ ${metrics.receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })},
com despesas totais de R$ ${metrics.despesasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })},
resultando em margem operacional de ${metrics.margemOperacional.toFixed(1)}%.

A taxa de glosa foi de ${metrics.taxaGlosa.toFixed(1)}%, com dias médio de recebimento de ${metrics.diasMedioRecebimento} dias.
  `.trim();
}

/**
 * Generate revenue table
 */
function generateRevenueTable(receitas: RevenueItem[]): TableData {
  // Group by source
  const bySource = new Map<string, number>();
  for (const r of receitas) {
    bySource.set(r.fonte, (bySource.get(r.fonte) || 0) + r.valor);
  }

  const linhas: (string | number)[][] = [];
  for (const [fonte, valor] of bySource) {
    linhas.push([fonte, valor]);
  }

  return {
    titulo: 'Receitas por Fonte',
    colunas: ['Fonte', 'Valor (R$)'],
    linhas,
  };
}

/**
 * Generate expense table
 */
function generateExpenseTable(despesas: ExpenseItem[]): TableData {
  // Group by category
  const byCategory = new Map<string, number>();
  for (const d of despesas) {
    byCategory.set(d.categoria, (byCategory.get(d.categoria) || 0) + d.valor);
  }

  const linhas: (string | number)[][] = [];
  for (const [categoria, valor] of byCategory) {
    linhas.push([categoria, valor]);
  }

  return {
    titulo: 'Despesas por Categoria',
    colunas: ['Categoria', 'Valor (R$)'],
    linhas,
  };
}

/**
 * Generate chart data
 */
function generateCharts(dados: ReportData): ChartData[] {
  return [
    {
      tipo: 'linha',
      titulo: 'Evolução de Receitas',
      dados: dados.receitas.map(r => ({ x: r.data, y: r.valor })),
    },
    {
      tipo: 'pizza',
      titulo: 'Distribuição de Despesas',
      dados: groupByCategory(dados.despesas),
    },
  ];
}

/**
 * Group expenses by category
 */
function groupByCategory(despesas: ExpenseItem[]): Record<string, number> {
  const grouped: Record<string, number> = {};
  for (const d of despesas) {
    grouped[d.categoria] = (grouped[d.categoria] || 0) + d.valor;
  }
  return grouped;
}

/**
 * Format period for display
 */
function formatPeriodo(periodo: ReportPeriod): string {
  const inicio = periodo.inicio.toLocaleDateString('pt-BR');
  const fim = periodo.fim.toLocaleDateString('pt-BR');
  return `${inicio} a ${fim}`;
}
