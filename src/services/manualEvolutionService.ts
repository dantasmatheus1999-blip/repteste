/**
 * Serviço de Evolução Manual de Personagem (Tormenta 20 — Edição Jogo do Ano)
 * 
 * Regra Principal:
 * - O JOGADOR ESCOLHE OS BENEFÍCIOS (Atributos, Poderes, Habilidades, Magias).
 * - O SISTEMA CALCULA OS VALORES DERIVADOS (PV, PM, 1/2 nível, perícias, defesa, CDs, carga).
 * - Usar o mesmo motor de cálculo já utilizado pela ficha (normalizeCharacterSheet).
 * - XP excedente é sempre preservado.
 */

import { Attribute } from '../types/character';
import { 
  T20_OFFICIAL_PROGRESSION, 
  getTier, 
  getTierName, 
  T20Tier 
} from '../data/t20ProgressionMatrix';
import { T20_CLASS_POWERS, T20ClassPower } from '../data/t20ClassPowers';
import { T20_POWERS } from '../data/t20Powers';
import { T20Power } from '../types/powers';
import { T20_SPELLS } from '../data/t20Spells';
import { T20Spell } from '../types/spells';
import { 
  normalizeCharacterSheet, 
  NormalizedSheetData, 
  calcMod, 
  getHalfLevel, 
  getTrainingBonus, 
  getMaxSpellCircle,
  formatMod
} from '../utils/sheetCalculations';
import { 
  getAttributeBoostStatus, 
  checkPowerPrerequisites,
  AttributeBoostStatus
} from './characterEvolutionService';

export interface ManualPowerChoice {
  id: string;
  name: string;
  type: string; // 'classe' | 'geral' | 'personalizado'
  description: string;
  source?: string;
  prerequisites?: string;
}

export interface ManualAbilityChoice {
  id: string;
  name: string;
  description: string;
  source: string; // 'Classe' | 'Raça' | 'Origem' | 'Divindade' | 'Mestre' | 'Outro'
  level: number;
}

export interface ManualSpellChoice {
  id: string;
  name: string;
  circle: number;
  school: string;
  cost: number;
  description: string;
  range?: string;
  duration?: string;
  type?: 'arcana' | 'divina' | 'universal';
}

export interface ManualLevelUpDraft {
  chosenAttribute?: Attribute;
  selectedPowers: ManualPowerChoice[];
  addedAbilities: ManualAbilityChoice[];
  selectedSpells: ManualSpellChoice[];
}

export interface ManualEvolutionHistoryEntry {
  id: string;
  date: string;
  previousLevel: number;
  newLevel: number;
  method: 'MANUAL';
  player: string;
  chosenAttribute?: Attribute | null;
  attributeChanges: string[];
  powersAdded: string[];
  abilitiesAdded: string[];
  spellsAdded: string[];
  calculatedValues: {
    pvMax: number;
    pvGain: number;
    pmMax: number;
    pmGain: number;
    halfLevel: number;
    defense: number;
    spellDC: number;
  };
}

export interface ManualLevelUpState {
  currentLevel: number;
  nextLevel: number;
  className: string;
  classId: string;
  currentTier: T20Tier;
  nextTier: T20Tier;
  tierName: string;
  isMaxLevel: boolean;

  // Status de Aumento de Atributo oficial
  attributeBoosts: Record<Attribute, AttributeBoostStatus>;

  // Poderes disponíveis
  availableClassPowers: Array<{ power: T20ClassPower; isAvailable: boolean; reason?: string }>;
  availableGeneralPowers: Array<{ power: T20Power; isAvailable: boolean; reason?: string }>;

  // Habilidades automáticas de classe do nível
  automaticClassAbilities: Array<{ name: string; description: string; level: number }>;

  // Conjurador & Magias
  isSpellcaster: boolean;
  maxSpellCircle: number;
  availableOfficialSpells: T20Spell[];
}

/**
 * Prepara o estado inicial e opções disponíveis para a evolução manual
 */
