export type RPGSystem = 'T20' | 'DND5E';

export interface Character {
  id: string;
  name: string;
  system: RPGSystem;
  level: number;
  portrait?: string;
  stats: Record<string, number>;
  currentHP: number;
  maxHP: number;
  currentMP?: number;
  maxMP?: number;
  inventory: Item[];
  createdAt: number;
}

export interface Item {
  id: string;
  name: string;
  weight: number;
  quantity: number;
  description: string;
  equipped: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  system: RPGSystem;
  masterId: string;
  description: string;
  characterIds: string[];
}

export interface DieRoll {
  id: string;
  formula: string;
  result: number;
  details: string;
  timestamp: number;
  userId: string;
}

export * from './game';
