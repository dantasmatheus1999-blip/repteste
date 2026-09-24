export interface T20Weapon {
  id: string;
  name: string;
  type: 'leve' | 'uma_mao' | 'duas_maos' | 'distancia';
  damage: string;
  crit: string;
  range: string;
  weight: number;
  attrAtaque: 'FOR' | 'DES';
  attrDano: 'FOR' | 'DES' | null;
  proficiency: string;
  category: 'simples' | 'marcial' | 'exotica' | 'fogo';
  properties: string[];
}

export interface T20Armor {
  id: string;
  name: string;
  type: 'leve' | 'pesada';
  defenseBonus: number;
  maxDex?: number;
  penalty: number;
  weight: number;
  properties: string[];
}

export interface T20Shield {
  id: string;
  name: string;
  defenseBonus: number;
  penalty: number;
  weight: number;
  properties: string[];
}

export const T20_WEAPONS: T20Weapon[] = [
  // --- Armas Simples Corpo a Corpo ---
  {
    id: 'ataque_desarmado',
    name: 'Ataque Desarmado',
    type: 'leve',
    damage: '1d3',
    crit: 'x2',
    range: '-',
    weight: 0,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'simples',
    category: 'simples',
    properties: ['impacto', 'não-letal']
  },
  {
    id: 'adaga',
    name: 'Adaga',
    type: 'leve',
    damage: '1d4',
    crit: '19/x2',
    range: '3m',
    weight: 0.5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'simples',
    category: 'simples',
    properties: ['perfuração', 'arremesso']
  },
  {
    id: 'clava',
    name: 'Clava',
    type: 'uma_mao',
    damage: '1d6',
    crit: 'x2',
    range: '-',
    weight: 1.5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'simples',
    category: 'simples',
    properties: ['impacto']
  },
  {
    id: 'maca',
    name: 'Maça',
    type: 'uma_mao',
    damage: '1d8',
    crit: 'x2',
    range: '-',
    weight: 2,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'simples',
    category: 'simples',
    properties: ['impacto']
  },
  {
    id: 'lanca',
    name: 'Lança',
    type: 'uma_mao',
    damage: '1d6',
    crit: 'x2',
    range: '9m',
    weight: 1.5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'simples',
    category: 'simples',
    properties: ['perfuração', 'arremesso', 'versátil']
  },
  {
    id: 'bordao',
    name: 'Bordão',
    type: 'duas_maos',
    damage: '1d6/1d6',
    crit: 'x2',
    range: '-',
    weight: 2,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'simples',
    category: 'simples',
    properties: ['impacto', 'arma dupla']
  },
  {
    id: 'pique',
    name: 'Pique',
    type: 'duas_maos',
    damage: '1d8',
    crit: 'x2',
    range: '-',
    weight: 3,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'simples',
    category: 'simples',
    properties: ['perfuração', 'alcance']
  },

  // --- Armas Simples de Disparo / Arremesso ---
  {
    id: 'azagaia',
    name: 'Azagaia',
    type: 'distancia',
    damage: '1d6',
    crit: 'x2',
    range: '18m',
    weight: 1,
    attrAtaque: 'DES',
    attrDano: 'FOR',
    proficiency: 'simples',
    category: 'simples',
    properties: ['perfuração', 'arremesso']
  },
  {
    id: 'funda',
    name: 'Funda',
    type: 'distancia',
    damage: '1d4',
    crit: 'x2',
    range: '15m',
    weight: 0.5,
    attrAtaque: 'DES',
    attrDano: 'FOR',
    proficiency: 'simples',
    category: 'simples',
    properties: ['impacto', 'disparo']
  },
  {
    id: 'arco_curto',
    name: 'Arco Curto',
    type: 'distancia',
    damage: '1d6',
    crit: 'x3',
    range: '18m',
    weight: 1,
    attrAtaque: 'DES',
    attrDano: null,
    proficiency: 'simples',
    category: 'simples',
    properties: ['perfuração', 'duas mãos', 'disparo']
  },
  {
    id: 'besta_leve',
    name: 'Besta Leve',
    type: 'distancia',
    damage: '1d8',
    crit: '19/x2',
    range: '18m',
    weight: 3,
    attrAtaque: 'DES',
    attrDano: null,
    proficiency: 'simples',
    category: 'simples',
    properties: ['perfuração', 'duas mãos', 'recarga movimento']
  },

  // --- Armas Marciais Corpo a Corpo ---
  {
    id: 'espada_curta',
    name: 'Espada Curta',
    type: 'leve',
    damage: '1d6',
    crit: '19/x2',
    range: '-',
    weight: 1,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['perfuração']
  },
  {
    id: 'florete',
    name: 'Florete',
    type: 'leve',
    damage: '1d6',
    crit: '18/x2',
    range: '-',
    weight: 1,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['perfuração', 'acuidade']
  },
  {
    id: 'machadinha',
    name: 'Machadinha',
    type: 'leve',
    damage: '1d6',
    crit: 'x3',
    range: '6m',
    weight: 1,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['corte', 'arremesso']
  },
  {
    id: 'espada_longa',
    name: 'Espada Longa',
    type: 'uma_mao',
    damage: '1d8',
    crit: '19/x2',
    range: '-',
    weight: 2,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['corte', 'versátil']
  },
  {
    id: 'cimitarra',
    name: 'Cimitarra',
    type: 'uma_mao',
    damage: '1d6',
    crit: '18/x2',
    range: '-',
    weight: 1.5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['corte']
  },
  {
    id: 'machado_de_batalha',
    name: 'Machado de Batalha',
    type: 'uma_mao',
    damage: '1d8',
    crit: 'x3',
    range: '-',
    weight: 2.5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['corte']
  },
  {
    id: 'martelo_de_guerra',
    name: 'Martelo de Guerra',
    type: 'uma_mao',
    damage: '1d8',
    crit: 'x3',
    range: '-',
    weight: 2.5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['impacto']
  },
  {
    id: 'mangual',
    name: 'Mangual',
    type: 'uma_mao',
    damage: '1d8',
    crit: 'x2',
    range: '-',
    weight: 2.5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['impacto', 'desarmar']
  },
  {
    id: 'tridente',
    name: 'Tridente',
    type: 'uma_mao',
    damage: '1d8',
    crit: 'x2',
    range: '6m',
    weight: 2,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['perfuração', 'arremesso']
  },
  {
    id: 'alabarda',
    name: 'Alabarda',
    type: 'duas_maos',
    damage: '1d10',
    crit: 'x3',
    range: '-',
    weight: 4,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['corte', 'perfuração', 'alcance']
  },
  {
    id: 'machado_de_guerra',
    name: 'Machado de Guerra',
    type: 'duas_maos',
    damage: '1d12',
    crit: 'x3',
    range: '-',
    weight: 4.5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['corte']
  },
  {
    id: 'montante',
    name: 'Montante',
    type: 'duas_maos',
    damage: '2d6',
    crit: '19/x2',
    range: '-',
    weight: 4,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['corte']
  },
  {
    id: 'glaive',
    name: 'Glaive',
    type: 'duas_maos',
    damage: '1d10',
    crit: 'x3',
    range: '-',
    weight: 3.5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['corte', 'alcance']
  },

  // --- Armas Marciais de Disparo ---
  {
    id: 'arco_longo',
    name: 'Arco Longo',
    type: 'distancia',
    damage: '1d8',
    crit: 'x3',
    range: '24m',
    weight: 1.5,
    attrAtaque: 'DES',
    attrDano: null,
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['perfuração', 'duas mãos', 'disparo']
  },
  {
    id: 'besta_pesada',
    name: 'Besta Pesada',
    type: 'distancia',
    damage: '1d12',
    crit: '19/x2',
    range: '27m',
    weight: 4.5,
    attrAtaque: 'DES',
    attrDano: null,
    proficiency: 'marcial',
    category: 'marcial',
    properties: ['perfuração', 'duas mãos', 'recarga padrão']
  },

  // --- Armas de Fogo ---
  {
    id: 'pistola',
    name: 'Pistola',
    type: 'distancia',
    damage: '2d6',
    crit: '19/x3',
    range: '9m',
    weight: 1.5,
    attrAtaque: 'DES',
    attrDano: null,
    proficiency: 'fogo',
    category: 'fogo',
    properties: ['perfuração', 'arma de fogo', 'recarga padrão']
  },
  {
    id: 'mosquete',
    name: 'Mosquete',
    type: 'distancia',
    damage: '2d8',
    crit: '19/x3',
    range: '18m',
    weight: 4.5,
    attrAtaque: 'DES',
    attrDano: null,
    proficiency: 'fogo',
    category: 'fogo',
    properties: ['perfuração', 'duas mãos', 'arma de fogo', 'recarga padrão']
  },

  // --- Armas Exóticas ---
  {
    id: 'katana',
    name: 'Katana',
    type: 'uma_mao',
    damage: '1d10',
    crit: '19/x2',
    range: '-',
    weight: 2,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'exotica',
    category: 'exotica',
    properties: ['corte', 'acuidade', 'versátil']
  },
  {
    id: 'chicote',
    name: 'Chicote',
    type: 'leve',
    damage: '1d3',
    crit: 'x2',
    range: '-',
    weight: 1,
    attrAtaque: 'DES',
    attrDano: 'DES',
    proficiency: 'exotica',
    category: 'exotica',
    properties: ['corte', 'alcance 4,5m', 'desarmar', 'derrubar']
  },
  {
    id: 'espada_taurica',
    name: 'Espada Táurica',
    type: 'duas_maos',
    damage: '2d8',
    crit: 'x2',
    range: '-',
    weight: 5,
    attrAtaque: 'FOR',
    attrDano: 'FOR',
    proficiency: 'exotica',
    category: 'exotica',
    properties: ['corte']
  },
  {
    id: 'corrente_de_espinhos',
    name: 'Corrente de Espinhos',
    type: 'duas_maos',
    damage: '2d4/2d4',
    crit: '19/x2',
    range: '-',
    weight: 3.5,
    attrAtaque: 'DES',
    attrDano: 'DES',
    proficiency: 'exotica',
    category: 'exotica',
    properties: ['perfuração', 'arma dupla', 'alcance', 'desarmar', 'derrubar']
  }
];

