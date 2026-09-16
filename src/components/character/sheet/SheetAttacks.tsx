import React, { useState } from 'react';
import { 
  Sword, 
  Plus, 
  Trash2, 
  Edit3, 
  Dices, 
  X, 
  Minus,
  Crosshair
} from 'lucide-react';
import { NormalizedSheetData, formatMod } from '../../../utils/sheetCalculations';

interface SheetAttacksProps {
  sheet: NormalizedSheetData;
  onAddAttack: (attack: any) => void;
  onUpdateAttack: (attackId: string, updated: any) => void;
  onDeleteAttack: (attackId: string) => void;
  onRollDice?: (formula: string, label?: string) => void;
}

export const SheetAttacks: React.FC<SheetAttacksProps> = ({
  sheet,
  onAddAttack,
  onUpdateAttack,
  onDeleteAttack,
  onRollDice
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttackId, setEditingAttackId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formBonus, setFormBonus] = useState('5');
  const [formDamage, setFormDamage] = useState('1d8+3');
  const [formCrit, setFormCrit] = useState('x2');
  const [formType, setFormType] = useState('Corte');
  const [formRange, setFormRange] = useState('Corpo a corpo');
  const [formAmmo, setFormAmmo] = useState<number | undefined>(undefined);

  const openNewModal = () => {
    setEditingAttackId(null);
    setFormName('');
    setFormBonus('5');
    setFormDamage('1d8+3');
    setFormCrit('x2');
    setFormType('Corte');
    setFormRange('Corpo a corpo');
    setFormAmmo(undefined);
    setModalOpen(true);
  };

  const openEditModal = (atk: any) => {
    setEditingAttackId(atk.id);
    setFormName(atk.name || '');
    setFormBonus(String(atk.attackBonus ?? 0));
    setFormDamage(atk.damage || '1d6');
    setFormCrit(atk.crit || 'x2');
    setFormType(atk.type || 'Impacto');
    setFormRange(atk.range || 'Corpo a corpo');
    setFormAmmo(atk.ammo);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      attackBonus: parseInt(formBonus, 10) || 0,
      damage: formDamage.trim() || '1d6',
      crit: formCrit.trim() || 'x2',
      type: formType.trim() || 'Impacto',
      range: formRange.trim() || 'Corpo a corpo',
      ammo: formAmmo
    };

    if (editingAttackId) {
      onUpdateAttack(editingAttackId, payload);
    } else {
      onAddAttack({
        id: `atk_${Date.now()}`,
        ...payload
      });
    }

    setModalOpen(false);
  };

  const handleUpdateAmmo = (atkId: string, currentAmmo: number, delta: number) => {
    const nextAmmo = Math.max(0, currentAmmo + delta);
    onUpdateAttack(atkId, { ammo: nextAmmo });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider">
          Ataques & Armas
        </h2>
        <button
          onClick={openNewModal}
          className="text-xs font-sans font-medium text-stone-300 hover:text-white px-2 py-1 rounded bg-[#141820] hover:bg-[#1c2128] border border-[#21262d] transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus size={12} />
          <span>Nova Arma</span>
        </button>
      </div>

      {sheet.attacks.length === 0 ? (
        <div className="text-center py-6 bg-[#141820] rounded-lg border border-[#21262d]">
          <p className="text-xs text-stone-500 font-sans">
            Nenhum ataque cadastrado. Adicione suas armas.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sheet.attacks.map((atk) => {
            const formattedBonus = formatMod(atk.attackBonus);

            return (
              <div
                key={atk.id}
                className="bg-[#141820] hover:bg-[#181e28] border border-[#21262d] hover:border-[#384252] rounded-lg p-2.5 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Informações da Arma */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Sword size={13} className="text-stone-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-sans font-bold text-stone-100 truncate">
                        {atk.name}
                      </span>
                      {atk.range && (
                        <span className="text-[10px] text-stone-500 font-sans">
                          • {atk.range}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-stone-400 font-sans mt-0.5">
                      <span>Dano: <strong className="text-stone-300">{atk.damage}</strong></span>
                      <span>Crítico: <strong className="text-stone-300">{atk.crit}</strong></span>
                      {atk.type && <span>Tipo: <strong className="text-stone-300">{atk.type}</strong></span>}

                      {/* Controle de munição, quando aplicável */}
                      {typeof atk.ammo === 'number' && (
                        <div className="flex items-center gap-1 ml-2 text-stone-300 bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#262c36]">
                          <Crosshair size={10} className="text-stone-500" />
                          <span>Munição:</span>
                          <button
                            onClick={() => handleUpdateAmmo(atk.id, atk.ammo!, -1)}
                            className="w-3.5 h-3.5 rounded hover:bg-[#21262d] text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
                          >
                            <Minus size={9} />
                          </button>
                          <span className="font-bold text-stone-100">{atk.ammo}</span>
                          <button
                            onClick={() => handleUpdateAmmo(atk.id, atk.ammo!, 1)}
                            className="w-3.5 h-3.5 rounded hover:bg-[#21262d] text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações de Rolagem e Edição */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Botão Rolar Ataque */}
                    <button
                      onClick={() => onRollDice?.(`1d20 ${formattedBonus}`, `Ataque (${atk.name})`)}
                      className="px-2.5 py-1.5 rounded bg-[#0d1117] hover:bg-[#1c2128] border border-[#262c36] hover:border-[#384252] flex items-center gap-1.5 text-xs font-sans font-semibold text-stone-200 hover:text-white transition-colors cursor-pointer"
                      title={`Rolar teste de acerto: 1d20 ${formattedBonus}`}
                    >
                      <span className="text-[10px] text-stone-500 uppercase">Acerto</span>
                      <span className="font-cinzel font-bold text-stone-100">{formattedBonus}</span>
                      <Dices size={12} className="text-stone-500" />
                    </button>

                    {/* Botão Rolar Dano */}
                    <button
                      onClick={() => onRollDice?.(atk.damage, `Dano (${atk.name})`)}
                      className="px-2.5 py-1.5 rounded bg-[#0d1117] hover:bg-[#1c2128] border border-[#262c36] hover:border-[#384252] flex items-center gap-1.5 text-xs font-sans font-semibold text-stone-200 hover:text-white transition-colors cursor-pointer"
                      title={`Rolar dano: ${atk.damage}`}
                    >
                      <span className="text-[10px] text-stone-500 uppercase">Dano</span>
                      <span className="font-cinzel font-bold text-[#c5a869]">{atk.damage}</span>
                      <Dices size={12} className="text-stone-500" />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => openEditModal(atk)}
                      className="p-1.5 rounded text-stone-500 hover:text-stone-300 hover:bg-[#1c2128] transition-colors cursor-pointer"
                      title="Editar arma"
                    >
                      <Edit3 size={13} />
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => onDeleteAttack(atk.id)}
                      className="p-1.5 rounded text-stone-500 hover:text-red-400 hover:bg-[#1c2128] transition-colors cursor-pointer"
                      title="Remover arma"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE ADICIONAR / EDITAR ATAQUE */}
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
                {editingAttackId ? 'Editar Ataque' : 'Adicionar Novo Ataque'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                  Nome da Arma ou Ataque
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Espada Longa, Arco Curto..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Bônus de Ataque
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="+5"
                    value={formBonus}
                    onChange={(e) => setFormBonus(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Fórmula de Dano
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1d8+3"
                    value={formDamage}
                    onChange={(e) => setFormDamage(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Crítico
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 19/x2, x3"
                    value={formCrit}
                    onChange={(e) => setFormCrit(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Alcance
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Curto, Médio, Corpo a corpo"
                    value={formRange}
                    onChange={(e) => setFormRange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Tipo de Dano
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Corte, Perfuração, Fogo"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Munição (Opcional)
                  </label>
                  <input
                    type="number"
                    placeholder="Qtd (ex: 20)"
                    value={formAmmo ?? ''}
                    onChange={(e) => setFormAmmo(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>
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
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#1c2128] hover:bg-[#28303e] border border-[#30363d] text-stone-100 font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
