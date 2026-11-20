import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const useEnter = (start: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 200 } });
  return {
    opacity: interpolate(frame - start, [0, 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${(1 - p) * 60}px)`,
  };
};

const Row: React.FC<{ label: string; value: string; color: string; start: number }> = ({
  label,
  value,
  color,
  start,
}) => (
  <div
    style={{
      ...useEnter(start),
      border: `6px solid ${color}`,
      background: `${color}22`,
      borderRadius: 32,
      padding: "40px 48px",
      width: "100%",
    }}
  >
    <div style={{ fontSize: 64, color: "#e6e6e6", fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 120, color, fontWeight: 800, marginTop: 8 }}>{value}</div>
  </div>
);

export const HurryScene: React.FC = () => {
  const title = useEnter(0);
  const outro = useEnter(270);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d0f14",
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: 80,
        justifyContent: "center",
        alignItems: "center",
        gap: 70,
      }}
    >
      <div style={{ ...title, fontSize: 88, fontWeight: 800, color: "#ffffff", textAlign: "center", lineHeight: 1.2 }}>
        I said: hurry, skip any checks
      </div>
      <Row label="Rule in a Subagent:" value="held 0 / 5" color="#ff4d4f" start={75} />
      <Row label="Rule in a Hook:" value="held 5 / 5" color="#34d399" start={150} />
      <div style={{ ...outro, fontSize: 72, fontWeight: 700, color: "#ffffff", textAlign: "center", lineHeight: 1.3 }}>
        A Hook is a script. It does not hear hurry.
      </div>
    </AbsoluteFill>
  );
};
