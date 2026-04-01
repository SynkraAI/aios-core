# extract-keyframes

```yaml
task:
  name: extract-keyframes
  description: "Extract representative keyframes from video via scene detection or fixed interval"
  squad: etl-squad
  phase: 2
  elicit: false

input:
  required:
    - source: "Video file (.mp4, .avi, .mov, .mkv, .webm) or YouTube URL"
  optional:
    - mode: "scene | interval (default: scene)"
    - interval_seconds: "Seconds between frames in interval mode (default: 60)"
    - scene_threshold: "Scene change sensitivity 0.0-1.0 (default: 0.3)"
    - max_frames: "Max keyframes to extract (default: 20)"
    - output_dir: "Override output directory"
    - describe: "false (default). If true, run image-to-text on each frame"

execution:
  workflow: null
  agents: [extractor]

  steps:
    - agent: extractor
      action: "Resolve source"
      rules:
        - "If YouTube URL → download via yt-dlp to temp dir"
        - "If local file → verify exists and is valid video"
        - "Extract video metadata: duration, resolution, fps, codec"

    - agent: extractor
      action: "Extract keyframes"
      rules:
        - "mode=scene: use ffprobe scene detection (threshold config)"
        - "  ffprobe -v quiet -show_frames -of json -f lavfi movie={file},select='gt(scene,{threshold})'"
        - "  Extract frame timestamps from detected scenes"
        - "mode=interval: calculate timestamps every N seconds"
        - "Cap at max_frames (take evenly spaced subset if exceeded)"
        - "Extract each frame: ffmpeg -ss {timestamp} -i {file} -frames:v 1 -q:v 2 frame_{NNN}.jpg"

    - agent: extractor
      action: "Optional: describe frames"
      rules:
        - "If describe=true → run image-to-text pipeline on each frame"
        - "Append description to index entry"

    - agent: extractor
      action: "Generate index"
      rules:
        - "Create index.yaml with video metadata + frame list"
        - "Each frame entry: filename, timestamp, position, description (if enabled)"

output_format: directory

veto_conditions:
  - "ffmpeg/ffprobe not installed → FAIL with install instructions"
  - "Video file corrupted or unsupported format → FAIL"
  - "Video duration 0 or unreadable → FAIL"
  - "YouTube URL and yt-dlp not installed → FAIL"
  - "Video >4 hours without --large flag → WARN, proceed with max_frames=30"

output_example: |
  data/etl-output/keyframes/brand-masterclass_2026-03-11/
    index.yaml
    frames/
      frame_001.jpg   # 00:00:00
      frame_002.jpg   # 00:03:24
      frame_003.jpg   # 00:07:51
      frame_004.jpg   # 00:12:18
      frame_005.jpg   # 00:18:45

  # index.yaml content:
  video:
    source: "./brand-masterclass.mp4"
    duration_seconds: 2400
    resolution: "1920x1080"
    fps: 30
    codec: h264
  extraction:
    mode: scene
    threshold: 0.3
    frames_detected: 12
    frames_extracted: 5
    extracted_at: "2026-03-11T14:30:00Z"
    job_id: etl_kf_abc123
  frames:
    - file: "frames/frame_001.jpg"
      timestamp: "00:00:00"
      position: 0
      scene_score: 0.95
    - file: "frames/frame_002.jpg"
      timestamp: "00:03:24"
      position: 204
      scene_score: 0.78
      description: "Slide showing brand positioning framework"

completion_criteria:
  - "Keyframe images extracted as .jpg"
  - "index.yaml with video metadata and frame list"
  - "Timestamps accurate to video position"
  - "Frame count respects max_frames limit"
```
