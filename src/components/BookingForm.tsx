"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export default function BookingForm() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.token;

  const [spaces, setSpaces] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);

  const [spaceId, setSpaceId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState("");

  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // ================================
  // LOAD SPACES
  // ================================
  useEffect(() => {
    if (!token) return;

    fetch(`${BASE}/coworkingspaces`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSpaces(data.data || []));
  }, [token]);

  // ================================
  // LOAD ROOMS
  // ================================
  useEffect(() => {
    if (!spaceId || !token) return;

    fetch(`${BASE}/coworkingspaces/${spaceId}/rooms`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRooms(data.data || []));
  }, [spaceId, token]);

  // ================================
  // LOAD SLOTS
  // ================================
  useEffect(() => {
    if (!roomId || !date || !token) return;

    fetch(
      `${BASE}/coworkingspaces/${spaceId}/rooms/${roomId}?date=${date}`,
      {
        headers: { authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => setSlots(data.data?.slots || []));
  }, [roomId, date, token]);

  // ================================
  // TOGGLE SLOT
  // ================================
  const toggleSlot = (id: string) => {
    setSelectedSlots((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  // ================================
  // SUBMIT
  // ================================
  const handleSubmit = async () => {
    if (!token) return alert("Login first");
    if (selectedSlots.length === 0)
      return alert("Select at least one slot");

    try {
      await fetch(`${BASE}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timeSlotIds: selectedSlots }),
      });

      alert("Reservation success 🎉");
      setSelectedSlots([]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Reserve Flow (NEW)</h2>

      {/* SPACE */}
      <select onChange={(e) => setSpaceId(e.target.value)} value={spaceId}>
        <option value="">Select Space</option>
        {spaces.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* ROOM */}
      {rooms.length > 0 && (
        <select onChange={(e) => setRoomId(e.target.value)} value={roomId}>
          <option value="">Select Room</option>
          {rooms.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>
      )}

      {/* DATE */}
      {roomId && (
        <input
          type="date"
          onChange={(e) => setDate(e.target.value)}
        />
      )}

      {/* SLOTS */}
      <div style={{ marginTop: 20 }}>
        {slots.map((slot) => (
          <button
            key={slot.timeSlotId}
            disabled={slot.status === "booked"}
            onClick={() => toggleSlot(slot.timeSlotId)}
            style={{
              margin: 5,
              padding: 10,
              background: selectedSlots.includes(slot.timeSlotId)
                ? "green"
                : slot.status === "booked"
                ? "gray"
                : "white",
              color: slot.status === "booked" ? "white" : "black",
            }}
          >
            {new Date(slot.startTime).toLocaleTimeString()} -
            {new Date(slot.endTime).toLocaleTimeString()}
          </button>
        ))}
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        style={{ marginTop: 20, padding: 12 }}
      >
        Confirm Reservation
      </button>
    </div>
  );
}