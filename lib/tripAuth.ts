import { createPinSalt, hashPin } from "./hashPin";
import { createParticipant, getParticipantByNameKey, getParticipants, touchParticipantLogin } from "./participants";
import { getTripById } from "./trips";
import type { TripSession } from "@/types/auth";

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function toNameKey(name: string) {
  return normalizeName(name).toLocaleLowerCase("ko-KR");
}

export function validatePin(pin: string) {
  return /^\d{4}$/.test(pin);
}

export async function verifyParticipantPin(tripId: string, nameKey: string, pin: string) {
  const participant = await getParticipantByNameKey(tripId, nameKey);
  if (!participant) return null;

  const pinHash = await hashPin({
    tripId,
    nameKey,
    pin,
    salt: participant.pinSalt
  });

  return pinHash === participant.pinHash ? participant : null;
}

export async function joinTripWithNameAndPin(tripId: string, name: string, pin: string): Promise<TripSession> {
  const normalizedName = normalizeName(name);
  const nameKey = toNameKey(normalizedName);

  if (!normalizedName) throw new Error("이름을 입력해주세요.");
  if (!validatePin(pin)) throw new Error("비밀번호는 숫자 4자리여야 합니다.");

  const trip = await getTripById(tripId);
  if (!trip) throw new Error("여행 정보를 찾을 수 없습니다.");

  const existing = await getParticipantByNameKey(tripId, nameKey);
  if (existing) {
    const verified = await verifyParticipantPin(tripId, nameKey, pin);
    if (!verified) throw new Error("이미 등록된 이름입니다. 비밀번호 4자리를 다시 확인해주세요.");

    await touchParticipantLogin(tripId, verified.id);
    return {
      tripId,
      participantId: verified.id,
      name: verified.name,
      role: verified.role,
      loggedInAt: new Date().toISOString()
    };
  }

  const participants = await getParticipants(tripId);
  const salt = createPinSalt();
  const pinHash = await hashPin({ tripId, nameKey, pin, salt });
  const role = participants.length === 0 ? "owner" : "member";
  const participantId = await createParticipant(tripId, {
    tripId,
    name: normalizedName,
    nameKey,
    pinHash,
    pinSalt: salt,
    markerLabel: normalizedName.slice(0, 1),
    markerColor: role === "owner" ? "#136f63" : "#d88c3d",
    role
  });

  return {
    tripId,
    participantId,
    name: normalizedName,
    role,
    loggedInAt: new Date().toISOString()
  };
}
