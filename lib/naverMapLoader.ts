type NaverWindow = Window & {
  naver?: typeof naver;
};

declare global {
  namespace naver {
    namespace maps {
      class LatLng {
        constructor(lat: number, lng: number);
      }

      class Map {
        constructor(element: HTMLElement, options: Record<string, unknown>);
        setCenter(latlng: LatLng): void;
      }

      class Marker {
        constructor(options: Record<string, unknown>);
        setMap(map: Map | null): void;
      }

      class Polyline {
        constructor(options: Record<string, unknown>);
        setMap(map: Map | null): void;
      }

      class Size {
        constructor(width: number, height: number);
      }

      class Point {
        constructor(x: number, y: number);
      }
    }
  }
}

let loadingPromise: Promise<typeof naver> | null = null;

export function loadNaverMapScript() {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const win = window as NaverWindow;

  if (!clientId) return Promise.reject(new Error("NAVER 지도 Client ID가 없습니다."));
  if (win.naver?.maps) return Promise.resolve(win.naver);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.onload = () => {
      if (win.naver?.maps) resolve(win.naver);
      else reject(new Error("NAVER 지도 SDK 초기화 실패"));
    };
    script.onerror = () => reject(new Error("NAVER 지도 SDK 로딩 실패"));
    document.head.appendChild(script);
  });

  return loadingPromise;
}
