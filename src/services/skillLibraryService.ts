import { MonsterAbility } from '../types/master';

interface SkillBase {
  name: string;
  type: 'Passiva' | 'Ativa' | 'Reativa' | 'Especial';
  effect: string;
  condition?: string;
  range?: string;
  duration?: string;
  recharge?: string;
  description: string;
}

export const PASSIVE_SKILLS: SkillBase[] = [
  { name: 'Pele Resistente', type: 'Passiva', effect: '+2 na Defesa.', description: 'A pele da criatura é naturalmente dura ou protegida por escamas/carapaça.' },
  { name: 'Regeneração', type: 'Passiva', effect: 'Recupera 5 PV por rodada.', description: 'A criatura possui um metabolismo acelerado que fecha feridas rapidamente.' },
  { name: 'Instinto Selvagem', type: 'Passiva', effect: '+5 em Iniciativa e Percepção.', description: 'Sentidos aguçados e reflexos animais.' },
  { name: 'Aura Sombria', type: 'Passiva', effect: 'Inimigos a até 3m sofrem -2 em testes de ataque.', description: 'Uma névoa de trevas emana da criatura, obscurecendo a visão e drenando a esperança.' },
  { name: 'Corpo Elemental', type: 'Passiva', effect: 'Resistência 10 ao elemento do tema.', description: 'O corpo da criatura é composto ou imbuído de energia elemental.' },
  { name: 'Aura do Líder', type: 'Passiva', effect: 'Aliados a até 9m recebem +1 em testes de ataque.', description: 'A presença da criatura inspira seus subordinados.' },
];

export const ACTIVE_SKILLS: SkillBase[] = [
  { name: 'Golpe Poderoso', type: 'Ativa', effect: 'O próximo ataque causa +2d6 de dano.', condition: 'Gasta 2 PM', description: 'A criatura concentra toda sua força em um único golpe devastador.' },
  { name: 'Investida', type: 'Ativa', effect: 'Move-se o dobro do deslocamento e ataca com +2.', condition: 'Linha reta', description: 'A criatura corre em direção ao alvo com ímpeto total.' },
  { name: 'Grito de Guerra', type: 'Ativa', effect: 'Aliados em alcance curto recebem +2 em ataque e dano.', duration: '2 rodadas', range: '9m', description: 'Um urro aterrorizante que encoraja aliados e intimida inimigos.' },
  { name: 'Rajada Mágica', type: 'Ativa', effect: 'Causa 4d6 de dano em uma área de cone.', range: '6m', recharge: '5-6', description: 'Uma explosão de energia pura disparada contra os oponentes.' },
  { name: 'Dreno de Energia', type: 'Ativa', effect: 'Causa 2d6 de dano e recupera metade em PV.', condition: 'Ataque de toque', description: 'A criatura suga a vitalidade do alvo através do contato.' },
];

export const REACTIVE_SKILLS: SkillBase[] = [
  { name: 'Contra-ataque', type: 'Reativa', effect: 'Se um inimigo errar um ataque corpo-a-corpo, a criatura pode fazer um ataque imediato.', condition: 'Uma vez por rodada', description: 'A criatura aproveita a brecha na defesa do oponente.' },
  { name: 'Esquiva Rápida', type: 'Reativa', effect: 'Reduz o dano de um ataque sofrido pela metade.', condition: 'Gasta 1 PM', description: 'Um movimento reflexo que evita o pior do impacto.' },
  { name: 'Retaliação', type: 'Reativa', effect: 'Inimigos que atingirem a criatura em combate corpo-a-corpo sofrem 1d6 de dano.', description: 'Espinhos, eletricidade ou puro ódio ferem quem ousa tocar a criatura.' },
  { name: 'Defesa Instintiva', type: 'Reativa', effect: '+5 na Defesa contra o próximo ataque.', condition: 'Gasta 2 PM', description: 'A criatura antecipa o golpe e se protege no último segundo.' },
];

