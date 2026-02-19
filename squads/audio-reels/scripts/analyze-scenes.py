#!/usr/bin/env python3
"""
Audio Reels — Step 2: Analise de Cenas via Gemini 2.0 Flash
Recebe transcricao JSON, retorna Video Spec JSON parcial com cenas.
"""

import sys
import os
import json
import re
import urllib.request
import yaml

def load_api_key():
    creds_path = os.path.expanduser("~/.config/aios/credentials.yaml")
    with open(creds_path) as f:
        creds = yaml.safe_load(f)
    return creds["google"]["api_key"]

SYSTEM_PROMPT = """You are a cinema scene director and comic book artist analyzing an audio transcription to create a scene breakdown for a vertical video (9:16, Reels/TikTok/Shorts).

Given a transcription with word-level timestamps, produce a JSON VideoSpec.

DECISION TREE (apply strictly for each scene):

Step 1 - audio_layer:
- Voice about feelings/reflection → "voice-introspective"
- Voice describing scene/action → "voice-descriptive"
- Silence + sound effect described → "sfx-dominant"
- Voice + sound effect simultaneous → "mixed"
- Pause without voice or sfx → "ambient"

Step 2 - shot_type (based on audio_layer):
- voice-introspective → "close-up" or "extreme-close-up"
- voice-descriptive → "wide-shot" or "establishing-shot" or "low-angle"
- sfx-dominant → "insert-shot"
- mixed → "over-the-shoulder" or "medium-shot"
- ambient → "wide-shot" or "establishing-shot"

Step 3 - camera_movement (based on mood):
- tension → "slow-zoom-in" or "handheld-shake"
- triumph → "slow-zoom-out" or "ken-burns"
- sadness → "static" or "slow-zoom-in"
- humor → "ken-burns"
- reflection → "slow-zoom-in"
- urgency → "handheld-shake"
- revelation → "dolly-in"
- neutral → "ken-burns"

Step 4 - transition_in:
- First scene → "fade-from-black"
- Same mood as previous → "cut"
- Mood change → "dissolve"
- Abrupt change (strong sfx) → "cut"

Step 5 - SFX:
- If text mentions a specific sound → sfx with description in English
- Otherwise → sfx = null

IMAGE PROMPT RULES (CRITICAL — follow exactly):

Each image_prompt must be a RICH, CINEMATIC scene description written for a comic book illustrator. Never write vague or generic prompts.

MANDATORY STRUCTURE for every image_prompt:
"{Shot type} of {subject with detailed physical description}, {specific action/pose}, {environment with 3+ concrete details}, {lighting description}, {specific objects/props visible}"

STYLE DIRECTION (applied via prompt_suffix, do NOT repeat in image_prompt):
- Comic book illustration with clean ink outlines, slightly irregular hand-drawn linework
- Cel-shaded coloring with hard shadows (defined shapes, not soft gradients)
- Muted warm color palette: beige, ochre, grayish blue, desaturated tones
- Fine grain texture simulating old paper or vintage film stock
- NOT photorealistic — must look like a hand-drawn graphic novel panel

GOOD image_prompt examples:
- "Close-up shot of a Brazilian woman talking on her smartphone inside a moving car at night, rain droplets on the window behind her, warm dashboard lights reflecting on her face, tired but determined expression, detailed skin texture, earrings catching light."
- "Wide shot of a cozy cafeteria in Brasilia at night, heavy rain pouring outside the glass windows, warm interior lighting with wooden tables, two people sitting across from each other with coffee cups and a laptop open, modernist Brasilia architecture visible through rain-streaked glass, puddles reflecting neon signs on the sidewalk."
- "Low-angle shot of a man in a crowded bus wiping sweat from his forehead, surrounded by dozens of tired commuters holding rails, golden afternoon light streaming through dirty windows, worn leather seats, a woman checking her phone nearby."

BAD image_prompt examples (NEVER do this):
- "A worried woman's face" (too vague, no environment, no details)
- "Rainy street scene" (generic, no specifics)
- "Person holding phone" (no context, no emotion, no setting)

GENERAL RULES:
1. Segment by NARRATIVE BEATS (emotion/scene changes), NOT fixed time
2. image_prompt must be in English, 40-80 words, RICHLY descriptive
3. Do NOT include style suffix in image_prompt (will be added later)
4. Scenes must be contiguous: scene[n].end == scene[n+1].start
5. Last scene MUST end at the audio duration (cover full audio)
6. No scene shorter than 1.5s or longer than 7s
7. NEVER use the same shot_type twice in a row
8. First scene MUST be close-up or extreme-close-up (hook)
9. SFX only when text EXPLICITLY mentions a sound

Return ONLY valid JSON (no markdown fences)."""

