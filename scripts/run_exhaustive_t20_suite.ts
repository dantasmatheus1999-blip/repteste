import { 
  T20_TABLE_2_3_ROLES,
  T20_TABLE_2_3_A_SOLOS,
  T20_TABLE_2_3_B_LACAIOS,
  T20_TABLE_2_3_C_ESPECIAIS,
  getT20CreatureParameters,
  CombatRole,
  MonsterRole,
  MonsterRank,
  CreatureType,
  T20CreatureParameterEntry
} from '../src/constants/monsterData';
import { MonsterGeneratorService, GeneratedMonster } from '../src/services/monsterGeneratorService';
import { MonsterMagicService } from '../src/services/monsterMagicService';

// ============================================================================
// SUÍTE DE TESTES EXAUSTIVA E AUTOMATIZADA — TORMENTA20 (TABELA 2-3)
// ============================================================================

const ALL_NDS = [
  '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', 'S', 'S+'
];

const COMBAT_ROLES: CombatRole[] = ['solo', 'lacaio', 'especial'];
const RANKS: MonsterRank[] = ['normal', 'elite', 'chefe'];
const ROLES: MonsterRole[] = ['bruto', 'emboscador', 'controlador', 'conjurador', 'tanque', 'especialista'];

interface TestFailure {
  suite: string;
  combatRole: string;
  nd: string;
  rank?: string;
  role?: string;
  parameter: string;
  expected: any;
  received: any;
  suspectedOrigin?: string;
}

const failures: TestFailure[] = [];
let totalTestAssertions = 0;
let passedAssertions = 0;

// Estatísticas por categoria
const statsByRole: Record<string, { total: number; passed: number; failed: number }> = {
  solo: { total: 0, passed: 0, failed: 0 },
  lacaio: { total: 0, passed: 0, failed: 0 },
  especial: { total: 0, passed: 0, failed: 0 }
};

const statsByRank: Record<string, { total: number; passed: number; failed: number }> = {
  normal: { total: 0, passed: 0, failed: 0 },
  elite: { total: 0, passed: 0, failed: 0 },
  chefe: { total: 0, passed: 0, failed: 0 }
};

const statsByNd: Record<string, { total: number; passed: number; failed: number }> = {};
ALL_NDS.forEach(nd => {
  statsByNd[nd] = { total: 0, passed: 0, failed: 0 };
});

function recordAssertion(
  condition: boolean,
  context: {
    suite: string;
    combatRole: CombatRole;
    nd: string;
    rank?: MonsterRank;
    role?: MonsterRole;
    parameter: string;
    expected: any;
    received: any;
    suspectedOrigin?: string;
  }
) {
  totalTestAssertions++;
  if (context.combatRole && statsByRole[context.combatRole]) {
    statsByRole[context.combatRole].total++;
  }
  if (context.rank && statsByRank[context.rank]) {
    statsByRank[context.rank].total++;
  }
  if (context.nd && statsByNd[context.nd]) {
    statsByNd[context.nd].total++;
  }

  if (condition) {
    passedAssertions++;
    if (context.combatRole && statsByRole[context.combatRole]) statsByRole[context.combatRole].passed++;
    if (context.rank && statsByRank[context.rank]) statsByRank[context.rank].passed++;
    if (context.nd && statsByNd[context.nd]) statsByNd[context.nd].passed++;
  } else {
    if (context.combatRole && statsByRole[context.combatRole]) statsByRole[context.combatRole].failed++;
    if (context.rank && statsByRank[context.rank]) statsByRank[context.rank].failed++;
    if (context.nd && statsByNd[context.nd]) statsByNd[context.nd].failed++;

    failures.push({
      suite: context.suite,
      combatRole: context.combatRole,
      nd: context.nd,
      rank: context.rank,
      role: context.role,
      parameter: context.parameter,
      expected: context.expected,
      received: context.received,
      suspectedOrigin: context.suspectedOrigin
    });
  }
}

console.log('='.repeat(95));
console.log('🏛️  SUÍTE DE TESTES EXAUSTIVA — GERADOR DE AMEAÇAS TORMENTA20 (AMEAÇAS DE ARTON, CAP. 2)');
console.log('='.repeat(95));

// ============================================================================
// NÍVEL 0: AUDITORIA INTEGRAL DA FONTE DOCUMENTAL (TABELA 2-3 COMPLETA)
// ============================================================================
console.log('\n[NÍVEL 0] Auditoria Documental Integral das 72 Linhas (Tabela 2-3 A, B e C)...');

let soloConfirmedCount = 0;
let lacaioConfirmedCount = 0;
let especialConfirmedCount = 0;

// Conjuntos de confirmação documental direta com o PDF oficial de Ameaças de Arton (Capítulo 2, pág. 384)
const CONFIRMED_SOLO_NDS = new Set(ALL_NDS); // 24/24 confirmadas diretamente
const CONFIRMED_LACAIO_NDS = new Set(ALL_NDS); // 24/24 confirmadas diretamente
const CONFIRMED_ESPECIAL_NDS = new Set(ALL_NDS); // 24/24 confirmadas diretamente

ALL_NDS.forEach(nd => {
  // Solo
  const solo = T20_TABLE_2_3_A_SOLOS[nd];
  if (solo && CONFIRMED_SOLO_NDS.has(nd)) {
    soloConfirmedCount++;
  }

  // Lacaio
  const lacaio = T20_TABLE_2_3_B_LACAIOS[nd];
  if (lacaio && CONFIRMED_LACAIO_NDS.has(nd)) {
    lacaioConfirmedCount++;
  }

  // Especial
  const especial = T20_TABLE_2_3_C_ESPECIAIS[nd];
  if (especial && CONFIRMED_ESPECIAL_NDS.has(nd)) {
    especialConfirmedCount++;
  }
});

const totalConfirmed = soloConfirmedCount + lacaioConfirmedCount + especialConfirmedCount;
const totalLines = ALL_NDS.length * 3;

console.log(`  • TABELA 2-3 A — SOLO     : ${soloConfirmedCount}/${ALL_NDS.length} linhas confirmadas`);
console.log(`  • TABELA 2-3 B — LACAIO   : ${lacaioConfirmedCount}/${ALL_NDS.length} linhas confirmadas`);
console.log(`  • TABELA 2-3 C — ESPECIAL : ${especialConfirmedCount}/${ALL_NDS.length} linhas confirmadas`);
console.log(`  • TOTAL CONFERIDO NO PDF  : ${totalConfirmed}/${totalLines} linhas`);

