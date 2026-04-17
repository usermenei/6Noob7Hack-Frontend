const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export interface CoworkingSpaceItem {
  _id: string;
  name: string;
  province: string;
  district: string;
  region: string;
  openTime: string;
  closeTime: string;
  picture?: string;
  caption?: string;
}

export interface CoworkingSpaceJson {
  count: number;
  data: CoworkingSpaceItem[];
}

export default async function getCoworkingSpaces(
  token: string
): Promise<CoworkingSpaceJson> {
  const res = await fetch(`${BASE}/coworkingspaces`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", text);
    throw new Error("Failed to fetch spaces");
  }

  const data = await res.json();

  if (!data || !data.data) {
    throw new Error("Invalid API response");
  }

  return data;
}