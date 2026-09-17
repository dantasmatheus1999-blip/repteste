export interface MonsterStats {
  hp: number;
  defense: number;
  attack: number;
  damage: string;
  saveDC: number;
  fortitude: number;
  reflexes: number;
  will: number;
}

/**
 * Papéis oficiais de combate de Tormenta 20 (Ameaças de Arton - Tabela 2-3)
 * Define a função da criatura no encontro.
 */
export type CombatRole = 'solo' | 'lacaio' | 'especial';

/**
 * Estilos de Combate (Arquitetura REALMOR)
 * Define como a criatura luta (Marcial, Atirador, Conjurador, Tático).
 */
export type CombatStyle = 'marcial' | 'atirador' | 'conjurador' | 'tatico';

/**
 * Escala REALMOR
 * Define a importância e os recursos especiais da criatura (Normal, Elite, Chefe).
 */
export type RealmorScale = 'normal' | 'elite' | 'chefe';

/**
 * Funções táticas / arquétipos conceituais para distribuição de resistências e habilidades
 */
export type MonsterRole = 'bruto' | 'emboscador' | 'controlador' | 'conjurador' | 'tanque' | 'especialista';
export type MonsterRank = RealmorScale;
export type CreatureType = 'animal' | 'besta' | 'construto' | 'demônio' | 'espírito' | 'humanoide' | 'monstro' | 'morto-vivo' | 'planta';
export type CreatureSize = 'minúsculo' | 'pequeno' | 'médio' | 'grande' | 'enorme' | 'colossal';

export type SaveLevel = 'strong' | 'medium' | 'weak';

export interface T20CreatureParameterEntry {
  patamar?: string;
  nd: string;
  ndValue: number;
  attack: number;
  averageDamage: number;
  defense: number;
  strongSave: number;
  mediumSave: number;
  weakSave: number;
  hp: number;
  standardEffectDC: number;

  // Retrocompatibilidade e aliases
  targetDamage: number;
  saveDC: number;
  saves: {
    strong: number;
    medium: number;
    weak: number;
  };
}

export function createT20ParamEntry(
  patamar: string,
  nd: string,
  ndValue: number,
  attack: number,
  averageDamage: number,
  defense: number,
  strongSave: number,
  mediumSave: number,
  weakSave: number,
  hp: number,
  standardEffectDC: number
): T20CreatureParameterEntry {
  return {
    patamar,
    nd,
    ndValue,
    attack,
    averageDamage,
    defense,
    strongSave,
    mediumSave,
    weakSave,
    hp,
    standardEffectDC,
    targetDamage: averageDamage,
    saveDC: standardEffectDC,
    saves: {
      strong: strongSave,
      medium: mediumSave,
      weak: weakSave,
    },
  };
}

// Retrocompatibilidade de tipo
export type T20NDReference = T20CreatureParameterEntry & {
  damageFormula?: string;
  perception?: number;
  initiative?: number;
};

// ============================================================================
// TABELA 2-3 A — SOLOS (Tormenta20 — Ameaças de Arton, Cap. 2)
// Colunas: Patamar | ND | Ataque | Dano Médio | Defesa | Resistência Forte | Resistência Média | Resistência Fraca | PV | CD (Efeito Padrão)
// ============================================================================
export const T20_TABLE_2_3_A_SOLOS: Record<string, T20CreatureParameterEntry> = {
  '1/4': createT20ParamEntry('Iniciante', '1/4', 0.25, 0,  12, 6,  8,   11, 3,  7,    0),
  '1/2': createT20ParamEntry('Iniciante', '1/2', 0.5,  3,  13, 7,  10,  14, 6,  15,   0),
  '1':   createT20ParamEntry('Iniciante', '1',   1,    5,  14, 9,  15,  16, 11, 35,   0),
  '2':   createT20ParamEntry('Iniciante', '2',   2,    7,  16, 12, 18,  19, 13, 70,   2),
  '3':   createT20ParamEntry('Iniciante', '3',   3,    9,  17, 14, 21,  21, 15, 105,  3),
  '4':   createT20ParamEntry('Iniciante', '4',   4,    10, 18, 16, 24,  23, 16, 140,  4),
  '5':   createT20ParamEntry('Veterano',  '5',   5,    17, 11, 20, 40,  24, 17, 200,  5),
  '6':   createT20ParamEntry('Veterano',  '6',   6,    12, 22, 20, 56,  27, 18, 240,  6),
  '7':   createT20ParamEntry('Veterano',  '7',   7,    14, 24, 24, 62,  31, 20, 280,  7),
  '8':   createT20ParamEntry('Veterano',  '8',   8,    15, 26, 26, 68,  33, 21, 320,  8),
  '9':   createT20ParamEntry('Veterano',  '9',   9,    15, 28, 27, 74,  34, 21, 360,  9),
  '10':  createT20ParamEntry('Veterano',  '10',  10,   16, 30, 29, 80,  36, 22, 400,  10),
  '11':  createT20ParamEntry('Campeão',   '11',  11,   18, 31, 34, 130, 41, 24, 550,  11),
  '12':  createT20ParamEntry('Campeão',   '12',  12,   20, 33, 36, 144, 43, 26, 600,  12),
  '13':  createT20ParamEntry('Campeão',   '13',  13,   20, 35, 37, 158, 44, 26, 650,  13),
  '14':  createT20ParamEntry('Campeão',   '14',  14,   22, 38, 39, 172, 46, 28, 700,  14),
  '15':  createT20ParamEntry('Campeão',   '15',  15,   22, 40, 43, 186, 50, 28, 750,  15),
  '16':  createT20ParamEntry('Campeão',   '16',  16,   24, 42, 46, 200, 53, 30, 800,  16),
  '17':  createT20ParamEntry('Lenda',     '17',  17,   24, 44, 47, 270, 54, 30, 1020, 17),
  '18':  createT20ParamEntry('Lenda',     '18',  18,   26, 47, 49, 288, 56, 32, 1080, 18),
  '19':  createT20ParamEntry('Lenda',     '19',  19,   26, 47, 52, 306, 59, 32, 1140, 19),
  '20':  createT20ParamEntry('Lenda',     '20',  20,   28, 49, 54, 324, 61, 34, 1200, 20),
  'S':   createT20ParamEntry('Lenda',     'S',   25,   30, 51, 58, 360, 65, 36, 2500, 25),
  'S+':  createT20ParamEntry('Lenda',     'S+',  30,   33, 55, 65, 500, 70, 38, 4000, 30),
};

