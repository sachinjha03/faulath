'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();
  const takeMeHome = () => {
    router.push('/'); // Redirect to homepage
  };

  return (
    <div className='not-found-page'>
      <img src="/404.png" alt="404 - Page Not Found" />
      <div>
        <h1>404</h1>
        <h3>PAGE NOT FOUND</h3>
        <p>
          Lost In Space Due To Incorrect Landing. <br />
          Get Back To Home
        </p>
        <button className="btn-a filled-btn" onClick={takeMeHome}>
          Take Me Home
        </button>
      </div>
    </div>
  );
}
