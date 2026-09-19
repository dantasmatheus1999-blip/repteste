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
  Dices, 
  ChevronLeft, 
  Radio, 
  Info, 
  X, 
  Coins, 
  Eye, 
  BookOpen, 
  Search, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Scroll,
  Crown,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';
import { CharacterService } from '../../services/characterService';
import { GameService } from '../../services/gameService';
import { normalizeCharacterSheet, NormalizedSheetData, formatMod, ATTRIBUTE_NAMES } from '../../utils/sheetCalculations';
import { Attribute } from '../../types/character';
import { Game, GamePlayer } from '../../types/game';
import { getClassEmoji } from '../../utils/characterUtils';
import { useDiceRoller } from '../../hooks/useDiceRoller';

interface MobilePlayerSessionPageProps {
  campaignId: string;
  gameId: string;
  game: Game;
  currentPlayer: GamePlayer;
  onExit?: () => void;
}

type ActiveTab = 'overview' | 'inventory' | 'attacks' | 'spells' | 'skills' | 'powers';

export const MobilePlayerSessionPage: React.FC<MobilePlayerSessionPageProps> = ({
  campaignId,
  gameId,
  game,
  currentPlayer,
  onExit
}) => {
  const [characterRaw, setCharacterRaw] = useState<any | null>(null);
  const [loadingChar, setLoadingChar] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Filtros internos
  const [skillSearch, setSkillSearch] = useState('');
  const [onlyTrainedSkills, setOnlyTrainedSkills] = useState(false);
  const [spellCircleFilter, setSpellCircleFilter] = useState<number | 'all'>('all');
  const [spellSearch, setSpellSearch] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Modal do Rolador de Dados Rápido
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [customModifier, setCustomModifier] = useState<number>(0);
  const [diceRollLabel, setDiceRollLabel] = useState<string>('');
  const { roll, history, isRolling, lastResult } = useDiceRoller();

  // Debounce refs para sincronização atômica e segura com o Firestore (500ms)
  const pendingUpdatesRef = useRef<Record<string, any>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Inscrição em tempo real aos dados da ficha do personagem selecionado
  useEffect(() => {
    if (!currentPlayer.characterId) {
      setLoadingChar(false);
      return;
    }

    setLoadingChar(true);
    const unsub = CharacterService.subscribeToCharacter(currentPlayer.characterId, (charData) => {
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
  }, [currentPlayer.characterId]);

  // 2. Normalização computada da ficha
  const sheet: NormalizedSheetData | null = useMemo(() => {
    if (!characterRaw) return null;
    return normalizeCharacterSheet(characterRaw, currentPlayer.characterId || '');
  }, [characterRaw, currentPlayer.characterId]);

  // 3. Função de atualização com reflexo otimista imediato e debounce seguro
  const handleUpdateCharacterResource = useCallback((partial: { currentPV?: number; currentPM?: number }) => {
    const charId = currentPlayer.characterId;
    if (!charId) return;

    // Atualização otimista imediata na UI local
    setCharacterRaw((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...partial
      };
    });

    // Enfileira alterações pendentes
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...partial
    };

    // Cancela gravação anterior para evitar spam/conflito
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Dispara gravação única após 500ms de inatividade do toque
    saveTimeoutRef.current = setTimeout(async () => {
      const payload = { ...pendingUpdatesRef.current };
      pendingUpdatesRef.current = {};
      try {
        await CharacterService.updateCharacter(charId, payload);
      } catch (err) {
        console.error(`[MobilePlayerSession] Falha ao sincronizar recursos do personagem ${charId}:`, err);
      }
    }, 500);
  }, [currentPlayer.characterId]);

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

  // Toggle de itens expandidos (para ler descrição completa)
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Disparar rolagem rápida a partir de um botão de perícia/ataque
  const handleQuickRoll = (label: string, bonus: number, diceFormula = '1d20') => {
    setDiceRollLabel(label);
    setCustomModifier(bonus);
    setIsDiceModalOpen(true);
    const sign = bonus >= 0 ? '+' : '-';
    const absBonus = Math.abs(bonus);
    roll(`${diceFormula} ${sign} ${absBonus}`);
  };

  if (loadingChar) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex flex-col items-center justify-center p-6 text-center space-y-4 font-cinzel">
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
      <div className="min-h-screen bg-[#0a0806] flex flex-col items-center justify-center p-6 text-center space-y-4 font-cinzel max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="text-lg font-bold text-amber-100 uppercase">Herói Não Vinculado</h2>
        <p className="text-xs text-stone-400 font-serif">
          Você entrou na sala sem selecionar um personagem ativo.
        </p>
        {onExit && (
          <button
            onClick={onExit}
            className="px-5 py-2.5 rounded-xl bg-amber-950 border border-amber-600/50 text-amber-200 text-xs font-bold uppercase tracking-wider"
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

  // Estado de Saúde Reativo
  const healthStatus = 
    hpPercent <= 0 ? { text: 'Inconsciente / Derrotado', color: 'text-stone-500', bg: 'bg-stone-900/90 border-stone-700' } :
    hpPercent <= 25 ? { text: 'À beira da morte', color: 'text-red-400 animate-pulse', bg: 'bg-red-950/80 border-red-800' } :
    hpPercent <= 50 ? { text: 'Gravemente Ferido', color: 'text-amber-400', bg: 'bg-amber-950/80 border-amber-800' } :
    hpPercent < 100 ? { text: 'Ferido', color: 'text-yellow-300', bg: 'bg-yellow-950/50 border-yellow-800/40' } :
    { text: 'Com Saúde Total', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' };

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

  const heroEmoji = getClassEmoji(sheet.className);

  return (
    <div className="min-h-screen bg-[#0a0806] text-stone-200 pb-24 font-sans select-none antialiased">
      
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DE CONEXÃO & CONTROLES DA SESSÃO                        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#0d0a08]/95 backdrop-blur-md border-b border-amber-900/40 px-3.5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          {onExit && (
            <button
              onClick={onExit}
              className="w-8 h-8 rounded-lg bg-stone-900/90 border border-amber-900/50 text-amber-400 flex items-center justify-center hover:bg-amber-950 transition-colors shrink-0 cursor-pointer"
              title="Voltar ao Lobby"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <h1 className="text-xs font-cinzel font-bold text-amber-100 truncate uppercase">
                {game.name}
              </h1>
            </div>
            <p className="text-[10px] text-stone-400 font-serif truncate">
              Mestre: <strong className="text-stone-300 font-cinzel">{game.masterName || 'Mestre'}</strong>
            </p>
          </div>
        </div>

        {/* Botão de Rolador de Dados Rápido Flutuante no Topo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setDiceRollLabel('Rolagem Livre');
              setCustomModifier(0);
              setIsDiceModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-stone-950 font-cinzel font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(217,119,6,0.3)] border border-amber-400/60 active:scale-95 cursor-pointer"
          >
            <Dices size={15} className="text-stone-950 stroke-[2.5]" />
            <span className="hidden xs:inline">DADOS</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CABEÇALHO DO PERSONAGEM (AVATAR, NOME, CLASSE, RAÇA, NÍVEL)            */}
      {/* ========================================================================= */}
      <section className="px-3.5 pt-3 pb-2 max-w-xl mx-auto">
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#18130e] via-[#120e0b] to-[#0e0b08] border border-amber-800/40 shadow-xl relative overflow-hidden">
          {/* Cantoneiras decorativas */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-amber-500/40 pointer-events-none" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-amber-500/40 pointer-events-none" />

          <div className="flex items-center gap-3.5">
            {/* Foto / Avatar do Personagem */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#090705] border-2 border-amber-500/60 overflow-hidden flex items-center justify-center text-amber-300 text-2xl shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.8)] relative group">
              {sheet.imageUrl ? (
                <img
                  src={sheet.imageUrl}
                  alt={sheet.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <span>{heroEmoji}</span>
              )}
            </div>

            {/* Informações de Identidade */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{heroEmoji}</span>
                <h2 className="font-cinzel font-bold text-base sm:text-lg text-amber-100 truncate tracking-wide">
                  {sheet.name}
                </h2>
              </div>
              <p className="text-[11px] text-amber-300/90 font-cinzel font-semibold truncate mt-0.5">
                {sheet.className} • Nível {sheet.level}
              </p>
              <p className="text-[10px] text-stone-400 font-serif truncate">
                {sheet.raceName} {sheet.originName ? `• ${sheet.originName}` : ''} {sheet.deity ? `(Devoto de ${sheet.deity})` : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ÁREA DE STATUS DINÂMICA (❤️ PV, 🔵 PM, DEFESA, INICIATIVA, ETC.)       */}
      {/* ========================================================================= */}
      <section className="px-3.5 py-1 space-y-2.5 max-w-xl mx-auto">
        {/* Bloco de Barras de Recursos com Reatividade Visual */}
        <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-3 shadow-lg">
          
          {/* ❤️ Pontos de Vida (PV) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-md bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400 shadow-sm shrink-0">
                  <Heart size={12} className="fill-red-500/40" />
                </div>
                <span className="text-xs font-cinzel font-bold text-red-300 uppercase tracking-wider truncate">
                  Pontos de Vida (PV)
                </span>
              </div>

              {/* Controles táteis discretos (− / +) e Valor Numérico */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-stone-950/90 border border-red-900/60 rounded-lg p-0.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleAdjustPV(-1)}
                    disabled={currentPV <= 0}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:text-red-200 hover:bg-red-950/80 active:scale-90 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer select-none"
                    title="Diminuir 1 PV"
                    aria-label="Diminuir 1 PV"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <div className="w-px h-3.5 bg-red-900/40" />
                  <button
                    type="button"
                    onClick={() => handleAdjustPV(1)}
                    disabled={currentPV >= maxPV}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:text-red-200 hover:bg-red-950/80 active:scale-90 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer select-none"
                    title="Aumentar 1 PV"
                    aria-label="Aumentar 1 PV"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="text-right min-w-[48px]">
                  <span className="font-mono text-base font-black text-stone-100 tracking-tight">
                    {currentPV}
                  </span>
                  <span className="text-xs font-mono text-stone-400 font-semibold">
                    /{maxPV}
                  </span>
                  {sheet.tempPV > 0 && (
                    <span className="ml-1 text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/80 border border-amber-600/50 text-amber-300 font-bold block">
                      +{sheet.tempPV} temp
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Barra Reativa de PV */}
            <div className="w-full h-3 rounded-full bg-[#0a0705] overflow-hidden border border-red-950/80 p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  hpPercent <= 25 
                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse' 
                    : hpPercent <= 50
                    ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-red-500'
                    : 'bg-gradient-to-r from-red-700 via-emerald-600 to-emerald-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* Status Descritivo da Saúde */}
            <div className="flex items-center justify-between text-[10px] pt-0.5">
              <span className={`font-cinzel font-semibold ${healthStatus.color}`}>
                ● {healthStatus.text}
              </span>
              <span className="font-mono text-stone-400 font-medium">
                {hpPercent}% restante
              </span>
            </div>
          </div>

          {/* 🔵 Pontos de Mana (PM) */}
          <div className="space-y-1.5 pt-2 border-t border-amber-950/80">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-md bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400 shadow-sm shrink-0">
                  <Droplet size={12} className="fill-blue-500/40" />
                </div>
                <span className="text-xs font-cinzel font-bold text-blue-300 uppercase tracking-wider truncate">
                  Pontos de Mana (PM)
                </span>
              </div>

              {/* Controles táteis discretos (− / +) e Valor Numérico */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-stone-950/90 border border-blue-900/60 rounded-lg p-0.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleAdjustPM(-1)}
                    disabled={currentPM <= 0}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-blue-400 hover:text-blue-200 hover:bg-blue-950/80 active:scale-90 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer select-none"
                    title="Gastar 1 PM"
                    aria-label="Gastar 1 PM"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <div className="w-px h-3.5 bg-blue-900/40" />
                  <button
                    type="button"
                    onClick={() => handleAdjustPM(1)}
                    disabled={currentPM >= maxPM}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-blue-400 hover:text-blue-200 hover:bg-blue-950/80 active:scale-90 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer select-none"
                    title="Recuperar 1 PM"
                    aria-label="Recuperar 1 PM"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="text-right min-w-[48px]">
                  <span className="font-mono text-base font-black text-stone-100 tracking-tight">
                    {currentPM}
                  </span>
                  <span className="text-xs font-mono text-stone-400 font-semibold">
                    /{maxPM}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra Reativa de PM */}
            <div className="w-full h-2.5 rounded-full bg-[#0a0705] overflow-hidden border border-blue-950/80 p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-400 transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                style={{ width: `${pmPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grade de Status de Combate (Defesa, Iniciativa, Deslocamento, CD de Magia) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Defesa */}
          <div className="p-2.5 rounded-xl bg-[#120e0b] border border-amber-900/40 text-center space-y-0.5 shadow">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-cinzel uppercase font-bold tracking-wider">
              <Shield size={12} />
              <span>DEFESA</span>
            </div>
            <span className="text-xl font-cinzel font-black text-amber-100 block">
              {sheet.defense}
            </span>
            <span className="text-[9px] text-stone-400 font-serif block truncate">
              Armadura & Esquiva
            </span>
          </div>

          {/* Iniciativa */}
          <div 
            onClick={() => handleQuickRoll('Teste de Iniciativa', sheet.initiative)}
            className="p-2.5 rounded-xl bg-[#120e0b] border border-amber-900/40 hover:border-amber-500/60 transition-all text-center space-y-0.5 shadow cursor-pointer active:scale-95"
            title="Toque para rolar iniciativa"
          >
            <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-cinzel uppercase font-bold tracking-wider">
              <Zap size={12} />
              <span>INICIATIVA</span>
            </div>
            <span className="text-xl font-cinzel font-black text-amber-100 block">
              {formatMod(sheet.initiative)}
            </span>
            <span className="text-[9px] text-amber-400/80 font-serif block truncate underline">
              🎲 Rolar Teste
            </span>
          </div>

          {/* Deslocamento */}
          <div className="p-2.5 rounded-xl bg-[#120e0b] border border-amber-900/40 text-center space-y-0.5 shadow">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-cinzel uppercase font-bold tracking-wider">
              <Footprints size={12} />
              <span>DESLOC.</span>
            </div>
            <span className="text-xl font-cinzel font-black text-amber-100 block">
              {sheet.movement}
            </span>
            <span className="text-[9px] text-stone-400 font-serif block truncate">
              Por Ação
            </span>
          </div>
        </div>

        {/* Resistências Rápidas (Fortitude, Reflexos, Vontade) */}
        <div className="p-2.5 rounded-xl bg-[#0f0c09] border border-amber-950 flex items-center justify-around gap-2 text-center shadow-inner">
          <div 
            onClick={() => handleQuickRoll('Teste de Fortitude', sheet.resistances.fortitude)}
            className="flex-1 cursor-pointer py-1 px-1 rounded-lg hover:bg-amber-950/40 transition-colors"
          >
            <span className="text-[9px] font-cinzel text-stone-400 uppercase block">Fortitude</span>
            <span className="text-sm font-cinzel font-bold text-amber-200">
              {formatMod(sheet.resistances.fortitude)}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-amber-900/30" />
          <div 
            onClick={() => handleQuickRoll('Teste de Reflexos', sheet.resistances.reflexos)}
            className="flex-1 cursor-pointer py-1 px-1 rounded-lg hover:bg-amber-950/40 transition-colors"
          >
            <span className="text-[9px] font-cinzel text-stone-400 uppercase block">Reflexos</span>
            <span className="text-sm font-cinzel font-bold text-amber-200">
              {formatMod(sheet.resistances.reflexos)}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-amber-900/30" />
          <div 
            onClick={() => handleQuickRoll('Teste de Vontade', sheet.resistances.vontade)}
            className="flex-1 cursor-pointer py-1 px-1 rounded-lg hover:bg-amber-950/40 transition-colors"
          >
            <span className="text-[9px] font-cinzel text-stone-400 uppercase block">Vontade</span>
            <span className="text-sm font-cinzel font-bold text-amber-200">
              {formatMod(sheet.resistances.vontade)}
            </span>
          </div>
          {sheet.spellDC > 10 && (
            <>
              <div className="w-[1px] h-6 bg-amber-900/30" />
              <div className="flex-1 py-1 px-1">
                <span className="text-[9px] font-cinzel text-purple-300 uppercase block">CD Magia</span>
                <span className="text-sm font-cinzel font-bold text-purple-200">
                  {sheet.spellDC}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Condições Ativas (Se houver) */}
        {sheet.conditions && sheet.conditions.length > 0 && (
          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-900/50 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-red-300">
              <AlertTriangle size={13} className="text-red-400" />
              <span>CONDIÇÕES ATIVAS</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sheet.conditions.map(cond => (
                <span 
                  key={cond}
                  className="px-2.5 py-1 rounded-lg bg-red-950/90 border border-red-700/60 text-red-200 text-xs font-cinzel font-bold"
                >
                  ⚠️ {cond}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. CONTEÚDO PRINCIPAL (COM BASE NA ABA SELECIONADA NA NAVEGAÇÃO INFERIOR)  */}
      {/* ========================================================================= */}
      <main className="px-3.5 pt-2 pb-6 max-w-xl mx-auto space-y-4">
        
        {/* Barra Informativa de Aba Ativa (quando não estiver na Visão Geral) */}
        {activeTab !== 'overview' && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs font-cinzel">
            <span className="text-amber-300 font-bold tracking-wider uppercase flex items-center gap-1.5">
              {activeTab === 'attacks' && <>⚔️ Ataques & Combate</>}
              {activeTab === 'spells' && <>✨ Grimório de Magias</>}
              {activeTab === 'skills' && <>🎯 Lista de Perícias</>}
              {activeTab === 'inventory' && <>🎒 Mochila & Equipamentos</>}
              {activeTab === 'powers' && <>⭐ Poderes & Habilidades</>}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="text-[10px] font-bold text-stone-300 hover:text-amber-200 underline uppercase cursor-pointer"
            >
              [ Voltar ao Status ]
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* ABA: VISÃO GERAL (ATRIBUTOS, RESUMO, BIOGRAFIA)                        */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Atributos Oficiais JdA */}
            <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                <h3 className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400" />
                  <span>ATRIBUTOS (JdA)</span>
                </h3>
                <span className="text-[10px] text-stone-400 font-serif">
                  Modificadores Diretos
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as Attribute[]).map(attr => {
                  const val = sheet.attrModifiers[attr];
                  return (
                    <div
                      key={attr}
                      onClick={() => handleQuickRoll(`Teste de ${ATTRIBUTE_NAMES[attr]}`, val)}
                      className="p-2 rounded-xl bg-[#0a0806] border border-amber-950 hover:border-amber-600/60 transition-all text-center space-y-0.5 cursor-pointer active:scale-95"
                      title={`Rolar teste de ${ATTRIBUTE_NAMES[attr]}`}
                    >
                      <span className="text-[10px] font-cinzel font-bold text-amber-400 block">
                        {attr}
                      </span>
                      <span className="text-lg font-cinzel font-black text-stone-100 block">
                        {formatMod(val)}
                      </span>
                      <span className="text-[8px] text-stone-400 font-serif block truncate">
                        {ATTRIBUTE_NAMES[attr]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Atalhos Rápidos para Ataques mais usados */}
            {sheet.attacks.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
                  <h3 className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sword size={14} className="text-amber-400" />
                    <span>ATAQUES RÁPIDOS</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('attacks')}
                    className="text-[10px] font-cinzel font-bold text-amber-400 uppercase hover:underline"
                  >
                    Ver Todos ({sheet.attacks.length}) →
                  </button>
                </div>

                <div className="space-y-2">
                  {sheet.attacks.slice(0, 2).map((atk) => (
                    <div
                      key={atk.id}
                      className="p-3 rounded-xl bg-[#0a0806] border border-amber-950 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="font-cinzel font-bold text-xs text-amber-100 truncate">
                          {atk.name}
                        </h4>
                        <p className="text-[10px] text-stone-400 font-serif">
                          Dano: <strong className="text-amber-300">{atk.damage}</strong> • Crítico: {atk.crit}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickRoll(`Ataque: ${atk.name}`, atk.attackBonus)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-amber-800 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider shrink-0 flex items-center gap-1 shadow active:scale-95"
                      >
                        <Dices size={12} />
                        <span>{formatMod(atk.attackBonus)}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações de Equipamento e Peso Geral */}
            <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 flex items-center justify-between shadow">
              <div className="flex items-center gap-2">
                <Backpack size={16} className="text-amber-400" />
                <div>
                  <span className="text-xs font-cinzel font-bold text-amber-200 uppercase block">
                    Carga & Tibares
                  </span>
                  <span className="text-[10px] text-stone-400 font-serif">
                    Peso: {sheet.totalWeight}kg / {sheet.maxWeight}kg • T$ {sheet.money}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-700/50 text-amber-300 text-[10px] font-cinzel font-bold uppercase tracking-wider"
              >
                Abrir Mochila
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* ABA: 🎒 MOCHILA (INVENTÁRIO COMPLETO, T$ TIBARES, CARGA)                 */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'inventory' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Header da Mochila com Carga e Moedas */}
            <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400">
                    <Backpack size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-cinzel font-bold text-amber-100 uppercase">
                      🎒 MOCHILA & EQUIPAMENTO
                    </h3>
                    <p className="text-[10px] text-stone-400 font-serif">
                      {sheet.inventory.length} itens guardados
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-amber-950/90 border border-amber-500/50 flex items-center gap-1.5 shadow">
                  <Coins size={14} className="text-amber-400" />
                  <span className="font-cinzel font-bold text-xs text-amber-200">
                    T$ {sheet.money}
                  </span>
                </div>
              </div>

              {/* Barra de Carga */}
              <div className="space-y-1 pt-1 border-t border-amber-950">
                <div className="flex justify-between text-[10px] font-cinzel">
                  <span className="text-stone-400">Capacidade de Carga</span>
                  <span className={`font-bold ${sheet.totalWeight > sheet.maxWeight ? 'text-red-400' : 'text-amber-300'}`}>
                    {sheet.totalWeight}kg / {sheet.maxWeight}kg {sheet.totalWeight > sheet.maxWeight ? '(Sobrecarregado)' : ''}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#0a0806] overflow-hidden border border-amber-950">
                  <div
                    className={`h-full rounded-full ${sheet.totalWeight > sheet.maxWeight ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, Math.round((sheet.totalWeight / Math.max(1, sheet.maxWeight)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Lista de Itens */}
            <div className="space-y-2">
              {sheet.inventory.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#120e0b] border border-dashed border-amber-900/40 text-center space-y-1">
                  <p className="text-xs font-cinzel text-stone-400">
                    Nenhum item na mochila do herói.
                  </p>
                </div>
              ) : (
                sheet.inventory.map(item => {
                  const isExpanded = expandedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#120e0b] border border-amber-950 hover:border-amber-800/60 transition-all space-y-1.5 shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-cinzel font-bold text-xs text-amber-100 truncate">
                              {item.name}
                            </h4>
                            {item.equipped && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[9px] font-cinzel font-bold">
                                EQUIPADO
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 font-serif">
                            Qtd: <strong className="text-stone-200">{item.quantity}</strong> • Peso: {item.weight}kg cada {item.type ? `• Tipo: ${item.type}` : ''}
                          </p>
                        </div>

                        {item.description && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="text-stone-400 hover:text-amber-300 p-1"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>

                      {item.description && isExpanded && (
                        <p className="text-[11px] text-stone-300 font-serif leading-relaxed pt-1.5 border-t border-amber-950/80">
                          {item.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* ABA: ⚔️ ATAQUES (GOLPES, ARMAS, BÔNUS DE ATAQUE, DANO)                    */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'attacks' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400">
                  <Sword size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-cinzel font-bold text-amber-100 uppercase">
                    ⚔️ ATAQUES & COMBATE
                  </h3>
                  <p className="text-[10px] text-stone-400 font-serif">
                    Toque no botão para rolar o teste de ataque
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {sheet.attacks.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#120e0b] border border-dashed border-amber-900/40 text-center space-y-1">
                  <p className="text-xs font-cinzel text-stone-400">
                    Nenhum ataque cadastrado na ficha do herói.
                  </p>
                </div>
              ) : (
                sheet.attacks.map(atk => (
                  <div
                    key={atk.id}
                    className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-2.5 shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Sword size={14} className="text-amber-400 shrink-0" />
                          <h4 className="font-cinzel font-bold text-sm text-amber-100 truncate">
                            {atk.name}
                          </h4>
                        </div>
                        <span className="text-[10px] text-stone-400 font-serif block">
                          Alcance: {atk.range || 'Corpo a corpo'} • Tipo: {atk.type || 'Físico'}
                        </span>
                      </div>

                      {/* Botão de Rolagem de Teste de Ataque */}
                      <button
                        type="button"
                        onClick={() => handleQuickRoll(`Ataque: ${atk.name}`, atk.attackBonus)}
                        className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-cinzel font-black text-xs uppercase tracking-wider shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Dices size={14} className="stroke-[2.5]" />
                        <span>TESTE {formatMod(atk.attackBonus)}</span>
                      </button>
                    </div>

                    {/* Detalhes de Dano e Crítico */}
                    <div className="p-2.5 rounded-xl bg-[#090705] border border-amber-950 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-cinzel text-stone-400 uppercase block">
                          Dano
                        </span>
                        <span className="font-cinzel font-bold text-amber-300 text-sm">
                          {atk.damage}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-cinzel text-stone-400 uppercase block">
                          Crítico
                        </span>
                        <span className="font-cinzel font-bold text-stone-200">
                          {atk.crit}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-cinzel text-stone-400 uppercase block">
                          Tipo
                        </span>
                        <span className="font-serif text-stone-300 text-xs">
                          {atk.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* ABA: ✨ MAGIAS (GRIMÓRIO, CUSTO DE PM, CÍRCULO, ESCOLA)                 */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'spells' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Header com Filtros de Círculo e Busca */}
            <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-300">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-cinzel font-bold text-amber-100 uppercase">
                      ✨ GRIMÓRIO DE MAGIAS
                    </h3>
                    <p className="text-[10px] text-stone-400 font-serif">
                      {sheet.spells.length} magias aprendidas • CD {sheet.spellDC}
                    </p>
                  </div>
                </div>
              </div>

              {/* Busca de Magia */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar magia pelo nome ou escola..."
                  value={spellSearch}
                  onChange={(e) => setSpellSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#090705] border border-amber-950 text-xs text-stone-200 placeholder:text-stone-500 font-serif focus:outline-none focus:border-amber-600/60"
                />
              </div>

              {/* Filtros de Círculo (Todos, 1º, 2º, 3º, etc.) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <button
                  type="button"
                  onClick={() => setSpellCircleFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold uppercase shrink-0 cursor-pointer transition-colors ${
                    spellCircleFilter === 'all'
                      ? 'bg-amber-600 text-stone-950'
                      : 'bg-[#090705] text-stone-400 border border-amber-950'
                  }`}
                >
                  Todas
                </button>
                {[1, 2, 3, 4, 5].map(circle => (
                  <button
                    key={circle}
                    type="button"
                    onClick={() => setSpellCircleFilter(circle)}
                    className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold uppercase shrink-0 cursor-pointer transition-colors ${
                      spellCircleFilter === circle
                        ? 'bg-purple-700 text-purple-100 border border-purple-400/60'
                        : 'bg-[#090705] text-stone-400 border border-amber-950'
                    }`}
                  >
                    {circle}º Círculo
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Magias */}
            <div className="space-y-2.5">
              {filteredSpells.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#120e0b] border border-dashed border-amber-900/40 text-center space-y-1">
                  <p className="text-xs font-cinzel text-stone-400">
                    Nenhuma magia encontrada para este filtro.
                  </p>
                </div>
              ) : (
                filteredSpells.map(spell => {
                  const isExpanded = expandedItems[spell.id] ?? true;
                  return (
                    <div
                      key={spell.id}
                      className="p-3.5 rounded-2xl bg-[#120e0b] border border-purple-950/80 hover:border-purple-800/60 transition-all space-y-2 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-cinzel font-bold text-sm text-purple-200 truncate">
                              {spell.name}
                            </h4>
                            <span className="px-2 py-0.2 rounded-full bg-purple-950 border border-purple-600/40 text-purple-300 text-[10px] font-cinzel font-bold">
                              {spell.circle}º Círculo
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 font-serif">
                            Escola: <strong className="text-stone-300">{spell.school}</strong> • Custo: <strong className="text-blue-400">{spell.cost} PM</strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(spell.id)}
                          className="text-stone-400 hover:text-purple-300 p-1"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {/* Parâmetros da Magia */}
                      {(spell.range || spell.duration) && (
                        <div className="flex flex-wrap gap-2 text-[10px] font-serif text-stone-400 bg-[#090705] p-2 rounded-lg border border-amber-950/60">
                          {spell.range && <span>Alcance: <strong className="text-stone-300">{spell.range}</strong></span>}
                          {spell.duration && <span>• Duração: <strong className="text-stone-300">{spell.duration}</strong></span>}
                        </div>
                      )}

                      {/* Descrição */}
                      {spell.description && isExpanded && (
                        <p className="text-xs text-stone-300 font-serif leading-relaxed pt-1.5 border-t border-purple-950/60">
                          {spell.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* ABA: 🎯 PERÍCIAS (TESTES DE PERÍCIA, TREINADAS, MODIFICADORES)           */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'skills' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Header de Perícias */}
            <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400">
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-cinzel font-bold text-amber-100 uppercase">
                      🎯 PERÍCIAS (TORMENTA 20)
                    </h3>
                    <p className="text-[10px] text-stone-400 font-serif">
                      Toque no bônus para rolar o teste de perícia
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra de Busca de Perícias */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar perícia..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#090705] border border-amber-950 text-xs text-stone-200 placeholder:text-stone-500 font-serif focus:outline-none focus:border-amber-600/60"
                />
              </div>

              {/* Toggle de Apenas Treinadas */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setOnlyTrainedSkills(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    onlyTrainedSkills
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'bg-[#090705] text-stone-400 border border-amber-950'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>Apenas Treinadas</span>
                </button>

                <span className="text-[11px] text-stone-400 font-serif">
                  {filteredSkills.length} de {sheet.skills.length}
                </span>
              </div>
            </div>

            {/* Lista de Perícias */}
            <div className="space-y-1.5">
              {filteredSkills.map(skill => (
                <div
                  key={skill.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    skill.trained
                      ? 'bg-[#15100c] border-amber-700/50 shadow-sm'
                      : 'bg-[#0e0b08] border-amber-950/70 opacity-90'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-cinzel font-bold text-xs text-stone-100 truncate">
                        {skill.name}
                      </span>
                      {skill.trained ? (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[9px] font-cinzel font-bold">
                          TREINADA
                        </span>
                      ) : (
                        <span className="text-[9px] text-stone-500 font-serif">
                          (Não Treinada)
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 font-serif">
                      Atributo: <strong className="text-amber-300">{skill.attr}</strong> ({formatMod(skill.attrMod)}) • Metade Nv: +{skill.halfLevel} {skill.trained ? `• Treino: +${skill.trainingBonus}` : ''}
                    </p>
                  </div>

                  {/* Botão de Rolagem */}
                  <button
                    type="button"
                    onClick={() => handleQuickRoll(`Teste de ${skill.name}`, skill.total)}
                    className={`py-1.5 px-3 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider shrink-0 flex items-center gap-1 cursor-pointer active:scale-95 shadow ${
                      skill.trained
                        ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                        : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800'
                    }`}
                  >
                    <Dices size={12} />
                    <span>{formatMod(skill.total)}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* ABA: ⭐ PODERES (HABILIDADES DE CLASSE, ORIGEM, GERAIS, DIVINOS)          */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'powers' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400">
                  <Star size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-cinzel font-bold text-amber-100 uppercase">
                    ⭐ PODERES & HABILIDADES
                  </h3>
                  <p className="text-[10px] text-stone-400 font-serif">
                    {sheet.powers.length} poderes cadastrados
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {sheet.powers.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#120e0b] border border-dashed border-amber-900/40 text-center space-y-1">
                  <p className="text-xs font-cinzel text-stone-400">
                    Nenhum poder ou habilidade cadastrada na ficha.
                  </p>
                </div>
              ) : (
                sheet.powers.map(power => {
                  const isExpanded = expandedItems[power.id] ?? true;
                  return (
                    <div
                      key={power.id}
                      className="p-3.5 rounded-2xl bg-[#120e0b] border border-amber-900/40 space-y-2 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-cinzel font-bold text-sm text-amber-100 truncate">
                              {power.name}
                            </h4>
                            {power.type && (
                              <span className="px-2 py-0.2 rounded-full bg-amber-950 border border-amber-700/50 text-amber-300 text-[10px] font-cinzel font-bold">
                                {power.type}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(power.id)}
                          className="text-stone-400 hover:text-amber-300 p-1"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {power.description && isExpanded && (
                        <p className="text-xs text-stone-300 font-serif leading-relaxed pt-1.5 border-t border-amber-950">
                          {power.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 5. BARRA DE NAVEGAÇÃO INFERIOR FIXA EXCLUSIVA DA AVENTURA                   */}
      {/* ========================================================================= */}
      <nav 
        id="player-adventure-bottom-nav"
        aria-label="Navegação do Jogador na Aventura"
        className="fixed bottom-0 inset-x-0 z-50 bg-[#0c0907]/95 backdrop-blur-xl border-t border-amber-600/50 px-1.5 py-1 shadow-[0_-12px_35px_rgba(0,0,0,0.95)] max-w-xl mx-auto pb-[max(0.4rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-5 gap-1">
          {/* 1. ⚔️ ATAQUES */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'attacks' ? 'overview' : 'attacks')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] select-none ${
              activeTab === 'attacks'
                ? 'bg-gradient-to-b from-amber-950/90 to-amber-900/60 border border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(217,119,6,0.35)] scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <Sword size={19} className={activeTab === 'attacks' ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' : 'text-stone-400'} />
            <span className={`text-[10px] font-cinzel tracking-wider mt-1 truncate uppercase ${activeTab === 'attacks' ? 'font-black text-amber-100' : 'font-bold'}`}>
              Ataques
            </span>
          </button>

          {/* 2. ✨ MAGIAS */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'spells' ? 'overview' : 'spells')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] select-none ${
              activeTab === 'spells'
                ? 'bg-gradient-to-b from-purple-950/90 to-purple-900/60 border border-purple-400/80 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <Sparkles size={19} className={activeTab === 'spells' ? 'text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'text-stone-400'} />
            <span className={`text-[10px] font-cinzel tracking-wider mt-1 truncate uppercase ${activeTab === 'spells' ? 'font-black text-purple-100' : 'font-bold'}`}>
              Magias
            </span>
          </button>

          {/* 3. 🎯 PERÍCIAS */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'skills' ? 'overview' : 'skills')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] select-none ${
              activeTab === 'skills'
                ? 'bg-gradient-to-b from-amber-950/90 to-amber-900/60 border border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(217,119,6,0.35)] scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <Target size={19} className={activeTab === 'skills' ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' : 'text-stone-400'} />
            <span className={`text-[10px] font-cinzel tracking-wider mt-1 truncate uppercase ${activeTab === 'skills' ? 'font-black text-amber-100' : 'font-bold'}`}>
              Perícias
            </span>
          </button>

          {/* 4. 🎒 MOCHILA */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'inventory' ? 'overview' : 'inventory')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] select-none ${
              activeTab === 'inventory'
                ? 'bg-gradient-to-b from-amber-950/90 to-amber-900/60 border border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(217,119,6,0.35)] scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <Backpack size={19} className={activeTab === 'inventory' ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' : 'text-stone-400'} />
            <span className={`text-[10px] font-cinzel tracking-wider mt-1 truncate uppercase ${activeTab === 'inventory' ? 'font-black text-amber-100' : 'font-bold'}`}>
              Mochila
            </span>
          </button>

          {/* 5. ⭐ PODERES */}
          <button
            type="button"
            onClick={() => setActiveTab(prev => prev === 'powers' ? 'overview' : 'powers')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] select-none ${
              activeTab === 'powers'
                ? 'bg-gradient-to-b from-amber-950/90 to-amber-900/60 border border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(217,119,6,0.35)] scale-[1.02]'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <Star size={19} className={activeTab === 'powers' ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' : 'text-stone-400'} />
            <span className={`text-[10px] font-cinzel tracking-wider mt-1 truncate uppercase ${activeTab === 'powers' ? 'font-black text-amber-100' : 'font-bold'}`}>
              Poderes
            </span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 6. MODAL / BOTTOM SHEET DE ROLAGEM DE DADOS TORMENTA 20                   */}
      {/* ========================================================================= */}
      {isDiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 font-cinzel">
          <div 
            className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border-t sm:border border-amber-600/60 bg-gradient-to-b from-[#1c1611] via-[#14100c] to-[#0c0907] p-5 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.95)] relative"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.25), 0 -10px 40px rgba(0,0,0,0.95)'
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
              <div className="flex items-center gap-2 text-amber-300">
                <Dices size={20} className="text-amber-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  {diceRollLabel || 'Rolador de Dados'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDiceModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-stone-200 flex items-center justify-center cursor-pointer border border-stone-800"
              >
                ✕
              </button>
            </div>

            {/* Painel do Resultado do Dado */}
            <div className="h-28 flex flex-col items-center justify-center bg-[#090705] rounded-xl border border-amber-950/80 relative overflow-hidden shadow-inner">
              {isRolling ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-amber-400 font-serif italic">Os deuses de Arton decidem seu destino...</span>
                </div>
              ) : lastResult ? (
                <div className="text-center space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-amber-400/80 tracking-widest font-mono">
                    {lastResult.formula} • {lastResult.details}
                  </p>
                  <span className="text-5xl font-medieval font-black text-amber-200 drop-shadow-[0_0_20px_rgba(217,119,6,0.6)]">
                    {lastResult.result}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-stone-500 font-serif italic">
                  Selecione um dado abaixo para traçar seu destino
                </p>
              )}
            </div>

            {/* Dados Disponíveis para Toque Rápido */}
            <div className="grid grid-cols-6 gap-2">
              {[4, 6, 8, 10, 12, 20].map(d => (
                <button
                  key={d}
                  type="button"
                  disabled={isRolling}
                  onClick={() => {
                    const mod = customModifier;
                    const formula = mod !== 0 ? `1d${d} ${mod >= 0 ? '+' : '-'} ${Math.abs(mod)}` : `1d${d}`;
                    roll(formula);
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold font-medieval text-base transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                    d === 20
                      ? 'bg-amber-950/90 border-amber-500/70 text-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.2)]'
                      : 'bg-stone-900 border-amber-950 text-stone-300 hover:border-amber-700/50'
                  }`}
                >
                  d{d}
                </button>
              ))}
            </div>

            {/* Ajuste de Modificador Personalizado */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090705] border border-amber-950">
              <span className="text-xs font-cinzel text-stone-300">Modificador Adicional:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomModifier(prev => prev - 1)}
                  className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-amber-300 w-8 text-center">
                  {formatMod(customModifier)}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomModifier(prev => prev + 1)}
                  className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Fechar */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsDiceModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs font-bold uppercase tracking-wider cursor-pointer shadow"
              >
                Voltar à Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePlayerSessionPage;