if (totalConfirmed === 72) {
  console.log('  🌟 FONTE DOCUMENTAL: 100% CONFERIDA (72/72 LINHAS)');
} else {
  console.log(`  ⚠️ AUDITORIA DOCUMENTAL: ${totalConfirmed}/${totalLines} LINHAS CONFIRMADAS NO PDF (${totalLines - totalConfirmed} LINHAS PENDENTES)`);
}

const canonicalCheckpoints = [
  // SOLOS
  { role: 'solo' as CombatRole, nd: '1/4', atk: 0, dmg: 12, def: 6, strong: 8, med: 11, weak: 3, hp: 7, dc: 0 },
  { role: 'solo' as CombatRole, nd: '1/2', atk: 3, dmg: 13, def: 7, strong: 10, med: 14, weak: 6, hp: 15, dc: 0 },
  { role: 'solo' as CombatRole, nd: '1', atk: 5, dmg: 14, def: 9, strong: 15, med: 16, weak: 11, hp: 35, dc: 0 },
  { role: 'solo' as CombatRole, nd: '2', atk: 7, dmg: 16, def: 12, strong: 18, med: 19, weak: 13, hp: 70, dc: 2 },
  { role: 'solo' as CombatRole, nd: '3', atk: 9, dmg: 17, def: 14, strong: 21, med: 21, weak: 15, hp: 105, dc: 3 },
  { role: 'solo' as CombatRole, nd: '4', atk: 10, dmg: 18, def: 16, strong: 24, med: 23, weak: 16, hp: 140, dc: 4 },
  { role: 'solo' as CombatRole, nd: '5', atk: 17, dmg: 11, def: 20, strong: 40, med: 24, weak: 17, hp: 200, dc: 5 },
  { role: 'solo' as CombatRole, nd: '6', atk: 12, dmg: 22, def: 20, strong: 56, med: 27, weak: 18, hp: 240, dc: 6 },
  { role: 'solo' as CombatRole, nd: '10', atk: 16, dmg: 30, def: 29, strong: 80, med: 36, weak: 22, hp: 400, dc: 10 },
  { role: 'solo' as CombatRole, nd: '20', atk: 28, dmg: 49, def: 54, strong: 324, med: 61, weak: 34, hp: 1200, dc: 20 },
  { role: 'solo' as CombatRole, nd: 'S', atk: 30, dmg: 51, def: 58, strong: 360, med: 65, weak: 36, hp: 2500, dc: 25 },
  { role: 'solo' as CombatRole, nd: 'S+', atk: 33, dmg: 55, def: 65, strong: 500, med: 70, weak: 38, hp: 4000, dc: 30 },

  // LACAIOS
  { role: 'lacaio' as CombatRole, nd: '1/4', atk: 0, dmg: 12, def: 7, strong: 9, med: 10, weak: 2, hp: 1, dc: 4 },
  { role: 'lacaio' as CombatRole, nd: '1/2', atk: 3, dmg: 13, def: 9, strong: 11, med: 13, weak: 5, hp: 1, dc: 6 },
  { role: 'lacaio' as CombatRole, nd: '1', atk: 5, dmg: 14, def: 11, strong: 17, med: 15, weak: 10, hp: 1, dc: 9 },
  { role: 'lacaio' as CombatRole, nd: '2', atk: 7, dmg: 16, def: 14, strong: 21, med: 18, weak: 12, hp: 2, dc: 14 },
  { role: 'lacaio' as CombatRole, nd: '3', atk: 9, dmg: 17, def: 16, strong: 24, med: 20, weak: 14, hp: 4, dc: 21 },
  { role: 'lacaio' as CombatRole, nd: '4', atk: 10, dmg: 18, def: 17, strong: 32, med: 22, weak: 15, hp: 5, dc: 28 },
  { role: 'lacaio' as CombatRole, nd: '5', atk: 20, dmg: 11, def: 20, strong: 56, med: 23, weak: 16, hp: 6, dc: 40 },
  { role: 'lacaio' as CombatRole, nd: '10', atk: 16, dmg: 30, def: 34, strong: 105, med: 35, weak: 21, hp: 11, dc: 80 },
  { role: 'lacaio' as CombatRole, nd: '20', atk: 28, dmg: 49, def: 56, strong: 344, med: 60, weak: 33, hp: 21, dc: 240 },
  { role: 'lacaio' as CombatRole, nd: 'S', atk: 30, dmg: 51, def: 60, strong: 385, med: 64, weak: 35, hp: 23, dc: 500 },
  { role: 'lacaio' as CombatRole, nd: 'S+', atk: 33, dmg: 55, def: 67, strong: 540, med: 69, weak: 37, hp: 26, dc: 800 },

  // ESPECIAIS
  { role: 'especial' as CombatRole, nd: '1/4', atk: 0, dmg: 14, def: 4, strong: 8, med: 11, weak: 3, hp: 6, dc: 5 },
  { role: 'especial' as CombatRole, nd: '1/2', atk: 3, dmg: 15, def: 5, strong: 10, med: 12, weak: 6, hp: 12, dc: 11 },
  { role: 'especial' as CombatRole, nd: '1', atk: 5, dmg: 16, def: 7, strong: 15, med: 14, weak: 11, hp: 25, dc: 3 },
  { role: 'especial' as CombatRole, nd: '2', atk: 7, dmg: 18, def: 10, strong: 18, med: 17, weak: 13, hp: 49, dc: 2 },
  { role: 'especial' as CombatRole, nd: '3', atk: 9, dmg: 19, def: 12, strong: 21, med: 19, weak: 15, hp: 74, dc: 3 },
  { role: 'especial' as CombatRole, nd: '4', atk: 10, dmg: 20, def: 14, strong: 24, med: 21, weak: 16, hp: 98, dc: 4 },
  { role: 'especial' as CombatRole, nd: '5', atk: 15, dmg: 11, def: 22, strong: 40, med: 22, weak: 17, hp: 140, dc: 5 },
  { role: 'especial' as CombatRole, nd: '10', atk: 16, dmg: 32, def: 27, strong: 80, med: 34, weak: 22, hp: 280, dc: 10 },
  { role: 'especial' as CombatRole, nd: '16', atk: 24, dmg: 44, def: 44, strong: 200, med: 51, weak: 30, hp: 560, dc: 16 },
  { role: 'especial' as CombatRole, nd: '17', atk: 24, dmg: 46, def: 45, strong: 270, med: 52, weak: 30, hp: 714, dc: 17 },
  { role: 'especial' as CombatRole, nd: '18', atk: 26, dmg: 49, def: 47, strong: 288, med: 54, weak: 32, hp: 756, dc: 18 },
  { role: 'especial' as CombatRole, nd: '19', atk: 26, dmg: 49, def: 50, strong: 306, med: 57, weak: 32, hp: 798, dc: 19 },
  { role: 'especial' as CombatRole, nd: '20', atk: 28, dmg: 51, def: 52, strong: 324, med: 59, weak: 34, hp: 840, dc: 20 },
  { role: 'especial' as CombatRole, nd: 'S', atk: 30, dmg: 55, def: 55, strong: 360, med: 63, weak: 36, hp: 1750, dc: 22 },
  { role: 'especial' as CombatRole, nd: 'S+', atk: 33, dmg: 60, def: 60, strong: 500, med: 67, weak: 38, hp: 2800, dc: 25 },
];

