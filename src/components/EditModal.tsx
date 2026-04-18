"use client";

import { useEffect, useState } from "react";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

export default function EditModal({
  reservation,
  token,
  onClose,
  onSuccess,
  isAdmin,
}: any) {
  const [slots, setSlots] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const originalSlotIds = reservation.timeSlots.map(
    (s: any) => s._id
  );

  // =====================================================
  // FETCH SLOTS
  // =====================================================
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

  // =====================================================
  // TOGGLE SLOT (ONLY REMOVE)
  // =====================================================
  const toggleSlot = (id: string) => {
    const isOriginal = originalSlotIds.includes(id);

    // ❌ cannot add new slots
    if (!isOriginal) return;

    setSelected((prev) => prev.filter((s) => s !== id));
  };

  // =====================================================
  // UPDATE (SHRINK)
  // =====================================================
  const handleUpdate = async () => {
    if (selected.length === originalSlotIds.length) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${BASE}/reservations/${reservation._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            timeSlotIds: selected,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CANCEL (status change)
  // =====================================================
  const handleCancelReservation = async () => {
    if (!confirm("Cancel this reservation?")) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${BASE}/reservations/${reservation._id}`,
        {
          method: "DELETE", // cancel
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PERMANENT DELETE
  // =====================================================
  const handlePermanentDelete = async () => {
    if (
      !confirm(
        "⚠️ Permanently delete this reservation? This cannot be undone."
      )
    )
      return;

    try {
      setLoading(true);

      const res = await fetch(
        `${BASE}/reservations/${reservation._id}/permanent`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================
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
            gridTemplateColumns:
              "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          {slots.map((slot) => {
            const isSelected = selected.includes(slot.timeSlotId);
            const isOriginal = originalSlotIds.includes(
              slot.timeSlotId
            );

            return (
              <div
                key={slot.timeSlotId}
                onClick={() => toggleSlot(slot.timeSlotId)}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  textAlign: "center",
                  border: "1px solid #ddd",
                  background: isSelected
                    ? "#0891b2"
                    : "#e5e7eb",
                  color: isSelected ? "#fff" : "#999",
                  cursor: isOriginal
                    ? "pointer"
                    : "not-allowed",
                  opacity: isOriginal ? 1 : 0.4,
                }}
              >
                <div>
                  {new Date(slot.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div>
                  {new Date(slot.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
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
          {/* LEFT */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleCancelReservation}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#f59e0b",
                color: "#fff",
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
                }}
              >
                Delete
              </button>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#ddd",
              }}
            >
              Close
            </button>

            <button
              onClick={handleUpdate}
              disabled={
                loading ||
                selected.length === originalSlotIds.length
              }
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#0891b2",
                color: "#fff",
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