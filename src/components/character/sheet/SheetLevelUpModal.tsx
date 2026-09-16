import React, { useState, useMemo } from 'react';
import { 
  ArrowUpCircle, 
  Sparkles, 
  Heart, 
  Zap, 
  Award, 
  Check, 
  Search, 
  X, 
  Shield, 
  Lock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { 
  getLevelUpPreview, 
  LevelUpPreview, 
  LevelUpChoice,
  PowerOptionWithValidation,
  AttributeBoostStatus
} from '../../../services/characterEvolutionService';

interface SheetLevelUpModalProps {
  isOpen: boolean;
  character: any;
  onClose: () => void;
  onConfirm: (choice: LevelUpChoice) => Promise<void> | void;
  isSaving?: boolean;
}

type TabType = 'class' | 'general' | 'attribute';

type BenefitSelection = 
  | { type: 'power'; power: PowerOptionWithValidation['power'] }
  | { type: 'attribute'; attributeKey: 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR' }
  | null;

export const SheetLevelUpModal: React.FC<SheetLevelUpModalProps> = ({
  isOpen,
  character,
  onClose,
  onConfirm,
  isSaving = false
}) => {
  if (!isOpen || !character) return null;

  const preview: LevelUpPreview | null = useMemo(() => {
    return getLevelUpPreview(character);
  }, [character]);

  const [activeTab, setActiveTab] = useState<TabType>('class');
  const [generalCategory, setGeneralCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Seleção única de benefício: ou Poder (Classe/Geral) OU Aumento de Atributo
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitSelection>(null);

  if (!preview) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <div className="bg-[#12161f] border border-[#21262d] rounded-xl p-6 text-center max-w-md w-full">
          <p className="text-stone-300 mb-4 font-sans text-sm">Não foi possível preparar os dados de evolução deste personagem.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#1c2128] text-stone-200 hover:bg-[#252b35] text-xs font-sans"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Poderes de classe filtrados por busca
  const filteredClassPowers = useMemo(() => {
    return preview.availableClassPowers.filter(item => {
      const p = item.power;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.prerequisites && p.prerequisites.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [preview.availableClassPowers, searchTerm]);

  // Poderes gerais filtrados por categoria e busca
  const filteredGeneralPowers = useMemo(() => {
    return preview.availableGeneralPowers.filter(item => {
      const p = item.power as any;
      const cat = p.category || '';
      const matchesCat = generalCategory === 'todos' || 
        cat === generalCategory || 
        (generalCategory === 'concedido' && cat === 'concedidos') ||
        (generalCategory === 'tormenta' && cat === 'tormenta');
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.prerequisites && p.prerequisites.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [preview.availableGeneralPowers, generalCategory, searchTerm]);

  const handleSelectPower = (item: PowerOptionWithValidation) => {
    if (!item.isAvailable) return;
    if (selectedBenefit?.type === 'power' && selectedBenefit.power.id === item.power.id) {
      // Toggle off
      setSelectedBenefit(null);
    } else {
      setSelectedBenefit({
        type: 'power',
        power: item.power
      });
    }
  };

  const handleSelectAttr = (attrKey: 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR') => {
    const status = preview.attributeBoosts[attrKey];
    if (!status.isAvailable) return;
    if (selectedBenefit?.type === 'attribute' && selectedBenefit.attributeKey === attrKey) {
      // Toggle off
      setSelectedBenefit(null);
    } else {
      setSelectedBenefit({
        type: 'attribute',
        attributeKey: attrKey
      });
    }
  };

  // No T20 JdA, nível >= 2 requer 1 escolha (poder ou aumento de atributo)
  const isChoiceValid = useMemo(() => {
    if (!preview.requiresPowerChoice) return true;
    return selectedBenefit !== null;
  }, [preview.requiresPowerChoice, selectedBenefit]);

  // Cálculo prévio do ganho de PV considerando aumento retroativo de CON se selecionado
  const effectivePVGain = useMemo(() => {
    if (selectedBenefit?.type === 'attribute' && selectedBenefit.attributeKey === 'CON') {
      const currentCon = Number(character.attributes?.CON ?? 0);
      const oldConMod = currentCon >= 8 ? Math.floor((currentCon - 10) / 2) : currentCon;
      const newCon = currentCon + 1;
      const newConMod = newCon >= 8 ? Math.floor((newCon - 10) / 2) : newCon;
      if (newConMod > oldConMod) {
        // CON mod aumentou: retroativo para todos os níveis (nível 1 + (nextLevel - 1) níveis)
        return preview.pvGain + (preview.nextLevel - 1);
      }
    }
    return preview.pvGain;
  }, [selectedBenefit, preview.pvGain, preview.nextLevel, character.attributes]);

  const effectiveNewMaxPV = preview.currentMaxPV + effectivePVGain;

  const handleConfirmClick = () => {
    if (!isChoiceValid || isSaving) return;

    let finalChoice: LevelUpChoice;
    if (selectedBenefit?.type === 'attribute') {
      finalChoice = {
        type: 'attribute',
        attributeKey: selectedBenefit.attributeKey
      };
    } else if (selectedBenefit?.type === 'power') {
      const p = selectedBenefit.power as any;
      finalChoice = {
        type: 'power',
        powerId: p.id,
        powerName: p.name,
        powerType: p.classId ? 'poder_classe' : (p.category ? `poder_${p.category}` : 'poder_geral'),
        powerDescription: p.description
      };
    } else {
      finalChoice = {
        type: 'power',
        powerName: 'Evolução Automática'
      };
    }

    onConfirm(finalChoice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-[#0e1218] border border-[#21262d] rounded-xl max-w-3xl w-full my-auto overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-stone-200"
        role="dialog"
        aria-labelledby="levelup-title"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1c2128] bg-[#141820] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ArrowUpCircle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="levelup-title" className="text-base font-bold text-white font-cinzel tracking-wide">
                  Evolução de Personagem
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Nível {preview.currentLevel} → {preview.nextLevel}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#1d232f] text-stone-300 border border-[#2b3445]">
                  {preview.tierName}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                <strong className="text-stone-200">{character.name}</strong> &bull; <span className="capitalize">{preview.className}</span> (Tormenta 20 — Edição Jogo do Ano)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1c2128] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-sm">
          
          {/* SEÇÃO 1: BENEFÍCIOS AUTOMÁTICOS */}
          <div className="p-3.5 rounded-xl bg-[#12161f] border border-[#1e2430]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider font-sans">
                <TrendingUp size={14} />
                <span>Benefícios Automáticos do Nível {preview.nextLevel}</span>
              </div>
              <span className="text-[10px] text-stone-400 font-sans">
                Calculados segundo a progressão oficial de {preview.className}
              </span>
            </div>

            {/* Grid de Atributos Derivados */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* PV */}
              <div className="p-2.5 rounded-lg bg-[#161b24] border border-[#212835]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-stone-400 font-sans">Pontos de Vida</span>
                  <Heart size={13} className="text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-white font-mono">{preview.currentMaxPV}</span>
                  <span className="text-xs text-stone-500 font-mono">→</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{effectiveNewMaxPV}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-medium ml-auto">
                    +{effectivePVGain}
                  </span>
                </div>
              </div>

              {/* PM */}
              <div className="p-2.5 rounded-lg bg-[#161b24] border border-[#212835]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-stone-400 font-sans">Pontos de Mana</span>
                  <Zap size={13} className="text-sky-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-white font-mono">{preview.currentMaxPM}</span>
                  <span className="text-xs text-stone-500 font-mono">→</span>
                  <span className="text-sm font-bold text-sky-400 font-mono">{preview.newMaxPM}</span>
                  <span className="text-[10px] font-mono text-sky-400 font-medium ml-auto">
                    +{preview.pmGain}
                  </span>
                </div>
              </div>

              {/* Treinamento */}
              <div className="p-2.5 rounded-lg bg-[#161b24] border border-[#212835]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-stone-400 font-sans">Treinamento</span>
                  <Award size={13} className="text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-white font-mono">+{preview.currentTraining}</span>
                  <span className="text-xs text-stone-500 font-mono">→</span>
                  <span className={`text-sm font-bold font-mono ${preview.trainingGain > 0 ? 'text-amber-300' : 'text-stone-300'}`}>
                    +{preview.newTraining}
                  </span>
                  {preview.trainingGain > 0 && (
                    <span className="text-[10px] font-mono text-amber-400 font-medium ml-auto">
                      +{preview.trainingGain}
                    </span>
                  )}
                </div>
              </div>

              {/* Metade do Nível */}
              <div className="p-2.5 rounded-lg bg-[#161b24] border border-[#212835]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-stone-400 font-sans">Metade do Nível</span>
                  <Shield size={13} className="text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-white font-mono">+{preview.currentHalfLevel}</span>
                  <span className="text-xs text-stone-500 font-mono">→</span>
                  <span className={`text-sm font-bold font-mono ${preview.halfLevelGain > 0 ? 'text-indigo-300' : 'text-stone-300'}`}>
                    +{preview.newHalfLevel}
                  </span>
                  {preview.halfLevelGain > 0 && (
                    <span className="text-[10px] font-mono text-indigo-400 font-medium ml-auto">
                      +{preview.halfLevelGain}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Aviso de Conjurador / Novo Círculo */}
            {preview.isSpellcaster && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-[#161b24] border border-[#212835] flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400 shrink-0" />
                  <span className="text-stone-300 font-sans">
                    CD de Resistência de Magia: <strong className="text-white font-mono">{preview.newSpellDC}</strong>
                  </span>
                </div>
                {preview.unlockedNewCircle ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                    ★ Novo Círculo Desbloqueado: {preview.nextSpellCircle}º Círculo!
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400 font-sans">
                    Círculo máximo acessível: {preview.currentSpellCircle}º Círculo
                  </span>
                )}
              </div>
            )}

            {/* Habilidades Automáticas da Classe no novo nível */}
            {preview.automaticAbilities.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#1e2430]">
                <div className="text-[11px] font-bold text-amber-300/90 font-sans uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Award size={13} />
                  <span>Novas Habilidades de Classe Automáticas</span>
                </div>
                <div className="space-y-1.5">
                  {preview.automaticAbilities.map((ab, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#161b24] border border-amber-500/30 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <strong className="text-amber-300 font-sans">{ab.name}</strong>
                        <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Nível {ab.level}
                        </span>
                      </div>
                      <p className="text-stone-300 text-[11px] font-sans leading-relaxed">{ab.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 2: ESCOLHA DO NÍVEL (OBRIGATÓRIA PARA NÍVEIS 2 A 20) */}
          {preview.requiresPowerChoice && (
            <div className="space-y-3 pt-1">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider font-sans flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Escolha de Benefício do Nível {preview.nextLevel}</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 font-sans mt-0.5">
                    O jogador tem direito a escolher <strong>1 benefício</strong>: um Poder de Classe, um Poder Geral ou um Aumento de Atributo (+1).
                  </p>
                </div>

                {isChoiceValid ? (
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shrink-0">
                    <Check size={13} />
                    <span>Benefício Escolhido</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shrink-0">
                    <AlertCircle size={13} />
                    <span>Escolha Obrigatória Pendente</span>
                  </span>
                )}
              </div>

              {/* Navegação de Abas */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#12161f] border border-[#1e2430]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('class');
                    setSearchTerm('');
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize font-sans ${
                    activeTab === 'class'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Poderes de {preview.className}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('general');
                    setSearchTerm('');
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer font-sans ${
                    activeTab === 'general'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Poderes Gerais
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('attribute');
                    setSearchTerm('');
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer font-sans ${
                    activeTab === 'attribute'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Aumento de Atributo (+1)
                </button>
              </div>

              {/* ABA 1: PODERES DE CLASSE */}
              {activeTab === 'class' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder={`Buscar poderes de ${preview.className}...`}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-[#12161f] border border-[#1e2430] rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 font-sans"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                    {filteredClassPowers.length === 0 ? (
                      <p className="text-xs text-stone-500 text-center py-8 font-sans">
                        Nenhum poder de classe correspondente encontrado.
                      </p>
                    ) : (
                      filteredClassPowers.map(item => {
                        const p = item.power;
                        const isSelected = selectedBenefit?.type === 'power' && selectedBenefit.power.id === p.id;
                        const isAvailable = item.isAvailable;

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPower(item)}
                            className={`p-2.5 rounded-lg border text-xs transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500/80 shadow-sm cursor-pointer'
                                : isAvailable
                                  ? 'bg-[#12161f] border-[#1e2430] hover:border-[#384457] cursor-pointer'
                                  : 'bg-[#0d1017] border-[#161a22] opacity-65 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-bold font-sans ${isSelected ? 'text-amber-300' : isAvailable ? 'text-stone-200' : 'text-stone-400'}`}>
                                {p.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {!isAvailable ? (
                                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40 flex items-center gap-1">
                                    <Lock size={10} />
                                    <span>{item.reason}</span>
                                  </span>
                                ) : p.prerequisites ? (
                                  <span className="text-[10px] text-stone-400 font-sans">
                                    {p.prerequisites}
                                  </span>
                                ) : null}

                                {isSelected && (
                                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                                    <Check size={11} strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-stone-400 text-[11px] leading-relaxed font-sans">
                              {p.description}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ABA 2: PODERES GERAIS */}
              {activeTab === 'general' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[180px]">
                      <Search size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Buscar poderes gerais..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[#12161f] border border-[#1e2430] rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto">
                      {['todos', 'combate', 'destino', 'magia', 'concedido', 'tormenta'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setGeneralCategory(cat)}
                          className={`px-2 py-1 rounded text-[11px] capitalize font-sans transition-colors cursor-pointer ${
                            generalCategory === cat
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                              : 'bg-[#12161f] text-stone-400 hover:text-stone-200 border border-[#1e2430]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                    {filteredGeneralPowers.length === 0 ? (
                      <p className="text-xs text-stone-500 text-center py-8 font-sans">
                        Nenhum poder geral correspondente encontrado.
                      </p>
                    ) : (
                      filteredGeneralPowers.map(item => {
                        const p = item.power as any;
                        const isSelected = selectedBenefit?.type === 'power' && selectedBenefit.power.id === p.id;
                        const isAvailable = item.isAvailable;

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectPower(item)}
                            className={`p-2.5 rounded-lg border text-xs transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500/80 shadow-sm cursor-pointer'
                                : isAvailable
                                  ? 'bg-[#12161f] border-[#1e2430] hover:border-[#384457] cursor-pointer'
                                  : 'bg-[#0d1017] border-[#161a22] opacity-65 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold font-sans ${isSelected ? 'text-amber-300' : isAvailable ? 'text-stone-200' : 'text-stone-400'}`}>
                                  {p.name}
                                </span>
                                {p.category && (
                                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#1e2430] text-stone-400 font-sans">
                                    {p.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {!isAvailable ? (
                                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40 flex items-center gap-1">
                                    <Lock size={10} />
                                    <span>{item.reason}</span>
                                  </span>
                                ) : p.prerequisites ? (
                                  <span className="text-[10px] text-stone-400 font-sans">
                                    {p.prerequisites}
                                  </span>
                                ) : null}

                                {isSelected && (
                                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                                    <Check size={11} strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-stone-400 text-[11px] leading-relaxed font-sans">
                              {p.description}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ABA 3: AUMENTO DE ATRIBUTO (+1) */}
              {activeTab === 'attribute' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-[#12161f] border border-[#1e2430]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider font-sans">
                      <TrendingUp size={13} />
                      <span>Regra Oficial de Aumento de Atributo (Tormenta 20 JdA)</span>
                    </div>
                    <p className="text-xs text-stone-300 font-sans leading-relaxed">
                      Concede <strong>+1 permanente</strong> no atributo selecionado. No Tormenta 20 JdA, você pode escolher este poder 
                      <strong> no máximo uma vez por patamar para um mesmo atributo</strong> (até 4 vezes no total ao longo dos 20 níveis: 
                      Iniciante 1-4, Veterano 5-10, Campeão 11-16, Lenda 17-20).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const).map(attrKey => {
                      const status: AttributeBoostStatus = preview.attributeBoosts[attrKey];
                      const isSelected = selectedBenefit?.type === 'attribute' && selectedBenefit.attributeKey === attrKey;
                      const isAvailable = status.isAvailable;

                      return (
                        <div
                          key={attrKey}
                          onClick={() => handleSelectAttr(attrKey)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-white shadow-md cursor-pointer ring-1 ring-amber-500/50'
                              : isAvailable
                                ? 'bg-[#161b24] border-[#212835] text-stone-300 hover:border-[#3b475c] cursor-pointer'
                                : 'bg-[#0d1017] border-[#181d26] text-stone-500 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-sm tracking-wide">{attrKey}</span>
                            <span className="text-[10px] text-stone-400 font-sans">{status.name}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                                <Check size={11} strokeWidth={3} />
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-1.5 mt-1.5">
                            <span className="text-xs text-stone-400 font-mono font-bold">
                              {status.currentMod >= 0 ? `+${status.currentMod}` : status.currentMod}
                            </span>
                            <span className="text-xs text-stone-500 font-mono">→</span>
                            <span className="text-xs font-bold text-amber-400 font-mono">
                              {status.newMod >= 0 ? `+${status.newMod}` : status.newMod}
                            </span>
                          </div>

                          {/* Status de disponibilidade por patamar */}
                          <div className="mt-2 pt-1.5 border-t border-[#1e2430]/60 text-[10px] font-sans">
                            {isAvailable ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                                <Check size={10} /> Disponível no patamar
                              </span>
                            ) : (
                              <span className="text-amber-400/90 flex items-center gap-1 leading-tight">
                                <Lock size={10} className="shrink-0" />
                                <span>{status.reason}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedBenefit?.type === 'attribute' && selectedBenefit.attributeKey === 'CON' && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-sans">
                      ★ <strong>Regra Especial de Constituição:</strong> O bônus de PV é retroativo! Seus Pontos de Vida máximos aumentam em +1 para cada nível que você já possui (+{preview.nextLevel} PV neste nível).
                    </div>
                  )}
                </div>
              )}

              {/* RESUMO DA ESCOLHA SELECIONADA */}
              <div className="p-3 rounded-xl bg-[#141923] border border-[#232b3a] flex items-center justify-between text-xs flex-wrap gap-2">
                <div>
                  <span className="text-stone-400 font-sans">Benefício Selecionado para o Nível {preview.nextLevel}: </span>
                  {selectedBenefit?.type === 'attribute' ? (
                    <strong className="text-amber-300 font-sans">
                      Aumento de Atributo (+1 {preview.attributeBoosts[selectedBenefit.attributeKey].name})
                    </strong>
                  ) : selectedBenefit?.type === 'power' ? (
                    <strong className="text-amber-300 font-sans">
                      {selectedBenefit.power.name}
                    </strong>
                  ) : (
                    <span className="text-stone-500 italic font-sans">Nenhum selecionado</span>
                  )}

                  <p className="text-[11px] text-stone-400 font-sans mt-0.5">
                    {selectedBenefit?.type === 'power' 
                      ? 'Nenhum aumento de atributo será aplicado neste nível.' 
                      : selectedBenefit?.type === 'attribute'
                        ? 'Nenhum outro poder adicional será concedido neste nível.'
                        : 'Selecione uma das opções acima para continuar.'}
                  </p>
                </div>

                {isChoiceValid && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold shrink-0">
                    <Check size={13} /> Pronto para Confirmar
                  </span>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#1c2128] bg-[#141820] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-stone-300 hover:text-white bg-transparent hover:bg-[#1c2128] border border-[#21262d] transition-colors cursor-pointer font-sans"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={!isChoiceValid || isSaving}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 font-sans ${
              isChoiceValid && !isSaving
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md cursor-pointer'
                : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>Aplicando Evolução...</span>
              </>
            ) : (
              <>
                <ArrowUpCircle size={15} />
                <span>Confirmar Evolução para Nível {preview.nextLevel}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
