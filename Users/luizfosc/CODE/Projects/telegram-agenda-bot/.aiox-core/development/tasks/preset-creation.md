# Preset & LUT Creation

> Task ID: mckinnon-preset-creation
> Agent: Peter McKinnon (Photo Editing Expert)
> Version: 1.0.0

## Description

Create reusable editing presets and LUTs that work across multiple photos in varying conditions. Peter McKinnon's approach to presets focuses on robustness - a preset that works on 1 photo but breaks on 10 is useless. This task guides you through building presets that are starting points, not magic buttons.

"A preset should work on 80% of photos with minimal tweaking."

## Prerequisites

- Reference photo with desired edit applied
- Lightroom, Capture One, or LUT-capable application
- Multiple test photos in different lighting conditions

## Workflow

### Interactive Elicitation

1. **Define Preset Purpose**
   - What look/mood does this preset create?
   - What type of photos is it designed for?
   - Will it be used for batch processing?

2. **Establish Robustness Requirements**
   - Must work in outdoor daylight?
   - Must work in indoor artificial light?
   - Must work with varied white balance?
   - Must protect skin tones?

3. **Configure Output Format**
   - Lightroom preset (.xmp/.lrtemplate)
   - Capture One style
   - LUT for video (.cube)
   - Multiple formats?

### Steps

1. **Create Base Edit on Reference Photo**
   - Edit reference photo to desired look
   - Document all settings
   - Ensure look is achievable without extreme values
   - Validation: Reference looks great

2. **Identify Exposure-Dependent Settings**
   - DO NOT include in preset:
     - Exposure adjustment
     - White Balance (temp/tint)
     - Highlights (if extreme)
     - Shadows (if extreme)
   - Validation: Preset won't break on different exposures

3. **Document Core Preset Settings**
   - Tone Curve (relative, not absolute)
   - Color Grading/Split Toning
   - HSL adjustments
   - Grain settings
   - Vignette
   - Calibration adjustments
   - Validation: Settings are exposure-agnostic

4. **Create Modular Preset System**
   - Base Preset: Tone curve, blacks, highlights foundation
   - Mood Layer: Color grading direction (warm/cool/neutral)
   - Finish Layer: Grain level, vignette intensity
   - Validation: Presets can stack for customization

5. **Test on Outdoor Daylight Photo**
   - Apply base preset
   - Check: Does it look good with minor adjustment?
   - Note: What needs manual tweaking?
   - Validation: Works in natural light

6. **Test on Indoor Artificial Light Photo**
   - Apply base preset
   - Check: Does it look good with minor adjustment?
   - Note: Does WB need correction first?
   - Validation: Works in artificial light

7. **Test on Backlit/High Contrast Photo**
   - Apply base preset
   - Check: Are highlights/shadows extreme?
   - Note: Any clipping issues?
   - Validation: Handles challenging light

8. **Test on Low Light/High ISO Photo**
   - Apply base preset
   - Check: Does grain stack with noise?
   - Note: Is grain setting appropriate?
   - Validation: Works in low light

9. **Test on Mixed Lighting Photo**
   - Apply base preset
   - Check: How does color grading interact?
   - Note: Any weird color casts?
   - Validation: Handles mixed conditions

10. **Validate Skin Tones (if applicable)**
    - Apply preset to portrait
    - Check orange/red range not extreme
    - Verify skin doesn't look sick
    - Validation: Skin tones protected

11. **Export Preset Package**
    - Save base preset
    - Save mood variations
    - Save finish variations
    - Document usage instructions
    - Validation: Complete preset system ready

## Output

- **Base Preset File**: Core look without exposure dependency
- **Mood Variations**: Warm, cool, neutral options
- **Finish Variations**: Light grain, heavy grain, no grain
- **Preset Documentation**: Usage guide with test results

### Output Format

