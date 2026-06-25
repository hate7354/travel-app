import { calculateCenterPoint } from "./calculateCenterPoint";
import type { MapMarker, MapSettings } from "@/types/map";
import type { Participant } from "@/types/participant";
import type { Trip } from "@/types/trip";
import type { TripTodo } from "@/types/todo";

export function createMapMarkers(
  trip: Trip,
  participants: Participant[],
  todos: TripTodo[],
  mapSettings: MapSettings
): MapMarker[] {
  const markers: MapMarker[] = [
    {
      id: `${trip.id}:accommodation`,
      type: "accommodation",
      label: "숙소",
      latitude: trip.accommodation.latitude,
      longitude: trip.accommodation.longitude,
      color: mapSettings.accommodationMarkerColor,
      description: trip.accommodation.name
    }
  ];

  participants.forEach((participant) => {
    if (!participant.startLocation) return;
    markers.push({
      id: participant.id,
      type: "participant",
      label: participant.markerLabel || participant.name.slice(0, 1),
      latitude: participant.startLocation.latitude,
      longitude: participant.startLocation.longitude,
      color: participant.markerColor || mapSettings.participantMarkerColor,
      description: `${participant.name} 출발지`
    });
  });

  const centerPoint = calculateCenterPoint(participants);
  if (mapSettings.showCenterPoint && centerPoint) {
    markers.push({
      id: `${trip.id}:center`,
      type: "center",
      label: "중",
      latitude: centerPoint.latitude,
      longitude: centerPoint.longitude,
      color: mapSettings.centerMarkerColor,
      description: "참여자 출발 위치 평균"
    });
  }

  if (mapSettings.showTodoMarkers) {
    todos.forEach((todo) => {
      if (!todo.location?.latitude || !todo.location.longitude) return;
      markers.push({
        id: todo.id,
        type: "todo",
        label: "일",
        latitude: todo.location.latitude,
        longitude: todo.location.longitude,
        color: mapSettings.todoMarkerColor,
        description: todo.title
      });
    });
  }

  return markers;
}
