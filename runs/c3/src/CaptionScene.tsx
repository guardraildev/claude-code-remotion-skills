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
const SWITCH_CAPTIONS_EVERY_MS = 1200;
const HIGHLIGHT_COLOR = "#FFE600";

type Props = { captions: Caption[] };

const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const res = await fetch(staticFile("captions.json"));
  const captions = (await res.json()) as Caption[];
  const endMs = Math.max(...captions.map((c) => c.endMs));
  return {
    props: { captions },
    durationInFrames: Math.ceil(((endMs + 500) / 1000) * FPS),
  };
};

export const CaptionSceneComposition = () => (
  <Composition
    id="CaptionScene"
    component={CaptionScene}
    durationInFrames={30}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ captions: [] }}
    calculateMetadata={calculateMetadata}
  />
);

const CaptionPage: React.FC<{
  page: ReturnType<typeof createTikTokStyleCaptions>["pages"][number];
}> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteMs = page.startMs + (frame / fps) * 1000;

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
          padding: "0 60px",
          color: "white",
          WebkitTextStroke: "4px black",
          paintOrder: "stroke",
          textShadow: "0 6px 20px rgba(0,0,0,0.6)",
          whiteSpace: "pre-wrap",
        }}
      >
        {page.tokens.map((t) => {
          const active = t.fromMs <= absoluteMs && t.toMs > absoluteMs;
          return (
            <span key={t.fromMs} style={{ color: active ? HIGHLIGHT_COLOR : "white" }}>
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
        combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      }),
    [captions],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b12" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = next
          ? Math.round((next.startMs / 1000) * fps)
          : startFrame + Math.round(((page.durationMs + 500) / 1000) * fps);
        const duration = endFrame - startFrame;
        if (duration <= 0) return null;
        return (
          <Sequence key={i} from={startFrame} durationInFrames={duration}>
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
