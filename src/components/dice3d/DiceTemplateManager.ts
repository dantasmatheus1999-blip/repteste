import { DiceType, DiceTemplateConfig, DiceFaceDefinition, SkinValidationResult, DICE_TEXTURE_RESOLUTION } from './types';

export { DICE_TEXTURE_RESOLUTION };

/**
 * Standard Mathematical Planification (UV Nets) for all D&D / Tormenta 20 Dice:
 * D4, D6, D8, D10, D12, D20
 */

// ==========================================
// D20: 20 Equilateral Triangular Faces Net
// Arranged on a clean 5x4 grid matrix on the texture
// ==========================================
const D20_FACE_VALUES = [
  20, 1, 14, 8, 12,
  18, 2, 19, 7, 11,
  15, 6, 17, 3, 13,
  9, 5, 16, 4, 10
];

function buildD20Template(): DiceTemplateConfig {
  const faces: DiceFaceDefinition[] = [];
  const foldLines: [number, number][][] = [];

  // 4 rows x 5 columns layout of triangles on a square 1.0 x 1.0 atlas
  // Each cell [col, row] has one triangle with generous padding for texture art
  const cols = 5;
  const rows = 4;
  const cellW = 1.0 / cols;
  const cellH = 1.0 / rows;
  const padX = cellW * 0.08;
  const padY = cellH * 0.08;

  for (let idx = 0; idx < 20; idx++) {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x0 = col * cellW + padX;
    const x1 = (col + 1) * cellW - padX;
    const y0 = (3 - row) * cellH + padY;
    const y1 = (4 - row) * cellH - padY;
    const cx = (x0 + x1) / 2;

    // Upward-pointing triangle for even indices, downward for odd
    const isUp = (col + row) % 2 === 0;
    const uvCoords: [number, number][] = isUp
      ? [
          [cx, y1], // Top
          [x0, y0], // Bottom Left
          [x1, y0], // Bottom Right
        ]
      : [
          [cx, y0], // Bottom
          [x1, y1], // Top Right
          [x0, y1], // Top Left
        ];

    const centerUV: [number, number] = [
      (uvCoords[0][0] + uvCoords[1][0] + uvCoords[2][0]) / 3,
      (uvCoords[0][1] + uvCoords[1][1] + uvCoords[2][1]) / 3
    ];

    const val = D20_FACE_VALUES[idx];
    faces.push({
      faceIndex: idx,
      faceId: `FACE_${String(idx + 1).padStart(2, '0')}`,
      value: val,
      label: String(val),
      uvCoords,
      centerUV,
      normal: [0, 0, 1] // assigned precisely by geometry registry
    });

    // Outer fold line
    foldLines.push([
      [uvCoords[0][0], uvCoords[0][1]],
      [uvCoords[1][0], uvCoords[1][1]],
      [uvCoords[2][0], uvCoords[2][1]],
      [uvCoords[0][0], uvCoords[0][1]]
    ]);
  }

  return {
    diceType: 'd20',
    name: 'D20 Realmor Standard',
    faceCount: 20,
    aspectRatio: 1.0,
    recommendedResolution: { width: 1024, height: 1024 },
    faces,
    foldLines
  };
}

// ==========================================
// D6: 6 Square Faces Net (Standard Cross Net)
// ==========================================
const D6_FACE_VALUES = [1, 2, 3, 4, 5, 6];

function buildD6Template(): DiceTemplateConfig {
  const faces: DiceFaceDefinition[] = [];
  const foldLines: [number, number][][] = [];

  // Cross layout in 4x3 grid:
  //      [ 1 ]
  // [ 4 ][ 2 ][ 3 ][ 5 ]
  //      [ 6 ]
  const cellW = 1.0 / 4;
  const cellH = 1.0 / 3;
  const pad = 0.015;

  const positions: Record<number, { col: number; row: number; val: number }> = {
    0: { col: 1, row: 2, val: 1 }, // Top (Face 1)
    1: { col: 1, row: 1, val: 2 }, // Front (Face 2)
    2: { col: 2, row: 1, val: 3 }, // Right (Face 3)
    3: { col: 0, row: 1, val: 4 }, // Left (Face 4)
    4: { col: 3, row: 1, val: 5 }, // Back (Face 5)
    5: { col: 1, row: 0, val: 6 }, // Bottom (Face 6)
  };

  for (let idx = 0; idx < 6; idx++) {
    const { col, row, val } = positions[idx];
    const x0 = col * cellW + pad;
    const x1 = (col + 1) * cellW - pad;
    const y0 = row * cellH + pad;
    const y1 = (row + 1) * cellH - pad;

    const uvCoords: [number, number][] = [
      [x0, y1], // Top-Left
      [x1, y1], // Top-Right
      [x1, y0], // Bottom-Right
      [x0, y0], // Bottom-Left
    ];

    const centerUV: [number, number] = [(x0 + x1) / 2, (y0 + y1) / 2];

    faces.push({
      faceIndex: idx,
      faceId: `FACE_0${idx + 1}`,
      value: val,
      label: String(val),
      uvCoords,
      centerUV,
      normal: [0, 0, 1]
    });

    foldLines.push([
      [x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]
    ]);
  }

  return {
    diceType: 'd6',
    name: 'D6 Cubo Realmor',
    faceCount: 6,
    aspectRatio: 1.0,
    recommendedResolution: { width: 1024, height: 1024 },
    faces,
    foldLines
  };
}

