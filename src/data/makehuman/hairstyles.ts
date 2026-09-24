export interface HairStyleOption {
  id: string;
  name: string;
  category: 'short' | 'medium' | 'long' | 'none';
  glbAsset: string | null;
  description: string;
  badge?: string;
  polyEstimate: string;
}

export interface HairColorOption {
  id: string;
  name: string;
  hex: string;
  threeColor: number;
  description: string;
}

export interface FacialHairOption {
  id: string;
  name: string;
  category: 'clean' | 'stubble' | 'beard' | 'mustache';
  description: string;
  density: number; // 0 a 1
}

export const HAIR_STYLES: HairStyleOption[] = [
  {
    id: 'none',
    name: 'Careca / Raspado',
    category: 'none',
    glbAsset: null,
    description: 'Sem cabelo ou raspado militar. Ideal para visual austero ou monges.',
    badge: 'Base',
    polyEstimate: '0 tris'
  },
  {
    id: 'vitruvian_hair',
    name: 'Vitruvian Clássico',
    category: 'medium',
    glbAsset: '/models/vitruvian/vitruvian_hair.glb',
    description: 'Estilo clássico em mechas PBR detalhadas com franja esculpida e costeletas.',
    badge: 'PBR CC0',
    polyEstimate: '~42k tris'
  },
  {
    id: 'hairtool_cards',
    name: 'HairTool Cards (Fios)',
    category: 'short',
    glbAsset: '/models/vitruvian/hairtool_cards.glb',
    description: 'Camadas de Hair Cards alpha-blended para simulação volumétrica de fios.',
    badge: 'Cards',
    polyEstimate: '~36k tris'
  }
];

export const HAIR_COLORS: HairColorOption[] = [
  {
    id: 'black',
    name: 'Preto Ébano',
    hex: '#18181b',
    threeColor: 0x18181b,
    description: 'Preto profundo natural com brilho suave'
  },
  {
    id: 'dark_brown',
    name: 'Castanho Escuro',
    hex: '#3d2618',
    threeColor: 0x3d2618,
    description: 'Castanho clássico de madeira nobre'
  },
  {
    id: 'light_brown',
    name: 'Castanho Claro',
    hex: '#6e4827',
    threeColor: 0x6e4827,
    description: 'Castanho avelã com nuances quentes'
  },
  {
    id: 'blonde',
    name: 'Loiro Dourado',
    hex: '#dfba6a',
    threeColor: 0xdfba6a,
    description: 'Loiro palha luminoso'
  },
  {
    id: 'red',
    name: 'Ruivo Carmesim',
    hex: '#c83e18',
    threeColor: 0xc83e18,
    description: 'Ruivo fogo intenso'
  },
  {
    id: 'gray',
    name: 'Grisalho Veterano',
    hex: '#787882',
    threeColor: 0x787882,
    description: 'Mescla de prata e grafite maduro'
  },
  {
    id: 'white',
    name: 'Branco Platinado',
    hex: '#f1f1f5',
    threeColor: 0xf1f1f5,
    description: 'Branco ancestral albino ou arcano'
  }
];

export const FACIAL_HAIR_OPTIONS: FacialHairOption[] = [
  {
    id: 'none',
    name: 'Sem Barba (Raspado)',
    category: 'clean',
    description: 'Rosto completamente limpo e polido',
    density: 0
  },
  {
    id: 'stubble',
    name: 'Barba Cerrada / Por Fazer',
    category: 'stubble',
    description: 'Sombra de barba de poucos dias, aspecto rústico',
    density: 0.35
  },
  {
    id: 'short_beard',
    name: 'Barba Curta Aparada',
    category: 'beard',
    description: 'Contornos bem definidos e comprimento médio',
    density: 0.65
  },
  {
    id: 'full_beard',
    name: 'Barba Completa Guerreira',
    category: 'beard',
    description: 'Volume robusto de aventureiro nórdico',
    density: 1.0
  },
  {
    id: 'goatee',
    name: 'Cavanhaque Imperial',
    category: 'beard',
    description: 'Queixo e bigode conectados com bochechas limpas',
    density: 0.7
  },
  {
    id: 'mustache',
    name: 'Bigode de Cavalheiro',
    category: 'mustache',
    description: 'Bigode denso tradicional',
    density: 0.8
  }
];
