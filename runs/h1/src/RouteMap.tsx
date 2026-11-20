import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";

// Map data: dataofjapan/land (public GeoJSON of Japan's prefectures, no API key).
const W = 1080;
const H = 1920;
const LON0 = 128.5;
const LON1 = 146.5;
const LAT0 = 30.5;
const LAT1 = 46.0;
const my = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const SX = W / (LON1 - LON0);
const KY = (SX * 180) / Math.PI;
const CY = (my(LAT0) + my(LAT1)) / 2;
const project = (lon: number, lat: number): [number, number] => [
  (lon - LON0) * SX,
  H / 2 - (my(lat) - CY) * KY,
];

const TOKYO = project(139.6917, 35.6895);
const OSAKA = project(135.5023, 34.6937);

type Ring = number[][];
type Geometry =
  | { type: "Polygon"; coordinates: Ring[] }
  | { type: "MultiPolygon"; coordinates: Ring[][] };

const toPaths = (gj: { features: { geometry: Geometry }[] }) =>
  gj.features.map(({ geometry: g }) => {
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    let d = "";
    for (const poly of polys) {
      for (const ring of poly) {
        let s = "";
        let n = 0;
        let lx = 0;
        let ly = 0;
        for (const [lon, lat] of ring) {
          const [x, y] = project(lon, lat);
          if (n && Math.hypot(x - lx, y - ly) < 1.2) continue;
          s += `${n ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
          lx = x;
          ly = y;
          n++;
        }
        if (n >= 3) d += s + "Z";
      }
    }
    return d;
  });

// Curved route (quadratic bezier, bowing south-east toward the Pacific coast)
const CTRL: [number, number] = [
  (TOKYO[0] + OSAKA[0]) / 2 + 30,
  (TOKYO[1] + OSAKA[1]) / 2 + 70,
];
const ROUTE = `M${TOKYO[0]} ${TOKYO[1]} Q${CTRL[0]} ${CTRL[1]} ${OSAKA[0]} ${OSAKA[1]}`;
const bez = (t: number): [number, number] => {
  const u = 1 - t;
  return [
    u * u * TOKYO[0] + 2 * u * t * CTRL[0] + t * t * OSAKA[0],
    u * u * TOKYO[1] + 2 * u * t * CTRL[1] + t * t * OSAKA[1],
  ];
};

const Marker: React.FC<{ x: number; y: number; label: string; jp: string; delay: number; side: 1 | -1 }> = ({ x, y, label, jp, delay, side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  const pulse = ((frame - delay) % 45) / 45;
  return (
    <g opacity={Math.min(1, s * 1.5)}>
      {frame > delay && (
        <circle cx={x} cy={y} r={10 + pulse * 40} fill="none" stroke="#ff4d5e" strokeWidth={4} opacity={1 - pulse} />
      )}
      <circle cx={x} cy={y} r={16 * s} fill="#ff4d5e" stroke="#fff" strokeWidth={5} />
      <g transform={`translate(${x + side * 34}, ${y - 10}) scale(${s})`}>
        <text textAnchor={side === 1 ? "start" : "end"} fill="#fff" fontSize={52} fontWeight={800} fontFamily="Helvetica, Arial, sans-serif" stroke="#0b1d33" strokeWidth={10} paintOrder="stroke">
          {label}
        </text>
        <text y={50} textAnchor={side === 1 ? "start" : "end"} fill="#9fc3e6" fontSize={36} fontWeight={600} fontFamily="Helvetica, Arial, sans-serif" stroke="#0b1d33" strokeWidth={8} paintOrder="stroke">
          {jp}
        </text>
      </g>
    </g>
  );
};

export const RouteMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [paths, setPaths] = useState<string[] | null>(null);
  const [handle] = useState(() => delayRender("Loading Japan GeoJSON"));

  useEffect(() => {
    fetch(staticFile("japan.geojson"))
      .then((r) => r.json())
      .then((gj) => {
        setPaths(toPaths(gj));
        continueRender(handle);
      })
      .catch(cancelRender);
  }, [handle, continueRender, cancelRender]);

  const mapPath = useMemo(() => paths?.join(""), [paths]);

  // Camera: start on whole Japan, zoom into the Kanto–Kansai corridor.
  const zoom = interpolate(frame, [0, 2.5 * fps], [1, 2.4], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const fx = (TOKYO[0] + OSAKA[0]) / 2;
  const fy = (TOKYO[1] + OSAKA[1]) / 2 - 90;
  const cx = interpolate(zoom, [1, 2.4], [W / 2, fx]);
  const cy = interpolate(zoom, [1, 2.4], [H / 2, fy]);

  const drawStart = 3 * fps;
  const drawEnd = 7.5 * fps;
  const progress = interpolate(frame, [drawStart, drawEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const [tx, ty] = bez(progress);
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const titleIn = spring({ frame: frame - 5, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ background: "#0b1d33", opacity: fadeOut }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="sea" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#173a5e" />
            <stop offset="100%" stopColor="#081626" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sea)" />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-cx} ${-cy})`}>
          {mapPath && (
            <path d={mapPath} fill="#2e5d4b" stroke="#8fc9a8" strokeWidth={1.4 / zoom} strokeLinejoin="round" />
          )}
          <path d={ROUTE} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={14 / zoom} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progress} strokeLinecap="round" transform="translate(2 3)" />
          <path d={ROUTE} fill="none" stroke="#ffd23f" strokeWidth={9 / zoom} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progress} strokeLinecap="round" />
          {progress > 0 && progress < 1 && (
            <circle cx={tx} cy={ty} r={12 / zoom} fill="#fff" stroke="#ffd23f" strokeWidth={5 / zoom} />
          )}
          <g transform={`translate(${TOKYO[0]} ${TOKYO[1]}) scale(${1 / zoom}) translate(${-TOKYO[0]} ${-TOKYO[1]})`}>
            <Marker x={TOKYO[0]} y={TOKYO[1]} label="Tokyo" jp="東京" delay={2.2 * fps} side={1} />
          </g>
          <g transform={`translate(${OSAKA[0]} ${OSAKA[1]}) scale(${1 / zoom}) translate(${-OSAKA[0]} ${-OSAKA[1]})`}>
            <Marker x={OSAKA[0]} y={OSAKA[1]} label="Osaka" jp="大阪" delay={drawEnd - 5} side={-1} />
          </g>
        </g>
      </svg>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", color: "#fff", fontFamily: "Helvetica, Arial, sans-serif", opacity: titleIn, transform: `translateY(${(1 - titleIn) * -40}px)` }}>
        <div style={{ fontSize: 84, fontWeight: 900 }}>Tokyo → Osaka</div>
        <div style={{ fontSize: 40, color: "#9fc3e6", marginTop: 12 }}>
          {Math.round(progress * 400)} km
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", color: "#6f8fae", fontSize: 24, fontFamily: "Helvetica, Arial, sans-serif" }}>
        Map data: dataofjapan/land
      </div>
    </AbsoluteFill>
  );
};
