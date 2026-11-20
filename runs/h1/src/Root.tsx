import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { RouteMap } from "./RouteMap";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="RouteMap"
        component={RouteMap}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={300}
      />
    </>
  );
};
