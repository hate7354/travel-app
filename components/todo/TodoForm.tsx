"use client";

import { FormEvent, useState } from "react";
import { createTodo } from "@/lib/todos";
import { uploadTripImage } from "@/lib/storage";

export function TodoForm({
  tripId,
  todosCount,
  onSaved
}: {
  tripId: string;
  todosCount: number;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [memo, setMemo] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      let imageUrl: string | undefined;
      if (image) {
        imageUrl = await uploadTripImage(`trips/${tripId}/todos/${Date.now()}.jpg`, image);
      }

      await createTodo(tripId, {
        tripId,
        title,
        time,
        location:
          latitude && longitude
            ? {
                name: placeName,
                address,
                latitude: Number(latitude),
                longitude: Number(longitude)
              }
            : undefined,
        memo,
        imageUrl,
        sortOrder: todosCount + 1
      });

      setTitle("");
      setTime("");
      setPlaceName("");
      setAddress("");
      setLatitude("");
      setLongitude("");
      setMemo("");
      setImage(null);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "일정 저장 실패");
    }
  }

  return (
    <form className="card card-pad stack" onSubmit={onSubmit}>
      <h2 className="section-title">owner 일정 추가</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="todoTitle">제목</label>
          <input id="todoTitle" required value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="todoTime">시간</label>
          <input id="todoTime" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="todoPlace">장소명</label>
          <input id="todoPlace" value={placeName} onChange={(event) => setPlaceName(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="todoAddress">주소</label>
          <input id="todoAddress" value={address} onChange={(event) => setAddress(event.target.value)} />
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="todoLatitude">위도</label>
          <input id="todoLatitude" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="todoLongitude">경도</label>
          <input id="todoLongitude" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="todoMemo">메모</label>
        <textarea id="todoMemo" value={memo} onChange={(event) => setMemo(event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="todoImage">이미지</label>
        <input id="todoImage" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit">
        일정 추가
      </button>
    </form>
  );
}
