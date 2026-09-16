/**
 * Matriz Oficial de Progressão de Classes (Níveis 1 ao 20)
 * Tormenta 20 — Edição Jogo do Ano (JdA)
 * Fonte de Verdade: Livro Básico Tormenta 20 JdA
 */

export type T20Tier = 'iniciante' | 'veterano' | 'campeao' | 'lenda';

export interface LevelProgressionData {
  level: number;
  automaticAbilities: {
    name: string;
    description: string;
  }[];
  grantsPowerChoice: boolean; // Verdadeiro para níveis 2 a 20 em todas as classes
  unlockedSpellCircle?: number;
  notes?: string;
}

export interface ClassOfficialProgression {
  id: string;
  name: string;
  pvBase: number;
  pvPerLevel: number;
  pmBase: number;
  pmPerLevel: number;
  isSpellcaster: boolean;
  spellcastingType?: 'arcana' | 'divina';
  keyAttribute?: 'INT' | 'CAR' | 'SAB';
  maxSpellCircleByLevel: Record<number, number>;
  levels: Record<number, LevelProgressionData>;
}

export const getTier = (level: number): T20Tier => {
  const lvl = Math.max(1, Math.min(20, Number(level || 1)));
  if (lvl <= 4) return 'iniciante';
  if (lvl <= 10) return 'veterano';
  if (lvl <= 16) return 'campeao';
  return 'lenda';
};

export const getTierName = (tier: T20Tier): string => {
  switch (tier) {
    case 'iniciante': return 'Iniciante (1º ao 4º nível)';
    case 'veterano': return 'Veterano (5º ao 10º nível)';
    case 'campeao': return 'Campeão (11º ao 16º nível)';
    case 'lenda': return 'Lenda (17º ao 20º nível)';
  }
};

// Matriz oficial de progressão de círculos de magia (T20 JdA)
const STANDARD_CASTER_CIRCLES: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1,
  5: 2, 6: 2, 7: 2, 8: 2,
  9: 3, 10: 3, 11: 3, 12: 3,
  13: 4, 14: 4, 15: 4, 16: 4,
  17: 5, 18: 5, 19: 5, 20: 5
};

const BARD_CIRCLES: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
  6: 2, 7: 2, 8: 2, 9: 2,
  10: 3, 11: 3, 12: 3, 13: 3,
  14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
};

const NO_SPELLS: Record<number, number> = {};