// ==========================================
// D4: 4 Triangular Faces Net (Tetrahedron)
// ==========================================
function buildD4Template(): DiceTemplateConfig {
  const faces: DiceFaceDefinition[] = [];
  const foldLines: [number, number][][] = [];

  // Central large triangle divided into 4 sub-triangles
  const cx = 0.5;
  const cy = 0.52;
  const r = 0.44;

  const topV: [number, number] = [cx, cy + r * 0.9];
  const blV: [number, number] = [cx - r * 0.866, cy - r * 0.45];
  const brV: [number, number] = [cx + r * 0.866, cy - r * 0.45];

  // Midpoints
  const mTopL: [number, number] = [(topV[0] + blV[0]) / 2, (topV[1] + blV[1]) / 2];
  const mTopR: [number, number] = [(topV[0] + brV[0]) / 2, (topV[1] + brV[1]) / 2];
  const mBot: [number, number] = [(blV[0] + brV[0]) / 2, (blV[1] + brV[1]) / 2];

  const subTris: [number, number][][] = [
    [topV, mTopR, mTopL], // Face 1 (Top)
    [mTopL, mBot, blV],   // Face 2 (Bottom Left)
    [mTopR, brV, mBot],   // Face 3 (Bottom Right)
    [mBot, mTopR, mTopL], // Face 4 (Center Inverted)
  ];

  const values = [1, 2, 3, 4];

  for (let i = 0; i < 4; i++) {
    const tri = subTris[i];
    const centerUV: [number, number] = [
      (tri[0][0] + tri[1][0] + tri[2][0]) / 3,
      (tri[0][1] + tri[1][1] + tri[2][1]) / 3
    ];

    faces.push({
      faceIndex: i,
      faceId: `FACE_0${i + 1}`,
      value: values[i],
      label: String(values[i]),
      uvCoords: tri,
      centerUV,
      normal: [0, 0, 1]
    });

    foldLines.push([[tri[0][0], tri[0][1]], [tri[1][0], tri[1][1]], [tri[2][0], tri[2][1]], [tri[0][0], tri[0][1]]]);
  }

  return {
    diceType: 'd4',
    name: 'D4 Tetraedro Realmor',
    faceCount: 4,
    aspectRatio: 1.0,
    recommendedResolution: { width: 1024, height: 1024 },
    faces,
    foldLines
  };
}

// ==========================================
// D8: 8 Triangular Faces Net (Octahedron)
// ==========================================
function buildD8Template(): DiceTemplateConfig {
  const faces: DiceFaceDefinition[] = [];
  const foldLines: [number, number][][] = [];
  const values = [1, 8, 2, 7, 3, 6, 4, 5];

  // 2 rows of 4 triangles
  const cols = 4;
  const rows = 2;
  const cellW = 1.0 / cols;
  const cellH = 1.0 / rows;
  const pad = 0.02;

  for (let idx = 0; idx < 8; idx++) {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x0 = col * cellW + pad;
    const x1 = (col + 1) * cellW - pad;
    const y0 = (1 - row) * cellH + pad;
    const y1 = (2 - row) * cellH - pad;
    const cx = (x0 + x1) / 2;

    const isUp = (col + row) % 2 === 0;
    const uvCoords: [number, number][] = isUp
      ? [[cx, y1], [x0, y0], [x1, y0]]
      : [[cx, y0], [x1, y1], [x0, y1]];

    const centerUV: [number, number] = [
      (uvCoords[0][0] + uvCoords[1][0] + uvCoords[2][0]) / 3,
      (uvCoords[0][1] + uvCoords[1][1] + uvCoords[2][1]) / 3
    ];

    faces.push({
      faceIndex: idx,
      faceId: `FACE_0${idx + 1}`,
      value: values[idx],
      label: String(values[idx]),
      uvCoords,
      centerUV,
      normal: [0, 0, 1]
    });

    foldLines.push([[uvCoords[0][0], uvCoords[0][1]], [uvCoords[1][0], uvCoords[1][1]], [uvCoords[2][0], uvCoords[2][1]], [uvCoords[0][0], uvCoords[0][1]]]);
  }

  return {
    diceType: 'd8',
    name: 'D8 Octaedro Realmor',
    faceCount: 8,
    aspectRatio: 1.0,
    recommendedResolution: { width: 1024, height: 1024 },
    faces,
    foldLines
  };
}

