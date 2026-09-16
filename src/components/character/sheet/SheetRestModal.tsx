import React from 'react';
import { X, Flame, Moon, Coffee } from 'lucide-react';
import { NormalizedSheetData } from '../../../utils/sheetCalculations';

interface SheetRestModalProps {
  sheet: NormalizedSheetData;
  onApplyRest: (type: 'short' | 'long') => void;
  onClose: () => void;
}

export const SheetRestModal: React.FC<SheetRestModalProps> = ({
  sheet,
  onApplyRest,
  onClose
}) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div 
        className="bg-[#141820] border border-[#2d3440] rounded-xl max-w-sm w-full p-4 space-y-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-stone-300" />
            <h3 className="text-xs sm:text-sm font-sans font-bold text-stone-100 uppercase tracking-wider">
              Descanso & Recuperação
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-stone-400 font-sans leading-relaxed">
          Recupere seus recursos de acordo com o tempo de repouso do herói:
        </p>

        {/* Opção 1: Descanso Curto */}
        <button
          onClick={() => {
            onApplyRest('short');
            onClose();
          }}
          className="w-full text-left p-3 rounded-lg bg-[#0d1117] hover:bg-[#181e28] border border-[#21262d] hover:border-[#384252] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Coffee size={15} className="text-stone-400 group-hover:text-stone-200" />
              <span className="text-xs font-sans font-bold text-stone-200 uppercase">
                Descanso Curto (45 min)
              </span>
            </div>
            <span className="text-[10px] font-sans font-semibold text-stone-400 bg-[#1c2128] px-1.5 py-0.5 rounded">
              +{sheet.level} PV & PM
            </span>
          </div>
          <p className="text-[11px] text-stone-500 font-sans">
            Recupera pontos de vida e mana equivalentes ao seu nível atual (Nvl {sheet.level}).
          </p>
        </button>

        {/* Opção 2: Descanso Longo */}
        <button
          onClick={() => {
            onApplyRest('long');
            onClose();
          }}
          className="w-full text-left p-3 rounded-lg bg-[#0d1117] hover:bg-[#181e28] border border-[#21262d] hover:border-[#384252] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Moon size={15} className="text-stone-400 group-hover:text-stone-200" />
              <span className="text-xs font-sans font-bold text-stone-200 uppercase">
                Descanso Longo (8 horas)
              </span>
            </div>
            <span className="text-[10px] font-sans font-semibold text-stone-300 bg-[#1c2128] px-1.5 py-0.5 rounded">
              Recuperação Total
            </span>
          </div>
          <p className="text-[11px] text-stone-500 font-sans">
            Recupera todos os PV ({sheet.maxPV}) e PM ({sheet.maxPM}) máximos, e remove condições temporárias.
          </p>
        </button>

        <div className="pt-2 border-t border-[#21262d] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-sans text-stone-400 hover:text-stone-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
