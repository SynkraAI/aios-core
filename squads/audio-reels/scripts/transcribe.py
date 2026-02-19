#!/usr/bin/env python3
"""
Audio Reels — Step 1: Transcricao via Gemini 3 Flash (multimodal)
Recebe audio, retorna JSON com transcricao + timestamps por palavra.
"""

import sys
import os
import json
import re
import base64
import urllib.request
import yaml

def load_api_key():
    creds_path = os.path.expanduser("~/.config/aios/credentials.yaml")
    with open(creds_path) as f:
        creds = yaml.safe_load(f)
    return creds["google"]["api_key"]

def _call_gemini(audio_b64, mime_type, prompt, api_key):
    """Send a request to Gemini and return parsed JSON."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [
            {"inline_data": {"mime_type": mime_type, "data": audio_b64}},
            {"text": prompt}
        ]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 32768}
    }
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
    clean = raw_text.strip()
    if clean.startswith("```"):
        clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
    if clean.endswith("```"):
        clean = clean[:-3]
    clean = clean.strip()
    clean = re.sub(r',\s*([}\]])', r'\1', clean)
    return json.loads(clean)


def transcribe(audio_path, api_key):
    with open(audio_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")

    ext = os.path.splitext(audio_path)[1].lower()
    mime_map = {".ogg": "audio/ogg", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4"}
    mime_type = mime_map.get(ext, "audio/mpeg")

    # Pass 1: Get text + segments (lightweight, no word timestamps)
    print("[transcribe] Pass 1: Getting text + segments...")
    pass1 = _call_gemini(audio_b64, mime_type, """Transcreva este audio em portugues brasileiro com precisao.

Retorne APENAS um JSON valido (sem markdown, sem ```):
{
  "text": "texto completo da transcricao",
  "language": "pt-BR",
  "duration_seconds": 0.0,
  "segments": [
    {"id": 0, "text": "frase ou segmento", "start": 0.0, "end": 0.0}
  ]
}

Regras:
- Timestamps em segundos com precisao de centesimos
- Cada segment corresponde a uma frase ou pausa natural
- duration_seconds = timestamp do fim da ultima frase
- Transcreva fielmente, se nao entender use [inaudivel]""", api_key)

    text = pass1.get("text", "")
    segments = pass1.get("segments", [])
    duration = pass1.get("duration_seconds", 0)
    print(f"[transcribe] Pass 1 done: {len(text.split())} words, {len(segments)} segments, {duration:.1f}s")

    # Pass 2: Get ONLY word timestamps (maximizes token budget for words)
    print("[transcribe] Pass 2: Getting word timestamps...")
    pass2 = _call_gemini(audio_b64, mime_type, """Analisa este audio e retorna os timestamps de CADA palavra falada.

Retorne APENAS um JSON valido (sem markdown, sem ```) com esta estrutura:
{
  "words": [
    {"word": "palavra", "start": 0.0, "end": 0.0}
  ]
}

CRITICO:
- Inclua TODAS as palavras do audio, do inicio ao fim
- Timestamps em segundos com precisao de centesimos
- NAO pare antes do fim do audio
- Cada palavra deve ter start e end individuais
- Transcreva fielmente""", api_key)

    words = pass2.get("words", [])
    print(f"[transcribe] Pass 2 done: {len(words)} word timestamps")

    # If pass 2 still truncated, check and warn
    text_word_count = len(text.split())
    if words and len(words) < text_word_count * 0.9:
        last_time = words[-1].get("end", 0)
        print(f"[transcribe] WARNING: Pass 2 still truncated ({len(words)}/{text_word_count} words, last at {last_time:.1f}s)")
        # Try Pass 3: get remaining words from where pass 2 stopped
        print(f"[transcribe] Pass 3: Getting remaining words from {last_time:.1f}s...")
        try:
            pass3 = _call_gemini(audio_b64, mime_type, f"""Analisa este audio a partir do segundo {last_time:.1f} ate o final.

