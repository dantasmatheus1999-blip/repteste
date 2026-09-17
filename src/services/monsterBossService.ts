import { CombatRole, MonsterRole, CreatureType, CombatStyle } from '../constants/monsterData';

export interface BossResourceEntry {
  title: string;
  category: 'acao_lendaria' | 'reacao' | 'segunda_fase' | 'resiliencia' | 'recarga';
  tag: string;
  description: string;
  trigger?: string;
  frequency?: string;
}

export const MonsterBossService = {
  /**
   * Gera o conjunto de recursos e mecânicas exclusivas de Chefe sob a regra REALMOR.
   * Exclusivo para Escala REALMOR = Chefe.
   * Não altera as estatísticas base da Tabela 2-3 de Tormenta 20.
   *
   * Quantidades por ND:
   * - ND 1–5: 1 a 2 recursos.
   * - ND 6–10: 2 recursos.
   * - ND 11–15: 2 a 3 recursos.
   * - ND 16–20: 3 a 4 recursos.
   * - ND S/S+: 4 a 5 recursos.
   */
  generateBossResources(params: {
    ndValue: number;
    combatStyle?: CombatStyle;
    combatRole?: CombatRole;
    role?: MonsterRole;
    theme?: string;
    type?: CreatureType;
    saveDC: number;
    hp: number;
  }): BossResourceEntry[] {
    const { 
      ndValue, 
      combatStyle = 'marcial', 
      theme = 'Geral', 
      saveDC, 
      hp 
    } = params;
    
    const resources: BossResourceEntry[] = [];
    const halfHp = Math.floor(hp / 2);

    // ========================================================================
    // 1. AÇÕES DE CHEFE FORA DE TURNO (AÇÕES LENDÁRIAS PERSONALIZADAS POR ESTILO)
    // ========================================================================
    if (combatStyle === 'conjurador') {
      resources.push({
        title: 'Ação de Chefe: Pulso Místico e Translocação',
        category: 'acao_lendaria',
        tag: 'Regra REALMOR de Chefe (Conjurador)',
        frequency: '2 vezes por rodada',
        trigger: 'No final do turno de um jogador',
        description: `Gasta 1 ação de chefe para se teletransportar até 9m sem provocar reações ou disparar um pulso de energia mágica (${theme}) em 1 alvo a até 15m (Reflexos CD ${saveDC} reduz dano à metade).`
      });
      if (ndValue >= 6) {
        resources.push({
          title: 'Ação de Chefe: Manipulação Arcana de Terreno',
          category: 'acao_lendaria',
          tag: 'Regra REALMOR de Chefe (Conjurador)',
          frequency: '1 vez por rodada',
          trigger: 'No final do turno de um jogador',
          description: `Gasta 1 ação de chefe para criar ou mover uma zona mística de 6m de raio no campo. Inimigos na área sofrem -2 em testes de resistência contra suas magias e terreno difícil.`
        });
      }
    } else if (combatStyle === 'atirador') {
      resources.push({
        title: 'Ação de Chefe: Disparo Rápido e Reposicionamento',
        category: 'acao_lendaria',
        tag: 'Regra REALMOR de Chefe (Atirador)',
        frequency: '2 vezes por rodada',
        trigger: 'No final do turno de um jogador',
        description: `Gasta 1 ação de chefe para se deslocar até 6m em direção a uma posição de cobertura sem provocar ataques de oportunidade ou disparar um tiro rápido à distância contra um alvo visível.`
      });
      if (ndValue >= 6) {
        resources.push({
          title: 'Ação de Chefe: Tiro Supressor em Arco',
          category: 'acao_lendaria',
          tag: 'Regra REALMOR de Chefe (Atirador)',
          frequency: '1 vez por rodada',
          trigger: 'No final do turno de um jogador',
          description: `Gasta 1 ação de chefe para desferir um disparo em uma área de 3m; heróis na área devem passar em Reflexos (CD ${saveDC}) ou ficam Abalados e têm deslocamento reduzido pela metade na próxima rodada.`
        });
      }
    } else if (combatStyle === 'tatico') {
      resources.push({
        title: 'Ação de Chefe: Comando de Assalto e Manobra Coordenada',
        category: 'acao_lendaria',
        tag: 'Regra REALMOR de Chefe (Tático)',
        frequency: '2 vezes por rodada',
        trigger: 'No final do turno de um jogador',
        description: `Gasta 1 ação de chefe para conceder a um aliado visível um ataque imediato com +2 ou uma ação de movimento completa fora de seu turno.`
      });
      if (ndValue >= 6) {
        resources.push({
          title: 'Ação de Chefe: Quebra de Formação e Desarme Rápido',
          category: 'acao_lendaria',
          tag: 'Regra REALMOR de Chefe (Tático)',
          frequency: '1 vez por rodada',
          trigger: 'No final do turno de um jogador',
          description: `Gasta 1 ação de chefe para realizar uma manobra de Desarme, Derrubar ou Empurrar com bônus de +4 contra um oponente engajado, alterando a linha de batalha.`
        });
      }
    } else {
      // Marcial
      resources.push({
        title: 'Ação de Chefe: Avanço Avassalador e Pancada Brutal',
        category: 'acao_lendaria',
        tag: 'Regra REALMOR de Chefe (Marcial)',
        frequency: '2 vezes por rodada',
        trigger: 'No final do turno de um jogador',
        description: `Gasta 1 ação de chefe para se deslocar até 9m em linha reta contra um herói e desferir um ataque corpo a corpo devastador ou tentar a manobra Derrubar livremente.`
      });
      if (ndValue >= 6) {
        resources.push({
          title: 'Ação de Chefe: Varrida de Choque e Quebra de Guarda',
          category: 'acao_lendaria',
          tag: 'Regra REALMOR de Chefe (Marcial)',
          frequency: '1 vez por rodada',
          trigger: 'No final do turno de um jogador',
          description: `Gasta 1 ação de chefe para girar sua arma/corpo, golpeando todos os inimigos adjacentes (Reflexos CD ${saveDC} reduz metade) e impondo a condição Vulnerável por 1 rodada a quem falhar.`
        });
      }
    }

    // ========================================================================
    // 2. SEGUNDA FASE (GATILHO DE 50% DOS PV — PERSONALIZADO POR ESTILO)
    // ========================================================================
    if (combatStyle === 'conjurador') {
      resources.push({
        title: 'Segunda Fase: Sobrecarga Arcana e Ruptura Mística',
        category: 'segunda_fase',
        tag: 'Regra REALMOR de Chefe (Conjurador)',
        trigger: `Ao atingir 50% dos PV (${halfHp} PV ou menos)`,
        description: `GATILHO: 50% dos PV (${halfHp} PV).\nEFEITO: Dispersa instantaneamente todas as condições negativas. Libera uma onda de choque de mana (${theme}) em alcance curto empurrando inimigos 6m (Reflexos CD ${saveDC} reduz metade). Recupera 10 PM e o custo de todas as suas magias é reduzido em 1 PM (mínimo 1 PM) até o final do combate.`
      });
    } else if (combatStyle === 'atirador') {
      resources.push({
        title: 'Segunda Fase: Foco de Mira Mortal e Saraivada Contínua',
        category: 'segunda_fase',
        tag: 'Regra REALMOR de Chefe (Atirador)',
        trigger: `Ao atingir 50% dos PV (${halfHp} PV ou menos)`,
        description: `GATILHO: 50% dos PV (${halfHp} PV).\nEFEITO: Remove instantaneamente lentidão, imobilização e atordoamento. Assume postura de atirador implacável: todos os seus ataques à distância passam a disparar dois projéteis por ataque e ignoram qualquer cobertura parcial ou camuflagem até o final do combate.`
      });
    } else if (combatStyle === 'tatico') {
      resources.push({
        title: 'Segunda Fase: Reorganização Estratégica e Cerco Implacável',
        category: 'segunda_fase',
        tag: 'Regra REALMOR de Chefe (Tático)',
        trigger: `Ao atingir 50% dos PV (${halfHp} PV ou menos)`,
        description: `GATILHO: 50% dos PV (${halfHp} PV).\nEFEITO: Dispersa condições debilitantes e assume Comando Supremo: concede +2 na Defesa a todos os seus aliados e faz com que qualquer herói flanqueado sofra +1d8 de dano extra em todos os ataques que receber.`
      });
    } else {
      // Marcial
      resources.push({
        title: 'Segunda Fase: Fúria Frenética e Ruptura de Limites',
        category: 'segunda_fase',
        tag: 'Regra REALMOR de Chefe (Marcial)',
        trigger: `Ao atingir 50% dos PV (${halfHp} PV ou menos)`,
        description: `GATILHO: 50% dos PV (${halfHp} PV).\nEFEITO: Remove instantaneamente condições de Abalado, Lento ou Enredado. Fica imune a atordoamento, ganha RD física +5 e desfere um ataque corpo a corpo adicional em qualquer ação de ataque até o fim do combate.`
      });
    }

    // ========================================================================
    // 3. REAÇÃO DE CHEFE (DEFESA E CONTRA-GOLPE PERSONALIZADO POR ESTILO)
    // ========================================================================
    if (combatStyle === 'conjurador') {
      resources.push({
        title: 'Reação de Chefe: Barreira Contramágica Refletora',
        category: 'reacao',
        tag: 'Regra REALMOR de Chefe (Conjurador)',
        frequency: '1 por rodada (Reação)',
        trigger: 'Ao ser alvo de um ataque ou magia',
        description: `Ergue instantaneamente uma barreira de mana pura: recebe +5 na Defesa e em testes de resistência contra o ataque/efeito e reflete 50% do dano arcano sofrido de volta ao atacante.`
      });
    } else if (combatStyle === 'atirador') {
      resources.push({
        title: 'Reação de Chefe: Esquiva Acrobática e Contra-Tiro',
        category: 'reacao',
        tag: 'Regra REALMOR de Chefe (Atirador)',
        frequency: '1 por rodada (Reação)',
        trigger: 'Ao ser alvo de um ataque corpo a corpo ou investida',
        description: `Realiza uma esquiva reflexa recuando 3m sem provocar ataques de oportunidade e desfere imediatamente um disparo de contra-ataque contra o agressor.`
      });
    } else if (combatStyle === 'tatico') {
      resources.push({
        title: 'Reação de Chefe: Escudo Vivo e Reposicionamento Defensivo',
        category: 'reacao',
        tag: 'Regra REALMOR de Chefe (Tático)',
        frequency: '1 por rodada (Reação)',
        trigger: 'Ao sofrer um ataque corpo a corpo ou à distância',
        description: `Ordena a um aliado ou lacaio adjacente para absorver metade do dano em seu lugar ou executa uma finta que impõe desvantagem ao teste de ataque do agressor.`
      });
    } else {
      // Marcial
      resources.push({
        title: 'Reação de Chefe: Riposte Brutal e Retaliação Imediata',
        category: 'reacao',
        tag: 'Regra REALMOR de Chefe (Marcial)',
        frequency: '1 por rodada (Reação)',
        trigger: 'Ao sofrer ou esquivar-se de um ataque corpo a corpo',
        description: `Desfere imediatamente um contra-ataque corpo a corpo com força máxima contra o agressor e pode tentar empurrá-lo 1,5m para trás.`
      });
    }

    // ========================================================================
    // 4. RESILIÊNCIA LENDÁRIA (Para ND 11+)
    // ========================================================================
    if (ndValue >= 11) {
      const uses = ndValue >= 16 ? 3 : 2;
      resources.push({
        title: 'Resiliência Lendária de Chefe',
        category: 'resiliencia',
        tag: 'Regra REALMOR de Chefe',
        frequency: `${uses}/combate`,
        trigger: 'Ao falhar em um teste de resistência',
        description: `Gasta este recurso para converter a falha em um sucesso automático no teste de resistência.`
      });
    }

    // ========================================================================
    // 5. CATACLISMO / CONTROLE DE CAMPO COM RECARGA (Para ND 16+ ou S/S+)
    // ========================================================================
    if (ndValue >= 16) {
      if (combatStyle === 'conjurador') {
        resources.push({
          title: `Cataclismo Arcano: Ruptura Dimensional de ${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
          category: 'recarga',
          tag: 'Regra REALMOR de Chefe (Conjurador)',
          frequency: 'Recarga 1d4 rodadas',
          trigger: 'Ação padrão',
          description: `Abre uma fenda de energia pura em alcance médio (área de 9m). Causa dano massivo de ${theme}, drena 3 PM de cada conjurador e impõe a condição Cego por 1 rodada (Reflexos CD ${saveDC} reduz dano à metade e evita cegueira).`
        });
      } else if (combatStyle === 'atirador') {
        resources.push({
          title: 'Cataclismo Balístico: Tempestade de Projéteis Concentrada',
          category: 'recarga',
          tag: 'Regra REALMOR de Chefe (Atirador)',
          frequency: 'Recarga 1d4 rodadas',
          trigger: 'Ação padrão',
          description: `Dispara uma chuva implacável de dezenas de flechas/dardos sobre uma área de 12m. Todas as criaturas na área sofrem dano perfurante severo e ficam Enredadas e Sangrando (Reflexos CD ${saveDC} reduz metade e evita condições).`
        });
      } else if (combatStyle === 'tatico') {
        resources.push({
          title: 'Cataclismo Tático: Cerco Absoluto e Emboscada Total',
          category: 'recarga',
          tag: 'Regra REALMOR de Chefe (Tático)',
          frequency: 'Recarga 1d4 rodadas',
          trigger: 'Ação padrão',
          description: `Aciona armadilhas ocultas e comando de massacre em toda a arena de combate. Todos os heróis devem passar em Reflexos (CD ${saveDC}) ou ficam Caídos, Desarmados e Abalados por 1 rodada enquanto todos os aliados do Chefe ganham 1 ataque extra.`
        });
      } else {
        // Marcial
        resources.push({
          title: 'Cataclismo Físico: Impacto Sísmico e Terremoto de Batalha',
          category: 'recarga',
          tag: 'Regra REALMOR de Chefe (Marcial)',
          frequency: 'Recarga 1d4 rodadas',
          trigger: 'Ação padrão',
          description: `Golpeia o solo com tremenda força bruta, gerando uma onda de choque de 9m de raio. Causa dano severo de impacto e força todos os alvos a passarem em Fortitude (CD ${saveDC}) ou ficam Caídos e Atordoados por 1 rodada.`
        });
      }
    }

    return resources;
  }
};
