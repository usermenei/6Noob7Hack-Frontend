"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
  };

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
    marginBottom: "20px",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  };

  return (
    <main
      style={{
        background: "#f4f5f7",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#ffffff",
          padding: "40px 32px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              color: "#0c4a6e",
              fontSize: "28px",
              fontWeight: 800,
              margin: "0 0 8px 0",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
            Sign in to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              required
              placeholder="yourgmail@example.com"
              style={inputStyle}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              style={inputStyle}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#9ca3af" : "#0891b2",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 6px -1px rgba(8, 145, 178, 0.4)",
              marginTop: "10px",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "14px", color: "#6b7280" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "#0891b2", fontWeight: 600, textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}