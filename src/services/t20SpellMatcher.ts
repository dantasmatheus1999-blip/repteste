import { T20_SPELLS } from '../data/t20Spells';
import { T20Spell } from '../types/spells';

/**
 * Normaliza o texto removendo acentos, pontuações e caracteres especiais
 */
export const normalizeSpellKey = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

/**
 * Limpa o nome da magia removendo sufixos ou anotações comuns em fichas
 * Ex: "1. Curar Ferimentos (1º círculo)" -> "Curar Ferimentos"
 * Ex: "Bola de Fogo [Evocação]" -> "Bola de Fogo"
 * Ex: "Armadura Arcana (Reação)" -> "Armadura Arcana"
 */
export const cleanRawSpellName = (rawName: string): string => {
  if (!rawName) return '';
  let cleaned = rawName.trim();

  // Remove números ordinais ou numeração no início (ex: "1. ", "01 - ", "1)")
  cleaned = cleaned.replace(/^\d+[\.\-\)\:]\s*/, '');

  // Remove prefixos como "Magia:", "Spell:"
  cleaned = cleaned.replace(/^(magia|spell|truque|arcana|divina)[\:\-]\s*/i, '');

  // Remove anotações entre parênteses, colchetes ou chaves no final ou meio
  // ex: "(1º círculo)", "(1º)", "(2º nivel)", "[Evocação]", "(1 PM)"
  cleaned = cleaned.replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, ' ').trim();

  // Remove pontuação supérflua no final
  cleaned = cleaned.replace(/[\,\;\.\:\-]+$/, '').trim();

  return cleaned;
};

/**
 * Retorna o custo oficial padrão em Pontos de Mana (PM) de acordo com o círculo T20
 */
export const getStandardT20SpellCost = (circle: number): number => {
  switch (circle) {
    case 1: return 1;
    case 2: return 3;
    case 3: return 6;
    case 4: return 10;
    case 5: return 15;
    default: return Math.max(1, circle);
  }
};

/**
 * Busca a magia exata correspondente no catálogo oficial T20 do REALMOR.
 * Se encontrar, retorna o registro completo do catálogo.
 * Se não encontrar, retorna null (não inventa dados nem substitui por magia parecida).
 */
export const findSpellInT20Catalog = (rawNameOrId: string): T20Spell | null => {
  if (!rawNameOrId || typeof rawNameOrId !== 'string') return null;

  const rawCleaned = cleanRawSpellName(rawNameOrId);
  const normalizedSearch = normalizeSpellKey(rawCleaned);
  const normalizedOriginal = normalizeSpellKey(rawNameOrId);

  if (!normalizedSearch && !normalizedOriginal) return null;

  // 1. Busca exata por ID no catálogo
  for (const spell of T20_SPELLS) {
    const spellIdNorm = normalizeSpellKey(spell.id);
    if (spellIdNorm === normalizedSearch || spellIdNorm === normalizedOriginal) {
      return spell;
    }
  }

  // 2. Busca exata por Nome normalizado no catálogo
  for (const spell of T20_SPELLS) {
    const spellNameNorm = normalizeSpellKey(spell.name);
    if (spellNameNorm === normalizedSearch || spellNameNorm === normalizedOriginal) {
      return spell;
    }
  }

  return null;
};
