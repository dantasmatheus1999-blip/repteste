export interface T20ClassPower {
  id: string;
  name: string;
  classId: string;
  minLevel: number;
  prerequisites?: string;
  description: string;
  tags: string[];
}

export const T20_CLASS_POWERS: T20ClassPower[] = [
  // --- GUERREIRO ---
  {
    id: 'guerreiro-especializacao-em-arma',
    name: 'Especialização em Arma',
    classId: 'guerreiro',
    minLevel: 2,
    prerequisites: 'Nível 2 de Guerreiro',
    description: 'Escolha uma arma. Você recebe +2 em testes de dano com essa arma.',
    tags: ['Dano', 'Arma']
  },
  {
    id: 'guerreiro-ataque-reflexo',
    name: 'Ataque Reflexo',
    classId: 'guerreiro',
    minLevel: 2,
    prerequisites: 'Des 1',
    description: 'Se um alvo adjacente baixar a guarda ou ficar desprevenido, você pode gastar 1 PM para fazer um ataque corpo a corpo contra ele imediatamente.',
    tags: ['Reação', 'Ataque']
  },
  {
    id: 'guerreiro-destruidor',
    name: 'Destruidor',
    classId: 'guerreiro',
    minLevel: 2,
    prerequisites: 'For 1',
    description: 'Quando causa dano com uma arma de duas mãos, você pode rolar novamente qualquer resultado 1 ou 2 nos dados de dano.',
    tags: ['Duas Mãos', 'Dano']
  },
  {
    id: 'guerreiro-valentao',
    name: 'Valentão',
    classId: 'guerreiro',
    minLevel: 2,
    prerequisites: 'Nível 2 de Guerreiro',
    description: 'Você recebe +2 em testes de ataque e dano contra alvos caídos, desprevenidos, flanqueados ou indefesos.',
    tags: ['Combate', 'Bônus']
  },
  {
    id: 'guerreiro-solidez',
    name: 'Solidez',
    classId: 'guerreiro',
    minLevel: 2,
    prerequisites: 'Treinado em Luta, uso de escudo',
    description: 'Se estiver usando um escudo, você soma o bônus na Defesa do escudo em todos os seus testes de resistência.',
    tags: ['Defesa', 'Escudo']
  },
  {
    id: 'guerreiro-arqueiro',
    name: 'Arqueiro',
    classId: 'guerreiro',
    minLevel: 2,
    prerequisites: 'Des 1, Pontaria treinado',
    description: 'Se estiver usando uma arma de disparo, você soma sua Sabedoria nas rolagens de dano (limitado pelo seu nível).',
    tags: ['Distância', 'Dano']
  },
  {
    id: 'guerreiro-golpe-pessoal',
    name: 'Golpe Pessoal',
    classId: 'guerreiro',
    minLevel: 5,
    prerequisites: 'Nível 5 de Guerreiro',
    description: 'Você desenvolve uma técnica de luta única com custo adicional em PM, causando dano devastador e efeitos especiais.',
    tags: ['Especial', 'Técnica']
  },
  {
    id: 'guerreiro-tornado-de-dor',
    name: 'Tornado de Dor',
    classId: 'guerreiro',
    minLevel: 6,
    prerequisites: 'Nível 6 de Guerreiro',
    description: 'Você pode gastar 2 PM para desferir um ataque corpo a corpo contra cada inimigo adjacente.',
    tags: ['Área', 'Ataque']
  },
  {
    id: 'guerreiro-planejamento-marcial',
    name: 'Planejamento Marcial',
    classId: 'guerreiro',
    minLevel: 10,
    prerequisites: 'Nível 10 de Guerreiro',
    description: 'No início do dia, você pode gastar 3 PM para escolher um poder de combate cujos pré-requisitos cumpra temporariamente até o fim do dia.',
    tags: ['Tática', 'Versatilidade']
  },
  {
    id: 'guerreiro-mestre-em-arma',
    name: 'Mestre em Arma',
    classId: 'guerreiro',
    minLevel: 12,
    prerequisites: 'Especialização em Arma, Nível 12',
    description: 'Seu bônus de Especialização em Arma sobe para +4 e a margem de ameaça da arma escolhida aumenta em +1.',
    tags: ['Crítico', 'Dano']
  },

  // --- LADINO ---
  {
    id: 'ladino-sombra',
    name: 'Sombra',
    classId: 'ladino',
    minLevel: 2,
    prerequisites: 'Furtividade treinado',
    description: 'Você recebe +2 em Furtividade e não sofre penalidade no teste por se mover na velocidade normal.',
    tags: ['Furtividade']
  },
  {
    id: 'ladino-gatuno',
    name: 'Gatuno',
    classId: 'ladino',
    minLevel: 2,
    prerequisites: 'Ladinagem treinado',
    description: 'Você recebe +2 em Ladinagem e Atletismo, e escala superfícies com deslocamento normal sem penalidades.',
    tags: ['Ladinagem', 'Mobilidade']
  },
  {
    id: 'ladino-mente-criminosa',
    name: 'Mente Criminosa',
    classId: 'ladino',
    minLevel: 2,
    prerequisites: 'Int 1',
    description: 'Você soma seu bônus de Inteligência nos seus testes de Iniciativa e Ladinagem.',
    tags: ['Perícia', 'Iniciativa']
  },
  {
    id: 'ladino-rolamento-defensivo',
    name: 'Rolamento Defensivo',
    classId: 'ladino',
    minLevel: 2,
    prerequisites: 'Reflexos treinado',
    description: 'Quando sofre dano, você pode gastar 2 PM e fazer um teste de Reflexos (CD igual ao dano). Se passar, reduz o dano sofrido à metade.',
    tags: ['Defesa', 'Reflexos']
  },
  {
    id: 'ladino-truque-de-magica',
    name: 'Truque de Mágica',
    classId: 'ladino',
    minLevel: 2,
    prerequisites: 'Int 1',
    description: 'Você aprende e pode lançar uma magia arcana de 1º círculo à sua escolha usando Inteligência como atributo-chave.',
    tags: ['Magia', 'Utilidade']
  },
  {
    id: 'ladino-veneno-potente',
    name: 'Veneno Potente',
    classId: 'ladino',
    minLevel: 2,
    prerequisites: 'Ofício (Alquimia) ou Ladinagem',
    description: 'A CD para resistir aos venenos aplicados em suas armas aumenta em +2.',
    tags: ['Veneno']
  },
  {
    id: 'ladino-assassinar',
    name: 'Assassinar',
    classId: 'ladino',
    minLevel: 5,
    prerequisites: 'Nível 5 de Ladino',
    description: 'Você gasta 2 PM ao fazer um ataque furtivo. Se acertar, o alvo deve fazer teste de Fortitude ou o multiplicador de crítico do ataque é aumentado.',
    tags: ['Dano Massivo', 'Furtivo']
  },
  {
    id: 'ladino-velocidade-ladina',
    name: 'Velocidade Ladina',
    classId: 'ladino',
    minLevel: 6,
    prerequisites: 'Nível 6 de Ladino',
    description: 'Você pode gastar 2 PM para realizar uma ação de movimento adicional no seu turno.',
    tags: ['Ação Extra', 'Mobilidade']
  },

  // --- ARCANISTA ---
  {
    id: 'arcanista-arcano-de-batalha',
    name: 'Arcano de Batalha',
    classId: 'arcanista',
    minLevel: 2,
    prerequisites: 'Nível 2 de Arcanista',
    description: 'Você soma o modificador do seu atributo-chave de magia nas rolagens de dano de suas magias.',
    tags: ['Dano Mágico']
  },
  {
    id: 'arcanista-especialista-em-magia',
    name: 'Especialista em Magia',
    classId: 'arcanista',
    minLevel: 2,
    prerequisites: 'Misticismo treinado',
    description: 'Escolha uma escola de magia. O custo de PM de todas as suas magias dessa escola é reduzido em –1 PM (mínimo 1 PM).',
    tags: ['Mana', 'Economia']
  },
  {
    id: 'arcanista-fortalecimento-arcano',
    name: 'Fortalecimento Arcano',
    classId: 'arcanista',
    minLevel: 2,
    prerequisites: 'Nível 2 de Arcanista',
    description: 'A CD para resistir a todas as suas magias arcanas aumenta em +1.',
    tags: ['CD', 'Poder Mágico']
  },
  {
    id: 'arcanista-foco-em-magia',
    name: 'Foco em Magia',
    classId: 'arcanista',
    minLevel: 2,
    prerequisites: 'Nível 2 de Arcanista',
    description: 'Escolha uma magia que conheça. O custo dela é reduzido em 1 PM e sua CD aumenta em +2.',
    tags: ['Especialização']
  },
  {
    id: 'arcanista-magia-ilimitada',
    name: 'Magia Ilimitada',
    classId: 'arcanista',
    minLevel: 2,
    prerequisites: 'Nível 2 de Arcanista',
    description: 'O limite de PM que você pode gastar ao lançar ou aprimorar uma magia aumenta em um valor igual ao seu atributo-chave.',
    tags: ['PM Máximo', 'Aprimoramento']
  },
  {
    id: 'arcanista-raio-arcano',
    name: 'Raio Arcano',
    classId: 'arcanista',
    minLevel: 2,
    prerequisites: 'Nível 2 de Arcanista',
    description: 'Você pode gastar 1 PM para disparar um raio de pura energia em um alvo a alcance curto, causando dano de essência que aumenta com círculos conhecidos.',
    tags: ['Dano', 'Essência']
  },
  {
    id: 'arcanista-mestre-em-magia',
    name: 'Mestre em Magia',
    classId: 'arcanista',
    minLevel: 10,
    prerequisites: 'Nível 10 de Arcanista',
    description: 'O custo de todas as suas magias de 1º e 2º círculos é reduzido em 1 PM.',
    tags: ['Alta Magia']
  },

  // --- CLÉRIGO ---
  {
    id: 'clerigo-abencoar-arma',
    name: 'Abençoar Arma',
    classId: 'clerigo',
    minLevel: 2,
    prerequisites: 'Devoto',
    description: 'Você pode gastar 1 PM para consagrar sua arma, somando sua Sabedoria nos testes de ataque e dano corpo a corpo.',
    tags: ['Ataque', 'Dano Sagrado']
  },
  {
    id: 'clerigo-comunhao-vital',
    name: 'Comunhão Vital',
    classId: 'clerigo',
    minLevel: 2,
    prerequisites: 'Nível 2 de Clérigo',
    description: 'Quando cura um aliado com uma magia divina, você pode gastar 1 PM para curar a si mesmo na mesma quantidade.',
    tags: ['Cura', 'Suporte']
  },
  {
    id: 'clerigo-expulsar-mortos-vivos',
    name: 'Expulsar Mortos-Vivos',
    classId: 'clerigo',
    minLevel: 2,
    prerequisites: 'Canalizar Energia Positiva',
    description: 'Ao canalizar energia positiva, mortos-vivos na área que falharem na resistência ficam apavorados e fogem de você.',
    tags: ['Mortos-Vivos', 'Controle']
  },
  {
    id: 'clerigo-prece-de-combate',
    name: 'Prece de Combate',
    classId: 'clerigo',
    minLevel: 2,
    prerequisites: 'Nível 2 de Clérigo',
    description: 'Você pode conjurar uma magia divina de alcance pessoal como ação de movimento em vez de ação padrão, gastando +2 PM.',
    tags: ['Magia Rápida', 'Buff']
  },
  {
    id: 'clerigo-simbolo-energizado',
    name: 'Símbolo Sagrado Energizado',
    classId: 'clerigo',
    minLevel: 2,
    prerequisites: 'Religião treinado',
    description: 'Suas magias de cura curam +1 PV adicional por dado de dano ou cura rolado.',
    tags: ['Cura Potente']
  },

  // --- BÁRBARO ---
  {
    id: 'barbaro-frenesi',
    name: 'Frenesi',
    classId: 'barbaro',
    minLevel: 2,
    prerequisites: 'Fúria',
    description: 'Enquanto está em Fúria, se fizer a ação agredir, pode gastar 1 PM para fazer um ataque corpo a corpo adicional.',
    tags: ['Ataque Extra', 'Fúria']
  },
  {
    id: 'barbaro-alma-de-bronze',
    name: 'Alma de Bronze',
    classId: 'barbaro',
    minLevel: 2,
    prerequisites: 'Fúria',
    description: 'Quando entra em Fúria, você ganha uma quantidade de PV temporários igual ao seu nível + mod. Constituição.',
    tags: ['PV Temporário', 'Resistência']
  },
  {
    id: 'barbaro-pele-de-ferro',
    name: 'Pele de Ferro',
    classId: 'barbaro',
    minLevel: 2,
    prerequisites: 'Con 1',
    description: 'Você soma sua Constituição na Defesa quando não estiver usando armadura pesada.',
    tags: ['Defesa', 'Constituição']
  },
  {
    id: 'barbaro-golpe-poderoso',
    name: 'Golpe Poderoso',
    classId: 'barbaro',
    minLevel: 2,
    prerequisites: 'For 1',
    description: 'Ao acertar um ataque corpo a corpo, você pode gastar 1 PM para rolar um dado de dano adicional da sua arma.',
    tags: ['Dano Brutal']
  },
  {
    id: 'barbaro-critico-devastador',
    name: 'Crítico Devastador',
    classId: 'barbaro',
    minLevel: 6,
    prerequisites: 'Nível 6 de Bárbaro',
    description: 'O multiplicador de crítico dos seus ataques com armas aumenta em +1 enquanto você estiver em Fúria.',
    tags: ['Crítico', 'Fúria']
  },

  // --- BARDO ---
  {
    id: 'bardo-danca-das-laminas',
    name: 'Dança das Lâminas',
    classId: 'bardo',
    minLevel: 2,
    prerequisites: 'Inspiração',
    description: 'Enquanto mantém sua Inspiração ativa, você pode gastar 1 PM para realizar um ataque corpo a corpo extra no seu turno.',
    tags: ['Combate', 'Música']
  },
  {
    id: 'bardo-melodia-curativa',
    name: 'Melodia Curativa',
    classId: 'bardo',
    minLevel: 2,
    prerequisites: 'Inspiração, Atuação treinado',
    description: 'Sua canção canaliza energias de restauração, curando 1d6 PV por rodada para você e aliados próximos.',
    tags: ['Cura', 'Suporte']
  },
  {
    id: 'bardo-fascinar',
    name: 'Fascinar',
    classId: 'bardo',
    minLevel: 2,
    prerequisites: 'Atuação treinado',
    description: 'Você pode gastar 1 PM e fazer um teste de Atuação para deixar criaturas que possam ouvi-lo hipnotizadas e incapazes de agir.',
    tags: ['Controle Mental']
  },
  {
    id: 'bardo-golpe-magico',
    name: 'Golpe Mágico',
    classId: 'bardo',
    minLevel: 2,
    prerequisites: 'Nível 2 de Bardo',
    description: 'Quando acerta um ataque com arma, você pode gastar 1 PM para recuperar 1 PM gasto em magias ou somar dano mágico.',
    tags: ['Mana', 'Ataque']
  },

  // --- BUCANEIRO ---
  {
    id: 'bucaneiro-acrobata',
    name: 'Acrobata',
    classId: 'bucaneiro',
    minLevel: 2,
    prerequisites: 'Acrobacia treinado',
    description: 'Você recebe +2 em testes de Acrobacia e pode se levantar do chão como ação livre sem gastar PM.',
    tags: ['Mobilidade']
  },
  {
    id: 'bucaneiro-esgrima-graciosa',
    name: 'Esgrima Graciosa',
    classId: 'bucaneiro',
    minLevel: 2,
    prerequisites: 'Des 1',
    description: 'Você pode usar sua Destreza no lugar da Força nos testes de ataque e dano com armas leves e de uma mão.',
    tags: ['Destreza', 'Ataque']
  },
  {
    id: 'bucaneiro-riposte',
    name: 'Riposte',
    classId: 'bucaneiro',
    minLevel: 2,
    prerequisites: 'Nível 2 de Bucaneiro',
    description: 'Quando um inimigo erra um ataque corpo a corpo contra você, você pode gastar 1 PM para fazer um contra-ataque imediato.',
    tags: ['Reação', 'Contra-Ataque']
  },
  {
    id: 'bucaneiro-pernas-do-mar',
    name: 'Pernas do Mar',
    classId: 'bucaneiro',
    minLevel: 2,
    prerequisites: 'Nível 2 de Bucaneiro',
    description: 'Você é imune a condições que tentem derrubá-lo e não sofre penalidades em superfícies inclinadas ou instáveis.',
    tags: ['Equilíbrio']
  },

  // --- CAÇADOR ---
  {
    id: 'cacador-inimigo-de-criaturas',
    name: 'Inimigo de Criaturas',
    classId: 'cacador',
    minLevel: 2,
    prerequisites: 'Sobrevivência treinado',
    description: 'Escolha um tipo de criatura (Monstros, Mortos-vivos, Humanoides). Você recebe +2 em testes de ataque, dano e Sobrevivência contra esse tipo.',
    tags: ['Inimigo Favorito']
  },
  {
    id: 'cacador-tiro-certeiro',
    name: 'Tiro Certeiro',
    classId: 'cacador',
    minLevel: 2,
    prerequisites: 'Pontaria treinado',
    description: 'Seus ataques à distância ignoram penalidade por atirar contra alvos envolvidos em combate corpo a corpo.',
    tags: ['Precisão', 'Distância']
  },
  {
    id: 'cacador-armadilha-rapida',
    name: 'Armadilha Rápida',
    classId: 'cacador',
    minLevel: 2,
    prerequisites: 'Ofício ou Ladinagem',
    description: 'Você pode preparar e armar armadilhas de combate gastando apenas uma ação padrão em vez de minutos.',
    tags: ['Armadilhas']
  },
  {
    id: 'cacador-olhos-de-aguia',
    name: 'Olhos de Águia',
    classId: 'cacador',
    minLevel: 2,
    prerequisites: 'Percepção treinado',
    description: 'O alcance de todas as suas armas à distância é dobrado e você recebe +2 em Percepção.',
    tags: ['Alcance', 'Visão']
  },

  // --- CAVALEIRO ---
  {
    id: 'cavaleiro-armadura-de-honra',
    name: 'Armadura de Honra',
    classId: 'cavaleiro',
    minLevel: 2,
    prerequisites: 'Uso de armadura pesada',
    description: 'Quando veste armadura pesada, sua Redução de Dano (RD) natural aumenta em +2.',
    tags: ['Defesa', 'Tanque']
  },
  {
    id: 'cavaleiro-investida-montada',
    name: 'Investida Montada',
    classId: 'cavaleiro',
    minLevel: 2,
    prerequisites: 'Cavalgar treinado',
    description: 'Ao realizar uma investida montado com uma lança de montaria, o dano da arma é dobrado.',
    tags: ['Montaria', 'Dano']
  },
  {
    id: 'cavaleiro-proteger-aliado',
    name: 'Proteger Aliado',
    classId: 'cavaleiro',
    minLevel: 2,
    prerequisites: 'Nível 2 de Cavaleiro',
    description: 'Se um aliado adjacente sofrer um ataque, você pode gastar 1 PM para fazer o ataque mirar em você em vez dele.',
    tags: ['Proteção', 'Guardião']
  },

  // --- DRUIDA ---
  {
    id: 'druida-magia-natural',
    name: 'Magia Natural',
    classId: 'druida',
    minLevel: 2,
    prerequisites: 'Forma Selvagem, Magias',
    description: 'Você pode lançar magias livremente enquanto estiver transformado em Forma Selvagem.',
    tags: ['Transformação', 'Magia']
  },
  {
    id: 'druida-garras-afiadas',
    name: 'Garras Afiadas',
    classId: 'druida',
    minLevel: 2,
    prerequisites: 'Forma Selvagem',
    description: 'Em Forma Selvagem, os danos dos seus ataques naturais com mordida e garras aumentam em um passo.',
    tags: ['Dano Animal']
  },
  {
    id: 'druida-companheiro-animal',
    name: 'Companheiro Animal',
    classId: 'druida',
    minLevel: 2,
    prerequisites: 'Empatia Selvagem',
    description: 'Você ganha a companhia leal de um parceiro animal que luta ao seu lado e fornece bônus táticos constantes.',
    tags: ['Pet', 'Aliado']
  },

  // --- INVENTOR ---
  {
    id: 'inventor-balistica',
    name: 'Balística',
    classId: 'inventor',
    minLevel: 2,
    prerequisites: 'Pontaria treinado, Int 1',
    description: 'Você pode usar sua Inteligência no lugar da Destreza em testes de ataque e dano com armas de fogo e disparo.',
    tags: ['Inteligência', 'Tiro']
  },
  {
    id: 'inventor-armeiro',
    name: 'Armeiro',
    classId: 'inventor',
    minLevel: 2,
    prerequisites: 'Ofício (Armeiro) treinado',
    description: 'Você pode aprimorar armas e armaduras dos seus aliados com modificações superiores sem custos.',
    tags: ['Ofício', 'Equipamento']
  },
  {
    id: 'inventor-catalisador-alquimico',
    name: 'Catalisador Alquímico',
    classId: 'inventor',
    minLevel: 2,
    prerequisites: 'Ofício (Alquimia)',
    description: 'Todas as poções e bombas fabricadas por você causam +1d6 de dano ou curam +1d6 PV adicionais.',
    tags: ['Alquimia']
  },
  {
    id: 'inventor-automato',
    name: 'Autômato de Combate',
    classId: 'inventor',
    minLevel: 2,
    prerequisites: 'Ofício (Engenhoqueiro)',
    description: 'Você constrói um autômato mecânico que luta ao seu lado e protege seu criador de ataques.',
    tags: ['Construto']
  },

  // --- LUTADOR ---
  {
    id: 'lutador-ate-acertar',
    name: 'Até Acertar',
    classId: 'lutador',
    minLevel: 2,
    prerequisites: 'Briga',
    description: 'Se errar um ataque desarmado, você recebe +2 cumulativo nos próximos testes de ataque desarmado até acertar um golpe.',
    tags: ['Ataque', 'Precisão']
  },
  {
    id: 'lutador-chave-de-braco',
    name: 'Chave de Braço',
    classId: 'lutador',
    minLevel: 2,
    prerequisites: 'Atletismo treinado',
    description: 'Se estiver agarrando uma criatura, pode gastar 1 PM para causar o dano do seu golpe desarmado automaticamente a cada rodada.',
    tags: ['Imobilização', 'Grappling']
  },
  {
    id: 'lutador-casca-grossa',
    name: 'Casca Grossa',
    classId: 'lutador',
    minLevel: 2,
    prerequisites: 'Con 1',
    description: 'Você soma sua Constituição na sua Defesa quando não estiver usando armadura pesada.',
    tags: ['Defesa', 'Resistência']
  },
  {
    id: 'lutador-trocacao',
    name: 'Trocação',
    classId: 'lutador',
    minLevel: 6,
    prerequisites: 'Nível 6 de Lutador',
    description: 'Ao acertar um ataque desarmado, você pode gastar 1 PM para desferir outro ataque desarmado imediatamente.',
    tags: ['Combo', 'Ataque Múltiplo']
  },

  // --- NOBRE ---
  {
    id: 'nobre-comandar',
    name: 'Comandar',
    classId: 'nobre',
    minLevel: 2,
    prerequisites: 'Car 1',
    description: 'Você pode gastar 1 PM para conceder uma ação de movimento imediata a um aliado que possa ouvi-lo.',
    tags: ['Liderança', 'Tática']
  },
  {
    id: 'nobre-palavra-inspiradora',
    name: 'Palavra Inspiradora',
    classId: 'nobre',
    minLevel: 2,
    prerequisites: 'Diplomacia treinado',
    description: 'Suas palavras inspiradoras curam PV e removem condições mentais de um aliado em alcance curto.',
    tags: ['Cura Mental', 'Suporte']
  },
  {
    id: 'nobre-lingua-de-prata',
    name: 'Língua de Prata',
    classId: 'nobre',
    minLevel: 2,
    prerequisites: 'Enganação treinado',
    description: 'Você pode usar Enganação ou Diplomacia em combate para fazer um oponente hesitar e perder a iniciativa.',
    tags: ['Social', 'Desestabilização']
  },
  {
    id: 'nobre-presenca-aristocratica',
    name: 'Presença Aristocrática',
    classId: 'nobre',
    minLevel: 2,
    prerequisites: 'Nível 2 de Nobre',
    description: 'Qualquer oponente que tente atacá-lo diretamente deve fazer um teste de Vontade; se falhar, perde a ação.',
    tags: ['Defesa Mental', 'Aura']
  },

  // --- PALADINO ---
  {
    id: 'paladino-arma-sagrada',
    name: 'Arma Sagrada',
    classId: 'paladino',
    minLevel: 2,
    prerequisites: 'Devoto',
    description: 'O dano da arma de sua divindade aumenta em um passo e seus ataques contam como dano sagrado mágico.',
    tags: ['Dano Sagrado']
  },
  {
    id: 'paladino-montaria-sagrada',
    name: 'Montaria Sagrada',
    classId: 'paladino',
    minLevel: 2,
    prerequisites: 'Nível 2 de Paladino',
    description: 'Você pode invocar um corcel de guerra celestial dotado de inteligência e armadura brilhante.',
    tags: ['Montaria Divina']
  },
  {
    id: 'paladino-julgamento-justica',
    name: 'Julgamento Divino: Justiça',
    classId: 'paladino',
    minLevel: 2,
    prerequisites: 'Golpe Divino',
    description: 'Você marca um vilão com o julgamento da justiça; cada ataque dele contra inocentes concede bônus no seu próximo contra-ataque.',
    tags: ['Julgamento', 'Vingador']
  },
  {
    id: 'paladino-julgamento-iluminacao',
    name: 'Julgamento Divino: Iluminação',
    classId: 'paladino',
    minLevel: 2,
    prerequisites: 'Golpe Divino',
    description: 'Você julga um adversário; sempre que você ou seus aliados acertarem esse alvo, recuperam 1 PM.',
    tags: ['Mana', 'Julgamento']
  }
];