// ==========================================
// D10: 10 Kite Faces Net (Pentagonal Trapezohedron)
// ==========================================
function buildD10Template(isD100 = false): DiceTemplateConfig {
  const faces: DiceFaceDefinition[] = [];
  const foldLines: [number, number][][] = [];
  const values = isD100
    ? ['00', '10', '20', '30', '40', '50', '60', '70', '80', '90']
    : [1, 10, 2, 9, 3, 8, 4, 7, 5, 6];

  // 2 rows of 5 kites
  const cols = 5;
  const rows = 2;
  const cellW = 1.0 / cols;
  const cellH = 1.0 / rows;
  const pad = 0.015;

  for (let idx = 0; idx < 10; idx++) {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x0 = col * cellW + pad;
    const x1 = (col + 1) * cellW - pad;
    const y0 = (1 - row) * cellH + pad;
    const y1 = (2 - row) * cellH - pad;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;

    // Kite polygon (Top, Right, Bottom, Left)
    const isUpper = row === 0;
    const uvCoords: [number, number][] = isUpper
      ? [
          [cx, y1],           // Top tip
          [x1, cy + cellH * 0.1], // Right shoulder
          [cx, y0],           // Bottom point
          [x0, cy + cellH * 0.1], // Left shoulder
        ]
      : [
          [cx, y1],           // Top point
          [x1, cy - cellH * 0.1], // Right shoulder
          [cx, y0],           // Bottom tip
          [x0, cy - cellH * 0.1], // Left shoulder
        ];

    const centerUV: [number, number] = [cx, cy];

    faces.push({
      faceIndex: idx,
      faceId: `FACE_${String(idx + 1).padStart(2, '0')}`,
      value: values[idx],
      label: String(values[idx]),
      uvCoords,
      centerUV,
      normal: [0, 0, 1]
    });

    foldLines.push([
      [uvCoords[0][0], uvCoords[0][1]],
      [uvCoords[1][0], uvCoords[1][1]],
      [uvCoords[2][0], uvCoords[2][1]],
      [uvCoords[3][0], uvCoords[3][1]],
      [uvCoords[0][0], uvCoords[0][1]]
    ]);
  }

  return {
    diceType: isD100 ? 'd100' : 'd10',
    name: isD100 ? 'D100 Porcentual Realmor' : 'D10 Trapezoedro Realmor',
    faceCount: 10,
    aspectRatio: 1.0,
    recommendedResolution: { width: 1024, height: 1024 },
    faces,
    foldLines
  };
}

// ==========================================
// D12: 12 Pentagonal Faces Net (Dodecahedron)
// ==========================================
function buildD12Template(): DiceTemplateConfig {
  const faces: DiceFaceDefinition[] = [];
  const foldLines: [number, number][][] = [];
  const values = [1, 12, 2, 11, 3, 10, 4, 9, 5, 8, 6, 7];

  // 2 clusters of 6 pentagons on a 4x3 grid
  const cols = 4;
  const rows = 3;
  const cellW = 1.0 / cols;
  const cellH = 1.0 / rows;
  const pad = 0.02;

  for (let idx = 0; idx < 12; idx++) {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const cx = (col + 0.5) * cellW;
    const cy = (2.5 - row) * cellH;
    const r = Math.min(cellW, cellH) * 0.44;

    const uvCoords: [number, number][] = [];
    for (let p = 0; p < 5; p++) {
      const angle = (p * 2 * Math.PI) / 5 - Math.PI / 2;
      uvCoords.push([
        cx + r * Math.cos(angle),
        cy + r * Math.sin(angle)
      ]);
    }

    faces.push({
      faceIndex: idx,
      faceId: `FACE_${String(idx + 1).padStart(2, '0')}`,
      value: values[idx],
      label: String(values[idx]),
      uvCoords,
      centerUV: [cx, cy],
      normal: [0, 0, 1]
    });

    const fLine: [number, number][] = uvCoords.map(pt => [pt[0], pt[1]]);
    fLine.push([uvCoords[0][0], uvCoords[0][1]]);
    foldLines.push(fLine);
  }

  return {
    diceType: 'd12',
    name: 'D12 Dodecaedro Realmor',
    faceCount: 12,
    aspectRatio: 1.0,
    recommendedResolution: { width: 1024, height: 1024 },
    faces,
    foldLines
  };
}

