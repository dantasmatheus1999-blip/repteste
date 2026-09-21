import * as THREE from 'three';
import { DiceType, DiceSkin, DiceSkinConfig, DICE_TEXTURE_RESOLUTION } from './types';
import { DICE_SKINS } from './diceSkins';
import { getDiceTemplate } from './DiceTemplateManager';

// Texture & Material Caches
const TEXTURE_CACHE = new Map<string, THREE.Texture>();
const MATERIAL_CACHE = new Map<string, THREE.MeshStandardMaterial>();
const CUSTOM_SKINS_LOOKUP = new Map<string, DiceSkinConfig>();

export function registerCustomSkinLookup(skin: DiceSkinConfig) {
  if (skin?.id) {
    CUSTOM_SKINS_LOOKUP.set(skin.id, skin);
  }
}

export function registerMultipleCustomSkinLookups(skins: DiceSkinConfig[]) {
  skins.forEach(s => {
    if (s?.id) CUSTOM_SKINS_LOOKUP.set(s.id, s);
  });
}

function getCustomSkinById(id: string): DiceSkinConfig | undefined {
  if (CUSTOM_SKINS_LOOKUP.has(id)) {
    return CUSTOM_SKINS_LOOKUP.get(id);
  }
  // Try reading from localStorage fallback
  try {
    const raw = localStorage.getItem('realmor_custom_dice_skins_v1');
    if (raw) {
      const parsed: DiceSkinConfig[] = JSON.parse(raw);
      const found = parsed.find(s => s.id === id);
      if (found) {
        CUSTOM_SKINS_LOOKUP.set(id, found);
        return found;
      }
    }
  } catch {}
  return undefined;
}

/**
 * Procedurally generates a standard (1024x1024) texture atlas conforming
 * exactly to the official unwrapped UV template for a built-in skin config.
 */
