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
            <p>초대된 이메일 계정만 입장 가능.</p>
          </div>
        </div>
        <section className="card card-pad stack">
          <div>
            <h2 className="section-title">초대 확인</h2>
            <p className="muted">로그인 이메일이 멤버 목록에 있으면 여행에 참여된다.</p>
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
