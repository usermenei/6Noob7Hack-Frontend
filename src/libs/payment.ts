// libs/payment.ts

const BASE_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

// 1. Create Payment
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
      amount: Number(amount),
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Payment creation failed");
  return json.data;
}

// 2. Get QR Code for Payment (returns { imageData, mimeType, ... })
export async function getQrCodeForPayment(paymentId: string, token: string) {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/qr-code`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch QR Code");
  return json.data; // { imageData: "base64string", mimeType: "image/png", ... }
}

// 3. Confirm QR Payment
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

// 4. Get Payments by User
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

// 5. Update Payment Method
export async function updatePaymentMethod(
  paymentId: string,
  method: string,
  token: string,
  isAdmin: boolean
) {
  const url = isAdmin
    ? `${BASE_URL}/payments/admin/${paymentId}/method` // ✅ admin route
    : `${BASE_URL}/payments/${paymentId}/method`;     // ✅ user route

  const res = await fetch(url, {
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

// 6. Cancel Payment
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

// 7. Get All Payments (Admin Only)
export async function getAllPayments(token: string) {
  // ✅ แก้ URL ให้ถูกต้อง ไม่ให้มี /api/v1 เบิ้ล
  const response = await fetch(`${BASE_URL}/payments/admin/all`, { 
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // ✅ เพิ่ม cache: "no-store" เพื่อให้ admin ได้เห็นข้อมูลอัปเดตตลอดเวลาเหมือนของ user
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch all payments");
  }

  const data = await response.json();
  return data.data;
}