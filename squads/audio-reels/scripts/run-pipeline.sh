#!/bin/bash
# Audio Reels — Full Pipeline Orchestrator (v2.0.0)
# Usage: ./run-pipeline.sh <audio_file> [output_name] [--style STYLE]
#
# Requires:
#   - API keys in ~/.config/aios/credentials.yaml (google, freepik, elevenlabs)
#   - Character reference image at {output_dir}/assets/character-reference.png
#   - ffmpeg, python3, node.js 18+

SQUAD_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ROOT="$(cd "$SQUAD_DIR/../.." && pwd)"
SCRIPTS="$SQUAD_DIR/scripts"
REMOTION="$SQUAD_DIR/templates/remotion-reels"

AUDIO_FILE="$1"
SLUG="${2:-test}"
DATE=$(date +%Y-%m-%d)
WORK_DIR="$PROJECT_ROOT/outputs/audio-reels/${DATE}_${SLUG}"

if [ -z "$AUDIO_FILE" ]; then
    echo "Usage: $0 <audio_file> [output_name]"
    echo "Example: $0 /path/to/audio.ogg meu-reel"
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo "ERROR: Audio file not found: $AUDIO_FILE"
    exit 1
fi

# ── Pre-flight: Validate API Keys ──
echo "── Pre-flight: Checking API Keys ──"
CREDS="$HOME/.config/aios/credentials.yaml"
if [ ! -f "$CREDS" ]; then
    echo "ERROR: Credentials file not found: $CREDS"
    echo "  Run: mkdir -p ~/.config/aios && nano ~/.config/aios/credentials.yaml"
    exit 1
fi

GOOGLE_KEY=$(python3 -c "import yaml; c=yaml.safe_load(open('$CREDS')); print(c.get('google',{}).get('api_key',''))" 2>/dev/null)
FREEPIK_KEY=$(python3 -c "import yaml; c=yaml.safe_load(open('$CREDS')); print(c.get('freepik',{}).get('api_key',''))" 2>/dev/null)
ELEVENLABS_KEY=$(python3 -c "import yaml; c=yaml.safe_load(open('$CREDS')); print(c.get('elevenlabs',{}).get('api_key',''))" 2>/dev/null)

KEYS_OK=true
if [ -z "$GOOGLE_KEY" ]; then
    echo "  ✗ Google Gemini API key: MISSING"
    KEYS_OK=false
else
    echo "  ✓ Google Gemini API key: OK"
fi
if [ -z "$FREEPIK_KEY" ]; then
    echo "  ✗ Freepik (Kling AI) API key: MISSING"
    KEYS_OK=false
else
    echo "  ✓ Freepik (Kling AI) API key: OK"
fi
if [ -z "$ELEVENLABS_KEY" ]; then
    echo "  ✗ ElevenLabs API key: MISSING"
    KEYS_OK=false
else
    echo "  ✓ ElevenLabs API key: OK"
fi

if [ "$KEYS_OK" = false ]; then
    echo ""
    echo "ERROR: Missing API keys. Add them to: $CREDS"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════"
echo "  Audio Reels Pipeline v2.0"
echo "═══════════════════════════════════════════"
echo "  Audio: $AUDIO_FILE"
echo "  Output: $WORK_DIR"
echo "  Date: $DATE"
echo "═══════════════════════════════════════════"
echo ""

START_TIME=$(date +%s)

# Setup
mkdir -p "$WORK_DIR/assets/scenes" "$WORK_DIR/assets/sfx" "$WORK_DIR/assets/videos"

# ── Pre-flight: Validate Character Reference ──
CHAR_REF="$WORK_DIR/assets/character-reference.png"
if [ ! -f "$CHAR_REF" ]; then
    # Try JPG variant
    CHAR_REF_JPG="$WORK_DIR/assets/character-reference.jpg"
    if [ ! -f "$CHAR_REF_JPG" ]; then
        echo "═══════════════════════════════════════════"
        echo "  ⚠ CHARACTER REFERENCE REQUIRED"
        echo "═══════════════════════════════════════════"
        echo ""
        echo "  The pipeline requires a frontal photo of the"
        echo "  character to ensure visual consistency."
        echo ""
        echo "  Place it at:"
        echo "    $CHAR_REF"
        echo ""
        echo "  Requirements:"
        echo "    - PNG or JPG, min 512x512 px"
        echo "    - Frontal face/bust, neutral background"
        echo ""
        echo "═══════════════════════════════════════════"
        exit 1
    else
        CHAR_REF="$CHAR_REF_JPG"
    fi
fi
echo "[preflight] ✓ Character reference: $CHAR_REF"
echo ""

# Step 0: Convert audio to MP3
echo "── Step 0: Audio Conversion ──"
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO_FILE" 2>/dev/null)
echo "[convert] Duration: ${DURATION}s"

MP3_PATH="$WORK_DIR/original.mp3"
ffmpeg -y -i "$AUDIO_FILE" -vn -ac 1 -ar 16000 -b:a 64k "$MP3_PATH" 2>/dev/null
if [ ! -f "$MP3_PATH" ]; then
    echo "ERROR: Audio conversion failed"
    exit 1
fi
echo "[convert] ✓ Converted to MP3"
echo ""

# Step 1: Transcription (Gemini Flash)
echo "── Step 1: Transcription (Gemini Flash) ──"
TRANS_PATH="$WORK_DIR/transcription.json"
python3 "$SCRIPTS/transcribe.py" "$AUDIO_FILE" "$TRANS_PATH"
if [ $? -ne 0 ] || [ ! -f "$TRANS_PATH" ]; then
    echo "ERROR: Transcription failed"
    exit 1