// ============================================================================
// TABELA 2-3 B — LACAIOS (Tormenta20 — Ameaças de Arton, Cap. 2)
// Colunas: Patamar | ND | Ataque | Dano Médio | Defesa | Resistência Forte | Resistência Média | Resistência Fraca | PV | CD (Efeito Padrão)
// ============================================================================
export const T20_TABLE_2_3_B_LACAIOS: Record<string, T20CreatureParameterEntry> = {
  '1/4': createT20ParamEntry('Iniciante', '1/4', 0.25, 0,  12, 7,  9,   10, 2,  1,  4),
  '1/2': createT20ParamEntry('Iniciante', '1/2', 0.5,  3,  13, 9,  11,  13, 5,  1,  6),
  '1':   createT20ParamEntry('Iniciante', '1',   1,    5,  14, 11, 17,  15, 10, 1,  9),
  '2':   createT20ParamEntry('Iniciante', '2',   2,    7,  16, 14, 21,  18, 12, 2,  14),
  '3':   createT20ParamEntry('Iniciante', '3',   3,    9,  17, 16, 24,  20, 14, 4,  21),
  '4':   createT20ParamEntry('Iniciante', '4',   4,    10, 18, 17, 32,  22, 15, 5,  28),
  '5':   createT20ParamEntry('Veterano',  '5',   5,    20, 11, 20, 56,  23, 16, 6,  40),
  '6':   createT20ParamEntry('Veterano',  '6',   6,    12, 22, 24, 62,  26, 17, 7,  48),
  '7':   createT20ParamEntry('Veterano',  '7',   7,    14, 24, 26, 68,  30, 19, 8,  56),
  '8':   createT20ParamEntry('Veterano',  '8',   8,    15, 26, 27, 74,  32, 20, 9,  64),
  '9':   createT20ParamEntry('Veterano',  '9',   9,    15, 28, 29, 80,  33, 20, 10, 72),
  '10':  createT20ParamEntry('Veterano',  '10',  10,   16, 30, 34, 105, 35, 21, 11, 80),
  '11':  createT20ParamEntry('Campeão',   '11',  11,   18, 31, 36, 144, 40, 23, 12, 110),
  '12':  createT20ParamEntry('Campeão',   '12',  12,   20, 33, 37, 158, 42, 25, 13, 120),
  '13':  createT20ParamEntry('Campeão',   '13',  13,   20, 35, 39, 172, 43, 25, 14, 130),
  '14':  createT20ParamEntry('Campeão',   '14',  14,   22, 38, 43, 186, 45, 27, 15, 140),
  '15':  createT20ParamEntry('Campeão',   '15',  15,   22, 40, 46, 200, 49, 27, 16, 150),
  '16':  createT20ParamEntry('Campeão',   '16',  16,   24, 42, 47, 235, 52, 29, 17, 160),
  '17':  createT20ParamEntry('Lenda',     '17',  17,   24, 44, 49, 288, 53, 29, 18, 204),
  '18':  createT20ParamEntry('Lenda',     '18',  18,   26, 47, 52, 306, 55, 31, 19, 216),
  '19':  createT20ParamEntry('Lenda',     '19',  19,   26, 47, 54, 324, 58, 31, 20, 228),
  '20':  createT20ParamEntry('Lenda',     '20',  20,   28, 49, 56, 344, 60, 33, 21, 240),
  'S':   createT20ParamEntry('Lenda',     'S',   25,   30, 51, 60, 385, 64, 35, 23, 500),
  'S+':  createT20ParamEntry('Lenda',     'S+',  30,   33, 55, 67, 540, 69, 37, 26, 800),
};

