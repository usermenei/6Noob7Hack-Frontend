const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export default async function confirmReservation(id: string, token: string) {
  // 💡 หมายเหตุ: ตรวจสอบ URL path ให้ตรงกับที่กำหนดไว้ใน Router ฝั่ง Backend ของคุณ
  // ส่วนใหญ่มักจะเป็น PUT /reservations/:id/confirm หรือคล้ายๆ กัน
    const response = await fetch(`${BASE}/reservations/${id}/confirm`, {
        method: "PUT", // หรือ PATCH ตามที่ Backend ตั้งไว้
        headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message ?? "Failed to approve reservation");
    }

    return await response.json();
}