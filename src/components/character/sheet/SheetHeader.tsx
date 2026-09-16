import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Flame, 
  ShieldAlert, 
  User, 
  Check, 
  Loader2,
  Shield,
  Zap,
  Wind,
  Sparkles,
  Plus,
  Minus,
  ArrowUpCircle
} from 'lucide-react';
import { NormalizedSheetData, formatMod } from '../../../utils/sheetCalculations';
import { SheetXpBar } from './SheetXpBar';

interface SheetHeaderProps {
  sheet: NormalizedSheetData;
  isSaving: boolean;
  onOpenRest: () => void;
  onOpenConditions: () => void;
  onOpenLevelUp?: () => void;
  onOpenXpHistory?: () => void;
  onUpdateDefense?: (newVal: number) => void;
  onUpdateInitiative?: (newVal: number) => void;
  onRollDice?: (formula: string, label?: string) => void;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({
  sheet,
  isSaving,
  onOpenRest,
  onOpenConditions,
  onOpenLevelUp,
  onOpenXpHistory,
  onUpdateDefense,
  onRollDice
}) => {
  const navigate = useNavigate();
  const [editingStat, setEditingStat] = useState<string | null>(null);

  return (
    <header className="bg-[#0e1117] border-b border-[#21262d] sticky top-0 z-30">
      {/* Top Bar com Navegação e Identidade */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-3">
          {/* Lado Esquerdo: Voltar + Nome e Subtítulo */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              id="sheet-back-button"
              onClick={() => navigate('/characters')}
              className="p-1 rounded-md text-stone-400 hover:text-stone-100 hover:bg-[#161b22] transition-colors shrink-0 cursor-pointer"
              title="Voltar para a lista"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-cinzel font-bold text-stone-100 truncate tracking-wide leading-tight">
                  {sheet.name}
                </h1>
                {isSaving ? (
                  <span className="flex items-center text-[10px] text-stone-400 shrink-0 animate-pulse">
                    <Loader2 size={11} className="animate-spin mr-1" />
                    <span className="hidden sm:inline">Salvando...</span>
                  </span>
                ) : (
                  <span className="text-stone-500 text-[10px] shrink-0" title="Sincronizado">
                    <Check size={12} className="text-emerald-500/80" />
                  </span>
                )}
              </div>

              <p className="text-[11px] sm:text-xs text-stone-400 font-sans truncate tracking-wide">
                <span className="text-stone-300 font-medium">{sheet.raceName}</span>
                {' • '}
                <span className="text-stone-300 font-medium">{sheet.className}</span>
                {' '}
                <span className="text-stone-400 font-semibold">Nível {sheet.level}</span>
                {sheet.originName && (
                  <span className="hidden md:inline text-stone-500">
                    {' • '}{sheet.originName}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Lado Direito: Ações Discretas (Subir de Nível, Condições, Fogueira) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Botão Subir de Nível (se nível < 20) */}
            {sheet.level < 20 && onOpenLevelUp ? (
              <button
                id="sheet-level-up-button"
                onClick={onOpenLevelUp}
                className={`px-2.5 py-1.5 rounded-md border text-xs font-sans font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                  sheet.canLevelUp
                    ? 'bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-200 border-amber-400 animate-pulse hover:brightness-110'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 hover:border-amber-500/50'
                }`}
                title="Subir de Nível (Tormenta 20)"
              >
                <ArrowUpCircle size={13} className="text-amber-400 shrink-0" />
                <span className="text-[11px] tracking-wide font-sans">
                  {sheet.canLevelUp ? 'NOVO NÍVEL DISPONÍVEL' : 'SUBIR DE NÍVEL'}
                </span>
              </button>
            ) : sheet.level >= 20 ? (
              <span className="px-2.5 py-1 rounded text-[10px] font-sans font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                NÍVEL MÁXIMO (20)
              </span>
            ) : null}

            {/* Botão Condições */}
            <button
              id="sheet-conditions-button"
              onClick={onOpenConditions}
              className={`px-2.5 py-1.5 rounded-md border text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                sheet.conditions.length > 0
                  ? 'bg-[#1c1f26] border-[#384252] text-stone-200'
                  : 'bg-[#161b22] border-[#262c36] text-stone-400 hover:text-stone-200 hover:border-[#384252]'
              }`}
              title="Condições ativas"
            >
              <ShieldAlert size={13} className={sheet.conditions.length > 0 ? 'text-amber-400' : 'text-stone-500'} />
              <span className="text-[11px]">CONDIÇÕES</span>
              {sheet.conditions.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#28303e] text-[10px] font-bold text-stone-200 flex items-center justify-center">
                  {sheet.conditions.length}
                </span>
              )}
            </button>

            {/* Botão Descanso */}
            <button
              id="sheet-rest-button"
              onClick={onOpenRest}
              className="p-1.5 rounded-md bg-[#161b22] hover:bg-[#1c2128] border border-[#262c36] hover:border-[#384252] text-stone-300 transition-colors cursor-pointer"
              title="Descanso curto ou longo"
            >
              <Flame size={15} className="text-stone-400 hover:text-orange-300" />
            </button>
          </div>
        </div>

        {/* Barra de Experiência Oficial Tormenta20 JdA */}
        <div className="mt-2">
          <SheetXpBar
            sheet={sheet}
            onOpenLevelUpSelector={onOpenLevelUp || (() => {})}
            onOpenXpHistory={onOpenXpHistory}
          />
        </div>

        {/* Linha de Estatísticas Principais (DEFESA, INICIATIVA, AVATAR, DESLOCAMENTO, CD) */}
        {/* Inspirado diretamente na referência de proporção do D&D Beyond: 4 blocos sóbrios e avatar centralizado */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-[#1c2128]">
          {/* DEFESA */}
          <div 
            className="bg-[#141820] border border-[#21262d] rounded-lg p-1.5 sm:p-2 flex flex-col items-center justify-center text-center relative group"
          >
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-stone-400 uppercase tracking-wider">
              Defesa
            </span>
            <span className="text-lg sm:text-xl font-cinzel font-bold text-stone-100 my-0.5 leading-none">
              {sheet.defense}
            </span>
            <span className="text-[8px] sm:text-[9px] text-stone-400 font-sans">
              Classe
            </span>

            {/* Controles discretos em hover/tap */}
            {onUpdateDefense && (
              <div className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center bg-[#0d1117] border border-[#30363d] rounded shadow-md z-10">
                <button 
                  onClick={() => onUpdateDefense(Math.max(0, sheet.defense - 1))}
                  className="w-4 h-4 flex items-center justify-center text-stone-400 hover:text-white"
                >
                  <Minus size={10} />
                </button>
                <button 
                  onClick={() => onUpdateDefense(sheet.defense + 1)}
                  className="w-4 h-4 flex items-center justify-center text-stone-400 hover:text-white"
                >
                  <Plus size={10} />
                </button>
              </div>
            )}
          </div>

          {/* INICIATIVA */}
          <button
            onClick={() => onRollDice?.(`1d20 + ${sheet.initiative}`, 'Iniciativa')}
            className="bg-[#141820] hover:bg-[#181e28] border border-[#21262d] hover:border-[#384252] rounded-lg p-1.5 sm:p-2 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group"
            title="Rolar Teste de Iniciativa"
          >
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-stone-400 uppercase tracking-wider group-hover:text-stone-300">
              Iniciativa
            </span>
            <span className="text-lg sm:text-xl font-cinzel font-bold text-stone-100 my-0.5 leading-none group-hover:text-[#c5a869]">
              {formatMod(sheet.initiative)}
            </span>
            <span className="text-[8px] sm:text-[9px] text-stone-400 font-sans">
              Rolar d20
            </span>
          </button>

          {/* AVATAR DO PERSONAGEM (Centralizado como na referência) */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-[#2d3440] bg-[#12151c] flex items-center justify-center relative shadow-sm">
              {sheet.imageUrl ? (
                <img 
                  src={sheet.imageUrl} 
                  alt={sheet.name}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={22} className="text-stone-600" />
              )}
            </div>
            <span className="text-[8px] sm:text-[9px] font-sans text-stone-400 mt-1 uppercase font-medium">
              Herói
            </span>
          </div>

          {/* DESLOCAMENTO */}
          <div className="bg-[#141820] border border-[#21262d] rounded-lg p-1.5 sm:p-2 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-stone-400 uppercase tracking-wider">
              Desloc.
            </span>
            <span className="text-lg sm:text-xl font-cinzel font-bold text-stone-100 my-0.5 leading-none">
              {sheet.movement}
            </span>
            <span className="text-[8px] sm:text-[9px] text-stone-400 font-sans">
              Metros
            </span>
          </div>

          {/* CD DE HABILIDADES/MAGIAS */}
          <div className="bg-[#141820] border border-[#21262d] rounded-lg p-1.5 sm:p-2 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-stone-400 uppercase tracking-wider">
              CD Magia
            </span>
            <span className="text-lg sm:text-xl font-cinzel font-bold text-stone-100 my-0.5 leading-none">
              {sheet.spellDC}
            </span>
            <span className="text-[8px] sm:text-[9px] text-stone-400 font-sans">
              Resistência
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
