import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Compass,
  Sword,
  Sparkles,
  Award,
  Shield,
  Swords,
  Package,
  Flame,
  Wand2,
  Scroll,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  ListOrdered,
  ArrowLeft,
  Box,
  Skull
} from 'lucide-react';
import { WizardParchmentBackground } from './wizard/WizardParchmentBackground';
import { useAuth } from '../../context/AuthContext';
import { CharacterService } from '../../services/characterService';
import { WizardData, INITIAL_WIZARD_DATA } from './wizard/types';
import { StepIdentity } from './wizard/StepIdentity';
import { CharacterSelectionScreen3D } from './wizard/CharacterSelectionScreen3D';
import { StepRace } from './wizard/StepRace';
import { StepOrigin } from './wizard/StepOrigin';
import { StepClass } from './wizard/StepClass';
import { StepAttributes } from './wizard/StepAttributes';
import { StepSkills } from './wizard/StepSkills';
import { StepCombat } from './wizard/StepCombat';
import { StepAttacks } from './wizard/StepAttacks';
import { StepEquipment } from './wizard/StepEquipment';
import { StepPowers } from './wizard/StepPowers';
import { StepSpells } from './wizard/StepSpells';
import { StepHistory } from './wizard/StepHistory';
import { StepReview } from './wizard/StepReview';
import { optimizeAvatar } from '../../utils/imageCompression';