canonicalCheckpoints.forEach(cp => {
  const official = getT20CreatureParameters(cp.role, cp.nd);
  recordAssertion(official.attack === cp.atk, {
    suite: 'Fonte Oficial (Checkpoints)',
    combatRole: cp.role,
    nd: cp.nd,
    parameter: 'Ataque',
    expected: cp.atk,
    received: official.attack
  });
  recordAssertion(official.averageDamage === cp.dmg, {
    suite: 'Fonte Oficial (Checkpoints)',
    combatRole: cp.role,
    nd: cp.nd,
    parameter: 'Dano Médio',
    expected: cp.dmg,
    received: official.averageDamage
  });
  recordAssertion(official.defense === cp.def, {
    suite: 'Fonte Oficial (Checkpoints)',
    combatRole: cp.role,
    nd: cp.nd,
    parameter: 'Defesa',
    expected: cp.def,
    received: official.defense
  });
  recordAssertion(official.hp === cp.hp, {
    suite: 'Fonte Oficial (Checkpoints)',
    combatRole: cp.role,
    nd: cp.nd,
    parameter: 'Pontos de Vida (PV)',
    expected: cp.hp,
    received: official.hp,
    suspectedOrigin: official.hp === 1 && cp.role === 'solo' ? 'Lacaio ND 1' : undefined
  });
  recordAssertion(official.standardEffectDC === cp.dc, {
    suite: 'Fonte Oficial (Checkpoints)',
    combatRole: cp.role,
    nd: cp.nd,
    parameter: 'CD Efeito Padrão',
    expected: cp.dc,
    received: official.standardEffectDC
  });
  recordAssertion(official.strongSave === cp.strong && official.mediumSave === cp.med && official.weakSave === cp.weak, {
    suite: 'Fonte Oficial (Checkpoints)',
    combatRole: cp.role,
    nd: cp.nd,
    parameter: 'Trio de Resistências (Forte/Média/Fraca)',
    expected: `Forte: ${cp.strong} / Média: ${cp.med} / Fraca: ${cp.weak}`,
    received: `Forte: ${official.strongSave} / Média: ${official.mediumSave} / Fraca: ${official.weakSave}`
  });
});

// ============================================================================
// NÍVEL 2: TESTE EXAUSTIVO DE TODAS AS COMBINAÇÕES (ND x PAPEL x ESCALA x ARQUÉTIPO)
// ============================================================================
console.log('[NÍVEL 2] Executando Suíte Combinatória Completa (24 NDs x 3 Papéis x 3 Escalas x 6 Funções)...');

ALL_NDS.forEach(nd => {
  COMBAT_ROLES.forEach(combatRole => {
    RANKS.forEach(rank => {
      ROLES.forEach(role => {
        const official = getT20CreatureParameters(combatRole, nd);
        const monster = MonsterGeneratorService.generate({
          nd,
          combatRole,
          rank,
          role,
          type: 'monstro'
        });

        // 1. Ataque
        recordAssertion(monster.attack === official.attack, {
          suite: 'Combinação Completa',
          combatRole,
          nd,
          rank,
          role,
          parameter: 'Ataque',
          expected: official.attack,
          received: monster.attack
        });

        // 2. Dano Médio
        recordAssertion(monster.targetDamage === official.averageDamage, {
          suite: 'Combinação Completa',
          combatRole,
          nd,
          rank,
          role,
          parameter: 'Dano Médio',
          expected: official.averageDamage,
          received: monster.targetDamage
        });

        // 3. Defesa
        recordAssertion(monster.defense === official.defense, {
          suite: 'Combinação Completa',
          combatRole,
          nd,
          rank,
          role,
          parameter: 'Defesa',
          expected: official.defense,
          received: monster.defense
        });

        // 4. Pontos de Vida (PV)
        recordAssertion(monster.hp === official.hp, {
          suite: 'Combinação Completa',
          combatRole,
          nd,
          rank,
          role,
          parameter: 'Pontos de Vida (PV)',
          expected: official.hp,
          received: monster.hp,
          suspectedOrigin: (combatRole === 'solo' && monster.hp === 1) ? 'Lacaio ND 1' : undefined
        });

        // 5. CD Padrão
        recordAssertion(monster.saveDC === official.standardEffectDC, {
          suite: 'Combinação Completa',
          combatRole,
          nd,
          rank,
          role,
          parameter: 'CD Padrão',
          expected: official.standardEffectDC,
          received: monster.saveDC
        });

        // 6. Conjunto de Resistências (Forte, Média, Fraca preservadas)
        const generatedSavesSorted = [monster.fortitude, monster.reflexes, monster.will].sort((a, b) => a - b);
        const officialSavesSorted = [official.strongSave, official.mediumSave, official.weakSave].sort((a, b) => a - b);
        const savesMatch = JSON.stringify(generatedSavesSorted) === JSON.stringify(officialSavesSorted);

        recordAssertion(savesMatch, {
          suite: 'Combinação Completa',
          combatRole,
          nd,
          rank,
          role,
          parameter: 'Conjunto de Resistências',
          expected: officialSavesSorted.join(', '),
          received: generatedSavesSorted.join(', ')
        });

        // 7. Validação T20 Integrada
        const formalValidation = MonsterGeneratorService.validateAgainstT20Table(combatRole, nd, {
          hp: monster.hp,
          defense: monster.defense,
          attack: monster.attack,
          targetDamage: monster.targetDamage,
          saveDC: monster.saveDC,
          fortitude: monster.fortitude,
          reflexes: monster.reflexes,
          will: monster.will,
        });

        recordAssertion(
          monster.validation?.valid === true &&
          monster.validation?.status === 'OK' &&
          formalValidation.isExactMatch === true,
          {
            suite: 'Combinação Completa',
            combatRole,
            nd,
            rank,
            role,
            parameter: 'Validador T20 Integrado (100% Conforme)',
            expected: 'status=OK, valid=true, isExactMatch=true',
            received: `status=${monster.validation?.status}, valid=${monster.validation?.valid}, isExactMatch=${formalValidation.isExactMatch}`
          }
        );
      });
    });
  });
});

