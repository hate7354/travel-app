"use client";

import { createMapMarkers } from "@/lib/markers";
import type { MapSettings } from "@/types/map";
import type { Participant } from "@/types/participant";
import type { Trip } from "@/types/trip";
import type { TripTodo } from "@/types/todo";
import { NaverMap } from "./NaverMap";

export function TripMap({
  trip,
  participants,
  todos,
  settings
}: {
  trip: Trip;
  participants: Participant[];
  todos: TripTodo[];
  settings: MapSettings;
}) {
  const markers = createMapMarkers(trip, participants, todos, settings);
  const polylines = settings.showPolyline
    ? participants
        .filter((participant) => participant.startLocation)
        .map((participant) => [
          {
            latitude: participant.startLocation!.latitude,
            longitude: participant.startLocation!.longitude
          },
          {
            latitude: trip.accommodation.latitude,
            longitude: trip.accommodation.longitude
          }
        ])
    : [];

  return (
    <NaverMap
      center={{
        latitude: trip.accommodation.latitude,
        longitude: trip.accommodation.longitude
      }}
      markers={markers}
      polylines={polylines}
      zoom={settings.defaultZoom}
    />
  );
}
