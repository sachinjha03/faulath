'use client';
import React, { useState, useContext } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import { MyContext } from '../context/ContextApi';
import Link from 'next/link';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';



const moduleOptions = {
  "Bahrain Steel": ["OA File", "Raw Material", "Sales & Marketing", "Shipping"],
  "Sulb": ["DR Production", "HSM Production", "Logistics", "MSP Production", "Production Planning", "Quality Assurance", "Quality Control", "Safety & Environment", "Sales & Marketing"],
  "Sulb Saudi": ["Electrical Maintenance", "HR and Administration", "Logistics", "Mechanical Maintenance", "Production Planning & Control", "Quality", "Rolling Mill & Roll Shop", "Safety", "Sales & Marketing"],
  "Foulath": ["Facility Management", "Finance", "HR", "Internal Audit", "Digital Transformation", "IS", "SAP", "Legal", "PR Government Relations", "Capex & Opex", "Consumables", "LLIC"]
};

export default function Page() {
  const router = useRouter();
  const [successScreen, setSuccessScreen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '', department: '', company: '', module: '' });
  const [buttonText, setButtonText] = useState('Create Account');
  const [loading , setLoading] = useState(false)
  const MyContextApi = useContext(MyContext);

  // Prevent numeric input in the name field
  const handleKeyDown = (e) => {
    if (e.target.name === 'name' && /\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handle input change and sanitize values
  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value.trimStart(); // avoid leading spaces

    // Convert email to lowercase
    if (name === 'email') {
      sanitizedValue = sanitizedValue.toLowerCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
      ...(name === 'department' || name === 'company' ? { module: '' } : {}),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedFormData = {};
    for (let key in formData) {
      trimmedFormData[key] = formData[key].trim(); // final trim for all fields
    }

    const requiredFields = ['name', 'email', 'password', 'confirmPassword', 'role', 'department', 'company'];
    for (let field of requiredFields) {
      if (!trimmedFormData[field]) {
        alert(`Please fill out the ${field} field`);
        return;
      }
    }

    if (trimmedFormData.password !== trimmedFormData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (trimmedFormData.department === 'BIA' && !trimmedFormData.module) {
      alert('Please select a module');
      return;
    }

    setButtonText("Creating...");
    setLoading(true)
    const response = await fetch(`${MyContextApi.backendURL}/api/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(trimmedFormData)
    });

    const json = await response.json();

    if (json.success) {
      setSuccessScreen(true);
    } else {
      alert("Failed to create account");
    }
    setButtonText("Create Account");
    setLoading(false)
  };

  const goToHomePage = () => {
    router.push('/');
  };

  const showModuleSelect = formData.department === 'BIA' && formData.company && moduleOptions[formData.company];

  return (
    <div className={styles.signupPage}>
      <Link href={"/"} className="flex-btn back-btn">
        <ArrowBackIosNewIcon className='back-icon'/>
        <p>Back To Home</p>
      </Link>
      <img src="/Line.png" alt="" className='line-image' id='analysisLine1' />
      <img src="/Line.png" alt="" className='line-image' id='analysisLine2' />
      <form onSubmit={handleSubmit} className={styles.signupForm} style={{zIndex:10}}>
        <h3>Create Your Account</h3>

        <div className={styles.formRow}>
          <div className="input-box">
            <label htmlFor="name">Enter Your Name</label>
            <input
              type="text"
              name="name"
              id="name"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
            />
          </div>
          <div className="input-box">
            <label htmlFor="email">Enter Your Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className="input-box">
            <label htmlFor="password">Create Password</label>
            <input
              type="password"
              name="password"
              id="password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-box">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className="input-box">
            <label htmlFor="role">Select Your Role</label>
            <select name="role" id="role" className="input-field" value={formData.role} onChange={handleChange} required>
              <option value="">-- Select --</option>
              <option value="champion">Champion</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="input-box">
            <label htmlFor="department">Select Department</label>
            <select name="department" id="department" className="input-field" value={formData.department} onChange={handleChange} required>
              <option value="">-- Select --</option>
              <option value="RA">Risk Assessment</option>
              <option value="BIA">Business Impact Analysis</option>
            </select>
          </div>
        </div>

        <div className="input-box">
          <label htmlFor="company">Select Your Assigned Company</label>
          <select name="company" id="company" className="input-field" value={formData.company} onChange={handleChange} required>
            <option value="">-- Select --</option>
            <option value="Foulath">Foulath</option>
            <option value="Bahrain Steel">Bahrain Steel</option>
            <option value="Sulb">SULB</option>
            <option value="Sulb Saudi">SULB Saudi</option>
          </select>
        </div>

        {showModuleSelect && (
          <div className="input-box">
            <label htmlFor="module">Select Module You Will Work Upon</label>
            <select name="module" id="module" className="input-field" value={formData.module} onChange={handleChange} required>
              <option value="">-- Select --</option>
              {moduleOptions[formData.company].map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {buttonText}
        </button>
      </form>

      {successScreen && (
        <div className="success-screen">
          <div className="success-box">
            <CheckCircleOutlineIcon className={styles.successIcon} style={{ fontSize: 50 }} />
            <h3>Account Created Successfully</h3>
            <p>You will be redirected to homepage and then you can login yourself</p>
            <button className="btn-a purple-btn" onClick={goToHomePage}>Take Me To HomePage</button>
          </div>
        </div>
      )}
    </div>
  );
}
