import BookingList from "@/components/BookingList";

export default function MyBookingPage() {
  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)", padding: "40px 24px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px", fontFamily: "'Playfair Display', serif" }}>My Reservations</h1>
        <p style={{ fontSize: "14px", opacity: 0.8 }}>Manage your upcoming coworking sessions</p>
      </div>
      <div style={{ padding: "32px 24px" }}>
        <BookingList />
      </div>
    </main>
  );
}