import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { useEffect, useState } from "react";

interface Word {
  word: string;
  start: number;
  end: number;
}

interface Scene {
  id: number;
  start: number;
  end: number;
  duration: number;
  shot_type: string;
  camera_movement: string;
  transition_in: string;
  image_prompt: string;
  image_path?: string;
  video_path?: string;
  video_duration?: number;
  subtitle_text: string;
  subtitle_words?: Word[];
  sfx?: { file_path?: string; volume?: number; start?: number; duration?: number } | null;
  mood: string;
  audio_layer: string;
}

interface VideoSpec {
  version: string;
  metadata: { duration_seconds: number; fps: number };
  style: { name: string };
  subtitles: { enabled: boolean; color: string; stroke_color: string; highlight_color: string; font_size: number };
  scenes: Scene[];
}

export const AudioReels: React.FC<{ specPath: string }> = ({ specPath }) => {
  const [spec, setSpec] = useState<VideoSpec | null>(null);
  const { fps } = useVideoConfig();

  useEffect(() => {
    fetch(staticFile(specPath))
      .then((r) => r.json())
      .then(setSpec)
      .catch(console.error);
  }, [specPath]);

  if (!spec) return <AbsoluteFill style={{ backgroundColor: "#000" }} />;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Original audio narration */}
      <Audio src={staticFile("original.mp3")} volume={1} />

      {/* Scenes */}
      {spec.scenes.map((scene) => {
        const startFrame = Math.round(scene.start * fps);
        const durationFrames = Math.round((scene.end - scene.start) * fps);

        return (
          <Sequence
            key={scene.id}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <SceneSlide scene={scene} spec={spec} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SceneSlide: React.FC<{ scene: Scene; spec: VideoSpec }> = ({ scene, spec }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const durationFrames = Math.round((scene.end - scene.start) * fps);

  // Camera movement
  const scale = getCameraScale(scene.camera_movement, frame, durationFrames, fps);

  // Transition
  const opacity = getTransitionOpacity(scene.transition_in, frame, fps);

  // Video or image source
  const sceneNum = String(scene.id).padStart(3, "0");
  const videoSrc = scene.video_path
    ? staticFile(`assets/videos/scene_${sceneNum}.mp4`)
    : undefined;
  const imgSrc = scene.image_path
    ? staticFile(`assets/scenes/scene_${sceneNum}.png`)
    : undefined;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background: prefer video clip, fallback to image with camera movement */}
      {videoSrc ? (
        <AbsoluteFill>
          <OffthreadVideo
            src={videoSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            playbackRate={scene.video_duration && scene.duration > 0
              ? scene.video_duration / scene.duration
              : 1}
            muted
          />
        </AbsoluteFill>
      ) : imgSrc ? (
        <AbsoluteFill
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <Img
            src={imgSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      )}

      {/* SFX audio */}
      {scene.sfx?.file_path && (
        <Audio
          src={staticFile(`assets/sfx/sfx_${String(scene.id).padStart(3, "0")}.mp3`)}
          volume={scene.sfx.volume || 0.4}
        />
      )}

      {/* Word-by-word subtitles */}
      {spec.subtitles.enabled && scene.subtitle_words && (
        <SubtitleOverlay
          words={scene.subtitle_words}
          sceneStart={scene.start}
          config={spec.subtitles}
        />
      )}
    </AbsoluteFill>
  );
};

/** Group words into lines by natural pauses (gap > threshold) with max words per group */
function groupWordsByPause(words: Word[], gapThreshold = 0.25, maxWords = 5): Word[][] {
  if (words.length === 0) return [];
  const groups: Word[][] = [];
  let current: Word[] = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap > gapThreshold || current.length >= maxWords) {
      groups.push(current);
      current = [words[i]];
    } else {
      current.push(words[i]);
    }
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

const SubtitleOverlay: React.FC<{
  words: Word[];
  sceneStart: number;
  config: VideoSpec["subtitles"];
}> = ({ words, sceneStart, config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = sceneStart + frame / fps;

  const lines = groupWordsByPause(words, 0.2, 3);

  // Find current line: visible from first word start to last word end + padding
  const LINGER = 0.6;
  const currentLineIdx = lines.findIndex((line) => {
    const lineStart = line[0].start;
    const lineEnd = line[line.length - 1].end + LINGER;
    return currentTime >= lineStart && currentTime <= lineEnd;
  });
  const currentLine = currentLineIdx >= 0 ? lines[currentLineIdx] : null;

  if (!currentLine) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "18%",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 40px",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "18px" }}>
        {currentLine.map((word, i) => {
          const isActive = currentTime >= word.start && currentTime <= word.end + 0.25;
          return (
            <span
              key={`${word.word}-${i}`}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: config.font_size || 52,
                fontWeight: 800,
                letterSpacing: "1px",
                color: isActive ? (config.highlight_color || "#FFD700") : (config.color || "#FFFFFF"),
                textShadow: `
                  -3px -3px 0 ${config.stroke_color || "#000"},
                   3px -3px 0 ${config.stroke_color || "#000"},
                  -3px  3px 0 ${config.stroke_color || "#000"},
                   3px  3px 0 ${config.stroke_color || "#000"},
                   0px  0px 8px rgba(0,0,0,0.6)
                `,
                transform: isActive ? "scale(1.18)" : "scale(1)",
                transition: "transform 0.12s ease-out, color 0.1s",
              }}
            >
              {word.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

function getCameraScale(movement: string, frame: number, totalFrames: number, fps: number): number {
  const progress = frame / totalFrames;

  switch (movement) {
    case "slow-zoom-in":
      return interpolate(progress, [0, 1], [1, 1.15]);
    case "slow-zoom-out":
      return interpolate(progress, [0, 1], [1.15, 1]);
    case "ken-burns":
      return interpolate(progress, [0, 1], [1, 1.08]);
    case "dolly-in":
      return interpolate(progress, [0, 1], [1, 1.2]);
    case "handheld-shake": {
      const shake = Math.sin(frame * 0.5) * 0.005 + Math.cos(frame * 0.3) * 0.003;
      return 1.05 + shake;
    }
    default:
      return 1.02;
  }
}

function getTransitionOpacity(transition: string, frame: number, fps: number): number {
  const fadeFrames = Math.round(fps * 0.5);

  switch (transition) {
    case "fade-from-black":
      return interpolate(frame, [0, fadeFrames], [0, 1], { extrapolateRight: "clamp" });
    case "dissolve":
      return interpolate(frame, [0, fadeFrames], [0, 1], { extrapolateRight: "clamp" });
    default:
      return 1;
  }
}
