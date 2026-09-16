
import { 
  ND_TABLE, 
  ROLE_MODIFIERS, 
  RANK_MODIFIERS, 
  MONSTER_NAMES, 
  MONSTER_ABILITIES, 
  MONSTER_TACTICS,
  MonsterRole,
  MonsterRank,
  CreatureType,
  MonsterStats
} from '../constants/monsterData';
import { AttackGeneratorService } from './attackGeneratorService';
import { MonsterEvolutionService } from './monsterEvolutionService';

export interface GeneratedMonster extends MonsterStats {
  id: string;
  name: string;
  type: CreatureType;
  nd: string;
  role: MonsterRole;
  rank: MonsterRank;
  description: string;
  attributes: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  speed: string;
  senses: string;
  attacks: string[];
  abilities: string[];
  specialActions?: string[]; // Prepared for future expansion (Legendary actions, etc.)
  tactics: string;
  environment: string;
  theme: string;
  // New Evolution Fields
  combatProfile?: {
    name: string;
    description: string;
  };
  weaknesses?: string[];
  advantages?: string[];
  synergy?: {
    name: string;
    description: string;
    effect: string;
  };
}

export const MonsterGeneratorService = {
  generate(params: {
    nd?: string;
    role?: MonsterRole;
    type?: CreatureType;
    rank?: MonsterRank;
    environment?: string;
    theme?: string;
  } = {}): GeneratedMonster {
    const nds = Object.keys(ND_TABLE);
    const roles: MonsterRole[] = ['bruto', 'emboscador', 'controlador', 'conjurador', 'tanque', 'especialista'];
    const types: CreatureType[] = ['animal', 'besta', 'construto', 'demônio', 'espírito', 'humanoide', 'monstro', 'morto-vivo', 'planta'];
    const ranks: MonsterRank[] = ['normal', 'elite', 'chefe'];
    const environments = ['floresta', 'pântano', 'montanha', 'caverna', 'ruínas', 'deserto', 'cidade', 'mar'];
    const themes = ['sombra', 'fogo', 'gelo', 'veneno', 'arcano', 'sagrado', 'profano', 'natureza', 'eletrico', 'terra'];

    const selectedNd = params.nd || nds[Math.floor(Math.random() * 5)]; // Default to low ND for quick gen
    const selectedRole = params.role || roles[Math.floor(Math.random() * roles.length)];
    const selectedType = params.type || types[Math.floor(Math.random() * types.length)];
    const selectedRank = params.rank || 'normal';
    const selectedEnvironment = params.environment || environments[Math.floor(Math.random() * environments.length)];
    const selectedTheme = params.theme || themes[Math.floor(Math.random() * themes.length)];

    const baseStats = ND_TABLE[selectedNd] || ND_TABLE['1'];
    const roleMods = ROLE_MODIFIERS[selectedRole];
    const rankMultiplier = RANK_MODIFIERS[selectedRank];

    // Calculate final stats
    const stats: MonsterStats = {
      hp: Math.floor(baseStats.hp * (roleMods.hp || 1) * rankMultiplier),
      defense: baseStats.defense + (roleMods.defense || 0) + (selectedRank === 'elite' ? 2 : selectedRank === 'chefe' ? 5 : 0),
      attack: baseStats.attack + (roleMods.attack || 0) + (selectedRank === 'elite' ? 2 : selectedRank === 'chefe' ? 5 : 0),
      damage: baseStats.damage, // Simplified
      saveDC: baseStats.saveDC + (roleMods.saveDC || 0) + (selectedRank === 'elite' ? 2 : selectedRank === 'chefe' ? 5 : 0),
      fortitude: baseStats.fortitude + (roleMods.fortitude || 0) + (selectedRank === 'elite' ? 2 : selectedRank === 'chefe' ? 5 : 0),
      reflexes: baseStats.reflexes + (roleMods.reflexes || 0) + (selectedRank === 'elite' ? 2 : selectedRank === 'chefe' ? 5 : 0),
      will: baseStats.will + (roleMods.will || 0) + (selectedRank === 'elite' ? 2 : selectedRank === 'chefe' ? 5 : 0),
    };

    // Generate Name
    const prefix = MONSTER_NAMES.prefixes[Math.floor(Math.random() * MONSTER_NAMES.prefixes.length)];
    const base = MONSTER_NAMES.bases[Math.floor(Math.random() * MONSTER_NAMES.bases.length)];
    const suffix = MONSTER_NAMES.suffixes[Math.floor(Math.random() * MONSTER_NAMES.suffixes.length)];
    const name = `${prefix} ${base} ${suffix}`;

    // Attributes (Coherent distribution based on role, rank and ND)
    const attributes = this.generateAttributes({
      nd: selectedNd,
      role: selectedRole,
      type: selectedType,
      rank: selectedRank
    });

    // Abilities
    const roleAbilities = MONSTER_ABILITIES[selectedRole];
    const selectedAbilities = [...roleAbilities].sort(() => 0.5 - Math.random()).slice(0, selectedRank === 'normal' ? 1 : selectedRank === 'elite' ? 2 : 3);

    // Generate Attacks using the new system
    const generatedAttacks = AttackGeneratorService.generateAttacks({
      nd: selectedNd,
      role: selectedRole,
      rank: selectedRank,
      attackBonus: stats.attack,
      damage: stats.damage,
      saveDC: stats.saveDC
    });

    const monster: GeneratedMonster = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type: selectedType,
      nd: selectedNd,
      role: selectedRole,
      rank: selectedRank,
      description: `Uma criatura ${selectedTheme} que habita em ${selectedEnvironment}.`,
      ...stats,
      attributes,
      speed: '9m',
      senses: 'Visão na penumbra',
      attacks: generatedAttacks,
      abilities: selectedAbilities,
      tactics: MONSTER_TACTICS[selectedRole],
      environment: selectedEnvironment,
      theme: selectedTheme
    };

    return MonsterEvolutionService.evolve(monster);
  },

  generateAttributes(params: {
    nd: string;
    role: MonsterRole;
    type: CreatureType;
    rank: MonsterRank;
  }): { str: number; dex: number; con: number; int: number; wis: number; cha: number } {
    const { nd, role, type, rank } = params;
    
    // 1. Calculate Base Budget based on ND
    const ndNum = nd.includes('/') ? (nd === '1/4' ? 0.25 : 0.5) : parseInt(nd);
    
    // T20 attributes scale roughly with ND. 
    // A normal creature has a total modifier sum of around ND + 2.
    let totalPoints = Math.floor(ndNum * 1.2) + 4;
    
    // Rank bonus
    if (rank === 'elite') totalPoints += 4;
    if (rank === 'chefe') totalPoints += 8;

    // 2. Select Profile Template
    let profile = 'TÁTICO';
    if (role === 'bruto') profile = 'BRUTO';
    else if (role === 'tanque') profile = 'TANQUE';
    else if (role === 'conjurador') profile = 'ARCANO';
    else if (role === 'emboscador') profile = 'ÁGIL';
    else if (role === 'controlador') profile = 'TÁTICO';
    else if (role === 'especialista') profile = 'TÁTICO';

    // Override by type
    if (type === 'animal' || type === 'besta') profile = 'SELVAGEM';
    if (type === 'morto-vivo' && role === 'bruto') profile = 'BRUTO';
    if (type === 'planta') profile = 'TANQUE';

    // 3. Distribution Templates (Weights)
    const templates: Record<string, any> = {
      'ÁGIL':    { str: 0.2, dex: 0.5, con: 0.2, int: -0.1, wis: 0.2, cha: 0.0 },
      'BRUTO':   { str: 0.5, dex: 0.1, con: 0.4, int: -0.2, wis: 0.1, cha: -0.1 },
      'TÁTICO':  { str: 0.2, dex: 0.2, con: 0.2, int: 0.4, wis: 0.4, cha: 0.1 },
      'TANQUE':  { str: 0.3, dex: -0.1, con: 0.5, int: 0.0, wis: 0.2, cha: 0.0 },
      'ARCANO':  { str: -0.1, dex: 0.2, con: 0.1, int: 0.5, wis: 0.4, cha: 0.2 },
      'SELVAGEM': { str: 0.4, dex: 0.4, con: 0.2, int: -0.2, wis: 0.2, cha: -0.1 },
    };

    const template = templates[profile] || templates['TÁTICO'];
    
    const attributes = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
    
    // Distribute points
    Object.keys(attributes).forEach(key => {
      const k = key as keyof typeof attributes;
      const weight = template[k];
      
      if (weight > 0) {
        attributes[k] = Math.floor(totalPoints * weight) + (Math.random() > 0.5 ? 1 : 0);
      } else if (weight < 0) {
        attributes[k] = Math.floor(Math.random() * 2) + Math.floor(weight * 10);
      } else {
        attributes[k] = Math.floor(Math.random() * 2);
      }
    });

    // 4. Coherence Overrides
    if (type === 'animal' || type === 'besta') {
      attributes.int = Math.min(attributes.int, -3);
      attributes.cha = Math.min(attributes.cha, 0);
    }
    
    if (type === 'construto' || (type === 'morto-vivo' && !role.includes('conjurador'))) {
      attributes.int = -5;
    }

    // Ensure primary stats are high enough for the ND/Rank
    if (profile === 'BRUTO' && rank !== 'normal') {
      attributes.str = Math.max(attributes.str, Math.floor(ndNum / 2) + 3);
      attributes.con = Math.max(attributes.con, Math.floor(ndNum / 2) + 2);
    }

    if (profile === 'ÁGIL' && rank !== 'normal') {
      attributes.dex = Math.max(attributes.dex, Math.floor(ndNum / 2) + 3);
    }

    return attributes;
  }
};
