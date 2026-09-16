import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  className = '',
  headerActions,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`glass-card rounded-2xl border border-gold/10 overflow-hidden transition-all ${className}`}>
      <div className="flex items-center justify-between p-6 hover:bg-gold/5 transition-colors group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-gold/40 group-hover:text-gold transition-colors"
          >
            <ChevronRight size={20} />
          </motion.div>
          {Icon && <Icon size={20} className="text-gold/60 group-hover:text-gold transition-colors" />}
          <h3 className="text-xl font-cinzel text-gold/60 tracking-[0.2em] font-bold uppercase group-hover:text-gold transition-colors">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          {headerActions}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6 pt-0 border-t border-gold/5">
              <div className="pt-6">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
