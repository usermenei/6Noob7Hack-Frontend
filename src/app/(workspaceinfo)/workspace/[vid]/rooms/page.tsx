import Link from "next/link";
import { use } from "react";
import {
  AdminCreateButton,
  AdminRoomActions,
} from "@/components/AdminControls";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

// 🔥 FIX: convert Google Drive links safely
const fixImageUrl = (url: string) => {
  if (!url) return "";

  // already good format
  if (url.includes("drive.google.com/uc")) return url;

  // convert /file/d/ID/view
  const match = url.match(/\/d\/(.*?)\//);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }

  return url;
};

async function getRooms(vid: string) {
  const res = await fetch(
    `${BASE}/coworkingspaces/${vid}/rooms`,
    {
      cache: "no-store",
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Failed to load rooms");
  }

  return json.data;
}

export default function RoomsPage({
  params,
}: {
  params: Promise<{ vid: string }>;
}) {
  const { vid } = use(params);
  const rooms = use(getRooms(vid));

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)",
          padding: "40px 24px",
          color: "#fff",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Link
          href={`/workspace/${vid}`}
          style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.8)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Back
        </Link>

        <h1 style={{ fontSize: "30px", fontWeight: 800 }}>
          Available Rooms
        </h1>

        <p style={{ fontSize: "14px", opacity: 0.8 }}>
          Choose your perfect workspace
        </p>

        <AdminCreateButton vid={vid} />
      </div>

      {/* CONTENT */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        {rooms.length === 0 && (
          <div style={{ textAlign: "center", color: "#6b7280" }}>
            No rooms available.
          </div>
        )}

        <div style={{ display: "grid", gap: "20px" }}>
          {rooms.map((room: any) => (
            <div
              key={room._id}
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "20px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                border: "1px solid #e5e7eb",
              }}
            >
              {/* ✅ ROOM IMAGE (FIXED) */}
              {room.picture && (
                <div
                  style={{
                    width: "100%",
                    height: "160px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    marginBottom: "12px",
                  }}
                >
                  <img
                    src={fixImageUrl(room.picture)}
                    alt={room.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              {/* Room Title */}
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  marginBottom: "10px",
                  color: "#111827",
                }}
              >
                {room.name}
              </h2>

              {/* Info Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                  marginBottom: "14px",
                  color: "#374151",
                }}
              >
                <span>👥 {room.capacity} people</span>
                <span style={{ fontWeight: 700, color: "#0891b2" }}>
                  ฿{room.price}/hr
                </span>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "#f1f5f9",
                  marginBottom: "14px",
                }}
              />

              {/* View Button */}
              <Link
                href={`/workspace/${vid}/rooms/${room._id}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#0891b2",
                  color: "#fff",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                View Availability →
              </Link>

              {/* ADMIN ACTIONS */}
              <AdminRoomActions roomId={room._id} vid={vid} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}