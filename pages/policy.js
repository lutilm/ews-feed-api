import '../src/app/globals.css'
import styles from '../src/app/page.module.css'

export default function Policy() {
  return (
    <main className={styles.main}>
      <div className={styles.privacyPolicy}>
        <h2>Privacy Policy for VulnIntelGPT</h2>
        <p>
          At VulnIntelGPT, we are committed to maintaining the trust and confidence of our users. 
          In the policy below, we’ve provided detailed information on when and why we collect technical data, 
          how we use it, and the limited conditions under which we may disclose it to others.
        </p>
        <h3>Data Collection and Use</h3>
        <p>
          Our plugin, VulnIntelGPT, does not handle, store, or process personal data of our users. 
          The only information we collect is technical data related to API invocations. 
          This data is strictly used for improving our service and includes details like API call timestamps, 
          response times, and error logs. None of these data points contain personal information of any user.
        </p>
        <h3>Commitment to Privacy</h3>
        <p>
          We take privacy seriously and ensure that no personal data is collected or processed by our plugin. 
          Our goal is to provide a secure and efficient service without compromising the privacy of our users.
        </p>
      </div>
    </main>
  )
}
