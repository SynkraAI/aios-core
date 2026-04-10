---
name: ascii-banner-forge
description: "This skill generates terminal ASCII art from images using chafa. It creates animated session banners (.sh scripts), reusable ASCII art assets (.asc files), and live previews. It supports preset dimensions (fullscreen, compact, cinema, story, etc.) and manages a catalog of existing art. Use this skill when the user or an agent needs to: (1) create a terminal banner from an image or photo, (2) generate ASCII art assets for CLI applications, (3) preview images in the terminal, (4) list or browse available ASCII art, (5) configure SessionStart hooks with banners. Engine: chafa (must be installed via brew)."
---

# ASCII Banner Forge

Terminal art generator powered by `chafa`. Converts images into true-color ASCII art for banners, splash screens, and CLI application assets.

## Overview

ASCII Banner Forge wraps `chafa` with intelligent presets, a banner template system, and a catalog of 80+ existing artworks. It operates in 6 modes:

| Mode | Purpose | Saves file? |
|------|---------|-------------|
| `banner` | Image to animated banner script (.sh) | Yes (.asc + .sh) |
| `asset` | Image to reusable ASCII art (.asc) | Yes (.asc) |
| `live` | Quick terminal preview | No |
| `catalog` | Browse available art | No |
| `presets` | Show dimension presets | No |
| `hook` | Configure SessionStart banner | Edits settings |

## Prerequisites

- `chafa` installed: `brew install chafa`
- For HEIC photos (iPhone): `brew install libheif`

## Quick Start

```bash
# Generate a banner from a photo
bash ~/aios-core/skills/ascii-banner-forge/scripts/generate.sh banner ~/foto.jpg --name "my-art"

# Preview an image in the terminal
bash ~/aios-core/skills/ascii-banner-forge/scripts/generate.sh live ~/foto.jpg --preset compact

# List available presets with visual frames
bash ~/aios-core/skills/ascii-banner-forge/scripts/generate.sh presets --preview

# Browse catalog
bash ~/aios-core/skills/ascii-banner-forge/scripts/generate.sh catalog
```

## Modes

### banner — Generate animated banner script

Convert any image into a complete `.sh` banner script with scroll animation and LUIZ FOSC logo.

```bash
generate.sh banner <image> [--name NAME] [--category CATEGORY] [--speed fast|normal|slow]
```

**Parameters:**
- `image` — Path to image file (JPG, PNG, HEIC, WebP, GIF, SVG) or catalog name
- `--name` — Name for the art (default: derived from filename)
- `--category` — Category prefix: game, masterpiece, nature, effect, etc. (default: custom)
- `--speed` — Scroll speed: `fast` (0.02s), `normal` (0.06s), `slow` (0.10s)

**Output:**
- Asset saved to `~/aios-core/banners/NOVOS/assets/{name}.asc`
- Banner script saved to `~/aios-core/banners/Outputs/({category})-{name}-banner.sh`

**How it works internally:**
1. Run `chafa --format=symbols --size=197x99 --color-space=din99d` on the image
2. Save the raw ASCII art as `.asc` asset
3. Generate a `.sh` script that: hides cursor, clears screen, scrolls the art line by line, pauses, clears, shows LUIZ FOSC rainbow logo, restores cursor
4. Make the script executable

### asset — Generate reusable ASCII art

Convert an image to a raw `.asc` file with controlled dimensions. Ideal for embedding in CLI applications.

```bash
generate.sh asset <image> [--preset NAME | --size WxH] [--output PATH]
```

**Parameters:**
- `image` — Path to image file
- `--preset` — Use a named preset (see Presets section)
- `--size` — Custom dimensions as WIDTHxHEIGHT (e.g., `100x50`)
- `--output` — Custom output path (default: `~/aios-core/banners/Outputs/`)

**When agents use this mode:** An agent needing to display a company logo, a result visualization, or decorative art between workflow stages should use this mode to generate a properly-sized `.asc` asset, then `cat` the file to display it.

