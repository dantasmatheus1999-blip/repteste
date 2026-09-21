import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { T20Engine } from '../utils/t20Engine';
import { T20_SKILLS, T20_CLASSES } from '../data/t20Data';
import { T20Character } from '../types/t20';
import { 
  Shield, Sword, ScrollText, Backpack, 
  Wand2, User, Plus, Trash2, Edit3, ChevronDown, ChevronUp,
  BookOpen, Save, Loader2
} from 'lucide-react';
import { ClassPickerModal } from '../components/character/ClassPickerModal';
import { T20_CLASSES_DETAILED } from '../data/t20ClassesDetailed';
import { useAuth } from '../context/AuthContext';
import { CharacterService } from '../services/characterService';
import { RealmorLoading } from '../components/common/RealmorLoading';
import { SheetDiceRoller } from '../components/character/sheet/SheetDiceRoller';

export const CharacterSheet = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: charIdFromParams } = useParams();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('geral');
  const [editingAttr, setEditingAttr] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingChar, setIsLoadingChar] = useState(!!charIdFromParams);
  const [charId, setCharId] = useState<string | null>(charIdFromParams || null);

  const [editingAtk, setEditingAtk] = useState<string | null>(null);
  const [editingSpell, setEditingSpell] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // Estado Centralizado - Apenas dados manuais
  const [char, setChar] = useState<T20Character>({
    name: 'Eldryn',
    level: 3,
    classId: 'arcanista',
    currentPV: 18,
    currentPM: 27,
    attributes: { FOR: 8, DES: 12, CON: 14, INT: 28, SAB: 12, CAR: 20 },
    attrBonus: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
    skills: {
      misticismo: { trained: true, extra: 2, others: 0 },
      vontade: { trained: true, extra: 0, others: 0 },
    } as Record<string, { trained: boolean; extra: number; others: number; attrOverride?: string }>,
    attacks: [
      { id: '1', name: 'Raio Arcano', attr: 'INT', damage: '2d6', crit: 'x2', type: 'Energia' }
    ],
    inventory: [
      { id: '1', name: 'Grimório Gasto', weight: 1, type: 'item', equipped: false },
      { id: '2', name: 'Poção de Mana', weight: 0.5, type: 'consumable', equipped: false },
    ],
    spells: [
      { id: '1', name: 'Seta Infalível de Talude', level: 1, cost: 1, school: 'Evocação' },
      { id: '2', name: 'Armadura Arcana', level: 1, cost: 1, school: 'Abjuração' },
    ],
    abilities: [
      { id: '1', name: 'Caminho do Arcanista (Mago)', type: 'Classe' },
      { id: '2', name: 'Foco em Arma', type: 'Poder' },
    ],
    notes: 'Eldryn busca o conhecimento perdido de Galrasia.',
    money: 170
  });

  // Carregar personagem do Firestore
  useEffect(() => {
    if (charId) {
      setIsLoadingChar(true);
      const unsubscribe = CharacterService.subscribeToCharacter(charId, (loadedChar) => {
        setChar(loadedChar);
        setIsLoadingChar(false);
      });
      return () => unsubscribe();
    }
  }, [charId]);

  // Salvar personagem
  const saveCharacter = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (charId) {
        await CharacterService.updateCharacter(charId, char);
      } else {
        const newId = await CharacterService.createCharacter(user.uid, char);
        setCharId(newId);
        navigate(`/characters/${newId}`, { replace: true });
      }
    } catch (error) {
      console.error("Erro ao salvar personagem:", error);
    } finally {
      setIsSaving(false);
    }
  }, [char, charId, user, navigate]);

  // Auto-save com debounce
  useEffect(() => {
    if (!user || !charId) return;
    const timer = setTimeout(() => {
      saveCharacter();
    }, 5000); // 5 segundos de inatividade
    return () => clearTimeout(timer);
  }, [char, charId, user, saveCharacter]);

  useEffect(() => {
    const state = location.state as { selectedClass?: string };
    if (state?.selectedClass && T20_CLASSES[state.selectedClass as keyof typeof T20_CLASSES]) {
      setChar(prev => ({ ...prev, classId: state.selectedClass! }));
    }
  }, [location.state]);

  // Cálculos Automáticos Derivados
  const derived = useMemo(() => {
    const charClass = T20_CLASSES[char.classId as keyof typeof T20_CLASSES] || T20_CLASSES.arcanista;
    
    const mods: any = {};
    Object.entries(char.attributes).forEach(([key, val]) => {
      mods[key] = T20Engine.getMod(val + (char.attrBonus[key as keyof typeof char.attrBonus] || 0));
    });

    const halfLevel = T20Engine.getHalfLevel(char.level);
    const maxPV = T20Engine.calculateMaxPV(char, charClass);
    const maxPM = T20Engine.calculateMaxPM(char, charClass);

    const skillsCalculated = T20_SKILLS.reduce((acc, skill) => {
      acc[skill.id] = T20Engine.calculateSkill(char, skill.id, skill.attr);
      return acc;
    }, {} as Record<string, any>);

    return {
      mods,
      halfLevel,
      maxPV,
      maxPM,
      skillsCalculated,
      defense: T20Engine.calculateDefense(char, char.inventory),
      spellDC: T20Engine.calculateSpellDC(char, charClass.mainAttr || 'INT'),
      loadLimit: T20Engine.calculateLoadLimit(char),
      currentLoad: char.inventory.reduce((acc, item) => acc + (item.weight || 0), 0)
    };
  }, [char]);

  const handleClassSelect = (classId: string) => {
    const classData = T20_CLASSES_DETAILED.find(c => c.id === classId);
    if (!classData) return;

    setChar(prev => {
      // Configurar PV/PM iniciais baseados na classe
      const charClass = T20_CLASSES[classId as keyof typeof T20_CLASSES];
      const conMod = T20Engine.getMod(prev.attributes.CON + (prev.attrBonus.CON || 0));
      const initialPV = charClass ? charClass.pvBase + conMod : prev.currentPV;
      
      const mainAttr = charClass?.mainAttr as keyof typeof prev.attributes;
      const initialPM = charClass ? charClass.pmBase : prev.currentPM;

      // Adicionar habilidades iniciais
      const initialAbilities = classData.abilities
        .filter(a => a.level === 1)
        .map(a => ({
          id: Math.random().toString(36).substr(2, 9),
          name: a.name,
          type: 'Classe'
        }));

      return {
        ...prev,
        classId,
        currentPV: initialPV,
        currentPM: initialPM,
        abilities: [
          ...prev.abilities.filter(a => a.type !== 'Classe'), // Remove habilidades de classe antigas
          ...initialAbilities
        ]
      };
    });
    setIsClassModalOpen(false);
  };

  const updateAttribute = (key: string, val: number) => {
    setChar(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: val }
    }));
  };

  const updateAttributeBonus = (key: string, val: number) => {
    setChar(prev => ({
      ...prev,
      attrBonus: { ...prev.attrBonus, [key]: val }
    }));
  };

  const updateResource = (key: 'currentPV' | 'currentPM', val: number) => {
    const max = key === 'currentPV' ? derived.maxPV : derived.maxPM;
    const newVal = Math.max(0, Math.min(max, val));
    setChar(prev => ({ ...prev, [key]: newVal }));
  };

  const addAttack = () => {
    const newAtk = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Ataque',
      attr: 'FOR',
      damage: '1d6',
      crit: 'x2',
      type: 'Corte'
    };
    setChar(prev => ({ ...prev, attacks: [...prev.attacks, newAtk] }));
    setEditingAtk(newAtk.id);
  };

  const updateAttack = (id: string, updates: any) => {
    setChar(prev => ({
      ...prev,
      attacks: prev.attacks.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const removeAttack = (id: string) => {
    setChar(prev => ({ ...prev, attacks: prev.attacks.filter(a => a.id !== id) }));
    if (editingAtk === id) setEditingAtk(null);
  };

  const addSpell = () => {
    const newSpell = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nova Magia',
      level: 1,
      cost: 1,
      school: 'Universal'
    };
    setChar(prev => ({ ...prev, spells: [...prev.spells, newSpell] }));
    setEditingSpell(newSpell.id);
  };

  const updateSpell = (id: string, updates: any) => {
    setChar(prev => ({
      ...prev,
      spells: prev.spells.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const removeSpell = (id: string) => {
    setChar(prev => ({ ...prev, spells: prev.spells.filter(s => s.id !== id) }));
    if (editingSpell === id) setEditingSpell(null);
  };

  const [editingAbility, setEditingAbility] = useState<string | null>(null);

  const addAbility = () => {
    const newAbility = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nova Habilidade',
      type: 'Poder'
    };
    setChar(prev => ({ ...prev, abilities: [...prev.abilities, newAbility] }));
    setEditingAbility(newAbility.id);
  };

  const updateAbility = (id: string, updates: any) => {
    setChar(prev => ({
      ...prev,
      abilities: prev.abilities.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const removeAbility = (id: string) => {
    setChar(prev => ({ ...prev, abilities: prev.abilities.filter(a => a.id !== id) }));
  };

  const addItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Item',
      weight: 1,
      type: 'item',
      equipped: false
    };
    setChar(prev => ({ ...prev, inventory: [...prev.inventory, newItem] }));
    setEditingItem(newItem.id);
  };

  const updateItem = (id: string, updates: any) => {
    setChar(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  };

  const removeItem = (id: string) => {
    setChar(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== id) }));
    if (editingItem === id) setEditingItem(null);
  };

  const toggleItemEquip = (id: string) => {
    setChar(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => 
        item.id === id ? { ...item, equipped: !item.equipped } : item
      )
    }));
  };

  const toggleSkill = (id: string) => {
    setChar(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [id]: { 
          trained: !prev.skills[id]?.trained, 
          extra: prev.skills[id]?.extra || 0, 
          others: prev.skills[id]?.others || 0 
        }
      }
    }));
  };

  const updateSkillBonus = (id: string, field: 'extra' | 'others', val: number) => {
    setChar(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [id]: { 
          ...prev.skills[id], 
          [field]: val 
        }
      }
    }));
  };

  const renderGeral = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Grid de Atributos Editáveis */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
        {Object.entries(char.attributes).map(([key, val]) => (
          <div 
            key={key} 
            onClick={() => setEditingAttr(editingAttr === key ? null : key)}
            className={`glass-card p-3 sm:p-5 flex flex-col items-center transition-all cursor-pointer relative overflow-hidden ${editingAttr === key ? 'border-gold ring-2 ring-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-gold/10 hover:border-gold/40'}`}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            <span className="text-[8px] sm:text-[10px] uppercase text-gold/40 font-bold tracking-[0.1em] sm:tracking-[0.3em] mb-1">{key}</span>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-2xl sm:text-4xl font-medieval text-gold-gradient drop-shadow-md">{val}</span>
              {char.attrBonus[key as keyof typeof char.attrBonus] !== 0 && (
                <span className="text-xs sm:text-sm text-success font-bold">+{char.attrBonus[key as keyof typeof char.attrBonus]}</span>
              )}
            </div>
            <div className="mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-gold/10 rounded-sm border border-gold/20 text-[10px] sm:text-xs font-bold text-gold font-cinzel">
              MOD {derived.mods[key] >= 0 ? `+${derived.mods[key]}` : derived.mods[key]}
            </div>
            
            {editingAttr === key && (
              <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5 animate-in slide-in-from-top-4 duration-300 w-full pt-3 sm:pt-4 border-t border-gold/10" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <span className="text-[8px] sm:text-[9px] uppercase text-gold/40 font-bold tracking-widest">Valor Base</span>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <button onClick={() => updateAttribute(key, (val as number) - 1)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-mythos-bg flex items-center justify-center border-2 border-gold/30 text-gold hover:bg-gold/10 transition-colors font-bold">-</button>
                    <span className="font-medieval text-xl sm:text-2xl text-gold">{val}</span>
                    <button onClick={() => updateAttribute(key, (val as number) + 1)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-mythos-bg flex items-center justify-center border-2 border-gold/30 text-gold hover:bg-gold/10 transition-colors font-bold">+</button>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gold/10">
                  <span className="text-[8px] sm:text-[9px] uppercase text-gold/40 font-bold tracking-widest">Bônus Extra</span>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <button onClick={() => updateAttributeBonus(key, (char.attrBonus[key as keyof typeof char.attrBonus] || 0) - 1)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-sm bg-mythos-bg flex items-center justify-center border-2 border-gold/30 text-gold hover:bg-gold/10 transition-colors text-xs sm:text-sm font-bold">-</button>
                    <span className="font-medieval text-base sm:text-lg text-gold">{char.attrBonus[key as keyof typeof char.attrBonus] || 0}</span>
                    <button onClick={() => updateAttributeBonus(key, (char.attrBonus[key as keyof typeof char.attrBonus] || 0) + 1)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-sm bg-mythos-bg flex items-center justify-center border-2 border-gold/30 text-gold hover:bg-gold/10 transition-colors text-xs sm:text-sm font-bold">+</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Card title="Identidade do Herói" icon={User}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gold/40 font-bold tracking-widest">Nome do Herói</label>
              <input 
                value={char.name} 
                onChange={e => setChar({...char, name: e.target.value})}
                className="w-full bg-black/40 border-2 border-gold/10 rounded-sm px-3 py-2 text-sm text-gold focus:border-gold/40 outline-none font-cinzel transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gold/40 font-bold tracking-widest">Nível de Poder</label>
              <input 
                type="number"
                value={char.level} 
                onChange={e => setChar({...char, level: parseInt(e.target.value) || 1})}
                className="w-full bg-black/40 border-2 border-gold/10 rounded-sm px-3 py-2 text-sm text-gold focus:border-gold/40 outline-none font-medieval transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-gold/40 font-bold tracking-widest">Classe de Aventura</label>
            <div 
              onClick={() => setIsClassModalOpen(true)}
              className="w-full bg-black/40 border-2 border-gold/10 rounded-sm px-3 py-2 text-sm text-gold hover:border-gold/40 cursor-pointer flex justify-between items-center font-cinzel transition-colors"
            >
              <span>{T20_CLASSES[char.classId as keyof typeof T20_CLASSES]?.name || 'Selecionar Classe'}</span>
              <BookOpen size={16} className="text-gold/40" />
            </div>
          </div>
        </div>
      </Card>

      <ClassPickerModal 
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSelect={handleClassSelect}
        currentClassId={char.classId}
      />
    </div>
  );

  const renderCombate = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6 text-center border-2 border-gold/20 shadow-[0_5px_15px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5"><Shield size={60} /></div>
          <Shield className="mx-auto mb-2 text-gold" size={24} />
          <p className="text-[10px] uppercase text-gold/40 font-bold tracking-widest">Defesa Total</p>
          <p className="text-4xl font-medieval text-gold-gradient drop-shadow-md">{derived.defense}</p>
        </div>
        <div className="glass-card p-6 text-center border-2 border-magic/20 shadow-[0_5px_15px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5"><Wand2 size={60} /></div>
          <Wand2 className="mx-auto mb-2 text-magic" size={24} />
          <p className="text-[10px] uppercase text-magic/40 font-bold tracking-widest">CD de Magia</p>
          <p className="text-4xl font-medieval text-magic drop-shadow-md" style={{ color: '#4DA3FF' }}>{derived.spellDC}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center border-b-2 border-gold/10 pb-2">
          <h3 className="font-cinzel text-2xl text-gold-gradient">Ataques & Armas</h3>
          <Button variant="ghost" size="sm" icon={Plus} onClick={addAttack}>Novo Ataque</Button>
        </div>
        
        <div className="space-y-4">
          {char.attacks.map(atk => (
            <div key={atk.id} className={`glass-card p-5 transition-all group relative overflow-hidden ${editingAtk === atk.id ? 'border-gold ring-2 ring-gold/30' : 'border-gold/10 hover:border-gold/30'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {editingAtk === atk.id ? (
                    <input 
                      value={atk.name}
                      onChange={e => updateAttack(atk.id, { name: e.target.value })}
                      className="bg-black/40 border-2 border-gold/20 rounded-sm px-3 py-1.5 text-sm text-gold outline-none w-full mb-2 font-cinzel"
                      autoFocus
                    />
                  ) : (
                    <h4 className="font-cinzel text-xl text-gold group-hover:text-yellow-200 transition-colors">{atk.name}</h4>
                  )}
                  <p className="text-[10px] text-gold/40 uppercase font-bold tracking-widest">{atk.type} • Base {atk.attr}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setEditingAtk(editingAtk === atk.id ? null : atk.id)}
                    className={`p-2 rounded-sm transition-all ${editingAtk === atk.id ? 'bg-gold text-mythos-bg' : 'text-gold/40 hover:text-gold hover:bg-gold/10'}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => removeAttack(atk.id)} className="p-2 text-gold/40 hover:text-health hover:bg-health/10 rounded-sm transition-all"><Trash2 size={16} /></button>
                </div>
              </div>

              {editingAtk === atk.id ? (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gold/10">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase text-gold/40 font-bold tracking-widest">Dano</label>
                    <input value={atk.damage} onChange={e => updateAttack(atk.id, { damage: e.target.value })} className="w-full bg-black/20 border-2 border-gold/10 rounded-sm px-3 py-1.5 text-xs text-gold font-medieval" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase text-gold/40 font-bold tracking-widest">Crítico</label>
                    <input value={atk.crit} onChange={e => updateAttack(atk.id, { crit: e.target.value })} className="w-full bg-black/20 border-2 border-gold/10 rounded-sm px-3 py-1.5 text-xs text-gold font-medieval" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-black/40 p-3 rounded-sm border border-gold/10 shadow-inner">
                    <p className="text-[9px] uppercase text-gold/40 font-bold tracking-widest mb-1">Acerto</p>
                    <p className="font-medieval text-xl text-gold">+{derived.mods[atk.attr] + derived.halfLevel}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-sm border border-gold/10 shadow-inner">
                    <p className="text-[9px] uppercase text-gold/40 font-bold tracking-widest mb-1">Dano</p>
                    <p className="font-medieval text-xl text-gold">{atk.damage}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-sm border border-gold/10 shadow-inner">
                    <p className="text-[9px] uppercase text-gold/40 font-bold tracking-widest mb-1">Crítico</p>
                    <p className="font-medieval text-xl text-gold">{atk.crit}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPoderes = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl text-gold">Habilidades</h3>
          <Button variant="ghost" size="sm" icon={Plus} onClick={addAbility}>Nova Habilidade</Button>
        </div>
        <div className="grid gap-3">
          {char.abilities.map(ability => (
            <div key={ability.id} className={`glass-card p-3 transition-all group ${editingAbility === ability.id ? 'border-gold ring-1 ring-gold/50' : 'border-gold/5 hover:border-gold/20'}`}>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  {editingAbility === ability.id ? (
                    <input 
                      value={ability.name}
                      onChange={e => updateAbility(ability.id, { name: e.target.value })}
                      className="bg-black/40 border border-gold/20 rounded px-2 py-1 text-sm text-gold outline-none w-full mb-1"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-slate-200 font-bold">{ability.name}</p>
                  )}
                  <p className="text-[9px] text-slate-500 uppercase font-bold">{ability.type}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingAbility(editingAbility === ability.id ? null : ability.id)}
                    className={`p-1 transition-colors ${editingAbility === ability.id ? 'text-gold' : 'text-slate-500 hover:text-gold'}`}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => removeAbility(ability.id)} className="p-1 text-slate-500 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
              {editingAbility === ability.id && (
                <div className="mt-2">
                  <select 
                    value={ability.type}
                    onChange={e => updateAbility(ability.id, { type: e.target.value })}
                    className="w-full bg-black/20 border border-gold/10 rounded px-2 py-1 text-xs text-gold outline-none"
                  >
                    <option value="Classe">Classe</option>
                    <option value="Raça">Raça</option>
                    <option value="Poder">Poder</option>
                    <option value="Origem">Origem</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl text-gold">Grimório</h3>
          <Button variant="ghost" size="sm" icon={Plus} onClick={addSpell}>Nova Magia</Button>
        </div>

        <div className="space-y-4">
          {char.spells.map(spell => (
            <div key={spell.id} className={`glass-card p-4 transition-all group ${editingSpell === spell.id ? 'border-gold ring-1 ring-gold/50' : 'border-gold/5 hover:border-gold/20'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Wand2 size={20} />
                  </div>
                  <div className="flex-1">
                    {editingSpell === spell.id ? (
                      <input 
                        value={spell.name}
                        onChange={e => updateSpell(spell.id, { name: e.target.value })}
                        className="bg-black/40 border border-gold/20 rounded px-2 py-1 text-sm text-gold outline-none w-full mb-1"
                        autoFocus
                      />
                    ) : (
                      <h4 className="font-serif text-lg text-slate-200">{spell.name}</h4>
                    )}
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{spell.school} • Custo {spell.cost} PM</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingSpell(editingSpell === spell.id ? null : spell.id)}
                    className={`p-1 transition-colors ${editingSpell === spell.id ? 'text-gold' : 'text-slate-500 hover:text-gold'}`}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => removeSpell(spell.id)} className="p-1 text-slate-500 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
              {editingSpell === spell.id && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500">Custo (PM)</label>
                    <input type="number" value={spell.cost} onChange={e => updateSpell(spell.id, { cost: parseInt(e.target.value) || 1 })} className="w-full bg-black/20 border border-gold/10 rounded px-2 py-1 text-xs text-gold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500">Escola</label>
                    <input value={spell.school} onChange={e => updateSpell(spell.id, { school: e.target.value })} className="w-full bg-black/20 border border-gold/10 rounded px-2 py-1 text-xs text-gold" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderItens = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] uppercase text-slate-500 font-bold">Carga</p>
          <p className="text-xl font-serif text-gold">{derived.currentLoad} / {derived.loadLimit}</p>
          <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${derived.currentLoad > derived.loadLimit ? 'bg-rose-500' : 'bg-gold'}`}
              style={{ width: `${Math.min(100, (derived.currentLoad / derived.loadLimit) * 100)}%` }}
            />
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] uppercase text-slate-500 font-bold">Tibares</p>
          <p className="text-xl font-serif text-gold">T$ {char.money}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl text-gold">Inventário</h3>
          <Button variant="ghost" size="sm" icon={Plus} onClick={addItem}>Novo Item</Button>
        </div>

        {char.inventory.map(item => (
          <div key={item.id} className={`glass-card p-3 transition-all group ${editingItem === item.id ? 'border-gold ring-1 ring-gold/50' : 'border-gold/5 hover:border-gold/20'}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 flex-1">
                <button 
                  onClick={() => toggleItemEquip(item.id)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.equipped ? 'bg-gold border-gold text-obsidian' : 'border-slate-700 text-slate-700'}`}
                >
                  {item.equipped && <Shield size={12} />}
                </button>
                <div className="flex-1">
                  {editingItem === item.id ? (
                    <input 
                      value={item.name}
                      onChange={e => updateItem(item.id, { name: e.target.value })}
                      className="bg-black/40 border border-gold/20 rounded px-2 py-1 text-sm text-gold outline-none w-full mb-1"
                      autoFocus
                    />
                  ) : (
                    <p className={`text-sm ${item.equipped ? 'text-gold font-bold' : 'text-slate-300'}`}>{item.name}</p>
                  )}
                  <p className="text-[9px] text-slate-500 uppercase font-bold">{item.weight} kg • {item.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                  className={`p-1 transition-colors ${editingItem === item.id ? 'text-gold' : 'text-slate-500 hover:text-gold'}`}
                >
                  <Edit3 size={14} />
                </button>
                <button onClick={() => removeItem(item.id)} className="p-1 text-slate-500 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>
            {editingItem === item.id && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-500">Peso (kg)</label>
                  <input type="number" step="0.1" value={item.weight} onChange={e => updateItem(item.id, { weight: parseFloat(e.target.value) || 0 })} className="w-full bg-black/20 border border-gold/10 rounded px-2 py-1 text-xs text-gold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-500">Tipo</label>
                  <input value={item.type} onChange={e => updateItem(item.id, { type: e.target.value })} className="w-full bg-black/20 border border-gold/10 rounded px-2 py-1 text-xs text-gold" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotas = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h3 className="font-serif text-xl text-gold">Anotações</h3>
      <textarea 
        value={char.notes}
        onChange={e => setChar({...char, notes: e.target.value})}
        className="w-full h-64 bg-black/20 border border-gold/10 rounded-xl p-4 text-slate-300 focus:border-gold outline-none font-serif resize-none"
        placeholder="Escreva aqui sua história, objetivos ou notas de sessão..."
      />
    </div>
  );

  const [editingSkill, setEditingSkill] = useState<string | null>(null);

  const renderPericias = () => (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6 px-2 border-b border-gold/10 pb-3">
        <p className="text-xs text-gold/40 italic font-medium">Toque na runa para treinar • Clique no card para bônus</p>
        <span className="text-[10px] bg-gold/10 text-gold px-3 py-1 rounded-sm border border-gold/20 font-bold tracking-widest">1/2 Nível: +{derived.halfLevel}</span>
      </div>
      <div className="grid gap-3">
        {T20_SKILLS.map(skill => {
          const skillCalc = derived.skillsCalculated[skill.id];
          const isTrained = char.skills[skill.id]?.trained;
          
          return (
            <div key={skill.id} className="space-y-0">
              <div 
                onClick={() => setEditingSkill(editingSkill === skill.id ? null : skill.id)}
                className={`flex justify-between items-center p-4 rounded-sm border-2 transition-all cursor-pointer group relative overflow-hidden ${isTrained ? 'bg-gold/5 border-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'bg-black/20 border-gold/5 hover:border-gold/20'}`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleSkill(skill.id); }}
                    className={`w-6 h-6 rounded-sm border-2 transition-all flex items-center justify-center ${isTrained ? 'bg-gold border-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'border-gold/20 hover:border-gold/50'}`} 
                  >
                    {isTrained && <div className="w-2 h-2 bg-mythos-bg rounded-full animate-pulse" />}
                  </div>
                  <div>
                    <p className={`text-base font-cinzel tracking-wide ${isTrained ? 'text-gold font-bold' : 'text-mythos-text/60'}`}>{skill.name}</p>
                    <p className="text-[9px] uppercase text-gold/30 font-bold tracking-[0.2em]">{skill.attr} {skillCalc.attrMod >= 0 ? `+${skillCalc.attrMod}` : skillCalc.attrMod}</p>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <span className={`text-3xl font-medieval ${isTrained ? 'text-gold-gradient drop-shadow-md' : 'text-gold/20'}`}>+{skillCalc.total}</span>
                </div>
              </div>
              
              {editingSkill === skill.id && (
                <div className="glass-card p-5 mx-2 mt-[-4px] pt-6 rounded-t-none border-t-0 grid grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-300 relative z-0 border-2 border-gold/20 bg-mythos-card/95">
                  <div className="space-y-2 text-center">
                    <label className="text-[9px] uppercase text-gold/40 font-bold tracking-widest">Treino</label>
                    <div className="text-lg text-gold font-medieval">+{skillCalc.trainingBonus}</div>
                  </div>
                  <div className="space-y-2 text-center">
                    <label className="text-[9px] uppercase text-gold/40 font-bold tracking-widest">Extra</label>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => updateSkillBonus(skill.id, 'extra', (char.skills[skill.id]?.extra || 0) - 1)} className="w-6 h-6 rounded-sm bg-gold/10 border border-gold/30 text-gold font-bold">-</button>
                      <span className="text-sm w-4 text-center font-medieval text-gold">{char.skills[skill.id]?.extra || 0}</span>
                      <button onClick={() => updateSkillBonus(skill.id, 'extra', (char.skills[skill.id]?.extra || 0) + 1)} className="w-6 h-6 rounded-sm bg-gold/10 border border-gold/30 text-gold font-bold">+</button>
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <label className="text-[9px] uppercase text-gold/40 font-bold tracking-widest">Outros</label>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => updateSkillBonus(skill.id, 'others', (char.skills[skill.id]?.others || 0) - 1)} className="w-6 h-6 rounded-sm bg-gold/10 border border-gold/30 text-gold font-bold">-</button>
                      <span className="text-sm w-4 text-center font-medieval text-gold">{char.skills[skill.id]?.others || 0}</span>
                      <button onClick={() => updateSkillBonus(skill.id, 'others', (char.skills[skill.id]?.others || 0) + 1)} className="w-6 h-6 rounded-sm bg-gold/10 border border-gold/30 text-gold font-bold">+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const tabs = [
    { id: 'geral', label: 'Geral', icon: User },
    { id: 'combate', label: 'Combate', icon: Sword },
    { id: 'pericias', label: 'Perícias', icon: ScrollText },
    { id: 'poderes', label: 'Poderes', icon: Wand2 },
    { id: 'itens', label: 'Itens', icon: Backpack },
    { id: 'notas', label: 'Notas', icon: ScrollText },
  ];

  if (isLoadingChar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 animate-in fade-in duration-300">
        <RealmorLoading message="Invocando ficha do plano espiritual..." subtitle="Sincronizando atributos e magias" size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-32 px-3 sm:px-4 pt-4 space-y-6 sm:space-y-8 max-w-2xl mx-auto overflow-x-hidden">
      {/* HUD de Status Rápido */}
      <div className="glass-card p-4 sm:p-6 medieval-border space-y-4 sm:space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-gold/10 pb-3">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-cinzel text-gold-gradient leading-none truncate max-w-[180px] sm:max-w-none">{char.name}</h2>
            {user && (
              <button 
                onClick={saveCharacter}
                disabled={isSaving}
                className={`p-1 sm:p-1.5 rounded-sm transition-all ${isSaving ? 'text-gold/20' : 'text-gold/40 hover:text-gold hover:bg-gold/10'}`}
                title="Salvar Manualmente"
              >
                {isSaving ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> : <Save size={14} className="sm:w-4 sm:h-4" />}
              </button>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] bg-mythos-bg px-2 sm:px-3 py-0.5 sm:py-1 rounded-sm border-2 border-gold/30 text-gold uppercase font-bold tracking-[0.1em] sm:tracking-[0.2em] self-start sm:self-auto">Nível {char.level}</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] sm:text-[10px] uppercase font-bold text-health tracking-[0.1em] sm:tracking-[0.2em]">
              <span>Pontos de Vida</span>
              <span>{char.currentPV} / {derived.maxPV}</span>
            </div>
            <div className="h-2.5 sm:h-3 bg-black/50 rounded-sm overflow-hidden border border-health/30 flex items-center p-[1px] sm:p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-health to-red-900 transition-all duration-500 rounded-sm shadow-[0_0_10px_rgba(192,57,43,0.4)]" 
                style={{ width: `${Math.min(100, Math.max(0, (char.currentPV / derived.maxPV) * 100))}%` }}
              />
            </div>
            <div className="flex justify-center gap-3 mt-1 sm:mt-2">
              <button onClick={() => updateResource('currentPV', char.currentPV - 1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-health/10 border border-health/30 text-health hover:bg-health/20 transition-colors font-bold text-sm sm:text-base">-</button>
              <button onClick={() => updateResource('currentPV', char.currentPV + 1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-health/10 border border-health/30 text-health hover:bg-health/20 transition-colors font-bold text-sm sm:text-base">+</button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] sm:text-[10px] uppercase font-bold text-magic tracking-[0.1em] sm:tracking-[0.2em]">
              <span>Pontos de Mana</span>
              <span>{char.currentPM} / {derived.maxPM}</span>
            </div>
            <div className="h-2.5 sm:h-3 bg-black/50 rounded-sm overflow-hidden border border-magic/30 flex items-center p-[1px] sm:p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-magic to-blue-900 transition-all duration-500 rounded-sm shadow-[0_0_10px_rgba(77,163,255,0.4)]" 
                style={{ width: `${Math.min(100, Math.max(0, (char.currentPM / derived.maxPM) * 100))}%` }}
              />
            </div>
            <div className="flex justify-center gap-3 mt-1 sm:mt-2">
              <button onClick={() => updateResource('currentPM', char.currentPM - 1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-magic/10 border border-magic/30 text-magic hover:bg-magic/20 transition-colors font-bold text-sm sm:text-base">-</button>
              <button onClick={() => updateResource('currentPM', char.currentPM + 1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-magic/10 border border-magic/30 text-magic hover:bg-magic/20 transition-colors font-bold text-sm sm:text-base">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="flex-1">
        {activeTab === 'geral' && renderGeral()}
        {activeTab === 'combate' && renderCombate()}
        {activeTab === 'pericias' && renderPericias()}
        {activeTab === 'poderes' && renderPoderes()}
        {activeTab === 'itens' && renderItens()}
        {activeTab === 'notas' && renderNotas()}
      </div>

      {/* Menu Inferior Nativo */}
      <nav className="fixed bottom-0 left-0 right-0 lg:left-72 bg-mythos-card/95 backdrop-blur-xl border-t-2 border-gold/30 flex justify-around items-center px-1 sm:px-2 py-3 sm:py-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-12 sm:w-16 transition-all duration-500 ${
              activeTab === tab.id 
                ? 'text-gold scale-110 -translate-y-1 sm:-translate-y-2' 
                : 'text-gold/30 hover:text-gold/60'
            }`}
          >
            <div className={`p-1.5 sm:p-2 rounded-sm transition-all relative ${activeTab === tab.id ? 'bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : ''}`}>
              {activeTab === tab.id && (
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-gold" />
              )}
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-gold" />
              )}
              <tab.icon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className={`text-[8px] sm:text-[9px] mt-1 sm:mt-2 font-bold uppercase tracking-tighter sm:tracking-widest font-cinzel ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Rolador de Dados 3D Flutuante */}
      <SheetDiceRoller />
    </div>
  );
};

