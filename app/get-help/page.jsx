import React from 'react';
import Link from 'next/link';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import styles from "./page.module.css"


export default function GetHelp() {
  return (
    <>
    <Link href={"/"} className="flex-btn back-btn">
        <ArrowBackIosNewIcon className='back-icon'/>
        <p>Back To Home</p>
      </Link>
      <img src="/Line.png" alt="" className='line-image' id='analysisLine2' />
      <img src="/Line.png" alt="" className='line-image' id='analysisLine1' />
      <div className={styles.helpPageContainer}>
        <h1>Need Help? We've Got You Covered</h1>

        <section className={styles.helpSection}>
          <h2>👤 Creating an Account</h2>
          <p>To create an account, follow these steps:</p>
          <ul className={styles.helpList}>
            <li>Go to the <span className={styles.buttonHighlight}>Sign Up</span> page.</li>
            <li>Fill in your Name, Email, Password, Role, Department, Company.</li>
            <li>If you selected <b>BIA</b> department, choose a specific <b>Module</b>.</li>
            <li>Click on <span className={styles.buttonHighlight}>Create Account</span>.</li>
          </ul>
        </section>

        <section className={styles.helpSection}>
          <h2>🔐 Logging In</h2>
          <p>To access your dashboard:</p>
          <ul className={styles.helpList}>
            <li>Visit the <span className={styles.buttonHighlight}>Login</span> page.</li>
            <li>Enter your registered email and password.</li>
            <li>Click <span className={styles.buttonHighlight}>Login</span> to continue.</li>
          </ul>
        </section>

        <section className={styles.helpSection}>
          <h2>🧭 Button Guide</h2>
          <ul className={styles.helpList}>
            <li><span className={styles.buttonHighlight}>Add New</span>: Add a new risk or BIA record.</li>
            <li><span className={styles.buttonHighlight}>Edit</span>: Modify existing entries.</li>
            <li><span className={styles.buttonHighlight}>Delete</span>: Permanently remove a record.</li>
            <li><span className={styles.buttonHighlight}>Submit</span>: Send your data for approval.</li>
            <li><span className={styles.buttonHighlight}>Approve / Reject</span>: Available for Owners and Admins to review.</li>
          </ul>
        </section>

            <section className={styles.helpSection}>
          <h2>🛡️ Role-based Functionalities</h2>
          <div className={styles.roleTable}>
            <div className={`${styles.roleRow} ${styles.roleHeader}`}>
              <div>Role</div>
              <div>Permissions</div>
            </div>

            <div className={styles.roleRow}>
              <div><b>Champion</b></div>
              <div>
                <ul>
                  <li>Create data entries</li>
                  <li>Edit and delete own entries</li>
                  <li>Submit data for approval</li>
                </ul>
              </div>
            </div>

            <div className={styles.roleRow}>
              <div><b>Owner</b></div>
              <div>
                <ul>
                  <li>View all entries of their department and company</li>
                  <li>Approve or Reject submissions</li>
                  <li>Cannot delete or final approve</li>
                </ul>
              </div>
            </div>

            <div className={styles.roleRow}>
              <div><b>Admin</b></div>
              <div>
                <ul>
                  <li>View all data across all departments</li>
                  <li>Final Approve or Reject any data</li>
                  <li>Cannot create or edit entries</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.helpSection}>
          <h2>❓ Still Need Help?</h2>
          <p>If you’re still stuck, feel free to reach out to the IT/Admin team of your company or contact the platform developer for support.</p>
        </section>
      </div>
    </>
  );
}
