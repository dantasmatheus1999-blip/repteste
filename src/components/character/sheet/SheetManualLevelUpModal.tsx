import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Lock, 
  X, 
  Search, 
  CheckCircle2, 
  BookOpen, 
  Feather,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Attribute } from '../../../types/character';
import { 
  getManualLevelUpState, 
  simulateManualEvolution, 
  finalizeManualEvolution,
  ManualPowerChoice,
  ManualAbilityChoice,
  ManualSpellChoice,
  ManualLevelUpDraft
} from '../../../services/manualEvolutionService';
import { formatMod } from '../../../utils/sheetCalculations';

interface SheetManualLevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawCharacter: any;
  onConfirm: (updatedCharacter: any) => Promise<void> | void;
  isSaving?: boolean;
}

type ManualTab = 'beneficio' | 'habilidades' | 'magias' | 'preview';

const ATTRIBUTE_KEYS: Attribute[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  FOR: 'Força',
  DES: 'Destreza',
  CON: 'Constituição',
  INT: 'Inteligência',
  SAB: 'Sabedoria',
  CAR: 'Carisma'
};

export const SheetManualLevelUpModal: React.FC<SheetManualLevelUpModalProps> = ({
  isOpen,
  onClose,
  rawCharacter,
  onConfirm,
  isSaving = false
}) => {
  if (!isOpen || !rawCharacter) return null;

  const state = useMemo(() => {
    return getManualLevelUpState(rawCharacter);
  }, [rawCharacter]);

  // Tab ativa e histórico para botão Voltar
  const [activeTab, setActiveTab] = useState<ManualTab>('beneficio');
  const [previousTab, setPreviousTab] = useState<ManualTab>('beneficio');

  // Sub-opção no Benefício: 'atributo' | 'poder_classe' | 'poder_geral' | 'poder_custom'
  const [benefitType, setBenefitType] = useState<'atributo' | 'poder_classe' | 'poder_geral' | 'poder_custom'>('atributo');

  // Rascunho das escolhas do jogador
  const [chosenAttribute, setChosenAttribute] = useState<Attribute | undefined>(undefined);
  const [selectedPowers, setSelectedPowers] = useState<ManualPowerChoice[]>([]);
  const [addedAbilities, setAddedAbilities] = useState<ManualAbilityChoice[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<ManualSpellChoice[]>([]);

  // Estados de expansão para cards compactos (accordion mobile-first)
  const [expandedPowerIds, setExpandedPowerIds] = useState<Set<string>>(new Set());
  const [expandedSpellIds, setExpandedSpellIds] = useState<Set<string>>(new Set());
  const [expandedAbilityNames, setExpandedAbilityNames] = useState<Set<string>>(new Set());

  // Filtros de busca
  const [powerSearch, setPowerSearch] = useState('');
  const [spellSearch, setSpellSearch] = useState('');
  const [selectedSpellCircle, setSelectedSpellCircle] = useState<number>(0); // 0 = todos

  // Formulário de Poder Personalizado
  const [customPowerName, setCustomPowerName] = useState('');
  const [customPowerDesc, setCustomPowerDesc] = useState('');
  const [customPowerCategory, setCustomPowerCategory] = useState('Combate');

  // Formulário de Habilidade Adicionada
  const [customAbilityName, setCustomAbilityName] = useState('');
  const [customAbilityDesc, setCustomAbilityDesc] = useState('');
  const [customAbilitySource, setCustomAbilitySource] = useState('Classe');

  // Formulário de Magia Personalizada
  const [customSpellName, setCustomSpellName] = useState('');
  const [customSpellCircle, setCustomSpellCircle] = useState(1);
  const [customSpellSchool, setCustomSpellSchool] = useState('Evocação');
  const [customSpellCost, setCustomSpellCost] = useState(1);
  const [customSpellDesc, setCustomSpellDesc] = useState('');

  // Simulação dinâmica e cálculo dos valores derivados 100% automáticos
  const draft: ManualLevelUpDraft = useMemo(() => ({
    chosenAttribute,
    selectedPowers,
    addedAbilities,
    selectedSpells
  }), [chosenAttribute, selectedPowers, addedAbilities, selectedSpells]);

  const simulation = useMemo(() => {
    return simulateManualEvolution(rawCharacter, draft);
  }, [rawCharacter, draft]);

  // Alternar expansão de cards
  const togglePowerExpanded = (id: string) => {
    setExpandedPowerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSpellExpanded = (id: string) => {
    setExpandedSpellIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAbilityExpanded = (name: string) => {
    setExpandedAbilityNames(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Navegação entre abas
  const handleTabChange = (newTab: ManualTab) => {
    if (activeTab !== 'preview') {
      setPreviousTab(activeTab);
    }
    setActiveTab(newTab);
  };

  if (!state || !simulation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
        <div className="bg-[#10141d] border border-[#21262d] rounded-xl p-6 text-center max-w-md w-full">
          <p className="text-stone-300 mb-4 font-sans text-xs">Não foi possível carregar os dados de evolução deste personagem.</p>
          <button
            onClick={onClose}
            className="h-10 px-4 rounded bg-[#1c2128] text-stone-200 hover:bg-[#252b35] text-xs font-sans cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const { currentSheet, nextSheet } = simulation;

  // Iniciativa antes e depois
  const curInit = currentSheet.skills?.find((s: any) => s.id === 'iniciativa')?.total 
    ?? (currentSheet.attributes.DES + Math.floor(state.currentLevel / 2));
  const nextInit = nextSheet.skills?.find((s: any) => s.id === 'iniciativa')?.total 
    ?? (nextSheet.attributes.DES + Math.floor(state.nextLevel / 2));

  // Handler de seleção de aumento de atributo
  const handleToggleAttribute = (attr: Attribute) => {
    const status = state.attributeBoosts[attr];
    if (!status.isAvailable) return;

    if (chosenAttribute === attr) {
      setChosenAttribute(undefined);
    } else {
      setChosenAttribute(attr);
    }
  };

  // Handler de poder oficial
  const handleToggleOfficialPower = (power: any, type: 'classe' | 'geral') => {
    const exists = selectedPowers.some(p => p.id === power.id);
    if (exists) {
      setSelectedPowers(prev => prev.filter(p => p.id !== power.id));
    } else {
      setSelectedPowers(prev => [
        ...prev,
        {
          id: power.id,
          name: power.name,
          type: type === 'classe' ? 'Poder de Classe' : 'Poder Geral',
          description: power.description,
          source: power.classId ? `Classe (${power.classId})` : (power.category || 'Geral'),
          prerequisites: power.prerequisites
        }
      ]);
    }
  };

  // Adicionar poder personalizado
  const handleAddCustomPower = () => {
    if (!customPowerName.trim()) return;
    const newPower: ManualPowerChoice = {
      id: `custom_power_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: customPowerName.trim(),
      type: `Poder (${customPowerCategory})`,
      description: customPowerDesc.trim() || 'Poder personalizado adicionado manualmente.',
      source: 'Personalizado'
    };
    setSelectedPowers(prev => [...prev, newPower]);
    setCustomPowerName('');
    setCustomPowerDesc('');
  };

  // Adicionar habilidade manual
  const handleAddCustomAbility = () => {
    if (!customAbilityName.trim()) return;
    const newAb: ManualAbilityChoice = {
      id: `custom_ab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: customAbilityName.trim(),
      description: customAbilityDesc.trim() || 'Habilidade registrada na evolução de nível.',
      source: customAbilitySource,
      level: state.nextLevel
    };
    setAddedAbilities(prev => [...prev, newAb]);
    setCustomAbilityName('');
    setCustomAbilityDesc('');
  };

  // Adicionar magia oficial
  const handleToggleOfficialSpell = (spell: any) => {
    const exists = selectedSpells.some(s => s.id === spell.id);
    if (exists) {
      setSelectedSpells(prev => prev.filter(s => s.id !== spell.id));
    } else {
      setSelectedSpells(prev => [
        ...prev,
        {
          id: spell.id,
          name: spell.name,
          circle: Number(spell.circle || 1),
          school: spell.school || 'Universal',
          cost: Number(spell.circle || 1),
          description: spell.description || '',
          range: spell.range,
          duration: spell.duration,
          type: spell.type
        }
      ]);
    }
  };

  // Adicionar magia personalizada
  const handleAddCustomSpell = () => {
    if (!customSpellName.trim()) return;
    const newSpell: ManualSpellChoice = {
      id: `custom_spell_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: customSpellName.trim(),
      circle: customSpellCircle,
      school: customSpellSchool,
      cost: customSpellCost,
      description: customSpellDesc.trim() || 'Magia personalizada adicionada na evolução.',
      type: 'arcana'
    };
    setSelectedSpells(prev => [...prev, newSpell]);
    setCustomSpellName('');
    setCustomSpellDesc('');
  };

  // Handler de confirmação final
  const handleConfirmFinal = async () => {
    try {
      const { updatedCharacter } = finalizeManualEvolution(rawCharacter, draft);
      await onConfirm(updatedCharacter);
    } catch (err) {
      console.error('Erro ao confirmar evolução manual:', err);
    }
  };

  // Poderes de classe filtrados
  const filteredClassPowers = state.availableClassPowers.filter(item => {
    if (!powerSearch.trim()) return true;
    const q = powerSearch.toLowerCase();
    return item.power.name.toLowerCase().includes(q) || item.power.description.toLowerCase().includes(q);
  });

  // Poderes gerais filtrados
  const filteredGeneralPowers = state.availableGeneralPowers.filter(item => {
    if (!powerSearch.trim()) return true;
    const q = powerSearch.toLowerCase();
    return item.power.name.toLowerCase().includes(q) || item.power.description.toLowerCase().includes(q);
  });

  // Magias oficiais filtradas
  const filteredSpells = state.availableOfficialSpells.filter(s => {
    if (selectedSpellCircle > 0 && Number(s.circle) !== selectedSpellCircle) return false;
    if (!spellSearch.trim()) return true;
    const q = spellSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xs">
      <div 
        id="sheet-manual-level-up-modal"
        className="bg-[#0b0e14] border-0 sm:border sm:border-[#1d2330] w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-3xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden text-stone-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* =================================================================== */}
        {/* 1. CABEÇALHO COMPACTO & MINIMALISTA                                */}
        {/* =================================================================== */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 border-b border-[#181f2b] bg-[#0c1017] shrink-0 pt-[max(0.6rem,env(safe-area-inset-top))] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-sans font-bold text-stone-100 truncate">
                {currentSheet.name} • {state.className}
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25 shrink-0">
                Nível {state.currentLevel} → {state.nextLevel}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-sans mt-0.5 truncate">
              {state.tierName} • XP: {currentSheet.xpTotal.toLocaleString('pt-BR')} XP (preservado)
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-md flex items-center justify-center text-stone-400 hover:text-stone-200 hover:bg-[#161c26] transition-colors cursor-pointer shrink-0"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* =================================================================== */}
        {/* 2. VALORES AUTOMÁTICOS: GRADE COMPACTA DE 2 COLUNAS                 */}
        {/* =================================================================== */}
        <div className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-[#080b11] border-b border-[#161c26] shrink-0">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {/* Linha 1: PV MÁX e PM MÁX */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-wider text-stone-400">PV Máx</span>
              <span className="font-mono text-stone-200 text-xs">
                <span className="text-stone-400">{currentSheet.maxPV}</span>
                <span className="text-stone-600 mx-1">→</span>
                <strong className="text-stone-100">{nextSheet.maxPV}</strong>
                {nextSheet.maxPV > currentSheet.maxPV && (
                  <span className="text-emerald-400 text-[10px] ml-1">+{nextSheet.maxPV - currentSheet.maxPV}</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-wider text-stone-400">PM Máx</span>
              <span className="font-mono text-stone-200 text-xs">
                <span className="text-stone-400">{currentSheet.maxPM}</span>
                <span className="text-stone-600 mx-1">→</span>
                <strong className="text-stone-100">{nextSheet.maxPM}</strong>
                {nextSheet.maxPM > currentSheet.maxPM && (
                  <span className="text-emerald-400 text-[10px] ml-1">+{nextSheet.maxPM - currentSheet.maxPM}</span>
                )}
              </span>
            </div>

            {/* Linha 2: DEFESA e INICIATIVA */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-wider text-stone-400">Defesa</span>
              <span className="font-mono text-stone-200 text-xs">
                <span className="text-stone-400">{currentSheet.defense}</span>
                <span className="text-stone-600 mx-1">→</span>
                <strong className="text-stone-100">{nextSheet.defense}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-wider text-stone-400">Iniciativa</span>
              <span className="font-mono text-stone-200 text-xs">
                <span className="text-stone-400">{formatMod(curInit)}</span>
                <span className="text-stone-600 mx-1">→</span>
                <strong className="text-stone-100">{formatMod(nextInit)}</strong>
              </span>
            </div>

            {/* Linha 3: CD MAGIA e CARGA */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-wider text-stone-400">CD Magia</span>
              <span className="font-mono text-stone-200 text-xs">
                <span className="text-stone-400">{currentSheet.spellDC}</span>
                <span className="text-stone-600 mx-1">→</span>
                <strong className="text-stone-100">{nextSheet.spellDC}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-wider text-stone-400">Carga</span>
              <span className="font-mono text-stone-200 text-xs">
                <span className="text-stone-400">{currentSheet.maxWeight}</span>
                <span className="text-stone-600 mx-1">→</span>
                <strong className="text-stone-100">{nextSheet.maxWeight} kg</strong>
              </span>
            </div>

            {/* Linha 4: 1/2 Nível (Automático) */}
            <div className="flex items-center justify-between col-span-2 pt-0.5 border-t border-[#131822] text-[10px] sm:text-[11px]">
              <span className="text-stone-500 font-sans">1/2 Nível (bônus automático):</span>
              <span className="font-mono text-stone-400">
                +{Math.floor(state.currentLevel / 2)} <span className="text-stone-600">→</span> <strong className="text-stone-200">+{Math.floor(state.nextLevel / 2)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. NAVEGAÇÃO DE ABAS LIMPA & ENXUTA (SEM PERÍCIAS)                 */}
        {/* =================================================================== */}
        <div className="flex items-center gap-1 px-3 py-1.5 sm:px-5 sm:py-2 bg-[#0c1017] border-b border-[#181f2b] shrink-0 w-full">
          <button
            onClick={() => handleTabChange('beneficio')}
            className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'beneficio'
                ? 'bg-[#161d28] text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#121620]'
            }`}
          >
            <Sparkles size={13} className={activeTab === 'beneficio' ? 'text-amber-400' : 'text-stone-500'} />
            <span>Benefício</span>
            {(chosenAttribute || selectedPowers.length > 0) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('habilidades')}
            className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'habilidades'
                ? 'bg-[#161d28] text-amber-300 border border-amber-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#121620]'
            }`}
          >
            <Feather size={13} className={activeTab === 'habilidades' ? 'text-amber-400' : 'text-stone-500'} />
            <span>Habilidades ({addedAbilities.length + state.automaticClassAbilities.length})</span>
          </button>

          {state.isSpellcaster && (
            <button
              onClick={() => handleTabChange('magias')}
              className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'magias'
                  ? 'bg-[#161d28] text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#121620]'
              }`}
            >
              <BookOpen size={13} className={activeTab === 'magias' ? 'text-amber-400' : 'text-stone-500'} />
              <span>Magias ({selectedSpells.length})</span>
            </button>
          )}

          <button
            onClick={() => handleTabChange('preview')}
            className={`min-h-[38px] ml-auto px-3 py-1.5 rounded-md text-xs font-sans font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'preview'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-amber-300 hover:bg-[#121620]'
            }`}
          >
            <CheckCircle2 size={13} className="text-amber-400" />
            <span>Revisar</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* 4. CONTEÚDO PRINCIPAL COM SCROLL VERTICAL SEM OVERFLOW HORIZONTAL  */}
        {/* =================================================================== */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 space-y-3.5">

          {/* ----------------------------------------------------------------- */}
          {/* ABA 1: BENEFÍCIO DO NÍVEL (FOCO TOTAL NA DECISÃO DO JOGADOR)       */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'beneficio' && (
            <div className="space-y-3">
              {/* Seletor Segmentado dos Benefícios */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#090d13] rounded-lg border border-[#171d27]">
                <button
                  onClick={() => setBenefitType('atributo')}
                  className={`py-2 px-2 rounded-md text-xs font-sans font-medium transition-colors cursor-pointer text-center truncate ${
                    benefitType === 'atributo'
                      ? 'bg-[#161d28] text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Aumento de Atributo
                </button>
                <button
                  onClick={() => setBenefitType('poder_classe')}
                  className={`py-2 px-2 rounded-md text-xs font-sans font-medium transition-colors cursor-pointer text-center truncate ${
                    benefitType === 'poder_classe'
                      ? 'bg-[#161d28] text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Poder de Classe
                </button>
                <button
                  onClick={() => setBenefitType('poder_geral')}
                  className={`py-2 px-2 rounded-md text-xs font-sans font-medium transition-colors cursor-pointer text-center truncate ${
                    benefitType === 'poder_geral'
                      ? 'bg-[#161d28] text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Poder Geral
                </button>
                <button
                  onClick={() => setBenefitType('poder_custom')}
                  className={`py-2 px-2 rounded-md text-xs font-sans font-medium transition-colors cursor-pointer text-center truncate ${
                    benefitType === 'poder_custom'
                      ? 'bg-[#161d28] text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  + Personalizado
                </button>
              </div>

              {/* Status da Escolha Atual */}
              <div className="px-3 py-2 rounded-lg bg-[#0e1219] border border-[#181f2b] flex items-center justify-between gap-2 text-xs font-sans">
                <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                  <span className="text-stone-400 shrink-0">Benefício escolhido:</span>
                  {chosenAttribute ? (
                    <span className="text-amber-300 font-semibold truncate">
                      +1 {ATTRIBUTE_LABELS[chosenAttribute]} ({formatMod(nextSheet.attributes[chosenAttribute])})
                    </span>
                  ) : selectedPowers.length > 0 ? (
                    <span className="text-emerald-300 font-semibold truncate">
                      {selectedPowers.map(p => p.name).join(', ')}
                    </span>
                  ) : (
                    <span className="text-stone-500 italic">Nenhum selecionado ainda</span>
                  )}
                </div>
                {(chosenAttribute || selectedPowers.length > 0) && (
                  <button
                    onClick={() => {
                      setChosenAttribute(undefined);
                      setSelectedPowers([]);
                    }}
                    className="text-[11px] text-stone-400 hover:text-rose-400 underline transition-colors cursor-pointer shrink-0"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* 1.1: AUMENTO DE ATRIBUTO */}
              {benefitType === 'atributo' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ATTRIBUTE_KEYS.map(attr => {
                    const status = state.attributeBoosts[attr];
                    const isSelected = chosenAttribute === attr;
                    const currentVal = currentSheet.attributes[attr];
                    const nextVal = isSelected ? currentVal + 1 : currentVal;

                    return (
                      <div
                        key={attr}
                        onClick={() => status.isAvailable && handleToggleAttribute(attr)}
                        className={`p-2.5 rounded-lg border transition-all select-none ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/40 cursor-pointer'
                            : status.isAvailable
                            ? 'bg-[#0e1219] border-[#1b222e] hover:border-[#2f3b50] cursor-pointer'
                            : 'bg-[#080b10] border-[#131720] opacity-45 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-amber-400">{attr}</span>
                          <span className="font-sans text-xs text-stone-200">{ATTRIBUTE_LABELS[attr]}</span>
                          <div className="shrink-0 ml-1">
                            {isSelected ? (
                              <div className="w-4 h-4 rounded bg-amber-500 text-stone-950 flex items-center justify-center">
                                <Check size={11} strokeWidth={3} />
                              </div>
                            ) : status.isAvailable ? (
                              <div className="w-4 h-4 rounded border border-[#273244] text-stone-400 flex items-center justify-center text-[9px]">
                                +1
                              </div>
                            ) : (
                              <Lock size={11} className="text-stone-500" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-stone-400 text-xs font-mono">{formatMod(currentVal)}</span>
                          <span className="text-stone-600 text-[10px]">→</span>
                          <span className={`text-sm font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-stone-100'}`}>
                            {formatMod(nextVal)}
                          </span>
                        </div>

                        <div className="text-[10px] text-stone-400 font-sans mt-0.5">
                          {isSelected ? (
                            <span className="text-amber-300">Selecionado (+1)</span>
                          ) : status.isAvailable ? (
                            <span>Disponível</span>
                          ) : (
                            <span className="text-stone-400">{status.reason || 'Limite atingido'}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 1.2: PODERES DE CLASSE */}
              {benefitType === 'poder_classe' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                      type="text"
                      placeholder="Buscar poderes da classe..."
                      value={powerSearch}
                      onChange={e => setPowerSearch(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#0e1219] border border-[#1b222e] text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    {filteredClassPowers.length === 0 ? (
                      <p className="text-center py-6 text-xs text-stone-400 font-sans">Nenhum poder de classe encontrado.</p>
                    ) : (
                      filteredClassPowers.map(({ power, isAvailable, reason }) => {
                        const isSelected = selectedPowers.some(p => p.id === power.id);
                        const isExpanded = expandedPowerIds.has(power.id);

                        return (
                          <div
                            key={power.id}
                            className={`rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-400/80'
                                : isAvailable
                                ? 'bg-[#0e1219] border-[#1b222e]'
                                : 'bg-[#080b10] border-[#141822] opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5">
                              <div 
                                onClick={() => togglePowerExpanded(power.id)}
                                className="flex-1 min-w-0 cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className={`text-xs font-sans font-bold truncate ${isSelected ? 'text-amber-300' : 'text-stone-200'}`}>
                                    {power.name}
                                  </h4>
                                  {power.minLevel > 1 && (
                                    <span className="px-1 py-0.2 rounded text-[9px] font-sans bg-[#161d28] text-stone-400">
                                      Nv {power.minLevel}
                                    </span>
                                  )}
                                  {!isAvailable && (
                                    <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                                      <Lock size={10} /> Requisitos
                                    </span>
                                  )}
                                </div>
                                {power.prerequisites && (
                                  <p className="text-[10px] text-stone-400 font-sans truncate mt-0.5">
                                    Pré-req: {power.prerequisites}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => togglePowerExpanded(power.id)}
                                  className="w-7 h-7 rounded flex items-center justify-center text-stone-400 hover:text-stone-200 cursor-pointer"
                                  title={isExpanded ? 'Recolher' : 'Expandir'}
                                >
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleOfficialPower(power, 'classe')}
                                  className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-500 text-stone-950 font-bold'
                                      : isAvailable
                                      ? 'border border-[#263142] text-stone-300 hover:border-amber-400'
                                      : 'border border-[#18202c] text-stone-500'
                                  }`}
                                  title={isSelected ? 'Remover' : 'Selecionar'}
                                >
                                  {isSelected ? <Check size={13} strokeWidth={3} /> : <Plus size={13} />}
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="px-2.5 pb-2.5 pt-1 border-t border-[#181f2b] text-xs text-stone-300 font-sans leading-relaxed space-y-1">
                                <p>{power.description}</p>
                                {!isAvailable && reason && (
                                  <p className="text-[11px] text-rose-400 font-sans flex items-center gap-1 pt-0.5">
                                    <Lock size={11} /> {reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* 1.3: PODERES GERAIS */}
              {benefitType === 'poder_geral' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                      type="text"
                      placeholder="Buscar poderes gerais (Combate, Destino, Magia...)"
                      value={powerSearch}
                      onChange={e => setPowerSearch(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#0e1219] border border-[#1b222e] text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    {filteredGeneralPowers.slice(0, 50).map(({ power, isAvailable, reason }) => {
                      const isSelected = selectedPowers.some(p => p.id === power.id);
                      const isExpanded = expandedPowerIds.has(power.id);

                      return (
                        <div
                          key={power.id}
                          className={`rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-400/80'
                              : isAvailable
                              ? 'bg-[#0e1219] border-[#1b222e]'
                              : 'bg-[#080b10] border-[#141822] opacity-70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5">
                            <div 
                              onClick={() => togglePowerExpanded(power.id)}
                              className="flex-1 min-w-0 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className={`text-xs font-sans font-bold truncate ${isSelected ? 'text-amber-300' : 'text-stone-200'}`}>
                                  {power.name}
                                </h4>
                                <span className="px-1 py-0.2 rounded text-[9px] font-sans bg-[#161d28] text-stone-400 uppercase">
                                  {power.category}
                                </span>
                              </div>
                              {power.prerequisites && (
                                <p className="text-[10px] text-stone-400 font-sans truncate mt-0.5">
                                  Pré-req: {power.prerequisites}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePowerExpanded(power.id)}
                                className="w-7 h-7 rounded flex items-center justify-center text-stone-400 hover:text-stone-200 cursor-pointer"
                                title={isExpanded ? 'Recolher' : 'Expandir'}
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleOfficialPower(power, 'geral')}
                                className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500 text-stone-950 font-bold'
                                    : isAvailable
                                    ? 'border border-[#263142] text-stone-300 hover:border-amber-400'
                                    : 'border border-[#18202c] text-stone-500'
                                }`}
                                title={isSelected ? 'Remover' : 'Selecionar'}
                              >
                                {isSelected ? <Check size={13} strokeWidth={3} /> : <Plus size={13} />}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-2.5 pb-2.5 pt-1 border-t border-[#181f2b] text-xs text-stone-300 font-sans leading-relaxed space-y-1">
                              <p>{power.description}</p>
                              {!isAvailable && reason && (
                                <p className="text-[11px] text-rose-400 font-sans flex items-center gap-1 pt-0.5">
                                  <Lock size={11} /> {reason}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 1.4: PODER PERSONALIZADO */}
              {benefitType === 'poder_custom' && (
                <div className="p-3 rounded-lg bg-[#0e1219] border border-[#1b222e] space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-sans text-stone-300">Nome do Poder</label>
                    <input
                      type="text"
                      placeholder="Ex: Ataque Brutal Aprimorado"
                      value={customPowerName}
                      onChange={e => setCustomPowerName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#0a0d14] border border-[#1f2736] text-xs text-stone-200 focus:outline-none focus:border-amber-500/50 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-sans text-stone-300">Categoria / Origem</label>
                    <select
                      value={customPowerCategory}
                      onChange={e => setCustomPowerCategory(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#0a0d14] border border-[#1f2736] text-xs text-stone-200 focus:outline-none font-sans"
                    >
                      <option value="Combate">Combate</option>
                      <option value="Destino">Destino</option>
                      <option value="Magia">Magia</option>
                      <option value="Tormenta">Tormenta</option>
                      <option value="Classe">Poder de Classe</option>
                      <option value="Geral">Geral</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-sans text-stone-300">Descrição e Efeito</label>
                    <textarea
                      rows={2}
                      placeholder="Descreva o efeito mecânico do poder..."
                      value={customPowerDesc}
                      onChange={e => setCustomPowerDesc(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#0a0d14] border border-[#1f2736] text-xs text-stone-200 focus:outline-none focus:border-amber-500/50 font-sans resize-none"
                    />
                  </div>

                  <button
                    onClick={handleAddCustomPower}
                    disabled={!customPowerName.trim()}
                    className="w-full h-10 rounded-lg bg-[#18202d] hover:bg-[#202b3d] text-amber-300 border border-amber-500/30 text-xs font-sans font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Adicionar Poder Personalizado</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* ABA 2: HABILIDADES                                                */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'habilidades' && (
            <div className="space-y-3">
              {/* Habilidades Automáticas da Classe para este nível */}
              {state.automaticClassAbilities.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-sans font-semibold text-stone-300 uppercase tracking-wide">
                    Habilidades Automáticas de {state.className} (Nível {state.nextLevel})
                  </h4>
                  <div className="space-y-1.5">
                    {state.automaticClassAbilities.map(ab => {
                      const isExpanded = expandedAbilityNames.has(ab.name);
                      return (
                        <div key={ab.name} className="p-2.5 rounded-lg bg-[#0e1219] border border-[#1b222e] text-xs space-y-1">
                          <div 
                            onClick={() => toggleAbilityExpanded(ab.name)}
                            className="flex items-center justify-between cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-sans font-bold text-amber-300">{ab.name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-sans bg-[#161d28] text-stone-400">Classe</span>
                            </div>
                            {isExpanded ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
                          </div>
                          {isExpanded && (
                            <p className="text-stone-300 pt-1 border-t border-[#181f2b] font-sans leading-relaxed">{ab.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lista de Habilidades Registradas pelo Jogador */}
              {addedAbilities.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-sans font-semibold text-stone-300 uppercase tracking-wide">
                    Habilidades Registradas ({addedAbilities.length})
                  </h4>
                  <div className="space-y-1.5">
                    {addedAbilities.map(ab => (
                      <div key={ab.id} className="p-2.5 rounded-lg bg-[#0e1219] border border-[#1b222e] text-xs flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="font-bold text-stone-200 truncate">{ab.name}</h5>
                          <p className="text-[10px] text-stone-400 truncate">{ab.source}</p>
                        </div>
                        <button
                          onClick={() => setAddedAbilities(prev => prev.filter(a => a.id !== ab.id))}
                          className="w-7 h-7 rounded text-stone-400 hover:text-rose-400 hover:bg-[#161c26] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Remover"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form para Registrar Nova Habilidade */}
              <div className="p-3 rounded-lg bg-[#0e1219] border border-[#1b222e] space-y-2.5">
                <h4 className="text-xs font-sans font-semibold text-stone-300 uppercase tracking-wide">
                  + Registrar Habilidade Adicional
                </h4>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-stone-300">Nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Duro na Queda"
                    value={customAbilityName}
                    onChange={e => setCustomAbilityName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#0a0d14] border border-[#1f2736] text-xs text-stone-200 focus:outline-none focus:border-amber-500/50 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-stone-300">Origem</label>
                  <select
                    value={customAbilitySource}
                    onChange={e => setCustomAbilitySource(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#0a0d14] border border-[#1f2736] text-xs text-stone-200 focus:outline-none font-sans"
                  >
                    <option value="Classe">Classe</option>
                    <option value="Raça">Raça</option>
                    <option value="Origem">Origem</option>
                    <option value="Divindade">Divindade</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-stone-300">Descrição</label>
                  <textarea
                    rows={2}
                    placeholder="Descrição da habilidade..."
                    value={customAbilityDesc}
                    onChange={e => setCustomAbilityDesc(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#0a0d14] border border-[#1f2736] text-xs text-stone-200 focus:outline-none focus:border-amber-500/50 font-sans resize-none"
                  />
                </div>
                <button
                  onClick={handleAddCustomAbility}
                  disabled={!customAbilityName.trim()}
                  className="w-full h-10 rounded-lg bg-[#18202d] hover:bg-[#202b3d] text-stone-200 border border-[#263346] text-xs font-sans font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Registrar Habilidade</span>
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* ABA 3: MAGIAS                                                     */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'magias' && state.isSpellcaster && (
            <div className="space-y-3">
              {/* Barra de Filtro de Círculos */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {[0, 1, 2, 3, 4, 5].filter(c => c === 0 || c <= state.maxSpellCircle).map(circle => (
                  <button
                    key={circle}
                    onClick={() => setSelectedSpellCircle(circle)}
                    className={`px-2.5 py-1 rounded text-xs font-sans font-medium transition-colors cursor-pointer shrink-0 ${
                      selectedSpellCircle === circle
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-[#0e1219] text-stone-400 hover:text-stone-200 border border-[#1b222e]'
                    }`}
                  >
                    {circle === 0 ? 'Todos' : `${circle}º Círculo`}
                  </button>
                ))}
              </div>

              {/* Campo de Busca */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Buscar magias..."
                  value={spellSearch}
                  onChange={e => setSpellSearch(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#0e1219] border border-[#1b222e] text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50 font-sans"
                />
              </div>

              {/* Lista de Magias Oficiais */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {filteredSpells.slice(0, 50).map(spell => {
                  const isSelected = selectedSpells.some(s => s.id === spell.id);
                  const isExpanded = expandedSpellIds.has(spell.id);

                  return (
                    <div
                      key={spell.id}
                      className={`rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-400/80'
                          : 'bg-[#0e1219] border-[#1b222e]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5">
                        <div 
                          onClick={() => toggleSpellExpanded(spell.id)}
                          className="flex-1 min-w-0 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className={`text-xs font-sans font-bold truncate ${isSelected ? 'text-amber-300' : 'text-stone-200'}`}>
                              {spell.name}
                            </h4>
                            <span className="text-[10px] text-stone-400">
                              {spell.circle}º Círculo • {spell.school} ({spell.circle} PM)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleSpellExpanded(spell.id)}
                            className="w-7 h-7 rounded flex items-center justify-center text-stone-400 hover:text-stone-200 cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleOfficialSpell(spell)}
                            className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 font-bold'
                                : 'border border-[#263142] text-stone-300 hover:border-amber-400'
                            }`}
                          >
                            {isSelected ? <Check size={13} strokeWidth={3} /> : <Plus size={13} />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-2.5 pb-2.5 pt-1 border-t border-[#181f2b] text-xs text-stone-300 font-sans leading-relaxed space-y-1">
                          <p>{spell.description}</p>
                          <div className="text-[10px] text-stone-400 font-sans pt-0.5 flex gap-3 flex-wrap">
                            {spell.range && <span>Alcance: {spell.range}</span>}
                            {spell.duration && <span>Duração: {spell.duration}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Magia Personalizada Form */}
              <div className="p-3 rounded-lg bg-[#0e1219] border border-[#1b222e] space-y-2.5">
                <h4 className="text-xs font-sans font-semibold text-stone-300 uppercase tracking-wide">
                  + Aprender Magia Personalizada
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-sans text-stone-300">Nome da Magia</label>
                    <input
                      type="text"
                      placeholder="Ex: Raio de Fogo Real"
                      value={customSpellName}
                      onChange={e => setCustomSpellName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#0a0d14] border border-[#1f2736] text-xs text-stone-200 focus:outline-none focus:border-amber-500/50 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-sans text-stone-300">Círculo</label>
                    <select
                      value={customSpellCircle}
                      onChange={e => {
                        const c = Number(e.target.value);
                        setCustomSpellCircle(c);
                        setCustomSpellCost(c);
                      }}
                      className="w-full h-9 px-3 rounded-lg bg-[#0a0d14] border border-[#1f2736] text-xs text-stone-200 focus:outline-none font-sans"
                    >
                      {[1, 2, 3, 4, 5].filter(c => c <= state.maxSpellCircle).map(c => (
                        <option key={c} value={c}>{c}º Círculo ({c} PM)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-sans text-stone-300">Efeito da Magia</label>
                  <textarea
                    rows={2}
                    placeholder="Descreva o efeito da magia..."
                    value={customSpellDesc}
                    onChange={e => setCustomSpellDesc(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#0a0d14] border border-[#1f2736] text-xs text-stone-200 focus:outline-none focus:border-amber-500/50 font-sans resize-none"
                  />
                </div>

                <button
                  onClick={handleAddCustomSpell}
                  disabled={!customSpellName.trim()}
                  className="w-full h-10 rounded-lg bg-[#18202d] hover:bg-[#202b3d] text-stone-200 border border-[#263346] text-xs font-sans font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Aprender Magia</span>
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* ABA 4: REVISÃO VERTICAL & DIRETA (SEM PERÍCIAS)                   */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              {/* Resumo do Nível */}
              <div className="p-3 rounded-lg bg-[#0e1219] border border-[#1b222e] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-bold text-amber-300 uppercase tracking-wide">
                    Evolução do Personagem
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Nível {state.currentLevel} → {state.nextLevel}
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-sans">
                  {currentSheet.name} • {state.className} ({state.tierName})
                </p>
                <p className="text-[11px] text-stone-400 font-sans">
                  XP Acumulado: <strong className="text-stone-200">{currentSheet.xpTotal.toLocaleString('pt-BR')} XP</strong> (100% preservado)
                </p>
              </div>

              {/* Benefício Escolhido */}
              <div className="p-3 rounded-lg bg-[#0e1219] border border-[#1b222e] space-y-2">
                <h4 className="text-xs font-sans font-bold text-stone-200 uppercase tracking-wide">
                  Benefício Escolhido
                </h4>

                <div className="space-y-1.5 text-xs font-sans">
                  {chosenAttribute ? (
                    <div className="p-2 rounded bg-[#090d14] border border-[#181f2c] flex items-center justify-between">
                      <span className="text-stone-300">Aumento de Atributo:</span>
                      <span className="font-mono font-bold text-amber-300">
                        +1 {ATTRIBUTE_LABELS[chosenAttribute]} ({formatMod(currentSheet.attributes[chosenAttribute])} → {formatMod(nextSheet.attributes[chosenAttribute])})
                      </span>
                    </div>
                  ) : null}

                  {selectedPowers.length > 0 ? (
                    <div className="p-2 rounded bg-[#090d14] border border-[#181f2c] space-y-1">
                      <span className="text-stone-300 block font-medium">Poderes Adicionados:</span>
                      <ul className="space-y-0.5 pl-2 text-stone-200 list-disc list-inside">
                        {selectedPowers.map(p => (
                          <li key={p.id} className="text-[11px]">
                            <strong>{p.name}</strong> <span className="text-stone-400">({p.type})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {addedAbilities.length > 0 ? (
                    <div className="p-2 rounded bg-[#090d14] border border-[#181f2c] space-y-1">
                      <span className="text-stone-300 block font-medium">Habilidades Registradas:</span>
                      <ul className="space-y-0.5 pl-2 text-stone-200 list-disc list-inside">
                        {addedAbilities.map(a => (
                          <li key={a.id} className="text-[11px]">
                            <strong>{a.name}</strong> <span className="text-stone-400">({a.source})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {selectedSpells.length > 0 ? (
                    <div className="p-2 rounded bg-[#090d14] border border-[#181f2c] space-y-1">
                      <span className="text-stone-300 block font-medium">Magias Aprendidas:</span>
                      <ul className="space-y-0.5 pl-2 text-stone-200 list-disc list-inside">
                        {selectedSpells.map(s => (
                          <li key={s.id} className="text-[11px]">
                            <strong>{s.name}</strong> <span className="text-stone-400">({s.circle}º Círculo, {s.school})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {!chosenAttribute && selectedPowers.length === 0 && addedAbilities.length === 0 && selectedSpells.length === 0 && (
                    <p className="text-stone-500 italic text-[11px]">Nenhum benefício opcional selecionado.</p>
                  )}
                </div>
              </div>

              {/* Habilidades Automáticas Ativadas */}
              {state.automaticClassAbilities.length > 0 && (
                <div className="p-3 rounded-lg bg-[#0e1219] border border-[#1b222e] space-y-1.5">
                  <h4 className="text-xs font-sans font-bold text-stone-200 uppercase tracking-wide">
                    Habilidades Automáticas de Classe
                  </h4>
                  <ul className="space-y-1 text-xs font-sans text-stone-300 pl-2 list-disc list-inside">
                    {state.automaticClassAbilities.map(ab => (
                      <li key={ab.name}>
                        <strong className="text-amber-300">{ab.name}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Valores Recalculados */}
              <div className="p-3 rounded-lg bg-[#0e1219] border border-[#1b222e] space-y-2">
                <h4 className="text-xs font-sans font-bold text-stone-200 uppercase tracking-wide">
                  Valores Recalculados pelo Sistema
                </h4>

                <div className="grid grid-cols-2 gap-1.5 text-xs font-sans">
                  <div className="p-2 rounded bg-[#090d14] border border-[#181f2c]">
                    <span className="text-stone-400 text-[10px] block">PV MÁXIMO</span>
                    <span className="font-mono font-bold text-stone-100">
                      {currentSheet.maxPV} → <strong className="text-amber-300">{nextSheet.maxPV}</strong>
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-mono">+{nextSheet.maxPV - currentSheet.maxPV}</span>
                  </div>

                  <div className="p-2 rounded bg-[#090d14] border border-[#181f2c]">
                    <span className="text-stone-400 text-[10px] block">PM MÁXIMO</span>
                    <span className="font-mono font-bold text-stone-100">
                      {currentSheet.maxPM} → <strong className="text-amber-300">{nextSheet.maxPM}</strong>
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-mono">+{nextSheet.maxPM - currentSheet.maxPM}</span>
                  </div>

                  <div className="p-2 rounded bg-[#090d14] border border-[#181f2c]">
                    <span className="text-stone-400 text-[10px] block">DEFESA TOTAL</span>
                    <span className="font-mono font-bold text-stone-100">
                      {currentSheet.defense} → <strong className="text-amber-300">{nextSheet.defense}</strong>
                    </span>
                  </div>

                  <div className="p-2 rounded bg-[#090d14] border border-[#181f2c]">
                    <span className="text-stone-400 text-[10px] block">INICIATIVA</span>
                    <span className="font-mono font-bold text-stone-100">
                      {formatMod(curInit)} → <strong className="text-amber-300">{formatMod(nextInit)}</strong>
                    </span>
                  </div>

                  <div className="p-2 rounded bg-[#090d14] border border-[#181f2c]">
                    <span className="text-stone-400 text-[10px] block">CD MAGIA</span>
                    <span className="font-mono font-bold text-stone-100">
                      {currentSheet.spellDC} → <strong className="text-amber-300">{nextSheet.spellDC}</strong>
                    </span>
                  </div>

                  <div className="p-2 rounded bg-[#090d14] border border-[#181f2c]">
                    <span className="text-stone-400 text-[10px] block">CARGA MÁXIMA</span>
                    <span className="font-mono font-bold text-stone-100">
                      {currentSheet.maxWeight} → <strong className="text-amber-300">{nextSheet.maxWeight} kg</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* =================================================================== */}
        {/* 5. RODAPÉ COMPACTO & SAFE-AREA COMPLIANT (44–48px)                 */}
        {/* =================================================================== */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 border-t border-[#181f2b] bg-[#0c1017] shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2.5 w-full">
            {activeTab !== 'preview' ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="h-10 sm:h-11 px-4 rounded-lg bg-[#141822] hover:bg-[#1a2130] text-stone-300 hover:text-stone-100 border border-[#212a39] text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer shrink-0"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviousTab(activeTab);
                    setActiveTab('preview');
                  }}
                  className="h-10 sm:h-11 px-4 flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Revisar evolução</span>
                  <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab(previousTab || 'beneficio')}
                  disabled={isSaving}
                  className="h-10 sm:h-11 px-4 rounded-lg bg-[#141822] hover:bg-[#1a2130] text-stone-300 hover:text-stone-100 border border-[#212a39] text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <ArrowLeft size={15} />
                  <span>Voltar</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmFinal}
                  disabled={isSaving}
                  className="h-10 sm:h-11 px-4 flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans font-bold text-xs sm:text-sm uppercase tracking-wide transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Confirmar evolução</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
