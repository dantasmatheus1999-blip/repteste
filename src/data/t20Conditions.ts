export interface T20ConditionDef {
  id: string;
  name: string;
  category: 'física' | 'mental' | 'sentidos' | 'especial';
  shortDesc: string;
  fullDesc: string;
  severity: 'leve' | 'moderada' | 'grave';
}

export const T20_CONDITIONS: T20ConditionDef[] = [
  {
    id: 'abalado',
    name: 'Abalado',
    category: 'mental',
    shortDesc: '-2 em testes de perícia.',
    fullDesc: 'O personagem sofre -2 em testes de perícia. Se ficar abalado novamente, fica apavorado.',
    severity: 'leve'
  },
  {
    id: 'agarrado',
    name: 'Agarrado',
    category: 'física',
    shortDesc: 'Desprevenido, imóvel, -2 em ataques.',
    fullDesc: 'O personagem fica desprevenido e imóvel, sofre -2 em testes de ataque e só pode atacar com armas leves.',
    severity: 'moderada'
  },
  {
    id: 'alquebrado',
    name: 'Alquebrado',
    category: 'mental',
    shortDesc: '+1 PM no custo de habilidades e magias.',
    fullDesc: 'O custo em Pontos de Mana de todas as habilidades e magias do personagem aumenta em +1 PM.',
    severity: 'moderada'
  },
  {
    id: 'apavorado',
    name: 'Apavorado',
    category: 'mental',
    shortDesc: 'Abalado e deve fugir da fonte de medo.',
    fullDesc: 'O personagem sofre -5 em testes de perícia e deve fugir da fonte do medo o mais rápido possível.',
    severity: 'grave'
  },
  {
    id: 'asfixiado',
    name: 'Asfixiado',
    category: 'física',
    shortDesc: 'Sem ar; perde PV a cada rodada.',
    fullDesc: 'O personagem não consegue respirar. A cada rodada sem respirar, perde PV gradualmente até a morte.',
    severity: 'grave'
  },
  {
    id: 'atordoado',
    name: 'Atordoado',
    category: 'mental',
    shortDesc: 'Incapaz de agir, desprevenido e -5 na Defesa.',
    fullDesc: 'O personagem fica indefeso, não pode realizar ações, fica desprevenido e sofre -5 na Defesa.',
    severity: 'grave'
  },
  {
    id: 'caido',
    name: 'Caído',
    category: 'física',
    shortDesc: '-5 em ataques c/c; +5 Defesa vs dist; -5 Defesa vs c/c.',
    fullDesc: 'O personagem sofre -5 em ataques corpo a corpo e deslocamento reduzido a 1,5m. Sofre -5 na Defesa contra ataques corpo a corpo e recebe +5 na Defesa contra ataques à distância.',
    severity: 'leve'
  },
  {
    id: 'cego',
    name: 'Cego',
    category: 'sentidos',
    shortDesc: 'Desprevenido, -5 na Defesa, tudo tem camuflagem total.',
    fullDesc: 'O personagem fica desprevenido e sofre -5 na Defesa. Todos os alvos têm camuflagem total para ele (50% de chance de erro). Testes de Percepção baseados em visão falham automaticamente.',
    severity: 'grave'
  },
  {
    id: 'confuso',
    name: 'Confuso',
    category: 'mental',
    shortDesc: 'Age aleatoriamente a cada rodada (1d6).',
    fullDesc: 'O personagem não consegue controlar suas ações. No início de cada turno, role 1d6 para determinar sua ação.',
    severity: 'grave'
  },
  {
    id: 'debilitado',
    name: 'Debilitado',
    category: 'física',
    shortDesc: '-5 em testes de Força, Destreza e Constituição.',
    fullDesc: 'O personagem sofre -5 em testes de atributos físicos (FOR, DES, CON) e perícias baseadas neles.',
    severity: 'grave'
  },
  {
    id: 'desarmado',
    name: 'Desarmado',
    category: 'física',
    shortDesc: 'Sem armas empunhadas.',
    fullDesc: 'O personagem não está empunhando nenhuma arma; seus ataques desarmados causam dano não letal.',
    severity: 'leve'
  },
  {
    id: 'desprevenido',
    name: 'Desprevenido',
    category: 'física',
    shortDesc: '-5 na Defesa e em Reflexos.',
    fullDesc: 'O personagem sofre -5 na Defesa e em testes de Reflexos, e não pode fazer ataques de oportunidade.',
    severity: 'moderada'
  },
  {
    id: 'em-chamas',
    name: 'Em Chamas',
    category: 'física',
    shortDesc: 'Sofre 1d6 de dano de fogo no início do turno.',
    fullDesc: 'O personagem está pegando fogo e sofre 1d6 de dano de fogo no início do seu turno até gastar uma ação padrão para apagar.',
    severity: 'moderada'
  },
  {
    id: 'enfeiticado',
    name: 'Enfeitiçado',
    category: 'mental',
    shortDesc: 'Considera a fonte uma pessoa querida e confiável.',
    fullDesc: 'O personagem tem sua atitude mudada para prestativo em relação à fonte do feitiço e a defende como um amigo íntimo.',
    severity: 'moderada'
  },
  {
    id: 'envenenado',
    name: 'Envenenado',
    category: 'física',
    shortDesc: 'Efeito contínuo de veneno.',
    fullDesc: 'O personagem está sob efeito de uma toxina, sofrendo dano contínuo ou penalidades a cada rodada.',
    severity: 'moderada'
  },
  {
    id: 'esmorecido',
    name: 'Esmorecido',
    category: 'mental',
    shortDesc: '-5 em testes de Inteligência, Sabedoria e Carisma.',
    fullDesc: 'O personagem sofre -5 em testes de atributos mentais (INT, SAB, CAR) e perícias baseadas neles.',
    severity: 'grave'
  },
  {
    id: 'exausto',
    name: 'Exausto',
    category: 'física',
    shortDesc: 'Debilitado, lento e vulnerável.',
    fullDesc: 'O personagem fica debilitado, lento e vulnerável. Precisa de um descanso longo para recuperar-se.',
    severity: 'grave'
  },
  {
    id: 'fascinado',
    name: 'Fascinado',
    category: 'mental',
    shortDesc: '-5 em Percepção, incapaz de agir exceto olhar.',
    fullDesc: 'O personagem tem a atenção presa. Fica imóvel e sofre -5 em Percepção. Qualquer perigo evidente quebra a fascinação.',
    severity: 'leve'
  },
  {
    id: 'fatigado',
    name: 'Fatigado',
    category: 'física',
    shortDesc: 'Fraco e vulnerável.',
    fullDesc: 'O personagem fica fraco e vulnerável. Não pode correr nem fazer investidas.',
    severity: 'moderada'
  },
  {
    id: 'fraco',
    name: 'Fraco',
    category: 'física',
    shortDesc: '-2 em testes de Força, Destreza e Constituição.',
    fullDesc: 'O personagem sofre -2 em testes de atributos físicos (FOR, DES, CON) e perícias baseadas neles.',
    severity: 'leve'
  },
  {
    id: 'imovel',
    name: 'Imóvel',
    category: 'física',
    shortDesc: 'Deslocamento reduzido a 0m.',
    fullDesc: 'O personagem não pode se deslocar por seus próprios meios (deslocamento 0m).',
    severity: 'moderada'
  },
  {
    id: 'inconsciente',
    name: 'Inconsciente',
    category: 'física',
    shortDesc: 'Indefeso, não pode agir, cai no chão.',
    fullDesc: 'O personagem fica indefeso, não pode realizar ações e cai no chão. Apagado do mundo ao redor.',
    severity: 'grave'
  },
  {
    id: 'indefeso',
    name: 'Indefeso',
    category: 'física',
    shortDesc: 'Desprevenido, -10 na Defesa, golpe de misericórdia.',
    fullDesc: 'O personagem está amarrado, paralisado ou inconsciente. Fica desprevenido, sofre -10 na Defesa e pode sofrer um golpe de misericórdia.',
    severity: 'grave'
  },
  {
    id: 'invisivel',
    name: 'Invisível',
    category: 'especial',
    shortDesc: 'Camuflagem total, +5 em testes de ataque.',
    fullDesc: 'O personagem não pode ser visto normalmente. Tem camuflagem total e recebe +5 em testes de ataque contra quem não pode vê-lo.',
    severity: 'leve'
  },
  {
    id: 'lento',
    name: 'Lento',
    category: 'física',
    shortDesc: 'Deslocamento reduzido à metade, sem correr/investida.',
    fullDesc: 'O deslocamento do personagem é reduzido à metade e ele não pode correr ou fazer investidas.',
    severity: 'leve'
  },
  {
    id: 'ofuscado',
    name: 'Ofuscado',
    category: 'sentidos',
    shortDesc: '-2 em testes de ataque e de Percepção.',
    fullDesc: 'O personagem tem a visão ofuscada por luz intensa ou reflexos. Sofre -2 em ataques e Percepção.',
    severity: 'leve'
  },
  {
    id: 'paralisado',
    name: 'Paralisado',
    category: 'física',
    shortDesc: 'Imóvel e indefeso; não pode fazer ações físicas.',
    fullDesc: 'O personagem fica totalmente imóvel e indefeso. Só pode realizar ações puramente mentais.',
    severity: 'grave'
  },
  {
    id: 'sangrando',
    name: 'Sangrando',
    category: 'física',
    shortDesc: 'Sofre 1d6 de dano no início de cada turno.',
    fullDesc: 'O personagem perde 1d6 PV no início de seu turno até passar em teste de Constituição (CD 15) ou receber primeiros socorros (Cura CD 15).',
    severity: 'grave'
  },
  {
    id: 'silenciado',
    name: 'Silenciado',
    category: 'sentidos',
    shortDesc: 'Incapaz de emitir som ou lançar magias verbais.',
    fullDesc: 'O personagem não consegue falar nem emitir sons. Não pode conjurar magias com componente verbal.',
    severity: 'moderada'
  },
  {
    id: 'surdo',
    name: 'Surdo',
    category: 'sentidos',
    shortDesc: '-5 em Iniciativa e falha automática em audição.',
    fullDesc: 'O personagem não ouve nada. Sofre -5 em testes de Iniciativa e falha em testes de Percepção baseados em som.',
    severity: 'moderada'
  },
  {
    id: 'vulneravel',
    name: 'Vulnerável',
    category: 'física',
    shortDesc: '-2 na Defesa e em testes de resistência.',
    fullDesc: 'O personagem sofre -2 na Defesa e em todos os testes de resistência (Fortitude, Reflexos, Vontade).',
    severity: 'leve'
  }
];
