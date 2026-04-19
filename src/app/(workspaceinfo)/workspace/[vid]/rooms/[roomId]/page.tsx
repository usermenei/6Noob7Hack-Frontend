"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./RoomPage.module.css";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

const fixImageUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("drive.google.com/uc")) return url;
  const match = url.match(/\/d\/(.*?)\//);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
};

const toThaiTime = (dateStr: string) => {
  const date = new Date(dateStr);
  
  return date.toLocaleTimeString("en-GB", {
    timeZone: "UTC",
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

const formatDateForApi = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function RoomPage() {
  const { vid, roomId } = useParams();
  const router = useRouter();

  const { data: session } = useSession();
  const token = (session?.user as any)?.token;
  const isAdmin = (session?.user as any)?.role === "admin";

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateStr, setDateStr] = useState("");
  
  const [room, setRoom] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    if (!dateStr) return;
    try {
      const res = await fetch(`${BASE}/coworkingspaces/${vid}/rooms/${roomId}?date=${dateStr}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      setRoom(json.data);

      const now = new Date();
      
      const availableFutureSlots = (json.data.slots || []).filter((slot: any) => {
  const slotStartTime = new Date(slot.startTime);
  const nowPlus7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return slotStartTime > nowPlus7;
});

      setSlots(availableFutureSlots);
      setSelected([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (dateStr) fetchData();
  }, [dateStr]);

  const toggleSlot = (id: string, status: string) => {
    if (status === "booked") return;
    
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      } else {
        if (prev.length >= 3) {
          setError("You can only book up to 3 slots per reservation.");
          return prev;
        }
        setError("");
        return [...prev, id];
      }
    });
  };

  const handleReserve = async () => {
    setError("");
    setSuccess("");
    if (!token) { setError("Please login first to make a reservation."); return; }
    if (selected.length === 0) { setError("Please select at least one time slot."); return; }

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
      setSuccess("Booking successful! 🎉");
      fetchData(); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${BASE}/rooms/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      alert("Room deleted successfully.");
      router.push(`/workspace/${vid}/rooms`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href={`/workspace/${vid}/rooms`} className={styles.backLink}>
          ← Back to Rooms
        </Link>
        {isAdmin && (
          <button onClick={handleDeleteRoom} className={styles.deleteBtn}>
            Delete Room
          </button>
        )}
      </header>

      <div className={styles.container}>
        
        {/* ฝั่งซ้าย: ข้อมูลห้อง */}
        <div className={styles.imageCard}>
          <div className={styles.imageWrapper}>
            {room?.picture ? (
              <Image
                src={fixImageUrl(room.picture)}
                alt={room.name || "Room Image"}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              "🏢"
            )}
          </div>
          
          <div className={styles.roomInfo}>
            <h1 className={styles.roomName}>{room ? room.name : "Please select the date"}</h1>
            {room && (
              <p className={styles.capacity}>
                👥 Capacity: {room.capacity} people
              </p>
            )}
          </div>
        </div>

        {/* ฝั่งขวา: การจอง */}
        <div className={styles.bookingCard}>
          <h2 className={styles.sectionTitle}>Reserve a Space</h2>
          
          <div className={styles.datePickerContainer}>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => {
                setSelectedDate(date);
                if (date) {
                  setDateStr(formatDateForApi(date));
                } else {
                  setDateStr("");
                }
                setError("");
                setSuccess("");
              }}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              placeholderText="Select a booking date"
              className={styles.dateInput}
            />
          </div>

          {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
          {success && <div className={`${styles.message} ${styles.success}`}>{success}</div>}

          {dateStr && slots.length === 0 && !error && (
            <p className={styles.noSlots}>No available slots for this date.</p>
          )}

          {slots.length > 0 && (
            <div className={styles.slotGrid}>
              {slots.map((slot) => {
                const isSelected = selected.includes(slot.timeSlotId);
                let slotClass = styles.slotAvailable;
                if (slot.status === "booked") slotClass = styles.slotBooked;
                else if (isSelected) slotClass = styles.slotSelected;

                return (
                  <div
                    key={slot.timeSlotId}
                    onClick={() => toggleSlot(slot.timeSlotId, slot.status)}
                    className={`${styles.slot} ${slotClass}`}
                  >
                    <span className={styles.slotTime}>
                      {toDisplayTime(slot.startTime)} - {toDisplayTime(slot.endTime)}
                    </span>
                    <span className={styles.slotPrice}>฿{slot.price}</span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={handleReserve}
            className={styles.bookBtn}
            disabled={!dateStr || selected.length === 0}
          >
            {selected.length > 0 ? `Confirm Reservation (${selected.length} slots)` : "Select time slots to book"}
          </button>

          <div className={styles.pricingNote}>
            <strong>💡 Dynamic Pricing Notice</strong>
            Prices are subject to change based on real-time demand. Higher rates may apply during peak business hours to ensure workspace availability.
          </div>

        </div>
      </div>
    </main>
  );
}