#!/usr/bin/env node
/**
 * Design System Forge — Visual Diff
 *
 * Compares two screenshots pixel-by-pixel and generates:
 *   - Side-by-side comparison image (via Playwright HTML render)
 *   - Diff overlay with highlighted differences
 *   - Diff percentage report
 *
 * Uses Playwright to render an HTML page with both images for comparison.
 * No external dependencies (no sharp required).
 *
 * Usage:
 *   node visual-diff.mjs --original ./original.png --redesign ./redesign.png
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let originalPath = null;
let redesignPath = null;
let outputDir = null;
let name = 'comparison';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--original') {
    originalPath = args[++i];
  } else if (arg === '--redesign') {
    redesignPath = args[++i];
  } else if (arg === '--output' || arg === '-o') {
    outputDir = args[++i];
  } else if (arg === '--name' || arg === '-n') {
    name = args[++i];
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Design System Forge — Visual Diff

Usage:
  node visual-diff.mjs --original ./original.png --redesign ./redesign.png

Options:
  --original       Path to original screenshot (required)
  --redesign       Path to redesigned screenshot (required)
  --output, -o     Output directory (default: design-system/screenshots/)
  --name, -n       Comparison name (default: "comparison")
  --help, -h       Show this help

Output:
  {output}/comparison-{name}.png     Side-by-side comparison
  {output}/diff-{name}.png           Diff overlay (differences highlighted)
  {output}/diff-report-{name}.json   Diff metrics
`);
    process.exit(0);
  }
}

if (!originalPath || !redesignPath) {
  console.error('Error: --original and --redesign are required.');
  process.exit(1);
}

if (!fs.existsSync(originalPath)) {
  console.error(`Error: Original file not found: ${originalPath}`);
  process.exit(1);
}

if (!fs.existsSync(redesignPath)) {
  console.error(`Error: Redesign file not found: ${redesignPath}`);
  process.exit(1);
}

outputDir = outputDir || path.join(process.cwd(), 'design-system', 'screenshots');
fs.mkdirSync(outputDir, { recursive: true });

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n> Visual diff: comparing screenshots`);
  console.log(`  Original: ${originalPath}`);
  console.log(`  Redesign: ${redesignPath}`);

  // Read images as base64
  const originalBase64 = fs.readFileSync(originalPath).toString('base64');
  const redesignBase64 = fs.readFileSync(redesignPath).toString('base64');
  const originalExt = path.extname(originalPath).slice(1) || 'png';
  const redesignExt = path.extname(redesignPath).slice(1) || 'png';

  const browser = await chromium.launch({ headless: true });

  try {
    // --- Side-by-side comparison ---
    const sideBySidePage = await browser.newPage();
    await sideBySidePage.setViewportSize({ width: 3000, height: 2000 });

    const sideBySideHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #1a1a1a; font-family: -apple-system, sans-serif; padding: 20px; }
        .header { color: #fff; text-align: center; padding: 20px 0; }
        .header h1 { font-size: 24px; font-weight: 600; }
        .header p { color: #888; font-size: 14px; margin-top: 8px; }
        .container { display: flex; gap: 20px; justify-content: center; padding: 20px; }
        .panel { flex: 1; max-width: 1440px; }
        .label { color: #fff; font-size: 16px; font-weight: 600; text-align: center; padding: 12px;
                  background: #333; border-radius: 8px 8px 0 0; }
        .label.original { background: #dc2626; }
        .label.redesign { background: #16a34a; }
        .panel img { width: 100%; display: block; border: 2px solid #333; border-top: none;
                      border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Visual Comparison — ${name}</h1>
        <p>Original vs Redesign</p>
      </div>
      <div class="container">
        <div class="panel">
          <div class="label original">ORIGINAL</div>
          <img src="data:image/${originalExt};base64,${originalBase64}" />
        </div>
        <div class="panel">
          <div class="label redesign">REDESIGN</div>
          <img src="data:image/${redesignExt};base64,${redesignBase64}" />
        </div>
      </div>
    </body>
    </html>`;

    await sideBySidePage.setContent(sideBySideHtml);
    await sideBySidePage.waitForTimeout(500);

    const comparisonPath = path.join(outputDir, `comparison-${name}.png`);
    await sideBySidePage.screenshot({ path: comparisonPath, fullPage: true });
    console.log(`  Side-by-side: ${comparisonPath}`);
    await sideBySidePage.close();

    // --- Diff overlay using canvas ---
    const diffPage = await browser.newPage();
    await diffPage.setViewportSize({ width: 1500, height: 2000 });

    const diffHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; }
        body { background: #000; }
        canvas { display: block; }
      </style>
    </head>
    <body>
      <canvas id="canvas"></canvas>
      <script>
        async function computeDiff() {
          const img1 = new Image();
          const img2 = new Image();

          await Promise.all([
            new Promise(r => { img1.onload = r; img1.src = 'data:image/${originalExt};base64,${originalBase64}'; }),
            new Promise(r => { img2.onload = r; img2.src = 'data:image/${redesignExt};base64,${redesignBase64}'; }),
          ]);

          const w = Math.max(img1.width, img2.width);
          const h = Math.max(img1.height, img2.height);

          const canvas = document.getElementById('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');

          // Draw original
          const c1 = document.createElement('canvas');
          c1.width = w; c1.height = h;
          const ctx1 = c1.getContext('2d');
          ctx1.drawImage(img1, 0, 0);
          const data1 = ctx1.getImageData(0, 0, w, h).data;

          // Draw redesign
          const c2 = document.createElement('canvas');
          c2.width = w; c2.height = h;
          const ctx2 = c2.getContext('2d');
          ctx2.drawImage(img2, 0, 0);
          const data2 = ctx2.getImageData(0, 0, w, h).data;

          // Compute diff
          const output = ctx.createImageData(w, h);
          let diffPixels = 0;
          const totalPixels = w * h;
          const threshold = 30; // RGB difference threshold

          for (let i = 0; i < data1.length; i += 4) {
            const dr = Math.abs(data1[i] - data2[i]);
            const dg = Math.abs(data1[i+1] - data2[i+1]);
            const db = Math.abs(data1[i+2] - data2[i+2]);
            const diff = (dr + dg + db) / 3;

            if (diff > threshold) {
              // Highlight diff in red
              output.data[i] = 255;
              output.data[i+1] = 50;
              output.data[i+2] = 50;
              output.data[i+3] = 200;
              diffPixels++;
            } else {
              // Show original faded
              output.data[i] = data2[i];
              output.data[i+1] = data2[i+1];
              output.data[i+2] = data2[i+2];
              output.data[i+3] = 100;
            }
          }

          ctx.putImageData(output, 0, 0);

          const diffPercent = ((diffPixels / totalPixels) * 100).toFixed(2);
          window.__diffResult = {
            width: w,
            height: h,
            totalPixels,
            diffPixels,
            diffPercent: parseFloat(diffPercent),
            similarity: parseFloat((100 - parseFloat(diffPercent)).toFixed(2)),
          };
        }

        computeDiff();
      </script>
    </body>
    </html>`;

    await diffPage.setContent(diffHtml);
    await diffPage.waitForTimeout(1000);

    const diffPath = path.join(outputDir, `diff-${name}.png`);
    await diffPage.screenshot({ path: diffPath, fullPage: true });
    console.log(`  Diff overlay: ${diffPath}`);

    // Get diff metrics
    const diffResult = await diffPage.evaluate(() => window.__diffResult);
    await diffPage.close();

    // Write report
    const report = {
      name,
      original: path.resolve(originalPath),
      redesign: path.resolve(redesignPath),
      timestamp: new Date().toISOString(),
      ...diffResult,
      verdict: diffResult.similarity >= 90 ? 'EXCELLENT' :
               diffResult.similarity >= 75 ? 'GOOD' :
               diffResult.similarity >= 50 ? 'MODERATE' : 'LOW',
    };

    const reportPath = path.join(outputDir, `diff-report-${name}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n> Visual diff complete!`);
    console.log(`  Similarity: ${report.similarity}% (${report.verdict})`);
    console.log(`  Different pixels: ${report.diffPixels.toLocaleString()} / ${report.totalPixels.toLocaleString()}`);
    console.log(`  Report: ${reportPath}`);

  } catch (err) {
    console.error(`Error computing visual diff: ${err.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
