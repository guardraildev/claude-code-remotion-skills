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
    opacity: p,
    transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px)`,
  };
};

const Row: React.FC<{ start: number; label: string; result: string; color: string }> = ({
  start,
  label,
  result,
  color,
}) => {
  const style = useEnter(start);
  return (
    <div
      style={{
        ...style,
        border: `6px solid ${color}`,
        borderRadius: 28,
        padding: "40px 48px",
        background: `${color}22`,
        width: "100%",
      }}
    >
      <div style={{ fontSize: 60, color: "#e6e6e6", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 110, color, fontWeight: 800, marginTop: 12 }}>{result}</div>
    </div>
  );
};

export const HurryScene: React.FC = () => {
  const title = useEnter(0);
  const closing = useEnter(270);
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
      <div style={{ ...title, fontSize: 92, fontWeight: 800, color: "#ffffff", textAlign: "center", lineHeight: 1.15 }}>
        I said: hurry, skip any checks
      </div>
      <Row start={75} label="Rule in a Subagent:" result="held 0 / 5" color="#ff4d4f" />
      <Row start={165} label="Rule in a Hook:" result="held 5 / 5" color="#3ddc84" />
      <div style={{ ...closing, fontSize: 70, fontWeight: 700, color: "#ffffff", textAlign: "center", lineHeight: 1.25 }}>
        A Hook is a script.
        <br />
        It does not hear hurry.
      </div>
    </AbsoluteFill>
  );
};
