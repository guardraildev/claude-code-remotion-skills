import { useMemo } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";

type Props = { captions: Caption[] };

const FPS = 30;
const SWITCH_EVERY_MS = 1200;

const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const res = await fetch(staticFile("captions.json"));
  const captions = (await res.json()) as Caption[];
  const endMs = Math.max(...captions.map((c) => c.endMs));
  return {
    props: { captions },
    durationInFrames: Math.ceil(((endMs + 1000) / 1000) * FPS),
  };
};

export const CaptionSceneComposition = () => (
  <Composition
    id="CaptionScene"
    component={CaptionScene}
    durationInFrames={30 * 16}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ captions: [] }}
    calculateMetadata={calculateMetadata}
  />
);

const Page: React.FC<{
  tokens: { text: string; fromMs: number; toMs: number }[];
  startMs: number;
}> = ({ tokens, startMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absMs = startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 1180,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          fontFamily: "Arial Black, Helvetica, sans-serif",
          fontWeight: 900,
          fontSize: 110,
          lineHeight: 1.15,
          textAlign: "center",
          color: "white",
          textShadow: "0 6px 18px rgba(0,0,0,0.8)",
          whiteSpace: "pre-wrap",
        }}
      >
        {tokens.map((t) => {
          const active = absMs >= t.fromMs && absMs < t.toMs;
          return (
            <span key={t.fromMs} style={{ color: active ? "#FFE600" : "white" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionScene: React.FC<Props> = ({ captions }) => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: SWITCH_EVERY_MS,
      }),
    [captions],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0f" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const startFrame = Math.floor((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const endFrame = Math.ceil((endMs / 1000) * fps);
        if (endFrame <= startFrame) return null;
        return (
          <Sequence
            key={i}
            from={startFrame}
            durationInFrames={endFrame - startFrame}
            name={`Page ${i + 1}`}
          >
            <Page tokens={page.tokens} startMs={page.startMs} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
