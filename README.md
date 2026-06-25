# Travel Map Share MVP

친구 여행용 지도 공유 웹앱 MVP. v0/Vercel 배포와 MongoDB Atlas 연결을 기준으로 한다.

## 기능

- 첫 화면 로그인
- 로그인 후 내 여행 목록
- 여행 생성/편집
- 초대된 이메일 구성원만 여행 접근
- 서버 API Routes에서 권한 검사
- MongoDB Atlas 데이터 저장
- NAVER Maps JavaScript API 지도
- 숙소/출발지/중간 지점/일정 마커
- 출발지-숙소 직선 Polyline

## 환경변수

`.env.example`을 참고해 Vercel 환경변수와 로컬 `.env.local`에 설정한다.

```env
MONGODB_URI=
MONGODB_DB=travel_app
AUTH_SECRET=
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
```

MongoDB URI, AUTH_SECRET, NAVER Client Secret은 프론트엔드에 넣지 않는다.

`MONGODB_URI`가 없으면 개발 편의를 위해 서버 메모리 저장소로 동작한다. Vercel 서버리스에서는 영속 저장이 아니므로 실제 운영은 MongoDB Atlas가 필요하다.

## 실행

```bash
npm install
npm run dev
```

## 배포

v0 또는 Vercel에서 이 Next.js 프로젝트를 배포한다.

필수 Vercel env:

- `MONGODB_URI`
- `MONGODB_DB`
- `AUTH_SECRET`
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`

## 보안 메모

여행 접근 권한은 API 서버에서 로그인 세션과 멤버 이메일로 검사한다.
