import { T20Spell } from '../types/spells';
import { T20_SPELLS } from '../data/t20Spells';
import { CombatRole, MonsterRole, MonsterRank, CreatureType, CombatStyle } from '../constants/monsterData';

export type SpellCombatCategory = 'ataque' | 'ofensiva' | 'controle' | 'defesa' | 'suporte' | 'utilidade';

export interface MonsterSpellEntry {
  id: string;
  name: string;
  circle: number;
  costPM: number;
  type: 'arcana' | 'divina' | 'universal' | 'simulada';
  school: string;
  category: SpellCombatCategory;
  execution: string;
  range: string;
  targetOrArea: string;
  duration: string;
  resistance?: string;
  attackBonus?: number;
  damage?: string;
  critical?: string;
  description: string;
  dcFormatted: string;
  effectSummary?: string;
}

// Mapeamento explícito de perfis mecânicos para magias clássicas do T20
interface SpellProfileOverride {
  category: SpellCombatCategory;
  damage?: string;
  isAttack?: boolean;
  critical?: string;
  effectSummary?: string;
}

const SPELL_PROFILES: Record<string, SpellProfileOverride> = {
  // ==========================================================================
  // 1º CÍRCULO
  // ==========================================================================
  // Ataque
  'toque-chocante': { category: 'ataque', isAttack: true, damage: '2d8+2 eletricidade', critical: '20/x2', effectSummary: 'Ataque corpo a corpo com arco elétrico causando 2d8+2 eletricidade.' },
  'seta-infalivel-de-talude': { category: 'ataque', isAttack: true, damage: '3d4+3 essência', critical: 'Acerto Automático', effectSummary: 'Dispara 3 dardos de pura essência mágica teleguiados infalíveis.' },
  'raio-do-enfraquecimento': { category: 'ataque', isAttack: true, damage: '–2 Força / 1d8 trevas', critical: '20/x2', effectSummary: 'Raio necrótico debilitante que impõe -2 em testes de Força e dano físico.' },
  // Ofensiva
  'explosao-de-chamas': { category: 'ofensiva', damage: '2d6 fogo', effectSummary: 'Cone de chamas de 6m causando 2d6 de fogo (Reflexos reduz à metade).' },
  'infligir-ferimentos': { category: 'ofensiva', damage: '2d8+2 trevas', effectSummary: 'Toque de energia necrótica causando 2d8+2 de trevas (Fortitude reduz à metade).' },
  'adaga-mental': { category: 'ofensiva', damage: '2d6 psíquico', effectSummary: 'Dispara uma lâmina psíquica causando 2d6 de dano e atordoamento (Vontade parcial).' },
  'despedacar': { category: 'ofensiva', damage: '1d8+2 impacto', effectSummary: 'Vibração sônica que despedaça objetos e causa dano a criaturas (Fortitude reduz).' },
  // Controle
  'area-escorregadia': { category: 'controle', effectSummary: 'Cobre uma área com gordura escorregadia; alvos ficam Caídos (Reflexos anula).' },
  'amedrontar': { category: 'controle', effectSummary: 'Induz pânico mágico em um alvo, deixando-o Apavorado por 1 rodada (Vontade parcial).' },
  'sono': { category: 'controle', effectSummary: 'Força alvos a caírem em sono profundo mágico e indefesos (Vontade anula).' },
  'comando': { category: 'controle', effectSummary: 'Comando vocal mental irresistível (Fuja, Largue, Caia) por 1 rodada (Vontade anula).' },
  'escuridao': { category: 'controle', effectSummary: 'Cria escuridão impenetrável bloqueando toda a visão na área.' },
  // Defesa
  'armadura-arcana': { category: 'defesa', effectSummary: 'Barreira mística invisível que concede +5 na Defesa até o fim da cena.' },
  'escudo-da-fe': { category: 'defesa', effectSummary: 'Escudo divino brilhante concedendo +2 na Defesa até o fim da cena.' },
  'santuario': { category: 'defesa', effectSummary: 'Oponentes devem passar em Vontade para conseguir desferir ataques contra o conjurador.' },
  // Suporte
  'curar-ferimentos': { category: 'suporte', effectSummary: 'Canaliza energia curativa restaurando 2d8+2 PV de um aliado.' },
  'bencao': { category: 'suporte', effectSummary: 'Abençoa aliados na área concedendo +1 em testes de ataque e dano.' },
  // Utilidade
  'concentracao-de-combate': { category: 'utilidade', effectSummary: 'Foco aguçado: rola dois dados em testes de ataque e escolhe o melhor resultado.' },
  'salto-dimensional': { category: 'utilidade', effectSummary: 'Teletransporte tático instantâneo de até 9m para um espaço desobstruído.' },

  // ==========================================================================
  // 2º CÍRCULO
  // ==========================================================================
  // Ataque
  'flecha-acida': { category: 'ataque', isAttack: true, damage: '3d4+3 ácido + contínuo', critical: '20/x2', effectSummary: 'Flecha ácida corrosiva que causa dano imediato e contínuo rodada a rodada.' },
  'raio-solar': { category: 'ataque', isAttack: true, damage: '4d8 luz', critical: '20/x2', effectSummary: 'Feixe solar concentrado que queima e cega o alvo (Reflexos evita cegueira).' },
  'toque-vampirico': { category: 'ataque', isAttack: true, damage: '3d6 trevas', critical: '20/x2', effectSummary: 'Toque sombrio que drena a vitalidade do alvo para curar os PV do conjurador.' },
  'soco-de-arsenal': { category: 'ataque', isAttack: true, damage: '4d6 impacto', critical: '20/x2', effectSummary: 'Punho místico colossal de força bruta esmagando o oponente.' },
  // Ofensiva
  'bola-de-fogo': { category: 'ofensiva', damage: '6d6 fogo', effectSummary: 'Explosão esférica devastadora de chamas em área de 6m (Reflexos reduz à metade).' },
  'relampago': { category: 'ofensiva', damage: '6d6 eletricidade', effectSummary: 'Linha fulminante de raios perfurando todos os alvos no caminho (Reflexos reduz).' },
  'cranio-voador-de-vladislav': { category: 'ofensiva', damage: '4d12 trevas', effectSummary: 'Projétil necrótico em forma de crânio causando tremenda explosão sombria.' },
  'sopro-das-uivantes': { category: 'ofensiva', damage: '4d6 frio', effectSummary: 'Cone de vento polar cortante que causa dano de frio e impõe Lentidão.' },
  'enxame-de-pestes': { category: 'ofensiva', damage: '3d6 veneno', effectSummary: 'Nuvem voraz de insetos peçonhentos que sufocam e corroem os alvos.' },
  'miasma-mefitico': { category: 'ofensiva', damage: '3d8 veneno/trevas', effectSummary: 'Vapor fétido tóxico que sufoca e debilita as forças dos oponentes.' },
  'tempestade-divina': { category: 'ofensiva', damage: '4d8 luz/impacto', effectSummary: 'Vórtice divino de energia radiante e ventos punindo os inimigos.' },
  // Controle
  'amarras-etereas': { category: 'controle', effectSummary: 'Laços de energia pura que agarram e paralisam o alvo no solo (Reflexos anula).' },
  'sussurros-insanos': { category: 'controle', effectSummary: 'Vozes espectrais causam insanidade temporária, deixando alvos Confusos (Vontade anula).' },
  'desespero-esmagador': { category: 'controle', effectSummary: 'Onda de melancolia profunda impondo -2 em todas as jogadas e perícias (Vontade anula).' },
  'silencio': { category: 'controle', effectSummary: 'Área de silêncio absoluto que impede conjuração de magias verbais e sons.' },
  // Defesa
  'campo-de-forca': { category: 'defesa', effectSummary: 'Cria uma redoma reativa que absorve até 30 pontos de qualquer tipo de dano.' },
  'camuflagem-ilusoria': { category: 'defesa', effectSummary: 'Distorce a imagem da criatura, impondo 20% de chance de erro em ataques inimigos.' },
  // Suporte
  'dissipar-magia': { category: 'suporte', effectSummary: 'Encerra instantaneamente magias ativas ou anula feitiços em conjuração.' },
  // Utilidade
  'invisibilidade': { category: 'utilidade', effectSummary: 'Fica completamente invisível, recebendo camuflagem total e +10 em Furtividade.' },
  'velocidade': { category: 'utilidade', effectSummary: 'Acelera o metabolismo, concedendo +1 ação padrão adicional por rodada e +2 na Defesa.' },

  // ==========================================================================
  // 3º CÍRCULO
  // ==========================================================================
  // Ataque
  'lanca-ignea-de-aleph': { category: 'ataque', isAttack: true, damage: '6d6 fogo', critical: '20/x2', effectSummary: 'Lança mística de fogo puro arremessada contra o alvo perfurando defesas.' },
  // Ofensiva
  'coluna-de-chamas': { category: 'ofensiva', damage: '8d6 fogo/luz', effectSummary: 'Coluna celestial incandescente de 3m de raio descendo dos céus (Reflexos reduz).' },
  'erupcao-glacial': { category: 'ofensiva', damage: '6d6 frio/impacto', effectSummary: 'Picos afiados de gelo brotam do chão ferindo e empalando alvos na área.' },
  'ferver-sangue': { category: 'ofensiva', damage: '6d8 fogo/sangue', effectSummary: 'Superaquece o sangue no interior da vítima causando dor atroz e dano contínuo.' },
  'enxame-rubro-de-ichabod': { category: 'ofensiva', damage: '5d8 trevas', effectSummary: 'Nuvem rubra de sangue corrosivo devorando a carne dos inimigos na área.' },
  'ilusao-lacerante': { category: 'ofensiva', damage: '6d6 psíquico', effectSummary: 'Gerações mentais aterrorizantes que ferem psiquicamente os alvos (Vontade parcial).' },
  'poeira-da-podridao': { category: 'ofensiva', damage: '4d10 necrótico', effectSummary: 'Cinzas funerárias necróticas que decompõem a matéria orgânica.' },
  // Controle
  'tentaculos-de-trevas': { category: 'controle', effectSummary: 'Tentáculos viscosos de sombras brotam do chão agarrando e esmagando alvos na área.' },
  'banimento': { category: 'controle', effectSummary: 'Força criaturas extraplanares ou espíritos de volta a seu plano de origem (Vontade anula).' },
  'imobilizar': { category: 'controle', effectSummary: 'Paralisa completamente o alvo mágico no lugar sem permitir ações (Vontade anula).' },
  'muralha-elemental': { category: 'controle', damage: '4d6 elemental', effectSummary: 'Ergue uma cortina sólida de chamas, gelo ou pedra bloqueando a passagem.' },
  // Defesa
  'globo-de-invulnerabilidade': { category: 'defesa', effectSummary: 'Cúpula impenetrável imune a todas as magias de 1º e 2º círculos.' },
  'pele-de-pedra': { category: 'defesa', effectSummary: 'Endurece a pele como rocha pura, fornecendo Redução de Dano (RD 10) duradoura.' },
  'manto-de-sombras': { category: 'defesa', effectSummary: 'Manto etéreo que concede camuflagem parcial e absorção contra dano de luz e armas.' },
  // Suporte
  'sopro-da-salvacao': { category: 'suporte', effectSummary: 'Onda divina que recupera PV de múltiplos aliados simultaneamente em alcance curto.' },
  'heroismo': { category: 'suporte', effectSummary: 'Inspira o alvo com bravura inabalável, imunidade a medo e +2 em todas as rolagens.' },
  'potencia-divina': { category: 'suporte', effectSummary: 'Amplifica a musculatura e constituição com poder sagrado supremo (+4 atributos físicos).' },
  // Utilidade
  'transformacao-de-guerra': { category: 'utilidade', effectSummary: 'Converte poder mágico em perícia marcial lendária (+5 no ataque, dano dobrado).' },
  'teletransporte': { category: 'utilidade', effectSummary: 'Transporta a criatura e aliados adjacentes instantaneamente a até centenas de metros.' },
  'voo': { category: 'utilidade', effectSummary: 'Concede deslocamento de voo de 18m com manobrabilidade perfeita.' },

  // ==========================================================================
  // 4º CÍRCULO
  // ==========================================================================
  // Ataque
  'desintegrar': { category: 'ataque', isAttack: true, damage: '10d10 essência', critical: '20/x2', effectSummary: 'Feixe esmeralda letal que pulveriza o alvo em cinzas finas (Fortitude parcial).' },
  'talho-invisivel-de-edauros': { category: 'ataque', isAttack: true, damage: '8d8 corte/essência', critical: '19-20/x2', effectSummary: 'Lâmina imaterial invisível de força pura fatiando o inimigo à distância.' },
  // Ofensiva
  'assassino-fantasmagorico': { category: 'ofensiva', damage: '8d6 trevas/pavor', effectSummary: 'Pesadelo encarnado letal: induz síncope mortal por terror puro (Vontade/Fortitude parcial).' },
  'relampago-flamejante-de-reynard': { category: 'ofensiva', damage: '10d6 raio/fogo', effectSummary: 'Tempestade de arcos elétricos inflamados combinando dano de fogo e raio em área.' },
  'raio-polar': { category: 'ofensiva', damage: '10d6 frio', effectSummary: 'Feixe de gelo absoluto que congela o alvo e causa lentidão extrema (Fortitude parcial).' },
  'terremoto': { category: 'ofensiva', damage: '10d6 impacto', effectSummary: 'Fissura e abalo tectônico que abre fendas no solo e esmaga construções e criaturas.' },
  'colera-de-azgher': { category: 'ofensiva', damage: '8d10 fogo/luz', effectSummary: 'Chuva escaldante de brasas celestiais de Azgher purificando os infiéis.' },
  // Controle
  'muralha-de-ossos': { category: 'controle', effectSummary: 'Barreira espessa de ossos e crânios pontiagudos bloqueando a passagem e dilacerando invasores.' },
  'cupula-de-repulsao': { category: 'controle', effectSummary: 'Cúpula cinética invisível que repele violentamente qualquer criatura tentando se aproximar.' },
  'marionete': { category: 'controle', effectSummary: 'Assume controle biomecânico do corpo do oponente, forçando-o a atacar aliados (Fortitude anula).' },
  'explosao-caleidoscopica': { category: 'controle', effectSummary: 'Clarão estroboscópico devastador que cega, atordoa e desorienta os inimigos na área.' },
  // Defesa
  'campo-antimagia': { category: 'defesa', effectSummary: 'Esfera de 3m de raio suprimindo completamente qualquer efeito mágico ou feitiço ativo.' },
  'manto-do-cruzado': { category: 'defesa', effectSummary: 'Aura radiante divina que concede RD 15 e imunidade a efeitos de controle mental.' },
  // Suporte
  'circulo-da-restauracao': { category: 'suporte', effectSummary: 'Restaura PV massivos e remove todas as condições debilitantes e venenos de aliados na área.' },
  'libertacao': { category: 'suporte', effectSummary: 'Liberta o alvo instantaneamente de qualquer forma de paralisia, aprisionamento ou restrição.' },
  'guardiao-divino': { category: 'suporte', effectSummary: 'Invoca uma entidade celestial armada para proteger aliados e absorver dano.' },
  // Utilidade
  'forma-eterea': { category: 'utilidade', effectSummary: 'Transfere o corpo para o Plano Etéreo, tornando a criatura incorpórea e intocável.' },
  'visao-da-verdade': { category: 'utilidade', effectSummary: 'Enxerga através de todas as ilusões, escuridão, metamorfoses e invisibilidade.' },

  // ==========================================================================
  // 5º CÍRCULO
  // ==========================================================================
  // Ataque
  'toque-da-morte': { category: 'ataque', isAttack: true, damage: '10d8+10 trevas', critical: '20/x2', effectSummary: 'Toque letal de pura energia necrótica: causa 10d8+10 de trevas ou reduz os PV a –10.' },
  // Ofensiva
  'chuva-de-meteoros': { category: 'ofensiva', damage: '16d6 fogo/impacto', effectSummary: 'Bombardeio de meteoros incandescentes varrendo o campo de batalha em área massiva.' },
  'mata-dragao': { category: 'ofensiva', damage: '15d10 essência', effectSummary: 'Lança lendária colossal de pura essência mística desenhada para aniquilar titãs.' },
  'barragem-elemental-de-vectorius': { category: 'ofensiva', damage: '4x 6d6 elemental', effectSummary: 'Quatro esferas elementais (ácido, raio, fogo, frio) explodindo em 12m com condições.' },
  'deflagracao-de-mana': { category: 'ofensiva', damage: '150 essência', effectSummary: 'Explosão de 150 de essência em 15m de raio anulando temporariamente itens mágicos.' },
  'furia-do-panteao': { category: 'ofensiva', damage: '10d10 divino', effectSummary: 'Manifestação da cólera divina dos deuses de Arton em área massiva.' },
  // Controle
  'buraco-negro': { category: 'controle', damage: '10d6 essência', effectSummary: 'Singularidade gravitacional que suga, esmaga e tritura todos os inimigos no vórtice.' },
  'palavra-primordial': { category: 'controle', effectSummary: 'Comando primordial cósmico que atordoa, paralisa ou destrói alvos incapazes de resistir.' },
  'aprisionamento': { category: 'controle', effectSummary: 'Aprisiona permanentemente a alma e o corpo do oponente em uma prisão extradimensional.' },
  'roubar-a-alma': { category: 'controle', effectSummary: 'Arranca a alma da vítima de seu corpo vivo, aprisionando-a em uma gema negra.' },
  // Defesa
  'invulnerabilidade': { category: 'defesa', effectSummary: 'Imunidade absoluta e completa a qualquer tipo de dano ou efeito nocivo por 1 rodada.' },
  'aura-divina': { category: 'defesa', effectSummary: 'Aura ofuscante que concede +5 em Defesa, resistências e absorve dano massivo.' },
  // Suporte
  'engenho-de-mana': { category: 'suporte', effectSummary: 'Estrutura mística perpétua que recupera Pontos de Mana e potencializa magias aliadas.' },
  'alterar-destino': { category: 'suporte', effectSummary: 'Reescreve os fios da realidade para converter falhas em sucessos automáticos imediatos.' },
  // Utilidade
  'controlar-o-tempo': { category: 'utilidade', effectSummary: 'Congela o fluxo temporal para todos os outros seres, ganhando 1d4+1 rodadas livres.' }
};

