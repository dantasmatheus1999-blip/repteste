/**
 * Tabela Oficial de Pontos de Experiência (XP) — Tormenta20 Edição Jogo do Ano (JdA)
 * Fonte de Verdade: Livro Básico Tormenta20 (JdA), Capítulo 1: Criação de Personagem / Tabela 1-4: Níveis de Personagem.
 *
 * Cada valor representa a quantidade TOTAL acumulada de XP necessária para alcançar o nível correspondente.
 */

export interface LevelXpThreshold {
  level: number;
  totalXpRequired: number;
  xpFromPreviousLevel: number;
}

/**
 * Tabela oficial de XP por nível (1 a 20).
 * Facilmente editável e configurável caso novas edições ou suplementos adicionem níveis épicos.
 */
export const T20_JDA_XP_TABLE: Record<number, number> = {
  1: 0,
  2: 1000,
  3: 3000,
  4: 6000,
  5: 10000,
  6: 15000,
  7: 21000,
  8: 28000,
  9: 36000,
  10: 45000,
  11: 55000,
  12: 66000,
  13: 78000,
  14: 91000,
  15: 105000,
  16: 120000,
  17: 136000,
  18: 153000,
  19: 171000,
  20: 190000,
};

export const MAX_CHARACTER_LEVEL = 20;

/**
 * Retorna o XP total cumulativo necessário para atingir determinado nível.
 */
export function getXpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Math.floor(level)));
  return T20_JDA_XP_TABLE[safeLevel] ?? 0;
}

/**
 * Retorna o XP total acumulado necessário para o próximo nível.
 * Se já estiver no nível 20 (nível máximo), retorna null.
 */
export function getXpRequiredForNextLevel(currentLevel: number): number | null {
  if (currentLevel >= MAX_CHARACTER_LEVEL) {
    return null;
  }
  return getXpForLevel(currentLevel + 1);
}

/**
 * Retorna o quanto de XP é necessário apenas dentro do degrau do nível atual para o próximo.
 * Exemplo: do nível 3 (3.000 XP) para o 4 (6.000 XP), são necessários 3.000 XP no degrau.
 */
export function getXpSpanForLevel(currentLevel: number): number {
  if (currentLevel >= MAX_CHARACTER_LEVEL) return 0;
  const currentLevelFloor = getXpForLevel(currentLevel);
  const nextLevelCeiling = getXpForLevel(currentLevel + 1);
  return nextLevelCeiling - currentLevelFloor;
}

export interface CharacterXpProgress {
  currentLevel: number;
  xpTotal: number;
  xpCurrentFloor: number;
  xpNextLevelCeiling: number | null;
  xpInCurrentLevel: number;
  xpNeededForSpan: number;
  remainingXpToNextLevel: number;
  progressPercent: number;
  canLevelUp: boolean;
  isMaxLevel: boolean;
}

/**
 * Calcula todo o estado e progresso de XP do personagem de acordo com as regras de Tormenta20 JdA.
 *
 * Tratamento de XP excedente:
 * O XP excedente é preservado de forma cumulativa. Se o personagem possui 6.800 XP no nível 3
 * (que requer 6.000 XP para nível 4), o personagem pode subir de nível e, ao subir para o nível 4,
 * os 6.800 XP totais são mantidos, contando 800 XP para o nível 5 (que requer 10.000 XP).
 */
export function calculateXpProgress(rawXpTotal: number = 0, rawLevel: number = 1): CharacterXpProgress {
  const currentLevel = Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Math.floor(rawLevel || 1)));
  const xpTotal = Math.max(0, Math.floor(rawXpTotal || 0));
  const isMaxLevel = currentLevel >= MAX_CHARACTER_LEVEL;

  const xpCurrentFloor = getXpForLevel(currentLevel);
  const xpNextLevelCeiling = getXpRequiredForNextLevel(currentLevel);

  if (isMaxLevel || xpNextLevelCeiling === null) {
    return {
      currentLevel,
      xpTotal,
      xpCurrentFloor,
      xpNextLevelCeiling: null,
      xpInCurrentLevel: Math.max(0, xpTotal - xpCurrentFloor),
      xpNeededForSpan: 0,
      remainingXpToNextLevel: 0,
      progressPercent: 100,
      canLevelUp: false,
      isMaxLevel: true,
    };
  }

  const xpNeededForSpan = xpNextLevelCeiling - xpCurrentFloor;
  // XP adquirido desde que chegou ao nível atual
  const xpInCurrentLevel = Math.max(0, xpTotal - xpCurrentFloor);
  const remainingXpToNextLevel = Math.max(0, xpNextLevelCeiling - xpTotal);
  
  // Percentual restrito a no máximo 100%
  const progressPercent = xpNeededForSpan > 0 
    ? Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForSpan) * 100))
    : 100;

  // Pode subir se o XP total acumulado for maior ou igual ao XP necessário para o próximo nível
  const canLevelUp = xpTotal >= xpNextLevelCeiling;

  return {
    currentLevel,
    xpTotal,
    xpCurrentFloor,
    xpNextLevelCeiling,
    xpInCurrentLevel,
    xpNeededForSpan,
    remainingXpToNextLevel,
    progressPercent,
    canLevelUp,
    isMaxLevel: false,
  };
}
