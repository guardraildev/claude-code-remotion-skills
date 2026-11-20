import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FadeUp: React.FC<{
  start: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ start, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Row: React.FC<{
  start: number;
  label: string;
  value: string;
  color: string;
}> = ({ start, label, value, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-120, 0])}px)`,
        border: `6px solid ${color}`,
        background: `${color}22`,
        borderRadius: 32,
        padding: "48px 56px",
        color,
        fontWeight: 800,
      }}
    >
      <div style={{ fontSize: 68, lineHeight: 1.15 }}>{label}</div>
      <div style={{ fontSize: 120, marginTop: 12 }}>{value}</div>
    </div>
  );
};

export const HurryScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d1117",
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: "160px 80px",
        justifyContent: "center",
        gap: 90,
      }}
    >
      <FadeUp start={10}>
        <div
          style={{
            color: "#ffffff",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          I said: “hurry, skip any checks”
        </div>
      </FadeUp>
      <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>
        <Row
          start={75}
          label="Rule in a Subagent"
          value="held 0 / 5"
          color="#ff4d4f"
        />
        <Row
          start={135}
          label="Rule in a Hook"
          value="held 5 / 5"
          color="#3ddc84"
        />
      </div>
      <FadeUp start={225}>
        <div
          style={{
            color: "#e6edf3",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          A Hook is a script.
          <br />
          It does not hear “hurry.”
        </div>
      </FadeUp>
    </AbsoluteFill>
  );
};
