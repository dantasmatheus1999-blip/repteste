export type SpellType = 'arcana' | 'divina' | 'universal';

export type SpellSchool = 
  | 'Abjuração' 
  | 'Adivinhação' 
  | 'Convocação' 
  | 'Encantamento' 
  | 'Evocação' 
  | 'Ilusão' 
  | 'Necromancia' 
  | 'Transmutação'
  | 'Universal';

export interface T20Spell {
  id: string;
  name: string;
  type: SpellType;
  circle: number;
  school: SpellSchool;
  execution: string;
  range: string;
  target?: string;
  area?: string;
  effect?: string;
  duration: string;
  resistance?: string;
  description: string;
  truque?: string;
  aprimoramentos?: string[];
  source?: string;
}
