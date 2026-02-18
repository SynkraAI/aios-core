# Template: Bullets e Fascinations

```yaml
template_id: bullets-fascinations-tmpl
template_name: "Bullets e Fascinations de Copy"
version: 1.0.0
output_format: markdown
use_with_clones:
  primary: "@gary-bencivenga"
  support: "@eugene-schwartz (headlines), @clayton-makepeace (emocao)"
  audit: "@claude-hopkins"
```

## Quando Usar

- Secao de bullets em sales page
- Bullets para email marketing
- Fascinations para ads ou landing pages
- Headlines derivadas de bullets
- Qualquer lista de beneficios persuasiva

---

## O QUE SAO BULLETS/FASCINATIONS

Bullets sao mini-headlines que vendem beneficios individuais criando curiosidade irresistivel. O leitor NAO consegue resistir a querer saber a resposta. Cada bullet deve funcionar como uma "mini sales letter" autonoma.

---

## 12 FORMATOS DE BULLET

### 1. Segredo
```
O segredo de [grupo de sucesso] para [resultado desejado]
(e por que [grupo comum] nunca descobre)
```
**Exemplo:** "O segredo dos copywriters que cobram R$50k+ por sales letter (e por que agencias nunca vao te contar)"

### 2. Como
```
Como [fazer X] sem [sacrificio/dor Y]
— mesmo que [objecao comum]
```
**Exemplo:** "Como escrever headlines que convertem sem ser apelativo — mesmo que voce nunca tenha escrito copy antes"

### 3. Por Que
```
Por que [crenca popular] esta te sabotando
— e o que fazer em vez disso
```
**Exemplo:** "Por que 'testar mais variacoes' esta destruindo seu ROI — e a unica metrica que realmente importa"

### 4. Numero Especifico
```
[Numero] maneira(s) comprovada(s) de [resultado]
(a #[N] vai te surpreender)
```
**Exemplo:** "7 maneiras comprovadas de aumentar open rate acima de 40% (a #5 vai te surpreender)"

### 5. Pergunta
```
Voce sabia que [fato surpreendente]?
(Se nao, pode estar [consequencia negativa])
```
**Exemplo:** "Voce sabia que 83% dos VSLs falham nos primeiros 7 segundos? (Se nao, pode estar queimando milhares em ads)"

### 6. Advertencia
```
CUIDADO: [erro comum que parece certo]
— a maioria so descobre tarde demais
```
**Exemplo:** "CUIDADO: A formula de headline que 90% dos cursos ensinam pode estar matando sua conversao — a maioria so descobre depois de gastar R$10k em ads"

### 7. Se/Entao
```
Se voce [situacao do avatar],
entao [promessa especifica] — [prazo]
```
**Exemplo:** "Se voce tem uma lista de email com mais de 1.000 subscribers, entao pode gerar R$10k extras esse mes — sem criar produto novo"

### 8. Coisa #1
```
A coisa #1 que [experts/top performers] fazem diferente
— e que [grupo comum] ignora completamente
```
**Exemplo:** "A coisa #1 que copywriters de 7 digitos fazem antes de escrever qualquer palavra — e que 95% dos iniciantes ignora completamente"

### 9. Erro Fatal
```
O erro fatal que [avatar] comete com [acao]
— e como corrigir em [tempo curto]
```
**Exemplo:** "O erro fatal que donos de e-commerce cometem ao escrever descricoes de produto — e como corrigir em 15 minutos"

### 10. Contraintuitivo
```
Por que [acao contra-intuitiva] gera [resultado desejado]
— (sim, o oposto do que te ensinaram)
```
**Exemplo:** "Por que escrever emails mais CURTOS gera mais vendas do que emails longos — (sim, o oposto do que te ensinaram)"

### 11. Historia
```
Como [pessoa real] foi de [situacao ruim] para [resultado]
usando apenas [metodo simples]
```
**Exemplo:** "Como um professor de escola publica foi de R$3k/mes para R$47k/mes usando apenas emails diarios de 15 minutos"

### 12. Proibido
```
A tecnica "proibida" de [resultado] que [autoridade] usou
— e por que [grupo] nao quer que voce saiba
```
**Exemplo:** "A tecnica 'proibida' de precificacao que a Apple usa — e por que seu concorrente nao quer que voce saiba"

---

## REGRAS DE QUALIDADE

### Cada bullet DEVE ter:
- **Especificidade**: Numeros, nomes, detalhes concretos
- **Curiosidade**: Leitor precisa QUERER saber a resposta
- **Beneficio**: Resultado claro para o leitor
- **Credibilidade**: Nao ser tao exagerado que pareca mentira

### Cada bullet NÃO DEVE:
- Revelar a resposta (bullet mata a curiosidade se revela)
- Ser generico ("Aprenda a vender mais" — generico demais)
- Prometer o impossivel ("Fique milionario em 7 dias")
- Ser longo demais (max 2-3 linhas)

---

## PROCESSO DE CRIACAO

### Passo 1: Gerar Volume
Escrever 30-50 bullets usando os 12 formatos acima.
Nao editar durante a geracao — quantidade primeiro.

### Passo 2: Selecionar Top 15-25
Classificar por forca: "Eu clicaria/leria isso?"
Se a resposta nao for SIM imediato, cortar.

