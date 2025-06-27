'use client';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
export default function Home() {
  const [displayMenu , setDisplayMenu] = useState(true)
  const hideMenu = () => {  
    setDisplayMenu(false)
  }
  const showMenu = () => {
    setDisplayMenu(true)
  }
  return (
    <div className="landing-section">
      <div className="navbar">
        <div className="navbar-left">
          {displayMenu ? <CloseIcon className='close-icon' onClick={hideMenu}/> : <MenuIcon className='menu-icon' onClick={showMenu} />}
          {displayMenu && <a href="#">Home</a>}
          {displayMenu && <a href="#">About</a>}
        </div>
        <div className="navbar-right">
          <a href="#" className="flex-btn btn-a filled-btn">
            <p>Get Help</p>
            <ArrowForwardIcon className='flex-btn-icon'/>
            </a>
          <a href="#" className="btn-a outline-btn">FAQs</a>
        </div>
      </div>
      <h1>Business Continuity Management</h1>
      <p>Resilience in <span>Action</span>, Continuity by <span>Design</span></p>
      <Link href="/analysis" className="btn-a filled-btn">Begin</Link>
      <div className="circle-parent">
      <div className="small-circle"></div>
      <div className="small-circle medium-circle"></div>
      <div className="small-circle large-circle"></div>
      </div>
    </div>
  );
}
