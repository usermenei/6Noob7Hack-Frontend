import BookingClient from "@/components/BookingClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";

export default async function BookingPage() {
  const session = await getServerSession(authOptions);
  const token = (session?.user as any)?.token;

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)",
          padding: "40px 24px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: 800 }}>
          Reserve a Space
        </h1>
        <p style={{ fontSize: "14px", opacity: 0.8 }}>
          Your perfect workspace is one click away
        </p>
      </div>

      <div style={{ padding: "32px 24px" }}>
        <BookingClient token={token} />
      </div>
    </main>
  );
}