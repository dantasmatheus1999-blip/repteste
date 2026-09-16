import React from 'react';

export const FantasyOrnaments: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    viewBox="0 0 120 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`h-4 w-auto ${className}`}
  >
    <path 
      d="M0 10H45M75 10H120M60 2L67 10L60 18L53 10L60 2Z" 
      stroke="currentColor" 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <circle cx="60" cy="10" r="2.5" fill="currentColor" />
    <circle cx="38" cy="10" r="1.5" fill="currentColor" />
    <circle cx="82" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

export const CornerBracket: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; className?: string }> = ({ 
  position, 
  className = '' 
}) => {
  const getRotation = () => {
    switch (position) {
      case 'top-left': return 'rotate-0 top-1.5 left-1.5';
      case 'top-right': return 'rotate-90 top-1.5 right-1.5';
      case 'bottom-right': return 'rotate-180 bottom-1.5 right-1.5';
      case 'bottom-left': return '-rotate-90 bottom-1.5 left-1.5';
    }
  };

  return (
    <div className={`absolute pointer-events-none text-amber-500/40 select-none ${getRotation()} ${className}`}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M1 17V4C1 2.34315 2.34315 1 4 1H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="4" cy="4" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
};
