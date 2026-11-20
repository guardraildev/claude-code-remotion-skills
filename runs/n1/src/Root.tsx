import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { HurryScene } from "./HurryScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="HurryScene"
        component={HurryScene}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
