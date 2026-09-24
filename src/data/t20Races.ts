import { T20RaceDetail } from '../types/races';

export const T20_RACES: T20RaceDetail[] = [
  {
    id: 'humano',
    slug: 'humano',
    name: 'Humano',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'O povo mais numeroso em Arton, humanos são considerados os escolhidos dos deuses, exploradores ambiciosos em sua variedade e adaptabilidade.',
    iconName: 'Users',
    attributeModifiers: [
      { attribute: 'Três atributos diferentes à sua escolha', value: 1 }
    ],
    racialAbilities: [
      {
        name: '+1 em Três Atributos Diferentes',
        description: 'Filhos de Valkaria, Deusa da Ambição, humanos podem se destacar em qualquer caminho que escolherem.'
      },
      {
        name: 'Versátil',
        description: 'Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha.'
      }
    ],
    playstyle: [
      'Versatilidade total para qualquer classe ou conceito.',
      'Excelente para atingir pré-requisitos de poderes e perícias mais cedo.'
    ],
    synergies: {
      classes: ['Todas as classes', 'Guerreiro', 'Arcanista', 'Paladino', 'Ladino'],
      builds: ['Qualquer build que se beneficie de um poder geral ou perícias extras no 1º nível.']
    },
    description: 'Humanos são como uma praga: espalham-se por todo o mundo de Arton. São tão variados quanto suas ambições, tão diversos quanto as ideias que têm a cada instante.'
  },
  {
    id: 'anao',
    slug: 'anao',
    name: 'Anão',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'O mais resiliente dos povos. Em suas cidadelas subterrâneas, trabalham duro escavando minas e forjando metal em belas armas, armaduras e joias.',
    iconName: 'Mountain',
    attributeModifiers: [
      { attribute: 'Constituição', value: 2 },
      { attribute: 'Sabedoria', value: 1 },
      { attribute: 'Destreza', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Conhecimento das Rochas',
        description: 'Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo.'
      },
      {
        name: 'Devagar e Sempre',
        description: 'Seu deslocamento é 6m (em vez de 9m). Porém, seu deslocamento não é reduzido por uso de armadura ou excesso de carga.'
      },
      {
        name: 'Duro como Pedra',
        description: 'Você recebe +3 pontos de vida no 1º nível e +1 por nível seguinte.'
      },
      {
        name: 'Tradição de Heredrimm',
        description: 'Você é perito nas armas tradicionais anãs, seja por ter treinado com elas, seja por usá-las como ferramentas de ofício. Para você, todos os machados, martelos, marretas e picaretas são armas simples. Você recebe +2 em ataques com essas armas.'
      }
    ],
    playstyle: [
      'Excelente tanque e combatente de linha de frente devido à alta vida e imunidade a reduções de movimento por armadura.',
      'Ótima sinergia com classes divinas como Clérigo.'
    ],
    synergies: {
      classes: ['Guerreiro', 'Clérigo', 'Cavaleiro', 'Lutador', 'Bárbaro'],
      builds: ['Tanque Pesado', 'Clérigo de Khalmyr', 'Guerreiro de Machado/Martelo']
    },
    description: 'Anões são troncudos, maciços, resistentes como os pedaços de minério pelos quais são apaixonados. A justiça e a tradição são fundamentais para sua honra.'
  },
  {
    id: 'dahllan',
    slug: 'dahllan',
    name: 'Dahllan',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Parte humanas, parte fadas, as dahllan são uma raça de mulheres com a seiva de árvores correndo nas veias, capazes de controlar plantas e falar com animais.',
    iconName: 'Leaf',
    attributeModifiers: [
      { attribute: 'Sabedoria', value: 2 },
      { attribute: 'Destreza', value: 1 },
      { attribute: 'Inteligência', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Amiga das Plantas',
        description: 'Você pode lançar a magia Controlar Plantas (atributo-chave Sabedoria). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.'
      },
      {
        name: 'Armadura de Allihanna',
        description: 'Você pode gastar uma ação de movimento e 1 PM para transformar sua pele em casca de árvore, recebendo +2 na Defesa até o fim da cena.'
      },
      {
        name: 'Empatia Selvagem',
        description: 'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento para mudar atitude e persuasão com animais (veja Diplomacia, na página 118). Caso receba esta habilidade novamente, recebe +2 em Adestramento.'
      }
    ],
    playstyle: [
      'Foco em Sabedoria para conjuração divina e controle de campo com magias vegetais.',
      'Defesa adicional flexível com casca de árvore.'
    ],
    synergies: {
      classes: ['Druida', 'Clérigo', 'Caçador', 'Bárbaro'],
      builds: ['Druida da Primavera/Selvagem', 'Clériga de Allihanna', 'Caçadora Mateira']
    },
    description: 'Dahllan são ágeis e sábias, com a seiva de árvores correndo nas veias. Flores e filamentos feéricos brotam em seus cabelos, mantendo forte vínculo com a Deusa da Natureza.'
  },
  {
    id: 'elfo',
    slug: 'elfo',
    name: 'Elfo',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Seres feitos para a beleza e para a guerra, tão habilidosos com magia quanto com espadas e arcos, com sentidos aguçados e deslocamento superior.',
    iconName: 'Sparkles',
    attributeModifiers: [
      { attribute: 'Inteligência', value: 2 },
      { attribute: 'Destreza', value: 1 },
      { attribute: 'Constituição', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Graça de Glórienn',
        description: 'Seu deslocamento é 12m (em vez de 9m).'
      },
      {
        name: 'Sangue Mágico',
        description: 'Você recebe +1 ponto de mana por nível.'
      },
      {
        name: 'Sentidos Élficos',
        description: 'Você recebe visão na penumbra e +2 em Misticismo e Percepção.'
      }
    ],
    playstyle: [
      'Conjuradores excepcionais de alta reserva de Mana.',
      'Combatentes rápidos à distância com bônus de deslocamento e Destreza.'
    ],
    synergies: {
      classes: ['Arcanista', 'Bardo', 'Caçador', 'Ladino', 'Inventor'],
      builds: ['Mago Arcano', 'Arqueiro Caçador', 'Bardo Ilusionista']
    },
    description: 'Elfos são belos, esguios e longevos. Após a queda de Lenórienn e de sua deusa, tornaram-se um povo livre em busca de reconstruir seu destino em Arton.'
  },
  {
    id: 'goblin',
    slug: 'goblin',
    name: 'Goblin',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Pequenos, engenhosos e perseverantes, especialistas em improvisação, escalada e sobrevivência urbana.',
    iconName: 'Zap',
    attributeModifiers: [
      { attribute: 'Destreza', value: 2 },
      { attribute: 'Inteligência', value: 1 },
      { attribute: 'Carisma', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Engenhoso',
        description: 'Você não sofre penalidades em testes de perícia por não usar ferramentas. Se usar a ferramenta necessária, recebe +2 no teste de perícia.'
      },
      {
        name: 'Espelunqueiro',
        description: 'Você recebe visão no escuro e deslocamento de escalada igual ao seu deslocamento terrestre.'
      },
      {
        name: 'Peste Esguia',
        description: 'Seu tamanho é Pequeno (veja a página 106), mas seu deslocamento se mantém 9m. Apesar de pequenos, goblins são rápidos.'
      },
      {
        name: 'Rato das Ruas',
        description: 'Você recebe +2 em Fortitude e sua recuperação de PV e PM nunca é inferior ao seu nível.'
      }
    ],
    playstyle: [
      'Mestres em testes de perícias e inventos.',
      'Excelente mobilidade vertical e resistência de recuperação.'
    ],
    synergies: {
      classes: ['Inventor', 'Ladino', 'Bucaneiro', 'Arcanista'],
      builds: ['Engenhoqueiro Goblin', 'Ladino Especialista', 'Baloeiro']
    },
    description: 'Goblins vivem nas frestas do mundo civilizado e sobrevivem graças à sua incomparável capacidade de inventar soluções inesperadas a partir de sucatas.'
  },
  {
    id: 'golem',
    slug: 'golem',
    name: 'Golem',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Construtos sem vida forjados por mortais e movidos por espíritos elementais selados em corpos de pedra e metal.',
    iconName: 'Cpu',
    attributeModifiers: [
      { attribute: 'Força', value: 2 },
      { attribute: 'Constituição', value: 1 },
      { attribute: 'Carisma', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Chassi',
        description: 'Seu corpo artificial é resistente, mas rígido. Seu deslocamento é 6m, mas não é reduzido por uso de armadura ou excesso de carga. Você recebe +2 na Defesa, mas possui penalidade de armadura –2. Você leva um dia para vestir ou remover uma armadura (pois precisa acoplar as peças dela a seu chassi). Por ser acoplada, sua armadura não conta no limite de itens que você pode usar (mas você continua só podendo usar uma armadura).'
      },
      {
        name: 'Criatura Artificial',
        description: 'Você é uma criatura do tipo construto. Recebe visão no escuro e imunidade a efeitos de cansaço, metabólicos e de veneno. Além disso, não precisa respirar, alimentar-se ou dormir, mas não se beneficia de cura mundana e de itens da categoria alimentação. Você precisa ficar inerte por oito horas por dia para recarregar sua fonte de energia. Se fizer isso, recupera PV e PM por descanso em condições normais (golens não são afetados por condições boas ou ruins de descanso). Por fim, a perícia Cura não funciona em você, mas Ofício (artesão) pode ser usada no lugar dela.'
      },
      {
        name: 'Fonte Elemental',
        description: 'Você possui um espírito elemental preso em seu corpo. Escolha entre água (frio), ar (eletricidade), fogo (fogo) e terra (ácido). Você é imune a dano desse tipo. Se fosse sofrer dano mágico desse tipo, em vez disso cura PV em quantidade igual à metade do dano.'
      },
      {
        name: 'Propósito de Criação',
        description: 'Você foi construído “pronto” para um propósito específico e não teve uma infância. Você não tem direito a escolher uma origem, mas recebe um poder geral a sua escolha.'
      }
    ],
    playstyle: [
      'Tanques inabaláveis imunes a venenos, fadiga e metabólicos.',
      'Cura reativa mediante absorção de dano mágico elemental.'
    ],
    synergies: {
      classes: ['Cavaleiro', 'Guerreiro', 'Lutador', 'Paladino', 'Arcanista'],
      builds: ['Tanque Elemental', 'Guardião de Ferro', 'Guerreiro Chassi Pesado']
    },
    description: 'Movidos por forças vivas e espíritos elementais engaiolados em armaduras de metal e rocha, buscam seu propósito e identidade em Arton.'
  },
  {
    id: 'hynne',
    slug: 'hynne',
    name: 'Hynne',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Apreciadores de boa comida e aconchego, pequenos, simpáticos, ágeis e abençoados com extraordinária sorte.',
    iconName: 'Smile',
    attributeModifiers: [
      { attribute: 'Destreza', value: 2 },
      { attribute: 'Carisma', value: 1 },
      { attribute: 'Força', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Arremessador',
        description: 'Quando faz um ataque à distância com uma funda ou uma arma de arremesso, seu dano aumenta em um passo.'
      },
      {
        name: 'Pequeno e Rechonchudo',
        description: 'Seu tamanho é Pequeno (veja a página 106) e seu deslocamento é 6m. Você recebe +2 em Enganação e pode usar Destreza como atributo-chave de Atletismo (em vez de Força).'
      },
      {
        name: 'Sorte Salvadora',
        description: 'Quando faz um teste de resistência, você pode gastar 1 PM para rolar este teste novamente.'
      }
    ],
    playstyle: [
      'Especialistas em ataques de funda e arremesso.',
      'Alta evasão e segurança em testes de resistência com rerolagem.'
    ],
    synergies: {
      classes: ['Ladino', 'Bardo', 'Bucaneiro', 'Nobre'],
      builds: ['Atirador de Funda', 'Ladino Trapaceiro', 'Bardo Negociante']
    },
    description: 'Halflings artonianos que combinam gentileza e culinária refinada com agilidade surpreendente e instinto de sobrevivência apurado.'
  },
  {
    id: 'kliren',
    slug: 'kliren',
    name: 'Kliren',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Visitantes de outro mundo combinando a curiosidade humana com o intelecto gnômico e talento natural para mecânica e armas de fogo.',
    iconName: 'Wrench',
    attributeModifiers: [
      { attribute: 'Inteligência', value: 2 },
      { attribute: 'Carisma', value: 1 },
      { attribute: 'Força', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Engenhosidade',
        description: 'Quando faz um teste de perícia, você pode gastar 2 PM para somar sua Inteligência no teste. Você não pode usar esta habilidade em testes de ataque. Caso receba esta habilidade novamente, seu custo é reduzido em –1 PM.'
      },
      {
        name: 'Híbrido',
        description: 'Sua natureza multifacetada fez com que você aprendesse conhecimentos variados. Você se torna treinado em uma perícia a sua escolha (não precisa ser da sua classe).'
      },
      {
        name: 'Ossos Frágeis',
        description: 'Você sofre 1 ponto de dano adicional por dado de dano de impacto. Por exemplo, se for atingido por uma clava (dano 1d6), sofre 1d6+1 pontos de dano. Se cair de 3m de altura (dano 2d6), sofre 2d6+2 pontos de dano.'
      },
      {
        name: 'Vanguardista',
        description: 'Você recebe proficiência em armas de fogo e +2 em Ofício (um qualquer, a sua escolha).'
      }
    ],
    playstyle: [
      'Potencial absoluto para inventores e conjuradores baseados em Inteligência.',
      'Uso eficiente de armas de fogo e versatilidade em testes de perícia.'
    ],
    synergies: {
      classes: ['Inventor', 'Arcanista (Mago)', 'Bardo', 'Ladino'],
      builds: ['Inventor Balístico', 'Mago Vanguardista', 'Pistoleiro de Engenhosidade']
    },
    description: 'Frutos da união entre humanos e a extinta essência gnômica, são inventores brilhantes, impulsivos e apaixonados pela vanguarda do progresso.'
  },
  {
    id: 'lefou',
    slug: 'lefou',
    name: 'Lefou',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Tocados pela Tormenta, estes meio-demônios carregam deformidades aberrantes que concedem poderes singulares.',
    iconName: 'Flame',
    attributeModifiers: [
      { attribute: 'Três atributos diferentes à sua escolha (exceto Carisma)', value: 1 },
      { attribute: 'Carisma', value: -1 }
    ],
    racialAbilities: [
      {
        name: '+1 em Três Atributos Diferentes (exceto Carisma)',
        description: 'Lefou podem desenvolver seu vigor e capacidades físicas e mentais, com exceção de sua presença social pura.'
      },
      {
        name: 'Cria da Tormenta',
        description: 'Você é uma criatura do tipo monstro e recebe +5 em testes de resistência contra efeitos causados por lefeu e pela Tormenta.'
      },
      {
        name: 'Deformidade',
        description: 'Todo lefou possui defeitos físicos que, embora desagradáveis, conferem certas vantagens. Você recebe +2 em duas perícias a sua escolha. Cada um desses bônus conta como um poder da Tormenta (exceto para perda de Carisma). Você pode trocar um desses bônus por um poder da Tormenta a sua escolha (ele também não conta para perda de Carisma).'
      }
    ],
    playstyle: [
      'Combatentes letais potencializados por poderes aberrantes sem perda de Carisma inicial.',
      'Monstros resistentes à corrupção da tempestade rubra.'
    ],
    synergies: {
      classes: ['Guerreiro', 'Lutador', 'Bárbaro', 'Caçador', 'Arcanista Rubro'],
      builds: ['Combatente Rubro', 'Lutador Deformado', 'Algoz da Tormenta']
    },
    description: 'Nascidos com a mácula rubra, enfrentam o preconceito da sociedade e usam a familiaridade com o inimigo para expurgá-lo ou dominar suas armas.'
  },
  {
    id: 'medusa',
    slug: 'medusa',
    name: 'Medusa',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Criaturas com serpentes na cabeça, portadoras de veneno letal nas armas e um olhar capaz de atordoar adversários.',
    iconName: 'Eye',
    attributeModifiers: [
      { attribute: 'Destreza', value: 2 },
      { attribute: 'Carisma', value: 1 }
    ],
    racialAbilities: [
      {
        name: 'Cria de Megalokk',
        description: 'Você é uma criatura do tipo monstro e recebe visão no escuro.'
      },
      {
        name: 'Natureza Venenosa',
        description: 'Você recebe resistência a veneno +5 e pode gastar uma ação de movimento e 1 PM para envenenar uma arma que esteja usando. A arma causa perda de 1d12 pontos de vida. O veneno dura até você acertar um ataque ou até o fim da cena (o que acontecer primeiro). Veneno.'
      },
      {
        name: 'Olhar Atordoante',
        description: 'Você pode gastar uma ação de movimento e 1 PM para forçar uma criatura em alcance curto a fazer um teste de Fortitude (CD Car). Se a criatura falhar, fica atordoada por uma rodada (apenas uma vez por cena).'
      }
    ],
    playstyle: [
      'Excelente controle com atordoamento por Carisma e veneno constante.',
      'Altos bônus de agilidade e combate furtivo.'
    ],
    synergies: {
      classes: ['Ladino', 'Bardo', 'Bucaneiro', 'Guerreiro'],
      builds: ['Assassina Venenosa', 'Barda Sedutora', 'Duelista de Megalokk']
    },
    description: 'Reclusas por natureza, jovens medusas por vezes se aventuram no Reinado camuflando seus cabelos ofídicos sob lenços e capuzes.'
  },
  {
    id: 'minotauro',
    slug: 'minotauro',
    name: 'Minotauro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Povo guerreiro, orgulhoso e poderoso, dotado de força bruta, chifres pontiagudos e pele resistente como couro.',
    iconName: 'Shield',
    attributeModifiers: [
      { attribute: 'Força', value: 2 },
      { attribute: 'Constituição', value: 1 },
      { attribute: 'Sabedoria', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Chifres',
        description: 'Você possui uma arma natural de chifres (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com os chifres.'
      },
      {
        name: 'Couro Rígido',
        description: 'Sua pele é dura como a de um touro. Você recebe +1 na Defesa.'
      },
      {
        name: 'Faro',
        description: 'Você tem olfato apurado. Contra inimigos em alcance curto que não possa ver, você não fica desprevenido e camuflagem total lhe causa apenas 20% de chance de falha.'
      },
      {
        name: 'Medo de Altura',
        description: 'Se estiver adjacente a uma queda de 3m ou mais de altura (como um buraco ou penhasco), você fica abalado.'
      }
    ],
    playstyle: [
      'Combatentes pesados com múltiplos ataques na rodada.',
      'Excelente resistência física e proteção natural.'
    ],
    synergies: {
      classes: ['Guerreiro', 'Bárbaro', 'Lutador', 'Cavaleiro'],
      builds: ['Guerreiro de Duas Mãos', 'Bárbaro Feroz', 'Lutador Chifrada']
    },
    description: 'Disciplinados, sisudos e orgulhosos de sua força, os minotauros lutam para reerguer sua glória e proteger os aliados com lealdade de aço.'
  },
  {
    id: 'osteon',
    slug: 'osteon',
    name: 'Osteon',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Esqueletos inteligentes dotados de consciência, protegidos por armadura óssea e imunes a fadiga e veneno.',
    iconName: 'Skull',
    attributeModifiers: [
      { attribute: 'Três atributos diferentes à sua escolha (exceto Constituição)', value: 1 },
      { attribute: 'Constituição', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Armadura Óssea',
        description: 'Você recebe redução de corte, frio e perfuração 5.'
      },
      {
        name: 'Memória Póstuma',
        description: 'Você se torna treinado em uma perícia (não precisa ser da sua classe) ou recebe um poder geral a sua escolha. Como alternativa, você pode ser um osteon de outra raça humanoide que não humano. Neste caso, você ganha uma habilidade dessa raça a sua escolha. Se a raça era de tamanho diferente de Médio, você também possui sua categoria de tamanho.'
      },
      {
        name: 'Natureza Esquelética',
        description: 'Você é uma criatura do tipo morto-vivo. Recebe visão no escuro e imunidade a efeitos de cansaço, metabólicos, de trevas e de veneno. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, efeitos mágicos de cura de luz causam dano a você e você não se beneficia de itens da categoria alimentação, mas dano de trevas recupera seus PV.'
      },
      {
        name: 'Preço da Não Vida',
        description: 'Você precisa passar oito horas sob a luz de estrelas ou no subterrâneo. Se fizer isso, recupera PV e PM por descanso em condições normais (osteon não são afetados por condições boas ou ruins de descanso). Caso contrário, sofre os efeitos de fome.'
      }
    ],
    playstyle: [
      'Imunidades completas a fadiga, doenças e venenos.',
      'Redução passiva de dano contra corte, frio e perfuração.'
    ],
    synergies: {
      classes: ['Arcanista (Necromante)', 'Ladino', 'Clérigo de Tenebra', 'Guerreiro'],
      builds: ['Necromante Não-Vivo', 'Cavaleiro Esquelético', 'Ladino Imortal']
    },
    description: 'Esqueletos conscientes e sencientes que desafiam o estigma da não-vida, conservando habilidades de sua existência pregressa.'
  },
  {
    id: 'qareen',
    slug: 'qareen',
    name: 'Qareen',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Meios-gênios benevolentes e carismáticos, abençoados por Wynna com tatuagens místicas e poder amplificado ao realizar desejos.',
    iconName: 'Sparkles',
    attributeModifiers: [
      { attribute: 'Carisma', value: 2 },
      { attribute: 'Inteligência', value: 1 },
      { attribute: 'Sabedoria', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Desejos',
        description: 'Se lançar uma magia que alguém tenha pedido desde seu último turno, o custo da magia diminui em –1 PM. Fazer um desejo ao qareen é uma ação livre.'
      },
      {
        name: 'Resistência Elemental',
        description: 'Conforme sua ascendência, você recebe redução 10 a um tipo de dano. Escolha uma: frio (qareen da água), eletricidade (do ar), fogo (do fogo), ácido (da terra), luz (da luz) ou trevas (qareen das trevas).'
      },
      {
        name: 'Tatuagem Mística',
        description: 'Você pode lançar uma magia de 1º círculo a sua escolha (atributo-chave Carisma). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.'
      }
    ],
    playstyle: [
      'Conjuradores arcanos e bardos de altíssimo Carisma.',
      'Economia de Mana ao cooperar com desejos do grupo.'
    ],
    synergies: {
      classes: ['Arcanista (Feiticeiro)', 'Bardo', 'Nobre', 'Paladino'],
      builds: ['Feiticeiro Dracônico/Feérico', 'Bardo Suporte', 'Nobre Encantador']
    },
    description: 'Filhos dos gênios e de mortais, exibem marcas místicas brilhantes e canalizam magias com graça e generosidade incomparáveis.'
  },
  {
    id: 'sereia-tritao',
    slug: 'sereia-tritao',
    name: 'Sereia/Tritão',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Povo marinho capaz de alternar entre cauda de peixe para natação veloz e pernas bípedes para caminhar em terra firme.',
    iconName: 'Waves',
    attributeModifiers: [
      { attribute: 'Três atributos diferentes à sua escolha', value: 1 }
    ],
    racialAbilities: [
      {
        name: '+1 em Três Atributos Diferentes',
        description: 'Sereias e tritões adaptam-se com facilidade tanto aos mistérios do oceano quanto aos desafios da terra emersa.'
      },
      {
        name: 'Canção dos Mares',
        description: 'Você pode lançar duas das magias a seguir: Amedrontar, Comando, Despedaçar, Enfeitiçar, Hipnotismo ou Sono (atributo-chave Carisma). Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM.'
      },
      {
        name: 'Mestre do Tridente',
        description: 'Para você, o tridente é uma arma simples. Além disso, você recebe +2 em rolagens de dano com azagaias, lanças e tridentes.'
      },
      {
        name: 'Transformação Anfíbia',
        description: 'Você pode respirar debaixo d’água e possui uma cauda que fornece deslocamento de natação 12m. Quando fora d’água, sua cauda desaparece e dá lugar a pernas (deslocamento 9m). Se permanecer mais de um dia sem contato com água, você não recupera PM com descanso até voltar para a água (ou, pelo menos, tomar um bom banho!).'
      }
    ],
    playstyle: [
      'Conjuradores e combatentes anfíbios com arsenal de magias de controle mental.',
      'Bônus expressivo no uso de armas de haste marítimas.'
    ],
    synergies: {
      classes: ['Bardo', 'Bucaneiro', 'Druida', 'Nobre', 'Guerreiro'],
      builds: ['Bardo da Canção dos Mares', 'Bucaneiro do Tridente', 'Druida do Oceano']
    },
    description: 'Com canto hipnótico e maestria nas profundezas do Grande Oceano, exploram o continente em busca de novas façanhas e alianças.'
  },
  {
    id: 'silfide',
    slug: 'silfide',
    name: 'Sílfide',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Fadas minúsculas com asas de borboleta, capazes de pairar, voar com facilidade e encantar através da magia natural das fadas.',
    iconName: 'Sparkles',
    attributeModifiers: [
      { attribute: 'Carisma', value: 2 },
      { attribute: 'Destreza', value: 1 },
      { attribute: 'Força', value: -2 }
    ],
    racialAbilities: [
      {
        name: 'Asas de Borboleta',
        description: 'Seu tamanho é Minúsculo. Você pode pairar a 1,5m do chão com deslocamento 9m. Isso permite que você ignore terreno difícil e o torna imune a dano por queda (a menos que esteja inconsciente). Você pode gastar 1 PM por rodada para voar com deslocamento de 12m.'
      },
      {
        name: 'Espírito da Natureza',
        description: 'Você é uma criatura do tipo espírito, recebe visão na penumbra e pode falar com animais livremente.'
      },
      {
        name: 'Magia das Fadas',
        description: 'Você pode lançar duas das magias a seguir (atributo-chave Carisma): Criar Ilusão, Enfeitiçar, Luz (como uma magia arcana) e Sono. Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM.'
      }
    ],
    playstyle: [
      'Evasão e Furtividade extremas devido ao tamanho Minúsculo.',
      'Voo ágil e magia inata feérica.'
    ],
    synergies: {
      classes: ['Arcanista', 'Bardo', 'Ladino', 'Nobre'],
      builds: ['Feiticeira Feérica Voadora', 'Ladina Ilusionista', 'Barda Sedutora']
    },
    description: 'Criaturas esvoaçantes de grandes olhos escuros e asas delicadas, trazem a espontaneidade e os truques mágicos da Pondsmânia para suas jornadas.'
  },
  {
    id: 'suraggel',
    slug: 'suraggel',
    name: 'Suraggel',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Descendentes de extraplanares divinos celestiais (Aggelus) ou abissais (Sulfure), manifestando a herança da luz ou das trevas.',
    iconName: 'Sun',
    attributeModifiers: [
      { attribute: 'Sabedoria +2, Carisma +1 (Aggelus) OU Destreza +2, Inteligência +1 (Sulfure)', value: 1 }
    ],
    racialAbilities: [
      {
        name: 'Herança Divina',
        description: 'Você é uma criatura do tipo espírito e recebe visão no escuro.'
      },
      {
        name: 'Luz Sagrada (Aggelus)',
        description: 'Você recebe +2 em Diplomacia e Intuição. Além disso, pode lançar Luz (como uma magia divina; atributo-chave Carisma). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.'
      },
      {
        name: 'Sombras Profanas (Sulfure)',
        description: 'Você recebe +2 em Enganação e Furtividade. Além disso, pode lançar Escuridão (como uma magia divina; atributo-chave Inteligência). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.'
      }
    ],
    playstyle: [
      'Aggelus: foco em Sabedoria e Carisma para clérigos, paladinos e diplomatas.',
      'Sulfure: foco em Destreza e Inteligência para ladinos, arcanistas e especialistas sombrios.'
    ],
    synergies: {
      classes: ['Clérigo', 'Paladino', 'Ladino', 'Arcanista', 'Nobre'],
      builds: ['Aggelus Clérigo da Luz', 'Sulfure Ladino das Sombras', 'Aggelus Paladino da Justiça']
    },
    description: 'Marcados pelo sangue dos Mundos dos Deuses, suraggel carregam traços luminosos (aggelus) ou feições e chifres sombrios (sulfure).'
  },
  {
    id: 'trog',
    slug: 'trog',
    name: 'Trog',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Homens-lagarto resistentes e primitivos, dotados de mau cheiro incapacitante, mordida letal e camuflagem natural.',
    iconName: 'ShieldAlert',
    attributeModifiers: [
      { attribute: 'Constituição', value: 2 },
      { attribute: 'Força', value: 1 },
      { attribute: 'Inteligência', value: -1 }
    ],
    racialAbilities: [
      {
        name: 'Mau Cheiro',
        description: 'Você pode gastar uma ação padrão e 2 PM para expelir um gás fétido. Todas as criaturas (exceto trogs) em alcance curto devem passar em um teste de Fortitude contra veneno (CD Con) ou ficarão enjoadas durante 1d6 rodadas. Uma criatura que passe no teste de resistência fica imune a esta habilidade por um dia.'
      },
      {
        name: 'Mordida',
        description: 'Você possui uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.'
      },
      {
        name: 'Reptiliano',
        description: 'Você é uma criatura do tipo monstro e recebe visão no escuro, +1 na Defesa e, se estiver sem armadura ou roupas pesadas, +5 em Furtividade.'
      },
      {
        name: 'Sangue Frio',
        description: 'Você sofre 1 ponto de dano adicional por dado de dano de frio.'
      }
    ],
    playstyle: [
      'Tanques brutais capazes de debilitar grupos de inimigos com Mau Cheiro.',
      'Ataque extra na rodada com mordida natural.'
    ],
    synergies: {
      classes: ['Bárbaro', 'Lutador', 'Guerreiro', 'Druida'],
      builds: ['Bárbaro Fedorento', 'Lutador Primitivo', 'Guerreiro Réptil']
    },
    description: 'Trogloditas fortes e resilientes, acostumados ao subterrâneo, que encontram na vida de aventuras uma oportunidade de superar os preconceitos da superfície.'
  }
];
