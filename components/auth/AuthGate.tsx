"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import type { AppUser } from "@/types/user";

export function AuthGate({ children }: { children: (user: AppUser, onLogout: () => void) => React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ user: AppUser | null }>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const data = await api<{ user: AppUser }>(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  if (loading) {
    return (
      <main className="page">
        <p className="muted">로그인 상태 확인 중</p>
      </main>
    );
  }

  if (user) return <>{children(user, logout)}</>;

  return (
    <main className="page">
      <section className="split">
        <div className="hero">
          <div>
            <h1>Travel Map</h1>
            <p>초대된 구성원만 여행을 보고 편집.</p>
          </div>
        </div>
        <form className="card card-pad stack" onSubmit={submit}>
          <div>
            <h2 className="section-title">{mode === "login" ? "로그인" : "회원가입"}</h2>
            <p className="muted">MongoDB Atlas 키가 없으면 임시 메모리 저장으로 동작.</p>
          </div>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="authName">이름</label>
              <input id="authName" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
          )}
          <div className="field">
            <label htmlFor="authEmail">이메일</label>
            <input
              id="authEmail"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="authPassword">비밀번호</label>
            <input
              id="authPassword"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="toolbar">
            <button className="btn" type="submit">
              {mode === "login" ? "로그인" : "가입"}
            </button>
            <button className="btn secondary" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "회원가입" : "로그인으로"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
