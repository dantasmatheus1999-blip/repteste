import React from 'react';
import { X, Award, Plus, Minus, Calendar, User, ScrollText } from 'lucide-react';
import { XpHistoryEntry } from '../../../types/character';

interface SheetXpHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  xpTotal: number;
  xpHistory?: XpHistoryEntry[];
}

export const SheetXpHistoryModal: React.FC<SheetXpHistoryModalProps> = ({
  isOpen,
  onClose,
  characterName,
  xpTotal,
  xpHistory = []
}) => {
  if (!isOpen) return null;

  const sortedHistory = [...xpHistory].sort((a, b) => {
    const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
    const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#0e121a] border border-[#212733] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1c222e] flex items-center justify-between bg-[#121622]">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-amber-400" />
            <div>
              <h2 className="text-sm font-cinzel font-bold text-stone-100 uppercase tracking-wide">
                Histórico de Experiência (XP)
              </h2>
              <p className="text-[11px] text-stone-400 font-sans">
                {characterName} • {xpTotal.toLocaleString('pt-BR')} XP Acumulado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-100 hover:bg-[#1c222e] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of XP records */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-10 text-stone-500 font-sans space-y-2">
              <ScrollText size={32} className="mx-auto text-stone-600 opacity-60" />
              <p className="text-xs">Nenhum registro de XP concedido ainda.</p>
              <p className="text-[11px] text-stone-600">
                O Mestre da campanha pode conceder XP nas sessões e registrar o motivo de cada conquista.
              </p>
            </div>
          ) : (
            sortedHistory.map((entry) => {
              const isPositive = entry.amount >= 0;
              const formattedDate = entry.createdAt
                ? new Date(typeof entry.createdAt === 'number' ? entry.createdAt : entry.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Data não registrada';

              return (
                <div
                  key={entry.id || `${entry.createdAt}-${entry.amount}`}
                  className="p-3 rounded-lg bg-[#141823] border border-[#202736] flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold font-sans ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isPositive ? <Plus size={12} /> : <Minus size={12} />}
                        {Math.abs(entry.amount).toLocaleString('pt-BR')} XP
                      </span>

                      <span className="text-xs font-semibold text-stone-200">
                        {entry.reason || 'Concessão de XP'}
                      </span>
                    </div>

                    <span className="text-[10px] text-stone-500 flex items-center gap-1 font-sans">
                      <Calendar size={10} />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Detalhes de transição */}
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-sans pt-1 border-t border-[#1c222e]">
                    <span>
                      XP: {entry.previousXp?.toLocaleString('pt-BR') ?? 0} →{' '}
                      <strong className="text-stone-200">{entry.newXp?.toLocaleString('pt-BR')}</strong>
                    </span>

                    {entry.masterName && (
                      <span className="flex items-center gap-1 text-stone-500 text-[10px]">
                        <User size={10} />
                        Mestre: {entry.masterName}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1c222e] bg-[#10141d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1a202c] hover:bg-[#222938] text-stone-300 text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
