import { geoInterpolate, geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
// Natural Earth 1:10m country borders (public domain), via the world-atlas package
import countries10m from "world-atlas/countries-10m.json";

const W = 1080;
const H = 1920;
const TOKYO: [number, number] = [139.6917, 35.6895];
const OSAKA: [number, number] = [135.5023, 34.6937];
const FONT = "Helvetica, Arial, sans-serif";

const topo = countries10m as unknown as Topology;
const all = feature(
  topo,
  topo.objects.countries,
) as unknown as FeatureCollection<Geometry>;
const japan = all.features.find((f) => String(f.id) === "392") as Feature<Geometry>;
const others = all.features.filter((f) => String(f.id) !== "392");
const routeFn = geoInterpolate(TOKYO, OSAKA);

const Marker: React.FC<{
  xy: [number, number];
  name: string;
  jp: string;
  pop: number;
  labelDy: number;
}> = ({ xy, name, jp, pop, labelDy }) => (
  <g transform={`translate(${xy[0]},${xy[1]})`} opacity={Math.min(1, Math.max(0, pop))}>
    <circle r={38 * pop} fill="#ff4d4f" opacity={0.25} />
    <circle r={18 * pop} fill="#ff4d4f" stroke="#fff" strokeWidth={6} />
    <g transform={`translate(0,${labelDy}) scale(${Math.max(0, pop)})`}>
      <text textAnchor="middle" fontSize={64} fontWeight={800} fill="#fff" stroke="#0b1d33" strokeWidth={10} paintOrder="stroke" fontFamily={FONT}>
        {name}
      </text>
      <text y={56} textAnchor="middle" fontSize={40} fontWeight={600} fill="#cfe3ff" stroke="#0b1d33" strokeWidth={8} paintOrder="stroke" fontFamily={FONT}>
        {jp}
      </text>
    </g>
  </g>
);

export const RouteMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera: wide view of Japan, then zoom into the Tokyo–Osaka corridor
  const zoom = interpolate(frame, [15, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const projection = geoMercator()
    .center([
      interpolate(zoom, [0, 1], [137.5, 137.6]),
      interpolate(zoom, [0, 1], [37.5, 35.2]),
    ])
    .scale(interpolate(zoom, [0, 1], [3400, 10000]))
    .translate([W / 2, H / 2]);
  const path = geoPath(projection);

  const progress = interpolate(frame, [90, 225], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const N = 120;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N * progress; i++) pts.push(projection(routeFn(i / N))!);
  if (progress > 0) pts.push(projection(routeFn(progress))!);
  const routeD = pts.length > 1 ? "M" + pts.map((p) => p.join(",")).join("L") : "";
  const head = pts[pts.length - 1];

  const tokyoPop = spring({ frame: frame - 60, fps, config: { damping: 12 } });
  const osakaPop = spring({ frame: frame - 222, fps, config: { damping: 12 } });
  const titleIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1d33" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {others.map((f, i) => (
          <path key={i} d={path(f) ?? ""} fill="#1d3352" stroke="#2c4a70" strokeWidth={1.5} />
        ))}
        <path d={path(japan) ?? ""} fill="#3a6b4f" stroke="#8fd1a8" strokeWidth={2.5} />
        {routeD ? (
          <>
            <path d={routeD} fill="none" stroke="#ffd166" strokeWidth={24} strokeOpacity={0.25} strokeLinecap="round" />
            <path d={routeD} fill="none" stroke="#ffd166" strokeWidth={9} strokeLinecap="round" />
            {progress < 1 ? <circle cx={head[0]} cy={head[1]} r={14} fill="#fff" /> : null}
          </>
        ) : null}
        <Marker xy={projection(TOKYO)!} name="TOKYO" jp="東京" pop={tokyoPop} labelDy={-125} />
        <Marker xy={projection(OSAKA)!} name="OSAKA" jp="大阪" pop={osakaPop} labelDy={110} />
      </svg>
      <div style={{ position: "absolute", top: 140, width: "100%", textAlign: "center", opacity: titleIn, color: "#fff", fontFamily: FONT }}>
        <div style={{ fontSize: 88, fontWeight: 800 }}>Tokyo → Osaka</div>
        <div style={{ fontSize: 44, color: "#cfe3ff", marginTop: 10 }}>
          {Math.round(400 * progress)} / ~400 km
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", color: "#6f8bb0", fontSize: 26, fontFamily: FONT }}>
        Map data: Natural Earth (public domain)
      </div>
    </AbsoluteFill>
  );
};
