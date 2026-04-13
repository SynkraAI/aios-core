# Delegation Patterns

> Heurísticas para sugerir delegação de tarefas. A skill usa estes padrões para gerar o campo `💡 Delegação:`.

---

## Princípio

Delegação é sugestão, não ordem. O formato é sempre:

```
Considerar delegar [TAREFA ESPECÍFICA] a [PAPEL].
```

Nunca sugerir delegar o projeto inteiro — apenas tarefas específicas dentro dele.

---

## Padrões Delegáveis

| Padrão detectado no checklist | Sugestão de delegação |
|-------------------------------|----------------------|
| "editar vídeo", "edição", "cortes", "legendas" | Editor de vídeo |
| "thumbnail", "capa", "arte", "banner" | Designer gráfico |
| "copy", "copywriting", "texto de venda", "mensagem de prospecção" | Copywriter |
| "design system", "componentizar", "UI components" | Designer/dev frontend |
| "transcrição", "transcrever" | Serviço de transcrição ou IA |
| "publicar", "publicação", "upload", "postar" | Assistente ou automação |
| "dados", "data entry", "planilha", "cadastrar" | Assistente administrativo |
| "tradução", "traduzir" | Tradutor |
| "pesquisa de mercado", "benchmark", "análise de concorrentes" | Analista ou IA |
| "testes", "QA", "quality assurance" | QA ou automação |
| "agendamento", "agendar", "calendário" | Assistente ou automação |
| "roteiro" com "vídeo" ou "palestra" | Roteirista (parcial — estrutura é do usuário) |
| "SEO", "meta tags", "sitemap" | Especialista SEO |
| "social media", "Instagram", "LinkedIn" | Social media manager |

---

## Quando NÃO sugerir delegação

- Decisões estratégicas (o que fazer, por que fazer)
- Criação de conteúdo autoral (a voz é do usuário)
- Arquitetura técnica (decisões de stack, patterns)
- Validação de qualidade (o "OK final" é do usuário)
- Tarefas que levam < 15 minutos (não vale o overhead de delegar)

---

## Formato de Saída

Se delegável:
```
💡 Delegação: Considerar delegar edição do vídeo a um editor profissional.
```

Se múltiplas tarefas:
```
💡 Delegação: Edição de vídeo → editor. Thumbnail → designer. Publicação → automação.
```

Se nada delegável:
```
💡 Delegação: —
```