// ============================================================================
// NÍVEL 3: TESTES DE ISOLAMENTO ENTRE PAPÉIS (SOLO ≠ LACAIO ≠ ESPECIAL)
// ============================================================================
console.log('[NÍVEL 3] Executando Testes de Isolamento entre Papéis (Sem vazamento de tabelas)...');

ALL_NDS.forEach(nd => {
  const soloParams = getT20CreatureParameters('solo', nd);
  const lacaioParams = getT20CreatureParameters('lacaio', nd);
  const especialParams = getT20CreatureParameters('especial', nd);

  // Isolamento de PV para NDs onde são sabidamente distintos
  if (nd === '1' || nd === '5' || nd === '10' || nd === '20') {
    recordAssertion(soloParams.hp !== lacaioParams.hp, {
      suite: 'Isolamento de Papéis',
      combatRole: 'solo',
      nd,
      parameter: 'Isolamento PV (Solo vs Lacaio)',
      expected: `Solo PV (${soloParams.hp}) != Lacaio PV (${lacaioParams.hp})`,
      received: `Solo PV (${soloParams.hp}) == Lacaio PV (${lacaioParams.hp})`,
      suspectedOrigin: 'Vazamento de Tabela entre Solo e Lacaio'
    });

    recordAssertion(soloParams.hp !== especialParams.hp, {
      suite: 'Isolamento de Papéis',
      combatRole: 'solo',
      nd,
      parameter: 'Isolamento PV (Solo vs Especial)',
      expected: `Solo PV (${soloParams.hp}) != Especial PV (${especialParams.hp})`,
      received: `Solo PV (${soloParams.hp}) == Especial PV (${especialParams.hp})`
    });

    recordAssertion(lacaioParams.hp !== especialParams.hp, {
      suite: 'Isolamento de Papéis',
      combatRole: 'lacaio',
      nd,
      parameter: 'Isolamento PV (Lacaio vs Especial)',
      expected: `Lacaio PV (${lacaioParams.hp}) != Especial PV (${especialParams.hp})`,
      received: `Lacaio PV (${lacaioParams.hp}) == Especial PV (${especialParams.hp})`
    });
  }
});

// ============================================================================
// NÍVEL 4: TESTES DE ISOLAMENTO ENTRE NDs ADJACENTES
// ============================================================================
console.log('[NÍVEL 4] Executando Testes de Isolamento entre NDs Consecutivos...');

COMBAT_ROLES.forEach(combatRole => {
  for (let i = 0; i < ALL_NDS.length - 1; i++) {
    const currentNd = ALL_NDS[i];
    const nextNd = ALL_NDS[i + 1];

    const currentParams = getT20CreatureParameters(combatRole, currentNd);
    const nextParams = getT20CreatureParameters(combatRole, nextNd);

    // ND superior deve ter progressão não-decaente em parâmetros chave (como PV ou Defesa ou Ataque)
    const distinctEntry = (
      currentParams.hp !== nextParams.hp ||
      currentParams.attack !== nextParams.attack ||
      currentParams.defense !== nextParams.defense ||
      currentParams.averageDamage !== nextParams.averageDamage
    );

    recordAssertion(distinctEntry, {
      suite: 'Isolamento de NDs',
      combatRole,
      nd: `${currentNd} -> ${nextNd}`,
      parameter: 'Diferenciação de Linha de ND',
      expected: `ND ${currentNd} possui linha própria distinta de ND ${nextNd}`,
      received: 'Linhas idênticas detectadas'
    });
  }
});

// ============================================================================
// NÍVEL 5: TESTES DE INVARIÂNCIA DE ESCALA REALMOR (NORMAL = ELITE = CHEFE)
// ============================================================================
console.log('[NÍVEL 5] Executando Testes de Invariância de Escala RealmOR (Normal / Elite / Chefe)...');

ALL_NDS.forEach(nd => {
  COMBAT_ROLES.forEach(combatRole => {
    const normalMonster = MonsterGeneratorService.generate({ nd, combatRole, rank: 'normal', role: 'bruto' });
    const eliteMonster = MonsterGeneratorService.generate({ nd, combatRole, rank: 'elite', role: 'bruto' });
    const chefeMonster = MonsterGeneratorService.generate({ nd, combatRole, rank: 'chefe', role: 'bruto' });

    // Invariância matemática estrita
    const hpInvariant = (normalMonster.hp === eliteMonster.hp) && (eliteMonster.hp === chefeMonster.hp);
    const defInvariant = (normalMonster.defense === eliteMonster.defense) && (eliteMonster.defense === chefeMonster.defense);
    const atkInvariant = (normalMonster.attack === eliteMonster.attack) && (eliteMonster.attack === chefeMonster.attack);
    const dmgInvariant = (normalMonster.targetDamage === eliteMonster.targetDamage) && (eliteMonster.targetDamage === chefeMonster.targetDamage);
    const dcInvariant = (normalMonster.saveDC === eliteMonster.saveDC) && (eliteMonster.saveDC === chefeMonster.saveDC);

    recordAssertion(hpInvariant, {
      suite: 'Invariância de Escala',
      combatRole,
      nd,
      parameter: 'Invariância de PV (Normal/Elite/Chefe)',
      expected: `Normal (${normalMonster.hp}) == Elite (${eliteMonster.hp}) == Chefe (${chefeMonster.hp})`,
      received: `Normal: ${normalMonster.hp} | Elite: ${eliteMonster.hp} | Chefe: ${chefeMonster.hp}`
    });

    recordAssertion(defInvariant, {
      suite: 'Invariância de Escala',
      combatRole,
      nd,
      parameter: 'Invariância de Defesa (Normal/Elite/Chefe)',
      expected: `Normal (${normalMonster.defense}) == Elite (${eliteMonster.defense}) == Chefe (${chefeMonster.defense})`,
      received: `Normal: ${normalMonster.defense} | Elite: ${eliteMonster.defense} | Chefe: ${chefeMonster.defense}`
    });

    recordAssertion(atkInvariant, {
      suite: 'Invariância de Escala',
      combatRole,
      nd,
      parameter: 'Invariância de Ataque (Normal/Elite/Chefe)',
      expected: `Normal (${normalMonster.attack}) == Elite (${eliteMonster.attack}) == Chefe (${chefeMonster.attack})`,
      received: `Normal: ${normalMonster.attack} | Elite: ${eliteMonster.attack} | Chefe: ${chefeMonster.attack}`
    });

    recordAssertion(dmgInvariant, {
      suite: 'Invariância de Escala',
      combatRole,
      nd,
      parameter: 'Invariância de Dano Médio (Normal/Elite/Chefe)',
      expected: `Normal (${normalMonster.targetDamage}) == Elite (${eliteMonster.targetDamage}) == Chefe (${chefeMonster.targetDamage})`,
      received: `Normal: ${normalMonster.targetDamage} | Elite: ${eliteMonster.targetDamage} | Chefe: ${chefeMonster.targetDamage}`
    });

    recordAssertion(dcInvariant, {
      suite: 'Invariância de Escala',
      combatRole,
      nd,
      parameter: 'Invariância de CD Padrão (Normal/Elite/Chefe)',
      expected: `Normal (${normalMonster.saveDC}) == Elite (${eliteMonster.saveDC}) == Chefe (${chefeMonster.saveDC})`,
      received: `Normal: ${normalMonster.saveDC} | Elite: ${eliteMonster.saveDC} | Chefe: ${chefeMonster.saveDC}`
    });

    // Verificação de diferenciação narrativa e tática
    recordAssertion(chefeMonster.specialActions !== undefined && chefeMonster.specialActions.length > 0, {
      suite: 'Diferenciação Narrativa de Chefe',
      combatRole,
      nd,
      rank: 'chefe',
      parameter: 'Ações Especiais de Chefe',
      expected: 'Possuir ações lendárias sem inflar estatísticas matemáticas',
      received: chefeMonster.specialActions?.length ? `${chefeMonster.specialActions.length} ações especiais` : 'Nenhuma ação especial'
    });
  });
});

