# Guia de Criação de Agentes — Schema e Template Completos

## Convenções de Nomeação
- Sempre use **kebab-case** para IDs (ex: `meu-novo-agente`)
- Mantenha os títulos descritivos, mas concisos

## Schema YAML Completo
Todo agente DEVE começar com um bloco YAML contendo:
- `id`: id-unico
- `name`: Nome da Persona
- `title`: Função Profissional
- `icon`: Emoji
- `role`: Resumo de uma frase
- `commands`: Lista de comandos *disponíveis

## Template Minimalista (Copiar e Preencher)
[Conteúdo do template baseado no GitHub]

## Passos para Registro
1. Salvar em `.aios-core/development/agents/{id}.md`
2. Executar `npm run sync:ide:gemini`
3. Executar `npm run sync:ide:codex`