// ============================================================================
// TABELA 2-3 C — ESPECIAIS (Tormenta20 — Ameaças de Arton, Cap. 2)
// Colunas: Patamar | ND | Ataque | Dano Médio | Defesa | Resistência Forte | Resistência Média | Resistência Fraca | PV | CD (Efeito Padrão)
// ============================================================================
export const T20_TABLE_2_3_C_ESPECIAIS: Record<string, T20CreatureParameterEntry> = {
  '1/4': createT20ParamEntry('Iniciante', '1/4', 0.25, 0,  14, 4,  8,   11, 3,  6,   5),
  '1/2': createT20ParamEntry('Iniciante', '1/2', 0.5,  3,  15, 5,  10,  12, 6,  12,  11),
  '1':   createT20ParamEntry('Iniciante', '1',   1,    5,  16, 7,  15,  14, 11, 25,  3),
  '2':   createT20ParamEntry('Iniciante', '2',   2,    7,  18, 10, 18,  17, 13, 49,  2),
  '3':   createT20ParamEntry('Iniciante', '3',   3,    9,  19, 12, 21,  19, 15, 74,  3),
  '4':   createT20ParamEntry('Iniciante', '4',   4,    10, 20, 14, 24,  21, 16, 98,  4),
  '5':   createT20ParamEntry('Veterano',  '5',   5,    15, 11, 22, 40,  22, 17, 140, 5),
  '6':   createT20ParamEntry('Veterano',  '6',   6,    12, 24, 18, 56,  25, 18, 168, 6),
  '7':   createT20ParamEntry('Veterano',  '7',   7,    14, 26, 22, 62,  29, 20, 196, 7),
  '8':   createT20ParamEntry('Veterano',  '8',   8,    15, 28, 24, 68,  31, 21, 224, 8),
  '9':   createT20ParamEntry('Veterano',  '9',   9,    15, 30, 25, 74,  32, 21, 252, 9),
  '10':  createT20ParamEntry('Veterano',  '10',  10,   16, 32, 27, 80,  34, 22, 280, 10),
  '11':  createT20ParamEntry('Campeão',   '11',  11,   18, 33, 32, 130, 39, 24, 385, 11),
  '12':  createT20ParamEntry('Campeão',   '12',  12,   20, 35, 34, 144, 41, 26, 420, 12),
  '13':  createT20ParamEntry('Campeão',   '13',  13,   20, 37, 35, 158, 42, 26, 455, 13),
  '14':  createT20ParamEntry('Campeão',   '14',  14,   22, 40, 37, 172, 44, 28, 490, 14),
  '15':  createT20ParamEntry('Campeão',   '15',  15,   22, 42, 41, 186, 48, 28, 525, 15),
  '16':  createT20ParamEntry('Campeão',   '16',  16,   24, 44, 44, 200, 51, 30, 560, 16),
  '17':  createT20ParamEntry('Lenda',     '17',  17,   24, 46, 45, 270, 52, 30, 714, 17),
  '18':  createT20ParamEntry('Lenda',     '18',  18,   26, 49, 47, 288, 54, 32, 756, 18),
  '19':  createT20ParamEntry('Lenda',     '19',  19,   26, 49, 50, 306, 57, 32, 798, 19),
  '20':  createT20ParamEntry('Lenda',     '20',  20,   28, 51, 52, 324, 59, 34, 840, 20),
  'S':   createT20ParamEntry('Lenda',     'S',   25,   30, 55, 55, 360, 63, 36, 1750, 22),
  'S+':  createT20ParamEntry('Lenda',     'S+',  30,   33, 60, 60, 500, 67, 38, 2800, 25),
};

export const T20_TABLE_2_3_ROLES: Record<CombatRole, Record<string, T20CreatureParameterEntry>> = {
  solo: T20_TABLE_2_3_A_SOLOS,
  lacaio: T20_TABLE_2_3_B_LACAIOS,
  especial: T20_TABLE_2_3_C_ESPECIAIS,
};

/**
 * Retorna os parâmetros oficiais da Tabela 2-3 de Ameaças de Arton para o papel e ND.
 */
export function getT20CreatureParameters(role: CombatRole, nd: string): T20CreatureParameterEntry {
  const table = T20_TABLE_2_3_ROLES[role] || T20_TABLE_2_3_A_SOLOS;
  return table[nd] || table['1'] || T20_TABLE_2_3_A_SOLOS['1'];
}

// Retrocompatibilidade temporária com referências legadas
export const T20_ND_TABLE: Record<string, T20NDReference> = T20_TABLE_2_3_A_SOLOS;

export const ND_TABLE: Record<string, MonsterStats> = Object.fromEntries(
  Object.entries(T20_TABLE_2_3_A_SOLOS).map(([k, v]) => [
    k,
    {
      hp: v.hp,
      defense: v.defense,
      attack: v.attack,
      damage: `${v.targetDamage}`,
      saveDC: v.saveDC,
      fortitude: v.saves.strong,
      reflexes: v.saves.medium,
      will: v.saves.weak,
    },
  ])
);

/**
 * Perfis de Papel (Role) - Definem a distribuição de resistências e pequenos ajustes táticos.
 * Em T20, papéis não somam valores desproporcionais; eles moldam a distribuição da ameaça.
 */
