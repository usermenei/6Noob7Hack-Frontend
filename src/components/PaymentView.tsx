"use client";

import React, { useState } from "react";

interface PaymentViewProps {
  reservationId: string;
  token: string;
  totalPrice: number;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

export default function PaymentView({
  reservationId,
  token,
  totalPrice,
  onPaymentSuccess,
  onBack,
}: PaymentViewProps) {
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "cash">("qr");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setError("");
    setSuccess("");
    
    try {
      const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";
      
      // 🌟 ยิง API /payments ตาม US2-1
      const res = await fetch(`${BASE}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          reservationId: reservationId, 
          method: paymentMethod,
          amount: totalPrice 
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Payment failed");

      // 🌟 ดึง Transaction ID มาแสดงผล
      setTransactionId(json.data?.transaction_id || json.data?._id || "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase());

      if (paymentMethod === "cash") {
        setSuccess("Reservation status: Pending. Please pay at the counter. 💵");
      } else {
        setSuccess("Payment successful! Your booking is confirmed. 🎉");
      }
      
      setTimeout(() => onPaymentSuccess(), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <button onClick={onBack} disabled={isProcessing || !!success} style={{ color: "#0891b2", background: "none", border: "none", cursor: "pointer", fontWeight: "bold", marginBottom: "15px" }}>
        ← Back to Edit
      </button>

      <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "15px" }}>Checkout</h2>

      {/* UI Notification Messages */}
      {error && <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", marginBottom: "15px", border: "1px solid #fecaca" }}>❌ {error}</div>}
      {success && (
        <div style={{ padding: "12px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", marginBottom: "15px", border: "1px solid #bbf7d0" }}>
          <strong>✅ {success}</strong>
          <p style={{ fontSize: "0.8rem", marginTop: "5px" }}>Transaction ID: {transactionId}</p>
        </div>
      )}

      <div style={{ background: "#f0f9ff", padding: "20px", borderRadius: "12px", textAlign: "center", marginBottom: "20px" }}>
        <p style={{ fontSize: "0.8rem", color: "#0369a1", textTransform: "uppercase", fontWeight: "bold" }}>Total Amount</p>
        <h1 style={{ fontSize: "2.2rem", color: "#0c4a6e", margin: "5px 0" }}>฿{totalPrice.toLocaleString()}</h1>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "0.9rem" }}>Payment Method</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setPaymentMethod("qr")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: paymentMethod === "qr" ? "2px solid #0891b2" : "1px solid #cbd5e1", background: paymentMethod === "qr" ? "#ecfeff" : "white", cursor: "pointer" }}>📱 PromptPay</button>
          <button onClick={() => setPaymentMethod("cash")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: paymentMethod === "cash" ? "2px solid #0891b2" : "1px solid #cbd5e1", background: paymentMethod === "cash" ? "#ecfeff" : "white", cursor: "pointer" }}>💵 Cash</button>
        </div>
      </div>

      {paymentMethod === "qr" && !success && (
        <div style={{ textAlign: "center", padding: "15px", border: "1px dashed #cbd5e1", borderRadius: "10px", marginBottom: "20px" }}>
          <div style={{ width: "140px", height: "140px", background: "#f1f5f9", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>[ QR Code ]</div>
          <p style={{ fontSize: "0.75rem", color: "#64748b" }}>Scan and pay via your Banking App</p>
        </div>
      )}

      {paymentMethod === "cash" && !success && (
        <div style={{ padding: "12px", background: "#fffbeb", color: "#92400e", borderRadius: "8px", marginBottom: "20px", fontSize: "0.85rem", border: "1px solid #fef3c7" }}>
          ℹ️ Your reservation will be held. Please pay at the front desk when you arrive.
        </div>
      )}

      <button
        onClick={handleConfirmPayment}
        disabled={isProcessing || !!success}
        style={{ width: "100%", padding: "16px", background: success ? "#10b981" : "#0891b2", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", opacity: isProcessing ? 0.7 : 1 }}
      >
        {isProcessing ? "Processing..." : success ? "Booking Completed" : `Confirm & ${paymentMethod === 'cash' ? 'Book' : 'Pay'}`}
      </button>
    </div>
  );
}