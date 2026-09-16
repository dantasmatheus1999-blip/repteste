/**
 * Motor de Evolução e Level Up de Personagens (Tormenta 20 — Edição Jogo do Ano)
 * Fonte de Verdade: Livro Básico Tormenta 20 JdA
 */

import { 
  T20_OFFICIAL_PROGRESSION, 
  getTier, 
  getTierName, 
  T20Tier, 
  ClassOfficialProgression 
} from '../data/t20ProgressionMatrix';
import { T20_CLASS_POWERS, T20ClassPower } from '../data/t20ClassPowers';
import { T20_POWERS } from '../data/t20Powers';
import { T20Power } from '../types/powers';
import { calcMod, getTrainingBonus, getHalfLevel, getMaxSpellCircle } from '../utils/sheetCalculations';

export interface PowerOptionWithValidation {
  power: T20ClassPower | T20Power;
  isAvailable: boolean;
  reason?: string;
}

export interface AttributeBoostStatus {
  key: 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';
  name: string;
  currentValue: number;
  currentMod: number;
  newValue: number;
  newMod: number;
  isAvailable: boolean;
  reason?: string;
  boostCountTotal: number;
  boostedInCurrentTier: boolean;
}

export interface LevelUpPreview {
  currentLevel: number;
  nextLevel: number;
  className: string;
  classId: string;
  currentTier: T20Tier;
  nextTier: T20Tier;
  tierName: string;
  
  // PV & PM
  currentMaxPV: number;
  newMaxPV: number;
  pvGain: number;
  currentMaxPM: number;
  newMaxPM: number;
  pmGain: number;

  // Derivados fundamentais
  currentTraining: number;
  newTraining: number;
  trainingGain: number;
  currentHalfLevel: number;
  newHalfLevel: number;
  halfLevelGain: number;

  // Magias & CDs
  isSpellcaster: boolean;
  currentSpellCircle: number;
  nextSpellCircle: number;
  unlockedNewCircle: boolean;
  currentSpellDC: number;
  newSpellDC: number;

  // Habilidades automáticas de classe deste nível
  automaticAbilities: {
    name: string;
    description: string;
    level: number;
  }[];

  // Escolha de benefício do jogador (1 poder de classe, 1 poder geral OU 1 aumento de atributo)
  requiresPowerChoice: boolean;
  availableClassPowers: PowerOptionWithValidation[];
  availableGeneralPowers: PowerOptionWithValidation[];
  attributeBoosts: Record<'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR', AttributeBoostStatus>;
}

export interface LevelUpChoice {
  type: 'power' | 'attribute';
  powerId?: string;
  powerName?: string;
  powerType?: string; // 'poder_classe' | 'poder_combate' | 'poder_destino' | etc.
  powerDescription?: string;
  attributeKey?: 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';
}

export interface LevelUpHistoryEntry {
  level: number;
  date: string;
  tier: T20Tier;
  pvGain: number;
  pmGain: number;
  automaticAbilities: string[];
  choice: {
    type: 'power' | 'attribute';
    name: string;
    description: string;
    attributeKey?: 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';
  };
}

/**
 * Valida se o personagem pode subir de nível.
 * Nível máximo oficial: 20.
 */
export const canLevelUp = (character: any): { can: boolean; reason?: string } => {
  if (!character) return { can: false, reason: 'Personagem não carregado.' };
  const level = Number(character.level || 1);
  if (level >= 20) {
    return { can: false, reason: 'O herói já atingiu o nível máximo (20) de Tormenta 20.' };
  }
  if (level < 1) {
    return { can: false, reason: 'Nível inválido.' };
  }
  return { can: true };
};

const ATTRIBUTE_LABELS: Record<'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR', string> = {
  FOR: 'Força',
  DES: 'Destreza',
  CON: 'Constituição',
  INT: 'Inteligência',
  SAB: 'Sabedoria',
  CAR: 'Carisma'
};

