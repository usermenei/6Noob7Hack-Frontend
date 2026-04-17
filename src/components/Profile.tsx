import Link from "next/link";

interface ProfileProps {
  session: any;
  userData: any;
}

export default function Profile({ session, userData }: ProfileProps) {
  if (!session) {
    return (
      <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
        <div style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)", padding: "40px 24px", textAlign: "center", color: "#fff" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800 }}>My Profile</h1>
        </div>
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <p style={{ color: "#374151", marginBottom: "12px" }}>
            Please sign in to view your profile.
          </p>
          <Link href="/api/auth/signin" style={{ color: "#0891b2", fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (!userData) {
    return (
      <main style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#111827", fontWeight: 600 }}>
          Failed to load profile
        </p>
      </main>
    );
  }

  const initials = session.user?.name?.slice(0, 2).toUpperCase() ?? "?";

  // ✅ ใช้ค่าจาก server โดยตรง
  const entries = userData.numberOfEntries || 0;
  const rank = userData.rank || 0;
  const title = userData.title || "Newbie";
  const discount = userData.discount || 0;

  const accountDetails = [
    { label: "Name", value: session.user?.name },
    { label: "Email", value: session.user?.email },
    { label: "Entries", value: entries }, // ✅ เพิ่ม
    { label: "Rank", value: `${title} (Lv.${rank})` }, // ✅ FIX
    { label: "Discount", value: `${discount}%` } // ✅ FIX
  ];

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)", padding: "36px 24px", textAlign: "center", color: "#fff" }}>
        <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 800, margin: "0 auto 12px" }}>
          {initials}
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: 800 }}>
          {session.user?.name}
        </h1>

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)" }}>
          {session.user?.email}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "20px" }}>
          <div>
            <p style={{ fontSize: "20px", fontWeight: 800 }}>{entries}</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>
              Entries
            </p>
          </div>
          <div>
            <p style={{ fontSize: "20px", fontWeight: 800 }}>{title}</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>
              Rank
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ maxWidth: "460px", margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "14px", border: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: "14px", fontWeight: 800, color: "#111827", marginBottom: "14px" }}>
            Account Details
          </p>

          {accountDetails.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f3f4f6"
              }}
            >
              <span style={{ color: "#374151", fontWeight: 500 }}>
                {row.label}
              </span>
              <span style={{ fontWeight: 700, color: "#111827" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/api/auth/signout"
          style={{
            display: "block",
            textAlign: "center",
            padding: "14px",
            borderRadius: "16px",
            background: "#fee2e2",
            color: "#dc2626",
            fontWeight: 700,
            border: "1px solid #fecaca"
          }}
        >
          Sign Out
        </Link>
      </div>
    </main>
  );
}