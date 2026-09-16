import { T20RaceDetail } from '../types/races';

export const T20_RACES: T20RaceDetail[] = [
  {
    id: 'humano',
    slug: 'humano',
    name: 'Humano',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Versáteis e ambiciosos, os humanos são a raça mais comum em Arton.',
    iconName: 'Users',
    attributeModifiers: [
      { attribute: 'Três atributos à sua escolha', value: 1 }
    ],
    racialAbilities: [
      {
        name: 'Versátil',
        description: 'Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha.'
      }
    ],
    playstyle: [
      'Qualquer papel no grupo devido à sua versatilidade extrema.',
      'Excelente para builds que precisam de muitos poderes gerais cedo.'
    ],
    synergies: {
      classes: ['Todas', 'Guerreiro', 'Arcanista', 'Paladino'],
      builds: ['Qualquer build que dependa de múltiplos talentos/poderes.']
    },
    description: 'Humanos são a raça mais numerosa e diversificada de Arton. Sua ambição e capacidade de adaptação os levam a todos os cantos do mundo.'
  },
  {
    id: 'anao',
    slug: 'anao',
    name: 'Anão',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Resistentes e tradicionais, mestres da forja e do combate subterrâneo.',
    iconName: 'Mountain',
    attributeModifiers: [
      { attribute: 'Constituição', value: 2 },
      { attribute: 'Sabedoria', value: 1 },
      { attribute: 'Destreza', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Conhecimento de Rochas',
        description: '+2 em testes de Percepção para notar armadilhas e passagens secretas em terrenos de pedra ou subterrâneos.'
      },
      {
        name: 'Devagar e Sempre',
        description: 'Seu deslocamento é 6m (em vez de 9m), mas não é reduzido por uso de armadura pesada ou excesso de carga.'
      },
      {
        name: 'Duro como Pedra',
        description: 'Você recebe +3 pontos de vida no 1º nível e +1 PV por nível seguinte.'
      },
      {
        name: 'Tradição de Heredrim',
        description: 'Você é treinado em uma perícia de ofício a sua escolha. Além disso, para você, todos os machados e martelos são armas simples.'
      }
    ],
    playstyle: [
      'Tanques extremamente resistentes.',
      'Combatentes de linha de frente que ignoram penalidades de armadura.'
    ],
    synergies: {
      classes: ['Guerreiro', 'Clérigo', 'Bárbaro', 'Cavaleiro'],
      builds: ['Builds de alta defesa (CA) e muitos Pontos de Vida.']
    },
    description: 'Anões são conhecidos por sua coragem, teimosia e ligação profunda com as montanhas e a forja.'
  },
  {
    id: 'elfo',
    slug: 'elfo',
    name: 'Elfo',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Graciosos e longevos, mestres da magia e do arco.',
    iconName: 'Trees',
    attributeModifiers: [
      { attribute: 'Inteligência', value: 2 },
      { attribute: 'Destreza', value: 1 },
      { attribute: 'Constituição', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Herança Arfana',
        description: 'Você recebe +1 ponto de mana por nível.'
      },
      {
        name: 'Sentidos Élficos',
        description: 'Você recebe +2 em testes de Percepção e Visão na Penumbra.'
      },
      {
        name: 'Graça Élfica',
        description: 'Seu deslocamento é 12m (em vez de 9m).'
      },
      {
        name: 'Sangue Mágico',
        description: 'A CD para resistir às suas magias aumenta em +1.'
      }
    ],
    playstyle: [
      'Magos e feiticeiros poderosos com alta reserva de mana.',
      'Arqueiros ágeis que aproveitam o deslocamento superior.'
    ],
    synergies: {
      classes: ['Arcanista', 'Caçador', 'Bardo'],
      builds: ['Builds focadas em controle de grupo através de magias com CD alta.']
    },
    description: 'Os elfos são um povo antigo e melancólico, outrora governantes de um grande império, agora espalhados pelo mundo.'
  },
  {
    id: 'goblin',
    slug: 'goblin',
    name: 'Goblin',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Pequenos, ágeis e engenhosos, sobreviventes natos.',
    iconName: 'Ghost',
    attributeModifiers: [
      { attribute: 'Destreza', value: 2 },
      { attribute: 'Inteligência', value: 1 },
      { attribute: 'Carisma', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Engenhoso',
        description: 'Você não sofre penalidade em testes de perícia por não possuir um kit de ferramentas.'
      },
      {
        name: 'Espalhafatoso',
        description: 'Você recebe +2 em testes de Ladinagem e Furtividade. Além disso, pode usar Destreza em vez de Força para testes de Atletismo.'
      },
      {
        name: 'Rato de Esgoto',
        description: 'Você recebe +2 em testes de Fortitude e é imune a doenças.'
      },
      {
        name: 'Visão no Escuro',
        description: 'Você enxerga no escuro total a até 18m.'
      }
    ],
    playstyle: [
      'Especialistas em perícias e infiltração.',
      'Inventores e alquimistas geniais.'
    ],
    synergies: {
      classes: ['Ladino', 'Inventor', 'Caçador'],
      builds: ['Builds de venenos, bombas e ataques furtivos.']
    },
    description: 'Goblins são frequentemente subestimados, mas sua inteligência prática e agilidade os tornam aventureiros excepcionais.'
  },
  {
    id: 'lefou',
    slug: 'lefou',
    name: 'Lefou',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Tocados pela Tormenta, carregam deformidades e poderes aberrantes.',
    iconName: 'Skull',
    attributeModifiers: [
      { attribute: 'Três atributos (exceto Carisma)', value: 1 },
      { attribute: 'Carisma', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Deformidade',
        description: 'Você recebe um poder da Tormenta a sua escolha. Você não perde Carisma por este poder, mas ainda sofre a penalidade em perícias de interação.'
      },
      {
        name: 'Filho da Tormenta',
        description: 'Você é considerado um monstro. Recebe +2 em testes de Fortitude contra efeitos da Tormenta e não sofre dano por sua atmosfera ácida.'
      }
    ],
    playstyle: [
      'Combatentes focados em poderes da Tormenta.',
      'Personagens de alta customização inicial.'
    ],
    synergies: {
      classes: ['Lutador', 'Bárbaro', 'Guerreiro'],
      builds: ['Builds de "Combo de Tormenta" para maximizar bônus de múltiplos poderes aberrantes.']
    },
    description: 'Lefou são seres nascidos em áreas de Tormenta ou de pais corrompidos, carregando a marca da anti-criação em seus corpos.'
  },
  {
    id: 'dahllan',
    slug: 'dahllan',
    name: 'Dahllan',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Meio-dríades com uma ligação profunda com a natureza e as plantas.',
    iconName: 'Trees',
    attributeModifiers: [
      { attribute: 'Sabedoria', value: 2 },
      { attribute: 'Constituição', value: 1 },
      { attribute: 'Inteligência', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Amiga das Plantas',
        description: 'Você pode lançar a magia Controlar Plantas (custo –1 PM). Caso aprenda esta magia novamente, seu custo diminui em –1 PM adicional.'
      },
      {
        name: 'Armadura de Carvalho',
        description: 'Você pode gastar 1 PM para receber +2 na Defesa até o fim da cena.'
      },
      {
        name: 'Empatia Selvagem',
        description: 'Você pode usar Adestramento para diplomacia com animais. Além disso, você pode falar com animais (como se estivesse sob efeito da magia Falar com Animais).'
      }
    ],
    playstyle: [
      'Conjuradores divinos focados em suporte e controle.',
      'Personagens com alta sobrevivência na natureza.'
    ],
    synergies: {
      classes: ['Druida', 'Clérigo', 'Caçador'],
      builds: ['Builds de controle de terreno e suporte defensivo.']
    },
    description: 'As dahllan são descendentes de dríades com humanos, possuindo uma conexão mística com o mundo vegetal.'
  },
  {
    id: 'kallyanach',
    slug: 'kallyanach',
    name: 'Kallyanach',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Crias de Kallyadranoch, os kallyanach possuem o sangue e o sopro dos dragões.',
    iconName: 'Flame',
    attributeModifiers: [
      { attribute: 'Três atributos à sua escolha', value: 1 }
    ],
    racialAbilities: [
      {
        name: 'Caminho do Dragão',
        description: 'Escolha um tipo de dano: ácido, eletricidade, fogo, frio ou veneno. Você recebe resistência 5 a esse tipo de dano.'
      },
      {
        name: 'Herança Dracônica',
        description: 'Você recebe +1 PM por nível.'
      },
      {
        name: 'Sopro de Dragão',
        description: 'Você pode gastar 1 PM para soprar uma área de cone de 6m que causa 2d6 pontos de dano do tipo escolhido em Caminho do Dragão (Reflexos reduz à metade). O dano aumenta em +1d6 para cada 2 níveis.'
      }
    ],
    playstyle: [
      'Conjuradores que precisam de muita mana.',
      'Combatentes com dano em área elemental.'
    ],
    synergies: {
      classes: ['Arcanista', 'Feiticeiro', 'Paladino'],
      builds: ['Builds de "Gish" (combate e magia) que aproveitam a mana extra.']
    },
    description: 'Os kallyanach são humanos cujas linhagens foram tocadas pelo Deus dos Dragões, manifestando escamas e poderes elementais.'
  },
  {
    id: 'qareen',
    slug: 'qareen',
    name: 'Qareen',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Descendentes de gênios, os qareen são naturalmente mágicos e generosos.',
    iconName: 'Zap',
    attributeModifiers: [
      { attribute: 'Carisma', value: 2 },
      { attribute: 'Inteligência', value: 1 },
      { attribute: 'Sabedoria', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Desejos',
        description: 'Se você lançar uma magia que alguém pediu, o custo da magia diminui em –1 PM (mínimo 1 PM). Você não pode pedir desejos para si mesmo.'
      },
      {
        name: 'Pequenos Desejos',
        description: 'Você pode lançar a magia Prestidigitação. Caso aprenda esta magia novamente, seu custo diminui em –1 PM.'
      },
      {
        name: 'Resistência Elemental',
        description: 'Conforme sua ascendência (escolha uma), você recebe resistência 10 a um tipo de dano: frio (água), eletricidade (ar), fogo (fogo) ou ácido (terra).'
      }
    ],
    playstyle: [
      'Melhores conjuradores baseados em Carisma.',
      'Suportes mágicos que economizam mana através de pedidos do grupo.'
    ],
    synergies: {
      classes: ['Bardo', 'Feiticeiro', 'Nobre'],
      builds: ['Builds de suporte total ou controle social.']
    },
    description: 'Os qareen são meio-gênios conhecidos por sua pele sedosa e disposição para ajudar, canalizando a magia de seus ancestrais planares.'
  },
  {
    id: 'trog',
    slug: 'trog',
    name: 'Trog',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Homens-lagarto brutais, resistentes e temidos por seu mau cheiro.',
    iconName: 'Shield',
    attributeModifiers: [
      { attribute: 'Constituição', value: 2 },
      { attribute: 'Força', value: 1 },
      { attribute: 'Inteligência', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Mau Cheiro',
        description: 'Você pode gastar 2 PM para emitir um odor terrível. Todos os inimigos em alcance curto devem fazer um teste de Fortitude (CD Con) ou ficarão enjoados por 1d6 rodadas.'
      },
      {
        name: 'Mordida',
        description: 'Você possui uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Você pode atacar com a mordida como uma ação extra se usar a ação agredir.'
      },
      {
        name: 'Pele Dura',
        description: 'Você recebe +2 na Defesa.'
      },
      {
        name: 'Sangue Frio',
        description: 'Você sofre vulnerabilidade a frio. Além disso, pode prender a respiração por muito mais tempo.'
      }
    ],
    playstyle: [
      'Tanques de linha de frente com alta defesa natural.',
      'Combatentes corpo a corpo que usam ataques extras.'
    ],
    synergies: {
      classes: ['Bárbaro', 'Lutador', 'Guerreiro'],
      builds: ['Builds de "Grappler" ou tanques de alta Constituição.']
    },
    description: 'Trogs são reptilianos robustos que vivem em sociedades tribais, muitas vezes em conflito com outras raças civilizadas.'
  },
  {
    id: 'minotauro',
    slug: 'minotauro',
    name: 'Minotauro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Poderosos e imponentes, os minotauros valorizam a força e a hierarquia.',
    iconName: 'Shield',
    attributeModifiers: [
      { attribute: 'Força', value: 2 },
      { attribute: 'Constituição', value: 1 },
      { attribute: 'Sabedoria', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Chifres',
        description: 'Você possui uma arma natural de chifres (dano 1d6, crítico x2, perfuração). Quando usa a ação agredir, pode gastar 1 PM para fazer um ataque extra com os chifres.'
      },
      {
        name: 'Couro Rígido',
        description: 'Você recebe +1 na Defesa.'
      },
      {
        name: 'Faro',
        description: 'Você recebe +2 em testes de Percepção para ouvir ou cheirar e ignora camuflagem leve por estes sentidos.'
      },
      {
        name: 'Medo de Altura',
        description: 'Se estiver adjacente a um precipício ou em um lugar alto sem proteção, você fica abalado.'
      }
    ],
    playstyle: [
      'Combatentes brutais de linha de frente.',
      'Personagens focados em Força bruta e intimidação.'
    ],
    synergies: {
      classes: ['Guerreiro', 'Bárbaro', 'Lutador'],
      builds: ['Builds de dano massivo corpo a corpo.']
    },
    description: 'Minotauros são uma raça de humanoides com cabeça de touro, conhecidos por seu Império e sua crença na lei do mais forte.'
  },
  {
    id: 'suraggel',
    slug: 'suraggel',
    name: 'Suraggel',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Descendentes de seres planares, divididos entre Aggelus (celestiais) e Herdeiros (abissais).',
    iconName: 'Sparkles',
    attributeModifiers: [
      { attribute: 'Sabedoria (Aggelus) ou Destreza (Herdeiro)', value: 2 },
      { attribute: 'Carisma', value: 1 }
    ],
    racialAbilities: [
      {
        name: 'Herança Planar',
        description: 'Você é considerado um espírito. Escolha entre Aggelus (Sabedoria +4) ou Herdeiro (Destreza +4).'
      },
      {
        name: 'Luz ou Trevas',
        description: 'Aggelus podem lançar Luz (ou outra magia de 1º círculo se já a conhecerem). Herdeiros podem lançar Escuridão (ou outra magia de 1º círculo).'
      },
      {
        name: 'Resistência Planar',
        description: 'Você recebe resistência 5 a ácido, eletricidade e frio.'
      },
      {
        name: 'Visão no Escuro',
        description: 'Você enxerga no escuro total a até 18m.'
      }
    ],
    playstyle: [
      'Aggelus são excelentes clérigos e druidas.',
      'Herdeiros são ótimos ladinos e caçadores.'
    ],
    synergies: {
      classes: ['Clérigo', 'Ladino', 'Paladino', 'Bardo'],
      builds: ['Builds que aproveitam bônus altos em Sabedoria ou Destreza.']
    },
    description: 'Suraggel carregam o sangue de anjos ou demônios, manifestando características físicas e poderes de seus ancestrais extraplanares.'
  },
  {
    id: 'silfide',
    slug: 'silfide',
    name: 'Sílfide',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Pequenas fadas aladas, curiosas e repletas de magia natural.',
    iconName: 'Sparkles',
    attributeModifiers: [
      { attribute: 'Carisma', value: 2 },
      { attribute: 'Destreza', value: 1 },
      { attribute: 'Força', value: -2 }
    ],
    racialAbilities: [
      {
        name: 'Asas de Borboleta',
        description: 'Você possui deslocamento de voo 12m.'
      },
      {
        name: 'Espírito da Natureza',
        description: 'Você é considerado um espírito e recebe +2 em testes de Misticismo e Adestramento.'
      },
      {
        name: 'Magia das Fadas',
        description: 'Você pode lançar duas magias de 1º círculo de ilusão ou encantamento a sua escolha.'
      },
      {
        name: 'Tamanho Minúsculo',
        description: 'Você recebe +5 em Furtividade, mas seu alcance natural é 0m.'
      }
    ],
    playstyle: [
      'Conjuradores furtivos e intocáveis.',
      'Especialistas em controle e ilusão.'
    ],
    synergies: {
      classes: ['Bardo', 'Feiticeiro', 'Ladino'],
      builds: ['Builds de conjuração aérea e debuff.']
    },
    description: 'Sílfides são fadas minúsculas que vivem em comunidades escondidas na natureza ou viajam por curiosidade pura.'
  },
  {
    id: 'sereia-tritao',
    slug: 'sereia-tritao',
    name: 'Sereia/Tritão',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Povo das águas, capazes de assumir forma humana em terra firme.',
    iconName: 'Waves',
    attributeModifiers: [
      { attribute: 'Três atributos à sua escolha', value: 1 }
    ],
    racialAbilities: [
      {
        name: 'Canção das Sereias',
        description: 'Você recebe +2 em Atuação e pode lançar a magia Enfeitiçar (custo –1 PM).'
      },
      {
        name: 'Mestre das Ondas',
        description: 'Você possui deslocamento de natação 12m e pode respirar embaixo d\'água.'
      },
      {
        name: 'Transformação Anfíbia',
        description: 'Você pode gastar uma ação completa para alternar entre forma com cauda (água) e forma com pernas (terra).'
      },
      {
        name: 'Visão na Penumbra',
        description: 'Você enxerga duas vezes mais longe que um humano na penumbra.'
      }
    ],
    playstyle: [
      'Personagens versáteis em campanhas marítimas.',
      'Bardos e Nobres com alta capacidade de persuasão.'
    ],
    synergies: {
      classes: ['Bardo', 'Nobre', 'Clérigo'],
      builds: ['Builds de diplomacia e controle mental.']
    },
    description: 'O povo do mar é misterioso e belo, vivendo em cidades submersas mas mantendo contato constante com a superfície.'
  },
  {
    id: 'osteon',
    slug: 'osteon',
    name: 'Osteon',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Mortos-vivos que mantiveram sua consciência e buscam um novo propósito.',
    iconName: 'Skull',
    attributeModifiers: [
      { attribute: 'Três atributos (exceto Constituição)', value: 1 }
    ],
    racialAbilities: [
      {
        name: 'Armadura Óssea',
        description: 'Você recebe resistência 5 a corte, perfuração e frio.'
      },
      {
        name: 'Memória Póstuma',
        description: 'Você recebe uma habilidade racial de outra raça (exceto habilidades que dependam de fisiologia viva).'
      },
      {
        name: 'Natureza Esquelética',
        description: 'Você é um morto-vivo. Não possui valor de Constituição e é imune a efeitos que pedem testes de Fortitude (exceto objetos).'
      },
      {
        name: 'Preço da Não Vida',
        description: 'Você não recupera PV por descanso e magias de cura causam dano em você. Deve ser curado por magias de trevas ou reparos.'
      }
    ],
    playstyle: [
      'Personagens extremamente resilientes a dano físico.',
      'Ideal para quem busca imunidades de morto-vivo.'
    ],
    synergies: {
      classes: ['Guerreiro', 'Arcanista (Necromante)', 'Cavaleiro'],
      builds: ['Builds de tanque que aproveitam as imunidades de morto-vivo.']
    },
    description: 'Osteon são esqueletos reanimados que, por algum motivo, não se tornaram servos irracionais de necromantes.'
  },
  {
    id: 'medusa',
    slug: 'medusa',
    name: 'Medusa',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Seres com serpentes no lugar de cabelos, capazes de paralisar com o olhar.',
    iconName: 'Zap',
    attributeModifiers: [
      { attribute: 'Destreza', value: 2 },
      { attribute: 'Carisma', value: 1 }
    ],
    racialAbilities: [
      {
        name: 'Natureza Venenosa',
        description: 'Você recebe resistência 10 a veneno e +2 em testes de Fortitude contra venenos.'
      },
      {
        name: 'Olhar Atordoante',
        description: 'Você pode gastar 1 PM para forçar um alvo em alcance curto a fazer um teste de Fortitude (CD Car) ou ficar atordoado por 1 rodada.'
      },
      {
        name: 'Serpentes',
        description: 'Suas serpentes podem atacar como uma arma natural (dano 1d4, crítico x2, veneno). O veneno causa 1d6 de dano de veneno por 3 rodadas.'
      },
      {
        name: 'Visão na Penumbra',
        description: 'Você enxerga duas vezes mais longe que um humano na penumbra.'
      }
    ],
    playstyle: [
      'Personagens focados em controle de alvo único.',
      'Ladinos e combatentes ágeis.'
    ],
    synergies: {
      classes: ['Ladino', 'Bardo', 'Caçador'],
      builds: ['Builds de "Lockdown" (paralisar inimigos).']
    },
    description: 'Medusas são temidas por sua aparência e poderes, mas muitas buscam integrar-se à sociedade como artistas ou espiãs.'
  },
  {
    id: 'kliren',
    slug: 'kliren',
    name: 'Kliren',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Híbridos de humanos e gnomos, obcecados por tecnologia e lógica.',
    iconName: 'Zap',
    attributeModifiers: [
      { attribute: 'Inteligência', value: 2 },
      { attribute: 'Destreza', value: 1 },
      { attribute: 'Força', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Engenhosidade',
        description: 'Você recebe +2 em testes de Ofício e pode usar Inteligência em vez de Carisma para testes de Diplomacia.'
      },
      {
        name: 'Mente Lógica',
        description: 'Você recebe +2 em testes de Vontade contra ilusões e encantamentos.'
      },
      {
        name: 'Ossos Frágeis',
        description: 'Você sofre –2 em testes de Fortitude e Atletismo.'
      },
      {
        name: 'Vanguardista',
        description: 'Você recebe um poder de Inventor ou uma perícia de Ofício adicional.'
      }
    ],
    playstyle: [
      'Os melhores Inventores do sistema.',
      'Personagens focados em perícias técnicas e intelecto.'
    ],
    synergies: {
      classes: ['Inventor', 'Arcanista'],
      builds: ['Builds de criação de itens e suporte tecnológico.']
    },
    description: 'Kliren são nativos de ordens tecnológicas ou cidades avançadas, sempre buscando a próxima grande descoberta.'
  },
  {
    id: 'hynne',
    slug: 'hynne',
    name: 'Hynne',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Pequenos, ágeis e amantes da boa vida, famosos por sua pontaria.',
    iconName: 'Zap',
    attributeModifiers: [
      { attribute: 'Destreza', value: 2 },
      { attribute: 'Carisma', value: 1 },
      { attribute: 'Força', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Arremessador',
        description: 'Você recebe +2 em testes de ataque com armas de arremesso e fundas. O dano dessas armas aumenta em um passo.'
      },
      {
        name: 'Pequeno e Ágil',
        description: 'Você recebe +2 em Defesa e +5 em Furtividade.'
      },
      {
        name: 'Sorte de Hynne',
        description: 'Você pode gastar 1 PM para rolar novamente um teste de perícia recém-feito.'
      },
      {
        name: 'Tamanho Pequeno',
        description: 'Você recebe +2 em Furtividade e –2 em testes de manobra.'
      }
    ],
    playstyle: [
      'Especialistas em armas de arremesso.',
      'Ladinos extremamente difíceis de detectar.'
    ],
    synergies: {
      classes: ['Ladino', 'Caçador', 'Bardo'],
      builds: ['Builds de arremesso de facas ou fundas.']
    },
    description: 'Hynne são conhecidos por sua hospitalidade, pés peludos e uma sorte sobrenatural que os tira de enrascadas.'
  },
  {
    id: 'golem',
    slug: 'golem',
    name: 'Golem',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Constructos animados por magia, resistentes e incansáveis.',
    iconName: 'Shield',
    attributeModifiers: [
      { attribute: 'Força', value: 2 },
      { attribute: 'Constituição', value: 1 },
      { attribute: 'Carisma', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Canalizar Energia',
        description: 'Você possui um núcleo elemental (escolha um tipo de dano). Você recebe resistência 10 a esse tipo e recupera PV se for atingido por ele.'
      },
      {
        name: 'Chassi',
        description: 'Você recebe +2 na Defesa, mas não pode usar armaduras.'
      },
      {
        name: 'Natureza Artificial',
        description: 'Você é um constructo. Não precisa comer, dormir ou respirar. É imune a efeitos de cansaço, venenos e doenças.'
      },
      {
        name: 'Sem Cura Natural',
        description: 'Você não recupera PV por descanso e magias de cura não funcionam. Deve ser reparado com Ofício (artesão) ou magias de conserto.'
      }
    ],
    playstyle: [
      'Tanques puros com imunidades críticas.',
      'Combatentes que ignoram necessidades biológicas.'
    ],
    synergies: {
      classes: ['Guerreiro', 'Cavaleiro', 'Lutador'],
      builds: ['Builds de alta resistência elemental e física.']
    },
    description: 'Golems são estátuas ou armaduras animadas por núcleos mágicos, servindo como guardiões ou buscando sua própria identidade.'
  }
];
