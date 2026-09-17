
import { GeneratedMonster } from './monsterGeneratorService';
import { 
  COMBAT_PROFILES, 
  CombatProfileType, 
  WEAKNESSES, 
  ADVANTAGES, 
  SYNERGIES,
  ELEMENTAL_THEMES,
  NATURAL_WEAKNESSES,
  SITUATIONAL_WEAKNESSES
} from '../constants/evolutionData';

export const MonsterEvolutionService = {
  evolve(monster: GeneratedMonster): GeneratedMonster {
    // 1. Select Combat Profile based on Role or Random
    let profileType: CombatProfileType = 'tático';
    const rand = Math.random();

    if (monster.role === 'bruto') {
      profileType = rand > 0.4 ? 'selvagem' : 'agressivo';
    } else if (monster.role === 'tanque') {
      profileType = 'defensivo';
    } else if (monster.role === 'conjurador') {
      profileType = 'arcano';
    } else if (monster.role === 'emboscador') {
      profileType = rand > 0.5 ? 'agil' : 'agressivo';
    } else if (monster.role === 'especialista') {
      profileType = rand > 0.5 ? 'agil' : 'tático';
    } else {
      profileType = 'tático';
    }

    const profile = COMBAT_PROFILES[profileType];
    
    // 2. Apply Stat Modifiers from Profile
    const evolvedMonster = { ...monster };
    evolvedMonster.combatProfile = {
      name: profile.name,
      description: profile.description
    };

    if (profile.statModifiers.attack) evolvedMonster.attack += profile.statModifiers.attack;
    if (profile.statModifiers.defense) evolvedMonster.defense += profile.statModifiers.defense;
    if (profile.statModifiers.hpMultiplier && profile.statModifiers.hpMultiplier !== 1) {
      evolvedMonster.hp = Math.round(evolvedMonster.hp * profile.statModifiers.hpMultiplier);
    }

    // Apply attribute modifiers
    if (profile.statModifiers.str) evolvedMonster.attributes.str += profile.statModifiers.str;
    if (profile.statModifiers.dex) evolvedMonster.attributes.dex += profile.statModifiers.dex;
    if (profile.statModifiers.con) evolvedMonster.attributes.con += profile.statModifiers.con;
    if (profile.statModifiers.int) evolvedMonster.attributes.int += profile.statModifiers.int;
    if (profile.statModifiers.wis) evolvedMonster.attributes.wis += profile.statModifiers.wis;
    if (profile.statModifiers.cha) evolvedMonster.attributes.cha += profile.statModifiers.cha;

    // 3. Elemental Theme Integration
    const themeData = ELEMENTAL_THEMES[monster.theme.toLowerCase()];
    if (themeData) {
      // Add theme resistances to advantages
      evolvedMonster.advantages = [...(evolvedMonster.advantages || []), ...themeData.resistances];
      
      // Add theme effect to abilities
      evolvedMonster.abilities = [...evolvedMonster.abilities, `Poder Elemental (${monster.theme}): ${themeData.effect.replace('CD base', `CD ${evolvedMonster.saveDC}`)}`];
    }

    // 4. Assign Weaknesses (Mandatory Type 1 and Type 2 + Optional Situational)
    const weaknesses: string[] = [];
    
    // Type 1: Elemental Weakness (based on theme)
    if (themeData && themeData.weaknesses.length > 0) {
      weaknesses.push(themeData.weaknesses[0]);
    } else {
      // Fallback to type-based elemental weakness
      const typeWeaknesses = WEAKNESSES[monster.type] || [];
      const elementalWeakness = typeWeaknesses.find(w => w.includes('Fogo') || w.includes('Gelo') || w.includes('Eletricidade') || w.includes('Luz') || w.includes('Sagrado'));
      if (elementalWeakness) weaknesses.push(elementalWeakness);
    }

    // Type 2: Natural Weakness (based on monster role/nature)
    const naturalOptions = [...(NATURAL_WEAKNESSES[monster.role] || [])];
    if (monster.speed.includes('voo')) naturalOptions.push(...NATURAL_WEAKNESSES.voador);
    if (monster.rank === 'chefe' || monster.rank === 'elite') naturalOptions.push(...NATURAL_WEAKNESSES.grande);
    if (monster.role === 'conjurador') naturalOptions.push(...NATURAL_WEAKNESSES.magico);

    if (naturalOptions.length > 0) {
      weaknesses.push(naturalOptions[Math.floor(Math.random() * naturalOptions.length)]);
    }

    // Type 3: Situational Weakness (Optional, 40% chance)
    if (Math.random() < 0.4) {
      weaknesses.push(SITUATIONAL_WEAKNESSES[Math.floor(Math.random() * SITUATIONAL_WEAKNESSES.length)]);
    }

    // Ensure at least 2 weaknesses (MANDATORY)
    if (weaknesses.length < 2) {
      const allPossible = [...(WEAKNESSES[monster.type] || []), ...SITUATIONAL_WEAKNESSES];
      while (weaknesses.length < 2 && allPossible.length > 0) {
        const randIndex = Math.floor(Math.random() * allPossible.length);
        const w = allPossible[randIndex];
        if (!weaknesses.includes(w)) {
          weaknesses.push(w);
        }
        allPossible.splice(randIndex, 1);
      }
    }

    // Add extra random weaknesses if needed (rare)
    const extraWeaknesses = (WEAKNESSES[monster.type] || []).filter(w => !weaknesses.includes(w));
    if (extraWeaknesses.length > 0 && Math.random() > 0.8) {
      weaknesses.push(extraWeaknesses[Math.floor(Math.random() * extraWeaknesses.length)]);
    }

    evolvedMonster.weaknesses = weaknesses;
    
    // 5. Advantages (Random 1-2)
    const typeAdvantages = ADVANTAGES[monster.type] || [];
    evolvedMonster.advantages = [
      ...(evolvedMonster.advantages || []),
      ...([...typeAdvantages].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1))
    ];

    // 6. Synergy (30% chance for normal, 60% for elite, 100% for boss)
    const synergyChance = monster.rank === 'chefe' ? 1 : monster.rank === 'elite' ? 0.6 : 0.3;
    if (Math.random() < synergyChance) {
      evolvedMonster.synergy = SYNERGIES[Math.floor(Math.random() * SYNERGIES.length)];
    }

    // 7. Format Attacks (Distance + Critical)
    evolvedMonster.attacks = evolvedMonster.attacks.map(attack => {
      let updatedAttack = attack;

      // Add Critical Info
      const critMargin = monster.rank === 'chefe' ? 18 : monster.rank === 'elite' ? 19 : 20;
      const critMult = (monster.role === 'bruto' || monster.rank === 'chefe') ? 'x3' : 'x2';
      let critStr = `Crítico: ${critMargin}–20 / ${critMult}`;
      
      if (monster.rank === 'chefe' && Math.random() > 0.5) {
        const bossEffects = [
          'causa sangramento (1d6/rodada)',
          'derruba o alvo',
          'empurra o alvo 3m',
          'deixa o alvo Atordoado por 1 rodada'
        ];
        critStr += `\nEfeito crítico: ${bossEffects[Math.floor(Math.random() * bossEffects.length)]}`;
      }

      // Insert Critical Info before Effect if it exists, or at the end
      if (updatedAttack.includes('\nEfeito:')) {
        updatedAttack = updatedAttack.replace('\nEfeito:', `\n${critStr}\nEfeito:`);
      } else {
        updatedAttack += `\n${critStr}`;
      }

      // Distance formatting
      if (updatedAttack.toLowerCase().includes('distância') || updatedAttack.toLowerCase().includes('mágico')) {
        if (!updatedAttack.includes('m)') && !updatedAttack.includes('m ')) {
          const distances = ['9m', '18m', '30m'];
          const dist = distances[Math.floor(Math.random() * distances.length)];
          
          if (updatedAttack.includes(' — ')) {
            const lines = updatedAttack.split('\n');
            const header = lines[0];
            const parts = header.split(' — ');
            const name = parts[0];
            const typeAndRest = parts[1];
            
            if (typeAndRest.toLowerCase().startsWith('à distância')) {
              lines[0] = `${name} — À distância (${dist})`;
            } else if (typeAndRest.toLowerCase().startsWith('mágico')) {
              lines[0] = `${name} — Mágico (${dist})`;
            }
            updatedAttack = lines.join('\n');
          }
        }
      }
      return updatedAttack;
    });

    return evolvedMonster;
  }
};
