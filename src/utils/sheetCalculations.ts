import { Attribute, CharacterSkill, XpHistoryEntry } from '../types/character';
import { T20Character } from '../types/t20';
import { T20_CLASSES, T20_SKILLS } from '../data/t20Data';
import { calculateXpProgress, CharacterXpProgress } from '../data/t20XpTable';

export const ATTRIBUTES_KEYS: Attribute[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

export const ATTRIBUTE_NAMES: Record<Attribute, string> = {
  FOR: 'Força',
  DES: 'Destreza',
  CON: 'Constituição',
  INT: 'Inteligência',
  SAB: 'Sabedoria',
  CAR: 'Carisma'
};

/**
 * Tormenta 20 — Edição Jogo do Ano (JdA):
 * O valor utilizado diretamente nas regras é o próprio modificador.
 * Ex: FOR +0, DES +2, INT +4.
 *
 * Esta função suporta retrocompatibilidade caso um valor de ficha legada antiga (>= 8)
 * seja fornecido isoladamente, convertendo-o de forma segura.
 */
export const calcMod = (scoreOrMod: number): number => {
  const n = Number(scoreOrMod ?? 0);
  // Se for valor clássico do sistema antigo (ex: 8, 10, 12, 14, 18), converte
  if (n >= 8) {
    return Math.floor((n - 10) / 2);
  }
  return n;
};

/**
 * Normaliza os atributos para o padrão oficial Tormenta 20 Jogo do Ano (JdA).
 * Detecta se os dados vieram no formato legado antigo (valores 8-24)
 * e os converte com segurança para modificadores diretos (-2 a +8).
 */
export const normalizeJdaAttributes = (source: any): Record<Attribute, number> => {
  const raw = source || {};
  const keys: Attribute[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
  const rawValues = keys.map(k => Number(raw[k] ?? 0));

  // Heurística segura: no sistema antigo quase todos os atributos eram >= 8 (8, 10, 12, 14, etc.)
  // No JdA, os atributos iniciais variam de -2 a +5.
  const legacyCount = rawValues.filter(v => v >= 8).length;
  const hasVeryHigh = rawValues.some(v => v >= 13);
  const isLegacy = legacyCount >= 3 || hasVeryHigh;

  const result: Record<Attribute, number> = {
    FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0
  };

  keys.forEach(k => {
    const val = Number(raw[k] ?? (isLegacy ? 10 : 0));
    result[k] = isLegacy ? Math.floor((val - 10) / 2) : val;
  });

  return result;
};

export const formatMod = (mod: number): string => {
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const getHalfLevel = (level: number): number => {
  return Math.floor(Math.max(1, level || 1) / 2);
};

export const getMaxSpellCircle = (classId: string, level: number): number => {
  const cid = (classId || '').toLowerCase();
  if (['arcanista', 'clerigo', 'druida'].includes(cid)) {
    if (level >= 17) return 5;
    if (level >= 13) return 4;
    if (level >= 9) return 3;
    if (level >= 5) return 2;
    return 1;
  }
  if (cid === 'bardo') {
    if (level >= 14) return 4;
    if (level >= 10) return 3;
    if (level >= 6) return 2;
    return 1;
  }
  return 0; // Classes não conjuradoras
};

export const getTrainingBonus = (level: number): number => {
  const lvl = Math.max(1, level || 1);
  if (lvl >= 15) return 6;
  if (lvl >= 7) return 4;
  return 2;
};

export interface NormalizedSheetData {
  id: string;
  name: string;
  playerName: string;
  imageUrl: string;
  level: number;
  classId: string;
  className: string;
  raceId: string;
  raceName: string;
  originId: string;
  originName: string;
  deity: string;
  age: string;
  gender: string;
  size: string;
  movement: string;

  // Resources
  currentPV: number;
  maxPV: number;
  tempPV: number;
  currentPM: number;
  maxPM: number;

  // Combat
  defense: number;
  initiative: number;
  resistances: {
    fortitude: number;
    reflexos: number;
    vontade: number;
  };
  spellDC: number;

  // Attributes
  attributes: Record<Attribute, number>;
  attrModifiers: Record<Attribute, number>;

  // Skills
  skills: Array<{
    id: string;
    name: string;
    attr: Attribute;
    trained: boolean;
    total: number;
    attrMod: number;
    halfLevel: number;
    trainingBonus: number;
    others: number;
    onlyTrained?: boolean;
    armorPenalty?: number;
  }>;

  // Combat items & lists
  attacks: Array<{
    id: string;
    name: string;
    attackBonus: number;
    damage: string;
    crit: string;
    type: string;
    range: string;
    attr?: string;
    ammo?: number;
  }>;

  inventory: Array<{
    id: string;
    name: string;
    quantity: number;
    weight: number;
    equipped?: boolean;
    type?: string;
    description?: string;
    bonus?: number;
  }>;

  powers: Array<{
    id: string;
    name: string;
    type?: string;
    description: string;
    desc?: string;
    source?: string;
  }>;

  spells: Array<{
    id: string;
    name: string;
    circle: number;
    level?: number;
    cost: number;
    school: string;
    range?: string;
    duration?: string;
    description?: string;
    desc?: string;
  }>;

  conditions: string[];
  money: number;
  notes: string;
  totalWeight: number;
  maxWeight: number;

  // XP & Progressão Oficial Tormenta20 JdA
  xp: number;
  xpTotal: number;
  xpCurrent: number;
  xpToNextLevel: number | null;
  canLevelUp: boolean;
  isMaxLevel: boolean;
  xpProgress: CharacterXpProgress;
  xpHistory: XpHistoryEntry[];
}

export const normalizeCharacterSheet = (raw: any, charId: string = ''): NormalizedSheetData => {
  const level = Number(raw?.level || raw?.characterData?.identity?.level || 1);
  const classId = (raw?.classId || raw?.characterData?.identity?.classId || 'guerreiro').toLowerCase();
  const classDef = T20_CLASSES[classId as keyof typeof T20_CLASSES] || T20_CLASSES.guerreiro;
  const className = raw?.className || classDef.name;
  
  const raceId = raw?.raceId || raw?.characterData?.identity?.raceId || 'humano';
  const raceName = raw?.raceName || (raceId.charAt(0).toUpperCase() + raceId.slice(1));
  const originId = raw?.originId || raw?.characterData?.identity?.originId || '';
  const originName = raw?.originName || '';
  const deity = raw?.deity || raw?.deityName || '';

  // Attributes normalization (Tormenta 20 Edição Jogo do Ano: o próprio atributo é o modificador)
  const baseAttrs = raw?.attributes || raw?.characterData?.baseAttributes || {
    FOR: 0,
    DES: 0,
    CON: 0,
    INT: 0,
    SAB: 0,
    CAR: 0
  };

  const attributes = normalizeJdaAttributes(baseAttrs);
  const attrModifiers: Record<Attribute, number> = { ...attributes };

  const halfLevel = getHalfLevel(level);
  const trainingBonus = getTrainingBonus(level);

  // Health and Mana calculations (Tormenta 20 official progression)
  const conMod = attrModifiers.CON;
  const pvGanhosNivel = Math.max(1, classDef.pvPerLevel + conMod) * (level - 1);
  const calculatedMaxPV = classDef.pvBase + conMod + Math.max(0, pvGanhosNivel);
  const calculatedMaxPM = classDef.pmBase + Math.max(0, classDef.pmPerLevel * (level - 1));

  // Modificadores adicionais de PV/PM (itens, poderes)
  const pvBonus = Number(raw?.pvBonus || 0);
  const pmBonus = Number(raw?.pmBonus || 0);

  const maxPV = calculatedMaxPV + pvBonus;
  const currentPV = raw?.currentPV !== undefined ? Math.min(maxPV, Number(raw.currentPV)) : maxPV;
  const tempPV = Number(raw?.tempPV || 0);

  const maxPM = calculatedMaxPM + pmBonus;
  const currentPM = raw?.currentPM !== undefined ? Math.min(maxPM, Number(raw.currentPM)) : maxPM;

  // Equipment & Defense
  const inventoryList = Array.isArray(raw?.inventory) ? raw.inventory : [];
  let armorBonus = 0;
  let shieldBonus = 0;
  let isHeavyArmor = raw?.armor?.type === 'pesada';
  let armorPenaltyTotal = Number(raw?.armorPenalty || 0);

  inventoryList.forEach((item: any) => {
    if (item.equipped) {
      if (item.type === 'armor') {
        armorBonus = Math.max(armorBonus, Number(item.bonus || item.defenseBonus || 0));
        if (item.armorType === 'pesada' || item.name?.toLowerCase().includes('pesada') || item.name?.toLowerCase().includes('placas')) {
          isHeavyArmor = true;
        }
        if (item.penalty) {
          armorPenaltyTotal += Number(item.penalty);
        }
      } else if (item.type === 'shield') {
        shieldBonus = Math.max(shieldBonus, Number(item.bonus || item.defenseBonus || 0));
        if (item.penalty) {
          armorPenaltyTotal += Number(item.penalty);
        }
      }
    }
  });

  if (raw?.armor?.defenseBonus) {
    armorBonus = Math.max(armorBonus, Number(raw.armor.defenseBonus));
  }
  if (raw?.shield?.defenseBonus) {
    shieldBonus = Math.max(shieldBonus, Number(raw.shield.defenseBonus));
  }

  const dexForDefense = isHeavyArmor ? 0 : attrModifiers.DES;
  const calculatedDefense = 10 + dexForDefense + armorBonus + shieldBonus;
  const defense = raw?.defense !== undefined ? Number(raw.defense) : calculatedDefense;

  // Movement
  let baseMovement = 9;
  if (isHeavyArmor) baseMovement = 6;
  const movement = raw?.movement ? String(raw.movement) : `${baseMovement}m`;

  // Skills
  const rawSkills = raw?.skills || {};
  const trainedSkillsList: string[] = Array.isArray(raw?.characterData?.choices?.trainedSkills) 
    ? raw.characterData.choices.trainedSkills 
    : [];

  const skills = T20_SKILLS.map(skillDef => {
    const skillKey = skillDef.id;
    const skillState = rawSkills[skillKey] || {};
    const isTrained = Boolean(
      skillState.trained || 
      trainedSkillsList.includes(skillKey) || 
      (Array.isArray(raw?.trainedSkills) && raw.trainedSkills.includes(skillKey))
    );
    const attrKey = (skillState.attrOverride || skillDef.attr) as Attribute;
    const attrMod = attrModifiers[attrKey] ?? 0;
    const extra = Number(skillState.extra || 0);
    const others = Number(skillState.others || 0);
    const trainVal = isTrained ? trainingBonus : 0;
    const total = halfLevel + attrMod + trainVal + extra + others;

    return {
      id: skillDef.id,
      name: skillDef.name,
      attr: attrKey,
      trained: isTrained,
      total,
      attrMod,
      halfLevel,
      trainingBonus: trainVal,
      others: extra + others,
      onlyTrained: Boolean((skillDef as any).onlyTrained || (skillDef as any).somenteTreinada),
      armorPenalty: (skillDef as any).armorPenalty ? (armorPenaltyTotal || 0) : 0
    };
  });

  // Initiative
  const iniciativaSkill = skills.find(s => s.id === 'iniciativa');
  const initiative = iniciativaSkill ? iniciativaSkill.total : (halfLevel + attrModifiers.DES);

  // Resistances
  const fortSkill = skills.find(s => s.id === 'fortitude');
  const refSkill = skills.find(s => s.id === 'reflexos');
  const vonSkill = skills.find(s => s.id === 'vontade');

  const resistances = {
    fortitude: fortSkill ? fortSkill.total : (halfLevel + attrModifiers.CON),
    reflexos: refSkill ? refSkill.total : (halfLevel + attrModifiers.DES),
    vontade: vonSkill ? vonSkill.total : (halfLevel + attrModifiers.SAB),
  };

  // Spell DC
  const mainAttrKey = (classDef.mainAttr || 'INT') as Attribute;
  const spellDC = 10 + halfLevel + (attrModifiers[mainAttrKey] ?? 0);

  // Attacks
  const rawAttacks = Array.isArray(raw?.attacks) ? raw.attacks : [];
  const attacks = rawAttacks.map((atk: any, idx: number) => {
    const isRanged = atk.type?.toLowerCase().includes('distância') || atk.range?.includes('m');
    const defaultAttr: Attribute = isRanged ? 'DES' : 'FOR';
    const usedAttr = (atk.attr || defaultAttr) as Attribute;
    const luchaOrPont = skills.find(s => s.id === (isRanged ? 'pontaria' : 'luta'));
    const defaultBonus = luchaOrPont ? luchaOrPont.total : (halfLevel + attrModifiers[usedAttr]);
    const bonus = atk.attackBonus !== undefined ? Number(atk.attackBonus) : defaultBonus;

    return {
      id: atk.id || String(idx + 1),
      name: atk.name || 'Ataque Desarmado',
      attackBonus: bonus,
      damage: atk.damage || '1d4',
      crit: atk.crit || 'x2',
      type: atk.type || 'Impacto',
      range: atk.range || (isRanged ? 'Médio' : 'Corpo a corpo'),
      attr: usedAttr,
      ammo: atk.ammo !== undefined ? Number(atk.ammo) : (atk.ammunition !== undefined ? Number(atk.ammunition) : undefined)
    };
  });

  // Inventory & Weight
  const inventory = inventoryList.map((item: any, idx: number) => ({
    id: item.id || String(idx + 1),
    name: item.name || 'Item',
    quantity: Number(item.quantity || 1),
    weight: Number(item.weight || 0),
    equipped: Boolean(item.equipped),
    type: item.type || 'item',
    description: item.description || '',
    bonus: item.bonus !== undefined ? Number(item.bonus) : undefined
  }));

  const totalWeight = inventory.reduce((acc: number, item: any) => acc + (item.weight * (item.quantity || 1)), 0);
  const maxWeight = Math.max(10, 10 + (2 * attrModifiers.FOR));

  // Powers and abilities
  const powersRaw = Array.isArray(raw?.abilities) 
    ? raw.abilities 
    : (Array.isArray(raw?.powers) ? raw.powers : []);
  const powers = powersRaw.map((p: any, idx: number) => ({
    id: p.id || String(idx + 1),
    name: p.name || 'Habilidade',
    type: p.type || 'Classe',
    description: p.description || p.desc || '',
    desc: p.description || p.desc || '',
    source: p.source || ''
  }));

  // Spells
  const spellsRaw = Array.isArray(raw?.spells) ? raw.spells : [];
  const spells = spellsRaw.map((s: any, idx: number) => ({
    id: s.id || String(idx + 1),
    name: s.name || 'Magia',
    circle: Number(s.circle || s.level || 1),
    level: Number(s.circle || s.level || 1),
    cost: Number(s.cost || s.pm || 1),
    school: s.school || 'Universal',
    range: s.range || '',
    duration: s.duration || '',
    description: s.description || s.desc || '',
    desc: s.description || s.desc || ''
  }));

  // Conditions
  const rawConditions = Array.isArray(raw?.conditions) 
    ? raw.conditions 
    : (Array.isArray(raw?.characterData?.state?.conditions) ? raw.characterData.state.conditions : []);
  const conditions = rawConditions.map((c: any) => typeof c === 'string' ? c : c?.id || c?.name).filter(Boolean);

  // XP & Progressão de Nível — Tormenta20 JdA
  const rawXp = Number(raw?.xp ?? raw?.xpTotal ?? raw?.xpCurrent ?? raw?.characterData?.identity?.xp ?? 0);
  const xpProgress = calculateXpProgress(rawXp, level);
  const xpHistory = Array.isArray(raw?.xpHistory) ? raw.xpHistory : [];

  return {
    id: charId || raw?.id || '',
    name: raw?.name || raw?.characterData?.identity?.name || 'Herói sem Nome',
    playerName: raw?.playerName || '',
    imageUrl: raw?.imageUrl || '',
    level,
    classId,
    className,
    raceId,
    raceName,
    originId,
    originName,
    deity,
    age: raw?.age ? String(raw.age) : '',
    gender: raw?.gender || '',
    size: raw?.size || 'Médio',
    movement,
    currentPV,
    maxPV,
    tempPV,
    currentPM,
    maxPM,
    defense,
    initiative,
    resistances,
    spellDC,
    attributes,
    attrModifiers,
    skills,
    attacks,
    inventory,
    powers,
    spells,
    conditions,
    money: Number(raw?.money ?? 10),
    notes: raw?.notes || raw?.history || '',
    totalWeight: Math.round(totalWeight * 10) / 10,
    maxWeight,
    xp: xpProgress.xpTotal,
    xpTotal: xpProgress.xpTotal,
    xpCurrent: xpProgress.xpInCurrentLevel,
    xpToNextLevel: xpProgress.xpNextLevelCeiling,
    canLevelUp: xpProgress.canLevelUp,
    isMaxLevel: xpProgress.isMaxLevel,
    xpProgress,
    xpHistory
  };
};