export const getManualLevelUpState = (rawCharacter: any): ManualLevelUpState | null => {
  if (!rawCharacter) return null;

  const currentLevel = Number(rawCharacter.level || rawCharacter.characterData?.identity?.level || 1);
  const nextLevel = currentLevel + 1;
  if (nextLevel > 20) return null;

  const classId = (rawCharacter.classId || rawCharacter.characterData?.identity?.classId || 'guerreiro').toLowerCase();
  const classProgression = T20_OFFICIAL_PROGRESSION[classId] || T20_OFFICIAL_PROGRESSION.guerreiro;

  const currentTier = getTier(currentLevel);
  const nextTier = getTier(nextLevel);
  const tierName = getTierName(nextTier);

  // Status de aumento de atributo (regra por patamar de T20 JdA)
  const attributeBoosts = getAttributeBoostStatus(rawCharacter, nextLevel);

  // Poderes de classe disponíveis
  const availableClassPowers = T20_CLASS_POWERS
    .filter(p => p.classId === classId)
    .map(p => {
      const check = checkPowerPrerequisites(p, rawCharacter, nextLevel);
      return { power: p, isAvailable: check.met, reason: check.reason };
    });

  // Poderes gerais disponíveis
  const availableGeneralPowers = T20_POWERS
    .map(p => {
      const check = checkPowerPrerequisites(p, rawCharacter, nextLevel);
      return { power: p, isAvailable: check.met, reason: check.reason };
    });

  // Habilidades automáticas de classe concedidas neste nível
  const levelData = classProgression.levels?.[nextLevel];
  const automaticClassAbilities = (levelData?.automaticAbilities || []).map(ab => ({
    name: ab.name,
    description: ab.description,
    level: nextLevel
  }));

  // Magias
  const maxSpellCircle = getMaxSpellCircle(classId, nextLevel);
  const isSpellcaster = maxSpellCircle > 0;
  const availableOfficialSpells = isSpellcaster 
    ? T20_SPELLS.filter(s => Number(s.circle || 1) <= maxSpellCircle)
    : [];

  return {
    currentLevel,
    nextLevel,
    className: classProgression.name,
    classId,
    currentTier,
    nextTier,
    tierName,
    isMaxLevel: nextLevel >= 20,
    attributeBoosts,
    availableClassPowers,
    availableGeneralPowers,
    automaticClassAbilities,
    isSpellcaster,
    maxSpellCircle,
    availableOfficialSpells
  };
};

/**
 * Constrói uma simulação do personagem com as escolhas manuais
 * e executa normalizeCharacterSheet para obter os valores derivados 100% calculados.
 */
