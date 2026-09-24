import { T20DeityDetail } from '../types/deities';

export const T20_DEITIES: T20DeityDetail[] = [
  {
    id: 'aharadak',
    slug: 'aharadak',
    name: 'Aharadak',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus da Tormenta, da Loucura e da Não-Criação.',
    description: 'Outrora um dos terríveis Lordes da Tormenta, esta aberração monstruosa ambicionava o grande poder divino oferecido pelos devotos de Arton. Após anos liderando seu próprio culto profano, Aharadak matou Tauron, o Deus da Força, e ascendeu como o novo e macabro Deus da Tormenta.',
    iconName: 'Skull',
    beliefsAndGoals: 'Reverenciar a Tormenta, apregoar a inevitabilidade de sua chegada ao mundo. Praticar a devassidão e a perversão. Deturpar tudo que é correto, desfigurar tudo que é normal. Abraçar a agonia, crueldade e loucura.',
    sacredSymbol: 'Um olho macabro de pupila vertical e cercado de espinhos.',
    channelDivinity: 'Negativa',
    favoredWeapon: 'Corrente de espinhos',
    devotees: 'Quaisquer. A Tormenta aceita tudo e todos.',
    obligationsAndRestrictions: [
      'Quase todos os cultistas de Aharadak são maníacos insanos, compelidos a praticar os atos mais abomináveis. No entanto, talvez devido à natureza alienígena e incompreensível deste deus, alguns devotos conseguem se resguardar. Preservam sua humanidade, abstendo-se de cometer crimes ou profanações. Ainda assim, o devoto paga um preço. No início de qualquer cena de ação, role 1d6. Com um resultado ímpar, você fica fascinado na primeira rodada, perdido em devaneios sobre a futilidade da vida (mesmo que seja imune a esta condição).'
    ],
    grantedPowerIds: [
      'afinidade-com-a-tormenta',
      'extase-da-loucura',
      'percepcao-temporal',
      'rejeicao-divina'
    ]
  },
  {
    id: 'allihanna',
    slug: 'allihanna',
    name: 'Allihanna',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deusa da Natureza, da Vida Selvagem e dos Animais.',
    description: 'A Deusa da Natureza representa a bondade inerente ao mundo natural, a pureza das plantas e animais. Mesmo os animais predadores são considerados puros, inocentes — pois matam apenas para sobreviver, ao contrário dos monstros e seres civilizados.',
    iconName: 'Trees',
    beliefsAndGoals: 'Reverenciar os seres da natureza. Proteger a vida selvagem. Promover harmonia entre a natureza e a civilização. Combater monstros, mortos-vivos e outras criaturas que perturbam o equilíbrio natural.',
    sacredSymbol: 'Para bárbaros e outros adoradores de animais, o símbolo corresponde ao respectivo animal. Para outros, uma pequena árvore.',
    channelDivinity: 'Positiva',
    favoredWeapon: 'Bordão',
    devotees: 'Dahllan, elfos, sílfides, bárbaros, caçadores, druidas.',
    obligationsAndRestrictions: [
      'Devotos de Allihanna não podem usar armaduras e escudos feitos de metal. Assim, você só pode usar armadura acolchoada, de couro, gibão de peles e escudo leve, ou itens feitos de materiais especiais não metálicos.',
      'Devotos de Allihanna não podem descansar em nenhuma comunidade maior que uma aldeia (não perdem seus poderes, mas também não recuperam pontos de vida ou mana). Por isso, sempre preferem o relento a um quarto de estalagem.'
    ],
    grantedPowerIds: [
      'compreender-os-ermos',
      'dedo-verde',
      'descanso-natural',
      'voz-da-natureza'
    ]
  },
  {
    id: 'arsenal',
    slug: 'arsenal',
    name: 'Arsenal',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus da Guerra, da Conquista e da Superioridade Marcial.',
    description: 'Outrora um infame clérigo guerreiro, o vilão conhecido apenas como Mestre Arsenal se tornou sumo-sacerdote do violento deus Keenn. No entanto, após uma longa campanha que envolveu a conquista da mais poderosa espada mágica de Arton, o clérigo derrotou seu próprio patrono em combate durante um torneio épico, ascendendo ao Panteão como o novo Deus da Guerra.',
    iconName: 'Swords',
    beliefsAndGoals: 'Promover a guerra e o conflito. Vencer a qualquer custo, pela força ou estratégia. Jamais oferecer ou aceitar rendição. Eliminar as próprias fraquezas. Conhecer o inimigo como a si mesmo. Sempre encontrar condições de vitória; quando não existirem, criá-las.',
    sacredSymbol: 'Um martelo de guerra e uma espada longa cruzados sobre um escudo.',
    channelDivinity: 'Qualquer',
    favoredWeapon: 'Martelo de guerra',
    devotees: 'Anões, minotauros, bárbaros, cavaleiros, guerreiros, lutadores.',
    obligationsAndRestrictions: [
      'Um devoto de Arsenal é proibido de ser derrotado em qualquer tipo de combate ou disputa (como um teste oposto para ver quem é mais forte). Caso seu grupo seja derrotado, isso também constitui uma violação das obrigações.'
    ],
    grantedPowerIds: [
      'conjurar-arma',
      'coragem-total',
      'fe-guerreira',
      'sangue-de-ferro'
    ]
  },
  {
    id: 'azgher',
    slug: 'azgher',
    name: 'Azgher',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus do Sol, do Fogo e da Vigilância Divina.',
    description: 'Venerado pelos povos do Deserto da Perdição, o Deus-Sol é também cultuado por viajantes, mercadores honestos e todos aqueles que combatem as trevas. É um deus generoso; sua jornada diária derrama calor e conforto sobre Arton.',
    iconName: 'Sun',
    beliefsAndGoals: 'Praticar a gratidão pela proteção e generosidade do sol. Promover a honestidade, expor embustes e mentiras. Praticar a caridade e o altruísmo. Proteger os necessitados. Oferecer clemência, perdão e redenção. Combater o mal.',
    sacredSymbol: 'Um sol dourado.',
    channelDivinity: 'Positiva',
    favoredWeapon: 'Cimitarra',
    devotees: 'Aggelus, qareen, arcanistas, bárbaros, caçadores, cavaleiros, guerreiros, nobres, paladinos.',
    obligationsAndRestrictions: [
      'O devoto de Azgher deve manter o rosto sempre coberto (com uma máscara, capuz ou trapos). Sua face pode ser revelada apenas ao sumo-sacerdote ou em seu funeral.',
      'Devotos do Sol também devem doar para a igreja de Azgher 20% de qualquer tesouro obtido. Essa doação deve ser feita em ouro, seja na forma de moedas ou itens.'
    ],
    grantedPowerIds: [
      'espada-solar',
      'fulgor-solar',
      'habitante-do-deserto',
      'inimigo-de-tenebra'
    ]
  },
  {
    id: 'hyninn',
    slug: 'hyninn',
    name: 'Hyninn',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus da Trapaça, da Astúcia e dos Ladrões.',
    description: 'Capaz de enganar até mesmo outros deuses, o ardiloso Deus da Trapaça é uma divindade favorita de foras da lei — seus clérigos atuam como conselheiros, ou até mesmo líderes, em guildas criminosas ou navios piratas.',
    iconName: 'Smile',
    beliefsAndGoals: 'Praticar a astúcia e a esperteza. Demonstrar que honestidade e sinceridade levam ao fracasso. Desafiar a lei e a ordem. Ser vitorioso sem seguir regras. Fazer aos outros antes que façam a você. Levar vantagem em tudo.',
    sacredSymbol: 'Uma adaga atravessando uma máscara, ou uma raposa.',
    channelDivinity: 'Qualquer',
    favoredWeapon: 'Adaga',
    devotees: 'Hynne, goblins, sílfides, bardos, bucaneiros, ladinos, inventores, nobres.',
    obligationsAndRestrictions: [
      'Um devoto de Hyninn não recusa participação em um golpe, trapaça ou artimanha (o que muitas vezes inclui missões para roubar... hã, resgatar tesouros), exceto quando prejudica seus próprios aliados.',
      'O devoto também deve fazer um ato furtivo, ousado ou proibido por dia (ou por sessão de jogo, o que demorar mais), como oferenda a Hyninn. Roubar uma bolsa, enganar um miliciano, invadir o quarto de um nobre... Em termos de jogo, uma ação exigindo um teste de Enganação ou Ladinagem com CD mínima 15 + metade do seu nível.'
    ],
    grantedPowerIds: [
      'apostar-com-o-trapaceiro',
      'farsa-do-fingidor',
      'forma-de-macaco',
      'golpista-divino'
    ]
  },
  {
    id: 'kallyadranoch',
    slug: 'kallyadranoch',
    name: 'Kallyadranoch',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus dos Dragões, do Poder e da Tirania Elemental.',
    description: 'Como punição imposta por Khalmyr pelo crime de criar a Tormenta, o Deus dos Dragões estava esquecido até poucos anos atrás, conhecido apenas como “o Terceiro”. Restaurado em tempos recentes durante um combate épico contra os invasores aberrantes, Kallyadranoch agora governa não apenas os dragões, mas todos que cultuam o poder elemental das grandes feras.',
    iconName: 'Flame',
    beliefsAndGoals: 'Praticar a soberania. Demonstrar orgulho, superioridade, majestade. Praticar o acúmulo de riquezas. Proteger suas posses e sua dignidade. Ser implacável com seus inimigos. Reverenciar os dragões e suas crias.',
    sacredSymbol: 'Escamas de cinco cores diferentes.',
    channelDivinity: 'Negativa',
    favoredWeapon: 'Lança',
    devotees: 'Elfos, medusas, sulfure, arcanistas, cavaleiros, guerreiros, lutadores, nobres.',
    obligationsAndRestrictions: [
      'Para subir de nível, além de acumular XP suficiente, o devoto de Kally deve realizar uma oferenda em tesouro. O valor é igual à 20% da diferença do dinheiro inicial do nível que vai alcançar para o nível atual (por exemplo, T$ 80 para subir para o 4° nível). Sabe-se, também, de devotos malignos que sacrificam vítimas a Kally (não permitido para personagens jogadores).'
    ],
    grantedPowerIds: [
      'aura-de-medo',
      'escamas-draconicas',
      'presas-primordiais',
      'servos-do-dragao'
    ]
  },
  {
    id: 'khalmyr',
    slug: 'khalmyr',
    name: 'Khalmyr',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus da Justiça, da Ordem e dos Cavaleiros.',
    description: 'Antigo líder do Panteão, o Deus da Justiça já foi considerado a divindade mais popular no Reinado. As duas maiores ordens de cavaleiros em Arton foram criadas em sua honra: a Ordem da Luz e a Ordem de Khalmyr. Esta é também uma das divindades principais dos anões, junto de Tenebra.',
    iconName: 'Scale',
    beliefsAndGoals: 'Praticar a caridade e o altruísmo. Defender a lei, a ordem e os necessitados. Combater a mentira, o crime e o mal. Oferecer clemência, perdão e redenção. Lutar o bom combate.',
    sacredSymbol: 'Espada sobreposta a uma balança.',
    channelDivinity: 'Positiva',
    favoredWeapon: 'Espada longa',
    devotees: 'Aggelus, anões, cavaleiros, guerreiros, nobres, paladinos.',
    obligationsAndRestrictions: [
      'Devotos de Khalmyr não podem recusar pedidos de ajuda de pessoas inocentes. Também devem cumprir as ordens de superiores na hierarquia da igreja (devotos do Deus da Justiça de nível maior) e só podem usar itens mágicos permanentes criados por devotos do mesmo deus.'
    ],
    grantedPowerIds: [
      'coragem-total',
      'dom-da-verdade',
      'espada-justiceira',
      'reparar-injustica'
    ]
  },
  {
    id: 'lena',
    slug: 'lena',
    name: 'Lena',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deusa da Vida, da Fertilidade e da Cura Suprema.',
    description: 'Mesmo os deuses mais violentos e cruéis são respeitosos com a Deusa Criança, provedora da fertilidade, do sustento, da própria vida. Servida quase exclusivamente por mulheres, a Deusa da Vida oferece os mais poderosos milagres de cura presenciados em Arton.',
    iconName: 'Heart',
    beliefsAndGoals: 'Reverenciar e proteger a vida em todas as suas formas. Reverenciar a fertilidade, a fecundidade, a maternidade e a infância. Praticar a caridade e o altruísmo. Oferecer clemência, perdão e redenção. Aliviar a dor e o sofrimento físico, mental ou espiritual.',
    sacredSymbol: 'Lua crescente prateada.',
    channelDivinity: 'Positiva',
    favoredWeapon: 'Não há. Servos desta deusa não podem lançar a magia Arma Espiritual e similares.',
    devotees: 'Dahllan, qareen, nobres, paladinos.',
    obligationsAndRestrictions: [
      'Devotos de Lena não podem causar dano letal ou perda de PV a criaturas vivas (fornecer bônus em dano letal também é proibido). Podem causar dano não letal e prejudicar seus inimigos (em termos de jogo, impondo condições), desde que não causem dano letal ou perda de PV. Para um devoto de Lena, é preferível perder a própria vida a tirá-la de outros.',
      'Apenas mulheres podem ser devotas de Lena. Uma clériga precisa dar à luz pelo menos uma vez antes de receber seus poderes divinos. A fecundação é um mistério bem guardado pelas sacerdotisas; conta-se que a própria deusa vem semear suas discípulas. Paladinos de Lena podem ser homens (são os únicos devotos masculinos permitidos) ou mulheres.'
    ],
    grantedPowerIds: [
      'ataque-piedoso',
      'aura-restauradora',
      'cura-gentil',
      'curandeira-perfeita'
    ]
  },
  {
    id: 'lin-wu',
    slug: 'lin-wu',
    name: 'Lin-Wu',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus da Honra, da Tradição e dos Samurais de Tamu-ra.',
    description: 'Mesmo com a quase extinção de seu povo pela Tormenta, o honrado Deus Samurai nunca fraquejou, nunca perdeu sua dignidade. Hoje, o Império de Jade está livre da tempestade e seus habitantes retornam para a grande reconstrução.',
    iconName: 'Shield',
    beliefsAndGoals: 'Promover a honra acima de tudo. Proteger Tamu-ra e o Reinado de Arton. Praticar honestidade, coragem, cortesia e compaixão. Demonstrar integridade e dignidade. Ser leal a seus companheiros. Buscar redenção após cometer desonra.',
    sacredSymbol: 'Placa de metal com a silhueta de um dragão-serpente celestial.',
    channelDivinity: 'Qualquer',
    favoredWeapon: 'Katana',
    devotees: 'Anões, cavaleiros, guerreiros, nobres, paladinos.',
    obligationsAndRestrictions: [
      'Antigas proibições quanto a devotos estrangeiros ou do gênero feminino não mais se aplicam. No entanto, devotos de Lin-Wu ainda devem demonstrar comportamento honrado, jamais recorrendo a mentiras e subterfúgios. Em termos de jogo, são proibidos de tentar qualquer ação que exigiria um teste de Enganação, Furtividade ou Ladinagem.'
    ],
    grantedPowerIds: [
      'coragem-total',
      'kiai-divino',
      'mente-vazia',
      'tradicao-de-lin-wu'
    ]
  },
  {
    id: 'marah',
    slug: 'marah',
    name: 'Marah',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deusa da Paz, do Amor e da Harmonia Universal.',
    description: 'Neste mundo sempre em guerra, devotos da Deusa da Paz talvez sejam os mais corajosos e perseverantes, buscando inspiração em sua padroeira para proteger Arton sem usar de violência.',
    iconName: 'Heart',
    beliefsAndGoals: 'Praticar o amor e a gratidão pela vida e pela bondade. Promover a paz, harmonia e felicidade. Aliviar a dor e o sofrimento, trazer conforto aos aflitos. Praticar a caridade e o altruísmo. Oferecer clemência, perdão e redenção.',
    sacredSymbol: 'Um coração vermelho.',
    channelDivinity: 'Positiva',
    favoredWeapon: 'Não há. Devotos desta deusa não podem lançar a magia Arma Espiritual e similares.',
    devotees: 'Aggelus, elfos, hynne, qareen, bardos, nobres, paladinos.',
    obligationsAndRestrictions: [
      'Devotos de Marah não podem causar dano, perda de PV e condições a criaturas, exceto enfeitiçado, fascinado e pasmo (fornecer bônus em dano também é proibido). Em combate, só podem recorrer a ações como proteger ou curar — ou fugir, render-se ou aceitar a morte. Um devoto de Marah jamais vai causar violência, nem mesmo para se salvar.'
    ],
    grantedPowerIds: [
      'aura-de-paz',
      'dom-da-esperanca',
      'palavras-de-bondade',
      'talento-artistico'
    ]
  },
  {
    id: 'megalokk',
    slug: 'megalokk',
    name: 'Megalokk',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus dos Monstros, da Fúria e dos Predadores.',
    description: 'O Deus dos Monstros é uma divindade de selvageria e descontrole — quando bárbaros entram em fúria, diz-se que estão apenas canalizando seu rancor primordial. Enquanto servos de Allihanna promovem harmonia entre a natureza e os povos civilizados, devotos de seu irmão sanguinário buscam apenas a soberania do mais forte.',
    iconName: 'Flame',
    beliefsAndGoals: 'Praticar a violência, a soberania do mais forte. Jamais reprimir os próprios instintos e desejos. Jamais ser domado, desafiar qualquer forma de controle. Jamais oferecer perdão ou rendição. Eliminar os fracos. Destruir seus inimigos.',
    sacredSymbol: 'A garra de um monstro.',
    channelDivinity: 'Negativa',
    favoredWeapon: 'Maça',
    devotees: 'Goblins, medusas, minotauros, sulfure, trogs, bárbaros, caçadores, druidas, lutadores.',
    obligationsAndRestrictions: [
      'Devotos de Megalokk devem rejeitar os modos civilizados e se entregar à ferocidade, descontrole e impaciência. Você é proibido de usar perícias baseadas em Inteligência ou Carisma (exceto Adestramento e Intimidação) e não pode preparar uma ação, escolher 10 ou 20 em testes e lançar magias sustentadas (pois são ações que exigem foco e paciência).'
    ],
    grantedPowerIds: [
      'olhar-amedrontador',
      'presas-primordiais',
      'urro-divino',
      'voz-dos-monstros'
    ]
  },
  {
    id: 'nimb',
    slug: 'nimb',
    name: 'Nimb',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus do Caos, da Sorte, do Azar e da Loucura.',
    description: '“Khalmyr tem o tabuleiro, mas quem move as peças é Nimb”. Nada é certo sobre esta entidade do acaso, sorte e azar. Nimb é mais temido do que venerado pelos artonianos, cautelosos quanto a suas constantes mudanças de humor.',
    iconName: 'HelpCircle',
    beliefsAndGoals: 'Reverenciar o caos, a aleatoriedade, a sorte e o azar. Praticar a ousadia e a rebeldia, desafiar regras e leis. Rejeitar o bom senso. Tornar o mundo mais interessante. Ou divertido. Ou terrível. Ou não.',
    sacredSymbol: 'Um dado de seis faces.',
    channelDivinity: 'Qualquer',
    favoredWeapon: 'Nenhuma e todas! Ao usar um efeito que dependa de arma preferida, qualquer arma (ou outro objeto!) pode aparecer, de acordo com o mestre.',
    devotees: 'Goblins, qareen, sílfides, arcanistas, bárbaros, bardos, bucaneiros, inventores, ladinos.',
    obligationsAndRestrictions: [
      'Por serem incapazes de seguir regras, estes devotos não têm “obrigações” verdadeiras (portanto, nunca perdem PM por descumprirem suas O&R). No entanto, sofrem certas restrições que não podem ignorar. Devotos de Nimb são loucos (ou agem como se fossem), não conseguindo convencer ninguém de coisa alguma. Você sofre –5 em testes de perícias baseadas em Carisma. Além disso, no início de cada cena de ação, role 1d6. Com um resultado 1, você fica confuso (mesmo que seja imune a esta condição).'
    ],
    grantedPowerIds: [
      'extase-da-loucura',
      'poder-oculto',
      'sorte-dos-loucos',
      'transmissao-da-loucura'
    ]
  },
  {
    id: 'oceano',
    slug: 'oceano',
    name: 'Oceano',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus dos Mares, das Águas e das Profundezas.',
    description: 'Nestes tempos de grande tumulto no plano divino, o Deus dos Mares está entre os poucos ainda imutáveis. O Oceano é sereno, pleno em si mesmo, alienado dos conflitos no Panteão, recebendo preces de marinheiros, piratas e povos marinhos.',
    iconName: 'Waves',
    beliefsAndGoals: 'Reverenciar os mares, o oceano e os seres que ali habitam. Promover harmonia entre o oceano e o mundo seco. Proteger os seres marinhos, mas também os seres do mundo seco que se aventuram sobre as ondas. Demandar devido respeito ao mar e seu poder.',
    sacredSymbol: 'Uma concha.',
    channelDivinity: 'Qualquer',
    favoredWeapon: 'Tridente',
    devotees: 'Dahllan, hynne, minotauros, sereias/tritões, bárbaros, bucaneiros, caçadores, druidas.',
    obligationsAndRestrictions: [
      'As únicas armas permitidas para devotos do Oceano são a azagaia, a lança, o tridente e a rede. Podem usar apenas armaduras leves. O devoto também não pode se manter afastado do oceano por mais de um mês.'
    ],
    grantedPowerIds: [
      'anfibio',
      'arsenal-das-profundezas',
      'mestre-dos-mares',
      'sopro-do-mar'
    ]
  },
  {
    id: 'sszzaas',
    slug: 'sszzaas',
    name: 'Sszzaas',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus da Traição, da Intrigas, dos Venenos e das Serpentes.',
    description: 'O sibilante Deus da Traição não é apenas o mais inteligente entre os deuses, mas também o mais perigoso. Retornou ao Panteão através de planos insidiosos e hoje espalha sua rede de servos corruptores sobre todo o continente.',
    iconName: 'Skull',
    beliefsAndGoals: 'Praticar a mentira e a trapaça. Buscar sempre a solução mais inteligente. Demonstrar que lealdade e confiança são fraquezas, devem ser eliminadas. Promover competição, rivalidade, desconfiança. Usar os recursos do inimigo para alcançar seus objetivos. Levar outros a se sacrificarem em seu lugar.',
    sacredSymbol: 'Uma naja vertendo veneno pelas presas.',
    channelDivinity: 'Negativa',
    favoredWeapon: 'Adaga',
    devotees: 'Medusas, arcanistas, bardos, bucaneiros, inventores, ladinos, nobres.',
    obligationsAndRestrictions: [
      'O devoto deve fazer um ato de traição, intriga ou corrupção por dia (ou por sessão de jogo, o que demorar mais) como oferenda a Sszzaas. Pouco importa se o alvo é aliado ou inimigo — uns poucos sszzaazitas usam seus métodos torpes para ajudar colegas aventureiros em suas missões, às vezes sem que eles próprios saibam. Sugerir a alguém que foi traído pelo cônjuge, influenciar um guarda a aceitar suborno, instruir um mercador a roubar nos preços, incriminar alguém por um crime que não cometeu, enganar um guerreiro para que mate um oponente rendido e inofensivo... Em termos de jogo, uma ação exigindo um teste de Enganação com CD mínima 15 + metade do seu nível.'
    ],
    grantedPowerIds: [
      'astucia-da-serpente',
      'familiar-ofidico',
      'presas-venenosas',
      'sangue-ofidico'
    ]
  },
  {
    id: 'tanna-toh',
    slug: 'tanna-toh',
    name: 'Tanna-Toh',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deusa do Conhecimento, da Civilização, da Escrita e da Verdade.',
    description: 'Devotos da Deusa do Conhecimento atuam como professores, catequistas e pesquisadores, tomando a missão sagrada de levar educação e cultura para todos. Tanna-Toh é amplamente venerada pelos povos civilizados, amada por aqueles que se devotam aos estudos ou artes.',
    iconName: 'BookOpen',
    beliefsAndGoals: 'Reverenciar a mente racional, o conhecimento, a civilização, a verdade. Proteger o progresso, o avanço dos povos civilizados. Promover o ensino e a prática das artes e das ciências. Solucionar todos os mistérios, revelar todas as mentiras. Buscar novo conhecimento. Não tolerar a ignorância.',
    sacredSymbol: 'Pergaminho e pena.',
    channelDivinity: 'Qualquer',
    favoredWeapon: 'Bordão',
    devotees: 'Golens, kliren, arcanistas, bardos, inventores, nobres, paladinos.',
    obligationsAndRestrictions: [
      'Devotos de Tanna-Toh jamais podem recusar uma missão que envolva a busca por um novo conhecimento ou informação; investigar rumores sobre um livro perdido, procurar uma aldeia lendária, pesquisar os hábitos de uma criatura desconhecida...',
      'Além disso, o devoto sempre deve dizer a verdade e nunca pode se recusar a responder uma pergunta direta, pouco importando as consequências. É proibido para ele esconder qualquer conhecimento.'
    ],
    grantedPowerIds: [
      'conhecimento-enciclopedico',
      'mente-analitica',
      'pesquisa-abencoada',
      'voz-da-civilizacao'
    ]
  },
  {
    id: 'tenebra',
    slug: 'tenebra',
    name: 'Tenebra',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deusa das Trevas, da Noite, dos Mortos-Vivos e do Subterrâneo.',
    description: 'Assim como seu inimigo Azgher vigia e protege Arton durante o dia, Tenebra é atenta sob as estrelas; nada acontece na noite sem seu conhecimento. A sedutora e misteriosa Mãe Noite é mãe de tudo que anda e rasteja no escuro, dos nobres anões aos sinistros mortos-vivos e trogloditas.',
    iconName: 'Moon',
    beliefsAndGoals: 'Reverenciar a noite, a escuridão, a lua e as estrelas. Proteger segredos e mistérios, proteger tudo que é oculto e invisível. Reverenciar a não vida e os mortos-vivos, propagar a prática da necromancia. Rejeitar o sol e a luz.',
    sacredSymbol: 'Estrela negra de cinco pontas.',
    channelDivinity: 'Negativa',
    favoredWeapon: 'Adaga',
    devotees: 'Anões, medusas, qareen, osteon, sulfure, trogs, arcanistas, bardos, ladinos.',
    obligationsAndRestrictions: [
      'Tenebra proíbe que seus devotos sejam tocados por Azgher, o odiado rival. O devoto deve se cobrir inteiramente durante o dia, sem expor ao sol nenhum pedaço de pele.'
    ],
    grantedPowerIds: [
      'caricia-sombria',
      'manto-da-penumbra',
      'visao-nas-trevas',
      'zumbificar'
    ]
  },
  {
    id: 'thwor',
    slug: 'thwor',
    name: 'Thwor',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus dos Goblinoides, da Mudança, da Força e da Aliança Duyshidakk.',
    description: 'A Flecha de Fogo foi disparada, rompendo o coração das trevas. Ao enfrentar e derrotar o próprio Ragnar, antigo Deus da Morte, o imperador bugbear Thwor Khoshkothruk ascendeu ao Panteão como o Deus dos Goblinoides.',
    iconName: 'Zap',
    beliefsAndGoals: 'Reverenciar a lealdade, a força e a coragem. Promover a união entre goblins, hobgoblins, bugbears, orcs, ogros e outros povos humanoides. Reverenciar o caos, a mutação, a vida sempre em movimento. Proteger a cultura e o modo de vida goblinoide. Destruir os elfos.',
    sacredSymbol: 'Um grande punho fechado.',
    channelDivinity: 'Qualquer',
    favoredWeapon: 'Machado de guerra',
    devotees: 'Qualquer duyshidakk (aceito como membro do povo goblinoide).',
    obligationsAndRestrictions: [
      'Não importando sua raça, o devoto de Thwor deve ser duyshidakk — ou seja, aceito como membro do povo goblinoide. Também deve se esforçar para que o “Mundo Como Deve Ser” tome o continente (veja a página 386). Deve sempre procurar fazer alianças com goblinoides e só lutar contra eles em último caso.'
    ],
    grantedPowerIds: [
      'almejar-o-impossivel',
      'furia-divina',
      'olhar-amedrontador',
      'tropas-duyshidakk'
    ]
  },
  {
    id: 'thyatis',
    slug: 'thyatis',
    name: 'Thyatis',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deus da Ressurreição, da Profecia e das Segundas Chances.',
    description: 'O generoso Deus da Ressurreição e Profecia representa o perdão, a tolerância, as segundas chances. Seu dom maior é a prevenção ou correção dos erros — através de predições que evitam esses erros ou reversão das mortes que tenham causado.',
    iconName: 'Flame',
    beliefsAndGoals: 'Proteger a vida e aqueles necessitados de novas chances. Renegar a morte e a mentira. Ajudar os perdidos a encontrar seus caminhos e alcançar seus destinos. Oferecer clemência, perdão e redenção.',
    sacredSymbol: 'Uma ave fênix.',
    channelDivinity: 'Positiva',
    favoredWeapon: 'Espada longa',
    devotees: 'Aggelus, cavaleiros, guerreiros, inventores, lutadores, paladinos.',
    obligationsAndRestrictions: [
      'Devotos de Thyatis são proibidos de matar criaturas inteligentes (Int –3 ou maior). Podem atacar e causar dano, mas jamais levar à morte. Por esse motivo, devotos de Thyatis preferem armas e ataques que apenas incapacitam seus oponentes ou causam dano não letal.'
    ],
    grantedPowerIds: [
      'ataque-piedoso',
      'dom-da-imortalidade',
      'dom-da-profecia',
      'dom-da-ressurreicao'
    ]
  },
  {
    id: 'valkaria',
    slug: 'valkaria',
    name: 'Valkaria',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deusa da Humanidade, da Ambição, da Aventura e Líder do Panteão.',
    description: 'A Deusa da Ambição sempre foi a mais ousada entre os seus. Criaria os seres humanos, povo mais impetuoso e beligerante de todos. Reconhecida após a queda de Tauron e a ascensão de Arsenal como a nova líder do Panteão de Arton.',
    iconName: 'Compass',
    beliefsAndGoals: 'Praticar o otimismo, a evolução, a rebeldia. Desafiar limites, almejar o impossível. Combater o mal, a opressão e a tirania. Proteger a liberdade. Aceitar o novo e diferente e adaptar-se a ele. Demonstrar ambição, paixão e coragem. Desfrutar e amar a vida.',
    sacredSymbol: 'A Estátua de Valkaria ou seis faixas entrelaçadas.',
    channelDivinity: 'Positiva',
    favoredWeapon: 'Mangual',
    devotees: 'Aventureiros; membros de todas as classes podem ser devotos de Valkaria.',
    obligationsAndRestrictions: [
      'Valkaria odeia o conformismo. Seus devotos são proibidos de fixar moradia em um mesmo lugar, não podendo permanecer mais de 2d10+10 dias na mesma cidade (ou vila, aldeia, povoado...) ou 1d4+2 meses no mesmo reino.',
      'Devotos de Valkaria também são proibidos de se casar ou formar qualquer união estável.'
    ],
    grantedPowerIds: [
      'almejar-o-impossivel',
      'armas-da-ambicao',
      'coragem-total',
      'liberdade-divina'
    ]
  },
  {
    id: 'wynna',
    slug: 'wynna',
    name: 'Wynna',
    system: 'Tormenta 20',
    edition: 'Jogo do Ano',
    summary: 'Deusa da Magia, do Mana e da Generosidade Mística.',
    description: 'A exuberante Deusa da Magia, louvada por fadas, qareen, gênios e todos aqueles que empregam poder arcano. Generosa e liberal além dos limites, Wynna concede mágica a todos que pedem, não importando se usada para o bem ou para o mal — pois a magia é mais importante que a vida e nunca deve ser negada a ninguém.',
    iconName: 'Sparkles',
    beliefsAndGoals: 'Reverenciar a magia arcana e seus praticantes. Promover o ensino da magia. Usar a magia para proteger os necessitados e trazer felicidade ao mundo.',
    sacredSymbol: 'Um anel metálico.',
    channelDivinity: 'Qualquer',
    favoredWeapon: 'Adaga',
    devotees: 'Elfos, golens, qareen, sílfides, arcanistas, bardos.',
    obligationsAndRestrictions: [
      'Assim como a magia jamais deva ser negada para quem a busca, devotos de Wynna devem praticar a bondade e a generosidade de sua deusa, jamais recusando um pedido de ajuda de alguém inocente. Além disso, devotos de Wynna são proibidos de matar seres mágicos (elfos, qareen, sílfides e outros a critério do mestre) e conjuradores arcanos.'
    ],
    grantedPowerIds: [
      'bencao-do-mana',
      'centelha-magica',
      'escudo-magico',
      'teurgista-mistico'
    ]
  }
];
