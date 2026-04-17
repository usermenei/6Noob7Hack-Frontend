const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export interface Reservation {
  _id: string;

  user: {
    _id: string;
    name: string;
    email: string;
  };

  room: {
    _id: string;
    name: string;
    capacity: number;
    price: number;
    coworkingSpace: {
      _id: string;
      name: string;
      district: string;
      province: string;
      picture?: string;
    };
  };

  timeSlots: {
    _id: string;
    startTime: string;
    endTime: string;
  }[];

  status: "pending" | "success" | "cancelled";

  createdAt: string;
  updatedAt: string;
}

export interface ReservationJson {
  success: boolean;
  count: number;
  data: Reservation[];
}
export default async function getReservations(token: string) {
  const response = await fetch(`${BASE}/reservations`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const text = await response.text(); // 👈 capture raw response

  if (!response.ok) {
    console.error("❌ API ERROR:", response.status, text);
    throw new Error(`Error ${response.status}`);
  }

  return JSON.parse(text);
}