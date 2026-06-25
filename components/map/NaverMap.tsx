"use client";

import { useEffect, useRef, useState } from "react";
import { loadNaverMapScript } from "@/lib/naverMapLoader";
import type { MapMarker } from "@/types/map";
import { LoadingView } from "../ui/LoadingView";

type Props = {
  center: { latitude: number; longitude: number };
  markers: MapMarker[];
  polylines: Array<Array<{ latitude: number; longitude: number }>>;
  zoom: number;
};

export function NaverMap({ center, markers, polylines, zoom }: Props) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerRefs = useRef<naver.maps.Marker[]>([]);
  const lineRefs = useRef<naver.maps.Polyline[]>([]);
  const [state, setState] = useState("지도 로딩 중");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const naverApi = await loadNaverMapScript();
        if (!elementRef.current || cancelled) return;

        const map =
          mapRef.current ??
          new naverApi.maps.Map(elementRef.current, {
            center: new naverApi.maps.LatLng(center.latitude, center.longitude),
            zoom
          });
        mapRef.current = map;
        map.setCenter(new naverApi.maps.LatLng(center.latitude, center.longitude));

        markerRefs.current.forEach((marker) => marker.setMap(null));
        lineRefs.current.forEach((line) => line.setMap(null));

        markerRefs.current = markers.map(
          (marker) =>
            new naverApi.maps.Marker({
              position: new naverApi.maps.LatLng(marker.latitude, marker.longitude),
              map,
              title: marker.description,
              icon: {
                content: `<span class="marker-chip" style="background:${marker.color ?? "#136f63"}">${marker.label}</span>`,
                size: new naverApi.maps.Size(34, 34),
                anchor: new naverApi.maps.Point(17, 17)
              }
            })
        );

        lineRefs.current = polylines.map(
          (path) =>
            new naverApi.maps.Polyline({
              map,
              path: path.map((point) => new naverApi.maps.LatLng(point.latitude, point.longitude)),
              strokeColor: "#136f63",
              strokeOpacity: 0.72,
              strokeWeight: 3
            })
        );

        setState("");
      } catch (err) {
        setState(err instanceof Error ? err.message : "지도 로딩 실패");
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [center.latitude, center.longitude, markers, polylines, zoom]);

  return (
    <div className="map-frame">
      <div ref={elementRef} className="map-canvas" />
      {state && (
        <div className="map-state">
          {state.includes("로딩") ? <LoadingView label={state} /> : state}
        </div>
      )}
    </div>
  );
}
