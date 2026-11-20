import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
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
    durationInFrames: Math.ceil(((endMs + TAIL_MS) / 1000) * FPS),
    props: { captions },
  };
};

export const CaptionSceneComposition = () => (
  <Composition
    id="CaptionScene"
    component={CaptionScene}
    durationInFrames={1}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ captions: [] }}
    calculateMetadata={calculateMetadata}
  />
);

type Page = ReturnType<typeof createTikTokStyleCaptions>["pages"][number];

const CaptionPage: React.FC<{ page: Page }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 560,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <div
        style={{
          fontFamily: "Arial Black, Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 110,
          lineHeight: 1.15,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          color: "white",
          textShadow: "0 6px 18px rgba(0,0,0,0.6)",
          WebkitTextStroke: "4px black",
          paintOrder: "stroke fill",
        }}
      >
        {page.tokens.map((t) => {
          const active = t.fromMs <= nowMs && nowMs < t.toMs;
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

export const CaptionScene: React.FC<Props> = ({ captions }) => {
  const { fps } = useVideoConfig();
  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: SWITCH_EVERY_MS,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#111114" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs;
        const endFrame = Math.round((endMs / 1000) * fps);
        if (endFrame <= startFrame) return null;
        return (
          <Sequence
            key={i}
            from={startFrame}
            durationInFrames={endFrame - startFrame}
          >
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
