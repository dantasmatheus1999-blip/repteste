import React from 'react';
import { Dices, Sparkles } from 'lucide-react';

export const ImmersiveRPGPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center space-y-6 relative">
        {/* Ambient aura glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative flex justify-center">
          <div className="w-20 h-20 rounded-2xl border border-gold/20 bg-black/60 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.08)] relative">
            <Dices size={36} className="text-gold/80" />
            <div className="absolute -top-1 -right-1 text-gold/60">
              <Sparkles size={14} />
            </div>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <p className="text-[10px] text-gold/60 uppercase tracking-[0.3em] font-mono font-bold">
            Área do Jogador
          </p>
          <h1 className="text-3xl sm:text-4xl font-cinzel text-gold uppercase font-bold tracking-wider text-gold-gradient">
            Minhas Aventuras
          </h1>
          <div className="w-12 h-px bg-gold/20 mx-auto" />
          <p className="text-xs sm:text-sm text-gold/60 font-sans italic max-w-sm mx-auto leading-relaxed">
            Área limpa e preparada para o novo sistema de aventuras.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveRPGPage;
