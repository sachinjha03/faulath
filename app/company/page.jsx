'use client'
import React, { Suspense, useState, useEffect , useContext } from 'react'
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import { MyContext } from '../context/ContextApi';




function CompanyContent() {

  let modules = {
    "Bahrain Steel": ["OA File", "Raw Material", "Sales & Marketing", "Shipping"],
    "Sulb": ["DR Production", "HSM Production", "Logistics", "MSP Production", "Production Planning", "Quality Assurance", "Quality Control", "Safety & Environment", "Sales & Marketing"],
    "Sulb Saudi": ["Electrical Maintenance", "HR and Administration", "Logistics", "Mechanical Maintenance", "Production Planning & Control", "Quality", "Rolling Mill & Roll Shop", "Safety", "Sales & Marketing"],
    "Foulath": ["Facility Management", "Finance", "HR", "Internal Audit", "Digital Transformation", "IS", "SAP", "Legal", "PR Government Relations", "Capex & Opex", "Consumables", "LLIC"]
  }

  const router = useRouter();


  const [data, setData] = useState({ email: "", password: "", role: "champion", module: "" })
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [buttonText , setButtonText] = useState("Verify Identitiy")
  const [loading , setLoading] = useState(false)
  const MyContextApi = useContext(MyContext)
  


  useEffect(() => {
    if (selectedCompany && modules[selectedCompany]?.length > 0) {
      setData((prev) => ({
        ...prev,
        module: modules[selectedCompany][0] // set first module as default
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
  // const trimmedData = {
  //   email: data.email.trim().toLowerCase(),
  //   password: data.password.trim(),
  //   role: data.role.trim(),
  //   module: data.module.trim(),
  //   company: selectedCompany?.trim() || '',
  //   department: name?.trim() || '',
  // };

  const response = await fetch(`${MyContextApi.backendURL}/api/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      email: data.email.trim().toLowerCase(), password: data.password.trim(), module: name === "RA" ? "" : data.module, department: name, role: data.role, company: selectedCompany
    })
  });
  // body: JSON.stringify(trimmedData)

  const json = await response.json();
  console.log(json);
  
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
    <div className="company-landing-section">
      <Link href={"/analysis"} className="flex-btn back-btn">
        <ArrowBackIosNewIcon />
        <p>Back To Analysis</p>
      </Link>
      <img src="/Line.png" alt="" className='line-image' id='companyLine1' />
      <div className="company-landing-section-top">
        <h2>Selected : <span>{name}</span></h2>
        <p>Choose the company you are performing the analysis for.</p>
      </div>
      <div className="company-landing-section-middle">
        {['Bahrain Steel', 'Sulb', 'Sulb Saudi', 'Foulath'].map((company, index) => (
          <div key={index} className="company-card" id={`companyCard${index + 1}`}>
            <h3>{company}</h3>
            <p>Identify and evaluate the potential effects of a business disruption.</p>
            <button className="btn-a outline-btn" onClick={() => {
              setSelectedCompany(company);
              displayLogin();
            }}>Select</button>

          </div>
        ))}
      </div>
      {loginScreen && <div className="login-screen">
        <form action="#" className="login-form" onSubmit={handleLogin}>
          <CloseIcon className='close-icon' onClick={hideLogin} />
          <h3>Authenticate Your Identity</h3>
          <div className="input-box">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" className='input-field' value={data.email} onChange={handleChange} required />
          </div>
          <div className="input-box">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" className='input-field' value={data.password} onChange={handleChange} required />
          </div>
          <div className="input-box">
            <label htmlFor="role">Select Your Role</label>
            <select name="role" id="role" className='input-field' value={data.role} onChange={handleChange} required>
              <option value="champion">Champion</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {name == "BIA" && selectedCompany && (
            <div className="input-box">
              <label htmlFor="module">Select Your Module</label>
              <select name="module" id="module" className='input-field' value={data.module} onChange={handleChange} required>
                {modules[selectedCompany]?.map((module, index) => (
                  <option key={index} value={module}>{module}</option>
                ))}
              </select>
            </div>
          )}
          <a href="#">Forgot Password ?</a>
          <button className='btn-a filled-btn' disabled={loading}>{buttonText}</button>
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
