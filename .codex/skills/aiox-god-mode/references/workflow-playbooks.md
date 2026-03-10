# Playbooks de Workflow — Guias Passo a Passo

## 1. Ciclo de Desenvolvimento de História (SDC) — PRINCIPAL
Fluxo padrão: `@sm` (Criar) → `@po` (Validar) → `@dev` (Implementar) → `@qa` (Revisar) → `@devops` (Enviar)

## 2. QA Loop — REVISÃO ITERATIVA
Usado quando bugs são encontrados: `@qa` ↔ `@dev` (máximo 5 iterações).

## 3. Spec Pipeline — PRÉ-IMPLEMENTAÇÃO
Roteamento baseado em complexidade: `@pm` → `@architect` → `@analyst` → `@qa`.

## 4. Descoberta Brownfield — AVALIAÇÃO DE LEGADO
Avaliação de 10 fases para projetos existentes.
- Fases 1-3: Coleta de dados
- Fases 4-7: Rascunho e Validação
- Fases 8-10: Finalização
