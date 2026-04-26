// page.tsx

import AdminDashboard from "./AdminDashboard";

// สามารถตั้งค่า Metadata สำหรับหน้านี้ได้ (SEO & Browser Tab Title)
export const metadata = {
  title: "Admin Dashboard | Coworking Space",
  description: "Manage your application settings, payments, and audit logs.",
};

export default function AdminPage() {
  return (
    <>
      <AdminDashboard />
    </>
  );
}