```
PRESET CREATED: "[Preset Name]"

PURPOSE: [description of intended look/mood]
BEST FOR: [photo types, conditions]

INCLUDED SETTINGS:
✓ Tone Curve: [description]
✓ Color Grading: [shadows/highlights]
✓ HSL: [key adjustments]
✓ Grain: [amount/size/roughness]
✓ Vignette: [amount]
✓ Calibration: [if any]

EXCLUDED (adjust manually):
✗ Exposure
✗ White Balance
✗ [any extreme values]

MODULAR SYSTEM:
1. [Preset Name] Base - Apply first
2. [Preset Name] Warm/Cool/Neutral - Mood layer
3. [Preset Name] Grain Light/Heavy/None - Finish layer

TEST RESULTS:
- Outdoor Daylight: ✓ Pass
- Indoor Artificial: ✓ Pass
- Backlit/High Contrast: ✓ Pass
- Low Light/High ISO: ✓ Pass
- Mixed Lighting: ✓ Pass
- Skin Tones: ✓ Protected

USAGE:
1. Import photo
2. Correct exposure and WB
3. Apply [Preset Name] Base
4. Choose mood layer
5. Choose finish layer
6. Fine-tune as needed

McKinnon says: "Preset is the starting point, not the destination."
```

## Preset Quality Checklist

Before finalizing any preset:

- [ ] Works in 5+ different lighting conditions
- [ ] Does NOT include exposure setting
- [ ] Does NOT include white balance setting
- [ ] Skin tones remain natural
- [ ] Not over-saturated in any condition
- [ ] Blacks never fully crushed
- [ ] Highlights never fully clipped
- [ ] Grain (if included) subtle in all conditions
- [ ] Can be applied to batch with minimal per-photo adjustment

## Common Preset Recipes

### McKinnon Vintage 35mm

```
TONE CURVE:
- Black point: Input 0, Output 10
- Shadows: Input 64, Output 74
- Highlights: Input 192, Output 186
- White point: Input 255, Output 248

COLOR GRADING:
- Shadows: Blue (210), Sat 12
- Highlights: Gold (45), Sat 15

HSL:
- Orange Hue: -8
- Orange Sat: +12
- Blue Hue: -15
- Green Sat: -20

EFFECTS:
- Grain: 22, Size 30, Roughness 60
- Vignette: -18

CALIBRATION:
- Shadow Tint: +8
```

### Clean & Airy

```
TONE CURVE:
- Lifted blacks: Output 5
- Slight contrast curve

COLOR GRADING:
- Highlights: Warm (50), Sat 8

HSL:
- Orange Sat: +8
- Green Sat: -15

EFFECTS:
- No grain
- Vignette: -10
```

### Moody Cinematic

```
CONTRAST: +20
SATURATION: -15

TONE CURVE:
- Strong S-curve
- Blacks lifted slightly

COLOR GRADING:
- Shadows: Teal (185), Sat 18
- Highlights: Orange (40), Sat 12

HSL:
- Blue Hue: -20
- All Sat: -10

EFFECTS:
- Grain: 15
- Vignette: -25
```

## Success Criteria

- [ ] Preset works on 80%+ of target photos
- [ ] Minimal manual adjustment needed after application
- [ ] Consistent results across a photo series
- [ ] Skin tones never compromised
- [ ] Modular system allows customization
- [ ] All test conditions pass

## Error Handling

- **Preset breaks on different exposure**: Remove exposure from preset
- **Colors go weird on some photos**: Reduce HSL saturation values
- **Grain too heavy on low light**: Create separate low-light version
- **Doesn't match reference**: Verify all settings copied correctly

## Security Considerations

- Test extensively before sharing/selling
- Include usage documentation
- Version presets for updates
- Clearly state intended use cases

## Examples

### Example 1: Create Vintage Preset

```bash
*preset-create --style vintage
```

Output:
```
Let's go! Creating preset system.

REFERENCE EDIT ANALYZED:
- Lifted blacks detected
- Warm split toning
- Grain applied
- Faded highlights

PRESET STRUCTURE:
1. "McKinnon Vintage Base" created
2. "McKinnon Vintage Warm" mood layer
3. "McKinnon Vintage Cool" mood layer
4. "McKinnon Vintage Grain+" finish layer
5. "McKinnon Vintage Clean" finish layer

TESTING ON 5 CONDITIONS:
✓ Outdoor daylight - great
✓ Indoor window light - great
✓ Backlit portrait - good (adjust exposure)
✓ Low light street - good (grain stacks well)
✓ Mixed restaurant - good (WB first)

SKIN TONE TEST: ✓ Natural

Preset system ready! Remember - this is your
starting point, not your destination. Adjust
exposure and WB for each photo first.

Consistency is key!
```

## Notes

- Presets are promises - they should deliver consistently
- Never include exposure in a batch preset
- Test, test, test before declaring "done"
- Modular system > single mega-preset
- Document everything for future reference
- "Test on 5 different lighting conditions before you call it done"
- The preset handles style, you handle exposure
