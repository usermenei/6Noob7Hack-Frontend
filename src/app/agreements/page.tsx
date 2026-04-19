import styles from "../../components/Policy.module.css";

export default function UserAgreementPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>User Agreement</h1>
      <p className={styles.lastUpdated}>Last updated: April 19, 2026</p>

      <p className={styles.paragraph}>
        Welcome to CoSpace. By accessing our website and using our coworking facilities, you agree to be bound by the following terms and conditions. Please read them carefully before making any reservations.
      </p>

      <h2 className={styles.sectionTitle}>1. Account Responsibilities</h2>
      <p className={styles.paragraph}>
        When you create an account with us, you must provide accurate and complete information. You are responsible for:
      </p>
      <ul className={styles.list}>
        <li className={styles.listItem}>Maintaining the confidentiality of your account login credentials.</li>
        <li className={styles.listItem}>All activities that occur under your account.</li>
        <li className={styles.listItem}>Notifying us immediately of any unauthorized use of your account.</li>
      </ul>

      <h2 className={styles.sectionTitle}>2. Workspace Conduct & Rules</h2>
      <p className={styles.paragraph}>
        We strive to provide a productive and respectful environment for all our members. While using CoSpace facilities, you agree to:
      </p>
      <ul className={styles.list}>
        <li className={styles.listItem}><strong>Noise Level:</strong> Keep phone calls and conversations at a reasonable volume, especially in shared Hot Desk areas.</li>
        <li className={styles.listItem}><strong>Cleanliness:</strong> Leave your workspace clean and dispose of any trash before you leave.</li>
        <li className={styles.listItem}><strong>Equipment:</strong> Use all shared equipment (e.g., printers, monitors) with care and report any damages immediately.</li>
      </ul>

      <h2 className={styles.sectionTitle}>3. Payments and Cancellations</h2>
      <p className={styles.paragraph}>
        By booking a space, you agree to our payment terms:
      </p>
      <ul className={styles.list}>
        <li className={styles.listItem}>Payments must be completed upfront through our online booking system.</li>
        <li className={styles.listItem}>Cancellations made at least 24 hours in advance are eligible for a full refund.</li>
        <li className={styles.listItem}>No-shows or late cancellations will not be refunded.</li>
      </ul>

      <h2 className={styles.sectionTitle}>4. Limitation of Liability</h2>
      <p className={styles.paragraph}>
        CoSpace is not responsible for any lost, stolen, or damaged personal property brought into our facilities. Users are fully responsible for their own belongings at all times.
      </p>
    </main>
  );
}