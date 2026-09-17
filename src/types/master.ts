import { Timestamp } from 'firebase/firestore';

export type CampaignStatus = 'active' | 'paused' | 'finished' | 'archived';
export type CampaignVisibility = 'private' | 'shared';
export type NarrativeTone = 'heroico' | 'sombrio' | 'político' | 'épico' | 'exploração' | 'investigação' | 'sobrevivência' | 'guerra' | 'humor' | 'mistério';
export type NPCAttitude = 'friendly' | 'neutral' | 'hostile';
export type NPCRole = 'Aliado' | 'Inimigo' | 'Neutro' | 'Comerciante' | 'Guarda' | 'Nobre' | 'Camponês' | 'Aventureiro' | 'Mago' | 'Clérigo' | 'Ladino' | 'Guerreiro' | 'Taberneiro';
export type LocationType = 'city' | 'dungeon' | 'wilderness' | 'building' | 'other' | 'Cidade' | 'Masmorra' | 'Floresta' | 'Taverna' | 'Templo' | 'Ruínas' | 'Castelo' | 'Caverna' | 'Vila' | 'Estrada';
export type EncounterDifficulty = 'Fácil' | 'Média' | 'Difícil' | 'Mortal';
export type EncounterType = 'Combate' | 'Social' | 'Exploração' | 'Puzzle';

export interface Campaign {
  id: string;
  masterId: string;

  identity: {
    name: string;
    subtitle?: string;
    shortDescription: string;
    fullDescription: string;
    system: string;
    setting: string;
    narrativeTone: NarrativeTone;
    coverUrl?: string;
    bannerUrl?: string;
  };

  status: {
    state: CampaignStatus;
    visibility: CampaignVisibility;
    isFavorite: boolean;
    createdAt: any;
    updatedAt: any;
    lastSessionAt?: any;
    nextSessionAt?: any;
  };

  settings: {
    acceptsPlayers: boolean;
    playerLimit?: number;
    quickSessionMode: boolean;
    allowCharacterLinking: boolean;
    showAutomaticSummary: boolean;
  };

  narrative: {
    premise: string;
    mainObjective: string;
    centralConflicts: string[];
    themes: string[];
    factions: string[];
    relevantDeities: string[];
    importantRegions: string[];
    centralDangers: string[];
    narrativeNotes: string;
  };

  progress: {
    averageGroupLevel?: number;
    totalSessions: number;
    totalPlayers: number;
    totalCharacters: number;
    totalNPCs: number;
    totalLocations: number;
    totalEncounters: number;
    totalNotes: number;
    lastSummary: string;
    importantMilestones: string[];
  };

  relations: {
    playerIds: string[];
    characterIds: string[];
    sessionIds: string[];
    npcIds: string[];
    locationIds: string[];
    encounterIds: string[];
    noteIds: string[];
  };

  organization: {
    tags: string[];
    themeColor?: string;
    icon?: string;
    customOrder?: number;
  };
}

export interface Milestone {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  type: 'battle' | 'death' | 'discovery' | 'alliance' | 'evolution' | 'twist' | 'arc_conclusion' | 'political' | 'achievement';
  date: any;
  relatedSessionId?: string;
  isHighlighted: boolean;
  createdAt: any;
}

export interface Session {
  id: string;
  campaignId: string;
  number: number;
  title: string;
  date: any;
  summary: string;
  xpAwarded: number;
  lootAwarded: string;
  masterNotes: string;
  playerNotes: string;
  npcIds: string[];
  locationIds: string[];
  encounterIds: string[];
  isCompleted: boolean;
}

export interface MonsterAction {
  name: string;
  description: string;
  type?: string;
  bonus?: number;
  damage?: string;
  critical?: string;
  range?: string;
  damageType?: string;
  observations?: string;
}

export type CombatRole = 'solo' | 'lacaio' | 'especial';
export type CombatStyle = 'marcial' | 'atirador' | 'conjurador' | 'tatico';
export type RealmorScale = 'normal' | 'elite' | 'chefe';

export interface MonsterAbility {
  name: string;
  description: string;
  type?: string;
  cooldown?: string;
  cost?: string;
  range?: string;
  condition?: string;
  duration?: string;
  observations?: string;
}

