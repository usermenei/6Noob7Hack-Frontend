"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

const fixImageUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("drive.google.com/uc")) return url;
  const match = url.match(/\/d\/(.*?)\//);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
};

// ✅ Thai time 24-hour
const toThaiTime = (dateStr: string) => {
  const date = new Date(dateStr);
  date.setHours(date.getHours() - 7);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RoomPage() {
  const { vid, roomId } = useParams();
  const router = useRouter();

  const { data: session } = useSession();
  const token = (session?.user as any)?.token;
  const isAdmin = (session?.user as any)?.role === "admin";

  const [date, setDate] = useState("");
  const [room, setRoom] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    if (!date) return;
    try {
      const res = await fetch(
        `${BASE}/coworkingspaces/${vid}/rooms/${roomId}?date=${date}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setRoom(json.data);
      setSlots(json.data.slots || []);
      setSelected([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (date) fetchData();
  }, [date]);

  const toggleSlot = (id: string, status: string) => {
    if (status === "booked") return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleReserve = async () => {
    setError("");
    setSuccess("");
    if (!token) { setError("Please login first"); return; }
    if (selected.length === 0) { setError("Select at least one time slot"); return; }

    try {
      const res = await fetch(`${BASE}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timeSlotIds: selected }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setSuccess("Booking successful 🎉");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      const res = await fetch(`${BASE}/rooms/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      alert("Room deleted");
      router.push(`/workspace/${vid}/rooms`);
    } catch (err: any) {
      alert(err.message);
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
          href={`/workspace/${vid}/rooms`}
          style={{ position: "absolute", left: "20px", top: "20px", color: "#fff", textDecoration: "none" }}
        >
          ← Back
        </Link>

        <h1 style={{ fontSize: "26px", fontWeight: 800 }}>Book Room</h1>

        {isAdmin && (
          <button
            onClick={handleDeleteRoom}
            style={{
              marginTop: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🗑 Delete Room
          </button>
        )}
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>

        {/* DATE */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        {/* ROOM INFO */}
        {room && (
          <div style={{ marginTop: "20px" }}>
            {room.picture ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "220px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "16px",
                }}
              >
                <Image
                  src={fixImageUrl(room.picture)}
                  alt={room.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "160px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  marginBottom: "16px",
                }}
              >
                🏢
              </div>
            )}

            <h2 style={{ fontSize: "22px", fontWeight: 800 }}>{room.name}</h2>
            <p>👥 {room.capacity} people</p>
          </div>
        )}

        {/* SLOTS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          {slots.map((slot) => {
            const isSelected = selected.includes(slot.timeSlotId);
            return (
              <div
                key={slot.timeSlotId}
                onClick={() => toggleSlot(slot.timeSlotId, slot.status)}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  textAlign: "center",
                  cursor: slot.status === "booked" ? "not-allowed" : "pointer",
                  background:
                    slot.status === "booked" ? "#e5e7eb" : isSelected ? "#0891b2" : "#fff",
                  color:
                    slot.status === "booked" ? "#9ca3af" : isSelected ? "#fff" : "#000",
                  border: "1px solid #ddd",
                  fontSize: "13px",
                }}
              >
                {/* ✅ Thai 24-hour time */}
                <div>{toThaiTime(slot.startTime)}</div>
                <div>{toThaiTime(slot.endTime)}</div>
                <div style={{ fontSize: "11px" }}>฿{slot.price}</div>
              </div>
            );
          })}
        </div>

        {/* BOOK BUTTON */}
        <button
          onClick={handleReserve}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "14px",
            background: "#0891b2",
            color: "#fff",
            borderRadius: "12px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
          }}
        >
          Confirm Reservation
        </button>
      </div>
    </main>
  );
}