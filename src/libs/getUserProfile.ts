const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  telephoneNumber: string;
  role: "user" | "admin";
  numberOfEntries: number;
}

export interface UserProfileJson {
  success: boolean;
  data: UserProfile;
}

export default async function getUserProfile(token: string): Promise<UserProfileJson> {
  const response = await fetch(`${BASE}/auth/me`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return await response.json();
}
