export type FirestoreDate = unknown;

export type Trip = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  meetingTime?: string;
  accommodation: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
  };
  coverImageUrl?: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
};
