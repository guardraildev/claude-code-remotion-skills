import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption, TikTokPage } from "@remotion/captions";
import { useMemo } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type CaptionSceneProps = { captions: Caption[] };

const FPS = 30;
const SWITCH_EVERY_MS = 1200;

export const calculateCaptionMetadata: CalculateMetadataFunction<
  CaptionSceneProps
> = async () => {
  const res = await fetch(staticFile("captions.json"));
  const captions = (await res.json()) as Caption[];
  const endMs = Math.max(...captions.map((c) => c.endMs));
  return {
    props: { captions },
    durationInFrames: Math.ceil(((endMs + 1000) / 1000) * FPS),
  };
};

const Page: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absMs = page.startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 1920 * 0.64,
        paddingLeft: 60,
        paddingRight: 60,
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
          whiteSpace: "pre-wrap",
          textShadow: "0 6px 18px rgba(0,0,0,0.8)",
        }}
      >
        {page.tokens.map((t) => {
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

export const CaptionScene: React.FC<CaptionSceneProps> = ({ captions }) => {
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
    <AbsoluteFill style={{ backgroundColor: "#0d0d12" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.floor((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const dur = Math.max(1, Math.ceil((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Page page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
