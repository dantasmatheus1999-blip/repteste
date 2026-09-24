export type Attribute = 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';

export interface Attributes {
  FOR: number;
  DES: number;
  CON: number;
  INT: number;
  SAB: number;
  CAR: number;
}

export interface Modifier {
  id: string;
  name: string;
  source: string;
  target: string; // e.g., 'attribute.FOR', 'defesa', 'pericia.luta'
  type: 'bonus' | 'penalidade' | 'substituicao' | 'multiplicador';
  value: number;
  condition?: string;
  isCumulative?: boolean;
  isActive: boolean;
}

export interface CharacterIdentity {
  name: string;
  raceId: string;
  originId: string;
  classId: string;
  level: number;
}

export interface CharacterChoices {
  trainedSkills: string[];
  powers: string[];
  spells: string[];
  equipment: {
    mainWeaponId?: string;
    secondaryWeaponId?: string;
    armorId?: string;
    shieldId?: string;
    accessories: string[];
  };
}

export interface CharacterState {
  currentPV: number;
  currentPM: number;
  conditions: string[];
  buffs: Modifier[];
  debuffs: Modifier[];
}

export interface CharacterData {
  identity: CharacterIdentity;
  baseAttributes: Attributes;
  choices: CharacterChoices;
  state: CharacterState;
}

export interface CalculatedValue {
  total: number;
  base: number;
  modifiers: {
    source: string;
    value: number;
    name: string;
  }[];
}

export interface FichaCompleta {
  identity: CharacterIdentity;
  attributes: Record<Attribute, CalculatedValue>;
  resources: {
    pvMax: CalculatedValue;
    pvCurrent: number;
    pmMax: CalculatedValue;
    pmCurrent: number;
  };
  combat: {
    defense: CalculatedValue;
    initiative: CalculatedValue;
    movement: CalculatedValue;
    attacks: {
      name: string;
      attackBonus: CalculatedValue;
      damage: CalculatedValue;
      crit: string;
      range: string;
      type: string;
    }[];
  };
  skills: Record<string, CalculatedValue & { trained: boolean; attribute: Attribute }>;
  resistances: {
    fortitude: CalculatedValue;
    reflexos: CalculatedValue;
    vontade: CalculatedValue;
  };
  spells: {
    cd: CalculatedValue;
    list: any[]; // To be populated from t20Spells
  };
  powers: any[]; // To be populated from t20Powers
  inventory: any[]; // To be populated from t20Equipment
}

export interface CharacterAttack {
  id: string;
  name: string;
  attackTest: string;
  damage: string;
  crit: string;
  type: string;
  range: string;
}

export interface CharacterItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  type?: string;
  equipped?: boolean;
}

export interface CharacterPower {
  id: string;
  name: string;
  type?: string;
  description: string;
  source?: string;
}

export interface CharacterSpell {
  id: string;
  name: string;
  circle: number;
  school: string;
  type: 'arcana' | 'divina' | 'universal';
  cost?: number;
  description?: string;
  range?: string;
  duration?: string;
}

export interface CharacterSkill {
  id: string;
  name: string;
  attr: Attribute;
  trained: boolean;
  total: number;
  attrMod: number;
  halfLevel: number;
  trainingBonus: number;
  others?: number;
}

export interface UnifiedCharacter {
  id?: string;
  uid: string;
  ownerId: string;
  name: string;
  playerName: string;
  imageUrl?: string;
  avatarType?: '2d' | '3d';
  avatarId?: string;
  avatarModelPath?: string;

  raceId: string;
  raceName: string;
  originId: string;
  originName: string;
  classId: string;
  className: string;
  level: number;

  attributes: {
    FOR: number;
    DES: number;
    CON: number;
    INT: number;
    SAB: number;
    CAR: number;
  };
  attrModifiers: {
    FOR: number;
    DES: number;
    CON: number;
    INT: number;
    SAB: number;
    CAR: number;
  };

  hp: number;
  hpMax: number;
  mana: number;
  manaMax: number;

  defense: number;
  armor: {
    id?: string;
    name: string;
    defenseBonus: number;
    penalty: number;
    type?: 'leve' | 'pesada' | 'nenhuma';
  };
  shield: {
    id?: string;
    name: string;
    defenseBonus: number;
    penalty: number;
  };
  size: string;
  movement: string;

  skills: CharacterSkill[];
  attacks: CharacterAttack[];
  equipment: CharacterItem[];
  powers: CharacterPower[];
  spells: CharacterSpell[];

  history: string;
  xp: number;
  xpTotal?: number;
  xpCurrent?: number;
  xpToNextLevel?: number;
  canLevelUp?: boolean;
  xpHistory?: XpHistoryEntry[];

  // Compatibility fields for legacy and list views
  currentPV?: number;
  currentPM?: number;
  attrBonus?: Record<Attribute, number>;
  characterData?: any;

  createdAt?: any;
  updatedAt?: any;
}

export interface XpHistoryEntry {
  id: string;
  characterId: string;
  characterName: string;
  amount: number;
  previousXp: number;
  newXp: number;
  reason?: string;
  createdAt: any;
  createdBy: string;
  masterName?: string;
  campaignId?: string;
  sessionId?: string;
}

