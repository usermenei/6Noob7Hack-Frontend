import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import SignOutButton from "./SignOutButton";
import styles from "./TopMenu.module.css"; // ✅ Import CSS Module เข้ามา

export default async function TopMenu() {
  const session = await getServerSession(authOptions);

  return (
    <nav className={styles.topmenu}>
      <Link href="/" className={styles.logo}>
        <div className={styles.logoCircle}>CS</div>
        <span className={styles.logoText}>CoSpace</span>
      </Link>

      <div className={styles.navlinks}>
        <Link href="/workspace" className={styles.navlink}>Spaces</Link>
        <Link href="/booking" className={styles.navlink}>Booking</Link>
        <Link href="/mybooking" className={styles.navlink}>My Booking</Link>
      </div>

      <div className={styles.right}>
        {session ? (
          <>
            <Link href="/profile" className={styles.user}>
              <div className={styles.avatar}>
                {session.user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <span className={styles.username}>{session.user?.name}</span>
            </Link>
            
            {/* ✅ เรียกใช้ SignOutButton */}
            <SignOutButton />
          </>
        ) : (
          <Link href="/api/auth/signin" className={styles.signin}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}