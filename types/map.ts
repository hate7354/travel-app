export type MapSettings = {
  defaultZoom: number;
  showPolyline: boolean;
  showCenterPoint: boolean;
  showTodoMarkers: boolean;
  accommodationMarkerColor: string;
  participantMarkerColor: string;
  centerMarkerColor: string;
  todoMarkerColor: string;
};

export type MarkerType = "accommodation" | "participant" | "center" | "todo";

export type MapMarker = {
  id: string;
  type: MarkerType;
  label: string;
  latitude: number;
  longitude: number;
  color?: string;
  icon?: string;
  description?: string;
};
