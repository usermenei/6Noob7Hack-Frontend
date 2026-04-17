"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import updateReservation from "@/libs/updateReservation";
import getCoworkingSpaces, { CoworkingSpaceItem } from "@/libs/getCoworkingSpaces";
import { Reservation } from "@/libs/getReservations";
import styles from "./BookingList.module.css";

interface EditModalProps {
  reservation: Reservation;
  isAdmin: boolean;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditModal({
  reservation,
  isAdmin,
  token,
  onClose,
  onSuccess,
}: EditModalProps) {
  const safeDate = reservation.timeSlots?.[0]?.startTime
    ? new Date(reservation.timeSlots[0].startTime)
    : null;

  const [date, setDate] = useState<Date | null>(safeDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [spaceId, setSpaceId] = useState(reservation.room?._id || "");
  const [spaces, setSpaces] = useState<CoworkingSpaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<"date" | "time">("date");

  // load spaces
  useEffect(() => {
    (async () => {
      const json = await getCoworkingSpaces(token);
      setSpaces(json.data);
    })();
  }, [token]);

  // STEP 1 → after date selected
  const handleDateSelect = (d: Date | null) => {
    setDate(d);

    if (d) {
      setStep("time"); // unlock time selection
    }
  };

  const handleSave = async () => {
    if (!date || !spaceId) {
      alert("Select date first");
      return;
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const base = `${yyyy}-${mm}-${dd}`;

    const start = new Date(`${base}T${startTime}:00`);
    const end = new Date(`${base}T${endTime}:00`);

    if (end <= start) {
      alert("Invalid time range");
      return;
    }

    setLoading(true);

    try {
      await updateReservation(
        reservation._id,
        {
          apptDate: start.toISOString(),
          apptEndDate: end.toISOString(),
          coworkingSpace: spaceId,
          ...(isAdmin ? { status: reservation.status } : {}),
        },
        token
      );

      onSuccess();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div style={{ width: 420, background: "#fff", padding: 25, borderRadius: 12 }}>

        <h2>Edit Reservation</h2>

        {/* STEP 1: DATE */}
        <label>Select Date</label>
        <DatePicker
          selected={date}
          onChange={handleDateSelect}
          minDate={new Date()}
        />

        {/* STEP 2: TIME (LOCKED UNTIL DATE PICKED) */}
        <div style={{ opacity: step === "time" ? 1 : 0.4, pointerEvents: step === "time" ? "auto" : "none" }}>
          
          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);

              if (endTime <= e.target.value) {
                const [h, m] = e.target.value.split(":");
                setEndTime(`${String(+h + 1).padStart(2, "0")}:${m}`);
              }
            }}
          />

          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {/* SPACE */}
        <select value={spaceId} onChange={(e) => setSpaceId(e.target.value)}>
          {spaces.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}>Cancel</button>

          <button onClick={handleSave} disabled={loading}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}