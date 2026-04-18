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

// -7 hours format
const toThaiTime = (dateStr: string) => {
  const date = new Date(dateStr);
  date.setHours(date.getHours() - 7);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface ReservationCardProps {
  reservation: Reservation;
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (res: Reservation) => void;
}

export default function ReservationCard({
  reservation: r,
  isAdmin,
  onApprove,
  onDelete,
  onEdit,
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

  const endDateObj =
    slots.length > 0
      ? new Date(slots[slots.length - 1].endTime)
      : null;

  const isValid = (d: Date | null): d is Date =>
    d !== null && !isNaN(d.getTime());

  let dateStr = "-";
  if (isValid(startDateObj)) {
    dateStr = startDateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  let timeDisplay = "-";
  if (isValid(startDateObj) && isValid(endDateObj)) {
    timeDisplay = `${toThaiTime(slots[0].startTime)} - ${toThaiTime(
      slots[slots.length - 1].endTime
    )}`;
  }

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
            <p className={styles.dateTime}>
              📅 {dateStr} at {timeDisplay}
            </p>

            <span
              className={`${styles.statusBadge} ${getStatusClass(
                r.status
              )}`}
            >
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actionsContainer}>
        {(isAdmin || r.status === "pending") && (
          <button
            onClick={() => onEdit(r)}
            className={styles.btnEdit}
          >
            Edit
          </button>
        )}

        {isAdmin && r.status === "pending" && (
          <button
            onClick={() => onApprove(r._id)}
            className={styles.btnApprove}
          >
            Approve
          </button>
        )}

        {/* ❌ CANCEL BUTTON REMOVED */}

        {(isAdmin ||
          r.status === "cancelled" ||
          r.status === "success") && (
          <button
            onClick={() => onDelete(r._id)}
            className={styles.btnDelete}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}