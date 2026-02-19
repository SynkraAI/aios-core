# Video Spec Validator Checklist

## Structural Validation

- [ ] `version` == "1.0.0"
- [ ] `metadata` object exists
- [ ] `metadata.audio_source` path exists as file
- [ ] `metadata.duration_seconds` > 0
- [ ] `metadata.fps` == 30
- [ ] `metadata.width` == 1080
- [ ] `metadata.height` == 1920
- [ ] `metadata.total_scenes` == `scenes.length`
- [ ] `style` object exists
- [ ] `style.reference_image` path exists as file
- [ ] `style.prompt_suffix` is non-empty string
- [ ] `scenes` array has >= 1 item

## Scene Validation (for each scene)

- [ ] `id` is sequential (1, 2, 3...)
- [ ] `start` < `end`
- [ ] `duration` == `end` - `start` (±0.1s)
- [ ] `shot_type` is valid enum value
- [ ] `camera_movement` is valid enum value
- [ ] `transition_in` is valid enum value
- [ ] `image_prompt` is non-empty string in English
- [ ] `image_path` exists as file (post-generation)
- [ ] `subtitle_text` is non-empty string
- [ ] `mood` is valid enum value
- [ ] `audio_layer` is valid enum value

## Contiguity Validation

- [ ] First scene starts at 0.0 (±0.5s)
- [ ] `scene[n].end` == `scene[n+1].start` (±0.1s) for all consecutive scenes
- [ ] Last scene ends at `metadata.duration_seconds` (±0.5s)
- [ ] No gaps between scenes
- [ ] No overlapping scenes

## SFX Validation (for scenes with sfx != null)

- [ ] `sfx.description` is non-empty string
- [ ] `sfx.start` >= scene.start
- [ ] `sfx.start` + `sfx.duration` <= scene.end + 1.0 (allow slight overflow)
- [ ] `sfx.volume` >= 0 AND <= 1
- [ ] `sfx.file_path` exists as file (post-generation)

## Subtitle Words Validation (if word-by-word mode)

- [ ] `subtitle_words` array is non-empty
- [ ] Each word has `word`, `start`, `end`
- [ ] First word.start >= scene.start
- [ ] Last word.end <= scene.end + 0.5s
- [ ] Words are in chronological order

## Blocking Conditions

If ANY of these fail, the spec is INVALID and cannot be sent to Remotion:
- metadata.total_scenes != scenes.length
- Scenes are not contiguous
- Missing image_path on any scene
- Scene start >= end
