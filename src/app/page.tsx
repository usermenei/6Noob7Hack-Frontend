"use client";

import Banner from "@/components/Banner";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

// --- Quick Links ---
const quickLinks = [
  { tag: "Quick Action", title: "Reserve a Space",     desc: "Book your desk or room in minutes",     href: "/booking",    icon: "📅" },
  { tag: "My Account",   title: "View My Bookings",    desc: "Manage and cancel reservations",        href: "/mybooking",  icon: "📋" },
  { tag: "Profile",      title: "My CoSpace Profile",  desc: "Edit avatar and account settings",      href: "/profile",    icon: "👤" },
];

const fallbackGradients = [
  "linear-gradient(160deg, #0c4a6e 0%, #0891b2 100%)",
  "linear-gradient(160deg, #134e4a 0%, #0f9b8e 100%)",
  "linear-gradient(160deg, #1e1b4b 0%, #4f46e5 100%)",
];
const fallbackEmojis = ["🌸", "⚡", "🪑", "🏢", "☕"];
const fallbackTags = ["Private Office", "Hot Desk", "Meeting Room", "Co-working"];

export default function Home() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3; // ✅ กำหนดให้แสดงหน้าละ 3 อัน

  // 1. ดึงข้อมูลจาก Backend เมื่อโหลดหน้าจอ
  useEffect(() => {
    async function fetchSpaces() {
      try {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${url}/coworkingspaces`);
        const json = await res.json();

        if (json.success && json.data) {
          const formattedSpaces = json.data.map((space: any, i: number) => ({
            gradient: fallbackGradients[i % fallbackGradients.length],
            emoji: fallbackEmojis[i % fallbackEmojis.length],
            tag: fallbackTags[i % fallbackTags.length],
            name: space.name,
            desc: space.caption || `Located in ${space.district}, ${space.province}. Perfect for deep focus and creative teams.`,
            href: `/workspace/${space._id}`,
            picture: space.picture, // ✅ มีรูปเหมือนเดิม
          }));
          setSpaces(formattedSpaces);
        }
      } catch (error) {
        console.error("Error fetching spaces in Home:", error);
      }
    }
    fetchSpaces();
  }, []);

  // 2. คำนวณจำนวนหน้าและการตัดข้อมูลมาแสดงแค่ 3 อันตามหน้าปัจจุบัน
  const totalPages = Math.ceil(spaces.length / itemsPerPage);
  const currentSpaces = spaces.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <main style={{ background: "#f4f5f7", minHeight: "100vh" }}>
      <Banner />

      {/* Our Spaces */}
      <div style={{ background: "#fff", padding: "24px 24px 28px", maxWidth: "100vw" }}>
        
        {/* Header ของ Section & ปุ่มลูกศรเปลี่ยนหน้า */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "#0891b2", margin: 0 }}>
            Our Spaces
          </p>
          
          {/* ซ่อนปุ่มถ้าข้อมูลยังโหลดไม่เสร็จ หรือมีแค่หน้าเดียว */}
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #e2e8f0", 
                  background: currentPage === 0 ? "#f8fafc" : "#fff",
                  color: currentPage === 0 ? "#cbd5e1" : "#0891b2",
                  cursor: currentPage === 0 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold",
                  boxShadow: currentPage === 0 ? "none" : "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                ←
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #e2e8f0", 
                  background: currentPage >= totalPages - 1 ? "#f8fafc" : "#fff",
                  color: currentPage >= totalPages - 1 ? "#cbd5e1" : "#0891b2",
                  cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold",
                  boxShadow: currentPage >= totalPages - 1 ? "none" : "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
        
        {/* ✅ เปลี่ยนกลับมาใช้ Grid แบ่ง 3 ช่องเหมือนเดิม */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {spaces.length === 0 ? (
            <p style={{ gridColumn: "span 3", textAlign: "center", color: "#6b7280", padding: "40px" }}>
              Loading spaces...
            </p>
          ) : (
            currentSpaces.map((card: any) => (
              <Link 
                key={card.name} 
                href={card.href} 
                className="fc-card" 
                style={{ 
                  textDecoration: "none", 
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}
              >
                <div style={{ background: card.gradient, height: "180px", position: "relative", display: "flex", alignItems: "flex-end", padding: "16px", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
                  
                  {/* แสดงรูปภาพถ้ามี */}
                  {card.picture && (
                    <>
                      <Image 
                        src={card.picture} 
                        alt={card.name} 
                        fill 
                        style={{ objectFit: "cover", zIndex: 1 }} 
                        // unoptimized 
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.7))", zIndex: 2 }} />
                    </>
                  )}

                  {!card.picture && (
                    <span style={{ position: "absolute", top: "16px", right: "20px", fontSize: "52px", opacity: 0.15, userSelect: "none", zIndex: 1 }}>
                      {card.emoji}
                    </span>
                  )}

                  <div style={{ position: "relative", zIndex: 3 }}>
                    <p style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>{card.tag}</p>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", lineHeight: 1.2, fontFamily: "'Playfair Display', serif" }}>{card.name}</h3>
                  </div>
                </div>

                <div style={{ padding: "16px 18px 20px", background: "#f8fafc", borderRadius: "0 0 12px 12px", border: "1px solid #e2e8f0", borderTop: "none", flexGrow: 1 }}>
                  <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, marginBottom: "12px", height: "42px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {card.desc}
                  </p>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#0891b2" }}>Reserve now →</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", padding: "16px 24px 28px" }}>
        {quickLinks.map((ql) => (
          <Link key={ql.title} href={ql.href} className="qk-card" style={{ textDecoration: "none", background: "#fff", padding: "16px", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "center", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: "28px", lineHeight: 1, flexShrink: 0 }}>{ql.icon}</span>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#0891b2", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "3px" }}>{ql.tag}</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#111", marginBottom: "3px" }}>{ql.title}</p>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>{ql.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}