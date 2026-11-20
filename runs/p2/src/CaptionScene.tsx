import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import captionsJson from "../public/captions.json";

export const captions = captionsJson as Caption[];
export const FPS = 30;
export const CAPTION_DURATION_IN_FRAMES = Math.ceil(
  ((captions[captions.length - 1].endMs + 800) / 1000) * FPS,
);

const HIGHLIGHT = "#FFE600";

const Page: React.FC<{
  tokens: { text: string; fromMs: number; toMs: number }[];
  startMs: number;
}> = ({ tokens, startMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absMs = startMs + (frame / fps) * 1000;
  const pop = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 6 });

  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-start", alignItems: "center", top: "62%" }}
    >
      <div
        style={{
          maxWidth: 940,
          textAlign: "center",
          fontFamily: "Arial Black, Helvetica, sans-serif",
          fontWeight: 900,
          fontSize: 110,
          lineHeight: 1.15,
          color: "white",
          whiteSpace: "pre-wrap",
          textShadow: "0 6px 18px rgba(0,0,0,0.8)",
          transform: `scale(${0.85 + 0.15 * pop})`,
        }}
      >
        {tokens.map((t) => {
          const active = t.fromMs <= absMs && absMs < t.toMs;
          return (
            <span key={t.fromMs} style={{ color: active ? HIGHLIGHT : "white" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionScene: React.FC = () => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 }),
    [],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0f" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.floor((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs + 500;
        const dur = Math.max(1, Math.ceil((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={page.text.trim()}>
            <Page tokens={page.tokens} startMs={from * (1000 / fps)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