/**
 * Audita o histórico do personagem para verificar a disponibilidade de Aumento de Atributo.
 * Regra oficial Tormenta 20 JdA (p. 130):
 * "Você pode escolher este poder uma vez por patamar para um mesmo atributo (ou seja, no máximo quatro vezes
 * para o mesmo atributo ao longo dos 20 níveis, uma em cada patamar: Iniciante 1-4, Veterano 5-10, Campeão 11-16, Lenda 17-20)."
 */
export const getAttributeBoostStatus = (
  character: any,
  targetLevel: number
): Record<'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR', AttributeBoostStatus> => {
  const currentTier = getTier(targetLevel);
  const tierLabel = getTierName(currentTier);
  const attrs = character.attributes || { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 };

  // Histórico de evolução
  const history: LevelUpHistoryEntry[] = Array.isArray(character.evolutionHistory) 
    ? character.evolutionHistory 
    : [];

  // Habilidades já gravadas na ficha
  const existingAbilities = Array.isArray(character.abilities) ? character.abilities : [];

  const keys: ('FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR')[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
  const result = {} as Record<'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR', AttributeBoostStatus>;

  for (const key of keys) {
    const rawVal = Number(attrs[key] ?? 0);
    const val = calcMod(rawVal);
    const mod = val;
    const nextVal = val + 1;
    const nextMod = nextVal;

    // Contagem de aumentos prévios para este atributo
    let boostCountTotal = 0;
    let boostedInCurrentTier = false;
    let boostedAtLevel: number | null = null;

    // 1. Checa no history formal
    for (const entry of history) {
      if (entry.choice?.type === 'attribute') {
        const targetAttr = entry.choice.attributeKey || 
          (entry.choice.name?.includes(key) ? key : null);

        if (targetAttr === key) {
          boostCountTotal++;
          const entryTier = entry.tier || getTier(entry.level);
          if (entryTier === currentTier) {
            boostedInCurrentTier = true;
            boostedAtLevel = entry.level;
          }
        }
      }
    }

    // 2. Checa em abilities por segurança (caso tenha sido criado diretamente em nível alto ou sem history)
    for (const ab of existingAbilities) {
      const name = (ab.name || '').toUpperCase();
      if (name.includes('AUMENTO DE ATRIBUTO') && name.includes(key)) {
        // Se a habilidade tem level registrado
        const abLevel = Number(ab.level || 0);
        if (abLevel > 0) {
          const abTier = getTier(abLevel);
          if (abTier === currentTier) {
            boostedInCurrentTier = true;
            boostedAtLevel = abLevel;
          }
        }
      }
    }

    let isAvailable = true;
    let reason: string | undefined = undefined;

    if (boostedInCurrentTier) {
      isAvailable = false;
      const nextTierLevel = currentTier === 'iniciante' ? 5 : currentTier === 'veterano' ? 11 : 17;
      reason = `Já recebeu aumento em ${ATTRIBUTE_LABELS[key]} no patamar ${tierLabel}${boostedAtLevel ? ` (nível ${boostedAtLevel})` : ''}. Poderá aumentar novamente a partir do nível ${nextTierLevel}.`;
    } else if (boostCountTotal >= 4) {
      isAvailable = false;
      reason = `Atingiu o limite máximo de 4 aumentos para ${ATTRIBUTE_LABELS[key]} ao longo dos 20 níveis.`;
    }

    result[key] = {
      key,
      name: ATTRIBUTE_LABELS[key],
      currentValue: val,
      currentMod: mod,
      newValue: nextVal,
      newMod: nextMod,
      isAvailable,
      reason,
      boostCountTotal,
      boostedInCurrentTier
    };
  }

  return result;
};

/**
 * Valida os pré-requisitos de um Poder para o personagem e nível almejado.
 */
export const checkPowerPrerequisites = (
  power: any,
  character: any,
  nextLevel: number
): { met: boolean; reason?: string } => {
  const existingAbilities = (character.abilities || []).map((a: any) => (a.name || '').toLowerCase().trim());
  const powerNameNorm = (power.name || '').toLowerCase().trim();

  // 1. Não permitir duplicação de poder (exceto poderes cumulativos como Aumento de Atributo)
  if (existingAbilities.includes(powerNameNorm)) {
    return { met: false, reason: 'Você já possui este poder.' };
  }

  // 2. Nível mínimo exigido pelo poder
  const minLevel = Number(power.minLevel || 1);
  if (minLevel > nextLevel) {
    return { met: false, reason: `Requer nível ${minLevel} de ${power.classId ? 'classe' : 'personagem'}.` };
  }

  // 3. Validação dos pré-requisitos em texto
  const prereqStr = (power.prerequisites || power.requirements || '').trim();
  if (!prereqStr) {
    return { met: true };
  }

  const attrs = character.attributes || { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 };
  const rawSkills = character.skills || {};
  const trainedSkillsList: string[] = Array.isArray(character.characterData?.choices?.trainedSkills) 
    ? character.characterData.choices.trainedSkills 
    : (Array.isArray(character.trainedSkills) ? character.trainedSkills : []);

  // Extrair atributos exigidos: ex: "For 1", "For 2", "Des 1", "Int 2"
  const attrMatch = prereqStr.match(/\b(For|Des|Con|Int|Sab|Car)\s*(\d+)\b/i);
  if (attrMatch) {
    const attrKey = attrMatch[1].toUpperCase() as 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';
    const reqVal = parseInt(attrMatch[2], 10);
    const currentScore = Number(attrs[attrKey] ?? 0);
    const currentMod = calcMod(currentScore);

    // No T20 JdA, requisitos de atributo são expressos no próprio modificador (+1, +2, etc)
    const effectiveReq = reqVal >= 8 ? calcMod(reqVal) : reqVal;
    if (currentMod < effectiveReq) {
      return { 
        met: false, 
        reason: `Requer ${ATTRIBUTE_LABELS[attrKey]} ${effectiveReq >= 0 ? '+' : ''}${effectiveReq} (atual: ${currentMod >= 0 ? '+' : ''}${currentMod}).` 
      };
    }
  }

  // Extrair perícias treinadas: ex: "Luta treinado", "Pontaria treinado", "Treinado em Luta"
  const skillMatch = prereqStr.match(/\b(Luta|Pontaria|Furtividade|Misticismo|Iniciativa|Percepção|Guerra|Atletismo|Cura|Religião)\s+treinado\b/i) ||
                     prereqStr.match(/Treinado em\s+(Luta|Pontaria|Furtividade|Misticismo|Iniciativa|Percepção|Guerra|Atletismo|Cura|Religião)/i);
  if (skillMatch) {
    const skillName = skillMatch[1].toLowerCase();
    const isTrained = Boolean(
      rawSkills[skillName]?.trained || 
      trainedSkillsList.some(s => s.toLowerCase() === skillName)
    );
    if (!isTrained) {
      return { met: false, reason: `Requer perícia ${skillMatch[1]} treinada.` };
    }
  }

  // Extrair poderes prévios: ex: "Ataque Poderoso", "Estilo de Duas Armas", "Especialização em Arma"
  const knownPowers = [
    'Ataque Poderoso', 'Estilo de Duas Armas', 'Estilo de Uma Arma', 'Estilo de Disparo', 
    'Estilo de Arremesso', 'Estilo de Arma e Escudo', 'Golpe Pessoal', 'Foco em Arma'
  ];
  for (const kp of knownPowers) {
    if (prereqStr.toLowerCase().includes(kp.toLowerCase())) {
      const hasPower = existingAbilities.some((a: string) => a.includes(kp.toLowerCase()));
      if (!hasPower) {
        return { met: false, reason: `Requer o poder prévio "${kp}".` };
      }
    }
  }

  return { met: true };
};

/**
 * Calcula o preview completo da evolução de nível do personagem
 * usando a Matriz Oficial de Tormenta 20 Edição Jogo do Ano.
 */
export const getLevelUpPreview = (character: any): LevelUpPreview | null => {
  if (!character) return null;

  const currentLevel = Number(character.level || 1);
  const nextLevel = currentLevel + 1;
  const classId = (character.classId || character.identity?.classId || 'guerreiro').toLowerCase();
  
  const classProgression: ClassOfficialProgression = T20_OFFICIAL_PROGRESSION[classId] || T20_OFFICIAL_PROGRESSION.guerreiro;
  const currentTier = getTier(currentLevel);
  const nextTier = getTier(nextLevel);
  const tierName = getTierName(nextTier);

  // Atributos atuais (T20 JdA: o atributo é o próprio modificador)
  const rawAttrs = character.attributes || { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 };
  const con = Number(rawAttrs.CON ?? 0);
  const conMod = calcMod(con);

  // Cálculo de Pontos de Vida (T20 JdA)
  // PV Nível 1 = PV Base + CON
  // PV Níveis 2+ = (PV Base por nível + CON) a cada novo nível
  const pvGanhosCurrent = Math.max(1, classProgression.pvPerLevel + conMod) * (currentLevel - 1);
  const currentCalculatedPV = classProgression.pvBase + conMod + Math.max(0, pvGanhosCurrent);
  const pvBonus = Number(character.pvBonus || 0);
  const currentMaxPV = currentCalculatedPV + pvBonus;

  const pvGain = Math.max(1, classProgression.pvPerLevel + conMod);
  const newMaxPV = currentMaxPV + pvGain;

  // Cálculo de Pontos de Mana (T20 JdA)
  // PM Nível 1 = PM Base
  // PM Níveis 2+ = PM Base por nível a cada novo nível
  const currentCalculatedPM = classProgression.pmBase + Math.max(0, classProgression.pmPerLevel * (currentLevel - 1));
  const pmBonus = Number(character.pmBonus || 0);
  const currentMaxPM = currentCalculatedPM + pmBonus;

  const pmGain = classProgression.pmPerLevel;
  const newMaxPM = currentMaxPM + pmGain;

  // Meio Nível e Bônus de Treinamento
  const currentHalfLevel = getHalfLevel(currentLevel);
  const newHalfLevel = getHalfLevel(nextLevel);
  const halfLevelGain = newHalfLevel - currentHalfLevel;

  const currentTraining = getTrainingBonus(currentLevel);
  const newTraining = getTrainingBonus(nextLevel);
  const trainingGain = newTraining - currentTraining;

  // Magias e Círculos Oficiais
  const isSpellcaster = classProgression.isSpellcaster;
  const currentSpellCircle = getMaxSpellCircle(classId, currentLevel);
  const nextSpellCircle = getMaxSpellCircle(classId, nextLevel);
  const unlockedNewCircle = isSpellcaster && nextSpellCircle > currentSpellCircle;

  // CD de Resistência de Magias / Habilidades
  const keyAttrKey = classProgression.keyAttribute || 'INT';
  const keyAttrScore = Number(rawAttrs[keyAttrKey] ?? 0);
  const keyAttrMod = calcMod(keyAttrScore);
  const currentSpellDC = 10 + currentHalfLevel + keyAttrMod;
  const newSpellDC = 10 + newHalfLevel + keyAttrMod;

  // Habilidades automáticas de classe concedidas no novo nível
  const existingAbilityNames = (character.abilities || []).map((a: any) => (a.name || '').toLowerCase().trim());
  const levelData = classProgression.levels[nextLevel];
  const automaticAbilities = (levelData?.automaticAbilities || [])
    .filter(a => !existingAbilityNames.includes(a.name.toLowerCase().trim()))
    .map(a => ({
      name: a.name,
      description: a.description,
      level: nextLevel
    }));

  // No Tormenta 20 JdA, todos os níveis do 2 ao 20 concedem 1 escolha de poder
  const requiresPowerChoice = nextLevel >= 2;

  // Avaliação dos poderes de classe com verificação de pré-requisitos
  const availableClassPowers: PowerOptionWithValidation[] = T20_CLASS_POWERS
    .filter(p => p.classId === classId)
    .map(p => {
      const check = checkPowerPrerequisites(p, character, nextLevel);
      return {
        power: p,
        isAvailable: check.met,
        reason: check.reason
      };
    });

  // Avaliação dos poderes gerais com verificação de pré-requisitos
  const availableGeneralPowers: PowerOptionWithValidation[] = T20_POWERS
    .map(p => {
      const check = checkPowerPrerequisites(p, character, nextLevel);
      return {
        power: p,
        isAvailable: check.met,
        reason: check.reason
      };
    });

  // Avaliação do status de Aumento de Atributo por patamar
  const attributeBoosts = getAttributeBoostStatus(character, nextLevel);

  return {
    currentLevel,
    nextLevel,
    className: classProgression.name,
    classId,
    currentTier,
    nextTier,
    tierName,
    currentMaxPV,
    newMaxPV,
    pvGain,
    currentMaxPM,
    newMaxPM,
    pmGain,
    currentTraining,
    newTraining,
    trainingGain,
    currentHalfLevel,
    newHalfLevel,
    halfLevelGain,
    isSpellcaster,
    currentSpellCircle,
    nextSpellCircle,
    unlockedNewCircle,
    currentSpellDC,
    newSpellDC,
    automaticAbilities,
    requiresPowerChoice,
    availableClassPowers,
    availableGeneralPowers,
    attributeBoosts
  };
};

/**
 * Aplica a transação de evolução de nível ao personagem de forma pura e imutável.
 * Retorna o objeto atualizado e a entrada para o histórico.
 */
export const applyLevelUp = (
  character: any,
  choice?: LevelUpChoice
): { updatedCharacter: any; historyEntry: LevelUpHistoryEntry } => {
  const preview = getLevelUpPreview(character);
  if (!preview) {
    throw new Error('Não foi possível calcular os dados de evolução.');
  }

  const nextLevel = preview.nextLevel;
  if (nextLevel > 20) {
    throw new Error('O personagem já atingiu o nível máximo (20).');
  }

  const nextCharacter = JSON.parse(JSON.stringify(character));
  const classProgression = T20_OFFICIAL_PROGRESSION[preview.classId] || T20_OFFICIAL_PROGRESSION.guerreiro;

  // 1. Avanço sequencial de nível
  nextCharacter.level = nextLevel;

  // 2. Habilidades automáticas concedidas
  if (!Array.isArray(nextCharacter.abilities)) {
    nextCharacter.abilities = [];
  }

  const autoAbilityNames: string[] = [];
  preview.automaticAbilities.forEach(ability => {
    const exists = nextCharacter.abilities.some(
      (a: any) => (a.name || '').toLowerCase().trim() === ability.name.toLowerCase().trim()
    );
    if (!exists) {
      nextCharacter.abilities.push({
        id: `class_ab_${nextLevel}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: ability.name,
        type: 'classe',
        description: ability.description,
        level: nextLevel
      });
      autoAbilityNames.push(ability.name);
    }
  });

  // 3. Processamento da Escolha do Jogador (Poder de Classe, Poder Geral OU Aumento de Atributo)
  let choiceRecord = {
    type: (choice?.type || 'power') as 'power' | 'attribute',
    name: 'Nenhum',
    description: '',
    attributeKey: undefined as ('FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR' | undefined)
  };

  let effectivePVGain = preview.pvGain;
  let effectiveMaxPV = preview.newMaxPV;

  if (choice) {
    if (choice.type === 'attribute' && choice.attributeKey) {
      const attrKey = choice.attributeKey;
      if (!nextCharacter.attributes) {
        nextCharacter.attributes = { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 };
      }

      // Validação de patamar
      const status = preview.attributeBoosts[attrKey];
      if (!status.isAvailable) {
        throw new Error(status.reason || 'Este aumento de atributo não é permitido pelas regras oficiais de patamar.');
      }

      // Concede +1 permanente no atributo escolhido (T20 JdA)
      const currentAttr = calcMod(Number(nextCharacter.attributes[attrKey] ?? 0));
      nextCharacter.attributes[attrKey] = currentAttr + 1;

      // Efeito retroativo de Constituição (T20 JdA)
      if (attrKey === 'CON') {
        const newCon = nextCharacter.attributes.CON;
        const newConMod = calcMod(newCon);
        const recalculatedMaxPV = classProgression.pvBase + newConMod + 
          Math.max(0, Math.max(1, classProgression.pvPerLevel + newConMod) * (nextLevel - 1));
        
        effectiveMaxPV = recalculatedMaxPV + Number(nextCharacter.pvBonus || 0);
        effectivePVGain = effectiveMaxPV - preview.currentMaxPV;
      }

      const powerName = `Aumento de Atributo (+1 ${attrKey})`;
      const desc = `Aumento permanente de +1 em ${ATTRIBUTE_LABELS[attrKey]} escolhido no nível ${nextLevel} (${preview.tierName}).`;
      
      nextCharacter.abilities.push({
        id: `attr_boost_${nextLevel}_${Date.now()}`,
        name: powerName,
        type: 'poder_geral',
        description: desc,
        level: nextLevel,
        tier: preview.nextTier,
        attributeKey: attrKey
      });

      choiceRecord = {
        type: 'attribute',
        name: powerName,
        description: desc,
        attributeKey: attrKey
      };
    } else if (choice.type === 'power' && choice.powerName) {
      // Jogador escolheu um poder: NÃO recebe aumento de atributo
      const powerId = choice.powerId || `power_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      nextCharacter.abilities.push({
        id: powerId,
        name: choice.powerName,
        type: choice.powerType || 'poder_classe',
        description: choice.powerDescription || 'Sem descrição.',
        level: nextLevel
      });

      choiceRecord = {
        type: 'power',
        name: choice.powerName,
        description: choice.powerDescription || '',
        attributeKey: undefined
      };
    }
  }

  // 4. Aplicação de PV e PM com preservação segura do dano/recurso atual
  const prevCurrentPV = Number(nextCharacter.currentPV ?? preview.currentMaxPV);
  nextCharacter.pvMax = effectiveMaxPV;
  nextCharacter.currentPV = Math.min(nextCharacter.pvMax, prevCurrentPV + effectivePVGain);

  const prevCurrentPM = Number(nextCharacter.currentPM ?? preview.currentMaxPM);
  nextCharacter.pmMax = preview.newMaxPM;
  nextCharacter.currentPM = Math.min(nextCharacter.pmMax, prevCurrentPM + preview.pmGain);

  // 5. Registro consistente do Histórico de Evolução
  if (!Array.isArray(nextCharacter.evolutionHistory)) {
    nextCharacter.evolutionHistory = [];
  }

  const historyEntry: LevelUpHistoryEntry = {
    level: nextLevel,
    date: new Date().toISOString(),
    tier: preview.nextTier,
    pvGain: effectivePVGain,
    pmGain: preview.pmGain,
    automaticAbilities: autoAbilityNames,
    choice: choiceRecord
  };

  nextCharacter.evolutionHistory.push(historyEntry);
  nextCharacter.updatedAt = new Date().toISOString();

  return {
    updatedCharacter: nextCharacter,
    historyEntry
  };
};
