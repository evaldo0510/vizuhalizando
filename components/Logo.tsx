
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-10 h-10"
}) => {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      {/* Círculo de Fundo Estilizado */}
      <div className="absolute inset-0 bg-brand-graphite rounded-xl shadow-lg border border-brand-gold/30 rotate-3 group-hover:rotate-0 transition-transform"></div>
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="relative z-10 w-3/4 h-3/4"
      >
        {/* Símbolo V Minimalista e Elegante */}
        <path 
          d="M20 30 L50 80 L80 30" 
          stroke="#C5A572" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M35 30 L50 55 L65 30" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="opacity-50"
        />
      </svg>
    </div>
  );
};
