# Cinematic Color Grading

> Task ID: mckinnon-color-grading
> Agent: Peter McKinnon (Photo Editing Expert)
> Version: 1.0.0

## Description

Apply cinematic color grading to photos and videos using Peter McKinnon's systematic approach. Color isn't decoration - color IS emotion. This task guides you through mood mapping, color theory, and the technical execution that transforms flat images into cinematic frames.

"Color isn't decoration. Color IS emotion."

## Prerequisites

- Photo/video loaded in Lightroom, Premiere, or DaVinci Resolve
- Base exposure already corrected
- Understanding of the story/mood you want to convey

## Workflow

### Interactive Elicitation

1. **Define Target Mood**
   - What emotion should the viewer feel?
   - Reference films/photos with similar mood?
   - Warm or cool dominant palette?

2. **Select Color Grade Type**
   - Warm Golden: nostalgia, happiness, comfort
   - Cool Blue: melancholy, isolation, mystery
   - Teal/Orange: cinematic, blockbuster, dynamic
   - Desaturated: serious, documentary, raw
   - High Contrast B&W: timeless, dramatic, artistic

3. **Identify Constraints**
   - Skin tones present? (must protect)
   - Brand colors to preserve?
   - Series consistency requirements?

### Steps

1. **Neutralize First**
   - Correct white balance to neutral as starting point
   - Ensure exposure is balanced
   - Fix any color casts from lighting
   - Validation: Clean slate for grading

2. **Establish Shadow Color**
   - Open Color Grading panel (or Color Wheels)
   - Shadows wheel: Push toward desired color
   - Common: Blue (210) for cool, Teal (180) for cinematic
   - Saturation: 10-20 (subtle is key)
   - Validation: Shadows carry emotional weight

3. **Set Highlight Color**
   - Highlights wheel: Push toward complementary color
   - Common: Orange (35-50) for warm, Gold (45) for nostalgic
   - Saturation: 10-20 (match shadow intensity)
   - Validation: Highlights complement shadows

4. **Balance the Grade**
   - Use Balance slider (-20 to +20)
   - Negative: More shadow color dominates
   - Positive: More highlight color dominates
   - Validation: Neither color overpowers

5. **Refine with Tone Curve**
   - RGB curve: Set overall contrast (S-curve)
   - Red curve: Lift shadows for warm, drop for cool
   - Blue curve: Lift shadows for blue cast (common)
   - Drop blue highlights for yellow warmth
   - Validation: Curves enhance, don't fight grade

6. **Target Colors with HSL**
   - Hue shifts for color harmony
   - Blue -> Teal: -10 to -20 (cinematic)
   - Orange -> Red: -5 to -10 (skin richness)
   - Green -> Yellow: +10 to +20 (foliage control)
   - Validation: Colors work together harmoniously

7. **Control Saturation Selectively**
   - Global saturation: Usually -10 to +10
   - HSL Saturation: Target specific colors
   - Boost oranges for skin: +10 to +15
   - Reduce greens for less distraction: -15 to -25
   - Validation: No neon colors, nothing over-saturated

8. **Adjust Luminance**
   - Darken blues: Dramatic skies (-10 to -20)
   - Brighten oranges: Skin glow (+5 to +15)
   - Darken greens: Richer foliage (-10 to -20)
   - Validation: Luminance supports depth

9. **Protect Skin Tones**
   - Check orange/red range isn't extreme
   - Skin should look like skin, not orange
   - Use local adjustment mask if needed
   - Validation: Skin tones natural despite grade

10. **Final Calibration**
    - Camera Calibration panel (Lightroom)
    - Shadow Tint: +5 to +10 for warmth
    - Red Primary Hue: -5 to -10 for skin
    - Validation: Final polish complete

## Output

- **Color Graded Image/Video**: Complete grade applied
- **Grade Recipe**: Documented settings for replication
- **Mood Verification**: Confirm grade matches intended emotion

