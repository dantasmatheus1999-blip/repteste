import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Heart, 
  Droplet, 
  Shield, 
  Zap, 
  Footprints, 
  Sword, 
  Sparkles, 
  Backpack, 
  Target, 
  Star, 
  ChevronLeft, 
  X, 
  Coins, 
  BookOpen, 
  Search, 
  Scroll, 
  Crown, 
  Plus, 
  Minus, 
  Users, 
  Map as MapIcon, 
  Settings, 
  Feather, 
  Sun, 
  Trash2, 
  Edit3, 
  Check 
} from 'lucide-react';
import { CharacterService } from '../../services/characterService';
import { GameService } from '../../services/gameService';
import { normalizeCharacterSheet, NormalizedSheetData, formatMod, ATTRIBUTE_NAMES } from '../../utils/sheetCalculations';
import { Attribute } from '../../types/character';
import { Game, GamePlayer } from '../../types/game';
import { getClassEmoji } from '../../utils/characterUtils';
import { subscribeToSessionAudio } from '../../services/audioService';
import { CharacterSelectionStage3D } from '../../components/character/CharacterSelectionStage3D';
import { Floating3DDice } from '../../components/dice3d/Floating3DDice';
import { useDice3D } from '../../components/dice3d/Dice3DContext';
import { MapEditor } from '../../components/map/MapEditor';
import { PlayerCampaignMapView } from '../../components/campaign-map/PlayerCampaignMapView';

interface MobilePlayerSessionPageProps {
  campaignId: string;
  gameId: string;
  game: Game;
  currentPlayer: GamePlayer;
  players?: GamePlayer[];
  onExit?: () => void;
}

type ActiveTab = 'overview' | 'inventory' | 'powers' | 'spells' | 'skills' | 'biography' | 'map';

// Cantoneiras douradas ornamentadas clássicas para molduras medievais
const OrnateCardCorners: React.FC<{ color?: string }> = ({ color = 'border-amber-500/60' }) => (
  <div className="absolute inset-0 pointer-events-none z-10">
    <div className={`absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l ${color}`} />
    <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r ${color}`} />
    <div className={`absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l ${color}`} />
    <div className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r ${color}`} />
  </div>
);

