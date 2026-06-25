"use client";

import type { Participant } from "@/types/participant";

export function ParticipantList({ participants }: { participants: Participant[] }) {
  return (
    <section className="card card-pad">
      <h2 className="section-title">참여자</h2>
      <ul className="list">
        {participants.map((participant) => (
          <li className="list-item" key={participant.id}>
            <strong>
              {participant.name} · {participant.role}
            </strong>
            <span className="muted">{participant.startLocation?.name ?? "출발지 미입력"}</span>
            {participant.departureTime && <span className="muted">출발 {participant.departureTime}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
