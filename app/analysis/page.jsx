"use client"
import React from 'react'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Link from 'next/link';

export default function page() {
  return (
    <div className="analysis-landing-section">
      <img src="/Line.png" alt="" className='line-image' id='analysisLine1' />
      <img src="/Line.png" alt="" className='line-image' id='analysisLine2' />
      <div className="analysis-landing-section-top">
        <h2>Select Analysis Type</h2>
        <p>Choose a module to begin your business continuity planning.</p>
      </div>
      <div className="analysis-landing-section-middle">
        <div className="primary-analysis-card">
          <div className="analysis-card-circle">
            <SignalCellularAltIcon className='analysis-circle-icon'/>
          </div>
          <h3>Business Analysis Impact</h3>
          <p>Identify and evaluate the potential effects of a business disruption.</p>
          <Link href={{ pathname: "/company", query: { name: "Business Analysis Impact" } }} className="btn-a filled-btn">Select</Link>
        </div>
        <div className="primary-analysis-card">
          <div className="analysis-card-circle">
            <ErrorOutlineIcon className='analysis-circle-icon'/>
          </div>
          <h3>Risk Assessment</h3>
          <p>Determine the likelihood and impact of potential threats and hazards.</p>
          <Link href={{ pathname: "/company", query: { name: "Risk Assessment" } }} className="btn-a filled-btn">Select</Link>
        </div>
      </div>
      <div className="analysis-landing-section-bottom">
        <div className="disabled-analysis-card">
          <div className="disabled-analysis-card-circle">
            <ReceiptLongIcon className='big-icon'/>
          </div>
          <div className="disabled-analysis-card-content">
            <h3>Department Recovery Plan</h3>
            <p>Create detailed plans for recovering departmental functions after an incident.</p>
            <a href="" className="btn-a filled-btn">Comming Soon</a>
          </div>
        </div>
      </div>
    </div>
  )
}
