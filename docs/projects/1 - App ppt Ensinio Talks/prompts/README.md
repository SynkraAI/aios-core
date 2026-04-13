# 📋 Prompts — Referência Rápida

Todos os prompts prontos pra colar no AI Studio. Cada arquivo tem o bloco marcado com:

```
════════════════════════════════════════════════════════════
          COPIAR A PARTIR DAQUI ⬇
════════════════════════════════════════════════════════════

[prompt aqui]

════════════════════════════════════════════════════════════
          FIM DO BLOCO DE CÓPIA ⬆
════════════════════════════════════════════════════════════
```

Copie tudo entre os banners e cole no AI Studio.

---

## 🏗️ Fase 1 — Scaffold + Tokens

| Arquivo | Objetivo |
|---------|----------|
| [`fase-1-scaffold.md`](./fase-1-scaffold.md) | Gera o esqueleto vazio do app **com sistema de design tokens centralizado** |
| [`fase-1b-audit-tokens.md`](./fase-1b-audit-tokens.md) | ⚠️ **CRÍTICO** — Audita o scaffold em busca de hardcodes que escaparam aos tokens |

---

## 📝 Fase 2 — Conteúdo (ordem recomendada)

| # | Arquivo | Ato | Ordem de execução |
|---|---------|-----|-------------------|
| 1 | [`fase-2-ato-1-abertura.md`](./fase-2-ato-1-abertura.md) | Abertura & Hook | 1º |
| 2 | [`fase-2-ato-5-processos.md`](./fase-2-ato-5-processos.md) | Processos | 2º |
| 3 | [`fase-2-ato-4-hierarquia.md`](./fase-2-ato-4-hierarquia.md) | Hierarquia | 3º |
| 4 | [`fase-2-ato-7-forge.md`](./fase-2-ato-7-forge.md) | FORGE | 4º |
| 5 | [`fase-2-ato-3-framework.md`](./fase-2-ato-3-framework.md) | Framework | 5º |
| 6 | [`fase-2-ato-2-mao-na-massa.md`](./fase-2-ato-2-mao-na-massa.md) | Mão na Massa | 6º |
| 7 | [`fase-2-ato-6-qualidade.md`](./fase-2-ato-6-qualidade.md) | Qualidade | 7º |
| 8 | [`fase-2-ato-8-encerramento.md`](./fase-2-ato-8-encerramento.md) | Encerramento | 8º |

---

## 🎨 Fase 3 — Diagramas

Está no guia principal: [`../GUIA-PASSO-A-PASSO.md`](../GUIA-PASSO-A-PASSO.md#-fase-3--diagramas-1-2h)

---

## ⚠️ Importante

**Os prompts da Fase 2 NÃO contêm o conteúdo do roteiro.** Cada um tem um placeholder:

```
===== COLE AQUI O CONTEÚDO DO ATO X =====
[placeholder]
===== FIM DO CONTEÚDO =====
```

O fluxo é:
1. Abrir roteiro no Obsidian (`Ensinio Talks - Fosc IA 2.md`)
2. Localizar `## 🎬 ATO X — [nome]`
3. Copiar toda a seção até antes do próximo ATO
4. Colar dentro do placeholder no arquivo do prompt
5. Copiar o prompt COMPLETO (com o conteúdo colado)
6. Colar no AI Studio

Por quê assim? Pra manter o roteiro como fonte única de verdade. Se você mudar algo no roteiro, basta recopiar daquela seção — o prompt template continua valendo.
