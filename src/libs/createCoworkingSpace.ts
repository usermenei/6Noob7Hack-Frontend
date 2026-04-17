const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export default async function createCoworkingSpace(token: string, spaceData: any) {
    const response = await fetch(`${BASE}/coworkingspaces`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`, // ส่ง Token ของ Admin ไปยืนยันตัวตน
        },
        body: JSON.stringify(spaceData),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message ?? "Failed to create coworking space");
    }

    return await response.json();
}