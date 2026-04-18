"use client";

import { useEffect, useState } from "react";
import { Reservation } from "@/libs/getReservations";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

const toThaiTime = (dateStr: string) => {
  const date = new Date(dateStr);
  date.setHours(date.getHours() - 7);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

        // ✅ Sort slots by startTime so they display continuously with no gaps
        const sorted = (json.data.slots || []).slice().sort(
          (a: any, b: any) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        setSlots(sorted);
        setSelected(originalSlotIds);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchSlots();
  }, [reservation]);

  // ✅ Toggle: available slots can be added, selected slots can be removed
  const toggleSlot = (slot: any) => {
    const id = slot.timeSlotId;
    const isBooked = slot.isBooked && !originalSlotIds.includes(id);

    // Don't allow selecting slots booked by someone else
    if (isBooked) return;

    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleUpdate = async () => {
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

  // ✅ Derive slot visual state
  const getSlotStyle = (slot: any) => {
    const id = slot.timeSlotId;
    const isSelected = selected.includes(id);
    const isBookedByOther = slot.isBooked && !originalSlotIds.includes(id);

    if (isSelected) {
      return {
        background: "#0891b2",
        color: "#fff",
        cursor: "pointer",
        opacity: 1,
      };
    }
    if (isBookedByOther) {
      return {
        background: "#e5e7eb",
        color: "#bbb",
        cursor: "not-allowed",
        opacity: 0.5,
      };
    }
    // Available (not selected, not booked by other)
    return {
      background: "#e5e7eb",
      color: "#666",
      cursor: "pointer",
      opacity: 1,
    };
  };

  const hasChanges =
    selected.length !== originalSlotIds.length ||
    !selected.every((id) => originalSlotIds.includes(id));

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

        {/* SLOT GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          {slots.map((slot) => {
            const slotStyle = getSlotStyle(slot);
            return (
              <div
                key={slot.timeSlotId}
                onClick={() => toggleSlot(slot)}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  textAlign: "center",
                  border: "1px solid #ddd",
                  ...slotStyle,
                }}
              >
                <div>{toThaiTime(slot.startTime)}</div>
                <div>{toThaiTime(slot.endTime)}</div>
              </div>
            );
          })}
        </div>

        {/* BUTTONS */}
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
              // ✅ Save enabled only when selection has actually changed
              disabled={loading || !hasChanges || selected.length === 0}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: hasChanges && selected.length > 0 ? "#0891b2" : "#aaa",
                color: "#fff",
                cursor: hasChanges && selected.length > 0 ? "pointer" : "not-allowed",
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