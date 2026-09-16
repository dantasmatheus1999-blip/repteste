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
  category: 'simples' | 'marcial' | 'exotica';
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
    properties: ['corte']
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
    properties: ['perfuração']
  },
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
    properties: ['perfuração']
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
  }
];

export const T20_ARMORS: T20Armor[] = [
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
  }
];
