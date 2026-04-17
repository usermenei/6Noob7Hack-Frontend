'use client'

import { useSearchParams } from "next/navigation";
import BookingForm from "./BookingForm";

export default function BookingClient({ token }: { token?: string }) {
  const searchParams = useSearchParams();
  const space = searchParams.get("spaceId"); // ✅ matches ?spaceId=xxx from WorkspaceCatalog

  return (
    <BookingForm
      token={token}
      initialSpace={space ?? ""}
    />
  );
}