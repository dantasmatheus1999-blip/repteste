import React, { useState } from 'react';
import { Minus, Plus, Dices } from 'lucide-react';
import { Attribute } from '../../../types/character';
import { 
  ATTRIBUTES_KEYS, 
  ATTRIBUTE_NAMES, 
  NormalizedSheetData, 
  formatMod 
} from '../../../utils/sheetCalculations';
import { SheetAttributeEditModal } from './SheetAttributeEditModal';

interface SheetAttributesProps {
  sheet: NormalizedSheetData;
  onUpdateAttribute: (attr: Attribute, newValue: number) => void;
  onRollDice?: (formula: string, label?: string) => void;
}

export const SheetAttributes: React.FC<SheetAttributesProps> = ({
  sheet,
  onUpdateAttribute,
  onRollDice
}) => {
  const [modalAttr, setModalAttr] = useState<Attribute | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider">
          Atributos
        </h2>
        <span className="text-[10px] text-stone-500 font-sans">
          Toque para rolar • Ajuste com − / +
        </span>
      </div>

      {/* Grade de 3 colunas elegante e compacta (Tormenta 20 Jogo do Ano: Modificador direto) */}
      <div className="grid grid-cols-3 gap-2">
        {ATTRIBUTES_KEYS.map((attr) => {
          const name = ATTRIBUTE_NAMES[attr];
          const mod = sheet.attrModifiers[attr] ?? 0;
          const formattedMod = formatMod(mod);

          return (
            <div
              key={attr}
              id={`attr-card-${attr.toLowerCase()}`}
              className="group relative bg-[#141820] hover:bg-[#181e28] border border-[#21262d] hover:border-[#384252] rounded-lg p-2.5 flex flex-col items-center justify-between text-center transition-all duration-150"
            >
              {/* Sigla e Nome do Atributo no Topo */}
              <div className="flex items-center justify-between w-full px-0.5">
                <span className="text-[10px] font-sans font-bold text-[#c5a869] uppercase tracking-wider">
                  {attr}
                </span>
                <span className="text-[9px] font-sans text-stone-400 truncate max-w-[55px]">
                  {name}
                </span>
              </div>

              {/* Controles discretos [ - ] MODIFICADOR DIRETO [ + ] */}
              <div className="flex items-center justify-center gap-1.5 my-1.5 w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateAttribute(attr, mod - 1);
                  }}
                  className="w-5 h-5 rounded bg-[#1c2128] hover:bg-[#28303e] text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={`Diminuir ${name} (-1)`}
                >
                  <Minus size={10} />
                </button>

                {/* Valor Direto Tormenta20 JdA (clique para editar) */}
                <button
                  onClick={() => setModalAttr(attr)}
                  className="text-xl sm:text-2xl font-cinzel font-bold text-stone-100 px-1 hover:text-[#c5a869] cursor-pointer transition-colors leading-none tracking-tight"
                  title="Clique para editar atributo"
                >
                  {formattedMod}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateAttribute(attr, mod + 1);
                  }}
                  className="w-5 h-5 rounded bg-[#1c2128] hover:bg-[#28303e] text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title={`Aumentar ${name} (+1)`}
                >
                  <Plus size={10} />
                </button>
              </div>

              {/* Botão de Rolagem d20 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRollDice?.(`1d20 ${formattedMod}`, `Teste de ${name}`);
                }}
                className="w-full py-1 px-1 rounded bg-[#0d1117] hover:bg-[#1c2128] border border-[#21262d] hover:border-[#384252] flex items-center justify-center gap-1 text-[11px] font-sans font-semibold text-stone-300 hover:text-[#c5a869] transition-colors cursor-pointer"
                title={`Rolar Teste de ${name} (1d20 ${formattedMod})`}
              >
                <Dices size={11} className="text-stone-400 group-hover:text-stone-300" />
                <span>Rolar d20</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de Edição Detalhada */}
      {modalAttr && (
        <SheetAttributeEditModal
          attrKey={modalAttr}
          attrName={ATTRIBUTE_NAMES[modalAttr]}
          currentValue={sheet.attrModifiers[modalAttr] ?? 0}
          currentMod={sheet.attrModifiers[modalAttr] ?? 0}
          onSave={(newVal) => {
            onUpdateAttribute(modalAttr, newVal);
            setModalAttr(null);
          }}
          onClose={() => setModalAttr(null)}
        />
      )}
    </div>
  );
};
