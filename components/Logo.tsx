import React from 'react';

interface LogoProps {
  className?: string;
  classNamePath?: string; // Kept for compatibility but unused in new design
  classNameEye?: string; // Kept for compatibility but unused in new design
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-10 h-10"
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Left Stroke (Thicker, Dark) */}
      <path 
        d="M20 20 L45 85" 
        stroke="currentColor" 
        strokeWidth="12" 
        strokeLinecap="square"
        className="text-vizu-dark dark:text-white"
      />
      
      {/* Right Stroke (Thinner, Gold/Accent) */}
      <path 
        d="M80 20 L45 85" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="square"
        className="text-vizu-gold"
      />
    </svg>
  );
};