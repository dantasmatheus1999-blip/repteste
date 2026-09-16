import React, { useState, useMemo } from 'react';
import { 
  Backpack, 
  Plus, 
  Minus, 
  Trash2, 
  Coins, 
  ShieldCheck, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { NormalizedSheetData } from '../../../utils/sheetCalculations';

interface SheetInventoryProps {
  sheet: NormalizedSheetData;
  onAddItem: (item: any) => void;
  onUpdateItemQuantity: (itemId: string, newQty: number) => void;
  onToggleItemEquipped: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateMoney: (newMoney: number) => void;
}

export const SheetInventory: React.FC<SheetInventoryProps> = ({
  sheet,
  onAddItem,
  onUpdateItemQuantity,
  onToggleItemEquipped,
  onDeleteItem,
  onUpdateMoney
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const [moneyInput, setMoneyInput] = useState(String(sheet.money || 0));
  const [filterType, setFilterType] = useState<string>('all');

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [weight, setWeight] = useState('1');
  const [type, setType] = useState('item');
  const [equipped, setEquipped] = useState(false);

  // Peso e Carga
  const isOverweight = sheet.totalWeight > sheet.maxWeight;
  const loadPercent = Math.min(100, Math.max(0, (sheet.totalWeight / sheet.maxWeight) * 100));

  const handleSaveItem = () => {
    if (!name.trim()) return;

    onAddItem({
      id: `item_${Date.now()}`,
      name: name.trim(),
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      weight: Math.max(0, parseFloat(weight) || 0),
      type,
      equipped
    });

    setName('');
    setQuantity('1');
    setWeight('1');
    setType('item');
    setEquipped(false);
    setModalOpen(false);
  };

  const handleSaveMoney = () => {
    const val = parseInt(moneyInput, 10);
    if (!isNaN(val)) {
      onUpdateMoney(Math.max(0, val));
      setMoneyModalOpen(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (filterType === 'all') return sheet.inventory;
    return sheet.inventory.filter(i => (i.type || 'item') === filterType);
  }, [sheet.inventory, filterType]);

  return (
    <div className="space-y-3">
      {/* 1. BARRA DE STATUS: CARGA E DINHEIRO (TIBARES T$) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Capacidade de Carga */}
        <div className="bg-[#141820] border border-[#21262d] rounded-lg p-2.5">
          <div className="flex items-center justify-between text-xs font-sans mb-1">
            <span className="font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Backpack size={13} className="text-stone-400" />
              <span>Capacidade de Carga</span>
            </span>
            <span className={`font-semibold ${isOverweight ? 'text-red-400' : 'text-stone-200'}`}>
              {sheet.totalWeight.toFixed(1)} / {sheet.maxWeight} kg
            </span>
          </div>

          <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden border border-[#21262d]">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                isOverweight ? 'bg-red-500' : loadPercent > 80 ? 'bg-amber-500' : 'bg-stone-400'
              }`}
              style={{ width: `${loadPercent}%` }}
            />
          </div>

          {isOverweight && (
            <p className="text-[10px] text-red-400 font-sans mt-1 flex items-center gap-1">
              <AlertTriangle size={11} />
              <span>Sobrecarga: Sofre penalidade de armadura -2 e deslocamento -3m</span>
            </p>
          )}
        </div>

        {/* Carteira: Dinheiro T$ Tibares com Controles Rápidos */}
        <div className="bg-[#141820] border border-[#21262d] rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-[#c5a869]" />
            <div>
              <span className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-wider block">
                Tibares (T$)
              </span>
              <button
                onClick={() => {
                  setMoneyInput(String(sheet.money));
                  setMoneyModalOpen(true);
                }}
                className="font-cinzel font-bold text-base text-stone-100 hover:text-[#c5a869] cursor-pointer transition-colors leading-none"
                title="Clique para alterar valor"
              >
                {sheet.money} T$
              </button>
            </div>
          </div>

          {/* Ajustes rápidos −10 / +10 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateMoney(Math.max(0, sheet.money - 10))}
              className="px-2 py-1 rounded bg-[#1c2128] hover:bg-[#28303e] text-stone-300 text-[11px] font-sans font-semibold border border-[#2d3440] transition-colors cursor-pointer"
              title="Gastar 10 T$"
            >
              −10
            </button>
            <button
              onClick={() => onUpdateMoney(sheet.money + 10)}
              className="px-2 py-1 rounded bg-[#1c2128] hover:bg-[#28303e] text-stone-300 text-[11px] font-sans font-semibold border border-[#2d3440] transition-colors cursor-pointer"
              title="Ganhar 10 T$"
            >
              +10
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTRO DE ITENS E BOTÃO NOVO ITEM */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'weapon', label: 'Armas' },
            { id: 'armor', label: 'Armaduras' },
            { id: 'item', label: 'Itens' },
            { id: 'consumable', label: 'Poções' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold transition-colors cursor-pointer shrink-0 ${
                filterType === f.id
                  ? 'bg-[#1c2128] text-stone-100 border border-[#30363d]'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-sans font-medium text-stone-300 hover:text-white px-2.5 py-1 rounded bg-[#141820] hover:bg-[#1c2128] border border-[#21262d] transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
        >
          <Plus size={12} />
          <span>Novo Item</span>
        </button>
      </div>

      {/* 3. LISTA DE ITENS COM CONTROLE DIRETO DE QUANTIDADE */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 bg-[#141820] rounded-lg border border-[#21262d]">
          <p className="text-xs text-stone-500 font-sans">
            Nenhum item encontrado nesta categoria.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredItems.map((item) => {
            const totalItemWeight = ((item.weight || 0) * (item.quantity || 1)).toFixed(1);

            return (
              <div
                key={item.id}
                className="bg-[#141820] hover:bg-[#181e28] border border-[#21262d] rounded-lg px-3 py-2 flex items-center justify-between gap-2 transition-colors"
              >
                {/* Informações do Item */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-semibold text-stone-100 truncate">
                      {item.name}
                    </span>
                    {item.equipped && (
                      <span className="px-1.5 py-0.2 text-[9px] font-sans font-bold bg-[#1c2128] text-stone-300 rounded border border-[#2d3440] uppercase">
                        Equipado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-sans mt-0.5">
                    <span>Peso un: {item.weight || 0} kg</span>
                    <span>•</span>
                    <span>Total: {totalItemWeight} kg</span>
                  </div>
                </div>

                {/* Controles de Quantidade e Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Alternar Equipado */}
                  {(item.type === 'armor' || item.type === 'weapon' || item.type === 'item') && (
                    <button
                      onClick={() => onToggleItemEquipped(item.id)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        item.equipped 
                          ? 'text-[#c5a869] bg-[#1c2128]' 
                          : 'text-stone-600 hover:text-stone-400'
                      }`}
                      title={item.equipped ? 'Item Equipado (clique para desequipar)' : 'Clique para Equipar'}
                    >
                      <ShieldCheck size={14} />
                    </button>
                  )}

                  {/* Quantidade [ - ] QTD [ + ] */}
                  <div className="flex items-center gap-1 bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#21262d]">
                    <button
                      onClick={() => onUpdateItemQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                      className="w-4 h-4 rounded text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
                      title="Reduzir quantidade"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-xs font-cinzel font-bold text-stone-200 px-1 min-w-4 text-center">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() => onUpdateItemQuantity(item.id, (item.quantity || 1) + 1)}
                      className="w-4 h-4 rounded text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
                      title="Aumentar quantidade"
                    >
                      <Plus size={10} />
                    </button>
                  </div>

                  {/* Excluir Item */}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 rounded text-stone-600 hover:text-red-400 transition-colors cursor-pointer"
                    title="Excluir item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL NOVO ITEM */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="bg-[#141820] border border-[#2d3440] rounded-xl max-w-sm w-full p-4 space-y-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
              <h3 className="text-xs font-sans font-bold text-stone-200 uppercase tracking-wider">
                Adicionar Item ao Inventário
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                  Nome do Item
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mochila de Aventureiro, Tocha..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Peso Unitário (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                >
                  <option value="item">Item Geral / Equipamento</option>
                  <option value="weapon">Arma</option>
                  <option value="armor">Armadura / Escudo</option>
                  <option value="consumable">Poção / Consumível</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="equipped-check"
                  checked={equipped}
                  onChange={(e) => setEquipped(e.target.checked)}
                  className="rounded border-[#262c36] text-[#c5a869] focus:ring-0"
                />
                <label htmlFor="equipped-check" className="text-xs font-sans text-stone-300 cursor-pointer">
                  Item já equipado
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#21262d]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs font-sans text-stone-400 hover:text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveItem}
                  className="px-4 py-1.5 rounded bg-[#1c2128] hover:bg-[#28303e] border border-[#30363d] text-stone-100 font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR TIBARES */}
      {moneyModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setMoneyModalOpen(false)}
        >
          <div 
            className="bg-[#141820] border border-[#2d3440] rounded-xl max-w-xs w-full p-4 space-y-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
              <h3 className="text-xs font-sans font-bold text-stone-200 uppercase tracking-wider">
                Definir Dinheiro (Tibares T$)
              </h3>
              <button onClick={() => setMoneyModalOpen(false)} className="text-stone-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <input
              type="number"
              min="0"
              autoFocus
              value={moneyInput}
              onChange={(e) => setMoneyInput(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#0d1117] border border-[#262c36] text-center text-lg font-cinzel font-bold text-stone-100 outline-hidden"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[#21262d]">
              <button
                type="button"
                onClick={() => setMoneyModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-sans text-stone-400 hover:text-stone-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveMoney}
                className="px-4 py-1.5 rounded bg-[#1c2128] hover:bg-[#28303e] border border-[#30363d] text-stone-100 font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
