import { MonsterAction } from '../types/master';

interface AttackBase {
  name: string;
  type: 'Corpo-a-corpo' | 'À Distância' | 'Mágico';
  damageType: string;
  range: string;
  baseDamage: string;
}

interface Effect {
  name: string;
  description: string;
  category: 'Controle' | 'Dano Contínuo' | 'Debuff';
}

const MELEE_ATTACKS: AttackBase[] = [
  { name: 'Golpe', type: 'Corpo-a-corpo', damageType: 'Impacto', range: 'Toque', baseDamage: '1d6' },
  { name: 'Pancada', type: 'Corpo-a-corpo', damageType: 'Impacto', range: 'Toque', baseDamage: '1d8' },
  { name: 'Corte', type: 'Corpo-a-corpo', damageType: 'Corte', range: 'Toque', baseDamage: '1d8' },
  { name: 'Estocada', type: 'Corpo-a-corpo', damageType: 'Perfuração', range: 'Toque', baseDamage: '1d6' },
  { name: 'Investida', type: 'Corpo-a-corpo', damageType: 'Impacto', range: 'Curto', baseDamage: '1d10' },
  { name: 'Mordida', type: 'Corpo-a-corpo', damageType: 'Perfuração', range: 'Toque', baseDamage: '1d6' },
  { name: 'Garras', type: 'Corpo-a-corpo', damageType: 'Corte', range: 'Toque', baseDamage: '1d6' },
  { name: 'Presas', type: 'Corpo-a-corpo', damageType: 'Perfuração', range: 'Toque', baseDamage: '1d6' },
  { name: 'Chifrada', type: 'Corpo-a-corpo', damageType: 'Perfuração', range: 'Toque', baseDamage: '1d8' },
  { name: 'Cauda', type: 'Corpo-a-corpo', damageType: 'Impacto', range: 'Curto', baseDamage: '1d6' },
  { name: 'Tentáculo', type: 'Corpo-a-corpo', damageType: 'Impacto', range: 'Curto', baseDamage: '1d6' },
  { name: 'Golpe Brutal', type: 'Corpo-a-corpo', damageType: 'Impacto', range: 'Toque', baseDamage: '2d6' },
  { name: 'Esmagamento', type: 'Corpo-a-corpo', damageType: 'Impacto', range: 'Toque', baseDamage: '2d8' },
  { name: 'Impacto Devastador', type: 'Corpo-a-corpo', damageType: 'Impacto', range: 'Toque', baseDamage: '2d10' },
  { name: 'Ataque Selvagem', type: 'Corpo-a-corpo', damageType: 'Corte', range: 'Toque', baseDamage: '1d12' },
];

const RANGED_ATTACKS: AttackBase[] = [
  { name: 'Arco Curto', type: 'À Distância', damageType: 'Perfuração', range: 'Médio', baseDamage: '1d6' },
  { name: 'Arco Longo', type: 'À Distância', damageType: 'Perfuração', range: 'Longo', baseDamage: '1d8' },
  { name: 'Disparo Preciso', type: 'À Distância', damageType: 'Perfuração', range: 'Médio', baseDamage: '1d8' },
  { name: 'Arremesso de Pedra', type: 'À Distância', damageType: 'Impacto', range: 'Curto', baseDamage: '1d4' },
  { name: 'Arremesso de Lança', type: 'À Distância', damageType: 'Perfuração', range: 'Curto', baseDamage: '1d6' },
  { name: 'Cuspe Ácido', type: 'À Distância', damageType: 'Ácido', range: 'Curto', baseDamage: '1d6' },
  { name: 'Espinhos', type: 'À Distância', damageType: 'Perfuração', range: 'Curto', baseDamage: '1d4' },
  { name: 'Jato de Veneno', type: 'À Distância', damageType: 'Veneno', range: 'Curto', baseDamage: '1d4' },
  { name: 'Projétil Ósseo', type: 'À Distância', damageType: 'Perfuração', range: 'Médio', baseDamage: '1d6' },
];

