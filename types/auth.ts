import type { ParticipantRole } from "./participant";

export type TripSession = {
  tripId: string;
  participantId: string;
  name: string;
  role: ParticipantRole;
  loggedInAt: string;
};
