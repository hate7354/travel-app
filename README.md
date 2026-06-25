# Travel Map Share MVP

친구 여행용 지도 공유 웹앱 MVP.

## 기능

- 초대 링크 `/invite/{tripId}`
- 이름 + 4자리 PIN 입장
- PIN 원문 저장 금지, Web Crypto SHA-256 해시 저장
- Firebase Firestore 데이터 저장
- Firebase Storage 이미지 업로드 구조
- NAVER Maps JavaScript API 지도
- 숙소/출발지/중간 지점/일정 마커
- 출발지-숙소 직선 Polyline
- GitHub Pages 정적 배포

## 환경변수

`.env.example`을 참고해 GitHub Secrets와 로컬 `.env.local`에 설정한다.

```env
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

NAVER Client Secret, Firebase Admin Key, GitHub PAT는 프론트엔드에 넣지 않는다.

## 실행

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치 push 시 `.github/workflows/deploy.yml`이 GitHub Pages로 배포한다.

GitHub repository Settings에서 Pages source를 GitHub Actions로 설정한다.

## 보안 메모

현재 Firestore/Storage rules는 MVP 개발용이다. 실제 공유 전 owner/member 검증을 강화해야 한다.