const MAGIC_ATTACKS: AttackBase[] = [
  { name: 'Rajada de Fogo', type: 'Mágico', damageType: 'Fogo', range: 'Médio', baseDamage: '1d6' },
  { name: 'Sopro Flamejante', type: 'Mágico', damageType: 'Fogo', range: 'Curto', baseDamage: '2d6' },
  { name: 'Explosão de Gelo', type: 'Mágico', damageType: 'Frio', range: 'Curto', baseDamage: '1d10' },
  { name: 'Lança de Gelo', type: 'Mágico', damageType: 'Frio', range: 'Médio', baseDamage: '1d8' },
  { name: 'Raio Elétrico', type: 'Mágico', damageType: 'Eletricidade', range: 'Longo', baseDamage: '1d6' },
  { name: 'Descarga Elétrica', type: 'Mágico', damageType: 'Eletricidade', range: 'Curto', baseDamage: '1d10' },
  { name: 'Toque Sombrio', type: 'Mágico', damageType: 'Trevas', range: 'Toque', baseDamage: '1d8' },
  { name: 'Explosão Sombria', type: 'Mágico', damageType: 'Trevas', range: 'Curto', baseDamage: '2d6' },
  { name: 'Raio de Luz', type: 'Mágico', damageType: 'Luz', range: 'Médio', baseDamage: '1d8' },
  { name: 'Julgamento Divino', type: 'Mágico', damageType: 'Luz', range: 'Longo', baseDamage: '2d6' },
  { name: 'Dreno de Vida', type: 'Mágico', damageType: 'Trevas', range: 'Toque', baseDamage: '1d6' },
  { name: 'Rajada Arcana', type: 'Mágico', damageType: 'Essência', range: 'Médio', baseDamage: '1d4' },
  { name: 'Pulso Mágico', type: 'Mágico', damageType: 'Essência', range: 'Curto', baseDamage: '1d10' },
];

const EFFECTS: Effect[] = [
  { name: 'Derruba', description: 'O alvo deve ser bem-sucedido em um teste de Reflexos ou cairá.', category: 'Controle' },
  { name: 'Empurra', description: 'O alvo é empurrado 3 metros para trás.', category: 'Controle' },
  { name: 'Reduz Deslocamento', description: 'O deslocamento do alvo é reduzido em 3 metros por 1 rodada.', category: 'Controle' },
  { name: 'Sangramento', description: 'O alvo sofre 1d4 de dano de sangramento por rodada.', category: 'Dano Contínuo' },
  { name: 'Queimadura', description: 'O alvo sofre 1d6 de dano de fogo por rodada.', category: 'Dano Contínuo' },
  { name: 'Envenenamento', description: 'O alvo fica envenenado (1d4 de dano por rodada).', category: 'Dano Contínuo' },
  { name: 'Debuff Defesa', description: '-2 na Defesa por 1 rodada.', category: 'Debuff' },
  { name: 'Debuff Ataque', description: '-2 nos testes de ataque por 1 rodada.', category: 'Debuff' },
];

export const ATTACK_CATEGORIES = ['Corpo-a-corpo', 'À Distância', 'Mágico'];
export const ATTACK_BASES = [
  'Golpe', 'Pancada', 'Corte', 'Estocada', 'Investida', 'Mordida', 'Garras', 'Presas', 'Chifrada', 'Cauda', 'Tentáculo',
  'Arco Curto', 'Arco Longo', 'Arremesso de Pedra', 'Arremesso de Lança', 'Cuspe Ácido', 'Jato de Veneno',
  'Rajada de Fogo', 'Lança de Gelo', 'Raio Elétrico', 'Toque Sombrio', 'Rajada Arcana'
];
export const ATTACK_STYLES = ['Brutal', 'Rápido', 'Preciso', 'Pesado', 'Selvagem', 'Tático', 'Elemental'];
export const ATTACK_INTENSITIES = ['Fraco', 'Normal', 'Forte'];
export const ATTACK_EFFECTS = [
  'Nenhum', 'Sangramento', 'Queimadura', 'Envenenamento', 'Congelamento', 'Empurrão', 'Derrubar', 'Reduz deslocamento', 'Penalidade de defesa', 'Penalidade de ataque'
];
export const ATTACK_CRITICALS = ['20 / x2', '19–20 / x2', '19–20 / x3'];
export const ATTACK_RANGES = ['Corpo-a-corpo', 'Curto', 'Médio', 'Longo', '3m', '6m', '9m', '12m', '18m'];
export const ATTACK_THEMES = ['Nenhum', 'Gelo', 'Fogo', 'Veneno', 'Sombra', 'Luz', 'Elétrico', 'Natureza'];