export interface RoleProfile {
  role: MonsterRole;
  name: string;
  saveDistribution: {
    fortitude: SaveLevel;
    reflexes: SaveLevel;
    will: SaveLevel;
  };
  hpMultiplier: number;
  defenseMod: number;
  attackMod: number;
  damageMultiplier: number;
  saveDCMod: number;
  initiativeMod: number;
  perceptionMod: number;
  description: string;
}

export const ROLE_PROFILES: Record<MonsterRole, RoleProfile> = {
  bruto: {
    role: 'bruto',
    name: 'Bruto',
    saveDistribution: { fortitude: 'strong', reflexes: 'weak', will: 'medium' },
    hpMultiplier: 1.0,
    defenseMod: 0,
    attackMod: 0,
    damageMultiplier: 1.0,
    saveDCMod: 0,
    initiativeMod: -1,
    perceptionMod: 0,
    description: 'Criatura poderosa focada em vigor físico, ataques pesados e presença imponente.',
  },
  emboscador: {
    role: 'emboscador',
    name: 'Emboscador',
    saveDistribution: { fortitude: 'medium', reflexes: 'strong', will: 'weak' },
    hpMultiplier: 1.0,
    defenseMod: 0,
    attackMod: 0,
    damageMultiplier: 1.0,
    saveDCMod: 0,
    initiativeMod: 3,
    perceptionMod: 2,
    description: 'Atacante furtivo e ágil que busca surpreender e eliminar alvos vulneráveis.',
  },
  controlador: {
    role: 'controlador',
    name: 'Controlador',
    saveDistribution: { fortitude: 'medium', reflexes: 'weak', will: 'strong' },
    hpMultiplier: 1.0,
    defenseMod: 0,
    attackMod: 0,
    damageMultiplier: 1.0,
    saveDCMod: 0,
    initiativeMod: 1,
    perceptionMod: 1,
    description: 'Manipula o campo de batalha impondo condições, restrições e efeitos em área.',
  },
  conjurador: {
    role: 'conjurador',
    name: 'Conjurador',
    saveDistribution: { fortitude: 'weak', reflexes: 'medium', will: 'strong' },
    hpMultiplier: 1.0,
    defenseMod: 0,
    attackMod: 0,
    damageMultiplier: 1.0,
    saveDCMod: 0,
    initiativeMod: 0,
    perceptionMod: 1,
    description: 'Especialista em magias arcanas ou divinas com alta versatilidade e foco em efeitos mágicos.',
  },
  tanque: {
    role: 'tanque',
    name: 'Tanque',
    saveDistribution: { fortitude: 'strong', reflexes: 'medium', will: 'weak' },
    hpMultiplier: 1.0,
    defenseMod: 0,
    attackMod: 0,
    damageMultiplier: 1.0,
    saveDCMod: 0,
    initiativeMod: -2,
    perceptionMod: 0,
    description: 'Barreira defensiva impenetrável com alto controle de engajamento.',
  },
  especialista: {
    role: 'especialista',
    name: 'Especialista',
    saveDistribution: { fortitude: 'weak', reflexes: 'strong', will: 'medium' },
    hpMultiplier: 1.0,
    defenseMod: 0,
    attackMod: 0,
    damageMultiplier: 1.0,
    saveDCMod: 0,
    initiativeMod: 2,
    perceptionMod: 3,
    description: 'Combatente técnico e versátil com excelente percepção, iniciativa e precisão tática.',
  },
};

export const ROLE_MODIFIERS: Record<MonsterRole, Partial<MonsterStats>> = {
  bruto: { hp: 1.0, attack: 0, defense: 0 },
  emboscador: { attack: 0, defense: 0, hp: 1.0 },
  controlador: { saveDC: 0, hp: 1.0 },
  conjurador: { saveDC: 0, defense: 0, hp: 1.0, attack: 0 },
  tanque: { defense: 0, hp: 1.0, attack: 0 },
  especialista: { attack: 0, defense: 0, hp: 1.0 },
};

/**
 * Abstração de Escala Realmor (Normal, Elite, Chefe) para Tormenta 20.
 * Conforme as regras oficiais: Chefe e Elite NÃO aplicam bônus matemáticos automáticos
 * (sem +PV, +Defesa, +Ataque ou +CD arbitrários).
 * A escala modula repertório tático, habilidades, ações lendárias e controle de campo.
 */
export interface MonsterRankProfile {
  rank: MonsterRank;
  name: string;
  hpMultiplier: number;
  attackBonus: number;
  defenseBonus: number;
  saveDCBonus: number;
  savesBonus: number;
  damageMultiplier: number;
  abilitiesCount: number;
  hasBossActions: boolean;
  description: string;
}

