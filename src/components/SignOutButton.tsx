"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        // เอา className="topmenu-signout" ออกไปได้เลยครับ
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          padding: 0,
          color: "#9ca3af",    
          fontSize: "15px",    
          fontWeight: "normal" 
        }}
      >
        Sign out
      </button>

      {showConfirm && (
        <div 
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div 
            style={{
              background: "white",
              padding: "40px 48px",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
              fontFamily: "'Nunito', sans-serif",
              minWidth: "400px",
              maxWidth: "90vw"
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", color: "#1f2937", fontSize: "24px" }}>Sign Out</h3>
            
            <p style={{ margin: "0 0 32px 0", color: "#4b5563", fontSize: "16px" }}>
              Are you sure you want to sign out?
            </p>
            
            {/* ✅ กล่องสำหรับปุ่มยืนยันหลัก */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px", width: "100%" }}>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#ef4444", // สีแดง
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                  width: "100%", // ขยายให้เต็มความกว้างของ Modal
                }}
              >
                Yes, Sign out
              </button>
            </div>

            {/* ✅ กล่องสำหรับปุ่ม Cancel ที่เพิ่มด้านล่าง */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "24px", width: "100%" }}>
              <button
                onClick={() => setShowConfirm(false)} // พอกด Cancel ให้ปิด Popup
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#374151", // สีเทาเข้ม
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}