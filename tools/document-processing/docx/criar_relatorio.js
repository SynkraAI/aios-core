#!/usr/bin/env node
/**
 * Exemplo: Criar relatório Word formatado
 */
const { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableCell, TableRow, WidthType, Packer } = require('docx');
const fs = require('fs');

// Criar documento
const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: {
          top: 1440,    // 1 inch
          right: 1440,
          bottom: 1440,
          left: 1440,
        },
      },
    },
    children: [
      // TÍTULO
      new Paragraph({
        text: "Relatório de Vendas - Janeiro 2026",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // SUBTÍTULO
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [
          new TextRun({
            text: "Análise Mensal de Performance",
            size: 24,
            color: "666666",
            italics: true,
          }),
        ],
      }),

      // SEÇÃO 1
      new Paragraph({
        text: "1. Resumo Executivo",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "Este relatório apresenta os resultados de vendas do mês de janeiro de 2026. ",
          }),
          new TextRun({
            text: "Destaque para o crescimento de 25%",
            bold: true,
            color: "2E7D32",
          }),
          new TextRun({
            text: " em relação ao mês anterior, superando as expectativas iniciais.",
          }),
        ],
      }),

      // SEÇÃO 2
      new Paragraph({
        text: "2. Principais Indicadores",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),

      // Lista com bullets
      new Paragraph({
        text: "• Receita Total: R$ 175.250,00",
        spacing: { after: 100 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "• Número de Vendas: 89 transações",
        spacing: { after: 100 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "• Ticket Médio: R$ 1.970,22",
        spacing: { after: 100 },
        bullet: { level: 0 },
      }),

      new Paragraph({
        text: "• Taxa de Conversão: 32%",
        spacing: { after: 400 },
        bullet: { level: 0 },
      }),

      // SEÇÃO 3
      new Paragraph({
        text: "3. Top 3 Produtos",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),

      // Tabela
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          // Header
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: "Produto", bold: true })],
                shading: { fill: "4472C4" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Vendas", bold: true })],
                shading: { fill: "4472C4" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Receita", bold: true })],
                shading: { fill: "4472C4" },
              }),
            ],
          }),
          // Dados
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Notebook")] }),
              new TableCell({ children: [new Paragraph("15")] }),
              new TableCell({ children: [new Paragraph("R$ 52.500,00")] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Monitor")] }),
              new TableCell({ children: [new Paragraph("20")] }),
              new TableCell({ children: [new Paragraph("R$ 16.000,00")] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Teclado")] }),
              new TableCell({ children: [new Paragraph("30")] }),
              new TableCell({ children: [new Paragraph("R$ 4.500,00")] }),
            ],
          }),
        ],
      }),

      // CONCLUSÃO
      new Paragraph({
        text: "4. Conclusão",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 600, after: 200 },
      }),

      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "Os resultados demonstram uma ",
          }),
          new TextRun({
            text: "tendência positiva",
            bold: true,
            underline: {},
          }),
          new TextRun({
            text: " nas vendas. Recomenda-se manter o foco nos produtos de maior ticket médio e expandir as estratégias de marketing digital.",
          }),
        ],
      }),

      // Rodapé
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800 },
        children: [
          new TextRun({
            text: "Gerado automaticamente via AIOS Document Processing",
            size: 18,
            color: "999999",
            italics: true,
          }),
        ],
      }),
    ],
  }],
});

// Salvar
const outputFile = '/Users/luizfosc/Downloads/relatorio_vendas_2026.docx';
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputFile, buffer);
  console.log(`✓ Relatório criado: ${outputFile}`);
  console.log('  - Título e subtítulo formatados');
  console.log('  - 4 seções com conteúdo');
  console.log('  - Lista com bullets');
  console.log('  - Tabela de produtos');
  console.log('  - Formatação rica (negrito, cores, itálico)');
});