Retorne APENAS um JSON valido (sem markdown, sem ```) com os timestamps das palavras A PARTIR de {last_time:.1f}s:
{{
  "words": [
    {{"word": "palavra", "start": 0.0, "end": 0.0}}
  ]
}}

CRITICO:
- Comece a partir de {last_time:.1f} segundos
- Inclua TODAS as palavras ate o final do audio
- Timestamps em segundos com precisao de centesimos""", api_key)

            extra_words = pass3.get("words", [])
            # Filter to only words after the last known timestamp
            extra_words = [w for w in extra_words if w.get("start", 0) >= last_time - 0.5]
            if extra_words:
                words.extend(extra_words)
                print(f"[transcribe] Pass 3 added {len(extra_words)} words, total now: {len(words)}")
        except Exception as e:
            print(f"[transcribe] Pass 3 failed: {e}")

    return {
        "text": text,
        "language": pass1.get("language", "pt-BR"),
        "duration_seconds": duration,
        "segments": segments,
        "words": words,
    }

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 transcribe.py <audio_path> <output_json>")
        sys.exit(1)

    audio_path = sys.argv[1]
    output_path = sys.argv[2]

    if not os.path.exists(audio_path):
        print(f"ERROR: Audio file not found: {audio_path}")
        sys.exit(1)

    api_key = load_api_key()
    print(f"[transcribe] Audio: {audio_path}")
    print(f"[transcribe] Model: gemini-2.0-flash")
    print(f"[transcribe] Sending to Gemini...")

    transcription = transcribe(audio_path, api_key)

    # Validate: detect truncated word timestamps
    words = transcription.get("words", [])
    text = transcription.get("text", "")
    if words:
        last_word_time = words[-1].get("end", 0)
        text_word_count = len(text.split())
        timestamp_word_count = len(words)
        if text_word_count > timestamp_word_count * 1.1:
            print(f"[transcribe] WARNING: Text has {text_word_count} words but only {timestamp_word_count} have timestamps!")
            print(f"[transcribe] WARNING: Timestamps end at {last_word_time:.1f}s - likely truncated due to token limit")

    # Get real audio duration via ffprobe and calibrate timestamps
    import subprocess
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", audio_path],
            capture_output=True, text=True, timeout=10
        )
        real_duration = float(result.stdout.strip())
        transcription["real_duration_seconds"] = real_duration

        # Use real duration as authoritative
        transcription["duration_seconds"] = real_duration

        if words:
            last_word_time = words[-1].get("end", 0)
            # Scale word timestamps if they exceed or undershoot real duration by >10%
            if last_word_time > 0 and abs(last_word_time - real_duration) / real_duration > 0.10:
                scale = real_duration / last_word_time
                print(f"[transcribe] Scaling timestamps: {last_word_time:.1f}s → {real_duration:.1f}s (factor: {scale:.3f})")
                for w in words:
                    w["start"] = round(w["start"] * scale, 2)
                    w["end"] = round(w["end"] * scale, 2)
                # Scale segments too
                for seg in transcription.get("segments", []):
                    seg["start"] = round(seg["start"] * scale, 2)
                    seg["end"] = round(seg["end"] * scale, 2)

            last_word_time = words[-1].get("end", 0)
            if real_duration - last_word_time > 5.0:
                print(f"[transcribe] WARNING: Audio is {real_duration:.1f}s but last word timestamp is {last_word_time:.1f}s")
    except Exception:
        pass

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(transcription, f, ensure_ascii=False, indent=2)

    n_words = len(transcription.get("words", []))
    n_segs = len(transcription.get("segments", []))
    dur = transcription.get("duration_seconds", 0)
    print(f"[transcribe] Done: {n_words} words, {n_segs} segments, {dur:.1f}s")
    print(f"[transcribe] Saved: {output_path}")

if __name__ == "__main__":
    main()
