'use client';
import React from 'react';


export default function SuccessScreen({
  icon,
  heading,
  headingColor,
  message,
  secondaryMessage,
  successButtonText ,
  onConfirm,
  successButtonColor,
  onCancel,
  cancelText,
}) {
  return (
    <div className="success-screen">
      <div className="success-box">
        <div>
          {icon}
        </div>
        <h3 style={{color:headingColor}}>{heading}</h3>
        <p>{message}</p>
        <h5>{secondaryMessage}</h5>
        <div className="success-box-button-row">
          <button className="btn-a" style={{backgroundColor:successButtonColor}} onClick={onConfirm}>{successButtonText}</button>
          <button className="btn-a" onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </div>
  );
}