export const SPECIAL_SKILLS: SkillBase[] = [
  { name: 'Fúria Descontrolada', type: 'Especial', effect: '+4 em ataque e dano, mas -4 na Defesa.', condition: 'Quando PV < 50%', description: 'A criatura entra em um estado de frenesi assassino.' },
  { name: 'Domínio de Campo', type: 'Especial', effect: 'O terreno a até 9m torna-se difícil para inimigos.', duration: 'Cena', description: 'A criatura altera o ambiente ao seu redor para favorecer sua caça.' },
  { name: 'Aura de Medo', type: 'Especial', effect: 'Inimigos que iniciam o turno a até 9m ficam abachados.', condition: 'Vontade CD 20 evita', description: 'A mera presença da criatura gela o sangue dos mais bravos.' },
  { name: 'Chamado das Criaturas', type: 'Especial', effect: 'Invoca 1d4 aliados de ND menor.', recharge: 'Uma vez por combate', description: 'A criatura emite um chamado que atrai reforços próximos.' },
  { name: 'Explosão Final', type: 'Especial', effect: 'Ao morrer, explode causando 10d6 de dano em área.', range: '6m', description: 'A energia contida na criatura é liberada violentamente em seu último suspiro.' },
  { name: 'Presença do Boss', type: 'Especial', effect: 'Todos os aliados ganham +2 em todas as resistências.', description: 'A autoridade inquestionável do líder fortalece o espírito de seu bando.' },
];

export const ALL_SKILLS = [...PASSIVE_SKILLS, ...ACTIVE_SKILLS, ...REACTIVE_SKILLS, ...SPECIAL_SKILLS];

export const SKILL_INTENSITIES = ['Fraco', 'Normal', 'Forte'];
export const SKILL_RANGES = ['Pessoal', 'Toque', 'Curto', 'Médio', 'Longo', '3m', '6m', '9m', '12m', '18m'];
export const SKILL_DURATIONS = ['Instantânea', '1 Rodada', 'Cena', 'Dia', 'Sustentada'];
export const SKILL_RECHARGES = ['Nenhuma', '1/Rodada', '1/Cena', '1/Dia', '5-6'];
export const SKILL_THEMES = ['Nenhum', 'Fogo', 'Gelo', 'Veneno', 'Trevas', 'Luz', 'Relâmpago', 'Ácido'];

export class SkillLibraryService {
  static getSkillByName(name: string): SkillBase | undefined {
    return ALL_SKILLS.find(s => s.name === name);
  }

  static buildGuidedSkill(params: {
    baseName: string;
    intensity: string;
    range: string;
    duration: string;
    recharge: string;
    theme: string;
  }): MonsterAbility {
    const base = this.getSkillByName(params.baseName);
    if (!base) return { name: params.baseName, description: '', type: 'Passiva' };

    const themed = this.applyTheme(base, params.theme);
    
    const typeMap: Record<string, string> = {
      'Passiva': 'Passiva',
      'Ativa': 'Ação',
      'Reativa': 'Reação',
      'Especial': 'Ação'
    };

    let effect = themed.effect;
    if (params.intensity === 'Forte') effect = effect.replace(/\d+/, (m) => (parseInt(m) + 2).toString());
    if (params.intensity === 'Fraco') effect = effect.replace(/\d+/, (m) => Math.max(1, parseInt(m) - 2).toString());

    return {
      name: themed.name,
      type: typeMap[themed.type] || 'Passiva',
      description: themed.description,
      cost: themed.condition?.includes('PM') ? themed.condition : '',
      condition: themed.condition?.includes('PM') ? '' : themed.condition,
      range: params.range || themed.range || 'Pessoal',
      cooldown: params.recharge || themed.recharge || 'Nenhuma',
      observations: effect + (params.duration ? ` Duração: ${params.duration}.` : (themed.duration ? ` Duração: ${themed.duration}.` : ''))
    };
  }

