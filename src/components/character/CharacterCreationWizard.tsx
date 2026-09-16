import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CharacterService } from '../../services/characterService';
import { WizardData, INITIAL_WIZARD_DATA } from './wizard/types';
import { StepIdentity } from './wizard/StepIdentity';
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
    description: 'Selecione a linhagem que concederá modificadores e traços biológicos.',
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

  const handleUpdateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

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
        imageUrl: optimizedImageUrl,
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
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-stone-950 text-stone-100 flex flex-col overflow-hidden relative select-none font-sans">
      {/* 1. TOP HEADER BAR */}
      <header className="h-13 sm:h-14 px-3 sm:px-5 bg-stone-950/95 border-b border-amber-900/40 flex items-center justify-between shrink-0 z-30 shadow-md">
        <button
          type="button"
          onClick={() => navigate('/characters')}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-300 transition-colors p-1 rounded-lg"
          title="Sair da criação"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span className="font-cinzel text-xs uppercase tracking-wider font-bold text-amber-200">
            Criação de Personagem
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStepsMenuOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-mono font-medium hover:bg-amber-900/60 transition-colors cursor-pointer"
          >
            <span>Etapa {currentStep + 1}/13</span>
            <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/characters')}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. PROGRESS BAR */}
      <div className="w-full h-1 bg-stone-900 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3. DYNAMIC STEP HEADER (Centered & Clean) */}
      <div className="px-4 sm:px-6 pt-2 pb-2 text-center shrink-0 border-b border-stone-900 bg-gradient-to-b from-stone-950 to-stone-900/30">
        <span className="text-[10px] font-bold text-amber-500 tracking-[0.25em] uppercase block">
          ETAPA {currentStep + 1} DE {WIZARD_STEPS.length}
        </span>
        <h2 className="text-base sm:text-xl font-cinzel font-bold text-amber-200 uppercase tracking-wide mt-0.5">
          {currentStepMeta.headline}
        </h2>
        <p className="text-[11px] sm:text-xs text-stone-400 max-w-lg mx-auto truncate sm:whitespace-normal mt-0.5">
          {currentStepMeta.description}
        </p>
      </div>

      {/* ERROR BANNER IF ANY */}
      {errorMessage && (
        <div className="px-4 py-2 bg-red-950/90 border-b border-red-800 text-red-200 flex items-center justify-between text-xs shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. MAIN CONTENT AREA (Clean viewport, no outer scrollbar, internal overflow if needed) */}
      <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-2.5 sm:py-3 no-scrollbar sm:custom-scrollbar">
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
      <footer className="h-16 sm:h-18 bg-stone-950/95 backdrop-blur-md border-t border-amber-900/40 px-3 sm:px-6 flex items-center justify-between z-30 shrink-0 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-stone-800 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-stone-100 disabled:opacity-25 disabled:cursor-not-allowed text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        {/* Center Hero Mini Preview */}
        <div className="flex items-center gap-2 max-w-[150px] sm:max-w-xs truncate px-2">
          <img
            src={data.imageUrl}
            alt=""
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-500/60 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="truncate text-left">
            <span className="text-xs font-bold text-amber-200 block truncate leading-tight">
              {data.name || 'Novo Herói'}
            </span>
            <span className="text-[10px] text-stone-400 block truncate leading-tight">
              {data.raceName} • {data.className}
            </span>
          </div>
        </div>

        {/* Next or Consecrate Button */}
        {currentStep < WIZARD_STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-950/50 transition-all active:scale-95 cursor-pointer"
          >
            <span>Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-cinzel font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Salvando...' : 'Consagrar'}</span>
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
