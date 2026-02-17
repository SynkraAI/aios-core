<!--
  Tradução: PT-BR
  Original: /docs/en/guides/quality-dashboard.md
  Última sincronização: 2026-01-26
-->

# Guia do Dashboard de Quality Gates

> 🌐 [EN](../../guides/quality-dashboard.md) | **PT** | [ES](../../es/guides/quality-dashboard.md)

---

> Dashboard visual para monitoramento de métricas de qualidade em todas as 3 camadas.

**Versão:** 1.0
**Última Atualização:** 2025-12-05

---

## Visão Geral

O Dashboard de Quality Gates fornece visualização em tempo real das métricas de qualidade coletadas das três camadas de quality gates. Ele ajuda tech leads e desenvolvedores a monitorar tendências de qualidade de código, identificar problemas e acompanhar a eficácia do sistema de quality gates.

### Funcionalidades Principais

| Funcionalidade                 | Descrição                                                              |
| ------------------------------ | ---------------------------------------------------------------------- |
| **Métricas de 3 Camadas**      | Visualize taxas de aprovação para Pre-Commit, PR Review e Human Review |
| **Gráficos de Tendência**      | Acompanhe a taxa de captura automática nos últimos 30 dias             |
| **Atualizações em Tempo Real** | Atualização automática a cada 60 segundos                              |
| **Design Responsivo**          | Funciona em desktop, tablet e mobile                                   |
| **Acessibilidade**             | Compatível com WCAG 2.1 AA                                             |
| **Modo Escuro**                | Automático baseado na preferência do sistema                           |

---

## Acessando o Dashboard

### Modo de Desenvolvimento

```bash
# Navegue até o diretório do dashboard
cd tools/quality-dashboard

# Sincronize métricas e inicie o servidor de desenvolvimento
npm run dev:sync

# Ou sincronize separadamente
npm run sync-metrics
npm run dev
```

O dashboard abrirá em `http://localhost:3000`.

### Build de Produção

```bash
# Build para produção
cd tools/quality-dashboard
npm run build

# Preview do build de produção
npm run preview

# Servir do diretório dist/
npx serve dist
```

### Acesso Direto ao Arquivo

Abra o dashboard pré-construído:

```
tools/quality-dashboard/dist/index.html
```

---

## Entendendo o Dashboard

### Seção de Cabeçalho

```
┌─────────────────────────────────────────────────────────┐
│  📊 Dashboard de Quality Gates                          │
│  Última Atualização: 5 Dez, 2025 14:30:00              │
│  [🔄 Atualizar] [Auto-atualização: 60s ▼]              │
└─────────────────────────────────────────────────────────┘
```

| Elemento               | Descrição                                        |
| ---------------------- | ------------------------------------------------ |
| **Última Atualização** | Timestamp da busca de dados mais recente         |
| **Botão Atualizar**    | Atualização manual sem recarregar a página       |
| **Auto-atualização**   | Intervalo configurável (30s, 60s, 5m, desligado) |

### Cards de Camada

Cada camada de quality gate tem seu próprio card de métricas:

```
┌─────────────────────────────────────────────────────────┐
│  Camada 1: Pre-Commit                       ● Saudável │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Taxa de Aprovação: 94.5%  Tempo Médio: 32s  Total: 156│
│  ████████████████░░                                     │
│                                                         │
│  [Clique para expandir]                                 │
└─────────────────────────────────────────────────────────┘
```

#### Camada 1: Pre-Commit

| Métrica                | Descrição                                                           |
| ---------------------- | ------------------------------------------------------------------- |
| **Taxa de Aprovação**  | % de commits passando todas as verificações (lint, test, typecheck) |
| **Tempo Médio**        | Tempo médio para completar todas as verificações da Camada 1        |
| **Total de Execuções** | Número de execuções pre-commit no período                           |

#### Camada 2: PR Review

| Métrica                        | Descrição                                              |
| ------------------------------ | ------------------------------------------------------ |
| **Taxa de Aprovação**          | % de PRs passando na revisão automatizada              |
| **Achados do CodeRabbit**      | Problemas encontrados pelo CodeRabbit (por severidade) |
| **Achados do Quinn**           | Problemas encontrados pelo agente @qa                  |
| **Taxa de Captura Automática** | % de problemas capturados antes da revisão humana      |

**Visualização Expandida (clique para expandir):**

```
┌─────────────────────────────────────────────────────────┐
│  Camada 2: PR Review                        ● Alerta   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Taxa Aprovação: 87.2%  Tempo Médio: 4m 32s  Total: 45 │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Detalhamento CodeRabbit                         │   │
│  │ CRÍTICO: 3  │  ALTO: 12  │  MÉDIO: 28          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Achados do Quinn (@qa)                          │   │
│  │ Bloqueadores: 2  │  Alertas: 8  │  Info: 15    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Camada 3: Human Review

| Métrica               | Descrição                                    |
| --------------------- | -------------------------------------------- |
| **Taxa de Aprovação** | % de PRs aprovados na primeira revisão       |
| **Tempo Médio**       | Tempo médio da criação do PR até a aprovação |
| **Taxa de Revisão**   | % de PRs que precisam de revisões            |

### Gráfico de Tendência

O gráfico de tendência mostra a taxa de captura automática nos últimos 30 dias:

```
Taxa de Captura Automática - Tendência (30 dias)
100% ┤
 90% ┤        ╭──────────╮
 80% ┤   ╭────╯          ╰────╮
 70% ┤───╯                    ╰───
 60% ┤
     └────────────────────────────
        Semana 1  Semana 2  Semana 3  Semana 4
