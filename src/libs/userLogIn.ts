const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export default async function userLogin(
  email: string,
  password: string
) {
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    console.log("API RESPONSE:", data);

    if (!res.ok) return null;

    return data; // { success, token }
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}