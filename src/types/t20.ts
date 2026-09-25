export interface T20Character {
  name: string;
  level: number;
  classId: string;
  attributes: {
    FOR: number;
    DES: number;
    CON: number;
    INT: number;
    SAB: number;
    CAR: number;
  };
  attrBonus: {
    FOR: number;
    DES: number;
    CON: number;
    INT: number;
    SAB: number;
    CAR: number;
  };
  currentPV: number;
  currentPM: number;
  skills: Record<string, { 
    trained: boolean; 
    extra: number; 
    others: number;
    attrOverride?: string;
  }>;
  attacks: {
    id: string;
    name: string;
    attr: string;
    damage: string;
    crit: string;
    type: string;
  }[];
  inventory: {
    id: string;
    name: string;
    weight: number;
    type: string;
    equipped: boolean;
    bonus?: number;
  }[];
  spells: {
    id: string;
    name: string;
    level: number;
    cost: number;
    school: string;
  }[];
  abilities: {
    id: string;
    name: string;
    type: string;
  }[];
  notes: string;
  money: number;
  xp?: number;
  xpTotal?: number;
  xpCurrent?: number;
  xpToNextLevel?: number;
  canLevelUp?: boolean;
  xpHistory?: any[];
  imageUrl?: string;
  avatarUrl?: string;
  raceId?: string;
  raceName?: string;
  race?: string;
  className?: string;
  origin?: string;
  uid?: string;
  createdAt?: any;
  updatedAt?: any;
  characterData?: any; // Automated character data structure
}

export interface T20Class {
  id: string;
  name: string;
  pvBase: number;
  pvPerLevel: number;
  pmBase: number;
  pmPerLevel: number;
  mainAttr: string;
}