interface StepMeta {
  id: string;
  title: string;
  shortTitle: string;
  headline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WIZARD_STEPS: StepMeta[] = [
  {
    id: 'identity',
    title: '1. Identidade do Herói',
    shortTitle: 'Identidade',
    headline: 'IDENTIDADE DO HERÓI',
    description: 'Escolha o nome do seu aventureiro e o retrato que o representará.',
    icon: User
  },
  {
    id: 'race',
    title: '2. Escolha da Raça',
    shortTitle: 'Raça',
    headline: 'ESCOLHA SUA RAÇA',
    description: 'A raça define sua linhagem, traços culturais e concede modificadores que influenciam suas habilidades.',
    icon: Compass
  },
  {
    id: 'origin',
    title: '3. Origem e Passado',
    shortTitle: 'Origem',
    headline: 'DEFINA SUA ORIGEM',
    description: 'O passado do seu personagem confere perícias iniciais e itens de partida.',
    icon: Compass
  },
  {
    id: 'class',
    title: '4. Classe e Nível',
    shortTitle: 'Classe',
    headline: 'ESCOLHA SUA CLASSE',
    description: 'A vocação heroica que dita sua vida (PV), mana (PM) e capacidades marciais.',
    icon: Sword
  },
  {
    id: 'attributes',
    title: '5. Atributos de Arton',
    shortTitle: 'Atributos',
    headline: 'DISTRIBUA OS ATRIBUTOS',
    description: 'Ajuste os 6 valores fundamentais de Tormenta 20 para forjar seu herói.',
    icon: Sparkles
  },
  {
    id: 'skills',
    title: '6. Perícias Treinadas',
    shortTitle: 'Perícias',
    headline: 'TREINE SUAS PERÍCIAS',
    description: 'Selecione os conhecimentos e especialidades práticas do seu herói.',
    icon: Award
  },
  {
    id: 'combat',
    title: '7. Defesa e Combate',
    shortTitle: 'Combate',
    headline: 'ESTATÍSTICAS DE COMBATE',
    description: 'Verifique PV, PM, deslocamento e equipe armaduras e escudos protetores.',
    icon: Shield
  },
  {
    id: 'attacks',
    title: '8. Armas e Ataques',
    shortTitle: 'Ataques',
    headline: 'EQUIPE SEUS ATAQUES',
    description: 'Escolha as armas e métodos ofensivos para desferir golpes nas batalhas.',
    icon: Swords
  },
  {
    id: 'equipment',
    title: '9. Mochila e Carga',
    shortTitle: 'Itens',
    headline: 'ITENS E EQUIPAMENTOS',
    description: 'Adicione itens essenciais à mochila respeitando o limite de peso.',
    icon: Package
  },
  {
    id: 'powers',
    title: '10. Poderes & Habilidades',
    shortTitle: 'Poderes',
    headline: 'SELECIONE PODERES',
    description: 'Poderes gerais de combate, destino, magia ou bênçãos concedidas.',
    icon: Flame
  },
  {
    id: 'spells',
    title: '11. Magias Arcanas/Divinas',
    shortTitle: 'Magias',
    headline: 'MEMORIZE MAGIAS',
    description: 'Conjuradores podem aprender magias de diversos círculos místicos.',
    icon: Wand2
  },
  {
    id: 'history',
    title: '12. Histórico e Devoção',
    shortTitle: 'Histórico',
    headline: 'HISTÓRICO E DIVINDADE',
    description: 'Defina a quem seu herói é devoto e escreva sua trajetória em Arton.',
    icon: Scroll
  },
  {
    id: 'review',
    title: '13. Revisão da Ficha',
    shortTitle: 'Revisão',
    headline: 'REVISÃO DO HERÓI',
    description: 'Confira todos os dados antes de consagrar e ingressar no reino.',
    icon: CheckCircle2
  }
];

export const CharacterCreationWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [data, setData] = useState<WizardData>(() => {
    const base = { ...INITIAL_WIZARD_DATA };
    base.playerName = user?.displayName || user?.email?.split('@')[0] || '';
    return base;
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStepsMenuOpen, setIsStepsMenuOpen] = useState<boolean>(false);

  const handleUpdateData = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = () => {
    if (currentStep === 0 && !data.name.trim()) {
      setErrorMessage('Por favor, informe o nome do seu herói antes de prosseguir.');
      return;
    }
    setErrorMessage(null);
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleJumpToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < WIZARD_STEPS.length) {
      setErrorMessage(null);
      setCurrentStep(stepIndex);
      setIsStepsMenuOpen(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!user) {
      setErrorMessage('Você precisa estar autenticado para criar uma ficha.');
      return;
    }

    if (!data.name.trim()) {
      setErrorMessage('Seu herói precisa de um nome! Volte à etapa de Identidade.');
      setCurrentStep(0);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Otimiza e comprime a imagem do avatar para evitar estouro de 1MB no Firestore
      const optimizedImageUrl = await optimizeAvatar(data.imageUrl);

      const skillsRecord: Record<string, { trained: boolean; extra: number; others: number }> = {};
      data.skills.forEach((sk) => {
        skillsRecord[sk.id] = {
          trained: sk.trained,
          extra: 0,
          others: sk.others || 0
        };
      });

      const attacksPayload = data.attacks.map((atk) => ({
        id: atk.id,
        name: atk.name,
        attr: atk.range === 'Corpo a corpo' ? 'FOR' : 'DES',
        damage: atk.damage,
        crit: atk.crit,
        type: atk.type,
        attackTest: atk.attackTest,
        range: atk.range
      }));

      const inventoryPayload = data.equipment.map((eq) => ({
        id: eq.id,
        name: eq.name,
        weight: eq.weight,
        type: 'item',
        equipped: true,
        quantity: eq.quantity
      }));

      const abilitiesPayload = data.powers.map((pow) => ({
        id: pow.id,
        name: pow.name,
        type: pow.type,
        description: pow.description,
        source: pow.source
      }));

      const characterPayload: any = {
        name: data.name.trim(),
        playerName: data.playerName,
        imageUrl: optimizedImageUrl || data.imageUrl,
        avatarType: data.avatarType || '3d',
        avatarId: data.avatarId || 'guerreiro',
        avatarModelPath: data.avatarModelPath || '3d/anaogrande-v1.glb',
        level: data.level,
        classId: data.classId,
        className: data.className,
        raceId: data.raceId,
        raceName: data.raceName,
        originId: data.originId,
        originName: data.originName,
        deity: data.deity,
        age: data.age,
        gender: data.gender,
        size: data.size,
        movement: data.movement,

        attributes: data.attributes,
        attrBonus: data.attrModifiers,

        currentPV: data.hpMax,
        pvMax: data.hpMax,
        currentPM: data.manaMax,
        pmMax: data.manaMax,
        defense: data.defense,
        armor: data.armor,
        shield: data.shield,

        skills: skillsRecord,
        attacks: attacksPayload,
        inventory: inventoryPayload,
        abilities: abilitiesPayload,
        spells: data.spells,

        notes: data.history,
        history: data.history,
        money: 10,

        isAutomated: true,
        characterData: {
          identity: {
            name: data.name.trim(),
            raceId: data.raceId,
            originId: data.originId,
            classId: data.classId,
            level: data.level
          },
          baseAttributes: data.attributes,
          choices: {
            trainedSkills: data.trainedSkills,
            powers: data.powers.map((p) => p.id),
            spells: data.spells.map((s) => s.id),
            equipment: {
              armorId: data.armor?.id,
              shieldId: data.shield?.id,
              weapons: data.attacks.map((a) => a.id),
              accessories: []
            }
          },
          state: {
            currentPV: data.hpMax,
            currentPM: data.manaMax,
            conditions: [],
            buffs: [],
            debuffs: []
          }
        }
      };

      const charId = await CharacterService.createCharacter(user.uid, characterPayload);

      if (charId) {
        navigate(`/characters/${charId}`);
      } else {
        navigate('/characters');
      }
    } catch (err: any) {
      console.error('Erro ao consagrar personagem:', err);
      setErrorMessage(
        err?.message || 'Erro ao salvar o personagem no banco de dados. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepMeta = WIZARD_STEPS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / WIZARD_STEPS.length) * 100);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#06080d] text-stone-100 flex flex-col overflow-hidden relative select-none font-sans">
      {/* BACKGROUND OFICIAL (Imagem 1) */}
      <WizardParchmentBackground />

      {/* 1. TOP HEADER BAR */}
      <header className="h-14 px-3.5 sm:px-6 bg-[#080a0f]/90 backdrop-blur-md border-b border-[#1b202c] flex items-center justify-between shrink-0 z-30 shadow-md">
        <button
          type="button"
          onClick={() => navigate('/characters')}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0f121a]/80 border border-[#232836] hover:border-[#d4af37]/60 flex items-center justify-center text-stone-300 hover:text-amber-200 transition-colors shadow-xs"
          title="Sair da criação"
        >
          <ChevronLeft className="w-5 h-5 text-stone-300" />
        </button>

        {/* Center: Title with medieval diamond flourish */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="font-cinzel text-xs sm:text-sm font-bold tracking-[0.18em] text-[#e8c988] uppercase">
            CRIAÇÃO DE PERSONAGEM
          </span>
          <div className="flex items-center justify-center gap-1.5 opacity-60 mt-0.5">
            <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#d4af37]" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]" />
            <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#d4af37]" />
          </div>
        </div>

        {/* Right: Step pill and connected progress dots */}
        <div className="flex flex-col items-end justify-center">
          <button
            type="button"
            onClick={() => setIsStepsMenuOpen(true)}
            className="px-3 py-1 rounded-full bg-[#0f121a]/80 border border-[#232836] hover:border-[#d4af37]/50 text-stone-300 hover:text-amber-200 text-[11px] sm:text-xs font-medium font-sans cursor-pointer transition-colors"
          >
            Etapa {currentStep + 1}/{WIZARD_STEPS.length}
          </button>
          <div className="flex items-center gap-1.5 mt-1.5 px-0.5">
            {WIZARD_STEPS.map((st, i) => {
              const isCur = i === currentStep;
              const isPast = i < currentStep;
              return (
                <div
                  key={st.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCur
                      ? 'w-3.5 bg-[#f3cb69] shadow-[0_0_8px_rgba(243,203,105,0.9)]'
                      : isPast
                      ? 'w-1.5 bg-[#8c6d2c]'
                      : 'w-1.5 bg-[#262c3b]'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC STEP HEADER (Centered & Golden 8-Point Compass Emblem) */}
      <div className="px-4 sm:px-6 pt-3.5 pb-2 text-center shrink-0 bg-transparent flex flex-col items-center relative z-10">
        {/* Golden 8-Point Compass Star Emblem */}
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-[#241d14] via-[#12151d] to-[#080a0f] border border-[#a88238]/60 flex items-center justify-center text-[#f0cb69] shadow-[0_0_20px_rgba(212,175,55,0.2)] mb-1.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-current stroke-[1.5]">
            <path d="M12 2 L14 9 L21 7 L16 12 L21 17 L14 15 L12 22 L10 15 L3 17 L8 12 L3 7 L10 9 Z" fill="currentColor" fillOpacity="0.25" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </div>
        <h2 className="text-base sm:text-xl font-cinzel font-bold text-[#f0dcb0] uppercase tracking-wider">
          {currentStepMeta.headline}
        </h2>
        <p className="text-[11px] sm:text-xs text-stone-400 max-w-md mx-auto leading-relaxed mt-0.5">
          {currentStepMeta.description}
        </p>
      </div>

      {/* ERROR BANNER IF ANY */}
      {errorMessage && (
        <div className="px-4 py-2 bg-red-950/90 border-b border-red-800 text-red-200 flex items-center justify-between text-xs shrink-0 animate-fadeIn z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-2.5 sm:py-3 no-scrollbar sm:custom-scrollbar relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.16 }}
            className="h-full flex flex-col"
          >
            {currentStep === 0 && (
              <StepIdentity data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 1 && (
              <StepRace data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 2 && (
              <StepOrigin data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 3 && (
              <StepClass data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 4 && (
              <StepAttributes data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 5 && (
              <StepSkills data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 6 && (
              <StepCombat data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 7 && (
              <StepAttacks data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 8 && (
              <StepEquipment data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 9 && (
              <StepPowers data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 10 && (
              <StepSpells data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 11 && (
              <StepHistory data={data} onChange={handleUpdateData} />
            )}
            {currentStep === 12 && (
              <StepReview
                data={data}
                onChange={handleUpdateData}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 5. FIXED BOTTOM ACTION BAR */}
      <footer className="h-16 sm:h-18 bg-[#080a0f]/95 backdrop-blur-md border-t border-[#1b202c] px-4 sm:px-8 flex items-center justify-between z-30 shrink-0 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl border border-[#262c3b] bg-[#0d1017] hover:border-amber-600/40 text-stone-300 hover:text-amber-200 disabled:opacity-20 disabled:cursor-not-allowed text-xs sm:text-sm font-cinzel font-semibold tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>ANTERIOR</span>
        </button>

        {/* Center Antique Skull & Ornate Lines Divider */}
        <div className="flex items-center gap-2 text-[#785b28]/80 select-none">
          <span className="w-4 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#785b28]" />
          <div className="w-6 h-6 rounded-full bg-[#0d1017] border border-[#785b28]/60 flex items-center justify-center text-[#d4af37] shadow-xs">
            <Skull className="w-3.5 h-3.5 opacity-80" />
          </div>
          <span className="w-4 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#785b28]" />
        </div>

        {/* Next or Consecrate Button */}
        {currentStep < WIZARD_STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 sm:px-7 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#cfa13e] via-[#f0cb69] to-[#cfa13e] hover:brightness-110 text-stone-950 font-cinzel font-bold text-xs sm:text-sm tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all active:scale-95 cursor-pointer"
          >
            <span>PRÓXIMO</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 sm:px-7 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-cinzel font-bold text-xs sm:text-sm tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Salvando...' : 'CONSAGRAR'}</span>
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </footer>

      {/* 6. STEP SELECTOR MODAL / BOTTOM SHEET */}
      {isStepsMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-md bg-stone-950 border border-amber-600/50 rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-base font-bold text-amber-200">
                  Etapas da Criação
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStepsMenuOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-1.5 pr-1 custom-scrollbar flex-1">
              {WIZARD_STEPS.map((st, idx) => {
                const IconComp = st.icon;
                const isCur = currentStep === idx;
                const isDone = currentStep > idx;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleJumpToStep(idx)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isCur
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-500/50'
                        : isDone
                        ? 'bg-stone-900/80 border-amber-900/30 text-stone-300 hover:bg-stone-900'
                        : 'bg-stone-950/60 border-stone-800 text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                          isCur
                            ? 'bg-amber-500 text-stone-950'
                            : isDone
                            ? 'bg-amber-950 text-amber-400 border border-amber-700/50'
                            : 'bg-stone-900 text-stone-500 border border-stone-800'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-cinzel text-xs font-bold block">
                          {st.shortTitle}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {st.headline}
                        </span>
                      </div>
                    </div>

                    <IconComp className="w-4 h-4 text-stone-500" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
