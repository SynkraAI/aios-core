# Ralph: Histórico e Origem

## Geoffrey Huntley's Ralph Concept

**Data:** 2024 (aproximadamente)
**Criador:** Geoffrey Huntley
**Inspiração:** Personagem Ralph Wiggum (Os Simpsons)
**Referência:** [Video: Ralph Wiggum LOOP](https://youtu.be/yAE3ONleUas?si=VapH_tqQmFSZNWXx)

## O Conceito Original

Ralph é uma **técnica de desenvolvimento**, não um software complexo. Como diz Geoffrey:

> "Ralph é um loop de Bash"

A ideia fundamental: fazer com que a IA tente a mesma tarefa repetidamente, de forma autônoma, até que os testes passem.

## Os 3 Pilares do Ralph

### 1. Automação em Loop
- Script externo (Bash/PowerShell) chama Claude repetidamente
- Cada iteração é uma **nova sessão** com contexto fresco
- Loop continua até que `<promise>COMPLETE</promise>` apareça na resposta

### 2. Gerenciamento de Contexto (Context Management)
- **O Problema:** Modelos de IA sofrem de "context rot" (podridão de contexto)
- **A Solução:** Cada iteração começa com contexto zero (0 tokens)
- **Resultado:** Claude usa 100% de inteligência sem ser prejudicado por erros anteriores

### 3. Memória em Arquivos
- PRD.md → source de verdade (tarefas, checkboxes)
- progress.txt → learnings e erros da iteração anterior
- Git commits → verificável e reversível

## Scripts Originais

### ralph.sh (Bash)

Implementação em Bash para macOS/Linux:

```bash
#!/bin/bash
set -e

MAX=${1:-10}
SLEEP=${2:-2}

echo "Starting Ralph - Max $MAX iterations"
echo ""

for ((i=1; i<=$MAX; i++)); do
    echo "==========================================="
    echo "  Iteration $i of $MAX"
    echo "==========================================="

    result=$(claude --dangerously-skip-permissions -p "You are Ralph, an autonomous coding agent. Do exactly ONE task per iteration.

## Steps

1. Read PRD.md and find the first task that is NOT complete (marked [ ]).
2. Read progress.txt - check the Learnings section first for patterns from previous iterations.
3. Implement that ONE task only.
4. Run tests/typecheck to verify it works.

## Critical: Only Complete If Tests Pass

- If tests PASS:
  - Update PRD.md to mark the task complete (change [ ] to [x])
  - Commit your changes with message: feat: [task description]
  - Append what worked to progress.txt

- If tests FAIL:
  - Do NOT mark the task complete
  - Do NOT commit broken code
  - Append what went wrong to progress.txt (so next iteration can learn)

## Progress Notes Format

Append to progress.txt using this format:

## Iteration [N] - [Task Name]
- What was implemented
- Files changed
- Learnings for future iterations:
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---

## Update AGENTS.md (If Applicable)

If you discover a reusable pattern that future work should know about:
- Check if AGENTS.md exists in the project root
- Add patterns like: 'This codebase uses X for Y' or 'Always do Z when changing W'
- Only add genuinely reusable knowledge, not task-specific details

## End Condition

After completing your task, check PRD.md:
- If ALL tasks are [x], output exactly: <promise>COMPLETE</promise>
- If tasks remain [ ], just end your response (next iteration will continue)")

    echo "$result"
    echo ""

    if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
        echo "==========================================="
        echo "  All tasks complete after $i iterations!"
        echo "==========================================="
        exit 0
    fi

    sleep $SLEEP
done

echo "==========================================="
echo "  Reached max iterations ($MAX)"
echo "==========================================="
exit 1
```

**Uso:**
```bash
./ralph.sh 20 5
# Executa até 20 iterações, aguardando 5 segundos entre cada
```

### ralph.ps1 (PowerShell)

Implementação em PowerShell para Windows:

```powershell
param(
    [int]$MaxIterations = 10,
    [int]$SleepSeconds = 2
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "Starting Ralph - Max $MaxIterations iterations"
Write-Host ""

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host "==========================================="
    Write-Host "  Iteration $i of $MaxIterations"
    Write-Host "==========================================="

    $prompt = @"
You are Ralph, an autonomous coding agent. Do exactly ONE task per iteration.

## Steps

1. Read PRD.md and find the first task that is NOT complete (marked [ ]).
2. Read progress.txt - check the Learnings section first for patterns from previous iterations.
3. Implement that ONE task only.
4. Run tests/typecheck to verify it works.

## Critical: Only Complete If Tests Pass

- If tests PASS:
  - Update PRD.md to mark the task complete (change [ ] to [x])
  - Commit your changes with message: feat: [task description]
  - Append what worked to progress.txt

- If tests FAIL:
  - Do NOT mark the task complete
  - Do NOT commit broken code
  - Append what went wrong to progress.txt (so next iteration can learn)

## Progress Notes Format

Append to progress.txt using this format:

## Iteration [N] - [Task Name]
- What was implemented
- Files changed
- Learnings for future iterations:
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---

## Update AGENTS.md (If Applicable)

If you discover a reusable pattern that future work should know about:
- Check if AGENTS.md exists in the project root
- Add patterns like: 'This codebase uses X for Y' or 'Always do Z when changing W'
- Only add genuinely reusable knowledge, not task-specific details

## End Condition

After completing your task, check PRD.md:
- If ALL tasks are [x], output exactly: <promise>COMPLETE</promise>
- If tasks remain [ ], just end your response (next iteration will continue)
"@

    # Capture stdout+stderr and preserve newlines for reliable printing + COMPLETE token detection
    $result = (& claude --dangerously-skip-permissions -p $prompt 2>&1 | Out-String)

    Write-Host $result
    Write-Host ""

    if ($LASTEXITCODE -ne 0) {
        Write-Warning "claude exited with code $LASTEXITCODE (continuing to next iteration)"
    }

    if ($result -match "<promise>COMPLETE</promise>") {
        Write-Host "==========================================="
        Write-Host "  All tasks complete after $i iterations!"
        Write-Host "==========================================="
        exit 0
    }

    Start-Sleep -Seconds $SleepSeconds
}

Write-Host "==========================================="
Write-Host "  Reached max iterations ($MaxIterations)"
Write-Host "==========================================="
exit 1
```

**Uso:**
```powershell
.\ralph.ps1 -MaxIterations 20 -SleepSeconds 5
# Executa até 20 iterações, aguardando 5 segundos entre cada
```

## Script vs. AIOS Squad: Comparação

| Aspecto | Script Original (ralph.sh/ps1) | AIOS Squad (ralph) |
|--------|------|----------|
| **Mecanismo de Loop** | Script externo em loop | Agente Ralph + Tasks |
| **Contexto Fresco** | Nova sessão CLI a cada iter | Subagents via Task tool |
| **Memória** | PRD.md, progress.txt | progress.md, ralph-state.yaml, decision-log.md |
| **Escalabilidade** | ~10-50 iterações | Iterações infinitas c/ auto-reset |
| **Integração** | Standalone | Full AIOS ecosystem (@dev, @qa, @architect, etc) |
| **Inteligência** | Fixa (mesmo prompt sempre) | Dinâmica (seleciona agente certo por tarefa) |
| **Automação** | Completamente autônoma | Autônoma + modo interactive |

## Key Insights (O "Ouro")

### 1. Context Management é Tudo
O sucesso de Ralph não vem apenas da repetição, mas do **gerenciamento inteligente de contexto**. Cada iteração começa "limpa" sem ser poluída por erros anteriores.

### 2. Memória em Arquivos, não em Chat
A diferença crucial entre Ralph e plugins tradicionais é que Ralph **nunca confia no histórico da conversa** para memória. Tudo persiste em arquivos.

### 3. Escalabilidade Infinita
Com contexto fresco em cada iteração, Ralph pode teoricamente rodar **100, 1000, ou mais iterações** sem degradação. O limite é prático (time/cost), não técnico.

### 4. Simplicidade é Força
Ralph é "apenas um loop de Bash" que chama Claude com um prompt bem definido. Nenhuma complexidade desnecessária.

## Evolução no AIOS

A implementação Ralph no AIOS Squad expande o conceito original:

✅ **Mantém:** Contexto fresco por iteração, memória em arquivos, simplicidade
✨ **Adiciona:** Agent swarm (seleciona especialista), dual-layer context management, decision logging
🚀 **Permite:** Iterações infinitas, modo interactive, configurabilidade

---

**Próxima Leitura:** Veja [README.md](../README.md) para guia completo do Ralph AIOS Squad.
