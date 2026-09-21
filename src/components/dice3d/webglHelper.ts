import * as THREE from 'three';
import { DiceSkin, DiceType } from './types';
import { DICE_SKINS } from './diceSkins';

/**
 * Checks if WebGL or WebGL2 is available in the current environment.
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Safely creates a Three.js WebGLRenderer with fallback guards for environments
 * where WebGL context creation or shader precision format queries return null.
 */
export function createSafeWebGLRenderer(
  params: THREE.WebGLRendererParameters
): THREE.WebGLRenderer | null {
  try {
    const canvas = params.canvas as HTMLCanvasElement | null;
    if (!canvas || typeof canvas.getContext !== 'function') return null;

    // Check if canvas can provide a WebGL context
    let gl: any = null;
    const contextAttributes = {
      alpha: params.alpha ?? true,
      antialias: params.antialias ?? true,
      powerPreference: params.powerPreference ?? 'default',
      preserveDrawingBuffer: params.preserveDrawingBuffer ?? false
    };

    try {
      gl =
        canvas.getContext('webgl2', contextAttributes as any) ||
        canvas.getContext('webgl', contextAttributes as any) ||
        canvas.getContext('experimental-webgl', contextAttributes as any);
    } catch (e) {
      console.warn('Canvas WebGL getContext failed:', e);
      return null;
    }

    if (!gl) {
      return null;
    }

    // Polyfill / Guard gl.getShaderPrecisionFormat if the driver returns null
    // (This fixes the "Cannot read properties of null (reading 'precision')" crash)
    if (gl.getShaderPrecisionFormat) {
      const originalGetShaderPrecisionFormat = gl.getShaderPrecisionFormat.bind(gl);
      gl.getShaderPrecisionFormat = function (shaderType: number, precisionType: number) {
        try {
          const res = originalGetShaderPrecisionFormat(shaderType, precisionType);
          if (res && typeof res.precision === 'number') {
            return res;
          }
        } catch {
          // ignore error and return fallback object
        }
        return {
          rangeMin: 1,
          rangeMax: 1,
          precision: 23
        };
      };
    }

    const renderer = new THREE.WebGLRenderer({
      ...params,
      context: gl
    });

    return renderer;
  } catch (err) {
    console.warn('Three.js WebGLRenderer instantiation failed:', err);
    return null;
  }
}

/**
 * Renders a crisp 2D stylized polyhedral die on a 2D canvas as a bulletproof fallback.
 */
export function draw2DFallbackDie(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  diceType: DiceType,
  skinIdOrConfig: DiceSkin | any,
  rotationAngle = 0,
  displayValue?: number | string
) {
  let skin = typeof skinIdOrConfig === 'object' && skinIdOrConfig !== null 
    ? skinIdOrConfig 
    : (DICE_SKINS[skinIdOrConfig] || DICE_SKINS.tormenta);
  
  if (!skin.baseColor) {
    skin = DICE_SKINS.tormenta;
  }
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.42;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotationAngle * 0.5);

  // Outer ambient glow
  const glowGrad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.3);
  glowGrad.addColorStop(0, `${skin.highlightColor}44`);
  glowGrad.addColorStop(0.8, `${skin.baseColor}22`);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Draw D20 or Polyhedral 2D Shape
  if (diceType === 'd20' || diceType === 'd8' || diceType === 'd4') {
    // Hexagonal outer silhouette with internal triangle facets
    const hexRadius = radius;
    const hexPoints: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      hexPoints.push([Math.cos(a) * hexRadius, Math.sin(a) * hexRadius]);
    }

    // Inner triangle points
    const triRadius = radius * 0.65;
    const triPoints: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
      triPoints.push([Math.cos(a) * triRadius, Math.sin(a) * triRadius]);
    }

    // Draw outer facets with distinct gradient shading
    for (let i = 0; i < 6; i++) {
      const nextI = (i + 1) % 6;
      const innerIdx = Math.floor(i / 2);

      ctx.beginPath();
      ctx.moveTo(hexPoints[i][0], hexPoints[i][1]);
      ctx.lineTo(hexPoints[nextI][0], hexPoints[nextI][1]);
      ctx.lineTo(triPoints[innerIdx][0], triPoints[innerIdx][1]);
      ctx.closePath();

      // Shading based on angle
      const shadeFactor = ((i + Math.sin(rotationAngle)) % 3) / 3;
      ctx.fillStyle = i % 2 === 0 ? skin.baseColor : skin.edgeColor;
      ctx.fill();
      ctx.strokeStyle = `${skin.highlightColor}66`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Central Triangle Face
    ctx.beginPath();
    ctx.moveTo(triPoints[0][0], triPoints[0][1]);
    ctx.lineTo(triPoints[1][0], triPoints[1][1]);
    ctx.lineTo(triPoints[2][0], triPoints[2][1]);
    ctx.closePath();

    const centerGrad = ctx.createLinearGradient(0, -triRadius, 0, triRadius);
    centerGrad.addColorStop(0, skin.highlightColor);
    centerGrad.addColorStop(1, skin.baseColor);
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = `${skin.numberColor}aa`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (diceType === 'd6') {
    // 2D Isometric Cube Shape
    const s = radius * 0.85;
    ctx.beginPath();
    ctx.rect(-s / 2, -s / 2, s, s);
    ctx.fillStyle = skin.baseColor;
    ctx.fill();
    ctx.strokeStyle = skin.highlightColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    // Round / Decagonal Shape
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = skin.baseColor;
    ctx.fill();
    ctx.strokeStyle = skin.highlightColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw Value / Number
  const textVal = displayValue !== undefined ? String(displayValue) : '20';
  ctx.restore();

  // Draw text unrotated for readability
  ctx.save();
  ctx.translate(cx, cy);
  ctx.font = `bold ${Math.max(12, Math.round(radius * 0.7))}px 'Cinzel', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = skin.numberColor;
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.fillText(textVal, 0, 1);
  ctx.restore();
}