```

**Taxa de Captura Automática** = Problemas capturados pela Camada 1 + Camada 2 / Total de problemas

Quanto maior, melhor - significa que mais problemas são capturados automaticamente antes da revisão humana.

---

## Fonte de Dados de Métricas

### Localização

As métricas são armazenadas em:

```
.aios/data/quality-metrics.json
```

### Formato de Dados

```json
{
  "generated": "2025-12-05T14:30:00.000Z",
  "version": "1.0",
  "summary": {
    "overallHealth": "healthy",
    "autoCatchRate": 0.945,
    "totalRuns": 156
  },
  "layers": {
    "layer1": {
      "name": "Pre-Commit",
      "passRate": 0.945,
      "avgTimeSeconds": 32,
      "totalRuns": 156,
      "checks": {
        "lint": { "passRate": 0.98, "avgTime": 12 },
        "test": { "passRate": 0.95, "avgTime": 45 },
        "typecheck": { "passRate": 0.99, "avgTime": 28 }
      }
    },
    "layer2": {
      "name": "PR Review",
      "passRate": 0.872,
      "avgTimeSeconds": 272,
      "totalRuns": 45,
      "coderabbit": {
        "critical": 3,
        "high": 12,
        "medium": 28,
        "low": 45
      },
      "quinn": {
        "blockers": 2,
        "warnings": 8,
        "info": 15
      }
    },
    "layer3": {
      "name": "Human Review",
      "passRate": 0.78,
      "avgTimeSeconds": 86400,
      "totalRuns": 38,
      "revisionRate": 0.22
    }
  },
  "trends": {
    "autoCatchRate": [
      { "date": "2025-11-05", "value": 0.82 },
      { "date": "2025-11-12", "value": 0.87 },
      { "date": "2025-11-19", "value": 0.91 },
      { "date": "2025-11-26", "value": 0.93 },
      { "date": "2025-12-03", "value": 0.945 }
    ]
  }
}
```

### Sincronizando Métricas

O dashboard lê métricas da pasta public. Para atualizar:

```bash
# Sincronizar de .aios/data para o dashboard
npm run sync-metrics

# Ou use o comando combinado
npm run dev:sync
```

Isso copia `.aios/data/quality-metrics.json` para `tools/quality-dashboard/public/.aios/data/`.

---

## Interpretando Tendências

### Tendências Saudáveis

| Indicador                              | O Que Significa                                                       |
| -------------------------------------- | --------------------------------------------------------------------- |
| **Taxa de Captura Automática Subindo** | Mais problemas capturados automaticamente - quality gates funcionando |
| **Revisões da Camada 3 Diminuindo**    | Revisores humanos encontrando menos problemas                         |
| **Taxas de Aprovação Estáveis > 90%**  | Desenvolvedores escrevendo código melhor desde o início               |

### Sinais de Alerta

| Indicador                             | O Que Significa                               | Ação                               |
| ------------------------------------- | --------------------------------------------- | ---------------------------------- |
| **Taxa de Captura Automática Caindo** | Verificações automatizadas perdendo problemas | Revisar configuração do CodeRabbit |
| **Taxa de Aprovação Camada 1 < 80%**  | Muitos commits falhando                       | Verificar regras de lint/test      |
| **Camada 2 Muitos CRÍTICOs**          | Problemas de segurança/qualidade              | Revisar práticas de código         |
| **Taxa de Revisão Camada 3 > 30%**    | Revisão humana encontrando muitos problemas   | Melhorar automação                 |

---

## Configuração

### Intervalo de Auto-atualização

Clique no dropdown ao lado do botão de atualização:

| Opção           | Caso de Uso                          |
| --------------- | ------------------------------------ |
| **30 segundos** | Monitoramento ativo durante releases |
| **60 segundos** | Padrão para uso diário               |
| **5 minutos**   | Monitoramento em segundo plano       |
| **Desligado**   | Apenas atualização manual            |

### Modo Escuro

O dashboard segue automaticamente a preferência do seu sistema. Não é necessário alternar manualmente.

---

## Acessibilidade

O dashboard é compatível com WCAG 2.1 AA:

| Funcionalidade            | Implementação                                         |
| ------------------------- | ----------------------------------------------------- |
| **Contraste de Cores**    | Todo texto tem proporção de contraste mínima de 4.5:1 |
| **Navegação por Teclado** | Suporte completo a teclado com foco visível           |
| **Leitores de Tela**      | Labels ARIA em todos os elementos interativos         |
| **Movimento Reduzido**    | Respeita `prefers-reduced-motion`                     |
| **Gerenciamento de Foco** | Ordem de tab lógica em todo o dashboard               |

---

## Solução de Problemas

### Dashboard Mostra Dados Desatualizados

```bash
# Sincronize métricas manualmente
cd tools/quality-dashboard
npm run sync-metrics

# Atualize a página
```

### Arquivo de Métricas Não Encontrado

Certifique-se de que o coletor de métricas foi executado:

```bash
# Verifique se o arquivo de métricas existe
ls -la .aios/data/quality-metrics.json

# Se estiver faltando, popule com dados de exemplo
npx aios metrics seed
```

### Gráficos Não Renderizando

1. Limpe o cache do navegador
2. Certifique-se de que o JavaScript está habilitado
3. Tente um navegador diferente

### Auto-atualização Não Funciona

A auto-atualização pausa quando:

- A aba do navegador está em segundo plano
- A conectividade de rede está perdida
- O foco está em um elemento interativo

---

## Documentação Relacionada

- [Guia de Quality Gates](./quality-gates.md)

---

_Synkra AIOS Quality Dashboard v1.0_
