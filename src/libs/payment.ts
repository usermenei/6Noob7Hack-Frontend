// libs/payment.ts

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

// 1. ฟังก์ชันสร้าง Payment (เพิ่มพารามิเตอร์ amount เข้ามา)
export async function createPayment(
  reservationId: string,
  method: string,
  amount: number,
  token: string,
) {
  const res = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      reservationId, 
      method, 
      amount: Number(amount) // บังคับส่งเป็น Number ตรงนี้อีกครั้ง
    }),
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Payment creation failed");
  return json.data;
}

// 2. ฟังก์ชันขอรูป QR Code (อัปเดตเป็น GET และใช้ /qr-code)
export async function generateQrCode(paymentId: string, token: string) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/qr-code`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to generate QR");
  return json.data;
}

// 3. ฟังก์ชันจำลอง/ยืนยันการจ่ายเงินสำเร็จผ่าน QR (อัปเดตเป็น PUT และใช้ /confirm-qr)
export async function confirmQrPayment(paymentId: string, token: string) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/confirm-qr`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "QR Confirmation failed");
  return json.data;
}

export async function getQrCodeForPayment(paymentId: string, token: string) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/qr-code`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch QR Code for this payment");
  
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

// 6. ฟังก์ชันยกเลิกการจ่ายเงิน (ให้หน้า History ของเพื่อนคุณเอาไปใช้)
export async function cancelPayment(paymentId: string, token: string) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/cancel`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to cancel payment");
  return json.data;
}