"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./RoomPage.module.css";
import PaymentView from "@/components/PaymentView";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

const fixImageUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("drive.google.com/uc")) return url;
  const match = url.match(/\/d\/(.*?)\//);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
};

const toDisplayTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateForApi = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
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

  // Payment States
  const [showPayment, setShowPayment] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🌟 เพิ่ม State สำหรับเลือกวิธีจ่ายเงิน
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "cash">("qr");

  const fetchData = async () => {
    if (!dateStr) return;
    try {
      const res = await fetch(
        `${BASE}/coworkingspaces/${vid}/rooms/${roomId}?date=${dateStr}`,
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
    if (dateStr) fetchData();
  }, [dateStr]);

  const toggleSlot = (id: string, status: string) => {
    if (status === "booked") return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) {
        setError("You can only book up to 3 slots.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const totalPrice = selected.reduce((total, slotId) => {
    const foundSlot = slots.find((s) => s.timeSlotId === slotId);
    return total + (foundSlot ? foundSlot.price : 0);
  }, 0);

  // 🌟 สร้าง Reservation ก่อนตาม US2-1
  const handleProceedToPayment = async () => {
    if (!token) {
      setError("Please login first.");
      return;
    }
    if (selected.length === 0) return;

    setIsSubmitting(true);
    setError("");
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
      if (!res.ok) throw new Error(json.message || "Reservation failed");

      setReservationId(json.data?._id || json.data?.id);
      setShowPayment(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href={`/workspace/${vid}/rooms`} className={styles.backLink}>
          ← Back to Rooms
        </Link>
      </header>

      <div className={styles.container}>
        <div className={styles.imageCard}>
          <div className={styles.imageWrapper}>
            {room?.picture ? (
              <Image
                src={fixImageUrl(room.picture)}
                alt="Room"
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              "🏢"
            )}
          </div>
          <div className={styles.roomInfo}>
            <h1 className={styles.roomName}>{room?.name || "Room Details"}</h1>
            <p>👥 Capacity: {room?.capacity || 0} people</p>
          </div>
        </div>

        <div className={styles.bookingCard}>
          {showPayment && reservationId ? (
            <PaymentView
              reservationId={reservationId}
              paymentMethod={paymentMethod}
              token={token}
              totalPrice={totalPrice}
              onPaymentSuccess={() => router.push("/mybooking")}
              onBack={() => setShowPayment(false)}
            />
          ) : (
            <>
              <h2 className={styles.sectionTitle}>Reserve a Space</h2>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => {
                  setSelectedDate(date);
                  setDateStr(date ? formatDateForApi(date) : "");
                }}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                className={styles.dateInput}
              />

              {error && (
                <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
              )}

              <div className={styles.slotGrid} style={{ marginTop: "20px" }}>
                {slots.map((slot) => (
                  <div
                    key={slot.timeSlotId}
                    onClick={() => toggleSlot(slot.timeSlotId, slot.status)}
                    className={`${styles.slot} ${selected.includes(slot.timeSlotId) ? styles.slotSelected : slot.status === "booked" ? styles.slotBooked : styles.slotAvailable}`}
                  >
                    <span>
                      {toDisplayTime(slot.startTime)} -{" "}
                      {toDisplayTime(slot.endTime)}
                    </span>
                    <span style={{ fontWeight: "bold" }}>฿{slot.price}</span>
                  </div>
                ))}
              </div>

              {selected.length > 0 && (
                <>
                  <div
                    style={{
                      margin: "20px 0",
                      padding: "15px",
                      background: "#f8fafc",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <strong>Total Price:</strong>
                    <strong style={{ fontSize: "1.2rem" }}>฿{totalPrice}</strong>
                  </div>

                  {/* 🌟 ปุ่มเลือกวิธีชำระเงิน */}
                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Select Payment Method</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => setPaymentMethod("qr")}
                        style={{
                          flex: 1, padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer",
                          background: paymentMethod === "qr" ? "#0891b2" : "#e2e8f0",
                          color: paymentMethod === "qr" ? "white" : "black",
                          fontWeight: "bold", transition: "0.2s"
                        }}
                      >
                        📱 Scan QR Code
                      </button>
                      <button
                        onClick={() => setPaymentMethod("cash")}
                        style={{
                          flex: 1, padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer",
                          background: paymentMethod === "cash" ? "#0891b2" : "#e2e8f0",
                          color: paymentMethod === "cash" ? "white" : "black",
                          fontWeight: "bold", transition: "0.2s"
                        }}
                      >
                        💵 Pay Cash
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={isSubmitting || selected.length === 0}
                className={styles.bookBtn}
                style={{
                  width: "100%", padding: "15px", background: "#0891b2", color: "white",
                  border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold"
                }}
              >
                {isSubmitting
                  ? "Processing..."
                  : `Confirm & Pay via ${paymentMethod === 'qr' ? 'QR Code' : 'Cash'}`}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}