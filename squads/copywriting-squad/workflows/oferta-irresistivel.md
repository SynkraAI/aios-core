# Workflow: Oferta Irresistível

## Metadados
```yaml
id: oferta-irresistivel
versao: 1.1.0
duracao: 4-6 horas
complexidade: alta
output: Oferta estruturada que faz cliente se sentir estúpido se recusar
dependencies:
  optional_pre: []
  feeds_into:
    - vsl-matador.md (Grand Slam Offer reutilizavel na Fase 3)
    - lancamento-completo.md (Passo 2 pode ser pulado se oferta ja existe)
    - webinar-que-vende.md (oferta integrada ao pitch)
  checklists:
    - sugarman-31-triggers.md
```

---

## VISAO GERAL

Criar uma Grand Slam Offer usando o método Hormozi: oferta tão boa que o preço se torna irrelevante.

**Resultado esperado:** Stack de valor completo + garantia + posicionamento de preço.

---

## FRAMEWORK 9 PASSOS

### PASSO 1: INPUT
**O que entra:**
- Produto/serviço atual (pode ser básico)
- Conhecimento/expertise disponível
- Recursos que pode criar
- Público-alvo
- Concorrentes e seus preços
- Capacidade de entrega

### PASSO 2: INPUT VALUE
```yaml
produto_base:
  nome: ""
  formato: "curso|mentoria|servico|software|fisico"
  entrega_atual: []
  tempo_resultado: ""

expertise:
  conhecimentos: []
  ferramentas_que_domina: []
  resultados_proprios: []
  resultados_clientes: []

mercado:
  preco_concorrentes: ""
  gaps_concorrentes: []
  reclamacoes_comuns: []

capacidade:
  pode_criar: []
  pode_entregar: []
  limitacoes: []
```

### PASSO 3: PRE-CHECKLIST
- [ ] Tem expertise real no assunto?
- [ ] Consegue entregar resultado?
- [ ] Conhece os concorrentes?
- [ ] Sabe o que o público quer?
- [ ] Tem capacidade de criar novos componentes?

### PASSO 4: PERSONA/EXECUTOR

| Fase | Clone | Função |
|------|-------|--------|
| 1. Dream Outcome | @alex-hormozi | Identificar resultado dos sonhos |
| 2. Obstáculos | @dan-kennedy | Mapear todas as objeções |
| 3. Mecanismo | @todd-brown | Criar diferenciação |
| 4. Stack | @alex-hormozi | Montar componentes |
| 5. Garantia | @alex-hormozi | Criar reversão de risco |
| 6. Naming | @todd-brown | Nomear tudo |
| 7. Pricing | @alex-hormozi | Posicionar preço |

### PASSO 5: PROMPT DE EXECUÇÃO

---

#### FASE 1: Dream Outcome (30 min)
**Clone:** @alex-hormozi

**Executar:**

1. **Identificar o que o cliente REALMENTE quer:**
   - Não é o curso/mentoria/produto
   - É o RESULTADO que isso gera
   - É como ele vai SE SENTIR

2. **Perguntas para encontrar:**
   - Se pudesse acordar amanhã com um resultado mágico, qual seria?
   - O que ele conta pros amigos quando dá certo?
   - O que ele evita contar que quer?
   - Qual o status que ele busca?

3. **Formatar Dream Outcome:**
   ```
   "[AVATAR] consegue [RESULTADO ESPECÍFICO] em [TEMPO]
   sem [MAIOR OBSTÁCULO] e finalmente [DESEJO EMOCIONAL]"
   ```

**Output:** Dream Outcome documentado

---

#### FASE 2: Mapeamento de Obstáculos (45 min)
**Clone:** @dan-kennedy

**Listar TODOS os obstáculos entre o cliente e o Dream Outcome:**

**Categorias:**
1. **Obstáculos de CONHECIMENTO**
   - O que não sabe fazer?
   - O que não sabe que não sabe?

2. **Obstáculos de HABILIDADE**
   - O que sabe mas não consegue executar?
   - O que demora muito para fazer?

3. **Obstáculos de FERRAMENTA**
   - O que precisa e não tem?
   - O que tem mas é ruim/incompleto?

4. **Obstáculos de TEMPO**
   - O que demora demais?
   - O que compete pelo tempo dele?

5. **Obstáculos de CRENÇA**
   - O que acha que não funciona?
   - O que acha que não é pra ele?

6. **Obstáculos de SUPORTE**
   - Onde trava sem ajuda?
   - Onde precisa de feedback?

**Para cada obstáculo, listar:**
- Descrição
- Impacto (alto/médio/baixo)
- Solução possível

**Output:** Lista de 15-30 obstáculos categorizados

---

#### FASE 3: Mecanismo Único (30 min)
**Clone:** @todd-brown

**Criar diferenciação:**

1. **Por que outras soluções falham?**
   - Listar 3-5 razões

2. **O que sua solução faz diferente?**
   - Qual o "segredo" ou "descoberta"?
   - Qual o processo único?

3. **Nomear o mecanismo:**
   - Método [NOME]
   - Sistema [NOME]
   - Framework [NOME]
   - Protocolo [NOME]