export const T20_OFFICIAL_PROGRESSION: Record<string, ClassOfficialProgression> = {
  arcanista: {
    id: 'arcanista',
    name: 'Arcanista',
    pvBase: 8,
    pvPerLevel: 2,
    pmBase: 6,
    pmPerLevel: 6,
    isSpellcaster: true,
    spellcastingType: 'arcana',
    keyAttribute: 'INT',
    maxSpellCircleByLevel: STANDARD_CASTER_CIRCLES,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Caminho do Arcanista', description: 'Você escolhe o seu caminho arcano: Bruxo, Feiticeiro ou Mago.' },
          { name: 'Magias Arcanas', description: 'Você pode lançar magias arcanas de 1º círculo.' }
        ],
        grantsPowerChoice: false,
        unlockedSpellCircle: 1
      },
      ...createProgressionMap(2, 20, {
        5: { unlockedSpellCircle: 2, notes: 'Acesso a magias de 2º círculo.' },
        9: { unlockedSpellCircle: 3, notes: 'Acesso a magias de 3º círculo.' },
        13: { unlockedSpellCircle: 4, notes: 'Acesso a magias de 4º círculo.' },
        17: { unlockedSpellCircle: 5, notes: 'Acesso a magias de 5º círculo.' },
        20: {
          automaticAbilities: [
            { name: 'Alta Arcana', description: 'O custo em PM de todas as suas magias é reduzido à metade e você atinge o ápice do poder místico.' }
          ]
        }
      })
    }
  },

  barbaro: {
    id: 'barbaro',
    name: 'Bárbaro',
    pvBase: 24,
    pvPerLevel: 6,
    pmBase: 3,
    pmPerLevel: 3,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Fúria', description: 'Você pode gastar 2 PM para invocar uma fúria selvagem (+2 em testes de ataque e dano corpo a corpo, RD 1).' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        3: {
          automaticAbilities: [
            { name: 'Instinto Selvagem', description: 'Você recebe +1 em Percepção e Reflexos. Este bônus aumenta para +2 no 9º nível e +3 no 15º nível.' }
          ]
        },
        5: {
          automaticAbilities: [
            { name: 'Resistência a Dano (RD 2)', description: 'Você ganha redução de dano 2. Esta RD aumenta para 5 no 10º nível e 8 no 15º nível.' }
          ]
        },
        9: {
          automaticAbilities: [
            { name: 'Instinto Selvagem (+2)', description: 'O bônus de Instinto Selvagem aumenta para +2 em Percepção e Reflexos.' }
          ]
        },
        10: {
          automaticAbilities: [
            { name: 'Resistência a Dano (RD 5)', description: 'Sua redução de dano aumenta para RD 5.' }
          ]
        },
        11: {
          automaticAbilities: [
            { name: 'Fúria Maior', description: 'Ao entrar em fúria por 3 PM, seu bônus de ataque e dano sobe para +3 e sua RD em fúria vira 2.' }
          ]
        },
        15: {
          automaticAbilities: [
            { name: 'Instinto Selvagem (+3)', description: 'O bônus de Instinto Selvagem aumenta para +3 em Percepção e Reflexos.' },
            { name: 'Resistência a Dano (RD 8)', description: 'Sua redução de dano natural aumenta para RD 8.' }
          ]
        },
        17: {
          automaticAbilities: [
            { name: 'Fúria Destruidora', description: 'Ao entrar em fúria por 4 PM, seus bônus aumentam para +4 em ataque e dano e RD 3 em fúria.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Fúria Titânica', description: 'Ao entrar em fúria por 5 PM, seus bônus aumentam para +5 em ataque e dano e RD 5 em fúria.' },
            { name: 'Força Indomável', description: 'Uma vez por rodada, quando sofre dano que o levaria a 0 PV ou menos, você pode gastar 5 PM para ignorar esse dano.' }
          ]
        }
      })
    }
  },

  bardo: {
    id: 'bardo',
    name: 'Bardo',
    pvBase: 12,
    pvPerLevel: 3,
    pmBase: 4,
    pmPerLevel: 4,
    isSpellcaster: true,
    spellcastingType: 'arcana',
    keyAttribute: 'CAR',
    maxSpellCircleByLevel: BARD_CIRCLES,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Inspiração', description: 'Você pode gastar 2 PM para inspirar seus aliados, concedendo +1 em testes de perícia ou de ataque e dano.' },
          { name: 'Magias de Bardo', description: 'Você pode lançar magias arcanas de 1º círculo.' }
        ],
        grantsPowerChoice: false,
        unlockedSpellCircle: 1
      },
      ...createProgressionMap(2, 20, {
        6: {
          unlockedSpellCircle: 2,
          automaticAbilities: [
            { name: 'Inspiração (+2)', description: 'O bônus da sua habilidade Inspiração aumenta para +2.' }
          ]
        },
        10: { unlockedSpellCircle: 3, notes: 'Acesso a magias de 3º círculo.' },
        11: {
          automaticAbilities: [
            { name: 'Inspiração (+3)', description: 'O bônus da sua habilidade Inspiração aumenta para +3.' }
          ]
        },
        14: { unlockedSpellCircle: 4, notes: 'Acesso a magias de 4º círculo.' },
        16: {
          automaticAbilities: [
            { name: 'Inspiração (+4)', description: 'O bônus da sua habilidade Inspiração aumenta para +4.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Artista Completo', description: 'O bônus de Inspiração sobe para +5, custa apenas 1 PM e afeta automaticamente todos os aliados.' }
          ]
        }
      })
    }
  },

  bucaneiro: {
    id: 'bucaneiro',
    name: 'Bucaneiro',
    pvBase: 16,
    pvPerLevel: 4,
    pmBase: 3,
    pmPerLevel: 3,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Audácia', description: 'Ao fazer um teste de perícia, você pode gastar 2 PM para somar seu Carisma no teste.' },
          { name: 'Insolência', description: 'Você soma seu Carisma na Defesa, limitado pelo seu nível.' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        2: {
          automaticAbilities: [
            { name: 'Evasão', description: 'Quando sofre um efeito que permite um teste de Reflexos para reduzir o dano à metade, não sofre dano se passar.' }
          ]
        },
        5: {
          automaticAbilities: [
            { name: 'Panache', description: 'Ao acertar um ataque crítico ou reduzir um inimigo a 0 PV, você recupera 1 PM.' }
          ]
        },
        7: {
          automaticAbilities: [
            { name: 'Esquiva Sobrenatural', description: 'Seus instintos são tão aguçados que você nunca fica desprevenido.' }
          ]
        },
        10: {
          automaticAbilities: [
            { name: 'Evasão Aprimorada', description: 'Se falhar no teste de Reflexos contra efeito de meio dano, sofre metade do dano; se passar, não sofre dano.' }
          ]
        },
        13: {
          automaticAbilities: [
            { name: 'Sorte dos Bravos', description: 'Uma vez por cena, você pode rolar novamente um teste recém-realizado.' }
          ]
        },
        17: {
          automaticAbilities: [
            { name: 'Olho do Furacão', description: 'Você se torna imune às condições abalado e apavorado, e recebe bônus de ação defensiva.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Capitão Lendário', description: 'Sua margem de ameaça e seu multiplicador de acerto crítico aumentam em +1 com todas as armas.' }
          ]
        }
      })
    }
  },

  cacador: {
    id: 'cacador',
    name: 'Caçador',
    pvBase: 16,
    pvPerLevel: 4,
    pmBase: 4,
    pmPerLevel: 4,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Marca da Presa', description: 'Você pode gastar 1 PM para marcar uma criatura. Seus ataques contra ela causam +1d4 de dano.' },
          { name: 'Rastreador', description: 'Você recebe +2 em testes de Sobrevivência.' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        3: {
          automaticAbilities: [
            { name: 'Explorador', description: 'Você não sofre penalidades por terreno difícil e ganha +1 na Defesa e Reflexos em terrenos naturais.' }
          ]
        },
        5: {
          automaticAbilities: [
            { name: 'Marca da Presa (+1d6)', description: 'O dano extra da Marca da Presa aumenta para +1d6.' }
          ]
        },
        6: {
          automaticAbilities: [
            { name: 'Caminho do Explorador', description: 'Você aprende técnicas avançadas de travessia e emboscada em terrenos selvagens.' }
          ]
        },
        7: {
          automaticAbilities: [
            { name: 'Camuflagem', description: 'Você pode usar a perícia Furtividade mesmo se estiver sob observação, desde que haja cobertura parcial.' }
          ]
        },
        10: {
          automaticAbilities: [
            { name: 'Marca da Presa (+1d8)', description: 'O dano extra da Marca da Presa aumenta para +1d8.' }
          ]
        },
        15: {
          automaticAbilities: [
            { name: 'Marca da Presa (+1d10)', description: 'O dano extra da Marca da Presa aumenta para +1d10.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Mestre Caçador', description: 'A Marca da Presa aumenta para +1d12 e o primeiro ataque contra a presa na rodada tem margem de crítico duplicada.' }
          ]
        }
      })
    }
  },

  cavaleiro: {
    id: 'cavaleiro',
    name: 'Cavaleiro',
    pvBase: 20,
    pvPerLevel: 5,
    pmBase: 3,
    pmPerLevel: 3,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Baluarte', description: 'Você pode gastar 1 PM para conceder +1 na Defesa e testes de resistência para si e aliados adjacentes.' },
          { name: 'Código de Honra', description: 'Você segue um rigoroso código de conduta que fortalece seu espírito em batalha.' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        3: {
          automaticAbilities: [
            { name: 'Caminho do Cavaleiro', description: 'Você escolhe a sua especialização marcial entre cavaleiro montado ou muralha de ferro.' }
          ]
        },
        5: {
          automaticAbilities: [
            { name: 'Baluarte (+2)', description: 'O bônus de Baluarte aumenta para +2.' },
            { name: 'Duelo', description: 'Você pode desafiar um oponente para um duelo singular recebendo bônus em combate.' }
          ]
        },
        10: {
          automaticAbilities: [
            { name: 'Baluarte (+3)', description: 'O bônus de Baluarte aumenta para +3.' }
          ]
        },
        15: {
          automaticAbilities: [
            { name: 'Baluarte (+4)', description: 'O bônus de Baluarte aumenta para +4.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Campeão Inabalável', description: 'O bônus de Baluarte aumenta para +5 e você ganha imunidade a condições mentais e de paralisia.' }
          ]
        }
      })
    }
  },

  clerigo: {
    id: 'clerigo',
    name: 'Clérigo',
    pvBase: 16,
    pvPerLevel: 4,
    pmBase: 5,
    pmPerLevel: 5,
    isSpellcaster: true,
    spellcastingType: 'divina',
    keyAttribute: 'SAB',
    maxSpellCircleByLevel: STANDARD_CASTER_CIRCLES,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Devoto Fiel', description: 'Você serve a uma divindade e recebe seus poderes concedidos e obrigações.' },
          { name: 'Magias Divinas', description: 'Você pode lançar magias divinas de 1º círculo.' },
          { name: 'Símbolo Sagrado', description: 'Você canaliza seu poder através do símbolo de sua divindade.' }
        ],
        grantsPowerChoice: false,
        unlockedSpellCircle: 1
      },
      ...createProgressionMap(2, 20, {
        5: { unlockedSpellCircle: 2, notes: 'Acesso a magias de 2º círculo.' },
        9: { unlockedSpellCircle: 3, notes: 'Acesso a magias de 3º círculo.' },
        13: { unlockedSpellCircle: 4, notes: 'Acesso a magias de 4º círculo.' },
        17: { unlockedSpellCircle: 5, notes: 'Acesso a magias de 5º círculo.' },
        20: {
          automaticAbilities: [
            { name: 'Sumo Sacerdote', description: 'O custo em PM de todas as suas magias divinas é reduzido em -2 PM (mínimo 1 PM).' }
          ]
        }
      })
    }
  },

  druida: {
    id: 'druida',
    name: 'Druida',
    pvBase: 16,
    pvPerLevel: 4,
    pmBase: 4,
    pmPerLevel: 4,
    isSpellcaster: true,
    spellcastingType: 'divina',
    keyAttribute: 'SAB',
    maxSpellCircleByLevel: STANDARD_CASTER_CIRCLES,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Código do Druida', description: 'Você defende o equilíbrio natural e não pode usar armaduras ou escudos de metal.' },
          { name: 'Devoto Fiel', description: 'Você deve ser devoto de Allihanna, Megalokk ou Oceano.' },
          { name: 'Empatia Selvagem', description: 'Você pode se comunicar e usar Diplomacia com animais.' },
          { name: 'Magias da Natureza', description: 'Você pode lançar magias divinas de 1º círculo.' }
        ],
        grantsPowerChoice: false,
        unlockedSpellCircle: 1
      },
      ...createProgressionMap(2, 20, {
        5: { unlockedSpellCircle: 2, notes: 'Acesso a magias de 2º círculo.' },
        9: { unlockedSpellCircle: 3, notes: 'Acesso a magias de 3º círculo.' },
        13: { unlockedSpellCircle: 4, notes: 'Acesso a magias de 4º círculo.' },
        17: { unlockedSpellCircle: 5, notes: 'Acesso a magias de 5º círculo.' },
        20: {
          automaticAbilities: [
            { name: 'Força da Natureza', description: 'Você recebe imunidade a venenos e doenças, e o custo para usar Forma Selvagem é reduzido à metade.' }
          ]
        }
      })
    }
  },

  guerreiro: {
    id: 'guerreiro',
    name: 'Guerreiro',
    pvBase: 20,
    pvPerLevel: 5,
    pmBase: 3,
    pmPerLevel: 3,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Ataque Especial (+4)', description: 'Você pode gastar 1 PM para somar +4 no teste de ataque ou na rolagem de dano.' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        5: {
          automaticAbilities: [
            { name: 'Ataque Especial (+8)', description: 'O bônus de Ataque Especial pode chegar a +8 gastando 2 PM.' }
          ]
        },
        9: {
          automaticAbilities: [
            { name: 'Ataque Especial (+12)', description: 'O bônus de Ataque Especial pode chegar a +12 gastando 3 PM.' }
          ]
        },
        13: {
          automaticAbilities: [
            { name: 'Ataque Especial (+16)', description: 'O bônus de Ataque Especial pode chegar a +16 gastando 4 PM.' }
          ]
        },
        17: {
          automaticAbilities: [
            { name: 'Ataque Especial (+20)', description: 'O bônus de Ataque Especial pode chegar a +20 gastando 5 PM.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Campeão Supremo', description: 'Seus acertos críticos causam dano triplicado e você ganha +2 na margem de ameaça com armas empunhadas.' }
          ]
        }
      })
    }
  },

  inventor: {
    id: 'inventor',
    name: 'Inventor',
    pvBase: 12,
    pvPerLevel: 3,
    pmBase: 4,
    pmPerLevel: 4,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Engenhosidade', description: 'Você pode gastar 2 PM para somar sua Inteligência em qualquer teste de perícia.' },
          { name: 'Protótipo', description: 'Você começa o jogo com um item superior ou fórmula inovadora.' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        2: {
          automaticAbilities: [
            { name: 'Fabricar Item Superior', description: 'Você pode criar itens com melhorias permanentes através da perícia Ofício.' }
          ]
        },
        9: {
          automaticAbilities: [
            { name: 'Comerciante Notável', description: 'Você vende itens pelo dobro do valor usual e adquire matérias-primas por metade do preço.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Obra-Prima', description: 'Suas engenhocas e itens mágicos nunca falham e você atinge o ápice da engenhosidade de Arton.' }
          ]
        }
      })
    }
  },

  ladino: {
    id: 'ladino',
    name: 'Ladino',
    pvBase: 12,
    pvPerLevel: 3,
    pmBase: 4,
    pmPerLevel: 4,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Ataque Furtivo (+1d6)', description: 'Você causa +1d6 de dano contra alvos desprevenidos ou flanqueados.' },
          { name: 'Especialista', description: 'Você pode gastar 1 PM para dobrar o bônus de treinamento em perícias escolhidas.' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        2: {
          automaticAbilities: [
            { name: 'Evasão', description: 'Se passar em teste de Reflexos contra efeito de dano pela metade, não sofre dano.' }
          ]
        },
        3: {
          automaticAbilities: [
            { name: 'Ataque Furtivo (+2d6)', description: 'O dano extra do seu Ataque Furtivo aumenta para +2d6.' }
          ]
        },
        5: {
          automaticAbilities: [
            { name: 'Ataque Furtivo (+3d6)', description: 'O dano extra do seu Ataque Furtivo aumenta para +3d6.' }
          ]
        },
        7: {
          automaticAbilities: [
            { name: 'Esquiva Sobrenatural', description: 'Você nunca fica desprevenido.' },
            { name: 'Ataque Furtivo (+4d6)', description: 'O dano extra do seu Ataque Furtivo aumenta para +4d6.' }
          ]
        },
        9: {
          automaticAbilities: [
            { name: 'Ataque Furtivo (+5d6)', description: 'O dano extra do seu Ataque Furtivo aumenta para +5d6.' }
          ]
        },
        10: {
          automaticAbilities: [
            { name: 'Evasão Aprimorada', description: 'Se passar em Reflexos não sofre dano; se falhar, sofre apenas metade do dano.' }
          ]
        },
        11: {
          automaticAbilities: [
            { name: 'Ataque Furtivo (+6d6)', description: 'O dano extra do seu Ataque Furtivo aumenta para +6d6.' }
          ]
        },
        13: {
          automaticAbilities: [
            { name: 'Ataque Furtivo (+7d6)', description: 'O dano extra do seu Ataque Furtivo aumenta para +7d6.' }
          ]
        },
        15: {
          automaticAbilities: [
            { name: 'Ataque Furtivo (+8d6)', description: 'O dano extra do seu Ataque Furtivo aumenta para +8d6.' }
          ]
        },
        17: {
          automaticAbilities: [
            { name: 'Ataque Furtivo (+9d6)', description: 'O dano extra do seu Ataque Furtivo aumenta para +9d6.' }
          ]
        },
        19: {
          automaticAbilities: [
            { name: 'Ataque Furtivo (+10d6)', description: 'O dano extra do seu Ataque Furtivo aumenta para +10d6.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Sombra Assassina', description: 'Você pode se esconder mesmo sob observação plena e seu ataque furtivo causa morte instantânea se o dano superar os PV restantes do alvo.' }
          ]
        }
      })
    }
  },

  lutador: {
    id: 'lutador',
    name: 'Lutador',
    pvBase: 20,
    pvPerLevel: 5,
    pmBase: 3,
    pmPerLevel: 3,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Briga (1d6)', description: 'Seu dano desarmado é 1d6 e você pode usar Força ou Destreza em testes de manobra.' },
          { name: 'Golpe Relâmpago', description: 'Ao acertar um ataque desarmado, pode gastar 1 PM para realizar outro ataque desarmado.' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        3: {
          automaticAbilities: [
            { name: 'Casca Grossa', description: 'Você soma sua Constituição na Defesa, limitado pelo seu nível.' }
          ]
        },
        5: {
          automaticAbilities: [
            { name: 'Briga (1d8)', description: 'Seu dano desarmado aumenta para 1d8.' }
          ]
        },
        6: {
          automaticAbilities: [
            { name: 'Golpe Relâmpago Aprimorado', description: 'Você pode gastar até 2 PM para realizar até dois ataques desarmados adicionais.' }
          ]
        },
        9: {
          automaticAbilities: [
            { name: 'Briga (1d10)', description: 'Seu dano desarmado aumenta para 1d10.' }
          ]
        },
        13: {
          automaticAbilities: [
            { name: 'Briga (2d6)', description: 'Seu dano desarmado aumenta para 2d6.' }
          ]
        },
        17: {
          automaticAbilities: [
            { name: 'Briga (2d8)', description: 'Seu dano desarmado aumenta para 2d8.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Campeão dos Campeões', description: 'Seu dano desarmado aumenta para 2d10, margem de crítico desarmado passa para 18/x3 e você ganha imunidade a atordoamento.' }
          ]
        }
      })
    }
  },

  nobre: {
    id: 'nobre',
    name: 'Nobre',
    pvBase: 16,
    pvPerLevel: 4,
    pmBase: 4,
    pmPerLevel: 4,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Autoconfiança', description: 'Você soma seu Carisma na Defesa.' },
          { name: 'Espólio', description: 'Você começa o jogo com um item de alto valor ou superior.' },
          { name: 'Orgulho', description: 'Você pode gastar PM para somar seu Carisma em testes de perícia.' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        3: {
          automaticAbilities: [
            { name: 'Riqueza', description: 'Você recebe tibares adicionais de rendimentos e patrocínio no início de cada aventura.' }
          ]
        },
        5: {
          automaticAbilities: [
            { name: 'Líder Nato', description: 'Você pode gastar 2 PM para inspirar todos os aliados com bônus em testes e moral.' }
          ]
        },
        11: {
          automaticAbilities: [
            { name: 'Comandar Maior', description: 'Você pode gastar PM para ordenar que um aliado realize uma ação padrão imediatamente fora do turno dele.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Soberano', description: 'Qualquer criatura que deseje atacá-lo diretamente deve antes passar em um teste de Vontade (CD baseada em Carisma).' }
          ]
        }
      })
    }
  },

  paladino: {
    id: 'paladino',
    name: 'Paladino',
    pvBase: 20,
    pvPerLevel: 5,
    pmBase: 3,
    pmPerLevel: 3,
    isSpellcaster: false,
    maxSpellCircleByLevel: NO_SPELLS,
    levels: {
      1: {
        level: 1,
        automaticAbilities: [
          { name: 'Abençoado', description: 'Você soma seu Carisma em todos os seus testes de resistência.' },
          { name: 'Código do Herói', description: 'Você segue as virtudes de honra, compaixão e coragem sagrada.' },
          { name: 'Devoto Fiel', description: 'Você deve ser devoto de Khalmyr, Lena, Marah, Tanna-Toh, Thyatis ou Valkaria.' },
          { name: 'Golpe Divino (+1d8)', description: 'Você pode gastar 1 PM para causar +1d8 de dano adicional no ataque.' }
        ],
        grantsPowerChoice: false
      },
      ...createProgressionMap(2, 20, {
        2: {
          automaticAbilities: [
            { name: 'Cura Pelas Mãos (1d8+1)', description: 'Você pode gastar 1 PM para tocar uma criatura e curar 1d8+1 PV (ou causar dano a mortos-vivos).' }
          ]
        },
        3: {
          automaticAbilities: [
            { name: 'Aura de Luz (+1)', description: 'Você emite uma aura de alcance curto que concede +1 na Defesa e resistências para si e aliados.' }
          ]
        },
        5: {
          automaticAbilities: [
            { name: 'Golpe Divino (+2d8)', description: 'O dano extra do Golpe Divino aumenta para +2d8 gastando 2 PM.' }
          ]
        },
        6: {
          automaticAbilities: [
            { name: 'Cura Pelas Mãos (2d8+2)', description: 'A Cura Pelas Mãos aumenta para 2d8+2 PV gastando 2 PM.' }
          ]
        },
        9: {
          automaticAbilities: [
            { name: 'Golpe Divino (+3d8)', description: 'O dano extra do Golpe Divino aumenta para +3d8 gastando 3 PM.' }
          ]
        },
        10: {
          automaticAbilities: [
            { name: 'Cura Pelas Mãos (3d8+3)', description: 'A Cura Pelas Mãos aumenta para 3d8+3 PV gastando 3 PM.' },
            { name: 'Aura de Luz (+2)', description: 'O bônus da Aura de Luz aumenta para +2.' }
          ]
        },
        13: {
          automaticAbilities: [
            { name: 'Golpe Divino (+4d8)', description: 'O dano extra do Golpe Divino aumenta para +4d8 gastando 4 PM.' }
          ]
        },
        14: {
          automaticAbilities: [
            { name: 'Cura Pelas Mãos (4d8+4)', description: 'A Cura Pelas Mãos aumenta para 4d8+4 PV gastando 4 PM.' }
          ]
        },
        15: {
          automaticAbilities: [
            { name: 'Aura de Luz (+3)', description: 'O bônus da Aura de Luz aumenta para +3.' }
          ]
        },
        17: {
          automaticAbilities: [
            { name: 'Golpe Divino (+5d8)', description: 'O dano extra do Golpe Divino aumenta para +5d8 gastando 5 PM.' }
          ]
        },
        18: {
          automaticAbilities: [
            { name: 'Cura Pelas Mãos (5d8+5)', description: 'A Cura Pelas Mãos aumenta para 5d8+5 PV gastando 5 PM.' }
          ]
        },
        20: {
          automaticAbilities: [
            { name: 'Campeão da Justiça', description: 'O custo do Golpe Divino é reduzido em 1 PM e causa +6d8 de dano; sua Aura de Luz concede cura contínua a aliados.' }
          ]
        }
      })
    }
  }
};

