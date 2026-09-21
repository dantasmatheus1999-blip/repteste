import * as THREE from 'three';

/**
 * Standard fixed resolution for all Realmor 3D polyhedral dice templates, 
 * UV nets, runtime textures, and skins (1024x1024 px).
 */
export const DICE_TEXTURE_RESOLUTION = 1024;

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export type BuiltInDiceSkinId = 
  | 'tormenta'       // Crimson Ruby & Gold (Signature Realmor)
  | 'black_obsidian' // Matte Black & Red (Reference Video)
  | 'medieval'       // Aged Iron & Bone
  | 'arcane'         // Astral Blue & Cyan Glow
  | 'golden'         // Royal Gold & Onyx
  | 'emerald'        // Jade Green & Brass
  | 'amethyst';      // Purple Crystal & Silver

export type DiceSkin = BuiltInDiceSkinId | string;

export interface DiceFaceDefinition {
  faceIndex: number;
  faceId: string; // e.g. "FACE_01", "FACE_20"
  value: number | string; // e.g. 20, 1, "00"
  label: string; // e.g. "20", "Crítico", "1"
  uvCoords: [number, number][]; // 2D polygon vertices in [0..1] texture space
  centerUV: [number, number]; // center of face on UV texture
  normal: [number, number, number]; // 3D unit normal vector pointing outwards
  upVector?: [number, number, number]; // 3D vector representing "up" on the face for text alignment
}

export interface DiceTemplateConfig {
  diceType: DiceType;
  name: string;
  faceCount: number;
  aspectRatio: number;
  recommendedResolution: { width: number; height: number };
  faces: DiceFaceDefinition[];
  foldLines: [number, number][][];
}

export interface DiceSkinConfig {
  id: DiceSkin;
  name: string;
  description: string;
  diceType?: DiceType;
  isBuiltIn?: boolean;
  textureUrl?: string;
  previewUrl?: string;
  baseColor: string;
  edgeColor: string;
  numberColor: string;
  highlightColor: string;
  roughness: number;
  metalness: number;
  specular?: string;
  glow?: string;
  badgeBg?: string;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
}

export interface DiceMeshInfo {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  faceValues: (number | string)[];
  faceNormals: THREE.Vector3[];
  faceIds: string[];
  radius: number;
}

export interface DiceRollRequest {
  diceType?: DiceType;
  skin?: DiceSkin;
  modifier?: number;
  label?: string;
  formula?: string;
  forcedValue?: number; // for testing or specific rolls
  onComplete?: (result: DiceRollResult) => void;
}

export interface DiceRollResult {
  id: string;
  diceType: DiceType;
  skin: DiceSkin;
  naturalRoll: number;
  modifier: number;
  total: number;
  formula: string;
  label: string;
  isNat20?: boolean;
  isNat1?: boolean;
  timestamp: number;
}

export interface SkinValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  dimensions?: { width: number; height: number };
}
