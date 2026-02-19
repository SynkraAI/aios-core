---
task-id: generate-scene-images
name: "Gerar Imagens das Cenas"
agent: image-prompter
version: 1.0.0
purpose: "Batch generation de imagens 9:16 via Nano Banana 2.5 Flash para cada cena"
executor: Worker
workflow-mode: automatic
elicit: false

inputs:
  - name: video_spec_json
    type: file
    required: true
    description: "JSON spec parcial com image_prompt por cena"
  - name: reference_image
    type: file
    required: true
    description: "Reference image fixa do personagem"
  - name: style_config
    type: object
    required: true
    description: "Style config (prompt_suffix, seed, color_palette)"

outputs:
  - path: "{output_dir}/assets/scenes/"
    description: "Diretório com imagens scene_001.png, scene_002.png, etc."
  - path: "{output_dir}/spec-with-images.json"
    description: "JSON spec atualizado com image_path por cena"

validation:
  success-criteria:
    - "Todas as cenas têm imagem gerada"
    - "Cada imagem > 10KB"
    - "JSON atualizado com paths corretos"
---

# Gerar Imagens das Cenas

## Steps

### Step 1: Preparar

```yaml
actions:
  - Ler video_spec_json
  - Criar diretório: {output_dir}/assets/scenes/
  - Carregar style_config (prompt_suffix, seed)
  - Contar total de cenas
```

### Step 2: Gerar Imagens (batch)

```python
import json, base64, urllib.request, os, yaml

# Credentials
with open(os.path.expanduser("~/.config/aios/credentials.yaml")) as f:
    creds = yaml.safe_load(f)
API_KEY = creds["google"]["api_key"]

MODEL = "gemini-2.5-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

# Load spec
with open(SPEC_PATH) as f:
    spec = json.load(f)

style_suffix = spec["style"]["prompt_suffix"]
output_dir = "assets/scenes"
os.makedirs(output_dir, exist_ok=True)

for scene in spec["scenes"]:
    scene_id = scene["id"]
    prompt = f"{scene['image_prompt']}\n\n{style_suffix}\n\nAspect ratio: 9:16 vertical. Resolution: 1080x1920."

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "9:16"}
        }
    }

    # Call API
    json_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT, data=json_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        for part in data["candidates"][0]["content"]["parts"]:
            if "inlineData" in part:
                img_data = base64.b64decode(part["inlineData"]["data"])
                path = f"{output_dir}/scene_{scene_id:03d}.png"
                with open(path, "wb") as f:
                    f.write(img_data)
                scene["image_path"] = path
                print(f"OK: scene_{scene_id:03d}.png ({len(img_data)} bytes)")
    except Exception as e:
        print(f"FAIL: scene_{scene_id:03d} - {e}")
        scene["image_path"] = None

# Save updated spec
with open(SPEC_OUTPUT_PATH, "w") as f:
    json.dump(spec, f, indent=2, ensure_ascii=False)
```

### Step 3: Validar

```yaml
actions:
  - Para cada cena: verificar image_path existe e > 10KB
  - Contar sucessos vs falhas
  - Se > 50% falhou: abortar
  - Se < 50% falhou: retry cenas faltantes (max 2x)
```

## Cost

~$0.04 por imagem. Para 8 cenas = ~$0.32