export class AttackLibraryService {
  static buildGuidedAttack(params: {
    category: string;
    base: string;
    style: string;
    intensity: string;
    effect: string;
    critical: string;
    range: string;
    theme: string;
    nd: string;
    rank: string;
  }): MonsterAction {
    const ndValue = this.parseND(params.nd);
    
    // Determine Name
    let name = params.base;
    if (params.theme !== 'Nenhum') {
      const themeSuffixes: Record<string, string> = {
        'Gelo': ' Congelante',
        'Fogo': ' Flamejante',
        'Veneno': ' Venenoso',
        'Sombra': ' Sombrio',
        'Luz': ' Divino',
        'Elétrico': ' Elétrico',
        'Natureza': ' Natural'
      };
      name += themeSuffixes[params.theme] || '';
    }
    if (params.style !== 'Elemental') {
      name = `${params.style} ${name}`;
    }

    // Determine Damage Type
    let damageType = 'Impacto';
    const baseDamageTypes: Record<string, string> = {
      'Corte': 'Corte', 'Garras': 'Corte', 'Mordida': 'Perfuração', 'Estocada': 'Perfuração',
      'Arco Curto': 'Perfuração', 'Arco Longo': 'Perfuração', 'Cuspe Ácido': 'Ácido',
      'Jato de Veneno': 'Veneno', 'Rajada de Fogo': 'Fogo', 'Lança de Gelo': 'Frio',
      'Raio Elétrico': 'Eletricidade', 'Toque Sombrio': 'Trevas', 'Rajada Arcana': 'Essência'
    };
    damageType = baseDamageTypes[params.base] || 'Impacto';
    
    const themeDamageTypes: Record<string, string> = {
      'Gelo': 'Frio', 'Fogo': 'Fogo', 'Veneno': 'Veneno', 'Sombra': 'Trevas',
      'Luz': 'Luz', 'Elétrico': 'Eletricidade'
    };
    if (params.theme !== 'Nenhum' && themeDamageTypes[params.theme]) {
      damageType = themeDamageTypes[params.theme];
    }

    // Calculate Bonus
    let bonus = this.calculateBonus(ndValue, params.rank, 0);
    if (params.style === 'Preciso') bonus += 2;
    if (params.intensity === 'Forte') bonus += 1;
    if (params.intensity === 'Fraco') bonus -= 2;

    // Calculate Damage
    const baseDiceMap: Record<string, string> = {
      'Golpe': '1d6', 'Pancada': '1d8', 'Corte': '1d8', 'Estocada': '1d6', 'Investida': '1d10',
      'Mordida': '1d6', 'Garras': '1d6', 'Presas': '1d6', 'Chifrada': '1d8', 'Cauda': '1d6', 'Tentáculo': '1d6',
      'Arco Curto': '1d6', 'Arco Longo': '1d8', 'Arremesso de Pedra': '1d4', 'Arremesso de Lança': '1d6',
      'Cuspe Ácido': '1d6', 'Jato de Veneno': '1d4', 'Rajada de Fogo': '1d6', 'Lança de Gelo': '1d8',
      'Raio Elétrico': '1d6', 'Toque Sombrio': '1d8', 'Rajada Arcana': '1d4'
    };
    let damage = this.calculateDamage(baseDiceMap[params.base] || '1d6', ndValue, params.rank);
    
    // Adjust damage by intensity and style
    if (params.style === 'Brutal' || params.style === 'Pesado' || params.intensity === 'Forte') {
      const match = damage.match(/(\d+)d(\d+)\+(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        const size = parseInt(match[2]);
        const flat = parseInt(match[3]);
        damage = `${num}d${size}+${flat + 2}`;
      }
    }

    // Effect Description
    let description = '';
    if (params.effect !== 'Nenhum') {
      const effectObj = EFFECTS.find(e => e.name === params.effect);
      if (effectObj) {
        description = `Efeito: ${effectObj.name}. ${effectObj.description}`;
      } else {
        description = `Efeito: ${params.effect}.`;
      }
    }

    return {
      name,
      type: params.category as any,
      bonus,
      damage,
      critical: params.critical,
      range: params.range,
      damageType,
      description
    };
  }

  static generateAttacks(nd: string, theme: string, rank: string): MonsterAction[] {
    const ndValue = this.parseND(nd);
    const numAttacks = this.determineNumAttacks(ndValue, rank);
    const actions: MonsterAction[] = [];

    for (let i = 0; i < numAttacks; i++) {
      // Choose category based on theme or random
      const category = this.chooseCategory(theme, i);
      const base = this.getRandomBase(category);
      
      // Apply theme
      const themedBase = this.applyTheme(base, theme);
      
      // Calculate bonus and damage
      const bonus = this.calculateBonus(ndValue, rank, i);
      const damage = this.calculateDamage(themedBase.baseDamage, ndValue, rank);
      
      // Determine critical
      const critical = this.determineCritical(ndValue, rank);
      
      // Add effect
      const effect = this.determineEffect(ndValue, rank, i, theme);
      
      actions.push({
        name: themedBase.name,
        type: themedBase.type,
        bonus,
        damage,
        critical,
        range: themedBase.range,
        damageType: themedBase.damageType,
        description: effect ? `Efeito: ${effect.name}. ${effect.description}` : '',
      });
    }

    return actions;
  }

  private static parseND(nd: string): number {
    if (nd === '1/2') return 0.5;
    if (nd === '1/4') return 0.25;
    return parseInt(nd) || 1;
  }

  private static determineNumAttacks(nd: number, rank: string): number {
    if (rank === 'Chefe') return 3;
    if (rank === 'Elite' || nd >= 10) return 2;
    if (nd >= 5) return 2;
    return 1;
  }

  private static chooseCategory(theme: string, index: number): 'Melee' | 'Ranged' | 'Magic' {
    if (theme !== 'Nenhum' && index === 0) return 'Magic';
    const rand = Math.random();
    if (rand < 0.6) return 'Melee';
    if (rand < 0.8) return 'Ranged';
    return 'Magic';
  }

  private static getRandomBase(category: 'Melee' | 'Ranged' | 'Magic'): AttackBase {
    const list = category === 'Melee' ? MELEE_ATTACKS : category === 'Ranged' ? RANGED_ATTACKS : MAGIC_ATTACKS;
    return list[Math.floor(Math.random() * list.length)];
  }

  private static applyTheme(base: AttackBase, theme: string): AttackBase {
    if (theme === 'Nenhum') return base;

    // If the base attack already has a theme-like name, don't double it
    if (base.name.toLowerCase().includes(theme.toLowerCase())) return base;

    const themeMap: Record<string, { nameSuffix: string; type: string }> = {
      'Fogo': { nameSuffix: ' Flamejante', type: 'Fogo' },
      'Gelo': { nameSuffix: ' Congelante', type: 'Frio' },
      'Veneno': { nameSuffix: ' Venenoso', type: 'Veneno' },
      'Trevas': { nameSuffix: ' Sombrio', type: 'Trevas' },
      'Luz': { nameSuffix: ' Divino', type: 'Luz' },
      'Relâmpago': { nameSuffix: ' Elétrico', type: 'Eletricidade' },
      'Ácido': { nameSuffix: ' Ácido', type: 'Ácido' },
    };

    const mod = themeMap[theme];
    if (!mod) return base;

    // Special cases for specific names
    let newName = base.name + mod.nameSuffix;
    if (base.name === 'Raio' && theme === 'Luz') newName = 'Raio Divino';
    if (base.name === 'Toque' && theme === 'Trevas') newName = 'Toque Sombrio';

    return {
      ...base,
      name: newName,
      damageType: mod.type,
    };
  }

  private static calculateBonus(nd: number, rank: number | string, index: number): number {
    let base = 2 + Math.floor(nd * 1.5);
    if (rank === 'Elite') base += 2;
    if (rank === 'Chefe') base += 4;
    // Secondary attacks might have a penalty in some systems, but T20 usually keeps them high for monsters
    return base - (index * 2); 
  }

  private static calculateDamage(baseDice: string, nd: number, rank: string): string {
    const diceMatch = baseDice.match(/(\d+)d(\d+)/);
    if (!diceMatch) return baseDice;

    let numDice = parseInt(diceMatch[1]);
    const dieSize = parseInt(diceMatch[2]);
    let flatBonus = Math.floor(nd / 2) + 2;

    if (nd >= 5) numDice += 1;
    if (nd >= 15) numDice += 1;
    if (rank === 'Elite') flatBonus += 2;
    if (rank === 'Chefe') {
      numDice += 1;
      flatBonus += 4;
    }

    return `${numDice}d${dieSize}+${flatBonus}`;
  }

  private static determineCritical(nd: number, rank: string): string {
    if (rank === 'Chefe') return '19–20 / x3';
    if (rank === 'Elite' || nd >= 10) return '19–20 / x2';
    return '20 / x2';
  }

  private static determineEffect(nd: number, rank: string, index: number, theme: string): Effect | null {
    // Theme specific effects (Mandatory if theme is set)
    if (theme === 'Fogo') return { name: 'Queimadura', description: 'O alvo sofre 1d6 de dano de fogo por rodada.', category: 'Dano Contínuo' };
    if (theme === 'Gelo') return { name: 'Reduz Deslocamento', description: 'O deslocamento do alvo é reduzido em 3 metros por 1 rodada.', category: 'Controle' };
    if (theme === 'Veneno') return { name: 'Envenenamento', description: 'O alvo fica envenenado (1d4 de dano por rodada).', category: 'Dano Contínuo' };
    if (theme === 'Trevas') return { name: 'Dreno de Vida', description: 'O monstro recupera PV igual a metade do dano causado.', category: 'Debuff' };
    if (theme === 'Luz') return { name: 'Julgamento Divino', description: 'Causa +1d6 de dano extra contra mortos-vivos.', category: 'Debuff' };

    // Low ND might not have effects for generic monsters
    if (nd < 2 && rank === 'Lacaio') return null;

    // Higher ND or Rank increases chance of effect
    const chance = rank === 'Chefe' ? 1 : rank === 'Elite' ? 0.7 : 0.4;
    if (Math.random() > chance) return null;

    // Random effect from library
    return EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
  }
}
