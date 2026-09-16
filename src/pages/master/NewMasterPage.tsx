import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Crown, Sparkles, Compass, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const NewMasterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToSelection = () => {
    localStorage.removeItem('mythos_active_profile');
    // Using simple direct redirect to ensure state is clean and Context is reinitialized
    window.location.href = '/select-profile';
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-700">
      <div className="max-w-md w-full text-center space-y-8 relative">
        {/* Subtle decorative arcana glow lines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Floating Crown Accent with pulsing animation */}
        <div className="relative flex justify-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full border border-gold/15 bg-black/60 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.05)] relative"
          >
            <Crown size={36} className="text-gold/80" />
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles size={16} className="text-gold" />
            </motion.div>
          </motion.div>
        </div>

        {/* Text Details using beautiful typography and layout */}
        <div className="space-y-4 relative z-10">
          <p className="text-[10px] text-gold/40 uppercase tracking-[0.3em] font-black font-sans leading-none">
            Codex Arcano • Portal do Mestre
          </p>
          <h1 className="text-4xl sm:text-5xl font-cinzel text-gold-gradient tracking-wide uppercase font-black">
            MODO MESTRE
          </h1>
          <div className="w-12 h-[1px] bg-gold/20 mx-auto" />
          <p className="text-xs sm:text-sm text-gold/60 font-sans italic max-w-sm mx-auto leading-relaxed">
            "Área em reconstrução. Aqui será criada a nova experiência do Mestre."
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-4 relative z-10">
          <Button
            variant="secondary"
            onClick={handleBackToSelection}
            className="w-full sm:w-auto px-8 py-2.5 text-xs tracking-widest font-black uppercase border border-gold/20 hover:border-gold/50 bg-black/40 hover:bg-gold/5"
          >
            Voltar para seleção
          </Button>
        </div>

        {/* Subtle corner elements */}
        <div className="absolute -top-4 -left-4 w-6 h-6 border-t border-l border-gold/15 pointer-events-none hidden sm:block" />
        <div className="absolute -top-4 -right-4 w-6 h-6 border-t border-r border-gold/15 pointer-events-none hidden sm:block" />
        <div className="absolute -bottom-4 -left-4 w-6 h-6 border-b border-l border-gold/15 pointer-events-none hidden sm:block" />
        <div className="absolute -bottom-4 -right-4 w-6 h-6 border-b border-r border-gold/15 pointer-events-none hidden sm:block" />
      </div>
    </div>
  );
};
