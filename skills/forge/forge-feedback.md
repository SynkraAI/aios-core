# Forge Feedback Loop — User Evaluates Results

> O Forge que pede feedback é o Forge que melhora sozinho.

---

## 1. Previous Run Feedback

At the start of a new run, check if there's a previous run in this project that hasn't received feedback.

### Step 1: Find previous runs

Glob `.aiox/forge-runs/*/state.json` where:
- `status == "completed"`
- `project.path` matches current cwd
- No entry exists in `.aiox/memory/forge/feedback.yaml` with this `run_id`

Sort by `completed_at` descending. Take the most recent.

### Step 2: Show feedback prompt

If an unfeedback'd run is found:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💬 Feedback — Último run neste projeto
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Run: {run_id}
  Data: {completed_at formatado}
  Stories: {stories_completed} implementadas
  PR: {pr_url or "sem deploy"}

  Como foi o resultado?

  > 1. **Ficou ótimo** — não precisei mudar nada
  > 2. **Ficou bom, mas...** — funcionou, mas ajustei algumas coisas
  > 3. **Não ficou bom** — precisei refazer bastante
  > 4. **Pular** — vamos direto ao novo run
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Capture follow-up

- **Opção 1 (ótimo):** Save `score: "great"`, no follow-up needed.
- **Opção 2 (bom, mas...):** Ask: "O que você ajustou depois? Isso me ajuda a melhorar."
  Save `score: "good_but"`, `comment: {user's response}`.
- **Opção 3 (não ficou bom):** Ask: "O que deu errado? Me conta pra eu não repetir."
  Save `score: "poor"`, `comment: {user's response}`.
- **Opção 4 (pular):** Skip silently, proceed to new run. Do NOT save feedback.

### Step 4: Persist

Save to `.aiox/memory/forge/feedback.yaml`:

```yaml
feedback:
  - run_id: "{run_id}"
    project: "{project path}"
    score: "great | good_but | poor"
    comment: "{user comment or null}"
    timestamp: "{ISO 8601}"
```

Create the file/directory if it doesn't exist.

---

## 2. Current Run Feedback

After the completion banner at the end of a run, offer quick feedback.

### Display

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Feedback rápido (opcional):

  > 1. 👍 Tudo certo
  > 2. 👎 Teve problemas
  > 3. Pular

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Behavior

- This is **NON-BLOCKING** — the run is already complete.
- If user responds:
  - Option 1: Save `score: "thumbs_up"` to `state.json → plugins.forge_feedback`
  - Option 2: Save `score: "thumbs_down"`, ask brief follow-up: "O que deu errado?"
  - Option 3: Skip, no save
- The feedback is stored in state.json for now.
  The forge-memory plugin will pick it up and persist it at the next run's `after:run`.

### What NOT to do

- Do NOT show feedback prompt if the run failed or was interrupted
- Do NOT show feedback for DRY_RUN mode (nothing was executed)
- Do NOT block or delay completion waiting for feedback
- Do NOT ask more than 1 follow-up question
