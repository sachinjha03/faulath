import React, { useState , useContext } from "react";
import { saveAs } from "file-saver";
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { MyContext } from '../context/ContextApi';
import styles from "./DownloadRAData.module.css";

const DownloadRAData = () => {
    const MyContextApi = useContext(MyContext)
  
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const years = [2025, 2024, 2023, 2022]; 

  const handleDownload = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth-token");
      const res = await fetch(
        `${MyContextApi.backendURL}/api/download-risk-assessment/${year}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        alert("No data found or error occurred");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      saveAs(blob, `RA_Data_${year}.zip`);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Download Data</h2>

      <select
        className={styles.dropdown}
        value={year}
        onChange={(e) => setYear(e.target.value)}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button
        onClick={handleDownload}
        disabled={loading}
        className={`${styles.button} ${loading ? styles.disabled : ""}`}
      >
        <DownloadForOfflineIcon size={18} />
        <span>{loading ? "Downloading..." : `Download ${year} Data`}</span>
      </button>
    </div>
  );
};

export default DownloadRAData;
