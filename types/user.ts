export type AppUser = {
  id: string;
  username: string;
  email?: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TripMemberRole = "admin" | "member" | "viewer";

export type TripMember = {
  id: string;
  tripId: string;
  userId?: string;
  username: string;
  email?: string;
  role: TripMemberRole;
  status: "active" | "invited";
  createdAt: string;
  updatedAt: string;
};
