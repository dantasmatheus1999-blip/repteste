import React from 'react';
import { BookOpen, Sparkles, Feather, Shield } from 'lucide-react';
import { WizardData } from './types';

interface StepHistoryProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

const DEITIES = [
  'Nenhuma (Não Devoto)',
  'Valkaria (Deusa da Ambição)',
  'Khalmyr (Deus da Justiça)',
  'Lena (Deusa da Vida)',
  'Marah (Deusa da Paz)',
  'Thyatis (Deus da Ressurreição)',
  'Wynna (Deusa da Magia)',
  'Allihanna (Deusa da Natureza)',
  'Lin-Wu (Deus da Honra)',
  'Arsenal (Deus da Guerra)',
  'Tanna-Toh (Deusa do Conhecimento)',
  'Aharadak (Deus da Tormenta)'
];

const BACKSTORY_PROMPTS = [
  'Em busca de vingança contra um culto sombrio.',
  'Último sobrevivente de um clã devastado pela Tormenta.',
  'Jovem aprendiz em peregrinação por Arton.',
  'Guerreiro veterano buscando redenção por seu passado.'
];

export const StepHistory: React.FC<StepHistoryProps> = ({ data, onChange }) => {
  return (
    <div className="w-full space-y-3 max-w-xl mx-auto flex flex-col h-full justify-between">
      {/* Top: Deity, Age, Gender in 1 compact grid */}
      <div className="bg-stone-900/80 border border-amber-900/40 rounded-xl p-3 shadow-md space-y-2.5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Divindade & Devoção
          </label>
          <select
            value={data.deity || 'Nenhuma (Não Devoto)'}
            onChange={(e) => onChange({ deity: e.target.value })}
            className="w-full bg-stone-950 border border-amber-900/50 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          >
            {DEITIES.map((d) => (
              <option key={d} value={d} className="bg-stone-950 text-stone-200">
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              Idade
            </label>
            <input
              type="text"
              value={data.age || ''}
              onChange={(e) => onChange({ age: e.target.value })}
              placeholder="Ex: 24 anos"
              className="w-full bg-stone-950 border border-amber-900/40 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              Gênero / Apresentação
            </label>
            <input
              type="text"
              value={data.gender || ''}
              onChange={(e) => onChange({ gender: e.target.value })}
              placeholder="Ex: Masculino, Feminino..."
              className="w-full bg-stone-950 border border-amber-900/40 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Backstory Prompts Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Ideias de Histórico (toque para adicionar):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BACKSTORY_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const current = data.history ? `${data.history}\n` : '';
                onChange({ history: `${current}${prompt}` });
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-900/90 border border-amber-900/30 hover:border-amber-500/50 text-[10px] text-stone-300 text-left active:scale-95 transition-all"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Backstory Textarea */}
      <div className="bg-stone-900/80 border border-amber-900/40 rounded-xl p-3 shadow-md flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
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
          className="w-full flex-1 min-h-[80px] bg-stone-950 border border-amber-900/40 rounded-lg p-2.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none font-sans leading-relaxed custom-scrollbar"
        />
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-stone-400 bg-stone-900/50 p-2 rounded-lg border border-amber-900/20 text-center">
        O histórico ajuda o Mestre da Campanha a criar ganchos narrativos personalizados para seu herói.
      </div>
    </div>
  );
};
