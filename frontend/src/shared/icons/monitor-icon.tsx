import React from 'react';

export const MonitorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg 
      width="28" 
      height="28" 
      viewBox="0 0 28 28" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path 
        d="M23.3333 3.5H4.66665C3.37798 3.5 2.33331 4.54467 2.33331 5.83333V17.5C2.33331 18.7887 3.37798 19.8333 4.66665 19.8333H23.3333C24.622 19.8333 25.6666 18.7887 25.6666 17.5V5.83333C25.6666 4.54467 24.622 3.5 23.3333 3.5Z" 
        stroke="currentColor" 
        strokeWidth="2.33333" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M9.33331 24.5H18.6666" 
        stroke="currentColor" 
        strokeWidth="2.33333" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M14 19.8333V24.4999" 
        stroke="currentColor" 
        strokeWidth="2.33333" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

