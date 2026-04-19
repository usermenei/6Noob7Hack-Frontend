import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import {
  AdminCreateButton,
  AdminRoomActions,
} from "@/components/AdminControls";
import styles from "./RoomsPage.module.css"; // นำเข้า CSS Module

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
    <main className={styles.main}>
      {/* ── HERO ── */}
      <div className={styles.hero}>
        <div className={styles.heroDecor1} />
        <div className={styles.heroDecor2} />

        <div className={styles.heroContainer}>
          <Link href={`/workspace/${vid}`} className={styles.backLink}>
            ← Back to workspace
          </Link>

          <h1 className={styles.heroTitle}>Find your perfect room</h1>

          <p className={styles.heroSubtitle}>
            {rooms.length} room{rooms.length !== 1 ? "s" : ""} available · Compare, book, and work smarter
          </p>

          <AdminCreateButton vid={vid} />
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── ROOM LIST ── */}
      <div className={styles.contentContainer}>
        {rooms.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏢</div>
            <p className={styles.emptyTitle}>No rooms available yet</p>
            <p className={styles.emptyDesc}>Check back later or contact the host</p>
          </div>
        )}

        <div className={styles.roomList}>
          {rooms.map((room: any, i: number) => (
            <div className={styles.roomCard} key={room._id}>
              
              {/* IMAGE */}
              <div className={styles.imageWrap}>
                {room.picture ? (
                  <Image
                    src={fixImageUrl(room.picture)}
                    alt={room.name}
                    width={280}
                    height={240}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div className={styles.fallbackImage}>🏢</div>
                )}
                <div className={styles.roomBadge}>Room {i + 1}</div>
              </div>

              {/* DETAILS */}
              <div className={styles.detailsWrap}>
                
                {/* ⭐️ ย้ายปุ่ม Edit / Delete มาไว้มุมขวาบนตรงนี้แทน และใช้ CSS บังคับดีไซน์ให้ซอฟต์ลง */}
                <div className={styles.adminActions}>
                  <AdminRoomActions roomId={room._id} vid={vid} />
                </div>

                <div className={styles.statusWrap}>
                  <span className={styles.availabilityDot} />
                  <span className={styles.statusText}>Available now</span>
                </div>

                <h2 className={styles.roomName}>{room.name}</h2>
                
                <p className={styles.roomDesc}>
                  Modern workspace designed for focus and productivity.
                </p>

                <div className={styles.badgesRow}>
                  <span className={styles.capacityBadge}>
                    👥 {room.capacity} {room.capacity === 1 ? "person" : "people"}
                  </span>
                  <span className={styles.featureBadge}>
                    ✓ Instant booking
                  </span>
                </div>

                <div className={styles.footerRow}>
                  <Link href={`/workspace/${vid}/rooms/${room._id}`} className={styles.checkBtn}>
                    Check availability →
                  </Link>
                </div>
              </div>

              {/* PRICE COLUMN */}
              <div className={styles.priceColumn}>
                <div className={styles.priceLabel}>Starting from</div>
                <div className={styles.priceTag}>฿{room.price}</div>
                <div className={styles.priceUnit}>per hour</div>
                <div className={styles.bestValue}>BEST VALUE</div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </main>
  );
}