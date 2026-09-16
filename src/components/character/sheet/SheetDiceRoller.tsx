import React, { useState, useEffect } from 'react';
import { 
  Dices, 
  X, 
  RotateCcw, 
  Sparkles, 
  Skull,
  Minus,
  Plus
} from 'lucide-react';

export interface RollResult {
  id: string;
  label: string;
  formula: string;
  total: number;
  diceRolls: number[];
  modifier: number;
  isNat20?: boolean;
  isNat1?: boolean;
  timestamp: string;
}

interface SheetDiceRollerProps {
  externalRoll?: { formula: string; label?: string; timestamp: number } | null;
}

export const SheetDiceRoller: React.FC<SheetDiceRollerProps> = ({ externalRoll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<RollResult[]>([]);
  const [currentResult, setCurrentResult] = useState<RollResult | null>(null);
  const [customModifier, setCustomModifier] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);

  // Reage a rolagens externas da ficha (perícias, ataques, resistências)
  useEffect(() => {
    if (externalRoll) {
      executeRoll(externalRoll.formula, externalRoll.label || 'Rolagem');
      setIsOpen(true);
    }
  }, [externalRoll]);

  const executeRoll = (formula: string, label: string = 'Rolagem') => {
    setIsRolling(true);

    setTimeout(() => {
      const clean = formula.replace(/\s+/g, '');
      const parts = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/i);

      let diceCount = 1;
      let diceSides = 20;
      let formulaMod = 0;

      if (parts) {
        diceCount = parts[1] ? parseInt(parts[1], 10) : 1;
        diceSides = parseInt(parts[2], 10) || 20;
        formulaMod = parts[3] ? parseInt(parts[3], 10) : 0;
      } else {
        const numOnly = parseInt(clean, 10);
        if (!isNaN(numOnly)) {
          formulaMod = numOnly;
          diceCount = 0;
        }
      }

      const rolls: number[] = [];
      let sum = 0;
      for (let i = 0; i < diceCount; i++) {
        const val = Math.floor(Math.random() * diceSides) + 1;
        rolls.push(val);
        sum += val;
      }

      const totalMod = formulaMod + customModifier;
      const total = sum + totalMod;

      const isD20 = diceCount === 1 && diceSides === 20;
      const isNat20 = isD20 && rolls[0] === 20;
      const isNat1 = isD20 && rolls[0] === 1;

      const result: RollResult = {
        id: `roll_${Date.now()}`,
        label,
        formula: customModifier !== 0 ? `${formula} ${customModifier >= 0 ? '+' : ''}${customModifier}` : formula,
        total,
        diceRolls: rolls,
        modifier: totalMod,
        isNat20,
        isNat1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setCurrentResult(result);
      setHistory(prev => [result, ...prev.slice(0, 15)]);
      setIsRolling(false);
    }, 150);
  };

  return (
    <>
      {/* BOTÃO FLUTUANTE DE DADOS (Inspirado no botão d20 da referência D&D Beyond) */}
      <button
        id="floating-dice-roller-button"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-[#8b1e1e] hover:bg-[#a32222] active:scale-95 text-white shadow-[0_4px_16px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all cursor-pointer border border-[#b33636]"
        title="Abrir Rolador de Dados"
      >
        <Dices size={24} className="text-white" />
      </button>

      {/* BANDEJA DE DADOS EXPANSÍVEL */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-[#141820] border-t sm:border border-[#2d3440] rounded-t-2xl sm:rounded-xl max-w-sm w-full p-4 space-y-3 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Topo do Rolador */}
            <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
              <div className="flex items-center gap-2">
                <Dices size={16} className="text-stone-300" />
                <h3 className="text-xs font-sans font-bold text-stone-200 uppercase tracking-wider">
                  Rolador de Dados
                </h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Resultado da Última Rolagem */}
            {currentResult ? (
              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#21262d] text-center space-y-1">
                <div className="flex items-center justify-between text-[10px] text-stone-400 font-sans">
                  <span className="truncate">{currentResult.label}</span>
                  <span>{currentResult.formula}</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className={`text-3xl sm:text-4xl font-cinzel font-bold leading-none ${
                    currentResult.isNat20 
                      ? 'text-[#c5a869]' 
                      : currentResult.isNat1 
                      ? 'text-red-400' 
                      : 'text-stone-100'
                  }`}>
                    {currentResult.total}
                  </span>
                </div>

                {/* Feedback Crítico / Falha */}
                {currentResult.isNat20 && (
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#c5a869] font-sans font-bold uppercase tracking-wider">
                    <Sparkles size={12} />
                    <span>20 Natural • Sucesso Crítico!</span>
                  </div>
                )}
                {currentResult.isNat1 && (
                  <div className="flex items-center justify-center gap-1 text-[11px] text-red-400 font-sans font-bold uppercase tracking-wider">
                    <Skull size={12} />
                    <span>1 Natural • Falha Crítica!</span>
                  </div>
                )}

                {/* Detalhes dos dados */}
                <div className="text-[10px] text-stone-500 font-sans pt-0.5">
                  Dados: [{currentResult.diceRolls.join(', ')}]
                  {currentResult.modifier !== 0 && (
                    <span> {currentResult.modifier >= 0 ? `+ ${currentResult.modifier}` : `- ${Math.abs(currentResult.modifier)}`}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 text-center rounded-lg bg-[#0d1117] border border-[#21262d]">
                <p className="text-xs text-stone-500 font-sans">
                  Escolha um dado abaixo ou clique em uma perícia/ataque na ficha.
                </p>
              </div>
            )}

            {/* Controle de Modificador Extra */}
            <div className="flex items-center justify-between px-1 text-xs font-sans text-stone-400">
              <span>Modificador Situacional:</span>
              <div className="flex items-center gap-1 bg-[#0d1117] px-2 py-0.5 rounded border border-[#21262d]">
                <button
                  onClick={() => setCustomModifier(prev => prev - 1)}
                  className="w-5 h-5 rounded hover:bg-[#1c2128] text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <Minus size={11} />
                </button>
                <span className="font-cinzel font-bold text-stone-200 min-w-5 text-center">
                  {customModifier >= 0 ? `+${customModifier}` : customModifier}
                </span>
                <button
                  onClick={() => setCustomModifier(prev => prev + 1)}
                  className="w-5 h-5 rounded hover:bg-[#1c2128] text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <Plus size={11} />
                </button>
                {customModifier !== 0 && (
                  <button
                    onClick={() => setCustomModifier(0)}
                    className="text-[10px] text-stone-500 hover:text-stone-300 ml-1 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Teclado de Dados Poliédricos */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: 'd4', formula: '1d4' },
                { label: 'd6', formula: '1d6' },
                { label: 'd8', formula: '1d8' },
                { label: 'd10', formula: '1d10' },
                { label: 'd12', formula: '1d12' },
                { label: 'd20', formula: '1d20' },
                { label: 'd100', formula: '1d100' },
                { label: '2d6', formula: '2d6' }
              ].map(d => (
                <button
                  key={d.label}
                  disabled={isRolling}
                  onClick={() => executeRoll(d.formula, `Rolagem de ${d.label}`)}
                  className="py-2 rounded-md bg-[#1c2128] hover:bg-[#28303e] border border-[#262c36] hover:border-[#384252] text-stone-200 font-cinzel font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Histórico Recente Recolhível */}
            {history.length > 0 && (
              <div className="border-t border-[#21262d] pt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-sans">
                  <span>Histórico Recente</span>
                  <button 
                    onClick={() => setHistory([])}
                    className="hover:text-stone-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={10} /> Limpar
                  </button>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 divide-y divide-[#1c2128]">
                  {history.slice(1, 6).map(h => (
                    <div key={h.id} className="flex items-center justify-between text-[11px] font-sans pt-1">
                      <span className="text-stone-400 truncate max-w-[180px]">{h.label}</span>
                      <span className="font-cinzel font-bold text-stone-200">{h.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
