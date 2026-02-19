#!/usr/bin/env python3
"""
Audio Reels — Step 3c: Video Clip Generation via Freepik Kling AI (image-to-video)
Reads spec.json, takes generated scene images, sends to Kling O1 API for image-to-video,
polls for completion, downloads video clips, updates spec with video_path.

Usage:
    python3 generate-videos.py --spec-dir /path/to/output-dir
    python3 generate-videos.py --spec-dir /path/to/output-dir --api-key FPSX...
    python3 generate-videos.py --spec-dir /path/to/output-dir --model kling-o1-pro
    python3 generate-videos.py --spec-dir /path/to/output-dir --duration 10

Environment:
    FREEPIK_API_KEY - Freepik API key (alternative to --api-key)
"""

import sys
import os
import json
import base64
import time
import argparse
import urllib.request
import urllib.error

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL = "https://api.freepik.com"
ASPECT_RATIO = "9:16"

# Available Kling O1 models on Freepik
MODELS = {
    "kling-o1-std": "/v1/ai/image-to-video/kling-o1-std",
    "kling-o1-pro": "/v1/ai/image-to-video/kling-o1-pro",
}

# Video-reference endpoints (support reference_images for character consistency)
MODELS_VIDEO_REF = {
    "kling-o1-std": "/v1/ai/image-to-video/kling-o1-std-video-reference",
    "kling-o1-pro": "/v1/ai/image-to-video/kling-o1-pro-video-reference",
}

# Task status endpoint (shared for all O1 models)
TASK_STATUS_PATH = "/v1/ai/image-to-video/kling-o1"

# Default model: Standard is faster and cheaper
DEFAULT_MODEL = "kling-o1-std"

# Polling configuration
POLL_INTERVAL_SECONDS = 10
POLL_MAX_ATTEMPTS = 90        # 90 * 10s = 15 minutes max wait per task
INITIAL_WAIT_SECONDS = 15     # Wait before first poll (videos take 30-120s)

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 5

# Rate limit: Freepik allows up to 3 concurrent requests
CONCURRENT_LIMIT = 3
DELAY_BETWEEN_SUBMITS = 2     # seconds between task submissions


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def api_request(method, path, api_key, body=None, timeout=60):
    """Make an HTTP request to the Freepik API."""
    url = f"{BASE_URL}{path}"
    headers = {
        "x-freepik-api-key": api_key,
        "Content-Type": "application/json",
    }

    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            response_body = resp.read().decode("utf-8")
            if response_body:
                return json.loads(response_body)
            return {}
    except urllib.error.HTTPError as e:
        error_body = ""
        try:
            error_body = e.read().decode("utf-8")
        except Exception:
            pass
        raise RuntimeError(
            f"API {method} {path} returned {e.code}: {error_body}"
        ) from e


