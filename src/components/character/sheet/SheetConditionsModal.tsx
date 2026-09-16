import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { T20_CONDITIONS } from '../../../data/t20Conditions';

interface SheetConditionsModalProps {
  activeConditions: string[];
  onToggleCondition: (conditionId: string) => void;
  onClose: () => void;
}

export const SheetConditionsModal: React.FC<SheetConditionsModalProps> = ({
  activeConditions,
  onToggleCondition,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'física', label: 'Físicas' },
    { id: 'mental', label: 'Mentais' },
    { id: 'sentidos', label: 'Sentidos' },
    { id: 'especial', label: 'Especiais' }
  ];

  const filteredConditions = useMemo(() => {
    return T20_CONDITIONS.filter(c => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(term) ||
          c.shortDesc.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div 
        className="bg-[#141820] border border-[#2d3440] rounded-xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="px-4 py-3 border-b border-[#21262d] flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-sans font-bold text-stone-200 uppercase tracking-wider">
              Condições de Tormenta 20
            </h3>
            <p className="text-[10px] text-stone-400 font-sans">
              {activeConditions.length} {activeConditions.length === 1 ? 'condição ativa' : 'condições ativas'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded text-stone-400 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Busca e Filtro de Categorias */}
        <div className="p-3 border-b border-[#21262d] space-y-2 bg-[#0e1117]">
          {/* Busca */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Buscar condição (ex: Abalado, Agarrado)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#141820] border border-[#262c36] text-xs font-sans text-stone-200 placeholder-stone-500 focus:border-[#4d5766] outline-hidden"
            />
          </div>

          {/* Categorias */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-sans font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#1c2128] text-stone-100 border border-[#30363d]'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Condições com Checkbox Limpo */}
        <div className="p-3 overflow-y-auto space-y-1.5 flex-1 divide-y divide-[#1c2128]">
          {filteredConditions.map(cond => {
            const isActive = activeConditions.some(
              c => c.toLowerCase() === cond.id.toLowerCase() || c.toLowerCase() === cond.name.toLowerCase()
            );
            const isExpanded = expandedId === cond.id;

            return (
              <div 
                key={cond.id}
                className={`pt-1.5 first:pt-0 rounded-md transition-colors ${
                  isActive ? 'bg-[#181e28]/50 px-2 py-1' : 'px-1'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => onToggleCondition(cond.id)}
                    className="flex items-start gap-2 text-left flex-1 cursor-pointer select-none"
                  >
                    <span className="mt-0.5 text-stone-400">
                      {isActive ? (
                        <CheckSquare size={14} className="text-[#c5a869]" />
                      ) : (
                        <Square size={14} className="text-stone-600" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-sans font-semibold ${isActive ? 'text-stone-100' : 'text-stone-300'}`}>
                          {cond.name}
                        </span>
                        <span className="text-[9px] text-stone-500 font-sans uppercase">
                          ({cond.category})
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 font-sans mt-0.5">
                        {cond.shortDesc}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : cond.id)}
                    className="text-stone-500 hover:text-stone-300 p-1 shrink-0"
                    title="Ver detalhes da regra"
                  >
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-1.5 ml-6 p-2 rounded bg-[#0d1117] border border-[#1f242d] text-[11px] text-stone-300 font-sans leading-relaxed">
                    {cond.fullDesc}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3 border-t border-[#21262d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#1c2128] hover:bg-[#28303e] border border-[#30363d] text-stone-200 font-sans text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
