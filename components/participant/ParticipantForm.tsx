"use client";

import { FormEvent, useState } from "react";
import { updateParticipant } from "@/lib/participants";
import { uploadTripImage } from "@/lib/storage";
import type { Participant } from "@/types/participant";

export function ParticipantForm({
  tripId,
  participant,
  onSaved
}: {
  tripId: string;
  participant: Participant;
  onSaved: () => void;
}) {
  const [address, setAddress] = useState(participant.startLocation?.address ?? "");
  const [placeName, setPlaceName] = useState(participant.startLocation?.name ?? "");
  const [latitude, setLatitude] = useState(String(participant.startLocation?.latitude ?? ""));
  const [longitude, setLongitude] = useState(String(participant.startLocation?.longitude ?? ""));
  const [departureTime, setDepartureTime] = useState(participant.departureTime ?? "");
  const [markerColor, setMarkerColor] = useState(participant.markerColor);
  const [memo, setMemo] = useState(participant.memo ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      let profileImageUrl = participant.profileImageUrl;
      if (image) {
        profileImageUrl = await uploadTripImage(`trips/${tripId}/participants/${participant.id}.jpg`, image);
      }

      await updateParticipant(tripId, participant.id, {
        startLocation: {
          name: placeName,
          address,
          latitude: Number(latitude),
          longitude: Number(longitude)
        },
        departureTime,
        markerColor,
        memo,
        profileImageUrl
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  return (
    <form className="card card-pad stack" onSubmit={onSubmit}>
      <h2 className="section-title">내 정보 수정</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="placeName">출발 장소명</label>
          <input id="placeName" value={placeName} onChange={(event) => setPlaceName(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="departureTime">출발 시간</label>
          <input
            id="departureTime"
            type="time"
            value={departureTime}
            onChange={(event) => setDepartureTime(event.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="address">주소</label>
        <input id="address" value={address} onChange={(event) => setAddress(event.target.value)} />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="latitude">위도</label>
          <input id="latitude" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="longitude">경도</label>
          <input id="longitude" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="markerColor">마커 색상</label>
          <input id="markerColor" type="color" value={markerColor} onChange={(event) => setMarkerColor(event.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="memo">메모</label>
        <textarea id="memo" value={memo} onChange={(event) => setMemo(event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="profile">프로필 이미지</label>
        <input id="profile" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit">
        저장
      </button>
    </form>
  );
}
