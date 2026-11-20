import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";

export type CaptionSceneProps = { captions: Caption[] };

const FPS = 30;
const COMBINE_MS = 1200;

export const calculateCaptionMetadata: CalculateMetadataFunction<
  CaptionSceneProps
> = async () => {
  const res = await fetch(staticFile("captions.json"));
  const captions = (await res.json()) as Caption[];
  const lastEnd = Math.max(...captions.map((c) => c.endMs));
  return {
    durationInFrames: Math.ceil(((lastEnd + 1000) / 1000) * FPS),
    props: { captions },
  };
};

const Page: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absMs = page.startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-start", alignItems: "center", top: "62%" }}
    >
      <div
        style={{
          maxWidth: 940,
          textAlign: "center",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 110,
          lineHeight: 1.15,
          color: "white",
          textShadow: "0 6px 20px rgba(0,0,0,0.8)",
          whiteSpace: "pre-wrap",
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

export const CaptionScene: React.FC<CaptionSceneProps> = ({ captions }) => {
  const { fps } = useVideoConfig();
  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: COMBINE_MS,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b10" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.floor((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const dur = Math.max(1, Math.ceil((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`Page ${i + 1}`}>
            <Page page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