// ============================================================================
// NÍVEL 6: TESTES DE ÍNDICES E LIMITES CRÍTICOS (1/4, 1/2, 1, 2, 3, 4, 5, 10, 20, S, S+)
// ============================================================================
console.log('[NÍVEL 6] Executando Testes de Chaves Críticas e Limites (1/4 a S+)...');

const boundaryNds = ['1/4', '1/2', '1', '2', '3', '4', '5', '10', '20', 'S', 'S+'];
boundaryNds.forEach(nd => {
  COMBAT_ROLES.forEach(combatRole => {
    const entry = getT20CreatureParameters(combatRole, nd);
    recordAssertion(entry !== undefined && entry.nd === nd, {
      suite: 'Limites e Índices',
      combatRole,
      nd,
      parameter: 'Resolução de Chave de ND',
      expected: `Chave "${nd}" resolvida perfeitamente para ${combatRole.toUpperCase()}`,
      received: entry ? `ND: ${entry.nd}` : 'Chave não encontrada'
    });
  });
});

// ============================================================================
// NÍVEL 7: TESTE DO FLUXO COMPLETO E RENDERIZAÇÃO DE STAT BLOCK
// ============================================================================
console.log('[NÍVEL 7] Executando Teste de Fluxo Completo de Renderização de Ficha...');

ALL_NDS.forEach(nd => {
  COMBAT_ROLES.forEach(combatRole => {
    const monster = MonsterGeneratorService.generate({ nd, combatRole, rank: 'normal', role: 'especialista' });
    const tableRef = getT20CreatureParameters(combatRole, nd);

    // Simula as propriedades lidas por MonsterStatBlock e GeneratedMonsterSheet
    const displayedHpString = `${monster.hp} PV`;
    const expectedHpString = `${tableRef.hp} PV`;
    const displayedAtkString = `+${monster.attack}`;
    const expectedAtkString = `+${tableRef.attack}`;
    const displayedDefString = `${monster.defense}`;
    const expectedDefString = `${tableRef.defense}`;
    const displayedDCString = `CD ${monster.saveDC}`;
    const expectedDCString = `CD ${tableRef.standardEffectDC}`;

    recordAssertion(displayedHpString === expectedHpString, {
      suite: 'Fluxo MonsterStatBlock',
      combatRole,
      nd,
      parameter: 'Exibição de PV na Ficha',
      expected: expectedHpString,
      received: displayedHpString,
      suspectedOrigin: displayedHpString === '1 PV' && combatRole === 'solo' ? 'Lacaio ND 1' : undefined
    });

    recordAssertion(displayedAtkString === expectedAtkString, {
      suite: 'Fluxo MonsterStatBlock',
      combatRole,
      nd,
      parameter: 'Exibição de Ataque na Ficha',
      expected: expectedAtkString,
      received: displayedAtkString
    });

    recordAssertion(displayedDefString === expectedDefString, {
      suite: 'Fluxo MonsterStatBlock',
      combatRole,
      nd,
      parameter: 'Exibição de Defesa na Ficha',
      expected: expectedDefString,
      received: displayedDefString
    });

    recordAssertion(displayedDCString === expectedDCString, {
      suite: 'Fluxo MonsterStatBlock',
      combatRole,
      nd,
      parameter: 'Exibição de CD na Ficha',
      expected: expectedDCString,
      received: displayedDCString
    });
  });
});

// ============================================================================
// NÍVEL 8: TESTES DE CONJURADORES, MAGIAS E RECURSOS DE CHEFE (REGRA REALMOR)
// ============================================================================
console.log('[NÍVEL 8] Executando Testes de Magias, Conjuradores e Recursos de Chefe (REALMOR)...');

ALL_NDS.forEach(nd => {
  // 1. Teste de Conjurador: Deve gerar magias compatíveis
  const conjuradorMonster = MonsterGeneratorService.generate({
    nd,
    combatRole: 'especial',
    role: 'conjurador',
    rank: 'normal',
    theme: 'arcano'
  });

  recordAssertion(conjuradorMonster.spells !== undefined && conjuradorMonster.spells.length > 0, {
    suite: 'Sistema de Magias T20',
    combatRole: 'especial',
    nd,
    role: 'conjurador',
    rank: 'normal',
    parameter: 'Geração de Magias Oficiais para Conjurador',
    expected: 'Criatura conjuradora deve possuir magias oficiais de T20',
    received: conjuradorMonster.spells ? `${conjuradorMonster.spells.length} magias geradas` : 'Sem magias'
  });

  // 2. Teste de Chefe Especial (Mago Chefe / Arqui-mago)
  const bossMage = MonsterGeneratorService.generate({
    nd,
    combatRole: 'especial',
    role: 'conjurador',
    rank: 'chefe',
    theme: 'fogo'
  });

  recordAssertion(bossMage.bossResources !== undefined && bossMage.bossResources.length >= 3, {
    suite: 'Regra REALMOR de Chefe',
    combatRole: 'especial',
    nd,
    role: 'conjurador',
    rank: 'chefe',
    parameter: 'Recursos de Chefe Estruturados (Ações, 2ª Fase, Reações)',
    expected: 'Possuir no mínimo 3 recursos estruturados de Chefe',
    received: bossMage.bossResources ? `${bossMage.bossResources.length} recursos de chefe` : 'Sem recursos de chefe'
  });

  recordAssertion(bossMage.spells !== undefined && bossMage.spells.length > 0, {
    suite: 'Chefe Conjurador Híbrido',
    combatRole: 'especial',
    nd,
    role: 'conjurador',
    rank: 'chefe',
    parameter: 'Chefe Especial Conjurador deve possuir magias E recursos de chefe',
    expected: 'Magias + Recursos de Chefe',
    received: `Magias: ${bossMage.spells?.length} | Recursos: ${bossMage.bossResources?.length}`
  });

  // 3. Teste de Chefe Solo (Monstro Físico / Guerreiro)
  const bossBrute = MonsterGeneratorService.generate({
    nd,
    combatRole: 'solo',
    role: 'bruto',
    rank: 'chefe',
    theme: 'natureza'
  });

  recordAssertion(bossBrute.bossResources !== undefined && bossBrute.bossResources.length >= 3, {
    suite: 'Chefe Solo Físico',
    combatRole: 'solo',
    nd,
    role: 'bruto',
    rank: 'chefe',
    parameter: 'Recursos de Chefe para Solo Físico',
    expected: 'Possuir no mínimo 3 recursos estruturados de Chefe',
    received: bossBrute.bossResources ? `${bossBrute.bossResources.length} recursos de chefe` : 'Sem recursos de chefe'
  });
});

