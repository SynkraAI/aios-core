#!/bin/bash
# Audio Reels — Readiness Check
# Verifica se todos os prerequisitos estao prontos para executar o pipeline

SQUAD_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ROOT="$(cd "$SQUAD_DIR/../.." && pwd)"
CREDS="$HOME/.config/aios/credentials.yaml"
PASS=0
FAIL=0
WARN=0

green() { echo "✓ $1"; PASS=$((PASS+1)); }
red()   { echo "✗ $1"; FAIL=$((FAIL+1)); }
yellow(){ echo "⚠ $1"; WARN=$((WARN+1)); }

echo "═══════════════════════════════════════════"
echo "  Audio Reels — Readiness Check"
echo "═══════════════════════════════════════════"
echo ""

# 1. API Keys
echo "── API Keys ──"
if [ -f "$CREDS" ]; then
    GOOGLE_KEY=$(grep -A1 "^google:" "$CREDS" | grep "api_key:" | head -1 | awk '{print $2}')
    ELEVEN_KEY=$(grep -A1 "^elevenlabs:" "$CREDS" | grep "api_key:" | head -1 | awk '{print $2}')

    if [ -n "$GOOGLE_KEY" ] && [ "$GOOGLE_KEY" != "null" ]; then
        green "Google API key found (${GOOGLE_KEY:0:10}...)"
    else
        red "Google API key MISSING in $CREDS"
    fi

    if [ -n "$ELEVEN_KEY" ] && [ "$ELEVEN_KEY" != "null" ]; then
        green "ElevenLabs API key found (${ELEVEN_KEY:0:10}...)"
    else
        red "ElevenLabs API key MISSING in $CREDS"
    fi
else
    red "Credentials file not found: $CREDS"
fi

echo ""

# 2. Tools
echo "── Tools ──"
if command -v ffmpeg &>/dev/null; then
    VER=$(ffmpeg -version 2>/dev/null | head -1 | awk '{print $3}')
    green "ffmpeg $VER"
else
    red "ffmpeg not installed"
fi

if command -v ffprobe &>/dev/null; then
    green "ffprobe available"
else
    red "ffprobe not installed"
fi

if command -v node &>/dev/null; then
    NODE_VER=$(node -v)
    NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        green "Node.js $NODE_VER"
    else
        red "Node.js $NODE_VER (need 18+)"
    fi
else
    red "Node.js not installed"
fi

if command -v npx &>/dev/null; then
    green "npx available"
else
    red "npx not installed"
fi

if command -v python3 &>/dev/null; then
    PY_VER=$(python3 --version 2>&1 | awk '{print $2}')
    green "Python $PY_VER"
else
    red "Python 3 not installed"
fi

echo ""

# 3. Directories
echo "── Directories ──"
OUTPUT_DIR="$PROJECT_ROOT/outputs/audio-reels"
mkdir -p "$OUTPUT_DIR/specs" "$OUTPUT_DIR/assets" 2>/dev/null
green "outputs/audio-reels/ ready"
green "outputs/audio-reels/specs/ ready"
green "outputs/audio-reels/assets/ ready"

REMOTION_DIR="$SQUAD_DIR/templates/remotion-reels"
if [ -d "$REMOTION_DIR" ] && [ -f "$REMOTION_DIR/package.json" ]; then
    green "Remotion template exists"
    if [ -d "$REMOTION_DIR/node_modules" ]; then
        green "Remotion dependencies installed"
    else
        yellow "Remotion dependencies NOT installed (run: cd $REMOTION_DIR && npm install)"
    fi
else
    red "Remotion template NOT found at $REMOTION_DIR"
fi

echo ""

# 4. Squad Scripts
echo "── Pipeline Scripts ──"
for script in transcribe.py analyze-scenes.py generate-images.py generate-sfx.py run-pipeline.sh; do
    if [ -f "$SQUAD_DIR/scripts/$script" ]; then
        green "scripts/$script"
    else
        red "scripts/$script MISSING"
    fi
done

echo ""

# 5. Data Files
echo "── Data Files ──"
for data in video-spec-schema.json scene-decision-tree.md sfx-lookup.yaml audio-reels-kb.md; do
    if [ -f "$SQUAD_DIR/data/$data" ]; then
        green "data/$data"
    else
        red "data/$data MISSING"
    fi
done

echo ""

# 6. API Connectivity Tests
echo "── API Connectivity ──"
if [ -n "$GOOGLE_KEY" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_KEY" 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        green "Google Gemini API reachable (HTTP $HTTP_CODE)"
    else
        red "Google Gemini API unreachable (HTTP $HTTP_CODE)"
    fi
else
    yellow "Skipping Google API test (no key)"
fi

if [ -n "$ELEVEN_KEY" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "xi-api-key: $ELEVEN_KEY" \
        "https://api.elevenlabs.io/v1/user" 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        green "ElevenLabs API reachable (HTTP $HTTP_CODE)"
    else
        red "ElevenLabs API unreachable (HTTP $HTTP_CODE)"
    fi
else
    yellow "Skipping ElevenLabs API test (no key)"
fi

echo ""

# 7. Available Gemini Models Check
echo "── Gemini Models ──"
if [ -n "$GOOGLE_KEY" ]; then
    MODELS=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_KEY" 2>/dev/null)
    for model in "gemini-2.5-flash" "gemini-2.0-flash"; do
        if echo "$MODELS" | grep -q "$model"; then
            green "Model $model available"
        else
            yellow "Model $model not found (may need different name)"
        fi
    done
fi

echo ""

# Summary
echo "═══════════════════════════════════════════"
echo "  SUMMARY: $PASS passed, $FAIL failed, $WARN warnings"
echo "═══════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
    echo -e "\033[31m  STATUS: NOT READY — fix $FAIL issues above\033[0m"
    exit 1
else
    echo -e "\033[32m  STATUS: READY TO RUN\033[0m"
    exit 0
fi
