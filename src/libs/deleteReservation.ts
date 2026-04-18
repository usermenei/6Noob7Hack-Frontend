const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

export default async function deleteReservation(
  id: string,
  token: string
) {
  const res = await fetch(`${BASE}/reservations/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // ✅ SAFELY HANDLE NON-JSON RESPONSE
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("❌ Not JSON response:", text);
    throw new Error("Server returned invalid response (HTML?)");
  }

  if (!res.ok) {
    throw new Error(data.message || "Delete failed");
  }

  return data;
}