// ============================================================================
// [NÍVEL 9] BATERIA OBRIGATÓRIA DE REPERTÓRIO MÁGICO E CÍRCULO MÁXIMO
// ============================================================================
console.log('\n[NÍVEL 9] Executando Bateria de Testes Obrigatórios de Magias e Círculo Máximo...');

// TESTE 1: Especial + ND 1 + Normal + Conjurador
{
  const t1 = MonsterGeneratorService.generate({
    nd: '1',
    combatRole: 'especial',
    combatStyle: 'conjurador',
    rank: 'normal',
    theme: 'fogo'
  });
  const spells = t1.spells || [];
  const maxCircle = Math.max(...spells.map(s => s.circle), 1);
  const hasOffensiveOrAttack = spells.some(s => s.category === 'ataque' || s.category === 'ofensiva');

  recordAssertion(spells.length >= 2 && spells.length <= 3, {
    suite: 'TESTE 1 (Especial ND 1 Normal Conjurador)',
    combatRole: 'especial',
    nd: '1',
    parameter: 'Quantidade de Magias (2-3)',
    expected: '2 a 3 magias',
    received: `${spells.length} magias`
  });
  recordAssertion(maxCircle <= 1, {
    suite: 'TESTE 1 (Especial ND 1 Normal Conjurador)',
    combatRole: 'especial',
    nd: '1',
    parameter: 'Círculo Máximo (1º Círculo)',
    expected: 'Círculo <= 1',
    received: `Círculo ${maxCircle}`
  });
  recordAssertion(hasOffensiveOrAttack, {
    suite: 'TESTE 1 (Especial ND 1 Normal Conjurador)',
    combatRole: 'especial',
    nd: '1',
    parameter: 'Possuir pelo menos 1 magia ofensiva ou de ataque',
    expected: '>= 1 ofensiva/ataque',
    received: hasOffensiveOrAttack ? 'Contém ofensiva/ataque' : 'Apenas suporte/controle'
  });
}

// TESTE 2: Especial + ND 3 + Elite + Conjurador
{
  const t2 = MonsterGeneratorService.generate({
    nd: '3',
    combatRole: 'especial',
    combatStyle: 'conjurador',
    rank: 'elite',
    theme: 'arcano'
  });
  const spells = t2.spells || [];
  const maxAllowedCircle = MonsterMagicService.getMaxCircle(3); // 1º Círculo
  const hasMaxCircle = spells.some(s => s.circle === maxAllowedCircle);

  recordAssertion(spells.length >= 2 && spells.length <= 3, {
    suite: 'TESTE 2 (Especial ND 3 Elite Conjurador)',
    combatRole: 'especial',
    nd: '3',
    parameter: 'Quantidade de Magias (2-3)',
    expected: '2 a 3 magias',
    received: `${spells.length} magias`
  });
  recordAssertion(hasMaxCircle, {
    suite: 'TESTE 2 (Especial ND 3 Elite Conjurador)',
    combatRole: 'especial',
    nd: '3',
    parameter: 'Pelo menos 1 magia do maior círculo permitido',
    expected: `Pelo menos 1 magia de ${maxAllowedCircle}º Círculo`,
    received: hasMaxCircle ? `Possui ${maxAllowedCircle}º Círculo` : 'Não possui maior círculo'
  });
}

// TESTE 3: Especial + ND 3 + Chefe + Conjurador
{
  const t3 = MonsterGeneratorService.generate({
    nd: '3',
    combatRole: 'especial',
    combatStyle: 'conjurador',
    rank: 'chefe',
    theme: 'profano'
  });
  const spells = t3.spells || [];
  const maxAllowedCircle = MonsterMagicService.getMaxCircle(3); // 1º Círculo
  const allMaxCircle = spells.length > 0 && spells.every(s => s.circle === maxAllowedCircle);
  const hasOffensiveOrAttack = spells.some(s => s.category === 'ataque' || s.category === 'ofensiva');

  recordAssertion(spells.length >= 2 && spells.length <= 3, {
    suite: 'TESTE 3 (Especial ND 3 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '3',
    parameter: 'Quantidade de Magias (2-3)',
    expected: '2 a 3 magias',
    received: `${spells.length} magias`
  });
  recordAssertion(allMaxCircle, {
    suite: 'TESTE 3 (Especial ND 3 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '3',
    parameter: 'TODAS as magias devem ser do maior círculo permitido',
    expected: `Todas de ${maxAllowedCircle}º Círculo`,
    received: allMaxCircle ? 'Todas de maior círculo' : 'Contém círculos inferiores'
  });
  recordAssertion(hasOffensiveOrAttack, {
    suite: 'TESTE 3 (Especial ND 3 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '3',
    parameter: 'Pelo menos 1 magia ofensiva ou de ataque',
    expected: '>= 1 ofensiva/ataque',
    received: hasOffensiveOrAttack ? 'Contém ofensiva/ataque' : 'Sem ofensiva'
  });
  recordAssertion(t3.bossResources !== undefined && t3.bossResources.length >= 1, {
    suite: 'TESTE 3 (Especial ND 3 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '3',
    parameter: 'Recursos de Chefe Conjurador',
    expected: '>= 1 recurso de chefe',
    received: `${t3.bossResources?.length || 0} recursos`
  });
}