export const MONSTER_RANK_PROFILES: Record<MonsterRank, MonsterRankProfile> = {
  normal: {
    rank: 'normal',
    name: 'Normal',
    hpMultiplier: 1.0,
    attackBonus: 0,
    defenseBonus: 0,
    saveDCBonus: 0,
    savesBonus: 0,
    damageMultiplier: 1.0,
    abilitiesCount: 1,
    hasBossActions: false,
    description: 'Ameaça padrão para combates em grupo ou encontros equilibrados.',
  },
  elite: {
    rank: 'elite',
    name: 'Elite',
    hpMultiplier: 1.0,
    attackBonus: 0,
    defenseBonus: 0,
    saveDCBonus: 0,
    savesBonus: 0,
    damageMultiplier: 1.0,
    abilitiesCount: 2,
    hasBossActions: false,
    description: 'Líder de pelotão ou espécime notável com maior repertório tático e sinergias.',
  },
  chefe: {
    rank: 'chefe',
    name: 'Chefe',
    hpMultiplier: 1.0,
    attackBonus: 0,
    defenseBonus: 0,
    saveDCBonus: 0,
    savesBonus: 0,
    damageMultiplier: 1.0,
    abilitiesCount: 3,
    hasBossActions: true,
    description: 'Ameaça solo de destaque desenhada com ações lendárias, controle de campo e presença marcante.',
  },
};

export const RANK_MODIFIERS: Record<MonsterRank, number> = {
  normal: 1,
  elite: 1,
  chefe: 1,
};

export const MONSTER_NAMES = {
  prefixes: [
    'Sombrio', 'Gélido', 'Atroz', 'Maldito', 'Ancestral', 'Venenoso', 'Feroz', 
    'Espectral', 'Corrompido', 'Gigante', 'Primordial', 'Tirano', 'Assolador', 
    'Impiedoso', 'Titânico', 'Cadavérico', 'Abissal', 'Supremo', 'Vingativo'
  ],
  bases: [
    'Lobo', 'Aranha', 'Ogro', 'Zumbi', 'Esqueleto', 'Verme', 'Gárgula', 'Quimera', 
    'Basilisco', 'Troll', 'Golem', 'Espectro', 'Wyvern', 'Mantícora', 'Elemental',
    'Dragão Menor', 'Carniçal', 'Beemote', 'Constructo de Guerra', 'Vorme'
  ],
  suffixes: [
    'das Sombras', 'de Arton', 'dos Ermos', 'da Montanha', 'do Abismo', 
    'da Floresta', 'do Pântano', 'das Ruínas', 'da Tormenta', 'das Profundezas',
    'dos Túmulos', 'do Fogo Eterno', 'da Nevasca', 'da Cidadela Esquecida'
  ],
  // Nomes temáticos especializados por Estilo e Tipo
  marcialNames: [
    'General Orc da Vanguarda', 'Guerreiro Berserker Bárbaro', 'Cavaleiro Negro da Tormenta',
    'Senhor da Guerra Ogro', 'Gladiador de Sangue Minotauro', 'Centurião Anão de Ferro',
    'Troll Esmagador de Crânios', 'Golem de Cerco Forjado', 'Destruidor Carniçal das Catacumbas'
  ],
  atiradorNames: [
    'Franco-Atirador Élfico da Fronteira', 'Arqueiro Sombrio dos Ermos', 'Besteiro de Cerco Anão',
    'Caçador de Recompensas Goblin', 'Rastreador Gnoll da Savana', 'Franco-Atirador da Tormenta',
    'Vigia Espectral da Torre', 'Arqueiro da Morte Esquelético', 'Franco-Atirador do Deserto'
  ],
  conjuradorNames: [
    'Grão-Lich das Catacumbas Esquecidas', 'Arquimago Corrompido da Tormenta', 'Sumo Sacerdote do Abismo',
    'Necromante das Sombras Eternas', 'Conjurador Elemental do Fogo', 'Mago de Batalha Arcano',
    'Feiticeiro Dracônico Ancestral', 'Bruxa do Pântano Venenoso', 'Hierofante das Profundezas'
  ],
  taticoNames: [
    'Comandante de Infantaria Hobgoblin', 'Estrategista de Cerco Goblin', 'Capitão da Guarda Real',
    'Mestre de Guerra Minotauro', 'Senhor da Matilha Alfa', 'Inquisidor da Ordem Sagrada',
    'Comissário Tático de Arton', 'Líder dos Salteadores do Pântano', 'Marechal da Linha de Frente'
  ]
};

