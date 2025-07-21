'use client';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function Home() {
  const router = useRouter();
  const [displayMenu, setDisplayMenu] = useState(true);
  const [decodedToken, setDecodedToken] = useState(null);

  const hideMenu = () => setDisplayMenu(false);
  const showMenu = () => setDisplayMenu(true);

  // ✅ Check token on mount
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

  // ✅ Handle "Begin" click
  const handleAuthentication = () => {
    if (decodedToken) {
      // Route based on module (e.g., "RA" or "BIA")
      if (decodedToken.department === "RA") {
        router.push("/data");
      } else if (decodedToken.department === "BIA") {
        router.push("/bia-data");
      } else {
        alert("Invalid module in token.");
      }
    } else {
      router.push("/analysis"); // Go to login if not authenticated
    }
  };

  return (
    <div className="landing-section">
      <div className="navbar">
        <div className="navbar-left">
          {displayMenu
            ? <CloseIcon className='close-icon' onClick={hideMenu} />
            : <MenuIcon className='menu-icon' onClick={showMenu} />}
          {displayMenu && <a href="#">Home</a>}
          {displayMenu && <a href="#">About</a>}
        </div>
        <div className="navbar-right">
          <Link href="/signup" className="flex-btn btn-a filled-btn">
            <p>Sign Up</p>
            <ArrowForwardIcon className='flex-btn-icon' />
          </Link>
          <a href="/get-help" className="btn-a outline-btn">Get Help</a>
        </div>
      </div>

      <h1>Business Continuity Management</h1>
      <p>Resilience in <span>Action</span>, Continuity by <span>Design</span></p>

      {/* ✅ Use button instead of Link for conditional navigation */}
      <button className="btn-a filled-btn" onClick={handleAuthentication}>Begin</button>

      <div className="circle-parent">
        <div className="small-circle"></div>
        <div className="small-circle medium-circle"></div>
        <div className="small-circle large-circle"></div>
      </div>
      {/* <div className="background-animation-box">
        <div className="animated-circle"></div>
      </div> */}
    </div>
  );
}
