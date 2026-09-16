import React, { useState } from 'react';
import { User, FileText, Check } from 'lucide-react';
import { NormalizedSheetData } from '../../../utils/sheetCalculations';

interface SheetBiographyProps {
  sheet: NormalizedSheetData;
  onUpdateNotes: (newNotes: string) => void;
}

export const SheetBiography: React.FC<SheetBiographyProps> = ({
  sheet,
  onUpdateNotes
}) => {
  const [notes, setNotes] = useState(sheet.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleBlur = () => {
    onUpdateNotes(notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* 1. CARTÃO DE INFORMAÇÕES DO HERÓI */}
      <div className="bg-[#141820] border border-[#21262d] rounded-lg p-3 space-y-2.5">
        <h3 className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
          <User size={13} className="text-stone-400" />
          <span>Informações e Detalhes</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-sans">
          <div className="bg-[#0d1117] p-2 rounded border border-[#1f242d]">
            <span className="text-[10px] text-stone-500 uppercase block font-semibold">Raça</span>
            <span className="text-stone-200 font-medium">{sheet.raceName}</span>
          </div>

          <div className="bg-[#0d1117] p-2 rounded border border-[#1f242d]">
            <span className="text-[10px] text-stone-500 uppercase block font-semibold">Classe & Nível</span>
            <span className="text-stone-200 font-medium">{sheet.className} Nvl {sheet.level}</span>
          </div>

          <div className="bg-[#0d1117] p-2 rounded border border-[#1f242d]">
            <span className="text-[10px] text-stone-500 uppercase block font-semibold">Origem</span>
            <span className="text-stone-200 font-medium">{sheet.originName || 'Sem origem'}</span>
          </div>

          <div className="bg-[#0d1117] p-2 rounded border border-[#1f242d]">
            <span className="text-[10px] text-stone-500 uppercase block font-semibold">Divindade</span>
            <span className="text-stone-200 font-medium">{sheet.deity || 'Nenhuma'}</span>
          </div>

          <div className="bg-[#0d1117] p-2 rounded border border-[#1f242d]">
            <span className="text-[10px] text-stone-500 uppercase block font-semibold">Tamanho</span>
            <span className="text-stone-200 font-medium">{sheet.size || 'Médio'}</span>
          </div>

          <div className="bg-[#0d1117] p-2 rounded border border-[#1f242d]">
            <span className="text-[10px] text-stone-500 uppercase block font-semibold">Deslocamento</span>
            <span className="text-stone-200 font-medium">{sheet.movement}</span>
          </div>
        </div>
      </div>

      {/* 2. BLOCO DE NOTAS DA SESSÃO COM AUTO-SAVE */}
      <div className="bg-[#141820] border border-[#21262d] rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={13} className="text-stone-400" />
            <span>Bloco de Notas da Sessão</span>
          </h3>
          {isSaved && (
            <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-1">
              <Check size={11} /> Salvo
            </span>
          )}
        </div>

        <textarea
          rows={7}
          placeholder="Anote aqui tesouros, pistas, nomes de tavernas, NPCs e anotações da mesa..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleBlur}
          className="w-full p-2.5 rounded-md bg-[#0d1117] border border-[#21262d] focus:border-[#384252] text-xs font-sans text-stone-200 placeholder-stone-600 outline-hidden resize-y leading-relaxed"
        />
        <p className="text-[10px] text-stone-500 font-sans">
          As anotações são salvas automaticamente quando você sai do campo.
        </p>
      </div>
    </div>
  );
};
