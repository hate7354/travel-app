"use client";

import { useCallback, useEffect, useState } from "react";
import { clearTripSession, getTripSession } from "@/lib/session";
import { getMapSettings } from "@/lib/mapSettings";
import { getParticipants } from "@/lib/participants";
import { getTodos } from "@/lib/todos";
import { getTripById } from "@/lib/trips";
import type { TripSession } from "@/types/auth";
import type { MapSettings } from "@/types/map";
import type { Participant } from "@/types/participant";
import type { Trip } from "@/types/trip";
import type { TripTodo } from "@/types/todo";
import { navigateTo } from "../RouterShell";
import { TripMap } from "../map/TripMap";
import { ParticipantForm } from "../participant/ParticipantForm";
import { ParticipantList } from "../participant/ParticipantList";
import { TodoForm } from "../todo/TodoForm";
import { TodoList } from "../todo/TodoList";

export function TripDetail({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [todos, setTodos] = useState<TripTodo[]>([]);
  const [settings, setSettings] = useState<MapSettings | null>(null);
  const [session, setSession] = useState<TripSession | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [nextTrip, nextParticipants, nextTodos, nextSettings] = await Promise.all([
        getTripById(tripId),
        getParticipants(tripId),
        getTodos(tripId),
        getMapSettings(tripId)
      ]);
      setTrip(nextTrip);
      setParticipants(nextParticipants);
      setTodos(nextTodos);
      setSettings(nextSettings);
      setSession(getTripSession(tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "여행 정보를 불러오지 못했습니다.");
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <main className="page">
        <p className="error">{error}</p>
      </main>
    );
  }

  if (!trip || !settings) {
    return (
      <main className="page">
        <p className="muted">여행 정보를 불러오는 중</p>
      </main>
    );
  }

  const currentParticipant = session
    ? participants.find((participant) => participant.id === session.participantId)
    : null;
  const invitePath = `/invite/${tripId}`;

  return (
    <main className="page stack">
      <section className="card card-pad stack">
        <div className="toolbar">
          <div>
            <h1 className="section-title">{trip.title}</h1>
            <p className="muted">
              {trip.startDate}
              {trip.endDate ? ` - ${trip.endDate}` : ""} / 모임 {trip.meetingTime ?? "미정"}
            </p>
          </div>
          <button
            className="btn secondary"
            onClick={() => navigator.clipboard.writeText(`${location.origin}${invitePath}`)}
            type="button"
          >
            초대 링크 복사
          </button>
          {session && (
            <button
              className="btn secondary"
              onClick={() => {
                clearTripSession(tripId);
                setSession(null);
              }}
              type="button"
            >
              세션 해제
            </button>
          )}
        </div>
      </section>

      {!session && (
        <section className="card card-pad toolbar">
          <p className="muted">내 정보 수정은 초대 링크 입장 후 가능.</p>
          <button className="btn" onClick={() => navigateTo(invitePath)} type="button">
            입장하기
          </button>
        </section>
      )}

      <section className="split">
        <TripMap trip={trip} participants={participants} todos={todos} settings={settings} />
        <div className="stack">
          <section className="card card-pad">
            <h2 className="section-title">숙소</h2>
            <p>{trip.accommodation.name}</p>
            <p className="muted">{trip.accommodation.address}</p>
          </section>
          <ParticipantList participants={participants} />
        </div>
      </section>

      <section className="split">
        <div className="stack">
          <TodoList todos={todos} />
          {session?.role === "owner" && <TodoForm tripId={tripId} todosCount={todos.length} onSaved={load} />}
        </div>
        {session && currentParticipant && (
          <ParticipantForm tripId={tripId} participant={currentParticipant} onSaved={load} />
        )}
      </section>
    </main>
  );
}
