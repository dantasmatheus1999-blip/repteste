
export interface MonsterStats {
  hp: number;
  defense: number;
  attack: number;
  damage: string;
  saveDC: number;
  fortitude: number;
  reflexes: number;
  will: number;
}

export type MonsterRole = 'bruto' | 'emboscador' | 'controlador' | 'conjurador' | 'tanque' | 'especialista';
export type MonsterRank = 'normal' | 'elite' | 'chefe';
export type CreatureType = 'animal' | 'besta' | 'construto' | 'demônio' | 'espírito' | 'humanoide' | 'monstro' | 'morto-vivo' | 'planta';

export const ND_TABLE: Record<string, MonsterStats> = {
  '1/4': { hp: 10, defense: 13, attack: 3, damage: '1d6+2', saveDC: 10, fortitude: 2, reflexes: 2, will: 0 },
  '1/2': { hp: 20, defense: 15, attack: 5, damage: '1d8+4', saveDC: 12, fortitude: 4, reflexes: 4, will: 2 },
  '1': { hp: 40, defense: 17, attack: 7, damage: '2d6+6', saveDC: 14, fortitude: 6, reflexes: 6, will: 4 },
  '2': { hp: 60, defense: 19, attack: 10, damage: '2d8+8', saveDC: 16, fortitude: 8, reflexes: 8, will: 6 },
  '3': { hp: 80, defense: 21, attack: 13, damage: '3d6+10', saveDC: 18, fortitude: 10, reflexes: 10, will: 8 },
  '4': { hp: 100, defense: 23, attack: 16, damage: '3d8+12', saveDC: 20, fortitude: 12, reflexes: 12, will: 10 },
  '5': { hp: 120, defense: 25, attack: 19, damage: '4d6+14', saveDC: 22, fortitude: 14, reflexes: 14, will: 12 },
  '7': { hp: 160, defense: 28, attack: 23, damage: '4d8+18', saveDC: 25, fortitude: 17, reflexes: 17, will: 15 },
  '10': { hp: 240, defense: 32, attack: 30, damage: '6d6+24', saveDC: 30, fortitude: 22, reflexes: 22, will: 20 },
  '15': { hp: 400, defense: 40, attack: 42, damage: '8d8+35', saveDC: 38, fortitude: 30, reflexes: 30, will: 28 },
  '20': { hp: 600, defense: 50, attack: 55, damage: '12d8+50', saveDC: 48, fortitude: 40, reflexes: 40, will: 38 },
};

export const ROLE_MODIFIERS: Record<MonsterRole, Partial<MonsterStats>> = {
  bruto: { hp: 1.5, attack: 2, damage: 'bonus', defense: -2 },
  emboscador: { attack: 3, reflexes: 4, defense: 2, hp: 0.8 },
  controlador: { saveDC: 4, will: 4, hp: 0.9 },
  conjurador: { saveDC: 6, will: 6, hp: 0.7, defense: -2 },
  tanque: { defense: 6, fortitude: 4, hp: 1.3, attack: -2 },
  especialista: { attack: 4, reflexes: 4, will: 2, hp: 0.9 },
};

export const RANK_MODIFIERS: Record<MonsterRank, number> = {
  normal: 1,
  elite: 2,
  chefe: 4,
};

export const MONSTER_NAMES = {
  prefixes: ['Sombrio', 'Gélido', 'Atroz', 'Maldito', 'Ancestral', 'Venenoso', 'Feroz', 'Espectral', 'Corrompido', 'Gigante'],
  bases: ['Lobo', 'Aranha', 'Ogro', 'Zumbi', 'Esqueleto', 'Verme', 'Gárgula', 'Quimera', 'Basilisco', 'Troll', 'Golem', 'Espectro'],
  suffixes: ['das Sombras', 'de Arton', 'dos Ermos', 'da Montanha', 'do Abismo', 'da Floresta', 'do Pântano', 'das Ruínas'],
};

