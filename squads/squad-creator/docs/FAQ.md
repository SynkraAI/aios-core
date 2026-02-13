# Perguntas Frequentes (FAQ)

> Respostas rápidas para as dúvidas mais comuns sobre o Squad Creator.

---

## Índice

1. [Básico](#básico)
2. [Antes de Começar](#antes-de-começar)
3. [Sobre Experts e Minds](#sobre-experts-e-minds)
4. [Sobre Materiais](#sobre-materiais)
5. [Modos de Execução](#modos-de-execução)
6. [Durante a Criação](#durante-a-criação)
7. [Qualidade e Fidelidade](#qualidade-e-fidelidade)
8. [Após a Criação](#após-a-criação)
9. [Manutenção e Atualização](#manutenção-e-atualização)
10. [Problemas Comuns](#problemas-comuns)
11. [Avançado](#avançado)
12. [Glossário](#glossário)

---

## Básico

### O que é um Squad?

Um **squad** é um time de agentes de IA especializados que trabalham juntos em um domínio. Por exemplo, um squad de copywriting pode ter agentes baseados em experts clássicos do domínio - cada um com sua especialidade.

### O que é um "Elite Mind"?

É uma pessoa real, reconhecida em sua área, que tem **frameworks documentados**. Não são influencers genéricos - são experts com livros, cursos, metodologias próprias e resultados comprovados.

**Exemplos de domínios:**
- Copywriting: experts em redação persuasiva
- Marketing: estrategistas de marketing
- Negócios: pensadores de gestão e estratégia

### Qual a diferença entre Mind e Agent?

| | Mind | Agent |
|--|------|-------|
| **O que é** | Pessoa real | Clone digital |
| **Existe onde** | Mundo real | Sistema |
| **Exemplo** | Expert real | {expert-slug}.md |

O **mind** é a pessoa. O **agent** é o clone digital dela no sistema.

### Preciso saber programar?

**Não.** O Squad Creator é conversacional. Você só precisa:
1. Saber ativar: `@squad-creator`
2. Dizer o que quer: "Quero um squad de copywriting"
3. Responder perguntas simples
4. Aprovar no final

### Quanto tempo demora criar um squad?

| Modo | Tempo | Interações |
|------|-------|------------|
| YOLO | 15-30 min | 2-3 |
| QUALITY | 30-60 min | 5-8 |
| HYBRID | 20-45 min | 3-6 |

O tempo varia com o número de experts (geralmente 3-6 por squad).

### É grátis?

O Squad Creator em si não tem custo. Mas ele usa o Claude, então consome tokens da sua conta/API.

---

## Antes de Começar

### Como instalo o Squad Creator?

Se você tem o Squad Creator na pasta `squads/squad-creator`, já está instalado. Basta ativar:
```
@squad-creator
```

### Preciso de alguma conta especial?

Você precisa de:
- Projeto AIOS configurado
- Claude Code funcionando

### Funciona no Windows/Mac/Linux?

**Sim.** O Squad Creator roda via Claude Code, que funciona em qualquer sistema.

### Precisa de internet?

**Sim**, especialmente no modo YOLO que pesquisa fontes na web.

### Posso usar em qualquer projeto?

O Squad Creator foi feito para o ecossistema AIOS. Funciona em qualquer projeto que tenha a estrutura AIOS configurada.

### O que preciso ter pronto antes de começar?

**Mínimo:**
- Claude Code funcionando
- Saber o domínio do squad que quer criar

**Ideal (para modo QUALITY):**
- PDFs/livros dos experts
- Transcrições de cursos
- Links de entrevistas

---

## Sobre Experts e Minds

### Posso criar agent de qualquer pessoa?

Tecnicamente sim, mas funciona melhor com pessoas que têm **frameworks documentados**:
- Livros publicados
- Metodologias com nome
- Entrevistas explicando seu processo

### Posso criar agent de pessoa viva?

**Sim.** Na verdade, pessoas vivas geralmente têm mais material disponível (podcasts recentes, cursos atuais, etc).

### Posso criar agent de mim mesmo?

**Sim!** Se você tem frameworks próprios documentados (livros, cursos, posts), pode criar um agent seu. Use modo QUALITY com seus materiais.

### E se o expert não for famoso?

Experts menos conhecidos geralmente têm menos material disponível. Isso significa:
- YOLO mode terá baixa fidelidade
- Você precisará fornecer materiais (modo QUALITY)
- Pode não encontrar fontes suficientes

### Posso misturar experts de áreas diferentes no mesmo squad?

**Não recomendado.** Cada squad deve ter um domínio coeso:
- ✅ Domínio único: experts relacionados trabalhando juntos
- ❌ Misto: experts de áreas completamente diferentes

Para áreas diferentes, crie squads separados.

### Quantos experts por squad?

| Quantidade | Recomendação |
|------------|--------------|
| 1-2 | Muito pouco - falta diversidade |
| 3-5 | Ideal - cobertura boa |
| 6-8 | Bom - se o domínio for amplo |
| 9+ | Demais - difícil de gerenciar |

### E se dois experts se contradizem?

Contradições são **normais e autênticas**. O sistema:
1. Documenta a contradição
2. Mantém ambas as visões
3. O orchestrator escolhe qual usar por contexto

Exemplo: Kennedy é mais agressivo, Ogilvy mais elegante. Ambos válidos.

### Posso sugerir experts específicos?

**Sim!** Quando o sistema mostrar os experts encontrados, você pode:
- Adicionar: "Inclua também X"
- Remover: "Retire Y"
- Substituir: "Troque Z por W"

### O sistema sempre encontra bons experts?

Na maioria dos domínios conhecidos, sim. Mas se você trabalha em nicho muito específico, pode precisar sugerir experts manualmente.

---

## Sobre Materiais

### Que tipo de material funciona melhor?

**Ranking de qualidade:**
1. 🥇 Livros completos (PDF/ebook)
2. 🥈 Cursos com transcrição
3. 🥉 Entrevistas longas (1h+)
4. Podcasts
5. Artigos/newsletters
6. Posts de redes sociais

### Quanto material preciso?

**Mínimo recomendado por expert:**
- 1 livro OU
- 5 horas de áudio/vídeo OU
- 50 páginas de conteúdo escrito

**Ideal:**
- 2-3 livros
- 5-10 entrevistas
- Newsletters/artigos diversos

### Posso usar vídeos do YouTube?

**Sim!** O sistema pode:
- Extrair transcrições de vídeos públicos
- No modo YOLO, faz isso automaticamente
- No modo QUALITY, você pode indicar links específicos

### Posso usar materiais em português?

**Sim.** O sistema processa materiais em qualquer idioma. O agent resultante responderá no idioma que você usar com ele.

### E se o material for em outro idioma?

Funciona normalmente. Exemplo:
- Livro em inglês ✓
- Curso em espanhol ✓
- Entrevista em francês ✓

O DNA é extraído independente do idioma.

### Posso usar materiais piratas?

Tecnicamente funciona, mas **não recomendamos** por questões éticas e legais.

### Onde coloco os materiais?

```bash
# Crie uma pasta para o expert
mkdir -p materials/{expert-name}/

# Coloque PDFs, transcrições, etc
cp {source-material}.pdf materials/{expert-name}/
cp entrevista.txt materials/{expert-name}/

# Indique no comando
*create-squad {squad-name} --materials ./materials/
```

### Preciso organizar os materiais de alguma forma?

**Não.** O sistema processa qualquer estrutura. Mas ajuda se:
- Arquivos tiverem nomes descritivos
- PDFs estiverem legíveis (não escaneados mal)
- Transcrições estiverem limpas

---

## Modos de Execução

### YOLO ou QUALITY? Qual escolher?

**Fluxograma de decisão:**

```
Tenho materiais dos experts?
├── Sim → QUALITY (85-95% fidelidade)
├── Alguns → HYBRID
└── Não → YOLO (60-75% fidelidade)
```

### O que exatamente o modo YOLO faz?

1. Pesquisa experts automaticamente
2. Busca fontes na web (YouTube, artigos, resumos)
3. Extrai DNA do material encontrado
4. Cria agents
5. Só para se algo crítico falhar

### O que exatamente o modo QUALITY faz?

1. Pesquisa experts
2. **Para e pede seus materiais**
3. Indexa seus materiais como Tier 0 (máxima confiança)
4. **Para e pede validação do DNA**
5. Cria agents
6. **Para e pede validação dos agents**

### Quando usar HYBRID?

Quando você tem materiais de **alguns** experts, mas não de todos:
- Expert A: tenho 3 livros → QUALITY
- Expert B: não tenho nada → YOLO
- Expert C: tenho 1 curso → QUALITY

### Posso mudar de modo no meio?

**Não diretamente.** Mas você pode:
1. Cancelar o squad atual
2. Recomeçar com outro modo

### Posso começar com YOLO e melhorar depois?

**Sim!** Essa é uma estratégia recomendada:
1. Crie com YOLO (rápido, 70% fidelidade)
2. Teste se funciona para seu caso
3. Use `*update-mind` para adicionar materiais
4. Fidelidade sobe para 85%+

---

## Durante a Criação

### O que são "Smoke Tests"?

São 3 testes automáticos que validam se o agent realmente se comporta como o expert:

| Teste | O que valida |
|-------|--------------|
| **Conhecimento** | Sabe explicar os frameworks? |
| **Decisão** | Aplica as heurísticas? |
| **Objeção** | Mantém convicção quando desafiado? |

### O que é Tier 0, Tier 1, etc?

**Tiers de Agents:**
| Tier | Função | Exemplo |
|------|--------|---------|
| Tier 0 | Diagnóstico | Eugene Schwartz (awareness) |
| Tier 1 | Execução | Gary Halbert (escreve) |
| Tier 2 | Sistematização | Todd Brown (frameworks) |
| Tier 3 | Especialista | Ben Settle (só email) |

**Tiers de Fontes:**
| Tier | Tipo | Confiança |
|------|------|-----------|
| Tier 0 | Seus materiais | Máxima |
| Tier 1 | Do expert (livros) | Alta |
| Tier 2 | Sobre expert | Média |
| Tier 3 | Agregadores | Baixa |

### O que são Quality Gates?

Checkpoints que validam qualidade em cada fase:

| Gate | O que valida | Blocking? |
|------|--------------|-----------|
| SOURCE_QUALITY | 10+ fontes | Sim |
| VOICE_QUALITY | Vocabulário extraído | Não |
| THINKING_QUALITY | Frameworks extraídos | Não |
| SMOKE_TEST | Agent funciona | Sim |

**Blocking = para tudo se falhar**

### Posso pausar e continuar depois?

**Não diretamente.** Se você fechar o Claude Code, o processo para. Você teria que recomeçar.

**Dica:** Complete a criação em uma sessão só.

### Posso cancelar no meio?

**Sim.** Digite `*exit` ou simplesmente pare de interagir. Nenhum arquivo é salvo até o DEPLOY final.

### E se minha internet cair?

O processo para. Quando voltar, você precisará recomeçar. Os arquivos parciais não são salvos.

### Posso criar vários squads ao mesmo tempo?

**Não recomendado.** Crie um de cada vez para evitar confusão.

---

## Qualidade e Fidelidade

### O que significa "fidelidade"?

É o quanto o agent se comporta como o expert real.

| Fidelidade | Significa |
|------------|-----------|
| 50% | Genérico com alguns termos do expert |
| 70% | Usa vocabulário e frameworks principais |
| 85% | Difícil distinguir do expert real |
| 95% | Praticamente idêntico |

### Como a fidelidade é calculada?

```
Fidelidade = (tier1_ratio × 0.4) + (voice_score × 0.3) + (thinking_score × 0.3)
```

Simplificando:
- Mais fontes de qualidade = maior fidelidade
- Voice DNA completo = maior fidelidade
- Thinking DNA completo = maior fidelidade

### O que fazer se a fidelidade ficou baixa?

1. **Adicione materiais:** `*update-mind {slug} --sources ./materiais/`
2. **Forneça entrevistas:** Ajudam muito no Voice DNA
3. **Forneça livros:** Ajudam muito no Thinking DNA

### Como sei se o squad ficou bom?

1. **Veja o score:** No final da criação aparece Quality Score
2. **Rode validação:** `*validate-squad {nome}`
3. **Teste na prática:** Use o squad e veja se as respostas fazem sentido

### Posso comparar o agent com o expert real?

**Sim!** Boa prática de validação:
1. Pegue uma pergunta que o expert respondeu publicamente
2. Faça a mesma pergunta ao agent
3. Compare as respostas

### Qual fidelidade mínima aceitável?

| Uso | Fidelidade mínima |
|-----|-------------------|
| Teste/POC | 50% |
| Uso interno | 65% |
| Produção | 75% |
| Cliente final | 85% |

---

## Após a Criação

### Como uso o squad criado?

```bash
# Ativar squad inteiro
@{squad-name}  # e.g., @copy

# Ativar agent específico
@{squad-name}:{agent-name}  # e.g., @copy:gary-halbert

# Ver comandos do squad
*help
```

### O squad criado fica salvo onde?

```
squads/{nome-do-squad}/
├── agents/           # Definições dos agents
├── tasks/            # Workflows
├── templates/        # Formatos de output
├── config.yaml       # Configuração
└── README.md         # Documentação
```

### Posso usar comercialmente?

O squad em si é seu. Mas cuidado com:
- Direitos de imagem (não diga "é o Gary Halbert")
- Conteúdo gerado pode ter viés dos materiais originais

### Posso compartilhar o squad com meu time?

**Sim.** O squad é um conjunto de arquivos. Basta compartilhar a pasta.

### Posso exportar só um agent?

**Sim.** Copie o arquivo `.md` do agent:
```bash
cp squads/{squad-name}/agents/{agent-name}.md ~/meus-agents/
```

### O squad funciona offline?

**Não.** Precisa do Claude para funcionar.

---

## Manutenção e Atualização

### Como atualizo um squad existente?

```bash
# Atualizar DNA de um expert específico
*update-mind {expert_slug} --sources ./novos-materiais/

# Validar depois da atualização
*validate-squad {squad-name}
```

### Posso adicionar um expert a um squad existente?

**Sim:**
```bash
# Clonar novo expert
*clone-mind "Todd Brown" --domain copywriting

# Criar agent no squad
*create-agent {agent-name} --squad {squad-name}
```

### Posso remover um expert de um squad?

**Sim.** Delete o arquivo do agent:
```bash
rm squads/{squad-name}/agents/{agent-name}.md
```

E atualize o config.yaml se necessário.

### Posso deletar um squad inteiro?

**Sim:**
```bash
rm -rf squads/meu-squad/
```

### Como faço backup de um squad?

```bash
# Copiar pasta inteira
cp -r squads/{squad-name}/ ~/backups/{squad-name}-backup/

# Ou zipar
zip -r {squad-name}-backup.zip squads/{squad-name}/
```

### Os squads são versionados no git?

**Sim.** A pasta `squads/` faz parte do repositório.

---

## Problemas Comuns

### "Expert muito obscuro"

**Significa:** Não encontrou fontes suficientes.

**Soluções:**
1. Forneça materiais próprios
2. Escolha expert mais conhecido
3. Aceite fidelidade menor

### "Quality Gate falhou"

**Significa:** Não passou na validação.

**Soluções:**
1. Sistema tenta corrigir automaticamente
2. Se persistir, forneça mais materiais
3. Verifique se expert tem frameworks claros

### "Agent responde de forma genérica"

**Significa:** Voice DNA não foi bem aplicado.

**Soluções:**
1. `*validate-squad {nome}`
2. Adicione mais output_examples
3. Forneça mais entrevistas do expert

### "Smoke test falhou"

**Significa:** Agent não se comporta como deveria.

**Soluções:**
1. Sistema re-trabalha automaticamente
2. Revise o DNA extraído
3. Adicione mais materiais

### "Fontes insuficientes"

**Significa:** Menos de 5 fontes encontradas.

**Soluções:**
1. Forneça materiais próprios
2. Escolha expert mais documentado
3. Aceite qualidade reduzida (não recomendado)

### O processo travou sem mensagem

**Soluções:**
1. Digite `*show-context` para ver onde parou
2. Verifique se não está esperando input seu
3. Se necessário, `*exit` e recomece

### Não sei qual expert escolher

**Critérios para bons experts:**
- [ ] 3+ livros publicados
- [ ] Frameworks com nome próprio
- [ ] 10+ entrevistas públicas
- [ ] Resultados documentados
- [ ] Reconhecido por peers da área

---

## Os 3 Agentes (v3.0)

### Como funciona a arquitetura de agentes?

O Squad Creator v3.0 opera com **3 agentes especializados** que trabalham em sinergia:

```
         ┌─────────────────┐
         │  @squad-chief   │ ← Ponto de entrada
         │  (Orchestrator) │
         └────────┬────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│@oalanicolas │ ←───→ │@pedro-valerio│
│ (Tier 1)    │       │  (Tier 1)   │
└─────────────┘       └─────────────┘
```

| Agente | Papel | Ativação |
|--------|-------|----------|
| `@squad-chief` | Orquestração, triagem, criação, SOPs | `@squad-creator` |
| `@oalanicolas` | Mind cloning, DNA extraction | `@squad-creator:oalanicolas` |
| `@pedro-valerio` | Process design, veto conditions | `@squad-creator:pedro-valerio` |

### Quando usar @squad-chief?

**Use para tudo por padrão.** Ele sabe quando delegar para os outros:
- "Quero criar um squad de copywriting"
- "Extraia o SOP dessa transcrição"
- "Valide o squad legal"

Ele roteia automaticamente: se precisa DNA → @oalanicolas, se precisa artefatos → @pedro-valerio.

### Quando usar @oalanicolas?

Use **diretamente** quando o foco é exclusivamente **minds e DNA**:
- "Preciso extrair o DNA de voz desse expert"
- "As fontes que tenho são suficientes?"
- "O clone não está soando autêntico"
- "Quero calcular o fidelity score"

**Comandos exclusivos:**
- `*assess-sources` - Avaliar fontes (ouro vs bronze)
- `*extract-framework` - Extrair framework + Voice + Thinking DNA
- `*find-0.8` - Pareto ao Cubo (encontrar 0,8% genialidade)
- `*validate-extraction` - Self-validation antes do handoff

**Filosofia:** "Curadoria > Volume" / "Se entrar cocô, sai cocô"

### Quando usar @pedro-valerio?

Use **diretamente** quando o foco é **processos e artefatos**:
- "Preciso criar um workflow multi-fase"
- "Quero definir veto conditions"
- "Audite esse processo existente"
- "Crie um agent a partir desse DNA"

**Comandos exclusivos:**
- `*create-task` - Criar task a partir de insumos
- `*create-workflow` - Criar workflow multi-fase
- `*create-agent` - Criar agent a partir de DNA
- `*audit` - Auditar processo/workflow
- `*veto-check` - Verificar veto conditions

**Filosofia:** "A melhor coisa é impossibilitar caminhos errados"

### Como os 3 colaboram?

Fluxo típico de criação de squad:

```
1. USER → @squad-chief: "Quero squad de copywriting"
2. @squad-chief pesquisa elite minds
3. @squad-chief → @oalanicolas: "Clone Gary Halbert"
4. @oalanicolas extrai DNA e devolve
5. @oalanicolas → @pedro-valerio: "Crie agent com este DNA"
6. @pedro-valerio cria artefatos e devolve
7. @squad-chief integra tudo
8. SQUAD READY
```

### E se não souber qual usar?

**Sempre comece com `@squad-creator` (squad-chief).** Ele faz a triagem e delega automaticamente.

**Documentação completa:** [AGENT-COLLABORATION.md](./AGENT-COLLABORATION.md)

---

## Avançado

### Posso editar os arquivos manualmente?

**Sim**, se souber o que está fazendo:
- `agents/*.md` - Definição dos agents
- `config.yaml` - Configuração do squad
- Depois rode `*validate-squad` para verificar

### Onde ficam os logs?

Não há logs persistentes. Use `*show-context` durante a execução.

### Posso criar agent sem usar Squad Creator?

**Sim.** Crie manualmente seguindo o template:
```
squads/squad-creator/templates/agent-tmpl.md
```

Mas perderá o processo de extração de DNA.

### Como debugar problemas avançados?

1. `*validate-squad {nome}` - Validação completa
2. `*quality-dashboard {nome}` - Ver métricas
3. Ler os arquivos de DNA em `outputs/minds/{slug}/`

### Posso customizar o processo de criação?

Os workflows são configuráveis em:
```
squads/squad-creator/workflows/
```

Mas requer conhecimento do sistema AIOS.

### Qual o limite de experts por squad?

**Técnico:** Não há limite hard-coded.
**Prático:** Mais de 8-10 experts fica difícil de gerenciar.

### Posso criar squad de squad (meta-squad)?

**Não diretamente.** Mas você pode criar um orchestrator que chama múltiplos squads.

---

## Glossário

### Termos em 1 frase

| Termo | Definição |
|-------|-----------|
| **Squad** | Time de agents especializados em um domínio |
| **Mind** | Pessoa real cujo conhecimento vamos capturar |
| **Agent** | Clone digital do mind |
| **Voice DNA** | Como o expert fala/escreve |
| **Thinking DNA** | Como o expert pensa/decide |
| **Tier** | Nível de função do agent |
| **Fidelity** | % de similaridade com expert real |
| **Quality Gate** | Checkpoint de validação |
| **Smoke Test** | Teste de comportamento do agent |
| **YOLO Mode** | Execução automática sem materiais |
| **QUALITY Mode** | Execução com materiais do usuário |
| **HYBRID Mode** | Mistura de YOLO e QUALITY por expert |
| **Orchestrator** | Agent que coordena os outros |
| **Handoff** | Passagem de contexto entre agents |
| **Triangulação** | Confirmar claim com 3+ fontes |

### Comandos principais

| Comando | O que faz |
|---------|-----------|
| `@squad-creator` | Ativa o Squad Creator |
| `*create-squad` | Cria novo squad |
| `*clone-mind {name}` | Clona expert específico |
| `*validate-squad {name}` | Valida squad existente |
| `*update-mind {slug}` | Atualiza DNA existente |
| `*quality-dashboard` | Mostra métricas |
| `*help` | Lista todos os comandos |
| `*exit` | Desativa o agent |

---

## Ainda tem dúvidas?

1. **Tutorial completo:** [TUTORIAL-COMPLETO.md](./TUTORIAL-COMPLETO.md)
2. **Conceitos detalhados:** [CONCEPTS.md](./CONCEPTS.md)
3. **Colaboração entre agentes:** [AGENT-COLLABORATION.md](./AGENT-COLLABORATION.md)
4. **Problemas técnicos:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
5. **Comandos:** [COMMANDS.md](./COMMANDS.md)

---

**Squad Creator | FAQ v3.0**
*"Sem pergunta boba, só respostas úteis."*
