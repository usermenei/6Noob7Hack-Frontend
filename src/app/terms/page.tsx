import styles from "../../components/Policy.module.css";

export default function TermsOfUsePage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Terms of Use</h1>
      <p className={styles.lastUpdated}>Last updated: April 18, 2026</p>

      <p className={styles.paragraph}>
        These terms and conditions outline the rules and regulations for the use of CoSpace's Website and our coworking facilities.
      </p>

      <h2 className={styles.sectionTitle}>1. Booking & Cancellation</h2>
      <ul className={styles.list}>
        <li className={styles.listItem}>All reservations must be made through our official platform.</li>
        <li className={styles.listItem}>You may cancel your booking up to 24 hours in advance for a full refund.</li>
        <li className={styles.listItem}>Late cancellations or no-shows will be charged the full reservation amount.</li>
      </ul>

      <h2 className={styles.sectionTitle}>2. House Rules</h2>
      <p className={styles.paragraph}>
        To ensure a productive environment for everyone, we ask all members to strictly follow our house rules:
      </p>
      <ul className={styles.list}>
        <li className={styles.listItem}>Keep noise levels to a minimum in the Hot Desk areas.</li>
        <li className={styles.listItem}>Outside food with strong odors is not permitted inside the shared spaces.</li>
        <li className={styles.listItem}>Please leave your workspace clean and tidy after use.</li>
      </ul>

      <h2 className={styles.sectionTitle}>3. Liability</h2>
      <p className={styles.paragraph}>
        CoSpace is not responsible for any loss or damage to your personal belongings while on the premises. Members are entirely liable for any damage caused to CoSpace property or equipment during their stay.
      </p>
    </main>
  );
}