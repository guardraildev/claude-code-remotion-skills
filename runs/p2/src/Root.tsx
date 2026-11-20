import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { CaptionScene, CAPTION_DURATION_IN_FRAMES, FPS } from "./CaptionScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="CaptionScene"
        component={CaptionScene}
        durationInFrames={CAPTION_DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
