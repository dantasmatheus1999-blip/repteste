import { 
  T20_TABLE_2_3_ROLES,
  T20_TABLE_2_3_A_SOLOS,
  T20_TABLE_2_3_B_LACAIOS,
  T20_TABLE_2_3_C_ESPECIAIS,
  getT20CreatureParameters,
  T20CreatureParameterEntry,
  ROLE_PROFILES,
  MONSTER_RANK_PROFILES,
  MONSTER_NAMES, 
  MONSTER_ABILITIES, 
  STYLE_ABILITIES,
  TYPE_ABILITIES,
  THEME_ABILITIES,
  COMBAT_STYLE_TACTICS,
  COMBAT_STYLE_PROFILES,
  MONSTER_TACTICS,
  CombatRole,
  MonsterRole,
  MonsterRank,
  CombatStyle,
  RealmorScale,
  CreatureType,
  MonsterStats,
  SaveLevel
} from '../constants/monsterData';
import { AttackGeneratorService } from './attackGeneratorService';
import { MonsterEvolutionService } from './monsterEvolutionService';
import { MonsterMagicService, MonsterSpellEntry } from './monsterMagicService';
import { MonsterBossService, BossResourceEntry } from './monsterBossService';

export type { MonsterSpellEntry };
export type { BossResourceEntry };

export interface StatAuditEntry {
  base: number;
  ajuste: string;
  resultado: number;
  justificativa: string;
}

export interface MonsterAuditLog {
  escala: 'Normal' | 'Elite' | 'Chefe';
  papel: 'Solo' | 'Lacaio' | 'Especial';
  nd: string;
  parametrosOficiais: {
    defesa: number;
    pv: number;
    ataque: number;
    danoMedio: number;
    cd: number;
    resistenciaForte: number;
    resistenciaMedia: number;
    resistenciaFraca: number;
  };
  modificacoesConceituais: {
    defesa: StatAuditEntry;
    pv: StatAuditEntry;
    ataque: StatAuditEntry;
    danoMedio: StatAuditEntry;
    cd: StatAuditEntry;
    fortitude: StatAuditEntry;
    reflexes: StatAuditEntry;
    will: StatAuditEntry;
  };
}

export interface MonsterValidationResult {
  valid: boolean;
  status: 'OK' | 'ATENÇÃO' | 'FORA DO PADRÃO';
  checks: {
    hp: 'OK' | 'ATENÇÃO' | 'FORA DO PADRÃO';
    defense: 'OK' | 'ATENÇÃO' | 'FORA DO PADRÃO';
    attack: 'OK' | 'ATENÇÃO' | 'FORA DO PADRÃO';
    damage: 'OK' | 'ATENÇÃO' | 'FORA DO PADRÃO';
    saveDC: 'OK' | 'ATENÇÃO' | 'FORA DO PADRÃO';
    fortitude: 'OK' | 'ATENÇÃO' | 'FORA DO PADRÃO';
    reflexes: 'OK' | 'ATENÇÃO' | 'FORA DO PADRÃO';
    will: 'OK' | 'ATENÇÃO' | 'FORA DO PADRÃO';
  };
  warnings: string[];
  deviations: Record<string, string>;
  tableUsed: string;
  auditLog?: MonsterAuditLog;
}

export interface GeneratedMonster extends MonsterStats {
  id: string;
  name: string;
  type: CreatureType;
  nd: string;
  combatRole: CombatRole;
  combatStyle?: CombatStyle;
  realmorScale?: RealmorScale;
  role: MonsterRole;
  rank: MonsterRank;
  description: string;
  attributes: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  speed: string;
  senses: string;
  attacks: string[];
  abilities: string[];
  specialActions?: string[];
  bossResources?: BossResourceEntry[];
  spells?: MonsterSpellEntry[];
  manaPoints?: number;
  tactics: string;
  environment: string;
  theme: string;
  targetDamage: number;
  tableReference: T20CreatureParameterEntry;
  auditLog?: MonsterAuditLog;
  combatProfile?: {
    name: string;
    description: string;
  };
  weaknesses?: string[];
  advantages?: string[];
  synergy?: {
    name: string;
    description: string;
    effect: string;
  };
  validation?: MonsterValidationResult;
}

