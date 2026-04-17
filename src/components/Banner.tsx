"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

// สีและ Emoji สำรองเอาไว้สุ่มใช้กับข้อมูลจาก Backend
const fallbackGradients = [
  "linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)",
  "linear-gradient(135deg, #134e4a 0%, #0f9b8e 100%)",
  "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)",
];
const fallbackEmojis = ["🌸", "⚡", "🪑", "🏢", "☕"];
const fallbackLabels = ["Featured Space", "Hot Desk Pick", "Premium Meeting", "New Arrival"];

export default function Banner() {
  const [slides, setSlides] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();

  // 1. ดึงข้อมูลจาก Backend ตอนโหลด Component
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${url}/coworkingspaces`);
        const json = await res.json();

        if (json.success && json.data.length > 0) {
          const allSpaces = json.data.map((space: any, i: number) => ({
            id: space._id,
            title: space.name,
            sub: space.caption || `Located in ${space.district}, ${space.province}`,
            label: fallbackLabels[i % fallbackLabels.length],
            gradient: fallbackGradients[i % fallbackGradients.length],
            emoji: fallbackEmojis[i % fallbackEmojis.length],
            picture: space.picture, 
          }));
          setSlides(allSpaces);
        }
      } catch (error) {
        console.error("Failed to fetch banner spaces:", error);
      }
    };

    fetchSpaces();
  }, []);

  // 2. จัดการเรื่อง Auto Slide
  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  // ✅ ฟังก์ชันคำนวณตำแหน่งการคลิกซ้าย-ขวา
  const handleBannerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // ดึงขนาดของแบนเนอร์และหาจุดที่คลิก
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // ตำแหน่งแนวนอนที่คลิกเทียบกับกรอบแบนเนอร์
    const width = rect.width;

    if (clickX < width / 2) {
      // กดครึ่งซ้าย: ถอยกลับ 1 สไลด์ (บวก slides.length กันค่าติดลบตอนอยู่สไลด์แรก)
      setIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    } else {
      // กดครึ่งขวา: เดินหน้า 1 สไลด์
      setIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }
  };

  if (slides.length === 0) {
    return <div className="animate-pulse" style={{ width: "100%", height: "400px", background: "#f1f5f9" }} />;
  }

  const slide = slides[index];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
        background: slide.gradient,
        transition: "background 0.8s ease",
        cursor: "pointer",
        overflow: "hidden",
        userSelect: "none",
      }}
      onClick={handleBannerClick} // ✅ เรียกใช้ฟังก์ชันแยกซ้ายขวาตรงนี้
    >
      {/* รูปภาพจริง (ถ้ามี) */}
      {slide.picture && (
        <>
          <Image
            src={slide.picture}
            alt={slide.title}
            fill
            // unoptimized 
            style={{ objectFit: "cover", zIndex: 1 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2 }} />
        </>
      )}

      {/* Decorative emoji */}
      <div style={{ position: "absolute", right: "80px", top: "50%", transform: "translateY(-50%)", fontSize: "160px", opacity: slide.picture ? 0.05 : 0.08, pointerEvents: "none", lineHeight: 1, zIndex: 3 }}>
        {slide.emoji}
      </div>

      {/* Welcome badge */}
      {session && (
        <div style={{ position: "absolute", top: "16px", right: "20px", zIndex: 20, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "12px", fontWeight: 700, padding: "6px 14px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.3)" }}>
          Welcome, {session.user?.name}
        </div>
      )}

      {/* Main content */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center", padding: "24px", zIndex: 10 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.9, marginBottom: "12px" }}>
          {slide.label}
        </p>
        <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "12px", fontFamily: "'Playfair Display', serif", lineHeight: 1.15, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
          {slide.title}
        </h1>
        <p style={{ fontSize: "15px", opacity: 0.95, maxWidth: "480px", lineHeight: 1.6, marginBottom: "24px", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
          {slide.sub}
        </p>
        <button
          style={{ background: "#fff", color: "#0891b2", border: "none", padding: "11px 28px", borderRadius: "24px", fontSize: "13px", fontWeight: 800, cursor: "pointer", letterSpacing: "0.5px", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
          onClick={(e) => { e.stopPropagation(); router.push(`/workspace/${slide.id}`); }}
        >
          Explore Spaces
        </button>
      </div>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 20 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
            style={{ width: i === index ? "22px" : "8px", height: "8px", borderRadius: "4px", background: i === index ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }}
          />
        ))}
      </div>
    </div>
  );
}