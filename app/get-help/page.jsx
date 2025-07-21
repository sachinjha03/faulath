import React from 'react';
import Link from 'next/link';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';


export default function GetHelp() {
  return (
    <>
    <Link href={"/"} className="flex-btn back-btn">
        <ArrowBackIosNewIcon className='back-icon'/>
        <p>Back To Home</p>
      </Link>
      <img src="/Line.png" alt="" className='line-image' id='analysisLine2' />
      <img src="/Line.png" alt="" className='line-image' id='analysisLine1' />
      <div className="help-page-container">
        <h1>Need Help? We've Got You Covered</h1>

        <section className="help-section">
          <h2>👤 Creating an Account</h2>
          <p>To create an account, follow these steps:</p>
          <ul className="help-list">
            <li>Go to the <span className="button-highlight">Sign Up</span> page.</li>
            <li>Fill in your Name, Email, Password, Role, Department, Company.</li>
            <li>If you selected <b>BIA</b> department, choose a specific <b>Module</b>.</li>
            <li>Click on <span className="button-highlight">Create Account</span>.</li>
          </ul>
        </section>

        <section className="help-section">
          <h2>🔐 Logging In</h2>
          <p>To access your dashboard:</p>
          <ul className="help-list">
            <li>Visit the <span className="button-highlight">Login</span> page.</li>
            <li>Enter your registered email and password.</li>
            <li>Click <span className="button-highlight">Login</span> to continue.</li>
          </ul>
        </section>

        <section className="help-section">
          <h2>🧭 Button Guide</h2>
          <ul className="help-list">
            <li><span className="button-highlight">Add New</span>: Add a new risk or BIA record.</li>
            <li><span className="button-highlight">Edit</span>: Modify existing entries.</li>
            <li><span className="button-highlight">Delete</span>: Permanently remove a record.</li>
            <li><span className="button-highlight">Submit</span>: Send your data for approval.</li>
            <li><span className="button-highlight">Approve / Reject</span>: Available for Owners and Admins to review.</li>
          </ul>
        </section>

            <section className="help-section">
          <h2>🛡️ Role-based Functionalities</h2>
          <div className="role-table">
            <div className="role-row role-header">
              <div>Role</div>
              <div>Permissions</div>
            </div>

            <div className="role-row">
              <div><b>Champion</b></div>
              <div>
                <ul>
                  <li>Create data entries</li>
                  <li>Edit and delete own entries</li>
                  <li>Submit data for approval</li>
                </ul>
              </div>
            </div>

            <div className="role-row">
              <div><b>Owner</b></div>
              <div>
                <ul>
                  <li>View all entries of their department and company</li>
                  <li>Approve or Reject submissions</li>
                  <li>Cannot delete or final approve</li>
                </ul>
              </div>
            </div>

            <div className="role-row">
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

        <section className="help-section">
          <h2>❓ Still Need Help?</h2>
          <p>If you’re still stuck, feel free to reach out to the IT/Admin team of your company or contact the platform developer for support.</p>
        </section>
      </div>
    </>
  );
}
