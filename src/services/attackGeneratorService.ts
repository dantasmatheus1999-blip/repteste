
import { 
  ATTACK_NAMES, 
  ATTACK_EFFECTS, 
  ATTACK_STYLES, 
  AttackStyle, 
  AttackType,
  BOSS_SPECIAL_ACTIONS
} from '../constants/attackData';
import { MonsterRole, MonsterRank } from '../constants/monsterData';

export const AttackGeneratorService = {
  generateAttacks(params: {
    nd: string;
    role: MonsterRole;
    rank: MonsterRank;
    attackBonus: number;
    damage: string;
    saveDC: number;
  }): string[] {
    const { nd, role, rank, attackBonus, damage, saveDC } = params;
    const style: AttackStyle = ATTACK_STYLES[role] || 'bruto';
    const attacks: string[] = [];

    // Determine ND level
    let ndLevel: 'low' | 'medium' | 'high' | 'boss' = 'low';
    const ndValue = this.parseNd(nd);
    
    if (ndValue >= 20) ndLevel = 'boss';
    else if (ndValue >= 7) ndLevel = 'high';
    else if (ndValue >= 2) ndLevel = 'medium';
    else ndLevel = 'low';

    // Determine number of attacks
    let numAttacks = 1;
    if (rank === 'chefe') {
      numAttacks = ndLevel === 'low' ? 2 : ndLevel === 'medium' ? 2 : 3;
    } else if (rank === 'elite') {
      numAttacks = ndLevel === 'high' || ndLevel === 'boss' ? 2 : 1;
    } else {
      numAttacks = ndLevel === 'high' || ndLevel === 'boss' ? 2 : 1;
    }

    // Generate attacks
    const usedNames = new Set<string>();
    for (let i = 0; i < numAttacks; i++) {
      const attackName = this.getRandomName(style, usedNames);
      const attackType: AttackType = role === 'conjurador' ? 'Mágico' : role === 'emboscador' ? 'À distância' : 'Corpo a corpo';
      const effect = this.getRandomEffect(ndLevel, rank);
      
      const attackStr = `${attackName} — ${attackType}\n+${attackBonus} ataque | ${damage} dano${effect ? `\nEfeito: ${effect.replace('CD base', `CD ${saveDC}`)}` : ''}`;
      attacks.push(attackStr);
    }

    // Add Boss Special Actions
    if (rank === 'chefe') {
      const specialAction = BOSS_SPECIAL_ACTIONS[Math.floor(Math.random() * BOSS_SPECIAL_ACTIONS.length)];
      attacks.push(specialAction.replace('CD base', `CD ${saveDC}`));
    }

    return attacks;
  },

  parseNd(nd: string): number {
    if (nd === '1/4') return 0.25;
    if (nd === '1/2') return 0.5;
    return parseInt(nd, 10);
  },

  getRandomName(style: AttackStyle, usedNames: Set<string>): string {
    const names = ATTACK_NAMES[style];
    let name = names[Math.floor(Math.random() * names.length)];
    let attempts = 0;
    while (usedNames.has(name) && attempts < 10) {
      name = names[Math.floor(Math.random() * names.length)];
      attempts++;
    }
    usedNames.add(name);
    return name;
  },

  getRandomEffect(ndLevel: 'low' | 'medium' | 'high' | 'boss', rank: MonsterRank): string | null {
    const chance = rank === 'chefe' ? 1 : rank === 'elite' ? 0.7 : 0.4;
    if (Math.random() > chance && ndLevel === 'low') return null;

    let effects: string[] = [];
    if (rank === 'chefe') {
      effects = [...ATTACK_EFFECTS.boss, ...ATTACK_EFFECTS.high];
    } else if (ndLevel === 'high' || ndLevel === 'boss') {
      effects = ATTACK_EFFECTS.high;
    } else if (ndLevel === 'medium') {
      effects = ATTACK_EFFECTS.medium;
    } else {
      effects = ATTACK_EFFECTS.low;
    }

    return effects[Math.floor(Math.random() * effects.length)];
  }
};