// ==========================================
// Template Registry Cache
// ==========================================
const TEMPLATES_CACHE: Partial<Record<DiceType, DiceTemplateConfig>> = {};

export function getDiceTemplate(diceType: DiceType): DiceTemplateConfig {
  if (TEMPLATES_CACHE[diceType]) {
    return TEMPLATES_CACHE[diceType]!;
  }

  let template: DiceTemplateConfig;
  switch (diceType) {
    case 'd4':
      template = buildD4Template();
      break;
    case 'd6':
      template = buildD6Template();
      break;
    case 'd8':
      template = buildD8Template();
      break;
    case 'd10':
      template = buildD10Template(false);
      break;
    case 'd100':
      template = buildD10Template(true);
      break;
    case 'd12':
      template = buildD12Template();
      break;
    case 'd20':
    default:
      template = buildD20Template();
      break;
  }

  TEMPLATES_CACHE[diceType] = template;
  return template;
}

/**
 * Renders the official high-resolution Realmor template guide canvas
 * with blueprint lines, face IDs, numbers, and up-arrows for artist reference.
 */
export function generateOfficialTemplateCanvas(
  diceType: DiceType,
  options: {
    width?: number;
    height?: number;
    showFaceIds?: boolean;
    showNumbers?: boolean;
    showOrientationArrows?: boolean;
    theme?: 'dark' | 'light' | 'blueprint';
  } = {}
): HTMLCanvasElement {
  const template = getDiceTemplate(diceType);
  const width = options.width || template.recommendedResolution.width;
  const height = options.height || template.recommendedResolution.height;
  const theme = options.theme || 'blueprint';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  if (theme === 'blueprint') {
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    const step = width / 32;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (theme === 'dark') {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw Header Watermark
  ctx.save();
  ctx.fillStyle = theme === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`REALMOR RPG — UV TEMPLATE OFICIAL: ${template.name.toUpperCase()}`, width / 2, 34);
  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Aspect Ratio: 1:1 (${width}x${height}px) • Pinte dentro dos polígonos de cada face`, width / 2, 58);
  ctx.restore();

  // Draw Faces Polygons and Guides
  template.faces.forEach((face) => {
    const pts = face.uvCoords.map(([u, v]) => ({
      x: u * width,
      y: (1 - v) * height // Canvas Y is inverted relative to WebGL UV
    }));

    // Fill face area with subtle contrast
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = theme === 'light' ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.7)';
    ctx.fill();

    // Outline / Fold lines
    ctx.strokeStyle = theme === 'light' ? '#0284c7' : '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.stroke();

    // Subtle inner glow/shadow
    ctx.strokeStyle = theme === 'light' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // Center annotations
    const cx = face.centerUV[0] * width;
    const cy = (1 - face.centerUV[1]) * height;

    // Face Identifier (e.g. FACE_01)
    if (options.showFaceIds !== false) {
      ctx.save();
      ctx.fillStyle = theme === 'light' ? '#0369a1' : '#7dd3fc';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(face.faceId, cx, cy - 14);
      ctx.restore();
    }

    // Number Value (e.g. 20)
    if (options.showNumbers !== false) {
      ctx.save();
      ctx.fillStyle = theme === 'light' ? '#0f172a' : '#f8fafc';
      ctx.font = '900 28px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(face.value), cx, cy + 12);
      ctx.restore();
    }

    // Orientation Arrow pointing UP
    if (options.showOrientationArrows !== false) {
      ctx.save();
      ctx.strokeStyle = theme === 'light' ? '#ef4444' : '#f87171';
      ctx.fillStyle = theme === 'light' ? '#ef4444' : '#f87171';
      ctx.lineWidth = 1.5;
      const arrowY = cy + 28;
      ctx.beginPath();
      ctx.moveTo(cx, arrowY + 6);
      ctx.lineTo(cx, arrowY - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, arrowY - 7);
      ctx.lineTo(cx - 4, arrowY - 2);
      ctx.lineTo(cx + 4, arrowY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  });

  return canvas;
}

/**
 * Downloads the official template as a standard 1024x1024 PNG file.
 */
export function downloadOfficialTemplatePNG(diceType: DiceType) {
  const canvas = generateOfficialTemplateCanvas(diceType, {
    width: DICE_TEXTURE_RESOLUTION,
    height: DICE_TEXTURE_RESOLUTION,
    theme: 'blueprint',
    showFaceIds: true,
    showNumbers: true,
    showOrientationArrows: true
  });

  const link = document.createElement('a');
  link.download = `realmor_template_${diceType.toLowerCase()}_1024x1024.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Normalizes any input image (from artists, external tools, or AI models with different resolutions)
 * to standard 1024x1024 px square texture without distortion, maintaining the highest resampling quality.
 */
export async function normalizeTextureTo1024(
  fileOrBlobOrUrl: File | Blob | string,
  fileName: string = 'dice_skin_texture.png'
): Promise<{ 
  file: File; 
  blob: Blob; 
  dataUrl: string; 
  originalWidth: number; 
  originalHeight: number; 
  wasResized: boolean 
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let cleanupUrl = '';
    if (typeof fileOrBlobOrUrl === 'string') {
      img.src = fileOrBlobOrUrl;
    } else {
      cleanupUrl = URL.createObjectURL(fileOrBlobOrUrl);
      img.src = cleanupUrl;
    }

    img.onload = () => {
      if (cleanupUrl) URL.revokeObjectURL(cleanupUrl);

      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;
      const targetSize = DICE_TEXTURE_RESOLUTION; // 1024

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Falha ao obter contexto 2D do canvas para normalização.'));
        return;
      }

      // High-quality resampling configuration
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear background
      ctx.clearRect(0, 0, targetSize, targetSize);

      const ratio = origW / origH;
      const wasResized = origW !== targetSize || origH !== targetSize;

      if (Math.abs(ratio - 1.0) < 0.05) {
        // Square image: fit directly into 1024x1024
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
      } else {
        // Non-square AI or camera image: center without distortion
        let drawW = targetSize;
        let drawH = targetSize;
        let offsetX = 0;
        let offsetY = 0;

        if (origW > origH) {
          drawW = targetSize;
          drawH = targetSize / ratio;
          offsetY = (targetSize - drawH) / 2;
        } else {
          drawH = targetSize;
          drawW = targetSize * ratio;
          offsetX = (targetSize - drawW) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      }

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Falha ao gerar blob normalizado de 1024x1024.'));
          return;
        }

        const normalizedFile = new File([blob], fileName.replace(/\.[^/.]+$/, "") + ".png", {
          type: 'image/png',
          lastModified: Date.now()
        });

        resolve({
          file: normalizedFile,
          blob,
          dataUrl,
          originalWidth: origW,
          originalHeight: origH,
          wasResized
        });
      }, 'image/png');
    };

    img.onerror = (e) => {
      if (cleanupUrl) URL.revokeObjectURL(cleanupUrl);
      reject(new Error('Não foi possível carregar o arquivo de imagem para normalização.'));
    };
  });
}

