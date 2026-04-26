"use client";

import { Reservation } from "@/libs/getReservations";
import Image from "next/image";
import styles from "./ReservationCard.module.css";
import { useState } from "react";

const formatImageUrl = (url?: string) => {
  if (!url) return "";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
};

const toDisplayTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
};

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
      groupEnd = slots[i].endTime;
    } else {
      groups.push(`${toDisplayTime(groupStart)} - ${toDisplayTime(groupEnd)}`);
      groupStart = slots[i].startTime;
      groupEnd = slots[i].endTime;
    }
  }
  groups.push(`${toDisplayTime(groupStart)} - ${toDisplayTime(groupEnd)}`);
  return groups;
};

// ── AuditLogTimeline ───────────────────────────────────────────────────────

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function AuditLogTimeline({ log }: { log: any[] }) {
  if (!log?.length) {
    return <p className={styles.auditEmpty}>No audit history yet.</p>;
  }

  const getMetaClass = (action: string) => {
    switch (action) {
      case "cancel": return styles.auditCancel;
      case "method_change": return styles.auditMethod;
      case "confirm": return styles.auditConfirm;
      case "fail": return styles.auditFail;
      default: return styles.auditDefault;
    }
  };

  const getLabel = (action: string) => {
    switch (action) {
      case "cancel": return "Payment cancelled";
      case "method_change": return "Method changed";
      case "confirm": return "Payment confirmed";
      case "fail": return "Payment failed";
      default: return action;
    }
  };

  return (
    <div className={styles.auditContainer}>
      {log.map((entry: any, i: number) => {
        const metaClass = getMetaClass(entry.action);
        const label = getLabel(entry.action);
        const isLast = i === log.length - 1;
        const who = entry.changedBy?.name ?? entry.changedBy ?? "System";

        let detail = null;
        if (entry.action === "method_change" && entry.oldMethod && entry.newMethod) {
          detail = (
            <div className={styles.auditDetailRow}>
              <code className={styles.auditCode}>{entry.oldMethod}</code>
              <span className={styles.auditArrow}>→</span>
              <code className={styles.auditCode}>{entry.newMethod}</code>
            </div>
          );
        } else if (entry.oldStatus && entry.newStatus && entry.oldStatus !== entry.newStatus) {
          detail = (
            <div className={styles.auditDetailRow}>
              <code className={styles.auditCode}>{entry.oldStatus}</code>
              <span className={styles.auditArrow}>→</span>
              <code className={styles.auditCode}>{entry.newStatus}</code>
            </div>
          );
        }

        return (
          <div key={entry._id ?? i} className={styles.auditItem}>
            <div className={styles.auditTimelineLine}>
              <div className={`${styles.auditDot} ${metaClass}`} />
              {!isLast && <div className={styles.auditLine} />}
            </div>
            <div className={styles.auditContent}>
              <div className={styles.auditHeader}>
                <span className={styles.auditTitle}>{label}</span>
                <span className={`${styles.auditBadge} ${metaClass}`}>
                  {entry.action.replace("_", " ")}
                </span>
              </div>
              {detail}
              <div className={styles.auditTimestamp}>
                {who} · <span title={formatDateTime(entry.timestamp)}>{relTime(entry.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ReservationCard ────────────────────────────────────────────────────────

interface ReservationCardProps {
  reservation: Reservation;
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (res: Reservation) => void;
  onPaymentMethodChange?: (id: string, method: string) => void;
  onViewQR?: (res: Reservation) => void;
  onPayNow?: (res: Reservation) => void;
  onEditPayment?: (res: Reservation) => void;
  onAdminConfirmCash?: (paymentId: string) => void;
  onAdminCancelPayment?: (paymentId: string) => void;
  onFetchAuditLog?: (paymentId: string) => Promise<any[]>;
}

const getPaymentLabel = (method?: string | null) => {
  if (method === "qr") return "📱 QR Code";
  if (method === "cash") return "💵 Cash";
  return "❓ Not Set";
};

const getPaymentBadgeClass = (method?: string | null) => {
  if (method === "qr") return styles.badgeQr;
  if (method === "cash") return styles.badgeCash;
  return styles.badgeNotSet;
};

export default function ReservationCard({
  reservation: r,
  isAdmin,
  onApprove,
  onDelete,
  onEdit,
  onPaymentMethodChange,
  onViewQR,
  onAdminConfirmCash,
  onAdminCancelPayment,
  onFetchAuditLog,
}: ReservationCardProps) {
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  
  // ── Custom Confirm Modal State ──
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", onConfirm: () => {} });

  const closeConfirmModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

  const handleToggleAudit = async () => {
    if (!showAudit && r.paymentId) {
      setLoadingAudit(true);
      try {
        const log = await onFetchAuditLog?.(r.paymentId);
        setAuditLog(log ?? []);
      } finally {
        setLoadingAudit(false);
      }
    }
    setShowAudit((v) => !v);
  };

  const space = r.room?.coworkingSpace;
  const slots = Array.isArray(r.timeSlots)
    ? [...r.timeSlots].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    : [];
  const startDateObj = slots.length > 0 ? new Date(slots[0].startTime) : null;
  const isValid = (d: Date | null): d is Date => d !== null && !isNaN(d.getTime());

  let dateStr = "-";
  if (isValid(startDateObj)) {
    dateStr = startDateObj.toLocaleDateString("en-GB", {
      timeZone: "Asia/Bangkok", day: "numeric", month: "short", year: "numeric",
    });
  }

  const timeRanges = groupContinuousSlots(slots);
  const userName = r.user?.name ?? "Unknown User";

  const getStatusClass = (status: string) => {
    switch (status) {
      case "success": return styles.statusSuccess;
      case "cancelled": return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  const validImageUrl = formatImageUrl(space?.picture);
  const isPending = r.status === "pending";
  const isQrMethod = r.paymentMethod === "qr";
  const isCashMethod = r.paymentMethod === "cash";
  const isUnpaid = !r.paymentStatus || r.paymentStatus === "pending";

  return (
    <>
      <div className={styles.reservationCard}>
        <div className={styles.cardLeft}>
          <div className={styles.imageContainer}>
            {validImageUrl ? (
              <Image src={validImageUrl} alt={space?.name ?? "Space"} width={120} height={120} className={styles.image} />
            ) : (
              <div className={styles.placeholder}>🏢</div>
            )}
          </div>

          <div className={styles.infoContainer}>
            <p className={styles.spaceName}>{space?.name ?? "Unknown Space"}</p>
            <p className={styles.roomName}>🪑 Room: {r.room?.name ?? "Unknown Room"}</p>
            {r.paymentId && (
              <p className={styles.paymentIdText}>💳 Payment ID: {r.paymentId}</p>
            )}
            {isAdmin && <p className={styles.userName}>👤 {userName}</p>}
            <p className={styles.location}>{space?.district}, {space?.province}</p>

            <div className={styles.dateTimeContainer}>
              <div className={styles.dateTime}>
                <p className={styles.dateText}>📅 {dateStr}</p>
                {timeRanges.length > 0
                  ? timeRanges.map((range, i) => <p key={i} className={styles.timeSlot}>🕐 {range}</p>)
                  : <p className={styles.timeSlot}>-</p>}
              </div>

              <div className={styles.badgesWrapper}>
                <span className={`${styles.statusBadge} ${getStatusClass(r.status)}`}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
                <span className={`${styles.paymentMethodBadge} ${getPaymentBadgeClass(r.paymentMethod)}`}>
                  {getPaymentLabel(r.paymentMethod)}
                </span>
                {r.paymentStatus && (
                  <span className={`${styles.paymentStatusBadge} ${r.paymentStatus === "paid" ? styles.paymentPaid : styles.paymentPending}`}>
                    {r.paymentStatus === "paid" ? "✅ Paid" : `⏳ ${r.paymentStatus}`}
                  </span>
                )}
              </div>
            </div>

            {isAdmin && r.paymentId && (
              <div className={styles.auditSection}>
                <button onClick={handleToggleAudit} className={`${styles.auditToggleBtn} ${showAudit ? styles.auditToggleBtnActive : ""}`}>
                  {loadingAudit ? "Loading..." : showAudit ? "▲ Hide history" : "▼ View history"}
                </button>

                {showAudit && (
                  <div className={styles.auditLogWrapper}>
                    <AuditLogTimeline log={auditLog} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actionsContainer}>
          {isPending && isQrMethod && isUnpaid && (
            <button onClick={() => onViewQR?.(r)} className={styles.actionBtnViewQR}>
              {isAdmin ? "📱 View QR" : "📱 View QR / Pay"}
            </button>
          )}

          {isAdmin && isPending && isCashMethod && isUnpaid && r.paymentId && (
            <button onClick={() => setConfirmModal({
              isOpen: true, title: "Confirm Cash Payment?",
              onConfirm: () => { onAdminConfirmCash?.(r.paymentId!); closeConfirmModal(); }
            })} className={styles.actionBtnConfirmCash}>
              💵 Confirm Cash
            </button>
          )}

          {isAdmin && isPending && r.paymentId && isUnpaid && (
            <button onClick={() => setConfirmModal({
              isOpen: true, title: "Cancel Payment?",
              onConfirm: () => { onAdminCancelPayment?.(r.paymentId!); closeConfirmModal(); }
            })} className={styles.actionBtnCancelPayment}>
              ❌ Cancel Payment
            </button>
          )}

          {isPending && isUnpaid && (
            <button onClick={() => {
              const newMethod = isQrMethod ? "cash" : "qr";
              setConfirmModal({
                isOpen: true, title: `Switch to ${newMethod === "qr" ? "QR Code" : "Cash"}?`,
                onConfirm: () => { onPaymentMethodChange?.(r.paymentId!, newMethod); closeConfirmModal(); }
              });
            }} className={styles.btnPayment}>
              💳 {r.paymentMethod ? "Change Method" : "Set Payment Method"}
            </button>
          )}

          {(isAdmin || isPending) && (
            <button onClick={() => onEdit(r)} className={styles.btnEdit}>Edit</button>
          )}

          {isAdmin && isPending && (
            <button onClick={() => setConfirmModal({
              isOpen: true, title: "Approve Reservation?",
              onConfirm: () => { onApprove(r._id); closeConfirmModal(); }
            })} className={styles.btnApprove}>
              ✅ Approve
            </button>
          )}

          {(isAdmin || r.status === "cancelled" || r.status === "success") && (
            <button onClick={() => setConfirmModal({
              isOpen: true, title: "Delete Reservation?",
              onConfirm: () => { onDelete(r._id); closeConfirmModal(); }
            })} className={styles.btnDelete}>
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      {/* ── Custom Confirm Modal ── */}
      {confirmModal.isOpen && (
        <div className={styles.modalOverlay} onClick={closeConfirmModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{confirmModal.title}</h3>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} onClick={closeConfirmModal}>Cancel</button>
              <button className={styles.modalBtnConfirm} onClick={confirmModal.onConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}