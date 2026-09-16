import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface NumericStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NumericStepper: React.FC<NumericStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  className = '',
  size = 'md'
}) => {
  const [isHolding, setIsHolding] = useState<'inc' | 'dec' | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const startHolding = (type: 'inc' | 'dec') => {
    setIsHolding(type);
    const action = type === 'inc' ? handleIncrement : handleDecrement;
    action();

    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        action();
      }, 100);
    }, 500);
  };

  const stopHolding = () => {
    setIsHolding(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => stopHolding();
  }, []);

  const sizeClasses = {
    sm: 'h-8 px-0.5 text-base min-w-[2rem]',
    md: 'h-10 px-1 text-lg min-w-[2.5rem]',
    lg: 'h-12 px-2 text-2xl min-w-[3.5rem]'
  };

  const buttonSize = {
    sm: 28,
    md: 36,
    lg: 44
  };

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 22
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-gold/40 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center bg-black/40 border border-gold/10 rounded-xl overflow-hidden group hover:border-gold/30 hover:shadow-[0_0_15px_rgba(197,160,89,0.1)] transition-all duration-300">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onMouseDown={() => startHolding('dec')}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          onTouchStart={() => startHolding('dec')}
          onTouchEnd={stopHolding}
          className={`flex items-center justify-center text-gold/40 hover:text-gold hover:bg-gold/10 transition-colors border-r border-gold/10 active:bg-gold/20`}
          style={{ width: buttonSize[size], height: buttonSize[size] }}
        >
          <Minus size={iconSize[size]} />
        </motion.button>

        <div className="flex-1 relative">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) {
                onChange(Math.min(max, Math.max(min, val)));
              } else if (e.target.value === '') {
                onChange(min);
              }
            }}
            className={`w-full bg-transparent text-center font-medieval text-gold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${sizeClasses[size]}`}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onMouseDown={() => startHolding('inc')}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          onTouchStart={() => startHolding('inc')}
          onTouchEnd={stopHolding}
          className={`flex items-center justify-center text-gold/40 hover:text-gold hover:bg-gold/10 transition-colors border-l border-gold/10 active:bg-gold/20`}
          style={{ width: buttonSize[size], height: buttonSize[size] }}
        >
          <Plus size={iconSize[size]} />
        </motion.button>
      </div>
    </div>
  );
};
