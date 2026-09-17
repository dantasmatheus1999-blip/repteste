import { 
  ATTACK_NAMES, 
  ATTACK_NAMES_BY_STYLE,
  ATTACK_NAMES_BY_TYPE,
  ATTACK_EFFECTS, 
  ATTACK_EFFECTS_BY_STYLE,
  AttackStyle, 
  AttackType
} from '../constants/attackData';
import { MonsterRole, MonsterRank, CombatRole, CombatStyle, CreatureType, getT20CreatureParameters } from '../constants/monsterData';

export const AttackGeneratorService = {
  /**
   * Converte um valor de dano médio alvo em uma fórmula de dados clássica de Tormenta 20.
   */
  generateDiceFormula(targetAverage: number): string {
    const avg = Math.max(2, Math.round(targetAverage));

    if (avg <= 4) {
      const bonus = Math.max(0, avg - 3);
      return bonus > 0 ? `1d6+${bonus}` : '1d6';
    }
    if (avg <= 8) {
      const bonus = Math.max(1, avg - 4);
      return `1d8+${bonus}`;
    }
    if (avg <= 13) {
      const bonus = Math.max(2, avg - 7);
      return `2d6+${bonus}`;
    }
    if (avg <= 18) {
      const bonus = Math.max(3, avg - 9);
      return `2d8+${bonus}`;
    }
    if (avg <= 24) {
      const bonus = Math.max(4, avg - 13);
      return `3d8+${bonus}`;
    }
    if (avg <= 32) {
      const bonus = Math.max(6, avg - 16);
      return `3d10+${bonus}`;
    }
    if (avg <= 44) {
      const bonus = Math.max(8, avg - 18);
      return `4d10+${bonus}`;
    }
    if (avg <= 58) {
      const bonus = Math.max(10, avg - 22);
      return `5d10+${bonus}`;
    }
    if (avg <= 75) {
      const bonus = Math.max(14, avg - 27);
      return `6d10+${bonus}`;
    }
    if (avg <= 95) {
      const bonus = Math.max(18, avg - 36);
      return `8d10+${bonus}`;
    }
    
    // Níveis épicos / altos
    const bonus = Math.max(25, avg - 54);
    return `12d8+${bonus}`;
  },

  /**
   * Constrói os ataques da criatura a partir do dano médio alvo da Tabela 2-3 de T20 e seu estilo de combate.
   * Regra 9: Separação absoluta entre ataques e magias. A seção de ataques NÃO contém magias.
   */
  generateAttacks(params: {
    nd: string;
    combatRole?: CombatRole;
    combatStyle?: CombatStyle;
    role?: MonsterRole;
    rank?: MonsterRank;
    attackBonus: number;
    targetDamage: number;
    saveDC: number;
    type?: CreatureType;
    theme?: string;
  }): string[] {
    const { 
      nd, 
      combatRole = 'solo', 
      combatStyle = 'marcial', 
      role = 'bruto', 
      rank = 'normal', 
      attackBonus, 
      targetDamage, 
      saveDC,
      type = 'monstro',
      theme = 'Geral'
    } = params;

    const style: CombatStyle = combatStyle || (role === 'conjurador' ? 'conjurador' : role === 'emboscador' ? 'atirador' : role === 'controlador' ? 'tatico' : 'marcial');
    const attacks: string[] = [];

    const ndRef = getT20CreatureParameters(combatRole, nd);
    const ndValue = ndRef ? ndRef.ndValue : this.parseNd(nd);

    // Determinar complexidade/nível de efeitos baseado no ND
    let ndLevel: 'low' | 'medium' | 'high' | 'boss' = 'low';
    if (ndValue >= 15) ndLevel = 'boss';
    else if (ndValue >= 7) ndLevel = 'high';
    else if (ndValue >= 2) ndLevel = 'medium';
    else ndLevel = 'low';

    // Determinar quantidade de ataques e distribuição do dano médio
    let attackCount = 1;
    if (style === 'conjurador') {
      // Conjuradores têm 1 ataque físico de foco (cajado, adaga, toque)
      attackCount = 1;
    } else if (rank === 'chefe') {
      attackCount = ndValue >= 7 ? 3 : 2;
    } else if (rank === 'elite') {
      attackCount = ndValue >= 4 ? 2 : 1;
    } else {
      attackCount = (style === 'atirador' || role === 'emboscador') && ndValue >= 7 ? 2 : 1;
    }

    const damagePerAttack = Math.max(2, targetDamage / attackCount);
    const usedNames = new Set<string>();

    for (let i = 0; i < attackCount; i++) {
      const attackName = this.getRandomName(style, type, usedNames);
      
      let attackType: AttackType = 'Corpo a corpo';
      if (style === 'atirador') {
        attackType = 'À distância';
      } else if (style === 'tatico' && i > 0 && Math.random() > 0.5) {
        attackType = 'À distância';
      }

      const damageFormula = this.generateDiceFormula(damagePerAttack);
      const effect = this.getRandomEffect(style, ndLevel, rank);

      const attackStr = `${attackName} — ${attackType}\n+${attackBonus} no teste de ataque | Dano: ${damageFormula}${effect ? `\nEfeito: ${effect.replace(/CD base/g, `CD ${saveDC}`)}` : ''}`;
      attacks.push(attackStr);
    }

    return attacks;
  },

  parseNd(nd: string): number {
    if (nd === '1/4') return 0.25;
    if (nd === '1/2') return 0.5;
    if (nd === 'S') return 25;
    if (nd === 'S+') return 30;
    return parseInt(nd, 10) || 1;
  },

  getRandomName(style: CombatStyle, type: CreatureType, usedNames: Set<string>): string {
    const stylePool = ATTACK_NAMES_BY_STYLE[style] || ATTACK_NAMES_BY_STYLE.marcial;
    const typePool = ATTACK_NAMES_BY_TYPE[type] || [];
    
    // Mescla o estilo com os ataques naturais do tipo de criatura (especialmente animais, bestas, mortos-vivos, monstros)
    const isBeastLike = ['animal', 'besta', 'monstro', 'planta'].includes(type);
    let combinedPool = [...stylePool];
    if (isBeastLike && style === 'marcial' && typePool.length > 0) {
      combinedPool = [...typePool, ...stylePool];
    } else if (type === 'morto-vivo' || type === 'demônio' || type === 'espírito' || type === 'construto') {
      combinedPool = [...typePool, ...stylePool];
    }

    let name = combinedPool[Math.floor(Math.random() * combinedPool.length)];
    let attempts = 0;
    while (usedNames.has(name) && attempts < 10) {
      name = combinedPool[Math.floor(Math.random() * combinedPool.length)];
      attempts++;
    }
    usedNames.add(name);
    return name;
  },

  getRandomEffect(style: CombatStyle, ndLevel: 'low' | 'medium' | 'high' | 'boss', rank: MonsterRank): string | null {
    const chance = rank === 'chefe' ? 0.85 : rank === 'elite' ? 0.6 : 0.4;
    if (Math.random() > chance && ndLevel === 'low') return null;

    const styleEffects = ATTACK_EFFECTS_BY_STYLE[style] || ATTACK_EFFECTS_BY_STYLE.marcial;

    let effects: string[] = [];
    if (rank === 'chefe') {
      effects = [...styleEffects.boss, ...styleEffects.high];
    } else if (ndLevel === 'high' || ndLevel === 'boss') {
      effects = styleEffects.high;
    } else if (ndLevel === 'medium') {
      effects = styleEffects.medium;
    } else {
      effects = styleEffects.low;
    }

    return effects[Math.floor(Math.random() * effects.length)];
  }
};
