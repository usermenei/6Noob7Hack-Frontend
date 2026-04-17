import Link from "next/link";
import Image from "next/image";
import { CoworkingSpaceJson } from "@/libs/getCoworkingSpaces";
import styles from "./WorkspaceCatalog.module.css";

const gradients = [
  "linear-gradient(160deg, #0c4a6e 0%, #0891b2 100%)",
  "linear-gradient(160deg, #134e4a 0%, #0f9b8e 100%)",
  "linear-gradient(160deg, #1e1b4b 0%, #4f46e5 100%)",
  "linear-gradient(160deg, #7c2d12 0%, #ea580c 100%)",
  "linear-gradient(160deg, #1e3a5f 0%, #2563eb 100%)",
  "linear-gradient(160deg, #14532d 0%, #16a34a 100%)",
];

export default function WorkspaceCatalog({
  spacesJson,
}: {
  spacesJson: CoworkingSpaceJson | null;
}) {
  if (!spacesJson || !spacesJson.data) {
    return (
      <p style={{ color: "#9ca3af", fontSize: "14px" }}>
        Failed to load coworking spaces
      </p>
    );
  }

  return (
    <>
      <p className={styles.title}>
        {spacesJson.count ?? 0} spaces available
      </p>

      <div className={styles.grid}>
        {spacesJson.data.map((v, i) => (
          <div key={v._id} className={styles.card}>
            <Link href={`/workspace/${v._id}`} className={styles.cardLink}>
              {/* IMAGE */}
              {v.picture ? (
                <div className={styles.imageWrapper}>
                  <Image
                    src={v.picture}
                    alt={v.caption ?? v.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div className={styles.imageOverlay}>
                    <div>
                      <p className={styles.region}>{v.region}</p>
                      <p className={styles.name}>{v.name}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={styles.placeholder}
                  style={{ background: gradients[i % gradients.length] }}
                >
                  <div>
                    <p className={styles.region}>{v.region}</p>
                    <p className={styles.name}>{v.name}</p>
                  </div>
                </div>
              )}
            </Link>

            {/* DETAILS */}
            <div className={styles.details}>
              <p className={styles.location}>
                {v.district}, {v.province}
              </p>

              {v.caption && (
                <p className={styles.caption}>{v.caption}</p>
              )}

              <p className={styles.time}>
                🕐 {v.openTime} – {v.closeTime}
              </p>

              {/* ✅ REPLACED BUTTON */}
              <Link
                href={`/workspace/${v._id}/rooms`}
                className={styles.reserveBtn}
              >
                View Rooms →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}