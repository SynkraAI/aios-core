# Guia de Economia de Tokens - Modelo por Tarefa

> **Principio:** Usar o modelo MINIMO que entrega QUALIDADE.
> Economizar sem perder performance.

---

## Resumo Executivo

```
HAIKU  → "Buscar, pegar, formatar, listar"
         Nao precisa pensar, so executar

SONNET → "Criar, escrever, analisar, codificar"
         Precisa criatividade ou logica

OPUS   → "Decidir, arquitetar, estrategizar"
         Consequencias grandes, multiplas variaveis
```

---

## Precos (por milhao de tokens)

| Modelo | Input | Output | vs Haiku |
|--------|-------|--------|----------|
| **Haiku** | $0.25 | $1.25 | 1x |
| **Sonnet** | $3 | $15 | 12x mais caro |
| **Opus** | $15 | $75 | 60x mais caro |

---

## HAIKU - Coleta & Execucao (70% das tarefas)

### Coleta de Dados

| Tarefa | Por que Haiku basta |
|--------|---------------------|
| WebSearch - buscar termo | So executa busca, nao analisa |
| WebFetch - pegar pagina | So baixa conteudo |
| YouTube - listar videos canal | API call simples |
| YouTube - pegar transcricao | So extrai texto |
| YouTube - metricas (views, likes) | Numeros, sem analise |
| Instagram - listar posts | API call |
| Supabase - SELECT simples | Query direta |
| Glob/Grep - buscar arquivos | Pattern matching |
| Read - ler arquivo | Sem processamento |
| Git status/log/diff | Comandos diretos |
| Listar tags/listas ActiveCampaign | API call |
| Pegar template existente | So copiar |
| Checar se link funciona | HTTP request |
| Contar palavras/caracteres | Calculo simples |
| Converter JSON → CSV | Transformacao mecanica |
| Extrair texto de imagem (OCR) | Processamento padrao |

### Formatacao & Organizacao

| Tarefa | Por que Haiku basta |
|--------|---------------------|
| Formatar markdown | Regras fixas |
| Preencher template com dados | Substituicao |
| Organizar lista alfabetica | Sort |
| Limpar texto (remover espacos) | Regex |
| Gerar HTML de template pronto | Montagem |
| Criar CSV de dados | Estruturacao simples |
| Numerar itens | Mecanico |
| Adicionar timestamps | Formatacao |
| Traduzir frase curta (<50 palavras) | Traducao direta |
| Marcar checklist items | Atualizar status |

### Analise Leve

| Tarefa | Por que Haiku basta |
|--------|---------------------|
| Resumir 1 paragrafo | Compressao simples |
| Identificar idioma | Deteccao basica |
| Extrair emails de texto | Pattern matching |
| Categorizar item (1 categoria) | Classificacao simples |
| Verificar se texto tem keyword | Busca |
| Calcular metricas basicas | Matematica |
| Comparar 2 numeros | Logica simples |

---

## SONNET - Criacao & Analise (25% das tarefas)

### Escrita Simples

| Tarefa | Por que precisa Sonnet |
|--------|------------------------|
| Escrever 1 tweet/post curto | Precisa criatividade |
| Caption de Instagram | Tom de voz importa |
| Responder comentario | Contexto social |
| Email transacional (confirmacao) | Clareza + tom |
| Descricao curta de produto | Persuasao basica |
| Alt text de imagem | Descricao util |
| Commit message descritiva | Entender mudancas |
| Renomear variaveis (refactor) | Semantica |
| Traduzir texto medio (50-500 palavras) | Manter nuances |

### Escrita Criativa

| Tarefa | Por que precisa Sonnet |
|--------|------------------------|
| Subject line de email | Alta competicao, precisa ser bom |
| Headline de anuncio | CTR depende disso |
| Hook de video (primeiros 3s) | Retencao critica |
| CTA button text | Conversao |
| Bullets de beneficios | Persuasao |
| Bio de perfil | Posicionamento |
| Titulo de video YouTube | SEO + curiosidade |
| Meta description | CTR no Google |
| Primeiro paragrafo de artigo | Hook do leitor |
| Push notification | Abertura |

### Email & Copy

| Tarefa | Por que precisa Sonnet |
|--------|------------------------|
| Email de nurture | Relacionamento |
| Email de venda | Persuasao |
| Sequencia SOAP opera | Storytelling |
| Welcome sequence | Primeira impressao |
| Email de carrinho abandonado | Recuperacao |
| Copy de landing page | Conversao |
| Descricao de oferta | Valor percebido |
| FAQ copywriting | Objecoes |
| Testimonial rewrite | Credibilidade |
| Garantia copy | Reduzir risco |

