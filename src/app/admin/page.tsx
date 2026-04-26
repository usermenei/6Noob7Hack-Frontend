"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

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
      <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
        No audit history.
      </div>
    );
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
        let detail = null;
        if (entry.action === "method_change" && entry.oldMethod && entry.newMethod) {
          detail = (
            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "3px" }}>
              <code style={{ fontSize: "11px", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", color: "#334155" }}>{entry.oldMethod}</code>
              <span style={{ color: "#94a3b8", fontSize: "11px" }}>→</span>
              <code style={{ fontSize: "11px", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", color: "#334155" }}>{entry.newMethod}</code>
            </div>
          );
        } else if (entry.oldStatus && entry.newStatus && entry.oldStatus !== entry.newStatus) {
          detail = (
            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "3px" }}>
              <code style={{ fontSize: "11px", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", color: "#334155" }}>{entry.oldStatus}</code>
              <span style={{ color: "#94a3b8", fontSize: "11px" }}>→</span>
              <code style={{ fontSize: "11px", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", color: "#334155" }}>{entry.newStatus}</code>
            </div>
          );
        }
        return (
          <div key={entry._id ?? i} style={{ display: "flex", gap: "10px", paddingBottom: isLast ? 0 : "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: meta.dot, flexShrink: 0 }} />
              {!isLast && <div style={{ width: "1px", flex: 1, background: "#e2e8f0", marginTop: "3px" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{meta.label}</span>
                <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "999px", background: meta.badge.bg, color: meta.badge.color, border: `0.5px solid ${meta.badge.border}`, fontWeight: 500 }}>
                  {entry.action.replace("_", " ")}
                </span>
              </div>
              {detail}
              <div style={{ marginTop: "3px", fontSize: "10px", color: "#94a3b8" }}>
                {who} · <span title={formatDateTime(entry.timestamp)}>{relTime(entry.timestamp)}</span> · {formatDateTime(entry.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Single expandable payment row ─────────────────────────────────────────

function PaymentRow({ payment }: { payment: any }) {
  const [open, setOpen] = useState(false);

  const statusColors: Record<string, { bg: string; color: string }> = {
    pending:         { bg: "#fef3c7", color: "#b45309" },
    completed:       { bg: "#d1fae5", color: "#047857" },
    cancelled:       { bg: "#fee2e2", color: "#b91c1c" },
    failed:          { bg: "#fef3c7", color: "#b45309" },
    refund_required: { bg: "#ede9fe", color: "#6d28d9" },
  };
  const sc = statusColors[payment.status] ?? { bg: "#f1f5f9", color: "#475569" };
  const totalEntries = payment.auditLog?.length ?? 0;

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", background: "#fff" }}>
      {/* Row header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", userSelect: "none", flexWrap: "wrap" }}
      >
        {/* Expand indicator */}
        <span style={{ fontSize: "11px", color: "#94a3b8", width: "14px", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>

        {/* Payment ID */}
        <code style={{ fontSize: "11px", color: "#334155", background: "#f8fafc", padding: "2px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", flex: "1 1 160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {payment._id}
        </code>

        {/* Amount */}
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0891b2", minWidth: "70px" }}>
          ฿{Number(payment.amount).toLocaleString()}
        </span>

        {/* Method */}
        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: payment.method === "qr" ? "#eff6ff" : "#f0fdf4", color: payment.method === "qr" ? "#1d4ed8" : "#15803d", border: `1px solid ${payment.method === "qr" ? "#bfdbfe" : "#bbf7d0"}`, fontWeight: 500 }}>
          {payment.method === "qr" ? "📱 QR" : "💵 Cash"}
        </span>

        {/* Status */}
        <span style={{ fontSize: "11px", padding: "2px 10px", borderRadius: "999px", background: sc.bg, color: sc.color, fontWeight: 700 }}>
          {payment.status}
        </span>

        {/* Audit count badge */}
        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "999px", background: totalEntries > 0 ? "#f1f5f9" : "#fafafa", color: totalEntries > 0 ? "#475569" : "#cbd5e1", border: "1px solid #e2e8f0", fontWeight: 600, marginLeft: "auto" }}>
          {totalEntries} {totalEntries === 1 ? "log" : "logs"}
        </span>
      </div>

      {/* Expanded audit log */}
      {open && (
        <div style={{ borderTop: "1px dashed #e2e8f0", padding: "16px 18px 18px", background: "#f8fafc" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
            📋 Audit History
          </p>
          <AuditLogTimeline log={payment.auditLog ?? []} />
        </div>
      )}
    </div>
  );
}

// ── AdminDashboard ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.token;

  const [spaces, setSpaces] = useState<{ _id: string; name: string }[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [loadingSpaces, setLoadingSpaces] = useState(true);

  const [activeQrImage, setActiveQrImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [qrSuccessMsg, setQrSuccessMsg] = useState("");
  const [qrError, setQrError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  // Find payment (single)
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"qr" | "cash">("qr");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // All payments audit log
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [allError, setAllError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [auditSearch, setAuditSearch] = useState("");

  // ── Fetch all payments ───────────────────────────────────────────────────
  const fetchAllPayments = async () => {
    if (!token) return;
    setLoadingAll(true);
    setAllError("");
    try {
      const res = await fetch(`${BASE}/payments/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load payments");
      setAllPayments(json.data ?? []);
    } catch (err: any) {
      setAllError(err.message || "Failed to load payments.");
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllPayments();
  }, [token]);

  // ── Refresh single payment (for Find Payment card) ───────────────────────
  const refreshPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`${BASE}/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setSearchResult(json.data);
        setAuditLogs(json.data.auditLog ?? []);
        // also update the all-payments list in place
        setAllPayments(prev =>
          prev.map(p => p._id === json.data._id ? json.data : p)
        );
      }
    } catch { /* silently fail */ }
  };

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await fetch(`${BASE}/coworkingspaces`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : Array.isArray(json.data?.data) ? json.data.data : [];
        setSpaces(list);
        if (list.length > 0) setSelectedSpaceId(list[0]._id);
      } catch (err) {
        console.error("Failed to fetch coworking spaces", err);
      } finally {
        setLoadingSpaces(false);
      }
    };
    if (token) fetchSpaces();
  }, [token]);

  useEffect(() => {
    if (!selectedSpaceId || !token) return;
    setActiveQrImage(null); setQrError(""); setQrSuccessMsg("");
    setPreviewImage(null); setPreviewFile(null); setFileInputKey(k => k + 1);
    const fetchQr = async () => {
      try {
        const res = await fetch(`${BASE}/payments/admin/qr-code/${selectedSpaceId}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        setActiveQrImage(res.ok && json.data?.qrCode ? json.data.qrCode : null);
      } catch { setActiveQrImage(null); }
    };
    fetchQr();
  }, [selectedSpaceId, token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrSuccessMsg(""); setQrError(""); setPreviewFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!previewFile || !selectedSpaceId) return;
    setIsUploading(true); setQrSuccessMsg(""); setQrError("");
    try {
      const formData = new FormData();
      formData.append("image", previewFile);
      formData.append("spaceId", selectedSpaceId);
      const res = await fetch(`${BASE}/payments/admin/qr-code`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setActiveQrImage(previewImage); setPreviewImage(null); setPreviewFile(null);
      setFileInputKey(k => k + 1); setQrSuccessMsg("QR Code updated successfully! ✅");
    } catch (err: any) {
      setQrError(err.message || "Upload failed.");
    } finally { setIsUploading(false); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true); setSearchError(""); setSearchResult(null);
    setSaveSuccessMsg(""); setAuditLogs([]);
    try {
      const res = await fetch(`${BASE}/payments/${searchQuery.trim()}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Payment not found");
      setSearchResult(json.data);
      setSelectedPaymentMethod(json.data.method ?? "qr");
      setAuditLogs(json.data.auditLog ?? []);
    } catch (err: any) {
      setSearchError(err.message || "No payment found with this ID.");
    } finally { setIsSearching(false); }
  };

  const handleSaveChanges = async () => {
    if (!searchResult) return;
    setIsSaving(true); setSaveSuccessMsg("");
    try {
      const res = await fetch(`${BASE}/payments/${searchResult._id}/method`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ method: selectedPaymentMethod }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update");
      setSaveSuccessMsg("Payment method updated successfully! ✅");
      await refreshPayment(searchResult._id);
    } catch (err: any) {
      setSaveSuccessMsg("❌ " + (err.message || "Update failed"));
    } finally { setIsSaving(false); }
  };

  const handleCancelPayment = async () => {
    if (!searchResult) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`${BASE}/payments/${searchResult._id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Cancel failed");
      setIsCancelModalOpen(false);
      setSaveSuccessMsg("Payment cancelled successfully! 🚫");
      await refreshPayment(searchResult._id);
    } catch (err: any) {
      setSaveSuccessMsg("❌ " + (err.message || "Cancel failed"));
    } finally { setIsCancelling(false); }
  };

  // ── Filtered payments for the audit log section ──────────────────────────
  const filteredPayments = allPayments.filter(p => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const q = auditSearch.toLowerCase();
    const matchSearch = !q || p._id.toLowerCase().includes(q) || String(p.reservation).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── only payments that actually have audit entries ───────────────────────
  const paymentsWithLogs = filteredPayments.filter(p => (p.auditLog?.length ?? 0) > 0);
  const totalLogEntries = filteredPayments.reduce((sum, p) => sum + (p.auditLog?.length ?? 0), 0);

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", marginBottom: "8px" }}>Admin Dashboard</h1>
          <p style={{ color: "#6b7280", fontSize: "15px" }}>Manage your application settings and payment integrations.</p>
        </div>

        {/* ── QR Code Management Card ── */}
        <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>📱</span> Payment QR Code
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Select a co-working space, then upload its PromptPay QR code.</p>
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Select Co-Working Space</p>
            {loadingSpaces ? <p style={{ color: "#9ca3af", fontSize: "14px" }}>Loading spaces...</p> : (
              <select value={selectedSpaceId} onChange={(e) => { setSelectedSpaceId(e.target.value); setQrSuccessMsg(""); setQrError(""); }}
                style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "15px", fontWeight: 600, color: "#1e293b", background: "#fff", cursor: "pointer", outline: "none" }}>
                {spaces.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#0891b2", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Current Active QR</p>
              <div style={{ width: "200px", height: "200px", background: "#fff", borderRadius: "16px", padding: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.06)", border: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                {activeQrImage ? (
                  <>
                    <img src={activeQrImage} alt="Active QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    <div style={{ position: "absolute", top: "10px", right: "10px", background: "#10b981", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "12px" }}>ACTIVE</div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", color: "#9ca3af" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚫</div>
                    <p style={{ fontSize: "12px" }}>No QR uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "1px" }}>Upload New QR</p>
              {qrSuccessMsg && <div style={{ padding: "10px 14px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", fontWeight: 600 }}>{qrSuccessMsg}</div>}
              {qrError && <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px", fontWeight: 600 }}>❌ {qrError}</div>}
              <label htmlFor="qr-upload" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 16px", background: previewImage ? "#f8fafc" : "#e0e7ff", border: "2px dashed #818cf8", borderRadius: "16px", cursor: "pointer", textAlign: "center" }}>
                {previewImage ? <img src={previewImage} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "contain", marginBottom: "10px", opacity: isUploading ? 0.5 : 1 }} /> : <div style={{ fontSize: "36px", marginBottom: "8px", color: "#4f46e5" }}>📥</div>}
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#4338ca" }}>{previewImage ? "Click to change file" : "Click to select QR image"}</span>
                <span style={{ fontSize: "12px", color: "#6366f1", marginTop: "4px" }}>PNG, JPG, WEBP (Max 5MB)</span>
                <input key={fileInputKey} id="qr-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: "none" }} disabled={isUploading} />
              </label>
              <button onClick={handleUpload} disabled={!previewFile || isUploading || !selectedSpaceId}
                style={{ width: "100%", padding: "15px", background: previewFile ? "linear-gradient(135deg,#4f46e5 0%,#3b82f6 100%)" : "#e5e7eb", color: previewFile ? "#fff" : "#9ca3af", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 800, cursor: previewFile && !isUploading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {isUploading ? "⏳ Uploading..." : "🚀 Set as Active QR"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Find Payment Card ── */}
        <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "24px", marginTop: "30px" }}>
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>🔍</span> Find Payment
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Search by Payment ID to view details and manage payment method or cancel.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <input type="text" placeholder="Enter Payment ID..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", border: "1px solid #d1d5db", fontSize: "15px", outline: "none" }} />
            <button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}
              style={{ padding: "14px 24px", background: "#1f2937", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 800, cursor: isSearching || !searchQuery.trim() ? "not-allowed" : "pointer", opacity: isSearching || !searchQuery.trim() ? 0.7 : 1 }}>
              {isSearching ? "⏳" : "Search"}
            </button>
          </div>
          {searchError && <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px" }}>❌ {searchError}</div>}
          {searchResult && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Payment ID</p>
                  <p style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", wordBreak: "break-all" }}>{searchResult._id}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Amount</p>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "#0891b2" }}>฿{Number(searchResult.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Status</p>
                  <span style={{ padding: "5px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: 800, background: searchResult.status === "pending" ? "#fef3c7" : searchResult.status === "completed" ? "#d1fae5" : "#fee2e2", color: searchResult.status === "pending" ? "#b45309" : searchResult.status === "completed" ? "#047857" : "#b91c1c" }}>
                    {searchResult.status}
                  </span>
                </div>
              </div>
              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "12px" }}>Edit Payment Method</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <select value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value as "qr" | "cash")}
                    disabled={searchResult.status === "cancelled" || searchResult.status === "completed"}
                    style={{ flex: "1 1 180px", padding: "12px", borderRadius: "10px", border: "2px solid #cbd5e1", fontSize: "15px", fontWeight: 600, color: "#1e293b", background: "#fff", cursor: "pointer", outline: "none" }}>
                    <option value="qr">📱 PromptPay QR</option>
                    <option value="cash">💵 Cash at Counter</option>
                  </select>
                  <button onClick={handleSaveChanges} disabled={isSaving || selectedPaymentMethod === searchResult.method || searchResult.status !== "pending"}
                    style={{ flex: "1 1 130px", padding: "12px 20px", background: (selectedPaymentMethod !== searchResult.method && searchResult.status === "pending") ? "#10b981" : "#e2e8f0", color: (selectedPaymentMethod !== searchResult.method && searchResult.status === "pending") ? "#fff" : "#94a3b8", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 800, cursor: isSaving ? "not-allowed" : "pointer" }}>
                    {isSaving ? "⏳ Saving..." : "Save Changes"}
                  </button>
                </div>
                <button onClick={() => setIsCancelModalOpen(true)} disabled={searchResult.status === "cancelled"}
                  style={{ width: "100%", marginTop: "14px", padding: "13px", background: "#fff", color: searchResult.status === "cancelled" ? "#fca5a5" : "#ef4444", border: `2px solid ${searchResult.status === "cancelled" ? "#fecaca" : "#ef4444"}`, borderRadius: "10px", fontSize: "15px", fontWeight: 800, cursor: searchResult.status === "cancelled" ? "not-allowed" : "pointer" }}>
                  🚫 Cancel Payment
                </button>
              </div>
              {saveSuccessMsg && (
                <div style={{ padding: "10px 14px", background: saveSuccessMsg.startsWith("❌") ? "#fef2f2" : "#f0fdf4", color: saveSuccessMsg.startsWith("❌") ? "#b91c1c" : "#166534", borderRadius: "8px", border: `1px solid ${saveSuccessMsg.startsWith("❌") ? "#fecaca" : "#bbf7d0"}`, fontSize: "14px", fontWeight: 600 }}>
                  {saveSuccessMsg}
                </div>
              )}
              {/* Inline audit log for searched payment */}
              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>📋 Payment History</p>
                  {auditLogs.length > 0 && (
                    <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "999px", border: "1px solid #e2e8f0", fontWeight: 600 }}>
                      {auditLogs.length} {auditLogs.length === 1 ? "entry" : "entries"}
                    </span>
                  )}
                </div>
                <AuditLogTimeline log={auditLogs} />
              </div>
            </div>
          )}
        </div>

        {/* ── All Payments Audit Log Card ── */}
        <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "20px", marginTop: "30px" }}>

          {/* Card header */}
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>📋</span> All Payment Audit Logs
              </h2>
              <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                Audit history across all payments.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {totalLogEntries > 0 && (
                <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: "999px", border: "1px solid #e2e8f0", fontWeight: 600 }}>
                  {totalLogEntries} total {totalLogEntries === 1 ? "entry" : "entries"}
                </span>
              )}
              <button onClick={fetchAllPayments} disabled={loadingAll}
                style={{ fontSize: "12px", padding: "5px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: loadingAll ? "not-allowed" : "pointer", color: "#475569", fontWeight: 600 }}>
                {loadingAll ? "⏳" : "🔄 Refresh"}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="🔍 Filter by Payment ID or Reservation ID..."
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
              style={{ flex: "1 1 220px", padding: "10px 14px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none" }}
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", background: "#fff", cursor: "pointer" }}>
              <option value="all">All statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="completed">✅ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
              <option value="failed">⚠️ Failed</option>
              <option value="refund_required">💜 Refund required</option>
            </select>
          </div>

          {/* Body */}
          {loadingAll ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>⏳ Loading payments...</div>
          ) : allError ? (
            <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px" }}>❌ {allError}</div>
          ) : filteredPayments.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
              <p style={{ fontSize: "14px" }}>No payments found.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Show payments with logs first, then without */}
              {paymentsWithLogs.map(payment => (
  <PaymentRow key={payment._id} payment={payment} />
))}
            </div>
          )}
        </div>

      </div>

      {/* Cancel Modal */}
      {isCancelModalOpen && searchResult && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "90%", maxWidth: "420px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "14px" }}>⚠️</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", textAlign: "center", marginBottom: "10px" }}>Cancel Payment?</h3>
            <p style={{ color: "#4b5563", fontSize: "14px", textAlign: "center", marginBottom: "24px", lineHeight: 1.6 }}>
              Cancel payment <strong>{searchResult._id}</strong>?<br />
              <span style={{ color: "#ef4444", fontWeight: 600 }}>This cannot be undone.</span>
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setIsCancelModalOpen(false)} disabled={isCancelling} style={{ flex: 1, padding: "12px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>No, Keep it</button>
              <button onClick={handleCancelPayment} disabled={isCancelling} style={{ flex: 1, padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: isCancelling ? "not-allowed" : "pointer", opacity: isCancelling ? 0.7 : 1 }}>
                {isCancelling ? "⏳ Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}