"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

export default function BookingRoomPage() {
  const { roomId } = useParams();
  const { data: session } = useSession();

  const token = (session?.user as any)?.token;

  const [date, setDate] = useState("");
  const [room, setRoom] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔥 FETCH AVAILABILITY
  const fetchAvailability = async () => {
    if (!date) return;

    try {
      const res = await fetch(
        `${BASE}/coworkingspaces/${room?.coworkingSpace?._id || ""}/rooms/${roomId}?date=${date}`
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setRoom(json.data);
      setSlots(json.data.slots);
      setSelectedSlots([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (date) fetchAvailability();
  }, [date]);

  // 🔥 TOGGLE SLOT
  const toggleSlot = (slotId: string, status: string) => {
    if (status === "booked") return;

    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  // 🔥 RESERVE
  const handleReserve = async () => {
    if (!token) {
      setError("Please login first");
      return;
    }

    if (selectedSlots.length === 0) {
      setError("Please select at least one slot");
      return;
    }

    try {
      const res = await fetch(`${BASE}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSlotIds: selectedSlots,
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setSuccess("Reservation successful 🎉");
      setSelectedSlots([]);
      fetchAvailability();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)",
          padding: "30px",
          color: "#fff",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Link
          href="/workspace"
          style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            color: "#fff",
            textDecoration: "none",
            fontSize: "13px",
          }}
        >
          ← Back
        </Link>

        <h1 style={{ fontSize: "26px", fontWeight: 800 }}>
          Book Room
        </h1>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
        
        {/* DATE */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            width: "100%",
          }}
        />

        {/* ALERTS */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        {/* ROOM */}
        {room && (
          <div style={{ marginTop: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800 }}>
              {room.name}
            </h2>
            <p>👥 {room.capacity} people</p>
          </div>
        )}

        {/* SLOTS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          {slots.map((slot) => {
            const isSelected = selectedSlots.includes(slot.timeSlotId);

            return (
              <div
                key={slot.timeSlotId}
                onClick={() => toggleSlot(slot.timeSlotId, slot.status)}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  textAlign: "center",
                  cursor:
                    slot.status === "booked" ? "not-allowed" : "pointer",
                  background:
                    slot.status === "booked"
                      ? "#e5e7eb"
                      : isSelected
                      ? "#0891b2"
                      : "#fff",
                  color:
                    slot.status === "booked"
                      ? "#9ca3af"
                      : isSelected
                      ? "#fff"
                      : "#000",
                  border: "1px solid #ddd",
                }}
              >
                <div style={{ fontSize: "12px" }}>
                  {new Date(slot.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div style={{ fontSize: "12px" }}>
                  {new Date(slot.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div style={{ fontSize: "11px" }}>
                  ฿{slot.price}
                </div>
              </div>
            );
          })}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleReserve}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "14px",
            background: "#0891b2",
            color: "#fff",
            borderRadius: "12px",
            fontWeight: 700,
            border: "none",
          }}
        >
          Confirm Reservation
        </button>
      </div>
    </main>
  );
}