fi
echo ""

# Step 2: Scene Analysis (Gemini Pro)
echo "── Step 2: Scene Analysis (Gemini Pro) ──"
SPEC_PATH="$WORK_DIR/spec.json"
python3 "$SCRIPTS/analyze-scenes.py" "$TRANS_PATH" "$SPEC_PATH" "$MP3_PATH"
if [ $? -ne 0 ] || [ ! -f "$SPEC_PATH" ]; then
    echo "ERROR: Scene analysis failed"
    exit 1
fi
echo ""

# Step 3a: Generate Images (parallel start)
echo "── Step 3a: Image Generation (Gemini 2.5 Flash) ──"
python3 "$SCRIPTS/generate-images.py" "$SPEC_PATH" "$WORK_DIR/assets/scenes"
if [ $? -ne 0 ]; then
    echo "ERROR: Image generation failed"
    exit 1
fi
echo ""

# Step 3b: Generate SFX
echo "── Step 3b: SFX Generation (ElevenLabs) ──"
python3 "$SCRIPTS/generate-sfx.py" "$SPEC_PATH" "$WORK_DIR/assets"
echo ""

# Step 3c: Generate Video Clips (Kling AI via Freepik) — MANDATORY
echo "── Step 3c: Video Animation (Kling AI via Freepik) ──"
echo "[kling] Generating animated video clips from images..."
echo "[kling] Using character reference for consistency"
python3 "$SCRIPTS/generate-videos.py" \
    --spec-dir "$WORK_DIR" \
    --api-key "$FREEPIK_KEY" \
    --character-image "$CHAR_REF"
KLING_EXIT=$?

if [ $KLING_EXIT -ne 0 ]; then
    echo "[kling] ⚠ Some scenes may have failed with video-reference."
    echo "[kling] Retrying failed scenes with first-frame endpoint..."
    # Retry without character-image for scenes that failed
    python3 "$SCRIPTS/generate-videos.py" \
        --spec-dir "$WORK_DIR" \
        --api-key "$FREEPIK_KEY" \
        --skip-existing
    if [ $? -ne 0 ]; then
        echo "ERROR: Video generation failed completely"
        exit 1
    fi
fi

# Verify at least some video clips exist
VIDEO_COUNT=$(ls "$WORK_DIR/assets/videos/"*.mp4 2>/dev/null | wc -l | tr -d ' ')
if [ "$VIDEO_COUNT" -eq 0 ]; then
    echo "ERROR: No video clips generated"
    exit 1
fi
echo "[kling] ✓ $VIDEO_COUNT video clips generated"
echo ""

# Step 4: Render with Remotion
echo "── Step 4: Render (Remotion) ──"
if [ -d "$REMOTION" ] && [ -f "$REMOTION/package.json" ]; then
    # Copy spec and assets to Remotion public folder
    cp "$SPEC_PATH" "$REMOTION/public/spec.json"
    cp "$MP3_PATH" "$REMOTION/public/original.mp3"
    cp -r "$WORK_DIR/assets" "$REMOTION/public/" 2>/dev/null

    OUTPUT_VIDEO="$WORK_DIR/${DATE}_${SLUG}_reels.mp4"

    cd "$REMOTION"
    npx remotion render AudioReels "$OUTPUT_VIDEO" \
        --props='{"specPath": "spec.json"}' \
        --codec=h264 \
        --width=1080 --height=1920 \
        2>&1

    if [ -f "$OUTPUT_VIDEO" ]; then
        SIZE=$(du -h "$OUTPUT_VIDEO" | awk '{print $1}')
        echo "[render] ✓ Video: $OUTPUT_VIDEO ($SIZE)"

        # Compress if > 16MB
        SIZE_BYTES=$(stat -f%z "$OUTPUT_VIDEO" 2>/dev/null || stat -c%s "$OUTPUT_VIDEO" 2>/dev/null)
        if [ "$SIZE_BYTES" -gt 16777216 ]; then
            echo "[render] Compressing (>16MB)..."
            COMPRESSED="$WORK_DIR/${DATE}_${SLUG}_reels_compressed.mp4"
            ffmpeg -y -i "$OUTPUT_VIDEO" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k "$COMPRESSED" 2>/dev/null
            if [ -f "$COMPRESSED" ]; then
                SIZE=$(du -h "$COMPRESSED" | awk '{print $1}')
                echo "[render] ✓ Compressed: $COMPRESSED ($SIZE)"
            fi
        fi
    else
        echo "[render] ✗ Render failed"
    fi
    cd "$PROJECT_ROOT"
else
    echo "[render] ⚠ Remotion template not found. Skipping render."
    echo "[render] Spec JSON and assets are ready at: $WORK_DIR/"
fi
echo ""

# Save final spec
mkdir -p "$PROJECT_ROOT/outputs/audio-reels/specs"
cp "$SPEC_PATH" "$PROJECT_ROOT/outputs/audio-reels/specs/${DATE}_${SLUG}_spec.json" 2>/dev/null

# Summary
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo "═══════════════════════════════════════════"
echo "  Pipeline Complete"
echo "═══════════════════════════════════════════"
echo "  Duration: ${ELAPSED}s"
echo "  Work dir: $WORK_DIR"
echo "  Spec: $SPEC_PATH"
echo "  Videos: $VIDEO_COUNT clips"
echo "  Assets: $WORK_DIR/assets/"
echo "═══════════════════════════════════════════"
