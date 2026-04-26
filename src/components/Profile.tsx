import Link from "next/link";
import styles from "./profile.module.css"; // ✅ Import CSS Module

interface ProfileProps {
  session: any;
  userData: any;
}

export default function Profile({ session, userData }: ProfileProps) {
  if (!session) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.heroSimple}>
          <h1 className={styles.titleSimple}>My Profile</h1>
        </div>
        <div className={styles.unauthContent}>
          <p className={styles.unauthText}>
            Please sign in to view your profile.
          </p>
          <Link href="/api/auth/signin" className={styles.signInLink}>
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (!userData) {
    return (
      <main className={styles.errorContainer}>
        <p className={styles.errorText}>Failed to load profile</p>
      </main>
    );
  }

  const initials = session.user?.name?.slice(0, 2).toUpperCase() ?? "?";

  // ✅ เช็คสิทธิ์ Admin (คุณสามารถปรับเปลี่ยน 'role' ตามโครงสร้าง Data ของคุณได้เลย)
  const isAdmin = session.user?.role === "admin" || userData?.role === "admin";

  const entries = userData.numberOfEntries || 0;
  const rank = userData.rank || 0;
  const title = userData.title || "Newbie";
  const discount = userData.discount || 0;

  const accountDetails = [
    { label: "Name", value: session.user?.name },
    { label: "Email", value: session.user?.email },
    { label: "Entries", value: entries },
    { label: "Rank", value: `${title} (Lv.${rank})` },
    { label: "Discount", value: `${discount}%` },
  ];

  return (
    <main className={styles.mainContainer}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.avatar}>{initials}</div>
        <h1 className={styles.userName}>{session.user?.name}</h1>
        <p className={styles.userEmail}>{session.user?.email}</p>

        <div className={styles.statsContainer}>
          <div>
            <p className={styles.statValue}>{entries}</p>
            <p className={styles.statLabel}>Entries</p>
          </div>
          <div>
            <p className={styles.statValue}>{title}</p>
            <p className={styles.statLabel}>Rank</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className={styles.detailsWrapper}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Account Details</p>

          {accountDetails.map((row) => (
            <div key={row.label} className={styles.row}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={styles.rowValue}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* ✅ แสดงปุ่ม Admin Dashboard เฉพาะตอนที่ isAdmin เป็น true เท่านั้น */}
        {isAdmin && (
          <Link href="/admin" className={styles.linkAdmin}>
            ⚙️ Admin Dashboard
          </Link>
        )}

        <Link href="/payments/history" className={styles.linkHistory}>
          Payment History
        </Link>

        <Link href="/api/auth/signout" className={styles.linkSignOut}>
          Sign Out
        </Link>
      </div>
    </main>
  );
}