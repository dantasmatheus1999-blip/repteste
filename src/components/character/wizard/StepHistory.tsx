import React from 'react';
import { Feather, Shield } from 'lucide-react';
import { WizardData } from './types';
import { T20_DEITIES } from '../../../data/t20Deities';

interface StepHistoryProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepHistory: React.FC<StepHistoryProps> = ({ data, onChange }) => {
  return (
    <div className="w-full space-y-3.5 max-w-xl mx-auto flex flex-col h-full justify-between">
      {/* Top: Deity, Age, Gender - Directly over background */}
      <div className="space-y-3">
        {/* Divindade & Devoção */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1.5 font-cinzel">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Divindade & Devoção
          </label>
          <select
            value={data.deity || 'Nenhuma (Não Devoto)'}
            onChange={(e) => onChange({ deity: e.target.value })}
            className="w-full bg-[#0e1219]/90 border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500/60 shadow-sm cursor-pointer"
          >
            <option value="Nenhuma (Não Devoto)" className="bg-[#0e1219] text-stone-200">
              Nenhuma (Não Devoto)
            </option>
            {T20_DEITIES.map((d) => {
              const cleanSummary = d.summary.replace(/\.$/, '');
              const label = `${d.name} (${cleanSummary})`;
              return (
                <option key={d.id} value={label} className="bg-[#0e1219] text-stone-200">
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {/* Idade & Gênero / Apresentação - Perfeitamente alinhados lado a lado */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="flex flex-col">
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 font-cinzel block truncate">
              Idade
            </label>
            <input
              type="text"
              value={data.age || ''}
              onChange={(e) => onChange({ age: e.target.value })}
              placeholder="Ex: 24 anos"
              className="w-full bg-[#0e1219]/90 border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/60 shadow-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 font-cinzel block truncate" title="Gênero / Apresentação">
              Gênero / Apresentação
            </label>
            <input
              type="text"
              value={data.gender || ''}
              onChange={(e) => onChange({ gender: e.target.value })}
              placeholder="Ex: Masculino, Feminino"
              className="w-full bg-[#0e1219]/90 border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/60 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Backstory Textarea - Directly over background */}
      <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-cinzel">
            <Feather className="w-3.5 h-3.5 text-amber-400" /> Biografia do Personagem
          </label>
          <span className="text-[10px] text-stone-500 font-mono">
            {data.history.length} caracteres
          </span>
        </div>
        <textarea
          value={data.history}
          onChange={(e) => onChange({ history: e.target.value })}
          placeholder="Escreva sobre a origem, motivação, objetivos e passado do seu herói em Arton..."
          className="w-full flex-1 min-h-[140px] bg-[#0e1219]/90 border border-amber-900/40 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/60 resize-none font-sans leading-relaxed custom-scrollbar shadow-sm"
        />
      </div>

      {/* Footer Info - Directly over background */}
      <div className="text-[11px] text-stone-400 border-t border-amber-900/30 pt-2 text-center">
        O histórico ajuda o Mestre da Campanha a criar ganchos narrativos personalizados para seu herói.
      </div>
    </div>
  );
};
