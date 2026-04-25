"use client";

import React, { useState } from "react";
// นำเข้าฟังก์ชันจากไฟล์ libs ที่เราแยกไว้
import { createPayment, generateQrCode, simulateConfirmPayment } from "@/libs/payment";

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

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      // 1. สร้าง Payment ผ่าน libs
      const paymentData = await createPayment(reservationId, paymentMethod, token);
      const newPaymentId = paymentData.paymentId;
      setPaymentId(newPaymentId);

      if (paymentMethod === "cash") {
        setSuccess("Reservation status: Pending. Please pay at the counter. 💵");
        setTimeout(() => onPaymentSuccess(), 3000);
      } else {
        // 2. ถ้าเป็น QR ขอรูป QR Code ผ่าน libs
        const qrData = await generateQrCode(newPaymentId, token);
        setQrImage(qrData.qrImage);
        setSuccess("Please scan the QR Code below to complete your payment. 📱");
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePaymentComplete = async () => {
    if (!paymentId) return;
    try {
      // 3. จำลองการจ่ายสำเร็จผ่าน libs
      const confirmData = await simulateConfirmPayment(paymentId, token);
      setTransactionId(confirmData.transactionId);
      setQrImage(null); // ซ่อน QR 
      setSuccess("Payment successful! Your booking is confirmed. 🎉");
      setTimeout(() => onPaymentSuccess(), 3000);
    } catch (err) {
      console.error("Simulation failed", err);
    }
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <button onClick={onBack} disabled={isProcessing || !!success} style={{ color: "#0891b2", background: "none", border: "none", cursor: "pointer", fontWeight: "bold", marginBottom: "15px" }}>
        ← Back to Edit
      </button>

      <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "15px" }}>Checkout</h2>

      {error && <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", marginBottom: "15px", border: "1px solid #fecaca" }}>❌ {error}</div>}

      {success && (
        <div style={{ padding: "12px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", marginBottom: "15px", border: "1px solid #bbf7d0" }}>
          <strong>✅ {success}</strong>
          {transactionId && <p style={{ fontSize: "0.8rem", marginTop: "5px" }}>Transaction ID: {transactionId}</p>}
        </div>
      )}

      <div style={{ background: "#f0f9ff", padding: "20px", borderRadius: "12px", textAlign: "center", marginBottom: "20px" }}>
        <p style={{ fontSize: "0.8rem", color: "#0369a1", textTransform: "uppercase", fontWeight: "bold" }}>Total Amount</p>
        <h1 style={{ fontSize: "2.2rem", color: "#0c4a6e", margin: "5px 0" }}>฿{totalPrice.toLocaleString()}</h1>
      </div>

      {!paymentId && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "0.9rem" }}>Payment Method</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setPaymentMethod("qr")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: paymentMethod === "qr" ? "2px solid #0891b2" : "1px solid #cbd5e1", background: paymentMethod === "qr" ? "#ecfeff" : "white", cursor: "pointer", transition: "all 0.2s" }}>📱 PromptPay QR</button>
              <button onClick={() => setPaymentMethod("cash")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: paymentMethod === "cash" ? "2px solid #0891b2" : "1px solid #cbd5e1", background: paymentMethod === "cash" ? "#ecfeff" : "white", cursor: "pointer", transition: "all 0.2s" }}>💵 Pay Cash</button>
            </div>
          </div>

          {paymentMethod === "qr" && (
            <div style={{ textAlign: "center", padding: "20px", border: "1px dashed #cbd5e1", borderRadius: "10px", marginBottom: "20px", background: "#f8fafc", animation: "fadeIn 0.3s ease-in-out" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#0891b2", marginBottom: "10px", textTransform: "uppercase" }}>Scan to Pay</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MockPaymentInfo" alt="Active PromptPay QR" style={{ width: "150px", height: "150px", margin: "0 auto", display: "block", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }} />
              <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "10px" }}>Scan via your preferred Banking App</p>
            </div>
          )}

          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            style={{ width: "100%", padding: "16px", background: "#0891b2", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", opacity: isProcessing ? 0.7 : 1, transition: "background 0.2s" }}
          >
            {isProcessing ? "Processing..." : `Confirm Payment`}
          </button>
        </>
      )}

      {qrImage && (
        <div style={{ textAlign: "center", padding: "20px", border: "1px dashed #cbd5e1", borderRadius: "10px", marginBottom: "20px" }}>
          <img src={qrImage} alt="PromptPay QR Code" style={{ width: "200px", height: "200px", margin: "0 auto", display: "block" }} />
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "10px" }}>Scan and pay via your Banking App</p>

          <button
            onClick={handleSimulatePaymentComplete}
            style={{ marginTop: "15px", padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
          >
            [Test] Simulate Payment Success
          </button>
        </div>
      )}
    </div>
  );
}