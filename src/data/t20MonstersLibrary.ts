export interface T20MonsterItem {
  id: string;
  name: string;
  nd: string;
  ndValue: number;
  type: string;
  size: string;
  role: 'Solo' | 'Lacaio' | 'Especial';
  scale: 'Normal' | 'Elite' | 'Chefe';
  hp: number;
  mana: number;
  defense: number;
  initiative: number;
  perception: number;
  speed: string;
  fortitude: number;
  reflexes: number;
  will: number;
  attacks: { name: string; bonus: number; damage: string; type: string; extra?: string }[];
  abilities: { name: string; type?: string; description: string }[];
  description: string;
  tactics?: string;
  treasure?: string;
}

export const T20_STANDARD_MONSTERS: T20MonsterItem[] = [
  {
    id: 'goblin-salteador',
    name: 'Goblin Salteador',
    nd: '1/4',
    ndValue: 0.25,
    type: 'Humanoide',
    size: 'Pequeno',
    role: 'Lacaio',
    scale: 'Normal',
    hp: 12,
    mana: 0,
    defense: 14,
    initiative: 4,
    perception: 2,
    speed: '9m',
    fortitude: 1,
    reflexes: 5,
    will: 0,
    attacks: [
      { name: 'Adaga', bonus: 4, damage: '1d4+2', type: 'perfuração' },
      { name: 'Arco Curto', bonus: 5, damage: '1d6+1', type: 'perfuração' }
    ],
    abilities: [
      { name: 'Visão no Escuro', description: 'Goblins enxergam no escuro perfeitamente a até 18 metros.' },
      { name: 'Fuga Ágil', description: 'Pode usar a ação Desengajar ou Esconder-se como uma ação de movimento.' }
    ],
    description: 'Goblins saqueadores que atacam viajantes nas estradas em emboscadas covardes.',
    tactics: 'Atacam à distância escondidos na vegetação e fogem assim que sofrem baixas.',
    treasure: 'Moedas de cobre, adaga gasta e bugigangas.'
  },
  {
    id: 'esqueleto-guerreiro',
    name: 'Esqueleto Guerreiro',
    nd: '1/2',
    ndValue: 0.5,
    type: 'Morto-Vivo',
    size: 'Médio',
    role: 'Lacaio',
    scale: 'Normal',
    hp: 20,
    mana: 0,
    defense: 15,
    initiative: 2,
    perception: 0,
    speed: '9m',
    fortitude: 3,
    reflexes: 2,
    will: -1,
    attacks: [
      { name: 'Espada Longa Antiga', bonus: 5, damage: '1d8+3', type: 'corte' }
    ],
    abilities: [
      { name: 'Resistência a Dano', description: 'Resistência a corte e perfuração 5. Vulnerabilidade a impacto.' },
      { name: 'Imunidades de Morto-Vivo', description: 'Imune a efeitos de trevas, veneno, sono, paralisia e cansaço.' }
    ],
    description: 'Restos mortais reanimados por necromancia ou energia negativa que empunham armas enferrujadas.',
    tactics: 'Avançam implacavelmente sem medo da morte.',
    treasure: 'Armadura gasta e armas antigas.'
  },
  {
    id: 'zumbi-putrido',
    name: 'Zumbi Pútrido',
    nd: '1/2',
    ndValue: 0.5,
    type: 'Morto-Vivo',
    size: 'Médio',
    role: 'Lacaio',
    scale: 'Normal',
    hp: 28,
    mana: 0,
    defense: 12,
    initiative: -1,
    perception: -1,
    speed: '6m',
    fortitude: 6,
    reflexes: 0,
    will: 0,
    attacks: [
      { name: 'Pancada Contaminada', bonus: 4, damage: '1d6+4', type: 'impacto', extra: 'Fortitude CD 13 ou Doença do Túmulo' }
    ],
    abilities: [
      { name: 'Lento', description: 'O zumbi só pode realizar uma ação padrão ou de movimento por rodada, nunca ambas.' },
      { name: 'Resistência a Dano', description: 'Resistência a corte e perfuração 5.' }
    ],
    description: 'Cadáver ambulante em decomposição com cheiro nauseante de putrefação.',
    tactics: 'Arrastam-se em direção à presa viva mais próxima em grupos.',
    treasure: 'Restos de roupas e ossos.'
  },
  {
    id: 'orc-guerreiro',
    name: 'Orc Guerreiro',
    nd: '1',
    ndValue: 1,
    type: 'Humanoide',
    size: 'Médio',
    role: 'Solo',
    scale: 'Normal',
    hp: 42,
    mana: 0,
    defense: 16,
    initiative: 3,
    perception: 2,
    speed: '9m',
    fortitude: 7,
    reflexes: 3,
    will: 2,
    attacks: [
      { name: 'Machado de Batalha', bonus: 8, damage: '1d12+6', type: 'corte', extra: 'Crítico x3' },
      { name: 'Azagaia', bonus: 6, damage: '1d6+4', type: 'perfuração' }
    ],
    abilities: [
      { name: 'Fúria Guerreira', description: 'Quando com menos da metade dos PV, ganha +2 em testes de ataque e rolagens de dano corpo a corpo.' }
    ],
    description: 'Combatentes tribais fortes e ferozes devotados ao combate honrado ou à pilhagem.',
    tactics: 'Atiram azagaias ao se aproximar e entram em fúria no combate corpo a corpo.',
    treasure: 'Moedas de prata e machado orc.'
  },
  {
    id: 'lobo-da-caverna',
    name: 'Lobo das Cavernas',
    nd: '1',
    ndValue: 1,
    type: 'Animal',
    size: 'Grande',
    role: 'Solo',
    scale: 'Normal',
    hp: 38,
    mana: 0,
    defense: 15,
    initiative: 5,
    perception: 6,
    speed: '15m',
    fortitude: 6,
    reflexes: 6,
    will: 2,
    attacks: [
      { name: 'Mordida Derrubadora', bonus: 7, damage: '1d8+5', type: 'perfuração', extra: 'Reflexos CD 14 ou é derrubado' }
    ],
    abilities: [
      { name: 'Faro Aguçado', description: 'Recebe +5 em testes de Percepção para rastrear e detectar criaturas invisíveis a até 9m.' },
      { name: 'Táticas de Matilha', description: 'Ganha +2 no ataque para cada aliado adjacente ao mesmo alvo.' }
    ],
    description: 'Predador feroz que caça em alcateias nas florestas escuras e montanhas de Arton.',
    tactics: 'Cercam as presas e tentam derrubá-las para que o bando ataque com vantagem.',
    treasure: 'Pele e presas valiosas.'
  },
  {
    id: 'ogro-brutamontes',
    name: 'Ogro Brutamontes',
    nd: '3',
    ndValue: 3,
    type: 'Humanoide',
    size: 'Grande',
    role: 'Solo',
    scale: 'Normal',
    hp: 95,
    mana: 0,
    defense: 18,
    initiative: 1,
    perception: 2,
    speed: '12m',
    fortitude: 11,
    reflexes: 3,
    will: 3,
    attacks: [
      { name: 'Clava Gigante', bonus: 12, damage: '2d8+10', type: 'impacto' },
      { name: 'Pedregulho Arremessado', bonus: 8, damage: '2d6+8', type: 'impacto' }
    ],
    abilities: [
      { name: 'Pancada Esmagadora', description: 'Se acertar um golpe crítico com a clava, o alvo fica atordoado por 1 rodada (Fortitude CD 17 evita).' },
      { name: 'Brutalidade', description: 'Adiciona o dobro do modificador de Força às jogadas de dano com armas de duas mãos.' }
    ],
    description: 'Gigante monstruoso, com pele coriácea e força descomunal, capaz de partir árvores com um golpe.',
    tactics: 'Avança com golpes devastadores no inimigo de aparência mais frágil.',
    treasure: 'Bolsa de ossos, moedas de ouro e joias brutas.'
  },
  {
    id: 'lobisomem-alfa',
    name: 'Lobisomem Alfa',
    nd: '4',
    ndValue: 4,
    type: 'Monstro',
    size: 'Médio',
    role: 'Solo',
    scale: 'Elite',
    hp: 130,
    mana: 8,
    defense: 22,
    initiative: 8,
    perception: 9,
    speed: '15m',
    fortitude: 12,
    reflexes: 10,
    will: 7,
    attacks: [
      { name: 'Mordida Voraz', bonus: 14, damage: '1d10+8', type: 'perfuração', extra: 'Fortitude CD 18 ou Licantropia' },
      { name: 'Garras Gêmeas', bonus: 14, damage: '1d8+8', type: 'corte' }
    ],
    abilities: [
      { name: 'Regeneração 10', description: 'Recupera 10 PV no início de seu turno. Dano por armas de prata suprime a regeneração por 1 rodada.' },
      { name: 'Uivo Aterrorizante', description: 'Como ação padrão (1 PM), todas as criaturas a até 9m devem passar em Vontade CD 17 ou ficam apavoradas por 1d4 rodadas.' }
    ],
    description: 'Líder feroz de uma matilha amaldiçoada pela lua cheia, dotado de cura sobrenatural e sede insaciável.',
    tactics: 'Inicia com o Uivo Aterrorizante e ataca os alvos em pânico com fúria primal.',
    treasure: 'Pertences de antigas vítimas e amuletos tribais.'
  },
  {
    id: 'lefon-corruptor',
    name: 'Lefon Corruptor da Tormenta',
    nd: '5',
    ndValue: 5,
    type: 'Monstro da Tormenta',
    size: 'Grande',
    role: 'Solo',
    scale: 'Elite',
    hp: 165,
    mana: 16,
    defense: 25,
    initiative: 7,
    perception: 8,
    speed: '12m, escalada 9m',
    fortitude: 14,
    reflexes: 9,
    will: 13,
    attacks: [
      { name: 'Tentáculo de Quitina Vermelha', bonus: 16, damage: '2d6+9', type: 'ácido e impacto', extra: 'Agarrar livre CD 20' },
      { name: 'Ferrão Aberrante', bonus: 16, damage: '1d10+9', type: 'perfuração', extra: 'Veneno da Tormenta (CD 19, 2d8 trevas)' }
    ],
    abilities: [
      { name: 'Aura da Loucura', description: 'Qualquer criatura que comece seu turno a até 6m do Lefon deve passar em Vontade CD 18 ou sofre 2d6 de dano psíquico e fica confusa por 1 rodada.' },
      { name: 'Deformidade da Realidade', description: 'Ataques mágicos contra o Lefon têm 20% de chance de serem engolidos pela distorção da matéria.' }
    ],
    description: 'Aberração grotesca feita de carapaça rubra quitinosa e olhos múltiplos que distorce o espaço ao redor.',
    tactics: 'Envolve os alvos em sua aura de loucura e os agarra com seus tentáculos corrosivos.',
    treasure: 'Matéria Vermelha da Tormenta (componente alquímico lendário).'
  },
  {
    id: 'grifo-das-alturas',
    name: 'Grifo das Alturas',
    nd: '4',
    ndValue: 4,
    type: 'Monstro',
    size: 'Grande',
    role: 'Solo',
    scale: 'Normal',
    hp: 110,
    mana: 0,
    defense: 21,
    initiative: 7,
    perception: 10,
    speed: '9m, voo 24m',
    fortitude: 11,
    reflexes: 11,
    will: 6,
    attacks: [
      { name: 'Bico de Águia Gigante', bonus: 13, damage: '1d10+7', type: 'perfuração' },
      { name: 'Garras de Leão', bonus: 13, damage: '1d8+7', type: 'corte' }
    ],
    abilities: [
      { name: 'Mergulho Mortal', description: 'Se voar pelo menos 9m em linha reta antes de atacar, causa +2d8 de dano adicional.' },
      { name: 'Visão de Rapina', description: 'Recebe +5 em testes de Percepção visual.' }
    ],
    description: 'Criatura majestosa com corpo de leão e cabeça e asas de águia dourada que nidifica nos picos mais altos.',
    tactics: 'Ataca em mergulho rasante das nuvens e agarra presas para soltá-las do alto.',
    treasure: 'Ovos de grifo ou penas douradas valiosas.'
  },
  {
    id: 'dragao-vermelho-jovem',
    name: 'Dragão Vermelho Jovem',
    nd: '8',
    ndValue: 8,
    type: 'Monstro',
    size: 'Grande',
    role: 'Solo',
    scale: 'Chefe',
    hp: 310,
    mana: 25,
    defense: 30,
    initiative: 10,
    perception: 14,
    speed: '12m, voo 30m',
    fortitude: 18,
    reflexes: 13,
    will: 15,
    attacks: [
      { name: 'Mordida Flamejante', bonus: 21, damage: '2d8+12', type: 'perfuração', extra: '+2d6 fogo' },
      { name: 'Garras Destruidoras', bonus: 21, damage: '1d10+12', type: 'corte' },
      { name: 'Golpe de Cauda', bonus: 19, damage: '1d12+10', type: 'impacto' }
    ],
    abilities: [
      { name: 'Sopro de Fogo Devastador (Recarga 1d4 rodadas)', description: 'Cone de 9m. Causa 10d6 de dano de fogo a todas as criaturas na área (Reflexos CD 22 reduz à metade).' },
      { name: 'Presença Aterradora', description: 'Vontade CD 20 ou fica abalado por 1 minuto.' },
      { name: 'Imunidade a Fogo', description: 'Imune a dano de fogo e efeitos de calor extremo.' }
    ],
    description: 'Um tirano alado de escamas carmesim brilhantes, ávido por ouro, glória e destruição.',
    tactics: 'Abre o combate com o Sopro de Fogo enquanto voa alto e finaliza combatentes isolados.',
    treasure: 'Tesouro de Dragão: milhares de T$, gemas preciosas e itens mágicos.'
  }
];
