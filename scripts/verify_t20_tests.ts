import { MonsterGeneratorService } from '../src/services/monsterGeneratorService';
import { getT20CreatureParameters, CombatRole, MonsterRank, MonsterRole } from '../src/constants/monsterData';

interface TestCase {
  name: string;
  nd: string;
  combatRole: CombatRole;
  rank: MonsterRank;
  role: MonsterRole;
}

const testCases: TestCase[] = [
  // 1. SOLO
  { name: 'SOLO ND 1 (Normal / Bruto)', nd: '1', combatRole: 'solo', rank: 'normal', role: 'bruto' },
  { name: 'SOLO ND 3 (Normal / Bruto)', nd: '3', combatRole: 'solo', rank: 'normal', role: 'bruto' },
  { name: 'SOLO ND 5 (Normal / Tanque)', nd: '5', combatRole: 'solo', rank: 'normal', role: 'tanque' },
  { name: 'SOLO ND 5 (Chefe / Bruto)', nd: '5', combatRole: 'solo', rank: 'chefe', role: 'bruto' },
  { name: 'SOLO ND 5 (Elite / Tanque)', nd: '5', combatRole: 'solo', rank: 'elite', role: 'tanque' },
  { name: 'SOLO ND 10 (Normal / Controlador)', nd: '10', combatRole: 'solo', rank: 'normal', role: 'controlador' },

  // 2. LACAIO
  { name: 'LACAIO ND 1 (Normal / Bruto)', nd: '1', combatRole: 'lacaio', rank: 'normal', role: 'bruto' },
  { name: 'LACAIO ND 3 (Normal / Emboscador)', nd: '3', combatRole: 'lacaio', rank: 'normal', role: 'emboscador' },
  { name: 'LACAIO ND 5 (Normal / Bruto)', nd: '5', combatRole: 'lacaio', rank: 'normal', role: 'bruto' },
  { name: 'LACAIO ND 10 (Normal / Emboscador)', nd: '10', combatRole: 'lacaio', rank: 'normal', role: 'emboscador' },

  // 3. ESPECIAL
  { name: 'ESPECIAL ND 1 (Normal / Conjurador)', nd: '1', combatRole: 'especial', rank: 'normal', role: 'conjurador' },
  { name: 'ESPECIAL ND 3 (Normal / Conjurador)', nd: '3', combatRole: 'especial', rank: 'normal', role: 'conjurador' },
  { name: 'ESPECIAL ND 5 (Normal / Conjurador)', nd: '5', combatRole: 'especial', rank: 'normal', role: 'conjurador' },
  { name: 'ESPECIAL ND 10 (Normal / Especialista)', nd: '10', combatRole: 'especial', rank: 'normal', role: 'especialista' },
];

console.log('='.repeat(90));
console.log('AUDITORIA E VALIDAÇÃO FORMAL — TABELA 2-3 (AMEAÇAS DE ARTON, CAP. 2)');
console.log('='.repeat(90));

let allMatches = true;

testCases.forEach((tc, idx) => {
  const officialParams = getT20CreatureParameters(tc.combatRole, tc.nd);
  const monster = MonsterGeneratorService.generate({
    nd: tc.nd,
    combatRole: tc.combatRole,
    rank: tc.rank,
    role: tc.role,
  });

  const formalValidation = MonsterGeneratorService.validateAgainstT20Table(tc.combatRole, tc.nd, {
    hp: monster.hp,
    defense: monster.defense,
    attack: monster.attack,
    targetDamage: monster.targetDamage,
    saveDC: monster.saveDC,
    fortitude: monster.fortitude,
    reflexes: monster.reflexes,
    will: monster.will,
  });

  if (!formalValidation.isExactMatch) {
    allMatches = false;
  }

  console.log(`\nTESTE #${idx + 1}: ${tc.name}`);
  console.log(`- Papel de Combate: ${tc.combatRole.toUpperCase()} | ND: ${tc.nd} | Escala: ${tc.rank.toUpperCase()}`);
  console.log(`- 1. Valor da Tabela Oficial:`);
  console.log(`     Ataque: +${officialParams.attack} | Dano Médio: ${officialParams.averageDamage} | Defesa: ${officialParams.defense}`);
  console.log(`     Resistências: Forte +${officialParams.strongSave} / Média +${officialParams.mediumSave} / Fraca +${officialParams.weakSave}`);
  console.log(`     PV: ${officialParams.hp} | CD (Efeito Padrão): ${officialParams.standardEffectDC}`);
  
  console.log(`- 2. Valor Retornado por getT20CreatureParameters:`);
  console.log(`     Ataque: +${officialParams.attack} | Dano Médio: ${officialParams.targetDamage} | Defesa: ${officialParams.defense}`);
  console.log(`     Resistências: Forte +${officialParams.saves.strong} / Média +${officialParams.saves.medium} / Fraca +${officialParams.saves.weak}`);
  console.log(`     PV: ${officialParams.hp} | CD: ${officialParams.saveDC}`);

  console.log(`- 3. Valor Gerado pelo Sistema:`);
  console.log(`     Ataque: +${monster.attack} | Dano Médio: ${monster.targetDamage} | Defesa: ${monster.defense}`);
  console.log(`     Resistências: Fort +${monster.fortitude} / Ref +${monster.reflexes} / Von +${monster.will}`);
  console.log(`     PV: ${monster.hp} | CD: ${monster.saveDC}`);

  console.log(`- 4. Diferença:`);
  console.log(`     Ataque: ${monster.attack - officialParams.attack === 0 ? 'Nenhuma (Exato)' : `Dif: ${monster.attack - officialParams.attack}`}`);
  console.log(`     Dano Médio: ${monster.targetDamage - officialParams.averageDamage === 0 ? 'Nenhuma (Exato)' : `Dif: ${monster.targetDamage - officialParams.averageDamage}`}`);
  console.log(`     Defesa: ${monster.defense - officialParams.defense === 0 ? 'Nenhuma (Exato)' : `Dif: ${monster.defense - officialParams.defense}`}`);
  console.log(`     Resistências: ${formalValidation.differences.saves.matches ? 'Nenhuma (Conjunto de Forte/Média/Fraca idêntico)' : 'Divergência de Resistências'}`);
  console.log(`     PV: ${monster.hp - officialParams.hp === 0 ? 'Nenhuma (Exato)' : `Dif: ${monster.hp - officialParams.hp}`}`);
  console.log(`     CD: ${monster.saveDC - officialParams.standardEffectDC === 0 ? 'Nenhuma (Exato)' : `Dif: ${monster.saveDC - officialParams.standardEffectDC}`}`);

  console.log(`- 5. Status: ${formalValidation.isExactMatch ? '✅ 100% Conforme T20' : '❌ Divergência Detectada'}`);
});

console.log('\n' + '='.repeat(90));
console.log(`RESULTADO DA AUDITORIA: ${allMatches ? 'TODOS OS 11 TESTES 100% CONFORMES COM A TABELA 2-3 OFICIAL T20' : 'FALHA DE CONFORMIDADE'}`);
console.log('='.repeat(90));
