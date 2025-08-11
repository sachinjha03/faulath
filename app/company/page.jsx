'use client'
import React, { Suspense, useState, useEffect , useContext } from 'react'
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import { MyContext } from '../context/ContextApi';
import { jwtDecode } from 'jwt-decode';
import styles from "./page.module.css"





function CompanyContent() {

  let modules = {
    "Bahrain Steel": ["OA File", "Raw Material", "Sales & Marketing", "Shipping"],
    "Sulb": ["DR Production", "HSM Production", "Logistics", "MSP Production", "Production Planning", "Quality Assurance", "Quality Control", "Safety & Environment", "Sales & Marketing"],
    "Sulb Saudi": ["Electrical Maintenance", "HR and Administration", "Logistics", "Mechanical Maintenance", "Production Planning & Control", "Quality", "Rolling Mill & Roll Shop", "Safety", "Sales & Marketing"],
    "Foulath": ["Facility Management", "Finance", "HR", "Internal Audit", "Digital Transformation", "IS", "SAP", "Legal", "PR Government Relations", "Capex & Opex", "Consumables", "ILIC"]
  }

  const router = useRouter();


  const [data, setData] = useState({ email: "", password: "", role: "champion", module: "" })
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [buttonText , setButtonText] = useState("Verify Identitiy")
  const [loading , setLoading] = useState(false)
  const MyContextApi = useContext(MyContext)

    const [forgotScreen , setForgotScreen] = useState(false)
    const [newData , setNewData] = useState({email:"" , password:""})
    const handleForgotDataChange = (e) => {
        setNewData({...newData , [e.target.name]:e.target.value})
    }
    const handleSubmit = async(e) => {
        e.preventDefault();
        const response = await fetch(`${MyContextApi.backendURL}/api/forgot-password` , {
            method:'PUT',
            headers:{
                'content-type':'application/json'
            },
            body : JSON.stringify({email:newData.email , password:newData.password})
        })
        const json = await response.json()
       if(json.success){
        alert("SUCCESS!! Password Changes Successfully")
        window.location.reload()
       }else{
        alert("User Doesn't Exist")
       }
        
    }
    const handleScreenOpen = () => {
        setForgotScreen(true)
    }
    const handleScreenClose = () => {
        setForgotScreen(false)
    }


  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      const decoded_token = jwtDecode(token);
      if (decoded_token.department == "RA") {
          router.push("/data")
      } else {
        router.push("/bia-data")
      }
    }
  }, []);

  


  useEffect(() => {
    if (selectedCompany && modules[selectedCompany]?.length > 0) {
      setData((prev) => ({
        ...prev,
        module: modules[selectedCompany][0]
      }));
    }
  }, [selectedCompany]);

  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  const [loginScreen, setLoginScreen] = useState(false)
  const displayLogin = () => {
    setLoginScreen(true)
  }
  const hideLogin = () => {
    setLoginScreen(false)
  }

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value })
  }
  const handleLogin = async (e) => {
  e.preventDefault();
  setButtonText("Verifying...");
  setLoading(true)

  const response = await fetch(`${MyContextApi.backendURL}/api/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      email: data.email.trim().toLowerCase(), password: data.password.trim(), module: name === "RA" ? "" : data.module, department: name, role: data.role, company: selectedCompany
    })
  });

  const json = await response.json();
  
  if (json.success) {
    localStorage.setItem("auth-token", json.token);
    if (name == "RA") {
      router.push('/data');
    } else if (name == "BIA") {
      router.push("/bia-data");
    }
  } else {
    alert("Invalid Credentials");
  }

  setButtonText("Verify Identity");
  setLoading(false)
};


  return (
    <div className={styles.companyLandingSection}>
      <Link href={"/analysis"} className="flex-btn back-btn">
        <ArrowBackIosNewIcon />
        <p>Back To Analysis</p>
      </Link>
      <img src="/Line.png" alt="" className='line-image' id='companyLine1' />
      <div className={styles.companyLandingSectionTop}>
        <h2>Selected : <span>{name}</span></h2>
        <p>Choose the company you are performing the analysis for.</p>
      </div>
      <div className={styles.companyLandingSectionMiddle}>
        {['Bahrain Steel', 'Sulb', 'Sulb Saudi', 'Foulath'].map((company, index) => (
          <div key={index} className={styles.companyCard} id={`companyCard${index + 1}`}>
            <h3>{company}</h3>
            <p>Identify and evaluate the potential effects of a business disruption.</p>
            <button className={`btn-a outline-btn ${styles.btnA} `} onClick={() => {
              setSelectedCompany(company);
              displayLogin();
            }}>Select</button>

          </div>
        ))}
      </div>
      {loginScreen && <div className={styles.loginScreen}>
        <form action="#" className={styles.loginForm} onSubmit={handleLogin}>
          <CloseIcon className={styles.closeIcon} onClick={hideLogin} />
          <h3>Authenticate Your Identity</h3>
          <div className="input-box">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" className="input-field" value={data.email} onChange={handleChange} required />
          </div>
          <div className="input-box">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" className="input-field" value={data.password} onChange={handleChange} required />
          </div>
          <div className="input-box">
            <label htmlFor="role">Select Your Role</label>
            <select name="role" id="role" className="input-field" value={data.role} onChange={handleChange} required>
              <option value="champion">Champion</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {name == "BIA" && selectedCompany && (
            <div className="input-box">
              <label htmlFor="module">Select Your Module</label>
              <select name="module" id="module" className="input-field" value={data.module} onChange={handleChange} required>
                {modules[selectedCompany]?.map((module, index) => (
                  <option key={index} value={module}>{module}</option>
                ))}
              </select>
            </div>
          )}
          <a href="#" onClick={handleScreenOpen} style={{color:"white"}}>Forgot Password ?</a>
          <button className={`btn-a filled-btn ${styles.filledBtn}`} disabled={loading}>{buttonText}</button>
        </form>
      </div>}
      {forgotScreen && <div className={styles.forgotPasswordScreen}>
        <form action="#" className={styles.forgotPasswordForm} onSubmit={handleSubmit}>
            <CloseIcon className={styles.closeIcon} onClick={handleScreenClose}/>
            <h3>Forgot Your Password</h3>
            <div className="input-box">
                <label htmlFor="email">Your Registered Email</label>
                <input type="email" name="email" id="email" className='input-field' value={newData.email} onChange={handleForgotDataChange} required/>
            </div>
            <div className="input-box">
                <label htmlFor="password">New Password</label>
                <input type="password" name="password" id="password" className='input-field' value={newData.password} onChange={handleForgotDataChange} required/>
            </div>
            <button className="btn-a purple-btn">Update Password</button>
        </form>
    </div>}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyContent />
    </Suspense>
  );
}