  static generateSkills(nd: string, theme: string, rank: string): MonsterAbility[] {
    const ndValue = this.parseND(nd);
    const numSkills = this.determineNumSkills(ndValue, rank);
    const abilities: MonsterAbility[] = [];

    // Categories to pick from based on ND and Rank
    const categories: ('Passiva' | 'Ativa' | 'Reativa' | 'Especial')[] = [];
    
    if (rank === 'Chefe') {
      categories.push('Especial', 'Ativa', 'Passiva', 'Reativa');
    } else if (rank === 'Elite') {
      categories.push('Especial', 'Ativa', 'Passiva');
    } else {
      if (ndValue >= 10) {
        categories.push('Ativa', 'Passiva', 'Reativa');
      } else if (ndValue >= 5) {
        categories.push('Ativa', 'Passiva');
      } else {
        categories.push(Math.random() > 0.5 ? 'Ativa' : 'Passiva');
      }
    }

    // Ensure we don't exceed the number of skills
    const finalCategories = categories.slice(0, numSkills);

    finalCategories.forEach(cat => {
      const base = this.getRandomBase(cat);
      const themed = this.applyTheme(base, theme);
      
      // Map SkillLibrary types to MonsterForm types
      const typeMap: Record<string, string> = {
        'Passiva': 'Passiva',
        'Ativa': 'Ação',
        'Reativa': 'Reação',
        'Especial': 'Ação' // Specials are usually actions in T20
      };

      abilities.push({
        name: themed.name,
        type: typeMap[themed.type] || 'Passiva',
        description: themed.description,
        cost: themed.condition?.includes('PM') ? themed.condition : '',
        condition: themed.condition?.includes('PM') ? '' : themed.condition,
        range: themed.range || 'Pessoal',
        cooldown: themed.recharge || 'Nenhuma',
        observations: themed.effect + (themed.duration ? ` Duração: ${themed.duration}.` : '')
      });
    });

    return abilities;
  }

  private static parseND(nd: string): number {
    if (nd === '1/2') return 0.5;
    if (nd === '1/4') return 0.25;
    return parseInt(nd) || 1;
  }

  private static determineNumSkills(nd: number, rank: string): number {
    if (rank === 'Chefe') return 4;
    if (rank === 'Elite') return 3;
    if (nd >= 10) return 3;
    if (nd >= 5) return 2;
    return 1;
  }

  private static getRandomBase(category: 'Passiva' | 'Ativa' | 'Reativa' | 'Especial'): SkillBase {
    const list = category === 'Passiva' ? PASSIVE_SKILLS : 
                 category === 'Ativa' ? ACTIVE_SKILLS : 
                 category === 'Reativa' ? REACTIVE_SKILLS : SPECIAL_SKILLS;
    return list[Math.floor(Math.random() * list.length)];
  }

  private static applyTheme(base: SkillBase, theme: string): SkillBase {
    if (theme === 'Nenhum') return base;

    const themeMap: Record<string, Partial<SkillBase>> = {
      'Fogo': { 
        name: base.name.includes('Aura') ? 'Aura de Chamas' : base.name + ' Flamejante',
        effect: base.effect + ' Adiciona efeito de Queimadura (1d6/rodada).'
      },
      'Gelo': { 
        name: base.name.includes('Aura') ? 'Aura Congelante' : base.name + ' Glacial',
        effect: base.effect + ' Reduz o deslocamento do alvo em 3m.'
      },
      'Veneno': { 
        name: base.name.includes('Aura') ? 'Aura Tóxica' : base.name + ' Venenosa',
        effect: base.effect + ' Adiciona efeito de Envenenamento (1d4/rodada).'
      },
      'Trevas': { 
        name: base.name.includes('Aura') ? 'Aura Sombria' : base.name + ' das Sombras',
        effect: base.effect + ' Drena 1 PM do alvo ao atingir.'
      },
      'Luz': { 
        name: base.name.includes('Aura') ? 'Aura Divina' : base.name + ' Sagrada',
        effect: base.effect + ' Causa dano dobrado contra mortos-vivos.'
      },
    };

    const mod = themeMap[theme];
    if (!mod) return base;

    return {
      ...base,
      name: mod.name || base.name,
      effect: mod.effect || base.effect,
    };
  }
}
