import type { MapSettings } from "@/types/map";
import type { Participant } from "@/types/participant";
import type { Trip } from "@/types/trip";
import type { TripTodo } from "@/types/todo";

export const sampleTrip: Trip = {
  id: "gangneung-2026-07",
  slug: "gangneung-2026-07",
  title: "강릉 여름 여행",
  description: "친구들과 숙소, 출발지, 일정 확인용 샘플 여행",
  startDate: "2026-07-18",
  endDate: "2026-07-20",
  meetingTime: "15:00",
  accommodation: {
    name: "강릉 바다 숙소",
    address: "강원 강릉시 창해로",
    latitude: 37.7956,
    longitude: 128.9181,
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
  },
  coverImageUrl:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  createdAt: null,
  updatedAt: null
};

export const sampleParticipants: Participant[] = [
  {
    id: "sample-owner",
    tripId: sampleTrip.id,
    name: "민준",
    nameKey: "민준",
    pinHash: "",
    pinSalt: "",
    startLocation: {
      name: "서울역",
      address: "서울 중구 한강대로 405",
      latitude: 37.5547,
      longitude: 126.9706
    },
    departureTime: "10:00",
    markerLabel: "민",
    markerColor: "#136f63",
    role: "admin",
    createdAt: null,
    updatedAt: null
  },
  {
    id: "sample-member",
    tripId: sampleTrip.id,
    name: "서연",
    nameKey: "서연",
    pinHash: "",
    pinSalt: "",
    startLocation: {
      name: "수원역",
      address: "경기 수원시 팔달구 덕영대로 924",
      latitude: 37.2658,
      longitude: 126.9997
    },
    departureTime: "10:30",
    markerLabel: "서",
    markerColor: "#d88c3d",
    role: "member",
    createdAt: null,
    updatedAt: null
  }
];

export const sampleTodos: TripTodo[] = [
  {
    id: "todo-1",
    tripId: sampleTrip.id,
    title: "숙소 체크인",
    time: "15:00",
    location: {
      name: sampleTrip.accommodation.name,
      address: sampleTrip.accommodation.address,
      latitude: sampleTrip.accommodation.latitude,
      longitude: sampleTrip.accommodation.longitude
    },
    sortOrder: 1,
    createdAt: null,
    updatedAt: null
  },
  {
    id: "todo-2",
    tripId: sampleTrip.id,
    title: "저녁 장보기",
    time: "17:00",
    memo: "고기, 물, 간식",
    sortOrder: 2,
    createdAt: null,
    updatedAt: null
  }
];

export const defaultMapSettings: MapSettings = {
  defaultZoom: 8,
  showPolyline: true,
  showCenterPoint: true,
  showTodoMarkers: true,
  accommodationMarkerColor: "#136f63",
  participantMarkerColor: "#d88c3d",
  centerMarkerColor: "#475467",
  todoMarkerColor: "#b42318"
};
