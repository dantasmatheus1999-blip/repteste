import React, { useState } from 'react';
import { X, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { Attribute } from '../../../types/character';
import { ATTRIBUTE_NAMES, calcMod, formatMod } from '../../../utils/sheetCalculations';

export interface SheetAttributeEditModalProps {
  attribute?: Attribute;
  attrKey?: Attribute;
  attrName?: string;
  currentValue: number;
  currentMod?: number;
  onSave: (newValue: number) => void;
  onClose: () => void;
}

export const SheetAttributeEditModal: React.FC<SheetAttributeEditModalProps> = ({
  attribute,
  attrKey,
  attrName,
  currentValue,
  onSave,
  onClose,
}) => {
  const finalAttr = (attribute || attrKey || 'FOR') as Attribute;
  const finalName = attrName || ATTRIBUTE_NAMES[finalAttr] || finalAttr;
  // Tormenta 20 JdA: o valor é o próprio modificador direto
  const initialMod = calcMod(currentValue ?? 0);
  const [val, setVal] = useState<number>(initialMod);

  const handleIncrement = () => setVal(prev => Math.min(20, prev + 1));
  const handleDecrement = () => setVal(prev => Math.max(-5, prev - 1));

  const handleSave = () => {
    onSave(val);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div 
        className="bg-[#141820] border border-[#2d3440] rounded-xl max-w-xs w-full p-4 space-y-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
          <h3 className="text-xs font-sans font-bold text-stone-200 uppercase tracking-wider">
            Editar {finalName} ({finalAttr})
          </h3>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Display do Valor (Tormenta 20 JdA) */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <span className="text-[11px] text-stone-400 font-sans">
            Atributo Tormenta20 — Jogo do Ano
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-cinzel font-bold text-[#c5a869]">
              {formatMod(val)}
            </span>
          </div>

          {/* Controles de Valor com botões - e + */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 rounded-lg bg-[#0d1117] hover:bg-[#1c2128] border border-[#262c36] text-stone-300 flex items-center justify-center font-bold transition-colors cursor-pointer"
              title="Diminuir modificador"
            >
              <Minus size={14} />
            </button>

            <input
              type="number"
              min="-5"
              max="20"
              value={val}
              onChange={(e) => setVal(Math.max(-5, Math.min(20, parseInt(e.target.value, 10) || 0)))}
              className="w-16 py-1.5 rounded-lg bg-[#0d1117] border border-[#262c36] text-center font-cinzel font-bold text-xl text-stone-100 outline-hidden focus:border-[#4d5766]"
            />

            <button
              onClick={handleIncrement}
              className="w-8 h-8 rounded-lg bg-[#0d1117] hover:bg-[#1c2128] border border-[#262c36] text-stone-300 flex items-center justify-center font-bold transition-colors cursor-pointer"
              title="Aumentar modificador"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-[10px] text-stone-500 font-sans">
            Modificador direto (-5 a +20)
          </span>
        </div>

        {/* Efeito no cálculo */}
        <div className="p-2 rounded bg-[#0d1117] border border-[#1f242d] text-[11px] text-stone-400 font-sans space-y-0.5">
          <p className="flex items-center gap-1 text-stone-300 font-semibold text-[10px] uppercase">
            <AlertCircle size={11} className="shrink-0" />
            <span>Recálculo Automático:</span>
          </p>
          <p className="text-[10px] text-stone-500 leading-tight">
            Perícias, resistências e ataques ligados a {finalName} serão recalculados instantaneamente.
          </p>
        </div>

        {/* Botão de Salvar */}
        <div className="flex gap-2 pt-1 border-t border-[#21262d]">
          <button
            onClick={onClose}
            className="flex-1 py-1.5 rounded bg-[#1c2128] hover:bg-[#28303e] border border-[#30363d] text-stone-400 hover:text-stone-200 text-xs font-sans font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-1.5 rounded bg-[#1c2128] hover:bg-[#28303e] border border-[#30363d] text-stone-100 text-xs font-sans font-bold uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Check size={13} />
            <span>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
