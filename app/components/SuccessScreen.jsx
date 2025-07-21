'use client';
import React from 'react';
// import styles from './SuccessScreen.module.css'; // Create this CSS for custom styling
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

export default function SuccessScreen({
  icon = <CheckCircleIcon style={{ fontSize: 50 }} />,
  heading = "Success!",
  message = "",
  buttonText = "OK",
  onConfirm,
  confirmButtonColor = "",
  showCancel = false,
  onCancel,
  cancelText = "Cancel",
}) {
  return (
    <div className="success-screen">
      <div className="success-box">
        <div>
          {icon}
        </div>
        <h3>{heading}</h3>
        <p>{message}</p>
        <div className="success-box-button-row">
          <button className="btn-a purple-btn" style={{backgroundColor:confirmButtonColor}} onClick={onConfirm}>{buttonText}</button>
          {showCancel && (
            <button className="btn-a" onClick={onCancel}>{cancelText}</button>
          )}
        </div>
      </div>
    </div>
  );
}
