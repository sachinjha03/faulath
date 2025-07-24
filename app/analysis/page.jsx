"use client"
import React, { useEffect } from 'react'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import styles from "./page.module.css"

export default function page() {
    const router = useRouter()
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
  return (
    <div className={styles.analysisLandingSection}>
      <Link href={"/"} className="flex-btn back-btn">
        <ArrowBackIosNewIcon className='back-icon'/>
        <p>Back To Home</p>
      </Link>
      <img src="/Line.png" alt="" className='line-image' id='analysisLine1' />
      <img src="/Line.png" alt="" className='line-image' id='analysisLine2' />
      <div className={styles.analysisLandingSectionTop}>
        <h2>Select Analysis Type</h2>
        <p>Choose a module to begin your business continuity planning.</p>
      </div>
      <div className={styles.analysisLandingSectionMiddle}>
        <div className={styles.primaryAnalysisCard}>
          <div className={styles.analysisCardCircle}>
            <SignalCellularAltIcon className={styles.analysisCircleIcon}/>
          </div>
          <h3>Business Analysis Impact</h3>
          <p>Identify and evaluate the potential effects of a business disruption.</p>
          <Link href={{ pathname: "/company", query: { name: "BIA" } }} className={`btn-a filled-btn ${styles.btnA}`}>Select</Link>
        </div>
        <div className={styles.primaryAnalysisCard}>
          <div className={styles.analysisCardCircle}>
            <ErrorOutlineIcon className={styles.analysisCircleIcon}/>
          </div>
          <h3>Risk Assessment</h3>
          <p>Determine the likelihood and impact of potential threats and hazards.</p>
          <Link href={{ pathname: "/company", query: { name: "RA" } }} className={`btn-a filled-btn ${styles.btnA}`}>Select</Link>
        </div>
      </div>
      <div className={styles.analysisLandingSectionBottom}>
        <div className={styles.disabledAnalysisCard}>
          <div className={styles.disabledAnalysisCardCircle}>
            <ReceiptLongIcon className={styles.bigIcon}/>
          </div>
          <div className={styles.disabledAnalysisCardContent}>
            <h3>Department Recovery Plan</h3>
            <p>Create detailed plans for recovering departmental functions after an incident.</p>
            <a href="" className={`btn-a filled-btn ${styles.btnA}`}>Comming Soon</a>
          </div>
        </div>
      </div>
    </div>
  )
}
