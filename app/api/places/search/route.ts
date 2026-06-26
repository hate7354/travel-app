import { NextResponse, type NextRequest } from "next/server";

type LocalSearchItem = {
  title?: string;
  category?: string;
  address?: string;
  roadAddress?: string;
  jibunAddress?: string;
  englishAddress?: string;
  mapx?: string;
  mapy?: string;
  x?: string;
  y?: string;
};

type PlaceSearchResult = {
  label: string;
  address: string;
  latitude?: number;
  longitude?: number;
  category: string;
};

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, "");
}

function uniqueResults(results: PlaceSearchResult[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = [result.label, result.address, result.latitude?.toFixed(6) ?? "", result.longitude?.toFixed(6) ?? ""].join(
      ":"
    );

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) return [];

  const response = await fetch(
    `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=10&sort=random`,
    {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret
      },
      cache: "no-store"
    }
  );

  if (!response.ok) return [];

  const data = (await response.json()) as { items?: LocalSearchItem[] };
  return (data.items ?? [])
    .flatMap((item) => {
      const label = stripHtml(item.title || item.roadAddress || item.address || "");
      const address = item.roadAddress || item.address || "";
      if (!label || !address) return [];

      return [{
        label,
        address,
        category: stripHtml(item.category || "장소")
      }];
    });
}

async function searchAddresses(query: string): Promise<PlaceSearchResult[]> {
  const clientId = process.env.NAVER_MAP_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

  if (!clientId || !clientSecret) return [];

  const response = await fetch(
    `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`,
    {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret
      },
      cache: "no-store"
    }
  );

  if (!response.ok) return [];

  const data = (await response.json()) as { addresses?: LocalSearchItem[] };
  return (data.addresses ?? [])
    .flatMap((item) => {
      const latitude = Number(item.y);
      const longitude = Number(item.x);
      const address = item.roadAddress || item.jibunAddress || item.englishAddress || "";
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !address) return [];

      return [{
        label: stripHtml(address),
        address,
        latitude,
        longitude,
        category: item.roadAddress ? "도로명 주소" : "지번 주소"
      }];
    });
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();
  const hasMapCredentials =
    Boolean(process.env.NAVER_MAP_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID) &&
    Boolean(process.env.NAVER_MAP_CLIENT_SECRET);
  const hasSearchCredentials = Boolean(process.env.NAVER_SEARCH_CLIENT_ID && process.env.NAVER_SEARCH_CLIENT_SECRET);

  if (!query) return NextResponse.json({ results: [] });
  if (!hasMapCredentials && !hasSearchCredentials) {
    return NextResponse.json({ error: "네이버 지도 API 환경변수가 필요합니다." }, { status: 501 });
  }

  const [placeResults, addressResults] = await Promise.all([searchPlaces(query), searchAddresses(query)]);
  const results = uniqueResults([...placeResults, ...addressResults]);

  return NextResponse.json({ results });
}
