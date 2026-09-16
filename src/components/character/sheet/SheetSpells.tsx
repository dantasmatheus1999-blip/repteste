import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  X 
} from 'lucide-react';
import { NormalizedSheetData, getMaxSpellCircle } from '../../../utils/sheetCalculations';

interface SheetSpellsProps {
  sheet: NormalizedSheetData;
  onAddSpell: (spell: any) => void;
  onDeleteSpell: (spellId: string) => void;
  onSpendPM: (cost: number) => void;
}

export const SheetSpells: React.FC<SheetSpellsProps> = ({
  sheet,
  onAddSpell,
  onDeleteSpell,
  onSpendPM
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCircle, setFormCircle] = useState(1);
  const [formCost, setFormCost] = useState(1);
  const [formSchool, setFormSchool] = useState('Evocação');
  const [formRange, setFormRange] = useState('Curto');
  const [formDuration, setFormDuration] = useState('Instantânea');
  const [formDesc, setFormDesc] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Agrupamento por círculo
  const spellsByCircle = useMemo(() => {
    const map: Record<number, any[]> = {};
    sheet.spells.forEach(s => {
      const circle = s.level || 1;
      if (!map[circle]) map[circle] = [];
      map[circle].push(s);
    });
    return map;
  }, [sheet.spells]);

  const circles = useMemo(() => {
    return Object.keys(spellsByCircle).map(Number).sort((a, b) => a - b);
  }, [spellsByCircle]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    onAddSpell({
      id: `spell_${Date.now()}`,
      name: formName.trim(),
      level: formCircle,
      cost: formCost,
      school: formSchool.trim() || 'Universal',
      range: formRange.trim() || 'Curto',
      duration: formDuration.trim() || 'Instantânea',
      desc: formDesc.trim() || 'Sem descrição.'
    });

    setFormName('');
    setFormCost(1);
    setFormDesc('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Topo do Grimório: CD e Ação de Adicionar */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider">
            Grimório de Magias
          </h2>
          <span className="text-[11px] text-stone-400 font-sans">
            CD Resistência: <strong className="text-stone-200">{sheet.spellDC}</strong>
          </span>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-sans font-medium text-stone-300 hover:text-white px-2.5 py-1 rounded bg-[#141820] hover:bg-[#1c2128] border border-[#21262d] transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus size={12} />
          <span>Nova Magia</span>
        </button>
      </div>

      {sheet.spells.length === 0 ? (
        <div className="text-center py-8 bg-[#141820] rounded-lg border border-[#21262d]">
          <Sparkles size={24} className="text-stone-600 mx-auto mb-2" />
          <p className="text-xs text-stone-500 font-sans">
            Nenhuma magia aprendida no grimório.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {circles.map(circle => {
            const list = spellsByCircle[circle] || [];

            return (
              <div key={circle} className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-0.5">
                  <span className="text-[11px] font-sans font-bold text-stone-400 uppercase tracking-wider">
                    {circle}º Círculo
                  </span>
                  <span className="text-[10px] text-stone-500 font-sans">
                    ({list.length} {list.length === 1 ? 'magia' : 'magias'})
                  </span>
                </div>

                <div className="space-y-1">
                  {list.map(spell => {
                    const isExpanded = !!expandedIds[spell.id];

                    return (
                      <div
                        key={spell.id}
                        className="bg-[#141820] hover:bg-[#181e28] border border-[#21262d] rounded-lg p-2.5 transition-colors select-none"
                      >
                        <div 
                          onClick={() => toggleExpand(spell.id)}
                          className="flex items-start justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-sans font-semibold text-stone-100">
                                {spell.name}
                              </span>
                              {spell.school && (
                                <span className="text-[10px] text-stone-500 font-sans">
                                  ({spell.school})
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-400 font-sans mt-0.5">
                              <span>Alcance: <strong className="text-stone-300">{spell.range || 'Curto'}</strong></span>
                              <span>•</span>
                              <span>Duração: <strong className="text-stone-300">{spell.duration || 'Instantânea'}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Botão Conjurar / Gastar PM */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSpendPM(spell.cost || 1);
                              }}
                              className="px-2 py-1 rounded bg-[#161c28] hover:bg-[#1e273b] border border-[#2d3e5e] text-blue-300 hover:text-blue-100 font-sans text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title={`Gastar ${spell.cost || 1} PM para conjurar`}
                            >
                              <Zap size={11} className="text-blue-400" />
                              <span>{spell.cost || 1} PM</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSpell(spell.id);
                              }}
                              className="p-1 rounded text-stone-500 hover:text-red-400 transition-colors"
                              title="Remover magia"
                            >
                              <Trash2 size={12} />
                            </button>

                            <button className="text-stone-400 p-0.5">
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Descrição Detalhada ao Expandir */}
                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-[#1c2128] text-xs text-stone-300 font-sans leading-relaxed">
                            {spell.desc || 'Nenhuma descrição detalhada informada.'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL ADICIONAR MAGIA */}
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
                Adicionar Magia ao Grimório
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                  Nome da Magia
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bola de Fogo, Seta Infalível..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Círculo
                  </label>
                  <select
                    value={formCircle}
                    onChange={(e) => setFormCircle(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  >
                    {[1, 2, 3, 4, 5]
                      .filter(c => c <= Math.max(1, getMaxSpellCircle(sheet.classId, sheet.level) || 1))
                      .map(c => (
                        <option key={c} value={c}>{c}º Círculo</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Custo em PM
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Escola
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Evocação, Ilusão"
                    value={formSchool}
                    onChange={(e) => setFormSchool(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                    Alcance
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Pessoal, Curto"
                    value={formRange}
                    onChange={(e) => setFormRange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                  Duração
                </label>
                <input
                  type="text"
                  placeholder="Ex: Instantânea, Cena, Sustentada"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                  Descrição e Aprimoramentos
                </label>
                <textarea
                  rows={3}
                  placeholder="Efeito da magia e aprimoramentos..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden resize-none"
                />
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
                  Adicionar ao Grimório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
