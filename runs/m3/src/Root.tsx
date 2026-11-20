import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { CaptionScene, captions } from "./CaptionScene";

const FPS = 30;
const lastEndMs = Math.max(...captions.map((c) => c.endMs));

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="CaptionScene"
        component={CaptionScene}
        durationInFrames={Math.ceil(((lastEndMs + 1000) / 1000) * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