export const MobilePlayerSessionPage: React.FC<MobilePlayerSessionPageProps> = ({
  campaignId,
  gameId,
  game,
  currentPlayer,
  players,
  onExit
}) => {
  const [characterRaw, setCharacterRaw] = useState<any | null>(null);
  const [loadingChar, setLoadingChar] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Hook do motor 3D de dados do sistema
  const { roll3DDice } = useDice3D();

  // Jogadores da sala (usa lista fornecida pelo pai se disponível, evitando listener duplicado)
  const [roomPlayers, setRoomPlayers] = useState<GamePlayer[]>(players || []);

  // Modais auxiliares do cabeçalho
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Modais da Mochila / Equipamento (Adicionar Item e Editar Dinheiro)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemDesc, setNewItemDesc] = useState('');

  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);
  const [customMoneyValue, setCustomMoneyValue] = useState<number>(0);

  // Filtros internos de abas secundárias
  const [skillSearch, setSkillSearch] = useState('');
  const [onlyTrainedSkills, setOnlyTrainedSkills] = useState(false);
  const [spellCircleFilter, setSpellCircleFilter] = useState<number | 'all'>('all');
  const [spellSearch, setSpellSearch] = useState('');

  // Debounce refs para sincronização atômica e segura com o Firestore (150ms)
  const pendingUpdatesRef = useRef<Record<string, any>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inscrição em áudio temático da sessão em tempo real
  useEffect(() => {
    if (!campaignId || !gameId) return;
    const unsubAudio = subscribeToSessionAudio(campaignId, gameId);
    return () => {
      unsubAudio();
    };
  }, [campaignId, gameId]);

  // Sincronização de jogadores: se já fornecido por prop, atualiza estado; senão abre listener único
  useEffect(() => {
    if (players && players.length > 0) {
      setRoomPlayers(players);
      return;
    }
    if (!campaignId || !gameId) return;
    const unsubPlayers = GameService.subscribeToGamePlayers(campaignId, gameId, (loadedPlayers) => {
      setRoomPlayers(loadedPlayers);
    });
    return () => unsubPlayers();
  }, [campaignId, gameId, players]);

  // Inscrição em tempo real aos dados da ficha do personagem selecionado
  const charId = currentPlayer?.characterId;
  useEffect(() => {
    if (!charId) {
      setLoadingChar(false);
      return;
    }

    setLoadingChar(true);
    const unsub = CharacterService.subscribeToCharacter(charId, (charData) => {
      if (charData) {
        setCharacterRaw(charData);
      }
      setLoadingChar(false);
    });

    return () => {
      unsub();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [charId]);

  // Normalização computada da ficha
  const sheet: NormalizedSheetData | null = useMemo(() => {
    if (!characterRaw) return null;
    return normalizeCharacterSheet(characterRaw, currentPlayer?.characterId || '');
  }, [characterRaw, currentPlayer?.characterId]);

  // Função de atualização com reflexo otimista imediato e debounce seguro
  const handleUpdateCharacterResource = useCallback((partial: { currentPV?: number; currentPM?: number }) => {
    if (!charId) return;

    setCharacterRaw((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...partial
      };
    });

    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...partial
    };

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const payload = { ...pendingUpdatesRef.current };
      pendingUpdatesRef.current = {};
      try {
        await CharacterService.updateCharacter(charId, payload);
      } catch (err) {
        console.error(`[MobilePlayerSession] Falha ao sincronizar recursos do personagem ${charId}:`, err);
      }
    }, 150);
  }, [charId]);

  // Controles táteis de PV (+1 / -1) respeitando estritamente os limites [0, maxPV]
  const handleAdjustPV = useCallback((delta: number) => {
    if (!sheet) return;
    const currentVal = sheet.currentPV;
    const maxVal = sheet.maxPV;
    const nextVal = Math.max(0, Math.min(maxVal, currentVal + delta));
    if (nextVal !== currentVal) {
      handleUpdateCharacterResource({ currentPV: nextVal });
    }
  }, [sheet, handleUpdateCharacterResource]);

  // Controles táteis de PM (+1 / -1) respeitando estritamente os limites [0, maxPM]
  const handleAdjustPM = useCallback((delta: number) => {
    if (!sheet) return;
    const currentVal = sheet.currentPM;
    const maxVal = sheet.maxPM;
    const nextVal = Math.max(0, Math.min(maxVal, currentVal + delta));
    if (nextVal !== currentVal) {
      handleUpdateCharacterResource({ currentPM: nextVal });
    }
  }, [sheet, handleUpdateCharacterResource]);

  // Disparar rolagem com o Dado 3D oficial do sistema
  const handleQuickRoll = (label: string, bonus: number, diceFormula = '1d20') => {
    roll3DDice({
      diceType: 'd20',
      modifier: bonus,
      label,
      formula: `${diceFormula} ${bonus >= 0 ? '+' : '-'} ${Math.abs(bonus)}`
    });
  };

  // =========================================================================
  // GESTÃO DA MOCHILA E EQUIPAMENTO (ADICIONAR, REMOVER, QUANTIDADE, DINHEIRO)
  // =========================================================================
  const currentMoney = Number(characterRaw?.tibares ?? characterRaw?.money?.to ?? characterRaw?.money ?? 0);

  const handleSaveNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !charId) return;

    const currentInventory = Array.isArray(characterRaw?.inventory) 
      ? [...characterRaw.inventory] 
      : (Array.isArray(sheet?.inventory) ? [...sheet.inventory] : []);

    const newItem = {
      id: 'item_' + Date.now(),
      name: newItemName.trim(),
      quantity: Math.max(1, Number(newItemQty) || 1),
      description: newItemDesc.trim(),
      weight: 0
    };

    const updated = [...currentInventory, newItem];
    setCharacterRaw((prev: any) => ({ ...prev, inventory: updated }));
    setIsAddItemModalOpen(false);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemDesc('');

    try {
      await CharacterService.updateCharacter(charId, { inventory: updated });
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!charId) return;
    const currentInventory = Array.isArray(characterRaw?.inventory) 
      ? [...characterRaw.inventory] 
      : (Array.isArray(sheet?.inventory) ? [...sheet.inventory] : []);

    const updated = currentInventory.filter((it: any) => it.id !== itemId);
    setCharacterRaw((prev: any) => ({ ...prev, inventory: updated }));

    try {
      await CharacterService.updateCharacter(charId, { inventory: updated });
    } catch (err) {
      console.error('Erro ao remover item:', err);
    }
  };

  const handleAdjustItemQty = async (itemId: string, delta: number) => {
    if (!charId) return;
    const currentInventory = Array.isArray(characterRaw?.inventory) 
      ? [...characterRaw.inventory] 
      : (Array.isArray(sheet?.inventory) ? [...sheet.inventory] : []);

    const updated = currentInventory.map((it: any) => {
      if (it.id === itemId) {
        const nextQty = Math.max(1, (Number(it.quantity) || 1) + delta);
        return { ...it, quantity: nextQty };
      }
      return it;
    });

    setCharacterRaw((prev: any) => ({ ...prev, inventory: updated }));

    try {
      await CharacterService.updateCharacter(charId, { inventory: updated });
    } catch (err) {
      console.error('Erro ao alterar quantidade do item:', err);
    }
  };

  const handleAdjustMoney = async (delta: number) => {
    if (!charId) return;
    const nextVal = Math.max(0, currentMoney + delta);
    setCharacterRaw((prev: any) => ({ ...prev, tibares: nextVal, money: nextVal }));

    try {
      await CharacterService.updateCharacter(charId, { tibares: nextVal, money: nextVal });
    } catch (err) {
      console.error('Erro ao alterar dinheiro:', err);
    }
  };

  const handleSetExactMoney = async (value: number) => {
    if (!charId) return;
    const nextVal = Math.max(0, Math.floor(value));
    setCharacterRaw((prev: any) => ({ ...prev, tibares: nextVal, money: nextVal }));
    setIsMoneyModalOpen(false);

    try {
      await CharacterService.updateCharacter(charId, { tibares: nextVal, money: nextVal });
    } catch (err) {
      console.error('Erro ao definir dinheiro:', err);
    }
  };

  if (loadingChar) {
    return (
      <div className="min-h-screen bg-[#070504] flex flex-col items-center justify-center p-6 text-center space-y-4 font-cinzel">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-amber-900/40 border-t-amber-500 animate-spin" />
          <Sword className="w-6 h-6 text-amber-500/80 absolute inset-0 m-auto" />
        </div>
        <p className="text-xs text-amber-200/80 tracking-widest uppercase">
          Conectando à sua ficha de Tormenta 20...
        </p>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="min-h-screen bg-[#070504] flex flex-col items-center justify-center p-6 text-center space-y-4 font-cinzel max-w-md mx-auto">
        <Sword className="w-12 h-12 text-amber-500" />
        <h2 className="text-lg font-bold text-amber-100 uppercase">Herói Não Vinculado</h2>
        <p className="text-xs text-stone-400 font-serif">
          Você entrou na sala sem selecionar um personagem ativo.
        </p>
        {onExit && (
          <button
            onClick={onExit}
            className="px-5 py-2.5 rounded-xl bg-amber-950 border border-amber-600/50 text-amber-200 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Voltar ao Lobby
          </button>
        )}
      </div>
    );
  }

  // Cálculos visuais de PV e PM
  const currentPV = sheet.currentPV;
  const maxPV = Math.max(1, sheet.maxPV);
  const hpPercent = Math.min(100, Math.max(0, Math.round((currentPV / maxPV) * 100)));

  const currentPM = sheet.currentPM;
  const maxPM = Math.max(1, sheet.maxPM);
  const pmPercent = Math.min(100, Math.max(0, Math.round((currentPM / maxPM) * 100)));

  const healthStatusText = 
    hpPercent <= 0 ? 'Inconsciente' :
    hpPercent <= 25 ? 'À beira da morte' :
    hpPercent <= 50 ? 'Gravemente Ferido' :
    hpPercent < 100 ? 'Ferido' :
    'Saúde Total';

  // Perícias filtradas
  const filteredSkills = sheet.skills.filter(s => {
    if (onlyTrainedSkills && !s.trained) return false;
    if (skillSearch.trim()) {
      const q = skillSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.attr.toLowerCase().includes(q);
    }
    return true;
  });

  // Magias filtradas
  const filteredSpells = sheet.spells.filter(s => {
    if (spellCircleFilter !== 'all' && s.circle !== spellCircleFilter) return false;
    if (spellSearch.trim()) {
      const q = spellSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.school.toLowerCase().includes(q);
    }
    return true;
  });

  const modelPath = characterRaw?.model3D || characterRaw?.modelPath || characterRaw?.avatar3D || '3d/anaogrande-v1.glb';
  const playersCount = roomPlayers.length > 0 ? roomPlayers.length : (game.maxPlayers || 4);

  // Lista dos 6 atributos ordenados: FOR, DES, CON, INT, SAB, CAR
  const attributeTiles = [
    {
      key: 'FOR',
      label: 'FOR',
      value: sheet.attributes.FOR,
      icon: Sword,
      borderClass: 'border-red-800/80 shadow-[0_0_10px_rgba(220,38,38,0.2)]',
      bgClass: 'from-[#2a0f0f]/90 via-[#180808]/95 to-[#0f0505]',
      labelColor: 'text-red-400',
      iconColor: 'text-red-400'
    },
    {
      key: 'DES',
      label: 'DES',
      value: sheet.attributes.DES,
      icon: Feather,
      borderClass: 'border-amber-700/80 shadow-[0_0_10px_rgba(217,119,6,0.2)]',
      bgClass: 'from-[#2e1c0c]/90 via-[#1a0f06]/95 to-[#0d0703]',
      labelColor: 'text-amber-400',
      iconColor: 'text-amber-400'
    },
    {
      key: 'CON',
      label: 'CON',
      value: sheet.attributes.CON,
      icon: Heart,
      borderClass: 'border-emerald-800/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      bgClass: 'from-[#0e2719]/90 via-[#07160d]/95 to-[#040d07]',
      labelColor: 'text-emerald-400',
      iconColor: 'text-emerald-400'
    },
    {
      key: 'INT',
      label: 'INT',
      value: sheet.attributes.INT,
      icon: BookOpen,
      borderClass: 'border-blue-800/80 shadow-[0_0_10px_rgba(37,99,235,0.2)]',
      bgClass: 'from-[#0d1d36]/90 via-[#07101f]/95 to-[#030812]',
      labelColor: 'text-blue-400',
      iconColor: 'text-blue-400'
    },
    {
      key: 'SAB',
      label: 'SAB',
      value: sheet.attributes.SAB,
      icon: Sun,
      borderClass: 'border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      bgClass: 'from-[#332408]/90 via-[#1c1404]/95 to-[#0f0a02]',
      labelColor: 'text-amber-300',
      iconColor: 'text-amber-300'
    },
    {
      key: 'CAR',
      label: 'CAR',
      value: sheet.attributes.CAR,
      icon: Crown,
      borderClass: 'border-purple-800/80 shadow-[0_0_10px_rgba(147,51,234,0.2)]',
      bgClass: 'from-[#250d36]/90 via-[#15071f]/95 to-[#0a0310]',
      labelColor: 'text-purple-400',
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070504] text-stone-200 pb-24 font-sans select-none antialiased relative overflow-x-hidden">
      
      {/* CENÁRIO MEDIEVAL DE FUNDO */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-45"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.08) 0%, rgba(7, 5, 4, 0.95) 75%), url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=85')`
        }}
      />
      <div className="fixed bottom-0 inset-x-0 h-96 pointer-events-none z-0 bg-gradient-to-t from-[#070504] via-[#120b06]/60 to-transparent" />

      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DA PARTIDA (SEM O QUADRADINHO DO DADO NO TOPO)          */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0c0907]/90 backdrop-blur-md border-b border-amber-900/50 px-3 sm:px-4 py-2 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          {onExit && (
            <button
              onClick={onExit}
              className="w-8 h-8 rounded-lg bg-[#140f0a] border border-amber-600/50 text-amber-400 hover:text-amber-200 hover:border-amber-400 flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md active:scale-95"
              title="Sair da Partida"
              aria-label="Voltar"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse shrink-0" />
              <h1 className="text-xs sm:text-sm font-cinzel font-bold text-amber-100 uppercase tracking-widest truncate drop-shadow">
                {game.name || 'A NOITE DO LUAR'}
              </h1>
            </div>
            <p className="text-[10px] text-stone-400 font-serif truncate">
              Mestre: <strong className="text-amber-300 font-cinzel font-semibold">{game.masterName || 'MESTRE'}</strong>
            </p>
          </div>
        </div>

        {/* Lado Direito: Ações da Sessão (👥 4, ⚙️ Configurações) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Jogadores na Sala */}
          <button
            type="button"
            onClick={() => setIsPlayersModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#140f0a] border border-amber-900/60 hover:border-amber-600/70 text-amber-300 text-xs font-cinzel font-bold transition-colors cursor-pointer"
            title="Aventureiros na Mesa"
          >
            <Users size={13} className="text-amber-400" />
            <span className="text-[11px] font-mono">{playersCount}</span>
          </button>

          {/* Configurações */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-8 h-8 rounded-lg bg-[#140f0a] border border-amber-900/60 hover:border-amber-600/70 text-stone-400 hover:text-amber-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Configurações da Sessão"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 6. DADO 3D REUTILIZADO DO SISTEMA — POSICIONADO ABAIXO DE CONFIGURAÇÕES   */}
      {/* ========================================================================= */}
      <Floating3DDice className="fixed right-3 top-14 z-40 flex flex-col items-center gap-1 select-none pointer-events-auto" />

      {/* ========================================================================= */}
      {/* 2. ÁREA PRINCIPAL DO HERÓI (PALCO 3D CENTRAL + HUD FLUTUANTE)              */}
      {/* ========================================================================= */}
      <main 
        style={{ display: activeTab === 'overview' ? 'block' : 'none' }}
        className="relative z-10 max-w-md mx-auto px-2 xs:px-3 pt-1 pb-3 space-y-1.5"
      >
          
          {/* A. IDENTIDADE DO PERSONAGEM (SEM ÍCONE REDONDO, TEXTO COMPLETO E LEGÍVEL) */}
          <section className="text-left pt-0.5 px-0.5 space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Sparkles size={15} className="text-amber-400 shrink-0 fill-amber-400/30" />
              <h2 className="font-cinzel font-black text-lg xs:text-xl sm:text-2xl text-amber-100 uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] break-words">
                {sheet.name}
              </h2>
            </div>

            <div className="leading-tight space-y-0.5">
              <p className="text-xs xs:text-[13px] font-cinzel font-bold text-amber-400 tracking-wider uppercase">
                {sheet.className} • NÍVEL {sheet.level}
              </p>
              <p className="text-[11px] text-stone-200 font-serif font-medium">
                {sheet.raceName}
              </p>
              <p className="text-[10px] text-amber-200/90 font-serif leading-snug">
                {sheet.originName || 'Herói Camponês'} {sheet.deity ? `(Devoto de ${sheet.deity})` : ''}
              </p>
            </div>
          </section>

          {/* B. PALCO 3D CENTRAL COM CARDS DE STATUS MENORES E QUADRADOS NAS LATERAIS */}
          <section className="relative w-full h-[330px] xs:h-[350px] sm:h-[370px] flex items-center justify-center overflow-visible my-0">
            
            {/* PALCO 3D DO PERSONAGEM LIMPO (ROTAÇÃO HORIZONTAL 360°, SEM BOTÕES OU TEXTOS) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-auto">
              <div className="w-full h-full max-w-[280px] xs:max-w-[310px] relative">
                <CharacterSelectionStage3D
                  modelPath={modelPath}
                  characterName={sheet.name}
                  horizontalOnly={true}
                  isVisible={activeTab === 'overview'}
                />
              </div>
            </div>

            {/* OVERLAY DE HUD: CARDS DE COMBATE MENORES, QUADRADOS E PRÓXIMOS */}
            <div className="relative z-10 w-full h-full flex justify-between items-stretch pointer-events-none px-0.5">
              
              {/* COLUNA ESQUERDA: PV (TOPO) + DEFESA E DESLOCAMENTO (QUADRADOS E PRÓXIMOS) */}
              <div className="w-[84px] xs:w-[92px] sm:w-[100px] flex flex-col justify-between py-0.5 pointer-events-auto shrink-0">
                
                {/* 1. CARD: ❤️ PONTOS DE VIDA (PV) COMPACTO */}
                <div className="p-1.5 rounded-xl bg-gradient-to-b from-[#2d0f0f]/95 via-[#1a0808]/95 to-[#0d0404]/98 border border-red-700/80 shadow-[0_0_12px_rgba(220,38,38,0.25)] relative overflow-hidden backdrop-blur-md">
                  <OrnateCardCorners color="border-red-500/80" />
                  
                  <div className="flex items-center gap-1 mb-0.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-950 border border-red-600 flex items-center justify-center text-red-400 shrink-0">
                      <Heart size={8} className="fill-red-500" />
                    </div>
                    <span className="text-[7.5px] xs:text-[8px] font-cinzel font-black text-red-300 uppercase tracking-wider truncate">
                      VIDA (PV)
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-0.5">
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-cinzel text-base xs:text-lg font-black text-stone-100 tracking-tight leading-none">
                        {currentPV}
                      </span>
                      <span className="text-[9px] font-cinzel font-bold text-red-300/80">
                        /{maxPV}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 bg-black/60 border border-red-900/80 rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustPV(-1)}
                        disabled={currentPV <= 0}
                        className="w-3.5 h-3.5 rounded flex items-center justify-center text-red-400 hover:bg-red-950 active:scale-90 disabled:opacity-30 cursor-pointer"
                        title="Diminuir PV"
                      >
                        <Minus size={8} strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustPV(1)}
                        disabled={currentPV >= maxPV}
                        className="w-3.5 h-3.5 rounded flex items-center justify-center text-red-400 hover:bg-red-950 active:scale-90 disabled:opacity-30 cursor-pointer"
                        title="Aumentar PV"
                      >
                        <Plus size={8} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#0a0404] overflow-hidden border border-red-900/90 my-1 p-0.2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.9)] transition-all duration-300"
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>

                  <p className="text-[7px] text-stone-300 font-serif italic text-center truncate leading-none">
                    {hpPercent}% • {healthStatusText}
                  </p>
                </div>

                {/* BLOCO INFERIOR ESQUERDO: DEFESA E DESLOCAMENTO PRÓXIMOS E QUADRADOS */}
                <div className="space-y-1 mt-auto">
                  {/* 2. CARD: 🛡️ DEFESA (QUADRADO, COMPACTO) */}
                  <div className="p-1 xs:p-1.5 rounded-xl bg-gradient-to-b from-[#1c160e]/95 via-[#120e09]/95 to-[#090704]/98 border border-amber-600/70 shadow-md relative overflow-hidden backdrop-blur-md flex flex-col justify-between h-[52px] xs:h-[56px]">
                    <OrnateCardCorners color="border-amber-400/70" />

                    <div className="flex items-center gap-1">
                      <Shield size={10} className="text-amber-400 shrink-0" />
                      <span className="text-[7.5px] font-cinzel font-bold text-amber-300 uppercase tracking-widest truncate">
                        DEFESA
                      </span>
                    </div>

                    <div className="text-base xs:text-lg font-cinzel font-black text-stone-100 tracking-tight leading-none text-center">
                      {sheet.defense}
                    </div>

                    <p className="text-[6.5px] text-stone-400 font-serif truncate text-center leading-none">
                      Armadura
                    </p>
                  </div>

                  {/* 3. CARD: 👢 DESLOCAMENTO (QUADRADO, COMPACTO) */}
                  <div className="p-1 xs:p-1.5 rounded-xl bg-gradient-to-b from-[#1c160e]/95 via-[#120e09]/95 to-[#090704]/98 border border-amber-600/70 shadow-md relative overflow-hidden backdrop-blur-md flex flex-col justify-between h-[52px] xs:h-[56px]">
                    <OrnateCardCorners color="border-amber-400/70" />

                    <div className="flex items-center gap-1">
                      <Footprints size={10} className="text-amber-400 shrink-0" />
                      <span className="text-[7.5px] font-cinzel font-bold text-amber-300 uppercase tracking-widest truncate">
                        DESLOC.
                      </span>
                    </div>

                    <div className="text-base xs:text-lg font-cinzel font-black text-stone-100 tracking-tight leading-none text-center">
                      {sheet.movement || '9m'}
                    </div>

                    <p className="text-[6.5px] text-stone-400 font-serif truncate text-center leading-none">
                      Por Ação
                    </p>
                  </div>
                </div>

              </div>

              {/* COLUNA DIREITA: PM (TOPO) + INICIATIVA E CD MAGIA (QUADRADOS E PRÓXIMOS) */}
              <div className="w-[84px] xs:w-[92px] sm:w-[100px] flex flex-col justify-between py-0.5 pointer-events-auto shrink-0">
                
                {/* 1. CARD: 💧 PONTOS DE MANA (PM) COMPACTO */}
                <div className="p-1.5 rounded-xl bg-gradient-to-b from-[#0e2233]/95 via-[#081521]/95 to-[#040b12]/98 border border-cyan-600/80 shadow-[0_0_12px_rgba(6,182,212,0.25)] relative overflow-hidden backdrop-blur-md">
                  <OrnateCardCorners color="border-cyan-400/80" />

                  <div className="flex items-center gap-1 mb-0.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-300 shrink-0">
                      <Droplet size={8} className="fill-cyan-400" />
                    </div>
                    <span className="text-[7.5px] xs:text-[8px] font-cinzel font-black text-cyan-300 uppercase tracking-wider truncate">
                      MANA (PM)
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-0.5">
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-cinzel text-base xs:text-lg font-black text-stone-100 tracking-tight leading-none">
                        {currentPM}
                      </span>
                      <span className="text-[9px] font-cinzel font-bold text-cyan-300/80">
                        /{maxPM}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 bg-black/60 border border-cyan-900/80 rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustPM(-1)}
                        disabled={currentPM <= 0}
                        className="w-3.5 h-3.5 rounded flex items-center justify-center text-cyan-400 hover:bg-cyan-950 active:scale-90 disabled:opacity-30 cursor-pointer"
                        title="Diminuir PM"
                      >
                        <Minus size={8} strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustPM(1)}
                        disabled={currentPM >= maxPM}
                        className="w-3.5 h-3.5 rounded flex items-center justify-center text-cyan-400 hover:bg-cyan-950 active:scale-90 disabled:opacity-30 cursor-pointer"
                        title="Aumentar PM"
                      >
                        <Plus size={8} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#03090e] overflow-hidden border border-cyan-900/90 my-1 p-0.2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] transition-all duration-300"
                      style={{ width: `${pmPercent}%` }}
                    />
                  </div>

                  <p className="text-[7px] text-stone-300 font-serif italic text-center truncate leading-none">
                    {pmPercent}% • {pmPercent === 100 ? 'Total' : `${currentPM} PM`}
                  </p>
                </div>

                {/* BLOCO INFERIOR DIREITO: INICIATIVA E CD DE MAGIA PRÓXIMOS E QUADRADOS */}
                <div className="space-y-1 mt-auto">
                  {/* 2. CARD: ⚡ INICIATIVA (QUADRADO, COMPACTO) */}
                  <div 
                    onClick={() => handleQuickRoll('Iniciativa', sheet.initiative)}
                    className="p-1 xs:p-1.5 rounded-xl bg-gradient-to-b from-[#1c160e]/95 via-[#120e09]/95 to-[#090704]/98 border border-amber-600/70 shadow-md relative overflow-hidden backdrop-blur-md hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between h-[52px] xs:h-[56px]"
                    title="Clique para Rolar Iniciativa"
                  >
                    <OrnateCardCorners color="border-amber-400/70" />

                    <div className="flex items-center gap-1">
                      <Zap size={10} className="text-amber-400 shrink-0" />
                      <span className="text-[7.5px] font-cinzel font-bold text-amber-300 uppercase tracking-widest truncate">
                        INICIAT.
                      </span>
                    </div>

                    <div className="text-base xs:text-lg font-cinzel font-black text-stone-100 tracking-tight leading-none text-center">
                      {formatMod(sheet.initiative)}
                    </div>

                    <p className="text-[6.5px] text-amber-300/80 font-serif group-hover:text-amber-200 text-center leading-none">
                      Rolar 🎲
                    </p>
                  </div>

                  {/* 3. CARD: ✨ CD DE MAGIA (QUADRADO, COMPACTO) */}
                  <div className="p-1 xs:p-1.5 rounded-xl bg-gradient-to-b from-[#240f33]/95 via-[#14081d]/95 to-[#09030e]/98 border border-purple-600/70 shadow-md relative overflow-hidden backdrop-blur-md flex flex-col justify-between h-[52px] xs:h-[56px]">
                    <OrnateCardCorners color="border-purple-400/70" />

                    <div className="flex items-center gap-1">
                      <Sparkles size={10} className="text-purple-400 shrink-0" />
                      <span className="text-[7.5px] font-cinzel font-bold text-purple-300 uppercase tracking-widest truncate">
                        CD MAGIA
                      </span>
                    </div>

                    <div className="text-base xs:text-lg font-cinzel font-black text-stone-100 tracking-tight leading-none text-center">
                      {sheet.spellDC || 17}
                    </div>

                    <p className="text-[6.5px] text-purple-300/70 font-serif truncate text-center leading-none">
                      Resistência
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* C. ATRIBUTOS (JDA) — ENCAIXADOS LOGO ABAIXO DO PALCO */}
          <section className="pt-0 mt-0">
            <div className="flex items-center gap-1.5 mb-1 px-0.5">
              <Star size={12} className="text-amber-400 fill-amber-400/40 shrink-0" />
              <h3 className="text-[11px] xs:text-xs font-cinzel font-bold text-amber-200 uppercase tracking-widest">
                ATRIBUTOS (JDA)
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-600/50 via-amber-900/30 to-transparent" />
            </div>

            <div className="grid grid-cols-6 gap-1 xs:gap-1.5">
              {attributeTiles.map(attr => {
                const IconComponent = attr.icon;
                return (
                  <button
                    key={attr.key}
                    type="button"
                    onClick={() => handleQuickRoll(`Teste de ${ATTRIBUTE_NAMES[attr.key as Attribute] || attr.label}`, attr.value)}
                    className={`py-1.5 px-0.5 rounded-xl bg-gradient-to-b ${attr.bgClass} border ${attr.borderClass} flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md group relative overflow-hidden min-h-[52px] xs:min-h-[56px]`}
                    title={`Rolar Teste de ${attr.label} (${formatMod(attr.value)})`}
                  >
                    <OrnateCardCorners color={attr.borderClass.split(' ')[0]} />

                    <IconComponent size={12} className={`${attr.iconColor} group-hover:scale-110 transition-transform mb-0.5`} />
                    
                    <span className={`text-[8px] xs:text-[8.5px] font-cinzel font-black uppercase tracking-wider ${attr.labelColor} leading-none`}>
                      {attr.label}
                    </span>

                    <span className="font-cinzel text-xs xs:text-sm font-black text-stone-100 tracking-tight mt-0.5 leading-none">
                      {formatMod(attr.value)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

        </main>

      {/* ========================================================================= */}
      {/* 3. SEÇÕES SECUNDÁRIAS (QUANDO UMA ABA FOR SELECIONADA NA BARRA INFERIOR)   */}
      {/* ========================================================================= */}
      {activeTab !== 'overview' && (
        <main className={`relative z-10 ${activeTab === 'map' ? 'max-w-5xl px-1 sm:px-2' : 'max-w-lg px-3'} mx-auto pt-1 pb-16 space-y-2 animate-in fade-in duration-200`}>
          
          {/* 1. BOTÃO VOLTAR: PEQUENO ÍCONE DE SETA ← DISCRETO (Oculto no mapa pois ele possui header próprio) */}
          {activeTab !== 'map' && (
            <div className="flex items-center justify-between pb-1 border-b border-amber-900/40">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="w-8 h-8 rounded-lg bg-[#140f0a] border border-amber-600/50 text-amber-400 hover:text-amber-200 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Voltar à Ficha"
                aria-label="Voltar"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-widest">
                {activeTab === 'inventory' ? '🎒 Equipamento' :
                 activeTab === 'powers' ? '✨ Poderes' :
                 activeTab === 'spells' ? '📖 Magias' :
                 activeTab === 'skills' ? '🎯 Perícias' : '📜 História'}
              </span>
            </div>
          )}

          {/* ABA: 🎒 EQUIPAMENTO & INVENTÁRIO (COM ADICIONAR/REMOVER ITENS E DINHEIRO) */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              {/* Dinheiro / Tibares (T$) */}
              <div className="p-3.5 rounded-2xl bg-[#120e0b]/95 border border-amber-900/50 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins size={16} className="text-amber-400" />
                    <h4 className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider">
                      Riqueza do Personagem
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomMoneyValue(currentMoney);
                      setIsMoneyModalOpen(true);
                    }}
                    className="p-1 rounded-lg bg-black/40 hover:bg-amber-950 text-amber-400 border border-amber-900/60 transition-colors cursor-pointer"
                    title="Editar valor exato"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-xl border border-amber-950/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-cinzel font-black text-amber-300">
                      {currentMoney}
                    </span>
                    <span className="text-xs font-cinzel font-bold text-amber-500">
                      T$ (Tibares)
                    </span>
                  </div>

                  {/* Botões Rápidos de Dinheiro */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustMoney(-10)}
                      disabled={currentMoney < 10}
                      className="px-2 py-1 rounded bg-[#18130e] hover:bg-red-950 border border-red-900/50 text-[10px] font-mono font-bold text-red-300 cursor-pointer disabled:opacity-30"
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustMoney(-1)}
                      disabled={currentMoney <= 0}
                      className="px-2 py-1 rounded bg-[#18130e] hover:bg-red-950 border border-red-900/50 text-[10px] font-mono font-bold text-red-300 cursor-pointer disabled:opacity-30"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustMoney(1)}
                      className="px-2 py-1 rounded bg-[#18130e] hover:bg-emerald-950 border border-emerald-900/50 text-[10px] font-mono font-bold text-emerald-300 cursor-pointer"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustMoney(10)}
                      className="px-2 py-1 rounded bg-[#18130e] hover:bg-emerald-950 border border-emerald-900/50 text-[10px] font-mono font-bold text-emerald-300 cursor-pointer"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              {/* Armas & Ataques */}
              <div className="p-3.5 rounded-2xl bg-[#120e0b]/95 border border-amber-900/50 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sword size={14} className="text-amber-400" />
                    <span>Armas & Ataques</span>
                  </h4>
                  <span className="text-[10px] text-stone-400 font-serif">Toque no bônus para rolar</span>
                </div>

                {sheet.attacks.length === 0 ? (
                  <p className="text-xs text-stone-400 italic p-3 bg-black/40 rounded-xl text-center">
                    Nenhuma arma cadastrada.
                  </p>
                ) : (
                  sheet.attacks.map((att, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#18130e] border border-amber-950 hover:border-amber-700/60 transition-colors flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-cinzel font-bold text-xs text-amber-100 truncate">{att.name}</p>
                        <p className="text-[10px] text-stone-400 font-serif truncate">
                          Dano: <strong className="text-stone-200">{att.damage}</strong> • Crítico: <strong className="text-amber-300">{att.crit}</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickRoll(`Ataque: ${att.name}`, att.attackBonus)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:brightness-110 text-stone-950 font-cinzel font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-md"
                      >
                        {formatMod(att.attackBonus)} ⚔️
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Mochila & Itens (Adicionar / Remover / Alterar Quantidade) */}
              <div className="p-3.5 rounded-2xl bg-[#120e0b]/95 border border-amber-900/50 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Backpack size={14} className="text-amber-400" />
                    <span>Mochila & Itens</span>
                  </h4>
                  
                  <button
                    type="button"
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-stone-950 text-[11px] font-cinzel font-black tracking-wide uppercase transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus size={12} strokeWidth={3} />
                    <span>Item</span>
                  </button>
                </div>

                {sheet.inventory.length === 0 ? (
                  <p className="text-xs text-stone-400 italic p-3 bg-black/40 rounded-xl text-center">
                    Mochila vazia. Toque em "+ Item" para adicionar.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {sheet.inventory.map(item => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-[#18130e] border border-amber-950/80 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-cinzel font-bold text-stone-200 truncate">{item.name}</p>
                          {item.description && <p className="text-[10px] text-stone-400 font-serif truncate">{item.description}</p>}
                        </div>

                        {/* Controles de Quantidade e Exclusão */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center bg-black/60 border border-amber-950 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleAdjustItemQty(item.id, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-amber-400 hover:bg-amber-950 active:scale-90 cursor-pointer"
                              title="Diminuir"
                            >
                              <Minus size={10} strokeWidth={3} />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-stone-200 text-xs">
                              {item.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdjustItemQty(item.id, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-amber-400 hover:bg-amber-950 active:scale-90 cursor-pointer"
                              title="Aumentar"
                            >
                              <Plus size={10} strokeWidth={3} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Remover Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA: ✨ PODERES */}
          {activeTab === 'powers' && (
            <div className="space-y-2.5">
              {sheet.powers.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#120e0b] border border-dashed border-amber-900/40 text-center text-xs text-stone-400">
                  Nenhum poder ou habilidade cadastrado nesta ficha.
                </div>
              ) : (
                sheet.powers.map(power => (
                  <div key={power.id} className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-1 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-cinzel font-bold text-xs text-amber-200">{power.name}</h4>
                      <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/50 text-amber-300">
                        {power.type}
                      </span>
                    </div>
                    {power.description && (
                      <p className="text-xs text-stone-300 font-serif leading-relaxed pt-1 border-t border-amber-950/80">
                        {power.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA: 📖 MAGIAS */}
          {activeTab === 'spells' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-purple-900/40 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-cinzel font-bold text-purple-200 uppercase tracking-wider">
                    Grimório Arcano & Divino
                  </h4>
                  <span className="text-[10px] font-cinzel font-bold text-purple-300">
                    CD de Resistência: <strong>{sheet.spellDC}</strong>
                  </span>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Filtrar magias..."
                    value={spellSearch}
                    onChange={(e) => setSpellSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#080604] border border-purple-950 text-xs text-stone-200 placeholder:text-stone-500 font-serif focus:outline-none focus:border-purple-600/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredSpells.length === 0 ? (
                  <p className="text-xs text-stone-400 italic p-4 bg-[#120e0b] rounded-xl text-center">
                    Nenhuma magia encontrada.
                  </p>
                ) : (
                  filteredSpells.map(spell => (
                    <div key={spell.id} className="p-3.5 rounded-2xl bg-[#120e0b] border border-purple-950 space-y-1.5 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel font-bold text-xs text-purple-200">{spell.name}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-700/50 text-cyan-300">
                          {spell.cost} PM
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-serif">
                        {spell.school} • {spell.circle}º Círculo {spell.range ? `• Alcance: ${spell.range}` : ''}
                      </p>
                      {spell.description && (
                        <p className="text-xs text-stone-300 font-serif leading-relaxed pt-1 border-t border-purple-950/60">
                          {spell.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ABA: 🎯 PERÍCIAS */}
          {activeTab === 'skills' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider">
                    Testes de Perícia
                  </h4>
                  <button
                    type="button"
                    onClick={() => setOnlyTrainedSkills(prev => !prev)}
                    className={`px-2 py-0.5 rounded text-[10px] font-cinzel font-bold transition-colors cursor-pointer ${
                      onlyTrainedSkills ? 'bg-amber-600 text-stone-950' : 'bg-black/40 text-stone-400 border border-amber-950'
                    }`}
                  >
                    Apenas Treinadas
                  </button>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar perícia..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#080604] border border-amber-950 text-xs text-stone-200 placeholder:text-stone-500 font-serif focus:outline-none focus:border-amber-600/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredSkills.map(skill => (
                  <div
                    key={skill.id}
                    onClick={() => handleQuickRoll(`Perícia: ${skill.name}`, skill.total)}
                    className="p-2.5 rounded-xl bg-[#120e0b] border border-amber-950 hover:border-amber-600/60 flex items-center justify-between transition-colors cursor-pointer shadow-sm group"
                  >
                    <div>
                      <span className={`text-xs font-cinzel font-bold ${skill.trained ? 'text-amber-200' : 'text-stone-300'}`}>
                        {skill.name}
                      </span>
                      <span className="text-[9px] text-stone-500 ml-1.5 font-mono uppercase">
                        ({skill.attr})
                      </span>
                    </div>

                    <span className="font-cinzel text-xs font-black text-amber-400 group-hover:scale-110 transition-transform">
                      {formatMod(skill.total)} 🎲
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA: 📜 HISTÓRIA & BIOGRAFIA */}
          {activeTab === 'biography' && (
            <div className="p-4 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-3 shadow-xl">
              <h4 className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-widest flex items-center gap-1.5">
                <Scroll size={14} className="text-amber-400" />
                <span>Crônicas & Anotações do Herói</span>
              </h4>

              <div className="space-y-2 text-xs font-serif text-stone-300 leading-relaxed bg-[#080604] p-3 rounded-xl border border-amber-950">
                <p>
                  <strong className="text-amber-300 font-cinzel font-bold">Origem:</strong> {sheet.originName || 'Camponês de Arton'}
                </p>
                <p>
                  <strong className="text-amber-300 font-cinzel font-bold">Divindade:</strong> {sheet.deity || 'Panteão de Arton'}
                </p>
                <p className="pt-2 border-t border-amber-950 text-stone-400 italic">
                  "As grandes lendas não nascem prontas; são forjadas sob o calor da batalha e os mistérios dos deuses."
                </p>
              </div>
            </div>
          )}

          {/* ABA: 🗺️ MAPA DA CAMPANHA (Visualização Oficial + Camada de Anotações Pessoais) */}
          {activeTab === 'map' && (
            <div className="w-full">
              <PlayerCampaignMapView
                campaignId={campaignId}
                playerId={currentPlayer.userId || currentPlayer.id}
                playerName={currentPlayer.displayName || currentPlayer.characterName || characterRaw?.name || 'Aventureiro'}
                onClose={() => setActiveTab('overview')}
              />
            </div>
          )}

        </main>
      )}

      {/* ========================================================================= */}
      {/* 7. MENU INFERIOR GÓTICO COM EXATAMENTE 6 OPÇÕES ABREVIADAS                */}
      {/* ========================================================================= */}
      <nav 
        id="player-bottom-hud-nav"
        aria-label="Navegação da Ficha do Jogador"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#0c0907]/98 backdrop-blur-xl border-t border-amber-900/60 shadow-[0_-10px_35px_rgba(0,0,0,0.95)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto grid grid-cols-6 h-14 items-center px-1 gap-1">
          
          {/* 1. EQUIP. */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'inventory' ? 'overview' : 'inventory')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none relative group ${
              activeTab === 'inventory'
                ? 'bg-gradient-to-b from-amber-900/50 to-amber-950/80 border border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-black/30 border border-amber-950/60 text-stone-400 hover:text-amber-300 hover:border-amber-700/50'
            }`}
          >
            <Backpack size={15} className={activeTab === 'inventory' ? 'text-amber-300' : 'text-stone-400'} />
            <span className="text-[8px] xs:text-[8.5px] font-cinzel font-black uppercase tracking-wider mt-0.5 truncate">
              EQUIP.
            </span>
          </button>

          {/* 2. PODERES */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'powers' ? 'overview' : 'powers')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none relative group ${
              activeTab === 'powers'
                ? 'bg-gradient-to-b from-amber-900/50 to-amber-950/80 border border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-black/30 border border-amber-950/60 text-stone-400 hover:text-amber-300 hover:border-amber-700/50'
            }`}
          >
            <Sparkles size={15} className={activeTab === 'powers' ? 'text-amber-300' : 'text-stone-400'} />
            <span className="text-[8px] xs:text-[8.5px] font-cinzel font-black uppercase tracking-wider mt-0.5 truncate">
              PODERES
            </span>
          </button>

          {/* 3. MAGIAS */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'spells' ? 'overview' : 'spells')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none relative group ${
              activeTab === 'spells'
                ? 'bg-gradient-to-b from-purple-900/50 to-purple-950/80 border border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                : 'bg-black/30 border border-amber-950/60 text-stone-400 hover:text-amber-300 hover:border-amber-700/50'
            }`}
          >
            <BookOpen size={15} className={activeTab === 'spells' ? 'text-purple-300' : 'text-stone-400'} />
            <span className="text-[8px] xs:text-[8.5px] font-cinzel font-black uppercase tracking-wider mt-0.5 truncate">
              MAGIAS
            </span>
          </button>

          {/* 4. PERÍCIAS */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'skills' ? 'overview' : 'skills')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none relative group ${
              activeTab === 'skills'
                ? 'bg-gradient-to-b from-amber-900/50 to-amber-950/80 border border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-black/30 border border-amber-950/60 text-stone-400 hover:text-amber-300 hover:border-amber-700/50'
            }`}
          >
            <Target size={15} className={activeTab === 'skills' ? 'text-amber-300' : 'text-stone-400'} />
            <span className="text-[8px] xs:text-[8.5px] font-cinzel font-black uppercase tracking-wider mt-0.5 truncate">
              PERÍCIAS
            </span>
          </button>

          {/* 5. HISTÓRIA */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'biography' ? 'overview' : 'biography')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none relative group ${
              activeTab === 'biography'
                ? 'bg-gradient-to-b from-amber-900/50 to-amber-950/80 border border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-black/30 border border-amber-950/60 text-stone-400 hover:text-amber-300 hover:border-amber-700/50'
            }`}
          >
            <Scroll size={15} className={activeTab === 'biography' ? 'text-amber-300' : 'text-stone-400'} />
            <span className="text-[8px] xs:text-[8.5px] font-cinzel font-black uppercase tracking-wider mt-0.5 truncate">
              HISTÓRIA
            </span>
          </button>

          {/* 6. MAPA */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'map' ? 'overview' : 'map')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none relative group ${
              activeTab === 'map'
                ? 'bg-gradient-to-b from-emerald-900/50 to-emerald-950/80 border border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-black/30 border border-amber-950/60 text-stone-400 hover:text-emerald-300 hover:border-emerald-700/50'
            }`}
          >
            <MapIcon size={15} className={activeTab === 'map' ? 'text-emerald-300' : 'text-stone-400'} />
            <span className="text-[8px] xs:text-[8.5px] font-cinzel font-black uppercase tracking-wider mt-0.5 truncate">
              MAPA
            </span>
          </button>

        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MODAL: ADICIONAR ITEM À MOCHILA                                           */}
      {/* ========================================================================= */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e0b08] border border-amber-600/70 p-5 space-y-4 shadow-2xl relative">
            <OrnateCardCorners color="border-amber-400" />

            <div className="flex items-center justify-between border-b border-amber-900/50 pb-2.5">
              <h3 className="font-cinzel font-bold text-sm text-amber-100 uppercase tracking-widest flex items-center gap-2">
                <Backpack size={16} className="text-amber-400" />
                <span>Adicionar Novo Item</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-3">
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-stone-300 uppercase mb-1">
                  Nome do Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corda Élfica (15m), Poção de Cura"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140f0a] border border-amber-900/80 text-xs text-stone-100 placeholder:text-stone-600 font-serif focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-cinzel font-bold text-stone-300 uppercase mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-[#140f0a] border border-amber-900/80 text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-cinzel font-bold text-stone-300 uppercase mb-1">
                  Descrição / Notas
                </label>
                <textarea
                  rows={2}
                  placeholder="Efeito, propriedades ou peso..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140f0a] border border-amber-900/80 text-xs text-stone-100 placeholder:text-stone-600 font-serif focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-black/40 border border-stone-800 text-stone-400 text-xs font-cinzel font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-stone-950 text-xs font-cinzel font-black uppercase tracking-wider shadow-md hover:brightness-110 cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR DINHEIRO (TIBARES T$)                                       */}
      {/* ========================================================================= */}
      {isMoneyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xs rounded-2xl bg-[#0e0b08] border border-amber-600/70 p-5 space-y-4 shadow-2xl relative text-center">
            <OrnateCardCorners color="border-amber-400" />

            <div className="flex items-center justify-between border-b border-amber-900/50 pb-2">
              <h3 className="font-cinzel font-bold text-sm text-amber-100 uppercase tracking-widest flex items-center gap-2">
                <Coins size={16} className="text-amber-400" />
                <span>Definir Tibares (T$)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMoneyModalOpen(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 py-2">
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-stone-400 uppercase mb-1">
                  Valor Atual em Tibares
                </label>
                <input
                  type="number"
                  min="0"
                  value={customMoneyValue}
                  onChange={(e) => setCustomMoneyValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center px-3 py-2.5 rounded-xl bg-[#140f0a] border border-amber-600/70 text-xl font-cinzel font-black text-amber-300 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsMoneyModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-black/40 border border-stone-800 text-stone-400 text-xs font-cinzel font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSetExactMoney(customMoneyValue)}
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-cinzel font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE JOGADORES NA SESSÃO                                              */}
      {/* ========================================================================= */}
      {isPlayersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e0b08] border border-amber-600/70 p-5 space-y-3 shadow-2xl relative">
            <OrnateCardCorners color="border-amber-400" />

            <div className="flex items-center justify-between border-b border-amber-900/50 pb-2.5">
              <h3 className="font-cinzel font-bold text-sm text-amber-100 uppercase tracking-widest flex items-center gap-2">
                <Users size={16} className="text-amber-400" />
                <span>Mesa de Aventura ({playersCount})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPlayersModalOpen(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 py-1 max-h-60 overflow-y-auto">
              <div className="p-2.5 rounded-xl bg-[#140f0a] border border-amber-900/50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-cinzel font-bold text-amber-300">👑 {game.masterName || 'Mestre'}</p>
                  <p className="text-[10px] text-stone-400">Narrador de Tormenta 20</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              </div>

              {roomPlayers.length > 0 ? (
                roomPlayers.map(p => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-[#18130e] border border-amber-950 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-cinzel font-bold text-amber-100">
                        ⚔️ {p.characterName || p.displayName} {p.userId === currentPlayer?.userId ? '(Você)' : ''}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {p.characterClass ? `${p.characterClass} Nv ${p.characterLevel || 1}` : 'Aventureiro'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {p.status === 'online' ? 'Online' : 'Aguardando'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/60 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-cinzel font-bold text-amber-100">⚔️ {sheet.name} (Você)</p>
                    <p className="text-[10px] text-stone-300">{sheet.className} Nv {sheet.level}</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Online</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIGURAÇÕES DA SESSÃO                                         */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e0b08] border border-amber-600/70 p-5 space-y-4 shadow-2xl relative text-center">
            <OrnateCardCorners color="border-amber-400" />

            <div className="flex items-center justify-between border-b border-amber-900/50 pb-2">
              <h3 className="font-cinzel font-bold text-sm text-amber-100 uppercase tracking-widest">
                Configurações da Sessão
              </h3>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-left text-xs font-serif text-stone-300 py-1">
              <p>Campanha: <strong className="text-amber-200 font-cinzel">{game.name}</strong></p>
              <p>Código de Convite: <strong className="text-amber-400 font-mono">{game.inviteCode}</strong></p>
            </div>

            <div className="pt-2 border-t border-amber-900/40">
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="w-full py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 font-cinzel font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Sair da Partida
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MobilePlayerSessionPage;
