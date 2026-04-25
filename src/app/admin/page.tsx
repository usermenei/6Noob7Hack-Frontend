"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export interface AuditLogEntry {
  id: string;
  adminName: string;
  reservationId: string;
  paymentId: string;
  changeType: "method" | "status";
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.token;

  // Coworking spaces
  const [spaces, setSpaces] = useState<{ _id: string; name: string }[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [loadingSpaces, setLoadingSpaces] = useState(true);

  // QR state
  const [activeQrImage, setActiveQrImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [qrSuccessMsg, setQrSuccessMsg] = useState("");
  const [qrError, setQrError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0); // ✅ forces input reset

  // Reservation search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"qr" | "cash">("qr");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch coworking spaces on mount
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await fetch(`${BASE}/coworkingspaces`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
          ? json.data.data
          : [];
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

  // Fetch active QR when space changes
  useEffect(() => {
    if (!selectedSpaceId || !token) return;
    setActiveQrImage(null);
    setQrError("");
    setQrSuccessMsg("");
    setPreviewImage(null);   // ✅ clear preview when switching space
    setPreviewFile(null);
    setFileInputKey((k) => k + 1); // ✅ reset file input

    const fetchQr = async () => {
      try {
        const res = await fetch(`${BASE}/payments/admin/qr-code/${selectedSpaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok && json.data?.qrCode) {
          setActiveQrImage(json.data.qrCode);
        } else {
          setActiveQrImage(null);
        }
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

      const res = await fetch(`${BASE}/payments/admin/qr-code`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");

      setActiveQrImage(previewImage);
      setPreviewImage(null);
      setPreviewFile(null);
      setFileInputKey((k) => k + 1); // ✅ reset input so same file can be re-selected
      setQrSuccessMsg("QR Code updated successfully! ✅");
    } catch (err: any) {
      setQrError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Real search by payment ID
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);
    setSaveSuccessMsg("");

    try {
      const res = await fetch(`${BASE}/payments/${searchQuery.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Payment not found");

      setSearchResult(json.data);
      setSelectedPaymentMethod(json.data.method);
    } catch (err: any) {
      setSearchError(err.message || "No payment found with this ID.");
    } finally {
      setIsSearching(false);
    }
  };

  // Real update payment method
  const handleSaveChanges = async () => {
    if (!searchResult) return;
    setIsSaving(true);
    setSaveSuccessMsg("");

    try {
      const res = await fetch(`${BASE}/payments/${searchResult._id}/method`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method: selectedPaymentMethod }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update");

      const newLog: AuditLogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        adminName: (session?.user as any)?.name || "Admin",
        reservationId: searchResult.reservation?._id || "N/A",
        paymentId: searchResult._id,
        changeType: "method",
        oldValue: searchResult.method,
        newValue: selectedPaymentMethod,
        timestamp: new Date().toLocaleString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);
      setSearchResult((prev: any) => ({ ...prev, method: selectedPaymentMethod }));
      setSaveSuccessMsg("Payment method updated successfully! ✅");
    } catch (err: any) {
      setSaveSuccessMsg("❌ " + (err.message || "Update failed"));
    } finally {
      setIsSaving(false);
    }
  };

  // Real cancel payment
  const handleCancelPayment = async () => {
    if (!searchResult) return;
    setIsCancelling(true);

    try {
      const res = await fetch(`${BASE}/payments/${searchResult._id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Cancel failed");

      const newLog: AuditLogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        adminName: (session?.user as any)?.name || "Admin",
        reservationId: searchResult.reservation?._id || "N/A",
        paymentId: searchResult._id,
        changeType: "status",
        oldValue: searchResult.status,
        newValue: "cancelled",
        timestamp: new Date().toLocaleString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);
      setSearchResult((prev: any) => ({ ...prev, status: "cancelled" }));
      setIsCancelModalOpen(false);
      setSaveSuccessMsg("Payment cancelled successfully! 🚫");
    } catch (err: any) {
      setSaveSuccessMsg("❌ " + (err.message || "Cancel failed"));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", marginBottom: "8px" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px" }}>
            Manage your application settings and payment integrations.
          </p>
        </div>

        {/* QR Code Management Card */}
        <div style={{
          background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)",
          borderRadius: "24px", padding: "32px",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          display: "flex", flexDirection: "column", gap: "24px",
        }}>
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>📱</span> Payment QR Code
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Select a co-working space, then upload its PromptPay QR code.
            </p>
          </div>

          {/* Coworking Space Dropdown */}
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Select Co-Working Space
            </p>
            {loadingSpaces ? (
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>Loading spaces...</p>
            ) : (
              <select
                value={selectedSpaceId}
                onChange={(e) => {
                  setSelectedSpaceId(e.target.value);
                  setQrSuccessMsg("");
                  setQrError("");
                }}
                style={{
                  width: "100%", padding: "14px 16px",
                  borderRadius: "12px", border: "2px solid #e2e8f0",
                  fontSize: "15px", fontWeight: 600, color: "#1e293b",
                  background: "#fff", cursor: "pointer", outline: "none",
                }}
              >
                {spaces.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
            {/* Active QR Display */}
            <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#0891b2", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Current Active QR
              </p>
              <div style={{
                width: "200px", height: "200px", background: "#fff",
                borderRadius: "16px", padding: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                border: "2px solid #e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                {activeQrImage ? (
                  <img src={activeQrImage} alt="Active QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <div style={{ textAlign: "center", color: "#9ca3af" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚫</div>
                    <p style={{ fontSize: "12px" }}>No QR uploaded yet</p>
                  </div>
                )}
                {activeQrImage && (
                  <div style={{
                    position: "absolute", top: "10px", right: "10px",
                    background: "#10b981", color: "#fff",
                    fontSize: "10px", fontWeight: 800,
                    padding: "3px 8px", borderRadius: "12px",
                  }}>
                    ACTIVE
                  </div>
                )}
              </div>
            </div>

            {/* Upload Section */}
            <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "1px" }}>
                Upload New QR
              </p>

              {qrSuccessMsg && (
                <div style={{ padding: "10px 14px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", fontWeight: 600 }}>
                  {qrSuccessMsg}
                </div>
              )}
              {qrError && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px", fontWeight: 600 }}>
                  ❌ {qrError}
                </div>
              )}

              <label htmlFor="qr-upload" style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "28px 16px",
                background: previewImage ? "#f8fafc" : "#e0e7ff",
                border: "2px dashed #818cf8", borderRadius: "16px",
                cursor: "pointer", textAlign: "center",
              }}>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "contain", marginBottom: "10px", opacity: isUploading ? 0.5 : 1 }} />
                ) : (
                  <div style={{ fontSize: "36px", marginBottom: "8px", color: "#4f46e5" }}>📥</div>
                )}
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#4338ca" }}>
                  {previewImage ? "Click to change file" : "Click to select QR image"}
                </span>
                <span style={{ fontSize: "12px", color: "#6366f1", marginTop: "4px" }}>
                  PNG, JPG, WEBP (Max 5MB)
                </span>
                {/* ✅ key prop forces the input to remount, clearing its value */}
                <input
                  key={fileInputKey}
                  id="qr-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  disabled={isUploading}
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={!previewFile || isUploading || !selectedSpaceId}
                style={{
                  width: "100%", padding: "15px",
                  background: previewFile ? "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)" : "#e5e7eb",
                  color: previewFile ? "#fff" : "#9ca3af",
                  border: "none", borderRadius: "12px",
                  fontSize: "15px", fontWeight: 800,
                  cursor: previewFile && !isUploading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {isUploading ? "⏳ Uploading..." : "🚀 Set as Active QR"}
              </button>
            </div>
          </div>
        </div>

        {/* Reservation Management */}
        <div style={{
          background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)",
          borderRadius: "24px", padding: "32px",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          display: "flex", flexDirection: "column", gap: "24px", marginTop: "30px",
        }}>
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>🔍</span> Find Payment
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Search by Payment ID to view details and manage payment method or cancel.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="Enter Payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1, padding: "14px 16px", borderRadius: "12px",
                border: "1px solid #d1d5db", fontSize: "15px", outline: "none",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              style={{
                padding: "14px 24px", background: "#1f2937", color: "#fff",
                border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 800,
                cursor: isSearching || !searchQuery.trim() ? "not-allowed" : "pointer",
                opacity: isSearching || !searchQuery.trim() ? 0.7 : 1,
              }}
            >
              {isSearching ? "⏳" : "Search"}
            </button>
          </div>

          {searchError && (
            <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px" }}>
              ❌ {searchError}
            </div>
          )}

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
                  <span style={{
                    padding: "5px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: 800,
                    background: searchResult.status === "pending" ? "#fef3c7" : searchResult.status === "completed" ? "#d1fae5" : "#fee2e2",
                    color: searchResult.status === "pending" ? "#b45309" : searchResult.status === "completed" ? "#047857" : "#b91c1c",
                  }}>
                    {searchResult.status}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "12px" }}>Edit Payment Method</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as "qr" | "cash")}
                    disabled={searchResult.status === "cancelled" || searchResult.status === "completed"}
                    style={{
                      flex: "1 1 180px", padding: "12px", borderRadius: "10px",
                      border: "2px solid #cbd5e1", fontSize: "15px", fontWeight: 600,
                      color: "#1e293b", background: "#fff", cursor: "pointer", outline: "none",
                    }}
                  >
                    <option value="qr">📱 PromptPay QR</option>
                    <option value="cash">💵 Cash at Counter</option>
                  </select>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving || selectedPaymentMethod === searchResult.method || searchResult.status !== "pending"}
                    style={{
                      flex: "1 1 130px", padding: "12px 20px",
                      background: (selectedPaymentMethod !== searchResult.method && searchResult.status === "pending") ? "#10b981" : "#e2e8f0",
                      color: (selectedPaymentMethod !== searchResult.method && searchResult.status === "pending") ? "#fff" : "#94a3b8",
                      border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 800,
                      cursor: isSaving ? "not-allowed" : "pointer",
                    }}
                  >
                    {isSaving ? "⏳ Saving..." : "Save Changes"}
                  </button>
                </div>
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={searchResult.status === "cancelled"}
                  style={{
                    width: "100%", marginTop: "14px", padding: "13px",
                    background: "#fff", color: searchResult.status === "cancelled" ? "#fca5a5" : "#ef4444",
                    border: `2px solid ${searchResult.status === "cancelled" ? "#fecaca" : "#ef4444"}`,
                    borderRadius: "10px", fontSize: "15px", fontWeight: 800,
                    cursor: searchResult.status === "cancelled" ? "not-allowed" : "pointer",
                  }}
                >
                  🚫 Cancel Payment
                </button>
              </div>

              {saveSuccessMsg && (
                <div style={{ padding: "10px 14px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", fontWeight: 600 }}>
                  {saveSuccessMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audit Logs */}
        <div style={{
          background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)",
          borderRadius: "24px", padding: "32px",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          display: "flex", flexDirection: "column", gap: "24px", marginTop: "30px",
        }}>
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>📋</span> Payment Audit Logs
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Record of all payment changes made this session.
            </p>
          </div>

          {auditLogs.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    {["Date & Time", "Admin", "Payment ID", "Change"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#334155" }}>{log.timestamp}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "3px 10px", background: "#e0e7ff", color: "#4338ca", borderRadius: "10px", fontSize: "12px", fontWeight: 700 }}>
                          🧑‍💼 {log.adminName}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#0f172a", fontWeight: 600, wordBreak: "break-all", maxWidth: "160px" }}>{log.paymentId}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "5px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}>
                          <span style={{ fontWeight: 600 }}>{log.oldValue}</span>
                          <span style={{ color: "#94a3b8" }}>→</span>
                          <span style={{ fontWeight: 700, color: log.newValue === "cancelled" ? "#ef4444" : "#10b981" }}>{log.newValue}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
              <p style={{ fontSize: "14px" }}>No changes recorded yet.</p>
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
              <button onClick={() => setIsCancelModalOpen(false)} disabled={isCancelling} style={{ flex: 1, padding: "12px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
                No, Keep it
              </button>
              <button onClick={handleCancelPayment} disabled={isCancelling} style={{ flex: 1, padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: isCancelling ? "not-allowed" : "pointer", opacity: isCancelling ? 0.7 : 1 }}>
                {isCancelling ? "⏳ Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}