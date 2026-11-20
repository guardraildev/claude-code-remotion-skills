import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { CaptionScene, captionSceneDurationMs } from "./CaptionScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="CaptionScene"
        component={CaptionScene}
        durationInFrames={Math.ceil((captionSceneDurationMs / 1000) * 30)}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
