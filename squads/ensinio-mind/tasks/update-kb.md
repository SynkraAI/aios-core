# Task: Atualizar Knowledge Base

> Processo estruturado para atualizar dados do ensinio-mind com novas informações

## Quando usar
- Novo formulário de enriquecimento recebido (CSV/Google Forms)
- Mudança de pricing, features ou posicionamento
- Novo case de sucesso com resultados quantitativos
- Atualização de dados comerciais (clientes ativos, GMV, etc.)

## Pré-requisitos
- [ ] Fonte dos dados identificada (quem respondeu, quando)
- [ ] Dados em formato acessível (CSV, Google Sheets, documento)

## Processo

### Fase 1: Triagem (5 min)
1. Ler dados novos completamente
2. Categorizar por arquivo destino:
   - Produto/features → `ensinio-product-ecosystem.md`
   - Pricing → `ensinio-pricing.md`
   - ICP/perfil → `ensinio-icps.md`
   - Red flags → `ensinio-red-flags.md`
   - Objeções → `ensinio-sales-playbook.md`
   - Ciclo de venda → `ensinio-sales-cycle.md`
   - Cases → `ensinio-cases.md`
   - Mercado/métricas → `ensinio-market.md`
   - Identidade → `ensinio-identity.md`
   - Concorrentes → `ensinio-competitors.md`
   - Regras de mensagem → `message-rules.md`
   - Scoring → `scoring-criteria.md`
   - Argumentos → `ensinio-arguments.md`

### Fase 2: Validação (10 min)
Para cada dado novo:
- [ ] Conflita com dado existente? → Atualizar com fonte + data
- [ ] É dado complementar? → Adicionar sem remover existente
- [ ] É dado redundante? → Pular
- [ ] Fonte confiável? (vendedor, fundador, dados reais)

### Fase 3: Atualização (20-40 min)
- [ ] Editar cada arquivo destino
- [ ] Manter formato existente (tabelas, headers, checklists)
- [ ] Adicionar fonte e data em cada dado novo
- [ ] Atualizar versão do arquivo no rodapé
- [ ] Marcar "Perguntas Pendentes" resolvidas como [x]

### Fase 4: Cross-check (5 min)
- [ ] Verificar consistência entre arquivos atualizados
- [ ] Pricing bate entre `pricing.md` e `product-ecosystem.md`?
- [ ] Red flags alinham com ICP negativo?
- [ ] Cases mencionados no `sales-playbook.md` existem no `cases.md`?

### Fase 5: Versionamento
- [ ] Bumpar versão do `config.yaml`
- [ ] Atualizar `README.md` se estrutura mudou
- [ ] Commit com mensagem: `docs(ensinio-mind): update KB v{X} with {fonte}`

## Veto Conditions
- **NUNCA** remover dados existentes sem confirmação
- **NUNCA** inventar dados que não vieram da fonte
- **NUNCA** atualizar pricing sem confirmação do time comercial
- **SEMPRE** manter fonte e data rastreáveis

## Output
- Arquivos atualizados em `squads/ensinio-mind/data/`
- Versão bumpada
- Commit feito

---

**Criado:** 2026-03-13 | **Tipo:** Operacional
