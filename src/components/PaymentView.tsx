"use client";

import React, { useState, useEffect } from "react";
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

type Step = "idle" | "qr_ready" | "done";

export default function PaymentView({
  reservationId,
  paymentMethod,
  token,
  totalPrice,
  onPaymentSuccess,
  onBack,
}: PaymentViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<Step>("idle");

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");

  // Auto-trigger on mount
  useEffect(() => {
    handleGenerateQR();
  }, []);

  const handleGenerateQR = async () => {
  setIsProcessing(true);
  setError("");
  setSuccess("");

  try {
    let newPaymentId: string | null = null;

    const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

    // Step 1: Try to fetch existing pending payment for this reservation
    const existingRes = await fetch(`${BASE}/payments/reservation/${reservationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (existingRes.ok) {
      const existingData = await existingRes.json();
      newPaymentId = existingData?.data?._id?.toString() || null;
    }

    // Step 2: No existing payment — create a new one
    if (!newPaymentId) {
      const paymentData = await createPayment(reservationId, paymentMethod, totalPrice, token);
      newPaymentId =
        paymentData?.data?.paymentId?.toString() ||
        paymentData?.paymentId?.toString() ||
        paymentData?._id?.toString() ||
        null;
    }

    if (!newPaymentId) {
      throw new Error("Payment ID not found in response.");
    }

    setPaymentId(newPaymentId);

    if (paymentMethod === "cash") {
      setSuccess("Reservation status: Pending. Please pay at the counter. 💵");
      setStep("done");
      setTimeout(() => onPaymentSuccess(), 3000);
      return;
    }

    // Step 3: Fetch QR code
    const qrData = await getQrCodeForPayment(newPaymentId, token);
    console.log("QR Data from API:", qrData);

    const image = qrData?.qrCode || null;
    if (!image) {
      console.error("QR response shape:", qrData);
      throw new Error("QR image not found in response.");
    }

    setQrImage(image);
    setStep("qr_ready");
    setSuccess("Scan the QR Code below, then click confirm when done. 📱");
  } catch (err: any) {
    setError(err.message || "Something went wrong.");
  } finally {
    setIsProcessing(false);
  }
};

  const handleConfirmTransfer = async () => {
  if (!paymentId) return;
  try {
    setIsProcessing(true);
    setError("");

    // Step 1: Confirm payment
    const confirmData = await confirmQrPayment(paymentId, token);
    setTransactionId(confirmData?.transactionId || confirmData?._id || "N/A");

    // Step 2: Update reservation status to "success"
    const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";
    const resUpdate = await fetch(`${BASE}/reservations/${reservationId}/confirm`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resUpdate.ok) {
      const json = await resUpdate.json();
      throw new Error(json.message || "Failed to update reservation status.");
    }

    setQrImage(null);
    setSuccess("Payment confirmed! Your booking is now complete. 🎉");
    setStep("done");

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

      {error && (
        <div style={{
          padding: "12px", background: "#fef2f2", color: "#b91c1c",
          borderRadius: "8px", marginBottom: "15px", border: "1px solid #fecaca"
        }}>
          ❌ {error}
          {/* Retry button only appears on error */}
          <button
            onClick={handleGenerateQR}
            disabled={isProcessing}
            style={{
              display: "block", marginTop: "10px", padding: "8px 16px",
              background: "#b91c1c", color: "white", border: "none",
              borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
            }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {success && (
        <div className={styles.successBox}>
          <strong>✅ {success}</strong>
          {transactionId && <p>Transaction ID: {transactionId}</p>}
        </div>
      )}

      {/* Amount Summary */}
      <div className={styles.amountCard}>
        <p className={styles.amountLabel}>Total Amount</p>
        <h1 className={styles.amountValue}>฿{Number(totalPrice).toLocaleString()}</h1>
        <p className={styles.methodLabel}>
          Method: {paymentMethod === "qr" ? "📱 QR Code" : "💵 Cash"}
        </p>
      </div>

      {/* Loading spinner while generating */}
      {isProcessing && step === "idle" && (
        <div style={{
          textAlign: "center", padding: "40px", color: "#0891b2",
          fontSize: "1rem", fontWeight: "bold"
        }}>
          ⏳ Generating your QR Code...
        </div>
      )}

      {/* QR Code display + Confirm */}
      {step === "qr_ready" && qrImage && (
        <div style={{
          textAlign: "center", padding: "20px", border: "1px dashed #cbd5e1",
          borderRadius: "10px", marginTop: "20px", background: "#f8fafc"
        }}>
          <p style={{ fontWeight: "bold", color: "#0891b2", marginBottom: "12px" }}>
            Scan with your Banking App
          </p>

          <img
            src={qrImage}
            alt="PromptPay QR Code"
            style={{
              width: "200px", height: "200px",
              margin: "0 auto", display: "block",
              borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
            onError={() => {
              console.error("QR image failed to render. src prefix:", qrImage?.substring(0, 50));
              setError("QR image failed to render.");
            }}
          />

          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "10px" }}>
            After scanning and paying, click the button below
          </p>

          <button
            onClick={handleConfirmTransfer}
            disabled={isProcessing}
            style={{
              marginTop: "16px", padding: "12px 24px", background: "#10b981",
              color: "white", border: "none", borderRadius: "8px",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "0.95rem",
              opacity: isProcessing ? 0.7 : 1, width: "100%"
            }}
          >
            {isProcessing ? "⏳ Confirming..." : "✅ I've Completed the Transfer"}
          </button>
        </div>
      )}

      {step !== "done" && (
        <button
          onClick={onBack}
          style={{
            marginTop: "16px", background: "none", border: "none",
            color: "#64748b", cursor: "pointer", fontSize: "0.9rem", width: "100%"
          }}
        >
          ← Back
        </button>
      )}
    </div>
  );
}