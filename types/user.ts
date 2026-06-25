export type AppUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TripMember = {
  id: string;
  tripId: string;
  userId?: string;
  email: string;
  role: "owner" | "member";
  status: "active" | "invited";
  createdAt: string;
  updatedAt: string;
};