def analyze_scenes(transcription, api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

    # Send only text + segments to Gemini (NOT the full words array - too verbose)
    transcription_lite = {
        "text": transcription.get("text", ""),
        "language": transcription.get("language", "pt-BR"),
        "duration_seconds": transcription.get("duration_seconds", 30),
        "segments": transcription.get("segments", []),
    }

    user_prompt = f"""Transcription:
{json.dumps(transcription_lite, ensure_ascii=False, indent=2)}

Create a VideoSpec JSON with this structure:
{{
  "version": "1.0.0",
  "metadata": {{
    "audio_source": "original.mp3",
    "duration_seconds": {transcription.get('duration_seconds', 30)},
    "fps": 30,
    "width": 1080,
    "height": 1920,
    "total_scenes": <number>,
    "created_at": "2026-02-15T00:00:00Z"
  }},
  "style": {{
    "name": "cinematic-dark",
    "reference_image": "reference.png",
    "prompt_suffix": "Comic book illustration, clean ink outlines, graphic novel aesthetic, muted earth tone color palette, cel-shaded coloring with hard shadows, slightly irregular hand-drawn linework, fine grain texture like vintage paper, NOT photorealistic",
    "seed": 42
  }},
  "subtitles": {{
    "enabled": true,
    "position": "bottom-safe",
    "style": "word-by-word",
    "font_family": "Inter",
    "font_size": 48,
    "font_weight": "bold",
    "color": "#FFFFFF",
    "stroke_color": "#000000",
    "stroke_width": 3,
    "highlight_color": "#FFD700"
  }},
  "scenes": [
    {{
      "id": 1,
      "start": 0.0,
      "end": 4.0,
      "duration": 4.0,
      "shot_type": "close-up",
      "camera_movement": "slow-zoom-in",
      "transition_in": "fade-from-black",
      "image_prompt": "English description of visual scene",
      "subtitle_text": "Texto em portugues",
      "sfx": null,
      "mood": "tension",
      "audio_layer": "voice-introspective"
    }}
  ]
}}

IMPORTANT:
- Do NOT include subtitle_words (will be computed from transcription data)
- Return ONLY the JSON. No explanations. No markdown."""

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": SYSTEM_PROMPT + "\n\n" + user_prompt}]}
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 32768
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=180) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    raw_text = result["candidates"][0]["content"]["parts"][0]["text"]

    clean = raw_text.strip()
    if clean.startswith("```"):
        first_nl = clean.index("\n") if "\n" in clean else 3
        clean = clean[first_nl+1:]
    if clean.endswith("```"):
        clean = clean[:-3]
    clean = clean.strip()

    # Fix trailing commas (common LLM JSON issue)
    clean = re.sub(r',\s*([}\]])', r'\1', clean)

    try:
        return json.loads(clean)
    except json.JSONDecodeError as e:
        # Save raw for debug and try to find/fix the issue
        print(f"[analyze] JSON parse error: {e}")
        debug_path = "/tmp/analyze_scenes_debug.txt"
        with open(debug_path, "w") as dbg:
            dbg.write(clean)
        print(f"[analyze] Raw JSON saved to {debug_path}")

        # Try to truncate at last complete scene (find last valid closing)
        # Look for the pattern: last complete }] before the error
        last_good = clean.rfind('}]')
        if last_good > 0:
            truncated = clean[:last_good+2] + '}'
            try:
                return json.loads(truncated)
            except json.JSONDecodeError:
                pass
        raise

def get_audio_duration(audio_path):
    """Get real audio duration via ffprobe."""
    import subprocess
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", audio_path],
            capture_output=True, text=True, timeout=10
        )
        return float(result.stdout.strip())
    except Exception:
        return None


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 analyze-scenes.py <transcription.json> <output_spec.json> [audio_file]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    audio_path = sys.argv[3] if len(sys.argv) > 3 else None

    with open(input_path, encoding="utf-8") as f:
        transcription = json.load(f)

    # Get REAL audio duration (never trust transcription duration alone)
    real_duration = None
    if audio_path:
        real_duration = get_audio_duration(audio_path)
    if real_duration:
        transcription["duration_seconds"] = real_duration
        print(f"[analyze] Audio duration (ffprobe): {real_duration:.2f}s")
    else:
        print(f"[analyze] Audio duration (transcription): {transcription.get('duration_seconds', '?')}s")

    api_key = load_api_key()
    print(f"[analyze] Transcription: {len(transcription.get('words', []))} words")
    print(f"[analyze] Model: gemini-2.0-flash")
    print(f"[analyze] Analyzing scenes...")

    spec = analyze_scenes(transcription, api_key)

    n_scenes = len(spec.get("scenes", []))
    print(f"[analyze] Generated {n_scenes} scenes")

    # Compute subtitle_words for each scene from transcription words
    all_words = transcription.get("words", [])
    if all_words:
        for scene in spec.get("scenes", []):
            scene_start = scene["start"]
            scene_end = scene["end"]
            scene_words = [
                w for w in all_words
                if w.get("start", 0) >= scene_start - 0.05
                and w.get("start", 0) < scene_end + 0.05
            ]
            scene["subtitle_words"] = scene_words
            if not scene.get("subtitle_text"):
                scene["subtitle_text"] = " ".join(w["word"] for w in scene_words)
        total_assigned = sum(len(s.get("subtitle_words", [])) for s in spec["scenes"])
        print(f"[analyze] Assigned {total_assigned}/{len(all_words)} words to scenes")

    # CRITICAL: Force metadata and last scene to match real audio duration
    if real_duration:
        spec["metadata"]["duration_seconds"] = real_duration
        scenes = spec.get("scenes", [])
        if scenes and scenes[-1]["end"] < real_duration:
            old_end = scenes[-1]["end"]
            scenes[-1]["end"] = real_duration
            scenes[-1]["duration"] = round(real_duration - scenes[-1]["start"], 2)
            print(f"[analyze] FIXED: Extended last scene from {old_end:.1f}s to {real_duration:.1f}s")

    # Validate basic contiguity
    scenes = spec.get("scenes", [])
    for i, s in enumerate(scenes):
        if s["start"] >= s["end"]:
            print(f"[analyze] WARNING: Scene {s['id']} has start >= end")
        if i > 0:
            gap = abs(s["start"] - scenes[i-1]["end"])
            if gap > 0.2:
                print(f"[analyze] WARNING: Gap {gap:.2f}s between scene {scenes[i-1]['id']} and {s['id']}")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(spec, f, ensure_ascii=False, indent=2)

    print(f"[analyze] Saved: {output_path}")

if __name__ == "__main__":
    main()