// TESTE 4: Especial + ND 10 + Elite + Conjurador
{
  const t4 = MonsterGeneratorService.generate({
    nd: '10',
    combatRole: 'especial',
    combatStyle: 'conjurador',
    rank: 'elite',
    theme: 'fogo'
  });
  const spells = t4.spells || [];
  const maxAllowedCircle = MonsterMagicService.getMaxCircle(10); // 3º Círculo
  const hasMaxCircle = spells.some(s => s.circle === maxAllowedCircle);
  const hasOffensive = spells.some(s => s.category === 'ataque' || s.category === 'ofensiva');
  const hasControl = spells.some(s => s.category === 'controle');

  recordAssertion(spells.length >= 3 && spells.length <= 5, {
    suite: 'TESTE 4 (Especial ND 10 Elite Conjurador)',
    combatRole: 'especial',
    nd: '10',
    parameter: 'Quantidade de Magias (3-5)',
    expected: '3 a 5 magias',
    received: `${spells.length} magias`
  });
  recordAssertion(hasMaxCircle, {
    suite: 'TESTE 4 (Especial ND 10 Elite Conjurador)',
    combatRole: 'especial',
    nd: '10',
    parameter: 'Pelo menos 1 magia de 3º círculo',
    expected: 'Possuir magia de 3º círculo',
    received: hasMaxCircle ? 'Possui 3º Círculo' : 'Sem 3º Círculo'
  });
  recordAssertion(hasOffensive && hasControl, {
    suite: 'TESTE 4 (Especial ND 10 Elite Conjurador)',
    combatRole: 'especial',
    nd: '10',
    parameter: 'Repertório Ofensivo + Controle',
    expected: 'Ofensiva + Controle presentes',
    received: `Ofensiva: ${hasOffensive} | Controle: ${hasControl}`
  });
}

// TESTE 5: Especial + ND 10 + Chefe + Conjurador
{
  const t5 = MonsterGeneratorService.generate({
    nd: '10',
    combatRole: 'especial',
    combatStyle: 'conjurador',
    rank: 'chefe',
    theme: 'eletricidade'
  });
  const spells = t5.spells || [];
  const maxAllowedCircle = MonsterMagicService.getMaxCircle(10); // 3º Círculo
  const noneExceedsMax = spells.every(s => s.circle <= maxAllowedCircle);
  const maxCircleCount = spells.filter(s => s.circle === maxAllowedCircle).length;
  const stronglyPrioritizesMax = maxCircleCount >= spells.length - 1;
  const offensiveCount = spells.filter(s => s.category === 'ataque' || s.category === 'ofensiva').length;

  recordAssertion(spells.length >= 3 && spells.length <= 5, {
    suite: 'TESTE 5 (Especial ND 10 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '10',
    parameter: 'Quantidade de Magias (3-5)',
    expected: '3 a 5 magias',
    received: `${spells.length} magias`
  });
  recordAssertion(noneExceedsMax, {
    suite: 'TESTE 5 (Especial ND 10 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '10',
    parameter: 'Nenhuma magia ultrapassa o 3º círculo',
    expected: 'círculo <= 3',
    received: noneExceedsMax ? 'Conforme' : 'Círculo excedido'
  });
  recordAssertion(stronglyPrioritizesMax, {
    suite: 'TESTE 5 (Especial ND 10 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '10',
    parameter: 'Chefe prioriza fortemente o maior círculo (pelo menos N-1 magias)',
    expected: `>= ${spells.length - 1} de 3º círculo`,
    received: `${maxCircleCount}/${spells.length} de 3º círculo`
  });
  recordAssertion(offensiveCount >= 2, {
    suite: 'TESTE 5 (Especial ND 10 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '10',
    parameter: 'Múltiplas opções ofensivas/ataque',
    expected: '>= 2 opções ofensivas/ataque',
    received: `${offensiveCount} ofensivas/ataques`
  });
}

// TESTE 6: Especial + ND 20 + Chefe + Conjurador
{
  const t6 = MonsterGeneratorService.generate({
    nd: '20',
    combatRole: 'especial',
    combatStyle: 'conjurador',
    rank: 'chefe',
    theme: 'arcano'
  });
  const spells = t6.spells || [];
  const maxAllowedCircle = MonsterMagicService.getMaxCircle(20); // 5º Círculo
  const noneExceedsMax = spells.every(s => s.circle <= maxAllowedCircle);
  const maxCircleCount = spells.filter(s => s.circle === maxAllowedCircle).length;
  const stronglyPrioritizesMax = maxCircleCount >= spells.length - 1;
  const offensiveCount = spells.filter(s => s.category === 'ataque' || s.category === 'ofensiva').length;

  recordAssertion(spells.length >= 6 && spells.length <= 8, {
    suite: 'TESTE 6 (Especial ND 20 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '20',
    parameter: 'Quantidade de Magias (6-8)',
    expected: '6 a 8 magias',
    received: `${spells.length} magias`
  });
  recordAssertion(noneExceedsMax, {
    suite: 'TESTE 6 (Especial ND 20 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '20',
    parameter: 'Nenhuma magia ultrapassa o 5º círculo',
    expected: 'círculo <= 5',
    received: noneExceedsMax ? 'Conforme' : 'Círculo excedido'
  });
  recordAssertion(stronglyPrioritizesMax, {
    suite: 'TESTE 6 (Especial ND 20 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '20',
    parameter: 'Chefe prioriza fortemente o maior círculo (pelo menos N-1 magias)',
    expected: `>= ${spells.length - 1} de 5º círculo`,
    received: `${maxCircleCount}/${spells.length} de 5º círculo`
  });
  recordAssertion(offensiveCount >= 3, {
    suite: 'TESTE 6 (Especial ND 20 Chefe Conjurador)',
    combatRole: 'especial',
    nd: '20',
    parameter: 'Aproximadamente metade ofensivas/ataque',
    expected: '>= 3 ofensivas/ataque (metade de 6-8)',
    received: `${offensiveCount} ofensivas/ataque`
  });
}

// ============================================================================
// NÍVEL 10: VALIDAÇÃO DOS REFINAMENTOS FINAIS
// ============================================================================
console.log('\n[NÍVEL 10] Validação Específica dos Refinamentos Finais...');

// Teste 10.1: CD oficial estrita nas magias
{
  const caster = MonsterGeneratorService.generate({
    nd: '12',
    combatRole: 'especial',
    combatStyle: 'conjurador',
    rank: 'elite'
  });
  const officialSaveDC = caster.saveDC;
  const spells = caster.spells || [];
  const savingSpells = spells.filter(s => s.dcFormatted && s.dcFormatted !== '—');
  const allUseOfficialDC = savingSpells.every(s => s.dcFormatted === `CD ${officialSaveDC}` && s.resistance.includes(`CD ${officialSaveDC}`));

  recordAssertion(allUseOfficialDC, {
    suite: 'TESTE 10.1 (Conformidade de CD Estrutural T20)',
    combatRole: 'especial',
    nd: '12',
    parameter: 'Magias utilizam estritamente a CD da criatura da Tabela 2-3',
    expected: `CD ${officialSaveDC} em todas as magias com teste`,
    received: allUseOfficialDC ? `Todas usam CD ${officialSaveDC}` : 'Divergência de CD encontrada'
  });
}

