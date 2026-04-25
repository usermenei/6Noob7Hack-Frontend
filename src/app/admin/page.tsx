"use client";

import { useState } from "react";

// Mock Data Type
interface MockReservation {
  id: string;
  paymentId: string;
  userName: string;
  amount: number;
  paymentMethod: "qr" | "cash";
  paymentStatus: "Pending" | "Completed" | "Cancelled";
  reservationStatus: "Active" | "Cancelled";
}

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
  // Using a mock placeholder for the current active QR code.
  const [activeQrImage, setActiveQrImage] = useState<string | null>(
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MockPaymentInfo"
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Reservation Management State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<MockReservation | null>(null);
  const [searchError, setSearchError] = useState("");
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"qr" | "cash">("qr");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Cancellation State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSuccessMsg("");
      // Create a local URL for preview
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleUpload = () => {
    if (!previewImage) return;
    setIsUploading(true);
    setSuccessMsg("");

    // Simulate an upload delay
    setTimeout(() => {
      setActiveQrImage(previewImage);
      setPreviewImage(null);
      setIsUploading(false);
      setSuccessMsg("QR Code updated successfully! ✅");
    }, 1500);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);
    setSaveSuccessMsg("");

    // Simulate search delay and mock result
    setTimeout(() => {
      setIsSearching(false);
      if (searchQuery.toLowerCase() === "notfound") {
        setSearchError("No reservation found matching this ID or User.");
      } else {
        const mockData: MockReservation = {
          id: searchQuery.toUpperCase(),
          paymentId: "PAY-" + Math.floor(Math.random() * 10000 + 1000),
          userName: "John Doe",
          amount: 1500,
          paymentMethod: "qr",
          paymentStatus: "Pending",
          reservationStatus: "Active"
        };
        setSearchResult(mockData);
        setSelectedPaymentMethod(mockData.paymentMethod);
      }
    }, 1000);
  };

  const handleSaveChanges = () => {
    if (!searchResult) return;
    setIsSaving(true);
    setSaveSuccessMsg("");

    // Simulate saving delay
    setTimeout(() => {
      setIsSaving(false);
      
      const newLog: AuditLogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        adminName: "SuperAdmin",
        reservationId: searchResult.id,
        paymentId: searchResult.paymentId,
        changeType: "method",
        oldValue: searchResult.paymentMethod,
        newValue: selectedPaymentMethod,
        timestamp: new Date().toLocaleString()
      };
      setAuditLogs(prev => [newLog, ...prev]);
      
      setSearchResult(prev => prev ? { ...prev, paymentMethod: selectedPaymentMethod } : null);
      setSaveSuccessMsg("Payment method updated successfully! ✅");
    }, 1000);
  };

  const handleCancelPayment = () => {
    if (!searchResult) return;
    setIsCancelling(true);

    setTimeout(() => {
      setIsCancelling(false);
      
      const newLog: AuditLogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        adminName: "SuperAdmin",
        reservationId: searchResult.id,
        paymentId: searchResult.paymentId,
        changeType: "status",
        oldValue: searchResult.paymentStatus,
        newValue: "Cancelled",
        timestamp: new Date().toLocaleString()
      };
      
      setAuditLogs(prev => [newLog, ...prev]);
      setSearchResult(prev => prev ? { ...prev, paymentStatus: "Cancelled", reservationStatus: "Cancelled" } : null);
      setIsCancelModalOpen(false);
      setSaveSuccessMsg("Payment and Reservation cancelled successfully! 🚫");
    }, 1000);
  };

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", marginBottom: "8px" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px" }}>
            Manage your application settings and payment integrations.
          </p>
        </div>

        {/* QR Code Management Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: "24px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>📱</span> Payment QR Code
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Upload a new PromptPay QR code for users to scan during checkout.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
            {/* Active QR Code Display */}
            <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#0891b2", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Current Active QR
              </p>
              <div
                style={{
                  width: "240px",
                  height: "240px",
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "16px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                  border: "2px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {activeQrImage ? (
                  <img src={activeQrImage} alt="Active QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <p style={{ color: "#9ca3af", fontSize: "14px", textAlign: "center" }}>No QR Code uploaded</p>
                )}
                <div style={{ position: "absolute", top: "12px", right: "12px", background: "#10b981", color: "#fff", fontSize: "11px", fontWeight: 800, padding: "4px 8px", borderRadius: "12px", letterSpacing: "0.5px" }}>
                  ACTIVE
                </div>
              </div>
            </div>

            {/* Upload New QR Code Section */}
            <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "1px" }}>
                Upload New QR
              </p>

              {successMsg && (
                <div style={{ padding: "12px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", fontWeight: 600 }}>
                  {successMsg}
                </div>
              )}

              <label
                htmlFor="qr-upload"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "32px 16px",
                  background: previewImage ? "#f8fafc" : "#e0e7ff",
                  border: "2px dashed #818cf8",
                  borderRadius: "16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {previewImage ? (
                  <img src={previewImage} alt="Preview" style={{ width: "120px", height: "120px", objectFit: "contain", marginBottom: "12px", opacity: isUploading ? 0.5 : 1 }} />
                ) : (
                  <div style={{ fontSize: "40px", marginBottom: "8px", color: "#4f46e5" }}>📥</div>
                )}

                <span style={{ fontSize: "14px", fontWeight: 600, color: "#4338ca", zIndex: 2 }}>
                  {previewImage ? "Click to change file" : "Click to select QR image"}
                </span>
                <span style={{ fontSize: "12px", color: "#6366f1", marginTop: "4px", zIndex: 2 }}>
                  PNG, JPG, JPEG (Max 2MB)
                </span>
                <input
                  id="qr-upload"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  disabled={isUploading}
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={!previewImage || isUploading}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: previewImage ? "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)" : "#e5e7eb",
                  color: previewImage ? "#fff" : "#9ca3af",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 800,
                  cursor: previewImage && !isUploading ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  boxShadow: previewImage ? "0 4px 12px rgba(79, 70, 229, 0.3)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {isUploading ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite" }}>🔄</span> Uploading...
                  </>
                ) : (
                  <>🚀 Set as Active QR</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* --- Reservation Management Section --- */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: "24px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            marginTop: "30px",
          }}
        >
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>🔍</span> Find Reservation
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Search by Reservation ID or User Name to view details and edit the payment method.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="Enter Reservation ID or User Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              style={{
                padding: "16px 24px",
                background: "#1f2937",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: (isSearching || !searchQuery.trim()) ? "not-allowed" : "pointer",
                opacity: (isSearching || !searchQuery.trim()) ? 0.7 : 1,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {isSearching ? <span style={{ animation: "spin 1s linear infinite" }}>🔄</span> : "Search"}
            </button>
          </div>

          {searchError && (
            <div style={{ padding: "12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fecaca", fontSize: "14px", fontWeight: 600 }}>
              {searchError}
            </div>
          )}

          {searchResult && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.4s ease-out" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Payment ID</p>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{searchResult.paymentId}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>User Name</p>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{searchResult.userName}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Total Amount</p>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "#0891b2" }}>฿{searchResult.amount.toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Reservation</p>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: 800,
                      backgroundColor: searchResult.reservationStatus === "Active" ? "#dbeafe" : "#fee2e2",
                      color: searchResult.reservationStatus === "Active" ? "#1e40af" : "#b91c1c",
                      display: "inline-block"
                    }}>
                      {searchResult.reservationStatus}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Payment</p>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: 800,
                      backgroundColor: searchResult.paymentStatus === "Pending" ? "#fef3c7" : searchResult.paymentStatus === "Completed" ? "#d1fae5" : "#fee2e2",
                      color: searchResult.paymentStatus === "Pending" ? "#b45309" : searchResult.paymentStatus === "Completed" ? "#047857" : "#b91c1c",
                      display: "inline-block"
                    }}>
                      {searchResult.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "12px" }}>Edit Payment Method</p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as "qr" | "cash")}
                    style={{
                      flex: "1 1 200px",
                      padding: "14px",
                      borderRadius: "10px",
                      border: "2px solid #cbd5e1",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1e293b",
                      background: "#fff",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="qr">📱 PromptPay QR</option>
                    <option value="cash">💵 Cash at Counter</option>
                  </select>

                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving || selectedPaymentMethod === searchResult.paymentMethod || searchResult.paymentStatus === "Cancelled"}
                    style={{
                      flex: "1 1 150px",
                      padding: "14px 24px",
                      background: (selectedPaymentMethod === searchResult.paymentMethod || searchResult.paymentStatus === "Cancelled") ? "#e2e8f0" : "#10b981",
                      color: (selectedPaymentMethod === searchResult.paymentMethod || searchResult.paymentStatus === "Cancelled") ? "#94a3b8" : "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "16px",
                      fontWeight: 800,
                      cursor: (isSaving || selectedPaymentMethod === searchResult.paymentMethod || searchResult.paymentStatus === "Cancelled") ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    {isSaving ? <span style={{ animation: "spin 1s linear infinite" }}>🔄</span> : "Save Changes"}
                  </button>
                </div>
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={searchResult.paymentStatus === "Cancelled"}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: searchResult.paymentStatus === "Cancelled" ? "#fee2e2" : "#fff",
                    color: searchResult.paymentStatus === "Cancelled" ? "#fca5a5" : "#ef4444",
                    border: `2px solid ${searchResult.paymentStatus === "Cancelled" ? "#fecaca" : "#ef4444"}`,
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: 800,
                    cursor: searchResult.paymentStatus === "Cancelled" ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    marginTop: "16px"
                  }}
                >
                  🚫 Cancel Payment
                </button>
              </div>
              
              {saveSuccessMsg && (
                <div style={{ padding: "12px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "14px", fontWeight: 600, marginTop: "8px" }}>
                  {saveSuccessMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Audit Logs Section --- */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: "24px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            marginTop: "30px",
          }}
        >
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>📋</span> Payment Audit Logs
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Record of all payment method changes made by administrators.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            {auditLogs.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Date & Time</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Admin</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment ID</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #e2e8f0", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#334155", fontWeight: 500 }}>{log.timestamp}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#0f172a", fontWeight: 700 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "#e0e7ff", color: "#4338ca", borderRadius: "12px", fontSize: "12px" }}>
                          🧑‍💼 {log.adminName}
                        </span>
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#0f172a", fontWeight: 600 }}>{log.paymentId}</td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          {log.changeType === 'method' ? (
                            <>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: log.oldValue === 'qr' ? '#0891b2' : '#059669' }}>
                                {log.oldValue === 'qr' ? '📱 QR' : '💵 Cash'}
                              </span>
                              <span style={{ color: "#94a3b8" }}>→</span>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: log.newValue === 'qr' ? '#0891b2' : '#059669' }}>
                                {log.newValue === 'qr' ? '📱 QR' : '💵 Cash'}
                              </span>
                            </>
                          ) : (
                             <>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>
                                {log.oldValue}
                              </span>
                              <span style={{ color: "#94a3b8" }}>→</span>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444" }}>
                                {log.newValue}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
                <p style={{ fontSize: "15px", fontWeight: 500 }}>No changes have been recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Cancellation Modal */}
      {isCancelModalOpen && searchResult && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "90%", maxWidth: "450px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
            <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "16px" }}>⚠️</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1f2937", textAlign: "center", marginBottom: "12px" }}>Cancel Payment?</h3>
            <p style={{ color: "#4b5563", fontSize: "15px", textAlign: "center", marginBottom: "24px", lineHeight: 1.5 }}>
              Are you sure you want to cancel Payment ID <strong>{searchResult.paymentId}</strong> for {searchResult.userName}? <br/>
              <span style={{ color: "#ef4444", fontWeight: 600 }}>This action cannot be undone.</span>
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                style={{ flex: 1, padding: "12px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
              >
                No, Keep it
              </button>
              <button
                onClick={handleCancelPayment}
                disabled={isCancelling}
                style={{ flex: 1, padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: 700, cursor: isCancelling ? "not-allowed" : "pointer", opacity: isCancelling ? 0.7 : 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
              >
                {isCancelling ? <span style={{ animation: "spin 1s linear infinite" }}>🔄</span> : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
