import { T20Character } from '../types/t20';
import { T20_CLASSES } from '../data/t20Data';
import { T20_RACES } from '../data/t20Races';
import { buildFichaCompleta } from '../services/characterEngine';

export interface CharacterSummary {
  id: string;
  name: string;
  race: string;
  className: string;
  level: number;
  currentPV: number;
  maxPV: number;
  currentPM: number;
  maxPM: number;
  avatarUrl?: string;
}

export function extractCharacterSummary(character: T20Character & { id: string }): CharacterSummary {
  const rawAny = character as any;
  const name = character.name || character.characterData?.identity?.name || 'Herói sem Nome';
  const level = character.level || character.characterData?.identity?.level || 1;

  // Raça
  let race = rawAny.raceName || rawAny.race || character.characterData?.identity?.raceName;
  if (!race) {
    const raceId = rawAny.raceId || character.characterData?.identity?.raceId;
    const foundRace = T20_RACES.find(r => r.id === raceId || r.slug === raceId);
    race = foundRace ? foundRace.name : 'Humano';
  }

  // Classe
  let className = rawAny.className || rawAny.class;
  if (!className) {
    const classId = (character.classId || character.characterData?.identity?.classId || '').toLowerCase();
    const foundClass = T20_CLASSES[classId as keyof typeof T20_CLASSES];
    className = foundClass ? foundClass.name : (classId ? classId.charAt(0).toUpperCase() + classId.slice(1) : 'Aventureiro');
  }

  // Imagem
  const avatarUrl = rawAny.imageUrl || character.characterData?.identity?.imageUrl || rawAny.avatar || rawAny.photoURL || '';

  // Pontos de Vida (PV) e Pontos de Mana (PM)
  let currentPV = typeof character.currentPV === 'number' ? character.currentPV : (character.characterData?.state?.currentPV ?? 20);
  let maxPV = rawAny.pvMax || character.characterData?.combat?.hpMax || character.characterData?.state?.pvMax || currentPV || 20;

  let currentPM = typeof character.currentPM === 'number' ? character.currentPM : (character.characterData?.state?.currentPM ?? 0);
  let maxPM = rawAny.pmMax || character.characterData?.combat?.manaMax || character.characterData?.state?.pmMax || currentPM || 0;

  if (character.characterData) {
    try {
      const ficha = buildFichaCompleta(character.characterData);
      if (ficha?.resources?.pvMax?.total) {
        maxPV = ficha.resources.pvMax.total;
        currentPV = ficha.resources.pvCurrent ?? currentPV;
      }
      if (ficha?.resources?.pmMax?.total) {
        maxPM = ficha.resources.pmMax.total;
        currentPM = ficha.resources.pmCurrent ?? currentPM;
      }
    } catch {
      // Fallback para os valores já extraídos
    }
  }

  return {
    id: character.id,
    name,
    race,
    className,
    level,
    currentPV,
    maxPV,
    currentPM,
    maxPM,
    avatarUrl
  };
}

export function getClassEmoji(className: string): string {
  const lower = (className || '').toLowerCase();
  if (lower.includes('guerreiro') || lower.includes('cavaleiro') || lower.includes('paladino')) return '⚔️';
  if (lower.includes('arcanista') || lower.includes('mago') || lower.includes('bruxo') || lower.includes('feiticeiro')) return '🧙';
  if (lower.includes('clérigo') || lower.includes('clerigo') || lower.includes('frade')) return '✨';
  if (lower.includes('ladino') || lower.includes('ninja')) return '🗡️';
  if (lower.includes('bárbaro') || lower.includes('barbaro')) return '🪓';
  if (lower.includes('caçador') || lower.includes('cacador') || lower.includes('arqueiro')) return '🏹';
  if (lower.includes('bardo')) return '📜';
  if (lower.includes('bucaneiro')) return '🏴‍☠️';
  if (lower.includes('druida')) return '🌿';
  if (lower.includes('inventor')) return '⚙️';
  if (lower.includes('lutador')) return '🥊';
  if (lower.includes('nobre')) return '👑';
  return '⚔️';
}
