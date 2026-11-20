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

type Props = { captions: Caption[] };

const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const res = await fetch(staticFile("captions.json"));
  const captions = (await res.json()) as Caption[];
  const lastEnd = Math.max(...captions.map((c) => c.endMs));
  return {
    props: { captions },
    durationInFrames: Math.ceil(((lastEnd + 1000) / 1000) * FPS),
  };
};

const Page: React.FC<{
  page: ReturnType<typeof createTikTokStyleCaptions>["pages"][number];
}> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = page.startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 560 }}
    >
      <div
        style={{
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 110,
          lineHeight: 1.15,
          textAlign: "center",
          color: "white",
          padding: "0 60px",
          whiteSpace: "pre-wrap",
          textShadow: "0 6px 24px rgba(0,0,0,0.8)",
          WebkitTextStroke: "4px black",
          paintOrder: "stroke fill",
        }}
      >
        {page.tokens.map((t) => {
          const active = t.fromMs <= timeMs && timeMs < t.toMs;
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
    <AbsoluteFill style={{ backgroundColor: "#0d0d12" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = Math.round(
          ((next ? next.startMs : page.startMs + page.durationMs) / 1000) * fps,
        );
        const dur = endFrame - startFrame;
        if (dur <= 0) return null;
        return (
          <Sequence key={i} from={startFrame} durationInFrames={dur}>
            <Page page={page} />
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
    durationInFrames={30}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ captions: [] }}
    calculateMetadata={calculateMetadata}
  />
);
