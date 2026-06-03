import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { RPGBackground } from '../components/RPGBackground';
import { 
  db, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  addDoc
} from '../firebase/firestore';
import { 
  Sword, 
  Key, 
  Compass, 
  X, 
  ChevronLeft,
  Users,
  Ghost,
  ShieldCheck,
  BookOpen,
  LogOut,
  MapPin,
  Clock,
  Activity,
  UserCheck,
  Flame,
  Dices,
  Copy,
  ChevronRight,
  Shield,
  Save,
  MessageSquare,
  Sparkles,
  Heart,
  Settings,
  User as UserIcon,
  Trash2,
  Plus,
  Scroll,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Campaign {
  id: string;
  masterId: string;
  name: string;
  subtitle?: string;
  system: string;
  edition?: string;
  campaignType: string;
  status: string;
  era: string;
  mainLocation: string;
  tone: string;
  lethality: string;
  summary: string;
  coverUrl?: string;
}

interface Room {
  id: string;
  masterId: string;
  campaignId: string;
  campaignName: string;
  roomName: string;
  entryCode: string;
  maxPlayers: number;
  currentPlayers: number;
  privacy: string;
  allowJoin: boolean;
  status: string;
  notes: string;
  coverUrl?: string;
  system?: string;
  createdAt: any;
}

interface Participant {
  userId: string;
  displayName: string;
  email: string;
  joinedAt: any;
  role: 'player';
  // Character Dossier
  characterName?: string;
  characterClass?: string;
  sanity?: number;
  health?: number;
  skills?: string;
  backstory?: string;
  cocSheet?: any;
}

interface DiceRoll {
  id: string;
  rollerName: string;
  sides: number;
  result: number;
  rolledAt: any;
}

export const NewPlayerPage: React.FC = () => {
  const { clearProfile } = useProfile();
  const { user, profile, logout } = useAuth();
  const { withLoading, showLoader, hideLoader } = useLoading();
  const navigate = useNavigate();

  const handleBackToSelection = () => {
    clearProfile();
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('activeProfile');
    localStorage.removeItem('userMode');
    sessionStorage.removeItem('selectedProfile');
    sessionStorage.removeItem('activeProfile');
    sessionStorage.removeItem('userMode');
    navigate('/select-profile');
  };

  // Active view: null (menu), 'join' (form to enter room), 'list' (list of joined rooms)
  const [activeAction, setActiveAction] = useState<'join' | 'list' | null>(null);

  // Active room cockpit session
  const [activeSessionRoomId, setActiveSessionRoomId] = useState<string | null>(null);

  // Inputs
  const [entryCodeInput, setEntryCodeInput] = useState('');

  // Lists
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [loadingJoinedRooms, setLoadingJoinedRooms] = useState(false);
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // Active game session sync states
  const [activeCampDetails, setActiveCampDetails] = useState<Campaign | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<Participant[]>([]);
  const [recentRolls, setRecentRolls] = useState<DiceRoll[]>([]);
  const [rollingDice, setRollingDice] = useState<number | null>(null);
  const [lastRollResult, setLastRollResult] = useState<number | null>(null);

  // Character Dossier States
  const [characterName, setCharacterName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [health, setHealth] = useState(15);
  const [sanity, setSanity] = useState(70);
  const [skills, setSkills] = useState('');
  const [backstory, setBackstory] = useState('');
  const [savingSheet, setSavingSheet] = useState(false);

  // Call of Cthulhu Full Character Sheet State
  const [cocSheet, setCocSheet] = useState<any>(null);
  const [sheetTab, setSheetTab] = useState<'summary' | 'attributes' | 'skills' | 'combat' | 'sanity' | 'backstory' | 'inventory' | 'resources' | 'companions' | 'references'>('summary');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'idle'>('idle');
  const lastSavedJsonRef = useRef<string>('');

  // Skill testing states
  const [testingSkill, setTestingSkill] = useState<{ name: string; value: number } | null>(null);
  const [rollTestResult, setRollTestResult] = useState<{
    roll: number;
    successGrade: 'Sucesso Crítico' | 'Sucesso Extremo' | 'Sucesso Difícil' | 'Sucesso Regular' | 'Fracasso' | 'Desastre';
    description: string;
  } | null>(null);

  // Quick state inputs for custom thematic cards & items
  const [newPhobiaText, setNewPhobiaText] = useState('');
  const [newManiaText, setNewManiaText] = useState('');
  const [newTraumaText, setNewTraumaText] = useState('');
  const [newQuickItemName, setNewQuickItemName] = useState('');
  const [newQuickItemIcon, setNewQuickItemIcon] = useState('📖');

  const getInitialCoCSheet = () => ({
    age: '28',
    gender: 'Masc/Fem',
    residence: 'Arkham',
    birthplace: 'Boston',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    luck: 50,
    maxLuck: 99,
    magic: 10,
    maxMagic: 15,
    moveRate: 8,
    maxHealth: 15,
    maxSanity: 99,
    attributes: {
      FOR: 50,
      CON: 50,
      TAM: 50,
      DES: 50,
      APA: 50,
      INT: 50,
      POD: 50,
      EDU: 50,
    },
    skills: {
      "Antropologia": 1,
      "Armas de Fogo (Pistola)": 20,
      "Armas de Fogo (Fuzil/Escopeta)": 25,
      "Armas de Fogo (Submetralhadora)": 15,
      "Arqueologia": 1,
      "Arremessar": 20,
      "Arte e Ofício (Atuação)": 5,
      "Arte e Ofício (Desenho)": 5,
      "Arte e Ofício (Escrita)": 5,
      "Avaliação": 5,
      "Cavalgar": 5,
      "Charme": 15,
      "Chaveiro": 1,
      "Ciência (Química)": 1,
      "Ciência (Física)": 1,
      "Ciência (Biologia)": 1,
      "Consertos Elétricos": 10,
      "Consertos Mecânicos": 10,
      "Contabilidade": 5,
      "Demolição": 1,
      "Dirigir Automóvel": 20,
      "Disfarce": 5,
      "Encontrar": 25,
      "Escalar": 20,
      "Escutar": 25,
      "Esquiva": 25,
      "Hipnose": 1,
      "História": 5,
      "Intimidação": 15,
      "Lábia": 5,
      "Leitura Labial": 1,
      "Língua Estrangeira": 1,
      "Medicina": 1,
      "Mitos de Cthulhu": 0,
      "Natação": 20,
      "Naturalismo": 10,
      "Navegação": 10,
      "Ocultismo": 5,
      "Operar Maquinário Pesado": 1,
      "Persuasão": 10,
      "Pilotar": 1,
      "Prestidigitação": 10,
      "Primeiros Socorros": 30,
      "Psicanálise": 1,
      "Psicologia": 10,
      "Rastrear": 10,
      "Sobrevivência": 10,
      "Treinar Animais": 5,
    },
    combat: {
      weapons: [
        { id: 'w-1', name: 'Revólver .38', damage: '1D10', range: '15m', attacks: '1', ammo: '6', malfunction: '100' }
      ],
      damageBonus: '0',
      build: '0',
    },
    sanity: {
      tempInsane: false,
      indefInsane: false,
      lossHistory: '',
      traumas: '',
      phobias: '',
      manias: '',
      encounters: '',
    },
    backstory: {
      personalDesc: '',
      ideology: '',
      significantPeople: '',
      meaningfulLocations: '',
      treasuredPossessions: '',
      traits: '',
      injuries: '',
      phobiasManias: '',
      arcaneTomes: '',
      spells: '',
      artifacts: '',
      strangeEncounters: '',
    },
    inventory: {
      equipment: '',
      possessions: '',
      items: '',
      notes: '',
      money: '',
      assets: '',
      spendingLevel: '',
    },
    companions: [
      { id: 'c-1', name: 'Thomas Malone', player: 'Mestre', relation: 'Informante policial' }
    ],
  });

  const setCoCField = (field: string, val: any) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return { ...next, [field]: val };
    });
  };

  const setCoCAttribute = (attr: string, val: number) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      const nextAttrs = { ...next.attributes, [attr]: val };
      
      let nextMaxMagic = next.maxMagic;
      let nextMagic = next.magic;
      let nextMaxSanity = next.maxSanity;

      if (attr === 'POD') {
        nextMaxMagic = Math.floor(val / 5);
        nextMagic = Math.min(next.magic, nextMaxMagic);
        nextMaxSanity = 99 - (next.skills?.["Mitos de Cthulhu"] || 0);
      }

      return {
        ...next,
        attributes: nextAttrs,
        maxMagic: nextMaxMagic,
        magic: nextMagic,
        maxSanity: nextMaxSanity
      };
    });
  };

  const setCoCSkill = (skill: string, val: number) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      const nextSkills = { ...next.skills, [skill]: val };
      let nextMaxSanity = next.maxSanity;

      if (skill === "Mitos de Cthulhu") {
        nextMaxSanity = 99 - val;
      }

      return {
        ...next,
        skills: nextSkills,
        maxSanity: nextMaxSanity
      };
    });
  };

  const setCoCCombat = (field: string, val: any) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        combat: { ...next.combat, [field]: val }
      };
    });
  };

  const setCoCSanityField = (field: string, val: any) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        sanity: { ...next.sanity, [field]: val }
      };
    });
  };

  const setCoCBackstoryField = (field: string, val: any) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        backstory: { ...next.backstory, [field]: val }
      };
    });
  };

  const setCoCInventoryField = (field: string, val: any) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        inventory: { ...next.inventory, [field]: val }
      };
    });
  };

  const addWeapon = () => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        combat: {
          ...next.combat,
          weapons: [
            ...next.combat.weapons,
            { id: 'w-' + Date.now(), name: 'Nova Arma', damage: '1D6', range: 'Cont.', attacks: '1', ammo: '-', malfunction: '100' }
          ]
        }
      };
    });
  };

  const updateWeapon = (id: string, field: string, val: string) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        combat: {
          ...next.combat,
          weapons: next.combat.weapons.map((w: any) => w.id === id ? { ...w, [field]: val } : w)
        }
      };
    });
  };

  const deleteWeapon = (id: string) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        combat: {
          ...next.combat,
          weapons: next.combat.weapons.filter((w: any) => w.id !== id)
        }
      };
    });
  };

  const addCompanion = () => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        companions: [
          ...next.companions,
          { id: 'c-' + Date.now(), name: 'Novo Investigador', player: 'Investigador', relation: 'Aliado' }
        ]
      };
    });
  };

  const updateCompanion = (id: string, field: string, val: string) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        companions: next.companions.map((c: any) => c.id === id ? { ...c, [field]: val } : c)
      };
    });
  };

  const deleteCompanion = (id: string) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      return {
        ...next,
        companions: next.companions.filter((c: any) => c.id !== id)
      };
    });
  };

  // Helper to add a timestamped string to the event log in the database
  const logEventVal = (category: string, delta: number) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const eventText = `${timeStr} - ${category} ${delta > 0 ? '+' : ''}${delta}`;
    
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      const currentLogs = next.eventLog || [];
      return {
        ...next,
        eventLog: [eventText, ...currentLogs].slice(0, 50) // Keep last 50
      };
    });
  };

  // Quick stat modifiers
  const changeHealth = (delta: number) => {
    setHealth(prev => {
      const nextVal = Math.max(0, Math.min(cocSheet?.maxHealth || 15, prev + delta));
      const realDelta = nextVal - prev;
      if (realDelta !== 0) {
        logEventVal('Vida', realDelta);
      }
      return nextVal;
    });
  };

  const changeSanity = (delta: number) => {
    setSanity(prev => {
      const nextVal = Math.max(0, Math.min(cocSheet?.maxSanity || 99, prev + delta));
      const realDelta = nextVal - prev;
      if (realDelta !== 0) {
        logEventVal('Sanidade', realDelta);
      }
      return nextVal;
    });
  };

  const changeLuck = (delta: number) => {
    const current = cocSheet?.luck || 50;
    const nextVal = Math.max(0, Math.min(cocSheet?.maxLuck || 99, current + delta));
    const realDelta = nextVal - current;
    if (realDelta !== 0) {
      setCoCField('luck', nextVal);
      logEventVal('Sorte', realDelta);
    }
  };

  const changeMagic = (delta: number) => {
    const current = cocSheet?.magic || 10;
    const nextVal = Math.max(0, Math.min(cocSheet?.maxMagic || 15, current + delta));
    const realDelta = nextVal - current;
    if (realDelta !== 0) {
      setCoCField('magic', nextVal);
      logEventVal('Magia', realDelta);
    }
  };

  // Thematic sanity cards addition & deletion
  const addThematicCard = (category: 'phobiasList' | 'maniasList' | 'traumasList', text: string) => {
    if (!text.trim()) return;
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      const nextSanity = next.sanity || {};
      const list = nextSanity[category] || [];
      return {
        ...next,
        sanity: {
          ...nextSanity,
          [category]: [...list, text.trim()]
        }
      };
    });
  };

  const deleteThematicCard = (category: 'phobiasList' | 'maniasList' | 'traumasList', index: number) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      const nextSanity = next.sanity || {};
      const list = nextSanity[category] || [];
      return {
        ...next,
        sanity: {
          ...nextSanity,
          [category]: list.filter((_: any, i: number) => i !== index)
        }
      };
    });
  };

  // Quick visual inventory management
  const addQuickItem = (name: string, icon: string) => {
    if (!name.trim()) return;
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      const nextInventory = next.inventory || {};
      const list = nextInventory.quickItems || [];
      return {
        ...next,
        inventory: {
          ...nextInventory,
          quickItems: [...list, { id: 'qi-' + Date.now(), name: name.trim(), icon }]
        }
      };
    });
  };

  const deleteQuickItem = (itemId: string) => {
    setCocSheet((prev: any) => {
      const next = prev ? { ...prev } : getInitialCoCSheet();
      const nextInventory = next.inventory || {};
      const list = nextInventory.quickItems || [];
      return {
        ...next,
        inventory: {
          ...nextInventory,
          quickItems: list.filter((item: any) => item.id !== itemId)
        }
      };
    });
  };

  // Active mobile navigation tab
  const [activeTab, setActiveTab ] = useState<'campaigns' | 'rooms' | 'characters' | 'settings'>('rooms');

  // Player global character sheets
  const [globalCharacters, setGlobalCharacters] = useState<any[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);

  // Initial load tracking
  useEffect(() => {
    if (loadingJoinedRooms || loadingCharacters) {
      showLoader("Invocando portais catalogados...");
    } else {
      hideLoader();
    }
    return () => {
      hideLoader();
    };
  }, [loadingJoinedRooms, loadingCharacters]);

  // New character states
  const [isCreatingChar, setIsCreatingChar] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharClass, setNewCharClass] = useState('');
  const [newCharHealth, setNewCharHealth] = useState(15);
  const [newCharSanity, setNewCharSanity] = useState(70);
  const [newCharSkills, setNewCharSkills] = useState('');
  const [newCharBackstory, setNewCharBackstory] = useState('');
  const [creatingCharLoading, setCreatingCharLoading] = useState(false);

  // Expanded character creator states
  const [creationStep, setCreationStep] = useState(1);
  const [newCharAge, setNewCharAge] = useState('32');
  const [newCharGender, setNewCharGender] = useState('Masculino');
  const [newCharResidence, setNewCharResidence] = useState('Arkham');
  const [newCharBirthplace, setNewCharBirthplace] = useState('Boston');
  const [newCharAvatarUrl, setNewCharAvatarUrl] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150');
  const [newCharLuck, setNewCharLuck] = useState(50);
  
  // Attribute states for character generator
  const [newCharFOR, setNewCharFOR] = useState(55);
  const [newCharCON, setNewCharCON] = useState(50);
  const [newCharTAM, setNewCharTAM] = useState(60);
  const [newCharDES, setNewCharDES] = useState(50);
  const [newCharAPA, setNewCharAPA] = useState(50);
  const [newCharINT, setNewCharINT] = useState(65);
  const [newCharPOD, setNewCharPOD] = useState(70);
  const [newCharEDU, setNewCharEDU] = useState(60);

  const [selectedGlobalChar, setSelectedGlobalChar] = useState<any | null>(null);

  // Clipboard / feedback states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch global characters
  const fetchGlobalCharacters = async () => {
    if (!user) return;
    setLoadingCharacters(true);
    try {
      const q = query(
        collection(db, 'characters'),
        where('ownerId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const charList: any[] = [];
      querySnapshot.forEach((doc) => {
        charList.push({ id: doc.id, ...doc.data() });
      });
      setGlobalCharacters(charList);
    } catch (err) {
      console.error('Error loading global characters:', err);
    } finally {
      setLoadingCharacters(false);
    }
  };

  const handleCreateGlobalCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newCharName.trim()) {
      showToast('Por favor, informe o nome do seu investigador.', 'error');
      return;
    }

    setCreatingCharLoading(true);
    try {
      const initialSheet = getInitialCoCSheet();
      
      const newChar = {
        ownerId: user.uid,
        name: newCharName.trim(),
        characterClass: newCharClass.trim(),
        health: newCharHealth,
        sanity: newCharSanity,
        skills: newCharSkills.trim(),
        backstory: newCharBackstory.trim(),
        cocSheet: {
          ...initialSheet,
          age: newCharAge,
          gender: newCharGender,
          residence: newCharResidence,
          birthplace: newCharBirthplace,
          avatarUrl: newCharAvatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
          luck: newCharLuck,
          maxLuck: 99,
          magic: Math.floor(newCharPOD / 5),
          maxMagic: Math.floor(newCharPOD / 5),
          moveRate: 8,
          maxHealth: newCharHealth,
          maxSanity: 99,
          attributes: {
            FOR: newCharFOR,
            CON: newCharCON,
            TAM: newCharTAM,
            DES: newCharDES,
            APA: newCharAPA,
            INT: newCharINT,
            POD: newCharPOD,
            EDU: newCharEDU,
          },
          sanity: {
            ...initialSheet.sanity,
            current: newCharSanity
          },
          backstory: {
            ...initialSheet.backstory,
            personalDesc: newCharBackstory.trim() || 'Descrição pendente.'
          }
        },
        createdAt: serverTimestamp()
      };
      
      const charId = doc(collection(db, 'characters')).id;
      await withLoading(
        setDoc(doc(db, 'characters', charId), newChar),
        "Catalogando dados proibidos do novo Investigador..."
      );

      showToast('Personagem gerado com sucesso!', 'success');
      
      // Clear creation states
      setNewCharName('');
      setNewCharClass('');
      setNewCharHealth(15);
      setNewCharSanity(70);
      setNewCharSkills('');
      setNewCharBackstory('');
      setNewCharAge('32');
      setNewCharGender('Masculino');
      setNewCharResidence('Arkham');
      setNewCharBirthplace('Boston');
      setNewCharAvatarUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150');
      setNewCharLuck(50);
      setCreationStep(1);
      setIsCreatingChar(false);
      
      await fetchGlobalCharacters();
      
      // Instantly open the newly created full character sheet!
      const charObjWithId = { id: charId, ...newChar };
      handleOpenGlobalCharacter(charObjWithId);
      
    } catch (err: any) {
      console.error('Error creating character:', err);
      showToast('Falha ao materializar personagem: ' + err.message, 'error');
    } finally {
      setCreatingCharLoading(false);
    }
  };

  const handleDeleteCharacter = async (charId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja apagar permanentemente este personagem?')) return;
    try {
      await deleteDoc(doc(db, 'characters', charId));
      showToast('Personagem apagado com sucesso.', 'success');
      await fetchGlobalCharacters();
    } catch (err: any) {
      console.error('Error deleting character:', err);
      showToast('Falha ao desintegrar personagem: ' + err.message, 'error');
    }
  };

  const handleOpenGlobalCharacter = (char: any) => {
    setSelectedGlobalChar(char);
    setCharacterName(char.name || '');
    setCharacterClass(char.characterClass || '');
    setHealth(char.health !== undefined ? char.health : (char.cocSheet?.maxHealth || 15));
    setSanity(char.sanity !== undefined ? char.sanity : (char.cocSheet?.sanity?.current || 70));
    setSkills(char.skills || '');
    setBackstory(char.backstory || '');
    if (char.cocSheet) {
      setCocSheet(char.cocSheet);
    } else {
      setCocSheet({
        ...getInitialCoCSheet(),
        maxHealth: char.health || 15,
        sanity: {
          ...getInitialCoCSheet().sanity,
          current: char.sanity || 70
        }
      });
    }
    setSheetTab('summary');
  };

  const handleRandomRollAttributes = () => {
    const roll3d6 = () => (Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1) * 5;
    const roll2d6plus6 = () => (Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + 6) * 5;
    
    const FOR = roll3d6();
    const CON = roll3d6();
    const TAM = roll2d6plus6();
    const DES = roll3d6();
    const APA = roll3d6();
    const INT = roll2d6plus6();
    const POD = roll3d6();
    const EDU = roll2d6plus6();

    const hp = Math.floor((CON + TAM) / 10);
    const san = POD;

    setNewCharFOR(FOR);
    setNewCharCON(CON);
    setNewCharTAM(TAM);
    setNewCharDES(DES);
    setNewCharAPA(APA);
    setNewCharINT(INT);
    setNewCharPOD(POD);
    setNewCharEDU(EDU);

    setNewCharHealth(hp);
    setNewCharSanity(san);
    setNewCharLuck(roll3d6());
    
    showToast("Dados místicos jogados! Atributos e derivados gerados com sucesso.", "success");
  };

  // Global character auto-save effect
  useEffect(() => {
    if (!selectedGlobalChar || activeSessionRoomId || !user) return;

    const currentJson = JSON.stringify({
      name: characterName,
      characterClass,
      health,
      sanity,
      skills,
      backstory,
      cocSheet
    });

    if (currentJson === lastSavedJsonRef.current) {
      setAutoSaveStatus('saved');
      return;
    }

    setAutoSaveStatus('dirty');

    const debounceTimer = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const charRef = doc(db, 'characters', selectedGlobalChar.id);
        await setDoc(charRef, {
          name: characterName,
          characterClass,
          health,
          sanity,
          skills,
          backstory,
          cocSheet,
          updatedAt: serverTimestamp()
        }, { merge: true });

        lastSavedJsonRef.current = currentJson;
        setAutoSaveStatus('saved');
      } catch (err) {
        console.error('Error in global character autosave:', err);
        setAutoSaveStatus('dirty');
      }
    }, 1500);

    return () => clearTimeout(debounceTimer);
  }, [cocSheet, characterName, characterClass, health, sanity, skills, backstory, selectedGlobalChar, activeSessionRoomId, user]);

  // Fetch joined rooms initial load
  useEffect(() => {
    if (!user) return;
    fetchJoinedRooms();
    fetchGlobalCharacters();
  }, [user]);

  // Listen to participants, rolls and character dossier in active cockpit session
  useEffect(() => {
    if (!activeSessionRoomId || !user) {
      setRoomParticipants([]);
      setRecentRolls([]);
      return;
    }

    // 1. Subscribe to active participants list
    const participantsRef = collection(db, 'rooms', activeSessionRoomId, 'participants');
    const unsubParticipants = onSnapshot(participantsRef, (snapshot) => {
      const list: Participant[] = [];
      snapshot.forEach((doc) => {
        list.push({ userId: doc.id, ...doc.data() } as Participant);
      });
      setRoomParticipants(list);

      // Check if my character sheet has a pre-existing record to sync form states
      const myDoc = list.find(p => p.userId === user.uid);
      if (myDoc) {
        const docJson = JSON.stringify({
          characterName: myDoc.characterName || '',
          characterClass: myDoc.characterClass || '',
          health: myDoc.health !== undefined ? myDoc.health : 15,
          sanity: myDoc.sanity !== undefined ? myDoc.sanity : 70,
          cocSheet: myDoc.cocSheet || null
        });

        if (docJson !== lastSavedJsonRef.current) {
          lastSavedJsonRef.current = docJson;
          setCharacterName(myDoc.characterName || '');
          setCharacterClass(myDoc.characterClass || '');
          setHealth(myDoc.health !== undefined ? myDoc.health : 15);
          setSanity(myDoc.sanity !== undefined ? myDoc.sanity : 70);
          setSkills(myDoc.skills || '');
          setBackstory(myDoc.backstory || '');
          if (myDoc.cocSheet) {
            setCocSheet(myDoc.cocSheet);
          } else {
            setCocSheet(getInitialCoCSheet());
          }
        }
      }
    }, (error) => {
      console.error('Error listening to participants:', error);
    });

    // 2. Subscribe to dice rolls feed
    const rollsRef = collection(db, 'rooms', activeSessionRoomId, 'rolls');
    const unsubRolls = onSnapshot(rollsRef, (snapshot) => {
      const list: DiceRoll[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as DiceRoll);
      });
      list.sort((a, b) => {
        const tA = a.rolledAt?.seconds || 0;
        const tB = b.rolledAt?.seconds || 0;
        return tB - tA;
      });
      setRecentRolls(list.slice(0, 15)); // last 15
    }, (error) => {
      console.error('Error listening to rolls:', error);
    });

    return () => {
      unsubParticipants();
      unsubRolls();
    };
  }, [activeSessionRoomId, user]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getSavedRoomIds = (): string[] => {
    try {
      const saved = localStorage.getItem(`mythos_joined_room_ids_${user?.uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveRoomIds = (ids: string[]) => {
    if (!user) return;
    localStorage.setItem(`mythos_joined_room_ids_${user.uid}`, JSON.stringify(ids));
  };

  const fetchJoinedRooms = async () => {
    if (!user) return;
    setLoadingJoinedRooms(true);

    try {
      const localIds = getSavedRoomIds();
      if (localIds.length === 0) {
        setJoinedRooms([]);
        setLoadingJoinedRooms(false);
        return;
      }

      const roomsList: Room[] = [];
      for (const roomId of localIds) {
        const roomDoc = await getDoc(doc(db, 'rooms', roomId));
        if (roomDoc.exists()) {
          roomsList.push({ id: roomDoc.id, ...roomDoc.data() } as Room);
        }
      }

      // Keep only really existing on DB
      const existingIds = roomsList.map(r => r.id);
      saveRoomIds(existingIds);
      setJoinedRooms(roomsList);
    } catch (err) {
      console.error('Error loading joined rooms:', err);
    } finally {
      setLoadingJoinedRooms(false);
    }
  };

  // Join Code Handler
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const code = entryCodeInput.trim().toUpperCase();
    if (!code) {
      showToast('Insira o selo místico gerado pelo Mestre.', 'error');
      return;
    }

    setSubmittingJoin(true);

    try {
      await withLoading(async () => {
        const q = query(
          collection(db, 'rooms'),
          where('entryCode', '==', code)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('Nenhum portal místico respondeu a este código.');
        }

        const roomDoc = querySnapshot.docs[0];
        const roomData = { id: roomDoc.id, ...roomDoc.data() } as Room;

        if (!roomData.allowJoin) {
          throw new Error('Este portal está lacrado no momento por ordem maior.');
        }

        // Check limits
        const participantsSnap = await getDocs(collection(db, 'rooms', roomData.id, 'participants'));
        if (participantsSnap.size >= roomData.maxPlayers) {
          throw new Error('O circulo atingiu o limite de heróis.');
        }

        // Add user to participants list
        const participantRef = doc(db, 'rooms', roomData.id, 'participants', user.uid);
        await setDoc(participantRef, {
          userId: user.uid,
          displayName: user.displayName || profile?.name || 'Investigador',
          email: user.email || '',
          joinedAt: serverTimestamp(),
          role: 'player',
          health: 15,
          sanity: 70
        }, { merge: true });

        // Save locally
        const localIds = getSavedRoomIds();
        if (!localIds.includes(roomData.id)) {
          const newIds = [...localIds, roomData.id];
          saveRoomIds(newIds);
        }
      }, "Analisando selo místico e sintonizando portal...");

      showToast(`Você cruzou o limiar do portal ativa!`, 'success');
      setEntryCodeInput('');
      await fetchJoinedRooms();
      setActiveAction('list');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'O atravessamento falhou.', 'error');
    } finally {
      setSubmittingJoin(false);
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!activeSessionRoomId || !user || !cocSheet) return;

    // Check if what we have matches exactly what we last saved (or what came from snapshot)
    const currentJson = JSON.stringify({
      characterName,
      characterClass,
      health,
      sanity,
      cocSheet
    });

    if (currentJson === lastSavedJsonRef.current) {
      setAutoSaveStatus('saved');
      return;
    }

    setAutoSaveStatus('dirty');

    const debounceTimer = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const participantRef = doc(db, 'rooms', activeSessionRoomId, 'participants', user.uid);
        await setDoc(participantRef, {
          characterName,
          characterClass,
          health,
          sanity,
          cocSheet,
          updatedAt: serverTimestamp()
        }, { merge: true });

        lastSavedJsonRef.current = currentJson;
        setAutoSaveStatus('saved');
      } catch (err) {
        console.error('Error in auto-saving character sheet:', err);
        setAutoSaveStatus('dirty');
      }
    }, 1500); // 1.5 seconds

    return () => clearTimeout(debounceTimer);
  }, [cocSheet, characterName, characterClass, health, sanity, activeSessionRoomId, user]);

  // Save Character Dossier (sync with firestore for both session and global mode)
  const handleSaveCharacterSheet = async () => {
    if (!user) return;
    setSavingSheet(true);
    setAutoSaveStatus('saving');

    try {
      const currentJson = JSON.stringify({
        characterName,
        characterClass,
        health,
        sanity,
        skills,
        backstory,
        cocSheet
      });

      if (activeSessionRoomId) {
        const participantRef = doc(db, 'rooms', activeSessionRoomId, 'participants', user.uid);
        await setDoc(participantRef, {
          characterName,
          characterClass,
          health,
          sanity,
          cocSheet,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else if (selectedGlobalChar) {
        const charRef = doc(db, 'characters', selectedGlobalChar.id);
        await setDoc(charRef, {
          name: characterName,
          characterClass,
          health,
          sanity,
          skills,
          backstory,
          cocSheet,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Update local list
        setGlobalCharacters((prev: any[]) => prev.map((c: any) => c.id === selectedGlobalChar.id ? {
          ...c,
          name: characterName,
          characterClass,
          health,
          sanity,
          skills,
          backstory,
          cocSheet
        } : c));
      }

      lastSavedJsonRef.current = currentJson;
      setAutoSaveStatus('saved');
      showToast('Dossiê do investigador sincro-gravado com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Não foi possível gravar o dossiê: ' + err.message, 'error');
      setAutoSaveStatus('dirty');
    } finally {
      setSavingSheet(false);
    }
  };

  // Roll dice as player
  const handleRollPlayerDice = async (sides: number) => {
    if (!activeSessionRoomId || !user) return;

    setRollingDice(sides);
    setLastRollResult(null);

    setTimeout(async () => {
      const roll = Math.floor(Math.random() * sides) + 1;
      setLastRollResult(roll);
      setRollingDice(null);

      try {
        const rollNameRef = characterName.trim() || user.displayName || profile?.name || 'Investigador';
        const rollRef = collection(db, 'rooms', activeSessionRoomId, 'rolls');
        await addDoc(rollRef, {
          rollerName: rollNameRef,
          sides: sides,
          result: roll,
          rolledAt: serverTimestamp()
        });
      } catch (err) {
        console.error('Error registering player dice roll: ', err);
      }
    }, 900);
  };

  const handleRollCoCTest = async (skillName: string, value: number) => {
    if (!user) return;
    
    // Call of Cthulhu uses 1d100
    const roll = Math.floor(Math.random() * 100) + 1;
    
    // Calculate difficulty benchmarks
    const reqRegular = value;
    const reqHard = Math.floor(value / 2);
    const reqExtreme = Math.floor(value / 5);
    
    let successGrade: 'Sucesso Crítico' | 'Sucesso Extremo' | 'Sucesso Difícil' | 'Sucesso Regular' | 'Fracasso' | 'Desastre' = 'Fracasso';
    let description = '';
    
    if (roll === 1) {
      successGrade = 'Sucesso Crítico';
      description = `Incrível! Sucesso Crítico no teste de ${skillName}. Um vislumbre de perfeição arqueológica!`;
    } else if (roll === 100) {
      successGrade = 'Desastre';
      description = `Trágico! Desastre absoluto no teste de ${skillName}. Consequências imensuráveis se aproximam...`;
    } else if (roll <= reqExtreme) {
      successGrade = 'Sucesso Extremo';
      description = `Brilhante! Sucesso Extremo no teste de ${skillName} (${roll} <= ${reqExtreme}).`;
    } else if (roll <= reqHard) {
      successGrade = 'Sucesso Difícil';
      description = `Ótimo! Sucesso Difícil no teste de ${skillName} (${roll} <= ${reqHard}).`;
    } else if (roll <= reqRegular) {
      successGrade = 'Sucesso Regular';
      description = `Suficiente. Sucesso Regular no teste de ${skillName} (${roll} <= ${reqRegular}).`;
    } else {
      if (roll >= 96 && value < 50) {
        successGrade = 'Desastre';
        description = `Fracasso Catastrófico! Desastre no teste de ${skillName} (${roll} >= 96).`;
      } else {
        successGrade = 'Fracasso';
        description = `Fracasso no teste de ${skillName} (${roll} > ${reqRegular}).`;
      }
    }
    
    setRollTestResult({
      roll,
      successGrade,
      description
    });
    
    if (activeSessionRoomId) {
      try {
        const rollNameRef = characterName.trim() || user.displayName || profile?.name || 'Investigador';
        const rollRef = collection(db, 'rooms', activeSessionRoomId, 'rolls');
        await addDoc(rollRef, {
          rollerName: rollNameRef,
          sides: 100,
          result: roll,
          detail: `[TESTE] ${skillName} (${value}%) - ${successGrade}`,
          rolledAt: serverTimestamp()
        });
      } catch (err) {
        console.error('Error logging detailed CoC roll: ', err);
      }
    }
  };

  // Leave Room of current connection list
  const handleLeaveRoom = async (roomId: string) => {
    if (!user) return;
    if (!window.confirm('Deseja recuar e quebrar sua pacto de conexão com este portal? Todo o seu dossiê de personagem ficará retido.')) return;

    try {
      const participantRef = doc(db, 'rooms', roomId, 'participants', user.uid);
      await deleteDoc(participantRef);

      const localIds = getSavedRoomIds();
      const updatedIds = localIds.filter(id => id !== roomId);
      saveRoomIds(updatedIds);

      showToast('Sua energia foi retirada de forma limpa.', 'success');
      setActiveSessionRoomId(null);
      await fetchJoinedRooms();
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao recuar pacto: ' + err.message, 'error');
    }
  };

  // Enter active dynamic session layout, fetch chronic template
  const handleEnterCockpit = async (roomObj: Room) => {
    await withLoading(async () => {
      setActiveSessionRoomId(roomObj.id);
      
      // Fetch campaign
      try {
        const campDoc = await getDoc(doc(db, 'campaigns', roomObj.campaignId));
        if (campDoc.exists()) {
          setActiveCampDetails({ id: campDoc.id, ...campDoc.data() } as Campaign);
        }
      } catch (err) {
        console.error('Error fetching associated campaign info:', err);
      }
    }, "Materializando o santuário da mesa de jogo e invocando as crônicas...");
  };

  const activeRoomObj = joinedRooms.find(r => r.id === activeSessionRoomId);

  return (
    <div className="min-h-screen text-mythos-text pb-12 md:pb-6 flex flex-col justify-between relative">
      <RPGBackground />

      <div className="relative z-10 w-full flex-1">
        {/* Header - Fixed & Compact */}
        <header className="border-b border-magic/20 bg-black/85 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-950 to-black rounded-lg border border-magic/40 shadow-[0_0_15px_rgba(77,163,255,0.15)]">
                <Sword size={22} className="text-magic" />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel text-xl sm:text-2xl tracking-[0.25em] text-magic font-black">REALMOR</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-magic/60 font-sans font-bold -mt-1">Modo Jogador</span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleBackToSelection}
              className="px-4 py-2 text-[10px] sm:text-xs border border-magic/20 rounded-md tracking-widest hover:bg-magic/10 text-magic hover:text-white transition-all font-sans font-bold bg-black/40"
            >
              CÉLULA DE PERFIL
            </Button>
          </div>
        </header>

        {/* Global Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] p-4 rounded-xl border border-magic/40 bg-black/80 text-white font-cinzel font-bold tracking-wider text-center shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-pulse"
            >
              <Flame size={16} className="text-magic inline-block mr-2" />
              <span>{toastMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Workspace Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          
          <AnimatePresence mode="wait">
            
            {/* ========================================================= */}
            {/* SCREEN 1: THE DYNAMIC TABLE PLAYER COCKPIT */}
            {/* ========================================================= */}
            {activeSessionRoomId ? (
              <motion.div
                key="player-cockpit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 text-left"
              >
                {/* Back Link Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-magic/25 pb-4">
                  <button
                    onClick={() => {
                      if (window.confirm('Interromper sua conexão temporária e retornar à biblioteca de sagas?')) {
                        withLoading(
                          new Promise<void>(resolve => {
                            setActiveSessionRoomId(null);
                            setTimeout(resolve, 750);
                          }),
                          "Fechando diários de heróis e purificando a alma..."
                        );
                      }
                    }}
                    className="flex items-center gap-2 text-xs text-magic hover:text-white tracking-widest font-cinzel font-black active:scale-95 transition-all bg-black/40 border border-magic/15 hover:border-magic/40 px-3.5 py-2 rounded-lg"
                  >
                    <ChevronLeft size={16} />
                    ABANDONAR MESA DE JOGO ATUAL
                  </button>
                  
                  <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-lg border border-magic/15 text-xs text-magic">
                    <Activity size={14} className="text-magic animate-pulse" />
                    <span>Espaço Conectado: <strong>{activeRoomObj?.roomName}</strong></span>
                    <span className="text-white/40">|</span>
                    <span>Selo: <strong className="text-gold-light">{activeRoomObj?.entryCode}</strong></span>
                  </div>
                </div>

                {/* Cover visual banner */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-magic/35 shadow-2xl flex items-end">
                  <div className="absolute inset-0 bg-cover bg-center filter brightness-45" style={{ backgroundImage: `url(${activeRoomObj?.coverUrl})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0706] via-black/40 to-transparent" />
                  <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-magic bg-magic/10 px-2 py-0.5 rounded border border-magic/20 italic">
                        Diário d'Investigação • {activeRoomObj?.system}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-cinzel font-black text-gold-gradient mt-1 tracking-wider drop-shadow-md">
                        {activeRoomObj?.campaignName}
                      </h2>
                      <p className="text-xs text-stone-300 italic font-sans max-w-2xl leading-none">
                        Mestra do Destino: {activeCampDetails?.subtitle || 'Crônicas secretas do REALMOR'}
                      </p>
                    </div>
                    
                    <div className="flex gap-4 text-xs font-cinzel text-white/80 pb-1">
                      <div className="flex flex-col bg-black/80 px-3 py-1.5 rounded border border-white/5">
                        <span className="text-[8px] text-magic/60 uppercase font-bold">Instabilidade</span>
                        <span className="font-bold text-red-400">{activeCampDetails?.lethality || 'Alto'}</span>
                      </div>
                      <div className="flex flex-col bg-black/80 px-3 py-1.5 rounded border border-white/5">
                        <span className="text-[8px] text-magic/60 uppercase font-bold">Localidade Principal</span>
                        <span className="font-bold text-gold-light">{activeCampDetails?.mainLocation || 'Desconhecido'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Layout Principal Bento (character controls + dice + lore) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT COLUMN: Campaign lore & synopsis (3 Columns) */}
                  <div className="lg:col-span-3 bg-black/75 border border-magic/15 p-5 rounded-2xl flex flex-col justify-between shadow-2xl">
                    <div className="space-y-4">
                      <div className="border-b border-magic/15 pb-2">
                        <h3 className="text-xs font-cinzel font-black text-magic tracking-widest flex items-center gap-1.5">
                          <BookOpen size={13} />
                          CRÔNICAS DA AVENTURA
                        </h3>
                      </div>

                      <div className="space-y-3.5 text-xs text-stone-300">
                        <p className="bg-black/40 p-3 rounded-lg border border-white/5 italic text-[11px] leading-relaxed">
                          "{activeCampDetails?.summary || 'Nenhum resumo público foi registrado nas sagas pelo Master.'}"
                        </p>
                        
                        <div className="space-y-2 border-t border-white/5 pt-3">
                          <span className="text-[9px] uppercase tracking-wider text-magic font-extrabold block">Pistas & Configurações</span>
                          <div className="space-y-1 bg-black/20 p-2.5 rounded border border-white/5 text-[11px]">
                            <p className="flex justify-between">• <span className="text-stone-500">Tom Narrativo:</span> <strong className="text-white">{activeCampDetails?.tone || 'Investigativo'}</strong></p>
                            <p className="flex justify-between">• <span className="text-stone-500">Época Cósmica:</span> <strong className="text-[#ffa500]">{activeCampDetails?.era || 'Anos 1920'}</strong></p>
                            <p className="flex justify-between">• <span className="text-stone-500">Local Primário:</span> <strong className="text-white">{activeCampDetails?.mainLocation || 'Global'}</strong></p>
                          </div>
                        </div>

                        {activeRoomObj?.notes && (
                          <div className="space-y-1 border-t border-white/5 pt-3">
                            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-extrabold block">Recomendação do Mestre</span>
                            <p className="text-[10px] text-stone-400 bg-black/30 p-2.5 rounded border border-white/5 italic">
                              "{activeRoomObj.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#4da3ff]/10 text-center">
                      <span className="text-[8px] uppercase tracking-widest text-[#4da3ff]/40 block leading-normal">
                        Fidelidade em suas crônicas arcanas
                      </span>
                    </div>
                  </div>

                  {/* CENTER COLUMN: Call of Cthulhu Interactive High-Premium Character Sheet (5 Columns) */}
                  <div className="lg:col-span-5 bg-black/75 border border-magic/20 p-5 rounded-2xl space-y-4 shadow-2xl relative flex flex-col justify-between">
                    {!cocSheet ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                        <span className="text-magic tracking-widest font-cinzel text-xs font-black animate-pulse">INVOCANDO REGISTRO DO INVESTIGADOR...</span>
                        <p className="text-[10px] text-stone-500 font-mono italic">Aguardando sintonização cósmica dos dados de Chamado de Cthulhu.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        {/* Upper Header layout */}
                        <div className="space-y-3.5">
                          {/* Autocraft status and quick saving feedback */}
                          <div className="flex items-center justify-between text-[9px] font-mono tracking-widest border-b border-magic/10 pb-1 text-stone-500">
                            <span>CHAMADO DE CTHULHU 7ª EDIÇÃO</span>
                            <div className="flex items-center gap-1.5">
                              {autoSaveStatus === 'saved' && <span className="text-emerald-500 font-bold">● SINCRO-GRAVADO (AUTO-SAVE)</span>}
                              {autoSaveStatus === 'saving' && <span className="text-magic animate-pulse">⏳ TRANSCREVENDO ALMA...</span>}
                              {autoSaveStatus === 'dirty' && <span className="text-amber-500">⚙️ ALTERAÇÃO DETECTADA...</span>}
                            </div>
                          </div>

                          {/* Upper Layout: Profile Pic, Basic Fields */}
                          <div className="flex flex-col sm:flex-row gap-4 bg-black/45 p-4 rounded-xl border border-magic/10 relative overflow-hidden">
                            {/* Avatar portrait choice */}
                            <div className="flex flex-col items-center gap-2">
                              <div className="relative group cursor-pointer w-20 h-20 rounded-xl overflow-hidden border-2 border-magic/40 bg-zinc-900/80 shadow-[0_0_12px_rgba(77,163,255,0.2)] flex-shrink-0">
                                <img 
                                  src={cocSheet.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'} 
                                  alt="Avatar" 
                                  className="w-full h-full object-cover grayscale contrast-115 border-none"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[8px] text-white font-cinzel text-center p-1 leading-tight uppercase font-black font-mono">
                                  Link URL Abaixo
                                </div>
                              </div>
                              {/* URL Input option nested cleanly */}
                              <input 
                                type="text"
                                placeholder="Link da foto"
                                value={cocSheet.avatarUrl || ''}
                                onChange={(e) => setCoCField('avatarUrl', e.target.value)}
                                className="bg-black border border-magic/10 text-[8px] font-mono p-1 rounded text-center w-20 text-magic/80 focus:outline-none focus:border-magic/40"
                              />
                            </div>

                            {/* Inputs Section */}
                            <div className="flex-1 grid grid-cols-2 gap-2 text-left">
                              <div className="col-span-2 flex flex-col gap-0.5">
                                <span className="text-[8px] text-magic/50 uppercase font-bold tracking-widest leading-none">Nome do Investigador</span>
                                <input 
                                  type="text"
                                  value={characterName}
                                  placeholder="Ex: Dr. Jack Sterling"
                                  onChange={(e) => setCharacterName(e.target.value)}
                                  className="bg-black/60 border border-magic/15 rounded px-2.5 py-1 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-magic/40 font-cinzel uppercase"
                                />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] text-magic/50 uppercase font-bold tracking-widest leading-none">Ocupação / Ofício</span>
                                <input 
                                  type="text"
                                  value={characterClass}
                                  placeholder="Ex: Antiquário"
                                  onChange={(e) => setCharacterClass(e.target.value)}
                                  className="bg-black/60 border border-magic/15 rounded px-2.5 py-1 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-magic/40"
                                />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] text-magic/50 uppercase font-bold tracking-widest leading-none">Idade</span>
                                <input 
                                  type="text"
                                  value={cocSheet.age || ''}
                                  placeholder="Ex: 34 anos"
                                  onChange={(e) => setCoCField('age', e.target.value)}
                                  className="bg-black/60 border border-magic/15 rounded px-2.5 py-1 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-magic/40 text-center"
                                />
                              </div>
                              {/* Room Linkage Ribbon */}
                              <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/60 p-2 rounded-lg border border-magic/20 mt-2 font-mono text-[8px] text-stone-400">
                                <div>
                                  <span className="text-magic uppercase block font-bold leading-none">CAMPANHA</span>
                                  <span className="text-[#ffa500] block truncate font-sans text-[9px] mt-0.5 font-semibold">
                                    {activeRoomObj?.campaignName || activeCampDetails?.name || 'Sagas do Destino'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-magic uppercase block font-bold leading-none">MUTIRÃO / SALA</span>
                                  <span className="text-stone-200 block truncate font-sans text-[9px] mt-0.5 font-semibold">
                                    {activeRoomObj?.roomName || 'Sala Desperta'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-magic uppercase block font-bold leading-none">MESTRE (GM)</span>
                                  <span className="text-stone-200 block truncate font-sans text-[9px] mt-0.5 font-semibold">
                                    {(activeRoomObj as any)?.dmName || 'Mestre do Portal'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-magic block font-bold leading-none">PROPAGAÇÃO</span>
                                  <span className="text-emerald-400 block font-sans text-[8px] font-bold uppercase mt-0.5 animate-pulse">
                                    ● ATIVO / REALTIME
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Combat State and Major Injury Ribbon */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0d0908]/90 border border-magic/20 p-2.5 rounded-xl text-left select-none">
                            <div>
                              <span className="text-[7.5px] text-magic uppercase font-black block mb-1 tracking-widest font-cinzel">Condição de Combate</span>
                              <div className="flex gap-1">
                                {['consciente', 'inconsciente', 'morrendo'].map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => {
                                      setCoCField('combatState', st);
                                      // Log to history
                                      setCocSheet((prev: any) => {
                                        const next = prev ? { ...prev } : getInitialCoCSheet();
                                        const currentLogs = next.eventLog || [];
                                        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                        return {
                                          ...next,
                                          eventLog: [`${timeStr} - Estado: ${st.toUpperCase()}`, ...currentLogs].slice(0, 50)
                                        };
                                      });
                                    }}
                                    className={`px-2 py-1 rounded text-[8px] font-bold font-mono uppercase transition-all flex-1 cursor-pointer border ${
                                      (cocSheet.combatState || 'consciente') === st
                                        ? 'bg-magic/20 text-[#ffa500] border-magic/40 shadow-[0_0_8px_rgba(77,163,255,0.2)]'
                                        : 'bg-black/50 text-stone-500 border-white/5 hover:text-stone-300'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[7.5px] text-magic uppercase font-black block mb-1 tracking-widest font-cinzel">Lesão Grave (Major Injury)</span>
                              <div className="flex gap-1.5 font-mono">
                                {[
                                  { label: 'SIM (ATIVA)', value: true },
                                  { label: 'NÃO (NENHUMA)', value: false }
                                ].map((opt) => (
                                  <button
                                    key={opt.label}
                                    type="button"
                                    onClick={() => {
                                      setCoCField('majorInjury', opt.value);
                                      setCocSheet((prev: any) => {
                                        const next = prev ? { ...prev } : getInitialCoCSheet();
                                        const currentLogs = next.eventLog || [];
                                        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                        return {
                                          ...next,
                                          eventLog: [`${timeStr} - Lesão Grave: ${opt.value ? 'REGISTRADA' : 'INATIVA'}`, ...currentLogs].slice(0, 50)
                                        };
                                      });
                                    }}
                                    className={`px-2 py-1 rounded text-[8px] font-bold transition-all flex-1 cursor-pointer border ${
                                      (cocSheet.majorInjury === opt.value)
                                        ? 'bg-red-950/60 text-red-200 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                                        : 'bg-black/50 text-stone-500 border-white/5 hover:text-stone-300'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* FIXED SPEED CONTROLLERS & CABEÇALHO DE STATUS RÁPIDO */}
                          <div className="space-y-2">
                            <span className="text-[7.5px] text-magic font-black uppercase font-cinzel tracking-widest block text-left">Painel Rápido do Investigador</span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {/* RAPID HEALTH CARD */}
                              <div className="bg-[#120606]/90 border border-red-500/40 rounded-xl p-3 text-left font-mono relative overflow-hidden shadow-[0_0_12px_rgba(239,68,68,0.05)]">
                                <div className="flex items-center justify-between border-b border-red-500/10 pb-1 mb-1.5">
                                  <span className="text-[8px] text-red-400 font-extrabold uppercase tracking-wider flex items-center gap-1">❤️ Vida Atual</span>
                                  <span className="font-sans text-xs text-red-200 font-black">{health} / {cocSheet.maxHealth || 15}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[-5, -1].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => changeHealth(v)}
                                      className="font-black text-[9px] bg-red-950 border border-red-500/30 text-red-300 px-1.5 py-1 rounded hover:bg-red-900 cursor-pointer flex-1 text-center"
                                    >
                                      {v}
                                    </button>
                                  ))}
                                  <span className="font-black text-xs text-white bg-black/60 border border-red-500/20 px-2 py-0.5 rounded text-center min-w-8">
                                    {health}
                                  </span>
                                  {[1, 5].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => changeHealth(v)}
                                      className="font-black text-[9px] bg-red-950 border border-red-500/30 text-red-200 px-1.5 py-1 rounded hover:bg-red-900 cursor-pointer flex-1 text-center"
                                    >
                                      +{v}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* RAPID SANITY CARD */}
                              <div className="bg-[#060a12]/90 border border-magic/40 rounded-xl p-3 text-left font-mono relative overflow-hidden shadow-[0_0_12px_rgba(77,163,255,0.05)]">
                                <div className="flex items-center justify-between border-b border-magic/10 pb-1 mb-1.5">
                                  <span className="text-[8px] text-magic font-extrabold uppercase tracking-wider flex items-center gap-1">🧠 Sanidade Atual</span>
                                  <span className="font-sans text-xs text-blue-200 font-black">{sanity}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[-5, -1].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => changeSanity(v)}
                                      className="font-black text-[9px] bg-blue-950 border border-magic/30 text-blue-300 px-1.5 py-1 rounded hover:bg-blue-900 cursor-pointer flex-1 text-center"
                                    >
                                      {v}
                                    </button>
                                  ))}
                                  <span className="font-black text-xs text-white bg-black/60 border border-magic/20 px-2 py-0.5 rounded text-center min-w-8">
                                    {sanity}
                                  </span>
                                  {[1, 5].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => changeSanity(v)}
                                      className="font-black text-[9px] bg-blue-950 border border-magic/30 text-blue-200 px-1.5 py-1 rounded hover:bg-blue-900 cursor-pointer flex-1 text-center"
                                    >
                                      +{v}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* RAPID LUCK CARD */}
                              <div className="bg-[#05120a]/95 border border-emerald-500/30 rounded-xl p-3 text-left font-mono relative overflow-hidden shadow-[0_0_12px_rgba(16,185,129,0.05)]">
                                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1 mb-1.5">
                                  <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">🍀 Sorte Atual</span>
                                  <span className="font-sans text-xs text-emerald-250 font-black">{cocSheet.luck || 50}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[-5, -1].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => changeLuck(v)}
                                      className="font-black text-[9px] bg-emerald-950 border border-emerald-500/30 text-emerald-300 px-1.5 py-1 rounded hover:bg-emerald-900 cursor-pointer flex-1 text-center"
                                    >
                                      {v}
                                    </button>
                                  ))}
                                  <span className="font-black text-xs text-white bg-black/60 border border-emerald-500/10 px-2 py-0.5 rounded text-center min-w-8">
                                    {cocSheet.luck || 50}
                                  </span>
                                  {[1, 5].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => changeLuck(v)}
                                      className="font-black text-[9px] bg-emerald-950 border border-emerald-500/30 text-emerald-200 px-1.5 py-1 rounded hover:bg-emerald-900 cursor-pointer flex-1 text-center"
                                    >
                                      +{v}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* RAPID MAGIC CARD */}
                              <div className="bg-[#120512]/95 border border-purple-500/30 rounded-xl p-3 text-left font-mono relative overflow-hidden shadow-[0_0_12px_rgba(168,85,247,0.05)]">
                                <div className="flex items-center justify-between border-b border-purple-500/10 pb-1 mb-1.5">
                                  <span className="text-[8px] text-purple-400 font-extrabold uppercase tracking-wider flex items-center gap-1">✨ Pontos de Magia</span>
                                  <span className="font-sans text-xs text-purple-200 font-black">{cocSheet.magic || 10} / {cocSheet.maxMagic || 15}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[-5, -1].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => changeMagic(v)}
                                      className="font-black text-[9px] bg-purple-900/40 border border-purple-500/20 text-purple-300 px-1.5 py-1 rounded hover:bg-purple-800 cursor-pointer flex-1 text-center"
                                    >
                                      {v}
                                    </button>
                                  ))}
                                  <span className="font-black text-xs text-white bg-black/60 border border-purple-500/10 px-2 py-0.5 rounded text-center min-w-8">
                                    {cocSheet.magic || 10}
                                  </span>
                                  {[1, 5].map(v => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => changeMagic(v)}
                                      className="font-black text-[9px] bg-purple-900/40 border border-purple-500/20 text-purple-200 px-1.5 py-1 rounded hover:bg-purple-800 cursor-pointer flex-1 text-center"
                                    >
                                      +{v}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Move rate and Event Log double grid inline */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-left">
                              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-2 flex flex-col justify-center items-center">
                                <span className="text-[7px] text-amber-400 font-black tracking-widest uppercase mb-1">🏃 Taxa de Movimento</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setCoCField('moveRate', Math.max(0, (cocSheet.moveRate || 8) - 1))}
                                    className="w-5 h-5 rounded bg-black border border-amber-500/20 text-amber-250 text-xs font-bold leading-none cursor-pointer flex items-center justify-center hover:bg-amber-950"
                                  >
                                    -
                                  </button>
                                  <span className="font-bold text-sm text-stone-200 font-mono px-2">{cocSheet.moveRate || 8}</span>
                                  <button
                                    type="button"
                                    onClick={() => setCoCField('moveRate', (cocSheet.moveRate || 8) + 1)}
                                    className="w-5 h-5 rounded bg-black border border-amber-500/20 text-amber-350 text-xs font-bold leading-none cursor-pointer flex items-center justify-center hover:bg-amber-950"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Automated Events Log Column */}
                              <div className="md:col-span-2 bg-black/60 border border-magic/10 p-2 rounded-xl flex flex-col h-14 font-mono text-[8px] overflow-hidden">
                                <span className="text-[7px] uppercase font-black tracking-wider text-stone-500 mb-0.5">📋 Histórico Automático de Danos & Sanidade (Sessão)</span>
                                <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin">
                                  {(cocSheet.eventLog && cocSheet.eventLog.length > 0) ? (
                                    cocSheet.eventLog.map((log: string, idx: number) => (
                                      <div key={idx} className="text-zinc-400 border-b border-white/5 py-0.2 last:border-b-0 leading-none">
                                        {log}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-stone-600 italic">Pronto para rastrear variações automáticas na mesa.</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Horizontal scrollable tab bar */}
                          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 border-y border-magic/10 w-full mb-1">
                            {[
                              { id: 'summary', label: 'Resumo' },
                              { id: 'attributes', label: 'Atributos' },
                              { id: 'skills', label: 'Perícias' },
                              { id: 'combat', label: 'Combate' },
                              { id: 'sanity', label: 'Sanidade' },
                              { id: 'backstory', label: 'História' },
                              { id: 'inventory', label: 'Inventário' },
                              { id: 'resources', label: 'Recursos' },
                              { id: 'companions', label: 'Companheiros' },
                              { id: 'references', label: 'Referências' },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSheetTab(tab.id as any)}
                                className={`px-2 py-0.5 rounded text-[8.5px] font-cinzel font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                                  sheetTab === tab.id
                                    ? 'bg-magic/25 text-white border border-magic/50 shadow-inner'
                                    : 'text-stone-500 hover:text-stone-300 hover:bg-white/5 border border-transparent'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Middle Content section dynamically loading selected tab */}
                        <div className="my-3.5 flex-1 select-none">
                          {sheetTab === 'summary' && (
                            <div className="space-y-3.5 text-left">
                              <div className="grid grid-cols-2 gap-3 bg-black/45 p-3 rounded-xl border border-magic/10">
                                <div>
                                  <span className="text-[8px] text-magic/60 uppercase font-black block">Residência</span>
                                  <input 
                                    type="text" 
                                    className="bg-black/60 border border-magic/15 rounded text-[11px] p-1 text-white w-full"
                                    value={cocSheet.residence || ''} 
                                    onChange={(e) => setCoCField('residence', e.target.value)} 
                                    placeholder="Ex: Boston, MA"
                                  />
                                </div>
                                <div>
                                  <span className="text-[8px] text-magic/60 uppercase font-black block">Local de Nascimento</span>
                                  <input 
                                    type="text" 
                                    className="bg-black/60 border border-magic/15 rounded text-[11px] p-1 text-white w-full"
                                    value={cocSheet.birthplace || ''} 
                                    onChange={(e) => setCoCField('birthplace', e.target.value)} 
                                    placeholder="Ex: Londres, UK"
                                  />
                                </div>
                                <div>
                                  <span className="text-[8px] text-magic/60 uppercase font-black block">Gênero / Pronomes</span>
                                  <input 
                                    type="text" 
                                    className="bg-black/60 border border-magic/15 rounded text-[11px] p-1 text-white w-full"
                                    value={cocSheet.gender || ''} 
                                    onChange={(e) => setCoCField('gender', e.target.value)} 
                                    placeholder="Ex: Masculino"
                                  />
                                </div>
                                <div>
                                  <span className="text-[8px] text-magic/60 uppercase font-black block">Nível de Sorte</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-emerald-400 font-mono text-xs font-black">{cocSheet.luck || 50}%</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-black/45 p-3 rounded-xl border border-magic/10 space-y-1.5">
                                <span className="text-[8px] text-magic uppercase font-black tracking-widest block">Principais Habilidades da Ficha</span>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(cocSheet.skills || {})
                                    .filter(([_, v]: [string, any]) => v >= 40)
                                    .slice(0, 12)
                                    .map(([name, val]: [string, any]) => (
                                      <div key={name} className="bg-magic/10 border border-magic/20 px-2 py-0.5 rounded text-[9px] font-mono text-stone-200">
                                        {name} <strong className="text-gold-light">{val}%</strong>
                                      </div>
                                    ))}
                                  {Object.entries(cocSheet.skills || {}).filter(([_, v]: [string, any]) => v >= 40).length === 0 && (
                                    <span className="text-stone-500 italic text-[10px]">Nenhuma perícia com valor elevado (40%+). Complete seus atributos.</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {sheetTab === 'attributes' && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {Object.entries(cocSheet.attributes || {}).map(([attr, val]: [string, any]) => (
                                  <div key={attr} className="bg-black/65 border border-magic/10 p-2.5 rounded-xl flex flex-col items-center justify-between shadow relative">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9px] font-cinzel font-bold text-magic">{attr}</span>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setTestingSkill({ name: `Atributo: ${attr}`, value: val });
                                          setRollTestResult(null);
                                        }}
                                        className="p-0.5 text-stone-400 hover:text-white text-[7px] font-mono leading-none rounded cursor-pointer"
                                        title="Rolar Atributo"
                                      >
                                        🎲
                                      </button>
                                    </div>
                                    <input 
                                      type="number"
                                      value={val}
                                      min={0}
                                      max={99}
                                      onChange={(e) => setCoCAttribute(attr, parseInt(e.target.value) || 0)}
                                      className="bg-black/90 border border-magic/15 text-center font-mono font-black text-[#ffa500] text-sm p-1 rounded w-12 mt-1 focus:outline-none focus:border-magic/40 text-white"
                                    />
                                    <div className="flex justify-between w-full text-[7px] text-stone-500 font-mono mt-1.5 pt-1 border-t border-white/5">
                                      <span>1/2: {Math.floor(val / 2)}</span>
                                      <span>1/5: {Math.floor(val / 5)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Extra vital max stats inline edits */}
                              <div className="grid grid-cols-3 gap-2 border-t border-magic/10 pt-3">
                                <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center flex flex-col justify-center">
                                  <span className="text-[7px] text-stone-400 font-bold uppercase block">VidaMax</span>
                                  <input 
                                    type="number"
                                    value={cocSheet.maxHealth || 15}
                                    onChange={(e) => setCoCField('maxHealth', parseInt(e.target.value) || 0)}
                                    className="bg-black border border-white/10 text-center font-black text-xs p-1 rounded w-10 mx-auto mt-1 text-white"
                                  />
                                </div>
                                <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center flex flex-col justify-center">
                                  <span className="text-[7px] text-stone-400 font-bold uppercase block">SanMax</span>
                                  <input 
                                    type="number"
                                    value={cocSheet.maxSanity || 99}
                                    onChange={(e) => setCoCField('maxSanity', parseInt(e.target.value) || 0)}
                                    className="bg-black border border-white/10 text-center font-black text-xs p-1 rounded w-10 mx-auto mt-1 text-white"
                                  />
                                </div>
                                <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center flex flex-col justify-center">
                                  <span className="text-[7px] text-stone-400 font-bold uppercase block">MagMax</span>
                                  <input 
                                    type="number"
                                    value={cocSheet.maxMagic || 15}
                                    onChange={(e) => setCoCField('maxMagic', parseInt(e.target.value) || 0)}
                                    className="bg-black border border-white/10 text-center font-black text-xs p-1 rounded w-10 mx-auto mt-1 text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {sheetTab === 'skills' && (
                            <div className="space-y-3">
                              {/* Search field */}
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="🔍 Filtrar perícias oficiais de Cthulhu..."
                                  value={skillSearchQuery}
                                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                                  className="flex-1 bg-black/60 border border-magic/20 text-[10px] text-white p-2 rounded-lg placeholder-stone-500 focus:outline-none focus:border-magic/40"
                                />
                                {skillSearchQuery && (
                                  <button 
                                    type="button"
                                    onClick={() => setSkillSearchQuery('')}
                                    className="text-stone-300 hover:text-white px-2 bg-white/5 rounded-lg text-[9px] border border-white/5 cursor-pointer"
                                  >
                                    Limpar
                                  </button>
                                )}
                              </div>

                              {/* Skill Cards grid wrapper with light borders */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin text-left">
                                  {Object.entries(cocSheet.skills || {})
                                    .filter(([name]) => name.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                                    .map(([name, val]: [string, any]) => (
                                      <div key={name} className="bg-black/65 border border-magic/10 p-1.5 px-2 rounded-lg flex items-center justify-between hover:border-magic/25 transition-all">
                                        <div className="flex flex-col flex-1 pr-2">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-bold text-stone-200">{name}</span>
                                            <button 
                                              type="button" 
                                              onClick={() => {
                                                setTestingSkill({ name, value: val });
                                                setRollTestResult(null);
                                              }}
                                              className="p-0.5 px-1 bg-magic/10 hover:bg-magic/30 border border-magic/20 text-white text-[7px] font-mono leading-none rounded cursor-pointer"
                                            >
                                              🎲 Rolar
                                            </button>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-[7px] text-stone-500 mt-0.5">
                                            <span>Reg: <strong className="text-magic/80">{val}</strong></span>
                                            <span>1/2: <strong>{Math.floor(val / 2)}</strong></span>
                                            <span>1/5: <strong>{Math.floor(val / 5)}</strong></span>
                                          </div>
                                        </div>
                                        <input 
                                          type="number"
                                          min={0}
                                          max={99}
                                          value={val}
                                          onChange={(e) => setCoCSkill(name, parseInt(e.target.value) || 0)}
                                          className="bg-black border border-magic/20 text-center font-mono font-bold text-[10px] p-0.5 rounded w-10 text-white focus:outline-none focus:border-magic/40"
                                        />
                                      </div>
                                    ))}
                              </div>
                            </div>
                          )}

                          {sheetTab === 'combat' && (
                            <div className="space-y-3 text-left">
                              {/* Weapons List */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] text-magic uppercase font-bold tracking-wider">Arsenal Ativo</span>
                                  <button
                                    type="button"
                                    onClick={addWeapon}
                                    className="flex items-center gap-0.5 text-[8px] bg-magic/20 hover:bg-magic/40 border border-magic/40 text-white rounded px-2 py-0.5"
                                  >
                                    <Plus size={8} /> NOVA ARMA
                                  </button>
                                </div>

                                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
                                  {(!cocSheet.combat?.weapons || cocSheet.combat.weapons.length === 0) ? (
                                    <p className="text-[9px] text-stone-500 italic text-center p-2">Nenhuma arma listada.</p>
                                  ) : (
                                    cocSheet.combat.weapons.map((w: any) => (
                                      <div key={w.id} className="bg-black/50 border border-magic/10 p-2 rounded-lg flex flex-col gap-1.5 relative">
                                        <button 
                                          type="button"
                                          onClick={() => deleteWeapon(w.id)}
                                          className="absolute top-1 right-1 p-0.5 rounded border border-red-500/15 text-red-400 hover:bg-red-950/40 hover:border-red-500/40 text-[8px]"
                                        >
                                          <Trash2 size={8} />
                                        </button>

                                        <div className="grid grid-cols-2 gap-1.5 pr-5">
                                          <div className="flex flex-col gap-0.5">
                                            <span className="text-[7px] text-stone-500 uppercase">Arma</span>
                                            <input 
                                              type="text"
                                              value={w.name}
                                              onChange={(e) => updateWeapon(w.id, 'name', e.target.value)}
                                              className="bg-zinc-900 border border-white/5 text-[9px] p-0.5 rounded text-white"
                                            />
                                          </div>
                                          <div className="flex flex-col gap-0.5">
                                            <span className="text-[7px] text-stone-500">Dano (fórmula)</span>
                                            <input 
                                              type="text"
                                              value={w.damage}
                                              onChange={(e) => updateWeapon(w.id, 'damage', e.target.value)}
                                              className="bg-zinc-900 border border-white/5 text-[9px] p-0.5 rounded text-white"
                                            />
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-1 text-[8px]">
                                          <div className="flex flex-col">
                                            <span className="text-stone-500">Alcance</span>
                                            <input 
                                              type="text"
                                              value={w.range}
                                              onChange={(e) => updateWeapon(w.id, 'range', e.target.value)}
                                              className="bg-zinc-900 border border-white/5 text-[8px] p-0.5 rounded text-center text-white"
                                            />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-stone-500">Ataques</span>
                                            <input 
                                              type="text"
                                              value={w.attacks}
                                              onChange={(e) => updateWeapon(w.id, 'attacks', e.target.value)}
                                              className="bg-zinc-900 border border-white/5 text-[8px] p-0.5 rounded text-center text-white"
                                            />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-stone-500">Balas</span>
                                            <input 
                                              type="text"
                                              value={w.ammo}
                                              onChange={(e) => updateWeapon(w.id, 'ammo', e.target.value)}
                                              className="bg-zinc-900 border border-white/5 text-[8px] p-0.5 rounded text-center text-white"
                                            />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-stone-500">Defeito</span>
                                            <input 
                                              type="text"
                                              value={w.malfunction}
                                              onChange={(e) => updateWeapon(w.id, 'malfunction', e.target.value)}
                                              className="bg-zinc-900 border border-white/5 text-[8px] p-0.5 rounded text-center text-white"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Global Combat modifiers */}
                              <div className="grid grid-cols-3 gap-2 border-t border-magic/10 pt-2 text-center text-[10px]">
                                <div className="bg-black/40 border border-white/5 rounded p-1 flex flex-col justify-center">
                                  <span className="text-[7px] text-stone-500 font-bold uppercase">Esquiva</span>
                                  <span className="text-xs font-black text-magic">
                                    {cocSheet.skills?.["Esquiva"] || 25}%
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[7px] text-stone-500 font-bold">Bônus Dano</span>
                                  <input 
                                    type="text"
                                    placeholder="+1D4"
                                    value={cocSheet.combat?.damageBonus || '0'}
                                    onChange={(e) => setCoCCombat('damageBonus', e.target.value)}
                                    className="bg-black border border-white/10 text-center font-bold text-xs p-1 rounded mt-0.5 text-white"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[7px] text-stone-500 font-bold">Corpo (Build)</span>
                                  <input 
                                    type="text"
                                    placeholder="0"
                                    value={cocSheet.combat?.build || '0'}
                                    onChange={(e) => setCoCCombat('build', e.target.value)}
                                    className="bg-black border border-white/10 text-center font-bold text-xs p-1 rounded mt-0.5 text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {sheetTab === 'sanity' && (
                            <div className="space-y-3.5 text-left max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                              {/* Toggle options for temporary/indefinite insanity */}
                              <div className="grid grid-cols-2 gap-2 bg-black/55 p-2 rounded-xl border border-magic/10">
                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox"
                                    checked={cocSheet.sanity?.tempInsane || false}
                                    onChange={(e) => setCoCSanityField('tempInsane', e.target.checked)}
                                    className="accent-magic h-3 w-3"
                                  />
                                  <span className="text-[9px] text-zinc-300 leading-none">Insanidade Temporária</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox"
                                    checked={cocSheet.sanity?.indefInsane || false}
                                    onChange={(e) => setCoCSanityField('indefInsane', e.target.checked)}
                                    className="accent-magic h-3 w-3"
                                  />
                                  <span className="text-[9px] text-zinc-300 leading-none">Insanidade Indefinida</span>
                                </label>
                              </div>

                              {/* Historical and descriptive insanity fields */}
                              <div className="space-y-2 text-[10px]">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-magic uppercase font-black">Histórico de Perdas</span>
                                  <input 
                                    type="text"
                                    placeholder="Ex: -5 em sanidade após testemunhar criatura"
                                    value={cocSheet.sanity?.lossHistory || ''}
                                    onChange={(e) => setCoCSanityField('lossHistory', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-stone-200 text-[10px]"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Traumas Mentais</span>
                                    <input 
                                      type="text"
                                      value={cocSheet.sanity?.traumas || ''}
                                      onChange={(e) => setCoCSanityField('traumas', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-stone-200 text-[10px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Fobias</span>
                                    <input 
                                      type="text"
                                      value={cocSheet.sanity?.phobias || ''}
                                      onChange={(e) => setCoCSanityField('phobias', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-stone-200 text-[10px]"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Manias</span>
                                    <input 
                                      type="text"
                                      value={cocSheet.sanity?.manias || ''}
                                      onChange={(e) => setCoCSanityField('manias', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-stone-200 text-[10px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5 sm:col-span-2">
                                    <span className="text-[7px] text-[#ffa500] font-bold uppercase">Encontros Paranormais & Horrores</span>
                                    <textarea 
                                      rows={2}
                                      value={cocSheet.sanity?.encounters || ''}
                                      onChange={(e) => setCoCSanityField('encounters', e.target.value)}
                                      className="bg-black/60 border border-[#ffa500]/25 rounded p-1 text-[#ffa500] text-[9px] resize-none font-sans italic w-full focus:outline-none focus:border-[#ffa500]/50"
                                    />
                                  </div>
                                </div>

                                {/* Thematic mental disorder visual lists */}
                                <div className="space-y-3.5 border-t border-magic/10 pt-3">
                                  <span className="text-[7.5px] uppercase font-black text-magic tracking-widest block font-cinzel">Sintomatologia & Quadros Clínicos (Cards Temáticos)</span>
                                  
                                  {/* Traumas Perenes visual cards */}
                                  <div className="bg-black/40 border border-magic/10 p-2.5 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <span className="text-[7.5px] font-bold uppercase text-red-500 font-mono">🧠 Traumas & Ruínas Psíquicas</span>
                                      <div className="flex gap-1 items-center">
                                        <input
                                          type="text"
                                          placeholder="Novo trauma..."
                                          value={newTraumaText}
                                          onChange={(e) => setNewTraumaText(e.target.value)}
                                          className="bg-black border border-magic/20 text-[8px] p-1 rounded-md text-white placeholder-stone-600 focus:outline-none focus:border-magic/40 w-28"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            addThematicCard('traumasList', newTraumaText);
                                            setNewTraumaText('');
                                          }}
                                          className="p-1 px-1.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-500/30 text-[7.5px] font-black rounded-md cursor-pointer uppercase font-mono"
                                        >
                                          Injetar
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {(cocSheet.sanity?.traumasList || []).map((tr: string, i: number) => (
                                        <div key={i} className="bg-red-950/20 border border-red-500/25 p-1 px-2 rounded-lg text-red-300 text-[8px] flex items-center gap-1.5 font-mono shadow-sm">
                                          <span>💀 {tr}</span>
                                          <button
                                            type="button"
                                            onClick={() => deleteThematicCard('traumasList', i)}
                                            className="text-red-500 hover:text-red-300 font-bold ml-1 cursor-pointer leading-none"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                      {(cocSheet.sanity?.traumasList || []).length === 0 && (
                                        <span className="text-[8px] text-stone-600 italic">Mente estável sem traumas permanentes.</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Fobias e Manias dual lists cards */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* Fobias */}
                                    <div className="bg-black/40 border border-magic/10 p-2.5 rounded-xl space-y-2">
                                      <div className="flex items-center justify-between gap-1 flex-wrap">
                                        <span className="text-[7.5px] font-bold uppercase text-blue-400 font-mono">🕷️ Fobias</span>
                                        <div className="flex gap-1 items-center">
                                          <input
                                            type="text"
                                            placeholder="Nova fobia..."
                                            value={newPhobiaText}
                                            onChange={(e) => setNewPhobiaText(e.target.value)}
                                            className="bg-black border border-magic/20 text-[8px] p-1 rounded-md text-white placeholder-stone-600 focus:outline-none focus:border-magic/40 w-24"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              addThematicCard('phobiasList', newPhobiaText);
                                              setNewPhobiaText('');
                                            }}
                                            className="p-1 px-1.5 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-magic/20 text-[7.5px] font-black rounded-md cursor-pointer uppercase font-mono"
                                          >
                                            Injetar
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {(cocSheet.sanity?.phobiasList || []).map((ph: string, i: number) => (
                                          <div key={i} className="bg-blue-950/20 border border-magic/20 p-1 px-2 rounded-lg text-blue-200 text-[8px] flex items-center gap-1.5 font-mono">
                                            <span>🕷️ {ph}</span>
                                            <button
                                              type="button"
                                              onClick={() => deleteThematicCard('phobiasList', i)}
                                              className="text-blue-500 hover:text-blue-300 font-bold ml-1 cursor-pointer leading-none"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        ))}
                                        {(cocSheet.sanity?.phobiasList || []).length === 0 && (
                                          <span className="text-[8px] text-stone-600 italic">Nenhuma fobia catalogada.</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Manias */}
                                    <div className="bg-black/40 border border-magic/10 p-2.5 rounded-xl space-y-2">
                                      <div className="flex items-center justify-between gap-1 flex-wrap">
                                        <span className="text-[7.5px] font-bold uppercase text-purple-400 font-mono">🔮 Manias</span>
                                        <div className="flex gap-1 items-center">
                                          <input
                                            type="text"
                                            placeholder="Nova mania..."
                                            value={newManiaText}
                                            onChange={(e) => setNewManiaText(e.target.value)}
                                            className="bg-black border border-magic/20 text-[8px] p-1 rounded-md text-white placeholder-stone-600 focus:outline-none focus:border-magic/40 w-24"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              addThematicCard('maniasList', newManiaText);
                                              setNewManiaText('');
                                            }}
                                            className="p-1 px-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/20 text-[7.5px] font-black rounded-md cursor-pointer uppercase font-mono"
                                          >
                                            Injetar
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {(cocSheet.sanity?.maniasList || []).map((mn: string, i: number) => (
                                          <div key={i} className="bg-purple-950/20 border border-purple-500/25 p-1 px-2 rounded-lg text-purple-200 text-[8px] flex items-center gap-1.5 font-mono">
                                            <span>🎭 {mn}</span>
                                            <button
                                              type="button"
                                              onClick={() => deleteThematicCard('maniasList', i)}
                                              className="text-purple-400 hover:text-purple-200 font-bold ml-1 cursor-pointer leading-none"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        ))}
                                        {(cocSheet.sanity?.maniasList || []).length === 0 && (
                                          <span className="text-[8px] text-stone-600 italic">Nenhuma mania catalogada.</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {sheetTab === 'backstory' && (
                            <div className="space-y-3.5 text-left max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                              <span className="text-[8px] text-magic font-cinzel font-black uppercase tracking-wider block">Dados Pessoais & Lore</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Descrição</span>
                                  <input 
                                    type="text"
                                    value={cocSheet.backstory?.personalDesc || ''}
                                    onChange={(e) => setCoCBackstoryField('personalDesc', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[10px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Ideologia / Crença</span>
                                  <input 
                                    type="text"
                                    value={cocSheet.backstory?.ideology || ''}
                                    onChange={(e) => setCoCBackstoryField('ideology', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[10px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Pessoas Chave</span>
                                  <input 
                                    type="text"
                                    value={cocSheet.backstory?.significantPeople || ''}
                                    onChange={(e) => setCoCBackstoryField('significantPeople', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[10px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Santuários/Locais</span>
                                  <input 
                                    type="text"
                                    value={cocSheet.backstory?.meaningfulLocations || ''}
                                    onChange={(e) => setCoCBackstoryField('meaningfulLocations', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[10px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Relíquias</span>
                                  <input 
                                    type="text"
                                    value={cocSheet.backstory?.treasuredPossessions || ''}
                                    onChange={(e) => setCoCBackstoryField('treasuredPossessions', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[10px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Marcas/Feridas</span>
                                  <input 
                                    type="text"
                                    value={cocSheet.backstory?.injuries || ''}
                                    onChange={(e) => setCoCBackstoryField('injuries', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[10px]"
                                  />
                                </div>
                              </div>

                              {/* Forbidden lore items at the bottom */}
                              <span className="text-[7px] text-red-400 font-mono block tracking-widest pt-1.5 border-t border-red-500/15 uppercase">
                                ✦ Conhecimento Proibido do Investigador ✦
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-stone-500">Tomos Arcanos</span>
                                  <input 
                                    type="text"
                                    placeholder="Ex: Necronomicon"
                                    value={cocSheet.backstory?.arcaneTomes || ''}
                                    onChange={(e) => setCoCBackstoryField('arcaneTomes', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-xs text-stone-200"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-stone-500">Feitiços</span>
                                  <input 
                                    type="text"
                                    placeholder="Ex: Invocar Símbolo Draconiano"
                                    value={cocSheet.backstory?.spells || ''}
                                    onChange={(e) => setCoCBackstoryField('spells', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-xs text-stone-200"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {sheetTab === 'inventory' && (
                            <div className="space-y-3.5 text-left max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-magic uppercase font-black">Equipamentos Carregados</span>
                                  <textarea 
                                    rows={2}
                                    value={cocSheet.inventory?.equipment || ''}
                                    onChange={(e) => setCoCInventoryField('equipment', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1.5 text-[10px] text-white font-sans resize-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-magic uppercase font-black">Outros Pertences</span>
                                  <textarea 
                                    rows={2}
                                    value={cocSheet.inventory?.possessions || ''}
                                    onChange={(e) => setCoCInventoryField('possessions', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1.5 text-[10px] text-white font-sans resize-none"
                                  />
                                </div>
                              </div>

                              {/* Visual Inventory Grid with custom inputs */}
                              <div className="space-y-2 border-t border-magic/10 pt-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="text-[7.5px] font-bold uppercase text-magic font-mono">🎒 Equipamentos de Destaque (Cards Visuais)</span>
                                  <div className="flex gap-1 items-center">
                                    <select
                                      value={newQuickItemIcon}
                                      onChange={(e) => setNewQuickItemIcon(e.target.value)}
                                      className="bg-black border border-magic/20 text-[10px] p-0.5 rounded text-white"
                                    >
                                      {['📖', '🔦', '🔑', '🧭', '🔍', '💼', '🧪', '🩹', '📷', '📜', '🎒'].map(icon => (
                                        <option key={icon} value={icon}>{icon}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="Nome do item..."
                                      value={newQuickItemName}
                                      onChange={(e) => setNewQuickItemName(e.target.value)}
                                      className="bg-black border border-magic/20 text-[8px] p-1 rounded-md text-white placeholder-stone-600 focus:outline-none focus:border-magic/40 w-28"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        addQuickItem(newQuickItemName, newQuickItemIcon);
                                        setNewQuickItemName('');
                                      }}
                                      className="p-1 px-1.5 bg-magic/20 hover:bg-magic/40 text-stone-200 border border-magic/30 text-[7.5px] font-black rounded-md cursor-pointer uppercase font-mono"
                                    >
                                      Injetar
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {(cocSheet.inventory?.quickItems || []).map((item: any) => (
                                    <div key={item.id} className="bg-black/60 border border-magic/15 p-2 rounded-xl flex items-center gap-2 relative group hover:border-[#ffa500]/30 transition-all shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                                      <span className="text-xl">{item.icon}</span>
                                      <div className="flex-1 min-w-0 pr-2">
                                        <div className="text-[9px] font-bold text-stone-200 truncate">{item.name}</div>
                                        <div className="text-[7px] text-stone-500 font-mono">Destaque</div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => deleteQuickItem(item.id)}
                                        className="absolute top-1 right-1 text-red-500 opacity-60 hover:opacity-100 hover:text-red-350 cursor-pointer text-[10px] font-bold leading-none"
                                        title="Remover"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                  {(cocSheet.inventory?.quickItems || []).length === 0 && (
                                    <div className="col-span-2 sm:col-span-4 text-center py-2 text-[8.5px] text-stone-600 italic">
                                      Inventário visual vazio. Injete objetos de valor ou ferramentas acima para criar cards!
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {sheetTab === 'resources' && (
                            <div className="space-y-3 text-left max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                              <span className="text-[7.5px] text-emerald-400 font-cinzel font-black block tracking-widest uppercase">💳 Controle de Bens & Tesouraria</span>
                              
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Dinheiro Vivo ($)</span>
                                  <input 
                                    type="text"
                                    placeholder="Ex: $50"
                                    value={cocSheet.inventory?.money || ''}
                                    onChange={(e) => setCoCInventoryField('money', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[11px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Patrimônio / Bens Possuídos</span>
                                  <input 
                                    type="text"
                                    placeholder="Ex: $12000"
                                    value={cocSheet.inventory?.assets || ''}
                                    onChange={(e) => setCoCInventoryField('assets', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[11px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Nível de Gastos Permitido</span>
                                  <input 
                                    type="text"
                                    placeholder="Ex: $10"
                                    value={cocSheet.inventory?.spendingLevel || ''}
                                    onChange={(e) => setCoCInventoryField('spendingLevel', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[11px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7px] text-zinc-400 font-bold uppercase">Rendimentos / Salário Mensal</span>
                                  <input 
                                    type="text"
                                    placeholder="Ex: $350"
                                    value={cocSheet.inventory?.income || ''}
                                    onChange={(e) => setCoCInventoryField('income', e.target.value)}
                                    className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[11px]"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-0.5 mt-2.5">
                                <span className="text-[7px] text-magic uppercase font-black">Imóveis & Propriedades Adquiridas</span>
                                <textarea 
                                  rows={1.5}
                                  placeholder="Casas, terrenos, galpões de pesquisa..."
                                  value={cocSheet.inventory?.properties || ''}
                                  onChange={(e) => setCoCInventoryField('properties', e.target.value)}
                                  className="bg-black/60 border border-magic/15 rounded p-1.5 text-[10px] text-stone-200 font-sans resize-none"
                                />
                              </div>

                              <div className="flex flex-col gap-0.5 font-sans">
                                <span className="text-[7px] text-magic uppercase font-black">Bens Móveis de Valor</span>
                                <textarea 
                                  rows={1.5}
                                  placeholder="Carros de época, relógios de ouro, quadros valiosos..."
                                  value={cocSheet.inventory?.valuables || ''}
                                  onChange={(e) => setCoCInventoryField('valuables', e.target.value)}
                                  className="bg-black/60 border border-magic/15 rounded p-1.5 text-[10px] text-stone-200 resize-none"
                                />
                              </div>

                              <div className="flex flex-col gap-0.5 font-sans">
                                <span className="text-[7px] text-magic uppercase font-black">Notas & Diário de Finanças</span>
                                <textarea 
                                  rows={1.5}
                                  placeholder="Linhas de crédito, dívidas, empréstimos em segredo..."
                                  value={cocSheet.inventory?.financialNotes || ''}
                                  onChange={(e) => setCoCInventoryField('financialNotes', e.target.value)}
                                  className="bg-black/60 border border-magic/15 rounded p-1.5 text-[10px] text-stone-200 resize-none"
                                />
                              </div>
                            </div>
                          )}

                          {sheetTab === 'companions' && (
                            <div className="space-y-3.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] text-magic uppercase font-bold tracking-wider">Companheiros Ativos</span>
                                <button
                                  type="button"
                                  onClick={addCompanion}
                                  className="flex items-center gap-0.5 text-[8px] bg-magic/20 hover:bg-magic/40 border border-magic/40 text-white rounded px-2 py-0.5 cursor-pointer"
                                >
                                  <Plus size={8} /> ADICIONAR
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
                                {(!cocSheet.companions || cocSheet.companions.length === 0) ? (
                                  <p className="text-[9px] text-stone-500 italic text-center p-2 col-span-2">Nenhum companheiro registrado.</p>
                                ) : (
                                  cocSheet.companions.map((c: any) => (
                                    <div key={c.id} className="bg-black/55 border border-magic/10 p-2 rounded-lg relative flex flex-col gap-1">
                                      <button 
                                        type="button"
                                        onClick={() => deleteCompanion(c.id)}
                                        className="absolute top-1 right-1 p-0.5 border border-red-500/15 text-red-400 hover:bg-red-950/40 hover:border-red-500/40 rounded text-[7px]"
                                      >
                                        <Trash2 size={8} />
                                      </button>

                                      <div className="flex flex-col gap-0.5 text-[10px]">
                                        <span className="text-[7px] text-stone-500">Nome</span>
                                        <input 
                                          type="text"
                                          value={c.name}
                                          onChange={(e) => updateCompanion(c.id, 'name', e.target.value)}
                                          className="bg-zinc-900 border border-white/5 text-[9px] p-0.5 rounded text-white"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-1 text-[9px]">
                                        <div className="flex flex-col">
                                          <span className="text-[7px] text-stone-500">Jogador</span>
                                          <input 
                                            type="text"
                                            value={c.player}
                                            onChange={(e) => updateCompanion(c.id, 'player', e.target.value)}
                                            className="bg-zinc-900 border border-white/5 text-[8px] p-0.5 rounded text-white"
                                          />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[7px] text-stone-500">Vínculo</span>
                                          <input 
                                            type="text"
                                            value={c.relation}
                                            onChange={(e) => updateCompanion(c.id, 'relation', e.target.value)}
                                            className="bg-zinc-900 border border-white/5 text-[8px] p-0.5 rounded text-white"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {sheetTab === 'references' && (
                            <div className="space-y-3.5 text-left max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                              {/* Interactive success grade simulator */}
                              <div className="bg-[#121c24]/80 p-2.5 rounded-xl border border-magic/30 space-y-1.5">
                                <span className="text-[8px] text-magic font-black uppercase tracking-wider block">📐 Simulador Dinâmico de Graus de Sucesso</span>
                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] text-stone-400">Insira Perícia Base:</span>
                                  <input 
                                    type="number"
                                    placeholder="60"
                                    defaultValue={60}
                                    className="bg-black border border-magic/30 text-center text-[10px] font-black p-1 rounded w-12 text-white focus:outline-none focus:border-magic"
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      const reg = document.getElementById('ref-reg');
                                      const hard = document.getElementById('ref-hard');
                                      const extreme = document.getElementById('ref-extreme');
                                      const fumble = document.getElementById('ref-fumble');
                                      if (reg) reg.innerText = `${val}`;
                                      if (hard) hard.innerText = `${Math.floor(val / 2)}`;
                                      if (extreme) extreme.innerText = `${Math.floor(val / 5)}`;
                                      if (fumble) fumble.innerText = val < 50 ? '96 - 100' : '100';
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-4 gap-1 text-center font-mono text-[8px] mt-1 pt-1">
                                  <div className="bg-black/45 p-1 rounded border border-white/5">
                                    <span className="text-stone-500 uppercase block text-[6px]">Reg</span>
                                    <span id="ref-reg" className="font-bold text-white text-[10px] mt-0.5 block">60</span>
                                  </div>
                                  <div className="bg-black/45 p-1 rounded border border-white/5">
                                    <span className="text-magic uppercase block text-[6px]">Difícil</span>
                                    <span id="ref-hard" className="font-bold text-magic text-[10px] mt-0.5 block">30</span>
                                  </div>
                                  <div className="bg-black/45 p-1 rounded border border-white/5">
                                    <span className="text-purple-400 uppercase block text-[6px]">Extremo</span>
                                    <span id="ref-extreme" className="font-bold text-purple-300 text-[10px] mt-0.5 block">12</span>
                                  </div>
                                  <div className="bg-black/45 p-1 rounded border border-white/5">
                                    <span className="text-red-400 block text-[6px]">Desastre</span>
                                    <span id="ref-fumble" className="font-bold text-red-300 text-[8px] mt-0.5 block">96 - 100</span>
                                  </div>
                                </div>
                              </div>

                              {/* Simple rule snippets */}
                              <div className="space-y-1.5 text-[10px]">
                                <div className="bg-black/40 p-2 rounded border border-white/5">
                                  <span className="text-[8px] uppercase tracking-wider text-green-400 font-extrabold block">🩹 Cura Física</span>
                                  <p className="text-[9px] text-stone-300 leading-normal font-sans">
                                    Recupera <strong>+1 PV por dia</strong> de repouso absoluto. Teste de <strong>Medicina</strong> bem-sucedido cura +1D3 PV adicionais por semana.
                                  </p>
                                </div>
                                <div className="bg-black/40 p-2 rounded border border-white/5">
                                  <span className="text-[8px] uppercase tracking-wider text-[#ffa500] font-extrabold block">🩺 Primeiros Socorros</span>
                                  <p className="text-[9px] text-stone-300 leading-normal font-sans">
                                    Aplicado imediatamente após o trauma. Restaura exatamente <strong>+1 PV fixo</strong> e estabiliza moribundos.
                                  </p>
                                </div>
                                <div className="bg-black/40 p-2 rounded border border-white/5">
                                  <span className="text-[8px] uppercase tracking-wider text-red-500 font-extrabold block">💀 Lesão Grave</span>
                                  <p className="text-[9px] text-stone-300 leading-normal font-sans">
                                    Dano único maior ou igual à metade de PV Máximos causa <strong>Lesão Grave</strong>. Se PV cair para 0 sob Lesão Grave, entra em estado moribundo!
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interactive footer details */}
                        <div className="pt-2 border-t border-[#4da3ff]/10 text-center flex items-center justify-between">
                          <p className="text-[8px] text-magic/30 font-mono italic">
                            "Os deuses antigos decifram seus caminhos em segredo."
                          </p>
                          <Button 
                            variant="primary"
                            size="sm"
                            type="button"
                            onClick={handleSaveCharacterSheet}
                            loading={savingSheet}
                            className="text-[8px] py-1 px-2.5 h-auto rounded border border-magic/20 bg-magic/5 text-white scale-90"
                          >
                            <Save size={8} className="mr-1" /> FORÇAR SALVAMENTO
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: Dice roller + live table roll logs (4 Columns) */}
                  <div className="lg:col-span-4 bg-black/75 border border-magic/15 p-5 rounded-2xl flex flex-col justify-between shadow-2xl min-h-[480px]">
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="border-b border-magic/20 pb-2">
                        <h3 className="text-xs font-cinzel font-black text-magic tracking-widest flex items-center gap-1.5">
                          <Dices size={14} />
                          CONJURADOR DE DADOS ORACULAR
                        </h3>
                      </div>

                      {/* Dice buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                          <button
                            key={sides}
                            onClick={() => handleRollPlayerDice(sides)}
                            disabled={rollingDice !== null}
                            className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                              rollingDice === sides
                                ? 'bg-magic/20 border-magic shadow-[0_0_15px_rgba(77,163,255,0.3)] scale-95'
                                : 'bg-black/50 border-magic/15 hover:border-magic/45 hover:bg-magic/5'
                            }`}
                          >
                            <span className="text-[8px] font-mono text-magic font-bold">D{sides}</span>
                            <div className="w-7 h-7 rounded-full bg-magic/10 border border-magic/30 flex items-center justify-center text-magic shadow-inner font-cinzel text-[10px] font-black">
                              {sides}
                            </div>
                          </button>
                        ))}
                        {/* Screen Result indicator */}
                        <div className="col-span-1 p-1 rounded-lg border border-magic/20 bg-gradient-to-t from-magic/5 to-transparent flex flex-col items-center justify-center relative overflow-hidden md:h-16">
                          <AnimatePresence mode="wait">
                            {rollingDice ? (
                              <motion.div
                                key="rolling"
                                animate={{ rotate: -360, scale: [0.9, 1.1, 0.9] }}
                                transition={{ repeat: Infinity, duration: 0.6 }}
                                className="text-magic"
                              >
                                <Dices size={15} />
                              </motion.div>
                            ) : lastRollResult !== null ? (
                              <motion.div
                                key="result"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1.1 }}
                                className="text-center"
                              >
                                <span className="text-[7px] uppercase tracking-wider text-stone-500 block">Dados</span>
                                <span className="font-cinzel text-sm sm:text-base font-black text-magic leading-none">
                                  {lastRollResult}
                                </span>
                              </motion.div>
                            ) : (
                              <span className="text-[8px] text-[#4da3ff]/60 uppercase font-cinzel leading-none select-none">Espere</span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* live Table dice logs */}
                      <div className="flex-1 flex flex-col min-h-[220px] bg-black/40 border border-magic/10 rounded-xl p-3.5 space-y-2 mt-2">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1">
                          <span className="text-[9px] uppercase tracking-widest text-magic font-black flex items-center gap-1">
                            <MessageSquare size={10} />
                            Logs de Atividade da Mesa
                          </span>
                          <span className="text-[8px] text-white/30 font-mono">Real-time</span>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[260px] space-y-1.5 pr-1 scrollbar-thin">
                          {recentRolls.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-3">
                              <p className="text-[9px] text-white/30 italic">Poeira assenta tranquila na mesa...</p>
                            </div>
                          ) : (
                            recentRolls.map((roll) => (
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={roll.id}
                                className="p-1.5 border border-white/5 bg-black/50 rounded flex items-center justify-between text-stone-300 leading-none"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-bold ${roll.rollerName.includes('Mestre') ? 'text-gold' : 'text-magic'}`}>
                                    {roll.rollerName}
                                  </span>
                                  <span className="text-[9px] text-white/30">rolou:</span>
                                  <span className="font-mono text-[9px] font-black bg-stone-900 border border-white/5 px-1.5 py-0.2 rounded text-white-85">
                                    D{roll.sides}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-cinzel text-[11px] font-black text-magic border border-magic/20 px-1.5 py-0.5 rounded bg-black">
                                    {roll.result}
                                  </span>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            ) : (
              
              <motion.div
                key="menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 pb-24"
              >
                {/* Title identification */}
                <div className="text-center py-6 space-y-1.5">
                  <div className="w-12 h-12 mx-auto rounded-full border border-magic/30 flex items-center justify-center bg-black/60 shadow-[0_0_20px_rgba(77,163,255,0.15)] mb-2 group">
                    <Sword size={24} className="text-magic animate-pulse" />
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-cinzel font-black tracking-[0.25em] text-magic">
                    PORTAL JOGADOR
                  </h1>
                  <p className="text-[11px] text-magic/60 tracking-[0.2em] uppercase font-sans font-black">
                    Sua saga nas crônicas de REALMOR
                  </p>
                </div>

                {/* Desktop Tabs Header Selector */}
                <div className="hidden md:flex items-center justify-center gap-3 max-w-2xl mx-auto pb-4 border-b border-magic/15">
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`px-5 py-2.5 border rounded-xl font-cinzel font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'campaigns' 
                        ? 'bg-magic/10 border-magic text-magic shadow-[0_0_15px_rgba(77,163,255,0.2)]'
                        : 'border-magic/20 hover:border-magic/50 text-stone-400 hover:text-white'
                    }`}
                  >
                    <BookOpen size={14} />
                    Campanhas
                  </button>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className={`px-5 py-2.5 border rounded-xl font-cinzel font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'rooms' 
                        ? 'bg-magic/10 border-magic text-magic shadow-[0_0_15px_rgba(77,163,255,0.2)]'
                        : 'border-magic/20 hover:border-magic/50 text-stone-400 hover:text-white'
                    }`}
                  >
                    <Compass size={14} />
                    Salas
                  </button>
                  <button
                    onClick={() => setActiveTab('characters')}
                    className={`px-5 py-2.5 border rounded-xl font-cinzel font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'characters' 
                        ? 'bg-magic/10 border-magic text-magic shadow-[0_0_15px_rgba(77,163,255,0.2)]'
                        : 'border-magic/20 hover:border-magic/50 text-stone-400 hover:text-white'
                    }`}
                  >
                    <Sword size={14} />
                    Personagens
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-5 py-2.5 border rounded-xl font-cinzel font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'settings' 
                        ? 'bg-magic/10 border-magic text-magic shadow-[0_0_15px_rgba(77,163,255,0.2)]'
                        : 'border-magic/20 hover:border-magic/50 text-stone-400 hover:text-white'
                    }`}
                  >
                    <Settings size={14} />
                    Configurações
                  </button>
                </div>

                {/* --- TAB: CAMPANHAS --- */}
                {activeTab === 'campaigns' && (
                  <div className="space-y-6">
                    <div className="space-y-5 pt-4 max-w-6xl mx-auto px-4">
                      <div className="flex items-center justify-between border-b border-magic/20 pb-2">
                        <span className="text-xs font-cinzel font-black tracking-[0.25em] text-magic">
                          📜 CAMPANHAS QUE VOCÊ PARTICIPA ({joinedRooms.length})
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 hidden sm:inline">CRÔNICAS DE AVENTURA ATIVAS</span>
                      </div>

                      {loadingJoinedRooms ? (
                        <div className="text-center py-12">
                          <p className="text-xs text-white/40 italic animate-pulse">Sintonizando portais e crônicas...</p>
                        </div>
                      ) : joinedRooms.length === 0 ? (
                        <div className="border border-magic/20 bg-black/20 p-12 text-center rounded-2xl space-y-4 max-w-md mx-auto">
                          <BookOpen size={36} className="text-stone-600 mx-auto" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold font-cinzel text-magic">Nenhuma Campanha Vinculada</p>
                            <p className="text-[11px] text-white/40">Entre em uma sala de RPG primeiro usando o código da aventura para visualizar as campanhas.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Map unique campaigns by campaignId/campaignName */}
                          {Array.from(new Map(joinedRooms.map(r => [r.campaignId || r.campaignName, r])).values()).map((room) => (
                            <div
                              key={room.id}
                              className="bg-[#0b090a]/85 border border-magic/20 p-4 rounded-xl flex flex-col md:flex-row gap-4 hover:border-magic/50 shadow-2xl transition-all duration-300 relative group overflow-hidden text-left"
                            >
                              <div className="w-full md:w-32 h-36 rounded-lg overflow-hidden border border-magic/15 bg-cover bg-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${room.coverUrl})` }} />
                              <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                                <div className="space-y-1">
                                  <span className="text-[8px] uppercase tracking-wider text-magic font-extrabold px-1.5 py-0.5 rounded bg-magic/10 border border-magic/20 italic w-fit block">
                                    Jogador Convocado
                                  </span>
                                  <h4 className="font-cinzel text-sm sm:text-base font-black text-gold-gradient mt-1 tracking-wide truncate">
                                    {room.campaignName}
                                  </h4>
                                  <p className="text-[10px] text-stone-400 italic">Mesa ativa: {room.roomName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-stone-300 font-sans">
                                  <span className="text-stone-500">Sistema: <strong className="text-white">{room.system || 'Call of Cthulhu'}</strong></span>
                                  <span className="text-stone-500">Status: <strong className="text-[#ffa500]">{room.status || 'Ativa'}</strong></span>
                                </div>
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[9px] text-stone-500">Emblemagem: REALMOR</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEnterCockpit(room)}
                                    className="text-[9px] uppercase tracking-wider border border-magic/25 py-0.5 px-2 bg-magic/5 text-magic rounded"
                                  >
                                    Entrar Mesa
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- TAB: SALAS --- */}
                {activeTab === 'rooms' && (
                  <div className="space-y-8">
                    {/* Enter by Code form */}
                    <div className="max-w-md mx-auto px-4 mt-2">
                      <form onSubmit={handleJoinByCode} className="bg-black/90 border border-magic/25 p-5 rounded-2xl space-y-4 shadow-2xl text-center">
                        <div className="space-y-1.5">
                          <div className="w-11 h-11 mx-auto rounded-full bg-magic/5 border border-magic/30 flex items-center justify-center text-magic shadow-inner">
                            <Key size={18} />
                          </div>
                          <h3 className="font-cinzel text-xs font-black text-magic tracking-widest uppercase">
                            ENTRAR EM NOVA SALA
                          </h3>
                          <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
                            Forneça o selo místico de entrada configurado pelo Mestre (Ex: CTH-XXXX)
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            maxLength={10}
                            placeholder="CTH-XXXX"
                            className="mythos-input text-center text-sm uppercase tracking-widest flex-1 py-1.5 border-magic/25 text-magic focus:border-magic/60 focus:bg-black font-mono font-extrabold"
                            value={entryCodeInput}
                            onChange={(e) => setEntryCodeInput(e.target.value)}
                          />

                          <Button
                            variant="primary"
                            type="submit"
                            loading={submittingJoin}
                            className="py-1.5 px-4 h-auto uppercase font-black font-cinzel tracking-wider text-[10px] bg-magic hover:bg-blue-600 border border-magic/40 text-black shrink-0"
                          >
                            ENTRAR
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Joined Rooms collection list */}
                    <div className="space-y-5 pt-2 max-w-6xl mx-auto px-4 text-left">
                      <div className="flex items-center justify-between border-b border-[#4da3ff]/20 pb-2">
                        <span className="text-xs font-cinzel font-black text-magic tracking-widest">
                          🛡️ SUAS MESAS CONECTADAS ({joinedRooms.length})
                        </span>
                        <span className="text-[10px] bg-magic/10 text-magic px-2 py-0.5 rounded border border-magic/20 font-bold hidden sm:inline">
                          Conexões Autênticas
                        </span>
                      </div>

                      {loadingJoinedRooms ? (
                        <div className="text-center py-12">
                          <div className="w-8 h-8 border-2 border-magic/20 border-t-magic rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-xs text-white/40 italic">Invocando portais catalogados...</p>
                        </div>
                      ) : joinedRooms.length === 0 ? (
                        <div className="border border-magic/20 bg-black/20 p-10 rounded-2xl text-center space-y-3 max-w-md mx-auto">
                          <Ghost size={40} className="mx-auto text-magic/20 animate-pulse" />
                          <div className="space-y-1">
                            <h3 className="font-cinzel text-xs font-bold text-magic tracking-wide">Nenhuma Conexão Ativa Encontrada</h3>
                            <p className="text-[11px] text-stone-400 font-sans">Sua energia investigativa ainda não adentrou em nenhuma sala de RPG.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {joinedRooms.map((room) => (
                            <div
                              key={room.id}
                              className="bg-[#0b090a]/85 border border-magic/20 p-5 rounded-2xl flex flex-col md:flex-row gap-5 hover:border-magic/50 shadow-2xl transition-all duration-300 relative group overflow-hidden text-left"
                            >
                              <div className="w-full md:w-36 h-36 rounded-xl overflow-hidden border border-magic/15 bg-cover bg-center shrink-0 shadow-inner group-hover:scale-[1.03] transition-transform duration-500" style={{ backgroundImage: `url(${room.coverUrl})` }} />

                              <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div className="space-y-1 relative pr-6">
                                  <span className="text-[8px] uppercase tracking-wider text-magic font-extrabold px-1.5 py-0.5 rounded bg-magic/10 border border-magic/20 italic w-fit block font-sans">
                                    Mesa de {room.system}
                                  </span>
                                  
                                  <h4 className="font-cinzel text-base font-black text-gold-gradient mt-1.5 tracking-wide truncate">
                                    {room.roomName}
                                  </h4>
                                  
                                  <p className="text-[10px] text-white/40 truncate">Crônica: {room.campaignName}</p>
                                  
                                  <button
                                    onClick={() => handleLeaveRoom(room.id)}
                                    className="absolute top-0 right-0 p-1 text-red-500/60 hover:text-red-400 rounded transition-colors text-[10px]"
                                    title="Romper conexão da mesa"
                                  >
                                    Sair
                                  </button>
                                </div>

                                <p className="text-[9px] text-stone-400 italic line-clamp-2 bg-black/40 p-2 rounded border border-white/5 my-2">
                                  "{room.notes || 'Nenhuma preleção configurada pelo mestre.'}"
                                </p>

                                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[9px] font-mono font-bold text-magic">
                                    Código: {room.entryCode}
                                  </span>
                                  
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleEnterCockpit(room)}
                                    className="text-[10px] uppercase font-black bg-magic hover:bg-blue-600 text-black py-1.5 px-4 rounded h-auto tracking-wider font-cinzel"
                                  >
                                    ATRAVESSAR PORTAL
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- TAB: PERSONAGENS --- */}
                {activeTab === 'characters' && (
                  <div className="space-y-6 animate-fadeIn">
                    {selectedGlobalChar ? (
                      <div className="space-y-6 text-left max-w-4xl mx-auto">
                        {/* Upper Back Button & Saving indicator bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-magic/25 pb-4">
                          <button
                            onClick={() => setSelectedGlobalChar(null)}
                            className="flex items-center gap-2 text-xs text-magic hover:text-white tracking-widest font-cinzel font-black active:scale-95 transition-all bg-black/40 border border-magic/15 hover:border-magic/45 px-3.5 py-2.5 rounded-xl cursor-pointer hover:bg-magic/10 font-mono"
                          >
                            <ChevronLeft size={14} className="text-magic animate-pulse" />
                            ← VOLTAR À GALERIA DE AGENTES
                          </button>
                          
                          <div className="flex items-center gap-2.5">
                            {autoSaveStatus === 'saved' && <span className="text-[10px] font-mono text-emerald-500 font-extrabold bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-500/20">● SINCRO-GRAVADO (AUTO-SAVE)</span>}
                            {autoSaveStatus === 'saving' && <span className="text-[10px] font-mono text-magic font-extrabold bg-blue-950/20 px-2.5 py-1 rounded-lg border border-magic/20 animate-pulse">⏳ TRANSCREVENDO ALMA...</span>}
                            {autoSaveStatus === 'dirty' && <span className="text-[10px] font-mono text-amber-500 font-extrabold bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-500/20">⚠️ PENDENTE DE SINC...</span>}
                            
                            <Button 
                              variant="primary"
                              size="sm"
                              onClick={handleSaveCharacterSheet}
                              loading={savingSheet}
                              className="text-[10px] py-1.5 px-3.5 font-cinzel font-black uppercase tracking-wider bg-magic text-black rounded-lg"
                            >
                              <Save size={10} className="mr-1 inline" /> Salvar Ficha
                            </Button>
                          </div>
                        </div>

                        {/* Interactive Character Sheet Box */}
                        <div className="bg-black/90 border border-magic/20 p-5 rounded-2xl space-y-4 shadow-2xl relative flex flex-col justify-between">
                          
                          {/* Upper Profile Card */}
                          <div className="flex flex-col sm:flex-row gap-4 bg-black/45 p-4 rounded-xl border border-magic/10 relative overflow-hidden">
                            {/* Avatar portrait selection */}
                            <div className="flex flex-col items-center gap-2">
                              <div className="relative group cursor-pointer w-20 h-20 rounded-xl overflow-hidden border-2 border-magic/40 bg-zinc-900/80 shadow-[0_0_12px_rgba(77,163,255,0.2)] flex-shrink-0">
                                <img 
                                  src={cocSheet.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'} 
                                  alt="Avatar" 
                                  className="w-full h-full object-cover grayscale contrast-115 border-none"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[8px] text-white font-cinzel text-center p-1 leading-tight uppercase font-black font-mono">
                                  Link URL Abaixo
                                </div>
                              </div>
                              <input 
                                type="text"
                                placeholder="Link da foto"
                                value={cocSheet.avatarUrl || ''}
                                onChange={(e) => setCoCField('avatarUrl', e.target.value)}
                                className="bg-black border border-magic/10 text-[8px] font-mono p-1 rounded text-center w-20 text-magic/80 focus:outline-none focus:border-magic/40"
                              />
                            </div>

                            {/* Bio Inputs */}
                            <div className="flex-1 grid grid-cols-2 gap-2 text-left">
                              <div className="col-span-2 flex flex-col gap-0.5">
                                <span className="text-[8px] text-magic/50 uppercase font-bold tracking-widest leading-none">Nome do Investigador</span>
                                <input 
                                  type="text"
                                  value={characterName}
                                  placeholder="Ex: Harvey Walters"
                                  onChange={(e) => setCharacterName(e.target.value)}
                                  className="bg-black/60 border border-magic/15 rounded px-2.5 py-1 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-magic/40 font-cinzel uppercase"
                                />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] text-magic/50 uppercase font-bold tracking-widest leading-none">Ocupação / Ofício</span>
                                <input 
                                  type="text"
                                  value={characterClass}
                                  placeholder="Ex: Jornalista"
                                  onChange={(e) => setCharacterClass(e.target.value)}
                                  className="bg-black/60 border border-magic/15 rounded px-2.5 py-1 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-magic/40"
                                />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] text-magic/50 uppercase font-bold tracking-widest leading-none">Idade</span>
                                <input 
                                  type="text"
                                  value={cocSheet.age || ''}
                                  placeholder="Ex: 34 anos"
                                  onChange={(e) => setCoCField('age', e.target.value)}
                                  className="bg-black/60 border border-magic/15 rounded px-2.5 py-1 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-magic/40 text-center"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Quick Status Adjustments */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs select-none">
                            {/* Vida Quick Controls */}
                            <div className="bg-[#1a0e0e]/90 border border-[#b91c1c]/25 p-2 rounded-xl flex flex-col items-center justify-between shadow-sm relative overflow-hidden">
                              <span className="text-red-400 font-black text-[8px] tracking-widest uppercase flex items-center gap-1">❤️ Vida Atual</span>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-lg font-black text-red-200">{health}</span>
                                <span className="text-stone-500 font-bold text-[9px]">/ {cocSheet.maxHealth || 15}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 justify-center align-middle mt-2">
                                {[-5, -1, 1, 5].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => changeHealth(v)}
                                    className="px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer bg-red-950 font-mono text-red-200 border border-red-500/20 active:scale-93 hover:bg-red-900 transition-colors"
                                  >
                                    {v > 0 ? `+${v}` : v}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Sanidade Quick Controls */}
                            <div className="bg-[#0e2129]/90 border border-magic/25 p-2 rounded-xl flex flex-col items-center justify-between shadow-sm relative overflow-hidden">
                              <span className="text-blue-400 font-black text-[8px] tracking-widest uppercase flex items-center gap-1">🧠 Sanidade Atual</span>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-lg font-black text-blue-200">{sanity}%</span>
                                <span className="text-stone-500 font-bold text-[9px]">/ {cocSheet.maxSanity || 99}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 justify-center align-middle mt-2">
                                {[-5, -1, 1, 5].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => changeSanity(v)}
                                    className="px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer bg-blue-950 font-mono text-blue-200 border border-blue-500/20 active:scale-93 hover:bg-blue-900 transition-colors"
                                  >
                                    {v > 0 ? `+${v}` : v}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Sorte Quick Controls */}
                            <div className="bg-[#0e2518]/90 border border-emerald-900/40 p-2 rounded-xl flex flex-col items-center justify-between shadow-sm relative overflow-hidden">
                              <span className="text-emerald-400 font-black text-[8px] tracking-widest uppercase flex items-center gap-1">🍀 Sorte Atual</span>
                              <div className="flex items-center gap-1 mt-1.5">
                                <span className="text-lg font-black text-emerald-200">{cocSheet.luck || 50}%</span>
                              </div>
                              <div className="flex flex-wrap gap-1 justify-center align-middle mt-2">
                                {[-5, -1, 1, 5].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => changeLuck(v)}
                                    className="px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer bg-emerald-950 font-mono text-emerald-300 border border-emerald-500/20 active:scale-93 hover:bg-emerald-900 font-sans transition-colors"
                                  >
                                    {v > 0 ? `+${v}` : v}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Magia Quick Controls */}
                            <div className="bg-[#210e25]/95 border border-purple-900/30 p-2 rounded-xl flex flex-col items-center justify-between shadow-sm relative overflow-hidden">
                              <span className="text-purple-400 font-black text-[8px] tracking-widest uppercase flex items-center gap-1">✨ Pontos de Magia</span>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-lg font-black text-purple-200">{cocSheet.magic || 10}</span>
                                <span className="text-stone-500 font-bold text-[9px]">/ {cocSheet.maxMagic || 15}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 justify-center align-middle mt-2">
                                {[-5, -1, 1, 5].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => changeMagic(v)}
                                    className="px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer bg-purple-950 font-mono text-purple-200 border border-purple-500/20 active:scale-93 hover:bg-purple-900 transition-colors"
                                  >
                                    {v > 0 ? `+${v}` : v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* State of Combat and Event Log row */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pb-2">
                            {/* Estado de combate selector (5 columns) */}
                            <div className="md:col-span-5 bg-black/60 border border-white/5 p-3 rounded-xl space-y-2 text-left relative overflow-hidden select-none">
                              <span className="text-[7.5px] uppercase font-black text-magic tracking-wider block font-mono">Estado de Consciência (Combate)</span>
                              <div className="grid grid-cols-3 gap-1.5 text-center">
                                {['CONSCIENTE', 'INCONSCIENTE', 'MORRENDO'].map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => setCoCField('combatState', st)}
                                    className={`py-1.5 text-[8.5px] font-cinzel font-black tracking-wider transition-all rounded-lg cursor-pointer ${
                                      cocSheet.combatState === st 
                                        ? st === 'CONSCIENTE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold'
                                        : st === 'INCONSCIENTE' ? 'bg-amber-950 text-amber-400 border border-amber-500/30 font-bold'
                                        : 'bg-red-950 text-red-500 border border-red-500/30 font-bold animate-pulse'
                                        : 'bg-white/5 text-stone-500 hover:text-stone-300 border border-transparent'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Log de eventos automático (7 columns) */}
                            <div className="md:col-span-7 bg-zinc-950/80 border border-magic/15 p-3 rounded-xl flex flex-col justify-between font-mono text-[9px] relative overflow-hidden">
                              <div className="flex justify-between items-center text-stone-500 border-b border-white/5 pb-1 select-none">
                                <span className="text-[7.5px] uppercase font-black tracking-wider">HISTÓRICO DA CRÔNICA (LOG DE EVENTOS)</span>
                                <button
                                  type="button"
                                  onClick={() => setCoCField('eventLog', [])}
                                  className="text-[7.5px] hover:text-white underline cursor-pointer"
                                >
                                  LIMPAR DIÁRIO
                                </button>
                              </div>
                              <div className="max-h-[58px] min-h-[58px] overflow-y-auto mt-1 space-y-1 scrollbar-none text-stone-400 text-left">
                                {(!cocSheet.eventLog || cocSheet.eventLog.length === 0) ? (
                                  <p className="text-stone-600 italic text-[8.5px] pt-1">Nenhum evento registrado nesta sessão. As crônicas de Cthulhu aguardam ações.</p>
                                ) : (
                                  [...cocSheet.eventLog].reverse().map((lg: string, i: number) => {
                                    const matchTime = lg.match(/^\[(.*?)\]/);
                                    const time = matchTime ? matchTime[1] : '';
                                    const bodyStr = lg.replace(/^\[.*?\]\s*/, '');
                                    return (
                                      <div key={i} className="flex gap-1 items-start leading-tight">
                                        <span className="text-magic font-bold text-[8.5px] shrink-0 font-sans">[{time}]</span>
                                        <span className="text-[8.5px] font-mono text-stone-300">{bodyStr}</span>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Horizontal scrollable tab bar */}
                          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 border-y border-magic/10 w-full mb-1">
                            {[
                              { id: 'summary', label: 'Resumo' },
                              { id: 'attributes', label: 'Atributos' },
                              { id: 'skills', label: 'Perícias' },
                              { id: 'combat', label: 'Combate' },
                              { id: 'sanity', label: 'Sanidade' },
                              { id: 'backstory', label: 'História' },
                              { id: 'inventory', label: 'Inventário' },
                              { id: 'resources', label: 'Recursos' },
                              { id: 'companions', label: 'Companheiros' },
                              { id: 'references', label: 'Referências' },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSheetTab(tab.id as any)}
                                className={`px-2.5 py-1 rounded-lg text-[8.5px] font-cinzel font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                                  sheetTab === tab.id
                                    ? 'bg-magic/25 text-white border border-magic/50 shadow-inner'
                                    : 'text-stone-500 hover:text-stone-300 hover:bg-white/5 border border-transparent'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* 10 TABS CONTENT DISPLAY */}
                          <div className="my-2 flex-1 relative min-h-[220px]">
                            {sheetTab === 'summary' && (
                              <div className="space-y-3.5 text-left">
                                <div className="grid grid-cols-2 gap-3 bg-black/45 p-3 rounded-xl border border-magic/10">
                                  <div>
                                    <span className="text-[8px] text-magic/60 uppercase font-black block">Residência</span>
                                    <input 
                                      type="text" 
                                      className="bg-black/60 border border-magic/15 rounded text-[11px] p-1 text-white w-full"
                                      value={cocSheet.residence || ''} 
                                      onChange={(e) => setCoCField('residence', e.target.value)} 
                                      placeholder="Ex: Boston, MA"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-magic/60 uppercase font-black block">Local de Nascimento</span>
                                    <input 
                                      type="text" 
                                      className="bg-black/60 border border-magic/15 rounded text-[11px] p-1 text-white w-full"
                                      value={cocSheet.birthplace || ''} 
                                      onChange={(e) => setCoCField('birthplace', e.target.value)} 
                                      placeholder="Ex: Londres, UK"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-magic/60 uppercase font-black block">Gênero / Pronomes</span>
                                    <input 
                                      type="text" 
                                      className="bg-black/60 border border-magic/15 rounded text-[11px] p-1 text-white w-full"
                                      value={cocSheet.gender || ''} 
                                      onChange={(e) => setCoCField('gender', e.target.value)} 
                                      placeholder="Ex: Masculino"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-magic/60 uppercase font-black block">Nível de Sorte</span>
                                    <div className="flex items-center gap-1 mt-1 font-mono">
                                      <span className="text-emerald-400 text-xs font-black">{cocSheet.luck || 50}%</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-black/45 p-3 rounded-xl border border-magic/10 space-y-1.5">
                                  <span className="text-[8px] text-magic uppercase font-black tracking-widest block">Principais Habilidades da Ficha</span>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(cocSheet.skills || {})
                                      .filter(([_, v]: [string, any]) => v >= 40)
                                      .slice(0, 12)
                                      .map(([name, val]: [string, any]) => (
                                        <div key={name} className="bg-magic/10 border border-magic/20 px-2 py-0.5 rounded text-[9px] font-mono text-stone-200">
                                          {name} <strong className="text-gold-light">{val}%</strong>
                                        </div>
                                      ))}
                                    {Object.entries(cocSheet.skills || {}).filter(([_, v]: [string, any]) => v >= 40).length === 0 && (
                                      <span className="text-stone-500 italic text-[10px]">Nenhuma perícia com valor elevado (40%+). Complete seus atributos.</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {sheetTab === 'attributes' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                  {Object.entries(cocSheet.attributes || {}).map(([attr, val]: [string, any]) => (
                                    <div key={attr} className="bg-black/65 border border-magic/10 p-2.5 rounded-xl flex flex-col items-center justify-between shadow relative">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-cinzel font-bold text-magic">{attr}</span>
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            setTestingSkill({ name: `Atributo: ${attr}`, value: val });
                                            setRollTestResult(null);
                                          }}
                                          className="p-1 text-stone-400 hover:text-white text-[8px] font-mono leading-none rounded cursor-pointer"
                                          title="Rolar Atributo"
                                        >
                                          🎲
                                        </button>
                                      </div>
                                      <input 
                                        type="number"
                                        value={val}
                                        min={0}
                                        max={99}
                                        onChange={(e) => setCoCAttribute(attr, parseInt(e.target.value) || 0)}
                                        className="bg-black/90 border border-magic/15 text-center font-mono font-black text-[#ffa500] text-sm p-1 rounded w-12 mt-1 focus:outline-none focus:border-magic/40 text-white"
                                      />
                                      <div className="flex justify-between w-full text-[7px] text-stone-500 font-mono mt-1.5 pt-1 border-t border-white/5">
                                        <span>1/2: {Math.floor(val / 2)}</span>
                                        <span>1/5: {Math.floor(val / 5)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="grid grid-cols-3 gap-2 border-t border-magic/10 pt-3">
                                  <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center flex flex-col justify-center">
                                    <span className="text-[7px] text-stone-400 font-bold uppercase block">VidaMax</span>
                                    <input 
                                      type="number"
                                      value={cocSheet.maxHealth || 15}
                                      onChange={(e) => setCoCField('maxHealth', parseInt(e.target.value) || 0)}
                                      className="bg-black border border-white/10 text-center font-black text-xs p-1 rounded w-10 mx-auto mt-1 text-white"
                                    />
                                  </div>
                                  <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center flex flex-col justify-center">
                                    <span className="text-[7px] text-stone-400 font-bold uppercase block">SanMax</span>
                                    <input 
                                      type="number"
                                      value={cocSheet.maxSanity || 99}
                                      onChange={(e) => setCoCField('maxSanity', parseInt(e.target.value) || 0)}
                                      className="bg-black border border-white/10 text-center font-black text-xs p-1 rounded w-10 mx-auto mt-1 text-white"
                                    />
                                  </div>
                                  <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center flex flex-col justify-center">
                                    <span className="text-[7px] text-stone-400 font-bold uppercase block">MagMax</span>
                                    <input 
                                      type="number"
                                      value={cocSheet.maxMagic || 15}
                                      onChange={(e) => setCoCField('maxMagic', parseInt(e.target.value) || 0)}
                                      className="bg-black border border-white/10 text-center font-black text-xs p-1 rounded w-10 mx-auto mt-1 text-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {sheetTab === 'skills' && (
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <input 
                                    type="text"
                                    placeholder="🔍 Filtrar perícias oficiais de Cthulhu..."
                                    value={skillSearchQuery}
                                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                                    className="flex-1 bg-black/60 border border-magic/20 text-[10px] text-white p-2 rounded-lg placeholder-stone-500 focus:outline-none focus:border-magic/40"
                                  />
                                  {skillSearchQuery && (
                                    <button 
                                      type="button"
                                      onClick={() => setSkillSearchQuery('')}
                                      className="text-stone-300 hover:text-white px-2 bg-white/5 rounded-lg text-[9px] border border-white/5 cursor-pointer"
                                    >
                                      Limpar
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin text-left">
                                  {Object.entries(cocSheet.skills || {})
                                    .filter(([name]) => name.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                                    .map(([name, val]: [string, any]) => (
                                      <div key={name} className="bg-black/65 border border-magic/10 p-1.5 px-2 rounded-lg flex items-center justify-between hover:border-magic/25 transition-all">
                                        <div className="flex flex-col flex-1 pr-2">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10.5px] font-bold text-stone-300 truncate">{name}</span>
                                            <button 
                                              type="button"
                                              onClick={() => {
                                                setTestingSkill({ name, value: val });
                                                setRollTestResult(null);
                                              }}
                                              className="text-[8.5px] hover:text-white underline cursor-pointer text-magic"
                                            >
                                              🎲 Testar
                                            </button>
                                          </div>
                                          <span className="text-[8px] text-stone-500 font-mono">
                                            Reg: {val}% • Dif: {Math.floor(val/2)}% • Ext: {Math.floor(val/5)}%
                                          </span>
                                        </div>
                                        <input 
                                          type="number"
                                          value={val}
                                          min={1}
                                          max={99}
                                          onChange={(e) => setCoCSkill(name, parseInt(e.target.value) || 1)}
                                          className="bg-black/95 border border-magic/15 text-center font-mono font-bold text-magic text-xs p-1 rounded w-11 focus:outline-none focus:border-magic/40"
                                        />
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {sheetTab === 'combat' && (
                              <div className="space-y-4 text-left">
                                <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-black/40 p-2.5 rounded-xl border border-magic/10 font-mono">
                                  <div className="flex flex-col justify-center bg-black/60 border border-white/5 p-1 rounded">
                                    <span className="text-[7px] text-stone-500 font-bold block">Taxa de Esquiva</span>
                                    <span className="text-xs text-stone-200 mt-1 block">{Math.floor((cocSheet.attributes?.DES || 50) / 2)}%</span>
                                  </div>
                                  <div className="flex flex-col justify-center bg-black/60 border border-white/5 p-1 rounded">
                                    <span className="text-[7px] text-stone-500 font-bold block">Dano Extra (DB)</span>
                                    <input 
                                      type="text"
                                      placeholder="Ex: -1d4"
                                      value={cocSheet.combat?.damageBonus || ''}
                                      onChange={(e) => setCoCField('combat', { ...cocSheet.combat, damageBonus: e.target.value })}
                                      className="bg-zinc-900 border border-white/5 text-[10px] p-0.5 text-stone-200 text-center rounded mt-1 text-white focus:outline-none focus:border-magic"
                                    />
                                  </div>
                                  <div className="flex flex-col justify-center bg-black/60 border border-white/5 p-1 rounded">
                                    <span className="text-[7px] text-stone-500 font-bold block">Corpo (Build)</span>
                                    <input 
                                      type="number"
                                      value={cocSheet.combat?.build || 0}
                                      onChange={(e) => setCoCField('combat', { ...cocSheet.combat, build: parseInt(e.target.value) || 0 })}
                                      className="bg-zinc-900 border border-white/5 text-[10px] p-0.5 text-stone-200 text-center rounded mt-1 text-white focus:outline-none focus:border-magic"
                                    />
                                  </div>
                                </div>

                                <div className="border-t border-magic/10 pt-2.5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] uppercase tracking-wider text-red-400 font-extrabold font-mono">💥 Arsenal de Armas</span>
                                    <button
                                      type="button"
                                      onClick={addWeapon}
                                      className="flex items-center gap-0.5 text-[8px] bg-red-950/40 hover:bg-red-950/80 border border-red-500/20 text-red-200 rounded px-2 py-0.5 cursor-pointer uppercase font-mono"
                                    >
                                      + Inserir Arma
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    {(!cocSheet.combat?.weapons || cocSheet.combat.weapons.length === 0) ? (
                                      <p className="text-[8.5px] text-stone-500 italic text-center py-2">Ficha sem armas registradas no coldre.</p>
                                    ) : (
                                      cocSheet.combat.weapons.map((wp: any) => (
                                        <div key={wp.id} className="bg-black/65 border border-magic/10 p-2.5 rounded-xl text-[10px] space-y-1.5 relative hover:border-red-500/10 transition-all">
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-left pr-6">
                                            <div className="flex flex-col">
                                              <span className="text-[7px] text-stone-500 uppercase">Arma</span>
                                              <input
                                                type="text"
                                                value={wp.name}
                                                onChange={(e) => updateWeapon(wp.id, 'name', e.target.value)}
                                                className="bg-black border border-white/5 rounded text-[9.5px] text-white p-0.5"
                                              />
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-[7px] text-stone-500 uppercase">Dano (Formula)</span>
                                              <input
                                                type="text"
                                                value={wp.damage}
                                                onChange={(e) => updateWeapon(wp.id, 'damage', e.target.value)}
                                                className="bg-black border border-white/5 rounded text-[9.5px] text-red-400 p-0.5"
                                              />
                                            </div>
                                            <div className="flex flex-col col-span-2 sm:col-span-1">
                                              <span className="text-[7px] text-stone-500 uppercase">Alcance</span>
                                              <input
                                                type="text"
                                                value={wp.range}
                                                onChange={(e) => updateWeapon(wp.id, 'range', e.target.value)}
                                                className="bg-black border border-white/5 rounded text-[9.5px] text-white p-0.5"
                                              />
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => deleteWeapon(wp.id)}
                                            className="absolute top-1 right-2 text-red-500/60 hover:text-red-400 font-bold text-xs"
                                            title="Remover Arma"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {sheetTab === 'sanity' && (
                              <div className="space-y-3.5 text-left">
                                <span className="text-[7.5px] text-[#4da3ff] font-bold block uppercase tracking-widest border-b border-white/5 pb-1 font-mono">🔍 Patologias & Instabilidades</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Fobias Ativas</span>
                                    <input 
                                      type="text"
                                      value={cocSheet.sanity?.fobias || ''}
                                      onChange={(e) => setCoCSanityField('fobias', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-stone-200 text-[10px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Manias</span>
                                    <input 
                                      type="text"
                                      value={cocSheet.sanity?.manias || ''}
                                      onChange={(e) => setCoCSanityField('manias', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-stone-200 text-[10px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5 sm:col-span-2 text-sans">
                                    <span className="text-[7px] text-[#ffa500] font-bold uppercase">Encontros Paranormais & Traumas</span>
                                    <textarea 
                                      rows={2}
                                      value={cocSheet.sanity?.encounters || ''}
                                      onChange={(e) => setCoCSanityField('encounters', e.target.value)}
                                      className="bg-black/60 border border-[#ffa500]/25 rounded p-1 text-[#ffa500] text-[9px] resize-none font-sans italic w-full focus:outline-none focus:border-[#ffa500]/50"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {sheetTab === 'backstory' && (
                              <div className="space-y-3.5 text-left">
                                <span className="text-[7.5px] text-zinc-400 font-bold block uppercase tracking-widest border-b border-white/5 pb-1 font-mono">📖 Biografia de Vanguarda & Detalhes Pessoais</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                  <div className="col-span-1 sm:col-span-2 flex flex-col gap-0.5 font-sans">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Descrição Pessoal</span>
                                    <textarea 
                                      rows={2}
                                      value={cocSheet.backstory?.personalDesc || ''}
                                      onChange={(e) => setCoCBackstoryField('personalDesc', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1.5 text-stone-200 text-[10px] resize-none focus:outline-none focus:border-magic/40 font-sans italic w-full"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5 font-sans">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Ideologia / Crença</span>
                                    <input 
                                      type="text"
                                      value={cocSheet.backstory?.ideology || ''}
                                      onChange={(e) => setCoCBackstoryField('ideology', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[10px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Pessoas Chave</span>
                                    <input 
                                      type="text"
                                      value={cocSheet.backstory?.significantPeople || ''}
                                      onChange={(e) => setCoCBackstoryField('significantPeople', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[10px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5 font-sans">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase font-mono">Tomo Ocultista de Destaque</span>
                                    <input 
                                      type="text"
                                      placeholder="Ex: Liber Ivonis"
                                      value={cocSheet.backstory?.arcaneTomes || ''}
                                      onChange={(e) => setCoCBackstoryField('arcaneTomes', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-stone-300 text-[10px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5 font-sans">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase font-mono">Grimórios / Magias Memorizadas</span>
                                    <input 
                                      type="text"
                                      placeholder="Ex: Sinal de Nhigr"
                                      value={cocSheet.backstory?.spells || ''}
                                      onChange={(e) => setCoCBackstoryField('spells', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-stone-300 text-[10px]"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {sheetTab === 'inventory' && (
                              <div className="space-y-3.5 text-left">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-magic uppercase font-black">Equipamentos Carregados</span>
                                    <textarea 
                                      rows={2}
                                      value={cocSheet.inventory?.equipment || ''}
                                      onChange={(e) => setCoCInventoryField('equipment', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1.5 text-[10px] text-white font-sans resize-none w-full"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5 font-sans">
                                    <span className="text-[7px] text-magic uppercase font-black">Outros Pertences</span>
                                    <textarea 
                                      rows={2}
                                      value={cocSheet.inventory?.possessions || ''}
                                      onChange={(e) => setCoCInventoryField('possessions', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1.5 text-[10px] text-white resize-none w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {sheetTab === 'resources' && (
                              <div className="space-y-3 text-left">
                                <span className="text-[7.5px] text-emerald-400 font-cinzel font-black block tracking-widest uppercase">💳 Bens & Recursos Financeiros</span>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Dinheiro Vivo ($)</span>
                                    <input 
                                      type="text"
                                      placeholder="Ex: $50"
                                      value={cocSheet.inventory?.money || ''}
                                      onChange={(e) => setCoCInventoryField('money', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[11px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Patrimônio / Bens Possuídos</span>
                                    <input 
                                      type="text"
                                      placeholder="Ex: $12000"
                                      value={cocSheet.inventory?.assets || ''}
                                      onChange={(e) => setCoCInventoryField('assets', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[11px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Nível de Gastos Permitido</span>
                                    <input 
                                      type="text"
                                      placeholder="Ex: $10"
                                      value={cocSheet.inventory?.spendingLevel || ''}
                                      onChange={(e) => setCoCInventoryField('spendingLevel', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[11px]"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase">Rendimentos / Salário Mensal</span>
                                    <input 
                                      type="text"
                                      placeholder="Ex: $350"
                                      value={cocSheet.inventory?.income || ''}
                                      onChange={(e) => setCoCInventoryField('income', e.target.value)}
                                      className="bg-black/60 border border-magic/15 rounded p-1 text-white text-[11px]"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {sheetTab === 'companions' && (
                              <div className="space-y-3.5 text-left">
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] text-magic uppercase font-bold tracking-wider">Companheiros Ativos</span>
                                  <button
                                    type="button"
                                    onClick={addCompanion}
                                    className="flex items-center gap-0.5 text-[8px] bg-magic/20 hover:bg-magic/40 border border-magic/40 text-white rounded px-2 py-0.5 cursor-pointer"
                                  >
                                    <Plus size={8} /> ADICIONAR
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
                                  {(!cocSheet.companions || cocSheet.companions.length === 0) ? (
                                    <p className="text-[9px] text-stone-500 italic text-center p-2 col-span-2">Nenhum companheiro registrado.</p>
                                  ) : (
                                    cocSheet.companions.map((comp: any) => (
                                      <div key={comp.id} className="bg-black/65 border border-magic/10 p-2 rounded-lg relative flex flex-col gap-1">
                                        <button 
                                          type="button"
                                          onClick={() => deleteCompanion(comp.id)}
                                          className="absolute top-1 right-1 p-0.5 border border-red-500/15 text-red-400 hover:bg-red-950/40 hover:border-red-500/40 rounded text-[7px]"
                                        >
                                          <Trash2 size={8} />
                                        </button>
                                        <div className="flex flex-col">
                                          <span className="text-[7px] text-stone-500">Nome</span>
                                          <input
                                            type="text"
                                            value={comp.name}
                                            onChange={(e) => updateCompanion(comp.id, 'name', e.target.value)}
                                            className="bg-black border border-white/5 rounded text-[9.5px] text-white p-0.5"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-[9px] font-sans">
                                          <div className="flex flex-col">
                                            <span className="text-[7px] text-stone-500">Jogador</span>
                                            <input
                                              type="text"
                                              value={comp.player}
                                              onChange={(e) => updateCompanion(comp.id, 'player', e.target.value)}
                                              className="bg-black border border-white/5 rounded text-[9px] text-stone-300 p-0.5"
                                            />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-[7px] text-stone-500">Vínculo</span>
                                            <input
                                              type="text"
                                              value={comp.relation}
                                              onChange={(e) => updateCompanion(comp.id, 'relation', e.target.value)}
                                              className="bg-black border border-white/5 rounded text-[9px] text-stone-300 p-0.5"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}

                            {sheetTab === 'references' && (
                              <div className="space-y-3.5 text-left text-[9.5px] leading-relaxed text-stone-300 font-sans">
                                <span className="text-[8px] tracking-[0.2em] font-cinzel text-magic block uppercase border-b border-magic/20 pb-0.5">📜 Doutrina de Sucesso de Chamado de Cthulhu 7E</span>
                                <p>• <strong className="text-magic uppercase">Graus de Dificuldade:</strong></p>
                                <ul className="pl-3.5 list-disc space-y-1">
                                  <li><strong className="text-stone-300">Sucesso Regular:</strong> Tirar valor menor ou igual ao nível da sua perícia.</li>
                                  <li><strong className="text-amber-500">Sucesso Difícil (1/2):</strong> Obter valor menor ou igual à metade da sua perícia.</li>
                                  <li><strong className="text-red-500">Sucesso Extremo (1/5):</strong> Obter valor de dado menor ou igual a um quinto da perícia total.</li>
                                </ul>
                                <p>• <strong className="text-red-500 uppercase">Sucesso Crítico/Desastre:</strong> Tirar <strong className="text-emerald-400">01</strong> é Sucesso Crítico. Tirar de <strong className="text-red-600">96 a 100</strong> (com perícia abaixo de 50) ou <strong className="text-red-600">100</strong> (acima de 50) resulta em um terrível Desastre.</p>
                                <p>• <strong className="text-magic uppercase">Testes Forçados (Forçar):</strong> Se você falhou num teste de perícia que não é de combate, você pode requisitar um Teste Forçado justificando um esforço extremo. Se falhar, as consequências impostas pelo Guardião serão graves e catastróficas.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : isCreatingChar ? (
                      /* Character Creation Folder */
                      <form onSubmit={handleCreateGlobalCharacter} className="bg-black/90 border border-magic/25 p-6 rounded-2xl space-y-4 shadow-2xl max-w-lg mx-auto text-left relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-magic/50 to-transparent" />
                        
                        <div className="flex items-center justify-between border-b border-magic/15 pb-2">
                          <h3 className="font-cinzel text-sm font-black text-magic tracking-wider uppercase">
                            ⚙️ INICIAR REGISTRO DE INVESTIGADOR
                          </h3>
                          <button
                            type="button"
                            onClick={() => setIsCreatingChar(false)}
                            className="p-1 hover:bg-white/10 rounded text-stone-400"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-magic/60 uppercase tracking-wider font-extrabold">Nome Completo *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Harvey Walters"
                              className="mythos-input text-xs py-2 px-3 border-magic/15 text-white"
                              value={newCharName}
                              onChange={(e) => setNewCharName(e.target.value)}
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-magic/60 uppercase tracking-wider font-extrabold">Ocupação / Arquétipo</label>
                            <input
                              type="text"
                              placeholder="Ex: Jornalista Investigativo"
                              className="mythos-input text-xs py-2 px-3 border-magic/15 text-white"
                              value={newCharClass}
                              onChange={(e) => setNewCharClass(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#1a0e0e] border border-health/25 p-3 rounded-lg flex flex-col items-center">
                            <span className="text-[8px] text-red-400 uppercase font-bold tracking-wider flex items-center gap-1">
                              <Heart size={8} /> PV Inicial
                            </span>
                            <span className="text-xl font-bold font-mono text-red-200 mt-1">{newCharHealth}</span>
                            <div className="flex gap-2 mt-1.5">
                              <button type="button" onClick={() => setNewCharHealth(prev => Math.max(1, prev - 1))} className="w-5 h-5 bg-health text-black hover:bg-red-700 font-bold rounded flex items-center justify-center text-xs">-</button>
                              <button type="button" onClick={() => setNewCharHealth(prev => Math.min(20, prev + 1))} className="w-5 h-5 bg-health text-black hover:bg-red-700 font-bold rounded flex items-center justify-center text-xs">+</button>
                            </div>
                          </div>

                          <div className="bg-[#0e2129] border border-magic/25 p-3 rounded-lg flex flex-col items-center">
                            <span className="text-[8px] text-magic uppercase font-bold tracking-wider flex items-center gap-1">
                              <Sparkles size={8} /> Sanidade %
                            </span>
                            <span className="text-xl font-bold font-mono text-blue-200 mt-1">{newCharSanity}%</span>
                            <div className="flex gap-2 mt-1.5">
                              <button type="button" onClick={() => setNewCharSanity(prev => Math.max(1, prev - 5))} className="w-5 h-5 bg-magic text-black hover:bg-blue-600 font-bold rounded flex items-center justify-center text-xs">-</button>
                              <button type="button" onClick={() => setNewCharSanity(prev => Math.min(99, prev + 5))} className="w-5 h-5 bg-magic text-black hover:bg-blue-600 font-bold rounded flex items-center justify-center text-xs">+</button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-magic/60 uppercase tracking-wider font-extrabold">Habilidades & Pertences</label>
                          <textarea
                            rows={2.5}
                            className="w-full bg-black/50 border border-magic/15 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:border-magic/40 resize-none font-sans"
                            placeholder="Atributos, armas e grimórios possuídos..."
                            value={newCharSkills}
                            onChange={(e) => setNewCharSkills(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-magic/60 uppercase tracking-wider font-extrabold">Dossiê Histórico / Background</label>
                          <textarea
                            rows={2.5}
                            className="w-full bg-black/50 border border-magic/15 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:border-magic/40 resize-none font-sans italic"
                            placeholder="Histórias, segredos ocultos..."
                            value={newCharBackstory}
                            onChange={(e) => setNewCharBackstory(e.target.value)}
                          />
                        </div>

                        <div className="pt-2 flex gap-3">
                          <Button
                            variant="ghost"
                            onClick={() => setIsCreatingChar(false)}
                            className="flex-1 py-2 text-xs border border-white/10 hover:bg-white/5 uppercase"
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="primary"
                            type="submit"
                            loading={creatingCharLoading}
                            className="flex-1 py-2 bg-magic text-black text-xs font-bold uppercase"
                          >
                            Gravar Dossiê
                          </Button>
                        </div>
                      </form>
                    ) : (
                      /* List of global characters */
                      <div className="space-y-6">
                        {/* New Character trigger */}
                        <div className="max-w-md mx-auto px-2">
                          <button
                            onClick={() => setIsCreatingChar(true)}
                            className="group relative flex items-center gap-4 p-4 bg-black/75 border border-magic/25 hover:border-magic/75 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-[0_0_20px_rgba(77,163,255,0.1)] cursor-pointer w-full"
                          >
                            <div className="w-14 h-14 rounded-full bg-magic/5 border border-magic/30 flex items-center justify-center text-magic shadow-[0_0_10px_rgba(77,163,255,0.1)] group-hover:scale-105 group-hover:border-white transition-all shrink-0">
                              <Plus size={24} className="text-magic border-white" />
                            </div>
                            <div className="space-y-0.5 text-left flex-1 min-w-0">
                              <h3 className="font-cinzel text-sm sm:text-base font-black text-magic group-hover:text-white tracking-widest uppercase truncate">
                                Novo Investigador
                              </h3>
                              <p className="text-[11px] text-stone-400 font-sans line-clamp-1">
                                Catalogar nova ficha mística sob sua tutela
                              </p>
                            </div>
                          </button>
                        </div>

                        <div className="space-y-5 pt-4 max-w-6xl mx-auto px-4 text-left">
                          <div className="flex items-center justify-between border-b border-magic/20 pb-2">
                            <span className="text-xs font-cinzel font-black tracking-[0.25em] text-magic">
                              🛡️ SEU PORTA-FICHA CÓSMICO ({globalCharacters.length})
                            </span>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 hidden sm:inline">REGISTRO DE AGENTES ATIVOS</span>
                          </div>

                          {loadingCharacters ? (
                            <div className="text-center py-10">
                              <p className="text-xs text-white/40 italic animate-pulse">Sintonizando frequências de investigores...</p>
                            </div>
                          ) : globalCharacters.length === 0 ? (
                            <div className="bg-black/30 border border-magic/10 p-12 text-center rounded-2xl space-y-4 max-w-sm mx-auto">
                              <Scroll size={36} className="text-stone-600 mx-auto" />
                              <div className="space-y-1">
                                <p className="text-xs font-bold font-cinzel text-magic">Nenhum Investigador Catalogado</p>
                                <p className="text-[11px] text-white/40">Sua galeria de alter-egos está vazia. Crie um ficha no botão acima de forma de salvá-lo globalmente.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {globalCharacters.map((char) => (
                                <div
                                  key={char.id}
                                  className="bg-[#0b0c0d]/90 border border-magic/20 p-5 rounded-2xl hover:border-magic/50 shadow-2xl transition-all duration-300 relative group overflow-hidden flex flex-col justify-between"
                                >
                                  <div className="absolute top-0 right-0 p-4">
                                    <button
                                      onClick={(e) => handleDeleteCharacter(char.id, e)}
                                      className="p-1 hover:bg-red-500/10 text-red-400/40 hover:text-red-400 rounded transition-colors"
                                      title="Desintegrar ficha"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="space-y-1 pr-6 text-left">
                                      <span className="text-[8px] uppercase tracking-wider text-magic font-extrabold px-1.5 py-0.5 rounded bg-magic/10 border border-magic/20 italic w-fit block font-sans">
                                        {char.characterClass || 'Herói do Destino'}
                                      </span>
                                      <h4 className="font-cinzel text-lg font-black text-gold-gradient mt-1 tracking-wide truncate">
                                        {char.name}
                                      </h4>
                                    </div>

                                    {/* Stats bars */}
                                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                                      <div className="bg-red-950/25 border border-red-900/30 p-2 rounded flex flex-col items-center">
                                        <span className="text-red-400 font-bold uppercase text-[8px] tracking-wider">PV Física</span>
                                        <span className="text-sm font-bold text-red-200 mt-0.5">{char.health || 15} / 20</span>
                                      </div>
                                      <div className="bg-blue-950/25 border border-blue-900/30 p-2 rounded flex flex-col items-center">
                                        <span className="text-blue-400 font-bold uppercase text-[8px] tracking-wider">Sanidade %</span>
                                        <span className="text-sm font-bold text-blue-200 mt-0.5">{char.sanity || 70}%</span>
                                      </div>
                                    </div>

                                    {char.skills && (
                                      <div className="space-y-0.5 text-left">
                                        <span className="text-[8px] text-stone-500 uppercase font-sans font-black">Habilidades & Pertences</span>
                                        <p className="text-[10.5px] text-stone-300 bg-black/45 p-2 rounded border border-white/5 line-clamp-2">
                                          {char.skills}
                                        </p>
                                      </div>
                                    )}

                                    {char.backstory && (
                                      <div className="space-y-0.5 text-left">
                                        <span className="text-[8px] text-stone-500 uppercase font-sans font-black">Histórico Secreto</span>
                                        <p className="text-[10.5px] text-stone-400 italic bg-black/45 p-2 rounded border border-white/5 line-clamp-2">
                                          "{char.backstory}"
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => handleOpenGlobalCharacter(char)}
                                    className="w-full mt-3 py-1.5 bg-magic/10 hover:bg-magic/25 text-magic font-cinzel font-black text-[10px] tracking-widest border border-magic/35 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer hover:text-white"
                                  >
                                    📄 Abrir Prontuário Completo
                                  </button>

                                  <div className="pt-3 border-t border-white/5 mt-3 text-[9px] text-stone-500 font-mono flex justify-between items-center">
                                    <span>REALMOR HERO ARCHETYPE</span>
                                    <span className="text-magic/40 font-mono">ONLINE ID: {char.id.slice(0, 6).toUpperCase()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB: CONFIGURAÇÕES (SETTINGS) --- */}
                {activeTab === 'settings' && (
                  <div className="max-w-md mx-auto bg-black/85 border border-magic/25 p-6 rounded-2xl space-y-6 shadow-2xl relative overflow-hidden mt-4 text-left">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4da3ff]/55 to-transparent" />
                    
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 mx-auto rounded-full bg-magic/10 border-2 border-magic/45 flex items-center justify-center text-magic font-cinzel text-2xl font-black">
                        {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'J'}
                      </div>
                      <h3 className="font-cinzel text-lg font-black text-gold-gradient mt-2 tracking-widest uppercase">
                        PAINEL DO JOGADOR
                      </h3>
                      <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase">
                        Sessão de Credenciais Ativas
                      </p>
                    </div>

                    <div className="border-t border-magic/15 pt-4 space-y-3 font-sans text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-stone-400">Nome do Jogador:</span>
                        <span className="text-white font-bold">{user?.displayName || 'Investigador do Realmor'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-stone-400">Email:</span>
                        <span className="text-white font-bold truncate max-w-[200px]">{user?.email}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-stone-400">Status de Perfil:</span>
                        <span className="text-magic font-cinzel font-black uppercase tracking-wider text-[10px]">Pactado com Destino</span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                      <button
                        onClick={() => {
                          localStorage.removeItem('mythos_active_profile');
                          clearProfile();
                          navigate('/select-profile');
                        }}
                        className="w-full py-2.5 px-4 bg-magic/10 hover:bg-magic/20 text-magic font-cinzel font-black text-xs tracking-widest border border-magic/30 rounded-lg transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                      >
                        <UserIcon size={14} />
                        Retroceder Perfil
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            localStorage.removeItem('mythos_active_profile');
                            await logout();
                            navigate('/auth');
                          } catch (err) {
                            console.error('Logout error:', err);
                          }
                        }}
                        className="w-full py-2.5 px-4 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-cinzel font-black text-xs tracking-widest border border-red-900/30 rounded-lg transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                      >
                        <LogOut size={14} />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}

                {/* --- MOBILE FIXED BOTTOM MENU BAR --- */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom))] bg-black/95 border-t border-magic/20 backdrop-blur-md z-[9999] flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.95)]">
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-all ${
                      activeTab === 'campaigns' ? 'text-magic' : 'text-stone-500'
                    }`}
                  >
                    <BookOpen size={20} className={activeTab === 'campaigns' ? 'text-magic' : 'text-stone-500'} />
                    <span className="text-[9px] font-cinzel font-black tracking-widest uppercase text-center">Campanhas</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('rooms')}
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-all ${
                      activeTab === 'rooms' ? 'text-magic' : 'text-stone-500'
                    }`}
                  >
                    <Compass size={20} className={activeTab === 'rooms' ? 'text-magic' : 'text-stone-500'} />
                    <span className="text-[9px] font-cinzel font-black tracking-widest uppercase text-center">Salas</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('characters')}
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-all ${
                      activeTab === 'characters' ? 'text-magic' : 'text-stone-500'
                    }`}
                  >
                    <Sword size={20} className={activeTab === 'characters' ? 'text-magic' : 'text-stone-500'} />
                    <span className="text-[9px] font-cinzel font-black tracking-widest uppercase text-center">Heróis</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-all ${
                      activeTab === 'settings' ? 'text-magic' : 'text-stone-500'
                    }`}
                  >
                    <Settings size={20} className={activeTab === 'settings' ? 'text-magic' : 'text-stone-500'} />
                    <span className="text-[9px] font-cinzel font-black tracking-widest uppercase text-center">Ajustes</span>
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

          {/* --- CoC SKILL TEST ROLL FLOATING DIALOG --- */}
          <AnimatePresence>
            {testingSkill && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  className="bg-zinc-950 border border-magic/40 p-5 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(77,163,255,0.25)] font-mono"
                >
                  <div className="flex justify-between items-center border-b border-magic/10 pb-2">
                    <span className="text-[9px] text-magic uppercase font-black tracking-widest font-cinzel">Preparar Teste de Perícia</span>
                    <button
                      type="button"
                      onClick={() => setTestingSkill(null)}
                      className="text-stone-500 hover:text-white text-[10px] cursor-pointer font-bold leading-none uppercase animate-pulse"
                    >
                      ✕ FECHAR
                    </button>
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-[7.5px] text-stone-500 uppercase block font-bold leading-none">Perícia / Atributo Alvo</span>
                    <h4 className="text-xs font-black text-stone-200 uppercase tracking-wide leading-tight">{testingSkill.name}</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center select-none pt-1">
                    <div className="bg-black/50 border border-magic/20 p-2 rounded-xl">
                      <span className="text-[6.5px] text-stone-400 font-bold block uppercase leading-none">Regular</span>
                      <span className="text-xs font-black text-magic mt-1 block">{testingSkill.value}%</span>
                    </div>
                    <div className="bg-black/50 border border-magic/25 p-2 rounded-xl">
                      <span className="text-[6.5px] text-stone-400 font-bold block uppercase leading-none">Difícil</span>
                      <span className="text-xs font-black text-amber-500 mt-1 block">{Math.floor(testingSkill.value / 2)}%</span>
                    </div>
                    <div className="bg-black/50 border border-magic/35 p-2 rounded-xl">
                      <span className="text-[6.5px] text-stone-400 font-bold block uppercase leading-none">Extremo</span>
                      <span className="text-xs font-black text-red-500 mt-1 block">{Math.floor(testingSkill.value / 5)}%</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {!rollTestResult ? (
                      <button
                        type="button"
                        onClick={() => handleRollCoCTest(testingSkill.name, testingSkill.value)}
                        className="w-full py-2.5 px-4 bg-magic/20 hover:bg-magic/45 border border-magic/40 text-stone-100 font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-[0_4px_12px_rgba(77,163,255,0.1)] active:scale-97 cursor-pointer"
                      >
                        🎲 Rolar Dado (1d100)
                      </button>
                    ) : (
                      <div className="space-y-3 bg-black/60 p-4 rounded-xl border border-magic/40 text-center animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-magic to-transparent" />
                        
                        <div className="space-y-1">
                          <span className="text-[7px] text-stone-500 uppercase block font-bold leading-none">Resultado do d100</span>
                          <span className="text-3xl font-extrabold text-white tracking-tighter drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] leading-tight">{rollTestResult.roll}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[7px] text-stone-400 block font-bold leading-none">GRAU OBTIDO</span>
                          <span className={`text-[11px] font-black uppercase tracking-wider block ${
                            rollTestResult.successGrade === 'Sucesso Crítico' ? 'text-emerald-400 animate-pulse' :
                            rollTestResult.successGrade === 'Sucesso Extremo' ? 'text-blue-400' :
                            rollTestResult.successGrade === 'Sucesso Difícil' ? 'text-amber-400' :
                            rollTestResult.successGrade === 'Sucesso Regular' ? 'text-zinc-300' :
                            rollTestResult.successGrade === 'Desastre' ? 'text-red-500 font-extrabold animate-bounce' : 'text-stone-500'
                          }`}>
                            {rollTestResult.successGrade}
                          </span>
                        </div>

                        <p className="text-[8.5px] text-stone-400 italic font-sans leading-relaxed px-1">
                          {rollTestResult.description}
                        </p>

                        <button
                          type="button"
                          onClick={() => setRollTestResult(null)}
                          className="text-[8px] text-magic underline block mx-auto pt-1 cursor-pointer hover:text-white"
                        >
                          Rolar outra vez
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>



      {/* Mobile Bottom Navigation Safe Zone Spacer - Definitively prevents content from being hidden behind footer bar */}
      <div className="h-32 w-full md:hidden flex-shrink-0 pointer-events-none" aria-hidden="true" />
    </div>
  );
};
