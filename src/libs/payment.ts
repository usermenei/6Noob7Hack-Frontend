// libs/paymentApi.ts

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

// 1. ฟังก์ชันสร้าง Payment
export async function createPayment(
  reservationId: string,
  method: string,
  token: string,
) {
  const res = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reservationId, method }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Payment creation failed");
  return json.data;
}

// 2. ฟังก์ชันขอรูป QR Code
export async function generateQrCode(paymentId: string, token: string) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/qr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to generate QR");
  return json.data;
}
    
// 3. ฟังก์ชันจำลองการจ่ายเงินสำเร็จ (สำหรับเทส)
export async function simulateConfirmPayment(paymentId: string, token: string) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/confirm`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Simulation failed");
  return json.data;
}

// 4. ฟังก์ชันดึงประวัติการจ่ายเงินของผู้ใช้
export async function getPaymentsByUser(userId: string, token: string) {
  const res = await fetch(`${BASE_URL}/payments/user/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch payment history");
  return json.data;
}

// 5. ฟังก์ชันเปลี่ยนวิธีการจ่ายเงิน (เฉพาะตอน pending)
export async function updatePaymentMethod(
  paymentId: string,
  method: string,
  token: string,
) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/method`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ method }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update payment method");
  return json.data;
}
