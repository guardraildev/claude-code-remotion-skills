import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption } from "@remotion/captions";
import { useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import captionsJson from "../public/captions.json";

export const captions = captionsJson as Caption[];
const COMBINE_MS = 1200;

const Page: React.FC<{
  page: ReturnType<typeof createTikTokStyleCaptions>["pages"][number];
}> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absMs = page.startMs + (frame / fps) * 1000;
  const pop = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 8 });
  const scale = interpolate(pop, [0, 1], [0.85, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 1180,
          width: 960,
          textAlign: "center",
          fontFamily: "Inter, Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 110,
          lineHeight: 1.15,
          color: "white",
          textTransform: "uppercase",
          whiteSpace: "pre-wrap",
          WebkitTextStroke: "6px black",
          paintOrder: "stroke",
          textShadow: "0 8px 24px rgba(0,0,0,0.6)",
          scale: String(scale),
        }}
      >
        {page.tokens.map((t) => {
          const active = t.fromMs <= absMs && t.toMs > absMs;
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

export const CaptionScene: React.FC = () => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: COMBINE_MS }),
    [],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#111114" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const endFrame = Math.round((endMs / 1000) * fps);
        if (endFrame <= startFrame) return null;
        return (
          <Sequence
            key={i}
            name={`Page ${i + 1}`}
            from={startFrame}
            durationInFrames={endFrame - startFrame}
          >
            <Page page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
