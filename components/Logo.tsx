
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-10 h-10"
}) => {
  return (
    <div className={`${className} relative flex items-center justify-center group`}>
      {/* Círculo de Fundo Premium - "Fundo no V" */}
      <div className="absolute inset-0 bg-brand-graphite rounded-full shadow-lg border-2 border-brand-gold/40 transform group-hover:scale-110 transition-transform duration-500"></div>
      
      {/* Brilho Interno */}
      <div className="absolute inset-1 rounded-full border border-white/10"></div>

      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="relative z-10 w-3/5 h-3/5"
      >
        {/* Símbolo V Minimalista Estilizado */}
        <path 
          d="M20 35 L50 75 L80 35" 
          stroke="#C5A572" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
        {/* Detalhe de luz no V */}
        <path 
          d="M28 35 L50 64 L72 35" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="opacity-30"
        />
      </svg>
    </div>
  );
};
