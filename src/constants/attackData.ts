
export type AttackStyle = 'bruto' | 'mágico' | 'rápido' | 'tático';
export type AttackType = 'Corpo a corpo' | 'À distância' | 'Mágico';

export interface AttackTemplate {
  name: string;
  style: AttackStyle;
  type: AttackType;
  effect?: string;
}

export const ATTACK_STYLES: Record<string, AttackStyle> = {
  bruto: 'bruto',
  emboscador: 'rápido',
  controlador: 'tático',
  conjurador: 'mágico',
  tanque: 'bruto',
  especialista: 'tático',
};

export const ATTACK_NAMES: Record<AttackStyle, string[]> = {
  bruto: [
    'Pancada Brutal', 'Golpe Esmagador', 'Investida Selvagem', 'Mordida Voraz', 
    'Garra Dilacerante', 'Impacto de Rocha', 'Marretada Pesada', 'Cabeçada Violenta',
    'Pisada Sísmica', 'Abraço de Urso'
  ],
  mágico: [
    'Sopro Arcano', 'Raio de Energia', 'Explosão Mental', 'Chamas Profanas', 
    'Toque Gélido', 'Relâmpago Purificador', 'Onda de Choque', 'Dreno de Vida',
    'Mísseis Mágicos', 'Chicote de Sombras'
  ],
  rápido: [
    'Bote Veloz', 'Corte Ágil', 'Estocada Precisa', 'Golpe Sombrio', 
    'Disparo Rápido', 'Lâmina Dançante', 'Ataque Relâmpago', 'Frenesi de Garras',
    'Salto Mortal', 'Punhalada Traiçoeira'
  ],
  tático: [
    'Golpe Debilitante', 'Corte Giratório', 'Investida Coordenada', 'Disparo de Precisão', 
    'Ataque de Oportunidade', 'Manobra de Desarme', 'Golpe de Misericórdia', 'Flanquear',
    'Ataque Calculado', 'Varrer Pernas'
  ]
};

export const ATTACK_EFFECTS = {
  low: [
    'se acertar, alvo fica Caído (Fortitude CD base evita).',
    'se acertar, alvo fica Abalado por 1 rodada (Vontade CD base evita).',
    'causa +1d4 de dano de sangramento no início do turno do alvo.',
    'empurra o alvo 1,5m para trás.',
  ],
  medium: [
    'se acertar, alvo fica Sangrando (1d6 por turno).',
    'se acertar, alvo fica Lento por 1 rodada (Fortitude CD base evita).',
    'se acertar, alvo fica Vulnerável por 1 rodada.',
    'alvo deve ser bem sucedido em Reflexos (CD base) ou fica Enredado.',
    'causa +2d6 de dano de fogo.',
  ],
  high: [
    'se acertar, alvo fica Atordoado por 1 rodada (Fortitude CD base evita).',
    'se acertar, alvo fica Cego por 1 rodada (Reflexos CD base evita).',
    'causa +4d6 de dano de energia.',
    'alvo fica Exausto (Vontade CD base evita).',
    'o ataque atinge todos os inimigos em alcance curto.',
  ],
  boss: [
    'se acertar, o alvo é arremessado a 6m e fica Caído.',
    'o dano deste ataque ignora qualquer Redução de Dano.',
    'se o alvo estiver com menos de 25% de vida, deve ser bem sucedido em Fortitude (CD base) ou morre instantaneamente.',
    'o Boss pode realizar um ataque adicional contra um alvo diferente como parte desta ação.',
    'cria uma zona de terreno difícil em volta do alvo por 2 rodadas.',
  ]
};

export const BOSS_SPECIAL_ACTIONS = [
  'Ação Lendária: Pode realizar um ataque básico ou se mover no final do turno de um jogador (3/rodada).',
  'Presença Esmagadora: No início do combate, todos os inimigos devem passar em Vontade (CD base + 5) ou ficam Paralisados por 1 rodada.',
  'Recuperação Rápida: No início de seu turno, recupera 10% de seu HP máximo.',
  'Fase de Fúria: Ao chegar em 50% de HP, aumenta seu bônus de ataque em +5 e dano em +2d6.',
  'Comando do Mestre: Todos os aliados em alcance médio recebem uma ação de movimento imediata.',
];
