const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export default async function deleteReservation(
  reservationId: string,
  token: string
): Promise<void> {
  const response = await fetch(`${BASE}/reservations/${reservationId}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to delete reservation");
  }
}
