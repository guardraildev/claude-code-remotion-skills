import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
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

const FPS = 30;
const SWITCH_EVERY_MS = 1200;
const TAIL_MS = 1000;

type Props = { captions: Caption[] };

const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const res = await fetch(staticFile("captions.json"));
  const captions = (await res.json()) as Caption[];
  const endMs = Math.max(0, ...captions.map((c) => c.endMs));
  return {
    props: { captions },
    durationInFrames: Math.max(1, Math.ceil(((endMs + TAIL_MS) / 1000) * FPS)),
  };
};

const Page: React.FC<{
  tokens: { text: string; fromMs: number; toMs: number }[];
  startMs: number;
}> = ({ tokens, startMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        top: "62%",
        padding: "0 80px",
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
          whiteSpace: "pre-wrap",
          textShadow: "0 6px 20px rgba(0,0,0,0.8)",
        }}
      >
        {tokens.map((t) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs;
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

export const CaptionSceneComponent: React.FC<Props> = ({ captions }) => {
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
        const endFrame = next
          ? Math.floor((next.startMs / 1000) * fps)
          : startFrame + Math.ceil(((page.durationMs + TAIL_MS) / 1000) * fps);
        if (endFrame <= startFrame) return null;
        return (
          <Sequence
            key={i}
            from={startFrame}
            durationInFrames={endFrame - startFrame}
          >
            <Page tokens={page.tokens} startMs={startFrame * (1000 / fps)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const CaptionScene = () => (
  <Composition
    id="CaptionScene"
    component={CaptionSceneComponent}
    durationInFrames={1}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ captions: [] }}
    calculateMetadata={calculateMetadata}
  />
);
