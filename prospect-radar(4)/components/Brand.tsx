import React from 'react';

interface LogoProps {
  className?: string;
}

export const LogoIcon: React.FC<LogoProps> = ({ className = "h-8 w-8" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-label="Prospect Radar Icon"
  >
    {/* Radar Rings - Thick style */}
    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="opacity-90"/>
    <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="8" className="opacity-90"/>
    <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="8" className="opacity-90"/>
    
    {/* Cutout/Sweep Line */}
    <path d="M50 50 L90 10" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

    {/* Puck - 3D Perspective */}
    <g transform="translate(0, 10)">
      <ellipse cx="50" cy="70" rx="22" ry="8" fill="currentColor" />
      <path d="M28 70 V 82 C 28 88 50 92 72 82 V 70" fill="currentColor" />
      <path d="M28 82 C 28 88 50 92 72 82" stroke="currentColor" strokeWidth="0" />
    </g>
  </svg>
);

export const Logo: React.FC<LogoProps> = ({ className = "h-8" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <LogoIcon className="h-full w-auto aspect-square text-indigo-500" />
    <div className="flex flex-col justify-center h-full">
      <span className="font-bold text-white tracking-tight leading-none text-xl uppercase font-sans">Prospect</span>
      <span className="font-bold text-white tracking-tight leading-none text-xl uppercase font-sans">Radar</span>
    </div>
  </div>
);
