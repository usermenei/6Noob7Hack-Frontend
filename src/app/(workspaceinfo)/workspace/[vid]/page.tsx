import Image from "next/image";
import Link from "next/link";
import getCoworkingSpace from "@/libs/getCoworkingSpace";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ vid: string }>;
}) {
  const { vid } = await Promise.resolve(params);
  const detail = await getCoworkingSpace(vid);
  const v = detail.data;

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)", padding: "40px 24px", textAlign: "center", color: "#fff", position: "relative" }}>
        <Link href="/workspace" style={{ textDecoration: "none", position: "absolute", left: "20px", top: "20px", fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "6px", fontFamily: "'Playfair Display', serif" }}>
          {v.name}
        </h1>
        <p style={{ fontSize: "13px", opacity: 0.8 }}>{v.district}, {v.province}</p>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>

          {/* Picture — real if available, gradient fallback */}
          {v.picture ? (
            <div style={{ position: "relative", width: "100%", height: "220px" }}>
              <Image 
                src={v.picture} 
                alt={v.caption ?? v.name} 
                fill 
                style={{ objectFit: "cover" }} 
              />
            </div>
          ) : (
            <div style={{ height: "160px", background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "56px" }}>
              🏢
            </div>
          )}

          {/* Caption */}
          {v.caption && (
            <p style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic", padding: "12px 24px 0", textAlign: "center" }}>
              {v.caption}
            </p>
          )}

          {/* Details */}
          <div style={{ padding: "20px 24px" }}>
            {[
              { label: "Address",     value: v.address },
              { label: "District",    value: v.district },
              { label: "Province",    value: v.province },
              { label: "Postal Code", value: v.postalcode },
              { label: "Region",      value: v.region },
              { label: "Tel",         value: v.tel },
              { label: "Hours",       value: `${v.openTime} – ${v.closeTime}` },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" }}>
                <span style={{ color: "#9ca3af", fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontWeight: 800, color: "#111" }}>{row.value}</span>
              </div>
            ))}

            {/* ✅ Pass spaceId so booking form pre-selects this space */}
            <Link
            href={`/workspace/${vid}/rooms`}
            style={{
              textDecoration: "none",
              display: "block",
              width: "100%",
              textAlign: "center",
              background: "#0891b2",
              color: "#fff",
              fontWeight: 800,
              fontSize: "14px",
              padding: "13px",
              borderRadius: "12px",
              marginTop: "20px",
              letterSpacing: "0.5px"
            }}>
            View Rooms →
          </Link>
          </div>
        </div>
      </div>
    </main>
  );
}