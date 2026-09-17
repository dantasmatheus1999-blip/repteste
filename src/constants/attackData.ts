
import { CombatStyle, CreatureType } from './monsterData';

export type AttackStyle = CombatStyle;
export type AttackType = 'Corpo a corpo' | 'À distância' | 'Mágico';

export interface AttackTemplate {
  name: string;
  style: AttackStyle;
  type: AttackType;
  effect?: string;
}

export const ATTACK_NAMES_BY_STYLE: Record<CombatStyle, string[]> = {
  marcial: [
    'Espada Longa de Aço', 'Machado de Batalha Pesado', 'Lança de Guerra Afiada', 
    'Garras Dilacerantes', 'Mordida Feroz', 'Pancada Brutal com Maça', 
    'Montante Vorpal', 'Mangual Pesado', 'Chifrada Esmagadora', 
    'Golpe com Escudo Espinhoso', 'Alabarda de Cerco', 'Garras de Predador'
  ],
  atirador: [
    'Arco Longo Composto', 'Besta Pesada de Repetição', 'Disparo de Projéteis Perfurantes', 
    'Lançamento de Dardos Furtivos', 'Tiro de Precisão com Arco Curto', 'Zarabatana Envenenada', 
    'Virote de Cerco', 'Lança de Arremesso Balanceada', 'Saraivada de Flechas',
    'Disparo com Mosquete de Pederneira', 'Espinhos Ósseos Disparados'
  ],
  conjurador: [
    'Cajado Arcano Encantado', 'Adaga Ritualística de Obsidiana', 'Toque de Mana Desestabilizador', 
    'Golpe com Cetro de Foco', 'Chicote de Energia Pura', 'Cajado de Batalha Talhado'
  ],
  tatico: [
    'Estocada Precisa com Florete', 'Tridente e Rede de Cerco', 'Sabre de Duelo e Guarda', 
    'Chicote de Aço com Ganchos', 'Lança Curta e Broquel', 'Gládio de Infantaria', 
    'Golpe com Cabo de Lança', 'Manobra Desarmadora com Adaga Canhota'
  ]
};

// Ataques específicos por tipo de criatura
export const ATTACK_NAMES_BY_TYPE: Record<CreatureType, string[]> = {
  'animal': ['Mordida Selvagem', 'Garras Afiadas', 'Chifrada', 'Patinada', 'Bote com Presas'],
  'besta': ['Garras Dilacerantes', 'Mordida Voraz', 'Cauda Espinhosa', 'Chifrada Brutal', 'Abocanhar Furioso'],
  'construto': ['Pancada Metálica', 'Lâmina de Engrenagem', 'Martelo de Aço', 'Esmagamento Hidráulico', 'Disparo de Rebites'],
  'demônio': ['Garras Profanas', 'Mordida Corruptora', 'Lâmina de Fogo Infernal', 'Chicote de Almas', 'Ferrão Demoníaco'],
  'espírito': ['Toque Espectral Gélido', 'Lâmina Ectoplásmica', 'Açoite Etéreo', 'Toque Drenador', 'Presença Cortante'],
  'humanoide': ['Espada Longa', 'Machado de Batalha', 'Lança de Guerra', 'Arco Longo', 'Sabre e Escudo', 'Besta'],
  'monstro': ['Tentáculos Constritores', 'Garras Venenosas', 'Mordida de Titã', 'Espinhos Dorsais', 'Varrida com Cauda'],
  'morto-vivo': ['Garras Cadavéricas', 'Mordida da Tumba', 'Toque Necrótico', 'Espada Enferrujada', 'Foice Sombria'],
  'planta': ['Chicote de Cipós', 'Ramos Espinhosos', 'Esporos Agressivos', 'Raízes Constritoras', 'Tronco Esmagador']
};

export const ATTACK_NAMES = ATTACK_NAMES_BY_STYLE;

