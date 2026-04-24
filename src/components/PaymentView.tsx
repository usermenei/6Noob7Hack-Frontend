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

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initPayment = async () => {
      try {
        setError("");
        
        // 1. สร้าง Payment
        const amountToSend = Number(totalPrice);
        const paymentData = await createPayment(reservationId, paymentMethod, amountToSend, token);
        
        const newPaymentId = paymentData.paymentId || paymentData._id;
        setPaymentId(newPaymentId);

        // 2. ถ้าเป็นเงินสด (Cash) แสดงว่าจองสำเร็จแล้ว ไม่ต้องโหลด QR โชว์หน้า Success ได้เลย
        if (paymentMethod === "cash") {
          setSuccess("Reservation successful! Please pay cash at the counter. 💵");
          setTimeout(() => onPaymentSuccess(), 3000);
          return;
        }

        // 3. ถ้าเป็น QR ไปดึงรูปมาแสดง (จาก paymentId)
        const qrData = await getQrCodeForPayment(newPaymentId, token);
        
        if (qrData.qrCode) {
          setQrImage(qrData.qrCode);
        } else if (qrData.imageData && qrData.mimeType) {
          setQrImage(`data:${qrData.mimeType};base64,${qrData.imageData}`);
        } else if (qrData.imageBase64) {
          setQrImage(qrData.imageBase64);
        } else {
          throw new Error("Invalid QR Code format from server");
        }

      } catch (err: any) {
        console.error("Payment Init Error:", err);
        setError(err.message || "Failed to initialize payment or fetch QR.");
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

      {error && <div className={styles.errorBox}>❌ {error}</div>}
      
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

      <div className={styles.qrContainer}>
        {isProcessing && !qrImage && !success && (
          <div className={styles.loadingText}>Processing your payment...</div>
        )}

        {paymentMethod === "qr" && qrImage && (
          <>
            <img src={qrImage} alt="Space QR Code" className={styles.qrImage} />
            <p className={styles.qrSubtext}>Please scan the QR Code above to pay</p>
            
            <button 
              onClick={handleUserConfirmTransfer}
              disabled={isProcessing}
              className={styles.userConfirmBtn}
            >
              {isProcessing ? "Confirming..." : "✅ I have paid (Confirm)"}
            </button>
            
            <button 
              onClick={onBack} 
              disabled={isProcessing || !!success} 
              className={styles.backBtn}
              style={{ marginTop: "15px", width: "100%", padding: "10px", background: "transparent", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer" }}
            >
              Cancel Payment
            </button>
          </>
        )}
      </div>
    </div>
  );
}