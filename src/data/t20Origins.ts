import { T20OriginDetail } from '../types/origins';

export const T20_ORIGINS: T20OriginDetail[] = [
  {
    id: 'acolito',
    slug: 'acolito',
    name: 'Acólito',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você foi criado em um templo, servindo a uma divindade.',
    startingItems: ['Símbolo sagrado', 'Traje de Sacerdote'],
    skills: ['Cura', 'Religião', 'Vontade'],
    availablePowers: ['Medicina', 'Membro da Igreja', 'Vontade de Ferro', 'Presente de Wynlla'],
    originPowers: [
      {
        name: 'Membro da Igreja',
        description: 'Você consegue hospedagem confortável e informação em qualquer templo de sua divindade, para você e seus aliados.'
      }
    ],
    description: 'Você passou sua vida servindo a um templo e agora busca levar a palavra de sua divindade para o mundo.',
    iconName: 'Sun'
  },
  {
    id: 'artesao',
    slug: 'artesao',
    name: 'Artesão',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você ganha a vida fabricando itens úteis ou belos.',
    startingItems: ['Ferramentas de artesão (um ofício)', 'Item de sua fabricação (até T$ 50)'],
    skills: ['Ofício', 'Vontade'],
    availablePowers: ['Foco em Perícia (Ofício)', 'Mestre Artesão', 'Sortudo'],
    originPowers: [
      {
        name: 'Frutos do Trabalho',
        description: 'Você pode usar a perícia Ofício para sustento com o dobro do valor normal.'
      }
    ],
    description: 'Sua vida foi dedicada à maestria de um ofício, transformando matéria-prima em obras de utilidade ou arte.',
    iconName: 'Hammer'
  },
  {
    id: 'artista',
    slug: 'artista',
    name: 'Artista',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Sua arte é sua vida e sua forma de se expressar.',
    startingItems: ['Instrumento musical ou kit de disfarce', 'Traje de artista'],
    skills: ['Atuação', 'Enganação'],
    availablePowers: ['Aparência Inofensiva', 'Atraente', 'Torcida'],
    originPowers: [
      {
        name: 'Fama',
        description: 'Você é conhecido em sua região. Pode conseguir hospedagem e refeições de graça em troca de uma apresentação.'
      }
    ],
    description: 'Seja através da música, dança ou atuação, você cativa multidões e vive sob os holofotes.',
    iconName: 'Music'
  },
  {
    id: 'assistente-de-laboratorio',
    slug: 'assistente-de-laboratorio',
    name: 'Assistente de Laboratório',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você auxiliou um mestre em experimentos arcanos ou alquímicos.',
    startingItems: ['Aparato de laboratório', 'Traje de viajante'],
    skills: ['Misticismo', 'Ofício (alquimia)'],
    availablePowers: ['Foco em Perícia', 'Vontade de Ferro', 'Estudioso'],
    originPowers: [
      {
        name: 'Esse Cheiro...',
        description: 'Você recebe +2 em testes de Fortitude e resistência a veneno 5.'
      }
    ],
    description: 'Anos limpando frascos e anotando resultados de experimentos deram a você um conhecimento prático incomum.',
    iconName: 'FlaskConical'
  },
  {
    id: 'batedor',
    slug: 'batedor',
    name: 'Batedor',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você serviu como explorador ou guia em regiões selvagens.',
    startingItems: ['Barraca', 'Corda', 'Traje de viajante'],
    skills: ['Adestramento', 'Furtividade', 'Percepção', 'Sobrevivência'],
    availablePowers: ['Lutar Acuado', 'Sentidos Aguçados', 'Rastreador'],
    originPowers: [
      {
        name: 'À Prova de Tudo',
        description: 'Você não sofre penalidade em deslocamento por terreno difícil e recebe +2 em testes de Sobrevivência.'
      }
    ],
    description: 'As fronteiras do mundo civilizado são seu lar, e você conhece os segredos da natureza como poucos.',
    iconName: 'Compass'
  },
  {
    id: 'campones',
    slug: 'campones',
    name: 'Camponês',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você trabalhou na terra, vivendo uma vida simples e dura.',
    startingItems: ['Ferramenta agrícola (arma improvisada)', 'Animal de fazenda (galinha, porco, etc.)'],
    skills: ['Adestramento', 'Sobrevivência'],
    availablePowers: ['Fortitude Maior', 'Vontade de Ferro', 'Pé no Chão'],
    originPowers: [
      {
        name: 'Cultura Popular',
        description: 'Você pode usar Sabedoria em vez de Inteligência para testes de Conhecimento e Nobreza.'
      }
    ],
    description: 'A lida no campo forjou seu corpo e sua mente para a resiliência e a paciência.',
    iconName: 'Sprout'
  },
  {
    id: 'charlatao',
    slug: 'charlatao',
    name: 'Charlatão',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você vive de enganar os outros com truques e lábia.',
    startingItems: ['Kit de disfarce', 'Baralho ou dados viciados'],
    skills: ['Enganação', 'Jogatina'],
    availablePowers: ['Aparência Inofensiva', 'Atraente', 'Impostor'],
    originPowers: [
      {
        name: 'Lábia',
        description: 'Você pode usar Enganação para criar uma distração como uma ação de movimento (em vez de padrão).'
      }
    ],
    description: 'A verdade é relativa para você, e uma boa história vale mais do que qualquer moeda de ouro.',
    iconName: 'Theater'
  },
  {
    id: 'criminoso',
    slug: 'criminoso',
    name: 'Criminoso',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você viveu fora da lei, seja por necessidade ou escolha.',
    startingItems: ['Kit de ladrão', 'Traje de viajante'],
    skills: ['Enganação', 'Furtividade', 'Ladinagem'],
    availablePowers: ['Pivete', 'Sutileza', 'Veneno Potente'],
    originPowers: [
      {
        name: 'Contatos no Submundo',
        description: 'Você sabe onde encontrar mercados negros e pode conseguir informações sobre crimes em qualquer cidade.'
      }
    ],
    description: 'As sombras das vielas foram sua escola, e a lei é apenas um obstáculo a ser contornado.',
    iconName: 'Skull'
  },
  {
    id: 'curandeiro',
    slug: 'curandeiro',
    name: 'Curandeiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você dedica sua vida a aliviar o sofrimento alheio.',
    startingItems: ['Bálsamo restaurador', 'Kit de medicamentos'],
    skills: ['Cura', 'Vontade'],
    availablePowers: ['Medicina', 'Vontade de Ferro', 'Médico de Campo'],
    originPowers: [
      {
        name: 'Mãos de Cura',
        description: 'Você soma seu bônus de Sabedoria aos PV restaurados por seus cuidados médicos.'
      }
    ],
    description: 'Onde há dor, você leva alívio. Seu conhecimento de ervas e anatomia salvou muitas vidas.',
    iconName: 'HeartPulse'
  },
  {
    id: 'eremita',
    slug: 'eremita',
    name: 'Eremita',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você viveu isolado do mundo, buscando autoconhecimento ou paz.',
    startingItems: ['Cajado', 'Traje de viajante'],
    skills: ['Misticismo', 'Religião', 'Sobrevivência'],
    availablePowers: ['Foco em Perícia', 'Vontade de Ferro', 'Lobo Solitário'],
    originPowers: [
      {
        name: 'Busca Interior',
        description: 'Você recebe +2 em testes de Vontade e pode meditar para recuperar PM em metade do tempo.'
      }
    ],
    description: 'O silêncio das montanhas ou das florestas profundas revelou segredos que a civilização esqueceu.',
    iconName: 'Mountain'
  },
  {
    id: 'estudioso',
    slug: 'estudioso',
    name: 'Estudioso',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você passou anos em bibliotecas e academias.',
    startingItems: ['Livro de estudos', 'Tinta e pena'],
    skills: ['Conhecimento', 'Misticismo', 'Nobreza'],
    availablePowers: ['Foco em Perícia', 'Vontade de Ferro', 'Palpite'],
    originPowers: [
      {
        name: 'Biblioteca Ambulante',
        description: 'Você pode fazer testes de Conhecimento como se fosse treinado, mesmo que não seja.'
      }
    ],
    description: 'O conhecimento é a arma mais poderosa, e você acumulou uma vasta quantidade dele ao longo dos anos.',
    iconName: 'BookOpen'
  },
  {
    id: 'gladiador',
    slug: 'gladiador',
    name: 'Gladiador',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você lutou em arenas para o entretenimento das massas.',
    startingItems: ['Arma marcial', 'Escudo leve ou rede'],
    skills: ['Adestramento', 'Atletismo', 'Luta'],
    availablePowers: ['Atraente', 'Torcida', 'Pão e Circo'],
    originPowers: [
      {
        name: 'Sangue e Glória',
        description: 'Quando você derrota um inimigo, recebe +1 em testes de ataque e Defesa até o fim da cena.'
      }
    ],
    description: 'A arena foi seu berço e seu campo de provas. Você sabe como lutar e como dar um show.',
    iconName: 'Swords'
  },
  {
    id: 'guarda',
    slug: 'guarda',
    name: 'Guarda',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você serviu na milícia ou guarda de uma cidade.',
    startingItems: ['Arma marcial', 'Insígnia da guarda'],
    skills: ['Investigação', 'Luta', 'Percepção'],
    availablePowers: ['Investigador', 'Sentidos Aguçados', 'Detetive'],
    originPowers: [
      {
        name: 'Olho Vigilante',
        description: 'Você recebe +2 em testes de Percepção e Iniciativa.'
      }
    ],
    description: 'Manter a ordem e proteger os cidadãos foi seu dever. Você tem um olho treinado para problemas.',
    iconName: 'Shield'
  },
  {
    id: 'herdeiro',
    slug: 'herdeiro',
    name: 'Herdeiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você nasceu em uma família influente ou rica.',
    startingItems: ['Item de família (até T$ 200)', 'Traje de luxo'],
    skills: ['Nobreza', 'Adestramento'],
    availablePowers: ['Comandar', 'Riqueza', 'Herança'],
    originPowers: [
      {
        name: 'Nome de Família',
        description: 'Você recebe +2 em testes de Diplomacia e Nobreza ao lidar com pessoas de sua região.'
      }
    ],
    description: 'Privilégio e responsabilidade caminham juntos em sua linhagem. Você tem recursos que outros apenas sonham.',
    iconName: 'Crown'
  },
  {
    id: 'marinheiro',
    slug: 'marinheiro',
    name: 'Marinheiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'O mar é seu lar e os navios sua paixão.',
    startingItems: ['Corda', 'Traje de marinheiro'],
    skills: ['Atletismo', 'Ofício (marinheiro)', 'Pilotagem'],
    availablePowers: ['Equilíbrio de Combate', 'Natação', 'Lobo do Mar'],
    originPowers: [
      {
        name: 'Passos Firmes',
        description: 'Você não sofre penalidade em deslocamento por balanço de navio ou superfícies instáveis.'
      }
    ],
    description: 'Ventos salgados e o balanço das ondas são tudo o que você precisa para se sentir vivo.',
    iconName: 'Anchor'
  },
  {
    id: 'mercador',
    slug: 'mercador',
    name: 'Mercador',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você vive de comprar barato e vender caro.',
    startingItems: ['Carroça ou cavalo', 'Mercadorias (T$ 100)'],
    skills: ['Diplomacia', 'Mercado'],
    availablePowers: ['Negociação', 'Riqueza', 'Mestre Mercador'],
    originPowers: [
      {
        name: 'Bom Negócio',
        description: 'Você pode comprar itens com 10% de desconto e vender itens por 10% a mais do valor normal.'
      }
    ],
    description: 'Tudo tem um preço, e você sabe exatamente qual é. Sua lábia é sua ferramenta de trabalho.',
    iconName: 'Coins'
  },
  {
    id: 'minerador',
    slug: 'minerador',
    name: 'Minerador',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você trabalhou nas profundezas, extraindo riquezas da terra.',
    startingItems: ['Picareta', 'Lanterna'],
    skills: ['Atletismo', 'Fortitude'],
    availablePowers: ['Fortitude Maior', 'Vigoroso', 'Sentido de Direção'],
    originPowers: [
      {
        name: 'Visão na Penumbra',
        description: 'Você enxerga duas vezes mais longe em condições de pouca luz.'
      }
    ],
    description: 'A escuridão das minas e o peso das rochas forjaram sua resistência física.',
    iconName: 'Pickaxe'
  },
  {
    id: 'nomade',
    slug: 'nomade',
    name: 'Nômade',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você nunca teve um lar fixo, sempre em movimento.',
    startingItems: ['Cavalo ou camelo', 'Traje de viajante'],
    skills: ['Sobrevivência', 'Pilotagem'],
    availablePowers: ['Sentido de Direção', 'Rastreador', 'Viajante'],
    originPowers: [
      {
        name: 'Mochileiro',
        description: 'Sua carga máxima aumenta em +2 e você recebe +2 em testes de Sobrevivência para encontrar comida.'
      }
    ],
    description: 'O horizonte é seu único limite. Você aprendeu a se adaptar a qualquer lugar e a qualquer clima.',
    iconName: 'Map'
  },
  {
    id: 'selvagem',
    slug: 'selvagem',
    name: 'Selvagem',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você cresceu longe da civilização, em harmonia com a natureza.',
    startingItems: ['Arma simples de madeira', 'Traje de peles'],
    skills: ['Adestramento', 'Percepção', 'Sobrevivência'],
    availablePowers: ['Sentidos Aguçados', 'Vida na Selva', 'Instinto Primitivo'],
    originPowers: [
      {
        name: 'Vigiar a Natureza',
        description: 'Você recebe +2 em testes de Percepção e Sobrevivência em ambientes naturais.'
      }
    ],
    description: 'As leis dos homens não significam nada para você. Você segue os instintos e as leis da floresta.',
    iconName: 'Trees'
  },
  {
    id: 'soldado',
    slug: 'soldado',
    name: 'Soldado',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você serviu em um exército ou companhia mercenária.',
    startingItems: ['Arma marcial', 'Escudo pesado ou armadura leve'],
    skills: ['Fortitude', 'Guerra', 'Luta'],
    availablePowers: ['Combate Montado', 'Tiro Certeiro', 'Veterano'],
    originPowers: [
      {
        name: 'Disciplina Militar',
        description: 'Você recebe +2 em testes de Iniciativa e Fortitude.'
      }
    ],
    description: 'Marchas longas e o som das trombetas de guerra são sua realidade. Você sabe o valor da disciplina.',
    iconName: 'Sword'
  },
  {
    id: 'amigos-dos-animais',
    slug: 'amigos-dos-animais',
    name: 'Amigos dos Animais',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você cresceu cercado por animais e aprendeu a entendê-los.',
    startingItems: ['Cão de guarda ou cavalo', 'Traje de viajante'],
    skills: ['Adestramento', 'Cavalgar'],
    availablePowers: ['Amigo Especial', 'Cavaleiro Fiel', 'Ginete'],
    originPowers: [
      {
        name: 'Voz dos Bichos',
        description: 'Você pode falar com animais (como se estivesse sob efeito da magia Falar com Animais).'
      }
    ],
    description: 'Sua conexão com o mundo animal é mais forte do que com as pessoas. Eles são seus amigos mais leais.',
    iconName: 'PawPrint'
  },
  {
    id: 'amnesico',
    slug: 'amnesico',
    name: 'Amnésico',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você não se lembra de quem era, mas suas habilidades permanecem.',
    startingItems: ['Nenhum'],
    skills: ['Duas perícias quaisquer'],
    availablePowers: ['Dois poderes gerais quaisquer'],
    originPowers: [
      {
        name: 'Lembranças Perdidas',
        description: 'Uma vez por cena, você pode fazer um teste de uma perícia não treinada como se fosse treinado.'
      }
    ],
    description: 'O passado é um borrão, mas seu corpo e mente ainda guardam os reflexos de uma vida esquecida.',
    iconName: 'HelpCircle'
  },
  {
    id: 'aristocrata',
    slug: 'aristocrata',
    name: 'Aristocrata',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você nasceu em berço de ouro e foi educado para liderar.',
    startingItems: ['Traje de luxo', 'Joia de família (T$ 100)'],
    skills: ['Diplomacia', 'Nobreza'],
    availablePowers: ['Comandar', 'Riqueza', 'Sangue Azul'],
    originPowers: [
      {
        name: 'Sangue Azul',
        description: 'Você recebe +2 em testes de Diplomacia e Nobreza.'
      }
    ],
    description: 'Etiqueta, política e linhagem são seu mundo. Você sabe como se comportar nas cortes mais exigentes.',
    iconName: 'Gem'
  },
  {
    id: 'capanga',
    slug: 'capanga',
    name: 'Capanga',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você trabalhou como braço direito de criminosos ou cobrador de dívidas.',
    startingItems: ['Arma simples', 'Traje de viajante'],
    skills: ['Intimidação', 'Luta'],
    availablePowers: ['Assustar', 'Confundir', 'Intimidação'],
    originPowers: [
      {
        name: 'Confundir',
        description: 'Você pode usar a perícia Intimidação para fintar em combate.'
      }
    ],
    description: 'Sua presença é intimidadora e você sabe como usar a força para conseguir o que quer.',
    iconName: 'Grip'
  },
  {
    id: 'circense',
    slug: 'circense',
    name: 'Circense',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você viajou com uma trupe, encantando o público com suas proezas.',
    startingItems: ['Traje de artista', 'Item de malabarismo'],
    skills: ['Acrobacia', 'Atuação'],
    availablePowers: ['Acrobático', 'Atraente', 'Torcida'],
    originPowers: [
      {
        name: 'Truque de Mestre',
        description: 'Você recebe +2 em testes de Acrobacia e Atuação.'
      }
    ],
    description: 'A vida sob a lona ensinou a você agilidade e o valor de um bom espetáculo.',
    iconName: 'Tent'
  },
  {
    id: 'escravo',
    slug: 'escravo',
    name: 'Escravo',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você viveu sob o jugo de outro, mas agora é livre.',
    startingItems: ['Traje de escravo'],
    skills: ['Atletismo', 'Fortitude'],
    availablePowers: ['Fortitude Maior', 'Vontade de Ferro', 'Duro de Matar'],
    originPowers: [
      {
        name: 'Desejo de Liberdade',
        description: 'Você recebe +2 em testes de Vontade e Iniciativa.'
      }
    ],
    description: 'As correntes foram quebradas, mas as cicatrizes — físicas ou mentais — permanecem como lembrete de sua força.',
    iconName: 'Link'
  },
  {
    id: 'fazendeiro',
    slug: 'fazendeiro',
    name: 'Fazendeiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você gerenciava terras e animais, provendo sustento para muitos.',
    startingItems: ['Ferramenta agrícola', 'Animal de fazenda'],
    skills: ['Adestramento', 'Ofício (fazendeiro)'],
    availablePowers: ['Foco em Perícia', 'Vontade de Ferro', 'Água no Feijão'],
    originPowers: [
      {
        name: 'Água no Feijão',
        description: 'Você pode alimentar até o dobro de pessoas com uma mesma quantidade de comida.'
      }
    ],
    description: 'A terra é generosa para quem trabalha duro. Você conhece os ciclos da natureza e como tirar o melhor dela.',
    iconName: 'Sprout'
  },
  {
    id: 'forasteiro',
    slug: 'forasteiro',
    name: 'Forasteiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você veio de terras distantes e desconhecidas.',
    startingItems: ['Traje de viajante', 'Mapa regional'],
    skills: ['Conhecimento', 'Sobrevivência'],
    availablePowers: ['Foco em Perícia', 'Sentido de Direção', 'Viajante'],
    originPowers: [
      {
        name: 'Cultura Exótica',
        description: 'Você recebe +2 em testes de Conhecimento e Diplomacia ao lidar com estrangeiros.'
      }
    ],
    description: 'Seus costumes e sotaque são estranhos para os locais, mas sua visão de mundo é muito mais ampla.',
    iconName: 'Globe'
  },
  {
    id: 'heroi-campones',
    slug: 'heroi-campones',
    name: 'Herói Camponês',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você defendeu sua vila de uma ameaça e se tornou uma lenda local.',
    startingItems: ['Arma simples', 'Traje de camponês'],
    skills: ['Adestramento', 'Sobrevivência'],
    availablePowers: ['Coração Heróico', 'Sortudo', 'Torcida'],
    originPowers: [
      {
        name: 'Coração Heróico',
        description: 'Você recebe +2 pontos de vida e +1 ponto de mana.'
      }
    ],
    description: 'A coragem não vem do sangue nobre, mas da vontade de proteger o que é certo.',
    iconName: 'Star'
  },
  {
    id: 'marujo',
    slug: 'marujo',
    name: 'Marujo',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você serviu em navios, enfrentando tempestades e monstros marinhos.',
    startingItems: ['Corda', 'Traje de marinheiro'],
    skills: ['Atletismo', 'Pilotagem'],
    availablePowers: ['Equilíbrio de Combate', 'Natação', 'Lobo do Mar'],
    originPowers: [
      {
        name: 'Lobo do Mar',
        description: 'Você recebe +2 em testes de Atletismo e Pilotagem.'
      }
    ],
    description: 'O mar salgado corre em suas veias. Você se sente mais em casa no convés de um navio do que em terra firme.',
    iconName: 'Ship'
  },
  {
    id: 'mateiro',
    slug: 'mateiro',
    name: 'Mateiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você vive nas matas, caçando e rastreando.',
    startingItems: ['Arco curto', 'Traje de viajante'],
    skills: ['Furtividade', 'Sobrevivência'],
    availablePowers: ['Caminho do Caçador', 'Sentidos Aguçados', 'Rastreador'],
    originPowers: [
      {
        name: 'Caminho do Caçador',
        description: 'Você não sofre penalidade em deslocamento por terreno difícil.'
      }
    ],
    description: 'As florestas não têm segredos para você. Você se move como uma sombra entre as árvores.',
    iconName: 'Axe'
  },
  {
    id: 'membro-de-guilda',
    slug: 'membro-de-guilda',
    name: 'Membro de Guilda',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você faz parte de uma organização comercial ou profissional.',
    startingItems: ['Símbolo da guilda', 'Traje de viajante'],
    skills: ['Ofício', 'Diplomacia'],
    availablePowers: ['Foco em Perícia', 'Negociação', 'Rede de Contatos'],
    originPowers: [
      {
        name: 'Rede de Contatos',
        description: 'Você pode conseguir informações e itens com facilidade em cidades onde sua guilda atua.'
      }
    ],
    description: 'A união faz a força. Você tem o apoio de uma rede de profissionais que podem ajudar em sua jornada.',
    iconName: 'Key'
  },
  {
    id: 'pivete',
    slug: 'pivete',
    name: 'Pivete',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você cresceu nas ruas, sobrevivendo por conta própria.',
    startingItems: ['Roupa de mendigo', 'Faca'],
    skills: ['Furtividade', 'Ladinagem'],
    availablePowers: ['Aparência Inofensiva', 'Pivete', 'Sutileza'],
    originPowers: [
      {
        name: 'Pivete',
        description: 'Você recebe +2 em testes de Furtividade e Ladinagem.'
      }
    ],
    description: 'As ruas foram sua escola. Você aprendeu cedo a ser rápido, silencioso e esperto.',
    iconName: 'Baby'
  },
  {
    id: 'refugiado',
    slug: 'refugiado',
    name: 'Refugiado',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você fugiu de sua terra natal devido a guerra ou desastre.',
    startingItems: ['Traje de viajante', 'Lembrança de sua terra'],
    skills: ['Fortitude', 'Sobrevivência'],
    availablePowers: ['Fortitude Maior', 'Vontade de Ferro', 'Estoico'],
    originPowers: [
      {
        name: 'Estoico',
        description: 'Você recebe +2 em testes de Fortitude e Vontade.'
      }
    ],
    description: 'Você perdeu tudo, exceto sua vida e sua vontade de continuar. Sua resiliência é sua maior arma.',
    iconName: 'Footprints'
  },
  {
    id: 'seguidor',
    slug: 'seguidor',
    name: 'Seguidor',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você serviu a um mestre ou mentor, aprendendo com ele.',
    startingItems: ['Traje de viajante', 'Item de seu mestre'],
    skills: ['Adestramento', 'Ofício'],
    availablePowers: ['Foco em Perícia', 'Vontade de Ferro', 'Servidão Fiel'],
    originPowers: [
      {
        name: 'Servidão Fiel',
        description: 'Você recebe +2 em testes de Vontade e pode usar a ação ajudar como ação de movimento.'
      }
    ],
    description: 'Observar e servir ensinou a você lições valiosas. Agora é hora de trilhar seu próprio caminho.',
    iconName: 'UserPlus'
  },
  {
    id: 'taverneiro',
    slug: 'taverneiro',
    name: 'Taverneiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você serviu bebidas e ouviu histórias em uma taverna.',
    startingItems: ['Caneca de metal', 'Traje de taverneiro'],
    skills: ['Diplomacia', 'Jogatina'],
    availablePowers: ['Atraente', 'Negociação', 'Gorjeta'],
    originPowers: [
      {
        name: 'Gorjeta',
        description: 'Você pode gastar 1 PM para receber +2 em um teste de Diplomacia ou Jogatina.'
      }
    ],
    description: 'Você conhece todo tipo de gente e ouviu todo tipo de história. Nada mais surpreende você.',
    iconName: 'Beer'
  },
  {
    id: 'trabalhador',
    slug: 'trabalhador',
    name: 'Trabalhador',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você viveu de trabalhos braçais pesados.',
    startingItems: ['Ferramenta de trabalho', 'Traje de trabalhador'],
    skills: ['Atletismo', 'Fortitude'],
    availablePowers: ['Fortitude Maior', 'Vigoroso', 'Esforço Extra'],
    originPowers: [
      {
        name: 'Esforço Extra',
        description: 'Você pode gastar 1 PM para receber +2 em um teste de Atletismo ou Fortitude.'
      }
    ],
    description: 'O suor e o esforço físico constante forjaram um corpo resistente e uma mente disciplinada.',
    iconName: 'Briefcase'
  },
  {
    id: 'sua-propria-origem',
    slug: 'sua-propria-origem',
    name: 'Sua Própria Origem',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você teve uma criação única que não se encaixa em outros moldes.',
    startingItems: ['Dois itens quaisquer (total T$ 20)'],
    skills: ['Duas perícias quaisquer'],
    availablePowers: ['Um poder geral qualquer'],
    originPowers: [
      {
        name: 'Personalizado',
        description: 'Trabalhe com o mestre para definir um benefício único que reflita seu passado especial.'
      }
    ],
    description: 'Sua história é só sua. Seus talentos e recursos são fruto de circunstâncias extraordinárias.',
    iconName: 'Sparkles'
  }
];
