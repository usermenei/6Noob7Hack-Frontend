"use client";

import { signOut } from "next-auth/react";
import styles from "./SignOut.module.css"; // (สร้างไฟล์ CSS หรือจะใช้ Tailwind/Inline style ก็ได้ครับ)

export default function SignOutPage() {
    const handleSignOut = () => {
        // กำหนด callbackUrl ว่าพอล็อกเอาท์เสร็จ จะให้เด้งไปหน้าไหน (เช่น หน้าแรก หรือ หน้าล็อกอิน)
        signOut({ callbackUrl: "/" }); 
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f9fafb" }}>
        <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <h2 style={{ marginBottom: "10px", color: "#333" }}>Sign Out</h2>
            <p style={{ marginBottom: "24px", color: "#666" }}>Are you sure you want to sign out?</p>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button 
                onClick={handleSignOut}
                style={{ padding: "10px 20px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
                Yes, Sign Out
            </button>
            
            <button 
                onClick={() => window.history.back()} // กดเพื่อกลับไปหน้าก่อนหน้า
                style={{ padding: "10px 20px", backgroundColor: "#e5e7eb", color: "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
            >
                Cancel
            </button>
            </div>
        </div>
        </div>
    );
}