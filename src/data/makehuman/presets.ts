export type GenderType = 'male' | 'female';
export type ViewMode = 'full_body' | 'face' | 'torso';

export interface SkinToneOption {
  id: string;
  name: string;
  hex: string;
  threeColor: number;
  description: string;
  warmth: number; // 0 a 1
}

export interface EyeColorOption {
  id: string;
  name: string;
  hex: string;
  threeColor: number;
  description: string;
}

export interface BodyProportionPreset {
  id: string;
  name: string;
  description: string;
  heightScale: number;
  muscleScale: number;
  shoulderScale: number;
}

export interface CharacterPreset {
  id: string;
  name: string;
  archetype: string;
  gender: GenderType;
  description: string;
  hairStyleId: string;
  hairColorId: string;
  skinToneId: string;
  eyeColorId: string;
  facialHairId: string;
  bodyPresetId: string;
  badge: string;
}

export interface AssetLicenseInfo {
  assetName: string;
  file: string;
  source: string;
  license: string;
  author: string;
  notes: string;
  commercialUseAllowed: boolean;
}

export const SKIN_TONES: SkinToneOption[] = [
  {
    id: 'pale_nordic',
    name: 'Pálido Nórdico',
    hex: '#ffebd9',
    threeColor: 0xffebd9,
    description: 'Pele muito clara com subtons frios/rosados',
    warmth: 0.2
  },
  {
    id: 'fair_light',
    name: 'Claro Dourado',
    hex: '#f7dcc4',
    threeColor: 0xf7dcc4,
    description: 'Tom claro natural com nuances ambaradas',
    warmth: 0.4
  },
  {
    id: 'tan_sun',
    name: 'Bronzeado / Trigueiro',
    hex: '#e2be9b',
    threeColor: 0xe2be9b,
    description: 'Tom médio beijado pelo sol, típico de aventureiros',
    warmth: 0.6
  },
  {
    id: 'olive_med',
    name: 'Moreno Mediterrâneo',
    hex: '#ba8c68',
    threeColor: 0xba8c68,
    description: 'Pele morena com subtons oliva ricos',
    warmth: 0.7
  },
  {
    id: 'deep_bronze',
    name: 'Bronze Profundo',
    hex: '#8d5b38',
    threeColor: 0x8d5b38,
    description: 'Tom escuro quente com brilho acobreado',
    warmth: 0.8
  },
  {
    id: 'ebony_dark',
    name: 'Ébano / Escuro',
    hex: '#513220',
    threeColor: 0x513220,
    description: 'Pele negra profunda e elegante',
    warmth: 0.9
  }
];

export const EYE_COLORS: EyeColorOption[] = [
  {
    id: 'deep_brown',
    name: 'Castanho Profundo',
    hex: '#4a2f1b',
    threeColor: 0x4a2f1b,
    description: 'Olhos castanhos escuros e expressivos'
  },
  {
    id: 'sapphire_blue',
    name: 'Azul Safira',
    hex: '#2b6cb0',
    threeColor: 0x2b6cb0,
    description: 'Azul oceânico brilhante'
  },
  {
    id: 'emerald_green',
    name: 'Verde Esmeralda',
    hex: '#2f855a',
    threeColor: 0x2f855a,
    description: 'Verde florestal místico'
  },
  {
    id: 'golden_amber',
    name: 'Âmbar Dourado',
    hex: '#b7791f',
    threeColor: 0xb7791f,
    description: 'Olhos cor de mel ou felinos'
  },
  {
    id: 'storm_gray',
    name: 'Cinza Tempestade',
    hex: '#718096',
    threeColor: 0x718096,
    description: 'Cinza prateado de veterano'
  },
  {
    id: 'violet_arcane',
    name: 'Púrpura / Violeta',
    hex: '#6b46c1',
    threeColor: 0x6b46c1,
    description: 'Toque místico de linhagem arcana'
  }
];

