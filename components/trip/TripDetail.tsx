"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import type { MapSettings } from "@/types/map";
import type { Participant } from "@/types/participant";
import type { Trip } from "@/types/trip";
import type { TripTodo } from "@/types/todo";
import type { AppUser, TripMember } from "@/types/user";
import { navigateTo } from "../RouterShell";
import { LocationSearch } from "../map/LocationSearch";
import { TripMap } from "../map/TripMap";
import { ParticipantForm } from "../participant/ParticipantForm";
import { ParticipantList } from "../participant/ParticipantList";
import { TodoForm } from "../todo/TodoForm";
import { TodoList } from "../todo/TodoList";

type TripPayload = {
  trip: Trip;
  participants: Participant[];
  todos: TripTodo[];
  settings: MapSettings;
  members: TripMember[];
  currentMember: TripMember;
};

export function TripDetail({ tripId, user }: { tripId: string; user: AppUser }) {
  const [data, setData] = useState<TripPayload | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [accommodationName, setAccommodationName] = useState("");
  const [accommodationAddress, setAccommodationAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const payload = await api<TripPayload>(`/api/trips/${tripId}`);
      setData(payload);
      setEditTitle(payload.trip.title);
      setStartDate(payload.trip.startDate);
      setMeetingTime(payload.trip.meetingTime ?? "");
      setAccommodationName(payload.trip.accommodation.name);
      setAccommodationAddress(payload.trip.accommodation.address);
      setLatitude(String(payload.trip.accommodation.latitude));
      setLongitude(String(payload.trip.accommodation.longitude));
    } catch (err) {
      setError(err instanceof Error ? err.message : "여행 정보를 불러오지 못했습니다.");
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveTrip(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api(`/api/trips/${tripId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle,
          startDate,
          meetingTime,
          accommodation: {
            name: accommodationName,
            address: accommodationAddress,
            latitude: Number(latitude),
            longitude: Number(longitude)
          }
        })
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  async function inviteMember() {
    setError("");
    try {
      await api(`/api/trips/${tripId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail })
      });
      setInviteEmail("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "초대 실패");
    }
  }

  if (error) {
    return (
      <main className="page stack">
        <section className="card card-pad">
          <p className="error">{error}</p>
          <button className="btn secondary" type="button" onClick={() => navigateTo("/")}>
            홈
          </button>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="page">
        <p className="muted">여행 정보를 불러오는 중</p>
      </main>
    );
  }

  const { trip, participants, todos, settings, members } = data;
  const currentParticipant =
    participants.find((participant) => participant.nameKey === user.email) ??
    ({
      id: "me",
      tripId,
      name: user.name,
      nameKey: user.email,
      pinHash: "",
      pinSalt: "",
      markerLabel: user.name.slice(0, 1) || "U",
      markerColor: "#136f63",
      role: data.currentMember.role,
      createdAt: "",
      updatedAt: ""
    } satisfies Participant);
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
        </div>
      </section>

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
        <form className="card card-pad stack" onSubmit={saveTrip}>
          <h2 className="section-title">여행 편집</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="editTitle">여행 이름</label>
              <input id="editTitle" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="editStart">시작일</label>
              <input id="editStart" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="editMeeting">모임 시간</label>
              <input id="editMeeting" type="time" value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="accommodationName">숙소명</label>
              <input
                id="accommodationName"
                value={accommodationName}
                onChange={(event) => setAccommodationName(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="accommodationAddress">숙소 주소</label>
              <input
                id="accommodationAddress"
                value={accommodationAddress}
                onChange={(event) => setAccommodationAddress(event.target.value)}
              />
            </div>
          </div>
          <LocationSearch
            label="숙소"
            onSelect={(location) => {
              setAccommodationName(location.label);
              setAccommodationAddress(location.address);
              setLatitude(String(location.latitude));
              setLongitude(String(location.longitude));
            }}
          />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="tripLat">숙소 위도</label>
              <input id="tripLat" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="tripLng">숙소 경도</label>
              <input id="tripLng" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
            </div>
          </div>
          <button className="btn" type="submit">
            여행 저장
          </button>
        </form>

        <section className="card card-pad stack">
          <h2 className="section-title">구성원 초대</h2>
          <div className="field">
            <label htmlFor="inviteEmail">이메일</label>
            <input
              id="inviteEmail"
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
            />
          </div>
          <button className="btn" type="button" onClick={inviteMember}>
            초대 추가
          </button>
          <ul className="list">
            {members.map((member) => (
              <li className="list-item" key={member.id}>
                <strong>{member.email}</strong>
                <span className="muted">
                  {member.role} / {member.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="split">
        <div className="stack">
          <TodoList todos={todos} />
          <TodoForm tripId={tripId} todosCount={todos.length} onSaved={load} />
        </div>
        <ParticipantForm tripId={tripId} participant={currentParticipant} onSaved={load} />
      </section>
    </main>
  );
}
