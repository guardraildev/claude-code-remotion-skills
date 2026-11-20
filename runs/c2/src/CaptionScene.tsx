import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { useMemo } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import captionsJson from "../public/captions.json";

const FPS = 30;
const SWITCH_CAPTIONS_EVERY_MS = 1200;
const captions = captionsJson as Caption[];

const calculateMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = () => {
  const lastEnd = Math.max(...captions.map((c) => c.endMs));
  return { durationInFrames: Math.ceil(((lastEnd + 600) / 1000) * FPS) };
};

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
        paddingLeft: 60,
        paddingRight: 60,
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
          textShadow: "0 6px 18px rgba(0,0,0,0.8)",
          WebkitTextStroke: "4px black",
          paintOrder: "stroke fill",
        }}
      >
        {tokens.map((t) => {
          const active = t.fromMs <= absMs && t.toMs > absMs;
          return (
            <span
              key={t.fromMs}
              style={{ color: active ? "#FFE600" : "white" }}
            >
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionSceneComponent: React.FC = () => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      }),
    [],
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b12" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const from = Math.round((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const to = Math.round((endMs / 1000) * fps);
        if (to <= from) return null;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <Page tokens={page.tokens} startMs={page.startMs} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const CaptionSceneComposition = () => (
  <Composition
    id="CaptionScene"
    component={CaptionSceneComponent}
    durationInFrames={480}
    fps={FPS}
    width={1080}
    height={1920}
    calculateMetadata={calculateMetadata}
  />
);
