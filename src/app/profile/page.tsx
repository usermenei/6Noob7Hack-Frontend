import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/authOptions";
import Profile from "@/components/Profile";

// 🔥 rank calculator
const calculateRank = (entries: number) => {
  if (entries >= 500) return { rank: 6, title: "Grandmaster", discount: 90 };
  if (entries >= 100) return { rank: 5, title: "Legend", discount: 50 };
  if (entries >= 25)  return { rank: 4, title: "Diamond", discount: 25 };
  if (entries >= 10)  return { rank: 3, title: "Gold", discount: 10 };
  if (entries >= 5)   return { rank: 2, title: "Silver", discount: 5 };
  if (entries >= 1)   return { rank: 1, title: "Bronze", discount: 0 };
  return { rank: 0, title: "Newbie", discount: 0 };
};

// 🔥 fetch user profile
async function getUserProfile(token: string | undefined | null) {
  if (!token) return null;

  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const res = await fetch(`${backendUrl}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("API ERROR:", res.status);
      return null;
    }

    const result = await res.json();
    const user = result.data;

    // 🔥 ensure entries exists
    const entries = user.numberOfEntries || 0;

    // 🔥 calculate rank
    const rankData = calculateRank(entries);

    // 🔥 return merged data
    return {
      ...user,
      numberOfEntries: entries, // ✅ keep entries
      ...rankData              // ✅ add rank, title, discount
    };

  } catch (error) {
    console.error("FETCH ERROR:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  const userData = session
    ? await getUserProfile(session.user?.token)
    : null;

  return <Profile session={session} userData={userData} />;
}