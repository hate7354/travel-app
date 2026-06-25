"use client";

import { FormEvent, useState } from "react";
import { searchNaverAddress, type NaverGeocodeResult } from "@/lib/naverGeocode";

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

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;

    setPending(true);
    setError("");
    try {
      const nextResults = await searchNaverAddress(query.trim());
      setResults(nextResults);
      if (nextResults.length === 0) setError("검색 결과가 없습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "주소 검색 실패");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="stack">
      <form className="toolbar" onSubmit={submit}>
        <div className="field grow">
          <label htmlFor={`${label}-search`}>{label} 검색</label>
          <input
            id={`${label}-search`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="장소명 또는 주소"
          />
        </div>
        <button className="btn secondary" disabled={pending} type="submit">
          {pending ? "검색 중" : "검색"}
        </button>
      </form>
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
