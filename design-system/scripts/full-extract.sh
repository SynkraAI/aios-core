#!/bin/bash
# Full Design DNA Extraction — ALL tools
# Usage: ./full-extract.sh <url> <name> [--dark-mode]

set -e

URL="$1"
NAME="$2"
DARK_MODE="$3"
AIOS_CORE="$HOME/aios-core"
OUTPUT_DIR="$AIOS_CORE/design-system/patterns/tokens/$NAME"

if [ -z "$URL" ] || [ -z "$NAME" ]; then
  echo "Usage: ./full-extract.sh <url> <name> [--dark-mode]"
  exit 1
fi

echo ""
echo "============================================"
echo "  FULL EXTRACTION: $NAME"
echo "  URL: $URL"
echo "============================================"
echo ""

# --- 1. dissect-artifact.cjs (static: tokens, components, screenshots, CSS) ---
echo "[1/5] dissect-artifact.cjs (tokens + components + screenshots)..."
node "$AIOS_CORE/squads/design/scripts/dissect-artifact.cjs" "$URL" \
  --name "$NAME" \
  --output "$OUTPUT_DIR" \
  --mobile 2>&1 | tail -15
echo ""

# --- 2. Dembrandt (W3C DTCG tokens + brand guide) ---
echo "[2/5] Dembrandt (W3C DTCG tokens)..."
DEMBRANDT_FLAGS="--save-output --dtcg --screenshot $OUTPUT_DIR/${NAME}-dembrandt.png"
if [ "$DARK_MODE" = "--dark-mode" ]; then
  DEMBRANDT_FLAGS="$DEMBRANDT_FLAGS --dark-mode"
fi
cd "$OUTPUT_DIR" && dembrandt "$URL" $DEMBRANDT_FLAGS 2>&1 | tail -10
cd "$AIOS_CORE"
echo ""

# --- 3. extract-states.mjs (hover, focus, active states) ---
echo "[3/5] extract-states.mjs (interactive states: hover, focus, active)..."
mkdir -p "$OUTPUT_DIR/states"
cd "$OUTPUT_DIR"
node "$AIOS_CORE/skills/design-system-forge/lib/extract-states.mjs" "$URL" \
  --name "$NAME" 2>&1 | tail -10
# Move states output to site folder
if [ -d "design-system/states" ]; then
  mv design-system/states/* "$OUTPUT_DIR/states/" 2>/dev/null || true
  rm -rf design-system 2>/dev/null || true
fi
cd "$AIOS_CORE"
echo ""

# --- 4. Playwright video recording (scroll animation capture) ---
echo "[4/5] Playwright scroll video recording..."
node -e "
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: '$OUTPUT_DIR/video/', size: { width: 1440, height: 900 } }
  });
  const page = await context.newPage();

  try {
    await page.goto('$URL', { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2000);

    // Scroll down slowly to capture scroll animations
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 900;
    const scrollStep = 200;
    const scrollDelay = 150;

    for (let y = 0; y < totalHeight; y += scrollStep) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(scrollDelay);
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Hover over first few interactive elements
    const buttons = await page.locator('a, button').all();
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      try {
        await buttons[i].hover({ timeout: 2000 });
        await page.waitForTimeout(500);
      } catch(e) {}
    }

    await page.waitForTimeout(1000);
  } catch(e) {
    console.log('Warning: ' + e.message);
  }

  await context.close();
  await browser.close();
  console.log('Video saved to $OUTPUT_DIR/video/');
})();
" 2>&1 | tail -5
echo ""

# --- 5. Hover state screenshots (before/after) ---
echo "[5/6] Hover state screenshots (before/after)..."
node "$AIOS_CORE/design-system/scripts/capture-hover-states.cjs" "$URL" \
  --name "$NAME" --output "$OUTPUT_DIR/states" 2>&1 | tail -5
echo ""

# --- 6. Summary ---
echo "[6/6] Summary"
echo "============================================"
echo "  $NAME — Extraction Complete"
echo "============================================"
echo "Files in $OUTPUT_DIR:"
ls -la "$OUTPUT_DIR/" 2>/dev/null | grep -v "^total" | awk '{print "  " $NF}'
echo ""
echo "Directories:"
ls -d "$OUTPUT_DIR"/*/ 2>/dev/null | while read d; do
  echo "  $(basename $d)/ ($(ls $d | wc -l | tr -d ' ') files)"
done
echo "============================================"
