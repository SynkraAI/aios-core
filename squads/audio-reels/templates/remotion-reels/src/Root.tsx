import { Composition, staticFile } from "remotion";
import { AudioReels } from "./AudioReels";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AudioReels"
      component={AudioReels}
      durationInFrames={30 * 300}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ specPath: "spec.json" }}
      calculateMetadata={async ({ props }) => {
        try {
          const res = await fetch(staticFile(props.specPath));
          const spec = await res.json();
          const duration = spec.metadata?.duration_seconds || 30;
          const fps = spec.metadata?.fps || 30;
          return { durationInFrames: Math.ceil(duration * fps), fps };
        } catch {
          return { durationInFrames: 30 * 300 };
        }
      }}
    />
  );
};
