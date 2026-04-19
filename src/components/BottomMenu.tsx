import Link from "next/link";
import styles from "./BottomMenu.module.css";

export default function BottomMenu() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          Copyright © {currentYear} CoSpace Inc. All rights reserved.
        </p>

        <div className={styles.linksWrapper}>
          <Link href="/privacy-policy" className={styles.link}>Privacy Policy</Link>
          <span className={styles.separator}>|</span>
          
          <Link href="/terms" className={styles.link}>Terms of Use</Link>
          <span className={styles.separator}>|</span>
          
          <Link href="/agreements" className={styles.link}>User Agreement</Link>
          {/* <span className={styles.separator}>|</span> */}
{/*           
          <Link href="/sales-and-refunds" className={styles.link}>Sales and Refunds</Link>
          <span className={styles.separator}>|</span> */}
          
          {/* <Link href="/legal" className={styles.link}>Legal</Link> */}
          {/* <span className={styles.separator}>|</span> */}
          
          {/* <Link href="/sitemap" className={styles.link}>Site Map</Link> */}
        </div>
      </div>
    </footer>
  );
}