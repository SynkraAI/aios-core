#!/usr/bin/env python3
"""
Audio Reels — Step 3b: Geracao de SFX via ElevenLabs Sound Effects API
Le video spec JSON, gera SFX para cenas que tem sfx != null.
"""

import sys
import os
import json
import urllib.request
import yaml
import time

def load_api_key():
    creds_path = os.path.expanduser("~/.config/aios/credentials.yaml")
    with open(creds_path) as f:
        creds = yaml.safe_load(f)
    return creds["elevenlabs"]["api_key"]

def generate_sfx(description, duration, api_key, output_path):
    url = "https://api.elevenlabs.io/v1/sound-generation"

    payload = json.dumps({
        "text": description,
        "duration_seconds": min(duration, 22.0),
        "prompt_influence": 0.5
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "xi-api-key": api_key
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        audio_data = resp.read()

    with open(output_path, "wb") as f:
        f.write(audio_data)

    return len(audio_data) > 1024

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generate-sfx.py <spec.json> <assets_dir>")
        sys.exit(1)

    spec_path = sys.argv[1]
    assets_dir = sys.argv[2]
    sfx_dir = os.path.join(assets_dir, "sfx")
    os.makedirs(sfx_dir, exist_ok=True)

    with open(spec_path, encoding="utf-8") as f:
        spec = json.load(f)

    api_key = load_api_key()
    scenes = spec.get("scenes", [])
    sfx_scenes = [s for s in scenes if s.get("sfx") and s["sfx"] is not None]

    if not sfx_scenes:
        print("[sfx] No SFX scenes found. Skipping.")
        return

    print(f"[sfx] Generating {len(sfx_scenes)} sound effects...")

    success = 0
    failed = 0

    for scene in sfx_scenes:
        scene_id = scene["id"]
        sfx = scene["sfx"]

        # Handle both string and object formats
        if isinstance(sfx, str):
            desc = sfx
            dur = 3.0
            scene["sfx"] = {"description": desc, "duration": dur, "volume": 0.4, "start": scene["start"]}
            sfx = scene["sfx"]
        else:
            desc = sfx.get("description", "")
            dur = sfx.get("duration", 3.0)

        output_path = os.path.join(sfx_dir, f"sfx_{scene_id:03d}.mp3")
        print(f"[sfx] Scene {scene_id}: {desc[:50]}...")

        try:
            ok = generate_sfx(desc, dur, api_key, output_path)
            if ok:
                sfx["file_path"] = output_path
                success += 1
                print(f"[sfx]   ✓ {os.path.getsize(output_path) / 1024:.0f}KB")
            else:
                failed += 1
                print(f"[sfx]   ✗ Too small")
        except Exception as e:
            failed += 1
            print(f"[sfx]   ✗ Error: {e}")

        time.sleep(1)

    # Save updated spec
    with open(spec_path, "w", encoding="utf-8") as f:
        json.dump(spec, f, ensure_ascii=False, indent=2)

    print(f"[sfx] Done: {success} success, {failed} failed")

if __name__ == "__main__":
    main()
