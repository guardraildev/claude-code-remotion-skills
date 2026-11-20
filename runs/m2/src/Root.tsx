import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { CaptionScene, CAPTION_END_MS } from "./CaptionScene";

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
        durationInFrames={Math.ceil(((CAPTION_END_MS + 1000) / 1000) * 30)}
      />
    </>
  );
};