/**
 * Função auxiliar que preenche os níveis 2 a 20 garantindo que:
 * - grantsPowerChoice é sempre TRUE (todos os níveis de 2 a 20 concedem 1 Poder de Classe ou Geral)
 * - mescla habilidades automáticas e notas específicas quando houver
 */
function createProgressionMap(
  startLevel: number,
  endLevel: number,
  overrides: Record<number, Partial<LevelProgressionData>>
): Record<number, LevelProgressionData> {
  const result: Record<number, LevelProgressionData> = {};
  for (let lvl = startLevel; lvl <= endLevel; lvl++) {
    const override = overrides[lvl] || {};
    result[lvl] = {
      level: lvl,
      automaticAbilities: override.automaticAbilities || [],
      grantsPowerChoice: true, // No Tormenta 20 JdA, todo nível do 2 ao 20 concede um poder
      unlockedSpellCircle: override.unlockedSpellCircle,
      notes: override.notes
    };
  }
  return result;
}

export const getClassProgression = (classId: string, level: number): LevelProgressionData | null => {
  const cid = (classId || 'guerreiro').toLowerCase();
  const classDef = T20_OFFICIAL_PROGRESSION[cid] || T20_OFFICIAL_PROGRESSION.guerreiro;
  return classDef.levels[level] || null;
};
