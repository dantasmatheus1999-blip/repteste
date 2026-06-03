import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  title?: string;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  children,
  fullWidth,
  loading,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'btn-premium-gold',
    secondary: 'btn-premium',
    ghost: 'bg-transparent text-mythos-text/60 hover:text-gold hover:bg-gold/5 font-cinzel',
    danger: 'bg-health/20 text-health border-2 border-health/40 hover:bg-health/30 font-cinzel rounded-sm',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        fullWidth && 'w-full',
        loading && 'relative !text-transparent pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}
      {Icon && !loading && <Icon size={size === 'sm' ? 14 : size === 'icon' ? 18 : 18} />}
      {children}
    </button>
  );
};
