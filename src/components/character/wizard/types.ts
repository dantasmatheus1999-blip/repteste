import { Attribute, CharacterAttack, CharacterItem, CharacterPower, CharacterSpell, CharacterSkill } from '../../../types/character';
import { T20_SKILLS } from '../../../data/t20Data';

export interface WizardData {
  // 1. Identidade
  name: string;
  playerName: string;
  imageUrl: string;
  deity?: string;
  age?: string;
  gender?: string;

  // 2. Raça
  raceId: string;
  raceName: string;
  raceBonusAttrs: Partial<Record<Attribute, number>>;

  // 3. Origem
  originId: string;
  originName: string;

  // 4. Classe
  classId: string;
  className: string;
  level: number;

  // 5. Atributos
  baseAttributes: Record<Attribute, number>;
  attributes: Record<Attribute, number>;
  attrModifiers: Record<Attribute, number>;

  // 6. Perícias
  trainedSkills: string[];
  skills: CharacterSkill[];

  // 7. Combate
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

  // 8. Ataques
  attacks: CharacterAttack[];

  // 9. Equipamentos
  equipment: CharacterItem[];

  // 10. Poderes
  powers: CharacterPower[];

  // 11. Magias
  spells: CharacterSpell[];

  // 12. Histórico
  history: string;
  xp: number;
}

export const ATTRIBUTES_LIST: { key: Attribute; name: string; desc: string }[] = [
  { key: 'FOR', name: 'Força', desc: 'Poder muscular, dano corpo a corpo e capacidade de carga' },
  { key: 'DES', name: 'Destreza', desc: 'Agilidade, reflexos, equilíbrio e pontaria à distância' },
  { key: 'CON', name: 'Constituição', desc: 'Vigor físico, resistência a venenos e Pontos de Vida' },
  { key: 'INT', name: 'Inteligência', desc: 'Raciocínio, memória, conhecimento e perícias extras' },
  { key: 'SAB', name: 'Sabedoria', desc: 'Percepção, intuição, força de vontade e conexão espiritual' },
  { key: 'CAR', name: 'Carisma', desc: 'Magnetismo pessoal, persuasão, liderança e presença' }
];

export const PRESET_AVATARS = [
  {
    id: 'warrior-male',
    label: 'Guerreiro de Armadura',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'mage-female',
    label: 'Maga Arcana',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'elf-ranger',
    label: 'Caçador Élfico',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cleric-devout',
    label: 'Clériga Sagrada',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rogue-shadow',
    label: 'Ladino Sombrio',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwarf-knight',
    label: 'Cavaleiro Anão',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'bard-mystic',
    label: 'Bardo Encantador',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'barbarian-wild',
    label: 'Bárbaro Selvagem',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_WIZARD_DATA: WizardData = {
  name: '',
  playerName: '',
  imageUrl: PRESET_AVATARS[0].url,
  deity: '',
  age: '',
  gender: '',
  raceId: 'humano',
  raceName: 'Humano',
  raceBonusAttrs: {},
  originId: 'soldado',
  originName: 'Soldado',
  classId: 'guerreiro',
  className: 'Guerreiro',
  level: 1,
  baseAttributes: {
    FOR: 0,
    DES: 0,
    CON: 0,
    INT: 0,
    SAB: 0,
    CAR: 0
  },
  attributes: {
    FOR: 0,
    DES: 0,
    CON: 0,
    INT: 0,
    SAB: 0,
    CAR: 0
  },
  attrModifiers: {
    FOR: 0,
    DES: 0,
    CON: 0,
    INT: 0,
    SAB: 0,
    CAR: 0
  },
  trainedSkills: ['luta', 'fortitude'],
  skills: [],
  hp: 20,
  hpMax: 20,
  mana: 3,
  manaMax: 3,
  defense: 10,
  armor: {
    name: 'Couro Batido',
    defenseBonus: 3,
    penalty: -1,
    type: 'leve'
  },
  shield: {
    name: 'Nenhum',
    defenseBonus: 0,
    penalty: 0
  },
  size: 'Médio',
  movement: '9m',
  attacks: [
    {
      id: 'atk-1',
      name: 'Espada Longa',
      attackTest: '+2',
      damage: '1d8',
      crit: '19/x2',
      type: 'Corte',
      range: 'Corpo a corpo'
    }
  ],
  equipment: [
    { id: 'eq-1', name: 'Mochila de Aventureiro', quantity: 1, weight: 2 },
    { id: 'eq-2', name: 'Rações de Viagem (3 dias)', quantity: 3, weight: 1.5 },
    { id: 'eq-3', name: 'Corda (15m)', quantity: 1, weight: 5 }
  ],
  powers: [],
  spells: [],
  history: '',
  xp: 0
};

// Calculation helpers (Tormenta 20 Edição Jogo do Ano: o atributo é o próprio modificador)
export function calcMod(val: number): number {
  const v = Number(val || 0);
  return v >= 8 ? Math.floor((v - 10) / 2) : v;
}

export function calcHalfLevel(level: number): number {
  return Math.floor(level / 2);
}

export function calcTrainingBonus(level: number): number {
  if (level >= 15) return 6;
  if (level >= 7) return 4;
  return 2;
}

export function buildSkillsList(
  level: number,
  attrMods: Record<Attribute, number>,
  trainedIds: string[]
): CharacterSkill[] {
  const half = calcHalfLevel(level);
  const trainBonus = calcTrainingBonus(level);

  return T20_SKILLS.map((sk) => {
    const attr = sk.attr as Attribute;
    const mod = attrMods[attr] || 0;
    const isTrained = trainedIds.includes(sk.id);
    const tb = isTrained ? trainBonus : 0;
    const total = half + mod + tb;

    return {
      id: sk.id,
      name: sk.name,
      attr,
      trained: isTrained,
      total,
      attrMod: mod,
      halfLevel: half,
      trainingBonus: tb,
      others: 0
    };
  });
}
