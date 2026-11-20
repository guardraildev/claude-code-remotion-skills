import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import captionsJson from "../public/captions.json";

const captions = captionsJson as Caption[];
const SWITCH_EVERY_MS = 1200;
const TAIL_MS = 1000;

export const captionSceneDurationMs =
  Math.max(...captions.map((c) => c.endMs)) + TAIL_MS;

const Page: React.FC<{
  page: ReturnType<typeof createTikTokStyleCaptions>["pages"][number];
}> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        top: 1920 * (2 / 3) - 120,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 110,
          lineHeight: 1.15,
          textAlign: "center",
          color: "white",
          WebkitTextStroke: "6px black",
          paintOrder: "stroke",
          textShadow: "0 8px 24px rgba(0,0,0,0.6)",
          whiteSpace: "pre-wrap",
        }}
      >
        {page.tokens.map((t) => {
          const active = absMs >= t.fromMs && absMs < t.toMs;
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

export const CaptionScene: React.FC = () => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: SWITCH_EVERY_MS,
      }),
    [],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f12" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const from = Math.round((page.startMs / 1000) * fps);
        const endMs = next
          ? next.startMs
          : page.startMs + page.durationMs + TAIL_MS;
        const dur = Math.max(1, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`Page ${i + 1}`}>
            <Page page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