export const MonsterMagicService = {
  /**
   * Converte ND para Nível de Conjurador coerente (nunca confunde cegamente ND com nível de conjurador).
   */
  getCasterLevel(ndValue: number, rank: MonsterRank = 'normal', combatRole: CombatRole = 'especial'): number {
    if (ndValue <= 0.25) return 1;
    if (ndValue <= 0.5) return 1;
    if (ndValue === 21) return 21;
    if (ndValue === 22) return 22;

    const baseNivel = Math.max(1, Math.round(ndValue));
    return baseNivel;
  },

  /**
   * Determina o círculo máximo de magia de acordo com as regras de Tormenta 20:
   * - Nível 1–4  -> 1º Círculo
   * - Nível 5–8  -> 2º Círculo
   * - Nível 9–12 -> 3º Círculo
   * - Nível 13–16 -> 4º Círculo
   * - Nível 17–20 (ou S/S+) -> 5º Círculo
   */
  getMaxCircle(casterLevelOrNd: number): number {
    if (casterLevelOrNd >= 17) return 5;
    if (casterLevelOrNd >= 13) return 4;
    if (casterLevelOrNd >= 9) return 3;
    if (casterLevelOrNd >= 5) return 2;
    return 1;
  },

  /**
   * Verifica se a criatura deve possuir magias / habilidades mágicas.
   * Regra REALMOR: combatStyle 'conjurador' é conjurador. Marcial e Atirador NÃO são por padrão.
   * Tático não vira conjurador automaticamente, apenas se o conceito ou papel exigir.
   */
  isCaster(params: {
    combatStyle?: CombatStyle;
    combatRole?: CombatRole;
    role?: MonsterRole;
    theme?: string;
    type?: CreatureType;
    concept?: string;
  }): boolean {
    const { combatStyle, role, concept } = params;

    if (combatStyle === 'conjurador') return true;

    if (combatStyle === 'marcial' || combatStyle === 'atirador') {
      if (concept) {
        const lower = concept.toLowerCase();
        if (lower.includes('conjurador') || lower.includes('mago') || lower.includes('feiticeiro') || lower.includes('bruxo') || lower.includes('clérigo') || lower.includes('necromante')) {
          return true;
        }
      }
      return false;
    }

    if (combatStyle === 'tatico') {
      if (role === 'conjurador') return true;
      if (concept) {
        const lower = concept.toLowerCase();
        if (lower.includes('conjurador') || lower.includes('mago') || lower.includes('feiticeiro') || lower.includes('bruxo') || lower.includes('clérigo') || lower.includes('necromante') || lower.includes('magia')) {
          return true;
        }
      }
      return false;
    }

    if (role === 'conjurador') return true;

    if (concept) {
      const lower = concept.toLowerCase();
      if (
        lower.includes('mago') ||
        lower.includes('feiticeiro') ||
        lower.includes('bruxo') ||
        lower.includes('clérigo') ||
        lower.includes('sacerdote') ||
        lower.includes('arcano') ||
        lower.includes('necromante') ||
        lower.includes('conjurador') ||
        lower.includes('druida') ||
        lower.includes('xamã') ||
        lower.includes('feitiço') ||
        lower.includes('magia')
      ) {
        return true;
      }
    }

    return false;
  },

  /**
   * Calcula a reserva de Pontos de Mana (PM) estimada para o conjurador.
   */
  calculatePM(ndValue: number, rank: MonsterRank): number {
    let basePM = Math.max(3, Math.floor(ndValue * 4) + 6);
    if (rank === 'elite') basePM = Math.floor(basePM * 1.25);
    if (rank === 'chefe') basePM = Math.floor(basePM * 1.5);
    return basePM;
  },

  /**
   * Categoriza uma magia do T20 (Ataque, Ofensiva, Controle, Defesa, Suporte, Utilidade).
   */
  classifySpell(spell: T20Spell): {
    category: SpellCombatCategory;
    isAttack: boolean;
    damageFormula?: string;
    critical?: string;
    effectSummary?: string;
  } {
    const override = SPELL_PROFILES[spell.id];
    if (override) {
      return {
        category: override.category,
        isAttack: !!override.isAttack,
        damageFormula: override.damage,
        critical: override.critical,
        effectSummary: override.effectSummary
      };
    }

    const desc = (spell.description + ' ' + (spell.resistance || '') + ' ' + spell.name).toLowerCase();
    
    // Detecção segura de ataque: deve exigir teste de ataque explícito, e não mero gatilho defensivo
    const isAttack = (desc.includes('teste de ataque') || desc.includes('ataque à distância') || desc.includes('ataque corpo a corpo')) && 
                     !desc.includes('quando sofre um ataque') && !desc.includes('ao sofrer um ataque');
    
    let category: SpellCombatCategory = 'utilidade';
    let damageFormula: string | undefined = undefined;

    // Detecta fórmulas de dano comuns na descrição
    const dmgMatch = spell.description.match(/(\d+d\d+(\+\d+)?)\s+(pontos de dano|de dano)/i);
    if (dmgMatch) {
      damageFormula = dmgMatch[1];
    }

    if (isAttack) {
      category = 'ataque';
    } else if (spell.school === 'Evocação' || desc.includes('pontos de dano') || desc.includes('dano de fogo') || desc.includes('dano de frio') || desc.includes('dano de eletricidade') || desc.includes('dano de trevas')) {
      category = 'ofensiva';
    } else if (spell.school === 'Encantamento' || spell.school === 'Ilusão' || desc.includes('paralisado') || desc.includes('agarrado') || desc.includes('abalado') || desc.includes('cego') || desc.includes('atordoado') || desc.includes('terreno difícil')) {
      category = 'controle';
    } else if (spell.school === 'Abjuração' || desc.includes('defesa') || desc.includes('redução de dano') || desc.includes('imune a')) {
      category = 'defesa';
    } else if (desc.includes('recupera') || desc.includes('cura') || desc.includes('bônus de') || desc.includes('aliados recebem')) {
      category = 'suporte';
    }

    // Cria resumo objetivo de 1-2 frases
    let effectSummary = spell.description.split('\n')[0].trim();
    if (effectSummary.length > 120) {
      const firstDot = effectSummary.indexOf('.');
      if (firstDot > 20) {
        effectSummary = effectSummary.slice(0, firstDot + 1);
      } else {
        effectSummary = effectSummary.slice(0, 115) + '...';
      }
    }

    return {
      category,
      isAttack,
      damageFormula,
      critical: isAttack ? '20/x2' : undefined,
      effectSummary
    };
  },

  /**
   * Calcula a quantidade de magias conforme as regras de distribuição e balanceamento REALMOR:
   * - ND 1–4: 2–3 magias
   * - ND 5–9: 3–4 magias
   * - ND 10–14: 4–5 magias
   * - ND 15–19: 5–6 magias
   * - ND 20: 6–8 magias
   * - S / S+: 6–8 magias
   */
  calculateSpellCount(ndValue: number, rank: MonsterRank, combatRole: CombatRole): number {
    // Lacaios possuem repertório estritamente enxuto para controle rápido do mestre
    if (combatRole === 'lacaio') {
      return ndValue <= 5 ? 1 : 2;
    }

    // Solo Conjurador foca em híbrido físico + magias pontuais
    if (combatRole === 'solo') {
      if (ndValue <= 4) return rank === 'chefe' ? 3 : 2;
      if (ndValue <= 9) return rank === 'chefe' ? 4 : 3;
      if (ndValue <= 14) return rank === 'chefe' ? 5 : 4;
      if (ndValue <= 19) return rank === 'chefe' ? 6 : 5;
      return rank === 'chefe' ? 7 : 6;
    }

    // Papel ESPECIAL Conjurador
    if (ndValue <= 4) {
      return rank === 'normal' ? 2 : 3;
    } else if (ndValue <= 9) {
      return rank === 'normal' ? 3 : 4;
    } else if (ndValue <= 14) {
      return rank === 'normal' ? 4 : 5;
    } else if (ndValue <= 19) {
      return rank === 'normal' ? 5 : 6;
    } else if (ndValue <= 20) {
      if (rank === 'normal') return 6;
      if (rank === 'elite') return 7;
      return 8; // Chefe ND 20
    } else {
      // ND S / S+ (Teto de 8 magias)
      if (rank === 'normal') return 6;
      if (rank === 'elite') return 7;
      return 8;
    }
  },

  /**
   * Seleciona e formata magias oficiais do T20 com rigorosa separação de círculos e proporção ofensiva.
   */
  generateSpells(params: {
    ndValue: number;
    combatStyle?: CombatStyle;
    combatRole?: CombatRole;
    role?: MonsterRole;
    rank?: MonsterRank;
    theme?: string;
    saveDC: number;
    attackBonus?: number;
    targetDamage?: number;
  }): MonsterSpellEntry[] {
    const { 
      ndValue, 
      rank = 'normal', 
      combatRole = 'especial', 
      combatStyle = 'conjurador',
      role = 'conjurador',
      theme = 'Geral', 
      saveDC, 
      attackBonus = 0, 
      targetDamage = 10 
    } = params;

    const casterLevel = this.getCasterLevel(ndValue, rank, combatRole);
    const maxCircle = this.getMaxCircle(casterLevel);
    const spellCount = this.calculateSpellCount(ndValue, rank, combatRole);
    const themeLower = theme.toLowerCase();

    // Filtra todas as magias permitidas que nunca ultrapassam o círculo máximo permitido
    const allAllowedSpells = T20_SPELLS.filter(s => s.circle <= maxCircle);

    // Classifica todas as magias permitidas
    const allClassified = allAllowedSpells.map(s => ({
      spell: s,
      ...this.classifySpell(s),
      niche: this.getSpellNiche(s)
    }));

    const isChefe = rank === 'chefe';
    const isConjurador = combatStyle === 'conjurador' || role === 'conjurador' || combatRole === 'especial';

    // Helper de afinidade temática
    const matchTheme = (s: T20Spell) => {
      const desc = (s.description + ' ' + s.name + ' ' + s.school).toLowerCase();
      if (themeLower === 'fogo' && (desc.includes('fogo') || desc.includes('chama') || s.school === 'Evocação')) return true;
      if (themeLower === 'gelo' && (desc.includes('frio') || desc.includes('gelo') || s.school === 'Evocação')) return true;
      if (themeLower === 'sombra' && (desc.includes('escurid') || desc.includes('sombra') || s.school === 'Necromancia' || s.school === 'Ilusão')) return true;
      if (themeLower === 'profano' && (s.school === 'Necromancia' || desc.includes('morte') || desc.includes('sangue') || desc.includes('trevas'))) return true;
      if (themeLower === 'sagrado' && (s.type === 'divina' || s.school === 'Abjuração' || desc.includes('luz') || desc.includes('cura') || desc.includes('sagrado'))) return true;
      if (themeLower === 'arcano' && (s.type === 'arcana' || s.school === 'Evocação' || s.school === 'Transmutação' || desc.includes('arcano') || desc.includes('essência'))) return true;
      if (themeLower === 'veneno' && (desc.includes('veneno') || desc.includes('ácido') || s.school === 'Necromancia')) return true;
      if (themeLower === 'eletricidade' || themeLower === 'eletrico') {
        if (desc.includes('relâmpago') || desc.includes('raio') || desc.includes('choque') || desc.includes('elétrico')) return true;
      }
      if (themeLower === 'natureza' && (desc.includes('planta') || desc.includes('terra') || desc.includes('vento') || s.type === 'divina')) return true;
      return false;
    };

    // ========================================================================
    // REGRA 1: CHEFE CONJURADOR — CÍRCULO MÁXIMO COM EXCEÇÃO CONTROLADA
    // ========================================================================
    // Prioriza fortemente o círculo máximo.
    // Pode utilizar no máximo 1 magia de círculo inferior SOMENTE quando houver
    // justificativa funcional real (mobilidade tática, barreira protetora, controle ou tema).
    // Nunca ultrapassa o círculo máximo do ND.
    let lowerCircleException: typeof allClassified[0] | null = null;

    if (isChefe && isConjurador && maxCircle > 1) {
      // Candidatas funcionais justificadas de círculo inferior
      const eligibleExceptions = allClassified.filter(c => {
        if (c.spell.circle >= maxCircle) return false;
        
        // 1. Mobilidade / teletransporte tático
        const isMobility = c.spell.id === 'salto-dimensional' || c.spell.id === 'velocidade' || c.spell.id === 'forma-eterea';
        // 2. Proteção / reação emergencial
        const isDefense = c.spell.id === 'campo-de-forca' || c.spell.id === 'camuflagem-ilusoria' || c.spell.id === 'pele-de-pedra' || c.spell.id === 'globo-de-invulnerabilidade' || c.spell.id === 'armadura-arcana' || c.spell.id === 'santuario';
        // 3. Controle tático singular
        const isControl = c.spell.id === 'amarras-etereas' || c.spell.id === 'silencio' || c.spell.id === 'escuridao' || c.spell.id === 'imobilizar' || c.spell.id === 'tentaculos-de-trevas';
        // 4. Assinatura temática icônica
        const isThematicSignature = matchTheme(c.spell) && (c.category === 'ofensiva' || c.category === 'ataque' || c.category === 'controle');

        return isMobility || isDefense || isControl || isThematicSignature;
      });

      // Inclui a exceção controlada apenas quando houver justificativa temática ou funcional (aprox. 50% de chance ou quando tema específico pedir)
      const hasSpecificTheme = themeLower !== 'geral' && themeLower !== '';
      const shouldIncludeException = eligibleExceptions.length > 0 && (hasSpecificTheme ? Math.random() > 0.35 : Math.random() > 0.5);

      if (shouldIncludeException) {
        // Prioriza exceção que combine com o tema, senão pega defesa/mobilidade
        const thematicExceptions = eligibleExceptions.filter(e => matchTheme(e.spell));
        const poolToPick = thematicExceptions.length > 0 ? thematicExceptions : eligibleExceptions;
        lowerCircleException = poolToPick[Math.floor(Math.random() * poolToPick.length)];
      }
    }

    // Pool primário de trabalho:
    // Para Chefe Conjurador: se houver exceção, reserva 1 vaga para ela e as demais são estritamente do maior círculo.
    // Se não houver exceção, 100% são do maior círculo.
    let primaryCandidates: typeof allClassified = [];
    if (isChefe && isConjurador) {
      primaryCandidates = allClassified.filter(c => c.spell.circle === maxCircle);
      if (primaryCandidates.length === 0) {
        primaryCandidates = allClassified;
      }
    } else {
      primaryCandidates = allClassified;
    }

    // Filtra pool temático dentro dos candidatos primários
    const thematicPrimary = primaryCandidates.filter(c => matchTheme(c.spell));
    const workingPool = thematicPrimary.length >= (spellCount - (lowerCircleException ? 1 : 0)) ? thematicPrimary : primaryCandidates;

    // ========================================================================
    // REGRA 3: KIT DE COMBATE FUNCIONAL & SEM DUPLICATAS
    // ========================================================================
    // Distribuição orientativa conforme Seção 3:
    // ND 1–4: 2–3 magias (>=1 ofensiva/ataque, >=1 defesa/controle/utilidade)
    // ND 5–9: 3–4 magias (1–2 ofensivas, restante controle, defesa, suporte)
    // ND 10–14: 4–5 magias (aprox metade ofensivas/ataque, restante controle/defesa/suporte)
    // ND 15–19: 5–6 magias (forte presença ofensiva com área/alto impacto + controle/defesa)
    // ND 20 / S / S+: 6–8 magias (ofensivo relevante sem duplicatas funcionais + controle/defesa/suporte)
    const targetMainCount = lowerCircleException ? spellCount - 1 : spellCount;

    let requiredOffensives = 1;
    if (ndValue >= 15) {
      requiredOffensives = Math.round(targetMainCount * 0.5);
    } else if (ndValue >= 10) {
      requiredOffensives = Math.max(2, Math.floor(targetMainCount * 0.5));
    } else if (ndValue >= 5) {
      requiredOffensives = Math.max(1, Math.min(2, Math.floor(targetMainCount * 0.45)));
    } else {
      requiredOffensives = 1;
    }

    const selectedEntries: typeof allClassified = [];
    const usedIds = new Set<string>();
    const usedNiches = new Set<string>();

    const tryAddSpell = (item: typeof allClassified[0]): boolean => {
      if (usedIds.has(item.spell.id)) return false;
      usedIds.add(item.spell.id);
      usedNiches.add(item.niche);
      selectedEntries.push(item);
      return true;
    };

    const pickDiverseFromList = (list: typeof allClassified, count: number) => {
      if (count <= 0) return;
      const shuffled = [...list].sort(() => 0.5 - Math.random());
      
      // 1ª passada: prioriza nichos ainda não utilizados para evitar clones funcionais
      for (const item of shuffled) {
        if (!usedIds.has(item.spell.id) && !usedNiches.has(item.niche)) {
          tryAddSpell(item);
          count--;
          if (selectedEntries.length >= targetMainCount || count <= 0) return;
        }
      }

      // 2ª passada: se ainda precisar preencher, aceita nicho repetido desde que a magia seja diferente
      for (const item of shuffled) {
        if (!usedIds.has(item.spell.id)) {
          tryAddSpell(item);
          count--;
          if (selectedEntries.length >= targetMainCount || count <= 0) return;
        }
      }
    };

    // 1. Seleciona Magias Ofensivas / Ataque com variedade (ex: 1 ataque direto + 1 área)
    const attackPool = workingPool.filter(c => c.category === 'ataque');
    const areaDamagePool = workingPool.filter(c => c.category === 'ofensiva');
    const combinedOffensive = workingPool.filter(c => c.category === 'ataque' || c.category === 'ofensiva');
    const fallbackOffensives = primaryCandidates.filter(c => c.category === 'ataque' || c.category === 'ofensiva');
    const fullOffensivePool = combinedOffensive.length > 0 ? combinedOffensive : fallbackOffensives;

    if (requiredOffensives >= 2 && attackPool.length > 0 && areaDamagePool.length > 0) {
      pickDiverseFromList(attackPool, 1);
      pickDiverseFromList(areaDamagePool, requiredOffensives - 1);
    } else {
      pickDiverseFromList(fullOffensivePool, requiredOffensives);
    }

    // 2. Se for Elite, garante pelo menos 1 magia do MAIOR CÍRCULO caso ainda não tenha
    if (rank === 'elite') {
      const hasMaxCircle = selectedEntries.some(e => e.spell.circle === maxCircle);
      if (!hasMaxCircle) {
        const maxCircleCandidates = allClassified.filter(c => c.spell.circle === maxCircle);
        if (maxCircleCandidates.length > 0) {
          pickDiverseFromList(maxCircleCandidates, 1);
        }
      }
    }

    // 3. Seleciona Magias de Controle
    const controls = workingPool.filter(c => c.category === 'controle');
    const fallbackControls = primaryCandidates.filter(c => c.category === 'controle');
    const fullControlPool = controls.length > 0 ? controls : fallbackControls;
    const remainingForControl = Math.max(1, Math.floor((targetMainCount - selectedEntries.length) / 2));
    pickDiverseFromList(fullControlPool, remainingForControl);

    // 4. Seleciona Magias de Defesa / Suporte / Utilidade
    const defSupportUtil = workingPool.filter(c => c.category === 'defesa' || c.category === 'suporte' || c.category === 'utilidade');
    const fallbackDefSupport = primaryCandidates.filter(c => c.category === 'defesa' || c.category === 'suporte' || c.category === 'utilidade');
    const fullSupportPool = defSupportUtil.length > 0 ? defSupportUtil : fallbackDefSupport;
    pickDiverseFromList(fullSupportPool, targetMainCount - selectedEntries.length);

    // 5. Preenchimento de segurança caso faltem vagas no alvo principal
    if (selectedEntries.length < targetMainCount) {
      pickDiverseFromList(workingPool, targetMainCount - selectedEntries.length);
    }
    if (selectedEntries.length < targetMainCount) {
      pickDiverseFromList(primaryCandidates, targetMainCount - selectedEntries.length);
    }

    // 6. Insere a exceção controlada de círculo inferior se tiver sido selecionada
    if (lowerCircleException && !usedIds.has(lowerCircleException.spell.id)) {
      selectedEntries.push(lowerCircleException);
    }

    // ========================================================================
    // REGRA 2: CD DA CRIATURA E CD DAS MAGIAS
    // ========================================================================
    // Separação clara:
    // - CD da criatura = valor estrutural oficial determinado pela Tabela 2-3 (saveDC).
    // - Magia = utiliza exatamente essa CD quando exigir teste de resistência.
    // - Se não exigir teste de resistência (buffs, utilidade, etc.), dcFormatted = '—' e resistance = 'Nenhuma'.
    return selectedEntries.map(({ spell, category, isAttack, damageFormula, critical, effectSummary }) => {
      const costPM = spell.circle === 1 ? 1 : spell.circle === 2 ? 3 : spell.circle === 3 ? 6 : spell.circle === 4 ? 10 : 15;
      
      const rawRes = (spell.resistance || '').trim();
      const hasExplicitNoSave = rawRes.toLowerCase() === 'nenhuma' || rawRes.toLowerCase() === 'não' || rawRes.toLowerCase() === 'sem teste';
      const requiresSave = !hasExplicitNoSave && (rawRes.length > 0 || category === 'ofensiva' || category === 'controle');

      let resistanceText = 'Nenhuma';
      if (requiresSave) {
        if (rawRes.length > 0 && !hasExplicitNoSave) {
          resistanceText = rawRes.replace(/CD \d+/g, `CD ${saveDC}`);
          if (!resistanceText.includes('CD')) {
            resistanceText = `${resistanceText} (CD ${saveDC})`;
          }
        } else {
          resistanceText = `Reflexos ou Vontade parcial (CD ${saveDC})`;
        }
      }

      // Dano calibrado para magias ofensivas caso não haja fórmula fixa
      let finalDamage = damageFormula;
      if (!finalDamage && (category === 'ataque' || category === 'ofensiva')) {
        const diceCount = Math.max(2, Math.floor(targetDamage / 3.5));
        finalDamage = `${diceCount}d6+${Math.floor(targetDamage % 3.5)} mágico`;
      }

      return {
        id: spell.id,
        name: spell.name,
        circle: spell.circle,
        costPM,
        type: spell.type,
        school: spell.school,
        category,
        execution: spell.execution || 'Padrão',
        range: spell.range || 'Curto (9m)',
        targetOrArea: spell.target || spell.area || spell.effect || '1 criatura ou área',
        duration: spell.duration || 'Instantânea',
        resistance: resistanceText,
        attackBonus: isAttack ? attackBonus : undefined,
        damage: finalDamage,
        critical: isAttack ? (critical || '20/x2') : undefined,
        description: spell.description,
        dcFormatted: requiresSave ? `CD ${saveDC}` : '—',
        effectSummary: effectSummary || spell.description.slice(0, 100)
      };
    });
  },

  /**
   * Helper para classificação de nicho funcional e prevenção de duplicatas
   */
  getSpellNiche(spell: T20Spell): string {
    const desc = (spell.description + ' ' + spell.name + ' ' + (spell.resistance || '')).toLowerCase();
    if (desc.includes('teste de ataque') || desc.includes('ataque à distância') || desc.includes('ataque corpo a corpo')) {
      return 'ataque_direto';
    }
    if (desc.includes('área') || desc.includes('cone') || desc.includes('esfera') || desc.includes('raio de') || desc.includes('todos os alvos') || desc.includes('meteoros') || desc.includes('linha')) {
      return 'dano_em_area';
    }
    if (desc.includes('paralisado') || desc.includes('imobiliz') || desc.includes('agarrado') || desc.includes('sono') || desc.includes('atordoado')) {
      return 'controle_incapacitante';
    }
    if (desc.includes('muralha') || desc.includes('terreno') || desc.includes('escorregadia') || desc.includes('escurid') || desc.includes('silêncio')) {
      return 'controle_terreno';
    }
    if (desc.includes('campo') || desc.includes('redoma') || desc.includes('absorve') || desc.includes('invulnerabilidade') || desc.includes('pele-de-pedra')) {
      return 'defesa_absorcao';
    }
    if (desc.includes('teletransporte') || desc.includes('salto') || desc.includes('voo') || desc.includes('deslocamento') || desc.includes('velocidade')) {
      return 'utilidade_mobilidade';
    }
    if (desc.includes('cura') || desc.includes('recupera') || desc.includes('remove') || desc.includes('restaura')) {
      return 'suporte_cura';
    }
    return 'utilidade_geral';
  }
};
