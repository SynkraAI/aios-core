#!/usr/bin/env python3
"""
Audio Reels — Step 3a: Geracao de Imagens via Nano Banana Pro (gemini-3-pro-image-preview)
Le video spec JSON, gera ilustracao para cada cena, atualiza image_path.
"""

import sys
import os
import json
import base64
import urllib.request
import yaml
import time

MODEL = "gemini-2.5-flash-image"
ASPECT_RATIO = "9:16"

def load_api_key():
    creds_path = os.path.expanduser("~/.config/aios/credentials.yaml")
    with open(creds_path) as f:
        creds = yaml.safe_load(f)
    return creds["google"]["api_key"]

def generate_image(prompt, api_key, output_path):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={api_key}"

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": ASPECT_RATIO}
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=90) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    parts = result["candidates"][0]["content"]["parts"]
    for part in parts:
        if "inlineData" in part:
            img_data = base64.b64decode(part["inlineData"]["data"])
            mime = part["inlineData"].get("mimeType", "image/png")
            ext = "png" if "png" in mime else "jpg"
            final_path = output_path if "." in os.path.basename(output_path) else f"{output_path}.{ext}"
            with open(final_path, "wb") as f:
                f.write(img_data)
            return True

    return False

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generate-images.py <spec.json> <assets_dir>")
        sys.exit(1)

    spec_path = sys.argv[1]
    assets_dir = sys.argv[2]
    os.makedirs(assets_dir, exist_ok=True)

    with open(spec_path, encoding="utf-8") as f:
        spec = json.load(f)

    api_key = load_api_key()
    style_suffix = spec.get("style", {}).get("prompt_suffix", "")
    scenes = spec.get("scenes", [])

    print(f"[images] Model: {MODEL}")
    print(f"[images] Aspect ratio: {ASPECT_RATIO}")
    print(f"[images] Generating {len(scenes)} illustrations...")
    print(f"[images] Style: {style_suffix[:60]}...")

    success = 0
    failed = 0

    for scene in scenes:
        scene_id = scene["id"]
        prompt = scene.get("image_prompt", "")
        full_prompt = f"{prompt} {style_suffix}"

        output_path = os.path.join(assets_dir, f"scene_{scene_id:03d}.png")
        print(f"[images] Scene {scene_id}: {prompt[:50]}...")

        try:
            ok = generate_image(full_prompt, api_key, output_path)
            if ok and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
                scene["image_path"] = output_path
                success += 1
                print(f"[images]   ✓ {os.path.getsize(output_path) / 1024:.0f}KB")
            else:
                failed += 1
                print(f"[images]   ✗ Failed or empty")
        except Exception as e:
            failed += 1
            print(f"[images]   ✗ Error: {e}")

        time.sleep(2)

    # Save updated spec
    with open(spec_path, "w", encoding="utf-8") as f:
        json.dump(spec, f, ensure_ascii=False, indent=2)

    print(f"[images] Done: {success} success, {failed} failed")

if __name__ == "__main__":
    main()
