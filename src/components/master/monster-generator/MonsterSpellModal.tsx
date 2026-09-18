import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Zap, Shield, Target, Crosshair, Flame, Clock, Compass, Layers } from 'lucide-react';
import { MonsterSpellEntry as MagicSpellEntry } from '../../../services/monsterMagicService';
import { MonsterSpellEntry as MasterSpellEntry } from '../../../types/master';

export type UnifiedMonsterSpell = MagicSpellEntry | MasterSpellEntry;

interface MonsterSpellModalProps {
  spell: UnifiedMonsterSpell | null;
  onClose: () => void;
}

export const MonsterSpellModal: React.FC<MonsterSpellModalProps> = ({ spell, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (spell) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [spell, onClose]);

  if (!spell) return null;

  const category = spell.category || 'ofensiva';
  const categoryColor =
    category === 'ataque'
      ? { badge: 'bg-red-950/90 text-red-300 border-red-700/60', text: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' }
      : category === 'ofensiva'
      ? { badge: 'bg-orange-950/90 text-orange-300 border-orange-700/60', text: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]' }
      : category === 'controle'
      ? { badge: 'bg-amber-950/90 text-amber-300 border-amber-700/60', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' }
      : category === 'defesa'
      ? { badge: 'bg-blue-950/90 text-blue-300 border-blue-700/60', text: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]' }
      : category === 'suporte'
      ? { badge: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' }
      : { badge: 'bg-purple-950/90 text-purple-300 border-purple-700/60', text: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]' };

  const dcDisplay = spell.dcFormatted || (spell.resistance && spell.resistance.includes('CD') ? spell.resistance : 'CD Padrão');

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-lg rounded-2xl bg-stone-950 border-2 border-purple-500/40 shadow-2xl p-6 overflow-hidden ${categoryColor.glow}`}
        >
          {/* Subtle background ornamentation */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 border border-purple-500/20 text-stone-400 hover:text-stone-100 hover:border-purple-400 transition-all z-10"
            title="Fechar (ESC)"
            aria-label="Fechar janela"
          >
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div className="space-y-2 border-b border-purple-500/25 pb-4 pr-8">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400 shrink-0" />
              <h3 className="text-2xl font-cinzel font-black text-purple-100 tracking-wider">
                {spell.name}
              </h3>
            </div>

            {/* Badges de Categoria, Círculo, Custo e Tipo */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-cinzel text-xs font-bold">
              <span className={`px-2.5 py-1 rounded border uppercase tracking-wider text-[10px] ${categoryColor.badge}`}>
                {spell.category}
              </span>
              <span className="px-2.5 py-1 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50">
                {spell.circle}º Círculo
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-950/70 text-blue-300 border border-blue-700/50">
                {spell.costPM} PM
              </span>
              <span className="px-2.5 py-1 rounded bg-stone-900 text-stone-300 border border-stone-700/50 capitalize">
                {spell.type} ({spell.school})
              </span>
            </div>
          </div>

          {/* Destaque de Estatísticas de Combate (Ataque, Dano, CD, Custo) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 font-cinzel">
            {spell.attackBonus !== undefined && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-700/50 text-center">
                <span className="text-[10px] font-bold text-red-400 block uppercase">Ataque</span>
                <span className="text-lg font-black text-red-200">+{spell.attackBonus}</span>
                {spell.critical && <span className="text-[10px] text-red-400/80 block mt-0.5">{spell.critical}</span>}
              </div>
            )}

            {spell.damage && (
              <div className="p-2.5 rounded-lg bg-orange-950/40 border border-orange-700/50 text-center">
                <span className="text-[10px] font-bold text-orange-400 block uppercase">Dano</span>
                <span className="text-sm font-black text-orange-200 block truncate">{spell.damage}</span>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/50 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-amber-400 block uppercase">
                {dcDisplay === '—' ? 'Teste' : 'CD'}
              </span>
              <span className="text-base font-black text-amber-200 block">
                {dcDisplay === '—' ? 'Não exige' : dcDisplay}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-700/50 text-center">
              <span className="text-[10px] font-bold text-blue-400 block uppercase">Custo</span>
              <span className="text-lg font-black text-blue-200">{spell.costPM} PM</span>
            </div>
          </div>

          {/* Dados Operacionais e Parâmetros */}
          <div className="p-3.5 rounded-lg bg-stone-900/60 border border-purple-900/30 space-y-2 text-xs font-cinzel">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase">Execução</span>
                <span className="text-purple-200 font-bold">{spell.execution}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase">Alcance</span>
                <span className="text-purple-200 font-bold">{spell.range}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase">Alvo / Área</span>
                <span className="text-purple-200 font-bold">{spell.targetOrArea}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase">Duração</span>
                <span className="text-purple-200 font-bold">{spell.duration}</span>
              </div>
            </div>

            {spell.resistance && (
              <div className="pt-2 border-t border-purple-900/30">
                <span className="text-stone-400 block text-[10px] font-bold uppercase">Resistência</span>
                <span className="text-amber-300 font-bold">{spell.resistance}</span>
              </div>
            )}
          </div>

          {/* Descrição Completa / Efeito */}
          <div className="mt-4 space-y-1.5">
            <span className="text-[11px] font-cinzel font-bold text-stone-400 uppercase tracking-wider block">
              Efeito e Regras
            </span>
            <div className="p-3 rounded-lg bg-stone-900/40 border border-stone-800 text-stone-200 text-xs leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
              <p className="whitespace-pre-line">{spell.description}</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-cinzel text-stone-400">
            <span>Pressione <strong className="text-stone-200">ESC</strong> ou clique fora para fechar</span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
