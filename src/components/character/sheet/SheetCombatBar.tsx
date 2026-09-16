import React, { useState } from 'react';
import { 
  Heart, 
  Zap, 
  Plus, 
  Minus, 
  X, 
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { NormalizedSheetData } from '../../../utils/sheetCalculations';
import { T20_CONDITIONS } from '../../../data/t20Conditions';

interface SheetCombatBarProps {
  sheet: NormalizedSheetData;
  onUpdatePV: (newPV: number) => void;
  onUpdatePM: (newPM: number) => void;
  onRemoveCondition: (conditionId: string) => void;
  onOpenConditionsModal: () => void;
  onRollDice?: (formula: string, label?: string) => void;
}

export const SheetCombatBar: React.FC<SheetCombatBarProps> = ({
  sheet,
  onUpdatePV,
  onUpdatePM,
  onRemoveCondition,
  onOpenConditionsModal,
  onRollDice
}) => {
  // Modal rápido de Dano / Cura de PV
  const [pvModalOpen, setPvModalOpen] = useState(false);
  const [pvInput, setPvInput] = useState('');

  // Modal rápido de Gastar / Recuperar PM
  const [pmModalOpen, setPmModalOpen] = useState(false);
  const [pmInput, setPmInput] = useState('');

  // Cálculos de porcentagem
  const pvPercent = sheet.maxPV > 0 ? Math.min(100, Math.max(0, (sheet.currentPV / sheet.maxPV) * 100)) : 100;
  const isCritical = pvPercent <= 25;
  const isWarning = pvPercent > 25 && pvPercent <= 50;

  let pvBarColor = 'bg-emerald-600';
  let pvTextColor = 'text-stone-100';
  if (isCritical) {
    pvBarColor = 'bg-red-600';
    pvTextColor = 'text-red-400';
  } else if (isWarning) {
    pvBarColor = 'bg-amber-600';
    pvTextColor = 'text-amber-300';
  }

  const pmPercent = sheet.maxPM > 0 ? Math.min(100, Math.max(0, (sheet.currentPM / sheet.maxPM) * 100)) : 100;

  // Ações de PV
  const handleApplyDamage = () => {
    const val = parseInt(pvInput, 10) || 0;
    if (val > 0) {
      onUpdatePV(Math.max(0, sheet.currentPV - val));
      setPvInput('');
      setPvModalOpen(false);
    }
  };

  const handleApplyHeal = () => {
    const val = parseInt(pvInput, 10) || 0;
    if (val > 0) {
      onUpdatePV(Math.min(sheet.maxPV, sheet.currentPV + val));
      setPvInput('');
      setPvModalOpen(false);
    }
  };

  const handleSetDirectPV = () => {
    const val = parseInt(pvInput, 10);
    if (!isNaN(val)) {
      onUpdatePV(Math.max(0, Math.min(sheet.maxPV, val)));
      setPvInput('');
      setPvModalOpen(false);
    }
  };

  // Ações de PM
  const handleSpendPM = () => {
    const val = parseInt(pmInput, 10) || 0;
    if (val > 0) {
      onUpdatePM(Math.max(0, sheet.currentPM - val));
      setPmInput('');
      setPmModalOpen(false);
    }
  };

  const handleRecoverPM = () => {
    const val = parseInt(pmInput, 10) || 0;
    if (val > 0) {
      onUpdatePM(Math.min(sheet.maxPM, sheet.currentPM + val));
      setPmInput('');
      setPmModalOpen(false);
    }
  };

  const handleSetDirectPM = () => {
    const val = parseInt(pmInput, 10);
    if (!isNaN(val)) {
      onUpdatePM(Math.max(0, Math.min(sheet.maxPM, val)));
      setPmInput('');
      setPmModalOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* 1. BARRAS DE PONTOS DE VIDA E MANA (COM COR FUNCIONAL CONTIDA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* RECURSO: PONTOS DE VIDA */}
        <div className="bg-[#141820] border border-[#21262d] rounded-lg p-2.5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-stone-300 uppercase tracking-wider">
              <Heart size={14} className="text-emerald-500 fill-emerald-500/20 shrink-0" />
              <span>Pontos de Vida</span>
            </div>

            {/* Controles discretos [ - ] 20/20 [ + ] */}
            <div className="flex items-center gap-1">
              <button
                id="pv-minus-btn"
                onClick={() => onUpdatePV(Math.max(0, sheet.currentPV - 1))}
                className="w-6 h-6 rounded bg-[#1c2128] hover:bg-[#262c36] border border-[#30363d] text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Reduzir 1 PV"
              >
                <Minus size={12} />
              </button>

              <button
                id="pv-direct-edit-btn"
                onClick={() => setPvModalOpen(true)}
                className="px-2 py-0.5 rounded bg-[#0d1117] hover:bg-[#161b22] border border-[#2a303c] flex items-center gap-1 cursor-pointer transition-colors"
                title="Clique para aplicar dano, cura ou digitar valor"
              >
                <span className={`font-cinzel font-bold text-sm sm:text-base leading-none ${pvTextColor}`}>
                  {sheet.currentPV}
                </span>
                <span className="text-xs text-stone-500 font-sans">
                  /{sheet.maxPV}
                </span>
                <Edit3 size={10} className="text-stone-500 ml-0.5 opacity-60" />
              </button>

              <button
                id="pv-plus-btn"
                onClick={() => onUpdatePV(Math.min(sheet.maxPV, sheet.currentPV + 1))}
                className="w-6 h-6 rounded bg-[#1c2128] hover:bg-[#262c36] border border-[#30363d] text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Aumentar 1 PV"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Barra de Progresso Fina e Elegante */}
          <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden border border-[#21262d]">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${pvBarColor}`}
              style={{ width: `${pvPercent}%` }}
            />
          </div>
        </div>

        {/* RECURSO: PONTOS DE MANA */}
        <div className="bg-[#141820] border border-[#21262d] rounded-lg p-2.5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-stone-300 uppercase tracking-wider">
              <Zap size={14} className="text-blue-500 fill-blue-500/20 shrink-0" />
              <span>Pontos de Mana</span>
            </div>

            {/* Controles discretos [ - ] 3/3 [ + ] */}
            <div className="flex items-center gap-1">
              <button
                id="pm-minus-btn"
                onClick={() => onUpdatePM(Math.max(0, sheet.currentPM - 1))}
                className="w-6 h-6 rounded bg-[#1c2128] hover:bg-[#262c36] border border-[#30363d] text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Gastar 1 PM"
              >
                <Minus size={12} />
              </button>

              <button
                id="pm-direct-edit-btn"
                onClick={() => setPmModalOpen(true)}
                className="px-2 py-0.5 rounded bg-[#0d1117] hover:bg-[#161b22] border border-[#2a303c] flex items-center gap-1 cursor-pointer transition-colors"
                title="Clique para gastar, recuperar ou digitar valor"
              >
                <span className="font-cinzel font-bold text-sm sm:text-base text-blue-400 leading-none">
                  {sheet.currentPM}
                </span>
                <span className="text-xs text-stone-500 font-sans">
                  /{sheet.maxPM}
                </span>
                <Edit3 size={10} className="text-stone-500 ml-0.5 opacity-60" />
              </button>

              <button
                id="pm-plus-btn"
                onClick={() => onUpdatePM(Math.min(sheet.maxPM, sheet.currentPM + 1))}
                className="w-6 h-6 rounded bg-[#1c2128] hover:bg-[#262c36] border border-[#30363d] text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Recuperar 1 PM"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Barra de Progresso Fina e Elegante */}
          <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden border border-[#21262d]">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${pmPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. CHIPS DE CONDIÇÕES ATIVAS (DISCRETOS E SÓBRIOS) */}
      {sheet.conditions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-sans text-stone-400 font-bold uppercase tracking-wider mr-1">
            Condições:
          </span>
          {sheet.conditions.map((condId) => {
            const def = T20_CONDITIONS.find(c => c.id === condId || c.name.toLowerCase() === condId.toLowerCase());
            const label = def?.name || condId;

            return (
              <span
                key={condId}
                className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded bg-[#161b22] border border-[#2d3440] text-stone-300 text-xs font-sans"
                title={def?.fullDesc || 'Condição ativa'}
              >
                <span>{label}</span>
                <button
                  onClick={() => onRemoveCondition(condId)}
                  className="w-3.5 h-3.5 rounded hover:bg-[#262c36] text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors cursor-pointer"
                  title={`Remover condição ${label}`}
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
          <button
            onClick={onOpenConditionsModal}
            className="text-[11px] text-stone-400 hover:text-stone-200 font-sans px-1.5 py-0.5 rounded hover:bg-[#161b22] cursor-pointer underline"
          >
            + Adicionar
          </button>
        </div>
      )}

      {/* MODAL DISCRETO DE PV (DANO / CURA) */}
      {pvModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setPvModalOpen(false)}
        >
          <div 
            className="bg-[#141820] border border-[#2d3440] rounded-xl max-w-xs w-full p-4 space-y-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
              <h3 className="text-xs font-sans font-bold text-stone-200 uppercase tracking-wider">
                Pontos de Vida ({sheet.currentPV}/{sheet.maxPV})
              </h3>
              <button onClick={() => setPvModalOpen(false)} className="text-stone-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <input
              type="number"
              min="0"
              autoFocus
              placeholder="Digite a quantidade..."
              value={pvInput}
              onChange={(e) => setPvInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyDamage();
              }}
              className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#4d5766] text-stone-100 text-center text-lg font-cinzel font-bold outline-hidden"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleApplyDamage}
                className="py-1.5 px-3 rounded-md bg-[#261e20] hover:bg-[#38262a] border border-[#523339] text-red-300 font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Dano (−)
              </button>
              <button
                onClick={handleApplyHeal}
                className="py-1.5 px-3 rounded-md bg-[#16231c] hover:bg-[#1e3328] border border-[#2e523e] text-emerald-300 font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Cura (+)
              </button>
            </div>

            <button
              onClick={handleSetDirectPV}
              className="w-full py-1 text-center text-[11px] text-stone-400 hover:text-stone-200 underline font-sans cursor-pointer"
            >
              Definir exatamente como {pvInput || '0'} PV
            </button>
          </div>
        </div>
      )}

      {/* MODAL DISCRETO DE PM (GASTAR / RECUPERAR) */}
      {pmModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setPmModalOpen(false)}
        >
          <div 
            className="bg-[#141820] border border-[#2d3440] rounded-xl max-w-xs w-full p-4 space-y-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
              <h3 className="text-xs font-sans font-bold text-stone-200 uppercase tracking-wider">
                Pontos de Mana ({sheet.currentPM}/{sheet.maxPM})
              </h3>
              <button onClick={() => setPmModalOpen(false)} className="text-stone-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <input
              type="number"
              min="0"
              autoFocus
              placeholder="Digite a quantidade..."
              value={pmInput}
              onChange={(e) => setPmInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSpendPM();
              }}
              className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#4d5766] text-stone-100 text-center text-lg font-cinzel font-bold outline-hidden"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSpendPM}
                className="py-1.5 px-3 rounded-md bg-[#161c28] hover:bg-[#1e273b] border border-[#2d3e5e] text-blue-300 font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Gastar (−)
              </button>
              <button
                onClick={handleRecoverPM}
                className="py-1.5 px-3 rounded-md bg-[#16222b] hover:bg-[#1f313e] border border-[#2d495e] text-cyan-300 font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Recuperar (+)
              </button>
            </div>

            <button
              onClick={handleSetDirectPM}
              className="w-full py-1 text-center text-[11px] text-stone-400 hover:text-stone-200 underline font-sans cursor-pointer"
            >
              Definir exatamente como {pmInput || '0'} PM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
