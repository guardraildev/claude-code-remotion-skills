import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const useAppear = (start: number) => {
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
  const style = useAppear(start);
  return (
    <div
      style={{
        ...style,
        border: `6px solid ${color}`,
        borderRadius: 28,
        padding: "40px 48px",
        background: `${color}22`,
        color,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>{label}</div>
      <div style={{ fontSize: 110, fontWeight: 900, marginTop: 12 }}>{result}</div>
    </div>
  );
};

export const HurryScene: React.FC = () => {
  const title = useAppear(0);
  const closing = useAppear(270);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d0f14",
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: 80,
        justifyContent: "center",
        alignItems: "center",
        gap: 70,
        color: "#f5f5f5",
      }}
    >
      <div style={{ ...title, fontSize: 84, fontWeight: 800, textAlign: "center", lineHeight: 1.2 }}>
        I said: “hurry, skip any checks”
      </div>
      <Row start={75} label="Rule in a Subagent:" result="held 0 / 5" color="#ff4d4f" />
      <Row start={150} label="Rule in a Hook:" result="held 5 / 5" color="#3ddc84" />
      <div style={{ ...closing, fontSize: 68, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
        A Hook is a script.
        <br />
        It does not hear “hurry.”
      </div>
    </AbsoluteFill>
  );
};
