"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPayment, getQrCodeForPayment, confirmQrPayment } from "@/libs/payment";
import styles from "./PaymentView.module.css";

interface PaymentViewProps {
  reservationId: string;
  paymentMethod: "qr" | "cash";
  token: string;
  totalPrice: number;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

export default function PaymentView({
  reservationId,
  paymentMethod,
  token,
  totalPrice,
  onPaymentSuccess,
  onBack,
}: PaymentViewProps) {
  const [isProcessing, setIsProcessing] = useState(true);
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

  initPayment();
}, [reservationId, paymentMethod, token, totalPrice]);

const handleUserConfirmTransfer = async () => {
  if (!paymentId) return;
  try {
    setIsProcessing(true);
    setError("");

    const confirmData = await confirmQrPayment(paymentId, token);
    setTransactionId(confirmData.transactionId || "N/A");
    setQrImage(null);
    setSuccess("Payment confirmed! Your booking is now complete. 🎉");

    setTimeout(() => onPaymentSuccess(), 2500);
  } catch (err: any) {
    setError(err.message || "Confirmation failed. Please try again.");
  } finally {
    setIsProcessing(false);
  }
};

return (
  <div className={styles.container}>
    <h2 className={styles.title}>Payment Checkout</h2>

    {error && <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", marginBottom: "15px", border: "1px solid #fecaca" }}>❌ {error}</div>}

    {success && (
      <div className={styles.successBox}>
        <strong>✅ {success}</strong>
        {transactionId && <p>Transaction ID: {transactionId}</p>}
      </div>
    )}

    <div className={styles.amountCard}>
      <p className={styles.amountLabel}>Total Amount</p>
      <h1 className={styles.amountValue}>฿{Number(totalPrice).toLocaleString()}</h1>
      <p className={styles.methodLabel}>Method: {paymentMethod === 'qr' ? '📱 QR Code' : '💵 Cash'}</p>
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