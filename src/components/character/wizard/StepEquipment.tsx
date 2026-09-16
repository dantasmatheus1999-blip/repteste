import React from 'react';
import { Package, Plus, Trash2, Scale, Sparkles, Minus } from 'lucide-react';
import { WizardData, calcMod } from './types';
import { CharacterItem } from '../../../types/character';

interface StepEquipmentProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

const COMMON_ITEMS = [
  { name: 'Mochila de Aventureiro', quantity: 1, weight: 1 },
  { name: 'Saco de Dormir', quantity: 1, weight: 2 },
  { name: 'Corda de Cânhamo (15m)', quantity: 1, weight: 5 },
  { name: 'Tochas (5 unidades)', quantity: 5, weight: 1 },
  { name: 'Ração de Viagem (7 dias)', quantity: 7, weight: 0.5 },
  { name: 'Cantil de Água', quantity: 1, weight: 1 },
  { name: 'Pederneira', quantity: 1, weight: 0.1 },
  { name: 'Kit de Primeiros Socorros', quantity: 1, weight: 1 }
];

export const StepEquipment: React.FC<StepEquipmentProps> = ({ data, onChange }) => {
  // Tormenta 20 JdA: Limite de carga = 10 + (2 * Força)
  const forMod = calcMod(data.attributes.FOR ?? 0);
  const maxLoad = Math.max(10, 10 + (forMod * 2));

  const currentLoad = data.equipment.reduce(
    (sum, item) => sum + (Number(item.weight) || 0) * (Number(item.quantity) || 1),
    0
  );

  const loadPercent = Math.min(100, Math.round((currentLoad / maxLoad) * 100));
  const isOverburdened = currentLoad > maxLoad;

  const addAllAdventurerKit = () => {
    const newItems: CharacterItem[] = COMMON_ITEMS.map((item, idx) => ({
      id: `eq-${Date.now()}-${idx}`,
      name: item.name,
      quantity: item.quantity,
      weight: item.weight
    }));
    onChange({ equipment: [...data.equipment, ...newItems] });
  };

  const updateItemQuantity = (index: number, delta: number) => {
    const updated = [...data.equipment];
    const newQty = Math.max(1, (Number(updated[index].quantity) || 1) + delta);
    updated[index] = { ...updated[index], quantity: newQty };
    onChange({ equipment: updated });
  };

  const removeItem = (index: number) => {
    onChange({ equipment: data.equipment.filter((_, i) => i !== index) });
  };

  const addEmptyItem = () => {
    const newItem: CharacterItem = {
      id: `eq-${Date.now()}`,
      name: 'Novo Item',
      quantity: 1,
      weight: 1
    };
    onChange({ equipment: [...data.equipment, newItem] });
  };

  return (
    <div className="w-full space-y-3 max-w-xl mx-auto flex flex-col h-full justify-between">
      {/* Load / Weight Status Bar */}
      <div className="bg-stone-900/80 border border-amber-900/40 rounded-xl p-3 shadow-md space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-amber-400" /> Limite de Carga
          </span>
          <span className={`font-mono font-bold ${isOverburdened ? 'text-red-400' : 'text-stone-300'}`}>
            {currentLoad.toFixed(1)} kg / {maxLoad} kg {isOverburdened && '(Sobrecarga!)'}
          </span>
        </div>

        <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-amber-900/30">
          <div
            className={`h-full transition-all duration-300 ${
              isOverburdened
                ? 'bg-red-500'
                : loadPercent > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${loadPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={addAllAdventurerKit}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/50 text-amber-200 text-xs font-cinzel font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Kit do Aventureiro</span>
        </button>

        <button
          type="button"
          onClick={addEmptyItem}
          className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Item</span>
        </button>
      </div>

      {/* Inventory Items List */}
      <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5 custom-scrollbar min-h-0">
        {data.equipment.length === 0 ? (
          <div className="h-40 border-2 border-dashed border-stone-800 rounded-xl flex flex-col items-center justify-center text-stone-500 p-4 text-center">
            <Package className="w-8 h-8 mb-2 text-stone-600" />
            <span className="text-xs">Mochila vazia no momento.</span>
            <span className="text-[11px] text-stone-600 mt-0.5">
              Toque no botão acima para adicionar o Kit do Aventureiro padrão.
            </span>
          </div>
        ) : (
          data.equipment.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-stone-900/70 border border-amber-900/30 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const updated = [...data.equipment];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    onChange({ equipment: updated });
                  }}
                  className="bg-transparent text-stone-200 text-xs font-medium w-full focus:outline-none focus:text-amber-200 truncate"
                />
                <span className="text-[10px] text-stone-500 block font-mono">
                  {(Number(item.weight) || 0) * (Number(item.quantity) || 1)} kg total ({item.weight} kg cada)
                </span>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex items-center bg-stone-950 border border-amber-900/40 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(idx, -1)}
                    className="w-5 h-5 flex items-center justify-center text-stone-400 hover:text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-[11px] font-mono font-bold text-amber-300">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateItemQuantity(idx, 1)}
                    className="w-5 h-5 flex items-center justify-center text-stone-400 hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1.5 text-stone-500 hover:text-red-400 rounded transition-colors"
                  title="Remover item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-stone-400 bg-stone-900/50 p-2 rounded-lg border border-amber-900/20 text-center">
        {data.equipment.length} itens na mochila. Capacidade de carga no Tormenta 20 JdA: 10 + (2 × Força {forMod >= 0 ? `+${forMod}` : forMod}) = {maxLoad} kg.
      </div>
    </div>
  );
};
