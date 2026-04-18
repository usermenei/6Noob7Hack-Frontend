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
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
};

async function getRooms(vid: string) {
  const res = await fetch(`${BASE}/coworkingspaces/${vid}/rooms`, {
    cache: "no-store",
  });
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .room-card {
          display: flex;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,53,128,0.07);
          border: 1px solid rgba(0,113,194,0.08);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .room-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,53,128,0.14);
        }
        .room-image-wrap {
          width: 240px;
          min-width: 240px;
          position: relative;
          overflow: hidden;
        }
        .room-image-wrap img {
          transition: transform 0.4s ease;
        }
        .room-card:hover .room-image-wrap img {
          transform: scale(1.05);
        }
        .availability-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0.08); }
        }
        .check-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 11px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0071c2, #005ea6);
          color: #fff;
          font-weight: 700;
          text-decoration: none;
          font-size: 14px;
          transition: background 0.2s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.1px;
        }
        .check-btn:hover {
          background: linear-gradient(135deg, #005ea6, #004a8a);
          transform: translateX(2px);
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(4px);
          transition: background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .back-link:hover { background: rgba(255,255,255,0.22); }
        .capacity-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 20px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 600;
        }
        .price-tag {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 800;
          color: #003580;
          line-height: 1;
        }
      `}</style>

      <main style={{ background: "#f0f4fa", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── HERO ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #003580 0%, #0055a0 60%, #0071c2 100%)",
            padding: "56px 24px 64px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: "-60px", right: "-40px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-80px", left: "30%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

          <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
            <Link href={`/workspace/${vid}`} className="back-link" style={{ marginBottom: "28px", display: "inline-flex" }}>
              ← Back to workspace
            </Link>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 800,
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
              lineHeight: 1.15,
            }}>
              Find your perfect room
            </h1>

            <p style={{ fontSize: "15px", opacity: 0.78, margin: "0 0 28px", fontWeight: 400 }}>
              {rooms.length} room{rooms.length !== 1 ? "s" : ""} available · Compare, book, and work smarter
            </p>

            <AdminCreateButton vid={vid} />
          </div>
        </div>

        {/* Subtle wave divider */}
        <div style={{ height: "6px", background: "linear-gradient(90deg, #0071c2, #003580, #0071c2)", opacity: 0.15 }} />

        {/* ── ROOM LIST ── */}
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "36px 16px 60px" }}>
          {rooms.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#6b7280",
              background: "#fff",
              borderRadius: "20px",
              border: "1px dashed #d1d5db",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏢</div>
              <p style={{ fontSize: "16px", fontWeight: 600 }}>No rooms available yet</p>
              <p style={{ fontSize: "14px", marginTop: "4px" }}>Check back later or contact the host</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {rooms.map((room: any, i: number) => (
              <div className="room-card" key={room._id}>

                {/* IMAGE */}
                <div className="room-image-wrap">
                  {room.picture ? (
                    <Image
                      src={fixImageUrl(room.picture)}
                      alt={room.name}
                      width={240}
                      height={200}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "200px",
                      background: "linear-gradient(135deg, #003580 0%, #0071c2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "48px",
                    }}>
                      🏢
                    </div>
                  )}

                  {/* Room number badge */}
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(6px)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "20px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}>
                    Room {i + 1}
                  </div>
                </div>

                {/* DETAILS */}
                <div style={{
                  flex: 1,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}>
                  <div>
                    {/* Availability indicator */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <span className="availability-dot" />
                      <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>Available now</span>
                    </div>

                    <h2 style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 6px",
                      fontFamily: "'Playfair Display', serif",
                      letterSpacing: "-0.2px",
                    }}>
                      {room.name}
                    </h2>

                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 14px", lineHeight: 1.5 }}>
                      Modern workspace designed for focus and productivity
                    </p>

                    {/* Badges row */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span className="capacity-badge">
                        👥 {room.capacity} {room.capacity === 1 ? "person" : "people"}
                      </span>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "5px 12px", borderRadius: "20px",
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        color: "#15803d", fontSize: "13px", fontWeight: 600,
                      }}>
                        ✓ Instant booking
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "18px", flexWrap: "wrap", gap: "10px" }}>
                    <AdminRoomActions roomId={room._id} vid={vid} />
                    <Link href={`/workspace/${vid}/rooms/${room._id}`} className="check-btn">
                      Check availability →
                    </Link>
                  </div>
                </div>

                {/* PRICE COLUMN */}
                <div style={{
                  width: "150px",
                  minWidth: "150px",
                  borderLeft: "1px solid #f1f5f9",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "20px 14px",
                  background: "linear-gradient(180deg, #fafcff 0%, #f0f6ff 100%)",
                  gap: "4px",
                }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
                    Starting from
                  </div>
                  <div className="price-tag">฿{room.price}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>per hour</div>
                  <div style={{
                    marginTop: "12px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "#dbeafe",
                    color: "#1e40af",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.3px",
                  }}>
                    BEST VALUE
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}