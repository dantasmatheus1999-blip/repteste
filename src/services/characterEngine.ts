import { 
  CharacterData, 
  FichaCompleta, 
  CalculatedValue, 
  Attribute, 
  Attributes, 
  Modifier 
} from '../types/character';
import { T20_CLASSES, T20_SKILLS } from '../data/t20Data';
import { T20_RACES } from '../data/t20Races';
import { T20_ORIGINS } from '../data/t20Origins';
import { T20_POWERS } from '../data/t20Powers';
import { T20_WEAPONS, T20_ARMORS, T20_SHIELDS } from '../data/t20Equipment';
import { T20_SPELLS } from '../data/t20Spells';

/**
 * Helper: Metade do nível (arredondado para baixo)
 */
export const getMetadeDoNivel = (nivel: number): number => Math.floor(nivel / 2);

/**
 * Helper: Bônus de treinamento por nível
 */
export const getBonusTreinamento = (nivel: number): number => {
  if (nivel >= 15) return 6;
  if (nivel >= 7) return 4;
  return 2;
};

/**
 * Função principal para coletar todos os modificadores ativos
 */
const collectModifiers = (character: CharacterData): Modifier[] => {
  const modifiers: Modifier[] = [];

  // 1. Modificadores de Raça
  const race = T20_RACES.find(r => r.id === character.identity.raceId);
  if (race) {
    race.attributeModifiers.forEach(mod => {
      modifiers.push({
        id: `race-${race.id}-${mod.attribute}`,
        name: race.name,
        source: 'Raça',
        target: `attribute.${mod.attribute}`,
        type: 'bonus',
        value: mod.value,
        isActive: true
      });
    });
    // Outros bônus raciais poderiam ser adicionados aqui se estivessem estruturados
  }

  // 2. Modificadores de Origem
  const origin = T20_ORIGINS.find(o => o.id === character.identity.originId);
  if (origin) {
    // Origens em T20 geralmente dão perícias ou poderes, mas algumas podem dar bônus diretos
    // Se houvesse bônus estruturados nas origens, seriam coletados aqui
  }

  // 3. Modificadores de Poderes
  character.choices.powers.forEach(powerId => {
    const power = T20_POWERS.find(p => p.id === powerId);
    if (power) {
      // Poderes podem ter efeitos que alteram a ficha
      // No momento os poderes não estão estruturados com modificadores, mas a arquitetura permite
    }
  });

  // 4. Modificadores de Equipamentos
  const armor = T20_ARMORS.find(a => a.id === character.choices.equipment.armorId);
  if (armor) {
    modifiers.push({
      id: `armor-${armor.id}-def`,
      name: armor.name,
      source: 'Equipamento',
      target: 'defesa',
      type: 'bonus',
      value: armor.defenseBonus,
      isActive: true
    });
  }

  const shield = T20_SHIELDS.find(s => s.id === character.choices.equipment.shieldId);
  if (shield) {
    modifiers.push({
      id: `shield-${shield.id}-def`,
      name: shield.name,
      source: 'Equipamento',
      target: 'defesa',
      type: 'bonus',
      value: shield.defenseBonus,
      isActive: true
    });
  }

  // 5. Buffs e Debuffs temporários
  modifiers.push(...character.state.buffs);
  modifiers.push(...character.state.debuffs);

  return modifiers;
};

/**
 * Calcula um valor final com base em uma base e modificadores
 */
const calculateFinalValue = (base: number, target: string, modifiers: Modifier[]): CalculatedValue => {
  const activeModifiers = modifiers.filter(m => m.isActive && m.target === target);
  
  let total = base;
  const breakdown: CalculatedValue['modifiers'] = [];

  activeModifiers.forEach(mod => {
    if (mod.type === 'bonus') {
      total += mod.value;
      breakdown.push({ source: mod.source, value: mod.value, name: mod.name });
    } else if (mod.type === 'penalidade') {
      total -= mod.value;
      breakdown.push({ source: mod.source, value: -mod.value, name: mod.name });
    }
    // Substituição e Multiplicador poderiam ser implementados aqui
  });

  return {
    total,
    base,
    modifiers: breakdown
  };
};

/**
 * Constrói a ficha completa
 */