export const BODY_PRESETS: BodyProportionPreset[] = [
  {
    id: 'athletic',
    name: 'Atlético Equilibrado',
    description: 'Proporções anatômicas padrão da base MakeHuman (1.80m / 75kg)',
    heightScale: 1.0,
    muscleScale: 1.0,
    shoulderScale: 1.0
  },
  {
    id: 'robust',
    name: 'Robusto / Guerreiro',
    description: 'Ombros largos, musculatura firme e postura imponente',
    heightScale: 1.04,
    muscleScale: 1.15,
    shoulderScale: 1.1
  },
  {
    id: 'slender',
    name: 'Esbelto / Ágil',
    description: 'Silhueta ágil para ladinos, elfos ou conjuradores',
    heightScale: 0.98,
    muscleScale: 0.9,
    shoulderScale: 0.92
  },
  {
    id: 'tall',
    name: 'Alto / Majestoso',
    description: 'Estatura elevada para nobres ou guardiões (1.92m)',
    heightScale: 1.08,
    muscleScale: 1.05,
    shoulderScale: 1.04
  }
];

export const CHARACTER_PRESETS: CharacterPreset[] = [
  // Presets Masculinos
  {
    id: 'preset_male_warrior',
    name: 'Guerreiro Veterano',
    archetype: 'Combatente',
    gender: 'male',
    description: 'Cicatrizes do campo de batalha, barba cerrada e olhar resoluto.',
    hairStyleId: 'vitruvian_hair',
    hairColorId: 'dark_brown',
    skinToneId: 'tan_sun',
    eyeColorId: 'storm_gray',
    facialHairId: 'stubble',
    bodyPresetId: 'robust',
    badge: 'Guerreiro'
  },
  {
    id: 'preset_male_paladin',
    name: 'Paladino Sagrado',
    archetype: 'Guardião',
    gender: 'male',
    description: 'Cabelos dourados, postura ereta e olhos safira de justiça.',
    hairStyleId: 'vitruvian_hair',
    hairColorId: 'blonde',
    skinToneId: 'fair_light',
    eyeColorId: 'sapphire_blue',
    facialHairId: 'none',
    bodyPresetId: 'tall',
    badge: 'Paladino'
  },
  {
    id: 'preset_male_rogue',
    name: 'Ladino das Sombras',
    archetype: 'Especialista',
    gender: 'male',
    description: 'Ágil, discreto, cabelos pretos e olhar atento aos detalhes.',
    hairStyleId: 'hairtool_cards',
    hairColorId: 'black',
    skinToneId: 'olive_med',
    eyeColorId: 'emerald_green',
    facialHairId: 'goatee',
    bodyPresetId: 'slender',
    badge: 'Ladino'
  },
  {
    id: 'preset_male_northman',
    name: 'Bárbaro do Norte',
    archetype: 'Bárbaro',
    gender: 'male',
    description: 'Forte como a montanha, pele clara e cabelos ruivos de fogo.',
    hairStyleId: 'vitruvian_hair',
    hairColorId: 'red',
    skinToneId: 'pale_nordic',
    eyeColorId: 'golden_amber',
    facialHairId: 'full_beard',
    bodyPresetId: 'robust',
    badge: 'Nórdico'
  },
  {
    id: 'preset_male_monk',
    name: 'Monge Asceta',
    archetype: 'Místico',
    gender: 'male',
    description: 'Mente e corpo esculpidos, cabeça raspada e olhos penetrantes.',
    hairStyleId: 'none',
    hairColorId: 'black',
    skinToneId: 'deep_bronze',
    eyeColorId: 'golden_amber',
    facialHairId: 'none',
    bodyPresetId: 'athletic',
    badge: 'Monge'
  },

  // Presets Femininos
  {
    id: 'preset_female_knight',
    name: 'Cavaleira de Arton',
    archetype: 'Combatente',
    gender: 'female',
    description: 'Porte nobre, disciplina marcial e olhar determinado.',
    hairStyleId: 'hairtool_cards',
    hairColorId: 'dark_brown',
    skinToneId: 'fair_light',
    eyeColorId: 'emerald_green',
    facialHairId: 'none',
    bodyPresetId: 'athletic',
    badge: 'Cavaleira'
  },
  {
    id: 'preset_female_mage',
    name: 'Feiticeira Arcana',
    archetype: 'Conjuradora',
    gender: 'female',
    description: 'Linhagem ancestral manifestada em olhos violeta e cabelos platinados.',
    hairStyleId: 'vitruvian_hair',
    hairColorId: 'white',
    skinToneId: 'pale_nordic',
    eyeColorId: 'violet_arcane',
    facialHairId: 'none',
    bodyPresetId: 'slender',
    badge: 'Arcanista'
  },
  {
    id: 'preset_female_ranger',
    name: 'Patrulheira Selvagem',
    archetype: 'Exploradora',
    gender: 'female',
    description: 'Habitante das matas de Arton, pele morena e cabelos ruivos.',
    hairStyleId: 'hairtool_cards',
    hairColorId: 'red',
    skinToneId: 'tan_sun',
    eyeColorId: 'golden_amber',
    facialHairId: 'none',
    bodyPresetId: 'athletic',
    badge: 'Ranger'
  },
  {
    id: 'preset_female_noble',
    name: 'Nobre Diplomata',
    archetype: 'Líder',
    gender: 'female',
    description: 'Presença magnética, traços refinados e pele ébano deslumbrante.',
    hairStyleId: 'vitruvian_hair',
    hairColorId: 'black',
    skinToneId: 'ebony_dark',
    eyeColorId: 'deep_brown',
    facialHairId: 'none',
    bodyPresetId: 'tall',
    badge: 'Nobre'
  }
];

