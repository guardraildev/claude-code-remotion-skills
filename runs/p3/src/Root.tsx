import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { CaptionScene, calculateCaptionMetadata } from "./CaptionScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="CaptionScene"
        component={CaptionScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={300}
        defaultProps={{ captions: [] }}
        calculateMetadata={calculateCaptionMetadata}
      />
    </>
  );
};
