"use client";

import { loadNaverMapScript } from "./naverMapLoader";

export type NaverGeocodeResult = {
  label: string;
  address: string;
  latitude?: number;
  longitude?: number;
  category?: string;
};

type GeocodeAddress = {
  roadAddress?: string;
  jibunAddress?: string;
  englishAddress?: string;
  x: string;
  y: string;
};

type GeocodeResponse = {
  v2?: {
    addresses?: GeocodeAddress[];
  };
};

export async function searchNaverAddress(query: string): Promise<NaverGeocodeResult[]> {
  const naverApi = await loadNaverMapScript();
  const service = (naverApi.maps as unknown as {
    Service?: {
      geocode: (
        options: { query: string },
        callback: (status: string, response: GeocodeResponse) => void
      ) => void;
      Status?: { OK?: string };
    };
  }).Service;

  if (!service?.geocode) {
    throw new Error("네이버 주소 검색 모듈을 불러오지 못했습니다.");
  }

  return new Promise((resolve, reject) => {
    service.geocode({ query }, (status, response) => {
      if (service.Status?.OK && status !== service.Status.OK) {
        reject(new Error("주소 검색 실패"));
        return;
      }

      const addresses = response.v2?.addresses ?? [];
      resolve(
        addresses.slice(0, 5).map((item) => ({
          label: item.roadAddress || item.jibunAddress || item.englishAddress || query,
          address: item.roadAddress || item.jibunAddress || query,
          latitude: Number(item.y),
          longitude: Number(item.x)
        }))
      );
    });
  });
}

export async function searchNaverPlaces(query: string): Promise<NaverGeocodeResult[]> {
  const response = await fetch(`/api/places/search?query=${encodeURIComponent(query)}`, {
    credentials: "include"
  });

  if (!response.ok) {
    return searchNaverAddress(query);
  }

  const data = (await response.json()) as { results?: NaverGeocodeResult[] };
  if (data.results?.length) return data.results;

  return searchNaverAddress(query);
}

export async function resolveNaverPlace(result: NaverGeocodeResult): Promise<NaverGeocodeResult> {
  if (typeof result.latitude === "number" && typeof result.longitude === "number") return result;

  const candidates = await searchNaverAddress(result.address || result.label);
  const first = candidates[0];
  if (!first) throw new Error("선택한 장소의 좌표를 찾지 못했습니다.");

  return {
    ...result,
    address: result.address || first.address,
    latitude: first.latitude,
    longitude: first.longitude
  };
}
