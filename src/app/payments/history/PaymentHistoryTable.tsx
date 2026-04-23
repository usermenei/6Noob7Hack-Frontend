"use client";

import { useState } from "react";
import styles from "./PaymentHistory.module.css";

interface Payment {
  _id: string;
  transactionId?: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  reservation?: {
    roomSnapshot: {
      name: string;
    };
    timeSlots?: Array<{
      _id: string;
      startTime: string;
      endTime: string;
    }>;
  };
}

export default function PaymentHistoryTable({ payments }: { payments: Payment[] }) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return styles.completed;
      case "pending": return styles.pending;
      case "failed": return styles.failed;
      case "cancelled": return styles.cancelled;
      case "refund_required": return styles.refund_required;
      default: return "";
    }
  };

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Room Name</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr 
                key={payment._id} 
                className={styles.clickableRow}
                onClick={() => setSelectedPayment(payment)}
              >
                <td>
                  <span className={styles.txnId}>
                    {payment.transactionId || "N/A"}
                  </span>
                </td>
                <td>
                  <span className={styles.roomName}>
                    {payment.reservation?.roomSnapshot?.name || "Room Deleted"}
                  </span>
                </td>
                <td>{formatDate(payment.createdAt)}</td>
                <td>
                  <span className={styles.amount}>
                    ฿{payment.amount.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className={`${styles.methodBadge} ${styles[payment.method]}`}>
                    {payment.method === "qr" ? "QR Code" : "Cash"}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(payment.status)}`}>
                    {payment.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedPayment && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPayment(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Payment Detail</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedPayment(null)}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Room Name</label>
                  <span className={styles.detailValue}>{selectedPayment.reservation?.roomSnapshot?.name || "N/A"}</span>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Transaction ID</label>
                  <span className={styles.txnId}>{selectedPayment.transactionId || "N/A"}</span>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Date</label>
                  <span className={styles.detailValue}>{formatDate(selectedPayment.createdAt)}</span>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Time Slots</label>
                  <div className={styles.slotList}>
                    {selectedPayment.reservation?.timeSlots?.map((slot) => (
                      <span key={slot._id} className={styles.slotBadge}>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    )) || <span className={styles.detailValue}>N/A</span>}
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Payment Method</label>
                  <span className={`${styles.methodBadge} ${styles[selectedPayment.method]}`}>
                    {selectedPayment.method === "qr" ? "QR Code" : "Cash"}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Status</label>
                  <span className={`${styles.statusBadge} ${getStatusClass(selectedPayment.status)}`}>
                    {selectedPayment.status.replace("_", " ")}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <label className={styles.detailLabel}>Total Amount</label>
                  <span className={styles.amount} style={{ fontSize: "1.5rem" }}>
                    ฿{selectedPayment.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.doneBtn} onClick={() => setSelectedPayment(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
