"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getTrips } from "@/lib/trips";
import type { Trip } from "@/types/trip";
import { TripCard } from "./TripCard";

export function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getTrips().then(setTrips).catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="page stack">
      <section className="hero">
        <div>
          <h1>여행 지도 공유</h1>
          <p>숙소, 출발지, 중간 지점, 일정 한 화면.</p>
        </div>
      </section>
      {!isFirebaseConfigured() && (
        <section className="card card-pad">
          <strong>환경변수 필요</strong>
          <p className="muted">Firebase와 NAVER 지도 키가 없으면 샘플 데이터와 지도 대체 화면으로 동작한다.</p>
        </section>
      )}
      {error && <p className="error">{error}</p>}
      <section>
        <h2 className="section-title">여행 목록</h2>
        <div className="grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </main>
  );
}