// ============================================================================
// HABILIDADES EXCLUSIVAS POR ESTILO DE COMBATE (REPERATÓRIO REALMOR / T20)
// ============================================================================
export const STYLE_ABILITIES: Record<CombatStyle, string[]> = {
  marcial: [
    'Trespassar de Guerra: Quando reduz um inimigo a 0 PV com um ataque corpo a corpo, pode imediatamente desferir um ataque adicional contra outro alvo em alcance.',
    'Varrida Ampla: Uma vez por rodada, pode desferir um golpe giratório que atinge até dois inimigos adjacentes com uma única rolagem de ataque.',
    'Golpe Devastador: Uma vez por rodada ao acertar um golpe corpo a corpo, pode empurrar o alvo 3m para trás ou deixá-lo Caído (Fortitude CD base evita).',
    'Fúria de Batalha: Enquanto estiver com menos de 50% dos seus PV máximos, recebe +2 em testes de ataque e +1d8 em todas as rolagens de dano corpo a corpo.',
    'Postura Defensiva de Aço: Enquanto empunhar sua arma ou escudo, recebe +2 na Defesa e não pode ser flanqueado por inimigos de tamanho Médio ou menor.',
    'Avanço Implacável: Ignora penalidades de terreno difícil ao realizar uma investida e ganha +2 na rolagem de dano da investida.',
    'Riposte Preciso: Quando um ataque corpo a corpo erra a criatura por 5 ou mais, ela pode realizar um contra-ataque imediato contra o agressor.',
    'Manobra Esmagadora: Ao acertar um ataque, pode realizar a manobra Derrubar ou Agarrar como ação livre (CD base evita).',
    'Couraça Rígida e Vigor Indomável: Possui Redução de Dano física (RD 5 ou ND/2) e vantagem em testes contra efeitos de sangramento e atordoamento.',
    'Quebra-Ossos: Seus acertos críticos causam a condição Fraturado e Sangrando (1d8 por rodada) até receberem cuidados médicos.',
    'Bote Físico Repentino: Pode se mover até metade de seu deslocamento como parte de sua ação de ataque sem provocar ataques de oportunidade.',
    'Firmeza Inabalável: Recebe +5 em testes de resistência para evitar ser empurrado, derrubado ou deslocado à força.'
  ],
  atirador: [
    'Disparo Preciso: Seus ataques à distância ignoram a penalidade de atirar em inimigos engajados em combate corpo a corpo com aliados.',
    'Tiro em Movimento: Pode realizar seu deslocamento dividido antes e depois de desferir seus ataques à distância.',
    'Olho Clínico e Mira Apurada: Se não se mover em seu turno, recebe +2 no teste de ataque à distância e sua margem de ameaça aumenta em +1 (19-20).',
    'Flecha Debilitante no Membro: Um alvo atingido por seu ataque à distância deve passar em Fortitude (CD base) ou tem seu deslocamento reduzido pela metade por 1 rodada.',
    'Camuflagem de Franco-Atirador: Recebe +5 em testes de Furtividade e pode se esconder em cobertura leve mesmo após disparar.',
    'Disparo à Queima-Roupa: Não sofre desvantagem nem provoca ataques de oportunidade ao disparar contra alvos em alcance corpo a corpo.',
    'Saraivada de Projéteis: Uma vez por rodada, pode disparar dois projéteis simultâneos contra alvos distintos a até 6m um do outro.',
    'Oportunista à Distância: Causa +1d8 de dano adicional contra alvos que estejam flanqueados, caídos ou sob condições de paralisia/imobilidade.',
    'Recuo Ágil: Quando um inimigo se aproxima a alcance corpo a corpo, a criatura pode gastar uma reação para recuar até 3m imediatamente sem provocar reações.',
    'Tiro Perfurante: Seus disparos perfuram armaduras e escudos pesados, ignorando até 5 pontos de Redução de Dano (RD) do alvo.',
    'Tiro Supressor em Área: Dispara contra uma área de 3m; todas as criaturas na área devem passar em Reflexos (CD base) ou ficam Abaladas e com mobilidade restrita por 1 rodada.'
  ],
  conjurador: [
    'Canalizar Misticismo: Pode conjurar suas magias gastando seus Pontos de Mana (PM) com a CD oficial de efeito de Tormenta 20.',
    'Mente Concentrada e Foco Mágico: Recebe +5 em testes de Vontade para manter a concentração de feitiços sustentados ou resistir a interrupções.',
    'Barreira de Mana Reativa: Como reação ao sofrer um ataque ou magia, pode gastar 1 PM para receber +4 na Defesa e +2 em testes de resistência contra o efeito.',
    'Ruptura e Dreno de Mana: Quando um alvo falha no teste de resistência contra uma de suas magias, perde 1d4 PM temporários e o conjurador recupera a mesma quantia.',
    'Aura Protetora de Mana: Criaturas a até 3m sofrem penalidade de -2 em resistências contra suas magias e o conjurador possui camuflagem leve contra projéteis.',
    'Sobrecarga Mística: Uma vez por combate, pode gastar 2 PM extras ao conjurar uma magia para aplicar dano máximo sem necessidade de rolagens nos dados de efeito.',
    'Translocação Arcana: Como ação de movimento (custo 1 PM), teleporta-se até 9m para um espaço visível desimpedido sem provocar ataques de oportunidade.',
    'Ressonância de Foco: Suas magias com o tema da criatura causam +1d6 de dano adicional e ignoram até 5 pontos de resistência elemental.'
  ],
  tatico: [
    'Ordem de Ataque Coordenado: Como ação de movimento, escolhe um aliado visível. Esse aliado pode realizar imediatamente um ataque com +2 ou um movimento extra fora do turno.',
    'Provocação Tática e Foco Forçado: Escolhe um inimigo em alcance curto; o alvo deve passar em Vontade (CD base) ou sofre -4 em ataques que não tenham o Tático como alvo.',
    'Manobra de Flanco Magistral: Aliados engajados contra os mesmos alvos do Tático recebem +2 adicional no bônus de flanqueamento e +1d6 de dano tático.',
    'Muralha de Escudos e Cobertura: Concede +2 na Defesa e +2 em testes de Reflexos a todos os aliados a até 3m de distância.',
    'Golpe Desorientador no Ponto Cego: Ao acertar um ataque ou manobra, o alvo fica Desorientado e Vulnerável por 1 rodada (Reflexos CD base evita).',
    'Reposicionamento Forçado: Ao acertar uma manobra, empurra o alvo até 4,5m e autoriza um aliado adjacente a dar um passo de ajuste gratuito.',
    'Análise Tática de Padrões: No início da rodada, escolhe um herói; todos os aliados ganham +2 em testes de ataque e Defesa contra aquele herói por 1 rodada.',
    'Desarme Estratégico: Pode tentar desarmar um oponente com bônus de +4 no teste de manobra e chutar a arma desarmada para longe.',
    'Comando de Fogo Focado: Marca um alvo com um comando vocal; todos os ataques à distância de aliados contra aquele alvo ignoram cobertura parcial por 1 rodada.'
  ]
};

