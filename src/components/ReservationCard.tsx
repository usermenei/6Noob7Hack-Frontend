"use client";

import { Reservation } from "@/libs/getReservations";
import Image from "next/image";
import styles from "./BookingList.module.css";
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

const ACTION_META: Record<string, { label: string; dot: string; badge: { bg: string; color: string; border: string } }> = {
  cancel:        { label: "Payment cancelled", dot: "#E24B4A", badge: { bg: "#FCEBEB", color: "#A32D2D", border: "#F09595" } },
  method_change: { label: "Method changed",    dot: "#378ADD", badge: { bg: "#E6F1FB", color: "#185FA5", border: "#85B7EB" } },
  confirm:       { label: "Payment confirmed", dot: "#639922", badge: { bg: "#EAF3DE", color: "#3B6D11", border: "#97C459" } },
  fail:          { label: "Payment failed",    dot: "#EF9F27", badge: { bg: "#FAEEDA", color: "#854F0B", border: "#EF9F27" } },
};

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
    return (
      <p style={{ fontSize: "12px", color: "#9ca3af", padding: "8px 0", margin: 0 }}>
        No audit history yet.
      </p>
    );
  }

  return (
    <div>
      {log.map((entry: any, i: number) => {
        const meta = ACTION_META[entry.action] ?? {
          label: entry.action,
          dot: "#888780",
          badge: { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" },
        };
        const isLast = i === log.length - 1;
        const who = entry.changedBy?.name ?? entry.changedBy ?? "System";

        let detail = null;
        if (entry.action === "method_change" && entry.oldMethod && entry.newMethod) {
          detail = (
            <div style={{ display: "flex", gap: "5px", alignItems: "center", marginTop: "3px" }}>
              <code style={{ fontSize: "10px", background: "#f1f5f9", padding: "1px 5px", borderRadius: "3px", color: "#334155" }}>{entry.oldMethod}</code>
              <span style={{ color: "#94a3b8", fontSize: "10px" }}>→</span>
              <code style={{ fontSize: "10px", background: "#f1f5f9", padding: "1px 5px", borderRadius: "3px", color: "#334155" }}>{entry.newMethod}</code>
            </div>
          );
        } else if (entry.oldStatus && entry.newStatus && entry.oldStatus !== entry.newStatus) {
          detail = (
            <div style={{ display: "flex", gap: "5px", alignItems: "center", marginTop: "3px" }}>
              <code style={{ fontSize: "10px", background: "#f1f5f9", padding: "1px 5px", borderRadius: "3px", color: "#334155" }}>{entry.oldStatus}</code>
              <span style={{ color: "#94a3b8", fontSize: "10px" }}>→</span>
              <code style={{ fontSize: "10px", background: "#f1f5f9", padding: "1px 5px", borderRadius: "3px", color: "#334155" }}>{entry.newStatus}</code>
            </div>
          );
        }

        return (
          <div key={entry._id ?? i} style={{ display: "flex", gap: "10px", paddingBottom: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: meta.dot, flexShrink: 0 }} />
              {!isLast && <div style={{ width: "1px", flex: 1, background: "#e5e7eb", marginTop: "3px" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#1f2937" }}>{meta.label}</span>
                <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "999px", background: meta.badge.bg, color: meta.badge.color, border: `0.5px solid ${meta.badge.border}` }}>
                  {entry.action.replace("_", " ")}
                </span>
              </div>
              {detail}
              <div style={{ marginTop: "3px", fontSize: "10px", color: "#9ca3af" }}>
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
  // ── new: parent supplies this so the card can lazy-load the audit log ──
  onFetchAuditLog?: (paymentId: string) => Promise<any[]>;
}

const getPaymentLabel = (method?: string | null) => {
  if (method === "qr") return "📱 QR Code";
  if (method === "cash") return "💵 Cash";
  return "❓ Not Set";
};

const getPaymentBadgeStyle = (method?: string | null): React.CSSProperties => {
  if (method === "qr") return { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };
  if (method === "cash") return { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" };
  return { background: "#fafafa", color: "#6b7280", border: "1px solid #e5e7eb" };
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
  // ── audit log state ──
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const handleToggleAudit = async () => {
  if (!showAudit && r.paymentId) {
    setLoadingAudit(true);
    try {
      const log = await onFetchAuditLog?.(r.paymentId);
      console.log("NEW LOG:", log); // 🔥 debug
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
  <p
    style={{
      fontSize: "0.75rem",
      color: "#64748b",
      fontFamily: "monospace",
      marginTop: "4px",
    }}
  >
    💳 Payment ID: {r.paymentId}
  </p>
)}
          {isAdmin && <p className={styles.userName}>👤 {userName}</p>}
          <p className={styles.location}>{space?.district}, {space?.province}</p>

          <div className={styles.dateTimeContainer}>
            <div className={styles.dateTime}>
              <p style={{ fontSize: "0.8rem" }}>📅 {dateStr}</p>
              {timeRanges.length > 0
                ? timeRanges.map((range, i) => <p key={i} className={styles.timeSlot}>🕐 {range}</p>)
                : <p className={styles.timeSlot}>-</p>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className={`${styles.statusBadge} ${getStatusClass(r.status)}`}>
                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
              </span>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "3px 8px", borderRadius: "999px", ...getPaymentBadgeStyle(r.paymentMethod) }}>
                {getPaymentLabel(r.paymentMethod)}
              </span>
              {r.paymentStatus && (
                <span style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "999px", background: r.paymentStatus === "paid" ? "#dcfce7" : "#fef9c3", color: r.paymentStatus === "paid" ? "#166534" : "#854d0e", border: `1px solid ${r.paymentStatus === "paid" ? "#86efac" : "#fde68a"}`, fontWeight: 500 }}>
                  {r.paymentStatus === "paid" ? "✅ Paid" : `⏳ ${r.paymentStatus}`}
                </span>
              )}
            </div>
          </div>

          {/* ── Audit log toggle (admin only, only when a paymentId exists) ── */}
          {isAdmin && r.paymentId && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={handleToggleAudit}
                style={{
                  fontSize: "11px", padding: "4px 10px",
                  background: showAudit ? "#f1f5f9" : "transparent",
                  border: "1px solid #e2e8f0", borderRadius: "6px",
                  cursor: "pointer", color: "#64748b", fontWeight: 500,
                }}
              >
                {loadingAudit ? "Loading..." : showAudit ? "▲ Hide history" : "▼ View history"}
              </button>

              {showAudit && (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e5e7eb" }}>
                  <AuditLogTimeline log={auditLog} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.actionsContainer}>

        {/* View QR */}
        {isPending && isQrMethod && isUnpaid && (
          <button onClick={() => onViewQR?.(r)} style={{ padding: "8px 12px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}>
            {isAdmin ? "📱 View QR" : "📱 View QR / Pay"}
          </button>
        )}

        {/* Admin: Confirm Cash */}
        {isAdmin && isPending && isCashMethod && isUnpaid && r.paymentId && (
          <button onClick={() => { if (confirm("Confirm cash received for this reservation?")) onAdminConfirmCash?.(r.paymentId!); }}
            style={{ padding: "8px 12px", background: "#15803d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}>
            💵 Confirm Cash
          </button>
        )}

        {/* Admin: Cancel Payment */}
        {isAdmin && isPending && r.paymentId && isUnpaid && (
          <button onClick={() => { if (confirm("Cancel this payment? Reservation will also be cancelled.")) onAdminCancelPayment?.(r.paymentId!); }}
            style={{ padding: "8px 12px", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}>
            ❌ Cancel Payment
          </button>
        )}

        {/* Change payment method */}
        {isPending && isUnpaid && (
          <button onClick={() => { const newMethod = isQrMethod ? "cash" : "qr"; if (confirm(`Switch payment method to ${newMethod === "qr" ? "QR Code" : "Cash"}?`)) onPaymentMethodChange?.(r.paymentId!, newMethod); }}
            className={styles.btnPayment}>
            💳 {r.paymentMethod ? "Change Method" : "Set Payment Method"}
          </button>
        )}

        {/* Edit */}
        {(isAdmin || isPending) && (
          <button onClick={() => onEdit(r)} className={styles.btnEdit}>Edit</button>
        )}

        {/* Approve */}
        {isAdmin && isPending && (
          <button onClick={() => onApprove(r._id)} className={styles.btnApprove}>Approve</button>
        )}

        {/* Delete */}
        {(isAdmin || r.status === "cancelled" || r.status === "success") && (
          <button onClick={() => onDelete(r._id)} className={styles.btnDelete}>Delete</button>
        )}

      </div>
    </div>
  );
}