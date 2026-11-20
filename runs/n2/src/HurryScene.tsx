import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const fadeUp = (frame: number, start: number, fps: number) => {
  const s = spring({ frame: frame - start, fps, config: { damping: 200 } });
  return {
    opacity: interpolate(frame - start, [0, 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${(1 - s) * 60}px)`,
  };
};

const Row: React.FC<{
  label: string;
  value: string;
  color: string;
  start: number;
}> = ({ label, value, color, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        ...fadeUp(frame, start, fps),
        border: `6px solid ${color}`,
        borderRadius: 32,
        padding: "40px 48px",
        background: `${color}1f`,
        color,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>
        {label}
      </div>
      <div style={{ fontSize: 120, fontWeight: 900, marginTop: 12 }}>
        {value}
      </div>
    </div>
  );
};

export const HurryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d1117",
        fontFamily: "Helvetica, Arial, sans-serif",
        color: "#f0f3f6",
        padding: 80,
        justifyContent: "center",
        alignItems: "center",
        gap: 70,
        textAlign: "center",
      }}
    >
      <div
        style={{
          ...fadeUp(frame, 0, fps),
          fontSize: 84,
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        I said: “hurry, skip any checks”
      </div>
      <Row
        label="Rule in a Subagent"
        value="held 0 / 5"
        color="#ff4d4f"
        start={75}
      />
      <Row
        label="Rule in a Hook"
        value="held 5 / 5"
        color="#3ddc84"
        start={150}
      />
      <div
        style={{
          ...fadeUp(frame, 240, fps),
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        A Hook is a script.
        <br />
        It does not hear “hurry.”
      </div>
    </AbsoluteFill>
  );
};
