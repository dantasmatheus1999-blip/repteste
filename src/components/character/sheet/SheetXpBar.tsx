import React from 'react';
import { Sparkles, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { NormalizedSheetData } from '../../../utils/sheetCalculations';

interface SheetXpBarProps {
  sheet: NormalizedSheetData;
  onOpenLevelUpSelector: () => void;
  onOpenXpHistory?: () => void;
}

export const SheetXpBar: React.FC<SheetXpBarProps> = ({
  sheet,
  onOpenLevelUpSelector,
  onOpenXpHistory,
}) => {
  const { xpProgress } = sheet;
  const isMaxLevel = xpProgress.isMaxLevel || sheet.level >= 20;
  const canLevelUp = xpProgress.canLevelUp && !isMaxLevel;
  const percent = Math.min(100, Math.max(0, xpProgress.progressPercent));

  return (
    <div 
      id="sheet-xp-bar-container"
      className="bg-[#10141d] border border-[#212733] rounded-lg px-3 py-2 transition-all"
    >
      {/* Linha Superior: Nível, Valores de XP e Status */}
      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Award size={12} className="text-amber-400 shrink-0" />
            <span className="text-[11px] font-sans font-bold tracking-wider uppercase">
              {isMaxLevel ? 'NÍVEL 20 (MÁXIMO)' : `NÍVEL ${sheet.level}`}
            </span>
          </div>

          {/* Botão para visualizar histórico de XP se houver */}
          {onOpenXpHistory && (
            <button
              onClick={onOpenXpHistory}
              className="text-[10px] text-stone-400 hover:text-amber-300 transition-colors font-sans underline underline-offset-2 cursor-pointer"
              title="Ver histórico de XP concedido"
            >
              Histórico ({sheet.xpHistory?.length || 0})
            </button>
          )}
        </div>

        {/* Quantidades de XP */}
        <div className="flex items-center gap-2 font-sans text-[11px] text-stone-300">
          {isMaxLevel ? (
            <span className="text-amber-400 font-medium">
              {sheet.xpTotal.toLocaleString('pt-BR')} XP Acumulado
            </span>
          ) : (
            <>
              <span className="text-stone-200 font-semibold">
                {sheet.xpTotal.toLocaleString('pt-BR')}
              </span>
              <span className="text-stone-500">/</span>
              <span className="text-stone-400">
                {(sheet.xpToNextLevel ?? 0).toLocaleString('pt-BR')} XP
              </span>
            </>
          )}
        </div>
      </div>

      {/* A Barra de Progresso Visual */}
      <div className="relative w-full h-2.5 bg-[#0b0e14] border border-[#1f2530] rounded-full overflow-hidden">
        <div
          id="sheet-xp-fill"
          className={`h-full transition-all duration-700 ease-out rounded-full ${
            canLevelUp
              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse'
              : isMaxLevel
              ? 'bg-gradient-to-r from-amber-700 to-amber-500'
              : 'bg-gradient-to-r from-amber-800 via-amber-600 to-amber-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Linha Inferior: Restante ou Alerta de Level Up */}
      <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] font-sans">
        {canLevelUp ? (
          <button
            onClick={onOpenLevelUpSelector}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold cursor-pointer group"
          >
            <Sparkles size={12} className="text-amber-400 animate-spin-slow" />
            <span className="tracking-wide uppercase">
              PRONTO PARA SUBIR DE NÍVEL ({sheet.level} → {sheet.level + 1})
            </span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : isMaxLevel ? (
          <span className="text-stone-400 flex items-center gap-1">
            <CheckCircle2 size={11} className="text-amber-500" />
            Nenhum próximo nível — Glória Épica
          </span>
        ) : (
          <span className="text-stone-400">
            Faltam{' '}
            <strong className="text-stone-200 font-medium">
              {xpProgress.remainingXpToNextLevel.toLocaleString('pt-BR')} XP
            </strong>{' '}
            para o Nível {sheet.level + 1}
          </span>
        )}

        {/* Degrau do nível atual */}
        {!isMaxLevel && (
          <span className="text-stone-500">
            +{xpProgress.xpInCurrentLevel.toLocaleString('pt-BR')} / {xpProgress.xpNeededForSpan.toLocaleString('pt-BR')} no nível
          </span>
        )}
      </div>
    </div>
  );
};