### live — Quick preview

Display an image or catalog art directly in the terminal without saving anything.

```bash
generate.sh live <image|catalog-name> [--preset NAME | --size WxH]
```

**Catalog names:** Pass just the art name (without path or extension) and the skill searches the catalog automatically. Example: `generate.sh live Barn-Owl`

### catalog — Browse available art

List all available ASCII art organized by category.

```bash
generate.sh catalog [--tag TAG]
```

**Art locations scanned:**
- `~/aios-core/banners/*-banner.sh` — Approved banners
- `~/aios-core/banners/NOVOS/*-banner.sh` — New/pending banners
- `~/aios-core/banners/NOVOS/assets/*.asc` — Raw art assets
- `~/aios-core/banners/assets/*.asc` — Main art assets

**Categories:** game, masterpiece, nature, effect, cinema, music, retro, scifi, abstract, tech, personal, custom

### presets — Show dimension presets

Display all available size presets with optional visual frame previews.

```bash
generate.sh presets [--preview]
```

The `--preview` flag shows ASCII frame templates for each preset, giving a visual sense of the proportions. These frames are pre-generated in `assets/preset-previews/`.

### hook — Configure SessionStart banner

Generate the JSON configuration for `.claude/settings.json` SessionStart hook.

```bash
generate.sh hook random    # Random banner each session
generate.sh hook Barn-Owl  # Specific banner
generate.sh hook off       # Instructions to disable
```

**Important:** This mode only prints the configuration — it does not modify settings.json directly. The user or agent must add the JSON block manually.

## Presets Reference

| Preset | Size | Use case |
|--------|------|----------|
| `fullscreen` | 197x99 | Session banner (full terminal) |
| `compact` | 80x24 | Standard 80-col terminal |
| `wide` | 120x40 | Splash screen between stages |
| `mini` | 40x20 | Icon, avatar, small preview |
| `square` | 60x60 | 1:1 ratio (Instagram-like) |
| `cinema` | 120x50 | 16:9 ratio (YouTube-like) |
| `story` | 40x71 | 9:16 ratio (Stories/Reels) |
| `banner-horizontal` | 120x30 | Wide banner (header/footer) |
| `thumbnail` | 60x34 | Small preview thumbnail |

For detailed aspect ratio calculations and char-to-pixel mapping, see `references/presets.md`.

For `chafa` flags, color spaces, and troubleshooting, see `references/chafa-guide.md`.

## File Structure

```
~/aios-core/banners/
├── *-banner.sh              # Approved banners (catalog)
├── assets/*.asc             # Main art assets (catalog)
├── NOVOS/
│   ├── *-banner.sh          # New/pending banners
│   └── assets/*.asc         # New art assets
└── Outputs/
    ├── *-banner.sh          # Generated banner scripts
    └── *.asc                # Generated art assets
```

## Usage by Agents

Any agent can use this skill programmatically:

```bash
# Agent wants to show a company logo between workflow steps
bash ~/aios-core/skills/ascii-banner-forge/scripts/generate.sh asset /path/to/logo.png --preset mini --output /tmp/logo.asc
cat /tmp/logo.asc

# Agent wants to create a decorative banner for a report
bash ~/aios-core/skills/ascii-banner-forge/scripts/generate.sh asset /path/to/image.jpg --preset wide
```

When calling from an agent context:
1. Always use absolute paths
2. Prefer presets over custom sizes for consistency
3. For temporary display, use `live` mode (no file cleanup needed)
4. For persistent assets, use `asset` mode with explicit `--output`

## Naming Convention

Banner scripts follow this pattern: `({category})-{name}-banner.sh`

Valid categories: `game`, `masterpiece`, `nature`, `effect`, `cinema`, `music`, `retro`, `scifi`, `abstract`, `tech`, `personal`, `custom`
