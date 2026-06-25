"use client";

export function LoadingView({ label = "불러오는 중" }: { label?: string }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-box">
        <span className="spinner" aria-hidden />
        <span>{label}</span>
      </div>
    </div>
  );
}
