"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateRoomPage({
  params,
}: {
  params: Promise<{ vid: string }>;
}) {
  const { vid } = use(params);

  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: "",
    capacity: 1,
    price: 0,
    picture: "",
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({
          ...form,
          coworkingSpace: vid,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      router.push(`/workspace/${vid}/rooms`);
    } else {
      alert(data.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          padding: "28px",
        }}
      >
        {/* HEADER */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "6px",
            color: "#111827",
          }}
        >
          Create New Room
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          Add a new workspace room for booking
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Room Name */}
          <div>
            <label style={labelStyle}>Room Name</label>
            <input
              name="name"
              placeholder="e.g. Meeting Room A"
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* Capacity */}
          <div>
            <label style={labelStyle}>Capacity</label>
            <input
              name="capacity"
              type="number"
              min={1}
              placeholder="Number of people"
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* Price */}
          <div>
            <label style={labelStyle}>Price (per hour)</label>
            <input
              name="price"
              type="number"
              min={0}
              placeholder="e.g. 200"
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* Image */}
          <div>
            <label style={labelStyle}>Room Image URL</label>
            <input
              name="picture"
              placeholder="Paste image URL (Google Drive or direct link)"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* BUTTON */}
          <button type="submit" style={buttonStyle}>
            Create Room →
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===== Styles ===== */

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  outline: "none",
  fontSize: "14px",
  transition: "0.2s",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "10px",
  padding: "12px",
  borderRadius: "12px",
  background: "#0071c2",
  color: "#fff",
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  fontSize: "15px",
};