import styles from "./admin.module.css";

const ACTION_META: Record<
  string,
  { label: string; dot: string; badge: { bg: string; color: string; border: string } }
> = {
  cancel: {
    label: "Payment cancelled",
    dot: "#E24B4A",
    badge: { bg: "#FCEBEB", color: "#A32D2D", border: "#F09595" },
  },
  method_change: {
    label: "Method changed",
    dot: "#378ADD",
    badge: { bg: "#E6F1FB", color: "#185FA5", border: "#85B7EB" },
  },
  confirm: {
    label: "Payment confirmed",
    dot: "#639922",
    badge: { bg: "#EAF3DE", color: "#3B6D11", border: "#97C459" },
  },
  fail: {
    label: "Payment failed",
    dot: "#EF9F27",
    badge: { bg: "#FAEEDA", color: "#854F0B", border: "#EF9F27" },
  },
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
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogTimeline({ log }: { log: any[] }) {
  if (!log?.length) {
    return <div className={styles.timelineEmpty}>No audit history.</div>;
  }

  return (
    <div style={{ paddingTop: "4px" }}>
      {log.map((entry: any, i: number) => {
        const meta = ACTION_META[entry.action] ?? {
          label: entry.action,
          dot: "#888780",
          badge: { bg: "#f1efe8", color: "#5f5e5a", border: "#d3d1c7" },
        };

        const isLast = i === log.length - 1;
        const who = entry.changedBy?.name ?? entry.changedBy ?? "System";

        // ✅ NEW: support BOTH method + status changes together
        const hasMethodChange =
          entry.oldMethod && entry.newMethod && entry.oldMethod !== entry.newMethod;

        const hasStatusChange =
          entry.oldStatus && entry.newStatus && entry.oldStatus !== entry.newStatus;

        let detail = null;

        if (hasMethodChange || hasStatusChange) {
          detail = (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                marginTop: "3px",
              }}
            >
              {hasMethodChange && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <code
                    style={{
                      fontSize: "11px",
                      background: "#f1f5f9",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {entry.oldMethod}
                  </code>
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>→</span>
                  <code
                    style={{
                      fontSize: "11px",
                      background: "#f1f5f9",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {entry.newMethod}
                  </code>
                </div>
              )}

              {hasStatusChange && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <code
                    style={{
                      fontSize: "11px",
                      background: "#f1f5f9",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {entry.oldStatus}
                  </code>
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>→</span>
                  <code
                    style={{
                      fontSize: "11px",
                      background: "#f1f5f9",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {entry.newStatus}
                  </code>
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={entry._id ?? i}
            style={{ display: "flex", gap: "10px", paddingBottom: isLast ? 0 : "12px" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: "3px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: meta.dot,
                  flexShrink: 0,
                }}
              />
              {!isLast && (
                <div
                  style={{
                    width: "1px",
                    flex: 1,
                    background: "#e2e8f0",
                    marginTop: "3px",
                  }}
                />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                  {meta.label}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "1px 6px",
                    borderRadius: "999px",
                    background: meta.badge.bg,
                    color: meta.badge.color,
                    border: `0.5px solid ${meta.badge.border}`,
                    fontWeight: 500,
                  }}
                >
                  {entry.action.replace("_", " ")}
                </span>
              </div>

              {detail}

              <div style={{ marginTop: "3px", fontSize: "10px", color: "#94a3b8" }}>
                {who} ·{" "}
                <span title={formatDateTime(entry.timestamp)}>
                  {relTime(entry.timestamp)}
                </span>{" "}
                · {formatDateTime(entry.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}