/**
 * Validates an uploaded skin texture image against the official template requirements (1024x1024 px standard).
 */
export async function validateSkinImage(fileOrUrl: File | string, diceType: DiceType): Promise<SkinValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const { width, height } = img;
      const ratio = width / height;

      // Check aspect ratio (should be approx 1:1)
      if (Math.abs(ratio - 1.0) > 0.08) {
        warnings.push(`A imagem original é ${width}x${height}px. O sistema normalizou automaticamente para o padrão quadrado 1024x1024px.`);
      }

      // Check minimum resolution
      if (width < 512 || height < 512) {
        warnings.push(`Resolução original (${width}x${height}px) ampliada para 1024x1024px.`);
      }

      // Check non-empty canvas content
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(width, 256);
        canvas.height = Math.min(height, 256);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let nonTransparent = 0;
          for (let i = 3; i < imgData.length; i += 4) {
            if (imgData[i] > 10) nonTransparent++;
          }
          if (nonTransparent < (canvas.width * canvas.height * 0.1)) {
            warnings.push('A imagem parece estar predominantemente vazia ou transparente.');
          }
        }
      } catch (e) {
        // ignore cross-origin check issues
      }

      resolve({
        valid: errors.length === 0,
        errors,
        warnings,
        dimensions: { width: DICE_TEXTURE_RESOLUTION, height: DICE_TEXTURE_RESOLUTION }
      });
    };

    img.onerror = () => {
      resolve({
        valid: false,
        errors: ['Não foi possível carregar ou decodificar o arquivo de imagem.'],
        warnings: []
      });
    };

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      img.src = URL.createObjectURL(fileOrUrl);
    }
  });
}
