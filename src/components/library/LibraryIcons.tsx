import React from 'react';
import { LibraryCategoryId } from './types';

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// 1. Arcane / Magias Sigil (Minimalist geometric arcane diamond star)
export const MagiasIcon: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.6 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M5 5L7 7" />
    <path d="M19 5L17 7" />
    <path d="M19 19L17 17" />
    <path d="M5 19L7 17" />
  </svg>
);

// 2. Classes (Clean medieval crest/shield)
export const ClassesIcon: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.6 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 3L4 6.5V12C4 17.5 7.5 21.5 12 22C16.5 21.5 20 17.5 20 12V6.5L12 3Z" />
    <path d="M12 3V22" />
    <path d="M4 11H20" />
  </svg>
);

// 3. Raças (Minimalist dual figure / lineage archetype)
export const RacasIcon: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.6 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="9" cy="7" r="3" />
    <path d="M3 19C3 15.5 5.7 13 9 13C12.3 13 15 15.5 15 19" />
    <circle cx="17" cy="8" r="2.5" />
    <path d="M15 13.5C16.2 13.2 17.5 13.5 18.5 14.5C20 16 20.5 17.5 21 19" />
  </svg>
);

// 4. Origens (Clean compass & traveler scroll)
export const OrigensIcon: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.6 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H8Z" />
    <path d="M7 8H17" />
    <path d="M7 12H17" />
    <path d="M7 16H13" />
  </svg>
);

// 5. Poderes (Sharp energy glyph / divine spark)
export const PoderesIcon: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.6 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// 6. Equipamentos (Sleek crossed martial blades)
export const EquipamentosIcon: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.6 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 4L20 9.5L8.5 21L3 21L3 15.5L14.5 4Z" />
    <path d="M16 7.5L13.5 10" />
    <path d="M9.5 4L4 9.5L6.5 12" />
    <path d="M17.5 14.5L20 17" />
  </svg>
);

// 7. Divindades (Radiant divine sun / halo)
export const DivindadesIcon: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.6 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2V4" />
    <path d="M12 20V22" />
    <path d="M4 12H2" />
    <path d="M22 12H20" />
    <path d="M5.64 5.64L7.05 7.05" />
    <path d="M16.95 16.95L18.36 18.36" />
    <path d="M5.64 18.36L7.05 16.95" />
    <path d="M16.95 7.05L18.36 5.64" />
  </svg>
);

// 8. Monstros (Dragon / Beast horned skull silhouette)
export const MonstrosIcon: React.FC<IconProps> = ({ size = 20, className = '', strokeWidth = 1.6 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 3C7.5 3 4 6.5 4 11C4 14 5.5 16.5 7.5 18V21H16.5V18C18.5 16.5 20 14 20 11C20 6.5 16.5 3 12 3Z" />
    <path d="M3 7L6 9.5" />
    <path d="M21 7L18 9.5" />
    <circle cx="9" cy="11.5" r="1.5" fill="currentColor" />
    <circle cx="15" cy="11.5" r="1.5" fill="currentColor" />
    <path d="M10 17H14" />
  </svg>
);

// Spell Schools Minimalist Icons
export const SchoolAbjuracaoIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const SchoolEvocacaoIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
  </svg>
);

export const SchoolNecromanciaIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="12" r="1.5" fill="currentColor" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" />
    <path d="M8 20v-2h8v2" />
    <path d="M12.5 17l-.5-1-.5 1" />
    <path d="M16 20a4.5 4.5 0 0 0 4-4.5V13A8 8 0 0 0 4 13v2.5A4.5 4.5 0 0 0 8 20" />
  </svg>
);

export const SchoolIlusaoIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9v1" />
  </svg>
);

export const SchoolAdivinhacaoIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3V6" />
    <path d="M12 18V21" />
    <path d="M3 12H6" />
    <path d="M18 12H21" />
  </svg>
);

export const SchoolEncantamentoIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const SchoolConvocacaoIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 4a8 8 0 0 1 8 8" />
    <path d="M12 8a4 4 0 0 1 4 4" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

export const SchoolTransmutacaoIcon: React.FC<IconProps> = ({ size = 18, className = '', strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// Map category ID to cohesive clean Icon component
export const getCleanCategoryIcon = (id: LibraryCategoryId) => {
  switch (id) {
    case 'magias': return MagiasIcon;
    case 'classes': return ClassesIcon;
    case 'racas': return RacasIcon;
    case 'origens': return OrigensIcon;
    case 'poderes': return PoderesIcon;
    case 'equipamentos': return EquipamentosIcon;
    case 'divindades': return DivindadesIcon;
    case 'monstros': return MonstrosIcon;
    default: return MagiasIcon;
  }
};

// Map school to clean icon
export const getCleanSchoolIcon = (school?: string) => {
  switch (school) {
    case 'Abjuração': return SchoolAbjuracaoIcon;
    case 'Evocação': return SchoolEvocacaoIcon;
    case 'Necromancia': return SchoolNecromanciaIcon;
    case 'Ilusão': return SchoolIlusaoIcon;
    case 'Adivinhação': return SchoolAdivinhacaoIcon;
    case 'Encantamento': return SchoolEncantamentoIcon;
    case 'Convocação': return SchoolConvocacaoIcon;
    case 'Transmutação': return SchoolTransmutacaoIcon;
    default: return MagiasIcon;
  }
};
