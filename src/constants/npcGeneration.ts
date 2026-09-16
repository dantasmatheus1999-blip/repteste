
export interface RaceOption {
  id: string;
  label: string;
  nameEn: string;
  features: string;
}

export interface ClassOption {
  id: string;
  label: string;
  nameEn: string;
  clothing: string;
  effects: string;
}

export interface StyleOption {
  id: string;
  label: string;
  prompt: string;
}

export interface EquipmentOption {
  id: string;
  label: string;
  prompt: string;
  reinforcement: string;
}

export const NPC_RACES: RaceOption[] = [
  { id: 'human', label: 'Humano', nameEn: 'human', features: 'balanced proportions' },
  { id: 'elf', label: 'Elfo', nameEn: 'elf', features: 'elegant, slender, refined' },
  { id: 'dwarf', label: 'Anão', nameEn: 'dwarf', features: 'stocky, heavy build, rugged' },
  { id: 'orc', label: 'Orc', nameEn: 'orc', features: 'muscular, brutal' },
  { id: 'golem', label: 'Golem', nameEn: 'golem', features: 'stone skin, metallic parts' },
  { id: 'qareen', label: 'Qareen', nameEn: 'qareen', features: 'mystical skin, elemental aura' },
  { id: 'dahllan', label: 'Dahllan', nameEn: 'dahllan', features: 'plant-like features, forest theme' },
  { id: 'lefou', label: 'Lefou', nameEn: 'lefou', features: 'distorted features, chitinous parts' },
];

export const NPC_CLASSES: ClassOption[] = [
  { id: 'warrior', label: 'Guerreiro', nameEn: 'warrior', clothing: 'wearing detailed armor, strong presence', effects: 'combat style' },
  { id: 'mage', label: 'Mago', nameEn: 'mage', clothing: 'wearing arcane robes', effects: 'magical aura, arcane energy' },
  { id: 'paladin', label: 'Paladino', nameEn: 'paladin', clothing: 'wearing heavy plate armor', effects: 'holy aura' },
  { id: 'archer', label: 'Arqueiro', nameEn: 'archer', clothing: 'wearing light leather armor', effects: 'agile stance' },
  { id: 'bard', label: 'Bardo', nameEn: 'bard', clothing: 'wearing colorful clothes', effects: 'musical presence' },
  { id: 'rogue', label: 'Ladino', nameEn: 'rogue', clothing: 'wearing hooded cloak, dark leather armor', effects: 'stealthy aura' },
  { id: 'cleric', label: 'Clérigo', nameEn: 'cleric', clothing: 'wearing religious vestments', effects: 'divine light' },
  { id: 'druid', label: 'Druida', nameEn: 'druid', clothing: 'wearing furs and leaves', effects: 'nature aura' },
];

export const NPC_STYLES: StyleOption[] = [
  { id: 'none', label: 'Padrão', prompt: '' },
  { id: 'dark', label: 'Dark Fantasy', prompt: 'dark fantasy, grimdark, dramatic shadows' },
  { id: 'heroic', label: 'Heroico', prompt: 'heroic, epic lighting' },
  { id: 'holy', label: 'Sagrado', prompt: 'holy aura, divine light' },
  { id: 'nature', label: 'Natureza', prompt: 'nature theme, forest elements' },
];

export const NPC_EQUIPMENTS: EquipmentOption[] = [
  { id: 'none', label: 'Nenhum', prompt: '', reinforcement: '' },
  { id: 'sword', label: 'Espada', prompt: 'holding a straight sword', reinforcement: 'sword clearly visible' },
  { id: 'shield', label: 'Escudo', prompt: 'holding a sturdy shield', reinforcement: 'shield clearly visible' },
  { id: 'bow', label: 'Arco', prompt: 'holding a longbow', reinforcement: 'bow clearly visible, archer stance' },
  { id: 'staff', label: 'Cajado', prompt: 'holding a magical staff', reinforcement: 'staff clearly visible' },
  { id: 'daggers', label: 'Adagas', prompt: 'holding twin daggers', reinforcement: 'daggers clearly visible' },
  { id: 'axe', label: 'Machado', prompt: 'holding a heavy axe', reinforcement: 'axe clearly visible' },
];

export const FACE_QUALITY_PROMPT = "detailed face, well-defined facial features, symmetrical face, sharp eyes, realistic face proportions, face in focus";

export const FIXED_BASE_PROMPT = "fantasy RPG character, full body, centered, neutral pose, highly detailed, cinematic lighting, clean background, symmetrical, correct anatomy, properly proportioned, sharp focus";
