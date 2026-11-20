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

// [longitude, latitude]
const tokyo: [number, number] = [139.6917, 35.6895];
const osaka: [number, number] = [135.5023, 34.6937];

// Gentle arc between the cities for a nicer route shape
const route = turf.bezierSpline(
  turf.lineString([tokyo, [137.6, 35.55], osaka]),
  { resolution: 10000 },
);
const routeLength = turf.length(route);

const partialRoute = (progress: number) =>
  turf.lineSliceAlong(
    route,
    0,
    Math.max(0.001, routeLength * Math.min(1, Math.max(0, progress))),
  );

const citiesWithVisibility = (osakaVisible: boolean) =>
  turf.featureCollection([
    turf.point(tokyo, { name: "Tokyo" }),
    ...(osakaVisible ? [turf.point(osaka, { name: "Osaka" })] : []),
  ]);

const CENTER: [number, number] = [137.6, 35.1];
const ZOOM = 6.9;

export const RouteMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const { delayRender, continueRender } = useDelayRender();
  const { durationInFrames, width, height, fps } = useVideoConfig();
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
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: CENTER,
      zoom: ZOOM,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });

    m.on("load", () => {
      m.addSource("trace", { type: "geojson", data: partialRoute(0) });
      m.addLayer({
        id: "trace-casing",
        type: "line",
        source: "trace",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ffffff", "line-width": 16 },
      });
      m.addLayer({
        id: "trace-line",
        type: "line",
        source: "trace",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#e63946", "line-width": 9 },
      });
      m.addSource("cities", {
        type: "geojson",
        data: citiesWithVisibility(false),
      });
      m.addLayer({
        id: "city-dots",
        type: "circle",
        source: "cities",
        paint: {
          "circle-color": "#e63946",
          "circle-radius": 20,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 7,
        },
      });
      m.addLayer({
        id: "city-labels",
        type: "symbol",
        source: "cities",
        layout: {
          "text-allow-overlap": true,
          "text-ignore-placement": true,
          "text-anchor": "bottom",
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Bold"],
          "text-offset": [0, -1.4],
          "text-size": 64,
        },
        paint: {
          "text-color": "#1d1d1f",
          "text-halo-color": "#ffffff",
          "text-halo-width": 4,
        },
      });
      m.jumpTo({ center: CENTER, zoom: ZOOM });
      m.once("idle", () => {
        setMap(m);
        continueRender(loadingHandle);
      });
    });
  }, [continueRender, loadingHandle]);

  const progress = interpolate(
    frame,
    [1 * fps, durationInFrames - 2 * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.645, 0.045, 0.355, 1),
    },
  );

  useEffect(() => {
    if (!map) return;
    const handle = delayRender("Rendering map frame");
    (map.getSource("trace") as GeoJSONSource | undefined)?.setData(
      partialRoute(progress),
    );
    (map.getSource("cities") as GeoJSONSource | undefined)?.setData(
      citiesWithVisibility(progress >= 1),
    );
    map.once("idle", () => continueRender(handle));
    map.triggerRepaint();
  }, [continueRender, delayRender, map, progress]);

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#e8eef3" }}>
      <div ref={containerRef} style={{ width, height, position: "absolute" }} />
      <div
        style={{
          position: "absolute",
          top: 160,
          width: "100%",
          textAlign: "center",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 800,
          fontSize: 96,
          color: "#1d1d1f",
          opacity: titleOpacity,
          textShadow: "0 0 18px #fff, 0 0 8px #fff",
        }}
      >
        Tokyo → Osaka
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 22,
          color: "#333",
          background: "rgba(255,255,255,0.8)",
          padding: "6px 12px",
          borderRadius: 6,
        }}
      >
        OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors
      </div>
    </AbsoluteFill>
  );
};