export const T20_ARMORS: T20Armor[] = [
  // --- Armaduras Leves ---
  {
    id: 'armadura_acolchoada',
    name: 'Armadura Acolchoada',
    type: 'leve',
    defenseBonus: 1,
    penalty: 0,
    weight: 5,
    properties: []
  },
  {
    id: 'armadura_de_couro',
    name: 'Armadura de Couro',
    type: 'leve',
    defenseBonus: 2,
    maxDex: 5,
    penalty: 0,
    weight: 7,
    properties: []
  },
  {
    id: 'couro_batido',
    name: 'Couro Batido',
    type: 'leve',
    defenseBonus: 3,
    maxDex: 4,
    penalty: -1,
    weight: 10,
    properties: []
  },
  {
    id: 'gibao_de_peles',
    name: 'Gibão de Peles',
    type: 'leve',
    defenseBonus: 4,
    maxDex: 3,
    penalty: -2,
    weight: 12,
    properties: []
  },
  {
    id: 'camisa_de_cota_de_malha',
    name: 'Camisa de Cota de Malha',
    type: 'leve',
    defenseBonus: 5,
    maxDex: 2,
    penalty: -2,
    weight: 12,
    properties: []
  },

  // --- Armaduras Pesadas ---
  {
    id: 'brunea',
    name: 'Brunea',
    type: 'pesada',
    defenseBonus: 5,
    maxDex: 1,
    penalty: -3,
    weight: 15,
    properties: []
  },
  {
    id: 'cota_de_malha',
    name: 'Cota de Malha',
    type: 'pesada',
    defenseBonus: 6,
    maxDex: 1,
    penalty: -4,
    weight: 20,
    properties: []
  },
  {
    id: 'couraca',
    name: 'Couraça',
    type: 'pesada',
    defenseBonus: 7,
    maxDex: 0,
    penalty: -4,
    weight: 18,
    properties: []
  },
  {
    id: 'armadura_segmentada',
    name: 'Armadura Segmentada',
    type: 'pesada',
    defenseBonus: 8,
    maxDex: 0,
    penalty: -5,
    weight: 22,
    properties: []
  },
  {
    id: 'armadura_completa',
    name: 'Armadura Completa',
    type: 'pesada',
    defenseBonus: 10,
    maxDex: 0,
    penalty: -6,
    weight: 25,
    properties: []
  }
];

export const T20_SHIELDS: T20Shield[] = [
  {
    id: 'escudo_leve',
    name: 'Escudo Leve',
    defenseBonus: 1,
    penalty: -1,
    weight: 2.5,
    properties: []
  },
  {
    id: 'escudo_pesado',
    name: 'Escudo Pesado',
    defenseBonus: 2,
    penalty: -2,
    weight: 7.5,
    properties: []
  },
  {
    id: 'escudo_de_corpo',
    name: 'Escudo de Corpo',
    defenseBonus: 4,
    penalty: -5,
    weight: 15,
    properties: ['cobertura']
  }
];