def image_to_base64(image_path):
    """Read an image file and return its base64-encoded string."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def download_file(url, output_path, timeout=120):
    """Download a file from URL to local path."""
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        with open(output_path, "wb") as f:
            while True:
                chunk = resp.read(8192)
                if not chunk:
                    break
                f.write(chunk)


def choose_duration(scene_duration):
    """Pick 5s or 10s video based on scene duration.

    Kling O1 supports only 5 or 10 second outputs.
    - If scene duration >= 8s, use 10s video
    - Otherwise use 5s video
    """
    if scene_duration >= 8.0:
        return 10
    return 5


# ---------------------------------------------------------------------------
# Core API functions
# ---------------------------------------------------------------------------

def submit_image_to_video(
    api_key,
    image_path,
    prompt,
    model=DEFAULT_MODEL,
    duration=5,
    aspect_ratio=ASPECT_RATIO,
    webhook_url=None,
    character_image_path=None,
):
    """Submit an image-to-video task to Freepik Kling O1 API.

    If character_image_path is provided, uses the video-reference endpoint
    with both character photo and scene image as reference_images.
    Otherwise uses the standard endpoint with first_frame.

    Returns the task_id on success.
    """
    if character_image_path:
        # Use video-reference endpoint for character consistency
        endpoint = MODELS_VIDEO_REF.get(model)
        if not endpoint:
            raise ValueError(f"Unknown model: {model}. Available: {list(MODELS_VIDEO_REF.keys())}")

        # Build reference_images: character photo + scene image
        ref_images = [image_to_base64(character_image_path)]
        if image_path and os.path.exists(image_path):
            ref_images.append(image_to_base64(image_path))

        body = {
            "prompt": prompt[:2500],
            "reference_images": ref_images,
            "aspect_ratio": aspect_ratio,
            "duration": str(duration),
        }
    else:
        # Standard endpoint with first_frame
        endpoint = MODELS.get(model)
        if not endpoint:
            raise ValueError(f"Unknown model: {model}. Available: {list(MODELS.keys())}")

        img_b64 = image_to_base64(image_path)

        body = {
            "first_frame": img_b64,
            "prompt": prompt[:2500],
            "aspect_ratio": aspect_ratio,
            "duration": str(duration),
        }

    if webhook_url:
        body["webhook_url"] = webhook_url

    result = api_request("POST", endpoint, api_key, body=body, timeout=90)

    # Response format: { "data": { "task_id": "...", "status": "PROCESSING" } }
    data = result.get("data", result)
    task_id = data.get("task_id")

    if not task_id:
        raise RuntimeError(f"No task_id in response: {json.dumps(result)[:500]}")

    return task_id


def poll_task_status(api_key, task_id):
    """Poll a Kling O1 task until it completes, fails, or times out.

    Returns (status, video_urls) where video_urls is a list of video URLs on success.
    """
    path = f"{TASK_STATUS_PATH}/{task_id}"

    print(f"[videos]     Waiting {INITIAL_WAIT_SECONDS}s before first poll...")
    time.sleep(INITIAL_WAIT_SECONDS)

    for attempt in range(1, POLL_MAX_ATTEMPTS + 1):
        try:
            result = api_request("GET", path, api_key, timeout=30)
        except Exception as e:
            print(f"[videos]     Poll error (attempt {attempt}): {e}")
            time.sleep(POLL_INTERVAL_SECONDS)
            continue

        data = result.get("data", result)
        status = data.get("status", "UNKNOWN")

        if status == "COMPLETED":
            video_urls = data.get("generated", [])
            return status, video_urls

        if status in ("FAILED", "ERROR", "CANCELLED"):
            error_msg = data.get("error", data.get("message", "Unknown error"))
            print(f"[videos]     Task {status}: {error_msg}")
            return status, []

        # Still processing
        elapsed = INITIAL_WAIT_SECONDS + (attempt * POLL_INTERVAL_SECONDS)
        print(f"[videos]     Status: {status} (poll #{attempt}, ~{elapsed}s elapsed)")
        time.sleep(POLL_INTERVAL_SECONDS)

    return "TIMEOUT", []


def process_scene(api_key, scene, videos_dir, model, duration_override, webhook_url, style_suffix="", character_image=None):
    """Process a single scene: submit image-to-video, poll, download.

    Returns True on success, False on failure.
    """
    scene_id = scene["id"]
    prompt = scene.get("image_prompt", "")
    scene_duration = scene.get("duration", 5.0)

    # Scene image path (used as first_frame or reference)
    image_path = scene.get("image_path", "")
    if not image_path or not os.path.exists(image_path):
        fallback = os.path.join(
            os.path.dirname(videos_dir), "scenes", f"scene_{scene_id:03d}.png"
        )
        if os.path.exists(fallback):
            image_path = fallback
        elif not character_image:
            print(f"[videos]   Scene {scene_id}: Image not found, skipping")
            return False

    # Determine video duration
    if duration_override:
        duration = duration_override
    else:
        duration = choose_duration(scene_duration)

    # Build motion prompt: scene description + camera + style enforcement
    camera = scene.get("camera_movement", "")
    shot_type = scene.get("shot_type", "")
    mood = scene.get("mood", "")

    motion_prompt = prompt
    if camera:
        motion_prompt += f" Camera movement: {camera}."
    if shot_type:
        motion_prompt += f" Shot type: {shot_type}."
    if mood and mood != "neutral":
        motion_prompt += f" Mood: {mood}."
    if style_suffix:
        motion_prompt += f" {style_suffix}"

    output_path = os.path.join(videos_dir, f"scene_{scene_id:03d}.mp4")

    mode = "video-reference" if character_image else "first-frame"
    print(f"[videos]   Scene {scene_id}: {prompt[:50]}...")
    print(f"[videos]     Model: {model}, Duration: {duration}s, Mode: {mode}")

    # Submit with retries
    task_id = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            task_id = submit_image_to_video(
                api_key=api_key,
                image_path=image_path,
                prompt=motion_prompt,
                model=model,
                duration=duration,
                aspect_ratio=ASPECT_RATIO,
                webhook_url=webhook_url,
                character_image_path=character_image,
            )
            print(f"[videos]     Task submitted: {task_id}")
            break
        except Exception as e:
            print(f"[videos]     Submit error (attempt {attempt}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES:
                wait = RETRY_DELAY_SECONDS * (2 ** (attempt - 1))
                print(f"[videos]     Retrying in {wait}s...")
                time.sleep(wait)
            else:
                print(f"[videos]     All retries exhausted for scene {scene_id}")
                return False

    if not task_id:
        return False

    # If webhook mode, don't poll - just record task_id
    if webhook_url:
        scene["video_task_id"] = task_id
        scene["video_status"] = "PROCESSING"
        print(f"[videos]     Webhook mode: task_id saved, will be notified at {webhook_url}")
        return True

    # Poll for completion
    status, video_urls = poll_task_status(api_key, task_id)

    if status != "COMPLETED" or not video_urls:
        print(f"[videos]     Scene {scene_id} failed: status={status}")
        scene["video_task_id"] = task_id
        scene["video_status"] = status
        return False

    # Download the video
    video_url = video_urls[0]  # First (usually only) generated video
    print(f"[videos]     Downloading video...")

    try:
        download_file(video_url, output_path)
        file_size = os.path.getsize(output_path)
        if file_size < 1024:
            print(f"[videos]     Downloaded file too small ({file_size}B), likely invalid")
            return False

        scene["video_path"] = output_path
        scene["video_url"] = video_url
        scene["video_task_id"] = task_id
        scene["video_status"] = "COMPLETED"
        scene["video_duration"] = duration

        size_kb = file_size / 1024
        size_display = f"{size_kb:.0f}KB" if size_kb < 1024 else f"{size_kb/1024:.1f}MB"
        print(f"[videos]     OK {size_display}")
        return True

    except Exception as e:
        print(f"[videos]     Download error: {e}")
        scene["video_task_id"] = task_id
        scene["video_url"] = video_url
        scene["video_status"] = "DOWNLOAD_FAILED"
        return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate video clips from scene images using Freepik Kling AI"
    )
    parser.add_argument(
        "--spec-dir",
        required=True,
        help="Path to output directory containing spec.json and assets/scenes/",
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("FREEPIK_API_KEY", ""),
        help="Freepik API key (or set FREEPIK_API_KEY env var)",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        choices=list(MODELS.keys()),
        help=f"Kling model to use (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--duration",
        type=int,
        choices=[5, 10],
        default=None,
        help="Force video duration (5 or 10 seconds). Default: auto based on scene duration",
    )
    parser.add_argument(
        "--webhook-url",
        default=None,
        help="Webhook URL for async completion notifications (skip polling)",
    )
    parser.add_argument(
        "--scenes",
        default=None,
        help="Comma-separated scene IDs to process (e.g., '1,3,5'). Default: all",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip scenes that already have a video_path with an existing file",
    )
    parser.add_argument(
        "--character-image",
        default=None,
        help="Path to character reference image. Uses this as first_frame for ALL scenes instead of scene images.",
    )

    args = parser.parse_args()

    # Validate API key
    api_key = args.api_key
    if not api_key:
        print("[videos] ERROR: No API key provided.")
        print("[videos] Use --api-key or set FREEPIK_API_KEY environment variable.")
        sys.exit(1)

    # Validate spec directory
    spec_dir = os.path.abspath(args.spec_dir)
    spec_path = os.path.join(spec_dir, "spec.json")

    if not os.path.exists(spec_path):
        print(f"[videos] ERROR: spec.json not found at {spec_path}")
        sys.exit(1)

    # Load spec
    with open(spec_path, encoding="utf-8") as f:
        spec = json.load(f)

    scenes = spec.get("scenes", [])
    if not scenes:
        print("[videos] ERROR: No scenes found in spec.json")
        sys.exit(1)

    # Filter scenes if --scenes specified
    if args.scenes:
        scene_ids = set(int(s.strip()) for s in args.scenes.split(","))
        scenes = [s for s in scenes if s["id"] in scene_ids]
        print(f"[videos] Filtering to scenes: {sorted(scene_ids)}")

    # Read style suffix from spec for prompt enrichment
    style_suffix = spec.get("style", {}).get("prompt_suffix", "")

    # Create output directory
    videos_dir = os.path.join(spec_dir, "assets", "videos")
    os.makedirs(videos_dir, exist_ok=True)

    # Print configuration
    print(f"[videos] Freepik Kling AI — Image-to-Video")
    print(f"[videos] Model: {args.model}")
    print(f"[videos] Aspect ratio: {ASPECT_RATIO}")
    print(f"[videos] Duration: {'auto' if args.duration is None else f'{args.duration}s'}")
    print(f"[videos] Scenes to process: {len(scenes)}")
    print(f"[videos] Output: {videos_dir}")
    if style_suffix:
        print(f"[videos] Style: {style_suffix[:80]}...")
    if args.webhook_url:
        print(f"[videos] Webhook: {args.webhook_url}")
    if args.skip_existing:
        print(f"[videos] Skip existing: enabled")
    if args.character_image:
        print(f"[videos] Character ref: {args.character_image}")
        print(f"[videos] Endpoint: video-reference (reference_images)")
    print()

    # Validate character image if provided
    character_image = args.character_image
    if character_image and not os.path.exists(character_image):
        print(f"[videos] ERROR: Character image not found: {character_image}")
        sys.exit(1)

    # Process scenes
    success = 0
    failed = 0
    skipped = 0
    start_time = time.time()

    for i, scene in enumerate(scenes):
        scene_id = scene["id"]

        # Skip existing
        if args.skip_existing:
            existing_video = scene.get("video_path", "")
            if existing_video and os.path.exists(existing_video):
                file_size = os.path.getsize(existing_video)
                if file_size > 1024:
                    print(f"[videos]   Scene {scene_id}: Already has video, skipping")
                    skipped += 1
                    continue

        ok = process_scene(
            api_key=api_key,
            scene=scene,
            videos_dir=videos_dir,
            model=args.model,
            duration_override=args.duration,
            webhook_url=args.webhook_url,
            style_suffix=style_suffix,
            character_image=character_image,
        )

        if ok:
            success += 1
        else:
            failed += 1

        # Rate limiting delay between submissions
        if i < len(scenes) - 1:
            time.sleep(DELAY_BETWEEN_SUBMITS)

    # Save updated spec
    with open(spec_path, "w", encoding="utf-8") as f:
        json.dump(spec, f, ensure_ascii=False, indent=2)

    elapsed = time.time() - start_time
    print()
    print(f"[videos] Done in {elapsed:.0f}s: {success} success, {failed} failed, {skipped} skipped")
    print(f"[videos] Spec updated: {spec_path}")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
