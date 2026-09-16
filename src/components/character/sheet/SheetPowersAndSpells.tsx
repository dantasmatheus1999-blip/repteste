import React, { useState } from 'react';
import { 
  Sparkles, 
  Scroll, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Zap, 
  X, 
  Check,
  BookOpen
} from 'lucide-react';
import { NormalizedSheetData } from '../../../utils/sheetCalculations';

interface SheetPowersAndSpellsProps {
  sheet: NormalizedSheetData;
  onAddPower: (power: any) => void;
  onDeletePower: (powerId: string) => void;
  onAddSpell: (spell: any) => void;
  onDeleteSpell: (spellId: string) => void;
  onSpendPM: (amount: number) => void;
}

export const SheetPowersAndSpells: React.FC<SheetPowersAndSpellsProps> = ({
  sheet,
  onAddPower,
  onDeletePower,
  onAddSpell,
  onDeleteSpell,
  onSpendPM
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'powers' | 'spells'>('powers');
  const [expandedPowerId, setExpandedPowerId] = useState<string | null>(null);
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);

  // Modais de Criação
  const [powerModalOpen, setPowerModalOpen] = useState(false);
  const [powerName, setPowerName] = useState('');
  const [powerType, setPowerType] = useState('Classe');
  const [powerDesc, setPowerDesc] = useState('');

  const [spellModalOpen, setSpellModalOpen] = useState(false);
  const [spellName, setSpellName] = useState('');
  const [spellCircle, setSpellCircle] = useState('1');
  const [spellCost, setSpellCost] = useState('1');
  const [spellSchool, setSpellSchool] = useState('Evocação');
  const [spellRange, setSpellRange] = useState('Curto');
  const [spellDesc, setSpellDesc] = useState('');

  const handleSavePower = () => {
    if (!powerName.trim()) return;
    onAddPower({
      id: crypto.randomUUID(),
      name: powerName.trim(),
      type: powerType,
      description: powerDesc.trim()
    });
    setPowerName('');
    setPowerDesc('');
    setPowerModalOpen(false);
  };

  const handleSaveSpell = () => {
    if (!spellName.trim()) return;
    onAddSpell({
      id: crypto.randomUUID(),
      name: spellName.trim(),
      circle: parseInt(spellCircle) || 1,
      cost: parseInt(spellCost) || 1,
      school: spellSchool.trim(),
      range: spellRange.trim(),
      description: spellDesc.trim()
    });
    setSpellName('');
    setSpellDesc('');
    setSpellModalOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Sub-Tabs de Navegação */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('powers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase transition-all cursor-pointer ${
              activeSubTab === 'powers'
                ? 'bg-gold/20 border border-gold/50 text-gold shadow-[0_0_10px_rgba(212,175,55,0.15)]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scroll size={13} />
            <span>Habilidades & Poderes ({sheet.powers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('spells')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase transition-all cursor-pointer ${
              activeSubTab === 'spells'
                ? 'bg-purple-950/60 border border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Magias ({sheet.spells.length})</span>
          </button>
        </div>

        {/* Botão de Adicionar Conforme Sub-Aba Ativa */}
        {activeSubTab === 'powers' ? (
          <button
            onClick={() => setPowerModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold text-xs font-cinzel font-bold uppercase cursor-pointer"
          >
            <Plus size={12} />
            <span className="hidden xs:inline">Novo Poder</span>
          </button>
        ) : (
          <button
            onClick={() => setSpellModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-xs font-cinzel font-bold uppercase cursor-pointer"
          >
            <Plus size={12} />
            <span className="hidden xs:inline">Nova Magia</span>
          </button>
        )}
      </div>

      {/* CONTEÚDO: HABILIDADES & PODERES */}
      {activeSubTab === 'powers' && (
        <div className="space-y-2">
          {sheet.powers.length === 0 ? (
            <div className="text-center py-8 bg-[#121218] rounded-xl border border-stone-800/80 p-4 space-y-2">
              <Scroll size={24} className="text-stone-600 mx-auto" />
              <p className="text-xs text-stone-400 font-sans">
                Nenhum poder ou habilidade registrada.
              </p>
              <button
                onClick={() => setPowerModalOpen(true)}
                className="text-xs text-gold underline font-cinzel uppercase cursor-pointer"
              >
                Adicionar Primeira Habilidade
              </button>
            </div>
          ) : (
            sheet.powers.map((power) => {
              const isExpanded = expandedPowerId === power.id;

              return (
                <div
                  key={power.id}
                  className="bg-[#121218] border border-stone-800 hover:border-gold/30 rounded-xl overflow-hidden transition-all shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                >
                  <div
                    onClick={() => setExpandedPowerId(isExpanded ? null : power.id)}
                    className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-black/60 border border-stone-700/60 text-amber-300 uppercase shrink-0">
                        {power.type || 'Poder'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-cinzel font-bold text-stone-200 truncate">
                        {power.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePower(power.id);
                        }}
                        className="p-1 rounded hover:bg-red-950/60 text-stone-500 hover:text-red-400 transition-colors"
                        title="Excluir poder"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button className="text-stone-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Descrição Expansível */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-stone-800/80 bg-black/30 animate-in fade-in duration-150">
                      <p className="text-xs text-stone-300 font-sans leading-relaxed whitespace-pre-wrap">
                        {power.description || 'Sem descrição cadastrada.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CONTEÚDO: GRIMÓRIO DE MAGIAS */}
      {activeSubTab === 'spells' && (
        <div className="space-y-2.5">
          {/* Banner CD de Magia */}
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              <div>
                <span className="text-[11px] font-cinzel font-bold text-purple-200 uppercase">
                  Dificuldade das Suas Magias (CD)
                </span>
                <p className="text-[10px] text-stone-400 font-sans">
                  Inimigos devem igualar ou superar este valor nos testes de resistência
                </p>
              </div>
            </div>
            <span className="text-2xl font-cinzel font-black text-purple-300">
              CD {sheet.spellDC}
            </span>
          </div>

          {/* Lista de Magias */}
          {sheet.spells.length === 0 ? (
            <div className="text-center py-8 bg-[#121218] rounded-xl border border-stone-800/80 p-4 space-y-2">
              <Sparkles size={24} className="text-stone-600 mx-auto" />
              <p className="text-xs text-stone-400 font-sans">
                Nenhuma magia conhecida neste grimório.
              </p>
              <button
                onClick={() => setSpellModalOpen(true)}
                className="text-xs text-purple-400 underline font-cinzel uppercase cursor-pointer"
              >
                Conhecer Primeira Magia
              </button>
            </div>
          ) : (
            sheet.spells.map((spell) => {
              const isExpanded = expandedSpellId === spell.id;

              return (
                <div
                  key={spell.id}
                  className="bg-[#121218] border border-stone-800 hover:border-purple-500/40 rounded-xl overflow-hidden transition-all shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
                >
                  <div
                    onClick={() => setExpandedSpellId(isExpanded ? null : spell.id)}
                    className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-purple-950/80 border border-purple-700/60 text-purple-200 uppercase shrink-0">
                        {spell.circle}º Círculo
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-cinzel font-bold text-stone-200 truncate">
                          {spell.name}
                        </h4>
                        <span className="text-[10px] text-stone-400 font-sans">
                          {spell.school} {spell.range && `• ${spell.range}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Botão de Conjurar (Gasta PM) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSpendPM(spell.cost || 1);
                        }}
                        className="px-2 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-600/50 text-blue-200 flex items-center gap-1 text-xs font-sans font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                        title={`Conjurar e gastar ${spell.cost || 1} PM`}
                      >
                        <Zap size={12} className="text-blue-400" />
                        <span>{spell.cost || 1} PM</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSpell(spell.id);
                        }}
                        className="p-1 rounded hover:bg-red-950/60 text-stone-500 hover:text-red-400 transition-colors"
                        title="Excluir magia"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button className="text-stone-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Descrição Expansível */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-stone-800/80 bg-black/30 animate-in fade-in duration-150">
                      <p className="text-xs text-stone-300 font-sans leading-relaxed whitespace-pre-wrap">
                        {spell.description || 'Sem descrição cadastrada.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL ADICIONAR PODER */}
      {powerModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPowerModalOpen(false)}
        >
          <div 
            className="bg-[#121218] border border-gold/40 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-[0_15px_40px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-cinzel font-bold text-gold uppercase">
                Adicionar Habilidade / Poder
              </h3>
              <button onClick={() => setPowerModalOpen(false)} className="text-stone-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-cinzel text-stone-400 uppercase mb-1">
                  Nome do Poder
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ataque Especial"
                  value={powerName}
                  onChange={(e) => setPowerName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-stone-700 focus:border-gold/60 text-xs text-stone-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-cinzel text-stone-400 uppercase mb-1">
                  Tipo / Origem
                </label>
                <select
                  value={powerType}
                  onChange={(e) => setPowerType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-stone-700 focus:border-gold/60 text-xs text-stone-200 outline-hidden"
                >
                  <option value="Classe">Habilidade de Classe</option>
                  <option value="Raça">Habilidade de Raça</option>
                  <option value="Origem">Habilidade de Origem</option>
                  <option value="Combate">Poder de Combate</option>
                  <option value="Destino">Poder de Destino</option>
                  <option value="Magia">Poder de Magia</option>
                  <option value="Concedido">Poder Concedido</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-cinzel text-stone-400 uppercase mb-1">
                  Descrição do Efeito
                </label>
                <textarea
                  rows={3}
                  placeholder="Explique os benefícios e regras deste poder..."
                  value={powerDesc}
                  onChange={(e) => setPowerDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-stone-700 focus:border-gold/60 text-xs text-stone-200 outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPowerModalOpen(false)}
                className="flex-1 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePower}
                className="flex-1 py-2 rounded-lg bg-gold/20 hover:bg-gold/30 border border-gold/60 text-gold text-xs font-cinzel font-bold uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check size={14} />
                <span>Salvar Poder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR MAGIA */}
      {spellModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSpellModalOpen(false)}
        >
          <div 
            className="bg-[#121218] border border-purple-500/50 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-[0_15px_40px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-cinzel font-bold text-purple-300 uppercase">
                Aprender Nova Magia
              </h3>
              <button onClick={() => setSpellModalOpen(false)} className="text-stone-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-cinzel text-stone-400 uppercase mb-1">
                  Nome da Magia
                </label>
                <input
                  type="text"
                  placeholder="Ex: Bola de Fogo"
                  value={spellName}
                  onChange={(e) => setSpellName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-stone-700 focus:border-purple-500 text-xs text-stone-200 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-cinzel text-stone-400 uppercase mb-1">
                    Círculo
                  </label>
                  <select
                    value={spellCircle}
                    onChange={(e) => setSpellCircle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-stone-700 focus:border-purple-500 text-xs text-stone-200 outline-hidden"
                  >
                    <option value="1">1º Círculo</option>
                    <option value="2">2º Círculo</option>
                    <option value="3">3º Círculo</option>
                    <option value="4">4º Círculo</option>
                    <option value="5">5º Círculo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-cinzel text-stone-400 uppercase mb-1">
                    Custo em PM
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={spellCost}
                    onChange={(e) => setSpellCost(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-stone-700 focus:border-purple-500 text-xs text-stone-200 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-cinzel text-stone-400 uppercase mb-1">
                    Escola
                  </label>
                  <input
                    type="text"
                    placeholder="Evocação"
                    value={spellSchool}
                    onChange={(e) => setSpellSchool(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-stone-700 focus:border-purple-500 text-xs text-stone-200 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-cinzel text-stone-400 uppercase mb-1">
                    Alcance
                  </label>
                  <input
                    type="text"
                    placeholder="Médio (30m)"
                    value={spellRange}
                    onChange={(e) => setSpellRange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-stone-700 focus:border-purple-500 text-xs text-stone-200 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-cinzel text-stone-400 uppercase mb-1">
                  Efeito da Magia
                </label>
                <textarea
                  rows={3}
                  placeholder="Dano, área, duração e aprimoramentos..."
                  value={spellDesc}
                  onChange={(e) => setSpellDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-stone-700 focus:border-purple-500 text-xs text-stone-200 outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSpellModalOpen(false)}
                className="flex-1 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSpell}
                className="flex-1 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500 text-purple-200 text-xs font-cinzel font-bold uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check size={14} />
                <span>Salvar Magia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
