import * as turf from "@turf/turf";
import { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import * as maplibregl from "maplibre-gl";
import { type GeoJSONSource, type Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Map data: OpenFreeMap (no API key), © OpenMapTiles, © OpenStreetMap contributors
const STYLE = "https://tiles.openfreemap.org/styles/liberty";

const tokyo: [number, number] = [139.6917, 35.6895];
const osaka: [number, number] = [135.5023, 34.6937];

const route = turf.greatCircle(tokyo, osaka, { npoints: 100 }) as ReturnType<
  typeof turf.lineString
>;
const routeLength = turf.length(route);

const partialRoute = (p: number) =>
  turf.lineSliceAlong(route, 0, Math.max(0.001, routeLength * Math.min(1, Math.max(0, p))));

const markers = (showOsaka: boolean) =>
  turf.featureCollection([
    turf.point(tokyo, { name: "Tokyo" }),
    ...(showOsaka ? [turf.point(osaka, { name: "Osaka" })] : []),
  ]);

export const RouteMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const { delayRender, continueRender } = useDelayRender();
  const { width, height, fps } = useVideoConfig();
  const [map, setMap] = useState<Map | null>(null);
  const [loadingHandle] = useState(() => delayRender("Loading map"));

  useEffect(() => {
    if (!containerRef.current) return;
    maplibregl.setWorkerUrl(
      URL.createObjectURL(
        new Blob(
          [
            `import "https://unpkg.com/maplibre-gl@${maplibregl.getVersion()}/dist/maplibre-gl-worker.mjs";`,
          ],
          { type: "text/javascript" },
        ),
      ),
    );

    const m = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [137.6, 35.2],
      zoom: 6,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });

    m.on("load", () => {
      m.addSource("trace", { type: "geojson", data: partialRoute(0) });
      m.addLayer({
        id: "trace-line",
        type: "line",
        source: "trace",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#e63946", "line-width": 12 },
      });
      m.addSource("markers", { type: "geojson", data: markers(true) });
      m.addLayer({
        id: "marker-dots",
        type: "circle",
        source: "markers",
        paint: {
          "circle-color": "#e63946",
          "circle-radius": 22,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 7,
        },
      });
      m.addLayer({
        id: "marker-labels",
        type: "symbol",
        source: "markers",
        layout: {
          "text-allow-overlap": true,
          "text-font": ["Noto Sans Bold"],
          "text-anchor": "top",
          "text-field": ["get", "name"],
          "text-offset": [0, 1.2],
          "text-size": 60,
        },
        paint: {
          "text-color": "#111111",
          "text-halo-color": "#ffffff",
          "text-halo-width": 5,
        },
      });

      const cam = m.cameraForBounds(
        [
          [osaka[0] - 0.6, osaka[1] - 1.6],
          [tokyo[0] + 0.6, tokyo[1] + 1.6],
        ],
        { padding: 60 },
      );
      if (cam) m.jumpTo(cam);
      m.once("idle", () => {
        setMap(m);
        continueRender(loadingHandle);
      });
    });
  }, [continueRender, loadingHandle]);

  useEffect(() => {
    if (!map) return;
    const handle = delayRender("Rendering map frame");
    const progress = interpolate(frame, [1 * fps, 8 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.645, 0.045, 0.355, 1),
    });
    (map.getSource("trace") as GeoJSONSource | undefined)?.setData(
      partialRoute(progress),
    );
    map.once("idle", () => continueRender(handle));
    map.triggerRepaint();
  }, [continueRender, delayRender, fps, frame, map]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#e8eef3" }}>
      <div ref={containerRef} style={{ width, height, position: "absolute" }} />
      <div
        style={{
          position: "absolute",
          top: 120,
          width: "100%",
          textAlign: "center",
          fontFamily: "sans-serif",
          fontWeight: 800,
          fontSize: 90,
          color: "#111",
          textShadow: "0 0 12px #fff, 0 0 12px #fff",
        }}
      >
        Tokyo → Osaka
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          fontFamily: "sans-serif",
          fontSize: 22,
          color: "#333",
          background: "rgba(255,255,255,0.8)",
          padding: "4px 10px",
          borderRadius: 6,
        }}
      >
        © OpenFreeMap © OpenMapTiles © OpenStreetMap contributors
      </div>
    </AbsoluteFill>
  );
};