// Efeitos de ataque separados por Estilo de Combate para manter identidade pura
export const ATTACK_EFFECTS_BY_STYLE: Record<CombatStyle, { low: string[]; medium: string[]; high: string[]; boss: string[] }> = {
  marcial: {
    low: [
      'se acertar, o alvo deve passar em Fortitude (CD base) ou fica Caído.',
      'se acertar, causa +1d4 de dano de sangramento no próximo turno do alvo.',
      'empurra o alvo 1,5m para trás em caso de acerto.',
      'se acertar, a criatura pode tentar uma manobra Derrubar como ação livre.'
    ],
    medium: [
      'se acertar, alvo fica Sangrando (1d6 por turno) e Lento por 1 rodada.',
      'se acertar, a criatura pode tentar uma manobra Derrubar ou Agarrar como ação livre (CD base evita).',
      'se acertar, quebra a guarda do alvo, impondo a condição Vulnerável por 1 rodada.',
      'em acerto crítico, o golpe fratura o alvo, reduzindo seu deslocamento pela metade até o fim do combate.'
    ],
    high: [
      'se acertar, o alvo deve ser bem-sucedido em Fortitude (CD base) ou fica Atordoado por 1 rodada.',
      'o golpe atinge com tremendo impacto: o alvo é arremessado a até 4,5m e fica Caído.',
      'este golpe ignora até 5 pontos de Redução de Dano (RD) do alvo.',
      'se acertar, o alvo perde a ação de reação até o início de seu próximo turno.'
    ],
    boss: [
      'se acertar, o alvo é arremessado a 6m, sofre 2d6 de dano de impacto adicional e fica Caído.',
      'o impacto estilhaça armaduras: ignora qualquer Redução de Dano e impõe -2 na Defesa por 1 rodada.',
      'se acertar com sucesso crítico, o alvo fica Inconsciente ou Atordoado por 1 rodada (Fortitude CD base reduz para Abalado).'
    ]
  },
  atirador: {
    low: [
      'este ataque ignora cobertura leve e penalidade de alcance curto.',
      'se acertar, o alvo tem seu deslocamento reduzido em 3m na próxima rodada.',
      'se disparado de posição furtiva, causa +1d6 de dano perfurante.',
      'se acertar, impõe -2 no próximo teste de ataque do alvo devido à distração.'
    ],
    medium: [
      'tiro no membro: alvo deve passar em Reflexos (CD base) ou fica Lento e Enredado por 1 rodada.',
      'disparo perfurante: ignora até 5 pontos de RD de armadura.',
      'se acertar um alvo flanqueado ou desatento, causa +2d6 de dano de precisão.',
      'projétil debilitante: se acertar, o alvo deve passar em Fortitude (CD base) ou fica Sangrando (1d6 por rodada).'
    ],
    high: [
      'tiro no olho / ponto vital: se acertar, o alvo fica Cego por 1 rodada (Reflexos CD base evita).',
      'disparo cravado: prende o alvo ao chão ou parede adjacente (Força CD base para se soltar).',
      'se acertar, o alvo perde a concentração de qualquer efeito ou magia sustentada.',
      'saraivada rápida: se acertar o primeiro disparo, pode fazer um segundo disparo com -2 contra outro alvo visível.'
    ],
    boss: [
      'tiro letal de franco-atirador: ignora qualquer cobertura parcial e adiciona +3d8 de dano se o alvo estiver a mais de 9m.',
      'projétil perfurante supremo: atravessa até 2 criaturas alinhadas em linha reta com o mesmo teste de ataque.',
      'se acertar com acerto crítico, o alvo fica Incapacitado por 1 rodada devido ao trauma do impacto.'
    ]
  },
  conjurador: {
    low: [
      'se acertar, drena energia mística: o alvo perde 1 PM temporário.',
      'o ataque canaliza o elemento do tema, convertendo todo o dano em dano místico.',
      'se acertar, impõe desvantagem no próximo teste de concentração de magia do alvo.',
      'empurra o alvo 1,5m com um pulso de força arcana/divina.'
    ],
    medium: [
      'toque desestabilizador: se acertar, o alvo sofre -2 em todos os testes de resistência até o fim da rodada.',
      'dreno de mana: se acertar, o alvo perde 2 PM (Vontade CD base reduz à metade).',
      'pulso de energia mística: o alvo fica Ofuscado por 1 rodada (Vontade CD base evita).',
      'se acertar, o conjurador pode se teleportar até 3m como ação livre.'
    ],
    high: [
      'ruptura mística: o alvo sofre 2d6 de dano de mana e perde 3 PM (Vontade CD base reduz à metade).',
      'toque de paralisia arcana: o alvo fica Paralisado por 1 rodada (Vontade CD base evita).',
      'se acertar, o alvo tem qualquer magia ativa de 1º ou 2º círculo dissipada instantaneamente.'
    ],
    boss: [
      'toque aniquilador: dissipa instantaneamente todas as proteções mágicas ativas do alvo e drena 5 PM.',
      'pulso cataclísmico: atinge o alvo primário e emite uma onda que causa metade do dano a todos a até 3m.',
      'em acerto crítico, o alvo fica Silenciado e incapaz de conjurar magias por 1 rodada.'
    ]
  },
  tatico: {
    low: [
      'se acertar, concede +2 no próximo ataque de um aliado contra este mesmo alvo.',
      'se acertar, o tático pode tentar a manobra Desarmar como ação livre (CD base evita).',
      'se acertar, o alvo fica Desorientado (-2 em testes de ataque por 1 rodada).',
      'golpe de cobertura: após o ataque, o tático pode se mover 1,5m sem provocar reações.'
    ],
    medium: [
      'marcação tática: o alvo fica Marcado; todos os ataques de aliados contra ele ganham +2 no teste de ataque por 1 rodada.',
      'quebra de formação: se acertar, empurra o alvo 3m e faz com que ele perca seu bônus de escudo ou cobertura.',
      'golpe no ponto cego: se o alvo estiver flanqueado, fica Vulnerável e Caído (Reflexos CD base evita).',
      'manobra coordenada: se acertar, um aliado a até 9m pode dar um passo de ajuste de 1,5m gratuitamente.'
    ],
    high: [
      'desarme magistral: desarma a arma principal do oponente e a joga a 3m de distância.',
      'desestabilização total: o alvo perde todas as suas reações até o início de seu próximo turno e fica Vulnerável.',
      'ordem de massacre: se acertar, autoriza até 2 aliados adjacentes ao alvo a realizarem um ataque imediato de oportunidade.',
      'golpe paralisante nos tendões: o alvo fica Imóvel por 1 rodada (Fortitude CD base reduz para Lento).'
    ],
    boss: [
      'comando supremo de aniquilação: ao acertar, todos os lacaios e aliados visíveis recebem imediatamente uma ação de ataque com +2.',
      'ruptura de linha defensiva: estilhaça a formação inimiga, forçando todos os heróis a até 4,5m a passarem em Reflexos (CD base) ou ficarem Caídos e Desarmados.',
      'manobra de xeque-mate: impõe a condição Indefeso ao alvo por 1 rodada se ele estiver cercado por 2 ou mais aliados.'
    ]
  }
};

export const ATTACK_EFFECTS = {
  low: ATTACK_EFFECTS_BY_STYLE.marcial.low,
  medium: ATTACK_EFFECTS_BY_STYLE.marcial.medium,
  high: ATTACK_EFFECTS_BY_STYLE.marcial.high,
  boss: ATTACK_EFFECTS_BY_STYLE.marcial.boss
};

export const BOSS_SPECIAL_ACTIONS = [
  'Ação de Chefe: Pode realizar um ataque básico ou se mover no final do turno de um jogador (2/rodada).',
  'Presença Esmagadora: No início do combate, todos os inimigos devem passar em Vontade (CD base) ou ficam Abalados por 1 rodada.',
  'Segunda Fase (50% PV): Remove condições negativas e ganha recursos adicionais de combate.',
  'Reação de Chefe: Desfere contra-ataque ou ergue defesa reativa contra investidas inimigas.',
  'Comando do Mestre: Todos os aliados em alcance médio recebem uma ação de movimento imediata.'
];
