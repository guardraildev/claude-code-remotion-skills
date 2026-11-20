import { MyComposition } from "./Composition";
import { RouteMapComposition } from "./RouteMap";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <RouteMapComposition />
    </>
  );
};
