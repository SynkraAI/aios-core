---
task-id: generate-sfx
name: "Gerar Efeitos Sonoros"
agent: sfx-designer
version: 1.0.0
purpose: "Gerar SFX via ElevenLabs Sound Effects API para cenas com efeitos sonoros"
executor: Worker
workflow-mode: automatic
elicit: false

inputs:
  - name: video_spec_json
    type: file
    required: true
    description: "JSON spec com sfx decisions por cena"

outputs:
  - path: "{output_dir}/assets/sfx/"
    description: "Diretório com arquivos SFX (sfx_001.mp3, etc.)"
  - path: "{output_dir}/spec-with-sfx.json"
    description: "JSON spec atualizado com sfx.file_path"

validation:
  success-criteria:
    - "Todos os SFX necessários foram gerados"
    - "Cada arquivo > 1KB"
---

# Gerar Efeitos Sonoros

## Steps

### Step 1: Filtrar Cenas com SFX

```yaml
actions:
  - Ler video_spec_json
  - Filtrar: scenes where sfx != null
  - Contar total de SFX necessários
  - Se 0: skip task (nada a gerar)
```

### Step 2: Enriquecer Descrições

```yaml
actions:
  - Para cada SFX: consultar data/sfx-lookup.yaml
  - Se keyword encontrada: usar descrição enriquecida
  - Se não encontrada: usar sfx.description original
  - Aplicar Ben Burtt Organic Sound Design principles
```

### Step 3: Gerar via ElevenLabs

```python
import requests, json, os, yaml

# Credentials
with open(os.path.expanduser("~/.config/aios/credentials.yaml")) as f:
    creds = yaml.safe_load(f)
API_KEY = creds["elevenlabs"]["api_key"]

ENDPOINT = "https://api.elevenlabs.io/v1/sound-generation"
headers = {"xi-api-key": API_KEY, "Content-Type": "application/json"}

output_dir = "assets/sfx"
os.makedirs(output_dir, exist_ok=True)

for scene in spec["scenes"]:
    if scene.get("sfx") is None:
        continue

    sfx = scene["sfx"]
    payload = {
        "text": sfx["description"],
        "duration_seconds": sfx.get("duration", 2.0),
        "prompt_influence": 0.5
    }

    try:
        resp = requests.post(ENDPOINT, headers=headers, json=payload, timeout=30)
        if resp.status_code == 200:
            path = f"{output_dir}/sfx_{scene['id']:03d}.mp3"
            with open(path, "wb") as f:
                f.write(resp.content)
            sfx["file_path"] = path
            print(f"OK: sfx_{scene['id']:03d}.mp3")
        else:
            print(f"FAIL: {resp.status_code} - {resp.text}")
            scene["sfx"] = None  # Fallback: skip SFX
    except Exception as e:
        print(f"FAIL: sfx_{scene['id']:03d} - {e}")
        scene["sfx"] = None
```

### Step 4: Validar

```yaml
actions:
  - Verificar cada sfx.file_path existe
  - Fallback gracioso: se SFX falhou, sfx = null (pipeline continua)
```

## Cost

~$0.01 por efeito. Para 3 efeitos = ~$0.03
