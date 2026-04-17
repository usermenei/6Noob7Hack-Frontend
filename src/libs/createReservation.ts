const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export default async function createReservation(
  timeSlotIds: string[],
  token: string
) {
  const res = await fetch(`${BASE}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ timeSlotIds }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Failed to create reservation");
  }

  return json;
}