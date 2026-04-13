# 🎬 Prompt — Fase 2, Ato 1: Abertura & Hook

> **Ordem de execução:** 1º (começa a sequência)
> **Tempo esperado:** ~7 min
> **Conteúdo-fonte:** `Ensinio Talks - Fosc IA 2.md` → seção `## 🎬 ATO 1 — Abertura & Hook`

---

## 📋 O que este Ato contém

- **Slide 1.1** — Disclaimer (Pílula da Matrix)
- **Slide 1.2** — IA não é futuro, é presente (+ carrossel de profissões extintas)
- **Slide 1.3** — Metáfora da esteira
- **Slide 1.4** — Código é commodity, programador é orquestrador (+ Diagrama #1)

---

## ▶️ Passos

1. **Abra o roteiro** em Obsidian ou VS Code:
   `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc/+/Ensinio Talks - Fosc IA 2.md`
2. **Localize** a seção `## 🎬 ATO 1 — Abertura & Hook`
3. **Copie** todo o conteúdo desta seção (do título do ATO até ANTES do próximo `## 🎬 ATO 2`)
4. **Cole** no placeholder marcado no bloco abaixo (substitua a linha `[COLE AQUI O CONTEÚDO DO ATO 1]`)
5. **Copie o bloco inteiro** (do banner ao banner) e cole no AI Studio
6. **Valide** pela [Checklist da Fase 2](../checklists/02-fase-2-conteudo.md)

---

```
════════════════════════════════════════════════════════════
          COPIAR A PARTIR DAQUI ⬇
════════════════════════════════════════════════════════════

No app de slides que você já criou, preencha APENAS o conteúdo do
ATO 1 (Abertura & Hook) com o material abaixo. Respeite as seguintes
regras:

REGRAS DE PREENCHIMENTO:
0. ⚠️ TOKENS — REGRA INEGOCIÁVEL: você NÃO pode hardcodar nenhum
   valor de design (cor, espaçamento, tamanho, sombra, transição).
   USE APENAS os tokens já definidos em src/tokens/design-tokens.ts.
   Se precisar de algo que não existe nos tokens, ADICIONE primeiro
   no design-tokens.ts e DEPOIS consuma nos slides. Nada de magic
   values, nada de #f59e0b literal, nada de p-[24px].
1. NÃO altere scaffold, navegação, componentes existentes ou outros
   Atos. Só popule os slides do Ato 1.
2. Cada "Slide X.Y" do material abaixo vira um slide do app.
3. Use os componentes reutilizáveis que já existem:
   - <SpeechBubble>...</SpeechBubble> para blocos marcados com 💬 (falas)
   - <PromptBox code="..." /> para blocos de código copiáveis
   - <DiagramPlaceholder number={X} title="..." /> para marcadores
     [IMAGEM-DIAGRAMA] (extraia o número e o título da linha)
   - <Carousel items={[...]} /> para marcadores [CARROSSEL]
   - <ImageCard src="..." caption="..." /> para marcadores [IMAGEM]
   - <VideoPlayer src="..." /> para marcadores [VÍDEO]
   - <HighlightBox> para blocos importantes ou avisos
4. Preserve a ordem dos slides exatamente como está no material.
5. Textos em pt-BR devem manter acentuação completa.
6. Falas do palestrante (marcadas com 💬) vão em SpeechBubble.
7. Para os prompts de geração de imagem dentro dos [IMAGEM-DIAGRAMA],
   NÃO renderize o prompt no slide — só mostre o placeholder com o
   título. O prompt é pra geração da imagem depois.

===== CONTEÚDO DO ATO 1 =====

[COLE AQUI O CONTEÚDO DO ATO 1]

===== FIM DO CONTEÚDO DO ATO 1 =====

Depois de preencher, quero poder navegar do Ato 1 (slides 1.1 a 1.4)
e ver todo o conteúdo renderizado com os componentes corretos.

════════════════════════════════════════════════════════════
          FIM DO BLOCO DE CÓPIA ⬆
════════════════════════════════════════════════════════════
```

---

## ✅ Depois de Executar

- [ ] Ato 1 preenchido e navegável no app
- [ ] Slides 1.1 até 1.4 aparecem
- [ ] Falas estão em SpeechBubble
- [ ] Carrossel de profissões extintas existe (slide 1.2)
- [ ] DiagramPlaceholder #1 visível (slide 1.4)

**Próximo passo:** [Fase 2 — Ato 5: Processos](./fase-2-ato-5-processos.md) ⭐ (o diagrama-âncora da talk)
