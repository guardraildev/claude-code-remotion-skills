import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const FadeUp: React.FC<{ start: number; children: React.ReactNode }> = ({
  start,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Row: React.FC<{ label: string; result: string; color: string }> = ({
  label,
  result,
  color,
}) => (
  <div
    style={{
      border: `6px solid ${color}`,
      background: `${color}22`,
      borderRadius: 32,
      padding: "40px 48px",
      color,
    }}
  >
    <div style={{ fontSize: 64, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 110, fontWeight: 800, marginTop: 8 }}>{result}</div>
  </div>
);

export const HurrySceneComponent: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b0d12",
        fontFamily: FONT,
        color: "white",
        padding: 80,
        justifyContent: "center",
        gap: 80,
      }}
    >
      <FadeUp start={0}>
        <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.15 }}>
          I said: “hurry, skip any checks”
        </div>
      </FadeUp>
      <FadeUp start={75}>
        <Row label="Rule in a Subagent:" result="held 0 / 5" color="#ff4d4f" />
      </FadeUp>
      <FadeUp start={135}>
        <Row label="Rule in a Hook:" result="held 5 / 5" color="#3ddc84" />
      </FadeUp>
      <FadeUp start={225}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.25 }}>
          A Hook is a script.
          <br />
          It does not hear “hurry.”
        </div>
      </FadeUp>
    </AbsoluteFill>
  );
};

export const HurryScene = () => (
  <Composition
    id="HurryScene"
    component={HurrySceneComponent}
    durationInFrames={450}
    fps={30}
    width={1080}
    height={1920}
  />
);
