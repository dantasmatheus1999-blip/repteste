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
  // 1º Círculo
  'adaga-mental': { category: 'ofensiva', damage: '2d6 psíquico', effectSummary: '2d6 dano psíquico e atordoado (Vontade parcial)' },
  'explosao-de-chamas': { category: 'ofensiva', damage: '2d6 fogo', effectSummary: 'Cone de chamas causando 2d6 de fogo (Reflexos reduz à metade)' },
  'infligir-ferimentos': { category: 'ofensiva', damage: '2d8+2 trevas', effectSummary: 'Toque de energia negativa que causa 2d8+2 trevas (Fortitude reduz)' },
  'toque-chocante': { category: 'ataque', isAttack: true, damage: '2d8+2 eletricidade', critical: '20/x2', effectSummary: 'Ataque corpo a corpo com arco elétrico causando 2d8+2' },
  'seta-infalivel-de-talude': { category: 'ataque', isAttack: true, damage: '3d4+3 essência', critical: 'Automático', effectSummary: 'Projéteis místicos teleguiados infalíveis' },
  'raio-do-enfraquecimento': { category: 'ataque', isAttack: true, damage: '–2 Força / 1d8 trevas', critical: '20/x2', effectSummary: 'Disparo de raio necrótico que debilita atributos e causa dano' },
  'amedrontar': { category: 'controle', effectSummary: 'Alvo apavorado por 1 rodada e abalado (Vontade parcial)' },
  'area-escorregadia': { category: 'controle', effectSummary: 'Superfície de gordura que derruba alvos (Reflexos anula)' },
  'sono': { category: 'controle', effectSummary: 'Faz criaturas caírem em sono profundo mágico (Vontade anula)' },
  'armadura-arcana': { category: 'defesa', effectSummary: '+5 na Defesa até o fim da cena' },
  'escudo-da-fe': { category: 'defesa', effectSummary: '+2 na Defesa até o fim da cena' },
  'curar-ferimentos': { category: 'suporte', effectSummary: 'Restaura 2d8+2 PV de um aliado' },
  'bencao': { category: 'suporte', effectSummary: '+1 em testes de ataque e rolagens de dano para aliados' },
  'concentracao-de-combate': { category: 'utilidade', effectSummary: 'Rola dois dados em testes de ataque e escolhe o melhor' },
  'salto-dimensional': { category: 'utilidade', effectSummary: 'Teletransporte curto instantâneo de até 9m' },

  // 2º Círculo
  'flecha-acida': { category: 'ataque', isAttack: true, damage: '3d4+3 ácido + contínuo', critical: '20/x2', effectSummary: 'Disparo ácido à distância que corrói o alvo rodada a rodada' },
  'lanca-ignea-de-aleph': { category: 'ataque', isAttack: true, damage: '4d6 fogo', critical: '20/x2', effectSummary: 'Arremesso de projétil flamejante perfurante' },
  'cranio-voador-de-vladislav': { category: 'ofensiva', damage: '4d12 trevas', effectSummary: 'Projétil explosivo de crânio necrótico em área' },
  'sopro-das-uivantes': { category: 'ofensiva', damage: '4d6 frio', effectSummary: 'Cone de vento congelante que causa dano e deixa Lento' },
  'enxame-de-pestes': { category: 'ofensiva', damage: '3d6 veneno', effectSummary: 'Praga de insetos vorazes corrosivos' },
  'profanacao': { category: 'ofensiva', damage: '2d6 trevas/rodada', effectSummary: 'Área profana que amplifica dano necrótico e pune oponentes' },
  'amarras-etereas': { category: 'controle', effectSummary: 'Laços de força que agarram e prendem o alvo (Reflexos anula)' },
  'imobilizar': { category: 'controle', effectSummary: 'Paralisa completamente o alvo humanoide (Vontade anula)' },
  'escuridao': { category: 'controle', effectSummary: 'Bloqueia toda visão normal na área com sombras impenetráveis' },
  'campo-de-forca': { category: 'defesa', effectSummary: 'Gera barreira reativa com 30 PV temporários para absorver dano' },
  'camuflagem-ilusoria': { category: 'defesa', effectSummary: 'Inimigos têm 20% de chance de erro em ataques contra você' },
  'invisibilidade': { category: 'utilidade', effectSummary: 'Fica invisível e recebe camuflagem total' },
  'velocidade': { category: 'utilidade', effectSummary: 'Ganha +1 ação padrão adicional por rodada' },

  // 3º Círculo
  'bola-de-fogo': { category: 'ofensiva', damage: '6d6 fogo', effectSummary: 'Explosão esférica colossal de 6d6 fogo (Reflexos reduz à metade)' },
  'relampago': { category: 'ofensiva', damage: '6d6 eletricidade', effectSummary: 'Linha fulminante de raios perfurando múltiplos alvos' },
  'colera-sagrada': { category: 'ofensiva', damage: '6d8 luz', effectSummary: 'Julgamento divino em área causando dano radiante massivo' },
  'nuvem-toxica': { category: 'ofensiva', damage: '4d6 veneno', effectSummary: 'Névoa corrosiva que sufoca e envenena alvos na área' },
  'raio-solar': { category: 'ataque', isAttack: true, damage: '4d8 luz', critical: '20/x2', effectSummary: 'Feixe de radiação solar concentrada que cega e causa dano' },
  'toque-vampirico': { category: 'ataque', isAttack: true, damage: '3d6 trevas', critical: '20/x2', effectSummary: 'Ataque de toque que drena a vitalidade do alvo para curar a criatura' },
  'tentaculos-negros': { category: 'controle', effectSummary: 'Tentáculos sombrios emergem do solo agarrando e asfixiando alvos' },
  'pele-de-pedra': { category: 'defesa', effectSummary: 'Fornece Redução de Dano (RD 10) até o fim da cena' },
  'voo': { category: 'utilidade', effectSummary: 'Ganha deslocamento de voo 12m' },

  // 4º Círculo
  'coluna-de-chamas': { category: 'ofensiva', damage: '8d6 fogo/luz', effectSummary: 'Pilar celestial de fogo sagrado devastando a área' },
  'tempestade-de-raios': { category: 'ofensiva', damage: '8d8 eletricidade', effectSummary: 'Tempestade de relâmpagos contínuos castigando os oponentes' },
  'assassino-fantasmagorico': { category: 'ofensiva', damage: '6d6 trevas/pavor', effectSummary: 'Ilusão letal que induz terror cardíaco mortal no alvo' },
  'desintegrar': { category: 'ataque', isAttack: true, damage: '10d10 essência', critical: '20/x2', effectSummary: 'Raio esmeralda desintegrador de matéria' },
  'muralha-elemental': { category: 'controle', damage: '4d6 elemental', effectSummary: 'Muralha intransponível que queima ou bloqueia oponentes' },
  'globo-de-invulnerabilidade': { category: 'defesa', effectSummary: 'Imunidade completa a todas as magias de 1º e 2º círculos' },

  // 5º Círculo
  'chuva-de-meteoros': { category: 'ofensiva', damage: '16d6 fogo/impacto', effectSummary: 'Bombardeio de meteoros incandescentes varrendo o campo de batalha' },
  'mata-dragao': { category: 'ofensiva', damage: '15d10 essência', effectSummary: 'Lança lendária de pura essência mística destruidora de titãs' },
  'erupcao-de-glafia': { category: 'ofensiva', damage: '10d6 fogo', effectSummary: 'O solo se rompe em lava pura consumindo tudo em volta' },
  'raio-polar': { category: 'ofensiva', damage: '10d6 frio', effectSummary: 'Feixe de zero absoluto congelando e paralisando o alvo' },
  'terremoto': { category: 'ofensiva', damage: '10d6 impacto', effectSummary: 'Fissuras sísmicas derrubando e esmagando todos no chão' },
  'buraco-negro': { category: 'controle', damage: '10d6 essência', effectSummary: 'Singularidade gravitacional que suga e tritura os inimigos' }
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
    const isAttack = desc.includes('ataque') || desc.includes('projétil') || desc.includes('toque corpo a corpo');
    
    let category: SpellCombatCategory = 'utilidade';
    let damageFormula: string | undefined = undefined;

    // Detecta fórmulas de dano comuns na descrição
    const dmgMatch = spell.description.match(/(\d+d\d+(\+\d+)?)\s+(pontos de dano|de dano)/i);
    if (dmgMatch) {
      damageFormula = dmgMatch[1];
    }

    if (isAttack) {
      category = 'ataque';
    } else if (spell.school === 'Evocação' || desc.includes('dano') || desc.includes('sofre') || desc.includes('queima') || desc.includes('eletricidade') || desc.includes('frio') || desc.includes('fogo')) {
      category = 'ofensiva';
    } else if (spell.school === 'Encantamento' || spell.school === 'Ilusão' || desc.includes('paralisado') || desc.includes('agarrado') || desc.includes('abalado') || desc.includes('cego') || desc.includes('atordoado') || desc.includes('terreno')) {
      category = 'controle';
    } else if (spell.school === 'Abjuração' || desc.includes('defesa') || desc.includes('rd') || desc.includes('resistência') || desc.includes('redução de dano') || desc.includes('imune')) {
      category = 'defesa';
    } else if (desc.includes('cura') || desc.includes('recupera') || desc.includes('bônus') || desc.includes('aliado') || desc.includes('pv')) {
      category = 'suporte';
    }

    return {
      category,
      isAttack,
      damageFormula,
      critical: isAttack ? '20/x2' : undefined,
      effectSummary: spell.description.slice(0, 100) + '...'
    };
  },

  /**
   * Calcula a quantidade de magias conforme as regras de distribuição e balanceamento REALMOR:
   * - ND 1–4: 2–3 magias
   * - ND 5–8: 3–4 magias
   * - ND 9–12: 4–5 magias
   * - ND 13–16: 5–6 magias
   * - ND 17–20: 6–8 magias
   * - ND S/S+: 6–10 magias
   */
  calculateSpellCount(ndValue: number, rank: MonsterRank, combatRole: CombatRole): number {
    // Lacaios possuem repertório estritamente enxuto para controle rápido do mestre
    if (combatRole === 'lacaio') {
      return ndValue <= 5 ? 1 : 2;
    }

    // Solo Conjurador foca em híbrido físico + 2-3 magias pontuais
    if (combatRole === 'solo') {
      if (ndValue <= 4) return rank === 'chefe' ? 3 : 2;
      if (ndValue <= 10) return rank === 'chefe' ? 4 : 3;
      if (ndValue <= 16) return rank === 'chefe' ? 5 : 4;
      return rank === 'chefe' ? 6 : 5;
    }

    // Papel ESPECIAL Conjurador
    if (ndValue <= 4) {
      if (rank === 'normal') return 2;
      return 3; // elite ou chefe
    } else if (ndValue <= 8) {
      if (rank === 'normal') return 3;
      return 4; // elite ou chefe
    } else if (ndValue <= 12) {
      if (rank === 'normal') return 4;
      return 5; // elite ou chefe
    } else if (ndValue <= 16) {
      if (rank === 'normal') return 5;
      return 6; // elite ou chefe
    } else if (ndValue <= 20) {
      if (rank === 'normal') return 6;
      if (rank === 'elite') return 7;
      return 8; // chefe ND 20
    } else {
      // ND S / S+
      if (rank === 'normal') return 6;
      if (rank === 'elite') return 8;
      return 10;
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
      theme = 'Geral', 
      saveDC, 
      attackBonus = 0, 
      targetDamage = 10 
    } = params;

    const casterLevel = this.getCasterLevel(ndValue, rank, combatRole);
    const maxCircle = this.getMaxCircle(casterLevel);
    const spellCount = this.calculateSpellCount(ndValue, rank, combatRole);
    const themeLower = theme.toLowerCase();

    // Filtra todas as magias permitidas (círculo <= maxCircle)
    let candidateSpells = T20_SPELLS.filter(s => s.circle <= maxCircle);

    // REGRA 8: ESPECIAL + CHEFE -> TODAS as magias DEVEM ser do MAIOR CÍRCULO permitido!
    if (combatRole === 'especial' && rank === 'chefe') {
      const maxCircleOnly = candidateSpells.filter(s => s.circle === maxCircle);
      if (maxCircleOnly.length >= spellCount) {
        candidateSpells = maxCircleOnly;
      } else {
        // Se houver poucas magias oficiais exatas no pool, usa todas do maior círculo disponíveis
        candidateSpells = maxCircleOnly;
      }
    }

    // Classifica cada magia candidata
    const classifiedCandidates = candidateSpells.map(s => {
      const cl = this.classifySpell(s);
      return {
        spell: s,
        ...cl
      };
    });

    // Filtra por afinidade temática quando possível
    const matchTheme = (s: T20Spell) => {
      const desc = (s.description + ' ' + s.name + ' ' + s.school).toLowerCase();
      if (themeLower === 'fogo' && (desc.includes('fogo') || desc.includes('chama') || s.school === 'Evocação')) return true;
      if (themeLower === 'gelo' && (desc.includes('frio') || desc.includes('gelo') || s.school === 'Evocação')) return true;
      if (themeLower === 'sombra' && (desc.includes('escurid') || desc.includes('sombra') || s.school === 'Necromancia' || s.school === 'Ilusão')) return true;
      if (themeLower === 'profano' && (s.school === 'Necromancia' || desc.includes('morte') || desc.includes('sangue') || desc.includes('trevas'))) return true;
      if (themeLower === 'sagrado' && (s.type === 'divina' || s.school === 'Abjuração' || desc.includes('luz') || desc.includes('cura') || desc.includes('sagrado'))) return true;
      if (themeLower === 'arcano' && (s.type === 'arcana' || s.school === 'Evocação' || s.school === 'Transmutação' || desc.includes('arcano') || desc.includes('essência'))) return true;
      if (themeLower === 'veneno' && (desc.includes('veneno') || desc.includes('ácido') || s.school === 'Necromancia')) return true;
      if (themeLower === 'eletricidade' && (desc.includes('relâmpago') || desc.includes('raio') || desc.includes('choque') || desc.includes('elétrico'))) return true;
      if (themeLower === 'natureza' && (desc.includes('planta') || desc.includes('terra') || desc.includes('vento') || s.type === 'divina')) return true;
      return false;
    };

    const thematicPool = classifiedCandidates.filter(c => matchTheme(c.spell));
    const finalPool = thematicPool.length >= spellCount ? thematicPool : classifiedCandidates;

    // Separação em baldes por categoria
    const offensiveAndAttacks = finalPool.filter(c => c.category === 'ataque' || c.category === 'ofensiva');
    const controls = finalPool.filter(c => c.category === 'controle');
    const utilityDefenseSupport = finalPool.filter(c => c.category === 'defesa' || c.category === 'suporte' || c.category === 'utilidade');

    // Se o pool temático for pequeno, busca no pool geral para garantir ofensivas
    const fallbackOffensives = classifiedCandidates.filter(c => c.category === 'ataque' || c.category === 'ofensiva');
    const fallbackControls = classifiedCandidates.filter(c => c.category === 'controle');
    const fallbackSupport = classifiedCandidates.filter(c => c.category === 'defesa' || c.category === 'suporte' || c.category === 'utilidade');

    const getOffensivePool = () => offensiveAndAttacks.length > 0 ? offensiveAndAttacks : fallbackOffensives;
    const getControlPool = () => controls.length > 0 ? controls : fallbackControls;
    const getSupportPool = () => utilityDefenseSupport.length > 0 ? utilityDefenseSupport : fallbackSupport;

    // Calcula a cota de magias ofensivas de acordo com ND (Regra da Seção 4)
    let requiredOffensives = 1;
    if (ndValue >= 17) {
      requiredOffensives = Math.ceil(spellCount / 2); // Metade do repertório ofensivo/ataque
    } else if (ndValue >= 13) {
      requiredOffensives = Math.min(3, Math.ceil(spellCount / 2));
    } else if (ndValue >= 9) {
      requiredOffensives = 2;
    } else if (ndValue >= 5) {
      requiredOffensives = 2;
    } else {
      requiredOffensives = 1;
    }

    const selectedEntries: typeof classifiedCandidates = [];
    const usedIds = new Set<string>();

    const pickFromList = (list: typeof classifiedCandidates, count: number) => {
      const shuffled = [...list].sort(() => 0.5 - Math.random());
      for (const item of shuffled) {
        if (!usedIds.has(item.spell.id)) {
          usedIds.add(item.spell.id);
          selectedEntries.push(item);
          if (selectedEntries.length >= spellCount) break;
          count--;
          if (count <= 0) break;
        }
      }
    };

    // 1. Pega as magias ofensivas / de ataque obrigatórias
    pickFromList(getOffensivePool(), requiredOffensives);

    // 2. Se for Elite (Papel Especial + Elite), garante pelo menos 1 do MAIOR CÍRCULO se ainda não tiver
    if (combatRole === 'especial' && rank === 'elite') {
      const hasMaxCircle = selectedEntries.some(e => e.spell.circle === maxCircle);
      if (!hasMaxCircle) {
        const maxCircleCandidates = finalPool.filter(c => c.spell.circle === maxCircle);
        if (maxCircleCandidates.length > 0) {
          pickFromList(maxCircleCandidates, 1);
        }
      }
    }

    // 3. Pega magias de controle
    const controlTarget = Math.max(1, Math.floor((spellCount - selectedEntries.length) / 2));
    pickFromList(getControlPool(), controlTarget);

    // 4. Pega magias de defesa / suporte / utilidade
    pickFromList(getSupportPool(), spellCount - selectedEntries.length);

    // 5. Se ainda faltar para preencher a quantidade, completa com qualquer magia válida
    if (selectedEntries.length < spellCount) {
      pickFromList(finalPool, spellCount - selectedEntries.length);
    }
    if (selectedEntries.length < spellCount) {
      pickFromList(classifiedCandidates, spellCount - selectedEntries.length);
    }

    // Converte e Formata os registros finais de magia com CD e Bônus Oficiais da Tabela 2-3
    return selectedEntries.map(({ spell, category, isAttack, damageFormula, critical, effectSummary }) => {
      const costPM = spell.circle === 1 ? 1 : spell.circle === 2 ? 3 : spell.circle === 3 ? 6 : spell.circle === 4 ? 10 : 15;
      
      let resistanceText = spell.resistance;
      if (resistanceText) {
        resistanceText = resistanceText.replace(/CD \d+/g, `CD ${saveDC}`);
        if (!resistanceText.includes('CD')) {
          resistanceText = `${resistanceText} (CD ${saveDC})`;
        }
      } else if (category === 'ofensiva' || category === 'controle') {
        resistanceText = `Reflexos ou Vontade parcial (CD ${saveDC})`;
      }

      // Calcula dano calibrado caso não haja fórmula específica
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
        dcFormatted: `CD ${saveDC}`,
        effectSummary: effectSummary || spell.description.slice(0, 100)
      };
    });
  }
};
