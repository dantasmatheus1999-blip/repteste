import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle, icon: Icon, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        'glass-card p-6 flex flex-col gap-4 medieval-border card-interactive relative overflow-hidden group',
        className, 
        onClick && 'cursor-pointer'
      )}
    >
      {/* Subtle Inner Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {(title || subtitle || Icon) && (
        <div className="flex flex-col gap-1 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && <Icon className="text-gold/60 group-hover:text-gold transition-colors" size={20} />}
              {title && <h3 className="text-xl font-cinzel text-gold-gradient tracking-[0.1em] font-bold">{title}</h3>}
            </div>
          </div>
          {subtitle && <p className="text-[10px] uppercase font-black text-gold/30 tracking-[0.3em] mt-1">{subtitle}</p>}
          
          {/* Refined Divider */}
          <div className="h-[1px] w-full bg-gradient-to-r from-gold/40 via-gold/10 to-transparent mt-4" />
        </div>
      )}
      <div className="flex-1 pt-2 relative z-10">{children}</div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-20">
        <div className="absolute top-2 right-2 w-2 h-[1px] bg-gold" />
        <div className="absolute top-2 right-2 w-[1px] h-2 bg-gold" />
      </div>
    </div>
  );
};
