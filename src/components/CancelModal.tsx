"use client";

import { Reservation } from "@/libs/getReservations";
import styles from "./BookingList.module.css";

interface CancelModalProps {
  reservation: Reservation;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

export default function CancelModal({ reservation: r, onConfirm, onClose }: CancelModalProps) {
  const spaceName = r.room?.coworkingSpace?.name || "Unknown Space";
  const roomName = r.room?.name || "Unknown Room";
  
  // Format Date
  const dateStr = r.timeSlots?.length 
    ? new Date(r.timeSlots[0].startTime).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric"
      })
    : "N/A";

  // Format Time Slots
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", timeZone: "UTC"
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ borderTop: "6px solid #ef4444" }}>
        <h3 className={styles.modalHeader} style={{ color: "#ef4444", marginBottom: "8px" }}>
          Cancel Reservation?
        </h3>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>

        <div style={{ background: "#fef2f2", padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#991b1b", fontWeight: 800 }}>Space & Room</label>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111" }}>{spaceName} - {roomName}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#991b1b", fontWeight: 800 }}>Date</label>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>📅 {dateStr}</p>
            </div>
            <div>
              <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#991b1b", fontWeight: 800 }}>Time Slots</label>
              {r.timeSlots?.map((slot, i) => (
                <p key={i} style={{ fontSize: "12px", fontWeight: 500, color: "#111", margin: 0 }}>
                  🕐 {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancelModal} onClick={onClose}>
            Keep Booking
          </button>
          <button 
            className={styles.btnSave} 
            style={{ background: "#ef4444" }}
            onClick={() => onConfirm(r._id)}
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}
