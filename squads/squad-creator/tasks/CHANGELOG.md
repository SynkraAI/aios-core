# Changelog - validate-squad.md

Todas as alterações notáveis no arquivo `validate-squad.md` serão documentadas aqui.

---

## [3.2.1] - 2026-02-04

### Adicionado
- **T3-DOC: Changelog separation check**
  - Verifica se tasks >= v2.0.0 têm CHANGELOG.md separado
  - Referencia HO-DP-001 do best-practices.md
  - Peso: 1 ponto no score de Documentation

---

## [3.2.0] - 2026-02-04

### Adicionado
- **T2-TOOL-001: Tool Registry Validation**
  - Valida `tool-registry.yaml` se squad usa tools/MCPs externos
  - Verifica se tools declaradas são acessíveis
  - Alerta se tools não documentadas no README

- **T3-OPT: Optimization Opportunities Check**
  - Identifica tasks Agent que poderiam ser Worker (economia de custo)
  - Referencia `executor-decision-tree.md` (Q1-Q6)
  - Fornece projeção econômica (estimativa de economia mensal)
  - Apenas informacional, não bloqueia

- **T4H-EX: Executor Decision Tree Validation** (Hybrid squads)
  - Valida campo `execution_type` nas tasks
  - Verifica aplicação correta do decision tree Q1-Q6
  - Confirma que tasks Worker têm scripts
  - Confirma que tasks Hybrid têm `human_checkpoint`
  - Valida fallback chain definido
  - Peso: 35% do score Hybrid (REQUIRED)

### Alterado
- Ajustados pesos TIER 3: 20% cada (era 25%)
- Ajustados pesos TIER 4 Hybrid para acomodar executor validation
- Atualizada tabela Quick Reference com novos componentes
- Adicionadas referências a `executor-decision-tree.md`, `tool-registry.yaml`, `optimize.md`

---

## [3.1.0] - 2026-02-02

### Corrigido
- Minor fixes e clarificações

---

## [3.0.0] - 2026-02-01

### Adicionado
- Detecção de tipo de squad (Expert/Pipeline/Hybrid)
- Sistema de validação em 4 tiers
- Prompt quality, pipeline coherence, checklist actionability checks
- Coverage ratio checks
- Type-specific veto conditions

### Alterado
- `voice_dna`/`objection_algorithms` agora são contextuais (não obrigatórios para todos)
- Alinhamento com `squad-checklist.md` v3.0

---

## [2.0.0] - 2026-01-15

### Alterado
- Abordagem de validação qualitativa
- Checks baseados em princípios

---

## [1.0.0] - 2025-12-01

### Adicionado
- Task inicial de validação
