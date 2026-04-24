import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { getPaymentsByUser } from "@/libs/payment";
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

  const token = (session.user as any).token;
  const userId = session.user.id;

  let payments = [];
  try {
    payments = await getPaymentsByUser(userId, token);
  } catch (error) {
    console.error("Error fetching payments:", error);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Payment History</h1>
        <p className={styles.subtitle}>Track your transactions and booking payments</p>
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
                It looks like you haven't made any transactions yet. Start by booking a space!
              </p>
              <Link href="/workspace" className={styles.exploreBtn}>
                Explore Spaces
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