// ============================================================================
// HABILIDADES EXCLUSIVAS POR TIPO DE CRIATURA (COERÊNCIA BIOLÓGICA / NARRATIVA)
// ============================================================================
export const TYPE_ABILITIES: Record<CreatureType, string[]> = {
  'animal': [
    'Instinto Predatório: Recebe vantagem em testes de Percepção para rastrear e farejar presas.',
    'Frenesi da Matilha: Causa +1d6 de dano para cada outro animal aliado adjacente ao mesmo alvo.'
  ],
  'besta': [
    'Bote Voraz Dilacerante: Pode realizar um ataque de mordida ou garras adicional se tiver se deslocado pelo menos 3m em linha reta.',
    'Rugido Aterrador: Como ação de movimento, emite um rugido que força inimigos a até 9m a passarem em Vontade (CD base) ou ficam Abalados por 1d4 rodadas.'
  ],
  'construto': [
    'Imunidade a Fadiga e Veneno: Construto é imune a cansaço, doenças, venenos, sono e sangramento.',
    'Blindagem Mecânica: Recebe Redução de Dano 5 contra dano cortante e perfurante.'
  ],
  'demônio': [
    'Presença Corruptora Profana: A aura da criatura faz com que curas mágicas a até 9m recuperem apenas metade dos PV.',
    'Chamas do Abismo: Seus ataques desferem dano profano adicional que ignora resistências comuns.'
  ],
  'espírito': [
    'Forma Incorpórea Parcial: Reduz todo o dano não-mágico recebido pela metade e pode atravessar obstáculos sólidos.',
    'Toque Gélido da Alma: Ao acertar um herói, o alvo deve passar em Fortitude (CD base) ou perde 1d4 PM temporários pelo calafrio espiritual.'
  ],
  'humanoide': [
    'Treinamento Bélico: Pode empunhar armaduras pesadas e armas marciais sem qualquer penalidade de deslocamento.',
    'Determinação de Aço: Uma vez por cena, ao falhar em um teste de resistência de Vontade, pode rolar o teste novamente.'
  ],
  'monstro': [
    'Carapaça Grotesca: Imune a acertos críticos comuns e imune a manobras de agarrar de criaturas menores.',
    'Membros Múltiplos: Pode engajar até dois alvos diferentes simultaneamente sem sofrer penalidade de flanqueamento.'
  ],
  'morto-vivo': [
    'Inércia Cadavérica: Imune a sono, veneno, sangramento, paralisia e dano de frio.',
    'Toque da Sepultura: Seus ataques deixam o alvo sob calafrios necróticos, impedindo recuperação natural de PV até o fim da cena.'
  ],
  'planta': [
    'Raízes Constritoras no Solo: Terreno a até 3m da planta é considerado terreno difícil para inimigos.',
    'Esporos Tóxicos Defensivos: Quando sofre um ataque corpo a corpo, libera esporos; o agressor deve passar em Fortitude (CD base) ou fica Envenenado.'
  ]
};

