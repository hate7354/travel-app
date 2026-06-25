"use client";

import { KeyboardEvent, useState } from "react";
import { searchNaverPlaces, type NaverGeocodeResult } from "@/lib/naverGeocode";

export function LocationSearch({
  label,
  onSelect
}: {
  label: string;
  onSelect: (result: NaverGeocodeResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NaverGeocodeResult[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!query.trim()) return;

    setPending(true);
    setError("");
    try {
      const nextResults = await searchNaverPlaces(query.trim());
      setResults(nextResults);
      if (nextResults.length === 0) setError("검색 결과가 없습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "주소 검색 실패");
    } finally {
      setPending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    event.stopPropagation();
    submit();
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="field grow">
          <label htmlFor={`${label}-search`}>{label} 검색</label>
          <input
            id={`${label}-search`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="장소명 또는 주소"
          />
        </div>
        <button
          className="btn secondary"
          disabled={pending}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            submit();
          }}
          type="button"
        >
          {pending ? "검색 중" : "검색"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {results.length > 0 && (
        <ul className="list">
          {results.map((result) => (
            <li className="list-item" key={`${result.latitude}:${result.longitude}:${result.address}`}>
              <button
                className="plain-button"
                type="button"
                onClick={() => {
                  onSelect(result);
                  setResults([]);
                  setQuery(result.label);
                }}
              >
                <strong>{result.label}</strong>
                {result.category && <span className="muted">{result.category}</span>}
                {result.address && <span>{result.address}</span>}
                <span className="muted">
                  {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
