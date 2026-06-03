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
  doc, 
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  addDoc,
  getDocs
} from '../firebase/firestore';
import { 
  Crown, 
  Compass, 
  X, 
  Copy, 
  Check, 
  BookOpen, 
  ChevronLeft,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Activity,
  Trash2,
  Plus,
  Flame,
  Globe,
  Dices,
  Eye,
  Lock,
  Scroll,
  BookMarked,
  Shield,
  Map,
  Save,
  MessageSquare,
  Settings,
  LogOut,
  User as UserIcon
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
  status: 'Planejamento' | 'Em andamento' | 'Pausada' | 'Finalizada';
  era: 'Anos 1920' | 'Era moderna' | 'Vitoriana' | 'Medieval sombrio' | 'Personalizada';
  mainLocation: string;
  tone: 'Horror psicológico' | 'Investigação' | 'Sobrevivência' | 'Cultos e ocultismo' | 'Mistério sobrenatural' | 'Horror cósmico';
  lethality: 'Baixo' | 'Médio' | 'Alto' | 'Brutal';
  summary: string;
  coverUrl?: string;
  masterSecrets?: string;
  importantNpcs?: string;
  factions?: string;
  generalNotes?: string;
  sessionCount?: number;
  maxPlayers: number;
  sessionFrequency: string;
  createdAt: any;
  updatedAt: any;
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
  privacy: 'Aberta por código' | 'Fechada';
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

const PRESET_COVERS = [
  {
    id: 'cth_awakening',
    name: 'O Despertar de Cthulhu',
    url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'gothic_library',
    name: 'Grimórios Ancestrais',
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'arkham_mansion',
    name: 'Mansão de Arkham',
    url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'investigation_board',
    name: 'Mapeamento de Pistas',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ritual_magic',
    name: 'Círculo de Evocação',
    url: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dark_cavern',
    name: 'Masmorras Abissais',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  }
];

export const NewMasterPage: React.FC = () => {
  const { clearProfile } = useProfile();
  const { user, logout } = useAuth();
  const { withLoading, showLoader, hideLoader } = useLoading();
  const navigate = useNavigate();

  // Active state: null (menu), 'campaign' (create campaign), 'room' (create room)
  const [activeAction, setActiveAction] = useState<'campaign' | 'room' | null>(null);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'rooms' | 'settings'>('campaigns');

  // Active session room cockpit (DM Desk)
  const [activeSessionRoomId, setActiveSessionRoomId] = useState<string | null>(null);
  const [viewingPlayerSheet, setViewingPlayerSheet] = useState<Participant | null>(null);
  const [masterSheetTab, setMasterSheetTab] = useState<'attributes' | 'skills' | 'combat' | 'sanity' | 'backstory' | 'inventory' | 'companions'>('attributes');
  const [masterSkillSearchQuery, setMasterSkillSearchQuery] = useState('');

  // Lists from DB
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Initial load tracking
  useEffect(() => {
    if (loadingCampaigns && loadingRooms) {
      showLoader("Inspecionando os arquivos do Mestre...");
    } else {
      hideLoader();
    }
    return () => {
      hideLoader();
    };
  }, [loadingCampaigns, loadingRooms]);

  // Detailed view of room for listing participants and rolls in active cockpit
  const [activeParticipants, setActiveParticipants] = useState<Participant[]>([]);
  const [recentRolls, setRecentRolls] = useState<DiceRoll[]>([]);
  const [rollingDice, setRollingDice] = useState<number | null>(null); // animation indicator
  const [lastRollResult, setLastRollResult] = useState<number | null>(null);

  // Clipboard feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Toast status feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Custom Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: 'campaign' | 'room';
    title: string;
    message: string;
    confirmLabel: string;
  } | null>(null);

  // Form states - New Campaign
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subtitle: '',
    system: 'Call of Cthulhu',
    edition: '7ª Edição',
    campaignType: 'Investigação de Mistérios',
    status: 'Planejamento' as Campaign['status'],
    era: 'Anos 1920' as Campaign['era'],
    mainLocation: '',
    tone: 'Horror cósmico' as Campaign['tone'],
    lethality: 'Alto' as Campaign['lethality'],
    summary: '',
    coverUrl: PRESET_COVERS[0].url,
    masterSecrets: '',
    importantNpcs: '',
    factions: '',
    generalNotes: '',
    sessionCount: 1,
    maxPlayers: 5,
    sessionFrequency: 'Semanal'
  });

  // Form states - New Room
  const [roomForm, setRoomForm] = useState({
    roomName: '',
    campaignId: '',
    maxPlayers: 5,
    privacy: 'Aberta por código' as Room['privacy'],
    allowJoin: true,
    notes: ''
  });

  // Real-time edits inside the Master Desktop to persist Campaign Notes
  const [liveSecrets, setLiveSecrets] = useState('');
  const [liveNpcs, setLiveNpcs] = useState('');
  const [liveFactions, setLiveFactions] = useState('');
  const [liveGlobalNotes, setLiveGlobalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch campaigns
  useEffect(() => {
    if (!user) return;

    setLoadingCampaigns(true);
    const q = query(
      collection(db, 'campaigns'),
      where('masterId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Campaign[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Campaign);
      });
      list.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      setCampaigns(list);
      setLoadingCampaigns(false);
    }, (error) => {
      console.error('Error listening to campaigns:', error);
      setLoadingCampaigns(false);
    });

    return unsubscribe;
  }, [user]);

  // Fetch rooms
  useEffect(() => {
    if (!user) return;

    setLoadingRooms(true);
    const q = query(
      collection(db, 'rooms'),
      where('masterId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Room[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Room);
      });
      list.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      setRooms(list);
      setLoadingRooms(false);
    }, (error) => {
      console.error('Error listening to rooms:', error);
      setLoadingRooms(false);
    });

    return unsubscribe;
  }, [user]);

  // Listen to participants & rolls of the active gaming session cockpit
  useEffect(() => {
    if (!activeSessionRoomId) {
      setActiveParticipants([]);
      setRecentRolls([]);
      return;
    }

    // 1. Unsubscribe to participants
    const participantsRef = collection(db, 'rooms', activeSessionRoomId, 'participants');
    const unsubParticipants = onSnapshot(participantsRef, (snapshot) => {
      const list: Participant[] = [];
      snapshot.forEach((doc) => {
        list.push({ userId: doc.id, ...doc.data() } as Participant);
      });
      setActiveParticipants(list);
    }, (error) => {
      console.error('Error fetching room participants:', error);
    });

    // 2. Unsubscribe to rolls
    const rollsRef = collection(db, 'rooms', activeSessionRoomId, 'rolls');
    const unsubRolls = onSnapshot(rollsRef, (snapshot) => {
      const list: DiceRoll[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as DiceRoll);
      });
      // Sort descending by rolledAt timestamp
      list.sort((a, b) => {
        const tA = a.rolledAt?.seconds || 0;
        const tB = b.rolledAt?.seconds || 0;
        return tB - tA;
      });
      setRecentRolls(list.slice(0, 15)); // keep top 15 rolls
    }, (error) => {
      console.error('Error listening to dice rolls:', error);
    });

    return () => {
      unsubParticipants();
      unsubRolls();
    };
  }, [activeSessionRoomId]);

  // Load active campaign notes when entering room session
  const activeRoomObj = rooms.find(r => r.id === activeSessionRoomId);
  const activeCampObj = campaigns.find(c => c.id === activeRoomObj?.campaignId);

  useEffect(() => {
    if (activeCampObj) {
      setLiveSecrets(activeCampObj.masterSecrets || '');
      setLiveNpcs(activeCampObj.importantNpcs || '');
      setLiveFactions(activeCampObj.factions || '');
      setLiveGlobalNotes(activeCampObj.generalNotes || '');
    }
  }, [activeSessionRoomId, activeCampObj]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    showToast('Código místico copiado para o pergaminho!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleBackToSelection = () => {
    clearProfile();
    navigate('/select-profile', { replace: true });
  };

  // Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!campaignForm.name.trim()) {
      showToast('O grimório exige um nome para a campanha.', 'error');
      return;
    }

    try {
      const camRef = doc(collection(db, 'campaigns'));
      const newCampaign: Campaign = {
        ...campaignForm,
        id: camRef.id,
        masterId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await withLoading(
        setDoc(camRef, newCampaign),
        "Screvendo crônica suprema no Grimório..."
      );
      showToast('Crônica arquivada e selada com prestígio!');
      
      // Auto-populate room name for quick next step
      setRoomForm(prev => ({
        ...prev,
        campaignId: camRef.id,
        roomName: `Mesa de ${newCampaign.name}`
      }));
      
      // Reset Campaign Form
      setCampaignForm({
        name: '',
        subtitle: '',
        system: 'Call of Cthulhu',
        edition: '7ª Edição',
        campaignType: 'Investigação de Mistérios',
        status: 'Planejamento',
        era: 'Anos 1920',
        mainLocation: '',
        tone: 'Horror cósmico',
        lethality: 'Alto',
        summary: '',
        coverUrl: PRESET_COVERS[0].url,
        masterSecrets: '',
        importantNpcs: '',
        factions: '',
        generalNotes: '',
        sessionCount: 1,
        maxPlayers: 5,
        sessionFrequency: 'Semanal'
      });

      setActiveAction(null);
    } catch (err: any) {
      console.error(err);
      showToast('O fogo sagrado falhou ao registrar: ' + err.message, 'error');
    }
  };

  // Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!roomForm.campaignId) {
      showToast('Selecione um manuscrito de campanha de vínculo.', 'error');
      return;
    }

    const selectedCamp = campaigns.find(c => c.id === roomForm.campaignId);
    if (!selectedCamp) {
      showToast('A crônica misteriosa não foi localizada.', 'error');
      return;
    }

    if (!roomForm.roomName.trim()) {
      showToast('Insira o nome da sua mesa de jogo.', 'error');
      return;
    }

    try {
      // Generate unique 8 char room code CTH-XXXX
      const numCode = Math.floor(1000 + Math.random() * 9000);
      const entryCode = `CTH-${numCode}`;

      const roomRef = doc(collection(db, 'rooms'));
      const newRoom: Room = {
        id: roomRef.id,
        masterId: user.uid,
        campaignId: roomForm.campaignId,
        campaignName: selectedCamp.name,
        roomName: roomForm.roomName,
        entryCode: entryCode,
        maxPlayers: Number(roomForm.maxPlayers),
        currentPlayers: 0,
        privacy: roomForm.privacy,
        allowJoin: roomForm.allowJoin,
        status: 'Ativa',
        notes: roomForm.notes,
        coverUrl: selectedCamp.coverUrl || PRESET_COVERS[0].url,
        system: selectedCamp.system,
        createdAt: serverTimestamp()
      };

      await withLoading(
        setDoc(roomRef, newRoom),
        "Conjurando portal da mesa de jogo..."
      );
      showToast(`Selo dimensional criado com o código: ${entryCode}`);
      
      setRoomForm({
        roomName: '',
        campaignId: '',
        maxPlayers: 5,
        privacy: 'Aberta por código',
        allowJoin: true,
        notes: ''
      });

      setActiveAction(null);
    } catch (err: any) {
      console.error(err);
      showToast('Falha em evocar o portal da mesa: ' + err.message, 'error');
    }
  };

  // Real-time persist campaign notes in Master Desk
  const handleSaveCampaignNotes = async () => {
    if (!activeCampObj) return;
    setSavingNotes(true);

    try {
      const campRef = doc(db, 'campaigns', activeCampObj.id);
      await setDoc(campRef, {
        masterSecrets: liveSecrets,
        importantNpcs: liveNpcs,
        factions: liveFactions,
        generalNotes: liveGlobalNotes,
        updatedAt: serverTimestamp()
      }, { merge: true });

      showToast('Notas de mestre salvas no grimório físico!');
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao salvar pergaminho: ' + err.message, 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  // Roll dice and record to firebase
  const handleRollDice = async (sides: number) => {
    if (!activeSessionRoomId) return;

    setRollingDice(sides);
    setLastRollResult(null);

    // Dynamic suspense delay
    setTimeout(async () => {
      const roll = Math.floor(Math.random() * sides) + 1;
      setLastRollResult(roll);
      setRollingDice(null);

      try {
        const rollRef = collection(db, 'rooms', activeSessionRoomId, 'rolls');
        await addDoc(rollRef, {
          rollerName: 'Mestre da Mesa',
          sides: sides,
          result: roll,
          rolledAt: serverTimestamp()
        });
      } catch (err) {
        console.error('Error adding roll: ', err);
      }
    }, 900);
  };

  // Open Delete Campaign confirmation modal
  const handleDeleteCampaign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({
      id,
      type: 'campaign',
      title: 'Excluir Campanha',
      message: 'Tem certeza que deseja excluir esta campanha? Esta ação não poderá ser desfeita.',
      confirmLabel: 'Excluir Campanha',
    });
  };

  // Open Delete Room confirmation modal
  const handleDeleteRoom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({
      id,
      type: 'room',
      title: 'Excluir Sala',
      message: 'Tem certeza que deseja excluir esta sala? Todos os participantes perderão acesso.',
      confirmLabel: 'Excluir Sala',
    });
  };

  // Execute confirmed deletion
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    
    // Close the modal first for a snappy user feedback loop
    setDeleteConfirm(null);

    if (type === 'campaign') {
      // Optimistic state update
      setCampaigns(prev => prev.filter(c => c.id !== id));
      try {
        await deleteDoc(doc(db, 'campaigns', id));
        showToast('Campanha excluída com sucesso.', 'success');
      } catch (err: any) {
        console.error('Erro completo ao excluir campanha:', err);
        showToast('Não foi possível excluir a campanha.', 'error');
      }
    } else if (type === 'room') {
      // Optimistic state update & reset if active
      setRooms(prev => prev.filter(r => r.id !== id));
      if (activeSessionRoomId === id) setActiveSessionRoomId(null);
      try {
        // Delete all participants subcollection documents
        const participantsRef = collection(db, 'rooms', id, 'participants');
        const participantsSnap = await getDocs(participantsRef);
        await Promise.all(
          participantsSnap.docs.map(docSnap => 
            deleteDoc(doc(db, 'rooms', id, 'participants', docSnap.id))
          )
        );

        // Delete all rolls subcollection documents
        const rollsRef = collection(db, 'rooms', id, 'rolls');
        const rollsSnap = await getDocs(rollsRef);
        await Promise.all(
          rollsSnap.docs.map(docSnap => 
            deleteDoc(doc(db, 'rooms', id, 'rolls', docSnap.id))
          )
        );

        // Delete all tokens subcollection documents
        const tokensRef = collection(db, 'rooms', id, 'tokens');
        const tokensSnap = await getDocs(tokensRef);
        await Promise.all(
          tokensSnap.docs.map(docSnap => 
            deleteDoc(doc(db, 'rooms', id, 'tokens', docSnap.id))
          )
        );

        // Delete the main room document
        await deleteDoc(doc(db, 'rooms', id));
        showToast('Sala excluída com sucesso.', 'success');
      } catch (err: any) {
        console.error('Erro completo ao excluir sala:', err);
        showToast('Não foi possível excluir a sala.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen text-mythos-text pb-12 md:pb-6 flex flex-col justify-between relative">
      <RPGBackground />

      {/* Main Content wrapper */}
      <div className="relative z-10 w-full flex-1">
        {/* Header - Fixed & Compact */}
        <header className="border-b border-gold/20 bg-black/85 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gold-dark to-black rounded-lg border border-gold/40 shadow-[0_0_15px_rgba(197,160,89,0.15)]">
                <Crown size={22} className="text-gold-light" />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel text-xl sm:text-2xl tracking-[0.3em] text-gold-gradient font-black">REALMOR</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold-light/60 font-sans font-bold -mt-1">Modo Mestre</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleBackToSelection}
              className="px-4 py-2 text-[10px] sm:text-xs border border-gold/30 rounded-md tracking-widest hover:bg-gold/10 text-gold-light hover:text-white transition-all font-sans font-bold bg-black/40"
            >
              RETROCEDER PERFIL
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
              className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] p-4 rounded-xl border flex items-center gap-3 text-xs font-cinzel font-bold tracking-wider text-center shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl ${
                toastMessage.type === 'success' 
                  ? 'bg-black/80 border-gold text-gold-light animate-pulse' 
                  : 'bg-black/90 border-health text-red-300'
              }`}
            >
              <Flame size={16} className={toastMessage.type === 'success' ? 'text-gold' : 'text-health'} />
              <span>{toastMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirm(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-stone-950 border border-gold/30 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(197,160,89,0.3)] z-10 text-left"
              >
                {/* Header decorative accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />
                
                {/* Title */}
                <h3 className="font-cinzel text-lg sm:text-xl font-black text-gold-light tracking-widest uppercase mb-3 flex items-center gap-2">
                  <Flame size={18} className="text-gold" />
                  {deleteConfirm.title}
                </h3>
                
                {/* Message */}
                <p className="text-xs text-stone-300 leading-relaxed font-sans mb-6">
                  {deleteConfirm.message}
                </p>
                
                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-gold/20 rounded-lg text-xs font-bold text-stone-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={executeDelete}
                    className="px-4 py-2 bg-gradient-to-r from-red-950 to-red-800 border border-red-500 rounded-lg text-xs font-bold text-red-200 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] cursor-pointer"
                  >
                    {deleteConfirm.confirmLabel}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dynamic Workspace Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          
          <AnimatePresence mode="wait">
            
            {/* ========================================================= */}
            {/* SCREEN 1: GRIMORIO COCKPIT / DESK (ACTIVE SESSION ROOM) */}
            {/* ========================================================= */}
            {activeSessionRoomId ? (
              <motion.div
                key="cockpit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                {/* Back strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold/20 pb-4">
                  <button
                    onClick={() => {
                      if (window.confirm('Esfriar os dados e guardar os grimórios? Você retornará ao painel principal.')) {
                        withLoading(
                          new Promise<void>(resolve => {
                            setActiveSessionRoomId(null);
                            setTimeout(resolve, 750);
                          }),
                          "Guardando as crônicas do Mestre e limpando o altar..."
                        );
                      }
                    }}
                    className="flex items-center gap-2 text-xs text-gold hover:text-gold-light tracking-widest font-cinzel font-black active:scale-95 transition-all bg-black/40 border border-gold/15 hover:border-gold/30 px-3.5 py-2 rounded-lg"
                  >
                    <ChevronLeft size={16} />
                    SAIR DA MESA E GUARDAR GRIMÓRIOS
                  </button>
                  
                  <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-lg border border-gold/15 text-xs text-gold">
                    <Activity size={14} className="text-gold animate-pulse" />
                    <span>Mesa Ativa Sincronizada: <strong>{activeRoomObj?.roomName}</strong></span>
                    <span className="text-white/40">|</span>
                    <span>Código: <strong className="text-gold-light select-all">{activeRoomObj?.entryCode}</strong></span>
                  </div>
                </div>

                {/* Cover Banner Banner */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-gold/35 shadow-2xl flex items-end">
                  <div className="absolute inset-0 bg-cover bg-center filter brightness-50" style={{ backgroundImage: `url(${activeRoomObj?.coverUrl})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0706] via-black/40 to-transparent" />
                  <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20 italic">
                        Campanha Ativa • {activeCampObj?.system} ({activeCampObj?.edition})
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-cinzel font-black text-gold-light mt-1 tracking-wider drop-shadow-md">
                        {activeCampObj?.name}
                      </h2>
                      <p className="text-xs text-white/70 italic font-sans max-w-2xl">
                        {activeCampObj?.subtitle || 'Crônicas arquivadas com mistério e terror insondável...'}
                      </p>
                    </div>
                    
                    <div className="flex gap-4 text-xs font-cinzel text-white/80 pb-1">
                      <div className="flex flex-col bg-black/70 px-3 py-1.5 rounded border border-white/5">
                        <span className="text-[8px] text-gold/60 uppercase">Local Principal</span>
                        <span className="font-bold text-gold-light">{activeCampObj?.mainLocation || 'Global'}</span>
                      </div>
                      <div className="flex flex-col bg-black/70 px-3 py-1.5 rounded border border-white/5">
                        <span className="text-[8px] text-gold/60 uppercase">Instabilidade</span>
                        <span className="font-bold text-health">{activeCampObj?.lethality}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three Column Bento Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* COLUMN 1: Master's Grimoire Notes (4 Columns) */}
                  <div className="lg:col-span-4 bg-black/70 border border-gold/20 p-5 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between border-b border-gold/15 pb-2">
                        <h3 className="text-xs font-cinzel font-bold text-gold-light tracking-widest flex items-center gap-1.5">
                          <Scroll size={14} className="text-gold" />
                          GRIMÓRIO DO MESTRE (PRIVADO)
                        </h3>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSaveCampaignNotes}
                          loading={savingNotes}
                          className="text-[9px] py-1 px-2.5 h-auto rounded border border-gold/30 bg-gold/10"
                        >
                          <Save size={10} className="mr-1" />
                          SALVAR
                        </Button>
                      </div>

                      {/* Segredos Privados */}
                      <div className="flex-1 flex flex-col min-h-[140px] space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-gold/60 font-bold block">Segredos do Mestre (História & Revelações)</label>
                        <textarea
                          className="w-full flex-1 bg-black/50 border border-gold/10 rounded-lg p-3 text-[11px] font-sans text-stone-200 placeholder:text-stone-700 focus:outline-none focus:border-gold/30 focus:bg-black/70 resize-none h-full"
                          placeholder="Quem é o verdadeiro vilão? Qual o enigma do ritual? Escreva aqui seus segredos..."
                          value={liveSecrets}
                          onChange={(e) => setLiveSecrets(e.target.value)}
                        />
                      </div>

                      {/* NPCs Importantes */}
                      <div className="flex-1 flex flex-col min-h-[120px] space-y-1 pt-2">
                        <label className="text-[9px] uppercase tracking-wider text-gold/60 font-bold block">Personagens Importantes (NPCs)</label>
                        <textarea
                          className="w-full flex-1 bg-black/50 border border-gold/10 rounded-lg p-3 text-[11px] font-sans text-stone-200 placeholder:text-stone-700 focus:outline-none focus:border-gold/30 focus:bg-black/70 resize-none h-full"
                          placeholder="Nome e motivação dos principais personagens secundários..."
                          value={liveNpcs}
                          onChange={(e) => setLiveNpcs(e.target.value)}
                        />
                      </div>

                      {/* Facções e Organizações */}
                      <div className="flex-1 flex flex-col min-h-[120px] space-y-1 pt-2">
                        <label className="text-[9px] uppercase tracking-wider text-gold/60 font-bold block">Facções & Cultos Secretos</label>
                        <textarea
                          className="w-full flex-1 bg-black/50 border border-gold/10 rounded-lg p-3 text-[11px] font-sans text-stone-200 placeholder:text-stone-700 focus:outline-none focus:border-gold/30 focus:bg-black/70 resize-none h-full"
                          placeholder="A Ordem do Crepúsculo de Prata, o Sindicato de Arkham..."
                          value={liveFactions}
                          onChange={(e) => setLiveFactions(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gold/10 text-center">
                      <p className="text-[9px] text-stone-400 italic">"Nenhum investigador tem acesso visual a estes registros."</p>
                    </div>
                  </div>

                  {/* COLUMN 2: Dice Roller & Live Game Log (5 Columns) */}
                  <div className="lg:col-span-5 bg-black/70 border border-gold/20 p-5 rounded-2xl flex flex-col justify-between shadow-2xl min-h-[500px]">
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="border-b border-gold/15 pb-2">
                        <h3 className="text-xs font-cinzel font-bold text-gold-light tracking-widest flex items-center gap-1.5">
                          <Dices size={15} className="text-gold" />
                          CONJURADOR DE DADOS ORACULAR
                        </h3>
                      </div>

                      {/* Hex Dice grid */}
                      <div className="grid grid-cols-4 gap-2.5">
                        {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                          <button
                            key={sides}
                            onClick={() => handleRollDice(sides)}
                            disabled={rollingDice !== null}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                              rollingDice === sides
                                ? 'bg-gold/20 border-gold shadow-[0_0_20px_rgba(197,160,89,0.3)] scale-95'
                                : 'bg-black/60 border-gold/20 hover:border-gold/50 hover:bg-gold/5 hover:scale-105 active:scale-95'
                            }`}
                          >
                            <span className="text-[10px] font-mono text-gold-light group-hover:text-white font-bold">D{sides}</span>
                            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-inner">
                              <span className="font-cinzel text-xs font-bold">{sides}</span>
                            </div>
                          </button>
                        ))}
                        {/* Custom roll box visual result */}
                        <div className="col-span-1 p-1 rounded-xl border border-gold/20 bg-gradient-to-t from-gold/5 to-transparent flex flex-col items-center justify-center relative overflow-hidden md:h-18">
                          <AnimatePresence mode="wait">
                            {rollingDice ? (
                              <motion.div
                                key="rolling"
                                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6 }}
                                className="text-gold-light"
                              >
                                <Dices size={16} />
                              </motion.div>
                            ) : lastRollResult !== null ? (
                              <motion.div
                                key="result"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1.1, opacity: 1 }}
                                className="text-center"
                              >
                                <span className="text-[8px] uppercase tracking-wider text-stone-400 block -mt-1">Resultado</span>
                                <span className="font-cinzel text-base sm:text-lg font-black text-gold-gradient leading-none">
                                  {lastRollResult}
                                </span>
                              </motion.div>
                            ) : (
                              <span className="text-[9px] text-[#846a32]/60 uppercase font-cinzel text-center">Aguardando</span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Recent Rolls feed */}
                      <div className="flex-1 flex flex-col min-h-[220px] bg-black/40 border border-gold/10 rounded-xl p-4 space-y-2 mt-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1">
                          <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-black flex items-center gap-1.5">
                            <MessageSquare size={11} />
                            LOG DE ROLAGENS SÍNCRONO DA MESA
                          </span>
                          <span className="text-[8px] text-white/30 font-mono">AO VIVO</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1 scrollbar-thin">
                          {recentRolls.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                              <p className="text-[10px] text-white/30 italic">Nenhum dado rolou neste aposento ainda.</p>
                            </div>
                          ) : (
                            recentRolls.map((roll) => (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={roll.id}
                                className="p-2 border border-white/5 bg-black/60 rounded flex items-center justify-between leading-none text-stone-300"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold ${roll.rollerName.includes('Mestre') ? 'text-gold' : 'text-magic'}`}>
                                    {roll.rollerName}
                                  </span>
                                  <span className="text-[9px] text-white/30">rolou</span>
                                  <span className="font-mono text-[10px] font-black bg-stone-900 border border-white/5 px-2 py-0.5 rounded text-white-85">
                                    D{roll.sides}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-white/30">obtendo</span>
                                  <span className="font-cinzel text-xs font-black text-gold border border-gold/20 px-2 py-1 rounded bg-black">
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

                  {/* COLUMN 3: Active Investigators dossiers (3 Columns) */}
                  <div className="lg:col-span-3 bg-black/70 border border-gold/20 p-5 rounded-2xl flex flex-col justify-between shadow-2xl relative">
                    <div className="space-y-4 flex-1">
                      <div className="border-b border-gold/15 pb-2">
                        <h3 className="text-xs font-cinzel font-bold text-gold-light tracking-widest flex items-center gap-1.5">
                          <Users size={15} className="text-gold" />
                          INVESTIGADORES CONECTADOS ({activeParticipants.length})
                        </h3>
                      </div>

                      <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                        {activeParticipants.length === 0 ? (
                          <div className="text-center py-10 space-y-2">
                            <span className="text-gold/20 block animate-bounce">⚔️</span>
                            <p className="text-[10px] text-white/40 italic">Aguardando heróis cruzar o portal...</p>
                          </div>
                        ) : (
                          activeParticipants.map((part) => (
                            <div
                              key={part.userId}
                              onClick={() => setViewingPlayerSheet(part)}
                              className="p-3 border border-gold/15 hover:border-gold bg-[#0e0c0b]/90 rounded-xl cursor-pointer hover:scale-[1.02] hover:bg-black active:scale-95 transition-all text-left space-y-2.5 shadow-xl relative overflow-hidden group"
                            >
                              <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-xl bg-gold/5 flex items-center justify-center text-gold/40 border-l border-b border-gold/10 group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                                <Eye size={11} />
                              </div>

                              <div className="space-y-0.5">
                                <span className="text-[8px] uppercase tracking-wider text-gold font-mono block">
                                  Ficha d'Aventureiro
                                </span>
                                <h4 className="text-xs font-cinzel font-black uppercase text-gold-light truncate max-w-[120px]">
                                  {part.characterName || 'Sem Personagem'}
                                </h4>
                                <p className="text-[9px] text-white/50 italic leading-none font-sans truncate">
                                  {part.characterClass || 'Classe Desconhecida'}
                                </p>
                              </div>

                              {/* Simple Stats track */}
                              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                                <div className="bg-health/15 border border-health/30 rounded py-1 font-mono text-red-200">
                                  <span className="text-[7px] text-red-400 block uppercase font-sans">Vida (PV)</span>
                                  {part.health !== undefined ? `${part.health}/20` : 'N/A'}
                                </div>
                                <div className="bg-arcane/10 border border-arcane/30 rounded py-1 font-mono text-blue-200">
                                  <span className="text-[7px] text-blue-400 block uppercase font-sans">SAN (Mente)</span>
                                  {part.sanity !== undefined ? `${part.sanity}%` : 'N/A'}
                                </div>
                              </div>

                              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] text-stone-400">
                                <span>Jogador: {part.displayName}</span>
                                <span className="text-gold uppercase font-serif font-bold">Ver Ficha</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gold/10 text-center">
                      <p className="text-[8px] text-white/30 uppercase tracking-widest leading-normal">
                        Clique em um dossiê para inspecionar em detalhes
                      </p>
                    </div>
                  </div>

                </div>

                {/* Floating Ficha / dossier detail modal overlay */}
                <AnimatePresence>
                  {viewingPlayerSheet && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`bg-[#120f0e] border-2 border-gold p-6 rounded-2xl w-full shadow-[0_0_50px_rgba(0,0,0,0.9)] text-left relative overflow-hidden flex flex-col justify-between ${
                          viewingPlayerSheet.cocSheet ? 'max-w-2xl max-h-[85vh]' : 'max-w-lg'
                        }`}
                      >
                        <div 
                          className="absolute inset-x-0 top-0 h-44 opacity-25 filter brightness-35 bg-cover bg-center"
                          style={{ backgroundImage: `url(${activeRoomObj?.coverUrl})` }}
                        />
                        <div className="absolute inset-0 bg-radial-[circle_at_50%_40%] from-transparent via-[#120f0e] to-[#120f0e]" />
                        
                        {/* Dossier frame */}
                        <div className="relative z-10 space-y-4 flex-1 flex flex-col justify-between overflow-y-auto max-h-full scrollbar-thin">
                          <div className="flex items-start justify-between border-b border-gold/20 pb-2">
                            <div>
                              <span className="text-[8px] uppercase tracking-widest text-gold font-bold">INSULADOS DO ARQUIVO SEGREDO</span>
                              <h3 className="text-xl font-cinzel font-black text-gold-gradient uppercase mt-1">
                                {viewingPlayerSheet.characterName || 'Investigador Desconhecido'}
                              </h3>
                              <p className="text-xs text-stone-400 italic font-sans mt-0.5">
                                Ocupação: {viewingPlayerSheet.characterClass || 'Não especificada'}
                              </p>
                            </div>
                            <button
                              onClick={() => setViewingPlayerSheet(null)}
                              className="p-1 px-3 border border-gold/20 hover:border-gold hover:bg-gold/10 bg-black text-gold text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              FECHAR
                            </button>
                          </div>

                          {/* Render Full Call of Cthulhu Sheet for the GM */}
                          {viewingPlayerSheet.cocSheet ? (
                            <div className="space-y-4 flex-1 flex flex-col justify-between">
                              {/* Quick Summary Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-center select-none">
                                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-2">
                                  <span className="text-[7px] text-red-400 block uppercase">❤️ Vida</span>
                                  <span className="text-base font-black text-red-200 mt-1 block">
                                    {viewingPlayerSheet.health !== undefined ? viewingPlayerSheet.health : 15} / {viewingPlayerSheet.cocSheet.maxHealth || 15}
                                  </span>
                                </div>
                                <div className="bg-blue-950/40 border border-gold/30 rounded-xl p-2">
                                  <span className="text-[7px] text-gold block uppercase">🧠 Sanidade</span>
                                  <span className="text-base font-black text-blue-200 mt-1 block">
                                    {viewingPlayerSheet.sanity !== undefined ? viewingPlayerSheet.sanity : 70}%
                                  </span>
                                </div>
                                <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-2">
                                  <span className="text-[7px] text-emerald-400 block uppercase">🍀 Sorte</span>
                                  <span className="text-base font-black text-emerald-200 mt-1 block">
                                    {viewingPlayerSheet.cocSheet.luck || 50}
                                  </span>
                                </div>
                                <div className="bg-purple-950/40 border border-purple-500/20 rounded-xl p-2">
                                  <span className="text-[7px] text-purple-400 block uppercase">✨ Magia</span>
                                  <span className="text-base font-black text-purple-200 mt-1 block">
                                    {viewingPlayerSheet.cocSheet.magic || 10}
                                  </span>
                                </div>
                                <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-2">
                                  <span className="text-[7px] text-amber-400 block uppercase">🏃 Movimento</span>
                                  <span className="text-base font-black text-amber-200 mt-1 block">
                                    {viewingPlayerSheet.cocSheet.moveRate || 8}
                                  </span>
                                </div>
                              </div>

                              {/* Tabs Header inside Modal */}
                              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 border-y border-gold/20">
                                {[
                                  { id: 'attributes', label: 'Atributos' },
                                  { id: 'skills', label: 'Perícias' },
                                  { id: 'combat', label: 'Combate' },
                                  { id: 'sanity', label: 'Sanidade' },
                                  { id: 'backstory', label: 'Histórico' },
                                  { id: 'inventory', label: 'Inventário' },
                                  { id: 'companions', label: 'Contatos' },
                                ].map((tab) => (
                                  <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setMasterSheetTab(tab.id as any)}
                                    className={`px-2.5 py-1 rounded text-[9px] font-cinzel font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                                      masterSheetTab === tab.id
                                        ? 'bg-gold/25 text-white border border-gold/40 shadow-inner'
                                        : 'text-stone-500 hover:text-stone-300 hover:bg-white/5 border border-transparent'
                                    }`}
                                  >
                                    {tab.label}
                                  </button>
                                ))}
                              </div>

                              {/* Tab Content Areas */}
                              <div className="my-2 flex-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                                {masterSheetTab === 'attributes' && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {Object.entries(viewingPlayerSheet.cocSheet.attributes || {}).map(([attr, val]: [string, any]) => (
                                      <div key={attr} className="bg-black/60 border border-gold/15 p-2 rounded-xl text-center">
                                        <span className="text-[9px] font-cinzel font-bold text-gold/85 block">{attr}</span>
                                        <span className="font-mono font-black text-sm text-gold-light mt-0.5 block">{val}</span>
                                        <div className="flex justify-between w-full text-[7px] text-stone-500 font-mono mt-1 pt-1 border-t border-white/5">
                                          <span>Reg: {val}</span>
                                          <span>1/2: {Math.floor(val / 2)}</span>
                                          <span>1/5: {Math.floor(val / 5)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {masterSheetTab === 'skills' && (
                                  <div className="space-y-2">
                                    <input 
                                      type="text"
                                      placeholder="🔎 Filtrar perícias oficiais do investigador..."
                                      value={masterSkillSearchQuery}
                                      onChange={(e) => setMasterSkillSearchQuery(e.target.value)}
                                      className="w-full bg-black/60 border border-gold/20 text-[10px] text-white p-1.5 rounded placeholder-stone-500"
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[220px] overflow-y-auto">
                                      {Object.entries(viewingPlayerSheet.cocSheet.skills || {})
                                        .filter(([name]) => name.toLowerCase().includes(masterSkillSearchQuery.toLowerCase()))
                                        .map(([name, val]: [string, any]) => (
                                          <div key={name} className="bg-black/45 border border-gold/10 p-1.5 rounded flex items-center justify-between text-[10px]">
                                            <span className="text-stone-300 font-bold">{name}</span>
                                            <div className="flex items-center gap-1 font-mono text-[8px] text-stone-500">
                                              <span>Reg: <strong className="text-gold/80">{val}</strong></span>
                                              <span>1/2: <strong className="text-stone-400">{Math.floor(val / 2)}</strong></span>
                                              <span>1/5: <strong className="text-stone-400">{Math.floor(val / 5)}</strong></span>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {masterSheetTab === 'combat' && (
                                  <div className="space-y-3">
                                    <span className="text-[9px] font-cinzel font-black text-gold/80 uppercase block">Arsenal Equipado</span>
                                    <div className="space-y-1.5">
                                      {(!viewingPlayerSheet.cocSheet.combat?.weapons || viewingPlayerSheet.cocSheet.combat.weapons.length === 0) ? (
                                        <p className="text-[9px] text-stone-500 italic text-center">Nenhuma arma cadastrada no arsenal.</p>
                                      ) : (
                                        viewingPlayerSheet.cocSheet.combat.weapons.map((w: any) => (
                                          <div key={w.id} className="bg-black/50 border border-gold/10 p-2 rounded text-[10px]">
                                            <div className="flex justify-between font-bold border-b border-white/5 pb-1 mb-1">
                                              <span className="text-gold-light">{w.name}</span>
                                              <span className="text-red-300">Dano: {w.damage}</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-1 text-[8px] text-stone-400">
                                              <span>Alcan.: {w.range}</span>
                                              <span>Ataques: {w.attacks}</span>
                                              <span>Balas: {w.ammo}</span>
                                              <span>Malfunc.: {w.malfunction}</span>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 border-t border-gold/15 pt-2 text-[10px] text-stone-400 text-center">
                                      <p>Bônus Soco: <strong>{viewingPlayerSheet.cocSheet.combat?.damageBonus || '0'}</strong></p>
                                      <p>Deslocamento: <strong>{viewingPlayerSheet.cocSheet.combat?.build || '0'}</strong></p>
                                    </div>
                                    <div className="mt-2.5 bg-black/60 p-2.5 rounded-xl border border-red-500/10 space-y-2">
                                      <span className="text-[7.5px] uppercase font-bold text-red-400 tracking-wider font-mono block">Estado Vital do Investigador</span>
                                      <div className="grid grid-cols-2 gap-2 text-[9px] text-stone-300">
                                        <div className="flex justify-between items-center bg-black/30 p-1 px-1.5 rounded">
                                          <span>Estado Consc.:</span>
                                          <strong className={`uppercase ${
                                            viewingPlayerSheet.cocSheet.combatState === 'dying' ? 'text-red-500 animate-pulse' :
                                            viewingPlayerSheet.cocSheet.combatState === 'unconscious' ? 'text-amber-500' : 'text-emerald-400'
                                          }`}>
                                            {viewingPlayerSheet.cocSheet.combatState === 'dying' ? 'Morrendo 💀' :
                                             viewingPlayerSheet.cocSheet.combatState === 'unconscious' ? 'Inconsciente' : 'Consciente'}
                                          </strong>
                                        </div>
                                        <div className="flex justify-between items-center bg-black/30 p-1 px-1.5 rounded">
                                          <span>Lesão Grave:</span>
                                          <strong className={viewingPlayerSheet.cocSheet.majorInjury ? 'text-red-500' : 'text-stone-500'}>
                                            {viewingPlayerSheet.cocSheet.majorInjury ? 'SIM (Grave)' : 'NÃO'}
                                          </strong>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {masterSheetTab === 'sanity' && (
                                  <div className="space-y-2 text-[10px] pr-1">
                                    <div className="grid grid-cols-2 gap-2 bg-black/60 p-2 rounded">
                                      <p>Insanidade Temp: <strong className={viewingPlayerSheet.cocSheet.sanity?.tempInsane ? 'text-red-400' : 'text-stone-500'}>{viewingPlayerSheet.cocSheet.sanity?.tempInsane ? 'SIM' : 'NÃO'}</strong></p>
                                      <p>Insanidade Indef: <strong className={viewingPlayerSheet.cocSheet.sanity?.indefInsane ? 'text-red-400' : 'text-stone-500'}>{viewingPlayerSheet.cocSheet.sanity?.indefInsane ? 'SIM' : 'NÃO'}</strong></p>
                                    </div>
                                    <p>Histórico de Perdas: <span className="text-stone-300">{viewingPlayerSheet.cocSheet.sanity?.lossHistory || 'Nenhum registrado'}</span></p>
                                    
                                    {/* Detailed psychiatric cards for GM */}
                                    <div className="bg-black/55 p-2 rounded-xl border border-gold/10 space-y-1.5">
                                      <span className="text-[7.5px] uppercase font-bold text-red-500 font-mono block">Quadros Clínicos de Cartas Temáticas</span>
                                      
                                      <div className="space-y-1">
                                        <p className="text-[8px] text-stone-500 font-bold uppercase">💀 Traumas perenes ({(viewingPlayerSheet.cocSheet.sanity?.traumasList || []).length})</p>
                                        <div className="flex flex-wrap gap-1">
                                          {(viewingPlayerSheet.cocSheet.sanity?.traumasList || []).map((tr: string, idx: number) => (
                                            <span key={idx} className="bg-red-950/40 text-red-300 border border-red-900/30 text-[7.5px] p-0.5 px-1.5 rounded">{tr}</span>
                                          ))}
                                          {(viewingPlayerSheet.cocSheet.sanity?.traumasList || []).length === 0 && <span className="text-[8px] text-stone-600 italic">Mente estável</span>}
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <p className="text-[8px] text-stone-500 font-bold uppercase">🕷️ Fobias catalogadas ({(viewingPlayerSheet.cocSheet.sanity?.phobiasList || []).length})</p>
                                        <div className="flex flex-wrap gap-1">
                                          {(viewingPlayerSheet.cocSheet.sanity?.phobiasList || []).map((ph: string, idx: number) => (
                                            <span key={idx} className="bg-blue-950/40 text-blue-300 border-blue-900/20 text-[7.5px] p-0.5 px-1.5 rounded">{ph}</span>
                                          ))}
                                          {(viewingPlayerSheet.cocSheet.sanity?.phobiasList || []).length === 0 && <span className="text-[8px] text-stone-600 italic">Nenhuma</span>}
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <p className="text-[8px] text-stone-500 font-bold uppercase">🔮 Manias catalogadas ({(viewingPlayerSheet.cocSheet.sanity?.maniasList || []).length})</p>
                                        <div className="flex flex-wrap gap-1">
                                          {(viewingPlayerSheet.cocSheet.sanity?.maniasList || []).map((mn: string, idx: number) => (
                                            <span key={idx} className="bg-purple-950/40 text-purple-300 border border-purple-900/20 text-[7.5px] p-0.5 px-1.5 rounded">{mn}</span>
                                          ))}
                                          {(viewingPlayerSheet.cocSheet.sanity?.maniasList || []).length === 0 && <span className="text-[8px] text-stone-600 italic">Nenhuma</span>}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-black/40 p-2 rounded border border-white/5 space-y-1">
                                      <span className="text-[8px] text-gold uppercase font-bold block">Encontros com o Sobrenatural</span>
                                      <p className="text-[9px] text-[#ffa500] italic">"{viewingPlayerSheet.cocSheet.sanity?.encounters || 'Nenhum registrado na ficha'}"</p>
                                    </div>
                                  </div>
                                )}

                                {masterSheetTab === 'backstory' && (
                                  <div className="space-y-2 text-[10px]">
                                    <p>Descrição Pessoal: <span className="text-stone-300">{viewingPlayerSheet.cocSheet.backstory?.personalDesc || 'Não preenchido'}</span></p>
                                    <p>Crenças/Ideologia: <span className="text-stone-300">{viewingPlayerSheet.cocSheet.backstory?.ideology || 'Não preenchida'}</span></p>
                                    <p>Pessoas Importantes: <span className="text-stone-300">{viewingPlayerSheet.cocSheet.backstory?.significantPeople || 'Nenhuma'}</span></p>
                                    <p>Locais Significativos: <span className="text-stone-300">{viewingPlayerSheet.cocSheet.backstory?.meaningfulLocations || 'Nenhum'}</span></p>
                                    <p>Relíquias: <span className="text-stone-300">{viewingPlayerSheet.cocSheet.backstory?.treasuredPossessions || 'Nenhuma'}</span></p>
                                    <p>Marcas & Feridas: <span className="text-stone-300">{viewingPlayerSheet.cocSheet.backstory?.injuries || 'Nenhuma'}</span></p>
                                    <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-1 mt-1 text-[9px] text-stone-400">
                                      <p>Tomos: <span className="text-stone-200 block italic">{viewingPlayerSheet.cocSheet.backstory?.arcaneTomes || '-'}</span></p>
                                      <p>Feitiços: <span className="text-stone-200 block italic">{viewingPlayerSheet.cocSheet.backstory?.spells || '-'}</span></p>
                                    </div>
                                  </div>
                                )}

                                {masterSheetTab === 'inventory' && (
                                  <div className="space-y-2.5 text-[10px]">
                                    <p className="font-bold text-gold">Equipamentos e Mochila:</p>
                                    <p className="text-stone-300 leading-relaxed font-sans">{viewingPlayerSheet.cocSheet.inventory?.equipment || 'Nenhum equipamento listado.'}</p>
                                    
                                    <p className="font-bold text-gold pt-1">Outras Posses:</p>
                                    <p className="text-stone-400 font-sans">{viewingPlayerSheet.cocSheet.inventory?.possessions || 'Nenhuma posse cadastrada.'}</p>

                                    <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-2 text-center text-[9px]">
                                      <div className="bg-black/30 p-1 rounded">
                                        <span>Dinheiro Vivo</span>
                                        <strong className="text-emerald-400 block mt-0.5">{viewingPlayerSheet.cocSheet.inventory?.money || '$0'}</strong>
                                      </div>
                                      <div className="bg-black/30 p-1 rounded">
                                        <span>Patrimônio</span>
                                        <strong className="text-emerald-400 block mt-0.5">{viewingPlayerSheet.cocSheet.inventory?.assets || '$0'}</strong>
                                      </div>
                                      <div className="bg-black/30 p-1 rounded">
                                        <span>Nível de Gastos</span>
                                        <strong className="text-emerald-400 block mt-0.5">{viewingPlayerSheet.cocSheet.inventory?.spendingLevel || '$0'}</strong>
                                      </div>
                                    </div>

                                    {/* Visual item deck for GM */}
                                    <div className="space-y-1.5 border-t border-white/10 pt-2 mt-1">
                                      <span className="text-[7.5px] uppercase font-bold text-gold font-mono block">Equipamentos de Destaque (Cards Visuais)</span>
                                      <div className="grid grid-cols-2 gap-1.5">
                                        {(viewingPlayerSheet.cocSheet.inventory?.quickItems || []).map((item: any) => (
                                          <div key={item.id} className="bg-black/55 border border-gold/10 p-1.5 rounded-lg flex items-center gap-2">
                                            <span className="text-base">{item.icon}</span>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-[8.5px] font-bold text-stone-200 truncate leading-none">{item.name}</p>
                                              <span className="text-[6.5px] text-stone-500 font-mono">Dossier Item</span>
                                            </div>
                                          </div>
                                        ))}
                                        {(viewingPlayerSheet.cocSheet.inventory?.quickItems || []).length === 0 && (
                                          <span className="text-[8.5px] text-stone-600 italic">Nenhum equipamento visual destacado na mochila.</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {masterSheetTab === 'companions' && (
                                  <div className="space-y-2">
                                    <span className="text-[9px] text-gold uppercase block font-bold leading-none">Contatos Cadastrados</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {(!viewingPlayerSheet.cocSheet.companions || viewingPlayerSheet.cocSheet.companions.length === 0) ? (
                                        <p className="text-[9px] text-stone-500 italic text-center col-span-2">Nenhum companheiro listado.</p>
                                      ) : (
                                        viewingPlayerSheet.cocSheet.companions.map((c: any) => (
                                          <div key={c.id} className="bg-black/50 border border-gold/10 p-2 rounded text-[10px]">
                                            <p className="font-bold text-gold-light">{c.name}</p>
                                            <p className="text-[8px] text-stone-400">Relação: {c.relation} ({c.player})</p>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Legacy Fallback */
                            <div className="space-y-4">
                              {/* Stat Grid */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1c0a0a] border border-red-500/30 rounded-xl p-3 text-center">
                                  <span className="text-[9px] uppercase tracking-widest text-[#ff6b6b] block font-bold">PONTOS DE VIDA (PV)</span>
                                  <span className="font-mono text-xl text-red-200 font-bold block mt-1">
                                    {viewingPlayerSheet.health !== undefined ? `${viewingPlayerSheet.health} / 20` : 'Não registrado'}
                                  </span>
                                  <div className="w-full bg-black/60 rounded-full h-1.5 mt-2 overflow-hidden border border-white/5">
                                    <div 
                                      className="bg-red-500 h-full transition-all" 
                                      style={{ width: `${Math.min(100, ((viewingPlayerSheet.health || 0) / 20) * 100)}%` }} 
                                    />
                                  </div>
                                </div>
                                
                                <div className="bg-[#0b141c] border border-magic/30 rounded-xl p-3 text-center">
                                  <span className="text-[9px] uppercase tracking-widest text-magic block font-bold">SANIDADE (SAN)</span>
                                  <span className="font-mono text-xl text-blue-200 font-bold block mt-1">
                                    {viewingPlayerSheet.sanity !== undefined ? `${viewingPlayerSheet.sanity}%` : 'Não registrado'}
                                  </span>
                                  <div className="w-full bg-black/60 rounded-full h-1.5 mt-2 overflow-hidden border border-white/5">
                                    <div 
                                      className="bg-magic h-full transition-all" 
                                      style={{ width: `${viewingPlayerSheet.sanity || 0}%` }} 
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Skills & equipment */}
                              <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-white/5 text-[11px]">
                                <span className="text-[9px] text-gold/60 uppercase font-black tracking-widest block">Habilidades e Equipamento Coletados</span>
                                <div className="text-stone-300 leading-relaxed font-sans whitespace-pre-wrap max-h-24 overflow-y-auto">
                                  {viewingPlayerSheet.skills || 'Nenhuma habilidade cadastrada.'}
                                </div>
                              </div>

                              {/* Investigator Backstory */}
                              <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-white/5 text-[11px]">
                                <span className="text-[9px] text-gold/60 uppercase font-black tracking-widest block">Histórico do Personagem (Lore)</span>
                                <div className="text-stone-300 leading-relaxed font-sans whitespace-pre-wrap max-h-24 overflow-y-auto italic">
                                  "{viewingPlayerSheet.backstory || 'Nenhum passado catalogado no diário.'}"
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Player account data */}
                          <div className="pt-2 border-t border-gold/15 flex items-center justify-between text-[10px] text-stone-500 font-sans">
                            <span>Membro: <strong>{viewingPlayerSheet.displayName}</strong></span>
                            <span>E-mail: {viewingPlayerSheet.email}</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

              </motion.div>
            ) : activeAction === null ? (
              
              <motion.div
                key="menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 pb-24"
              >
                {/* Title */}
                <div className="text-center py-6 space-y-1.5">
                  <div className="w-12 h-12 mx-auto rounded-full border border-gold/30 flex items-center justify-center bg-black/60 shadow-[0_0_20px_rgba(197,160,89,0.15)] mb-2 group">
                    <Crown size={28} className="text-gold animate-pulse" />
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-cinzel font-black tracking-[0.25em] text-gold-gradient">
                    PORTAL DO MESTRE
                  </h1>
                  <p className="text-[11px] text-gold-light/60 tracking-[0.2em] uppercase font-sans font-black">
                     Gerenciamento de Aventuras e Central de Campanhas
                  </p>
                </div>

                {/* Desktop Tabs Header Selector */}
                <div className="hidden md:flex items-center justify-center gap-3 max-w-xl mx-auto pb-4 border-b border-gold/15">
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`px-5 py-2.5 border rounded-xl font-cinzel font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'campaigns' 
                        ? 'bg-gold/10 border-gold text-gold shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                        : 'border-gold/20 hover:border-gold/50 text-stone-400 hover:text-white'
                    }`}
                  >
                    <BookOpen size={14} />
                    Campanhas
                  </button>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className={`px-5 py-2.5 border rounded-xl font-cinzel font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'rooms' 
                        ? 'bg-gold/10 border-gold text-gold shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                        : 'border-gold/20 hover:border-gold/50 text-stone-400 hover:text-white'
                    }`}
                  >
                    <Compass size={14} />
                    Salas
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-5 py-2.5 border rounded-xl font-cinzel font-black text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeTab === 'settings' 
                        ? 'bg-gold/10 border-gold text-gold shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                        : 'border-gold/20 hover:border-gold/50 text-stone-400 hover:text-white'
                    }`}
                  >
                    <Settings size={14} />
                    Configurações
                  </button>
                </div>

                {/* --- TAB: CAMPANHAS --- */}
                {activeTab === 'campaigns' && (
                  <div className="space-y-6">
                    {/* Action card: Criar Campanha */}
                    <div className="max-w-md mx-auto px-2">
                      <button
                        onClick={() => setActiveAction('campaign')}
                        className="group relative flex items-center gap-4 p-4 bg-black/75 border border-gold/25 hover:border-gold/75 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-[0_0_20px_rgba(197,160,89,0.1)] cursor-pointer w-full"
                      >
                        <div className="w-14 h-14 rounded-full bg-gold/5 border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_10px_rgba(197,160,89,0.1)] group-hover:scale-105 group-hover:border-gold-light transition-all shrink-0">
                          <BookOpen size={24} className="stroke-[1.5] text-gold" />
                        </div>
                        <div className="space-y-0.5 text-left flex-1 min-w-0">
                          <h3 className="font-cinzel text-sm sm:text-base font-black text-gold group-hover:text-gold-light tracking-widest uppercase truncate">
                            Criar Campanha
                          </h3>
                          <p className="text-[11px] text-stone-400 font-sans line-clamp-1">
                            Nova aventura nas crônicas de REALMOR
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Campaigns Grid */}
                    <div className="space-y-5 pt-4 max-w-6xl mx-auto px-4">
                      <div className="flex items-center justify-between border-b border-gold/20 pb-2">
                        <span className="text-xs font-cinzel font-black tracking-[0.25em] text-gold-light">
                          📜 SUAS CAMPANHAS DE RPG ({campaigns.length})
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 hidden sm:inline">GRIMÓRIOS DE AVENTURA ATIVOS</span>
                      </div>

                      {loadingCampaigns ? (
                        <div className="text-center py-12">
                          <p className="text-xs text-white/40 italic animate-pulse">Retomando conexões com crônicas arcanas...</p>
                        </div>
                      ) : campaigns.length === 0 ? (
                        <div className="bg-black/30 border border-gold/10 p-12 text-center rounded-2xl space-y-4">
                          <Scroll size={36} className="text-stone-600 mx-auto" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold font-cinzel text-gold">Grimório Eternamente Vazio</p>
                            <p className="text-[11px] text-white/40 max-w-xs mx-auto">Você não possui nenhuma campanha cadastrada. Dê vida ao seu universo clicando no botão acima.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {campaigns.map((camp) => (
                            <div
                              key={camp.id}
                              className="bg-[#0f0c0b]/85 border border-gold/20 p-4 rounded-xl flex flex-col md:flex-row gap-4 hover:border-gold/50 shadow-2xl transition-all duration-300 relative group overflow-hidden"
                            >
                              {/* Graphic Adventure Cover */}
                              <div className="w-full md:w-32 h-36 rounded-lg overflow-hidden border border-gold/15 bg-cover bg-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${camp.coverUrl})` }} />

                              <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                                <div className="space-y-1 text-left relative pr-6">
                                  <h4 className="font-cinzel text-sm sm:text-base font-black text-gold-light tracking-wide truncate">
                                    {camp.name}
                                  </h4>
                                  <p className="text-[10px] text-stone-400 italic truncate">{camp.subtitle || 'Sem subtítulo'}</p>
                                  
                                  <button
                                    onClick={(e) => handleDeleteCampaign(camp.id, e)}
                                    className="absolute top-0 right-0 p-1 text-white/30 hover:text-red-400 rounded transition-colors"
                                    title="Apagar do Grimório"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                {/* Details columns */}
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-stone-300 font-sans text-left">
                                  <div className="flex items-center gap-1.5 text-stone-400">
                                    <Shield size={11} className="text-gold/60" />
                                    <span>{camp.system}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-stone-400">
                                    <MapPin size={11} className="text-gold/60" />
                                    <span>{camp.mainLocation}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-stone-400">
                                    <Clock size={11} className="text-gold/60" />
                                    <span>{camp.era}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-stone-400">
                                    <Users size={11} className="text-gold/60" />
                                    <span>Limite: {camp.maxPlayers}</span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[9px] uppercase tracking-widest text-[#ffa500] font-mono px-2 py-0.5 rounded bg-[#ffa500]/10 border border-[#ffa500]/25">
                                    {camp.status}
                                  </span>
                                  <span className="text-[9px] text-stone-400 italic">Episódio #{camp.sessionCount || 0}</span>
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
                  <div className="space-y-6">
                    {/* Action card: Criar Sala */}
                    <div className="max-w-md mx-auto px-2">
                      <button
                        onClick={() => {
                          if (campaigns.length === 0) {
                            showToast('Você precisa registrar pelo menos uma campanha dantes de abrir salas.', 'error');
                            setActiveAction('campaign');
                          } else {
                            setActiveAction('room');
                          }
                        }}
                        className="group relative flex items-center gap-4 p-4 bg-black/75 border border-gold/25 hover:border-gold/75 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-[0_0_20px_rgba(197,160,89,0.1)] cursor-pointer w-full"
                      >
                        <div className="w-14 h-14 rounded-full bg-gold/5 border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_10px_rgba(197,160,89,0.1)] group-hover:scale-105 group-hover:border-gold-light transition-all shrink-0">
                          <Compass size={24} className="stroke-[1.5] text-gold" />
                        </div>
                        <div className="space-y-0.5 text-left flex-1 min-w-0">
                          <h3 className="font-cinzel text-sm sm:text-base font-black text-gold group-hover:text-gold-light tracking-widest uppercase truncate">
                            Criar Sala
                          </h3>
                          <p className="text-[11px] text-stone-400 font-sans line-clamp-1">
                            Reunir jogadores síncronos no portal
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Rooms List */}
                    <div className="space-y-5 pt-4 max-w-6xl mx-auto px-4">
                      <div className="flex items-center justify-between border-b border-gold/20 pb-2">
                        <span className="text-xs font-cinzel font-black tracking-[0.25em] text-gold-light">
                          🧭 PORTAIS CONJURADOS ATIVOS ({rooms.length})
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 hidden sm:inline">MESAS DE JOGO INSTANCIADAS</span>
                      </div>

                      {loadingRooms ? (
                        <div className="text-center py-10">
                          <p className="text-xs text-white/40 italic animate-pulse">Mapeando portais ativos...</p>
                        </div>
                      ) : rooms.length === 0 ? (
                        <p className="p-6 bg-black/10 text-stone-500 rounded-xl text-center text-[11px] italic">Nenhuma sala síncrona materializada nesta época cósmica.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {rooms.map((room) => (
                            <div
                              key={room.id}
                              className="bg-[#0c0909]/85 border border-gold/20 p-5 rounded-2xl flex flex-col md:flex-row gap-5 hover:border-gold/50 shadow-2xl transition-all duration-300 relative group overflow-hidden"
                            >
                              {/* Visual campaign cover on left */}
                              <div className="w-full md:w-36 h-36 rounded-xl overflow-hidden border border-gold/15 bg-cover bg-center shrink-0 shadow-inner group-hover:scale-[1.03] transition-transform duration-500" style={{ backgroundImage: `url(${room.coverUrl})` }} />

                              <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div className="space-y-1 text-left relative pr-6">
                                  <span className="text-[8px] uppercase tracking-wider text-gold font-bold">Mesa de {room.system}</span>
                                  <h4 className="font-cinzel text-base font-black text-gold-light mt-0.5 tracking-wide truncate">
                                    {room.roomName}
                                  </h4>
                                  <p className="text-[10px] text-white/40 truncate">Campanha vinculada: {room.campaignName}</p>
                                  
                                  <button
                                    onClick={(e) => handleDeleteRoom(room.id, e)}
                                    className="absolute top-0 right-0 p-1 text-white/30 hover:text-red-400 rounded transition-colors"
                                    title="Dissolver sala"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                {/* Big Entry Code display */}
                                <div className="bg-black/80 my-2 px-3 py-1.5 border border-gold/20 rounded-xl flex items-center justify-between shadow-inner">
                                  <div className="text-left leading-none">
                                    <span className="text-[7px] uppercase text-stone-500 font-mono tracking-widest">Código de Entrada</span>
                                    <p className="font-mono text-base font-bold tracking-widest text-[#c5a059] mt-0.5">{room.entryCode}</p>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(room.entryCode)}
                                    className="px-2.5 py-1 border border-gold/25 hover:border-gold/55 bg-gold/5 text-[9px] font-sans font-bold rounded transition-all text-gold flex items-center gap-1 active:scale-90"
                                  >
                                    <Copy size={11} />
                                    Copiar
                                  </button>
                                </div>

                                {/* Interactive actions */}
                                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                                  <span className="text-[10px] text-stone-400 font-sans font-semibold truncate max-w-[125px]">
                                    Status: {room.privacy}
                                  </span>
                                  
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      withLoading(
                                        new Promise<void>(resolve => {
                                          setActiveSessionRoomId(room.id);
                                          setTimeout(resolve, 800);
                                        }),
                                        "Desvendando segredos cósmicos da mesa..."
                                      );
                                    }}
                                    className="px-4 py-1.5 h-auto text-[10px] uppercase font-extrabold tracking-wider bg-gold hover:bg-gold-light text-[#000]"
                                  >
                                    ENTRAR NA SALA
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

                {/* --- TAB: CONFIGURAÇÕES (SETTINGS) --- */}
                {activeTab === 'settings' && (
                  <div className="max-w-md mx-auto bg-black/85 border border-gold/25 p-6 rounded-2xl space-y-6 shadow-2xl relative overflow-hidden mt-4">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/55 to-transparent" />
                    
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 border-2 border-gold/40 flex items-center justify-center text-gold font-cinzel text-2xl font-black">
                        {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'M'}
                      </div>
                      <h3 className="font-cinzel text-lg font-black text-gold-light mt-2 tracking-widest uppercase">
                        PAINEL DE MESTRES
                      </h3>
                      <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase">
                        Sessão de Credenciais Ativas
                      </p>
                    </div>

                    <div className="border-t border-gold/15 pt-4 space-y-3 font-sans text-xs text-left">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-stone-400">Nome:</span>
                        <span className="text-white font-bold">{user?.displayName || 'Mestre do Jogo'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-stone-400">Email:</span>
                        <span className="text-white font-bold truncate max-w-[200px]">{user?.email}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-stone-400">Perfis Vinculados:</span>
                        <span className="text-gold font-cinzel font-black uppercase tracking-wider text-[10px]">Mestre & Jogador</span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                      <button
                        onClick={() => {
                          localStorage.removeItem('mythos_active_profile');
                          clearProfile();
                          navigate('/select-profile');
                        }}
                        className="w-full py-2.5 px-4 bg-gold/10 hover:bg-gold/20 text-gold font-cinzel font-black text-xs tracking-widest border border-gold/30 rounded-lg transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
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
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom))] bg-black/95 border-t border-gold/20 backdrop-blur-md z-[9999] flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.95)]">
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-all ${
                      activeTab === 'campaigns' ? 'text-gold' : 'text-stone-500'
                    }`}
                  >
                    <BookOpen size={20} className={activeTab === 'campaigns' ? 'text-gold' : 'text-stone-500'} />
                    <span className="text-[9px] font-cinzel font-black tracking-widest uppercase">Campanhas</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('rooms')}
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-all ${
                      activeTab === 'rooms' ? 'text-gold' : 'text-stone-500'
                    }`}
                  >
                    <Compass size={20} className={activeTab === 'rooms' ? 'text-gold' : 'text-stone-500'} />
                    <span className="text-[9px] font-cinzel font-black tracking-widest uppercase">Salas</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-all ${
                      activeTab === 'settings' ? 'text-gold' : 'text-stone-500'
                    }`}
                  >
                    <Settings size={20} className={activeTab === 'settings' ? 'text-gold' : 'text-stone-500'} />
                    <span className="text-[9px] font-cinzel font-black tracking-widest uppercase">Ajustes</span>
                  </button>
                </div>

              </motion.div>
            ) : activeAction === 'campaign' ? (
              
              <motion.div
                key="campaign-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                {/* Back Link */}
                <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                  <button
                    onClick={() => setActiveAction(null)}
                    className="flex items-center gap-1.5 text-xs text-gold/60 hover:text-gold tracking-widest font-cinzel font-black active:scale-95 transition-all"
                  >
                    <ChevronLeft size={16} />
                    VOLTAR AO PORTAL
                  </button>
                  <span className="text-[10px] font-cinzel font-bold text-gold-gradient tracking-widest uppercase">
                    Escrivania de Crônicas
                  </span>
                </div>

                {/* Main Form content */}
                <form onSubmit={handleCreateCampaign} className="bg-black/75 border border-gold/25 p-6 rounded-2xl space-y-5 shadow-2xl relative text-left">
                  <div className="border-b border-gold/15 pb-2.5">
                    <h3 className="font-cinzel text-base text-gold-light tracking-widest uppercase font-black">
                      Nova Campanha Suprema
                    </h3>
                    <p className="text-[11px] text-stone-400 font-sans mt-1 leading-normal">
                      Defina segredos, tom narrativo, detalhes do cosmos e registre no grimório imortal.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* INFORMAÇÕES GERAIS */}
                    <div className="space-y-3">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#ffa500] font-black border-b border-[#ffa500]/20 pb-0.5 block">1. INFORMAÇÕES GERAIS</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Nome do Registro *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: O Horror de Arkham"
                            className="mythos-input text-xs py-2 px-3.5"
                            value={campaignForm.name}
                            onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Subtítulo ou Epígrafe</label>
                          <input
                            type="text"
                            placeholder="Ex: Um mistério insondável nos anos 1920"
                            className="mythos-input text-xs py-2 px-3.5"
                            value={campaignForm.subtitle}
                            onChange={(e) => setCampaignForm({ ...campaignForm, subtitle: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Sistema d'RPG</label>
                          <input
                            type="text"
                            placeholder="Call of Cthulhu"
                            className="mythos-input text-xs py-2 px-3.5"
                            value={campaignForm.system}
                            onChange={(e) => setCampaignForm({ ...campaignForm, system: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Época Histórica</label>
                          <select
                            className="mythos-input text-xs py-2 px-2 bg-black/60 font-sans text-gold"
                            value={campaignForm.era}
                            onChange={(e) => setCampaignForm({ ...campaignForm, era: e.target.value as Campaign['era'] })}
                          >
                            <option value="Anos 1920">Anos 1920 (Clássico)</option>
                            <option value="Era moderna">Era moderna</option>
                            <option value="Vitoriana">Vitoriana (Gaslight)</option>
                            <option value="Medieval sombrio">Medieval sombrio</option>
                            <option value="Personalizada">Personalizada</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Cenário / Local Principal</label>
                          <input
                            type="text"
                            placeholder="Arkham"
                            className="mythos-input text-xs py-2 px-3.5"
                            value={campaignForm.mainLocation}
                            onChange={(e) => setCampaignForm({ ...campaignForm, mainLocation: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SELEÇÃO DE CAPA */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#ffa500] font-black border-b border-[#ffa500]/20 pb-0.5 block">2. CAPA DA CAMPANHA</span>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">URL da Imagem de Capa</label>
                        <input
                          type="text"
                          placeholder="Cole o endereço de uma imagem ou escolha um preset abaixo..."
                          className="mythos-input text-xs py-2 px-3.5 text-stone-200"
                          value={campaignForm.coverUrl}
                          onChange={(e) => setCampaignForm({ ...campaignForm, coverUrl: e.target.value })}
                        />
                      </div>

                      {/* Presets Grid */}
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3.5 pt-1">
                        {PRESET_COVERS.map((cov) => {
                          const isSelected = campaignForm.coverUrl === cov.url;
                          return (
                            <button
                              key={cov.id}
                              type="button"
                              onClick={() => setCampaignForm({ ...campaignForm, coverUrl: cov.url })}
                              className={`rounded-lg border overflow-hidden h-20 bg-cover bg-center transition-all duration-300 relative group cursor-pointer ${
                                isSelected ? 'border-gold shadow-[0_0_15px_rgba(197,160,89,0.5)] scale-95' : 'border-white/10 hover:border-gold/50 hover:scale-105'
                              }`}
                              style={{ backgroundImage: `url(${cov.url})` }}
                              title={cov.name}
                            >
                              <div className={`absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors ${isSelected ? 'bg-transparent' : ''}`} />
                              {isSelected && (
                                <div className="absolute bottom-1 right-1 bg-gold rounded-full p-0.5 text-black">
                                  <Check size={10} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* AMBIENTAÇÃO & SINOPSE */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#ffa500] font-black border-b border-[#ffa500]/20 pb-0.5 block">3. AMBIENTAÇÃO & SINOPSE</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Tom Narrativo</label>
                          <select
                            className="mythos-input text-xs py-2 px-2 bg-black/60 font-sans text-gold"
                            value={campaignForm.tone}
                            onChange={(e) => setCampaignForm({ ...campaignForm, tone: e.target.value as Campaign['tone'] })}
                          >
                            <option value="Horror cósmico">Horror cósmico (Mistério e Ocultismo)</option>
                            <option value="Investigação">Investigação Policial</option>
                            <option value="Horror psicológico">Horror psicológico (Insanidade)</option>
                            <option value="Cultos e ocultismo">Cultos e seitas secretas</option>
                            <option value="Sobrevivência">Sobrevivência e Tensão</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Letalidade</label>
                          <select
                            className="mythos-input text-xs py-2 px-2 bg-black/60 font-sans text-gold"
                            value={campaignForm.lethality}
                            onChange={(e) => setCampaignForm({ ...campaignForm, lethality: e.target.value as Campaign['lethality'] })}
                          >
                            <option value="Baixo">Baixo (Cenário de Fantasia Heroico)</option>
                            <option value="Médio">Médio (Investigativo balanceado)</option>
                            <option value="Alto">Alto (Realista - Perigo iminente)</option>
                            <option value="Brutal">Brutal (Insano - Alta morte corporificada)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Resumo / Sinopse Geral</label>
                        <textarea
                          rows={3}
                          placeholder="Escreva a sinopse pública da campanha do que os jogadores devem saber..."
                          className="mythos-input text-xs py-2 px-3 text-stone-200"
                          value={campaignForm.summary}
                          onChange={(e) => setCampaignForm({ ...campaignForm, summary: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* SEGREDOS PRIVADOS DO MESTRE */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#ffa500] font-black border-b border-[#ffa500]/20 pb-0.5 block flex items-center gap-1">
                        <Lock size={10} />
                        4. SEGREDOS DO MESTRE (PRIVADO)
                      </span>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Segredos Narrativos</label>
                        <textarea
                          rows={2}
                          placeholder="Insira revelações sobre a conspiração ou enigma central de sua autoria..."
                          className="mythos-input text-xs py-2 px-3 text-stone-200"
                          value={campaignForm.masterSecrets}
                          onChange={(e) => setCampaignForm({ ...campaignForm, masterSecrets: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">NPCs de início (Opcional)</label>
                          <textarea
                            rows={2}
                            placeholder="Ex: Inspetor Legrasse, Professor Angell..."
                            className="mythos-input text-xs py-2 px-3 text-stone-200"
                            value={campaignForm.importantNpcs}
                            onChange={(e) => setCampaignForm({ ...campaignForm, importantNpcs: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Facções Principais (Opcional)</label>
                          <textarea
                            rows={2}
                            placeholder="Ex: O Culto de Cthulhu, Sociedade Hermética..."
                            className="mythos-input text-xs py-2 px-3 text-stone-200"
                            value={campaignForm.factions}
                            onChange={(e) => setCampaignForm({ ...campaignForm, factions: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 flex justify-end gap-3 font-cinzel text-xs border-t border-gold/10">
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() => setActiveAction(null)}
                      className="text-stone-400"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      size="sm"
                      className="px-8 bg-gold hover:bg-gold-light text-black py-2.5 font-bold"
                    >
                      CONSCREVER GRIMÓRIO
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              
              <motion.div
                key="room-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                {/* Back Link */}
                <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                  <button
                    onClick={() => setActiveAction(null)}
                    className="flex items-center gap-1.5 text-xs text-gold/60 hover:text-gold tracking-widest font-cinzel font-black active:scale-95 transition-all"
                  >
                    <ChevronLeft size={16} />
                    VOLTAR AO PORTAL
                  </button>
                  <span className="text-[10px] font-cinzel font-bold text-gold-gradient tracking-widest uppercase">
                    Evocação Cósmica
                  </span>
                </div>

                {/* Form to invoke room */}
                <form onSubmit={handleCreateRoom} className="bg-black/75 border border-gold/25 p-6 rounded-2xl space-y-5 shadow-2xl text-left">
                  <div className="border-b border-gold/15 pb-2.5">
                    <h3 className="font-cinzel text-base text-gold-light tracking-widest uppercase font-black flex items-center gap-1.5">
                      <Compass size={16} />
                      Materializar Sala de Realidade Síncrona
                    </h3>
                    <p className="text-[11px] text-stone-400 font-sans mt-0.5 leading-normal">
                      Crie um canal de dados para investigações em tempo real. Os jogadores só herdarão a campanha ativa selecionada.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Visual campaign selector */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-extrabold">Selecione o Grimório de Campanha Acoplado *</label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                        {campaigns.map((camp) => {
                          const isSelected = roomForm.campaignId === camp.id;
                          return (
                            <div
                              key={camp.id}
                              onClick={() => setRoomForm(prev => ({
                                ...prev,
                                campaignId: camp.id,
                                roomName: `Mesa de ${camp.name}`
                              }))}
                              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all duration-200 relative ${
                                isSelected ? 'border-gold bg-gold/10' : 'border-white/10 bg-black hover:border-gold/50'
                              }`}
                            >
                              <div className="w-10 h-10 rounded overflow-hidden bg-cover bg-center shrink-0 border border-white/10" style={{ backgroundImage: `url(${camp.coverUrl})` }} />
                              <div className="flex-1 min-w-0 text-left">
                                <h4 className="text-xs font-bold text-stone-300 truncate font-cinzel leading-none">{camp.name}</h4>
                                <span className="text-[8px] text-stone-500 font-mono italic block mt-0.5">{camp.system}</span>
                              </div>
                              {isSelected && (
                                <span className="text-gold absolute top-1.5 right-1.5">★</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Room Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Título da Mesa Ativa *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Investigação da Ordem dos Antigos"
                        className="mythos-input text-xs py-2 px-3.5"
                        value={roomForm.roomName}
                        onChange={(e) => setRoomForm({ ...roomForm, roomName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Max players */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Max Investigadores</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          className="mythos-input text-xs py-2 px-3.5"
                          value={roomForm.maxPlayers}
                          onChange={(e) => setRoomForm({ ...roomForm, maxPlayers: Number(e.target.value) })}
                        />
                      </div>
                      
                      {/* Privacy selection */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Visibilidade do Portal</label>
                        <select
                          className="mythos-input text-xs py-2 px-2 bg-black/60 font-sans text-gold"
                          value={roomForm.privacy}
                          onChange={(e) => setRoomForm({ ...roomForm, privacy: e.target.value as Room['privacy'] })}
                        >
                          <option value="Aberta por código">Aberta por código místico</option>
                          <option value="Fechada">Fechada (Selada temporariamente)</option>
                        </select>
                      </div>
                    </div>

                    {/* Notes to show */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-[#c5a059] uppercase tracking-wider font-bold">Notas de Entrada (Para exibir no pergaminho de conexão dos heróis)</label>
                      <input
                        type="text"
                        placeholder="Ex: Tragam fones de ouvido e fichas atualizadas na 7a Edição."
                        className="mythos-input text-xs py-2 px-3.5"
                        value={roomForm.notes}
                        onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 font-cinzel text-xs border-t border-gold/10">
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() => setActiveAction(null)}
                      className="text-stone-400"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      size="sm"
                      className="px-8 bg-gold hover:bg-gold-light text-black py-2.5 font-bold"
                    >
                      CONJURAR MESA
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>

      {/* Decorative footer */}
      <footer className="w-full text-center py-6 border-t border-gold/10 max-w-7xl mx-auto px-6 mt-16 relative z-10 bg-black/40 backdrop-blur-sm rounded-t-2xl">
        <p className="text-[10px] tracking-[0.35em] uppercase text-gold/40 font-cinzel font-black">
          REALMOR COCKPIT GRIMÓRIO SUPREMO MESTRE — CONEXÃO SEGURA 3000
        </p>
      </footer>

      {/* Mobile Bottom Navigation Safe Zone Spacer - Definitively prevents content from being hidden behind footer bar */}
      <div className="h-32 w-full md:hidden flex-shrink-0 pointer-events-none" aria-hidden="true" />
    </div>
  );
};
