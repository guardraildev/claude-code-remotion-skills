import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import captionsJson from "../public/captions.json";

const captions = captionsJson as Caption[];
const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200,
});

export const CAPTION_END_MS = captions[captions.length - 1].endMs;

const Page: React.FC<{ page: (typeof pages)[number] }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 560,
      }}
    >
      <div
        style={{
          width: 920,
          textAlign: "center",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 96,
          lineHeight: 1.15,
          whiteSpace: "pre-wrap",
          textShadow: "0 6px 18px rgba(0,0,0,0.8)",
        }}
      >
        {page.tokens.map((t) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs;
          return (
            <span
              key={t.fromMs}
              style={{ color: active ? "#FFE600" : "#FFFFFF" }}
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
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#111114" }}>
      {pages.map((page, i) => {
        const from = Math.round((page.startMs / 1000) * fps);
        const next = pages[i + 1];
        const end = next
          ? Math.round((next.startMs / 1000) * fps)
          : durationInFrames;
        if (end - from <= 0) return null;
        return (
          <Sequence
            key={i}
            name={`Page ${i + 1}`}
            from={from}
            durationInFrames={end - from}
          >
            <Page page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
