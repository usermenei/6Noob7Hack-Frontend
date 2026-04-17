"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import createCoworkingSpace from "@/libs/createCoworkingSpace";

export default function CreateSpace() {
    const { data: session } = useSession();
    const router = useRouter();

    const token = (session?.user as any)?.token;
    const role = (session?.user as any)?.role;

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        district: "",
        province: "",
        postalcode: "",
        region: "",
        tel: "",
        openTime: "08:00",
        closeTime: "18:00",
        picture: "",
        caption: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (role !== "admin") {
        return (
        <div style={{ textAlign: "center", padding: "50px", color: "#6b7280" }}>
            <h2>Access Denied</h2>
            <p>This page is restricted to administrators only.</p>
        </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
        await createCoworkingSpace(token, formData);
        alert("Coworking Space created successfully! 🎉");
        router.push("/workspace");
        router.refresh();
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
        transition: "border-color 0.2s",
    };

    const gridRowStyle = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "16px",
    };

    const singleRowStyle = {
        marginBottom: "16px",
    };

    return (
        <main style={{ background: "#f4f5f7", minHeight: "100vh", padding: "40px 24px" }}>
        <div
            style={{
            maxWidth: "650px",
            margin: "0 auto",
            background: "#ffffff",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
        >
            <div style={{ marginBottom: "24px", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
            <h2 style={{ color: "#0c4a6e", fontSize: "28px", fontWeight: 800, margin: 0 }}>
                Create New Space
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
                Add a new coworking space to the catalog
            </p>
            </div>

            {error && (
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", border: "1px solid #f87171" }}>
                ⚠️ {error}
            </div>
            )}

            <form onSubmit={handleSubmit}>
            <div style={singleRowStyle}>
                <label style={labelStyle}>Venue Name</label>
                <input type="text" name="name" required placeholder="e.g. The Hive Thonglor" style={inputStyle} onChange={handleChange} />
            </div>

            <div style={singleRowStyle}>
                <label style={labelStyle}>Full Address</label>
                <input type="text" name="address" required placeholder="123 Sukhumvit Road..." style={inputStyle} onChange={handleChange} />
            </div>

            <div style={gridRowStyle}>
                <div>
                <label style={labelStyle}>District</label>
                <input type="text" name="district" required placeholder="Watthana" style={inputStyle} onChange={handleChange} />
                </div>
                <div>
                <label style={labelStyle}>Province</label>
                <input type="text" name="province" required placeholder="Bangkok" style={inputStyle} onChange={handleChange} />
                </div>
            </div>

            <div style={gridRowStyle}>
                <div>
                <label style={labelStyle}>Postal Code</label>
                <input type="text" name="postalcode" required placeholder="10110" style={inputStyle} onChange={handleChange} />
                </div>
                <div>
                <label style={labelStyle}>Region</label>
                <input type="text" name="region" required placeholder="Central" style={inputStyle} onChange={handleChange} />
                </div>
            </div>

            <div style={singleRowStyle}>
                <label style={labelStyle}>Telephone Number</label>
                <input 
                type="tel" 
                name="tel" 
                required 
                placeholder="e.g. 081-234-5678" 
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" 
                title="Please enter a valid phone number in the format XXX-XXX-XXXX" 
                style={inputStyle} 
                onChange={handleChange} 
                />
            </div>

            <div style={gridRowStyle}>
                <div>
                <label style={labelStyle}>Open Time</label>
                <input type="time" name="openTime" value={formData.openTime} required style={inputStyle} onChange={handleChange} />
                </div>
                <div>
                <label style={labelStyle}>Close Time</label>
                <input type="time" name="closeTime" value={formData.closeTime} required style={inputStyle} onChange={handleChange} />
                </div>
            </div>

            <div style={singleRowStyle}>
                <label style={labelStyle}>Picture URL (Optional)</label>
                <input type="url" name="picture" placeholder="https://example.com/image.jpg" style={inputStyle} onChange={handleChange} />
            </div>

            <div style={singleRowStyle}>
                <label style={labelStyle}>Caption (Optional)</label>
                <input type="text" name="caption" placeholder="A brief description of the space..." style={inputStyle} onChange={handleChange} />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <Link
                href="/workspace"
                style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "14px",
                    background: "#f3f4f6",
                    color: "#4b5563",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    textDecoration: "none",
                    transition: "background 0.2s",
                }}
                >
                Cancel
                </Link>
                <button
                type="submit"
                disabled={loading}
                style={{
                    flex: 2,
                    padding: "14px",
                    background: loading ? "#9ca3af" : "#0891b2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 4px 6px -1px rgba(8, 145, 178, 0.4)",
                    transition: "all 0.2s",
                }}
                >
                {loading ? "Creating Space..." : "Create Space"}
                </button>
            </div>
            </form>
        </div>
        </main>
    );
}