import type { Participant } from "@/types/participant";

export function calculateCenterPoint(participants: Participant[]) {
  const validParticipants = participants.filter(
    (participant) =>
      participant.startLocation &&
      typeof participant.startLocation.latitude === "number" &&
      typeof participant.startLocation.longitude === "number"
  );

  if (validParticipants.length === 0) return null;

  const total = validParticipants.reduce(
    (acc, participant) => {
      acc.latitude += participant.startLocation!.latitude;
      acc.longitude += participant.startLocation!.longitude;
      return acc;
    },
    { latitude: 0, longitude: 0 }
  );

  return {
    name: "중간 지점",
    address: "",
    latitude: total.latitude / validParticipants.length,
    longitude: total.longitude / validParticipants.length
  };
}
