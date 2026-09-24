import { T20Power } from '../types/powers';

export const T20_POWERS: T20Power[] = [
  // ==========================================
  // --- PODERES DE COMBATE (37 Poderes) ---
  // ==========================================
  {
    id: 'acuidade-com-arma',
    slug: 'acuidade-com-arma',
    name: 'Acuidade com Arma',
    category: 'combate',
    prerequisites: 'Des 1',
    description: 'Quando usa uma arma corpo a corpo leve ou uma arma de arremesso, você pode usar sua Destreza em vez de Força nos testes de ataque e rolagens de dano.',
    source: 'Tormenta 20 JdA',
    tags: ['Ataque', 'Dano', 'Destreza']
  },
  {
    id: 'arma-secundaria-grande',
    slug: 'arma-secundaria-grande',
    name: 'Arma Secundária Grande',
    category: 'combate',
    prerequisites: 'Estilo de Duas Armas',
    description: 'Você pode empunhar duas armas de uma mão com o poder Estilo de Duas Armas.',
    source: 'Tormenta 20 JdA',
    tags: ['Duas Armas', 'Equipamento']
  },
  {
    id: 'arremesso-multiplo',
    slug: 'arremesso-multiplo',
    name: 'Arremesso Múltiplo',
    category: 'combate',
    prerequisites: 'Des 1, Estilo de Arremesso',
    description: 'Uma vez por rodada, quando faz um ataque com uma arma de arremesso, você pode gastar 1 PM para fazer um ataque adicional contra o mesmo alvo, arremessando outra arma de arremesso.',
    source: 'Tormenta 20 JdA',
    tags: ['Arremesso', 'Ataque Adicional']
  },
  {
    id: 'arremesso-potente',
    slug: 'arremesso-potente',
    name: 'Arremesso Potente',
    category: 'combate',
    prerequisites: 'For 1, Estilo de Arremesso',
    description: 'Quando usa uma arma de arremesso, você pode usar sua Força em vez de Destreza nos testes de ataque. Se você possuir o poder Ataque Poderoso, poderá usá-lo com armas de arremesso.',
    source: 'Tormenta 20 JdA',
    tags: ['Arremesso', 'Força']
  },
  {
    id: 'ataque-com-escudo',
    slug: 'ataque-com-escudo',
    name: 'Ataque com Escudo',
    category: 'combate',
    prerequisites: 'Estilo de Arma e Escudo',
    description: 'Uma vez por rodada, se estiver empunhando um escudo e fizer a ação agredir, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com o escudo. Este ataque não faz você perder o bônus do escudo na Defesa.',
    source: 'Tormenta 20 JdA',
    tags: ['Escudo', 'Ataque Adicional']
  },
  {
    id: 'ataque-pesado',
    slug: 'ataque-pesado',
    name: 'Ataque Pesado',
    category: 'combate',
    prerequisites: 'Estilo de Duas Mãos',
    description: 'Quando faz um ataque corpo a corpo com uma arma de duas mãos, você pode pagar 1 PM. Se fizer isso e acertar o ataque, além do dano você faz uma manobra derrubar ou empurrar contra o alvo como uma ação livre (use o resultado do ataque como o teste de manobra).',
    source: 'Tormenta 20 JdA',
    tags: ['Duas Mãos', 'Manobra']
  },
  {
    id: 'ataque-poderoso',
    slug: 'ataque-poderoso',
    name: 'Ataque Poderoso',
    category: 'combate',
    prerequisites: 'For 1',
    description: 'Sempre que faz um ataque corpo a corpo, você pode sofrer –2 no teste de ataque para receber +5 na rolagem de dano.',
    source: 'Tormenta 20 JdA',
    tags: ['Dano', 'Ataque']
  },
  {
    id: 'ataque-preciso',
    slug: 'ataque-preciso',
    name: 'Ataque Preciso',
    category: 'combate',
    prerequisites: 'Estilo de Uma Arma',
    description: 'Se estiver empunhando uma arma corpo a corpo em uma das mãos e nada na outra, você recebe +2 na margem de ameaça e +1 no multiplicador de crítico.',
    source: 'Tormenta 20 JdA',
    tags: ['Crítico', 'Uma Arma']
  },
  {
    id: 'bloqueio-com-escudo',
    slug: 'bloqueio-com-escudo',
    name: 'Bloqueio com Escudo',
    category: 'combate',
    prerequisites: 'Estilo de Arma e Escudo',
    description: 'Quando sofre dano, você pode gastar 1 PM para receber redução de dano igual ao bônus na Defesa que seu escudo fornece contra este dano. Você só pode usar este poder se estiver usando um escudo.',
    source: 'Tormenta 20 JdA',
    tags: ['Escudo', 'Defesa', 'Redução de Dano']
  },
  {
    id: 'carga-de-cavalaria',
    slug: 'carga-de-cavalaria',
    name: 'Carga de Cavalaria',
    category: 'combate',
    prerequisites: 'Ginete',
    description: 'Quando faz uma investida montada, você causa +2d8 pontos de dano. Além disso, pode continuar se movendo depois do ataque. Você deve se mover em linha reta e seu movimento máximo ainda é o dobro do seu deslocamento.',
    source: 'Tormenta 20 JdA',
    tags: ['Montaria', 'Investida', 'Dano']
  },
  {
    id: 'combate-defensivo',
    slug: 'combate-defensivo',
    name: 'Combate Defensivo',
    category: 'combate',
    prerequisites: 'Int 1',
    description: 'Quando usa a ação agredir, você pode usar este poder. Se fizer isso, até seu próximo turno, sofre –2 em todos os testes de ataque, mas recebe +5 na Defesa.',
    source: 'Tormenta 20 JdA',
    tags: ['Defesa', 'Ataque']
  },
  {
    id: 'derrubar-aprimorado',
    slug: 'derrubar-aprimorado',
    name: 'Derrubar Aprimorado',
    category: 'combate',
    prerequisites: 'Combate Defensivo',
    description: 'Você recebe +2 em testes de ataque para derrubar. Quando derruba uma criatura com essa manobra, pode gastar 1 PM para fazer um ataque extra contra ela.',
    source: 'Tormenta 20 JdA',
    tags: ['Manobra', 'Derrubar']
  },
  {
    id: 'desarmar-aprimorado',
    slug: 'desarmar-aprimorado',
    name: 'Desarmar Aprimorado',
    category: 'combate',
    prerequisites: 'Combate Defensivo',
    description: 'Você recebe +2 em testes de ataque para desarmar. Quando desarma uma criatura, pode gastar 1 PM para arremessar a arma dela para longe (role 1d8 para direção e 1d6 para distância em quadrados de 1,5m).',
    source: 'Tormenta 20 JdA',
    tags: ['Manobra', 'Desarmar']
  },
  {
    id: 'disparo-preciso',
    slug: 'disparo-preciso',
    name: 'Disparo Preciso',
    category: 'combate',
    prerequisites: 'Estilo de Disparo ou Estilo de Arremesso',
    description: 'Você pode fazer ataques à distância contra oponentes envolvidos em combate corpo a corpo sem sofrer a penalidade de –5 no teste de ataque.',
    source: 'Tormenta 20 JdA',
    tags: ['Disparo', 'Precisão']
  },
  {
    id: 'disparo-rapido',
    slug: 'disparo-rapido',
    name: 'Disparo Rápido',
    category: 'combate',
    prerequisites: 'Des 1, Estilo de Disparo',
    description: 'Se estiver empunhando uma arma de disparo que possa recarregar como ação livre e gastar uma ação completa para agredir, pode fazer um ataque adicional com ela. Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno.',
    source: 'Tormenta 20 JdA',
    tags: ['Disparo', 'Ataque Adicional']
  },
  {
    id: 'empunhadura-poderosa',
    slug: 'empunhadura-poderosa',
    name: 'Empunhadura Poderosa',
    category: 'combate',
    prerequisites: 'For 3',
    description: 'Ao usar uma arma feita para uma categoria de tamanho maior que a sua, a penalidade que você sofre nos testes de ataque diminui para –2 (normalmente –5).',
    source: 'Tormenta 20 JdA',
    tags: ['Armas', 'Tamanho']
  },
  {
    id: 'encouracado',
    slug: 'encouracado',
    name: 'Encouraçado',
    category: 'combate',
    prerequisites: 'Proficiência com armaduras pesadas',
    description: 'Se estiver usando uma armadura pesada, você recebe +2 na Defesa. Esse bônus aumenta em +2 para cada outro poder que você possua que tenha Encouraçado como pré-requisito.',
    source: 'Tormenta 20 JdA',
    tags: ['Armadura Pesada', 'Defesa']
  },
  {
    id: 'esquiva',
    slug: 'esquiva',
    name: 'Esquiva',
    category: 'combate',
    prerequisites: 'Des 1',
    description: 'Você recebe +2 na Defesa e Reflexos.',
    source: 'Tormenta 20 JdA',
    tags: ['Defesa', 'Reflexos']
  },
  {
    id: 'estilo-de-arma-e-escudo',
    slug: 'estilo-de-arma-e-escudo',
    name: 'Estilo de Arma e Escudo',
    category: 'combate',
    prerequisites: 'Treinado em Luta, proficiência com escudos',
    description: 'Se você estiver usando um escudo, o bônus na Defesa que ele fornece aumenta em +2.',
    source: 'Tormenta 20 JdA',
    tags: ['Escudo', 'Defesa']
  },
  {
    id: 'estilo-de-arma-longa',
    slug: 'estilo-de-arma-longa',
    name: 'Estilo de Arma Longa',
    category: 'combate',
    prerequisites: 'For 1, treinado em Luta',
    description: 'Você recebe +2 em testes de ataque com armas alongadas e pode atacar alvos adjacentes com essas armas.',
    source: 'Tormenta 20 JdA',
    tags: ['Arma Alongada', 'Alcance']
  },
  {
    id: 'estilo-de-arremesso',
    slug: 'estilo-de-arremesso',
    name: 'Estilo de Arremesso',
    category: 'combate',
    prerequisites: 'Treinado em Pontaria',
    description: 'Você pode sacar armas de arremesso como uma ação livre e recebe +2 nas rolagens de dano com elas. Se também possuir o poder Saque Rápido, também recebe +2 nos testes de ataque com essas armas.',
    source: 'Tormenta 20 JdA',
    tags: ['Arremesso', 'Dano']
  },
  {
    id: 'estilo-de-disparo',
    slug: 'estilo-de-disparo',
    name: 'Estilo de Disparo',
    category: 'combate',
    prerequisites: 'Treinado em Pontaria',
    description: 'Se estiver usando uma arma de disparo, você soma sua Destreza nas rolagens de dano.',
    source: 'Tormenta 20 JdA',
    tags: ['Disparo', 'Dano', 'Destreza']
  },
  {
    id: 'estilo-de-duas-armas',
    slug: 'estilo-de-duas-armas',
    name: 'Estilo de Duas Armas',
    category: 'combate',
    prerequisites: 'Des 2, treinado em Luta',
    description: 'Se estiver empunhando duas armas (e pelo menos uma delas for leve) e fizer a ação agredir, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno. Se possuir Ambidestria, em vez disso não sofre penalidade para usá-lo.',
    source: 'Tormenta 20 JdA',
    tags: ['Duas Armas', 'Ataque Adicional']
  },
  {
    id: 'estilo-de-duas-maos',
    slug: 'estilo-de-duas-maos',
    name: 'Estilo de Duas Mãos',
    category: 'combate',
    prerequisites: 'For 2, treinado em Luta',
    description: 'Se estiver usando uma arma corpo a corpo com as duas mãos, você recebe +5 nas rolagens de dano. Este poder não pode ser usado com armas leves.',
    source: 'Tormenta 20 JdA',
    tags: ['Duas Mãos', 'Dano']
  },
  {
    id: 'estilo-de-uma-arma',
    slug: 'estilo-de-uma-arma',
    name: 'Estilo de Uma Arma',
    category: 'combate',
    prerequisites: 'Treinado em Luta',
    description: 'Se estiver usando uma arma corpo a corpo em uma das mãos e nada na outra, você recebe +2 na Defesa e nos testes de ataque com essa arma (exceto ataques desarmados).',
    source: 'Tormenta 20 JdA',
    tags: ['Uma Arma', 'Defesa', 'Ataque']
  },
  {
    id: 'estilo-desarmado',
    slug: 'estilo-desarmado',
    name: 'Estilo Desarmado',
    category: 'combate',
    prerequisites: 'Treinado em Luta',
    description: 'Seus ataques desarmados causam 1d6 pontos de dano e podem causar dano letal ou não letal (sem penalidades).',
    source: 'Tormenta 20 JdA',
    tags: ['Desarmado', 'Dano']
  },
  {
    id: 'fanatico',
    slug: 'fanatico',
    name: 'Fanático',
    category: 'combate',
    prerequisites: '12º nível de personagem, Encouraçado',
    description: 'Seu deslocamento não é reduzido por usar armaduras pesadas.',
    source: 'Tormenta 20 JdA',
    tags: ['Armadura Pesada', 'Deslocamento']
  },
  {
    id: 'finta-aprimorada',
    slug: 'finta-aprimorada',
    name: 'Finta Aprimorada',
    category: 'combate',
    prerequisites: 'Treinado em Enganação',
    description: 'Você recebe +2 em testes de Enganação para fintar e pode fintar como uma ação de movimento.',
    source: 'Tormenta 20 JdA',
    tags: ['Finta', 'Enganação']
  },
  {
    id: 'foco-em-arma',
    slug: 'foco-em-arma',
    name: 'Foco em Arma',
    category: 'combate',
    prerequisites: 'Proficiência com a arma escolhida',
    description: 'Escolha uma arma. Você recebe +2 em testes de ataque com essa arma. Você pode escolher este poder outras vezes para armas diferentes.',
    source: 'Tormenta 20 JdA',
    tags: ['Ataque', 'Arma']
  },
  {
    id: 'ginete',
    slug: 'ginete',
    name: 'Ginete',
    category: 'combate',
    prerequisites: 'Treinado em Cavalgar',
    description: 'Você passa automaticamente em testes de Cavalgar para não cair da montaria quando sofre dano. Além disso, não sofre penalidades para atacar à distância ou lançar magias quando montado.',
    source: 'Tormenta 20 JdA',
    tags: ['Montaria', 'Cavalgar']
  },
  {
    id: 'inexpugnavel',
    slug: 'inexpugnavel',
    name: 'Inexpugnável',
    category: 'combate',
    prerequisites: 'Encouraçado, 6º nível de personagem',
    description: 'Se estiver usando uma armadura pesada, você recebe +2 em todos os testes de resistência.',
    source: 'Tormenta 20 JdA',
    tags: ['Armadura Pesada', 'Resistência']
  },
  {
    id: 'mira-apurada',
    slug: 'mira-apurada',
    name: 'Mira Apurada',
    category: 'combate',
    prerequisites: 'Sab 1, Disparo Preciso',
    description: 'Quando usa a ação mirar, você recebe +2 em testes de ataque e na margem de ameaça com ataques à distância até o fim do turno.',
    source: 'Tormenta 20 JdA',
    tags: ['Disparo', 'Mira', 'Crítico']
  },
  {
    id: 'piqueiro',
    slug: 'piqueiro',
    name: 'Piqueiro',
    category: 'combate',
    prerequisites: 'Estilo de Arma Longa',
    description: 'Uma vez por rodada, se estiver empunhando uma arma alongada e um inimigo entrar voluntariamente em seu alcance corpo a corpo, você pode gastar 1 PM para fazer um ataque corpo a corpo contra este oponente com esta arma. Se o oponente tiver se aproximado fazendo uma investida, seu ataque causa dois dados de dano extra do mesmo tipo.',
    source: 'Tormenta 20 JdA',
    tags: ['Arma Alongada', 'Reação']
  },
  {
    id: 'presenca-aterradora',
    slug: 'presenca-aterradora',
    name: 'Presença Aterradora',
    category: 'combate',
    prerequisites: 'Treinado em Intimidação',
    description: 'Você pode gastar uma ação padrão e 1 PM para assustar todas as criaturas a sua escolha em alcance curto. Veja a perícia Intimidação para as regras de assustar.',
    source: 'Tormenta 20 JdA',
    tags: ['Medo', 'Intimidação', 'Área']
  },
  {
    id: 'proficiencia',
    slug: 'proficiencia',
    name: 'Proficiência',
    category: 'combate',
    prerequisites: 'Nenhum',
    description: 'Escolha uma proficiência: armas marciais, armas de fogo, armaduras pesadas ou escudos (se for proficiente em armas marciais, você também pode escolher armas exóticas). Você recebe essa proficiência. Você pode escolher este poder outras vezes para proficiências diferentes.',
    source: 'Tormenta 20 JdA',
    tags: ['Equipamento', 'Proficiência']
  },
  {
    id: 'quebrar-aprimorado',
    slug: 'quebrar-aprimorado',
    name: 'Quebrar Aprimorado',
    category: 'combate',
    prerequisites: 'Ataque Poderoso',
    description: 'Você recebe +2 em testes de ataque para quebrar. Quando reduz os PV de uma arma para 0 ou menos, você pode gastar 1 PM para realizar um ataque extra contra o usuário dela. O ataque adicional usa os mesmos valores de ataque e dano, mas os dados devem ser rolados novamente.',
    source: 'Tormenta 20 JdA',
    tags: ['Manobra', 'Quebrar']
  },
  {
    id: 'reflexos-de-combate',
    slug: 'reflexos-de-combate',
    name: 'Reflexos de Combate',
    category: 'combate',
    prerequisites: 'Des 1',
    description: 'Você ganha uma ação de movimento extra no seu primeiro turno de cada combate.',
    source: 'Tormenta 20 JdA',
    tags: ['Iniciativa', 'Movimento']
  },
  {
    id: 'saque-rapido',
    slug: 'saque-rapido',
    name: 'Saque Rápido',
    category: 'combate',
    prerequisites: 'Treinado em Iniciativa',
    description: 'Você recebe +2 em Iniciativa e pode sacar ou guardar itens como uma ação livre (em vez de ação de movimento). Além disso, a ação que você gasta para recarregar armas de disparo diminui em uma categoria (ação completa para padrão, padrão para movimento, movimento para livre).',
    source: 'Tormenta 20 JdA',
    tags: ['Iniciativa', 'Recarga', 'Equipamento']
  },
  {
    id: 'trespassar',
    slug: 'trespassar',
    name: 'Trespassar',
    category: 'combate',
    prerequisites: 'Ataque Poderoso',
    description: 'Quando você faz um ataque corpo a corpo e reduz os pontos de vida do alvo para 0 ou menos, pode gastar 1 PM para fazer um ataque adicional contra outra criatura dentro do seu alcance.',
    source: 'Tormenta 20 JdA',
    tags: ['Ataque Adicional', 'Golpe']
  },
  {
    id: 'vitalidade',
    slug: 'vitalidade',
    name: 'Vitalidade',
    category: 'combate',
    prerequisites: 'Con 1',
    description: 'Você recebe +1 PV por nível de personagem e +2 em Fortitude.',
    source: 'Tormenta 20 JdA',
    tags: ['Pontos de Vida', 'Fortitude']
  },

  // ==========================================
  // --- PODERES DE DESTINO (20 Poderes) ---
  // ==========================================
  {
    id: 'acrobatico',
    slug: 'acrobatico',
    name: 'Acrobático',
    category: 'destino',
    prerequisites: 'Des 2',
    description: 'Você pode usar sua Destreza em vez de Força em testes de Atletismo. Além disso, terreno difícil não reduz seu deslocamento nem o impede de realizar investidas.',
    source: 'Tormenta 20 JdA',
    tags: ['Acrobacia', 'Atletismo', 'Mobilidade']
  },
  {
    id: 'ao-sabor-do-destino',
    slug: 'ao-sabor-do-destino',
    name: 'Ao Sabor do Destino',
    category: 'destino',
    prerequisites: '6º nível de personagem',
    description: 'Confiando em suas próprias habilidades (ou em sua própria sorte), você abre mão de usar itens mágicos permanentes e recebe progressões em bônus de perícias, Defesa, dano e atributos por nível (veja tabela página 136).',
    source: 'Tormenta 20 JdA',
    tags: ['Sorte', 'Progressão']
  },
  {
    id: 'aparencia-inofensiva',
    slug: 'aparencia-inofensiva',
    name: 'Aparência Inofensiva',
    category: 'destino',
    prerequisites: 'Car 1',
    description: 'A primeira criatura inteligente (Int –3 ou maior) que atacar você em uma cena deve fazer um teste de Vontade (CD Car). Se falhar, perderá sua ação. Este poder só funciona uma vez por cena.',
    source: 'Tormenta 20 JdA',
    tags: ['Defesa', 'Carisma', 'Social']
  },
  {
    id: 'atletico',
    slug: 'atletico',
    name: 'Atlético',
    category: 'destino',
    prerequisites: 'For 2',
    description: 'Você recebe +2 em Atletismo e +3m em seu deslocamento.',
    source: 'Tormenta 20 JdA',
    tags: ['Atletismo', 'Deslocamento']
  },
  {
    id: 'atraente',
    slug: 'atraente',
    name: 'Atraente',
    category: 'destino',
    prerequisites: 'Car 1',
    description: 'Você recebe +2 em testes de perícias baseadas em Carisma contra criaturas que possam se sentir fisicamente atraídas por você.',
    source: 'Tormenta 20 JdA',
    tags: ['Social', 'Carisma']
  },
  {
    id: 'comandar',
    slug: 'comandar',
    name: 'Comandar',
    category: 'destino',
    prerequisites: 'Car 1',
    description: 'Você pode gastar uma ação de movimento e 1 PM para gritar ordens para seus aliados em alcance médio. Eles recebem +1 em testes de perícia até o fim da cena.',
    source: 'Tormenta 20 JdA',
    tags: ['Liderança', 'Suporte', 'Carisma']
  },
  {
    id: 'costas-largas',
    slug: 'costas-largas',
    name: 'Costas Largas',
    category: 'destino',
    prerequisites: 'Con 1, For 1',
    description: 'Seu limite de carga aumenta em 5 espaços e você pode se beneficiar de um item vestido adicional.',
    source: 'Tormenta 20 JdA',
    tags: ['Inventário', 'Carga']
  },
  {
    id: 'foco-em-pericia',
    slug: 'foco-em-pericia',
    name: 'Foco em Perícia',
    category: 'destino',
    prerequisites: 'Treinado na perícia escolhida',
    description: 'Escolha uma perícia. Quando faz um teste dessa perícia, você pode gastar 1 PM para rolar dois dados e usar o melhor resultado. Você pode escolher este poder outras vezes para perícias diferentes (não pode ser aplicado em Luta e Pontaria).',
    source: 'Tormenta 20 JdA',
    tags: ['Perícia', 'Rerolagem']
  },
  {
    id: 'inventario-organizado',
    slug: 'inventario-organizado',
    name: 'Inventário Organizado',
    category: 'destino',
    prerequisites: 'Int 1',
    description: 'Você soma sua Inteligência no limite de espaços que pode carregar. Para você, itens muito leves ou pequenos, que normalmente ocupam meio espaço, em vez disso ocupam 1/4 de espaço.',
    source: 'Tormenta 20 JdA',
    tags: ['Inventário', 'Inteligência']
  },
  {
    id: 'investigador',
    slug: 'investigador',
    name: 'Investigador',
    category: 'destino',
    prerequisites: 'Int 1',
    description: 'Você recebe +2 em Investigação e soma sua Inteligência em Intuição.',
    source: 'Tormenta 20 JdA',
    tags: ['Investigação', 'Intuição', 'Inteligência']
  },
  {
    id: 'lobo-solitario',
    slug: 'lobo-solitario',
    name: 'Lobo Solitário',
    category: 'destino',
    prerequisites: 'Nenhum',
    description: 'Você recebe +1 em testes de perícia e Defesa se estiver sem nenhum aliado em alcance curto. Você não sofre penalidade por usar Cura em si mesmo.',
    source: 'Tormenta 20 JdA',
    tags: ['Solo', 'Defesa', 'Perícia']
  },
  {
    id: 'medicina',
    slug: 'medicina',
    name: 'Medicina',
    category: 'destino',
    prerequisites: 'Sab 1, treinado em Cura',
    description: 'Você pode gastar uma ação completa para fazer um teste de Cura (CD 15) em uma criatura. Se você passar, ela recupera 1d6 PV, mais 1d6 para cada 5 pontos pelos quais o resultado do teste exceder a CD (apenas uma vez por dia numa mesma criatura).',
    source: 'Tormenta 20 JdA',
    tags: ['Cura', 'Medicina']
  },
  {
    id: 'parceiro',
    slug: 'parceiro',
    name: 'Parceiro',
    category: 'destino',
    prerequisites: 'Treinado em Adestramento (parceiro animal) ou Diplomacia (parceiro humanoide), 5º nível de personagem',
    description: 'Você possui um parceiro animal ou humanoide que o acompanha em aventuras. Em termos de jogo, é um parceiro iniciante de um tipo a sua escolha.',
    source: 'Tormenta 20 JdA',
    tags: ['Aliado', 'Parceiro']
  },
  {
    id: 'sentidos-agucados',
    slug: 'sentidos-agucados',
    name: 'Sentidos Aguçados',
    category: 'destino',
    prerequisites: 'Sab 1, treinado em Percepção',
    description: 'Você recebe +2 em Percepção, não fica desprevenido contra inimigos que não possa ver e, sempre que erra um ataque devido a camuflagem, pode rolar mais uma vez o dado da chance de falha.',
    source: 'Tormenta 20 JdA',
    tags: ['Percepção', 'Sentidos']
  },
  {
    id: 'sortudo',
    slug: 'sortudo',
    name: 'Sortudo',
    category: 'destino',
    prerequisites: 'Nenhum',
    description: 'Você pode gastar 3 PM para rolar novamente um teste recém realizado (apenas uma vez por teste).',
    source: 'Tormenta 20 JdA',
    tags: ['Sorte', 'Rerolagem']
  },
  {
    id: 'surto-heroico',
    slug: 'surto-heroico',
    name: 'Surto Heroico',
    category: 'destino',
    prerequisites: 'Nenhum',
    description: 'Uma vez por rodada, você pode gastar 5 PM para realizar uma ação padrão ou de movimento adicional.',
    source: 'Tormenta 20 JdA',
    tags: ['Ação Adicional', 'Heroísmo']
  },
  {
    id: 'torcida',
    slug: 'torcida',
    name: 'Torcida',
    category: 'destino',
    prerequisites: 'Car 1',
    description: 'Você recebe +2 em testes de perícia e Defesa quando tem a torcida a seu favor (qualquer número de criaturas inteligentes em alcance médio torcendo por você sem realizar outra ação).',
    source: 'Tormenta 20 JdA',
    tags: ['Carisma', 'Bônus', 'Social']
  },
  {
    id: 'treinamento-em-pericia',
    slug: 'treinamento-em-pericia',
    name: 'Treinamento em Perícia',
    category: 'destino',
    prerequisites: 'Nenhum',
    description: 'Você se torna treinado em uma perícia a sua escolha. Você pode escolher este poder outras vezes para perícias diferentes.',
    source: 'Tormenta 20 JdA',
    tags: ['Perícia', 'Treinamento']
  },
  {
    id: 'veneficio',
    slug: 'veneficio',
    name: 'Venefício',
    category: 'destino',
    prerequisites: 'Treinado em Ofício (alquimista)',
    description: 'Quando usa um veneno, você não corre risco de se envenenar acidentalmente. Além disso, a CD para resistir aos seus venenos aumenta em +2.',
    source: 'Tormenta 20 JdA',
    tags: ['Veneno', 'Alquimia']
  },
  {
    id: 'vontade-de-ferro',
    slug: 'vontade-de-ferro',
    name: 'Vontade de Ferro',
    category: 'destino',
    prerequisites: 'Sab 1',
    description: 'Você recebe +1 PM para cada dois níveis de personagem e +2 em Vontade.',
    source: 'Tormenta 20 JdA',
    tags: ['Pontos de Mana', 'Vontade']
  },

  // ==========================================
  // --- PODERES DE MAGIA (8 Poderes) ---
  // ==========================================
  {
    id: 'celebrar-ritual',
    slug: 'celebrar-ritual',
    name: 'Celebrar Ritual',
    category: 'magia',
    prerequisites: 'Habilidade Magias, treinado em Misticismo ou Religião, 8º nível de personagem',
    description: 'Você pode lançar magias como rituais. Isso dobra seu limite de PM, mas muda a execução para 1 hora (ou o dobro, o que for maior) e exige um gasto de T$ 10 por PM gasto (em incensos, oferendas...). Magias lançadas como rituais não podem ser armazenadas em itens.',
    source: 'Tormenta 20 JdA',
    tags: ['Ritual', 'Limite de PM']
  },
  {
    id: 'escrever-pergaminho',
    slug: 'escrever-pergaminho',
    name: 'Escrever Pergaminho',
    category: 'magia',
    prerequisites: 'Habilidade Magias, treinado em Ofício (escriba)',
    description: 'Você pode usar a perícia Ofício (escriba) para fabricar pergaminhos com magias que conheça.',
    source: 'Tormenta 20 JdA',
    tags: ['Pergaminho', 'Ofício', 'Item Mágico']
  },
  {
    id: 'foco-em-magia',
    slug: 'foco-em-magia',
    name: 'Foco em Magia',
    category: 'magia',
    prerequisites: 'Lançar magias',
    description: 'Escolha uma magia que possa lançar. Seu custo diminui em –1 PM (cumulativo com outras reduções de custo). Você pode escolher este poder outras vezes para magias diferentes.',
    source: 'Tormenta 20 JdA',
    tags: ['Economia de Mana', 'Magia']
  },
  {
    id: 'magia-acelerada',
    slug: 'magia-acelerada',
    name: 'Magia Acelerada',
    category: 'magia',
    prerequisites: 'Lançar magias de 2º círculo',
    description: 'Aprimoramento: Muda a execução da magia para ação livre. Você só pode aplicar este aprimoramento em magias com execução de movimento, padrão ou completa e só pode lançar uma magia como ação livre por rodada. Custo: +4 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Aprimoramento', 'Ação Livre']
  },
  {
    id: 'magia-ampliada',
    slug: 'magia-ampliada',
    name: 'Magia Ampliada',
    category: 'magia',
    prerequisites: 'Lançar magias',
    description: 'Aprimoramento: Aumenta o alcance da magia em um passo (de curto para médio, de médio para longo) ou dobra a área de efeito da magia. Custo: +2 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Aprimoramento', 'Alcance', 'Área']
  },
  {
    id: 'magia-discreta',
    slug: 'magia-discreta',
    name: 'Magia Discreta',
    category: 'magia',
    prerequisites: 'Lançar magias',
    description: 'Aprimoramento: Você lança a magia sem gesticular e falar, usando apenas concentração. Isso permite lançar magias com as mãos presas, amordaçado etc. Também permite lançar magias arcanas usando armadura sem teste de Misticismo. Outros personagens só percebem que você lançou uma magia se passarem num teste de Misticismo (CD 20). Custo: +2 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Aprimoramento', 'Furtividade', 'Armadura']
  },
  {
    id: 'magia-ilimitada',
    slug: 'magia-ilimitada',
    name: 'Magia Ilimitada',
    category: 'magia',
    prerequisites: 'Lançar magias',
    description: 'Você soma seu atributo-chave no limite de PM que pode gastar numa magia. Por exemplo, um arcanista de 5º nível com Int 4 e este poder pode gastar até 9 PM em cada magia.',
    source: 'Tormenta 20 JdA',
    tags: ['Limite de PM', 'Atributo-Chave']
  },
  {
    id: 'preparar-pocao',
    slug: 'preparar-pocao',
    name: 'Preparar Poção',
    category: 'magia',
    prerequisites: 'Habilidade Magias, treinado em Ofício (alquimista)',
    description: 'Você pode usar a perícia Ofício (alquimista) para fabricar poções com magias que conheça de 1º e 2º círculos.',
    source: 'Tormenta 20 JdA',
    tags: ['Poção', 'Ofício', 'Item Mágico']
  },

  // ==========================================
  // --- PODERES CONCEDIDOS (64 Poderes) ---
  // ==========================================
  {
    id: 'afinidade-com-a-tormenta',
    slug: 'afinidade-com-a-tormenta',
    name: 'Afinidade com a Tormenta',
    category: 'concedidos',
    prerequisites: 'Devoto de Aharadak',
    description: 'Você recebe +10 em testes de resistência contra efeitos da Tormenta, de suas criaturas e de devotos de Aharadak. Além disso, seu primeiro poder da Tormenta não conta para perda de Carisma.',
    source: 'Tormenta 20 JdA',
    tags: ['Aharadak', 'Tormenta', 'Resistência']
  },
  {
    id: 'almejar-o-impossivel',
    slug: 'almejar-o-impossivel',
    name: 'Almejar o Impossível',
    category: 'concedidos',
    prerequisites: 'Devoto de Thwor ou Valkaria',
    description: 'Quando faz um teste de perícia, um resultado de 19 ou mais no dado sempre é um sucesso, não importando o valor a ser alcançado.',
    source: 'Tormenta 20 JdA',
    tags: ['Thwor', 'Valkaria', 'Perícia', 'Sucesso']
  },
  {
    id: 'anfibio',
    slug: 'anfibio',
    name: 'Anfíbio',
    category: 'concedidos',
    prerequisites: 'Devoto de Oceano',
    description: 'Você pode respirar embaixo d’água e adquire deslocamento de natação igual a seu deslocamento terrestre.',
    source: 'Tormenta 20 JdA',
    tags: ['Oceano', 'Aquático', 'Natação']
  },
  {
    id: 'apostar-com-o-trapaceiro',
    slug: 'apostar-com-o-trapaceiro',
    name: 'Apostar com o Trapaceiro',
    category: 'concedidos',
    prerequisites: 'Devoto de Hyninn',
    description: 'Quando faz um teste de perícia, você pode gastar 1 PM para apostar com Hyninn. Você e o mestre rolam 1d20, mas o mestre mantém o resultado dele em segredo. Você então escolhe entre usar seu próprio resultado ou o resultado oculto do mestre (neste caso, ele revela o resultado).',
    source: 'Tormenta 20 JdA',
    tags: ['Hyninn', 'Sorte', 'Perícia']
  },
  {
    id: 'armas-da-ambicao',
    slug: 'armas-da-ambicao',
    name: 'Armas da Ambição',
    category: 'concedidos',
    prerequisites: 'Devoto de Valkaria',
    description: 'Você recebe +1 em testes de ataque e na margem de ameaça com armas nas quais é proficiente.',
    source: 'Tormenta 20 JdA',
    tags: ['Valkaria', 'Ataque', 'Crítico']
  },
  {
    id: 'arsenal-das-profundezas',
    slug: 'arsenal-das-profundezas',
    name: 'Arsenal das Profundezas',
    category: 'concedidos',
    prerequisites: 'Devoto de Oceano',
    description: 'Você recebe +2 nas rolagens de dano com azagaias, lanças e tridentes e seu multiplicador de crítico com essas armas aumenta em +1.',
    source: 'Tormenta 20 JdA',
    tags: ['Oceano', 'Dano', 'Crítico', 'Armas']
  },
  {
    id: 'astucia-da-serpente',
    slug: 'astucia-da-serpente',
    name: 'Astúcia da Serpente',
    category: 'concedidos',
    prerequisites: 'Devoto de Sszzaas',
    description: 'Você recebe +2 em Enganação, Furtividade e Intuição.',
    source: 'Tormenta 20 JdA',
    tags: ['Sszzaas', 'Enganação', 'Furtividade', 'Intuição']
  },
  {
    id: 'ataque-piedoso',
    slug: 'ataque-piedoso',
    name: 'Ataque Piedoso',
    category: 'concedidos',
    prerequisites: 'Devoto de Lena ou Thyatis',
    description: 'Você pode usar armas corpo a corpo para causar dano não letal sem sofrer a penalidade de –5 no teste de ataque.',
    source: 'Tormenta 20 JdA',
    tags: ['Lena', 'Thyatis', 'Não Letal']
  },
  {
    id: 'aura-de-medo',
    slug: 'aura-de-medo',
    name: 'Aura de Medo',
    category: 'concedidos',
    prerequisites: 'Devoto de Kallyadranoch',
    description: 'Você pode gastar 2 PM para gerar uma aura de medo de 9m de raio e duração até o fim da cena. Todos os inimigos que entrem na aura devem fazer um teste de Vontade (CD Car) ou ficam abalados até o fim da cena. Uma criatura que passe no teste de Vontade fica imune a esta habilidade por um dia.',
    source: 'Tormenta 20 JdA',
    tags: ['Kallyadranoch', 'Medo', 'Aura']
  },
  {
    id: 'aura-de-paz',
    slug: 'aura-de-paz',
    name: 'Aura de Paz',
    category: 'concedidos',
    prerequisites: 'Devoto de Marah',
    description: 'Você pode gastar 2 PM para gerar uma aura de paz com alcance curto e duração de uma cena. Qualquer inimigo dentro da aura que tente fazer uma ação hostil contra você deve fazer um teste de Vontade (CD Car). Se falhar, perderá sua ação. Se passar, fica imune a esta habilidade por um dia.',
    source: 'Tormenta 20 JdA',
    tags: ['Marah', 'Paz', 'Defesa', 'Aura']
  },
  {
    id: 'aura-restauradora',
    slug: 'aura-restauradora',
    name: 'Aura Restauradora',
    category: 'concedidos',
    prerequisites: 'Devoto de Lena',
    description: 'Efeitos de cura usados por você e seus aliados em alcance curto recuperam +1 PV por dado.',
    source: 'Tormenta 20 JdA',
    tags: ['Lena', 'Cura', 'Aura']
  },
  {
    id: 'bencao-do-mana',
    slug: 'bencao-do-mana',
    name: 'Bênção do Mana',
    category: 'concedidos',
    prerequisites: 'Devoto de Wynna',
    description: 'Você recebe +1 PM a cada nível ímpar.',
    source: 'Tormenta 20 JdA',
    tags: ['Wynna', 'Pontos de Mana']
  },
  {
    id: 'caricia-sombria',
    slug: 'caricia-sombria',
    name: 'Carícia Sombria',
    category: 'concedidos',
    prerequisites: 'Devoto de Tenebra',
    description: 'Você pode gastar 1 PM e uma ação padrão para cobrir sua mão com energia negativa e tocar uma criatura em alcance corpo a corpo. A criatura sofre 2d6 pontos de dano de trevas (Fortitude CD Sab reduz à metade) e você recupera PV iguais à metade do dano causado. Você pode aprender Toque Vampírico como uma magia divina. Se fizer isso, o custo dela diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Tenebra', 'Trevas', 'Dano', 'Cura']
  },
  {
    id: 'centelha-magica',
    slug: 'centelha-magica',
    name: 'Centelha Mágica',
    category: 'concedidos',
    prerequisites: 'Devoto de Wynna',
    description: 'Escolha uma magia arcana ou divina de 1º círculo. Você aprende e pode lançar essa magia.',
    source: 'Tormenta 20 JdA',
    tags: ['Wynna', 'Magia']
  },
  {
    id: 'compreender-os-ermos',
    slug: 'compreender-os-ermos',
    name: 'Compreender os Ermos',
    category: 'concedidos',
    prerequisites: 'Devoto de Allihanna',
    description: 'Você recebe +2 em Sobrevivência e pode usar Sabedoria para Adestramento (em vez de Carisma).',
    source: 'Tormenta 20 JdA',
    tags: ['Allihanna', 'Sobrevivência', 'Adestramento']
  },
  {
    id: 'conhecimento-enciclopedico',
    slug: 'conhecimento-enciclopedico',
    name: 'Conhecimento Enciclopédico',
    category: 'concedidos',
    prerequisites: 'Devoto de Tanna-Toh',
    description: 'Você se torna treinado em duas perícias baseadas em Inteligência a sua escolha.',
    source: 'Tormenta 20 JdA',
    tags: ['Tanna-Toh', 'Perícia', 'Inteligência']
  },
  {
    id: 'conjurar-arma',
    slug: 'conjurar-arma',
    name: 'Conjurar Arma',
    category: 'concedidos',
    prerequisites: 'Devoto de Arsenal',
    description: 'Você pode gastar 1 PM para invocar uma arma corpo a corpo ou de arremesso com a qual seja proficiente. A arma surge em sua mão, fornece +1 em testes de ataque e rolagens de dano, é considerada mágica e dura pela cena. Você não pode criar armas de disparo, mas pode criar 20 munições.',
    source: 'Tormenta 20 JdA',
    tags: ['Arsenal', 'Armas', 'Magia']
  },
  {
    id: 'coragem-total',
    slug: 'coragem-total',
    name: 'Coragem Total',
    category: 'concedidos',
    prerequisites: 'Devoto de Arsenal, Khalmyr, Lin-Wu ou Valkaria',
    description: 'Você é imune a efeitos de medo, mágicos ou não. Este poder não elimina fobias raciais (como o medo de altura dos minotauros).',
    source: 'Tormenta 20 JdA',
    tags: ['Arsenal', 'Khalmyr', 'Lin-Wu', 'Valkaria', 'Imunidade', 'Medo']
  },
  {
    id: 'cura-gentil',
    slug: 'cura-gentil',
    name: 'Cura Gentil',
    category: 'concedidos',
    prerequisites: 'Devoto de Lena',
    description: 'Você soma seu Carisma aos PV restaurados por seus efeitos mágicos de cura.',
    source: 'Tormenta 20 JdA',
    tags: ['Lena', 'Cura', 'Carisma']
  },
  {
    id: 'curandeira-perfeita',
    slug: 'curandeira-perfeita',
    name: 'Curandeira Perfeita',
    category: 'concedidos',
    prerequisites: 'Devoto de Lena',
    description: 'Você sempre pode escolher 10 em testes de Cura. Além disso, não sofre penalidade por usar essa perícia sem uma maleta de medicamentos. Se possuir o item, recebe +2 no teste de Cura (ou +5, se ele for aprimorado).',
    source: 'Tormenta 20 JdA',
    tags: ['Lena', 'Cura', 'Perícia']
  },
  {
    id: 'dedo-verde',
    slug: 'dedo-verde',
    name: 'Dedo Verde',
    category: 'concedidos',
    prerequisites: 'Devoto de Allihanna',
    description: 'Você aprende e pode lançar Controlar Plantas. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Allihanna', 'Plantas', 'Magia']
  },
  {
    id: 'descanso-natural',
    slug: 'descanso-natural',
    name: 'Descanso Natural',
    category: 'concedidos',
    prerequisites: 'Devoto de Allihanna',
    description: 'Para você, dormir ao relento conta como condição de descanso confortável.',
    source: 'Tormenta 20 JdA',
    tags: ['Allihanna', 'Descanso', 'Recuperação']
  },
  {
    id: 'dom-da-esperanca',
    slug: 'dom-da-esperanca',
    name: 'Dom da Esperança',
    category: 'concedidos',
    prerequisites: 'Devoto de Marah',
    description: 'Você soma sua Sabedoria em seus PV em vez de Constituição, e se torna imune às condições alquebrado, esmorecido e frustrado.',
    source: 'Tormenta 20 JdA',
    tags: ['Marah', 'Pontos de Vida', 'Sabedoria', 'Imunidade']
  },
  {
    id: 'dom-da-imortalidade',
    slug: 'dom-da-imortalidade',
    name: 'Dom da Imortalidade',
    category: 'concedidos',
    prerequisites: 'Devoto de Thyatis, paladino',
    description: 'Você é imortal. Sempre que morre, não importando o motivo, volta à vida após 3d6 dias. Apenas paladinos podem escolher este poder. Um personagem pode ter Dom da Imortalidade ou Dom da Ressurreição, mas não ambos.',
    source: 'Tormenta 20 JdA',
    tags: ['Thyatis', 'Paladino', 'Imortalidade']
  },
  {
    id: 'dom-da-profecia',
    slug: 'dom-da-profecia',
    name: 'Dom da Profecia',
    category: 'concedidos',
    prerequisites: 'Devoto de Thyatis',
    description: 'Você pode lançar Augúrio. Caso aprenda novamente essa magia, seu custo diminui em –1 PM. Você também pode gastar 2 PM para receber +2 em um teste.',
    source: 'Tormenta 20 JdA',
    tags: ['Thyatis', 'Augúrio', 'Profecia']
  },
  {
    id: 'dom-da-ressurreicao',
    slug: 'dom-da-ressurreicao',
    name: 'Dom da Ressurreição',
    category: 'concedidos',
    prerequisites: 'Devoto de Thyatis, clérigo',
    description: 'Você pode gastar uma ação completa e todos os PM que possui (mínimo 1 PM) para tocar o corpo de uma criatura morta há menos de um ano e ressuscitá-la. A criatura volta à vida com 1 PV e 0 PM, e perde 1 ponto de Constituição permanentemente. Este poder só pode ser usado uma vez em cada criatura. Apenas clérigos podem escolher este poder. Um personagem pode ter Dom da Imortalidade ou Dom da Ressurreição, mas não ambos.',
    source: 'Tormenta 20 JdA',
    tags: ['Thyatis', 'Clérigo', 'Ressurreição']
  },
  {
    id: 'dom-da-verdade',
    slug: 'dom-da-verdade',
    name: 'Dom da Verdade',
    category: 'concedidos',
    prerequisites: 'Devoto de Khalmyr',
    description: 'Você pode pagar 2 PM para receber +5 em testes de Intuição, e em testes de Percepção contra Enganação e Furtividade, até o fim da cena.',
    source: 'Tormenta 20 JdA',
    tags: ['Khalmyr', 'Verdade', 'Intuição', 'Percepção']
  },
  {
    id: 'escamas-draconicas',
    slug: 'escamas-draconicas',
    name: 'Escamas Dracônicas',
    category: 'concedidos',
    prerequisites: 'Devoto de Kallyadranoch',
    description: 'Você recebe +2 na Defesa e em Fortitude.',
    source: 'Tormenta 20 JdA',
    tags: ['Kallyadranoch', 'Defesa', 'Fortitude']
  },
  {
    id: 'escudo-magico',
    slug: 'escudo-magico',
    name: 'Escudo Mágico',
    category: 'concedidos',
    prerequisites: 'Devoto de Wynna',
    description: 'Quando lança uma magia, você recebe um bônus na Defesa igual ao círculo da magia lançada até o início do seu próximo turno.',
    source: 'Tormenta 20 JdA',
    tags: ['Wynna', 'Defesa', 'Magia']
  },
  {
    id: 'espada-justiceira',
    slug: 'espada-justiceira',
    name: 'Espada Justiceira',
    category: 'concedidos',
    prerequisites: 'Devoto de Khalmyr',
    description: 'Você pode gastar 1 PM para encantar sua espada (ou outra arma corpo a corpo de corte que esteja empunhando). Ela tem seu dano aumentado em um passo até o fim da cena.',
    source: 'Tormenta 20 JdA',
    tags: ['Khalmyr', 'Arma', 'Dano']
  },
  {
    id: 'espada-solar',
    slug: 'espada-solar',
    name: 'Espada Solar',
    category: 'concedidos',
    prerequisites: 'Devoto de Azgher',
    description: 'Você pode gastar 1 PM para fazer uma arma corpo a corpo de corte que esteja empunhando causar +1d6 de dano por fogo até o fim da cena.',
    source: 'Tormenta 20 JdA',
    tags: ['Azgher', 'Fogo', 'Dano', 'Arma']
  },
  {
    id: 'extase-da-loucura',
    slug: 'extase-da-loucura',
    name: 'Êxtase da Loucura',
    category: 'concedidos',
    prerequisites: 'Devoto de Aharadak ou Nimb',
    description: 'Toda vez que uma ou mais criaturas falham em um teste de Vontade contra uma de suas habilidades mágicas, você recebe 1 PM temporário cumulativo. Você pode ganhar um máximo de PM temporários por cena desta forma igual a sua Sabedoria.',
    source: 'Tormenta 20 JdA',
    tags: ['Aharadak', 'Nimb', 'Pontos de Mana', 'Loucura']
  },
  {
    id: 'familiar-ofidico',
    slug: 'familiar-ofidico',
    name: 'Familiar Ofídico',
    category: 'concedidos',
    prerequisites: 'Devoto de Sszzaas',
    description: 'Você recebe um familiar cobra (veja a página 38) que não conta em seu limite de parceiros.',
    source: 'Tormenta 20 JdA',
    tags: ['Sszzaas', 'Familiar', 'Cobra']
  },
  {
    id: 'farsa-do-fingidor',
    slug: 'farsa-do-fingidor',
    name: 'Farsa do Fingidor',
    category: 'concedidos',
    prerequisites: 'Devoto de Hyninn',
    description: 'Você aprende e pode lançar Criar Ilusão. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Hyninn', 'Ilusão', 'Magia']
  },
  {
    id: 'fe-guerreira',
    slug: 'fe-guerreira',
    name: 'Fé Guerreira',
    category: 'concedidos',
    prerequisites: 'Devoto de Arsenal',
    description: 'Você pode usar Sabedoria para Guerra (em vez de Inteligência). Além disso, em combate, pode gastar 2 PM para substituir um teste de perícia (exceto testes de ataque) por um teste de Guerra.',
    source: 'Tormenta 20 JdA',
    tags: ['Arsenal', 'Guerra', 'Sabedoria']
  },
  {
    id: 'forma-de-macaco',
    slug: 'forma-de-macaco',
    name: 'Forma de Macaco',
    category: 'concedidos',
    prerequisites: 'Devoto de Hyninn',
    description: 'Você pode gastar uma ação completa e 2 PM para se transformar em um macaco. Você adquire tamanho Minúsculo (o que fornece +5 em Furtividade e –5 em testes de manobra) e recebe deslocamento de escalar 9m. Seu equipamento desaparece (e você perde seus benefícios) até você voltar ao normal, mas suas outras estatísticas não são alteradas. A transformação dura indefinidamente, mas termina caso você faça um ataque, lance uma magia ou sofra dano.',
    source: 'Tormenta 20 JdA',
    tags: ['Hyninn', 'Metamorfose', 'Furtividade']
  },
  {
    id: 'fulgor-solar',
    slug: 'fulgor-solar',
    name: 'Fulgor Solar',
    category: 'concedidos',
    prerequisites: 'Devoto de Azgher',
    description: 'Você recebe redução de frio e trevas 5. Além disso, quando é alvo de um ataque você pode gastar 1 PM para emitir um clarão solar que deixa o atacante ofuscado por uma rodada.',
    source: 'Tormenta 20 JdA',
    tags: ['Azgher', 'Redução de Dano', 'Ofuscado']
  },
  {
    id: 'furia-divina',
    slug: 'furia-divina',
    name: 'Fúria Divina',
    category: 'concedidos',
    prerequisites: 'Devoto de Thwor',
    description: 'Você pode gastar 2 PM para invocar uma fúria selvagem, tornando-se temível em combate. Até o fim da cena, você recebe +2 em testes de ataque e rolagens de dano corpo a corpo, mas não pode executar nenhuma ação que exija paciência ou concentração (como usar a perícia Furtividade ou lançar magias). Se usar este poder em conjunto com a habilidade Fúria, ela também dura uma cena (e não termina se você não atacar ou for alvo de uma ação hostil).',
    source: 'Tormenta 20 JdA',
    tags: ['Thwor', 'Fúria', 'Ataque', 'Dano']
  },
  {
    id: 'golpista-divino',
    slug: 'golpista-divino',
    name: 'Golpista Divino',
    category: 'concedidos',
    prerequisites: 'Devoto de Hyninn',
    description: 'Você recebe +2 em Enganação, Jogatina e Ladinagem.',
    source: 'Tormenta 20 JdA',
    tags: ['Hyninn', 'Enganação', 'Jogatina', 'Ladinagem']
  },
  {
    id: 'habitante-do-deserto',
    slug: 'habitante-do-deserto',
    name: 'Habitante do Deserto',
    category: 'concedidos',
    prerequisites: 'Devoto de Azgher',
    description: 'Você recebe redução de fogo 10 e pode pagar 1 PM para criar água pura e potável suficiente para um odre (ou outro recipiente pequeno).',
    source: 'Tormenta 20 JdA',
    tags: ['Azgher', 'Fogo', 'Água', 'Sobrevivência']
  },
  {
    id: 'inimigo-de-tenebra',
    slug: 'inimigo-de-tenebra',
    name: 'Inimigo de Tenebra',
    category: 'concedidos',
    prerequisites: 'Devoto de Azgher',
    description: 'Seus ataques e habilidades causam +1d6 pontos de dano contra mortos-vivos. Quando você usa um efeito que gera luz, o alcance da iluminação dobra.',
    source: 'Tormenta 20 JdA',
    tags: ['Azgher', 'Mortos-Vivos', 'Dano', 'Luz']
  },
  {
    id: 'kiai-divino',
    slug: 'kiai-divino',
    name: 'Kiai Divino',
    category: 'concedidos',
    prerequisites: 'Devoto de Lin-Wu',
    description: 'Uma vez por rodada, quando faz um ataque corpo a corpo, você pode pagar 3 PM. Se acertar o ataque, causa dano máximo, sem necessidade de rolar dados.',
    source: 'Tormenta 20 JdA',
    tags: ['Lin-Wu', 'Dano Máximo', 'Golpe']
  },
  {
    id: 'liberdade-divina',
    slug: 'liberdade-divina',
    name: 'Liberdade Divina',
    category: 'concedidos',
    prerequisites: 'Devoto de Valkaria',
    description: 'Você pode gastar 2 PM para receber imunidade a efeitos de movimento por uma rodada.',
    source: 'Tormenta 20 JdA',
    tags: ['Valkaria', 'Imunidade', 'Movimento']
  },
  {
    id: 'manto-da-penumbra',
    slug: 'manto-da-penumbra',
    name: 'Manto da Penumbra',
    category: 'concedidos',
    prerequisites: 'Devoto de Tenebra',
    description: 'Você aprende e pode lançar Escuridão. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Tenebra', 'Escuridão', 'Magia']
  },
  {
    id: 'mente-analitica',
    slug: 'mente-analitica',
    name: 'Mente Analítica',
    category: 'concedidos',
    prerequisites: 'Devoto de Tanna-Toh',
    description: 'Você recebe +2 em Intuição, Investigação e Vontade.',
    source: 'Tormenta 20 JdA',
    tags: ['Tanna-Toh', 'Intuição', 'Investigação', 'Vontade']
  },
  {
    id: 'mente-vazia',
    slug: 'mente-vazia',
    name: 'Mente Vazia',
    category: 'concedidos',
    prerequisites: 'Devoto de Lin-Wu',
    description: 'Você recebe +2 em Iniciativa, Percepção e Vontade.',
    source: 'Tormenta 20 JdA',
    tags: ['Lin-Wu', 'Iniciativa', 'Percepção', 'Vontade']
  },
  {
    id: 'mestre-dos-mares',
    slug: 'mestre-dos-mares',
    name: 'Mestre dos Mares',
    category: 'concedidos',
    prerequisites: 'Devoto de Oceano',
    description: 'Você pode falar com animais aquáticos (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra criaturas aquáticas. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Oceano', 'Animais Aquáticos', 'Comunicação']
  },
  {
    id: 'olhar-amedrontador',
    slug: 'olhar-amedrontador',
    name: 'Olhar Amedrontador',
    category: 'concedidos',
    prerequisites: 'Devoto de Megalokk ou Thwor',
    description: 'Você aprende e pode lançar Amedrontar. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Megalokk', 'Thwor', 'Medo', 'Magia']
  },
  {
    id: 'palavras-de-bondade',
    slug: 'palavras-de-bondade',
    name: 'Palavras de Bondade',
    category: 'concedidos',
    prerequisites: 'Devoto de Marah',
    description: 'Você aprende e pode lançar Enfeitiçar. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Marah', 'Enfeitiçar', 'Magia', 'Paz']
  },
  {
    id: 'percepcao-temporal',
    slug: 'percepcao-temporal',
    name: 'Percepção Temporal',
    category: 'concedidos',
    prerequisites: 'Devoto de Aharadak',
    description: 'Você pode gastar 3 PM para somar sua Sabedoria (limitado por seu nível e não cumulativo com efeitos que somam este atributo) a seus ataques, Defesa e testes de Reflexos até o fim da cena.',
    source: 'Tormenta 20 JdA',
    tags: ['Aharadak', 'Ataque', 'Defesa', 'Reflexos']
  },
  {
    id: 'pesquisa-abencoada',
    slug: 'pesquisa-abencoada',
    name: 'Pesquisa Abençoada',
    category: 'concedidos',
    prerequisites: 'Devoto de Tanna-Toh',
    description: 'Se passar uma hora pesquisando seus livros e anotações, você pode rolar novamente um teste de perícia baseada em Inteligência ou Sabedoria que tenha feito desde a última cena. Se tiver acesso a mais livros, você recebe um bônus no teste: +2 para uma coleção particular ou biblioteca pequena e +5 para a biblioteca de um templo ou universidade.',
    source: 'Tormenta 20 JdA',
    tags: ['Tanna-Toh', 'Pesquisa', 'Rerolagem']
  },
  {
    id: 'poder-oculto',
    slug: 'poder-oculto',
    name: 'Poder Oculto',
    category: 'concedidos',
    prerequisites: 'Devoto de Nimb',
    description: 'Você pode gastar uma ação de movimento e 2 PM para invocar a força, a rapidez ou o vigor dos loucos. Role 1d6 para receber +2 em Força (1 ou 2), Destreza (3 ou 4) ou Constituição (5 ou 6) até o fim da cena. Você pode usar este poder várias vezes, mas bônus no mesmo atributo não são cumulativos.',
    source: 'Tormenta 20 JdA',
    tags: ['Nimb', 'Atributos', 'Caos']
  },
  {
    id: 'presas-primordiais',
    slug: 'presas-primordiais',
    name: 'Presas Primordiais',
    category: 'concedidos',
    prerequisites: 'Devoto de Kallyadranoch ou Megalokk',
    description: 'Você pode gastar 1 PM para transformar seus dentes em presas afiadas até o fim da cena. Você recebe uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida. Se já possuir outro ataque natural de mordida, em vez disso, o dano desse ataque aumenta em dois passos.',
    source: 'Tormenta 20 JdA',
    tags: ['Kallyadranoch', 'Megalokk', 'Mordida', 'Arma Natural']
  },
  {
    id: 'presas-venenosas',
    slug: 'presas-venenosas',
    name: 'Presas Venenosas',
    category: 'concedidos',
    prerequisites: 'Devoto de Sszzaas',
    description: 'Você pode gastar uma ação de movimento e 1 PM para envenenar uma arma corpo a corpo que esteja empunhando. Em caso de acerto, a arma causa perda de 1d12 pontos de vida. A arma permanece envenenada até atingir uma criatura ou até o fim da cena, o que acontecer primeiro.',
    source: 'Tormenta 20 JdA',
    tags: ['Sszzaas', 'Veneno', 'Arma']
  },
  {
    id: 'rejeicao-divina',
    slug: 'rejeicao-divina',
    name: 'Rejeição Divina',
    category: 'concedidos',
    prerequisites: 'Devoto de Aharadak',
    description: 'Você recebe resistência a magia divina +5.',
    source: 'Tormenta 20 JdA',
    tags: ['Aharadak', 'Resistência a Magia', 'Divina']
  },
  {
    id: 'reparar-injustica',
    slug: 'reparar-injustica',
    name: 'Reparar Injustiça',
    category: 'concedidos',
    prerequisites: 'Devoto de Khalmyr',
    description: 'Uma vez por rodada, quando um oponente em alcance curto acerta um ataque em você ou em um de seus aliados, você pode gastar 2 PM para fazer este oponente repetir o ataque, escolhendo o pior entre os dois resultados.',
    source: 'Tormenta 20 JdA',
    tags: ['Khalmyr', 'Justiça', 'Defesa', 'Reação']
  },
  {
    id: 'sangue-de-ferro',
    slug: 'sangue-de-ferro',
    name: 'Sangue de Ferro',
    category: 'concedidos',
    prerequisites: 'Devoto de Arsenal',
    description: 'Você pode pagar 3 PM para receber +2 em rolagens de dano e redução de dano 5 até o fim da cena.',
    source: 'Tormenta 20 JdA',
    tags: ['Arsenal', 'Dano', 'Redução de Dano']
  },
  {
    id: 'sangue-ofidico',
    slug: 'sangue-ofidico',
    name: 'Sangue Ofídico',
    category: 'concedidos',
    prerequisites: 'Devoto de Sszzaas',
    description: 'Você recebe resistência a veneno +5 e a CD para resistir aos seus venenos aumenta em +2.',
    source: 'Tormenta 20 JdA',
    tags: ['Sszzaas', 'Veneno', 'Resistência']
  },
  {
    id: 'servos-do-dragao',
    slug: 'servos-do-dragao',
    name: 'Servos do Dragão',
    category: 'concedidos',
    prerequisites: 'Devoto de Kallyadranoch',
    description: 'Você pode gastar uma ação completa e 2 PM para invocar 2d4+1 kobolds capangas em espaços desocupados em alcance curto. Você pode gastar uma ação de movimento para fazer os kobolds andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6–1 pontos de dano de perfuração cada). Os kobolds têm For –1, Des 1, Defesa 12, 1 PV e falham automaticamente em qualquer teste de resistência ou oposto. Eles desaparecem quando morrem ou no fim da cena.',
    source: 'Tormenta 20 JdA',
    tags: ['Kallyadranoch', 'Kobolds', 'Invocação']
  },
  {
    id: 'sopro-do-mar',
    slug: 'sopro-do-mar',
    name: 'Sopro do Mar',
    category: 'concedidos',
    prerequisites: 'Devoto de Oceano',
    description: 'Você pode gastar uma ação padrão e 1 PM para soprar vento marinho em um cone de 6m. Criaturas na área sofrem 2d6 pontos de dano de frio (Reflexos CD Sab reduz à metade). Você pode aprender Sopro das Uivantes como uma magia divina. Se fizer isso, o custo dela diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Oceano', 'Frio', 'Dano em Área']
  },
  {
    id: 'sorte-dos-loucos',
    slug: 'sorte-dos-loucos',
    name: 'Sorte dos Loucos',
    category: 'concedidos',
    prerequisites: 'Devoto de Nimb',
    description: 'Você pode pagar 1 PM para rolar novamente um teste recém realizado. Se ainda assim falhar no teste, você perde 1d6 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Nimb', 'Sorte', 'Rerolagem']
  },
  {
    id: 'talento-artistico',
    slug: 'talento-artistico',
    name: 'Talento Artístico',
    category: 'concedidos',
    prerequisites: 'Devoto de Marah',
    description: 'Você recebe +2 em Acrobacia, Atuação e Diplomacia.',
    source: 'Tormenta 20 JdA',
    tags: ['Marah', 'Arte', 'Acrobacia', 'Atuação', 'Diplomacia']
  },
  {
    id: 'teurgista-mistico',
    slug: 'teurgista-mistico',
    name: 'Teurgista Místico',
    category: 'concedidos',
    prerequisites: 'Devoto de Wynna, habilidade de classe Magias',
    description: 'Até uma magia de cada círculo que você aprender poderá ser escolhida entre magias divinas (se você for um conjurador arcano) ou entre magias arcanas (se for um conjurador divino).',
    source: 'Tormenta 20 JdA',
    tags: ['Wynna', 'Magia', 'Versatilidade']
  },
  {
    id: 'tradicao-de-lin-wu',
    slug: 'tradicao-de-lin-wu',
    name: 'Tradição de Lin-Wu',
    category: 'concedidos',
    prerequisites: 'Devoto de Lin-Wu',
    description: 'Você considera a katana uma arma simples e, se for proficiente em armas marciais, recebe +1 na margem de ameaça com ela.',
    source: 'Tormenta 20 JdA',
    tags: ['Lin-Wu', 'Katana', 'Arma']
  },
  {
    id: 'transmissao-da-loucura',
    slug: 'transmissao-da-loucura',
    name: 'Transmissão da Loucura',
    category: 'concedidos',
    prerequisites: 'Devoto de Nimb',
    description: 'Você pode lançar Sussurros Insanos (CD Car). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Nimb', 'Loucura', 'Magia']
  },
  {
    id: 'tropas-duyshidakk',
    slug: 'tropas-duyshidakk',
    name: 'Tropas Duyshidakk',
    category: 'concedidos',
    prerequisites: 'Devoto de Thwor',
    description: 'Você pode gastar uma ação completa e 2 PM para invocar 1d4+1 goblinoides capangas em espaços desocupados em alcance curto. Você pode gastar uma ação de movimento para fazer os goblinoides andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6+1 pontos de dano de corte cada). Os goblinoides têm For 1, Des 1, Defesa 15, 1 PV e falham automaticamente em qualquer teste de resistência ou oposto. Eles desaparecem quando morrem ou no fim da cena.',
    source: 'Tormenta 20 JdA',
    tags: ['Thwor', 'Duyshidakk', 'Invocação']
  },
  {
    id: 'urro-divino',
    slug: 'urro-divino',
    name: 'Urro Divino',
    category: 'concedidos',
    prerequisites: 'Devoto de Megalokk',
    description: 'Quando faz um ataque ou lança uma magia, você pode pagar 1 PM para somar sua Constituição (mínimo +1) à rolagem de dano desse ataque ou magia.',
    source: 'Tormenta 20 JdA',
    tags: ['Megalokk', 'Dano', 'Constituição']
  },
  {
    id: 'visao-nas-trevas',
    slug: 'visao-nas-trevas',
    name: 'Visão nas Trevas',
    category: 'concedidos',
    prerequisites: 'Devoto de Tenebra',
    description: 'Você enxerga perfeitamente no escuro, incluindo em magias de escuridão.',
    source: 'Tormenta 20 JdA',
    tags: ['Tenebra', 'Visão', 'Trevas']
  },
  {
    id: 'voz-da-civilizacao',
    slug: 'voz-da-civilizacao',
    name: 'Voz da Civilização',
    category: 'concedidos',
    prerequisites: 'Devoto de Tanna-Toh',
    description: 'Você está sempre sob efeito de Compreensão.',
    source: 'Tormenta 20 JdA',
    tags: ['Tanna-Toh', 'Compreensão', 'Idiomas']
  },
  {
    id: 'voz-da-natureza',
    slug: 'voz-da-natureza',
    name: 'Voz da Natureza',
    category: 'concedidos',
    prerequisites: 'Devoto de Allihanna',
    description: 'Você pode falar com animais (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra animais. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    source: 'Tormenta 20 JdA',
    tags: ['Allihanna', 'Animais', 'Comunicação']
  },
  {
    id: 'voz-dos-monstros',
    slug: 'voz-dos-monstros',
    name: 'Voz dos Monstros',
    category: 'concedidos',
    prerequisites: 'Devoto de Megalokk',
    description: 'Você conhece os idiomas de todos os monstros inteligentes e pode se comunicar livremente com monstros não inteligentes (Int –4 ou menor), como se estivesse sob efeito da magia Voz Divina.',
    source: 'Tormenta 20 JdA',
    tags: ['Megalokk', 'Monstros', 'Comunicação']
  },
  {
    id: 'zumbificar',
    slug: 'zumbificar',
    name: 'Zumbificar',
    category: 'concedidos',
    prerequisites: 'Devoto de Tenebra',
    description: 'Você pode gastar uma ação completa e 3 PM para reanimar o cadáver de uma criatura Pequena ou Média adjacente por um dia. O cadáver funciona como um parceiro iniciante de um tipo a sua escolha entre combatente, fortão ou guardião. Além disso, quando sofre dano, você pode sacrificar esse parceiro; se fizer isso, você sofre apenas metade do dano, mas o cadáver é destruído.',
    source: 'Tormenta 20 JdA',
    tags: ['Tenebra', 'Mortos-Vivos', 'Zumbi', 'Parceiro']
  },

  // ==========================================
  // --- PODERES DA TORMENTA (20 Poderes) ---
  // ==========================================
  {
    id: 'anatomia-insana',
    slug: 'anatomia-insana',
    name: 'Anatomia Insana',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você tem 25% de chance (resultado “1” em 1d4) de ignorar o dano adicional de um acerto crítico ou ataque furtivo. A chance aumenta em +25% para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Defesa', 'Crítico', 'Tormenta']
  },
  {
    id: 'antenas',
    slug: 'antenas',
    name: 'Antenas',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você recebe +1 em Iniciativa, Percepção e Vontade. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Iniciativa', 'Percepção', 'Vontade', 'Tormenta']
  },
  {
    id: 'armamento-aberrante',
    slug: 'armamento-aberrante',
    name: 'Armamento Aberrante',
    category: 'tormenta',
    prerequisites: 'Um outro poder da Tormenta',
    description: 'Você pode gastar uma ação de movimento e 1 PM para produzir uma versão orgânica de qualquer arma corpo a corpo ou de arremesso com a qual seja proficiente — ela brota do seu braço, ombro ou costas como uma planta grotesca e então se desprende. O dano da arma aumenta em um passo para cada dois outros poderes da Tormenta que você possui. A arma dura pela cena, então se desfaz numa poça de gosma.',
    source: 'Tormenta 20 JdA',
    tags: ['Arma', 'Dano', 'Tormenta']
  },
  {
    id: 'articulacoes-flexiveis',
    slug: 'articulacoes-flexiveis',
    name: 'Articulações Flexíveis',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você recebe +1 em Acrobacia, Furtividade e Reflexos. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Acrobacia', 'Furtividade', 'Reflexos', 'Tormenta']
  },
  {
    id: 'asas-insetoides',
    slug: 'asas-insetoides',
    name: 'Asas Insetoides',
    category: 'tormenta',
    prerequisites: 'Quatro outros poderes da Tormenta',
    description: 'Você pode gastar 1 PM para receber deslocamento de voo 9m até o fim do seu turno. O deslocamento aumenta em +1,5m para cada outro poder da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Voo', 'Deslocamento', 'Tormenta']
  },
  {
    id: 'carapaca',
    slug: 'carapaca',
    name: 'Carapaça',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Sua pele é recoberta por placas quitinosas. Você recebe +1 na Defesa. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Defesa', 'Carapaça', 'Tormenta']
  },
  {
    id: 'corpo-aberrante',
    slug: 'corpo-aberrante',
    name: 'Corpo Aberrante',
    category: 'tormenta',
    prerequisites: 'Um outro poder da Tormenta',
    description: 'Crostas vermelhas em várias partes de seu corpo tornam seus ataques mais perigosos. Seu dano desarmado aumenta em um passo, mais um passo para cada quatro outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Desarmado', 'Dano', 'Tormenta']
  },
  {
    id: 'cuspir-enxame',
    slug: 'cuspir-enxame',
    name: 'Cuspir Enxame',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você pode gastar uma ação completa e 2 PM para criar um enxame de insetos rubros em um ponto a sua escolha em alcance curto e com duração sustentada. O enxame tem tamanho Médio e causa 2d6 pontos de dano de ácido a qualquer criatura no espaço que ele estiver ocupando no final do seu turno. Para cada dois outros poderes da Tormenta que possui, você pode gastar +1 PM quando usa este poder para aumentar o dano do enxame em +1d6.',
    source: 'Tormenta 20 JdA',
    tags: ['Enxame', 'Ácido', 'Dano', 'Tormenta']
  },
  {
    id: 'dentes-afiados',
    slug: 'dentes-afiados',
    name: 'Dentes Afiados',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você recebe uma arma natural de mordida (dano 1d4, crítico x2, corte). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.',
    source: 'Tormenta 20 JdA',
    tags: ['Mordida', 'Arma Natural', 'Tormenta']
  },
  {
    id: 'desprezar-a-realidade',
    slug: 'desprezar-a-realidade',
    name: 'Desprezar a Realidade',
    category: 'tormenta',
    prerequisites: 'Quatro outros poderes da Tormenta',
    description: 'Você pode gastar 2 PM para ficar no limiar da realidade até o início de seu próximo turno. Nesse estado, você ignora terreno difícil e causa 20% de chance de falha em efeitos usados contra você (não apenas ataques). Para cada dois outros poderes de Tormenta que você possuir, essa chance aumenta em 5% (máximo de 50%).',
    source: 'Tormenta 20 JdA',
    tags: ['Defesa', 'Chance de Falha', 'Tormenta']
  },
  {
    id: 'empunhadura-rubra',
    slug: 'empunhadura-rubra',
    name: 'Empunhadura Rubra',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você pode gastar 1 PM para cobrir suas mãos com uma carapaça rubra. Até o final da cena, você recebe +1 em Luta. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Luta', 'Ataque', 'Tormenta']
  },
  {
    id: 'fome-de-mana',
    slug: 'fome-de-mana',
    name: 'Fome de Mana',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Quando passa em um teste de resistência para resistir a uma habilidade mágica, você recebe 1 PM temporário cumulativo. Você pode ganhar um máximo de PM temporários por cena desta forma igual ao número de poderes da Tormenta que possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Pontos de Mana', 'Resistência', 'Tormenta']
  },
  {
    id: 'larva-explosiva',
    slug: 'larva-explosiva',
    name: 'Larva Explosiva',
    category: 'tormenta',
    prerequisites: 'Dentes Afiados',
    description: 'Se uma criatura que tenha sofrido dano de sua mordida nesta cena for reduzida a 0 ou menos PV, ela explode em chuva cáustica, morrendo e causando 4d4 pontos de dano de ácido em criaturas adjacentes. Para cada dois outros poderes da Tormenta que você possui, o dano aumenta em +2d4. Você é imune a esse dano.',
    source: 'Tormenta 20 JdA',
    tags: ['Ácido', 'Explosão', 'Tormenta']
  },
  {
    id: 'legiao-aberrante',
    slug: 'legiao-aberrante',
    name: 'Legião Aberrante',
    category: 'tormenta',
    prerequisites: 'Anatomia Insana, três outros poderes da Tormenta',
    description: 'Seu corpo se transforma em uma massa de insetos rubros. Você pode atravessar qualquer espaço por onde seja possível passar uma moeda (mas considera esses espaços como terreno difícil) e recebe +1 em testes contra manobras de combate e de resistência contra efeitos que tenham você como alvo (mas não efeitos de área). Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Resistência', 'Insetos', 'Tormenta']
  },
  {
    id: 'maos-membranosas',
    slug: 'maos-membranosas',
    name: 'Mãos Membranosas',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você recebe +1 em Atletismo, Fortitude e testes de agarrar. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Atletismo', 'Fortitude', 'Agarrar', 'Tormenta']
  },
  {
    id: 'membros-estendidos',
    slug: 'membros-estendidos',
    name: 'Membros Estendidos',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Seus braços e armas naturais são grotescamente mais longos que o normal, o que aumenta seu alcance natural para ataques corpo a corpo em +1,5m. Para cada quatro outros poderes da Tormenta que você possui, esse alcance aumenta em +1,5m.',
    source: 'Tormenta 20 JdA',
    tags: ['Alcance', 'Corpo a Corpo', 'Tormenta']
  },
  {
    id: 'membros-extras',
    slug: 'membros-extras',
    name: 'Membros Extras',
    category: 'tormenta',
    prerequisites: 'Quatro outros poderes da Tormenta',
    description: 'Você possui duas armas naturais de patas insetoides que saem de suas costas, ombros ou flancos. Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 2 PM para fazer um ataque corpo a corpo extra com cada uma (dano 1d4, crítico x2, corte). Se possuir Ambidestria ou Estilo de Duas Armas, pode empunhar armas leves em suas patas insetoides (mas ainda precisa pagar 2 PM para atacar com elas e sofre a penalidade de –2 em todos os ataques).',
    source: 'Tormenta 20 JdA',
    tags: ['Ataque Adicional', 'Arma Natural', 'Tormenta']
  },
  {
    id: 'mente-aberrante',
    slug: 'mente-aberrante',
    name: 'Mente Aberrante',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você recebe resistência a efeitos mentais +1. Além disso, sempre que precisa fazer um teste de Vontade para resistir a uma habilidade, a criatura que usou essa habilidade sofre 1d6 pontos de dano psíquico. Para cada dois outros poderes da Tormenta que você possui o bônus em testes de resistência aumenta em +1 e o dano aumenta em +1d6.',
    source: 'Tormenta 20 JdA',
    tags: ['Vontade', 'Mental', 'Dano Psíquico', 'Tormenta']
  },
  {
    id: 'olhos-vermelhos',
    slug: 'olhos-vermelhos',
    name: 'Olhos Vermelhos',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você recebe visão no escuro e +1 em Intimidação. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Visão no Escuro', 'Intimidação', 'Tormenta']
  },
  {
    id: 'pele-corrompida',
    slug: 'pele-corrompida',
    name: 'Pele Corrompida',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Sua carne foi mesclada à matéria vermelha. Você recebe redução de ácido, eletricidade, fogo, frio, luz e trevas 2. Esta RD aumenta em +2 para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Redução de Dano', 'Energia', 'Tormenta']
  },
  {
    id: 'sangue-acido',
    slug: 'sangue-acido',
    name: 'Sangue Ácido',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Quando você sofre dano por um ataque corpo a corpo, o atacante sofre 1 ponto de dano de ácido por poder da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Ácido', 'Reação', 'Tormenta']
  },
  {
    id: 'visco-rubro',
    slug: 'visco-rubro',
    name: 'Visco Rubro',
    category: 'tormenta',
    prerequisites: 'Nenhum',
    description: 'Você pode gastar 1 PM para expelir um líquido grosso e corrosivo. Até o final da cena, você recebe +1 nas rolagens de dano corpo a corpo. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    source: 'Tormenta 20 JdA',
    tags: ['Dano', 'Corpo a Corpo', 'Tormenta']
  }
];
