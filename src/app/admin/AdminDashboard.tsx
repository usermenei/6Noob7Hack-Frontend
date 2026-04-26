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
  
  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // All payments audit log
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [allError, setAllError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [auditSearch, setAuditSearch] = useState("");

  // ── Custom Confirm Modal State ──
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmColor: "#3b82f6",
    onConfirm: () => {},
  });

  const closeConfirmModal = () => setConfirmModal((prev) => ({ ...prev, isOpen: false }));

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

  // ── Modified Actions (No more window.confirm) ──
  const handleSaveChanges = async () => {
    if (!searchResult) return;
    setIsSaving(true);
    setSaveSuccessMsg("");

    try {
      const res = await fetch(
        `${BASE}/payments/admin/${searchResult._id}/method`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ method: selectedPaymentMethod }),
        }
      );

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

  const handleConfirmPayment = async () => {
    if (!searchResult) return;
    setIsConfirming(true);
    setSaveSuccessMsg("");

    try {
      const res = await fetch(`${BASE}/payments/${searchResult._id}/confirm`, { 
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Confirm failed");

      setSaveSuccessMsg("Payment confirmed successfully! ✅");
      await refreshPayment(searchResult._id);
    } catch (err: any) {
      setSaveSuccessMsg("❌ " + (err.message || "Confirm failed"));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!searchResult) return;
    setIsCancelling(true);
    setSaveSuccessMsg("");

    try {
      const res = await fetch(
        `${BASE}/payments/admin/${searchResult._id}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Cancel failed");

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
    <>
      <main className={styles.mainContainer}>
        <div className={styles.wrapper}>
          
          {/* Header */}
          <div className={styles.pageHeader}>
            <h1>Admin Dashboard</h1>
            <p style={{ color: "#6b7280" }}>Manage your application settings and payment integrations.</p>
          </div>

          {/* ── QR Code Management Card ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2><span>📱</span> Payment QR Code</h2>
              <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                Select a co-working space, then upload its PromptPay QR code.
              </p>
            </div>
            
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <select
                value={selectedSpaceId}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className={styles.inputField}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", maxWidth: "400px" }}
              >
                {spaces.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                {activeQrImage ? (
                  <div style={{ textAlign: "center", background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Current QR Code</p>
                    <img src={activeQrImage} width={150} alt="Active QR" style={{ borderRadius: "8px" }} />
                  </div>
                ) : (
                  <div style={{ textAlign: "center", background: "#fff", padding: "12px", borderRadius: "8px", border: "1px dashed #cbd5e1", width: "174px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ fontSize: "12px", color: "#94a3b8" }}>No QR Code Set</p>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, minWidth: "250px" }}>
                  <input
                    key={fileInputKey}
                    type="file"
                    onChange={handleFileChange}
                    style={{ padding: "8px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "#fff" }}
                  />
                  
                  {previewImage && (
                    <div style={{ textAlign: "center", background: "#fff", padding: "12px", borderRadius: "8px", border: "2px dashed #3b82f6", width: "fit-content" }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#3b82f6", marginBottom: "8px" }}>New Preview</p>
                      <img src={previewImage} width={100} alt="Preview QR" style={{ borderRadius: "8px" }} />
                    </div>
                  )}

                  <button 
                    onClick={handleUpload} 
                    disabled={isUploading || !previewFile}
                    style={{ 
                      padding: "10px", 
                      background: (isUploading || !previewFile) ? "#cbd5e1" : "#3b82f6", 
                      color: "#fff", 
                      border: "none", 
                      borderRadius: "8px", 
                      cursor: (isUploading || !previewFile) ? "not-allowed" : "pointer", 
                      fontWeight: 600,
                      maxWidth: "200px"
                    }}
                  >
                    {isUploading ? "Uploading... ⏳" : "Upload QR Code 📤"}
                  </button>

                  {qrSuccessMsg && <p style={{ color: "#16a34a", fontSize: "14px", margin: 0, fontWeight: 500 }}>{qrSuccessMsg}</p>}
                  {qrError && <p style={{ color: "#dc2626", fontSize: "14px", margin: 0, fontWeight: 500 }}>❌ {qrError}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Find Payment Card ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2><span>🔍</span> Find Payment</h2>
              <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                Search by Payment ID to manage methods, confirm, or cancel transactions.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <input 
                type="text" 
                className={styles.inputField} 
                placeholder="Enter Payment ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} 
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", flex: 1, maxWidth: "400px" }}
              />
              <button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                style={{ padding: "10px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", cursor: (isSearching || !searchQuery.trim()) ? "not-allowed" : "pointer", fontWeight: 600 }}
              >
                {isSearching ? "Searching... ⏳" : "Search"}
              </button>
            </div>
            
            {searchError && (
              <div style={{ marginTop: "16px", padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fecaca" }}>
                ❌ {searchError}
              </div>
            )}
            
            {searchResult && (
              <div style={{ marginTop: "24px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <p style={{ fontSize: "16px", color: "#0f172a", margin: 0 }}>
                    Payment ID: <b style={{ fontFamily: "monospace", background: "#e2e8f0", padding: "4px 8px", borderRadius: "4px" }}>{searchResult._id}</b>
                  </p>
                  <span style={{ 
                    padding: "4px 12px", 
                    borderRadius: "99px", 
                    fontSize: "12px", 
                    fontWeight: 700, 
                    textTransform: "uppercase",
                    background: searchResult.status === "success" ? "#dcfce7" : searchResult.status === "cancelled" ? "#fee2e2" : "#f1f5f9",
                    color: searchResult.status === "success" ? "#166534" : searchResult.status === "cancelled" ? "#991b1b" : "#475569"
                  }}>
                    {searchResult.status}
                  </span>
                </div>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginTop: "20px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Payment Method</label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                      style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", minWidth: "150px" }}
                    >
                      <option value="qr">QR Code</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      title: "Change Payment Method?",
                      message: `Are you sure you want to change the payment method to ${selectedPaymentMethod === "qr" ? "QR Code" : "Cash"}?`,
                      confirmText: "Update Method",
                      confirmColor: "#3b82f6",
                      onConfirm: () => { closeConfirmModal(); handleSaveChanges(); }
                    })} 
                    disabled={isSaving}
                    style={{ padding: "10px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontWeight: 600, height: "42px" }}
                  >
                    {isSaving ? "Saving..." : "Update Method 💾"}
                  </button>

                  <button 
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      title: "Confirm Payment?",
                      message: "Are you sure you want to manually confirm this payment? ✅",
                      confirmText: "Confirm Payment",
                      confirmColor: "#10b981",
                      onConfirm: () => { closeConfirmModal(); handleConfirmPayment(); }
                    })} 
                    disabled={isConfirming || searchResult.status === "success" || searchResult.status === "cancelled"}
                    style={{ 
                      padding: "10px 16px", 
                      background: "#10b981", 
                      color: "#fff", 
                      border: "none", 
                      borderRadius: "8px", 
                      cursor: (isConfirming || searchResult.status === "success" || searchResult.status === "cancelled") ? "not-allowed" : "pointer", 
                      fontWeight: 600, 
                      height: "42px",
                      opacity: (searchResult.status === "success" || searchResult.status === "cancelled") ? 0.6 : 1
                    }}
                  >
                    {isConfirming ? "Confirming..." : "Confirm Payment ✅"}
                  </button>

                  <button 
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      title: "Cancel Payment?",
                      message: "Cancel this payment? This cannot be undone. 🚫",
                      confirmText: "Yes, Cancel",
                      confirmColor: "#ef4444",
                      onConfirm: () => { closeConfirmModal(); handleCancelPayment(); }
                    })} 
                    disabled={isCancelling || searchResult.status === "cancelled"}
                    style={{ padding: "10px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: (isCancelling || searchResult.status === "cancelled") ? "not-allowed" : "pointer", fontWeight: 600, height: "42px", opacity: searchResult.status === "cancelled" ? 0.6 : 1 }}
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Payment 🚫"}
                  </button>
                </div>

                {saveSuccessMsg && (
                  <p style={{ marginTop: "16px", fontSize: "14px", fontWeight: 500, color: saveSuccessMsg.includes("❌") ? "#dc2626" : "#16a34a" }}>
                    {saveSuccessMsg}
                  </p>
                )}
                
                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "20px", marginTop: "20px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "14px" }}>📋 Payment History</p>
                  <AuditLogTimeline log={auditLogs} />
                </div>
              </div>
            )}
          </div>

          {/* ── All Payments Audit Log Card ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <div>
                <h2><span>📋</span> All Payment Audit Logs</h2>
                <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Audit history across all payments.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {totalLogEntries > 0 && (
                  <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#475569", padding: "4px 12px", borderRadius: "999px", border: "1px solid #e2e8f0", fontWeight: 600 }}>
                    {totalLogEntries} total {totalLogEntries === 1 ? "entry" : "entries"}
                  </span>
                )}
                <button 
                  onClick={fetchAllPayments} 
                  disabled={loadingAll}
                  style={{ fontSize: "13px", padding: "8px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: loadingAll ? "not-allowed" : "pointer", color: "#475569", fontWeight: 600 }}
                >
                  {loadingAll ? "⏳ Refreshing..." : "🔄 Refresh"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
              <input
                type="text"
                placeholder="🔍 Filter by ID..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className={styles.inputField}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", flex: 1, minWidth: "250px" }}
              />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.inputField} 
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", flex: "0 1 auto", background: "#fff", minWidth: "150px" }}
              >
                <option value="all">All statuses</option>
                <option value="pending">⏳ Pending</option>
                <option value="success">✅ Completed</option>
                <option value="cancelled">🚫 Cancelled</option>
                <option value="failed">❌ Failed</option>
              </select>
            </div>

            <div style={{ marginTop: "24px" }}>
              {loadingAll ? (
                <p style={{ textAlign: "center", color: "#6b7280", padding: "40px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>⏳ Loading logs...</p>
              ) : allError ? (
                <p style={{ textAlign: "center", color: "#ef4444", padding: "20px", background: "#fef2f2", borderRadius: "12px" }}>{allError}</p>
              ) : paymentsWithLogs.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6b7280", padding: "40px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                  No audit logs found matching your criteria.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {paymentsWithLogs.map((payment) => (
                    <PaymentRow key={payment._id} payment={payment} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Custom Confirm Modal ── */}
      {confirmModal.isOpen && (
        <div 
          onClick={closeConfirmModal}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff", padding: "24px", borderRadius: "16px", 
              width: "90%", maxWidth: "400px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", color: "#0f172a", fontSize: "18px", fontWeight: 700 }}>
              {confirmModal.title}
            </h3>
            <p style={{ margin: "0 0 24px 0", color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
              {confirmModal.message}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button 
                onClick={closeConfirmModal} 
                style={{ 
                  padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", 
                  background: "#ffffff", color: "#475569", fontWeight: 600, cursor: "pointer" 
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm} 
                style={{ 
                  padding: "10px 16px", borderRadius: "8px", border: "none", 
                  background: confirmModal.confirmColor, color: "#ffffff", fontWeight: 600, cursor: "pointer" 
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}