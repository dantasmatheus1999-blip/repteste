import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Sparkles, Ghost, Zap, ChevronRight, BookOpen } from 'lucide-react';
import { T20Power, PowerCategory } from '../../types/powers';

interface PowerCardProps {
  power: T20Power;
  onClick: (power: T20Power) => void;
}

const categoryIcons: Record<PowerCategory, React.ReactNode> = {
  combate: <Shield className="w-5 h-5 text-red-400" />,
  destino: <Target className="w-5 h-5 text-blue-400" />,
  magia: <Sparkles className="w-5 h-5 text-purple-400" />,
  concedidos: <Zap className="w-5 h-5 text-yellow-400" />,
  tormenta: <Ghost className="w-5 h-5 text-red-600" />,
};

const categoryColors: Record<PowerCategory, string> = {
  combate: 'border-red-900/30 hover:border-red-500/50',
  destino: 'border-blue-900/30 hover:border-blue-500/50',
  magia: 'border-purple-900/30 hover:border-purple-500/50',
  concedidos: 'border-yellow-900/30 hover:border-yellow-500/50',
  tormenta: 'border-red-950 hover:border-red-700',
};

export const PowerCard: React.FC<PowerCardProps> = ({ power, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(power)}
      className={`glass-card p-4 cursor-pointer border transition-all duration-300 ${categoryColors[power.category]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black/40 border border-white/10">
            {categoryIcons[power.category]}
          </div>
          <div>
            <h3 className="font-serif text-lg text-amber-100 leading-tight">{power.name}</h3>
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
              {power.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {power.category === 'tormenta' && (
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
          )}
          <ChevronRight className="w-5 h-5 text-white/20" />
        </div>
      </div>

      <p className="text-sm text-white/70 line-clamp-2 mb-4 italic">
        {power.description}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto">
        {power.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50"
          >
            {tag}
          </span>
        ))}
        {power.deityNames && power.deityNames.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-900/20 border border-amber-500/30 text-[10px] text-amber-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {power.deityNames.length > 1 ? `${power.deityNames[0]}...` : power.deityNames[0]}
          </span>
        )}
      </div>
    </motion.div>
  );
};