### Conteudo Longo

| Tarefa | Por que precisa Sonnet |
|--------|------------------------|
| Roteiro de Reels (15-60s) | Estrutura + hook |
| Roteiro de video YouTube | Retencao |
| Script de VSL | Persuasao longa |
| Artigo de blog (500-2000 palavras) | SEO + valor |
| Newsletter semanal | Engajamento |
| Carrossel Instagram (slides) | Fluxo narrativo |
| Thread Twitter/X | Progressao logica |
| Webinar outline | Estrutura didatica |
| Podcast outline | Conversa natural |
| Ebook capitulo | Profundidade |

### Codigo

| Tarefa | Por que precisa Sonnet |
|--------|------------------------|
| Componente React novo | Logica + padroes |
| Hook customizado | Abstracao |
| Funcao com logica | Algoritmo |
| API endpoint | Request/response |
| Query SQL media | Joins, subqueries |
| Migration de banco | Schema changes |
| Integracao de API | Error handling |
| Testes unitarios | Edge cases |
| Refactor de codigo | Manter comportamento |
| Debug de erro | Investigacao |
| CSS/Tailwind complexo | Layout responsivo |
| Regex complexa | Pattern matching avancado |

### Analise Media

| Tarefa | Por que precisa Sonnet |
|--------|------------------------|
| Analisar metricas de campanha | Insights |
| Comparar 2-3 concorrentes | Padroes |
| Identificar gaps de conteudo | Oportunidades |
| Review de codigo | Qualidade |
| Analisar feedback de clientes | Temas |
| Sugerir melhorias | Recomendacoes |
| Criar persona basica | Avatar |
| Mapear jornada simples | Touchpoints |
| Analisar transcricao (1 video) | Extracao de valor |
| Relatorio semanal | Narrativa de dados |

---

## OPUS - Estrategia & Decisao (5% das tarefas)

| Tarefa | Por que precisa Opus |
|--------|----------------------|
| Big Idea de campanha | Diferenciacao unica |
| Mecanismo unico | Posicionamento |
| Estrategia de lancamento | Multiplas variaveis |
| Plano de marketing trimestral | Visao sistemica |
| Analise de cohort completa | Padroes profundos |
| Pricing strategy | Trade-offs complexos |
| Arquitetura de sistema | Decisoes irreversiveis |
| PRD completo do zero | Visao de produto |
| Analise de pivo | Risco alto |
| Negociacao complexa | Multiplos interesses |
| Gestao de crise | Decisoes rapidas criticas |
| Sintese de personalidade (MMOS) | Raciocinio multi-camada |
| Debug impossivel | Investigacao profunda |
| Codigo de seguranca/auth | Zero margem de erro |
| Decisao de deletar dados prod | Irreversivel |
| Rebranding completo | Identidade |
| Due diligence | Analise exaustiva |
| Definir OKRs anuais | Direcao estrategica |
| Resolver conflito de requisitos | Trade-offs |
| Plano de escala | Timing + recursos |

---

## Distribuicao por Squad

| Squad | Haiku | Sonnet | Opus |
|-------|-------|--------|------|
| **Marketing** | 60% | 35% | 5% |
| **Copy** | 20% | 70% | 10% |
| **Ads/Traffic** | 50% | 45% | 5% |
| **Data/Analytics** | 70% | 25% | 5% |
| **Content** | 30% | 65% | 5% |
| **MMOS** | 40% | 40% | 20% |
| **Dev/Code** | 30% | 60% | 10% |
| **Design** | 50% | 45% | 5% |
| **Estrategia** | 20% | 40% | 40% |

---

## NUNCA usar Haiku para

- Escrever copy (qualidade cai muito)
- Codigo com logica (bugs)
- Analise que precisa de insight
- Qualquer coisa que vai pro cliente/usuario final
- Decisoes que afetam dinheiro
- Conteudo que representa a marca

---

## Economia Estimada

| Cenario | So Sonnet | Com Haiku | Economia |
|---------|-----------|-----------|----------|
| Sessao espiao (10 buscas) | $1.10 | $0.10 | 91% |
| Dia de trabalho normal | $8-15 | $3-6 | 60% |
| Mes intenso | $200-400 | $80-150 | 60% |

---

**Versao:** 1.0
**Criado:** 01/02/2026
**Atualizado:** 09/02/2026
**Regra:** Qualidade > Economia. Nunca sacrificar output por tokens.
