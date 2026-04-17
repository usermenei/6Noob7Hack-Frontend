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
    picture: "", // ✅ ADDED
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/coworkingspaces/${vid}/rooms/${roomId}`
      );

      const json = await res.json();

      if (res.ok) {
        setForm({
          name: json.data.name,
          capacity: json.data.capacity,
          price: json.data.price,
          picture: json.data.picture || "", // ✅ ADDED
        });
      }
    };

    load();
  }, [vid, roomId]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();

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
      alert(data.message);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Edit Room</h1>

      <form onSubmit={handleUpdate}>
        <input name="name" value={form.name} onChange={handleChange} />
        <br />

        <input
          name="capacity"
          type="number"
          value={form.capacity}
          onChange={handleChange}
        />
        <br />

        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
        />
        <br />

        {/* ✅ NEW: picture */}
        <input
          name="picture"
          placeholder="Image URL"
          value={form.picture}
          onChange={handleChange}
        />
        <br />

        <button type="submit">Update Room</button>
      </form>
    </div>
  );
}