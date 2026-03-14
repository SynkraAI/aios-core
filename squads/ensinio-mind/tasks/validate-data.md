# Task: Validar Consistência dos Dados

> Auditoria de consistência entre os 14 data files do ensinio-mind

## Quando usar
- Após atualização do KB (task: update-kb)
- Periodicamente (sugestão: a cada 2 semanas)
- Quando um vendedor reportar informação incorreta

## Checklist de Validação

### 1. Pricing (cross-check)
- [ ] `ensinio-pricing.md` vs `ensinio-product-ecosystem.md`: planos e valores batem?
- [ ] `ensinio-pricing.md` vs `ensinio-sales-playbook.md`: valores mencionados nas respostas batem?
- [ ] `ensinio-pricing.md` vs `ensinio-arguments.md`: economia citada está atualizada?

### 2. Cases (cross-check)
- [ ] `ensinio-cases.md` vs `ensinio-arguments.md`: cases citados existem?
- [ ] `ensinio-cases.md` vs `ensinio-sales-playbook.md`: depoimentos citados existem?
- [ ] `ensinio-cases.md`: métricas de tração atualizadas?

### 3. ICP vs Red Flags (coerência)
- [ ] `ensinio-icps.md` ICP negativo alinha com `ensinio-red-flags.md`?
- [ ] Nichos que mais compram estão atualizados?
- [ ] Faturamento mínimo consistente entre os 2 arquivos?

### 4. Sales Cycle vs Playbook (coerência)
- [ ] `ensinio-sales-cycle.md` etapas mencionam objeções do `ensinio-sales-playbook.md`?
- [ ] Follow-up sequence é consistente entre os 2 arquivos?
- [ ] Equipe comercial (nomes, papéis) está atualizada?

### 5. Competidores (atualização)
- [ ] `ensinio-competitors.md` matriz de features atualizada?
- [ ] Concorrentes listados ainda são relevantes?
- [ ] Novos concorrentes surgiram?

### 6. Dados Desatualizados
- [ ] Algum arquivo tem "Perguntas Pendentes" com mais de 30 dias?
- [ ] Algum dado marcado como "em breve" já foi lançado?
- [ ] Algum placeholder ("pedir ao team") ainda não foi resolvido?

## Output
- Lista de inconsistências encontradas (se houver)
- Sugestão de correção para cada inconsistência
- Status: PASS (0 inconsistências) ou FAIL (N inconsistências)

## Veto Conditions
- **NUNCA** corrigir inconsistência sem verificar qual é a fonte correta
- **NUNCA** assumir que o dado mais recente é o correto (pode ser erro)

---

**Criado:** 2026-03-13 | **Tipo:** Validação
