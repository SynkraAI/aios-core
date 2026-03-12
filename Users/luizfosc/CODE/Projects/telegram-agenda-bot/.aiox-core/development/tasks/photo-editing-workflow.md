# Complete Photo Editing Workflow

> Task ID: mckinnon-photo-editing-workflow
> Agent: Peter McKinnon (Photo Editing Expert)
> Version: 1.0.0

## Description

Complete photo editing workflow from RAW import to final export. This task guides you through Peter McKinnon's systematic approach to editing - starting with the feeling, building the foundation, then adding the cinematic touches that make photos sing.

"The edit should match the moment. If it was cold and moody, edit cold and moody."

## Prerequisites

- RAW files imported into Lightroom (Classic or CC)
- Basic understanding of Lightroom panels
- Coffee ready (optional but recommended)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to understand your photo and vision.

1. **Define the Feeling**
   - What emotion does this photo represent?
   - How did you FEEL when you captured this moment?
   - What story should the viewer understand?

2. **Select Edit Direction**
   - Joyful/Bright: Lifted, warm, saturated
   - Nostalgic/Warm: Faded, film-like, golden
   - Moody/Dramatic: Dark, high contrast, desaturated
   - Serene/Peaceful: Soft, pastel, low contrast
   - Gritty/Raw: Natural, documentary, authentic

3. **Confirm Technical Details**
   - Photo type (portrait, landscape, street, product)
   - Lighting conditions (natural, artificial, mixed)
   - Intended use (web, print, social media)

### Steps

1. **Assess the RAW File**
   - View histogram for exposure issues
   - Check for blown highlights or crushed shadows
   - Note white balance starting point
   - Identify problem areas needing local adjustment
   - Validation: Understand what we're working with

2. **Set Base Exposure**
   - Adjust Exposure slider for proper brightness
   - Generally slight under (-0.3 to -0.5) for headroom
   - Recover highlights if needed (-30 to -60)
   - Open shadows if needed (+15 to +30)
   - Validation: Histogram shows good distribution

3. **Correct White Balance**
   - Use eyedropper on neutral gray if available
   - Manual adjust for intended mood
   - Warm (5500-6500K) for nostalgic feel
   - Cool (4500-5500K) for moody feel
   - Validation: Colors feel appropriate for mood

4. **Establish Tone Curve Foundation**
   - Lift blacks point (Input 0, Output 5-10) for film look
   - Create subtle S-curve for contrast
   - Pull down white point if faded look desired
   - Validation: Tonal range supports the mood

5. **Apply Color Grading**
   - Set shadows color (typically blue/teal for cool, none for warm)
   - Set highlights color (typically gold/orange for warm)
   - Balance slider to taste (-20 to +20)
   - Validation: Color separation enhances story

6. **Refine with HSL Panel**
   - Orange hue: -5 to -10 (skin toward red, not yellow)
   - Orange saturation: +10 to +15 (skin pop)
   - Blue hue: -10 to -20 (toward teal for cinematic)
   - Green saturation: -15 to -25 (less distracting foliage)
   - Validation: Colors harmonize, skin looks natural

7. **Add Film Texture**
   - Grain Amount: 20-25 (subtle, not obvious)
   - Grain Size: 30
   - Grain Roughness: 60
   - Dehaze: -8 to -12 (optional, adds haze)
   - Validation: Texture present but not distracting

8. **Apply Local Adjustments**
   - Radial filter on subject (+0.3 to +0.5 exposure)
   - Graduated filter on sky if needed (-0.5 to -1.0 exposure)
   - Adjustment brush for eyes/details (+0.3 exposure, +20 clarity)
   - Validation: Attention directed to subject

9. **Final Polish**
   - Vignette: -15 to -25 (subtle, guides eye)
   - Clarity: -5 to +15 depending on mood
   - Vibrance: +5 to +15 for final color boost
   - Validation: Edit feels complete, not overdone

10. **Review and Compare**
    - Toggle Before/After (\ key in Lightroom)
    - Check at 100% zoom for detail issues
    - Zoom out and squint - does subject pop?
    - Validation: Edit matches the feeling you defined in Step 1

## Output

- **Edited Photo**: Final RAW development with all adjustments
- **Edit Notes**: Documentation of key adjustments and reasoning
- **Before/After**: Comparison for reference and learning

### Output Format

```
PHOTO EDIT COMPLETE

FEELING: [emotion defined]
DIRECTION: [edit style chosen]

KEY ADJUSTMENTS:
1. Exposure: [value] - [reason]
2. White Balance: [value]K - [reason]
3. Blacks: +[value] - lifted for film look
4. Highlights: -[value] - recovered detail
5. Split Tone: [shadows]/[highlights] - [effect]
6. Grain: [amount] - added texture

LOCAL ADJUSTMENTS:
- [Mask type] on [area]: [adjustments]

BEFORE: [original state description]
AFTER: [edited state description]
THE VIBE: [mood achieved]

McKinnon says: "The edit should match the moment. Always."
```

## Success Criteria

- [ ] Edit amplifies the emotion of the original moment
- [ ] Blacks not crushed (some shadow detail visible)
- [ ] Highlights not clipped (recovered if possible)
- [ ] Skin tones look natural (for portraits)
- [ ] Grain present but subtle (if applied)
- [ ] Local adjustments direct attention appropriately
- [ ] Before/after comparison documented

## Error Handling

- **Overexposed highlights**: Use highlight recovery, accept some loss
- **Skin tones off**: Reset HSL, adjust WB first, then carefully adjust oranges
- **Edit looks fake**: Reduce most extreme adjustment by 50%
- **Inconsistent with series**: Match WB and exposure to reference shot

## Security Considerations

- Preserve original RAW files (non-destructive editing)
- Export copies, never overwrite originals
- Document settings for reproducibility

## Examples

### Example 1: Golden Hour Portrait

```bash
*photo-edit
```

Output:
```
Let's go! Photo loaded.

FEELING CHECK:
How did this moment feel? → "Warm, nostalgic, happy"
Perfect. Going for Nostalgic/Warm direction.

ADJUSTMENTS MADE:
1. Exposure: +0.3 (slightly bright, airy)
2. White Balance: 6200K, +8 tint (warm, golden)
3. Highlights: -55 (recovered sky detail)
4. Blacks: +22 (lifted for film feel)
5. Split Tone: Blue 210/Sat 12 shadows, Gold 45/Sat 15 highlights
6. HSL: Orange hue -8, sat +12 (skin glow)
7. Grain: 22, Size 30, Rough 60
8. Radial on face: +0.4 exposure, -10 clarity

BEFORE: Flat, digital, cool
AFTER: Warm, textured, nostalgic
THE VIBE: Summer afternoon memory

The edit matches the moment. That's what we're going for!
```

### Example 2: Moody Street Scene

```bash
*photo-edit --style moody
```

Output includes:
- Higher contrast settings
- Desaturated palette
- Teal/orange split toning
- Strong vignette

## Notes

- The feeling comes first, technique follows
- "Film wasn't perfect. That's what made it beautiful."
- Presets are starting points, not destinations
- Every photo needs individual attention after base edit
- Coffee helps with the creative process
- Always document your before/after - it's proof of craft
