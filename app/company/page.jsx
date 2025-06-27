// 'use client'
// import React from 'react'
// import { useSearchParams } from 'next/navigation';
// import Link from 'next/link';

// export default function page() {
//     const searchParams = useSearchParams();
//   const name = searchParams.get('name');
//   return (
//     <div className="company-landing-section">
//         <img src="/Line.png" alt="" className='line-image' id='companyLine1' />
//         <div className="company-landing-section-top">
//             <h2>Selected : <span>{name}</span></h2>
//             <p>Choose the company you are performing the analysis for.</p>
//         </div>
//         <div className="company-landing-section-middle">
//             <div className="company-card" id="companyCard1">
//                 <h3>Bahrin Steel</h3>
//                 <p>Identify and evaluate the potential effects of a business disruption.</p>
//                 <Link href="/login" className="btn-a outline-btn">Select</Link>
//             </div>
//             <div className="company-card" id="companyCard2">
//                 <h3>SULB</h3>
//                 <p>Identify and evaluate the potential effects of a business disruption.</p>
//                 <Link href="/login" className="btn-a outline-btn">Select</Link>
//             </div>
//             <div className="company-card" id="companyCard3">
//                 <h3>SULB SAUDI</h3>
//                 <p>Identify and evaluate the potential effects of a business disruption.</p>
//                 <Link href="/login" className="btn-a outline-btn">Select</Link>
//             </div>
//             <div className="company-card" id="companyCard4">
//                 <h3>Foulath</h3>
//                 <p>Identify and evaluate the potential effects of a business disruption.</p>
//                 <Link href="/login" className="btn-a outline-btn">Select</Link>
//             </div>
//         </div>
//     </div>
//   )
// }


'use client'
import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CompanyContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  return (
    <div className="company-landing-section">
      <img src="/Line.png" alt="" className='line-image' id='companyLine1' />
      <div className="company-landing-section-top">
        <h2>Selected : <span>{name}</span></h2>
        <p>Choose the company you are performing the analysis for.</p>
      </div>
      <div className="company-landing-section-middle">
        {['Bahrin Steel', 'SULB', 'SULB SAUDI', 'Foulath'].map((company, index) => (
          <div key={index} className="company-card" id={`companyCard${index + 1}`}>
            <h3>{company}</h3>
            <p>Identify and evaluate the potential effects of a business disruption.</p>
            <Link href="/login" className="btn-a outline-btn">Select</Link>
          </div>
        ))}
      </div>
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
