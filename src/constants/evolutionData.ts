
import { MonsterRole, CreatureType } from './monsterData';

export type CombatProfileType = 'agressivo' | 'defensivo' | 'tático' | 'selvagem' | 'arcano' | 'agil';

export interface CombatProfile {
  name: string;
  description: string;
  statModifiers: {
    attack?: number;
    damage?: number;
    defense?: number;
    hpMultiplier?: number;
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
}

export const COMBAT_PROFILES: Record<CombatProfileType, CombatProfile> = {
  agressivo: {
    name: 'Agressivo',
    description: 'Foca em causar pressão ofensiva contínua, investindo rapidamente contra as ameaças.',
    statModifiers: {
      str: 1
    }
  },
  defensivo: {
    name: 'Defensivo',
    description: 'Prioriza a proteção e posicionamento firme, protegendo flancos e pontos vulneráveis.',
    statModifiers: {
      con: 1
    }
  },
  tático: {
    name: 'Tático',
    description: 'Luta com inteligência e leitura de combate, aproveitando brechas e falhas dos heróis.',
    statModifiers: {
      int: 1,
      wis: 1
    }
  },
  selvagem: {
    name: 'Selvagem',
    description: 'Ataques brutais e instintivos impulsionados por ferocidade natural e fúria primal.',
    statModifiers: {
      str: 2
    }
  },
  arcano: {
    name: 'Arcano',
    description: 'Canaliza energias místicas e sobrenaturais para moldar o campo de batalha.',
    statModifiers: {
      int: 2,
      cha: 1
    }
  },
  agil: {
    name: 'Ágil',
    description: 'Foca em mobilidade veloz, esquiva e posicionamento dinâmico.',
    statModifiers: {
      dex: 2
    }
  }
};

export const WEAKNESSES: Record<CreatureType, string[]> = {
  animal: ['Fogo (Vulnerável)', 'Encantamento (Penalidade -2 em Vontade)', 'Medo (Condição Crítica)'],
  besta: ['Gelo (Vulnerável)', 'Armas de Prata (Dano Adicional +5)', 'Luz (Ofuscado por 1 rodada)'],
  construto: ['Eletricidade (Vulnerável)', 'Ácido (Corrosão: -2 Defesa)', 'Impacto (Dano Adicional +2)'],
  demônio: ['Sagrado (Vulnerável)', 'Luz (Penalidade -5 em Furtividade)', 'Ferro Frio (Ignora RD)'],
  espírito: ['Magia (Vulnerável)', 'Som (Dano Adicional +2)', 'Vácuo (Penalidade -2 em Iniciativa)'],
  humanoide: ['Veneno (Vulnerável)', 'Corte (Dano Adicional +2)', 'Fogo (Medo de Queimadura)'],
  monstro: ['Perfuração (Vulnerável)', 'Gelo (Lentidão)', 'Luz (Penalidade -2 em Ataque)'],
  'morto-vivo': ['Luz/Sagrado (Vulnerável)', 'Fogo (Dano Adicional +5)', 'Impacto (Dano Adicional +2)'],
  planta: ['Fogo (Vulnerável)', 'Corte (Dano Adicional +5)', 'Frio (Lentidão)']
};

export const NATURAL_WEAKNESSES: Record<string, string[]> = {
  bruto: ['Baixa Resistência Mental: -2 em testes de Vontade contra efeitos de medo ou controle.'],
  tanque: ['Baixa Mobilidade: -2 em Reflexos e Defesa contra efeitos que criam terreno difícil.'],
  emboscador: ['Vulnerável a Área: Recebe +2 de dano de ataques que atingem múltiplos alvos.'],
  conjurador: ['Vulnerável a Interrupção: Sofre penalidade de -5 em testes de Concentração se sofrer dano.'],
  controlador: ['Dependência de Alcance: Seus ataques sofrem -5 de penalidade se houver um inimigo adjacente.'],
  especialista: ['Foco Único: Sofre -2 na Defesa contra qualquer inimigo que não seja seu alvo atual.'],
  voador: ['Vulnerável a Queda: Se cair, recebe o dobro do dano de queda e fica Caído por 1 rodada extra.'],
  grande: ['Alvo Fácil: Recebe -2 de Defesa contra ataques de alcance ou investidas.'],
  magico: ['Vulnerável a Silêncio: Não pode usar habilidades mágicas se estiver sob efeito de silêncio.'],
};

export interface ElementalTheme {
  resistances: string[];
  weaknesses: string[];
  effect: string;
}

export const ELEMENTAL_THEMES: Record<string, ElementalTheme> = {
  sombra: {
    resistances: ['Trevas (RD 10)', 'Frio (RD 5)'],
    weaknesses: ['Luz: recebe +50% de dano de fontes de luz ou sagradas.'],
    effect: 'Ataques podem causar Ofuscamento (Vontade CD base).'
  },
  fogo: {
    resistances: ['Fogo (Imunidade)'],
    weaknesses: ['Frio/Água: recebe +50% de dano de gelo ou água.'],
    effect: 'Ataques causam 1d6 de dano de fogo adicional por rodada (queimadura).'
  },
  gelo: {
    resistances: ['Frio (Imunidade)'],
    weaknesses: ['Fogo: recebe +50% de dano de fogo.'],
    effect: 'Ataques reduzem o deslocamento do alvo em -3m por 1 rodada.'
  },
  veneno: {
    resistances: ['Veneno (Imunidade)'],
    weaknesses: ['Psíquico/Energia: recebe +50% de dano de efeitos mentais ou puros.'],
    effect: 'Ataques causam a condição Envenenado (Fortitude CD base).'
  },
  arcano: {
    resistances: ['Magia (RD 5)', 'Essência (RD 5)'],
    weaknesses: ['Dreno de Mana: perde 1d6 PM se atingido por efeitos de dissipação.'],
    effect: 'Ataques ignoram os primeiros 5 pontos de RD do alvo.'
  },
  natureza: {
    resistances: ['Ácido (RD 5)', 'Veneno (RD 5)'],
    weaknesses: ['Fogo: recebe +50% de dano de fogo.'],
    effect: 'Pode realizar uma manobra de Agarrar como ação livre após um ataque.'
  },
  sagrado: {
    resistances: ['Luz (RD 10)', 'Energia Positiva (Imunidade)'],
    weaknesses: ['Trevas/Profano: recebe +50% de dano de fontes malignas.'],
    effect: 'Aliados em alcance curto recuperam 2 PV no início de seus turnos.'
  },
  profano: {
    resistances: ['Trevas (RD 10)', 'Energia Negativa (Imunidade)'],
    weaknesses: ['Luz/Sagrado: recebe +50% de dano de fontes divinas ou energia positiva.'],
    effect: 'Inimigos em alcance curto sofrem -2 em testes de Vontade.'
  },
  eletrico: {
    resistances: ['Eletricidade (Imunidade)'],
    weaknesses: ['Terra: recebe +50% de dano de ataques baseados em terra ou pedra.'],
    effect: 'Ataques podem causar a condição Esmorecido (Vontade CD base).'
  },
  terra: {
    resistances: ['Ácido (RD 10)', 'Impacto (RD 5)'],
    weaknesses: ['Ar/Eletricidade: recebe +50% de dano de eletricidade ou vento.'],
    effect: 'Ataques podem causar a condição Caído (Fortitude CD base).'
  }
};

export const SITUATIONAL_WEAKNESSES: string[] = [
  'Vulnerável a Cerco: Recebe +2 de dano quando cercado por 3 ou mais inimigos.',
  'Dificuldade de Terreno: Perde 2 pontos de Defesa quando em terreno difícil.',
  'Sensibilidade à Luz: Sofre penalidade de -2 em testes de ataque sob luz intensa.',
  'Instabilidade: Sofre -5 em testes para resistir a ser empurrado se estiver em uma superfície escorregadia.',
  'Eco Sonoro: Recebe +2 de dano de efeitos de som se estiver em um ambiente fechado.',
];

export const ADVANTAGES: Record<CreatureType, string[]> = {
  animal: ['Faro (Vantagem em Percepção)', 'Resistência a Veneno (RD 5)', 'Agilidade Natural (+2 Reflexos)'],
  besta: ['Pele Grossa (RD 2)', 'Resistência a Frio (RD 5)', 'Sentidos Aguçados (Visão no Escuro)'],
  construto: ['Imunidade a Veneno', 'Imunidade a Doenças', 'Resistência a Corte/Perfuração (RD 5)'],
  demônio: ['Resistência a Fogo (RD 10)', 'Imunidade a Medo', 'Visão na Penumbra'],
  espírito: ['Incorpóreo (50% de chance de ignorar dano não-mágico)', 'Resistência a Frio (RD 10)', 'Imunidade a Veneno'],
  humanoide: ['Trabalho em Equipe (+1 em Ataque por aliado adjacente)', 'Versatilidade (+2 em uma perícia)', 'Resistência Mental (+2 Vontade)'],
  monstro: ['Resistência a Magia (+2 em testes de resistência)', 'Pele de Pedra (RD 5)', 'Recuperação Veloz (Cura 2 PV/rodada)'],
  'morto-vivo': ['Imunidade a Veneno', 'Imunidade a Doenças', 'Imunidade a Efeitos de Encantamento'],
  planta: ['Camuflagem Natural (+5 Furtividade em florestas)', 'Resistência a Impacto (RD 5)', 'Imunidade a Paralisia']
};

export interface Synergy {
  name: string;
  description: string;
  effect: string;
}

export const SYNERGIES: Synergy[] = [
  {
    name: 'Comando do Líder',
    description: 'Se um Chefe estiver presente, esta criatura luta com mais fervor.',
    effect: 'Aliados recebem +2 em Ataque e +2 em Dano enquanto o Chefe estiver vivo.'
  },
  {
    name: 'Matilha Voraz',
    description: 'Criaturas do mesmo tipo caçam juntas com precisão letal.',
    effect: 'Ganha +1 em Ataque para cada outro aliado do mesmo tipo em alcance curto (máx +4).'
  },
  {
    name: 'Escudo de Carne',
    description: 'Protege seus aliados mais importantes com sua própria vida.',
    effect: 'Pode redirecionar metade do dano de um aliado adjacente para si mesma como uma reação.'
  },
  {
    name: 'Sinfonia do Caos',
    description: 'Sua presença distorce a realidade, atrapalhando os heróis.',
    effect: 'Inimigos em alcance curto recebem -2 em testes de Vontade e Iniciativa.'
  },
  {
    name: 'Elo Arcano',
    description: 'Canaliza energia mágica de outros conjuradores próximos.',
    effect: 'Aumenta a CD de suas habilidades em +1 para cada outro aliado conjurador em alcance médio.'
  }
];