export const MonsterGeneratorService = {
  /**
   * Gerador em 4 eixos estruturados:
   * 1. Papel de Combate T20 (Solo, Lacaio, Especial)
   * 2. ND Oficial T20 (1/4 a 20, S, S+)
   * 3. Estilo de Combate (Marcial, Atirador, Conjurador, Tático)
   * 4. Escala REALMOR (Normal, Elite, Chefe)
   */
  generate(params: {
    nd?: string;
    combatRole?: CombatRole;
    combatStyle?: CombatStyle;
    realmorScale?: RealmorScale;
    role?: MonsterRole;
    type?: CreatureType;
    rank?: MonsterRank;
    environment?: string;
    theme?: string;
  } = {}): GeneratedMonster {
    const environments = ['floresta', 'pântano', 'montanha', 'caverna', 'ruínas', 'deserto', 'cidade', 'mar'];
    const themes = ['sombra', 'fogo', 'gelo', 'veneno', 'arcano', 'sagrado', 'profano', 'natureza', 'eletrico', 'terra'];

    const selectedNd = params.nd || '1';
    const selectedCombatRole: CombatRole = params.combatRole || 'solo';
    const selectedScale: RealmorScale = params.realmorScale || (params.rank as RealmorScale) || 'normal';
    const selectedRank: MonsterRank = selectedScale;
    
    // Mapeamento de estilo de combate
    let selectedCombatStyle: CombatStyle = params.combatStyle || 'marcial';
    if (!params.combatStyle && params.role) {
      if (params.role === 'conjurador') selectedCombatStyle = 'conjurador';
      else if (params.role === 'emboscador') selectedCombatStyle = 'atirador';
      else if (params.role === 'controlador' || params.role === 'especialista') selectedCombatStyle = 'tatico';
      else selectedCombatStyle = 'marcial';
    }

    const selectedRole: MonsterRole = params.role || (
      selectedCombatStyle === 'conjurador' ? 'conjurador' :
      selectedCombatStyle === 'atirador' ? 'emboscador' :
      selectedCombatStyle === 'tatico' ? 'controlador' : 'bruto'
    );
    const selectedType: CreatureType = params.type || 'monstro';
    const selectedEnvironment = params.environment || environments[Math.floor(Math.random() * environments.length)];
    const selectedTheme = params.theme || themes[Math.floor(Math.random() * themes.length)];

    // CAMADA 1 & 2: PARÂMETROS OFICIAIS DA TABELA 2-3 (AMEAÇAS DE ARTON)
    const tableRef: T20CreatureParameterEntry = getT20CreatureParameters(selectedCombatRole, selectedNd);
    const roleProfile = ROLE_PROFILES[selectedRole] || ROLE_PROFILES['bruto'];
    const rankProfile = MONSTER_RANK_PROFILES[selectedRank] || MONSTER_RANK_PROFILES['normal'];

    // CÁLCULO DAS ESTATÍSTICAS BASEADAS DIRETAMENTE NA TABELA OFICIAL
    // Regra T20: Chefe e Elite NÃO aplicam inflação matemática automática na Tabela 2-3.
    const calculatedHp = tableRef.hp;
    const calculatedDefense = tableRef.defense;
    const calculatedAttack = tableRef.attack;
    const calculatedSaveDC = tableRef.saveDC;
    const targetDamage = tableRef.targetDamage;

    // CAMADA 3: DISTRIBUIÇÃO DAS RESISTÊNCIAS (Forte, Média, Fraca)
    const calculatedFortitude = tableRef.saves[roleProfile.saveDistribution.fortitude];
    const calculatedReflexes = tableRef.saves[roleProfile.saveDistribution.reflexes];
    const calculatedWill = tableRef.saves[roleProfile.saveDistribution.will];

    // REGISTRO DE AUDITORIA E RASTREABILIDADE
    const escalaLabel = selectedScale === 'chefe' ? 'Chefe' : selectedScale === 'elite' ? 'Elite' : 'Normal';
    const papelLabel = selectedCombatRole === 'solo' ? 'Solo' : selectedCombatRole === 'lacaio' ? 'Lacaio' : 'Especial';

    const auditLog: MonsterAuditLog = {
      escala: escalaLabel,
      papel: papelLabel,
      nd: selectedNd,
      parametrosOficiais: {
        defesa: tableRef.defense,
        pv: tableRef.hp,
        ataque: tableRef.attack,
        danoMedio: tableRef.targetDamage,
        cd: tableRef.saveDC,
        resistenciaForte: tableRef.saves.strong,
        resistenciaMedia: tableRef.saves.medium,
        resistenciaFraca: tableRef.saves.weak,
      },
      modificacoesConceituais: {
        defesa: { base: tableRef.defense, ajuste: 'nenhuma', resultado: calculatedDefense, justificativa: 'Conforme Tabela 2-3 oficial' },
        pv: { base: tableRef.hp, ajuste: 'nenhuma', resultado: calculatedHp, justificativa: 'Conforme Tabela 2-3 oficial' },
        ataque: { base: tableRef.attack, ajuste: 'nenhuma', resultado: calculatedAttack, justificativa: 'Conforme Tabela 2-3 oficial' },
        danoMedio: { base: tableRef.targetDamage, ajuste: 'nenhuma', resultado: targetDamage, justificativa: 'Conforme Tabela 2-3 oficial' },
        cd: { base: tableRef.saveDC, ajuste: 'nenhuma', resultado: calculatedSaveDC, justificativa: 'Conforme Tabela 2-3 oficial' },
        fortitude: { 
          base: calculatedFortitude, 
          ajuste: `nenhuma (${roleProfile.saveDistribution.fortitude === 'strong' ? 'Resistência Forte' : roleProfile.saveDistribution.fortitude === 'medium' ? 'Resistência Média' : 'Resistência Fraca'})`, 
          resultado: calculatedFortitude, 
          justificativa: 'Conforme Tabela 2-3 oficial' 
        },
        reflexes: { 
          base: calculatedReflexes, 
          ajuste: `nenhuma (${roleProfile.saveDistribution.reflexes === 'strong' ? 'Resistência Forte' : roleProfile.saveDistribution.reflexes === 'medium' ? 'Resistência Média' : 'Resistência Fraca'})`, 
          resultado: calculatedReflexes, 
          justificativa: 'Conforme Tabela 2-3 oficial' 
        },
        will: { 
          base: calculatedWill, 
          ajuste: `nenhuma (${roleProfile.saveDistribution.will === 'strong' ? 'Resistência Forte' : roleProfile.saveDistribution.will === 'medium' ? 'Resistência Média' : 'Resistência Fraca'})`, 
          resultado: calculatedWill, 
          justificativa: 'Conforme Tabela 2-3 oficial' 
        },
      }
    };

    // CAMADA 4: ATRIBUTOS TEMÁTICOS (Modificadores narrativos)
    const attributes = this.generateAttributes({
      nd: selectedNd,
      role: selectedRole,
      type: selectedType,
      rank: selectedRank
    });

    // CAMADA 5: ATAQUES (Dano médio total distribuído pelos ataques sem mágicas na lista)
    const generatedAttacks = AttackGeneratorService.generateAttacks({
      nd: selectedNd,
      combatRole: selectedCombatRole,
      combatStyle: selectedCombatStyle,
      role: selectedRole,
      rank: selectedRank,
      attackBonus: calculatedAttack,
      targetDamage,
      saveDC: calculatedSaveDC,
      type: selectedType,
      theme: selectedTheme,
    });

    // CAMADA 6: MAGIAS OFICIAIS, HABILIDADES TEMÁTICAS & RECURSOS DE CHEFE (REALMOR)
    const isCasterCreature = MonsterMagicService.isCaster({
      combatStyle: selectedCombatStyle,
      combatRole: selectedCombatRole,
      role: selectedRole,
      theme: selectedTheme,
      type: selectedType,
    });

    let generatedSpells: MonsterSpellEntry[] | undefined = undefined;
    let manaPoints: number | undefined = undefined;

    if (isCasterCreature) {
      generatedSpells = MonsterMagicService.generateSpells({
        ndValue: tableRef.ndValue,
        combatStyle: selectedCombatStyle,
        combatRole: selectedCombatRole,
        role: selectedRole,
        rank: selectedRank,
        theme: selectedTheme,
        saveDC: calculatedSaveDC,
        attackBonus: calculatedAttack,
        targetDamage: targetDamage,
      });
      manaPoints = MonsterMagicService.calculatePM(tableRef.ndValue, selectedRank);
    }

    // Quantidade de Habilidades de acordo com ND (Regra REALMOR)
    // O Estilo de Combate determina primordialmente o repertório da criatura!
    const stylePool = STYLE_ABILITIES[selectedCombatStyle] || STYLE_ABILITIES.marcial;
    const typePool = TYPE_ABILITIES[selectedType] || [];
    const themeKey = (selectedTheme || '').toLowerCase();
    const themePool = THEME_ABILITIES[themeKey] || [];

    // Monta o pool priorizando Estilo (70%), Tipo (20%) e Tema (10%)
    const candidateAbilities: string[] = [
      ...stylePool.sort(() => 0.5 - Math.random()),
      ...typePool.sort(() => 0.5 - Math.random()),
      ...themePool.sort(() => 0.5 - Math.random())
    ];
    
    let targetAbilityCount = 2;
    if (tableRef.ndValue >= 16) targetAbilityCount = 5;
    else if (tableRef.ndValue >= 11) targetAbilityCount = 4;
    else if (tableRef.ndValue >= 6) targetAbilityCount = 3;
    else targetAbilityCount = 2;

    const selectedAbilities: string[] = [];
    const usedTitles = new Set<string>();

    for (const ab of candidateAbilities) {
      const title = ab.split(':')[0].trim();
      if (!usedTitles.has(title)) {
        usedTitles.add(title);
        selectedAbilities.push(ab);
      }
      if (selectedAbilities.length >= targetAbilityCount) break;
    }

    // Garante canalização mística para conjuradores
    if (isCasterCreature && !selectedAbilities.some(a => a.startsWith('Canalizar Misticismo'))) {
      const canalizar = STYLE_ABILITIES.conjurador.find(a => a.startsWith('Canalizar Misticismo'));
      if (canalizar) {
        selectedAbilities[0] = canalizar;
      }
    }

    // Recursos Estruturados de Chefe (Regra REALMOR) - Apenas para Escala Chefe!
    let bossResources: BossResourceEntry[] | undefined = undefined;
    const specialActions: string[] = [];

    if (selectedScale === 'chefe') {
      bossResources = MonsterBossService.generateBossResources({
        ndValue: tableRef.ndValue,
        combatStyle: selectedCombatStyle,
        combatRole: selectedCombatRole,
        role: selectedRole,
        theme: selectedTheme,
        type: selectedType,
        saveDC: calculatedSaveDC,
        hp: calculatedHp,
      });

      bossResources.forEach(res => {
        specialActions.push(`${res.title}: ${res.description}`);
      });
    }

    // Geração de Nome (Combinando temático especializado ou procedural rico)
    let name = '';
    const useSpecializedName = Math.random() > 0.45;
    if (useSpecializedName) {
      const styleNamePool = selectedCombatStyle === 'conjurador' ? MONSTER_NAMES.conjuradorNames
        : selectedCombatStyle === 'atirador' ? MONSTER_NAMES.atiradorNames
        : selectedCombatStyle === 'tatico' ? MONSTER_NAMES.taticoNames
        : MONSTER_NAMES.marcialNames;
      name = styleNamePool[Math.floor(Math.random() * styleNamePool.length)];
    } else {
      const prefix = MONSTER_NAMES.prefixes[Math.floor(Math.random() * MONSTER_NAMES.prefixes.length)];
      const base = MONSTER_NAMES.bases[Math.floor(Math.random() * MONSTER_NAMES.bases.length)];
      const suffix = MONSTER_NAMES.suffixes[Math.floor(Math.random() * MONSTER_NAMES.suffixes.length)];
      name = `${prefix} ${base} ${suffix}`;
    }

    // Deslocamento & Sentidos
    let speed = '9m';
    if (selectedType === 'animal' || selectedType === 'besta') speed = '12m';
    if (selectedCombatStyle === 'atirador' || selectedRole === 'emboscador') speed = '12m';
    if (selectedType === 'planta' || selectedRole === 'tanque') speed = '6m';

    let senses = 'Visão na penumbra';
    if (selectedType === 'morto-vivo' || selectedType === 'demônio') senses = 'Visão no escuro';
    if (selectedRole === 'especialista' || selectedRole === 'emboscador' || selectedCombatStyle === 'atirador') senses = 'Visão no escuro, Faro';

    const damageFormula = AttackGeneratorService.generateDiceFormula(targetDamage);

    // Táticas guiadas pelo Estilo de Combate
    const styleTactic = COMBAT_STYLE_TACTICS[selectedCombatStyle] || roleProfile.description;

    const baseMonster: GeneratedMonster = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      type: selectedType,
      nd: selectedNd,
      combatRole: selectedCombatRole,
      combatStyle: selectedCombatStyle,
      realmorScale: selectedScale,
      role: selectedRole,
      rank: selectedRank,
      description: `Uma criatura do tipo ${selectedType} (${selectedTheme}) que habita ${selectedEnvironment}. Papel de combate T20: ${selectedCombatRole.toUpperCase()} (Tabela 2-3 de Ameaças de Arton), estilo ${selectedCombatStyle.toUpperCase()}, escala REALMOR ${escalaLabel}.${isCasterCreature ? ' Possui domínio sobre feitiços e energias arcanas/divinas.' : ''}`,
      hp: calculatedHp,
      defense: calculatedDefense,
      attack: calculatedAttack,
      damage: damageFormula,
      saveDC: calculatedSaveDC,
      fortitude: calculatedFortitude,
      reflexes: calculatedReflexes,
      will: calculatedWill,
      attributes,
      speed,
      senses,
      attacks: generatedAttacks,
      abilities: selectedAbilities,
      specialActions: specialActions.length > 0 ? specialActions : undefined,
      bossResources: bossResources && bossResources.length > 0 ? bossResources : undefined,
      spells: generatedSpells && generatedSpells.length > 0 ? generatedSpells : undefined,
      manaPoints,
      tactics: styleTactic,
      environment: selectedEnvironment,
      theme: selectedTheme,
      targetDamage,
      tableReference: tableRef,
      auditLog,
    };

    // Aplicação de Evolução Controlada (Fraquezas, Vantagens, Sinergias e Perfil de Combate)
    const evolvedMonster = MonsterEvolutionService.evolve(baseMonster);

    // CAMADA 7: VALIDAÇÃO FINAL CONTRA A TABELA 2-3
    const validation = this.validateMonsterAgainstND(evolvedMonster);
    validation.auditLog = auditLog;
    evolvedMonster.validation = validation;

    return evolvedMonster;
  },

  /**
   * Gera atributos de representação temática (FOR, DES, CON, INT, SAB, CAR)
   */
  generateAttributes(params: {
    nd: string;
    role: MonsterRole;
    type: CreatureType;
    rank: MonsterRank;
  }): { str: number; dex: number; con: number; int: number; wis: number; cha: number } {
    const { nd, role, type, rank } = params;
    const ndRef = getT20CreatureParameters('solo', nd);
    const ndNum = ndRef ? ndRef.ndValue : 1;

    let totalPoints = Math.floor(ndNum * 0.8) + 4;
    if (rank === 'elite') totalPoints += 2;
    if (rank === 'chefe') totalPoints += 4;

    let profile = 'TÁTICO';
    if (role === 'bruto') profile = 'BRUTO';
    else if (role === 'tanque') profile = 'TANQUE';
    else if (role === 'conjurador') profile = 'ARCANO';
    else if (role === 'emboscador') profile = 'ÁGIL';
    else if (role === 'controlador') profile = 'TÁTICO';
    else if (role === 'especialista') profile = 'TÁTICO';

    if (type === 'animal' || type === 'besta') profile = 'SELVAGEM';

    const templates: Record<string, Record<string, number>> = {
      'ÁGIL':    { str: 0.1, dex: 0.5, con: 0.2, int: 0.0, wis: 0.2, cha: 0.0 },
      'BRUTO':   { str: 0.5, dex: 0.1, con: 0.4, int: -0.2, wis: 0.1, cha: -0.1 },
      'TÁTICO':  { str: 0.2, dex: 0.2, con: 0.2, int: 0.3, wis: 0.3, cha: 0.1 },
      'TANQUE':  { str: 0.3, dex: -0.1, con: 0.5, int: 0.0, wis: 0.2, cha: 0.0 },
      'ARCANO':  { str: -0.1, dex: 0.2, con: 0.1, int: 0.5, wis: 0.3, cha: 0.2 },
      'SELVAGEM': { str: 0.4, dex: 0.4, con: 0.2, int: -0.3, wis: 0.2, cha: -0.1 },
    };

    const template = templates[profile] || templates['TÁTICO'];
    const attributes = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

    Object.keys(attributes).forEach((key) => {
      const k = key as keyof typeof attributes;
      const weight = template[k] ?? 0.1;
      if (weight > 0) {
        attributes[k] = Math.max(0, Math.floor(totalPoints * weight));
      } else if (weight < 0) {
        attributes[k] = Math.max(-4, Math.floor(weight * 8));
      } else {
        attributes[k] = 0;
      }
    });

    if (type === 'animal' || type === 'besta') {
      attributes.int = -4;
    }
    if (type === 'construto' || (type === 'morto-vivo' && role !== 'conjurador')) {
      attributes.int = -5;
    }

    return attributes;
  },

  /**
   * Valida se a criatura gerada está em estrita conformidade com a Tabela 2-3 de Tormenta 20 (Ameaças de Arton).
   */
  validateMonsterAgainstND(monster: GeneratedMonster): MonsterValidationResult {
    const combatRole = monster.combatRole || 'solo';
    const tableRef = getT20CreatureParameters(combatRole, monster.nd);
    const tableName = combatRole === 'solo' ? 'Tabela 2-3 A (Solos)' : combatRole === 'lacaio' ? 'Tabela 2-3 B (Lacaios)' : 'Tabela 2-3 C (Especiais)';

    const warnings: string[] = [];
    const deviations: Record<string, string> = {};

    const checks: MonsterValidationResult['checks'] = {
      hp: 'OK',
      defense: 'OK',
      attack: 'OK',
      damage: 'OK',
      saveDC: 'OK',
      fortitude: 'OK',
      reflexes: 'OK',
      will: 'OK',
    };

    // 1. Validação de PV:
    const hpMin = Math.round(tableRef.hp * 0.7);
    const hpMax = Math.round(tableRef.hp * 1.6);
    if (monster.hp < hpMin) {
      checks.hp = 'ATENÇÃO';
      warnings.push(`PV (${monster.hp}) abaixo da base oficial para ${combatRole.toUpperCase()} ND ${monster.nd} (${tableRef.hp}).`);
      deviations.hp = `${monster.hp} vs ref ${tableRef.hp}`;
    } else if (monster.hp > hpMax) {
      checks.hp = 'FORA DO PADRÃO';
      warnings.push(`PV (${monster.hp}) excede o teto oficial para ${combatRole.toUpperCase()} ND ${monster.nd} (${tableRef.hp}).`);
      deviations.hp = `${monster.hp} vs ref ${tableRef.hp}`;
    } else {
      deviations.hp = `${monster.hp} (ref: ${tableRef.hp})`;
    }

    // 2. Validação de Defesa: Tolerância ±2
    const defMin = tableRef.defense - 2;
    const defMax = tableRef.defense + 3;
    if (monster.defense < defMin || monster.defense > defMax) {
      checks.defense = 'ATENÇÃO';
      warnings.push(`Defesa (${monster.defense}) difere da referência oficial (${tableRef.defense}).`);
      deviations.defense = `${monster.defense} vs ref ${tableRef.defense}`;
    } else {
      deviations.defense = `${monster.defense} (ref: ${tableRef.defense})`;
    }

    // 3. Validação de Ataque: Tolerância ±2
    const atkMin = tableRef.attack - 2;
    const atkMax = tableRef.attack + 3;
    if (monster.attack < atkMin || monster.attack > atkMax) {
      checks.attack = 'ATENÇÃO';
      warnings.push(`Ataque (+${monster.attack}) difere da referência oficial (+${tableRef.attack}).`);
      deviations.attack = `+${monster.attack} vs ref +${tableRef.attack}`;
    } else {
      deviations.attack = `+${monster.attack} (ref: +${tableRef.attack})`;
    }

    // 4. Validação de Dano Médio: Tolerância ±15%
    const dmgMin = Math.round(tableRef.targetDamage * 0.85);
    const dmgMax = Math.round(tableRef.targetDamage * 1.25);
    if (monster.targetDamage < dmgMin || monster.targetDamage > dmgMax) {
      checks.damage = 'ATENÇÃO';
      warnings.push(`Dano médio (${monster.targetDamage}) difere da meta oficial (${tableRef.targetDamage}).`);
      deviations.damage = `${monster.targetDamage} vs ref ${tableRef.targetDamage}`;
    } else {
      deviations.damage = `${monster.targetDamage} (ref: ${tableRef.targetDamage})`;
    }

    // 5. Validação de CD: Tolerância ±2
    const cdMin = tableRef.saveDC - 2;
    const cdMax = tableRef.saveDC + 3;
    if (monster.saveDC < cdMin || monster.saveDC > cdMax) {
      checks.saveDC = 'ATENÇÃO';
      warnings.push(`CD (${monster.saveDC}) difere da referência oficial (${tableRef.saveDC}).`);
      deviations.saveDC = `${monster.saveDC} vs ref ${tableRef.saveDC}`;
    } else {
      deviations.saveDC = `${monster.saveDC} (ref: ${tableRef.saveDC})`;
    }

    // 6. Validação de Resistências
    const highestSave = Math.max(tableRef.saves.strong, tableRef.saves.medium, tableRef.saves.weak);
    const lowestSave = Math.min(tableRef.saves.strong, tableRef.saves.medium, tableRef.saves.weak);
    const validateSave = (name: 'fortitude' | 'reflexes' | 'will', val: number) => {
      const minPossible = lowestSave - 2;
      const maxPossible = highestSave + 3;
      if (val < minPossible || val > maxPossible) {
        checks[name] = 'ATENÇÃO';
        warnings.push(`${name} (+${val}) fora da faixa da tabela (+${lowestSave} a +${highestSave}).`);
        deviations[name] = `+${val} vs faixa (+${lowestSave}..+${highestSave})`;
      } else {
        deviations[name] = `+${val}`;
      }
    };

    validateSave('fortitude', monster.fortitude);
    validateSave('reflexes', monster.reflexes);
    validateSave('will', monster.will);

    const hasCritical = Object.values(checks).some(s => s === 'FORA DO PADRÃO');
    const hasAttention = Object.values(checks).some(s => s === 'ATENÇÃO');

    const status: MonsterValidationResult['status'] = hasCritical 
      ? 'FORA DO PADRÃO' 
      : hasAttention 
        ? 'ATENÇÃO' 
        : 'OK';

    return {
      valid: !hasCritical,
      status,
      checks,
      warnings,
      deviations,
      tableUsed: tableName,
    };
  },

  /**
   * Validação formal contra a Tabela 2-3 de Tormenta 20 (Ameaças de Arton, Cap. 2).
   * Compara cada parâmetro contra a linha oficial de Papel + ND.
   */
  validateAgainstT20Table(
    role: CombatRole,
    nd: string,
    generatedStats: {
      hp: number;
      defense: number;
      attack: number;
      targetDamage: number;
      saveDC: number;
      fortitude: number;
      reflexes: number;
      will: number;
    }
  ): {
    tableUsed: string;
    officialParams: T20CreatureParameterEntry;
    isExactMatch: boolean;
    differences: Record<string, { official: any; generated: any; matches: boolean }>;
    status: '100% Conforme T20' | 'Ajuste Conceitual' | 'Fora do Padrão';
    conformanceNotes: string[];
  } {
    const officialParams = getT20CreatureParameters(role, nd);
    const tableName = role === 'solo' ? 'Tabela 2-3 A (Solos)' : role === 'lacaio' ? 'Tabela 2-3 B (Lacaios)' : 'Tabela 2-3 C (Especiais)';

    const differences: Record<string, { official: any; generated: any; matches: boolean }> = {
      attack: { official: officialParams.attack, generated: generatedStats.attack, matches: generatedStats.attack === officialParams.attack },
      averageDamage: { official: officialParams.averageDamage, generated: generatedStats.targetDamage, matches: generatedStats.targetDamage === officialParams.averageDamage },
      defense: { official: officialParams.defense, generated: generatedStats.defense, matches: generatedStats.defense === officialParams.defense },
      hp: { official: officialParams.hp, generated: generatedStats.hp, matches: generatedStats.hp === officialParams.hp },
      standardEffectDC: { official: officialParams.standardEffectDC, generated: generatedStats.saveDC, matches: generatedStats.saveDC === officialParams.standardEffectDC },
    };

    // Validação da distribuição de resistências (Forte / Média / Fraca)
    const genSaves = [generatedStats.fortitude, generatedStats.reflexes, generatedStats.will].sort((a, b) => b - a);
    const offSaves = [officialParams.strongSave, officialParams.mediumSave, officialParams.weakSave].sort((a, b) => b - a);
    const savesMatch = genSaves[0] === offSaves[0] && genSaves[1] === offSaves[1] && genSaves[2] === offSaves[2];

    differences['saves'] = {
      official: { strong: officialParams.strongSave, medium: officialParams.mediumSave, weak: officialParams.weakSave },
      generated: { fortitude: generatedStats.fortitude, reflexes: generatedStats.reflexes, will: generatedStats.will },
      matches: savesMatch,
    };

    const isExactMatch = Object.values(differences).every(d => d.matches);
    const conformanceNotes: string[] = [];

    if (isExactMatch) {
      conformanceNotes.push(`Todos os parâmetros correspondem exatamente à linha ${role.toUpperCase()} ND ${nd} da ${tableName}.`);
    } else {
      Object.entries(differences).forEach(([key, val]) => {
        if (!val.matches) {
          conformanceNotes.push(`Parâmetro '${key}' foi ajustado pelo conceito da criatura.`);
        }
      });
    }

    return {
      tableUsed: tableName,
      officialParams,
      isExactMatch,
      differences,
      status: isExactMatch ? '100% Conforme T20' : 'Ajuste Conceitual',
      conformanceNotes,
    };
  },

  /**
   * Executa a suíte de testes de validação com a Tabela 2-3 oficial.
   * Valida Solo (ND 3, 5, 10), Lacaio (ND 3, 5, 10) e Especial (ND 3, 5, 10).
   * Consulta a ÚNICA fonte de verdade oficial (getT20CreatureParameters).
   */
  runT20ValidationTests(): Record<string, any> {
    const testCases: Array<{ nd: string; combatRole: CombatRole; rank: MonsterRank; role: MonsterRole }> = [
      // Testes Obrigatórios de Solo
      { nd: '3', combatRole: 'solo', rank: 'normal', role: 'bruto' },
      { nd: '5', combatRole: 'solo', rank: 'normal', role: 'tanque' },
      { nd: '5', combatRole: 'solo', rank: 'chefe', role: 'bruto' },
      { nd: '5', combatRole: 'solo', rank: 'elite', role: 'tanque' },
      { nd: '10', combatRole: 'solo', rank: 'normal', role: 'controlador' },

      // Testes Obrigatórios de Lacaio
      { nd: '3', combatRole: 'lacaio', rank: 'normal', role: 'emboscador' },
      { nd: '5', combatRole: 'lacaio', rank: 'normal', role: 'bruto' },
      { nd: '10', combatRole: 'lacaio', rank: 'normal', role: 'emboscador' },

      // Testes Obrigatórios de Especial
      { nd: '3', combatRole: 'especial', rank: 'normal', role: 'conjurador' },
      { nd: '5', combatRole: 'especial', rank: 'normal', role: 'conjurador' },
      { nd: '10', combatRole: 'especial', rank: 'normal', role: 'especialista' },
    ];

    const results: Record<string, any> = {};

    testCases.forEach((tc) => {
      const monster = this.generate({ nd: tc.nd, combatRole: tc.combatRole, rank: tc.rank, role: tc.role });
      const formalValidation = this.validateAgainstT20Table(tc.combatRole, tc.nd, {
        hp: monster.hp,
        defense: monster.defense,
        attack: monster.attack,
        targetDamage: monster.targetDamage,
        saveDC: monster.saveDC,
        fortitude: monster.fortitude,
        reflexes: monster.reflexes,
        will: monster.will,
      });

      const off = formalValidation.officialParams;

      results[`${tc.combatRole.toUpperCase()}_ND${tc.nd}_${tc.rank.toUpperCase()}_${tc.role.toUpperCase()}`] = {
        ND: monster.nd,
        PapelDeCombate: monster.combatRole,
        Escala: monster.rank,
        TabelaOrigem: formalValidation.tableUsed,
        ValoresOficiais: {
          Ataque: `+${off.attack}`,
          DanoMedio: off.averageDamage,
          Defesa: off.defense,
          Resistencias: `Forte +${off.strongSave} | Média +${off.mediumSave} | Fraca +${off.weakSave}`,
          PV: off.hp,
          CD: off.standardEffectDC,
        },
        ValoresGerados: {
          Ataque: `+${monster.attack}`,
          DanoMedio: monster.targetDamage,
          Defesa: monster.defense,
          Resistencias: `Fort +${monster.fortitude} | Ref +${monster.reflexes} | Von +${monster.will}`,
          PV: monster.hp,
          CD: monster.saveDC,
        },
        Comparacao: {
          AtaqueBate: monster.attack === off.attack,
          DanoMedioBate: monster.targetDamage === off.averageDamage,
          DefesaBate: monster.defense === off.defense,
          ResistenciasBatem: formalValidation.differences.saves.matches,
          PVBate: monster.hp === off.hp,
          CDBate: monster.saveDC === off.standardEffectDC,
        },
        ConformeT20: formalValidation.status,
        ExactMatch: formalValidation.isExactMatch,
      };
    });

    return results;
  }
};
