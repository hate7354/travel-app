import { NextResponse, type NextRequest } from "next/server";

type LocalSearchItem = {
  title?: string;
  roadAddress?: string;
  address?: string;
  mapx?: string;
  mapy?: string;
  category?: string;
};

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, "");
}

function naverMapCoordToDecimal(value?: string) {
  if (!value) return null;
  return Number(value) / 10000000;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

  if (!query) return NextResponse.json({ results: [] });
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "네이버 검색 API 환경변수가 필요합니다." }, { status: 501 });
  }

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

  if (!response.ok) {
    return NextResponse.json({ error: "네이버 장소 검색 실패" }, { status: response.status });
  }

  const data = (await response.json()) as { items?: LocalSearchItem[] };
  const results = (data.items ?? [])
    .map((item) => {
      const latitude = naverMapCoordToDecimal(item.mapy);
      const longitude = naverMapCoordToDecimal(item.mapx);
      if (latitude === null || longitude === null) return null;

      return {
        label: stripHtml(item.title),
        address: item.roadAddress || item.address || "",
        latitude,
        longitude,
        category: item.category
      };
    })
    .filter(Boolean);

  return NextResponse.json({ results });
}
