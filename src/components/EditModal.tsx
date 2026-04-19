"use client";

import { useEffect, useState } from "react";
import { Reservation } from "@/libs/getReservations";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

const toThaiTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDisplayTime = (dateStr: string) => {
  const date = new Date(dateStr);
  date.setHours(date.getHours());
  return date.toLocaleTimeString("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isSlotPast = (startTime: string) => {
  const slotDate = new Date(startTime);
  const now = new Date();
  return slotDate < now;
};

interface EditModalProps {
  reservation: Reservation;
  token: string;
  isAdmin: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditModal({
  reservation,
  token,
  onClose,
  onSuccess,
  isAdmin,
}: EditModalProps) {
  const [slots, setSlots] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const originalSlotIds = reservation.timeSlots.map((s: any) => s._id);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const firstSlot = reservation.timeSlots[0];
        const date = new Date(firstSlot.startTime)
          .toISOString()
          .split("T")[0];

        const res = await fetch(
          `${BASE}/coworkingspaces/${reservation.room.coworkingSpace._id}/rooms/${reservation.room._id}?date=${date}`
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json.message);

        setSlots(json.data.slots || []);
        setSelected(originalSlotIds);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchSlots();
  }, [reservation]);

  const toggleSlot = (id: string) => {
    const isOriginal = originalSlotIds.includes(id);
    const slot = slots.find((s) => s.timeSlotId === id);
    const isPast = slot ? isSlotPast(slot.startTime) : false;

    if (!isOriginal || isPast) return;
    setSelected((prev) => prev.filter((s) => s !== id));
  };

  const handleUpdate = async () => {
    if (selected.length === originalSlotIds.length) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/reservations/${reservation._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timeSlotIds: selected }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!confirm("Cancel this reservation?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/reservations/${reservation._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirm("⚠️ Permanently delete this reservation? This cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/reservations/${reservation._id}/permanent`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "16px",
          width: "600px",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <h2>Edit Reservation</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          {slots.map((slot) => {
            const isSelected = selected.includes(slot.timeSlotId);
            const isOriginal = originalSlotIds.includes(slot.timeSlotId);
            const isPast = isSlotPast(slot.startTime);
            const isInteractable = isOriginal && !isPast;

            return (
              <div
                key={slot.timeSlotId}
                onClick={() => toggleSlot(slot.timeSlotId)}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  textAlign: "center",
                  border: "1px solid #ddd",
                  background: isPast
                    ? "#f3f4f6"
                    : isSelected
                    ? "#0891b2"
                    : "#e5e7eb",
                  color: isPast ? "#9ca3af" : isSelected ? "#fff" : "#999",
                  cursor: isInteractable ? "pointer" : "not-allowed",
                  opacity: isInteractable ? 1 : 0.4,
                }}
              >
                <div>{toDisplayTime(slot.startTime)}</div>
                <div>{toDisplayTime(slot.endTime)}</div>
                {isPast && (
                  <div style={{ fontSize: "11px", marginTop: "4px" }}>
                    Unavailable
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleCancelReservation}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#f59e0b",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            {isAdmin && (
              <button
                onClick={handlePermanentDelete}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#ddd",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <button
              onClick={handleUpdate}
              disabled={loading || selected.length === originalSlotIds.length}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#0891b2",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}