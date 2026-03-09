# Scoring Criteria - WhatsApp Prospector Ensinio

> v2.1 — Enriquecido com ICPs, Red Flags e Sales Intelligence do ensinio-mind v1.1
> Source of truth: `squads/ensinio-mind/data/` (ICPs, red flags, arguments, sales playbook)

## Escala de Temperatura (1-10)

### Score 9-10: HOT - Necessidade explicita
- Menciona diretamente que precisa de area de membros/LMS
- Pergunta sobre plataformas de curso
- Menciona dor com plataforma atual (Hotmart, Memberkit, Cademi)
- Busca solucao de checkout/pagamento integrado
- Quer agente de IA para vendas
- Menciona migracao de plataforma
- **ICP Match:** Faturamento R$20-100k/mês, audiencia 10-50k, nicho top 5
- **Acao:** Prioridade maxima para contato

### Score 7-8: WARM - Fit forte
- Tem curso/conteudo online e fala sobre isso
- Menciona produtos digitais (mentorias, cursos, ebooks)
- Fala sobre comunidade para alunos
- Menciona gamificacao ou retencao
- Tem negocio educacional claro
- **ICP Match:** Pelo menos 2 criterios do perfil comportamental
- **Acao:** Contatar em ate 48h

### Score 5-6: MODERATE - Fit parcial
- Fala sobre negocio que PODERIA usar LMS
- Menciona conteudo mas nao necessariamente online
- Tem audiencia mas sem produto digital ainda
- Fala sobre automacao de vendas genericamente
- **ICP Match:** 1 criterio do perfil comportamental
- **Acao:** Contatar na semana

### Score 3-4: COOL - Fit fraco
- Mencoes tangenciais a educacao/conteudo
- Negocio fisico que poderia ter componente digital
- Fala sobre marketing mas sem produto educacional
- **Acao:** Contatar se sobrar capacidade

### Score 1-2: COLD - Sem fit
- Nenhuma mencao a educacao, cursos ou conteudo
- Negocio completamente fora do escopo
- Apenas interacoes sociais no grupo
- **Acao:** Nao contatar

## Red Flags — Desqualificacao (ensinio-mind v1.1)

### BLOQUEADORES (Score automatico = 0, excluir do pipeline)
| Red Flag | Sinal no Chat | Acao |
|----------|--------------|------|
| Produto fisico | Fala sobre vender roupas, canecas, produtos tangíveis | Desqualificar |
| Apenas ebook | Quer "vitrine" para PDF/ebook simples | Desqualificar |
| Quer ser afiliado | Quer revender, nao criar conteudo | Desqualificar |
| "Gerenciem tudo pra mim" | Quer terceirizacao total | Desqualificar |

### ALERTAS (Penalidade de score, nao exclui)
| Red Flag | Sinal no Chat | Penalidade |
|----------|--------------|-----------|
| Zero faturamento | Comecando do zero absoluto | -2 |
| "Taxa zero" obsessivo | Insiste em custo zero | -2 |
| Checkout internacional | Precisa vender em USD/EUR | -1 (limitacao atual) |
| Podcast/evento ao vivo | Precisa de feature inexistente | -1 (limitacao atual) |

## ICP Match Score — Criterios do ensinio-mind v1.1

### Perfil Demografico (bonus se match)
| Criterio | Match Signal no Chat | Bonus |
|----------|---------------------|-------|
| Idade 26-45 | Inferir por contexto (profissional maduro) | +0.5 |
| Grandes centros (SP, RJ, BSB) | DDD 11, 21, 61 ou mencao de cidade | +0.5 |

### Perfil Comportamental (bonus se match)
| Criterio | Match Signal no Chat | Bonus |
|----------|---------------------|-------|
| Faturamento R$20-100k/mês | Menciona faturamento, equipe, escala | +1 |
| Audiencia 10-50k | Menciona seguidores, canal, base | +1 |
| Usa 2+ plataformas | Menciona Hotmart + outra tool | +1 |
| Nichos top 5 | Negocios, Educacao, Saude, Financas, Tech | +0.5 |

### Situacao Tipica do Cliente (bonus se match)
| Situacao | Match Signal no Chat | Bonus |
|----------|---------------------|-------|
| "Tenho conteudo e quero monetizar" | Primaria — match direto | +1 |
| "Quero area de membros" | Secundaria — match direto | +1 |
| "Preciso de app" | Terciaria — match direto | +0.5 |
| Cansado de integracoes | Menciona problemas entre plataformas | +1 |

## Criterios de Classificacao por Tipo

### Cliente Potencial
- Tem ou quer ter curso/conteudo online
- Precisa de area de membros
- Vende ou quer vender produtos digitais
- Precisa de checkout/pagamento
- Busca solucao de IA para atendimento
- Tem equipe que precisa de treinamento

### Parceiro (Influencer/Promoter)
- Tem audiencia grande mas nao vende cursos
- Promove eventos
- E influencer digital
- Tem comunidade ativa
- Poderia indicar Ensinio para sua audiencia

## Bonus de Score (+1 cada)
- Menciona frustacao com plataforma atual (+1)
- Menciona orcamento disponivel (+1)
- Tem urgencia temporal (+1)
- Ja tem conteudo pronto para hospedar (+1)
- Tem equipe dedicada (+1)
- Usa plataforma concorrente (Hotmart, Memberkit, Cademi) (+1) — NEW v2.1
- Menciona app mobile como necessidade (+0.5) — NEW v2.1

## Penalidades de Score (-1 cada)
- Mensagem muito antiga sem contexto recente (-1)
- Apenas 1 mensagem no grupo (-1)
- Mensagem vaga sem detalhes do projeto (-1)
- Red flag de alerta ativo (ver tabela acima) (-1 a -2) — NEW v2.1

## Argumentos por Score Range (ensinio-mind v1.1)

Para enriquecer as mensagens de outreach, o outreach-writer deve usar os argumentos adequados:

| Score Range | Argumento Primario | Fonte |
|-------------|-------------------|-------|
| 9-10 (HOT) | All-in-One (Economia Real) — "Voce nao precisa de 3 plataformas" | ensinio-mind/data/ensinio-arguments.md |
| 7-8 (WARM) | Experiencia Premium — "Seu aluno merece mais" | ensinio-mind/data/ensinio-arguments.md |
| 5-6 (MODERATE) | Soft approach — foco na curiosidade, sem pressao | ensinio-mind/data/ensinio-sales-playbook.md |
| 3-4 (COOL) | Educacional — link para conteudo da Ensinio | Minimal outreach |
