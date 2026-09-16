import React from 'react';
import { Dices } from 'lucide-react';
import { NormalizedSheetData, formatMod } from '../../../utils/sheetCalculations';

interface SheetResistancesProps {
  sheet: NormalizedSheetData;
  onRollDice?: (formula: string, label?: string) => void;
}

export const SheetResistances: React.FC<SheetResistancesProps> = ({
  sheet,
  onRollDice
}) => {
  const saves = [
    {
      id: 'fortitude',
      name: 'Fortitude',
      attr: 'Con',
      bonus: sheet.resistances.fortitude
    },
    {
      id: 'reflexos',
      name: 'Reflexos',
      attr: 'Des',
      bonus: sheet.resistances.reflexos
    },
    {
      id: 'vontade',
      name: 'Vontade',
      attr: 'Sab',
      bonus: sheet.resistances.vontade
    }
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider">
          Testes de Resistência
        </h2>
        <span className="text-[10px] text-stone-500 font-sans">
          Toque para rolar d20
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {saves.map((save) => {
          const formatted = formatMod(save.bonus);

          return (
            <button
              key={save.id}
              onClick={() => onRollDice?.(`1d20 ${formatted}`, `Resistência (${save.name})`)}
              className="bg-[#141820] hover:bg-[#181e28] border border-[#21262d] hover:border-[#384252] rounded-lg p-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer group"
              title={`Rolar teste de ${save.name} (1d20 ${formatted})`}
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-stone-300 group-hover:text-stone-100">
                  {save.name}
                </span>
                <span className="text-[9px] text-stone-500 font-sans">
                  ({save.attr})
                </span>
              </div>

              <div className="my-1 flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-cinzel font-bold text-stone-100 group-hover:text-[#c5a869] leading-none">
                  {formatted}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[9px] text-stone-500 group-hover:text-stone-400 font-sans">
                <Dices size={10} />
                <span>Rolar</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
