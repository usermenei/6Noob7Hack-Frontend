import styles from "../../components/Policy.module.css";

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.lastUpdated}>Last updated: April 18, 2026</p>

      <p className={styles.paragraph}>
        Welcome to CoSpace. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.
      </p>

      <h2 className={styles.sectionTitle}>1. Data Collection</h2>
      <p className={styles.paragraph}>
        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
      </p>
      <ul className={styles.list}>
        <li className={styles.listItem}><strong>Identity Data:</strong> includes first name, last name, and username.</li>
        <li className={styles.listItem}><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
        <li className={styles.listItem}><strong>Transaction Data:</strong> includes details about payments and booking history at our spaces.</li>
      </ul>

      <h2 className={styles.sectionTitle}>2. Data Usage</h2>
      <p className={styles.paragraph}>
        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to:
      </p>
      <ul className={styles.list}>
        <li className={styles.listItem}>Process and manage your workspace bookings.</li>
        <li className={styles.listItem}>Send you notifications regarding your account or reservations.</li>
        <li className={styles.listItem}>Improve our website, services, and customer experiences.</li>
      </ul>

      <h2 className={styles.sectionTitle}>3. User Rights</h2>
      <p className={styles.paragraph}>
        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, or erasure of your personal data.
      </p>
    </main>
  );
}