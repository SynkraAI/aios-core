# Analyzer Module

> Instruções para geração de análise IA. Produz análises per-project e análise global.

---

## 1. Análise Per-Project

Gerada no campo `📋 Análise:` de cada projeto. Executada em TODO `/tdah-checklist` e `/tdah-checklist status`.

### Regras

- **Máximo 2 frases.** Se precisa de mais, está verboso demais.
- **Ser específico, não genérico.** "Pipeline ativo com 4 leads quentes" > "Continue trabalhando neste projeto."
- **Identificar bloqueios.** Se algo trava o projeto, dizer o que é e como destravá-lo.
- **Sugerir próxima ação concreta.** "Rodar smoke test" > "Avançar no projeto."
- **Se não há o que dizer, escrever `—`.** Silêncio > ruído.

### Template Mental

```
[Estado em 1 frase]. [Bloqueio ou oportunidade + ação sugerida].
```

### Exemplos Bons

- "Pipeline ativo com momentum real. Cada dia parado é lead perdido."
- "Bloqueado em review externo. Pingar o maintainer se > 5 dias."
- "100% pronto. Confirmar como done pra liberar carga mental."
- "Depende do luizfosc-brand. Estacionar até o Design System avançar."

### Exemplos Ruins (NUNCA fazer)

- "Este projeto está progredindo bem." (genérico, inútil)
- "Considere avaliar as próximas etapas." (vago)
- "O projeto precisa de atenção." (qual atenção? pra quê?)

---

## 2. Análise Global

Gerada no bloco `# 🧠 Análise Global (IA)` no topo do arquivo. Executada APENAS no `/tdah-checklist status`.

### Estrutura

```markdown
# 🧠 Análise Global (IA)

> _Gerada em YYYY-MM-DD HH:MM_
>
> [Parágrafo 1: Panorama — quantos projetos, quantos urgentes, situação geral]
>
> **🎯 Foco do dia:** [1 projeto + justificativa curta]
> **🧹 Liberar carga mental:** [ação rápida que tira peso — ex: confirmar algo como done]
> **⏸️ Estacionar:** [projetos que podem esperar sem consequência]
```

### Regras

- **Máximo 1 parágrafo de contexto + 3 bullets de ação.**
- **O "Foco do dia" é sempre 1 projeto.** Para TDAH, escolher é mais valioso que listar.
- **"Liberar carga mental" é ação de < 5 minutos** que remove algo da cabeça.
- **"Estacionar" lista projetos que NÃO devem competir por atenção agora.**
- **Considerar dependências entre projetos.** Se A depende de B, sugerir focar em B primeiro.
- **Considerar bloqueios externos.** Se um projeto está travado esperando alguém, reconhecer isso e sugerir alternativa.

### Heurísticas de Priorização

| Fator | Peso | Lógica |
|-------|------|--------|
| Momentum ativo | Alto | Projeto com commits recentes e pipeline ativo — não perder ritmo |
| Impacto em receita | Alto | Gera resultado direto (vendas, leads, entregas) |
| Bloqueio externo | Reduz prioridade | Não adianta focar se depende de terceiro |
| Dependência de outro projeto | Médio | Se A desbloqueia B+C, priorizar A |
| Tudo feito (100%) | Ação rápida | Confirmar done = ganho cognitivo gratuito |
| Sem atividade > 14 dias | Baixo | Considerar se ainda faz sentido manter no radar |

---

## 3. Sugestões de Delegação

Gerada no campo `💡 Delegação:` de cada projeto. Formato: sugestão, não ordem.

### Regras

- Sempre começar com "Considerar delegar..." — é sugestão, não decisão
- Se não há nada delegável, escrever `—`
- Identificar a TAREFA específica delegável, não o projeto inteiro
- Sugerir o PAPEL de quem pode fazer (não nome de pessoa)

### Referência

Ver `references/delegation-patterns.md` para lista de padrões delegáveis.
