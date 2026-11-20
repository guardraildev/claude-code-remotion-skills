import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Free, keyless map data: prefecture boundaries of Japan (dataofjapan/land, GitHub).
const GEOJSON_URL =
  "https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson";

const W = 1080;
const H = 1920;
const LON0 = 137.6;
const LAT0 = 36.0;
const K = 120; // px per degree of longitude

const mercY = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const project = (lon: number, lat: number): [number, number] => [
  W / 2 + (lon - LON0) * K,
  H / 2 - (mercY(lat) - mercY(LAT0)) * (180 / Math.PI) * K,
];

const TOKYO = project(139.6917, 35.6895);
const OSAKA = project(135.5023, 34.6937);

type Props = { mapPath: string };

type Ring = number[][];
type Geometry =
  | { type: "Polygon"; coordinates: Ring[] }
  | { type: "MultiPolygon"; coordinates: Ring[][] };

const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const res = await fetch(GEOJSON_URL);
  if (!res.ok) throw new Error(`Map download failed: ${res.status}`);
  const geo = (await res.json()) as { features: { geometry: Geometry }[] };
  const parts: string[] = [];
  for (const f of geo.features) {
    const polys =
      f.geometry.type === "MultiPolygon"
        ? f.geometry.coordinates
        : [f.geometry.coordinates];
    for (const poly of polys) {
      for (const ring of poly) {
        const pts: [number, number][] = [];
        for (const c of ring) {
          const p = project(c[0], c[1]);
          const last = pts[pts.length - 1];
          if (!last || Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) > 2)
            pts.push(p);
        }
        if (pts.length < 3) continue;
        const xs = pts.map((p) => p[0]);
        const ys = pts.map((p) => p[1]);
        if (
          Math.max(...xs) < -50 ||
          Math.min(...xs) > W + 50 ||
          Math.max(...ys) < -50 ||
          Math.min(...ys) > H + 50
        )
          continue;
        parts.push(
          "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") + "Z",
        );
      }
    }
  }
  return { props: { mapPath: parts.join("") } };
};

export const RouteMapComposition = () => (
  <Composition
    id="RouteMap"
    component={RouteMap}
    durationInFrames={300}
    fps={30}
    width={W}
    height={H}
    defaultProps={{ mapPath: "" }}
    calculateMetadata={calculateMetadata}
  />
);

// Curved route: quadratic bezier bowed toward the Pacific side.
const mid: [number, number] = [
  (TOKYO[0] + OSAKA[0]) / 2 + 20,
  (TOKYO[1] + OSAKA[1]) / 2 + 80,
];
const bez = (t: number): [number, number] => {
  const u = 1 - t;
  return [
    u * u * TOKYO[0] + 2 * u * t * mid[0] + t * t * OSAKA[0],
    u * u * TOKYO[1] + 2 * u * t * mid[1] + t * t * OSAKA[1],
  ];
};
const ROUTE = `M${TOKYO[0]} ${TOKYO[1]} Q${mid[0]} ${mid[1]} ${OSAKA[0]} ${OSAKA[1]}`;
const ROUTE_LEN = (() => {
  let l = 0;
  let prev = bez(0);
  for (let i = 1; i <= 200; i++) {
    const p = bez(i / 200);
    l += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
  }
  return l;
})();

const Marker: React.FC<{
  at: [number, number];
  name: string;
  jp: string;
  start: number;
  labelSide: "left" | "right";
}> = ({ at, name, jp, start, labelSide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 12 } });
  const pulse = ((frame - start) % 45) / 45;
  const dx = labelSide === "right" ? 36 : -36;
  return (
    <g>
      {frame > start && (
        <circle
          cx={at[0]}
          cy={at[1]}
          r={18 + pulse * 50}
          fill="none"
          stroke="#ff4d5e"
          strokeWidth={4}
          opacity={1 - pulse}
        />
      )}
      <circle cx={at[0]} cy={at[1]} r={20 * s} fill="#ff4d5e" stroke="#fff" strokeWidth={6 * s} />
      <g opacity={s} transform={`translate(0 ${(1 - s) * 20})`}>
        <text
          x={at[0] + dx}
          y={at[1] - 6}
          textAnchor={labelSide === "right" ? "start" : "end"}
          fill="#fff"
          fontSize={64}
          fontWeight={800}
          fontFamily="Helvetica, Arial, sans-serif"
          style={{ paintOrder: "stroke" }}
          stroke="#0b1d33"
          strokeWidth={10}
        >
          {name}
        </text>
        <text
          x={at[0] + dx}
          y={at[1] + 52}
          textAnchor={labelSide === "right" ? "start" : "end"}
          fill="#9fd3ff"
          fontSize={40}
          fontWeight={600}
          fontFamily="Hiragino Sans, Noto Sans JP, sans-serif"
          style={{ paintOrder: "stroke" }}
          stroke="#0b1d33"
          strokeWidth={8}
        >
          {jp}
        </text>
      </g>
    </g>
  );
};

export const RouteMap: React.FC<Props> = ({ mapPath }) => {
  const frame = useCurrentFrame();
  const drawStart = 45;
  const drawEnd = 210;
  const progress = interpolate(frame, [drawStart, drawEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const head = bez(progress);
  const mapIn = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, 300], [1.08, 1]);
  const titleIn = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const km = Math.round(progress * 400);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1d33" }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ transform: `scale(${zoom})`, transformOrigin: `${(TOKYO[0] + OSAKA[0]) / 2}px ${(TOKYO[1] + OSAKA[1]) / 2}px` }}
      >
        <path d={mapPath} fill="#1f3f5e" stroke="#3d6a91" strokeWidth={1.5} strokeLinejoin="round" opacity={mapIn} />
        <path
          d={ROUTE}
          fill="none"
          stroke="#ffd166"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={ROUTE_LEN}
          strokeDashoffset={ROUTE_LEN * (1 - progress)}
          style={{ filter: "drop-shadow(0 0 10px rgba(255,209,102,0.8))" }}
        />
        {progress > 0 && progress < 1 && <circle cx={head[0]} cy={head[1]} r={14} fill="#fff" />}
        <Marker at={TOKYO} name="Tokyo" jp="東京" start={30} labelSide="right" />
        <Marker at={OSAKA} name="Osaka" jp="大阪" start={drawEnd} labelSide="left" />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 140,
          width: "100%",
          textAlign: "center",
          color: "#fff",
          fontFamily: "Helvetica, Arial, sans-serif",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * -30}px)`,
        }}
      >
        <div style={{ fontSize: 92, fontWeight: 900 }}>Tokyo → Osaka</div>
        <div style={{ fontSize: 44, color: "#9fd3ff", marginTop: 16 }}>{km} km</div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          color: "#5d84a8",
          fontSize: 24,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        Map data: dataofjapan/land (GitHub)
      </div>
    </AbsoluteFill>
  );
};