export const simulateManualEvolution = (
  rawCharacter: any,
  draft: ManualLevelUpDraft
): {
  currentSheet: NormalizedSheetData;
  nextSheet: NormalizedSheetData;
  simulatedRaw: any;
} => {
  const currentSheet = normalizeCharacterSheet(rawCharacter);
  const nextLevel = Math.min(20, currentSheet.level + 1);

  // Cópia profunda para simulação
  const simulatedRaw = JSON.parse(JSON.stringify(rawCharacter));

  // 1. Atualiza o nível
  simulatedRaw.level = nextLevel;
  if (simulatedRaw.characterData?.identity) {
    simulatedRaw.characterData.identity.level = nextLevel;
  }

  // 2. Se escolheu aumento de atributo, incrementa +1 (T20 JdA)
  if (!simulatedRaw.attributes) {
    simulatedRaw.attributes = { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 };
  }
  if (draft.chosenAttribute) {
    const attr = draft.chosenAttribute;
    const currentVal = calcMod(Number(simulatedRaw.attributes[attr] ?? 0));
    simulatedRaw.attributes[attr] = currentVal + 1;
  }

  // 3. Adiciona habilidades (automáticas de classe + poderes selecionados + habilidades registradas)
  if (!Array.isArray(simulatedRaw.abilities)) {
    simulatedRaw.abilities = Array.isArray(simulatedRaw.powers) ? [...simulatedRaw.powers] : [];
  }

  // Registro de Aumento de Atributo se houver
  if (draft.chosenAttribute) {
    const attr = draft.chosenAttribute;
    simulatedRaw.abilities.push({
      id: `attr_boost_${nextLevel}_${attr}`,
      name: `Aumento de Atributo (+1 ${attr})`,
      type: 'Poder Geral',
      description: `Aumento de +1 no atributo ${attr} escolhido na evolução manual do nível ${nextLevel}.`,
      level: nextLevel,
      attributeKey: attr
    });
  }

  // Poderes escolhidos
  draft.selectedPowers.forEach(power => {
    simulatedRaw.abilities.push({
      id: power.id || `power_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: power.name,
      type: power.type || 'Poder',
      description: power.description,
      source: power.source || 'Evolução Manual',
      level: nextLevel
    });
  });

  // Habilidades manuais adicionadas
  draft.addedAbilities.forEach(ab => {
    simulatedRaw.abilities.push({
      id: ab.id || `ability_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: ab.name,
      type: 'Habilidade',
      description: ab.description,
      source: ab.source || 'Evolução Manual',
      level: ab.level || nextLevel
    });
  });

  // 4. Adiciona magias escolhidas
  if (!Array.isArray(simulatedRaw.spells)) {
    simulatedRaw.spells = [];
  }
  draft.selectedSpells.forEach(spell => {
    simulatedRaw.spells.push({
      id: spell.id || `spell_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: spell.name,
      circle: spell.circle,
      level: spell.circle,
      cost: spell.cost,
      school: spell.school,
      description: spell.description,
      range: spell.range || '',
      duration: spell.duration || '',
      type: spell.type || 'arcana'
    });
  });

  // 5. XP excedente é rigorosamente preservado (não é zerado nem diminuído)
  const xpTotal = Number(rawCharacter.xpTotal ?? rawCharacter.xp ?? 0);
  simulatedRaw.xpTotal = xpTotal;
  simulatedRaw.xp = xpTotal;

  // 6. PV e PM atuais são preservados (aumentar o máximo não cura automaticamente)
  simulatedRaw.currentPV = currentSheet.currentPV;
  simulatedRaw.currentPM = currentSheet.currentPM;

  // 7. Roda o motor oficial da ficha para derivar todos os valores
  const nextSheet = normalizeCharacterSheet(simulatedRaw);

  return {
    currentSheet,
    nextSheet,
    simulatedRaw
  };
};

/**
 * Aplica a transação final de Level Up Manual ao personagem.
 * Retorna o objeto pronto para salvar no Firestore e a entrada de histórico.
 */
export const finalizeManualEvolution = (
  rawCharacter: any,
  draft: ManualLevelUpDraft,
  playerName?: string
): {
  updatedCharacter: any;
  historyEntry: ManualEvolutionHistoryEntry;
} => {
  const { currentSheet, nextSheet, simulatedRaw } = simulateManualEvolution(rawCharacter, draft);

  const previousLevel = currentSheet.level;
  const newLevel = nextSheet.level;

  // Monta registro detalhado de histórico da evolução
  const historyEntry: ManualEvolutionHistoryEntry = {
    id: `evo_manual_${newLevel}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    date: new Date().toISOString(),
    previousLevel,
    newLevel,
    method: 'MANUAL',
    player: playerName || rawCharacter.playerName || 'Jogador',
    chosenAttribute: draft.chosenAttribute || null,
    attributeChanges: draft.chosenAttribute 
      ? [`${draft.chosenAttribute} ${formatMod(currentSheet.attributes[draft.chosenAttribute])} → ${formatMod(nextSheet.attributes[draft.chosenAttribute])}`] 
      : [],
    powersAdded: draft.selectedPowers.map(p => p.name),
    abilitiesAdded: draft.addedAbilities.map(a => a.name),
    spellsAdded: draft.selectedSpells.map(s => `${s.name} (${s.circle}º Círculo)`),
    calculatedValues: {
      pvMax: nextSheet.maxPV,
      pvGain: nextSheet.maxPV - currentSheet.maxPV,
      pmMax: nextSheet.maxPM,
      pmGain: nextSheet.maxPM - currentSheet.maxPM,
      halfLevel: getHalfLevel(newLevel),
      defense: nextSheet.defense,
      spellDC: nextSheet.spellDC
    }
  };

  // Garante a persistência do histórico no documento
  if (!Array.isArray(simulatedRaw.evolutionHistory)) {
    simulatedRaw.evolutionHistory = [];
  }
  simulatedRaw.evolutionHistory.push(historyEntry);

  // Também registra em levelUpHistory para compatibilidade retroativa com views legadas
  if (!Array.isArray(simulatedRaw.levelUpHistory)) {
    simulatedRaw.levelUpHistory = [];
  }
  simulatedRaw.levelUpHistory.push({
    level: newLevel,
    date: historyEntry.date,
    tier: getTier(newLevel),
    pvGain: historyEntry.calculatedValues.pvGain,
    pmGain: historyEntry.calculatedValues.pmGain,
    automaticAbilities: [],
    choice: {
      type: draft.chosenAttribute ? 'attribute' : 'power',
      name: draft.chosenAttribute 
        ? `Aumento de Atributo (+1 ${draft.chosenAttribute})` 
        : (draft.selectedPowers[0]?.name || 'Evolução Manual'),
      description: 'Evolução realizada pelo Modo Manual de Level Up.',
      attributeKey: draft.chosenAttribute
    }
  });

  return {
    updatedCharacter: simulatedRaw,
    historyEntry
  };
};
