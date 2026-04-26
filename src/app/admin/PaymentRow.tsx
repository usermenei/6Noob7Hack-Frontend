import { useState } from "react";
import styles from "./admin.module.css";
import AuditLogTimeline from "./AuditLogTimeline";

export default function PaymentRow({ payment }: { payment: any }) {
  const [open, setOpen] = useState(false);

  const statusColors: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#fef3c7", color: "#b45309" },
    completed: { bg: "#d1fae5", color: "#047857" },
    cancelled: { bg: "#fee2e2", color: "#b91c1c" },
    failed: { bg: "#fef3c7", color: "#b45309" },
    refund_required: { bg: "#ede9fe", color: "#6d28d9" },
  };
  
  const sc = statusColors[payment.status] ?? { bg: "#f1f5f9", color: "#475569" };
  const totalEntries = payment.auditLog?.length ?? 0;

  return (
    <div className={styles.paymentRow}>
      {/* Row header */}
      <div className={styles.rowHeader} onClick={() => setOpen((v) => !v)}>
        <span style={{ fontSize: "11px", color: "#94a3b8", width: "14px", flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>

        <code style={{ fontSize: "11px", color: "#334155", background: "#f8fafc", padding: "2px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", flex: "1 1 160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {payment._id}
        </code>

        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0891b2", minWidth: "70px" }}>
          ฿{Number(payment.amount).toLocaleString()}
        </span>

        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: payment.method === "qr" ? "#eff6ff" : "#f0fdf4", color: payment.method === "qr" ? "#1d4ed8" : "#15803d", border: `1px solid ${payment.method === "qr" ? "#bfdbfe" : "#bbf7d0"}`, fontWeight: 500 }}>
          {payment.method === "qr" ? "📱 QR" : "💵 Cash"}
        </span>

        <span className={styles.badge} style={{ background: sc.bg, color: sc.color }}>
          {payment.status}
        </span>

        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "999px", background: totalEntries > 0 ? "#f1f5f9" : "#fafafa", color: totalEntries > 0 ? "#475569" : "#cbd5e1", border: "1px solid #e2e8f0", fontWeight: 600, marginLeft: "auto" }}>
          {totalEntries} {totalEntries === 1 ? "log" : "logs"}
        </span>
      </div>

      {/* Expanded audit log */}
      {open && (
        <div className={styles.logContainer}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
            📋 Audit History
          </p>
          <AuditLogTimeline log={payment.auditLog ?? []} />
        </div>
      )}
    </div>
  );
}