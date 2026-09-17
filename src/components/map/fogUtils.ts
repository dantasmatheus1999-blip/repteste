import { FogSettings } from './types';

export const NATIVE_MAP_WIDTH = 1920;
export const NATIVE_MAP_HEIGHT = 1080;

export const DEFAULT_FOG_SETTINGS: FogSettings = {
  density: 0.95,
  feather: 20,
  type: 'dense',
  mode: 'hide',
  shape: 'rect'
};

export interface Point {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Retorna as paletas de cores da névoa de fantasia medieval conforme o tipo selecionado
 */
function getFogPalette(type: FogSettings['type']) {
  switch (type) {
    case 'dark':
      return {
        core: '#050304',
        smoke1: '#0e080b',
        smoke2: '#160d12',
        rim: 'rgba(8, 4, 6, 0.4)'
      };
    case 'spectral':
      return {
        core: '#040807',
        smoke1: '#08120f',
        smoke2: '#0e1c17',
        rim: 'rgba(6, 12, 10, 0.35)'
      };
    case 'dense':
    default:
      return {
        core: '#070605',
        smoke1: '#0f0c09',
        smoke2: '#18130e',
        rim: 'rgba(10, 8, 6, 0.4)'
      };
  }
}

/**
 * Aplica névoa orgânica e densa em uma região retangular selecionada pelo Mestre.
 * A névoa possui bordas suaves e tufos nebulosos procedurais para simular neblina sobrenatural.
 */
export function applyOrganicFogRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  settings: FogSettings = DEFAULT_FOG_SETTINGS
) {
  const { x, y, width, height } = rect;
  if (width < 3 || height < 3) return;

  const palette = getFogPalette(settings.type);
  const feather = Math.max(4, Math.min(settings.feather, Math.min(width, height) / 2));
  const density = Math.max(0.15, Math.min(settings.density, 1));

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  // 1. Preenchimento central denso para ocultar o mapa
  const innerX = x + feather * 0.4;
  const innerY = y + feather * 0.4;
  const innerW = Math.max(1, width - feather * 0.8);
  const innerH = Math.max(1, height - feather * 0.8);

  ctx.fillStyle = palette.core;
  ctx.globalAlpha = density;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  // 2. Tufos orgânicos nas bordas para quebrar a geometria do retângulo
  const perimeterPoints: Array<{ px: number; py: number }> = [];
  const step = Math.max(12, feather * 0.9);

  // Topo e Fundo
  for (let px = x; px <= x + width; px += step) {
    perimeterPoints.push({ px, py: y });
    perimeterPoints.push({ px, py: y + height });
  }
  // Laterais
  for (let py = y + step; py < y + height; py += step) {
    perimeterPoints.push({ px: x, py });
    perimeterPoints.push({ px: x + width, py });
  }

  // Desenha tufos de neblina esfumaçados
  for (const pt of perimeterPoints) {
    // Leve aleatoriedade determinística para parecer orgânica
    const radius = feather * (1.1 + Math.random() * 0.7);
    const offsetX = (Math.random() - 0.5) * feather * 0.5;
    const offsetY = (Math.random() - 0.5) * feather * 0.5;
    const cx = pt.px + offsetX;
    const cy = pt.py + offsetY;

    const radGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    radGrad.addColorStop(0, palette.smoke1);
    radGrad.addColorStop(0.5, palette.smoke2);
    radGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = radGrad;
    ctx.globalAlpha = density * 0.92;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Camada de textura interna com variações de densidade
  const innerCols = Math.ceil(innerW / 70);
  const innerRows = Math.ceil(innerH / 70);
  for (let c = 0; c < innerCols; c++) {
    for (let r = 0; r < innerRows; r++) {
      const cx = innerX + (c + 0.5) * (innerW / innerCols) + (Math.random() - 0.5) * 15;
      const cy = innerY + (r + 0.5) * (innerH / innerRows) + (Math.random() - 0.5) * 15;
      const radius = 35 + Math.random() * 25;

      const cloudGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
      cloudGrad.addColorStop(0, palette.core);
      cloudGrad.addColorStop(0.7, palette.smoke1);
      cloudGrad.addColorStop(1, 'rgba(10, 8, 6, 0.4)');

      ctx.fillStyle = cloudGrad;
      ctx.globalAlpha = density * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Revela a névoa em uma região retangular selecionada, deixando bordas suaves e naturais.
 */
export function revealOrganicFogRect(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  settings: FogSettings = DEFAULT_FOG_SETTINGS
) {
  const { x, y, width, height } = rect;
  if (width < 3 || height < 3) return;

  const feather = Math.max(4, Math.min(settings.feather, Math.min(width, height) / 2));

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';

  // 1. Recorte do núcleo central com 100% de clareza
  const innerX = x + feather * 0.3;
  const innerY = y + feather * 0.3;
  const innerW = Math.max(1, width - feather * 0.6);
  const innerH = Math.max(1, height - feather * 0.6);

  ctx.fillStyle = '#000000';
  ctx.globalAlpha = 1.0;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  // 2. Suavização das bordas da revelação com gradientes radiais
  const step = Math.max(14, feather * 0.8);
  for (let px = x; px <= x + width; px += step) {
    for (const py of [y, y + height]) {
      const radius = feather * 1.1;
      const grad = ctx.createRadialGradient(px, py, radius * 0.15, px, py, radius);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let py = y + step; py < y + height; py += step) {
    for (const px of [x, x + width]) {
      const radius = feather * 1.1;
      const grad = ctx.createRadialGradient(px, py, radius * 0.15, px, py, radius);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Cobre todo o mapa 16:9 com a textura de névoa orgânica profunda
 */
export function coverEntireMapFog(
  ctx: CanvasRenderingContext2D,
  width: number = NATIVE_MAP_WIDTH,
  height: number = NATIVE_MAP_HEIGHT,
  settings: FogSettings = DEFAULT_FOG_SETTINGS
) {
  const palette = getFogPalette(settings.type);
  const density = settings.density || 0.95;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  // Base escura densa
  ctx.fillStyle = palette.core;
  ctx.globalAlpha = density;
  ctx.fillRect(0, 0, width, height);

  // Manto nebuloso de fumaça orgânica
  const cols = Math.ceil(width / 90);
  const rows = Math.ceil(height / 90);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cx = (c + 0.5) * (width / cols) + (Math.random() - 0.5) * 35;
      const cy = (r + 0.5) * (height / rows) + (Math.random() - 0.5) * 35;
      const radius = 55 + Math.random() * 45;

      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
      grad.addColorStop(0, palette.smoke1);
      grad.addColorStop(0.6, palette.smoke2);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.globalAlpha = density * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Limpa completamente a névoa do mapa
 */
export function clearEntireMapFog(
  ctx: CanvasRenderingContext2D,
  width: number = NATIVE_MAP_WIDTH,
  height: number = NATIVE_MAP_HEIGHT
) {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Aplica névoa orgânica e densa em uma região poligonal/livre (Lasso) desenhada pelo Mestre.
 * Preenche integralmente a área interna do contorno com névoa mística e suaviza as bordas.
 */
export function applyOrganicFogPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  settings: FogSettings = DEFAULT_FOG_SETTINGS
) {
  if (!points || points.length < 3) return;

  const palette = getFogPalette(settings.type);
  const feather = Math.max(4, Math.min(settings.feather || 20, 45));
  const density = Math.max(0.15, Math.min(settings.density || 0.95, 1));

  // Determinar bounding box do polígono para espalhar nuvens internas
  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;
  for (let i = 1; i < points.length; i++) {
    const pt = points[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }
  const polyW = maxX - minX;
  const polyH = maxY - minY;
  if (polyW < 2 || polyH < 2) return;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  // 1. Preenchimento sólido do polígono com a cor central
  ctx.fillStyle = palette.core;
  ctx.globalAlpha = density;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();

  // 2. Tufos orgânicos ao longo de todo o perímetro desenhado
  const step = Math.max(12, feather * 0.85);
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(dist / step));

    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const px = p1.x + dx * t;
      const py = p1.y + dy * t;

      const radius = feather * (1.1 + Math.random() * 0.7);
      const offsetX = (Math.random() - 0.5) * feather * 0.4;
      const offsetY = (Math.random() - 0.5) * feather * 0.4;
      const cx = px + offsetX;
      const cy = py + offsetY;

      const radGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
      radGrad.addColorStop(0, palette.smoke1);
      radGrad.addColorStop(0.5, palette.smoke2);
      radGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = radGrad;
      ctx.globalAlpha = density * 0.92;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Textura interna orgânica contida perfeitamente dentro do polígono via clipping
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.clip();

  const cols = Math.max(1, Math.ceil(polyW / 70));
  const rows = Math.max(1, Math.ceil(polyH / 70));
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cx = minX + (c + 0.5) * (polyW / cols) + (Math.random() - 0.5) * 16;
      const cy = minY + (r + 0.5) * (polyH / rows) + (Math.random() - 0.5) * 16;
      const radius = 35 + Math.random() * 25;

      const cloudGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
      cloudGrad.addColorStop(0, palette.core);
      cloudGrad.addColorStop(0.7, palette.smoke1);
      cloudGrad.addColorStop(1, 'rgba(10, 8, 6, 0.4)');

      ctx.fillStyle = cloudGrad;
      ctx.globalAlpha = density * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Revela a névoa em uma região poligonal/livre (Lasso) desenhada pelo Mestre,
 * limpando completamente o interior e suavizando as bordas.
 */
export function revealOrganicFogPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  settings: FogSettings = DEFAULT_FOG_SETTINGS
) {
  if (!points || points.length < 3) return;

  const feather = Math.max(4, Math.min(settings.feather || 20, 45));

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';

  // 1. Recorte do núcleo central do polígono com 100% de clareza
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = 1.0;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();

  // 2. Suavização das bordas ao longo de todo o perímetro
  const step = Math.max(14, feather * 0.85);
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(dist / step));

    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const px = p1.x + dx * t;
      const py = p1.y + dy * t;

      const radius = feather * 1.1;
      const grad = ctx.createRadialGradient(px, py, radius * 0.15, px, py, radius);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
