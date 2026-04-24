"use client";

import { Reservation } from "@/libs/getReservations";
import Image from "next/image";
import styles from "./BookingList.module.css";

const formatImageUrl = (url?: string) => {
  if (!url) return "";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
};

const toDisplayTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Groups sorted slots into continuous ranges
// e.g. [05-06, 06-07, 08-09] → ["05:00 - 07:00", "08:00 - 09:00"]
const groupContinuousSlots = (
  slots: { _id: string; startTime: string; endTime: string }[]
): string[] => {
  if (slots.length === 0) return [];

  const groups: string[] = [];
  let groupStart = slots[0].startTime;
  let groupEnd = slots[0].endTime;

  for (let i = 1; i < slots.length; i++) {
    const prevEnd = new Date(slots[i - 1].endTime).getTime();
    const currStart = new Date(slots[i].startTime).getTime();

    if (currStart === prevEnd) {
      // Continuous — extend the current group
      groupEnd = slots[i].endTime;
    } else {
      // Gap — push current group and start a new one
      groups.push(`${toDisplayTime(groupStart)} - ${toDisplayTime(groupEnd)}`);
      groupStart = slots[i].startTime;
      groupEnd = slots[i].endTime;
    }
  }

  groups.push(`${toDisplayTime(groupStart)} - ${toDisplayTime(groupEnd)}`);
  return groups;
};

interface ReservationCardProps {
  reservation: Reservation;
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (res: Reservation) => void;
  onPaymentMethodChange?: (id: string, method: string) => void;
}

export default function ReservationCard({
  reservation: r,
  isAdmin,
  onApprove,
  onDelete,
  onEdit,
  onPaymentMethodChange,
}: ReservationCardProps) {
  const space = r.room?.coworkingSpace;

  const slots = Array.isArray(r.timeSlots)
    ? [...r.timeSlots].sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime()
      )
    : [];

  const startDateObj =
    slots.length > 0 ? new Date(slots[0].startTime) : null;

  const isValid = (d: Date | null): d is Date =>
    d !== null && !isNaN(d.getTime());

  let dateStr = "-";
  if (isValid(startDateObj)) {
    dateStr = startDateObj.toLocaleDateString("en-GB", {
      timeZone: "Asia/Bangkok",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const timeRanges = groupContinuousSlots(slots);

  const userName = r.user?.name ?? "Unknown User";

  const getStatusClass = (status: string) => {
    switch (status) {
      case "success":
        return styles.statusSuccess;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const validImageUrl = formatImageUrl(space?.picture);

  return (
    <div className={styles.reservationCard}>
      <div className={styles.cardLeft}>
        <div className={styles.imageContainer}>
          {validImageUrl ? (
            <Image
              src={validImageUrl}
              alt={space?.name ?? "Space"}
              width={120}
              height={120}
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>🏢</div>
          )}
        </div>

        <div className={styles.infoContainer}>
          <p className={styles.spaceName}>
            {space?.name ?? "Unknown Space"}
          </p>

          {isAdmin && (
            <p className={styles.userName}>👤 {userName}</p>
          )}

          <p className={styles.location}>
            {space?.district}, {space?.province}
          </p>

          <div className={styles.dateTimeContainer}>
            <div className={styles.dateTime}>
              <p style={{ fontSize: "0.8rem" }}>📅 {dateStr}</p>
              {timeRanges.length > 0 ? (
                timeRanges.map((range, i) => (
                  <p key={i} className={styles.timeSlot}>
                    🕐 {range}
                  </p>
                ))
              ) : (
                <p className={styles.timeSlot}>-</p>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span
                className={`${styles.statusBadge} ${getStatusClass(
                  r.status
                )}`}
              >
                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
              </span>

              {r.paymentMethod && (
                <span className={styles.paymentMethodBadge}>
                  💳 {r.paymentMethod === 'qr' ? 'QR Code' : r.paymentMethod === 'cash' ? 'Cash' : 'Not Set'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionsContainer}>
        {!isAdmin && r.status === "pending" && (
          <button
            onClick={() => {
              const newMethod = r.paymentMethod === 'qr' ? 'cash' : 'qr';
              if (confirm(`Switch payment method to ${newMethod.toUpperCase()}?`)) {
                onPaymentMethodChange?.(r._id, newMethod);
              }
            }}
            className={styles.btnPayment}
          >
            💳 Change Method
          </button>
        )}

        {(isAdmin || r.status === "pending") && (
          <button onClick={() => onEdit(r)} className={styles.btnEdit}>
            Edit
          </button>
        )}

        {isAdmin && r.status === "pending" && (
          <button onClick={() => onApprove(r._id)} className={styles.btnApprove}>
            Approve
          </button>
        )}

        {(isAdmin ||
          r.status === "cancelled" ||
          r.status === "success") && (
          <button onClick={() => onDelete(r._id)} className={styles.btnDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}