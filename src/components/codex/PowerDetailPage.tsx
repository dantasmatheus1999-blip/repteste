import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Target, Sparkles, Ghost, Zap, BookOpen, Scroll, Info } from 'lucide-react';
import { T20Power, PowerCategory } from '../../types/powers';

interface PowerDetailPageProps {
  power: T20Power | null;
  onClose: () => void;
  onViewDeity: (deityId: string) => void;
}

const categoryIcons: Record<PowerCategory, React.ReactNode> = {
  combate: <Shield className="w-6 h-6 text-red-400" />,
  destino: <Target className="w-6 h-6 text-blue-400" />,
  magia: <Sparkles className="w-6 h-6 text-purple-400" />,
  concedidos: <Zap className="w-6 h-6 text-yellow-400" />,
  tormenta: <Ghost className="w-6 h-6 text-red-600" />,
};

export const PowerDetailPage: React.FC<PowerDetailPageProps> = ({ power, onClose, onViewDeity }) => {
  if (!power) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl glass-card overflow-hidden border border-amber-500/30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-b from-amber-900/20 to-transparent p-6 flex items-end">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 shadow-inner">
                {categoryIcons[power.category]}
              </div>
              <div>
                <h2 className="font-serif text-3xl text-amber-100">{power.name}</h2>
                <p className="text-sm uppercase tracking-widest text-amber-500/60 font-mono">
                  Poder de {power.category}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Prerequisites */}
            {power.prerequisites && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-amber-500/80 uppercase text-xs font-bold tracking-tighter">
                  <Scroll className="w-4 h-4" />
                  Pré-requisitos
                </div>
                <p className="text-white/80 italic bg-white/5 p-3 rounded-lg border border-white/5">
                  {power.prerequisites}
                </p>
              </section>
            )}

            {/* Description */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-amber-500/80 uppercase text-xs font-bold tracking-tighter">
                <Info className="w-4 h-4" />
                Descrição
              </div>
              <div className="text-lg text-white/90 leading-relaxed font-serif">
                {power.description}
              </div>
            </section>

            {/* Tormenta Effect */}
            {power.tormentaEffect && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-red-500 uppercase text-xs font-bold tracking-tighter">
                  <Ghost className="w-4 h-4" />
                  Efeito da Tormenta
                </div>
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-red-100 font-serif text-lg">{power.tormentaEffect}</p>
                    <p className="text-[10px] uppercase text-red-500/60 font-bold">Consequência da Mutação</p>
                  </div>
                </div>
              </section>
            )}

            {/* Deity Info */}
            {power.deityNames && power.deityNames.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-amber-500/80 uppercase text-xs font-bold tracking-tighter">
                  <BookOpen className="w-4 h-4" />
                  Divindades Patronas
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {power.deityNames.map((name, index) => (
                    <div 
                      key={name}
                      className="p-4 rounded-xl bg-amber-900/10 border border-amber-500/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-amber-500/60 font-bold">Divindade</p>
                          <p className="text-amber-100 font-serif text-lg">{name}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => power.deityIds && onViewDeity(power.deityIds[index])}
                        className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                        title="Ver Divindade"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Footer Info */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                {power.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-white/30 font-mono uppercase">
                Fonte: {power.source}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
