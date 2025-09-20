'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Navbar from "./components/Navbar.jsx"
import styles from "./page.module.css"


export default function Home() {
  const router = useRouter();
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setDecodedToken(decoded);
      } catch (err) {
        console.error("Invalid token:", err);
        setDecodedToken(null);
      }
    }
  }, []);

  const handleAuthentication = () => {
    if (decodedToken) {
      if (decodedToken.department === "RA") {
        router.push("/data");
      } else if (decodedToken.department === "BIA") {
        router.push("/bia-data");
      } else {
        alert("Invalid module in token.");
      }
    } else {
      router.push("/analysis");
    }
  };

  return (
    <div className={styles.landingSection}>
      <Navbar/>
      {/* <h1>BCM</h1>
      <h2>Business Continuity Management</h2> */}
      <img src="/foulath-logo.png" alt="" className={styles.foulathLogo} />
      <img src="/BCM.png" alt="" className={styles.bcmLogo} />
      <p>Resilience in <span>Action</span>, Continuity by <span>Design</span></p>
      <button className={`btn-a filled-btn ${styles.btnA}`} onClick={handleAuthentication}>Begin</button>
      {/* <div className={styles.circleParent}>
        <div className={styles.smallCircle}></div>
        <div className={` ${styles.smallCircle} ${styles.mediumCircle}`}></div>
        <div className={` ${styles.smallCircle} ${styles.largeCircle}`}></div>
      </div> */}
    </div>
  );
}
