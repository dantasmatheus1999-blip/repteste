import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Star, 
  Dices, 
  Info, 
  X, 
  Check, 
  Plus, 
  Minus 
} from 'lucide-react';
import { NormalizedSheetData, formatMod } from '../../../utils/sheetCalculations';

interface SheetSkillsProps {
  sheet: NormalizedSheetData;
  onToggleTrained: (skillId: string) => void;
  onRollDice?: (formula: string, label?: string) => void;
}

export const SheetSkills: React.FC<SheetSkillsProps> = ({
  sheet,
  onToggleTrained,
  onRollDice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'trained'>('all');
  const [selectedSkillInfo, setSelectedSkillInfo] = useState<any | null>(null);

  const trainedCount = useMemo(() => {
    return sheet.skills.filter(s => s.trained).length;
  }, [sheet.skills]);

  const filteredSkills = useMemo(() => {
    return sheet.skills.filter((skill) => {
      if (filterMode === 'trained' && !skill.trained) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          skill.name.toLowerCase().includes(term) ||
          skill.attr.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [sheet.skills, filterMode, searchTerm]);

  return (
    <div className="space-y-2">
      {/* Barra de Filtros e Busca Compacta */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar perícia ou atributo (ex: Acrobacia, Des)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#141820] border border-[#21262d] focus:border-[#384252] text-xs font-sans text-stone-200 placeholder-stone-500 outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Abas Rápidas: Todas vs Treinadas */}
        <div className="flex items-center gap-1 bg-[#141820] p-0.5 rounded-lg border border-[#21262d] shrink-0">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold transition-colors cursor-pointer ${
              filterMode === 'all' 
                ? 'bg-[#1c2128] text-stone-100 border border-[#30363d]' 
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Todas ({sheet.skills.length})
          </button>
          <button
            onClick={() => setFilterMode('trained')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              filterMode === 'trained' 
                ? 'bg-[#1c2128] text-stone-100 border border-[#30363d]' 
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Star size={11} className="fill-stone-300 text-stone-300" />
            <span>Treinadas ({trainedCount})</span>
          </button>
        </div>
      </div>

      {/* Lista de Perícias */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-8 bg-[#141820] rounded-lg border border-[#21262d]">
          <p className="text-xs text-stone-500 font-sans">
            Nenhuma perícia encontrada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {filteredSkills.map((skill) => {
            const formattedBonus = formatMod(skill.total);

            return (
              <div
                key={skill.id}
                id={`skill-row-${skill.id}`}
                className="bg-[#141820] hover:bg-[#181e28] border border-[#21262d] hover:border-[#384252] rounded-lg px-2.5 py-2 flex items-center justify-between gap-2 transition-colors select-none group"
              >
                {/* Esquerda: Alternador de Treino + Nome e Atributo */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleTrained(skill.id)}
                    className="w-5 h-5 rounded hover:bg-[#1c2128] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title={skill.trained ? 'Perícia Treinada (clique para remover)' : 'Perícia Não-treinada (clique para treinar)'}
                  >
                    <Star 
                      size={14} 
                      className={skill.trained ? 'fill-[#c5a869] text-[#c5a869]' : 'text-stone-600 hover:text-stone-400'} 
                    />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-sans font-medium truncate ${skill.trained ? 'text-stone-100 font-semibold' : 'text-stone-300'}`}>
                        {skill.name}
                      </span>
                      {skill.onlyTrained && (
                        <span className="text-[9px] text-stone-500 uppercase tracking-tighter" title="Somente Treinada">
                          *
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-500 font-sans flex items-center gap-1.5">
                      <span>{skill.attr}</span>
                      <span>•</span>
                      <span>1/2 Nível: {skill.halfLevel}</span>
                      {skill.trained && <span>• Treino: +{skill.trainingBonus}</span>}
                    </div>
                  </div>
                </div>

                {/* Direita: Detalhes e Botão de Rolagem d20 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setSelectedSkillInfo(skill)}
                    className="p-1 rounded text-stone-500 hover:text-stone-300 transition-colors"
                    title="Ver cálculo completo da perícia"
                  >
                    <Info size={12} />
                  </button>

                  <button
                    onClick={() => onRollDice?.(`1d20 ${formattedBonus}`, `Perícia: ${skill.name}`)}
                    className="px-2.5 py-1 rounded bg-[#0d1117] hover:bg-[#1c2128] border border-[#21262d] hover:border-[#384252] flex items-center gap-1.5 text-xs font-cinzel font-bold text-stone-200 hover:text-[#c5a869] transition-all cursor-pointer"
                    title={`Rolar 1d20 ${formattedBonus} (${skill.name})`}
                  >
                    <span className="text-xs sm:text-sm">{formattedBonus}</span>
                    <Dices size={12} className="text-stone-500 group-hover:text-stone-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DISCRETO COM CÁLCULO DA PERÍCIA */}
      {selectedSkillInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setSelectedSkillInfo(null)}
        >
          <div 
            className="bg-[#141820] border border-[#2d3440] rounded-xl max-w-sm w-full p-4 space-y-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
              <div>
                <h3 className="text-sm font-sans font-bold text-stone-100">
                  {selectedSkillInfo.name}
                </h3>
                <p className="text-[11px] text-stone-400 font-sans">
                  Atributo base: {selectedSkillInfo.attr}
                </p>
              </div>
              <button onClick={() => setSelectedSkillInfo(null)} className="text-stone-400 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between py-1 border-b border-[#1c2128] text-stone-400">
                <span>Metade do Nível ({Math.floor(sheet.level / 2)}):</span>
                <span className="text-stone-200 font-bold">+{selectedSkillInfo.halfLevel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1c2128] text-stone-400">
                <span>Modificador de Atributo ({selectedSkillInfo.attr}):</span>
                <span className="text-stone-200 font-bold">{formatMod(selectedSkillInfo.attrMod)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1c2128] text-stone-400">
                <span>Treinamento:</span>
                <span className="text-stone-200 font-bold">
                  {selectedSkillInfo.trained ? `+${selectedSkillInfo.trainingBonus}` : '+0'}
                </span>
              </div>
              {selectedSkillInfo.armorPenalty !== 0 && (
                <div className="flex justify-between py-1 border-b border-[#1c2128] text-stone-400">
                  <span>Penalidade de Armadura:</span>
                  <span className="text-red-400 font-bold">{selectedSkillInfo.armorPenalty}</span>
                </div>
              )}
              {selectedSkillInfo.others !== 0 && (
                <div className="flex justify-between py-1 border-b border-[#1c2128] text-stone-400">
                  <span>Outros Bônus:</span>
                  <span className="text-stone-200 font-bold">{formatMod(selectedSkillInfo.others)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 pt-2 text-sm text-stone-100 font-bold">
                <span>Total Calculado:</span>
                <span className="text-[#c5a869] font-cinzel text-base">
                  {formatMod(selectedSkillInfo.total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onRollDice?.(`1d20 ${formatMod(selectedSkillInfo.total)}`, `Perícia: ${selectedSkillInfo.name}`);
                setSelectedSkillInfo(null);
              }}
              className="w-full py-2 rounded-md bg-[#1c2128] hover:bg-[#28303e] border border-[#30363d] text-stone-200 font-sans text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Dices size={14} />
              <span>Rolar Teste de {selectedSkillInfo.name}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
