---
task-id: optimize-pacing
name: "Otimizar Pacing para Reels"
agent: reels-optimizer
version: 1.0.0
purpose: "Revisa JSON spec e ajusta pacing, hook visual, duração de cenas para máxima retenção"
executor: Agent
workflow-mode: automatic
elicit: false

inputs:
  - name: video_spec_json
    type: file
    required: true
    description: "JSON spec completo com todos os assets"

outputs:
  - path: "{output_dir}/spec-optimized.json"
    description: "JSON spec com ajustes de pacing aplicados"
---

# Otimizar Pacing para Reels

## Steps

### Step 1: Analisar Pacing Atual

```yaml
actions:
  - Calcular duração média de cenas
  - Identificar cenas > 6s (candidatas a split)
  - Verificar variação de shot_type entre consecutivas
  - Avaliar hook (primeira cena)
```

### Step 2: Aplicar Regras Paddy Galloway

```yaml
rules:
  hook:
    - Se cena 1 é wide-shot estático: trocar para close-up + slow-zoom-in
    - Se cena 1 > 4s: considerar split
    - Se cena 1 transition_in != fade-from-black: corrigir

  pacing:
    - Se cena > 6s: split no ponto natural (pausa de fala)
    - Se 2 cenas consecutivas com mesmo shot_type: trocar uma
    - Se 3 cenas estáticas seguidas: forçar ken-burns na do meio

  ending:
    - Se última cena termina abrupta: adicionar 0.5s de fade
```

### Step 3: Documentar Mudanças

```yaml
actions:
  - Adicionar _optimization_log ao JSON com cada mudança feita
  - Salvar JSON otimizado
```
