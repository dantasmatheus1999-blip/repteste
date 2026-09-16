import { T20Character, T20Class } from '../types/t20';

export const T20Engine = {
  // Tormenta 20 — Edição Jogo do Ano:
  // O próprio valor do atributo é o modificador (+0, +1, +2, etc.).
  // Mantém retrocompatibilidade para valores legados (>= 8).
  getMod: (value: number) => {
    const v = Number(value || 0);
    return v >= 8 ? Math.floor((v - 10) / 2) : v;
  },

  getHalfLevel: (level: number) => Math.floor(level / 2),

  calculateMaxPV: (char: T20Character, charClass: T20Class) => {
    const conValue = char.attributes.CON + (char.attrBonus.CON || 0);
    const conMod = T20Engine.getMod(conValue);
    return charClass.pvBase + conMod + ((charClass.pvPerLevel + conMod) * (char.level - 1));
  },

  calculateMaxPM: (char: T20Character, charClass: T20Class) => {
    const mainAttr = charClass.mainAttr as keyof typeof char.attributes;
    const attrValue = char.attributes[mainAttr] + (char.attrBonus[mainAttr] || 0);
    const attrMod = T20Engine.getMod(attrValue);
    return charClass.pmBase + ((charClass.pmPerLevel) * (char.level - 1));
  },

  calculateDefense: (char: T20Character, inventory: any[]) => {
    const dexValue = char.attributes.DES + (char.attrBonus.DES || 0);
    const dexMod = T20Engine.getMod(dexValue);
    let bonus = 0;
    inventory.forEach(item => {
      if (item.equipped && (item.type === 'armor' || item.type === 'shield')) {
        bonus += item.bonus || 0;
      }
    });
    return 10 + dexMod + bonus;
  },

  calculateSkill: (char: T20Character, skillId: string, baseAttr: string) => {
    const skillData = char.skills[skillId] || { trained: false, extra: 0, others: 0 };
    const attrKey = (skillData.attrOverride || baseAttr) as keyof typeof char.attributes;
    
    const attrValue = char.attributes[attrKey] + (char.attrBonus[attrKey] || 0);
    const attrMod = T20Engine.getMod(attrValue);
    const halfLevel = T20Engine.getHalfLevel(char.level);
    const trainingBonus = skillData.trained ? (char.level >= 15 ? 6 : char.level >= 7 ? 4 : 2) : 0;
    
    return {
      total: halfLevel + attrMod + trainingBonus + (skillData.extra || 0) + (skillData.others || 0),
      attrMod,
      halfLevel,
      trainingBonus,
      extra: skillData.extra || 0,
      others: skillData.others || 0
    };
  },

  calculateSpellDC: (char: T20Character, mainAttr: string) => {
    const attrKey = mainAttr as keyof typeof char.attributes;
    const attrValue = char.attributes[attrKey] + (char.attrBonus[attrKey] || 0);
    return 10 + T20Engine.getHalfLevel(char.level) + T20Engine.getMod(attrValue);
  },

  calculateLoadLimit: (char: T20Character) => {
    const strValue = char.attributes.FOR + (char.attrBonus.FOR || 0);
    const mod = T20Engine.getMod(strValue);
    return 10 + (2 * mod);
  }
};

