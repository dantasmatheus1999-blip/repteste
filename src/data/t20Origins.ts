import { T20OriginDetail } from '../types/origins';

export const T20_ORIGINS: T20OriginDetail[] = [
  {
    id: 'acolito',
    slug: 'acolito',
    name: 'Acólito',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Neste mundo agraciado com tantos deuses e igrejas, você ingressou cedo em uma ordem religiosa.',
    startingItems: ['Símbolo sagrado', 'Traje de sacerdote'],
    skills: ['Cura', 'Religião', 'Vontade'],
    availablePowers: ['Medicina', 'Membro da Igreja', 'Vontade de Ferro'],
    originPowers: [
      {
        name: 'Membro da Igreja',
        description: 'Você consegue hospedagem confortável e informação em qualquer templo de sua divindade, para você e seus aliados.'
      }
    ],
    description: 'Você passou boa parte de sua vida em um templo, monastério ou santuário, aprendendo as escrituras sagradas e prestando auxílio aos fiéis e sacerdotes.',
    iconName: 'Sparkles'
  },
  {
    id: 'amigo-dos-animais',
    slug: 'amigo-dos-animais',
    name: 'Amigo dos Animais',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Desde criança você tem facilidade em lidar com animais, sempre conversou com eles e sentiu ser capaz de compreendê-los.',
    startingItems: ['Cão de caça, cavalo, pônei ou trobo (escolha um)'],
    skills: ['Adestramento', 'Cavalgar'],
    availablePowers: ['Amigo Especial'],
    originPowers: [
      {
        name: 'Amigo Especial',
        description: 'Você recebe +5 em testes de Adestramento com animais. Além disso, possui um animal de estimação que o auxilia e o acompanha em suas aventuras. Em termos de jogo, é um parceiro que fornece +2 em uma perícia a sua escolha (exceto Luta ou Pontaria e aprovada pelo mestre) e não conta em seu limite de parceiros.'
      }
    ],
    description: 'Você sempre se deu melhor com bichos do que com pessoas. Compreende os instintos naturais e encontra companheirismo fiel nos animais de Arton.',
    iconName: 'Heart'
  },
  {
    id: 'amnesico',
    slug: 'amnesico',
    name: 'Amnésico',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você perdeu a maior parte da memória. Sabe apenas o próprio nome ou nem isso.',
    startingItems: ['Um ou mais itens (somando até T$ 500) aprovados pelo mestre'],
    skills: ['Uma perícia escolhida pelo mestre'],
    availablePowers: ['Um poder escolhido pelo mestre', 'Lembranças Graduais'],
    originPowers: [
      {
        name: 'Lembranças Graduais',
        description: 'Durante suas aventuras, em determinados momentos a critério do mestre, você pode fazer um teste de Sabedoria (CD 10) para reconhecer pessoas, criaturas ou lugares que tenha encontrado antes de perder a memória.'
      }
    ],
    description: 'Você acordou sem saber quem era, onde estava ou por que possui dons extraordinários. Cada aventura revela pistas sobre seu verdadeiro passado.',
    iconName: 'HelpCircle'
  },
  {
    id: 'aristocrata',
    slug: 'aristocrata',
    name: 'Aristocrata',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você nasceu na nobreza e recebeu educação sofisticada em assuntos acadêmicos, política mercantil ou corte.',
    startingItems: ['Joia de família no valor de T$ 300', 'Traje da corte'],
    skills: ['Diplomacia', 'Enganação', 'Nobreza'],
    availablePowers: ['Comandar', 'Sangue Azul'],
    originPowers: [
      {
        name: 'Sangue Azul',
        description: 'Você tem alguma influência política, suficiente para ser tratado com mais leniência pela guarda, conseguir uma audiência com o nobre local etc.'
      }
    ],
    description: 'Herdeiro de linhagem nobre, você aprendeu etiqueta, tática e oratória nos salões mais opulentos do Reinado.',
    iconName: 'Crown'
  },
  {
    id: 'artesao',
    slug: 'artesao',
    name: 'Artesão',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Treinado por um parente, mestre ou guilda para fabricar itens importantes no mundo civilizado.',
    startingItems: ['Instrumentos de ofício (qualquer)', 'Um item que você possa fabricar de até T$ 50'],
    skills: ['Ofício', 'Vontade'],
    availablePowers: ['Frutos do Trabalho', 'Sortudo'],
    originPowers: [
      {
        name: 'Frutos do Trabalho',
        description: 'No início de cada aventura, você recebe até 5 itens gerais que possa fabricar num valor total de até T$ 50. Esse valor aumenta para T$ 100 no patamar aventureiro, T$ 300 no heroico e T$ 500 no lenda.'
      }
    ],
    description: 'Você dedicou anos ao aprendizado de um ofício manual, dominando os segredos da manufatura de itens essenciais.',
    iconName: 'Hammer'
  },
  {
    id: 'artista',
    slug: 'artista',
    name: 'Artista',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você possui talento nato para entreter e produzir alimento para o coração e a alma.',
    startingItems: ['Estojo de disfarces ou um instrumento musical a sua escolha'],
    skills: ['Atuação', 'Enganação'],
    availablePowers: ['Atraente', 'Dom Artístico', 'Sortudo', 'Torcida'],
    originPowers: [
      {
        name: 'Dom Artístico',
        description: 'Você recebe +2 em testes de Atuação, e recebe o dobro de tibares em apresentações.'
      }
    ],
    description: 'Músico, ator, pintor ou bardo errante. Sua voz e seus dons expressivos atraem aplausos e favores por onde passa.',
    iconName: 'Music'
  },
  {
    id: 'assistente-de-laboratorio',
    slug: 'assistente-de-laboratorio',
    name: 'Assistente de Laboratório',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você atuou como ajudante para um alquimista, inventor ou mago, limpando o laboratório e recolhendo espécimes.',
    startingItems: ['Instrumentos de Ofício (alquimista)'],
    skills: ['Ofício (alquimista)', 'Misticismo'],
    availablePowers: ['Esse Cheiro...', 'Venefício', 'Um poder da Tormenta a sua escolha'],
    originPowers: [
      {
        name: 'Esse Cheiro...',
        description: 'Você recebe +2 em Fortitude e detecta automaticamente a presença (mas não a localização ou natureza) de itens alquímicos em alcance curto.'
      }
    ],
    description: 'Você sobreviveu a vapores cáusticos, pós mágicos e experimentos arriscados, desenvolvendo sentidos e resistências únicas.',
    iconName: 'FlaskConical'
  },
  {
    id: 'batedor',
    slug: 'batedor',
    name: 'Batedor',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Seja conduzindo caravanas ou rastreando inimigos, você aprendeu a achar caminhos e dirigir outros com segurança.',
    startingItems: ['Barraca', 'Equipamento de viagem', 'Uma arma simples ou marcial de ataque à distância'],
    skills: ['Furtividade', 'Percepção', 'Sobrevivência'],
    availablePowers: ['À Prova de Tudo', 'Estilo de Disparo', 'Sentidos Aguçados'],
    originPowers: [
      {
        name: 'À Prova de Tudo',
        description: 'Você não sofre penalidade em deslocamento e Sobrevivência por clima ruim e por terreno difícil natural.'
      }
    ],
    description: 'Especialista em patrulha avançada, cartografia de fronteiras e travessia segura de terrenos selvagens.',
    iconName: 'Compass'
  },
  {
    id: 'capanga',
    slug: 'capanga',
    name: 'Capanga',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Por ser grande, forte ou mal-encarado, você trabalhou como músculos para algum bandido ou guilda de ladrões.',
    startingItems: ['Tatuagem ou outro adereço de sua gangue (+1 em Intimidação)', 'Uma arma simples corpo a corpo'],
    skills: ['Luta', 'Intimidação'],
    availablePowers: ['Confissão', 'Um poder de combate a sua escolha'],
    originPowers: [
      {
        name: 'Confissão',
        description: 'Você pode usar Intimidação para interrogar sem custo e em uma hora (veja Investigação).'
      }
    ],
    description: 'Trabalhou como guarda-costas de chefes do crime, cobrador de dívidas ou leão de chácara em tavernas perigosas.',
    iconName: 'ShieldAlert'
  },
  {
    id: 'charlatao',
    slug: 'charlatao',
    name: 'Charlatão',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você sempre teve talento para resolver problemas com conversa, sincera ou nem tanto.',
    startingItems: ['Estojo de disfarces', 'Joia falsificada (valor aparente de T$ 100, sem valor real)'],
    skills: ['Enganação', 'Jogatina'],
    availablePowers: ['Alpinista Social', 'Aparência Inofensiva', 'Sortudo'],
    originPowers: [
      {
        name: 'Alpinista Social',
        description: 'Você pode substituir testes de Diplomacia por testes de Enganação.'
      }
    ],
    description: 'Com lábia afiada e olhar atento às fraquezas alheias, você sobreviveu vendendo ilusões e promessas mirabolantes.',
    iconName: 'Smile'
  },
  {
    id: 'circense',
    slug: 'circense',
    name: 'Circense',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você treinou acrobacia, malabarismo, mágica ou outra forma de arte de espetáculo sob a lona.',
    startingItems: ['Três bolas coloridas para malabarismo (+1 em Atuação)'],
    skills: ['Acrobacia', 'Atuação', 'Reflexos'],
    availablePowers: ['Acrobático', 'Torcida', 'Truque de Mágica'],
    originPowers: [
      {
        name: 'Truque de Mágica',
        description: 'Você pode lançar Explosão de Chamas, Hipnotismo e Queda Suave, mas apenas com o aprimoramento Truque. Esta não é uma habilidade mágica — os efeitos provêm de prestidigitação.'
      }
    ],
    description: 'Viajou por vilas e cidades encantando multidões com números arriscados, piruetas e truques manuais.',
    iconName: 'Flame'
  },
  {
    id: 'criminoso',
    slug: 'criminoso',
    name: 'Criminoso',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Por necessidade, ambição ou costume, você foi um bandido durante boa parte da juventude.',
    startingItems: ['Estojo de disfarces ou gazua'],
    skills: ['Enganação', 'Furtividade', 'Ladinagem'],
    availablePowers: ['Punguista', 'Venefício'],
    originPowers: [
      {
        name: 'Punguista',
        description: 'Você pode fazer testes de Ladinagem para sustento (como a perícia Ofício), mas em apenas um dia. Se passar, recebe o dobro do dinheiro, mas, se falhar, pode ter problemas com a lei (a critério do mestre).'
      }
    ],
    description: 'Criado nos becos escuros das grandes cidades, você aprendeu a viver à margem da lei sem ser capturado.',
    iconName: 'Key'
  },
  {
    id: 'curandeiro',
    slug: 'curandeiro',
    name: 'Curandeiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você é treinado em curar com remédios, bálsamos e tratamentos naturais sem precisar de magia divina.',
    startingItems: ['Bálsamo restaurador x2', 'Maleta de medicamentos'],
    skills: ['Cura', 'Vontade'],
    availablePowers: ['Medicina', 'Médico de Campo', 'Venefício'],
    originPowers: [
      {
        name: 'Médico de Campo',
        description: 'Você soma sua Sabedoria aos PV restaurados por suas habilidades e itens mundanos de cura.'
      }
    ],
    description: 'Médico rústico ou estudante do Colégio Real de Salistick, dedicou-se a aliviar o sofrimento dos feridos.',
    iconName: 'Cross'
  },
  {
    id: 'eremita',
    slug: 'eremita',
    name: 'Eremita',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você passou parte da vida isolado da sociedade, em comunhão com o silêncio e as forças místicas.',
    startingItems: ['Barraca', 'Equipamento de viagem'],
    skills: ['Misticismo', 'Religião', 'Sobrevivência'],
    availablePowers: ['Busca Interior', 'Lobo Solitário'],
    originPowers: [
      {
        name: 'Busca Interior',
        description: 'Quando você e seus companheiros estão diante de um mistério, incapazes de prosseguir, você pode gastar 1 PM para meditar sozinho durante algum tempo e receber uma dica do mestre.'
      }
    ],
    description: 'Você viveu em florestas esquecidas, cavernas ou montanhas inóspitas fortalecendo seu espírito longe da civilização.',
    iconName: 'Mountain'
  },
  {
    id: 'escravo',
    slug: 'escravo',
    name: 'Escravo',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você sobreviveu à opressão e ao cativeiro, jurando nunca mais permitir que tirem sua liberdade.',
    startingItems: ['Algemas', 'Uma ferramenta pesada (mesmas estatísticas de uma maça)'],
    skills: ['Atletismo', 'Fortitude', 'Furtividade'],
    availablePowers: ['Desejo de Liberdade', 'Vitalidade'],
    originPowers: [
      {
        name: 'Desejo de Liberdade',
        description: 'Ninguém voltará a torná-lo um escravo! Você recebe +5 em testes contra a manobra agarrar e efeitos de movimento.'
      }
    ],
    description: 'Você suportou grilhões e trabalho forçado até conquistar sua liberdade, forjando uma resiliência inabalável.',
    iconName: 'Shield'
  },
  {
    id: 'estudioso',
    slug: 'estudioso',
    name: 'Estudioso',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Longos anos de sua vida foram gastos em meio a livros, pergaminhos e bibliotecas antigas.',
    startingItems: ['Coleção de livros (+1 em Conhecimento, Guerra, Misticismo ou Nobreza, a sua escolha)'],
    skills: ['Conhecimento', 'Guerra', 'Misticismo'],
    availablePowers: ['Aparência Inofensiva', 'Palpite Fundamentado'],
    originPowers: [
      {
        name: 'Palpite Fundamentado',
        description: 'Você pode gastar 2 PM para substituir um teste de qualquer perícia originalmente baseada em Inteligência ou Sabedoria por um teste de Conhecimento.'
      }
    ],
    description: 'Rato de biblioteca, devorou tomos sobre a história, a magia, a guerra e os mistérios de Arton.',
    iconName: 'BookOpen'
  },
  {
    id: 'fazendeiro',
    slug: 'fazendeiro',
    name: 'Fazendeiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Cultivando a terra ou criando animais, você viveu em contato com o ritmo das estações e o trabalho rural.',
    startingItems: ['Carroça', 'Uma ferramenta agrícola (mesmas estatísticas de uma lança)', '10 rações de viagem', 'Um animal não combativo'],
    skills: ['Adestramento', 'Cavalgar', 'Ofício', 'Sobrevivência'],
    availablePowers: ['Água no Feijão', 'Ginete'],
    originPowers: [
      {
        name: 'Água no Feijão',
        description: 'Você não sofre a penalidade de –5 e não gasta matéria prima adicional para fabricar pratos para cinco pessoas.'
      }
    ],
    description: 'Você conhece a terra, o manejo dos animais e a resiliência necessária para lidar com o clima e o trabalho pesado.',
    iconName: 'Sun'
  },
  {
    id: 'forasteiro',
    slug: 'forasteiro',
    name: 'Forasteiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você veio de terras distantes além do Reinado, trazendo consigo costumes e visões de mundo exóticas.',
    startingItems: ['Equipamento de viagem', 'Instrumento musical exótico (+1 em uma perícia de Carisma aprovada pelo mestre)', 'Traje estrangeiro'],
    skills: ['Cavalgar', 'Pilotagem', 'Sobrevivência'],
    availablePowers: ['Cultura Exótica', 'Lobo Solitário'],
    originPowers: [
      {
        name: 'Cultura Exótica',
        description: 'Por sua diferente visão de mundo, você encontra soluções inesperadas. Você pode gastar 1 PM para fazer um teste de perícia somente treinada, mesmo sem ser treinado na perícia.'
      }
    ],
    description: 'Vindo dos desertos, mares do sul ou arquipélagos remotos, você traz tradições incompreendidas pelos locais.',
    iconName: 'Globe'
  },
  {
    id: 'gladiador',
    slug: 'gladiador',
    name: 'Gladiador',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você se envolveu no mundo dos torneios e arenas de combate, aprendendo a lutar diante de plateias.',
    startingItems: ['Uma arma marcial ou exótica', 'Um item sem valor recebido de um admirador'],
    skills: ['Atuação', 'Luta'],
    availablePowers: ['Atraente', 'Pão e Circo', 'Torcida', 'Um poder de combate a sua escolha'],
    originPowers: [
      {
        name: 'Pão e Circo',
        description: 'Por seu treino em combates de exibição, você sabe “bater sem machucar”. Pode escolher causar dano não letal sem sofrer a penalidade de –5.'
      }
    ],
    description: 'Lutador de arena treinado tanto na técnica marcial quanto no espetáculo dramático para entreter as arquibancadas.',
    iconName: 'Swords'
  },
  {
    id: 'guarda',
    slug: 'guarda',
    name: 'Guarda',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você atuou como agente da lei em uma vila ou cidade, patrulhando ruas e mantendo a ordem urbana.',
    startingItems: ['Apito', 'Insígnia da milícia', 'Uma arma marcial'],
    skills: ['Investigação', 'Luta', 'Percepção'],
    availablePowers: ['Detetive', 'Investigador', 'Um poder de combate a sua escolha'],
    originPowers: [
      {
        name: 'Detetive',
        description: 'Você pode gastar 1 PM para substituir testes de Percepção e Intuição por testes de Investigação até o fim da cena.'
      }
    ],
    description: 'Veterano das rondas da milícia urbana, você sabe como interrogar testemunhas e deter foras da lei.',
    iconName: 'ShieldCheck'
  },
  {
    id: 'herdeiro',
    slug: 'herdeiro',
    name: 'Herdeiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você pertence a uma linhagem tradicional ou aristocrática com grandes expectativas sobre seu futuro.',
    startingItems: ['Um símbolo de sua herança, como um anel de sinete ou manto cerimonial'],
    skills: ['Misticismo', 'Nobreza', 'Ofício'],
    availablePowers: ['Comandar', 'Herança'],
    originPowers: [
      {
        name: 'Herança',
        description: 'Você herdou um item de preço de até T$ 1.000. Você pode escolher este poder duas vezes, para um item de até T$ 2.000.'
      }
    ],
    description: 'Destinado a herdar bens, terras ou legados de seus antepassados, você carrega o peso e as regalias do nome de família.',
    iconName: 'Gem'
  },
  {
    id: 'heroi-campones',
    slug: 'heroi-campones',
    name: 'Herói Camponês',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você empunhou ferramentas simples para defender seu vilarejo e se tornou o campeão do povo.',
    startingItems: ['Instrumentos de ofício ou uma arma simples', 'Traje de plebeu'],
    skills: ['Adestramento', 'Ofício'],
    availablePowers: ['Coração Heroico', 'Sortudo', 'Surto Heroico', 'Torcida'],
    originPowers: [
      {
        name: 'Coração Heroico',
        description: 'Você recebe +3 pontos de mana. Quando atinge um novo patamar (no 5º, 11º e 17º níveis), recebe +3 PM.'
      }
    ],
    description: 'Defendeu seu povo contra monstros ou bandoleiros, tornando-se o símbolo vivo de esperança para os humildes.',
    iconName: 'Award'
  },
  {
    id: 'marujo',
    slug: 'marujo',
    name: 'Marujo',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você foi tripulante em uma embarcação que singrou os mares bravios ou rios de Arton.',
    startingItems: ['T$ 2d6 (seu último salário)', 'Corda'],
    skills: ['Atletismo', 'Jogatina', 'Pilotagem'],
    availablePowers: ['Acrobático', 'Passagem de Navio'],
    originPowers: [
      {
        name: 'Passagem de Navio',
        description: 'Você consegue transporte marítimo para você e seus aliados, sem custos, desde que todos paguem com trabalho (passar em pelo menos um teste de perícia adequado durante a viagem).'
      }
    ],
    description: 'Sua juventude foi forjada entre cordames, conveses balançantes sob tempestades e portos cheios de piratas.',
    iconName: 'Anchor'
  },
  {
    id: 'mateiro',
    slug: 'mateiro',
    name: 'Mateiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você aprendeu a abater animais selvagens para colocar comida na mesa e sobreviveu dos recursos da mata.',
    startingItems: ['Arco curto', 'Barraca', 'Equipamento de viagem', '20 flechas'],
    skills: ['Atletismo', 'Furtividade', 'Sobrevivência'],
    availablePowers: ['Lobo Solitário', 'Sentidos Aguçados', 'Vendedor de Carcaças'],
    originPowers: [
      {
        name: 'Vendedor de Carcaças',
        description: 'Você pode extrair recursos de criaturas em um minuto, em vez de uma hora, e recebe +5 no teste.'
      }
    ],
    description: 'Rastreador e caçador florestal que conhece cada trilha, esconderijo e toca da mata.',
    iconName: 'Trees'
  },
  {
    id: 'membro-de-guilda',
    slug: 'membro-de-guilda',
    name: 'Membro de Guilda',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você foi ou é membro atuante em uma grande guilda mercantil, de artesãos ou de aventureiros.',
    startingItems: ['Gazua ou instrumentos de ofício'],
    skills: ['Diplomacia', 'Enganação', 'Misticismo', 'Ofício'],
    availablePowers: ['Foco em Perícia', 'Rede de Contatos'],
    originPowers: [
      {
        name: 'Rede de Contatos',
        description: 'Graças à influência de sua guilda, você pode usar Diplomacia para interrogar sem custo e em uma hora (veja Investigação).'
      }
    ],
    description: 'Apoiado pelos acordos e contatos de uma influente corporação de ofício ou comércio.',
    iconName: 'Users'
  },
  {
    id: 'mercador',
    slug: 'mercador',
    name: 'Mercador',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Comerciante experiente que aprendeu a negociar caravanas e mercadorias nos grandes bazares.',
    startingItems: ['Carroça', 'Trobo', 'Mercadorias para vender no valor de T$ 100'],
    skills: ['Diplomacia', 'Intuição', 'Ofício'],
    availablePowers: ['Negociação', 'Proficiência', 'Sortudo'],
    originPowers: [
      {
        name: 'Negociação',
        description: 'Você pode vender itens 10% mais caro (não cumulativo com barganha).'
      }
    ],
    description: 'Viajou pelos mercados e feiras de Arton acumulando lucros e negociando itens de toda sorte.',
    iconName: 'Coins'
  },
  {
    id: 'minerador',
    slug: 'minerador',
    name: 'Minerador',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você mergulhou nas profundezas da terra extraindo metais preciosos e gemas reluzentes.',
    startingItems: ['Gemas preciosas no valor de T$ 100', 'Picareta'],
    skills: ['Atletismo', 'Fortitude', 'Ofício (minerador)'],
    availablePowers: ['Ataque Poderoso', 'Escavador', 'Sentidos Aguçados'],
    originPowers: [
      {
        name: 'Escavador',
        description: 'Você se torna proficiente em picaretas, causa +1 de dano com elas e não é afetado por terreno difícil em masmorras e subterrâneos.'
      }
    ],
    description: 'Braços fortes forjados no pó das galerias de mineração, acostumado à escuridão subterrânea.',
    iconName: 'Pickaxe'
  },
  {
    id: 'nomade',
    slug: 'nomade',
    name: 'Nômade',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você nunca pertenceu a um só lugar, viajando constantemente sob o céu aberto.',
    startingItems: ['Bordão', 'Equipamento de viagem'],
    skills: ['Cavalgar', 'Pilotagem', 'Sobrevivência'],
    availablePowers: ['Lobo Solitário', 'Mochileiro', 'Sentidos Aguçados'],
    originPowers: [
      {
        name: 'Mochileiro',
        description: 'Seu limite de carga aumenta em 5 espaços.'
      }
    ],
    description: 'Seu lar são as estradas e os ermos, sem raízes ou fronteiras fixas.',
    iconName: 'Compass'
  },
  {
    id: 'pivete',
    slug: 'pivete',
    name: 'Pivete',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Criança de rua que aprendeu cedo a sobreviver em grandes metrópoles pedindo ou roubando.',
    startingItems: ['Gazua', 'Traje de plebeu', 'Um animal urbano (como um cão, gato, rato ou pombo)'],
    skills: ['Furtividade', 'Iniciativa', 'Ladinagem'],
    availablePowers: ['Acrobático', 'Aparência Inofensiva', 'Quebra-Galho'],
    originPowers: [
      {
        name: 'Quebra-Galho',
        description: 'Em cidades ou metrópoles, você pode comprar qualquer item mundano não superior por metade do preço normal. Esses itens não podem ser matérias-primas e não podem ser revendidos (são velhos, sujos, furtados...).'
      }
    ],
    description: 'Rápido e sagaz pelas vielas escuras, você aprendeu cada atalho e brecha da guarda urbana.',
    iconName: 'UserCheck'
  },
  {
    id: 'refugiado',
    slug: 'refugiado',
    name: 'Refugiado',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Sobrevivente tenaz de guerras, pragas ou catástrofes que devastaram sua terra natal.',
    startingItems: ['Um item estrangeiro de até T$ 100'],
    skills: ['Fortitude', 'Reflexos', 'Vontade'],
    availablePowers: ['Estoico', 'Vontade de Ferro'],
    originPowers: [
      {
        name: 'Estoico',
        description: 'Sua condição de descanso é uma categoria acima do padrão pela situação (normal em condições ruins, confortável em condições normais e luxuosa em condições confortáveis ou melhores). Veja as regras de recuperação na página 106.'
      }
    ],
    description: 'Você suportou privações extremas e sobreviveu a massacres, forjando uma vontade inquebrantável.',
    iconName: 'Shield'
  },
  {
    id: 'seguidor',
    slug: 'seguidor',
    name: 'Seguidor',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você viveu algum tempo a serviço de um grande herói ou mestre como escudeiro ou ajudante.',
    startingItems: ['Um item recebido de seu mestre de até T$ 100'],
    skills: ['Adestramento', 'Ofício'],
    availablePowers: ['Antigo Mestre', 'Proficiência', 'Surto Heroico'],
    originPowers: [
      {
        name: 'Antigo Mestre',
        description: 'Você ainda mantém contato com o herói que costumava servir. Uma vez por aventura, ele surge para ajudá-lo por uma cena. Ele é um parceiro mestre de um tipo a sua escolha (definido ao obter este poder) que não conta em seu limite de aliados.'
      }
    ],
    description: 'Absorveu conselhos e técnicas de uma lenda viva antes de ingressar em sua própria carreira.',
    iconName: 'Users'
  },
  {
    id: 'selvagem',
    slug: 'selvagem',
    name: 'Selvagem',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Criado em tribos distantes ou ermos intocados, distante dos costumes artificiais das cidades.',
    startingItems: ['Uma arma simples', 'Um pequeno animal de estimação como um pássaro ou esquilo'],
    skills: ['Percepção', 'Reflexos', 'Sobrevivência'],
    availablePowers: ['Lobo Solitário', 'Vida Rústica', 'Vitalidade'],
    originPowers: [
      {
        name: 'Vida Rústica',
        description: 'Você come coisas que fariam um avestruz vomitar (sendo imune a efeitos prejudiciais de itens ingeríveis) e também consegue descansar nos lugares mais desconfortáveis (mesmo dormindo ao relento, sua recuperação de PV e PM nunca é inferior a seu próprio nível).'
      }
    ],
    description: 'Instintos aguçados e resistência forjada na terra bruta de Arton.',
    iconName: 'Flame'
  },
  {
    id: 'soldado',
    slug: 'soldado',
    name: 'Soldado',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Treinado na disciplina militar de grandes exércitos ou companhias de infantaria.',
    startingItems: ['Uma arma marcial', 'Um uniforme militar', 'Uma insígnia de seu exército'],
    skills: ['Fortitude', 'Guerra', 'Luta', 'Pontaria'],
    availablePowers: ['Influência Militar', 'Um poder de combate a sua escolha'],
    originPowers: [
      {
        name: 'Influência Militar',
        description: 'Você fez amigos nas forças armadas. Onde houver acampamentos ou bases militares, você pode conseguir hospedagem e informações para você e seus aliados.'
      }
    ],
    description: 'Veterano de marchas e formações cerradas de combate sob chuva de flechas.',
    iconName: 'Shield'
  },
  {
    id: 'taverneiro',
    slug: 'taverneiro',
    name: 'Taverneiro',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Você trabalhou ou foi dono de estalagem, ouvindo bravatas e negociando com aventureiros.',
    startingItems: ['Rolo de macarrão ou martelo de carne (mesmas estatísticas de uma clava)', 'Uma panela', 'Um avental', 'Uma caneca e um pano sujo'],
    skills: ['Diplomacia', 'Jogatina', 'Ofício (cozinheiro)'],
    availablePowers: ['Gororoba', 'Proficiência', 'Vitalidade'],
    originPowers: [
      {
        name: 'Gororoba',
        description: 'Você não sofre a penalidade de –5 para fabricar um prato especial adicional.'
      }
    ],
    description: 'Atrás do balcão ou nas mesas de jogo, você ouviu os maiores boatos e aprendeu a alimentar heróis.',
    iconName: 'Coffee'
  },
  {
    id: 'trabalhador',
    slug: 'trabalhador',
    name: 'Trabalhador',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Trabalhou duro em construções, fazendas ou portos, empilhando cargas com força bruta.',
    startingItems: ['Uma ferramenta pesada (mesmas estatísticas de uma maça ou lança, a sua escolha)'],
    skills: ['Atletismo', 'Fortitude'],
    availablePowers: ['Atlético', 'Esforçado'],
    originPowers: [
      {
        name: 'Esforçado',
        description: 'Você não teme trabalho duro, nem prazos apertados. Você recebe um bônus de +2 em todos os testes de perícias estendidos (incluindo perigos complexos).'
      }
    ],
    description: 'Músculos forjados no transporte de fardos pesados e na labuta diária contínua.',
    iconName: 'Activity'
  },
  {
    id: 'sua-propria-origem',
    slug: 'sua-propria-origem',
    name: 'Sua Própria Origem',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Regra oficial de customização para criar uma origem sob medida para seu personagem.',
    startingItems: ['Equipamento inicial no valor total de até T$ 100 com aprovação do mestre'],
    skills: ['Duas perícias quaisquer ou uma perícia e um poder geral'],
    availablePowers: ['Poder geral adequado ao histórico'],
    originPowers: [
      {
        name: 'Origem Personalizada',
        description: 'Conforme a regra da página 95 do livro-base, o jogador pode negociar com o mestre duas perícias, dois poderes ou uma perícia e um poder geral condizentes com seu histórico pregresso.'
      }
    ],
    description: 'Opção oficial de customização para personagens com trajetórias exclusivas.',
    iconName: 'Sparkles'
  }
];