export function generateSkinAtlasTexture(diceType: DiceType, skinConfig: DiceSkinConfig): THREE.CanvasTexture {
  const cacheKey = `atlas_${diceType}_${skinConfig.id}`;
  if (TEXTURE_CACHE.has(cacheKey)) {
    return TEXTURE_CACHE.get(cacheKey) as THREE.CanvasTexture;
  }

  const template = getDiceTemplate(diceType);
  const size = DICE_TEXTURE_RESOLUTION; // 1024
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallbackTex = new THREE.CanvasTexture(canvas);
    return fallbackTex;
  }

  // 1. Base background texture fill
  ctx.fillStyle = skinConfig.edgeColor || '#0a0a0c';
  ctx.fillRect(0, 0, size, size);

  // Subtle background grain/noise
  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.7);
  grad.addColorStop(0, skinConfig.baseColor);
  grad.addColorStop(1, skinConfig.edgeColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 2. Render each face polygon on the atlas
  template.faces.forEach((face) => {
    const pts = face.uvCoords.map(([u, v]) => ({
      x: u * size,
      y: (1 - v) * size
    }));

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();

    // Fill face with rich gradient & metallic/gemstone shading
    const cx = face.centerUV[0] * size;
    const cy = (1 - face.centerUV[1]) * size;

    const faceGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, size / 6);
    faceGrad.addColorStop(0, skinConfig.highlightColor || '#ffffff');
    faceGrad.addColorStop(0.3, skinConfig.baseColor);
    faceGrad.addColorStop(0.85, skinConfig.baseColor);
    faceGrad.addColorStop(1, skinConfig.edgeColor);

    ctx.fillStyle = faceGrad;
    ctx.fill();

    // Outer and inner border bevels for realistic 3D engraving
    ctx.strokeStyle = skinConfig.edgeColor;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.strokeStyle = skinConfig.highlightColor || 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Draw Number / Glyph on Face
    const isSpecialNat20 = face.value === 20 || face.value === '20';
    const isSpecialNat1 = face.value === 1 || face.value === '1';

    // Text Shadow for depth
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    if (isSpecialNat20) {
      ctx.fillStyle = '#ffdf00'; // Bright Gold for Natural 20
      ctx.strokeStyle = '#7c2d12';
    } else if (isSpecialNat1) {
      ctx.fillStyle = '#ef4444'; // Crimson for Natural 1
      ctx.strokeStyle = '#450a0a';
    } else {
      ctx.fillStyle = skinConfig.numberColor;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    }

    // Dynamic typography scaling based on face count
    let fontSize = 38;
    if (diceType === 'd20') fontSize = 42;
    if (diceType === 'd6') fontSize = 64;
    if (diceType === 'd4') fontSize = 48;
    if (diceType === 'd100') fontSize = 36;

    ctx.font = `900 ${fontSize}px "Cinzel Decorative", "Cinzel", "Trajan Pro", "Times New Roman", serif, system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = String(face.value);
    ctx.lineWidth = 3;
    ctx.strokeText(text, cx, cy);
    ctx.fillText(text, cx, cy);

    // Subtle underline for 6 and 9 disambiguation on D20/D10/D12
    if ((text === '6' || text === '9') && (diceType === 'd20' || diceType === 'd10' || diceType === 'd12')) {
      const underlineY = cy + fontSize * 0.52;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 12, underlineY);
      ctx.lineTo(cx + 12, underlineY);
      ctx.stroke();
    }

    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  TEXTURE_CACHE.set(cacheKey, texture);
  return texture;
}

/**
 * Loads a texture from an external URL or Firebase Storage URL.
 */
export function loadExternalSkinTexture(url: string): Promise<THREE.Texture> {
  if (TEXTURE_CACHE.has(url)) {
    return Promise.resolve(TEXTURE_CACHE.get(url)!);
  }

  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        TEXTURE_CACHE.set(url, tex);
        resolve(tex);
      },
      undefined,
      (err) => {
        console.warn(`[DiceTextureLoader] Failed to load texture at ${url}, using fallback.`, err);
        reject(err);
      }
    );
  });
}

/**
 * Gets or creates a high-performance THREE.MeshStandardMaterial for a given dice type and skin.
 */
export async function getDiceMaterial(
  diceType: DiceType,
  skinIdOrConfig: DiceSkin | DiceSkinConfig
): Promise<THREE.MeshStandardMaterial> {
  let skinConfig: DiceSkinConfig;

  if (typeof skinIdOrConfig === 'string') {
    if (DICE_SKINS[skinIdOrConfig]) {
      skinConfig = DICE_SKINS[skinIdOrConfig];
    } else {
      // Check custom skin registry/cache if available
      const customSkin = getCustomSkinById(skinIdOrConfig);
      if (customSkin) {
        skinConfig = customSkin;
      } else {
        skinConfig = DICE_SKINS['black_obsidian'];
      }
    }
  } else {
    skinConfig = skinIdOrConfig;
  }

  const matKey = `${diceType}_${skinConfig.id}_${skinConfig.textureUrl || 'builtin'}`;
  if (MATERIAL_CACHE.has(matKey)) {
    return MATERIAL_CACHE.get(matKey)!;
  }

  let texture: THREE.Texture;

  if (skinConfig.textureUrl) {
    try {
      texture = await loadExternalSkinTexture(skinConfig.textureUrl);
    } catch {
      texture = generateSkinAtlasTexture(diceType, skinConfig);
    }
  } else {
    texture = generateSkinAtlasTexture(diceType, skinConfig);
  }

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: skinConfig.roughness ?? 0.3,
    metalness: skinConfig.metalness ?? 0.3,
    envMapIntensity: 1.2
  });

  if (skinConfig.glow) {
    material.emissive = new THREE.Color(skinConfig.glow);
    material.emissiveIntensity = 0.15;
  }

  MATERIAL_CACHE.set(matKey, material);
  return material;
}

/**
 * Synchronous version for initial rendering using built-ins or cached textures.
 */
export function getDiceMaterialSync(
  diceType: DiceType,
  skinIdOrConfig: DiceSkin | DiceSkinConfig
): THREE.MeshStandardMaterial {
  let skinConfig: DiceSkinConfig;

  if (typeof skinIdOrConfig === 'string') {
    if (DICE_SKINS[skinIdOrConfig]) {
      skinConfig = DICE_SKINS[skinIdOrConfig];
    } else {
      const customSkin = getCustomSkinById(skinIdOrConfig);
      skinConfig = customSkin || DICE_SKINS['black_obsidian'];
    }
  } else {
    skinConfig = skinIdOrConfig;
  }

  const matKey = `${diceType}_${skinConfig.id}_sync`;
  if (MATERIAL_CACHE.has(matKey)) {
    return MATERIAL_CACHE.get(matKey)!;
  }

  let texture: THREE.Texture;
  if (skinConfig.textureUrl && TEXTURE_CACHE.has(skinConfig.textureUrl)) {
    texture = TEXTURE_CACHE.get(skinConfig.textureUrl)!;
  } else {
    texture = generateSkinAtlasTexture(diceType, skinConfig);
  }

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: skinConfig.roughness ?? 0.3,
    metalness: skinConfig.metalness ?? 0.3,
    envMapIntensity: 1.2
  });

  MATERIAL_CACHE.set(matKey, material);
  return material;
}

/**
 * Clears texture & material caches when unloading or switching views.
 */
export function clearDiceTextureCache() {
  TEXTURE_CACHE.forEach(t => t.dispose());
  TEXTURE_CACHE.clear();
  MATERIAL_CACHE.forEach(m => m.dispose());
  MATERIAL_CACHE.clear();
}