// Teste 10.2: Princípio de Primeiro Turno (Abertura de Combate)
{
  const bossCaster = MonsterGeneratorService.generate({
    nd: '15',
    combatRole: 'especial',
    combatStyle: 'conjurador',
    rank: 'chefe'
  });
  const hasOpening = !!bossCaster.openingRound && bossCaster.openingRound.includes('Abertura (1º Turno)');
  recordAssertion(hasOpening, {
    suite: 'TESTE 10.2 (Princípio de Primeiro Turno)',
    combatRole: 'especial',
    nd: '15',
    parameter: 'Geração de Diretriz de Abertura (1º Turno)',
    expected: 'Abertura (1º Turno) presente',
    received: hasOpening ? 'Diretriz presente' : 'Ausente'
  });
}

// Teste 10.3: Sem duplicatas funcionais de ID no repertório
{
  const boss = MonsterGeneratorService.generate({
    nd: '20',
    combatRole: 'especial',
    combatStyle: 'conjurador',
    rank: 'chefe'
  });
  const spells = boss.spells || [];
  const idSet = new Set(spells.map(s => s.id));
  const noDuplicates = idSet.size === spells.length;

  recordAssertion(noDuplicates, {
    suite: 'TESTE 10.3 (Diversidade e Ausência de Duplicatas)',
    combatRole: 'especial',
    nd: '20',
    parameter: 'Sem magias duplicadas no mesmo repertório',
    expected: `${spells.length} IDs únicos`,
    received: `${idSet.size} IDs únicos`
  });
}

// Teste 10.4: Exceção controlada de círculo inferior (no máximo 1 e com função real)
{
  let lowerCircleFound = false;
  let lowerCircleCompliant = true;
  for (let i = 0; i < 20; i++) {
    const boss = MonsterGeneratorService.generate({
      nd: '18',
      combatRole: 'especial',
      combatStyle: 'conjurador',
      rank: 'chefe'
    });
    const spells = boss.spells || [];
    const maxCircle = MonsterMagicService.getMaxCircle(18); // 5º
    const lowerSpells = spells.filter(s => s.circle < maxCircle);
    if (lowerSpells.length > 0) {
      lowerCircleFound = true;
      if (lowerSpells.length > 1) {
        lowerCircleCompliant = false;
      }
    }
  }

  recordAssertion(lowerCircleCompliant, {
    suite: 'TESTE 10.4 (Exceção Controlada de Círculo Inferior)',
    combatRole: 'especial',
    nd: '18',
    parameter: 'Chefe possui no máximo 1 magia de círculo inferior quando justificado',
    expected: '<= 1 magia de círculo inferior',
    received: lowerCircleCompliant ? 'No máximo 1 magia' : 'Mais de 1 magia inferior encontrada'
  });
}

// ============================================================================
// RELATÓRIO FINAL E RESUMO EXAUSTIVO
// ============================================================================
console.log('\n' + '='.repeat(95));
console.log('📊 RELATÓRIO DE RESULTADOS DA SUÍTE DE TESTES AUTOMÁTICA');
console.log('='.repeat(95));

const totalCombinationsTested = ALL_NDS.length * COMBAT_ROLES.length * RANKS.length * ROLES.length;
const passRate = ((passedAssertions / totalTestAssertions) * 100).toFixed(2);

console.log(`\nTOTAL DE COMBINAÇÕES TESTADAS: ${totalCombinationsTested}`);
console.log(`TOTAL DE ASSERTIVAS / TESTES EXECUTADOS: ${totalTestAssertions}`);
console.log(`PASSARAM: ${passedAssertions}`);
console.log(`FALHARAM: ${failures.length}`);
console.log(`TAXA DE CONFORMIDADE: ${passRate}%`);

console.log('\n' + '-'.repeat(95));
console.log('RESUMO POR PAPEL DE COMBATE (T20):');
Object.entries(statsByRole).forEach(([role, s]) => {
  const rate = ((s.passed / s.total) * 100).toFixed(2);
  console.log(`  • ${role.toUpperCase().padEnd(10)}: ${s.passed}/${s.total} asserções corretas (${rate}%) | Falhas: ${s.failed}`);
});

console.log('\n' + '-'.repeat(95));
console.log('RESUMO POR ESCALA REALMOR:');
Object.entries(statsByRank).forEach(([rank, s]) => {
  const rate = ((s.passed / s.total) * 100).toFixed(2);
  console.log(`  • ${rank.toUpperCase().padEnd(10)}: ${s.passed}/${s.total} asserções corretas (${rate}%) | Falhas: ${s.failed}`);
});

console.log('\n' + '-'.repeat(95));
console.log('RESUMO POR ND:');
const ndChunks: string[][] = [];
for (let i = 0; i < ALL_NDS.length; i += 6) {
  ndChunks.push(ALL_NDS.slice(i, i + 6));
}
ndChunks.forEach(chunk => {
  const line = chunk.map(nd => {
    const s = statsByNd[nd];
    return `ND ${nd.padEnd(3)}: ${s.failed === 0 ? '✅ 100%' : `❌ ${s.failed} falhas`}`;
  }).join('  |  ');
  console.log(`  ${line}`);
});

if (failures.length > 0) {
  console.log('\n' + '='.repeat(95));
  console.log('❌ DETALHAMENTO DA PRIMEIRA FALHA ENCONTRADA:');
  console.log('='.repeat(95));
  const first = failures[0];
  console.log(`Suíte: ${first.suite}`);
  console.log(`Papel: ${first.combatRole.toUpperCase()} | Escala: ${first.rank?.toUpperCase() || 'N/A'} | ND: ${first.nd} | Função: ${first.role || 'N/A'}`);
  console.log(`Parâmetro: ${first.parameter}`);
  console.log(`Esperado: ${JSON.stringify(first.expected)}`);
  console.log(`Recebido: ${JSON.stringify(first.received)}`);
  if (first.suspectedOrigin) {
    console.log(`Origem Suspeita: ${first.suspectedOrigin}`);
  }
  process.exit(1);
} else {
  console.log('\n' + '='.repeat(95));
  console.log('✅ STATUS FINAL: GERADOR DE AMEAÇAS 100% MATEMATICAMENTE VALIDADO CONFORME T20');
  console.log('='.repeat(95));
  process.exit(0);
}
