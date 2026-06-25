"use client";

import { navigateTo } from "../RouterShell";
import type { Trip } from "@/types/trip";

export function TripCard({ trip }: { trip: Trip }) {
  return (
    <article className="card">
      {trip.coverImageUrl && <div aria-hidden className="cover" style={{ backgroundImage: `url(${trip.coverImageUrl})` }} />}
      <div className="card-pad stack">
        <div>
          <h3 className="section-title">{trip.title}</h3>
          <p className="muted">
            {trip.startDate}
            {trip.endDate ? ` - ${trip.endDate}` : ""}
          </p>
        </div>
        <div className="toolbar">
          <button className="btn" onClick={() => navigateTo(`/trips/${trip.id}`)} type="button">
            상세
          </button>
          <button className="btn secondary" onClick={() => navigateTo(`/invite/${trip.id}`)} type="button">
            초대 입장
          </button>
        </div>
      </div>
    </article>
  );
}
