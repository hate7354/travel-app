"use client";

import { useEffect, useMemo, useState } from "react";
import { InviteLoginForm } from "./auth/InviteLoginForm";
import { AuthGate } from "./auth/AuthGate";
import { HomePage } from "./trip/HomePage";
import { TripDetail } from "./trip/TripDetail";

type Route =
  | { name: "home" }
  | { name: "invite"; tripId: string }
  | { name: "trip"; tripId: string };

function stripBasePath(pathname: string) {
  return pathname;
}

export function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function RouterShell() {
  const [path, setPath] = useState("/");

  useEffect(() => {
    const sync = () => setPath(stripBasePath(window.location.pathname));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const route = useMemo<Route>(() => {
    const parts = path.split("/").filter(Boolean);
    if (parts[0] === "invite" && parts[1]) return { name: "invite", tripId: parts[1] };
    if (parts[0] === "trips" && parts[1]) return { name: "trip", tripId: parts[1] };
    return { name: "home" };
  }, [path]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigateTo("/")} type="button">
          <span className="brand-mark">T</span>
          <span>Travel Map</span>
        </button>
      </header>
      <AuthGate>
        {(user, onLogout) => (
          <>
            {route.name === "invite" && <InviteLoginForm tripId={route.tripId} />}
            {route.name === "trip" && <TripDetail tripId={route.tripId} user={user} />}
            {route.name === "home" && <HomePage user={user} onLogout={onLogout} />}
          </>
        )}
      </AuthGate>
    </div>
  );
}
