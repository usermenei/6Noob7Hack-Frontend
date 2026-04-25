"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getReservations, { Reservation } from "@/libs/getReservations";
import confirmReservation from "@/libs/confirmReservation";
import updateReservationStatus from "@/libs/updateReservationStatus";
import Link from "next/link";
import styles from "./BookingList.module.css";
import ReservationCard from "./ReservationCard";
import EditModal from "./EditModal";
import CancelModal from "./CancelModal";
import PaymentView from "./PaymentView";

export default function BookingList() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [spaceSearchTerm, setSpaceSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  const [cancellingRes, setCancellingRes] = useState<Reservation | null>(null);
  const [payingRes, setPayingRes] = useState<Reservation | null>(null);

  const isAdmin = (session?.user as any)?.role === "admin";

  const BASE =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

  const fetchReservations = async () => {
    if (!session?.user?.token) {
      setLoading(false);
      return;
    }
    try {
      const json = await getReservations(session.user.token as string);
      setReservations(json.data);
    } catch {
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!session?.user?.token) return;

    const targetRes = reservations.find((r) => r._id === id);
    if (!targetRes) return;

    if (targetRes.status === "pending" && !isAdmin) {
      setCancellingRes(targetRes);
      return;
    }

    const isUserClearingHistory = !isAdmin && targetRes?.status === "success";
    const confirmMsg = isUserClearingHistory
      ? "Do you want to remove this completed reservation from your history?"
      : "⚠️ Permanently delete this reservation? This cannot be undone.";

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${BASE}/reservations/${id}/permanent`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.user.token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      alert(err?.message ?? "Failed to delete.");
    }
  };

  const handleApprove = async (id: string) => {
    if (!session?.user?.token) return;
    if (!confirm("Approve this reservation?")) return;

    try {
      await confirmReservation(id, session.user.token as string);
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "success" as const } : r))
      );
    } catch (err: any) {
      alert(err?.message ?? "Failed to approve.");
    }
  };

  const handleEditSuccess = () => {
    setEditingRes(null);
    fetchReservations();
  };

  const handlePaymentMethodChange = async (paymentId: string, method: string) => {
  if (!session?.user?.token) return;

  try {
    const res = await fetch(`${BASE}/payments/${paymentId}/method`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.token}`,
      },
      body: JSON.stringify({ method }),
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    const json = JSON.parse(text);

    if (!res.ok) throw new Error(json.message);

    setReservations((prev) =>
      prev.map((r) =>
        r.paymentId === paymentId
          ? { ...r, paymentMethod: method as any }
          : r
      )
    );

    alert("✅ Payment method updated!");
  } catch (err: any) {
    alert(err?.message ?? "Failed to update payment method.");
  }
};

  const handlePaymentSuccess = () => {
    setPayingRes(null);
    fetchReservations();
  };

  const handleAdminConfirmCash = async (paymentId: string) => {
    if (!session?.user?.token) return;
    try {
      const res = await fetch(`${BASE}/payments/${paymentId}/confirm-cash`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${session.user.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      alert("✅ Cash payment confirmed!");
      fetchReservations();
    } catch (err: any) {
      alert(err?.message ?? "Failed to confirm cash.");
    }
  };

  const handleAdminCancelPayment = async (paymentId: string) => {
    if (!session?.user?.token) return;
    try {
      const res = await fetch(`${BASE}/payments/admin/${paymentId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${session.user.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      alert("✅ Payment cancelled.");
      fetchReservations();
    } catch (err: any) {
      alert(err?.message ?? "Failed to cancel payment.");
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const userName = r.user?.name?.toLowerCase() || "";
    const spaceName = r.room?.coworkingSpace?.name?.toLowerCase() || "";

    const matchUser =
      !isAdmin || searchTerm === "" || userName.includes(searchTerm.toLowerCase());
    const matchSpace =
      spaceSearchTerm === "" || spaceName.includes(spaceSearchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;

    return matchUser && matchSpace && matchStatus;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const getStart = (r: Reservation) =>
      r.timeSlots?.length ? new Date(r.timeSlots[0].startTime).getTime() : 0;

    if (sortBy === "date-asc") return getStart(a) - getStart(b);
    if (sortBy === "date-desc") return getStart(b) - getStart(a);
    if (sortBy === "space-asc") {
      return (a.room?.coworkingSpace?.name || "").localeCompare(b.room?.coworkingSpace?.name || "");
    }
    if (sortBy === "user-asc") {
      return (a.user?.name || "").localeCompare(b.user?.name || "");
    }
    return 0;
  });

  if (payingRes) {
    return (
      <PaymentView
        reservationId={payingRes._id}
        paymentMethod={payingRes.paymentMethod as "qr" | "cash"}
        token={session?.user?.token as string}
        totalPrice={payingRes.room?.price ?? 0}
        onPaymentSuccess={handlePaymentSuccess}
        onBack={() => setPayingRes(null)}
      />
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {isAdmin ? "All Reservations" : "My Reservations"}
      </h2>

      <p className={styles.subtitle}>
        {sortedReservations.length}{" "}
        {sortedReservations.length === 1 ? "reservation" : "reservations"}
      </p>

      {reservations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {isAdmin && (
            <input
              type="text"
              placeholder="🔍 Search by user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          )}

          <div className={styles.filterGrid}>
            <input
              type="text"
              placeholder="🏢 Search by space name..."
              value={spaceSearchTerm}
              onChange={(e) => setSpaceSearchTerm(e.target.value)}
              className={styles.searchInput}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="date-asc">📅 Date (Oldest First)</option>
              <option value="date-desc">📅 Date (Newest First)</option>
              <option value="space-asc">🏢 Space Name (A-Z)</option>
              {isAdmin && <option value="user-asc">👤 User Name (A-Z)</option>}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.sortSelect}
              style={{ gridColumn: "1 / -1" }}
            >
              <option value="all">🟢 All Statuses</option>
              <option value="pending">⏳ Pending Only</option>
              <option value="success">✅ Approved Only</option>
              <option value="cancelled">❌ Cancelled Only</option>
            </select>
          </div>
        </div>
      )}

      {!session && (
        <div className={styles.messageCard}>
          <p className={styles.messageText}>Sign in to view your reservations.</p>
          <Link href="/api/auth/signin" className={styles.signInLink}>
            Sign In →
          </Link>
        </div>
      )}

      {session && loading && <p className={styles.messageText}>Loading...</p>}
      {session && error && <div className={styles.errorCard}>{error}</div>}

      {session && !loading && sortedReservations.length === 0 && !error && (
        <div className={styles.messageCard}>
          <div className={styles.emptyIcon}>🏢</div>
          <p className={styles.messageText}>
            {searchTerm || spaceSearchTerm || statusFilter !== "all"
              ? "No reservations found matching your criteria."
              : "No reservations yet."}
          </p>
        </div>
      )}

      {sortedReservations.map((r) => (
        <ReservationCard
          key={r._id}
          reservation={r}
          isAdmin={isAdmin}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onEdit={(res) => setEditingRes(res)}
          onPaymentMethodChange={handlePaymentMethodChange}
          onViewQR={(res) => setPayingRes(res)}
          onPayNow={(res) => setPayingRes(res)}
          onEditPayment={(res) => setPayingRes(res)}
          onAdminConfirmCash={handleAdminConfirmCash}
          onAdminCancelPayment={handleAdminCancelPayment}
        />
      ))}

      {editingRes && (
        <EditModal
          reservation={editingRes}
          isAdmin={isAdmin}
          token={session?.user?.token as string}
          onClose={() => setEditingRes(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {cancellingRes && (
        <CancelModal
          reservation={cancellingRes}
          onClose={() => setCancellingRes(null)}
          onConfirm={(id) => {
            setCancellingRes(null);
            handleDelete(id);
          }}
        />
      )}
    </div>
  );
}