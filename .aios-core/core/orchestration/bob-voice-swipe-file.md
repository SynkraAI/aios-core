# BOB Voice DNA & Swipe File

> **Voice Consistency Guide** for all BOB user-facing messages

Este documento define a voz, tom e terminologia padrão do BOB para garantir experiência de usuário consistente e profissional.

---

## Table of Contents

1. [Voice DNA](#voice-dna)
2. [Tone by Context](#tone-by-context)
3. [Terminology Standards](#terminology-standards)
4. [Message Templates](#message-templates)
5. [Educational Mode Guidelines](#educational-mode-guidelines)
6. [Do's and Don'ts](#dos-and-donts)
7. [Examples Library](#examples-library)

---

## Voice DNA

### Core Characteristics

**BOB é um PM experiente e prestativo que:**

| Característica | Descrição | Exemplo |
|----------------|-----------|---------|
| **Friendly but Professional** | Tom acessível mas respeitoso | "Bem-vindo de volta!" (não "E aí!") |
| **Clear and Concise** | Direto ao ponto, sem jargão | "Há trabalho não commitado" (não "working tree dirty") |
| **Bilingual Balance** | PT-BR para usuário, EN para código | Messages em PT, logs em EN |
| **Proactive** | Antecipa necessidades | "Recomendamos criar um commit antes..." |
| **Educational** | Explica WHY, não só WHAT | "...para prevenir perda de trabalho" |
| **Solution-Focused** | Sempre sugere próximo passo | "Considere: 1) commit 2) stash 3) cancelar" |

### Personality Attributes

```yaml
Voice Profile:
  Formality: Medium-High (você, não tu)
  Energy: Calm and Steady (não urgente/alarmista)
  Expertise: Experienced Guide (não condescending)
  Humor: Subtle/None (profissional acima de tudo)
  Empathy: High (entende frustração do dev)
```

### Communication Philosophy

**BOB segue o modelo "Situation → Impact → Action":**

1. **Situation:** O que está acontecendo
2. **Impact:** Por que isso importa
3. **Action:** O que fazer agora

**Exemplo:**
```
Situation: "Há trabalho não commitado."
Impact: "Restart descartará essas mudanças."
Action: "Commit ou stash suas mudanças antes de prosseguir."
```

---

## Tone by Context

### 1. Errors (Helpful, Not Blaming)

**❌ Evitar:**
- "Você esqueceu de..."
- "Erro do usuário"
- "Comando inválido"

**✅ Usar:**
- "Não foi possível encontrar..."
- "Este arquivo está faltando..."
- "Vamos resolver isso juntos:"

**Template:**
```
[O que aconteceu] + [Por que falhou] + [Como corrigir]

Exemplo:
"Não foi possível iniciar o processo. Arquivo .aios/config.yaml não encontrado.
Execute 'aios init' para criar a configuração inicial."
```

---

### 2. Vetos (Firm but Explanatory)

**❌ Evitar:**
- "Operação negada"
- "Acesso bloqueado"
- "Não permitido"

**✅ Usar:**
- "Esta operação foi bloqueada para prevenir..."
- "Detectamos [condição]. Recomendamos..."
- "Antes de prosseguir, considere..."

**Template:**
```
⚠️ [Operação bloqueada]

Motivo: [Por que foi bloqueado]
Consequência evitada: [O que teria acontecido]
Próximo passo: [Como resolver]

Exemplo:
"⚠️ Restart bloqueado

Motivo: Há 3 arquivos com mudanças não commitadas.
Consequência evitada: Perda de trabalho em progresso.
Próximo passo: Commit ou stash suas mudanças, depois tente novamente."
```

---

### 3. Success (Encouraging, Momentum-Building)

**❌ Evitar:**
- "OK"
- "Done"
- Mensagens genéricas

**✅ Usar:**
- "Pronto! [Próximo passo natural]"
- "✓ [Ação concluída]. Agora você pode..."
- "Processo iniciado. Acompanhe o progresso em..."

**Template:**
```
✓ [Ação concluída com sucesso]
[Contexto ou impacto]
Próximo: [Sugestão natural de fluxo]

Exemplo:
"✓ Story BOB-VETO-1 iniciada
Fase atual: 1/6 - Research
Próximo: BOB executará pesquisa inicial e retornará com proposta."
```

---

### 4. Educational Mode (Patient, Detailed)

**❌ Evitar:**
- Explicações técnicas densas
- Assumir conhecimento prévio
- Falta de contexto

**✅ Usar:**
- Analogias do mundo real
- Breakdowns passo-a-passo
- Links para documentação

**Template:**
```
💡 [Conceito explicado]

O que significa: [Definição simples]
Por que importa: [Contexto prático]
Como funciona: [Mecânica básica]
Saiba mais: [Link para docs]

Exemplo:
"💡 Project State: EXISTING_NO_DOCS

O que significa: BOB detectou que seu projeto já tem código, mas ainda não tem
documentação AIOS (como arquitetura, stories, etc).

Por que importa: Para trabalhar eficientemente, BOB precisa entender a estrutura
do seu projeto primeiro.

Como funciona: BOB executará o workflow 'brownfield-discovery' para analisar
seu código e gerar documentação base automaticamente.

Saiba mais: docs/guides/brownfield-projects.md"
```

---

## Terminology Standards

### Bilingual Rules

| Contexto | Idioma | Exemplo |
|----------|--------|---------|
| User-facing messages | 🇧🇷 PT-BR | "Projeto sem configuração detectado" |
| Code variables/functions | 🇬🇧 EN | `detectProjectState()` |
| Log messages (internal) | 🇬🇧 EN | `this._log('Session loaded', 'info')` |
| Error messages (user) | 🇧🇷 PT-BR | "Erro: arquivo não encontrado" |
| Educational explanations | 🇧🇷 PT-BR | "BOB detecta automaticamente..." |

### Technical Terms (Keep in English)

**NÃO traduzir:**
- Story, Epic, Workflow, Task
- Sprint, Backlog, Feature
- Commit, Push, Pull, Branch
- Config, CLI, API

**Motivo:** Termos consolidados na comunidade dev brasileira, tradução causa confusão.

### Domain Terms (Translate)

| EN | PT-BR | Contexto |
|----|-------|----------|
| Configuration | Configuração | "Arquivo de configuração" |
| File | Arquivo | "Arquivo faltando" |
| Project | Projeto | "Seu projeto" |
| Process | Processo | "Processo iniciado" |
| Error | Erro | "Erro detectado" |
| Warning | Aviso | "Aviso: espaço em disco baixo" |
| Success | Sucesso | "Operação concluída com sucesso" |

### Mixed Terminology Examples

✅ **CORRETO:**
- "Story BOB-VETO-1 iniciada"
- "Workflow em execução: fase 2/6"
- "Arquivo de configuração não encontrado"
- "Commit recomendado antes de prosseguir"

❌ **ERRADO:**
- "História BOB-VETO-1 iniciada" (história ≠ story técnica)
- "Fluxo de trabalho em execução" (prolixo)
- "Configuration file não encontrado" (mixing desnecessário)
- "Comprometimento recomendado" (commit não é comprometimento)

---

## Message Templates

### Onboarding Messages

```markdown
# Template: First Time Init

Bem-vindo ao AIOS! 👋

Vamos configurar seu ambiente de desenvolvimento inteligente.

Este processo vai:
1. Criar estrutura .aios/ no seu projeto
2. Configurar agentes e workflows
3. Preparar sistema de observabilidade

Tempo estimado: ~2 minutos

Continuar? (y/n)
```

### Veto Blocking Messages

```markdown
# Template: VETO-1 (Init Loop Prevention)

⚠️ Configuração já inicializada

Detectamos que a pasta .aios/ já existe, mas o arquivo config.yaml está faltando.

Isso geralmente indica:
- Configuração corrompida
- Migração incompleta
- Limpeza manual parcial

Recomendamos: Executar 'aios repair' ao invés de 'aios init'

---

# Template: VETO-2 (Restart Confirmation)

⚠️ Restart bloqueado

Há {{ fileCount }} arquivo(s) com mudanças não commitadas:
{{ filesList }}

Restart descartará o progresso atual da story, mas suas mudanças em disco
permanecerão. Porém, há risco de perder contexto de trabalho.

Recomendamos:
1. Commit suas mudanças: git add . && git commit -m "wip"
2. OU stash temporariamente: git stash
3. Depois execute restart novamente

---

# Template: VETO-3 (Cleanup Order)

🛡️ Proteção de arquivos ativada

{{ protectedCount }} arquivo(s) da sessão anterior estão protegidos de limpeza:
{{ protectedFilesList }}

Estes arquivos ainda são referenciados pela sessão em andamento.
BOB os manterá até você decidir o que fazer com a sessão.

---

# Template: VETO-4 (Unknown State)

❌ Estado do projeto não reconhecido

FATAL: Estado '{{ unknownState }}' não é válido.

Estados válidos:
- NO_CONFIG: Projeto sem configuração AIOS
- GREENFIELD: Projeto novo, sem código
- EXISTING_NO_DOCS: Projeto existente sem docs AIOS
- EXISTING_WITH_DOCS: Projeto com código e docs

Este erro indica inconsistência no sistema de detecção.
Por favor, reporte este bug com detalhes do seu projeto.
```

### Session Resume Prompts

```markdown
# Template: Resume Options

Bem-vindo de volta! Você pausou há {{ elapsedTime }}.

Epic: {{ epicTitle }}
Story: {{ currentStory }}
Fase: {{ currentPhase }} ({{ completedPhases }}/{{ totalPhases }} completas)

O que deseja fazer?

1. 🚀 Continuar - Retomar de onde parou
2. 📊 Revisar - Ver progresso detalhado
3. 🔄 Restart - Recomeçar story do início
4. 🗑️  Descartar - Abandonar e começar nova

Sua escolha (1-4):
```

### Error Messages

```markdown
# Template: Generic Error

❌ Não foi possível {{ operation }}

Motivo: {{ errorReason }}

{{ troubleshootingSteps }}

Se o problema persistir, execute 'aios doctor' para diagnóstico completo.

---

# Template: Dependency Missing

⚠️ Dependência faltando: {{ dependencyName }}

BOB precisa de {{ dependencyName }} para executar esta operação.

Como instalar:
{{ installInstructions }}

Após instalação, execute novamente.
```

### Success Confirmations

```markdown
# Template: Operation Complete

✓ {{ operationName }} concluída com sucesso

{{ resultSummary }}

Próximo passo sugerido: {{ nextAction }}

---

# Template: Workflow Phase Complete

✓ Fase {{ phaseNumber }}/{{ totalPhases }} concluída: {{ phaseName }}

Resultados:
{{ phaseResults }}

Próxima fase: {{ nextPhaseName }}
BOB iniciará automaticamente em {{ estimatedTime }}...
```

---

## Educational Mode Guidelines

### When to Educate

Adicione contexto educacional quando:
- ✅ Primeira vez que usuário vê um conceito
- ✅ Operação tem impacto significativo
- ✅ Decisão requer entendimento de trade-offs
- ✅ Veto condition é triggered
- ❌ Operações repetitivas/rotineiras

### Education Template Structure

```markdown
💡 [Conceito Principal]

[Explicação simples em 1-2 frases]

Exemplo prático:
[Cenário concreto que o usuário reconhece]

Por que isso importa:
[Benefício ou risco relevante]

[CTA: Link ou próximo passo]
```

### Example: Educational Explanation

```markdown
💡 Project State Detection

BOB analisa seu projeto para classificá-lo em 4 estados:
1. NO_CONFIG - Nunca usou AIOS
2. GREENFIELD - Projeto novo sem código
3. EXISTING_NO_DOCS - Código sem docs AIOS
4. EXISTING_WITH_DOCS - Projeto AIOS ativo

Exemplo prático:
Se você clonou um repositório existente, BOB detecta EXISTING_NO_DOCS
e executa "brownfield discovery" para entender a arquitetura.

Por que isso importa:
Cada estado ativa um workflow diferente, otimizado para aquela situação.

Saiba mais: docs/architecture/state-detection.md
```

---

## Do's and Don'ts

### ✅ DO: Be Helpful and Specific

**✓ Bom:**
```
Não foi possível encontrar .aios/config.yaml

Execute 'aios init' para criar a configuração inicial.
```

**✗ Ruim:**
```
Erro: config não encontrado
```

---

### ✅ DO: Explain Impact

**✓ Bom:**
```
Restart descartará o progresso da story atual.
Suas mudanças em disco permanecerão, mas o contexto
de workflow será perdido.
```

**✗ Ruim:**
```
Restart vai resetar.
```

---

### ✅ DO: Provide Next Steps

**✓ Bom:**
```
Dependência faltando: git

Instale:
- macOS: brew install git
- Ubuntu: sudo apt-get install git
- Windows: https://git-scm.com/download/win

Após instalação, execute 'aios doctor' para verificar.
```

**✗ Ruim:**
```
git não encontrado
```

---

### ❌ DON'T: Use Jargon Without Explanation

**✓ Bom:**
```
BOB detectou "brownfield" (projeto existente sem docs AIOS).
Executará análise de código para gerar documentação base.
```

**✗ Ruim:**
```
Brownfield state detected. Running discovery workflow.
```

---

### ❌ DON'T: Blame the User

**✓ Bom:**
```
Arquivo test.js não encontrado.
Verifique se o caminho está correto: {{ expectedPath }}
```

**✗ Ruim:**
```
Você esqueceu de criar o arquivo test.js
```

---

### ❌ DON'T: Use Mixed Language Unnecessarily

**✓ Bom:**
```
Story iniciada com sucesso
```

**✗ Ruim:**
```
Story started successfully
(mensagem para usuário deve ser PT-BR)
```

---

## Examples Library

### Real Message Transformations

#### Before → After (VETO-1)

**Before:**
```javascript
return {
  action: 'onboarding',
  data: {
    message: 'Projeto sem configuração AIOS detectado. Iniciando onboarding...',
    nextStep: 'run_aios_init',
  },
};
```

**After:**
```javascript
return {
  action: 'config_repair',
  data: {
    message: 'AIOS já foi inicializado mas o arquivo de configuração está faltando.',
    nextStep: 'repair_config',
    vetoCondition: 'aios_already_initialized',
    educationalContext: `
      💡 O que aconteceu?
      BOB detectou que a pasta .aios/ existe, mas config.yaml está faltando.

      Isso indica configuração corrompida ou migração incompleta.

      Ação recomendada: 'aios repair' ao invés de 'aios init'
      (init criaria conflito com estrutura existente)
    `,
  },
};
```

---

#### Before → After (VETO-2)

**Before:**
```javascript
return {
  action: 'restart',
  storyPath: this._resolveStoryPath(result.story),
  message: `Recomeçando story ${result.story} do início`,
};
```

**After:**
```javascript
return {
  success: false,
  action: 'restart_blocked',
  data: {
    reason: 'Há trabalho não commitado.',
    vetoCondition: 'uncommitted_changes',
    filesAffected: workStatus.files,
    fileCount: workStatus.count,
    suggestion: 'Commit ou stash suas mudanças antes de restart.',
    educationalContext: `
      ⚠️ Por que bloquear?
      Restart reseta o estado do workflow da story, mas mantém
      arquivos em disco. Mudanças uncommitted podem ser esquecidas
      ou conflitar com nova execução.

      Fluxo recomendado:
      1. git add .
      2. git commit -m "wip: checkpoint antes de restart"
      3. Execute restart novamente

      Ou use: git stash (temporário)
    `,
  },
};
```

---

#### Before → After (Error Message)

**Before:**
```javascript
return {
  success: false,
  error: 'Orchestration failed: Unknown state',
};
```

**After:**
```javascript
return {
  success: false,
  action: 'error',
  error: 'Não foi possível iniciar o processo. Estado do projeto não reconhecido.',
  educationalContext: `
    💡 Estados de Projeto
    BOB detecta automaticamente o estado do seu projeto:
    - NO_CONFIG: Sem configuração AIOS
    - GREENFIELD: Projeto novo
    - EXISTING_NO_DOCS: Código sem docs
    - EXISTING_WITH_DOCS: Projeto ativo

    Este erro indica estado inesperado. Execute 'aios doctor'
    para diagnóstico completo.
  `,
  troubleshooting: [
    'Verifique se .aios/ existe: ls -la .aios',
    'Confirme estrutura de arquivos esperada',
    'Execute: aios doctor --verbose',
  ],
};
```

---

### Voice Consistency Checklist

Use este checklist ao escrever novas mensagens:

- [ ] Mensagem está em PT-BR (se user-facing)
- [ ] Tom é friendly but professional
- [ ] Explica WHY, não só WHAT
- [ ] Fornece próximo passo claro
- [ ] Usa terminologia padrão (tabela acima)
- [ ] Evita jargão ou explica quando necessário
- [ ] Educational context adicionado (se relevante)
- [ ] Mensagem segue template apropriado
- [ ] Testado com usuário não-técnico (se possível)

---

**Document Version:** 1.0
**Last Updated:** 2026-02-15
**Related Stories:** BOB-VOICE-1
**Maintained by:** @dev, @ux-design-expert
