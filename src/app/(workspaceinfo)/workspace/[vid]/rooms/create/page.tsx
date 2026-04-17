"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateRoomPage({
  params,
}: {
  params: Promise<{ vid: string }>;
}) {
  const { vid } = use(params);

  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: "",
    capacity: 1,
    price: 0,
    picture: "", // ✅ ADDED
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({
          ...form,
          coworkingSpace: vid,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      router.push(`/workspace/${vid}/rooms`);
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Create Room</h1>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Room name" onChange={handleChange} />
        <br />

        <input
          name="capacity"
          type="number"
          placeholder="Capacity"
          onChange={handleChange}
        />
        <br />

        <input
          name="price"
          type="number"
          placeholder="Price"
          onChange={handleChange}
        />
        <br />

        {/* ✅ NEW: picture */}
        <input
          name="picture"
          placeholder="Image URL"
          onChange={handleChange}
        />
        <br />

        <button type="submit">Create Room</button>
      </form>
    </div>
  );
}