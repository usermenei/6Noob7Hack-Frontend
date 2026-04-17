const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export interface CoworkingSpaceDetail {
  _id: string;
  id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel: string;
  region: string;
  openTime: string;
  closeTime: string;
  // Will be populated once added to DB
  picture?: string;
  caption?: string;
}

export interface CoworkingSpaceDetailJson {
  success: boolean;
  data: CoworkingSpaceDetail;
}

export default async function getCoworkingSpace(id: string): Promise<CoworkingSpaceDetailJson> {
  // ✅ แก้ตรงนี้: เปลี่ยนจาก /coworkingspace/ เป็น /coworkingspaces/
  const response = await fetch(`${BASE}/coworkingspaces/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    // แอบใส่ log ไว้ดูเล่นเผื่อพังอีก
    const errorBody = await response.text();
    console.error("Error from Backend:", response.status, errorBody);
    throw new Error("Failed to fetch coworking space");
  }

  return await response.json();
}