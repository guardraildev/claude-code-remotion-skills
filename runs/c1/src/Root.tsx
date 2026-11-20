import { CaptionSceneComposition } from "./CaptionScene";
import { MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <CaptionSceneComposition />
    </>
  );
};
