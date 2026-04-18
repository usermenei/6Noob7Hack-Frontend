import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import {
  AdminCreateButton,
  AdminRoomActions,
} from "@/components/AdminControls";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api/v1";

const fixImageUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("drive.google.com/uc")) return url;
  const match = url.match(/\/d\/(.*?)\//);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
};

async function getRooms(vid: string) {
  const res = await fetch(
    `${BASE}/coworkingspaces/${vid}/rooms`,
    { cache: "no-store" }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to load rooms");
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
    <main style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* HERO (Booking.com style) */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #003580 0%, #0071c2 100%)",
          padding: "50px 24px",
          color: "#fff",
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
            color: "rgba(255,255,255,0.85)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Back
        </Link>

        <h1 style={{ fontSize: "34px", fontWeight: 800 }}>
          Find your perfect room
        </h1>

        <p style={{ fontSize: "14px", opacity: 0.85 }}>
          Compare rooms, prices, and availability instantly
        </p>

        <div style={{ marginTop: "20px" }}>
          <AdminCreateButton vid={vid} />
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "30px 16px",
        }}
      >
        {rooms.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#6b7280",
              marginTop: "40px",
            }}
          >
            No rooms available.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {rooms.map((room: any) => (
            <div
              key={room._id}
              style={{
                display: "flex",
                background: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                transition: "transform 0.2s ease",
              }}
            >
              {/* IMAGE */}
              <div style={{ width: "260px", minWidth: "260px" }}>
                {room.picture ? (
                  <Image
                    src={fixImageUrl(room.picture)}
                    alt={room.name}
                    width={260}
                    height={180}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
                      background:
                        "linear-gradient(135deg, #003580 0%, #0071c2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "40px",
                      color: "#fff",
                    }}
                  >
                    🏢
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div
                style={{
                  flex: 1,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#1f2937",
                      marginBottom: "6px",
                    }}
                  >
                    {room.name}
                  </h2>

                  <p style={{ fontSize: "14px", color: "#6b7280" }}>
                    Modern workspace designed for productivity
                  </p>

                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    👥 Capacity: <b>{room.capacity}</b> people
                  </div>
                </div>

                <div>
                  {/* ADMIN ACTIONS */}
                  <div style={{ marginBottom: "10px" }}>
                    <AdminRoomActions roomId={room._id} vid={vid} />
                  </div>

                  <Link
                    href={`/workspace/${vid}/rooms/${room._id}`}
                    style={{
                      display: "inline-block",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      background: "#0071c2",
                      color: "#fff",
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                    Check availability →
                  </Link>
                </div>
              </div>

              {/* PRICE COLUMN */}
              <div
                style={{
                  width: "140px",
                  borderLeft: "1px solid #f1f5f9",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  ฿{room.price}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  per hour
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}