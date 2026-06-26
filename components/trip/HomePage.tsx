"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import type { Trip } from "@/types/trip";
import type { AppUser } from "@/types/user";
import { TripCard } from "./TripCard";

export function HomePage({ user, onLogout }: { user: AppUser; onLogout: () => void }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await api<{ trips: Trip[] }>("/api/trips");
    setTrips(data.trips);
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, []);

  async function createTrip() {
    setError("");
    try {
      const data = await api<{ trip: Trip }>("/api/trips", {
        method: "POST",
        body: JSON.stringify({
          title,
          startDate,
          accommodation: {
            name: "숙소 미정",
            address: "",
            latitude: 37.5665,
            longitude: 126.978
          }
        })
      });
      setTitle("");
      setStartDate("");
      setTrips((items) => [data.trip, ...items]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "여행 생성 실패");
    }
  }

  return (
    <main className="page stack">
      <section className="hero">
        <div>
          <h1>여행 지도 공유</h1>
          <p>숙소, 출발지, 중간 지점, 일정 한 화면.</p>
        </div>
      </section>

      <section className="card card-pad toolbar">
        <p className="muted">{user.username}</p>
        <button className="btn secondary" onClick={onLogout} type="button">
          로그아웃
        </button>
      </section>

      <section className="card card-pad stack">
        <h2 className="section-title">새 여행 만들기</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="tripTitle">여행 이름</label>
            <input id="tripTitle" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="tripStart">시작일</label>
            <input id="tripStart" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
        </div>
        <button className="btn" onClick={createTrip} type="button">
          여행 생성
        </button>
      </section>

      {error && <p className="error">{error}</p>}

      <section>
        <h2 className="section-title">내 여행</h2>
        <div className="grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </main>
  );
}
