"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { EonetEvent } from "@/lib/types";
import { CATEGORY_COLOR_MAP, DEFAULT_POINT_COLOR, GLOBE_IMAGE_URL, NIGHT_SKY_URL } from "@/lib/constants";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface GlobeViewProps {
  events: EonetEvent[];
  onEventClick: (event: EonetEvent) => void;
  onEventHover: (event: EonetEvent | null) => void;
}

export default function GlobeView({
  events,
  onEventClick,
  onEventHover,
}: GlobeViewProps) {
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
  }, []);

  const handlePointClick = useCallback(
    (point: any) => {
      onEventClick(point as EonetEvent);
      if (globeRef.current) {
        const coords = point.geometry[0].coordinates;
        globeRef.current.pointOfView(
          { lat: coords[1], lng: coords[0], altitude: 1.5 },
          1000
        );
        const controls = globeRef.current.controls();
        controls.autoRotate = false;
      }
    },
    [onEventClick]
  );

  const handlePointHover = useCallback(
    (point: any) => {
      onEventHover(point ? (point as EonetEvent) : null);
      if (globeRef.current) {
        globeRef.current.renderer().domElement.style.cursor = point
          ? "pointer"
          : "default";
      }
    },
    [onEventHover]
  );

  return (
    <Globe
      ref={globeRef}
      globeImageUrl={GLOBE_IMAGE_URL}
      backgroundImageUrl={NIGHT_SKY_URL}
      backgroundColor="rgba(0,0,0,0)"
      atmosphereColor="#3b82f6"
      atmosphereAltitude={0.15}
      pointsData={events}
      pointLat={(d: any) => d.geometry[0].coordinates[1]}
      pointLng={(d: any) => d.geometry[0].coordinates[0]}
      pointColor={(d: any) =>
        CATEGORY_COLOR_MAP[d.categories[0]?.id] ?? DEFAULT_POINT_COLOR
      }
      pointAltitude={0.01}
      pointRadius={(d: any) =>
        d.magnitudeValue ? Math.min(0.8, 0.2 + d.magnitudeValue * 0.01) : 0.3
      }
      pointLabel={(d: any) => `
        <div style="background:rgba(10,10,15,0.9);padding:8px 12px;border-radius:6px;font-size:12px;border:1px solid rgba(255,255,255,0.1);">
          <strong>${d.title}</strong>
        </div>
      `}
      onPointClick={handlePointClick}
      onPointHover={handlePointHover}
      animateIn={true}
    />
  );
}
