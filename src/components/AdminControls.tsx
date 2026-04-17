"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

// =====================================================
// ➕ CREATE ROOM BUTTON
// =====================================================
export function AdminCreateButton({ vid }: { vid: string }) {
  const { data: session } = useSession();

  const isAdmin = (session?.user as any)?.role === "admin";

  if (!isAdmin) return null;

  return (
    <Link
      href={`/workspace/${vid}/rooms/create`}
      style={{
        display: "inline-block",
        marginTop: "20px",
        padding: "12px 18px",
        borderRadius: "12px",
        background: "#22c55e",
        color: "#fff",
        fontWeight: 700,
        textDecoration: "none",
      }}
    >
      ➕ Add Room
    </Link>
  );
}

// =====================================================
// ✏️ EDIT + 🗑 DELETE ROOM ACTIONS
// =====================================================
export function AdminRoomActions({
  roomId,
  vid,
}: {
  roomId: string;
  vid: string;
}) {
  const { data: session } = useSession();

  const isAdmin = (session?.user as any)?.role === "admin";
  const token = (session?.user as any)?.token;

  if (!isAdmin) return null;

  const handleDelete = async () => {
    if (!confirm("Delete this room?")) return;

    const res = await fetch(`${BASE}/rooms/${roomId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    // refresh page
    location.reload();
  };

  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
      {/* EDIT */}
      <Link
        href={`/workspace/${vid}/rooms/${roomId}/edit`}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "10px",
          background: "#f59e0b",
          color: "#fff",
          textAlign: "center",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        ✏️ Edit
      </Link>

      {/* DELETE */}
      <button
        onClick={handleDelete}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        🗑 Delete
      </button>
    </div>
  );
}