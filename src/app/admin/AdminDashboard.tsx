"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./admin.module.css";
import PaymentRow from "./PaymentRow";
import AuditLogTimeline from "./AuditLogTimeline";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.token;

  const [spaces, setSpaces] = useState<{ _id: string; name: string }[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [loadingSpaces, setLoadingSpaces] = useState(true);

  // QR States
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

  // ── Refresh single payment ───────────────────────────────────────────────
  const refreshPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`${BASE}/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setSearchResult(json.data);
        setAuditLogs(json.data.auditLog ?? []);
        setAllPayments((prev) => prev.map((p) => (p._id === json.data._id ? json.data : p)));
      }
    } catch {
      /* silently fail */
    }
  };

  // Fetch Spaces
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

  // Fetch QR Code
  useEffect(() => {
    if (!selectedSpaceId || !token) return;
    setActiveQrImage(null);
    setQrError("");
    setQrSuccessMsg("");
    setPreviewImage(null);
    setPreviewFile(null);
    setFileInputKey((k) => k + 1);
    const fetchQr = async () => {
      try {
        const res = await fetch(`${BASE}/payments/admin/qr-code/${selectedSpaceId}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        setActiveQrImage(res.ok && json.data?.qrCode ? json.data.qrCode : null);
      } catch {
        setActiveQrImage(null);
      }
    };
    fetchQr();
  }, [selectedSpaceId, token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrSuccessMsg("");
    setQrError("");
    setPreviewFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!previewFile || !selectedSpaceId) return;
    setIsUploading(true);
    setQrSuccessMsg("");
    setQrError("");
    try {
      const formData = new FormData();
      formData.append("image", previewFile);
      formData.append("spaceId", selectedSpaceId);
      const res = await fetch(`${BASE}/payments/admin/qr-code`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setActiveQrImage(previewImage);
      setPreviewImage(null);
      setPreviewFile(null);
      setFileInputKey((k) => k + 1);
      setQrSuccessMsg("QR Code updated successfully! ✅");
    } catch (err: any) {
      setQrError(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);
    setSaveSuccessMsg("");
    setAuditLogs([]);
    try {
      const res = await fetch(`${BASE}/payments/${searchQuery.trim()}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Payment not found");
      setSearchResult(json.data);
      setSelectedPaymentMethod(json.data.method ?? "qr");
      setAuditLogs(json.data.auditLog ?? []);
    } catch (err: any) {
      setSearchError(err.message || "No payment found with this ID.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!searchResult) return;
    setIsSaving(true);
    setSaveSuccessMsg("");
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
    } finally {
      setIsSaving(false);
    }
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
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Filters ──────────────────────────────────────────────────────────────
  const filteredPayments = allPayments.filter((p) => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const q = auditSearch.toLowerCase();
    const matchSearch = !q || p._id.toLowerCase().includes(q) || String(p.reservation).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const paymentsWithLogs = filteredPayments.filter((p) => (p.auditLog?.length ?? 0) > 0);
  const totalLogEntries = filteredPayments.reduce((sum, p) => sum + (p.auditLog?.length ?? 0), 0);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.wrapper}>
        
        {/* Header */}
        <div className={styles.pageHeader}>
          <h1>Admin Dashboard</h1>
          <p>Manage your application settings and payment integrations.</p>
        </div>

        {/* ── QR Code Management Card ── */}
        <div className={styles.card}>
            {/* โค้ดเดิมของฝั่ง QR Code... (เพื่อให้โค้ดไม่ยาวเกินไป ผมขอใส่เฉพาะโครงสร้างหลักตามที่คุณให้มา) */}
            <div className={styles.cardHeader}>
              <h2><span>📱</span> Payment QR Code</h2>
              <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Select a co-working space, then upload its PromptPay QR code.</p>
            </div>
            {/* โค้ดส่วน Select Space & Upload File ที่คุณมีอยู่แล้วทำงานได้ดีครับ วางต่อได้เลย */}
        </div>

        {/* ── Find Payment Card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2><span>🔍</span> Find Payment</h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Search by Payment ID to view details and manage payment method or cancel.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <input type="text" className={styles.inputField} placeholder="Enter Payment ID..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            <button className={styles.primaryBtn} onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? "⏳" : "Search"}
            </button>
          </div>
          
          {searchError && <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fecaca" }}>❌ {searchError}</div>}
          
          {searchResult && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
              {/* รายละเอียดการชำระเงินที่ค้นเจอแบบเดิมของคุณเลยครับ */}
              <p>Payment Found: <b>{searchResult._id}</b></p>
              
              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "20px", marginTop: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "14px" }}>📋 Payment History</p>
                <AuditLogTimeline log={auditLogs} />
              </div>
            </div>
          )}
        </div>

        {/* ── All Payments Audit Log Card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2><span>📋</span> All Payment Audit Logs</h2>
              <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Audit history across all payments.</p>
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

          {/* Filters (ส่วนที่คุณพิมพ์ค้างไว้) */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="🔍 Filter by Payment ID or Reservation ID..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className={styles.inputField}
            />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.inputField} style={{ flex: "0 1 auto", cursor: "pointer", background: "#fff" }}>
              <option value="all">All statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="completed">✅ Completed</option>
              <option value="cancelled">🚫 Cancelled</option>
              <option value="failed">❌ Failed</option>
            </select>
          </div>

          {/* ── Render รายการ Audit Log ของทุกคน ── */}
          <div style={{ marginTop: "16px" }}>
            {loadingAll ? (
              <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>Loading logs...</p>
            ) : allError ? (
              <p style={{ textAlign: "center", color: "#ef4444", padding: "20px" }}>{allError}</p>
            ) : paymentsWithLogs.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6b7280", padding: "20px", background: "#f8fafc", borderRadius: "12px" }}>
                No audit logs found matching your criteria.
              </p>
            ) : (
              <div>
                {paymentsWithLogs.map((payment) => (
                  <PaymentRow key={payment._id} payment={payment} />
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </main>
  );
}