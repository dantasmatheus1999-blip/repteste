import React from 'react';
import { Shield, Heart, Zap, Swords, Package, Flame, Wand2, Sparkles, CheckCircle2, Box } from 'lucide-react';
import { WizardData } from './types';

interface StepReviewProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const StepReview: React.FC<StepReviewProps> = ({ data, onSubmit, isSubmitting }) => {
  return (
    <div className="w-full space-y-2.5 max-w-xl mx-auto flex flex-col h-full justify-between">
      {/* Hero Header Card */}
      <div className="bg-stone-900/90 border border-amber-600/50 rounded-2xl p-3.5 shadow-xl flex items-center gap-3.5 backdrop-blur-sm">
        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500/80 shadow-md bg-stone-950 shrink-0 flex items-center justify-center relative">
          {data.avatarType === '3d' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-amber-400 p-1">
              <Box className="w-7 h-7 text-amber-400 animate-pulse" />
              <span className="text-[8px] font-mono text-amber-300 uppercase tracking-tighter">3D GLB</span>
            </div>
          ) : (
            <img
              src={data.imageUrl}
              alt={data.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-200 truncate">
              {data.name || 'Herói Sem Nome'}
            </h3>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/40 shrink-0">
              Nív. {data.level}
            </span>
          </div>

          <p className="text-xs text-stone-300 truncate mt-0.5">
            {data.raceName} • {data.className}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1 truncate">
            <span>Origem: {data.originName}</span>
            {data.deity && <span>• {data.deity.split(' ')[0]}</span>}
          </div>
        </div>
      </div>

      {/* 3 Vital Stats Badges */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-2 text-center shadow">
          <span className="text-[10px] text-red-400 font-bold uppercase flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 fill-red-400" /> PV Máx
          </span>
          <span className="text-lg font-cinzel font-bold text-red-200">{data.hpMax}</span>
        </div>

        <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-2 text-center shadow">
          <span className="text-[10px] text-blue-400 font-bold uppercase flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 fill-blue-400" /> PM Máx
          </span>
          <span className="text-lg font-cinzel font-bold text-blue-200">{data.manaMax}</span>
        </div>

        <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-2 text-center shadow">
          <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 fill-amber-400" /> Defesa
          </span>
          <span className="text-lg font-cinzel font-bold text-amber-200">{data.defense}</span>
        </div>
      </div>

      {/* 6 Attributes Badges in 1 row (Tormenta 20 Edição Jogo do Ano) */}
      <div className="grid grid-cols-6 gap-1 bg-stone-900/80 border border-amber-900/30 rounded-xl p-2 text-center shadow">
        {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const).map((attr) => {
          const mod = data.attrModifiers[attr] ?? data.attributes[attr] ?? 0;
          return (
            <div key={attr} className="min-w-0">
              <span className="text-[10px] text-amber-400 font-bold block">{attr}</span>
              <span className="text-sm font-mono text-stone-100 font-bold block">
                {mod >= 0 ? `+${mod}` : mod}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary Highlights Grid */}
      <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pr-0.5 custom-scrollbar min-h-0">
        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>Ataques ({data.attacks.length})</span>
          </div>
          <div className="text-[11px] text-stone-400 truncate">
            {data.attacks.length > 0
              ? data.attacks.map((a) => a.name).join(', ')
              : 'Nenhum ataque configurado'}
          </div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Itens ({data.equipment.length})</span>
          </div>
          <div className="text-[11px] text-stone-400 truncate">
            {data.equipment.length > 0
              ? data.equipment.slice(0, 3).map((e) => e.name).join(', ')
              : 'Mochila vazia'}
          </div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Poderes ({data.powers.length})</span>
          </div>
          <div className="text-[11px] text-stone-400 truncate">
            {data.powers.length > 0
              ? data.powers.map((p) => p.name).join(', ')
              : 'Nenhum poder ativo'}
          </div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Magias ({data.spells.length})</span>
          </div>
          <div className="text-[11px] text-stone-400 truncate">
            {data.spells.length > 0
              ? data.spells.map((s) => s.name).join(', ')
              : 'Nenhuma magia memorizada'}
          </div>
        </div>
      </div>

      {/* Confirmation CTA button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-cinzel font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
        <span>{isSubmitting ? 'Consagrando Ficha...' : 'Consagrar Herói de Arton'}</span>
      </button>
    </div>
  );
};
