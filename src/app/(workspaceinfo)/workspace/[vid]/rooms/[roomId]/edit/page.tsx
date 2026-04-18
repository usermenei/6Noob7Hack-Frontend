"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function EditRoomPage({
  params,
}: {
  params: Promise<{ vid: string; roomId: string }>;
}) {
  const { vid, roomId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: "",
    capacity: 1,
    price: 0,
    picture: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/coworkingspaces/${vid}/rooms/${roomId}`
        );
        const json = await res.json();
        if (res.ok) {
          setForm({
            name: json.data.name,
            capacity: json.data.capacity,
            price: json.data.price,
            picture: json.data.picture || "",
          });
        }
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [vid, roomId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/${roomId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.token}`,
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        router.push(`/workspace/${vid}/rooms`);
      } else {
        setError(data.message || "Update failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: "#888", textAlign: "center", padding: "40px 0" }}>
            Loading room details…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Edit Room</h1>
            <p style={styles.subtitle}>Update the details for this room</p>
          </div>
          <div style={styles.headerIcon}>✏️</div>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleUpdate} style={styles.form}>
          {/* Room Name */}
          <div style={styles.field}>
            <label style={styles.label}>Room Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. The Focus Pod"
              required
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = "#0891b2")}
              onBlur={(e) => (e.target.style.borderColor = "#e0ddd6")}
            />
          </div>

          {/* Capacity + Price side by side */}
          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Capacity</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>👥</span>
                <input
                  name="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, paddingLeft: "38px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0891b2")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0ddd6")}
                />
              </div>
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Price / hr (฿)</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>฿</span>
                <input
                  name="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, paddingLeft: "38px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0891b2")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0ddd6")}
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div style={styles.field}>
            <label style={styles.label}>Image URL</label>
            <input
              name="picture"
              value={form.picture}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = "#0891b2")}
              onBlur={(e) => (e.target.style.borderColor = "#e0ddd6")}
            />
          </div>

          {/* Image Preview */}
          {form.picture && (
            <div style={styles.previewBox}>
              <p style={styles.previewLabel}>Preview</p>
              <img
                src={form.picture}
                alt="Room preview"
                style={styles.previewImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => router.push(`/workspace/${vid}/rooms`)}
              style={styles.cancelBtn}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.background = "#e5e0d8")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.background = "#ede9e1")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.target as HTMLElement).style.background = "#0779a0";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  (e.target as HTMLElement).style.background = "#0891b2";
              }}
            >
              {loading ? "Saving…" : "Update Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f2ec",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 16px",
    fontFamily: "'Georgia', serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "560px",
    overflow: "hidden",
  },
  header: {
    background: "#1a1a2e",
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#8888aa",
  },
  headerIcon: {
    fontSize: "28px",
    opacity: 0.8,
  },
  form: {
    padding: "28px 32px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "15px",
    border: "1.5px solid #e0ddd6",
    borderRadius: "10px",
    background: "#faf8f4",
    color: "#1a1a2e",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  row: {
    display: "flex",
    gap: "16px",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "14px",
    pointerEvents: "none",
  },
  previewBox: {
    border: "1.5px dashed #d9d5cc",
    borderRadius: "10px",
    padding: "12px",
    background: "#faf8f4",
  },
  previewLabel: {
    margin: "0 0 8px",
    fontSize: "11px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  previewImg: {
    width: "100%",
    maxHeight: "180px",
    objectFit: "cover",
    borderRadius: "8px",
    display: "block",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "4px",
  },
  cancelBtn: {
    padding: "11px 22px",
    borderRadius: "10px",
    border: "none",
    background: "#ede9e1",
    color: "#555",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
  },
  submitBtn: {
    padding: "11px 28px",
    borderRadius: "10px",
    border: "none",
    background: "#0891b2",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    fontFamily: "inherit",
    transition: "background 0.15s, opacity 0.15s",
  },
  errorBanner: {
    margin: "0 32px",
    padding: "12px 16px",
    borderRadius: "10px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    fontSize: "13px",
  },
};