export const ASSET_LICENSES: AssetLicenseInfo[] = [
  {
    assetName: 'Vitruvian Base Human Body (vitruvian_body.glb)',
    file: '/models/vitruvian/vitruvian_body.glb',
    source: 'https://github.com/ibrews/VitruvianGodot (MakeHuman / MPFB Topology Base)',
    license: 'Creative Commons CC0 1.0 Universal (Public Domain Dedication)',
    author: 'ibrews & MakeHuman Community',
    notes: 'Modelo humano completo com topologia quad limpa, mapas PBR 4K de albedo, normal e roughness.',
    commercialUseAllowed: true
  },
  {
    assetName: 'Vitruvian Modular Head (vitruvian_head.glb)',
    file: '/models/vitruvian/vitruvian_head.glb',
    source: 'https://github.com/ibrews/VitruvianGodot',
    license: 'Creative Commons CC0 1.0 Universal (Public Domain Dedication)',
    author: 'ibrews & MakeHuman Community',
    notes: 'Cabeça modular separada com esclera, íris e córnea PBR translúcida para fidelidade realista.',
    commercialUseAllowed: true
  },
  {
    assetName: 'Vitruvian PBR Hair (vitruvian_hair.glb)',
    file: '/models/vitruvian/vitruvian_hair.glb',
    source: 'https://github.com/ibrews/VitruvianGodot',
    license: 'Creative Commons CC0 1.0 Universal (Public Domain Dedication)',
    author: 'ibrews & MakeHuman Community',
    notes: 'Cabelo em mechas 3D com normais tangentes, alpha test e ambient occlusion.',
    commercialUseAllowed: true
  },
  {
    assetName: 'HairTool Cards (hairtool_cards.glb)',
    file: '/models/vitruvian/hairtool_cards.glb',
    source: 'HairTool Blender addon CC0 sample cards / VitruvianGodot addon',
    license: 'Creative Commons CC0 1.0 Universal (Public Domain Dedication)',
    author: 'MakeHuman / Blender HairTool Community',
    notes: 'Conjunto de hair cards otimizado para renderização realtime em dispositivos móveis.',
    commercialUseAllowed: true
  }
];
