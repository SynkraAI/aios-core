# Memory Protocol — Read Before Act (ALL AGENTS)

## Regra (MANDATORY)

Antes de criar qualquer plano, começar qualquer implementação, ou tomar qualquer decisão, TODO agente DEVE ler a memória do projeto.

## O Que Ler

### 1. Project Memory (se existir)

Detectar modo do projeto:
- **HYBRID** (cwd tem `.aiox/`): ler `.aiox/memory/project-context.md`
- **CENTRALIZED** (cwd é aios-core): ler `docs/projects/{projeto}/memory/project-context.md`

Se `project-context.md` existir, ler e absorver:
- Stack técnica (não perguntar o que já está documentado)
- Decisões permanentes (não questionar)
- Regras de ouro (seguir sem exceção)
- Contexto de negócio (entender o "porquê")

### 2. Feedback Recente (se existir)

Ler até 3 arquivos mais recentes em `memory/feedback/`:
- Estes são correções que o usuário já fez
- NUNCA repetir erros documentados no feedback
- Tratar como regras do projeto

### 3. User Profile (global)

Se existir `.aiox-core/data/memory/user/luiz-fosc-profile.md`, ler para adaptar:
- Tom de comunicação
- Preferências de trabalho
- Stack preferida

## Quando NÃO Ler

- Se o agente foi chamado para uma micro-task (< 30 segundos)
- Se o arquivo não existir (seguir sem memória, não falhar)
- Se a memória já foi lida nesta sessão (não reler)

## O Que Gravar (Write Protocol)

### Quando gravar feedback automaticamente

Detectar correções do usuário durante a conversa. Sinais:
- "na verdade...", "não, prefiro...", "para de...", "não faz assim"
- "sempre faça...", "nunca use...", "a regra aqui é..."
- Usuário rejeita uma sugestão e explica por quê
- Usuário confirma uma abordagem não-óbvia ("sim, exatamente isso")

### Como gravar

Criar arquivo em `memory/feedback/{topic-slug}.md` usando este formato:

```markdown
---
date: YYYY-MM-DD
topic: {slug}
severity: {low|medium|high|critical}
agent: {qual agente recebeu o feedback}
---

# Feedback: {Título}

## O Que o Usuário Disse
> "{frase exata ou paráfrase fiel}"

## Correção
{o que mudou}

## Regra
{o que NUNCA repetir / SEMPRE fazer}
```

### Regras de gravação

- **Gravar DURANTE a conversa**, não no final (pode esquecer)
- **NÃO pedir permissão** — gravar silenciosamente e avisar: "Gravei esse feedback em memory/feedback/{slug}.md"
- **Atualizar arquivo existente** se feedback for sobre o mesmo tópico
- **Escopo:** se o feedback é claramente global (não específico do projeto), mencionar no arquivo
- **NÃO gravar:** coisas óbvias do código, preferências já documentadas, detalhes efêmeros da task

### Quando atualizar project-context.md

Se o usuário tomar uma **decisão permanente** ("sempre usar X", "nunca mais Y"), além de gravar feedback:
- Adicionar na seção "Escolhas Técnicas Permanentes" ou "Regras de Ouro" do `project-context.md`
- Isso garante que a decisão persiste mesmo após cleanup de feedback antigo

---

## Checkpoints — Pause and Listen (Phase 4)

### Quando pausar

Em workflows multi-step (epic execution, story development cycle), PAUSAR e mostrar resultado ao usuário nos seguintes pontos:

1. **Após @sm criar story draft** → mostrar resumo e perguntar: "Story OK ou quer ajustar?"
2. **Após @dev completar um AC** → mostrar o que foi feito e perguntar: "Próximo AC ou quer revisar?"
3. **Após @qa rodar quality gate** → mostrar resultado e perguntar: "Prosseguir ou corrigir?"
4. **Antes de qualquer decisão irreversível** → "Vou fazer X, confirma?"

### Como pausar

Não é um bloqueio técnico — é uma instrução comportamental:
- Mostrar resumo conciso do que foi feito (máx 5 linhas)
- Perguntar explicitamente se pode continuar
- Se o usuário corrigir algo, aplicar Write Protocol (gravar feedback)
- Se timeout (usuário não responde em contexto autônomo), continuar com decisão documentada

### Quando NÃO pausar

- Tasks triviais (criar arquivo, rodar lint)
- Quando o usuário explicitamente pediu modo autônomo ("faz tudo", "YOLO")
- Micro-ajustes dentro de um AC já aprovado

---

## Comportamento Esperado

| Sem Memory Protocol | Com Memory Protocol |
|---|---|
| "Qual framework vocês usam?" | (já sabe — vai direto) |
| Sugere MySQL | (leu que é PostgreSQL only) |
| Usa hífens em copy | (leu feedback: nunca hífens) |
| Começa do zero | (continua de onde parou) |
