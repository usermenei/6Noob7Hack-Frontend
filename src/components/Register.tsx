"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
    const router = useRouter();

    const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        telephoneNumber: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // สร้าง State สำหรับเปิด/ปิดตาดูรหัสผ่าน
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ฟังก์ชันจัดฟอร์แมตเบอร์โทรเป็น xxx-xxx-xxxx อัตโนมัติ
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ""); // ลบตัวอักษรที่ไม่ใช่ตัวเลขออก
        if (val.length > 10) val = val.substring(0, 10); // ล็อกไว้ไม่เกิน 10 ตัว
        
        let formatted = val;
        if (val.length > 6) {
        formatted = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}`;
        } else if (val.length > 3) {
        formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
        }

        setFormData({ ...formData, telephoneNumber: formatted });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match. Please try again.");
        return;
        }

        setLoading(true);

        try {
        const res = await fetch(`${BASE}/auth/register`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            telephoneNumber: formData.telephoneNumber, 
            password: formData.password,
            role: "user",
            }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Registration failed. Please try again.");
        }

        alert("Account created successfully! 🎉");
        router.push("/api/auth/signin"); // เด้งไปหน้า Sign in

        } catch (err: any) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    };

    // Styles
    const labelStyle = {
        display: "block",
        fontSize: "14px",
        fontWeight: 600,
        color: "#374151",
        marginBottom: "6px",
        textAlign: "left" as const,
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 14px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        backgroundColor: "#f9fafb",
        color: "#111827",
        fontSize: "15px",
        outlineColor: "#0891b2",
        boxSizing: "border-box" as const,
        transition: "border-color 0.2s",
    };

    const inputWrapperStyle = {
        position: "relative" as const,
        marginBottom: "16px",
    };

    const eyeButtonStyle = {
        position: "absolute" as const,
        right: "12px",
        top: "38px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0",
        display: "flex",
        alignItems: "center",
    };

    // ไอคอนตา (เปิด/ปิด)
    const EyeIcon = ({ isOpen }: { isOpen: boolean }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isOpen ? (
            <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
            </>
        ) : (
            <>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
            </>
        )}
        </svg>
    );

    return (
        <main style={{ background: "#f4f5f7", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: "450px", background: "#ffffff", padding: "40px 32px", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            
            <div style={{ marginBottom: "28px", textAlign: "center" }}>
            <h1 style={{ color: "#0c4a6e", fontSize: "28px", fontWeight: 800, margin: "0 0 8px 0" }}>Create an Account</h1>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Join us and start booking your spaces</p>
            </div>

            {error && (
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", border: "1px solid #f87171" }}>
                ⚠️ {error}
            </div>
            )}

            <form onSubmit={handleSubmit}>
            <div style={inputWrapperStyle}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="name" required placeholder="John Doe" style={inputStyle} onChange={handleChange} />
            </div>

            <div style={inputWrapperStyle}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" name="email" required placeholder="user@example.com" style={inputStyle} onChange={handleChange} />
            </div>

            <div style={inputWrapperStyle}>
                <label style={labelStyle}>Telephone Number</label>
                <input 
                type="tel" 
                name="telephoneNumber" 
                value={formData.telephoneNumber}
                required 
                placeholder="081-234-5678" 
                style={inputStyle} 
                onChange={handlePhoneChange}
                />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={inputWrapperStyle}>
                <label style={labelStyle}>Password</label>
                <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required 
                    placeholder="••••••••" 
                    style={{ ...inputStyle, paddingRight: "40px" }} 
                    onChange={handleChange} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeButtonStyle}>
                    <EyeIcon isOpen={showPassword} />
                </button>
                </div>

                <div style={inputWrapperStyle}>
                <label style={labelStyle}>Confirm</label>
                <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    required 
                    placeholder="••••••••" 
                    style={{ ...inputStyle, paddingRight: "40px" }} 
                    onChange={handleChange} 
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeButtonStyle}>
                    <EyeIcon isOpen={showConfirmPassword} />
                </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "14px", background: loading ? "#9ca3af" : "#0891b2", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", marginTop: "16px", transition: "all 0.2s" }}
            >
                {loading ? "Creating Account..." : "Sign Up"}
            </button>
            </form>

            <p style={{ marginTop: "24px", fontSize: "14px", color: "#6b7280", textAlign: "center" }}>
            Already have an account? <Link href="/api/auth/signin" style={{ color: "#0891b2", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
            </p>
        </div>
        </main>
    );
}