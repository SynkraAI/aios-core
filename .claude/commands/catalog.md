Ao receber este comando, siga EXATAMENTE estes passos:

1. **Atualize o catálogo** rodando `node scripts/generate-catalog.js` via Bash

2. **Delegue a apresentação** usando o Task tool com `model: "haiku"` e `subagent_type: "general-purpose"`:
   - Prompt: "Leia o arquivo .aios-core/data/catalog.md e apresente o conteúdo COMPLETO ao usuário, formatado em markdown. Não resuma, não omita nada — copie o conteúdo inteiro."

3. **Aguarde instrução** — o usuário pode pedir para ativar qualquer squad, skill, tool ou agent listado. Para ativar:
   - **Squad:** Leia o arquivo `squads/{nome}/README.md` e siga as instruções
   - **Skill:** Leia o arquivo `.aios/skills/{nome}/SKILL.md` e siga as instruções
   - **Agent:** Leia o arquivo `.aios-core/development/agents/{nome}.md` e ative
   - **Task específica de squad:** Leia `squads/{nome}/tasks/{task}.md` e execute
