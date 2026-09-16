import { T20ClassDetail } from '../types/classes';

export const T20_CLASSES_DETAILED: T20ClassDetail[] = [
  {
    id: 'arcanista',
    slug: 'arcanista',
    name: 'Arcanista',
    category: 'conjurador',
    role: 'Dano Mágico e Utilidade',
    difficulty: 'avancado',
    primaryAttributes: ['INT', 'CAR'],
    secondaryAttributes: ['CON', 'DES'],
    summary: 'Mestre das artes arcanas, capaz de moldar a realidade com feitiços poderosos.',
    concept: 'O Arcanista é o estudioso ou o herdeiro de um sangue mágico que canaliza energias brutas para realizar o impossível.',
    playstyle: {
      dano: 5,
      resistencia: 1,
      suporte: 3,
      magia: 5,
      pericias: 2,
      mobilidade: 2,
      versatilidade: 4,
      complexidade: 5
    },
    strengths: [
      'Maior arsenal de magias do jogo',
      'Alto potencial de dano em área',
      'Grande utilidade fora de combate'
    ],
    weaknesses: [
      'Pouquíssimos pontos de vida',
      'Dependência extrema de Mana',
      'Vulnerável em combate corpo a corpo'
    ],
    resources: {
      mana: 'Alta reserva de PM, essencial para lançar magias.',
      combat: 'Evita o combate direto, prefere atacar à distância.',
      skills: 'Focado em Misticismo e Conhecimento.',
      utility: 'Pode resolver problemas complexos com magias utilitárias.'
    },
    progression: [
      { level: 1, gain: 'Caminho do Arcanista (Mago, Feiticeiro ou Bruxo)' },
      { level: 5, gain: 'Acesso a magias de 2º círculo' },
      { level: 10, gain: 'Acesso a magias de 3º círculo' }
    ],
    abilities: [
      { name: 'Caminho do Arcanista', level: 1, type: 'classe', description: 'Escolha entre o estudo (Mago), o sangue (Feiticeiro) ou o foco (Bruxo).' },
      { name: 'Magias', level: 1, type: 'classe', description: 'Você pode lançar magias arcanas.' },
      { name: 'Alta Arcana', level: 20, type: 'classe', description: 'O custo em PM de todas as suas magias é reduzido à metade e seu poder arcano atinge o ápice.' }
    ],
    builds: [
      { name: 'Bombardeiro Arcano', description: 'Focado em magias de evocação para causar o máximo de dano.', focus: ['INT', 'Magias de Dano'] },
      { name: 'Controlador de Campo', description: 'Focado em magias de abjuração e convocação para dominar o campo de batalha.', focus: ['INT', 'Magias de Controle'] }
    ],
    recommendedFor: 'avancado',
    tags: ['Magia', 'Dano', 'Estratégia'],
    iconName: 'Wand2'
  },
  {
    id: 'guerreiro',
    slug: 'guerreiro',
    name: 'Guerreiro',
    category: 'combatente',
    role: 'Dano Físico e Linha de Frente',
    difficulty: 'iniciante',
    primaryAttributes: ['FOR', 'DES'],
    secondaryAttributes: ['CON', 'SAB'],
    summary: 'Especialista em armas e táticas de combate, o pilar de qualquer grupo de aventureiros.',
    concept: 'O Guerreiro é o soldado treinado, o mercenário veterano ou o mestre de armas que confia em sua força e técnica.',
    playstyle: {
      dano: 4,
      resistencia: 4,
      suporte: 1,
      magia: 0,
      pericias: 2,
      mobilidade: 3,
      versatilidade: 2,
      complexidade: 2
    },
    strengths: [
      'Excelente precisão de ataque',
      'Alta durabilidade em combate',
      'Versatilidade com diferentes armas'
    ],
    weaknesses: [
      'Baixa reserva de Mana',
      'Pouca utilidade fora de combate',
      'Vulnerável a magias de controle mental'
    ],
    resources: {
      mana: 'Reserva limitada, usada para técnicas especiais (Ataque Especial).',
      combat: 'Domina o campo de batalha com força bruta e técnica.',
      skills: 'Focado em Luta e Atletismo.',
      utility: 'Limitada, focado principalmente em situações de conflito.'
    },
    progression: [
      { level: 1, gain: 'Ataque Especial' },
      { level: 6, gain: 'Ataque Extra' },
      { level: 20, gain: 'Mestre de Armas' }
    ],
    abilities: [
      { name: 'Ataque Especial', level: 1, type: 'classe', description: 'Gasta PM para ganhar bônus em testes de ataque ou dano.' },
      { name: 'Ataque Extra', level: 6, type: 'classe', description: 'Pode realizar um ataque adicional por rodada.' },
      { name: 'Mestre de Armas', level: 20, type: 'classe', description: 'Seus ataques com armas têm margem de ameaça aumentada em +1 e seus acertos críticos causam dano dobrado.' }
    ],
    builds: [
      { name: 'Tanque Inabalável', description: 'Focado em armadura pesada e escudo para proteger aliados.', focus: ['FOR', 'CON', 'Defesa'] },
      { name: 'Mestre de Duas Mãos', description: 'Focado em causar o máximo de dano com armas grandes.', focus: ['FOR', 'Dano'] }
    ],
    recommendedFor: 'iniciante',
    tags: ['Combate', 'Força', 'Resistência'],
    iconName: 'Sword'
  },
  {
    id: 'ladino',
    slug: 'ladino',
    name: 'Ladino',
    category: 'especialista',
    role: 'Infiltração e Dano de Precisão',
    difficulty: 'intermediario',
    primaryAttributes: ['DES', 'INT'],
    secondaryAttributes: ['CAR', 'SAB'],
    summary: 'Mestre da furtividade e das perícias, capaz de encontrar fraquezas e desarmar perigos.',
    concept: 'O Ladino é o batedor, o ladrão de joias ou o assassino que prefere a astúcia à força bruta.',
    playstyle: {
      dano: 4,
      resistencia: 2,
      suporte: 2,
      magia: 0,
      pericias: 5,
      mobilidade: 4,
      versatilidade: 4,
      complexidade: 3
    },
    strengths: [
      'Melhor bônus de perícias do jogo',
      'Alto dano com Ataque Furtivo',
      'Excelente mobilidade e evasão'
    ],
    weaknesses: [
      'Depende de posicionamento para causar dano',
      'Frágil se for pego em combate direto',
      'Dependente de aliados para flanquear'
    ],
    resources: {
      mana: 'Usada para truques e habilidades de especialista.',
      combat: 'Focado em ataques de oportunidade e furtividade.',
      skills: 'Mestre em Ladinagem, Furtividade e Reflexos.',
      utility: 'Extrema, resolve quase qualquer problema com perícias.'
    },
    progression: [
      { level: 1, gain: 'Ataque Furtivo, Especialista' },
      { level: 2, gain: 'Evasão' },
      { level: 10, gain: 'Emboscada' }
    ],
    abilities: [
      { name: 'Ataque Furtivo', level: 1, type: 'classe', description: 'Causa dano extra contra alvos desprevenidos ou flanqueados.' },
      { name: 'Especialista', level: 1, type: 'classe', description: 'Escolha perícias para ganhar bônus dobrado de treinamento.' },
      { name: 'Evasão', level: 2, type: 'classe', description: 'Quando sofre um efeito que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar.' },
      { name: 'Emboscada', level: 10, type: 'classe', description: 'Você pode gastar 2 PM para realizar uma ação padrão adicional na sua primeira rodada de combate.' },
      { name: 'Sombra Lendária', level: 20, type: 'classe', description: 'Você pode se esconder mesmo sob observação direta e seus ataques furtivos ignoram qualquer redução de dano.' }
    ],
    builds: [
      { name: 'Assassino das Sombras', description: 'Focado em eliminar alvos rapidamente com um único golpe.', focus: ['DES', 'Furtividade'] },
      { name: 'Mestre das Perícias', description: 'Focado em ser útil em qualquer situação fora de combate.', focus: ['INT', 'Múltiplas Perícias'] }
    ],
    recommendedFor: 'intermediario',
    tags: ['Furtividade', 'Perícias', 'Agilidade'],
    iconName: 'Zap'
  },
  {
    id: 'clerigo',
    slug: 'clerigo',
    name: 'Clérigo',
    category: 'suporte',
    role: 'Cura e Proteção Divina',
    difficulty: 'iniciante',
    primaryAttributes: ['SAB'],
    secondaryAttributes: ['FOR', 'CON'],
    summary: 'O canalizador do poder dos deuses, capaz de curar feridas e banir o mal.',
    concept: 'O Clérigo é o sacerdote guerreiro ou o curandeiro devoto que serve como o coração espiritual do grupo.',
    playstyle: {
      dano: 2,
      resistencia: 4,
      suporte: 5,
      magia: 4,
      pericias: 2,
      mobilidade: 2,
      versatilidade: 3,
      complexidade: 3
    },
    strengths: [
      'Melhor capacidade de cura do jogo',
      'Pode usar armaduras pesadas',
      'Fortes magias de suporte e proteção'
    ],
    weaknesses: [
      'Dependência de sua divindade (Obrigações e Restrições)',
      'Mobilidade reduzida por armaduras pesadas',
      'Dano físico inferior a combatentes puros'
    ],
    resources: {
      mana: 'Reserva sólida para magias divinas.',
      combat: 'Pode atuar na linha de frente com boa defesa.',
      skills: 'Focado em Religião e Vontade.',
      utility: 'Alta, especialmente em lidar com mortos-vivos e maldições.'
    },
    progression: [
      { level: 1, gain: 'Devoto, Magias Divinas' },
      { level: 5, gain: 'Acesso a magias de 2º círculo' },
      { level: 10, gain: 'Acesso a magias de 3º círculo' }
    ],
    abilities: [
      { name: 'Devoto', level: 1, type: 'classe', description: 'Você deve seguir os dogmas de um deus para ganhar poderes.' },
      { name: 'Canalizar Energia', level: 1, type: 'classe', description: 'Cura aliados ou causa dano a mortos-vivos em área.' },
      { name: 'Servo Divino', level: 20, type: 'classe', description: 'Você se torna a personificação viva da vontade de seu deus, recebendo conexão espiritual suprema.' }
    ],
    builds: [
      { name: 'Sacerdote de Batalha', description: 'Focado em lutar na linha de frente enquanto protege o grupo.', focus: ['FOR', 'SAB', 'Defesa'] },
      { name: 'Curandeiro Puro', description: 'Focado inteiramente em manter o grupo vivo e remover condições negativas.', focus: ['SAB', 'Cura'] }
    ],
    recommendedFor: 'iniciante',
    tags: ['Cura', 'Divino', 'Suporte'],
    iconName: 'Heart'
  },
  {
    id: 'barbaro',
    slug: 'barbaro',
    name: 'Bárbaro',
    category: 'combatente',
    role: 'Dano e Resistência Bruta',
    difficulty: 'iniciante',
    primaryAttributes: ['FOR', 'CON'],
    secondaryAttributes: ['DES'],
    summary: 'Um guerreiro selvagem que canaliza sua fúria para destruir inimigos e ignorar a dor.',
    concept: 'O Bárbaro é a força da natureza, alguém que viveu longe da civilização e confia em seus instintos e força física.',
    playstyle: {
      dano: 5,
      resistencia: 5,
      suporte: 1,
      magia: 0,
      pericias: 2,
      mobilidade: 3,
      versatilidade: 2,
      complexidade: 1
    },
    strengths: [
      'Maior quantidade de PV do jogo',
      'Dano massivo corpo a corpo',
      'Resistência a dano natural'
    ],
    weaknesses: [
      'Defesa (CA) geralmente baixa',
      'Vulnerável a ataques à distância',
      'Pouquíssima utilidade fora de combate'
    ],
    resources: {
      mana: 'Usada principalmente para ativar a Fúria.',
      combat: 'Focado em ataques poderosos e absorção de dano.',
      skills: 'Focado em Sobrevivência e Atletismo.',
      utility: 'Limitada a ambientes selvagens.'
    },
    progression: [
      { level: 1, gain: 'Fúria' },
      { level: 3, gain: 'Resistência a Dano' },
      { level: 20, gain: 'Fúria Incansável' }
    ],
    abilities: [
      { name: 'Fúria', level: 1, type: 'classe', description: 'Gasta PM para ganhar bônus em ataque e dano, mas não pode usar perícias de Inteligência ou Sabedoria.' },
      { name: 'Instinto Selvagem', level: 2, type: 'classe', description: 'Bônus em Percepção e Reflexos.' },
      { name: 'Resistência a Dano', level: 3, type: 'classe', description: 'Você recebe Redução de Dano (RD 2), ignorando 2 pontos de dano físico recebido de qualquer ataque.' },
      { name: 'Fúria Incansável', level: 20, type: 'classe', description: 'Sua fúria não tem mais limite de duração e seus bônus de combate são duplicados.' }
    ],
    builds: [
      { name: 'Destruidor de Crânios', description: 'Focado em armas de duas mãos para causar o máximo de dano possível.', focus: ['FOR', 'Dano Crítico'] },
      { name: 'Tanque de Carne', description: 'Focado em aumentar a Constituição e a Resistência a Dano.', focus: ['CON', 'PV'] }
    ],
    recommendedFor: 'iniciante',
    tags: ['Fúria', 'Força', 'Selvagem'],
    iconName: 'Flame'
  },
  {
    id: 'bardo',
    slug: 'bardo',
    name: 'Bardo',
    category: 'hibrido',
    role: 'Versatilidade e Suporte Mágico',
    difficulty: 'avancado',
    primaryAttributes: ['CAR'],
    secondaryAttributes: ['INT', 'DES'],
    summary: 'Um artista que usa música e magia para inspirar aliados e confundir inimigos.',
    concept: 'O Bardo é o contador de histórias, o músico ou o espião que sabe um pouco de tudo e usa seu carisma como arma.',
    playstyle: {
      dano: 3,
      resistencia: 2,
      suporte: 4,
      magia: 4,
      pericias: 4,
      mobilidade: 3,
      versatilidade: 5,
      complexidade: 5
    },
    strengths: [
      'Extremamente versátil',
      'Excelentes bônus para o grupo',
      'Pode aprender magias de outras classes'
    ],
    weaknesses: [
      'Não é mestre em nada específico',
      'Dependente de Carisma para quase tudo',
      'Frágil em combate direto prolongado'
    ],
    resources: {
      mana: 'Usada para Inspiração e Magias.',
      combat: 'Suporte na linha de trás ou esgrima leve.',
      skills: 'Mestre em Atuação, Diplomacia e Enganação.',
      utility: 'Altíssima, pode preencher qualquer lacuna no grupo.'
    },
    progression: [
      { level: 1, gain: 'Inspiração, Magias' },
      { level: 6, gain: 'Arte Mágica' },
      { level: 10, gain: 'Acesso a magias de 3º círculo' }
    ],
    abilities: [
      { name: 'Inspiração', level: 1, type: 'classe', description: 'Usa música ou oratória para dar bônus em testes aos aliados.' },
      { name: 'Eclético', level: 2, type: 'classe', description: 'Pode usar qualquer perícia como se fosse treinado gastando PM.' },
      { name: 'Arte Mágica', level: 6, type: 'classe', description: 'Enquanto mantiver sua Inspiração ativa, a CD para resistir a todas as suas magias arcanas aumenta em +2.' },
      { name: 'Artista Completo', level: 20, type: 'classe', description: 'Sua Inspiração afeta todos os aliados à vista sem limite de alcance e sem custo de manutenção por rodada.' }
    ],
    builds: [
      { name: 'Maestro de Batalha', description: 'Focado em buffs de grupo e controle de campo.', focus: ['CAR', 'Suporte'] },
      { name: 'Lâmina Cantante', description: 'Focado em combate corpo a corpo usando Carisma para atacar.', focus: ['CAR', 'DES', 'Esgrima'] }
    ],
    recommendedFor: 'avancado',
    tags: ['Música', 'Carisma', 'Versátil'],
    iconName: 'Users'
  },
  {
    id: 'bucaneiro',
    slug: 'bucaneiro',
    name: 'Bucaneiro',
    category: 'especialista',
    role: 'Agilidade e Críticos',
    difficulty: 'intermediario',
    primaryAttributes: ['DES', 'CAR'],
    secondaryAttributes: ['INT'],
    summary: 'Um aventureiro audaz que confia na sorte e na agilidade para vencer seus desafios.',
    concept: 'O Bucaneiro é o pirata, o espadachim galante ou o duelista que vive no limite.',
    playstyle: {
      dano: 4,
      resistencia: 3,
      suporte: 2,
      magia: 0,
      pericias: 3,
      mobilidade: 5,
      versatilidade: 3,
      complexidade: 3
    },
    strengths: [
      'Alta Defesa baseada em Carisma',
      'Especialista em acertos críticos',
      'Excelente mobilidade'
    ],
    weaknesses: [
      'Depende de armaduras leves',
      'Dano inconsistente se não critar',
      'Pouca utilidade contra inimigos imunes a críticos'
    ],
    resources: {
      mana: 'Usada para Audácia e habilidades de esgrima.',
      combat: 'Luta com estilo, usando fintas e acrobacias.',
      skills: 'Focado em Acrobacia, Atletismo e Enganação.',
      utility: 'Boa em situações sociais e de exploração urbana.'
    },
    progression: [
      { level: 1, gain: 'Audácia, Insolência' },
      { level: 5, gain: 'Panache' },
      { level: 20, gain: 'Lenda dos Mares' }
    ],
    abilities: [
      { name: 'Audácia', level: 1, type: 'classe', description: 'Soma Carisma em testes de perícia (exceto Luta/Pontaria).' },
      { name: 'Insolência', level: 1, type: 'classe', description: 'Soma Carisma na Defesa (limitado pelo nível).' },
      { name: 'Panache', level: 5, type: 'classe', description: 'Você recupera 1 PM sempre que obtém um acerto crítico ou tem sucesso em uma manobra de combate arriscada.' },
      { name: 'Lenda dos Mares', level: 20, type: 'classe', description: 'Sua audácia lendária permite realizar uma ação padrão ou de movimento extra por rodada gastando 2 PM.' }
    ],
    builds: [
      { name: 'Duelista Galante', description: 'Focado em florete e defesa alta para duelos um contra um.', focus: ['DES', 'CAR', 'Defesa'] },
      { name: 'Atirador de Elite', description: 'Focado em armas de fogo e críticos à distância.', focus: ['DES', 'Pontaria'] }
    ],
    recommendedFor: 'intermediario',
    tags: ['Sorte', 'Agilidade', 'Duelo'],
    iconName: 'Anchor'
  },
  {
    id: 'cacador',
    slug: 'cacador',
    name: 'Caçador',
    category: 'combatente',
    role: 'Dano Sustentado e Rastreio',
    difficulty: 'iniciante',
    primaryAttributes: ['DES', 'SAB'],
    secondaryAttributes: ['FOR', 'INT'],
    summary: 'Um rastreador implacável que estuda suas presas para abatê-las com precisão.',
    concept: 'O Caçador é o batedor selvagem, o caçador de recompensas ou o mestre das armadilhas.',
    playstyle: {
      dano: 5,
      resistencia: 3,
      suporte: 2,
      magia: 0,
      pericias: 3,
      mobilidade: 4,
      versatilidade: 3,
      complexidade: 2
    },
    strengths: [
      'Dano bônus contra inimigos marcados',
      'Excelente em combate à distância ou com duas armas',
      'Mestre em sobrevivência e rastreio'
    ],
    weaknesses: [
      'Depende de marcar o inimigo (gasta ação)',
      'Menos resistente que o Guerreiro ou Bárbaro',
      'Eficácia reduzida em ambientes muito urbanos'
    ],
    resources: {
      mana: 'Usada para Marca do Caçador e habilidades de exploração.',
      combat: 'Focado em múltiplos ataques ou precisão extrema.',
      skills: 'Focado em Sobrevivência, Furtividade e Percepção.',
      utility: 'Alta em ambientes naturais e rastreio de alvos.'
    },
    progression: [
      { level: 1, gain: 'Marca do Caçador, Rastreador' },
      { level: 6, gain: 'Caminho do Explorador' },
      { level: 20, gain: 'Mestre Caçador' }
    ],
    abilities: [
      { name: 'Marca do Caçador', level: 1, type: 'classe', description: 'Gasta PM para marcar um alvo e causar dano extra a cada ataque.' },
      { name: 'Rastreador', level: 1, type: 'classe', description: 'Pode rastrear criaturas usando Sobrevivência sem penalidade.' },
      { name: 'Caminho do Explorador', level: 6, type: 'classe', description: 'Você e seus aliados ignoram terreno difícil e têm velocidade de viagem dobrada em ambientes selvagens.' },
      { name: 'Mestre Caçador', level: 20, type: 'classe', description: 'Sua Marca do Caçador custa 0 PM e todos os seus ataques contra sua presa causam dano maximizado.' }
    ],
    builds: [
      { name: 'Arqueiro Implacável', description: 'Focado em arco longo e muitos ataques por rodada.', focus: ['DES', 'Dano à Distância'] },
      { name: 'Mestre das Duas Lâminas', description: 'Focado em lutar com duas armas e aplicar a marca rapidamente.', focus: ['DES', 'FOR', 'Múltiplos Ataques'] }
    ],
    recommendedFor: 'iniciante',
    tags: ['Rastreio', 'Precisão', 'Natureza'],
    iconName: 'Target'
  },
  {
    id: 'cavaleiro',
    slug: 'cavaleiro',
    name: 'Cavaleiro',
    category: 'combatente',
    role: 'Tanque e Controle de Grupo',
    difficulty: 'intermediario',
    primaryAttributes: ['FOR', 'CAR'],
    secondaryAttributes: ['CON'],
    summary: 'O defensor honrado que usa sua armadura e presença para proteger os fracos.',
    concept: 'O Cavaleiro é o nobre em armadura brilhante, o paladino sem divindade ou o guarda de elite.',
    playstyle: {
      dano: 2,
      resistencia: 5,
      suporte: 3,
      magia: 0,
      pericias: 2,
      mobilidade: 2,
      versatilidade: 2,
      complexidade: 3
    },
    strengths: [
      'Maior Defesa (CA) do jogo',
      'Capacidade de forçar inimigos a atacá-lo',
      'Excelente em montaria'
    ],
    weaknesses: [
      'Dano inferior a outros combatentes',
      'Dependência de Código de Honra',
      'Baixa mobilidade a pé'
    ],
    resources: {
      mana: 'Usada para Desafios e Posturas de Combate.',
      combat: 'Focado em ser um alvo inabalável.',
      skills: 'Focado em Diplomacia, Cavalaria e Nobreza.',
      utility: 'Boa em situações sociais de alta corte.'
    },
    progression: [
      { level: 1, gain: 'Código de Honra, Desafio' },
      { level: 2, gain: 'Caminho do Cavaleiro' },
      { level: 20, gain: 'Baluarte Inabalável' }
    ],
    abilities: [
      { name: 'Desafio', level: 1, type: 'classe', description: 'Força um inimigo a focar seus ataques em você ou sofrer penalidades.' },
      { name: 'Código de Honra', level: 1, type: 'classe', description: 'Ganha bônus por seguir regras de conduta, mas perde PM se violá-las.' },
      { name: 'Caminho do Cavaleiro', level: 2, type: 'classe', description: 'Você consolida seu caminho de cavalaria (Baluarte ou Montaria), recebendo bônus especializados de defesa ou carga.' },
      { name: 'Baluarte Inabalável', level: 20, type: 'classe', description: 'Você é inabalável; não pode ser movido contra a sua vontade e seus aliados adjacentes recebem metade da sua Defesa total.' }
    ],
    builds: [
      { name: 'Muralha de Aço', description: 'Focado inteiramente em Defesa e proteção de aliados.', focus: ['FOR', 'CON', 'Defesa'] },
      { name: 'Campeão Montado', description: 'Focado em combate sobre cavalo usando lanças.', focus: ['FOR', 'Cavalaria'] }
    ],
    recommendedFor: 'intermediario',
    tags: ['Honra', 'Defesa', 'Montaria'],
    iconName: 'Shield'
  },
  {
    id: 'druida',
    slug: 'druida',
    name: 'Druida',
    category: 'conjurador',
    role: 'Versatilidade e Magia Natural',
    difficulty: 'avancado',
    primaryAttributes: ['SAB'],
    secondaryAttributes: ['CON', 'FOR'],
    summary: 'O guardião da natureza, capaz de assumir formas animais e controlar os elementos.',
    concept: 'O Druida é o eremita da floresta, o xamã de uma tribo ou o protetor do equilíbrio natural.',
    playstyle: {
      dano: 3,
      resistencia: 4,
      suporte: 4,
      magia: 5,
      pericias: 3,
      mobilidade: 4,
      versatilidade: 5,
      complexidade: 5
    },
    strengths: [
      'Pode assumir formas animais poderosas',
      'Acesso a magias divinas e elementais',
      'Muito resistente e versátil'
    ],
    weaknesses: [
      'Restrições severas de equipamento (não usa metal)',
      'Dependência de ambiente natural para algumas habilidades',
      'Complexidade alta de gerenciamento de ficha'
    ],
    resources: {
      mana: 'Reserva alta para magias e Forma Selvagem.',
      combat: 'Pode lutar como animal ou usar magias de controle.',
      skills: 'Focado em Sobrevivência, Adestramento e Vontade.',
      utility: 'Altíssima em exploração e interação com animais.'
    },
    progression: [
      { level: 1, gain: 'Devoto, Forma Selvagem, Magias' },
      { level: 6, gain: 'Forma Selvagem Aprimorada' },
      { level: 10, gain: 'Acesso a magias de 3º círculo' }
    ],
    abilities: [
      { name: 'Forma Selvagem', level: 1, type: 'classe', description: 'Gasta PM para se transformar em um animal, ganhando bônus físicos.' },
      { name: 'Empatia Selvagem', level: 1, type: 'classe', description: 'Pode usar Diplomacia com animais usando Sabedoria.' },
      { name: 'Forma Selvagem Aprimorada', level: 6, type: 'classe', description: 'Você desbloqueia formas animais aprimoradas com maiores bônus de atributos, dano e novas habilidades.' },
      { name: 'Força da Natureza', level: 20, type: 'classe', description: 'Você pode permanecer indefinidamente em Forma Selvagem e pode conjurar qualquer magia nessa forma sem restrições.' }
    ],
    builds: [
      { name: 'Fera de Combate', description: 'Focado em Forma Selvagem para lutar na linha de frente.', focus: ['SAB', 'FOR', 'Combate Animal'] },
      { name: 'Invocador da Tempestade', description: 'Focado em magias elementais e controle de clima.', focus: ['SAB', 'Magia'] }
    ],
    recommendedFor: 'avancado',
    tags: ['Natureza', 'Forma Selvagem', 'Magia'],
    iconName: 'Compass'
  },
  {
    id: 'inventor',
    slug: 'inventor',
    name: 'Inventor',
    category: 'especialista',
    role: 'Criação de Itens e Utilidade',
    difficulty: 'avancado',
    primaryAttributes: ['INT'],
    secondaryAttributes: ['DES', 'SAB'],
    summary: 'Um gênio da tecnologia e alquimia que usa engenhocas e poções para superar obstáculos.',
    concept: 'O Inventor é o ferreiro místico, o alquimista maluco ou o engenheiro de guerra.',
    playstyle: {
      dano: 3,
      resistencia: 3,
      suporte: 4,
      magia: 3,
      pericias: 5,
      mobilidade: 2,
      versatilidade: 5,
      complexidade: 5
    },
    strengths: [
      'Pode fabricar seus próprios itens mágicos',
      'Usa Inteligência para quase tudo (inclusive ataque)',
      'Extrema versatilidade com engenhocas'
    ],
    weaknesses: [
      'Dependência de tempo e dinheiro para fabricar itens',
      'Engenhocas podem falhar',
      'Fraco sem seus equipamentos preparados'
    ],
    resources: {
      mana: 'Usada para ativar engenhocas e habilidades de fabricação.',
      combat: 'Usa protótipos, armas de fogo ou poções explosivas.',
      skills: 'Mestre em Ofício, Investigação e Ladinagem.',
      utility: 'Inigualável em preparação e suporte técnico.'
    },
    progression: [
      { level: 1, gain: 'Engenhosidade, Protótipo' },
      { level: 3, gain: 'Fabricar Item Mágico' },
      { level: 20, gain: 'Obra-Prima' }
    ],
    abilities: [
      { name: 'Engenhosidade', level: 1, type: 'classe', description: 'Soma Inteligência em testes de perícia gastando PM.' },
      { name: 'Protótipo', level: 1, type: 'classe', description: 'Começa com um item superior ou engenhoca gratuita.' },
      { name: 'Fabricar Item Mágico', level: 3, type: 'classe', description: 'Você aprende os segredos de encantar itens e pode fabricar itens mágicos menores usando sua oficina.' },
      { name: 'Obra-Prima', level: 20, type: 'classe', description: 'Você cria uma obra-prima de engenharia ou alquimia de poder inestimável que desafia as leis da natureza.' }
    ],
    builds: [
      { name: 'Alquimista de Campo', description: 'Focado em poções e bombas para suporte e dano.', focus: ['INT', 'Ofício (Alquimia)'] },
      { name: 'Engenheiro de Combate', description: 'Focado em engenhocas que simulam magias e armas tecnológicas.', focus: ['INT', 'Ofício (Engenharia)'] }
    ],
    recommendedFor: 'avancado',
    tags: ['Tecnologia', 'Inteligência', 'Criação'],
    iconName: 'Gem'
  },
  {
    id: 'lutador',
    slug: 'lutador',
    name: 'Lutador',
    category: 'combatente',
    role: 'Dano Rápido e Controle Físico',
    difficulty: 'iniciante',
    primaryAttributes: ['FOR', 'CON'],
    secondaryAttributes: ['DES'],
    summary: 'Um mestre do combate desarmado que usa seus próprios punhos como armas letais.',
    concept: 'O Lutador é o pugilista de rua, o monge sem monastério ou o brigão de taverna.',
    playstyle: {
      dano: 5,
      resistencia: 4,
      suporte: 1,
      magia: 0,
      pericias: 2,
      mobilidade: 4,
      versatilidade: 2,
      complexidade: 2
    },
    strengths: [
      'Muitos ataques por rodada sem gastar muito',
      'Excelente em manobras de combate (agarrar, derrubar)',
      'Nunca está desarmado'
    ],
    weaknesses: [
      'Alcance limitado ao corpo a corpo',
      'Depende de estar sem armadura pesada',
      'Vulnerável a magias de controle'
    ],
    resources: {
      mana: 'Usada para golpes especiais e aumentar o dano.',
      combat: 'Focado em sequências de golpes e imobilização.',
      skills: 'Focado em Luta, Atletismo e Iniciativa.',
      utility: 'Baixa, focado em resolução física de problemas.'
    },
    progression: [
      { level: 1, gain: 'Briga, Golpe Relâmpago' },
      { level: 6, gain: 'Golpe Baixo' },
      { level: 20, gain: 'Punhos de Adamante' }
    ],
    abilities: [
      { name: 'Briga', level: 1, type: 'classe', description: 'Seus ataques desarmados causam mais dano e aumentam com o nível.' },
      { name: 'Golpe Relâmpago', level: 1, type: 'classe', description: 'Pode fazer um ataque desarmado extra gastando PM.' },
      { name: 'Golpe Baixo', level: 6, type: 'classe', description: 'Ao acertar um ataque desarmado, você pode gastar 2 PM para forçar o inimigo a fazer teste de Fortitude ou ficar atordoado por 1 rodada.' },
      { name: 'Punhos de Adamante', level: 20, type: 'classe', description: 'Seus punhos desarmados causam dano massivo e ignoram qualquer redução de dano ou dureza de objetos.' }
    ],
    builds: [
      { name: 'Mestre do Grappling', description: 'Focado em agarrar e imobilizar inimigos.', focus: ['FOR', 'Atletismo'] },
      { name: 'Punhos de Fúria', description: 'Focado em causar o máximo de dano com sequências rápidas.', focus: ['FOR', 'Dano'] }
    ],
    recommendedFor: 'iniciante',
    tags: ['Desarmado', 'Velocidade', 'Força'],
    iconName: 'Sword'
  },
  {
    id: 'nobre',
    slug: 'nobre',
    name: 'Nobre',
    category: 'suporte',
    role: 'Liderança e Social',
    difficulty: 'intermediario',
    primaryAttributes: ['CAR'],
    secondaryAttributes: ['INT', 'SAB'],
    summary: 'Um líder nato que usa sua influência e riqueza para guiar seus aliados.',
    concept: 'O Nobre é o príncipe herdeiro, o diplomata astuto ou o mercador influente.',
    playstyle: {
      dano: 1,
      resistencia: 4,
      suporte: 5,
      magia: 0,
      pericias: 4,
      mobilidade: 2,
      versatilidade: 4,
      complexidade: 3
    },
    strengths: [
      'Melhor personagem social do jogo',
      'Pode usar Carisma na Defesa e nos Testes de Resistência',
      'Fornece PM e bônus constantes para aliados'
    ],
    weaknesses: [
      'Dano direto muito baixo',
      'Dependência de recursos financeiros',
      'Menos eficaz em combates contra criaturas irracionais'
    ],
    resources: {
      mana: 'Usada para Orgulho e habilidades de comando.',
      combat: 'Comanda aliados e usa sua presença para evitar ataques.',
      skills: 'Mestre em Diplomacia, Nobreza e Intuição.',
      utility: 'Altíssima em qualquer cenário social ou político.'
    },
    progression: [
      { level: 1, gain: 'Autoconfiança, Orgulho' },
      { level: 2, gain: 'Riqueza' },
      { level: 20, gain: 'Rei/Rainha' }
    ],
    abilities: [
      { name: 'Autoconfiança', level: 1, type: 'classe', description: 'Soma Carisma na Defesa (se não estiver usando armadura pesada).' },
      { name: 'Orgulho', level: 1, type: 'classe', description: 'Gasta PM para ganhar bônus em testes de perícia.' },
      { name: 'Riqueza', level: 2, type: 'classe', description: 'Seu patrimônio e status social garantem rendimentos contínuos e recursos econômicos substanciais a cada nível.' },
      { name: 'Rei/Rainha', level: 20, type: 'classe', description: 'Sua autoridade é suprema; você lidera com presença esmagadora e seus aliados recebem bônus heroicos enquanto lutam por você.' }
    ],
    builds: [
      { name: 'Diplomata Implacável', description: 'Focado em resolver conflitos sem desembainhar uma espada.', focus: ['CAR', 'Diplomacia'] },
      { name: 'Estrategista de Batalha', description: 'Focado em dar ordens e bônus táticos para os combatentes.', focus: ['CAR', 'INT', 'Suporte'] }
    ],
    recommendedFor: 'intermediario',
    tags: ['Liderança', 'Social', 'Riqueza'],
    iconName: 'Crown'
  },
  {
    id: 'paladino',
    slug: 'paladino',
    name: 'Paladino',
    category: 'combatente',
    role: 'Dano Divino e Suporte',
    difficulty: 'iniciante',
    primaryAttributes: ['CAR', 'FOR'],
    secondaryAttributes: ['SAB', 'CON'],
    summary: 'O campeão sagrado que luta contra o mal em nome de sua divindade.',
    concept: 'O Paladino é o cavaleiro sagrado, o executor da justiça divina ou o herói profetizado.',
    playstyle: {
      dano: 4,
      resistencia: 4,
      suporte: 4,
      magia: 2,
      pericias: 2,
      mobilidade: 3,
      versatilidade: 3,
      complexidade: 2
    },
    strengths: [
      'Dano massivo contra inimigos do mal (Golpe Divino)',
      'Excelente sustentabilidade e cura própria',
      'Aura que protege todos os aliados próximos'
    ],
    weaknesses: [
      'Código de Conduta rígido',
      'Dependência de Carisma e Força simultaneamente',
      'Eficácia reduzida contra inimigos neutros'
    ],
    resources: {
      mana: 'Usada para Golpe Divino e Cura pelas Mãos.',
      combat: 'Linha de frente poderosa com bônus sagrados.',
      skills: 'Focado em Religião e Diplomacia.',
      utility: 'Boa em lidar com mortos-vivos e purificação.'
    },
    progression: [
      { level: 1, gain: 'Abençoado, Golpe Divino' },
      { level: 3, gain: 'Aura Sagrada' },
      { level: 20, gain: 'Santo' }
    ],
    abilities: [
      { name: 'Golpe Divino', level: 1, type: 'classe', description: 'Gasta PM para causar dano extra de luz em um ataque.' },
      { name: 'Cura pelas Mãos', level: 2, type: 'classe', description: 'Gasta PM para curar a si mesmo ou um aliado com um toque.' },
      { name: 'Aura Sagrada', level: 3, type: 'classe', description: 'Você emana uma aura que concede bônus igual ao seu Carisma nos testes de resistência para você e aliados a alcance curto.' },
      { name: 'Santo', level: 20, type: 'classe', description: 'Você se torna um ser imortal sagrado com Redução de Dano 10, asas celestiais de luz e imunidade a trevas.' }
    ],
    builds: [
      { name: 'Vingador Sagrado', description: 'Focado em causar o máximo de dano a vilões.', focus: ['FOR', 'CAR', 'Dano'] },
      { name: 'Guardião da Luz', description: 'Focado em proteger aliados com sua aura e curas.', focus: ['CAR', 'CON', 'Suporte'] }
    ],
    recommendedFor: 'iniciante',
    tags: ['Sagrado', 'Justiça', 'Combate'],
    iconName: 'Star'
  }
];
