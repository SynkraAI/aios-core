# Memory Templates para `/new-project`

Templates que `/new-project` deve usar ao criar `.aios/memory/`

---

## Template: `project-context.md`

```markdown
# Project Context: {projeto}

**Criado:** {data}
**Última atualização:** {data}

---

## Stack Técnica

- **Backend:** {detectado ou perguntado}
- **Frontend:** {detectado ou perguntado}
- **Database:** {detectado ou perguntado}
- **Deploy:** {detectado ou perguntado}

---

## Decisões de Arquitetura

### Por quê esta stack?

(A ser preenchido durante desenvolvimento)

### Padrões de código

- Import style: {absolute com @/ ou relative}
- Naming: {kebab-case, camelCase, etc}
- Commits: {Conventional Commits, Custom, etc}

---

## Escolhas Técnicas Permanentes

(Decisões que NÃO devem ser questionadas novamente)

Exemplo:
- ✅ Usar Tailwind CSS (NUNCA Material UI)
- ✅ PostgreSQL (NUNCA MySQL)
- ✅ Supabase RLS (segurança obrigatória)

---

## Regras de Ouro

(Regras que TODOS os agents/squads devem seguir NESTE projeto)

Exemplo:
- Sempre validar input do usuário
- Sempre usar absolute imports (@/)
- Sempre commitar antes de trocar de tarefa

---

## Contexto de Negócio

(Por que este projeto existe? Qual problema resolve?)

{Extraído do PRD ou perguntado ao usuário}

---

## Notas

(Qualquer informação adicional relevante)
```

---

## Template: `agents-used.md`

```markdown
# Agents/Squads Usados Neste Projeto

**Última atualização:** {data}

---

## Agents AIOX

### @dev (Dex)
- **Usado desde:** {data}
- **Configuração específica:** (se houver)
- **Learnings:**
  - (O que funcionou bem)
  - (O que evitar)

### @po (Pax)
- **Usado desde:** {data}
- **Configuração específica:** (se houver)

---

## Squads

### Copywriting Squad
- **Usado desde:** {data}
- **Configuração:** Ver `squads-config.md`
- **Outputs gerados:**
  - Landing page copy (data)
  - Email sequence (data)

---

## Minds Clonadas

### Alex Hormozi
- **Usado para:** Copy de high-ticket
- **Adaptações:** Ver `squads-config.md`

---

## Notas

- Adicionar novos agents/squads conforme são usados
- Documentar configurações específicas
- Registrar learnings para próximos usos
```

---

## Template: `squads-config.md`

```markdown
# Configuração de Squads Neste Projeto

**Última atualização:** {data}

---

## Copywriting Squad

### Tom e Voz
- **Tom geral:** {definido pelo projeto}
- **Gatilhos principais:** {específicos deste projeto}
- **Evitar:** {fingerprints de IA, clichês, etc}

### Big Idea
- **Cluster de dor principal:** {extraído do ICP}
- **Ângulo único:** {posicionamento}

### Regras Específicas
- (Regras que se aplicam a ESTE projeto)

---

## Design System Squad

### Estilo Visual
- **Palette:** {cores do projeto}
- **Typography:** {fonte, tamanhos}
- **Componentes:** {biblioteca usada - Tailwind, shadcn/ui, etc}

### Regras Específicas
- (Padrões de design deste projeto)

---

## Mind Cloning Squad

### Minds Ativas
- **{Nome da mind}:**
  - Contexto de uso: {quando/onde usar}
  - Adaptações: {ajustes para este projeto}

---

## Outros Squads

(Adicionar conforme necessário)
```

---

## Template: `feedback/{topic}.md`

```markdown
---
date: {YYYY-MM-DD}
topic: {slug-do-topico}
severity: {low|medium|high|critical}
agent: {qual agent recebeu o feedback}
---

# Feedback: {Título}

## Contexto

{O que estava acontecendo quando o feedback foi dado}

## O Que o Usuário Disse

> "{Frase exata do usuário}"

## O Que Estava Sendo Proposto (Errado)

{O que o agent/squad estava fazendo que gerou o feedback}

## Correção Aplicada

{O que foi mudado após o feedback}

## Aprendizado

{O que NUNCA repetir / sempre fazer}

## Escopo

- [ ] Aplica a este projeto apenas
- [ ] Aplica globalmente (considerar adicionar ao user profile)
- [ ] Aplica a squad específico (atualizar squads-config.md)

---

**Auto-generated via feedback detection hook**
```
