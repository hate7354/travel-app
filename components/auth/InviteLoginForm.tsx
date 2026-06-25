"use client";

import { FormEvent, useEffect, useState } from "react";
import { saveTripSession } from "@/lib/session";
import { joinTripWithNameAndPin } from "@/lib/tripAuth";
import { getTripById } from "@/lib/trips";
import type { Trip } from "@/types/trip";
import { navigateTo } from "../RouterShell";

export function InviteLoginForm({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getTripById(tripId).then(setTrip).catch((err: Error) => setError(err.message));
  }, [tripId]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const session = await joinTripWithNameAndPin(tripId, name, pin);
      saveTripSession(session);
      navigateTo(`/trips/${tripId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "입장 실패");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="page">
      <section className="split">
        <div className="hero">
          <div>
            <h1>{trip?.title ?? "여행 초대"}</h1>
            <p>{trip ? `${trip.startDate} ${trip.meetingTime ?? ""}` : "여행 정보를 불러오는 중"}</p>
          </div>
        </div>
        <form className="card card-pad stack" onSubmit={onSubmit}>
          <div>
            <h2 className="section-title">초대 링크 입장</h2>
            <p className="muted">여행에 참여할 이름과 다시 접속할 때 쓸 4자리 비밀번호 입력.</p>
          </div>
          <div className="field">
            <label htmlFor="name">이름</label>
            <input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름"
            />
          </div>
          <div className="field">
            <label htmlFor="pin">4자리 비밀번호</label>
            <input
              id="pin"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
              placeholder="0000"
              type="password"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={pending} type="submit">
            {pending ? "확인 중" : "입장"}
          </button>
        </form>
      </section>
    </main>
  );
}
