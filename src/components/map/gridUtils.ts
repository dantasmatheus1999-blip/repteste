import { GridSettings, TestMap } from './types';

/**
 * Calcula uma grade inicial automática, natural e proporcional para qualquer mapa de batalha.
 * A grade é projetada para ser discreta, elegante e equilibrada com o palco tático nativo (1920x1080).
 */
export function calculateAutomaticGrid(imageWidth?: number, imageHeight?: number): GridSettings {
  let squareSize = 60; // Padrão clássico de 32 colunas x 18 linhas em 1920x1080

  if (imageWidth && imageHeight && imageWidth > 0 && imageHeight > 0) {
    const ratio = imageWidth / imageHeight;
    
    if (ratio >= 2.1) {
      // Mapa ultra-panorâmico: mais colunas táticas proporcionais
      squareSize = 50;
    } else if (ratio >= 1.4) {
      // Proporção widescreen clássica (16:9 / 16:10)
      if (imageWidth >= 3000 || imageHeight >= 1800) {
        // Mapa grande em alta resolução
        squareSize = 65;
      } else if (imageWidth <= 1280) {
        // Mapa menor / escaramuça fechada
        squareSize = 50;
      } else {
        squareSize = 60;
      }
    } else if (ratio <= 1.15) {
      // Mapa quadrado ou vertical (1:1 ou retrato)
      squareSize = 55;
    } else {
      squareSize = 55;
    }
  }

  return {
    enabled: true,
    size: squareSize,
    opacity: 0.35,
    thickness: 1.2,
    color: '#FFFFFF',
    scaleMeters: 1.5
  };
}

/**
 * Obtém a configuração de grade efetiva para um mapa.
 * Se o mapa já possui configuração manual (ou salva previamente), respeita rigorosamente.
 * Se for um mapa novo ou sem configuração, gera a grade automática inicial proporcional.
 */
export function getEffectiveGrid(map?: TestMap | null): GridSettings {
  if (!map) {
    return calculateAutomaticGrid();
  }

  if (map.grid) {
    return {
      enabled: map.grid.enabled ?? true,
      size: map.grid.size || 50,
      color: map.grid.color || '#FFFFFF',
      opacity: map.grid.opacity ?? 0.35,
      thickness: map.grid.thickness ?? 1.2,
      scaleMeters: map.grid.scaleMeters ?? 1.5
    };
  }

  return calculateAutomaticGrid();
}
