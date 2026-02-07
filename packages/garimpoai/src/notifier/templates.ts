// Message templates for notifications

import { FilterResult } from '../filter/engine';

/** Format a currency value in BRL */
function formatBRL(value: number | null): string {
  if (value === null || value === undefined) return 'Nao informado';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

/** Format a licitacao for Telegram (Markdown) */
export function formatTelegramMessage(licitacao: FilterResult): string {
  const valor = formatBRL(licitacao.valorTotalEstimado);
  const local = [licitacao.municipioNome, licitacao.ufSigla].filter(Boolean).join('/') || 'N/A';
  const prazo = licitacao.dataAberturaProposta || 'Sem prazo informado';

  return [
    `*Nova Licitacao Encontrada!*`,
    ``,
    `*Objeto:* ${escapeMarkdown(licitacao.objetoCompra.substring(0, 200))}`,
    `*Orgao:* ${escapeMarkdown(licitacao.orgaoRazaoSocial || 'N/A')}`,
    `*Local:* ${escapeMarkdown(local)}`,
    `*Valor:* ${escapeMarkdown(valor)}`,
    `*Modalidade:* ${escapeMarkdown(licitacao.modalidadeNome)}`,
    `*Prazo proposta:* ${escapeMarkdown(prazo)}`,
    ``,
    `ID: \`${licitacao.numeroControlePNCP}\``,
  ].join('\n');
}

/** Format a batch of licitacoes for Telegram */
export function formatTelegramBatch(items: FilterResult[], alertName: string): string {
  const header = `*Alerta: ${escapeMarkdown(alertName)}*\n${items.length} nova(s) licitacao(oes) encontrada(s):\n`;

  const summaries = items.slice(0, 10).map((item, i) => {
    const valor = formatBRL(item.valorTotalEstimado);
    const uf = item.ufSigla || '??';
    return `${i + 1}. [${uf}] ${escapeMarkdown(item.objetoCompra.substring(0, 100))} — ${escapeMarkdown(valor)}`;
  });

  const footer = items.length > 10 ? `\n_...e mais ${items.length - 10} resultado(s)_` : '';

  return header + summaries.join('\n') + footer;
}

/** Format a licitacao for email (HTML) */
export function formatEmailHtml(items: FilterResult[], alertName: string): string {
  const rows = items
    .map((item) => {
      const valor = formatBRL(item.valorTotalEstimado);
      const local = [item.municipioNome, item.ufSigla].filter(Boolean).join('/') || 'N/A';
      return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.objetoCompra.substring(0, 120)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.orgaoRazaoSocial || 'N/A'}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${local}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${valor}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.modalidadeNome}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.dataAberturaProposta || '-'}</td>
      </tr>`;
    })
    .join('');

  return `
  <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto">
    <h2 style="color:#D4A017">GarimpoAI — ${alertName}</h2>
    <p>${items.length} nova(s) licitacao(oes) encontrada(s):</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:8px;text-align:left">Objeto</th>
          <th style="padding:8px;text-align:left">Orgao</th>
          <th style="padding:8px;text-align:left">Local</th>
          <th style="padding:8px;text-align:left">Valor</th>
          <th style="padding:8px;text-align:left">Modalidade</th>
          <th style="padding:8px;text-align:left">Prazo</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="color:#999;font-size:11px;margin-top:20px">
      Enviado por GarimpoAI — Assistente de Licitacoes
    </p>
  </div>`;
}

/** Escape special Markdown characters for Telegram */
function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