export const MONSTER_ABILITIES: Record<MonsterRole, string[]> = {
  bruto: [
    'Fúria: Recebe +2 em testes de ataque e rolagens de dano, mas sofre -2 em Defesa. Dura até o fim da cena ou até ficar inconsciente.',
    'Pancada Pesada: Se acertar um ataque corpo a corpo, o alvo deve ser bem sucedido em um teste de Fortitude (CD base) ou fica Caído.',
    'Resistência Física: A criatura ignora os primeiros 5 pontos de dano de cada ataque (RD 5).',
    'Golpe de Esmagar: Uma vez por rodada, pode gastar sua ação de movimento para que seu próximo ataque cause +1 dado de dano.',
  ],
  emboscador: [
    'Ataque Furtivo: Causa +2d6 de dano adicional contra alvos desprevenidos ou flanqueados.',
    'Camuflagem: Recebe +5 em testes de Furtividade e pode se esconder mesmo sem cobertura total.',
    'Bote: Se realizar uma investida, pode atacar como uma ação padrão e realizar um ataque adicional com uma arma natural.',
    'Veneno Paralisante: Alvo atingido deve passar em Fortitude (CD base) ou fica Lento por 1d4 rodadas.',
  ],
  controlador: [
    'Presença Aterradora: Todos os inimigos em alcance curto devem passar em Vontade (CD base) ou ficam Abalados por 1d6 rodadas.',
    'Lentidão: Ataques reduzem o deslocamento do alvo em -3m por 1 rodada (cumulativo).',
    'Grito de Comando: Aliados em alcance médio recebem +2 em testes de ataque e Defesa por 1 rodada.',
    'Névoa Obscurecedora: Cria uma área de fumaça em alcance curto que fornece camuflagem para todos dentro dela.',
  ],
  conjurador: [
    'Magia Inata: Pode lançar 3 magias de 1º ou 2º círculo (CD base) sem custo de PM.',
    'Escudo Arcano: Como uma reação, recebe +4 na Defesa contra um ataque específico.',
    'Dreno de Mana: Alvo atingido por um ataque mágico perde 1d4 PM; a criatura recupera a mesma quantidade.',
    'Contramágica: Uma vez por rodada, pode tentar dissipar uma magia lançada em alcance curto (teste de Vontade vs CD da magia).',
  ],
  tanque: [
    'Bloqueio com Escudo: Como uma reação, pode reduzir o dano de um ataque recebido em 5 + ND.',
    'Provocação: Inimigos adjacentes sofrem -5 em testes de ataque contra qualquer alvo que não seja esta criatura.',
    'Imovível: Recebe +10 em testes para resistir a manobras de combate (empurrar, derrubar, etc.).',
    'Pilar de Ferro: Enquanto não se mover, recebe +2 em Defesa e todos os testes de resistência.',
  ],
  especialista: [
    'Análise Tática: No início de seu turno, escolhe um inimigo. Recebe +2 em Defesa e Ataque contra esse alvo até o fim da cena.',
    'Ponto Fraco: Seus ataques ignoram qualquer Redução de Dano (RD) inferior a 10.',
    'Agilidade Prodigiosa: Pode realizar uma ação de movimento adicional por rodada como uma ação livre.',
    'Mestre de Armas: Recebe +2 em margem de ameaça e multiplicador de crítico x3.',
  ],
};

export const MONSTER_TACTICS: Record<MonsterRole, string> = {
  bruto: 'Ataca o inimigo mais próximo com força bruta, ignorando sua própria segurança.',
  emboscador: 'Espera nas sombras e ataca os alvos mais frágeis (conjuradores ou arqueiros) primeiro.',
  controlador: 'Mantém distância e usa habilidades para atrapalhar o movimento e as ações dos heróis.',
  conjurador: 'Fica na retaguarda, lançando magias e usando seus aliados como barreira.',
  tanque: 'Posiciona-se na frente do grupo, tentando atrair todos os ataques para si.',
  especialista: 'Escolhe um alvo por vez e usa táticas precisas para eliminá-lo rapidamente.',
};