**Fórmula:**
```
"Enquanto [concorrentes] focam em [abordagem comum],
o [NOME DO MÉTODO] ataca [causa raiz real] através de
[processo único], por isso [resultado diferente]."
```

**Output:** Unique Mechanism nomeado e explicado

---

#### FASE 4: Montar Stack de Valor (1-2h)
**Clone:** @alex-hormozi

**Para CADA obstáculo, criar uma SOLUÇÃO:**

**Estrutura por componente:**
```yaml
componente:
  nome_sexy: "" # Nome atraente, não genérico
  obstaculo_que_resolve: ""
  formato: "video|template|ferramenta|acesso|suporte|comunidade"
  entregavel: ""
  valor_standalone: "" # Quanto valeria se vendesse separado
  tempo_para_criar: ""
```

**Tipos de componentes:**

1. **CORE (Entrega Principal)**
   - O que resolve o problema principal
   - Ex: "Curso completo", "Mentoria", "Software"

2. **ACELERADORES**
   - Diminuem tempo até resultado
   - Ex: Templates prontos, Scripts, Checklists

3. **FACILITADORES**
   - Diminuem esforço necessário
   - Ex: Ferramentas, Automações, Suporte

4. **AMPLIFICADORES**
   - Aumentam resultado
   - Ex: Comunidade, Calls extras, Atualizações

5. **REDUTORES DE RISCO**
   - Aumentam confiança
   - Ex: Garantias, Suporte prioritário

**Regra:** Cada obstáculo vira um componente nomeado.

**Output:** Stack com 8-15 componentes valorados

---

#### FASE 5: Estruturar Garantias (30 min)
**Clone:** @alex-hormozi

**Criar camadas de garantia:**

**1. Garantia Incondicional (básica)**
```
"Se em [X] dias você não estiver satisfeito por QUALQUER motivo,
devolvemos 100% do seu investimento. Sem perguntas."
```

**2. Garantia de Resultado (mais forte)**
```
"Se você [fazer as ações específicas] e não conseguir
[resultado mínimo específico] em [tempo], devolvemos tudo."
```

**3. Garantia Reversa (ainda mais forte)**
```
"Se não [resultado], devolvemos seu dinheiro E você fica
com [bônus específico] como pedido de desculpas."
```

**4. Anti-Garantia (para escassez)**
```
"Esta oferta é tão boa que NÃO oferecemos garantia.
Se você precisa de garantia para decidir, não é pra você.
Queremos apenas pessoas comprometidas."
```

**Escolher 1-2 garantias baseado em:**
- Confiança no produto
- Margem disponível
- Tipo de público

**Output:** Garantias estruturadas com copy

---

#### FASE 6: Naming de Tudo (30 min)
**Clone:** @todd-brown

**Nomear cada componente com nome sexy:**

**Fórmulas de naming:**
1. **[Resultado] + [Prazo]**
   - "Plano 30 Dias para 6 Dígitos"

2. **O/A + [Adjetivo] + [Substantivo]**
   - "O Acelerador Supremo"

3. **[Número] + [Benefício]**
   - "7 Templates Prontos"

4. **[Verbo] + [Objeto]**
   - "Destrave Vendas"

5. **[Framework famoso] + [Seu twist]**
   - "Método AIDA 2.0"

**Revisar:**
- Nome do programa principal
- Nome de cada módulo/componente
- Nome de cada bônus
- Nome da garantia

**Output:** Lista de todos os nomes

---

#### FASE 7: Posicionamento de Preço (30 min)
**Clone:** @alex-hormozi

**Estruturar apresentação de preço:**

**1. Ancoragem Alta**
```
Valor total de tudo que está incluso: R$ [soma de todos os valores]
```

**2. Comparação**
```
Quanto você pagaria para [resultado do dream outcome]?
Se um consultor cobrasse R$[X]/hora, isso custaria R$[Y]
```

**3. Stack Visual**
```
Componente 1: [Nome sexy] .............. Valor: R$X
Componente 2: [Nome sexy] .............. Valor: R$Y
Componente 3: [Nome sexy] .............. Valor: R$Z
Bônus 1: [Nome sexy] ................... Valor: R$W
Bônus 2: [Nome sexy] ................... Valor: R$V
Garantia: [Nome] ....................... Valor: Inestimável
------------------------------------------------
VALOR TOTAL: R$ [soma alta]
HOJE APENAS: R$ [preço real]
```

**4. Justificativa**
```
"Por que tão barato? Porque [razão genuína - lançamento,
beta testers, construir cases, etc.]"
```

**Output:** Script de apresentação de preço

---

### PASSO 6: TOOLS/SCRIPTS
- Clone @alex-hormozi (principal)
- Clone @dan-kennedy (objeções)
- Clone @todd-brown (naming/mecanismo)
- Template de Stack de Valor
- Template de Garantias

### PASSO 7: OUTPUT
```yaml
entregaveis:
  - dream_outcome.md
  - mapa_obstaculos.md
  - unique_mechanism.md
  - stack_valor_completo.md
  - garantias.md
  - script_preco.md
  - naming_completo.md

stack_final:
  componentes_core: []
  aceleradores: []
  facilitadores: []
  bonus: []
  garantia: ""
  preco_total_ancoragem: ""
  preco_real: ""
```

