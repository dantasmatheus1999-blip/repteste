import React from 'react';
import { Sparkles, Sliders, Zap, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { NormalizedSheetData } from '../../../utils/sheetCalculations';

interface SheetLevelUpModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: NormalizedSheetData;
  onSelectManual: () => void;
  onSelectAutomatic: () => void;
}

export const SheetLevelUpModeSelectModal: React.FC<SheetLevelUpModeSelectModalProps> = ({
  isOpen,
  onClose,
  sheet,
  onSelectManual,
  onSelectAutomatic
}) => {
  if (!isOpen) return null;

  const currentLevel = sheet.level;
  const nextLevel = Math.min(20, currentLevel + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div 
        id="level-up-mode-select-modal"
        className="bg-[#0e1218] border border-[#232936] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2633] bg-[#121620]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-sans font-bold text-stone-100 uppercase tracking-wider">
                Evolução de Personagem
              </h2>
              <p className="text-[11px] text-stone-400 font-sans">
                {sheet.name} • {sheet.className} • <span className="text-amber-400 font-semibold">Nível {currentLevel} → {nextLevel}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-stone-400 hover:text-stone-200 hover:bg-[#1c2330] transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corpo: Escolha entre os dois modos */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-300 font-sans leading-relaxed">
            Seu herói acumulou experiência suficiente para alcançar o próximo patamar. Escolha o método de evolução desejado:
          </p>

          <div className="grid grid-cols-1 gap-3.5">
            {/* Opção 1: UP MANUAL (Recomendado) */}
            <div 
              id="select-mode-manual-card"
              className="group border border-[#2a3445] hover:border-amber-500/50 bg-[#121722] hover:bg-[#151c2a] rounded-lg p-4 transition-all duration-150 relative cursor-pointer"
              onClick={() => {
                onClose();
                onSelectManual();
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Sliders size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-sans font-bold text-stone-100 uppercase tracking-wide group-hover:text-amber-300 transition-colors">
                        UP Manual
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        RECOMENDADO
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 font-sans leading-relaxed">
                      <strong className="text-stone-200">Você escolhe os benefícios:</strong> Aumento de Atributo, Poderes de Classe ou Gerais, Habilidades e Magias.
                    </p>
                    <p className="text-[11px] text-amber-400/90 font-sans font-medium">
                      ✓ O sistema calcula automaticamente PV, PM, Perícias, Defesa e CDs derivados.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-stone-500 group-hover:text-amber-400 transition-colors self-center">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>

            {/* Opção 2: UP AUTOMÁTICO (BETA) */}
            <div 
              id="select-mode-automatic-card"
              className="group border border-[#212836] hover:border-[#3b475c] bg-[#10141d] hover:bg-[#131924] rounded-lg p-4 transition-all duration-150 relative cursor-pointer"
              onClick={() => {
                onClose();
                onSelectAutomatic();
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-[#192230] border border-[#263346] flex items-center justify-center text-stone-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Zap size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-sans font-bold text-stone-200 uppercase tracking-wide group-hover:text-stone-100 transition-colors">
                        UP Automático
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold bg-stone-800 text-stone-400 border border-stone-700">
                        BETA
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-sans leading-relaxed">
                      Aplica a progressão sequencial oficial guiada com sugestão direta de poderes e cálculos padrões da classe.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-stone-600 group-hover:text-stone-400 transition-colors self-center">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#131720] border border-[#1e2532] text-[11px] text-stone-400 font-sans">
            <ShieldAlert size={14} className="text-amber-500 shrink-0" />
            <span>
              Atingir o XP necessário não sobe seu personagem de forma involuntária. Seu XP acumulado é 100% preservado em ambos os modos.
            </span>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-5 py-3 border-t border-[#1f2633] bg-[#0c1017] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-[#161c26] hover:bg-[#1f2635] text-stone-300 hover:text-stone-100 border border-[#273244] text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            Decidir Depois
          </button>
        </div>
      </div>
    </div>
  );
};
