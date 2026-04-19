"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Register.module.css"; // เรียกใช้งาน CSS Module

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
    
    // State สำหรับเปิด/ปิดตาดูรหัสผ่าน และ Checkbox ข้อตกลง
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptAgreement, setAcceptAgreement] = useState(false); // 🟢 เพิ่ม State สำหรับ Checkbox

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 10) val = val.substring(0, 10);
        
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

        // 🟢 เช็คว่าติ๊กยอมรับข้อตกลงหรือยัง
        if (!acceptAgreement) {
            setError("You must accept the User Agreement to register.");
            return;
        }

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
            router.push("/api/auth/signin");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
        <main className={styles.main}>
            <div className={styles.card}>
                
                <div className={styles.header}>
                    <h1 className={styles.title}>Create an Account</h1>
                    <p className={styles.subtitle}>Join us and start booking your spaces</p>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Full Name</label>
                        <input type="text" name="name" required placeholder="John Doe" className={styles.input} onChange={handleChange} />
                    </div>

                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Email Address</label>
                        <input type="email" name="email" required placeholder="user@example.com" className={styles.input} onChange={handleChange} />
                    </div>

                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Telephone Number</label>
                        <input 
                            type="tel" 
                            name="telephoneNumber" 
                            value={formData.telephoneNumber}
                            required 
                            placeholder="081-234-5678" 
                            className={styles.input} 
                            onChange={handlePhoneChange}
                        />
                    </div>

                    <div className={styles.passwordGrid}>
                        <div className={styles.inputWrapper}>
                            <label className={styles.label}>Password</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                required 
                                placeholder="••••••••" 
                                className={`${styles.input} ${styles.passwordInput}`} 
                                onChange={handleChange} 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.eyeButton}>
                                <EyeIcon isOpen={showPassword} />
                            </button>
                        </div>

                        <div className={styles.inputWrapper}>
                            <label className={styles.label}>Confirm</label>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                name="confirmPassword" 
                                required 
                                placeholder="••••••••" 
                                className={`${styles.input} ${styles.passwordInput}`} 
                                onChange={handleChange} 
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.eyeButton}>
                                <EyeIcon isOpen={showConfirmPassword} />
                            </button>
                        </div>
                    </div>

                    {/* 🟢 Checkbox สำหรับ User Agreement */}
                    <div className={styles.checkboxWrapper}>
                        <input 
                            type="checkbox" 
                            id="agreement" 
                            className={styles.checkbox} 
                            checked={acceptAgreement}
                            onChange={(e) => setAcceptAgreement(e.target.checked)}
                        />
                        <label htmlFor="agreement" className={styles.checkboxText}>
                            I have read and agree to the <Link href="/agreements" className={styles.agreementLink} target="_blank">User Agreement</Link> and <Link href="/privacy-policy" className={styles.agreementLink} target="_blank">Privacy Policy</Link>.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <p className={styles.footer}>
                    Already have an account? <Link href="/api/auth/signin" className={styles.loginLink}>Sign in</Link>
                </p>
            </div>
        </main>
    );
}