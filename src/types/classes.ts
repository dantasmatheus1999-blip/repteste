import { LucideIcon, Sword, Wand2, Shield, Users, Zap, ScrollText, Skull, Heart, Star, Compass, Gem, Crown, Anchor } from 'lucide-react';

export type ClassCategory = 'combatente' | 'conjurador' | 'especialista' | 'suporte' | 'hibrido';
export type Difficulty = 'iniciante' | 'intermediario' | 'avancado';

export interface ClassPlaystyle {
  dano: number; // 1-5
  resistencia: number;
  suporte: number;
  magia: number;
  pericias: number;
  mobilidade: number;
  versatilidade: number;
  complexidade: number;
}

export interface ClassAbility {
  name: string;
  level: number;
  description: string;
  type: 'classe' | 'poder';
}

export interface ClassBuild {
  name: string;
  description: string;
  focus: string[];
}

export interface T20ClassDetail {
  id: string;
  slug: string;
  name: string;
  category: ClassCategory;
  role: string;
  difficulty: Difficulty;
  primaryAttributes: string[];
  secondaryAttributes: string[];
  summary: string;
  concept: string;
  playstyle: ClassPlaystyle;
  strengths: string[];
  weaknesses: string[];
  resources: {
    mana: string;
    combat: string;
    skills: string;
    utility: string;
  };
  progression: {
    level: number;
    gain: string;
  }[];
  abilities: ClassAbility[];
  builds: ClassBuild[];
  recommendedFor: Difficulty;
  tags: string[];
  iconName: string; // To map to Lucide icons
}