export interface MonsterSpellEntry {
  id: string;
  name: string;
  circle: number;
  costPM: number;
  type: 'arcana' | 'divina' | 'universal' | 'simulada';
  school: string;
  execution: string;
  range: string;
  targetOrArea: string;
  duration: string;
  resistance?: string;
  description: string;
  dcFormatted?: string;
}

export interface BossResourceEntry {
  title: string;
  category: 'acao_lendaria' | 'reacao' | 'segunda_fase' | 'resiliencia' | 'recarga';
  tag: string;
  description: string;
  trigger?: string;
  frequency?: string;
}

export interface NPC {
  id: string;
  masterId: string;
  campaignId: string;
  name: string;
  race: string;
  role: string;
  combatRole?: 'solo' | 'lacaio' | 'especial';
  combatStyle?: 'marcial' | 'atirador' | 'conjurador' | 'tatico';
  realmorScale?: 'normal' | 'elite' | 'chefe';
  description: string;
  personality: string;
  ideals: string;
  bonds: string;
  flaws: string;
  attitude: NPCAttitude;
  isFavorite: boolean;
  isImportant: boolean;
  imageUrl?: string;
  visualPrompt?: string;
  category?: 'npc' | 'monster';
  nd?: string;
  rank?: string;
  size?: string;
  subtype?: string;
  theme?: string;
  origin?: string;
  environment?: string;
  organization?: string;
  tags?: string[];
  senses?: string;
  initiative?: number;
  speed?: string;
  perception?: number;
  resistances?: string;
  immunities?: string;
  vulnerabilities?: string;
  weaknesses?: string[];
  advantages?: string[];
  treasure?: string;
  lore?: string;
  behavior?: string;
  masterNotes?: string;
  stats?: {
    hp: number;
    mp: number;
    ac: number;
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  actions?: MonsterAction[];
  abilities?: MonsterAbility[];
  spells?: MonsterSpellEntry[];
  bossResources?: BossResourceEntry[];
  specialActions?: string[];
  manaPoints?: number;
  saveDC?: number;
  fortitude?: number;
  reflexes?: number;
  will?: number;
  targetDamage?: number;
  tableReference?: any;
  auditLog?: any;
  validation?: any;
  tactics?: string;
  combatProfile?: { name: string; description: string };
  synergy?: { name: string; description?: string; effect: string };
  synergies?: {
    name: string;
    condition?: string;
    effect: string;
    target?: string;
    type?: string;
    observations?: string;
  }[];
  updatedAt: any;
}

export interface Location {
  id: string;
  masterId: string;
  campaignId: string;
  name: string;
  type: LocationType;
  description: string;
  history?: string;
  imageUrl?: string;
  isSecret?: boolean;
  npcIds: string[];
  events?: string;
  perils?: string;
  rewards?: string;
  masterObservations?: string;
  updatedAt?: any;
}

export interface Encounter {
  id: string;
  masterId: string;
  campaignId: string;
  title: string;
  description: string;
  difficulty: EncounterDifficulty;
  type: EncounterType;
  monsters?: string[];
  rewards?: {
    xp: number;
    loot: string[];
  };
  isSecret?: boolean;
  notes?: string;
  participants: EncounterParticipant[];
  currentTurn: number;
  isActive: boolean;
  history?: string;
  observations?: string;
  updatedAt?: any;
}

export interface EncounterParticipant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'enemy';
  initiative: number;
  currentHP: number;
  maxHP: number;
  status: string[];
}

export interface MasterNote {
  id: string;
  masterId: string;
  campaignId?: string;
  sessionId?: string;
  npcId?: string;
  locationId?: string;
  enounterId?: string;
  title: string;
  content: string;
  category: string;
  isSecret: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: any;
  updatedAt: any;
}

export interface MasterRoll {
  id: string;
  masterId: string;
  formula: string;
  result: number;
  details: string;
  isSecret: boolean;
  timestamp: Timestamp | Date;
}

export interface CampaignPlayer {
  id: string;
  campaignId: string;
  name: string;
  characterId?: string;
  status: string;
  masterObservations: string;
  roleAtTable: string;
}