export const buildFichaCompleta = (character: CharacterData): FichaCompleta => {
  const modifiers = collectModifiers(character);
  const nivel = character.identity.level;
  const metadeNivel = getMetadeDoNivel(nivel);
  const bonusTreinamento = getBonusTreinamento(nivel);

  // 1. Atributos Finais
  const attributes: Record<Attribute, CalculatedValue> = {} as any;
  (Object.keys(character.baseAttributes) as Attribute[]).forEach(attr => {
    attributes[attr] = calculateFinalValue(character.baseAttributes[attr], `attribute.${attr}`, modifiers);
  });

  // 2. Perícias
  const skills: FichaCompleta['skills'] = {};
  T20_SKILLS.forEach(skillDef => {
    const isTrained = character.choices.trainedSkills.includes(skillDef.id);
    const attrKey = skillDef.attr as Attribute;
    const attrValue = attributes[attrKey].total;
    
    // Base da perícia em T20: Metade do Nível + Atributo
    let base = metadeNivel + attrValue;
    
    // Bônus de treinamento
    const skillModifiers = [...modifiers];
    if (isTrained) {
      skillModifiers.push({
        id: `training-${skillDef.id}`,
        name: 'Treinamento',
        source: 'Classe/Origem',
        target: `pericia.${skillDef.id}`,
        type: 'bonus',
        value: bonusTreinamento,
        isActive: true
      });
    }

    skills[skillDef.id] = {
      ...calculateFinalValue(base, `pericia.${skillDef.id}`, skillModifiers),
      trained: isTrained,
      attribute: attrKey
    };
  });

  // 3. Resistências (são perícias especiais)
  const resistances = {
    fortitude: skills['fortitude'],
    reflexos: skills['reflexos'],
    vontade: skills['vontade']
  };

  // 4. Recursos (PV/PM)
  const charClass = T20_CLASSES[character.identity.classId as keyof typeof T20_CLASSES];
  const con = attributes['CON'].total;
  
  // PV Total = pvInicial + CON + ((nivel-1) * (pvPorNivel + CON))
  // Regra: ganho mínimo de 1 PV por nível
  const pvBase = charClass.pvBase + con;
  const pvGanhosNivel = Math.max(1, charClass.pvPerLevel + con) * (nivel - 1);
  const pvTotal = calculateFinalValue(pvBase + pvGanhosNivel, 'pv.total', modifiers);

  // PM Total = pmBase + (nivel - 1) * pmPorNivel
  const pmTotal = calculateFinalValue(charClass.pmBase + Math.max(0, charClass.pmPerLevel * (nivel - 1)), 'pm.total', modifiers);

  // 5. Combate (Defesa, Iniciativa, Deslocamento)
  const armor = T20_ARMORS.find(a => a.id === character.choices.equipment.armorId);
  const isHeavyArmor = armor?.type === 'pesada';
  
  // Defesa = 10 + DES (se não for pesada) + Armadura + Escudo
  let dexForDefense = attributes['DES'].total;
  if (isHeavyArmor) dexForDefense = 0; // Armadura pesada ignora DES na defesa
  
  const defense = calculateFinalValue(10 + dexForDefense, 'defesa', modifiers);
  const initiative = skills['iniciativa'];
  
  // Deslocamento base 9m, reduz 3m se armadura pesada
  let baseMovement = 9;
  if (isHeavyArmor) baseMovement = 6;
  const movement = calculateFinalValue(baseMovement, 'deslocamento', modifiers);

  // 6. Ataques
  const attacks: FichaCompleta['combat']['attacks'] = [];
  const mainWeapon = T20_WEAPONS.find(w => w.id === character.choices.equipment.mainWeaponId);
  
  if (mainWeapon) {
    const isMelee = mainWeapon.type !== 'distancia';
    const skillId = isMelee ? 'luta' : 'pontaria';
    const attackBonus = skills[skillId];
    
    const attrDanoKey = mainWeapon.attrDano;
    const attrDanoValue = attrDanoKey ? attributes[attrDanoKey].total : 0;
    
    attacks.push({
      name: mainWeapon.name,
      attackBonus: attackBonus,
      damage: calculateFinalValue(attrDanoValue, `dano.${mainWeapon.id}`, modifiers), // Simplificado: base é o atributo
      crit: mainWeapon.crit,
      range: mainWeapon.range,
      type: mainWeapon.properties.join(', ')
    });
  }

  // 7. Magias
  const mainAttrMagia = charClass.mainAttr as Attribute;
  const cdMagia = calculateFinalValue(10 + metadeNivel + attributes[mainAttrMagia].total, 'cd.magia', modifiers);

  return {
    identity: character.identity,
    attributes,
    resources: {
      pvMax: pvTotal,
      pvCurrent: character.state.currentPV,
      pmMax: pmTotal,
      pmCurrent: character.state.currentPM
    },
    combat: {
      defense,
      initiative,
      movement,
      attacks
    },
    skills,
    resistances,
    spells: {
      cd: cdMagia,
      list: character.choices.spells.map(id => T20_SPELLS.find(s => s.id === id)).filter(Boolean)
    },
    powers: character.choices.powers.map(id => T20_POWERS.find(p => p.id === id)).filter(Boolean),
    inventory: [] // To be implemented
  };
};
