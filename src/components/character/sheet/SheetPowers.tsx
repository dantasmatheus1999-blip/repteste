import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Sparkles, 
  X, 
  Shield 
} from 'lucide-react';
import { NormalizedSheetData } from '../../../utils/sheetCalculations';

interface SheetPowersProps {
  sheet: NormalizedSheetData;
  onAddPower: (power: any) => void;
  onDeletePower: (powerId: string) => void;
}

export const SheetPowers: React.FC<SheetPowersProps> = ({
  sheet,
  onAddPower,
  onDeletePower
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Poder de Classe');
  const [formDesc, setFormDesc] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Agrupamento por tipo de habilidade
  const groupedPowers = useMemo(() => {
    const groups: Record<string, any[]> = {
      'Habilidades Raciais': [],
      'Habilidades de Classe': [],
      'Poderes de Classe': [],
      'Poderes de Origem': [],
      'Poderes Gerais': [],
      'Outros Poderes': []
    };

    sheet.powers.forEach(p => {
      const t = (p.type || '').toLowerCase();
      if (t.includes('raça') || t.includes('racial')) {
        groups['Habilidades Raciais'].push(p);
      } else if (t.includes('origem')) {
        groups['Poderes de Origem'].push(p);
      } else if (t.includes('classe')) {
        if (t.includes('habilidade')) {
          groups['Habilidades de Classe'].push(p);
        } else {
          groups['Poderes de Classe'].push(p);
        }
      } else if (t.includes('geral') || t.includes('combate') || t.includes('destino') || t.includes('magia') || t.includes('tormenta')) {
        groups['Poderes Gerais'].push(p);
      } else {
        groups['Outros Poderes'].push(p);
      }
    });

    return groups;
  }, [sheet.powers]);

  const handleSavePower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    onAddPower({
      id: `power_${Date.now()}`,
      name: formName.trim(),
      type: formType,
      desc: formDesc.trim() || 'Sem descrição.'
    });

    setFormName('');
    setFormDesc('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-xs font-sans font-bold text-stone-300 uppercase tracking-wider">
          Habilidades & Poderes
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-sans font-medium text-stone-300 hover:text-white px-2.5 py-1 rounded bg-[#141820] hover:bg-[#1c2128] border border-[#21262d] transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus size={12} />
          <span>Novo Poder</span>
        </button>
      </div>

      {sheet.powers.length === 0 ? (
        <div className="text-center py-8 bg-[#141820] rounded-lg border border-[#21262d]">
          <p className="text-xs text-stone-500 font-sans">
            Nenhuma habilidade ou poder registrado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedPowers).map(([category, powers]) => {
            if (powers.length === 0) return null;

            return (
              <div key={category} className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-0.5">
                  <span className="text-[11px] font-sans font-bold text-stone-400 uppercase tracking-wider">
                    {category}
                  </span>
                  <span className="text-[10px] text-stone-500 font-sans">
                    ({powers.length})
                  </span>
                </div>

                <div className="space-y-1">
                  {powers.map((p) => {
                    const isExpanded = !!expandedIds[p.id];
                    const shortDesc = p.desc ? p.desc.slice(0, 80) + (p.desc.length > 80 ? '...' : '') : 'Sem descrição.';

                    return (
                      <div
                        key={p.id}
                        className="bg-[#141820] hover:bg-[#181e28] border border-[#21262d] rounded-lg p-2.5 transition-colors select-none"
                      >
                        <div 
                          onClick={() => toggleExpand(p.id)}
                          className="flex items-start justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-sans font-semibold text-stone-100">
                                {p.name}
                              </span>
                            </div>

                            {/* Descrição resumida no estado recolhido */}
                            {!isExpanded && (
                              <p className="text-[11px] text-stone-400 font-sans mt-0.5 line-clamp-1">
                                {shortDesc}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0 text-stone-400">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePower(p.id);
                              }}
                              className="p-1 rounded text-stone-500 hover:text-red-400 transition-colors"
                              title="Remover poder"
                            >
                              <Trash2 size={12} />
                            </button>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>

                        {/* Descrição Completa ao Expandir */}
                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-[#1c2128] text-xs text-stone-300 font-sans leading-relaxed">
                            {p.desc || 'Nenhuma descrição detalhada informada.'}
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

      {/* MODAL ADICIONAR PODER */}
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
                Adicionar Poder ou Habilidade
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSavePower} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                  Nome do Poder
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ataque Poderoso, Foco em Arma..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                  Categoria
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#262c36] text-xs font-sans text-stone-100 focus:border-[#4d5766] outline-hidden"
                >
                  <option value="Habilidade de Classe">Habilidade de Classe</option>
                  <option value="Poder de Classe">Poder de Classe</option>
                  <option value="Habilidade Racial">Habilidade Racial</option>
                  <option value="Poder de Origem">Poder de Origem</option>
                  <option value="Poder Geral">Poder Geral (Combate, Destino, Magia, etc.)</option>
                  <option value="Devoção / Outro">Devoção / Outro</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={3}
                  placeholder="Efeitos, custos, requisitos..."
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
                  Salvar Poder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
