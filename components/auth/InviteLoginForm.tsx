"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { navigateTo } from "../RouterShell";

export function InviteLoginForm({ tripId }: { tripId: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function join() {
    setPending(true);
    setError("");

    try {
      await api(`/api/trips/${tripId}/join`, { method: "POST" });
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
            <h1>여행 초대</h1>
            <p>초대 링크로 보기 권한을 받을 수 있다.</p>
          </div>
        </div>
        <section className="card card-pad stack">
          <div>
            <h2 className="section-title">초대 확인</h2>
            <p className="muted">초대된 아이디면 해당 권한으로, 아니면 보기 전용으로 여행 목록에 추가된다.</p>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={pending} onClick={join} type="button">
            {pending ? "확인 중" : "초대 확인"}
          </button>
        </section>
      </section>
    </main>
  );
}