// ============================================================================
// HABILIDADES EXCLUSIVAS POR TEMA ELEMENTAL / CONCEITUAL
// ============================================================================
export const THEME_ABILITIES: Record<string, string[]> = {
  fogo: [
    'Corpo Ígneo: Inimigos que atinjam a criatura em combate corpo a corpo sofrem 1d6 de dano de fogo.',
    'Explosão Incendiária: Seus ataques com dano de fogo deixam o alvo em chamas (1d6 por turno, Reflexos CD base apaga).'
  ],
  gelo: [
    'Aura Gélida: Inimigos a até 3m têm seu deslocamento reduzido em 3m devido ao frio extremo.',
    'Gume Congelante: Seus ataques causam lentidão por 1 rodada em alvos que falharem em Fortitude (CD base).'
  ],
  sombra: [
    'Manto de Penumbra: Recebe camuflagem parcial (20% de chance de erro para atacantes) em ambientes escuros.',
    'Passo das Trevas: Pode se fundir com sombras para se teleportar até 6m como ação livre após desferir um ataque.'
  ],
  veneno: [
    'Peçonha Virulenta: Alvos atingidos por seus ataques devem passar em Fortitude (CD base) ou ficam Envenenados e Lentos por 1d4 rodadas.',
    'Glândulas de Ácido Tóxico: Pode cuspir veneno a até 6m como ação padrão (Reflexos CD base evita).'
  ],
  arcano: [
    'Ressonância Mística: Suas habilidades e feitiços ignoram até 5 pontos de resistência a dano elemental.',
    'Escudo Arcano Fluido: Concede +2 na Defesa contra ataques à distância e projéteis mágicos.'
  ],
  sagrado: [
    'Aura Abençoada: Aliados a até 6m recebem +2 em testes de Vontade contra efeitos de medo ou profanação.',
    'Golpe Purificador: Seus ataques causam +1d8 de dano sagrado adicional contra mortos-vivos e demônios.'
  ],
  profano: [
    'Manto da Corrupção: Inimigos adjacentes sofrem -2 em testes de Fortitude e sentem constante enjoo.',
    'Dreno Vital Profano: Recupera PV iguais a metade do dano causado quando atinge um acerto crítico.'
  ],
  natureza: [
    'Mimetismo Selvagem: Recebe +5 em Furtividade em ambientes naturais e não deixa rastros.',
    'Vigor da Terra: Regenera 5 PV por rodada enquanto estiver em contato com terra ou solo natural.'
  ],
  eletrico: [
    'Descarga Elétrica: Quando é atingida por um ataque corpo a corpo, libera um choque de 1d6 de eletricidade no agressor.',
    'Velocidade Relâmpago: Pode realizar uma investida sem necessidade de linha reta desimpedida.'
  ],
  terra: [
    'Carapaça de Rocha: Possui RD 5 contra dano cortante e perfurante e imunidade a ser empurrada.',
    'Onda de Choque Sísmica: Golpeia o solo como ação de movimento; criaturas adjacentes devem passar em Fortitude (CD base) ou caem.'
  ]
};

// Retrocompatibilidade
export const MONSTER_ABILITIES: Record<MonsterRole, string[]> = {
  bruto: STYLE_ABILITIES.marcial.slice(0, 5),
  emboscador: STYLE_ABILITIES.atirador.slice(0, 5),
  controlador: STYLE_ABILITIES.tatico.slice(0, 5),
  conjurador: STYLE_ABILITIES.conjurador.slice(0, 5),
  tanque: STYLE_ABILITIES.marcial.slice(4, 9),
  especialista: STYLE_ABILITIES.tatico.slice(3, 8),
};

export const COMBAT_STYLE_PROFILES: Record<CombatStyle, { name: string; description: string; preferredRange: string }> = {
  marcial: {
    name: 'Marcial',
    description: 'Foco em combate corpo a corpo com armas pesadas, garras, presas, manobras de choque e resistência física.',
    preferredRange: 'Corpo a corpo',
  },
  atirador: {
    name: 'Atirador',
    description: 'Foco em ataques à distância, disparos precisos, uso de cobertura, mobilidade e controle de linha de tiro.',
    preferredRange: 'Distância',
  },
  conjurador: {
    name: 'Conjurador',
    description: 'Foco exclusivo em conjuração de magias com reserva de PM, CD oficial, efeitos de controle e suporte místico.',
    preferredRange: 'Mágico',
  },
  tatico: {
    name: 'Tático',
    description: 'Foco em comando de aliados, manobras de controle de grupo, desarmes, suporte, debuffs e liderança de campo.',
    preferredRange: 'Híbrido',
  },
};

export const COMBAT_STYLE_TACTICS: Record<CombatStyle, string> = {
  marcial: 'Avança com ímpeto direto para engajar a linha de frente dos heróis em combate corpo a corpo, aproveitando manobras de derrubar e trespassar para abrir caminho.',
  atirador: 'Mantém distância segura aproveitando cobertura do cenário e linha de visão limpa, disparando contra conjuradores expostos ou heróis vulneráveis.',
  conjurador: 'Posiciona-se na retaguarda protegido por obstáculos ou aliados, gerenciando seus PM para conjurar magias de controle de grupo, dano concentrado e barreiras reativas.',
  tatico: 'Analisa a formação do grupo de aventureiros, emitindo ordens de ataque para aliados, aplicando desarmes, manobras de flanqueamento e quebra de moral.',
};

export const MONSTER_TACTICS: Record<MonsterRole, string> = {
  bruto: 'Avança com ferocidade contra o combatente mais próximo, priorizando causar o máximo de impacto rápido.',
  emboscador: 'Espreita pelas sombras, aguardando o momento certo para focar em conjuradores ou alvos frágeis na retaguarda.',
  controlador: 'Mantém distância segura, utilizando efeitos em área para desorganizar a formação do grupo e proteger aliados.',
  conjurador: 'Posiciona-se protegido por terreno ou aliados, disparando magias de controle e dano concentrado.',
  tanque: 'Fixa a linha de frente, interceptando combatentes corpo a corpo para impedir que alcancem seus aliados.',
  especialista: 'Estuda o grupo de heróis, escolhendo um alvo prioritário por vez e explorando suas fraquezas.',
};
