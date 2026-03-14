# Checklist: Qualidade dos Dados

> Use após cada atualização de KB para garantir qualidade

## Por Arquivo

### Estrutura (BLOQUEADOR)
- [ ] Tem header com título e descrição
- [ ] Tem rodapé com versão, data e fonte
- [ ] Formato consistente (tabelas, headers, exemplos)
- [ ] Sem placeholder text ("TODO", "pedir ao team", "TBD")

### Conteúdo (QUALIDADE)
- [ ] Dados têm fonte rastreável (quem disse, quando)
- [ ] Números são específicos (não "muitos", "vários", "100+")
- [ ] Exemplos são concretos (não genéricos)
- [ ] Scripts são copy-paste ready (vendedor pode usar direto)
- [ ] Red flags têm nível de gravidade (BLOQUEADOR, ALERTA, NOTA)
- [ ] Objeções têm resposta completa (não só "veja o playbook")

### Cross-references (INTEGRIDADE)
- [ ] Cases mencionados em outros arquivos existem no `ensinio-cases.md`
- [ ] Preços citados batem com `ensinio-pricing.md`
- [ ] ICP negativo alinha com `ensinio-red-flags.md`
- [ ] Concorrentes citados existem no `ensinio-competitors.md`

### Atualidade (FRESHNESS)
- [ ] Data de última atualização < 30 dias
- [ ] "Perguntas Pendentes" revisadas (resolvidas ou confirmadas como pendentes)
- [ ] Features marcadas "em breve" verificadas contra roadmap atual

## Score de Qualidade

| Critério | Peso | Score (0-3) |
|----------|------|-------------|
| Estrutura | 20% | |
| Conteúdo | 40% | |
| Cross-references | 20% | |
| Atualidade | 20% | |

**Score total:** ___ / 3.0
- **> 2.5:** PASS
- **2.0-2.5:** PASS com notas
- **< 2.0:** FAIL (requer update-kb)

---

**Criado:** 2026-03-13
