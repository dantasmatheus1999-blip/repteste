import * as THREE from 'three';
import { DiceSkin, DiceType } from './types';
import { DICE_SKINS } from './diceSkins';

// Cache for created textures to optimize memory and performance
const textureCache: Map<string, THREE.CanvasTexture> = new Map();

/**
 * Generates a crisp, high-resolution procedural texture for a single dice face.
 */
export function generateDiceFaceTexture(
  diceType: DiceType,
  skinId: DiceSkin,
  value: number | string,
  width = 256,
  height = 256
): THREE.CanvasTexture {
  const cacheKey = `${diceType}_${skinId}_${value}_${width}x${height}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    return fallbackTexture;
  }

  const skin = DICE_SKINS[skinId] || DICE_SKINS.tormenta;

  // Background base
  ctx.fillStyle = skin.baseColor;
  ctx.fillRect(0, 0, width, height);

  // Subtle radial gradient for depth & 3D curvature
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.1,
    width / 2,
    height / 2,
    width * 0.65
  );
  grad.addColorStop(0, skin.highlightColor + '33');
  grad.addColorStop(0.7, skin.baseColor);
  grad.addColorStop(1, skin.edgeColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative border depending on geometry
  ctx.strokeStyle = skin.highlightColor + '55';
  ctx.lineWidth = width * 0.04;
  
  if (diceType === 'd20' || diceType === 'd4' || diceType === 'd8') {
    // Triangular framing
    const pad = width * 0.1;
    ctx.beginPath();
    ctx.moveTo(width / 2, pad);
    ctx.lineTo(width - pad, height - pad * 0.8);
    ctx.lineTo(pad, height - pad * 0.8);
    ctx.closePath();
    ctx.stroke();

    // Inner subtle glow border
    ctx.strokeStyle = skin.numberColor + '25';
    ctx.lineWidth = width * 0.02;
    ctx.beginPath();
    ctx.moveTo(width / 2, pad + 10);
    ctx.lineTo(width - pad - 8, height - pad * 0.8 - 6);
    ctx.lineTo(pad + 8, height - pad * 0.8 - 6);
    ctx.closePath();
    ctx.stroke();
  } else if (diceType === 'd12') {
    // Pentagonal framing
    const pad = width * 0.12;
    const r = (width / 2) - pad;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
      const x = width / 2 + r * Math.cos(angle);
      const y = height / 2 + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  } else {
    // Square / diamond border
    const pad = width * 0.08;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
  }

  // Draw the number
  const valStr = String(value);
  const is20 = valStr === '20';
  const is1 = valStr === '1' && diceType === 'd20';
  const needsDot = valStr === '6' || valStr === '9';

  ctx.save();
  ctx.translate(width / 2, height / 2 + (diceType === 'd20' || diceType === 'd4' ? height * 0.06 : 0));

  // Font setup
  const fontSize = is20 
    ? width * 0.42 
    : valStr.length > 2 
    ? width * 0.35 
    : width * 0.46;

  ctx.font = `bold ${fontSize}px "Cinzel", "Times New Roman", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Drop shadow for numbers
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  // Text fill
  if (is20) {
    // Golden critical highlight
    ctx.fillStyle = skinId === 'black_obsidian' ? '#ff3344' : '#ffdf00';
    ctx.strokeStyle = '#3a0808';
    ctx.lineWidth = 3;
    ctx.strokeText(valStr, 0, 0);
  } else if (is1) {
    // Fumble highlight
    ctx.fillStyle = '#ff6b6b';
  } else {
    ctx.fillStyle = skin.numberColor;
  }

  ctx.fillText(valStr, 0, 0);

  // Add dot under 6 and 9 to distinguish
  if (needsDot) {
    ctx.beginPath();
    ctx.arc(0, fontSize * 0.45, width * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = skin.numberColor;
    ctx.fill();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates an array of MeshStandardMaterial for all faces of a given dice type and skin.
 */
export function createDiceMaterials(
  diceType: DiceType,
  skinId: DiceSkin,
  faceValues: (number | string)[]
): THREE.MeshStandardMaterial[] {
  const skin = DICE_SKINS[skinId] || DICE_SKINS.tormenta;

  return faceValues.map((val) => {
    const texture = generateDiceFaceTexture(diceType, skinId, val);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: skin.roughness,
      metalness: skin.metalness,
      color: 0xffffff,
      bumpScale: 0.05
    });
  });
}
