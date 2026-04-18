import getCoworkingSpaces from "@/libs/getCoworkingSpaces";
import WorkspaceCatalog from "@/components/WorkspaceCatalog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import Link from "next/link";

export default async function VenuePage() {
  const session = await getServerSession(authOptions);
  const token = (session?.user as any)?.token;
  const role = (session?.user as any)?.role;

  let spaces = null;

  try {
    spaces = await getCoworkingSpaces(token);
  } catch (err) {
    console.error("Failed to fetch spaces:", err);
  }

  // ✅ FIX HERE
  const firstSpaceId = spaces?.data?.[0]?._id;

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)",
          padding: "40px 24px",
          textAlign: "center",
          color: "#fff",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            marginBottom: "8px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Our Coworking Spaces
        </h1>

        <p style={{ fontSize: "14px", opacity: 0.8 }}>
          Choose a space that fits your work style
        </p>
      </div>

      <div style={{ padding: "24px" }}>
        <WorkspaceCatalog spacesJson={spaces} />
      </div>
    </main>
  );
}