### PASSO 8: POS-CHECKLIST
- [ ] Dream Outcome é específico e emocional?
- [ ] Todos os obstáculos principais têm solução?
- [ ] Unique Mechanism está claro?
- [ ] Stack tem 8+ componentes?
- [ ] Tudo tem nome sexy (não genérico)?
- [ ] Garantia remove risco?
- [ ] Preço parece "óbvio" (valor >> preço)?

### PASSO 9: OUTPUT FINAL
**Oferta completa:**
- Dream Outcome definido
- 15-30 obstáculos mapeados
- Mecanismo único nomeado
- Stack de 8-15 componentes com valores
- Garantia estruturada
- Script de apresentação de preço
- Tudo nomeado com nomes sexy

---

## FORMULA DO "STUPID NO"

Sua oferta está boa quando:

```
Se alguém recusar, você pensa:
"Essa pessoa é burra ou não precisa disso"

Se a resposta for "burra", oferta está boa.
Se a resposta for "não precisa", qualificação está errada.
```

---

## EXEMPLO DE STACK

```
PROGRAMA: "Máquina de Vendas 90 Dias"

CORE:
- Mentoria em Grupo (12 semanas) ........ R$ 12.000
- Biblioteca de Aulas ................... R$ 3.000

ACELERADORES:
- 47 Templates Prontos .................. R$ 2.000
- Scripts de Venda Validados ............ R$ 1.500

FACILITADORES:
- Ferramenta de Funil Incluída (1 ano) .. R$ 2.400
- Suporte WhatsApp Prioritário .......... R$ 3.000

BONUS:
- 2 Calls Individuais ................... R$ 4.000
- Acesso Comunidade VIP (lifetime) ...... R$ 5.000
- Próximo Lançamento Grátis ............. R$ 3.000

GARANTIA:
- 30 dias incondicional + ROI garantido

VALOR TOTAL: R$ 35.900
INVESTIMENTO HOJE: R$ 4.997 (ou 12x R$ 497)
```

---

## CHECKPOINTS

| Checkpoint | Após | Critério de Aprovação | Ação se Falhar |
|------------|------|----------------------|----------------|
| CP-1 | Fase 1 | Dream Outcome documentado com resultado específico + componente emocional | Voltar para Fase 1 — dream outcome vago ou puramente lógico |
| CP-2 | Fase 2 | Mínimo 15 obstáculos categorizados (conhecimento, habilidade, ferramenta, tempo, crença, suporte) | Voltar para Fase 2 — obstáculos insuficientes ou sem categorização |
| CP-3 | Fase 3 | Unique Mechanism nomeado com fórmula "enquanto X, nós Y" explicada | Voltar para Fase 3 — mecanismo genérico ou sem nome |
| CP-4 | Fase 4 | Stack com 8+ componentes (core + aceleradores + facilitadores + amplificadores) cada um com valor standalone | Voltar para Fase 4 — componentes insuficientes ou sem valor atribuído |
| CP-5 | Fase 5 | Pelo menos 1 garantia estruturada com copy pronto | Voltar para Fase 5 — garantia ausente ou fraca |
| CP-6 | Fase 6 | Todos os componentes, bônus e garantia com nomes sexys (zero nomes genéricos) | Voltar para Fase 6 — renomear itens genéricos |
| CP-7 | Fase 7 | Script de preço com ancoragem alta + stack visual + justificativa | Voltar para Fase 7 — apresentação de preço sem ancoragem |
| CP-FINAL | Passo 8 | Pós-checklist 100% + teste do "Stupid No" passa | Revisar fases com falhas |

---

## VETO CONDITIONS

Condições que PARAM o workflow imediatamente:

| ID | Condição | Severidade | Ação |
|----|----------|-----------|------|
| VT-1 | Valor percebido do stack é menor que 3x o preço pedido | BLOCKING | PARAR — adicionar componentes ou reestruturar valor |
| VT-2 | Oferta não tem garantia (risco 100% no cliente) | BLOCKING | PARAR — criar pelo menos garantia incondicional |
| VT-3 | Obstáculos mapeados não correspondem a componentes do stack (gaps de solução) | HIGH | PAUSAR — criar componentes para obstáculos sem cobertura |
| VT-4 | Dream Outcome é igual ao do concorrente (sem diferenciação) | HIGH | PAUSAR — refazer Fase 1 + Fase 3 com Unique Mechanism |

---

## FAILURE/REWORK

| Cenário | Ação | Max Iterações |
|---------|------|---------------|
| Checkpoint falhou | Retornar à fase anterior, refazer com feedback | 2 |
| Veto triggered | STOP completo, resolver condição antes de continuar | 1 |
| Stack abaixo de 8 componentes | Chamar @dan-kennedy para mapear obstáculos adicionais + @alex-hormozi para criar soluções | 1 |

---

**Versão:** 1.0.0
**Criado por:** @pedro-valerio (Framework 9 Passos)