### Passo 3: Ordenar por Impacto
Colocar os 3-5 mais fortes no topo e no final da lista.
Meio da lista = bullets solidos mas nao os melhores.

### Passo 4: Injetar Triggers
Aplicar Sugarman triggers nos top bullets:
- Trigger 5 (Curiosidade)
- Trigger 13 (Consistencia)
- Trigger 17 (Especificidade)
- Trigger 20 (Exclusividade)

### Passo 5: Audit Final
Passar por @claude-hopkins:
- Algum bullet revela a resposta? → Reescrever
- Algum bullet e generico? → Adicionar especificidade
- Algum bullet e inacreditavel? → Moderar ou adicionar prova

---

## OUTPUT ESPERADO

```markdown
## [Titulo da secao: ex "O que voce vai descobrir:"]

- O segredo de [X] para [resultado]...
- Como [fazer Y] sem [sacrificio]...
- [Numero] maneiras comprovadas de [Z]...
- Por que [crenca] esta te sabotando...
- A coisa #1 que [experts] fazem diferente...
[... 15-25 bullets total]
```

---

## CHECKLIST PRE-ENTREGA

- [ ] 15+ bullets criados
- [ ] Variedade de formatos (minimo 5 formatos diferentes)
- [ ] Especificidade em cada bullet (numeros, detalhes)
- [ ] Nenhum bullet revela a resposta
- [ ] Top 3-5 bullets no inicio e final da lista
- [ ] Triggers de Sugarman aplicados nos top bullets
- [ ] Nenhuma promessa inacreditavel sem prova
- [ ] Audit Hopkins executado

---

## VALIDATION RULES

```yaml
validation_rules:
  min_sections: 15

  required_elements:
    - minimo_15_bullets
    - variedade_formatos
    - especificidade_cada_bullet
    - curiosidade_sem_revelar
    - top_bullets_inicio_final
    - triggers_sugarman_aplicados

  quality_checks:
    - name: quantidade_minima_15
      rule: "Minimo 15 bullets criados (ideal 20-25 para sales page)"
      severity: CRITICAL

    - name: variedade_formatos_minimo_5
      rule: "Minimo 5 formatos diferentes usados (dos 12 disponiveis)"
      severity: HIGH

    - name: especificidade_numeros_detalhes
      rule: "Cada bullet deve ter especificidade: numeros, nomes, detalhes concretos"
      severity: HIGH

    - name: curiosidade_gap_presente
      rule: "Cada bullet deve criar curiosidade irresistivel (leitor QUER saber a resposta)"
      severity: CRITICAL

    - name: nenhum_bullet_revela_resposta
      rule: "Nenhum bullet pode revelar a resposta (mata curiosidade)"
      severity: CRITICAL

    - name: nao_generico
      rule: "Nenhum bullet generico ('Aprenda a vender mais' — muito vago)"
      severity: HIGH

    - name: nao_inacreditavel_sem_prova
      rule: "Nenhuma promessa inacreditavel sem prova ('Fique milionario em 7 dias')"
      severity: HIGH

    - name: tamanho_max_2_3_linhas
      rule: "Cada bullet max 2-3 linhas (bullets longos perdem impacto)"
      severity: MEDIUM

    - name: top_bullets_posicionamento
      rule: "Top 3-5 bullets mais fortes no inicio e final da lista"
      severity: MEDIUM

    - name: triggers_sugarman_top_bullets
      rule: "Triggers de Sugarman aplicados nos top bullets (5-Curiosidade, 13-Consistencia, 17-Especificidade, 20-Exclusividade)"
      severity: MEDIUM

    - name: power_words_presente
      rule: "Power words presentes: 'segredo', 'descobri', 'nunca', 'comprovado', 'garantido'"
      severity: MEDIUM

  word_count:
    min: 600
    max: 2000
    ideal: "800-1200 (15-25 bullets × 40-60 palavras/bullet)"

  veto_conditions:
    - condition: "Menos de 15 bullets criados"
      reason: "15 bullets e o minimo para persuasao — menos que isso nao gera volume suficiente"

    - condition: "Qualquer bullet revela a resposta ou solucao completa"
      reason: "Bullet que revela mata curiosidade — deve criar gap, nao preenche-lo"

    - condition: "Menos de 3 formatos diferentes usados"
      reason: "Variedade de formatos mantem interesse — bullets monotonos perdem leitura"

    - condition: "Bullets genericos sem especificidade (sem numeros, detalhes, nomes)"
      reason: "Especificidade gera credibilidade — bullets genericos nao convencem"

    - condition: "Promessa inacreditavel sem prova ou moderacao"
      reason: "Bullets exagerados destroem credibilidade — deve ser ousado mas crivel"

    - condition: "Top bullets (3-5 mais fortes) nao posicionados em inicio/final"
      reason: "Posicionamento estrategico maximiza impacto — top bullets devem abrir e fechar"

    - condition: "Nenhum Sugarman trigger aplicado nos top bullets"
      reason: "Triggers psicologicos amplificam persuasao — obrigatorios nos top bullets"

    - condition: "Bullets com mais de 4 linhas de texto"
      reason: "Bullets longos perdem impacto visual — max 2-3 linhas por bullet"
```

---

_Template Version: 1.0.0_
_Squad: copywriting-squad_