### Output Format

```
COLOR GRADE COMPLETE: "[Grade Name]"

TARGET MOOD: [emotion]
GRADE TYPE: [warm/cool/teal-orange/etc]

COLOR WHEELS:
- Shadows: Hue [X], Sat [Y]
- Midtones: Hue [X], Sat [Y]
- Highlights: Hue [X], Sat [Y]
- Balance: [value]

TONE CURVE:
- RGB: [S-curve/fade/etc]
- Red: [description]
- Green: [description]
- Blue: [description]

HSL ADJUSTMENTS:
- [Color]: H[X], S[Y], L[Z]

CALIBRATION:
- Shadow Tint: [value]
- [Other adjustments]

SKIN TONE CHECK: [Pass/Adjusted]

McKinnon says: "Color isn't decoration. Color IS emotion."
```

## Color Grade Recipes

### Teal & Orange (Cinematic Blockbuster)

```
SHADOWS: Teal (180), Sat 18
HIGHLIGHTS: Orange (40), Sat 15
BALANCE: -10

HSL:
- Blue Hue: -15
- Orange Hue: -5
- Orange Sat: +10

TONE CURVE:
- Slight S-curve
- Blue shadows lifted +5
```

### Warm Nostalgic (Film Look)

```
SHADOWS: Blue (210), Sat 12
HIGHLIGHTS: Gold (45), Sat 15
BALANCE: +5

BLACKS: +20 (lifted)
HIGHLIGHTS: -40 (faded)

HSL:
- Orange Hue: -8
- Green Sat: -20
```

### Cool Moody (Drama)

```
SHADOWS: Blue (220), Sat 20
HIGHLIGHTS: Slight cyan (190), Sat 8
BALANCE: -15

CONTRAST: +25
SATURATION: -15

HSL:
- Blue Sat: +10
- Orange Sat: -10
```

### Desaturated Documentary

```
SATURATION: -25 to -35
CONTRAST: +20

HSL:
- All colors: Sat -20
- Orange Sat: -10 (preserve some skin)

TONE CURVE:
- High contrast S-curve
```

## Success Criteria

- [ ] Grade matches intended emotional mood
- [ ] Shadows and highlights complement (not fight)
- [ ] No single color overpowers the image
- [ ] Skin tones remain natural (if present)
- [ ] Colors harmonize - no neon or fake tones
- [ ] Grade can be applied consistently to series

## Error Handling

- **Skin looks sick**: Check orange/red in HSL, reduce saturation
- **Colors fighting**: Reduce saturation on both, check complementary
- **Grade too strong**: Reduce all saturation values by 30-50%
- **Doesn't match series**: Copy settings from reference, adjust exposure only

## Security Considerations

- Document all settings for reproducibility
- Save grade as preset after validation
- Test on multiple images before batch applying

## Examples

### Example 1: Apply Teal & Orange

```bash
*color-grade --style teal-orange
```

Output:
```
Let's go! Color grading time.

MOOD: Cinematic, blockbuster energy
APPLYING: Teal & Orange grade

SETTINGS APPLIED:
- Shadows: Teal (180), Sat 18
- Highlights: Orange (40), Sat 15
- Balance: -10
- Blue Hue shift: -15
- Orange boost: +10 sat

SKIN CHECK: Natural (orange not overdone)

RESULT: That Hollywood look! Shadows have depth,
highlights pop with warmth. Very "Blade Runner meets
summer blockbuster."

The grade matches the vibe. Let's go!
```

### Example 2: Custom Mood Grade

```bash
*color-grade
```

Interactive prompts for custom grade creation.

## Notes

- Always neutralize before grading
- Complementary colors create visual interest
- Subtle saturation > heavy saturation
- Protect skin tones at all costs
- Same grade, different exposure = consistent series
- "The edit should match the moment" applies to color too
- Over-saturating is the #1 amateur mistake
- When in doubt, reduce saturation
