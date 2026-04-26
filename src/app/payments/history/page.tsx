import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
// ✅ สมมติว่าคุณมีฟังก์ชัน getAllPayments สำหรับ Admin อยู่ในไฟล์ payment
import { getPaymentsByUser, getAllPayments } from "@/libs/payment"; 
import styles from "./PaymentHistory.module.css";
import { redirect } from "next/navigation";
import PaymentHistoryTable from "./PaymentHistoryTable";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Payment History | CoSpace",
  description: "View your transaction history and payment status.",
};

export default async function PaymentHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // ✅ ดึง token, userId และ role ออกมาจาก session
  const token = (session.user as any).token;
  const userId = session.user.id;
  const role = (session.user as any).role; // เช็คจาก role ในระบบของคุณ

  let payments = [];
  try {
    // ✅ เพิ่มเงื่อนไขเช็คสิทธิ์ ถ้าเป็น admin ให้ดึงข้อมูลทั้งหมด
    if (role === "admin") {
      payments = await getAllPayments(token); 
    } else {
      // ถ้าเป็น user ปกติ ให้ดึงแค่ของตัวเอง
      payments = await getPaymentsByUser(userId, token);
    }
  } catch (error) {
    console.error("Error fetching payments:", error);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* ✅ เปลี่ยน Title ให้เข้ากับสถานะด้วยนิดหน่อยได้ครับ (optional) */}
        <h1 className={styles.title}>
          {role === "admin" ? "All Payment Records" : "Payment History"}
        </h1>
        <p className={styles.subtitle}>
          {role === "admin" 
            ? "Manage all transactions and booking payments from users" 
            : "Track your transactions and booking payments"}
        </p>
      </header>

      <div className={styles.glassCard}>
        {payments.length > 0 ? (
          <PaymentHistoryTable payments={payments} />
        ) : (
          <div className={styles.emptyState}>
            <Image 
              src="/empty-payments.png" 
              alt="No payments" 
              width={280} 
              height={280} 
              className={styles.emptyIllustration}
            />
            <div className={styles.emptyTextWrapper}>
              <h2 className={styles.emptyTitle}>No payment records yet</h2>
              <p className={styles.emptySubtitle}>
                {role === "admin" 
                  ? "There are no payment records in the system yet."
                  : "It looks like you haven't made any transactions yet. Start by booking a space!"}
              </p>
              {role !== "admin" && (
                <Link href="/workspace" className={styles.exploreBtn}>
                  Explore Spaces
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}